# Runbook: Build and Deploy

**What this is:** the numbered operating procedures for publishing pages, changing the nav, adding trackers and connectors, testing locally, and recovering when a publish goes wrong.
**Read this when:** you are about to change anything that ends up on `https://xrodgers28.github.io/ProjectYou/`, or something on the live site is wrong.
**Last verified:** 2026-08-18, by reading the live workflow at `.github/workflows/publish.yml`, `nav-config.js` and `navpatch.js` in a fresh read-only clone of `xrodgers28/ProjectYou`, and by reconciling those against the project memory files `publish-guard.md`, `canonical-source-rule.md`, `pages-upload-collision.md`, `publish-race-hazard.md`, `concurrent-sessions.md`, `navpatch-shared-layer.md`, `nav-config.md`, `supabase-grants-trap.md`, `automated-tracking-page.md`, `tracking-inputs-research.md`, `historical-only-rule.md` and `living-docs-must-self-verify.md`. Every measured number below carries the date it was measured.
**Supersedes:** Fix-a-live-page.md, Build-A-Tracker-Playbook.md, Web-App-Build-Playbook.md, CoWork-Build-Directory.md, SER-nav-handoff.md, Clarity-Compass-nav-handoff.md, DEPLOY-automated-tracking-and-life-snapshot.md, AI-Favorites-and-Great-Quotes-BUILD.md, MAPS-NAV-HANDOFF.md, SETUP-two-fixes.md, MAPS-INDEX-BUILD-SPEC.md, wheel-publish/spec.md, wheel-publish/DO-NOT-PUBLISH.md.

The shape of the system (what the `pages` table is, what the publish Action does, why GitHub Pages is the host) is in **02-Architecture.md**. This document assumes you already know that and only tells you what to type. Table and view shapes are in **03-Data-Model.md**. Anything about drafts, capture and the staging area is in **05-Capture-Pipeline.md**.

Constants used throughout:

| Thing | Value |
|---|---|
| Repo | `xrodgers28/ProjectYou`, branch `main` |
| Live site | `https://xrodgers28.github.io/ProjectYou/<page>.html` |
| Supabase project ref | `arnjntspmrhigodlssbn` |
| Read-only clone (this container) | `git clone https://github.com/xrodgers28/ProjectYou.git` |
| Workflow | `.github/workflows/publish.yml` |

---

## 1. Before you touch anything

Run all four checks. They take about two minutes and they are the difference between a clean publish and destroying another session's work.

### 1.1 Pull the canonical version from GitHub and read the version marker

GitHub is canonical. The `pages` table can lag it, because Scott sometimes commits directly with "Add files via upload".

```bash
git clone --depth 25 https://github.com/xrodgers28/ProjectYou.git /tmp/py   # first time
git -C /tmp/py fetch --quiet && git -C /tmp/py show origin/main:<page>.html > /tmp/<page>.html
grep -o 'class="pn-ver">[^<]*' /tmp/<page>.html
grep -o 'class="ver">[^<]*'    /tmp/<page>.html
grep -o 'class="badge">[^<]*'  /tmp/<page>.html
```

Anonymous HTTPS clone and fetch work from the container. **Push and the GitHub API are blocked**, so the clone is read only.

Re-run the `fetch` **immediately before you encode**, not only at the start of the session. On Aug 16 2026 one session cloned `where-ive-been.html` at v1.0, another published v1.2 twelve minutes later, and the first session's v1.1 was refused by the guard. Nothing was lost, but the whole edit had to be re-applied on the newer file.

**A page carries its version in more than one place, and every one of them must move together.** The nav badge (`.pn-ver`) and the heading badge (`.secbar .ver`, or `.topbar #ver` on the older pages) are separate strings in separate parts of the file. On Aug 18 2026 `automated-tracking.html` was reconciled, published and verified live, and Scott still read v1.6 in two browsers, because only the nav badge had been bumped. He reasonably concluded the work had not shipped. A sweep found seven more pages carrying the same split, some of them weeks old.

Grep for all of them, change all of them in the same edit, and confirm the new number from `raw.githubusercontent.com`, not from the file you just edited. Since Aug 18 2026 `navpatch.js` also corrects this at runtime (8.4), but that is a safety net, not permission to leave the file wrong: the file is what the next session reads.

### 1.2 Never edit out of the local deploy folder

`CoWork/ProjectYou-deploy-Aug11/` is a working copy only. Treat it as stale until proven otherwise. On Aug 14 2026 it held **v2.7** of `all-todos.html` while the live page was **v2.11**. Publishing the local copy silently wiped Scott's Parking Lot section, the Known Bugs category, the Queue and Run / Scott to Drive lanes, and the mini section nav. He caught it, the process did not.

### 1.3 Check whether another session is publishing the same page

Scott commonly runs three or more Cowork sessions at once against this repo.

```sql
select * from public.publish_hook_log
 order by created_at desc
 limit 20;
```

(If the timestamp column is named differently, `select * from public.publish_hook_log limit 5` shows the shape.)

- Recent activity on **other** pages: another session is live. Proceed, but keep your staging path unique and re-fetch before publishing.
- Recent activity on **your** page in the last 30 minutes: stop. Find out what they are doing before you write anything.

### 1.4 Decide whether the change belongs in navpatch.js instead of the page

`publish.yml` appends `<script src="nav-config.js"></script><script src="navpatch.js"></script>` before `</body>` of every HTML file that lacks it, so **navpatch.js already runs on every page**. A cross-page UI change is one publish of a 6.7 KB file instead of a chunked upload of every page (some of which are 75 KB or more). See procedure 8.

**Verify (pre-flight):** state out loud, before editing, the page name, the version you read from `origin/main`, the version you will publish, and which of the three channels you are using (page, `nav-config.js`, or `navpatch.js`). If you cannot say the live version number from a fetch made in the last few minutes, you are not ready to edit.

---

## 2. Publish a page

This is the core procedure. Everything else in this runbook either feeds it or recovers from it.

### 2.1 Encode

```bash
gzip -nc <page>.html | base64 -w0 > /tmp/<page>.b64
wc -c < /tmp/<page>.b64                        # character count of the base64
md5sum /tmp/<page>.b64 | cut -d' ' -f1         # the FULL md5 you will guard the copy-across on
```

`base64 -w0` writes no trailing newline, so the md5 of the file equals the md5 of the string Postgres will hold. `gzip -n` omits the timestamp, so the same input always produces the same output.

### 2.2 Split into ~1,400 character blocks and precompute the running md5

```python
import hashlib, pathlib
b64 = pathlib.Path('/tmp/<page>.b64').read_text()
N = 1400
running = ''
for i in range(0, len(b64), N):
    blk = b64[i:i+N]
    prior = hashlib.md5(running.encode()).hexdigest()   # the guard for THIS block
    running += blk
    pathlib.Path(f'/tmp/blk-{i//N+1:03d}.txt').write_text(blk)
    print(i//N+1, 'guard_prior=' + prior,
          'after_len=' + str(len(running)),
          'after_md5=' + hashlib.md5(running.encode()).hexdigest())
print('FULL', len(b64), hashlib.md5(b64.encode()).hexdigest())
```

The md5 of the empty string is `d41d8cd98f00b204e9800998ecf8427e`, which is the guard on block 1.

**Why 1,400. Measured, not guessed.** Bigger statements do not fail more gracefully, they fail more expensively. All on Aug 16 2026, same session, same file:

| Block size | Result |
|---|---|
| 5,588 chars | **one block in three came out mistyped**; the md5 guard caught it, but rolling back and re-sending cost a full round of statements |
| 1,397 chars | 4 of 4 clean (the failed 5,588 block, re-sent as four of these, first try) |
| 1,400 chars | 8 of 8 clean on the next page, zero retries |
| 1,200 chars | 1 corrupt block in 9 (earlier measurement) |
| 600 chars | 102 of 102 clean; also 62 of 62 on `automated-tracking.html` v1.3, and 21 of 21 on the Takeaways card fix |

A mistyped block at 1,400 is caught within about a thousand characters instead of five thousand, and costs one retry instead of a rollback. Use ~1,400 by default and stop optimizing for fewer statements. Drop to 600 only if a specific block keeps failing.

### 2.3 Create or clear the staging row, on a session unique path

`public.pages_upload` holds **one row per path** with no locking, no owner column and no session id. Two sessions staging the same path interleave their appends and both lose, silently. Always stage under a path nobody else will pick:

```sql
insert into public.pages_upload (path, gzb64)
values ('<page>.html.stage-<session-slug>', '')
on conflict (path) do nothing;
```

If the row already exists with content, clear it in **its own call** and verify before appending:

```sql
update public.pages_upload set gzb64 = ''
 where path = '<page>.html.stage-<session-slug>'
returning length(gzb64), md5(gzb64);
```

**Never `delete` then `insert` the staging row.** `execute_sql` statements are sometimes replayed by the transport, and a replayed delete turns into a mid-run wipe. A `duplicate key` error on insert means a replay already recreated the row, which is fine.

### 2.4 Block 1: absolute assignment guarded on the empty md5

```sql
update public.pages_upload
   set gzb64 = $c1$<BLOCK 1>$c1$
 where path = '<page>.html.stage-<session-slug>'
   and md5(gzb64) = 'd41d8cd98f00b204e9800998ecf8427e'
returning length(gzb64), md5(gzb64);
```

Absolute assignment, not append, so a replay of this statement is harmless: the second run finds a non-empty row, the guard fails, and nothing changes.

### 2.5 Blocks 2..n: append guarded on the cumulative prior md5

```sql
update public.pages_upload
   set gzb64 = gzb64 || $c2$<BLOCK 2>$c2$
 where path = '<page>.html.stage-<session-slug>'
   and md5(gzb64) = '<md5 of everything staged so far, before this block>'
returning length(gzb64), md5(gzb64);
```

Rules that make this safe:

- **Check length and md5 after every call.** The guard proves the **prior** state, never the block you just pasted. A mistyped block still lands; you find out from the `returning` on that same statement or the guard failure on the next one.
- Use `returning` rather than a following `select`. The Supabase MCP `execute_sql` returns only the **last** statement's result in a multi-statement call, so pairing an update with a select hides the update's own result.
- Two or three appends fit comfortably in one `execute_sql` call. Each still carries its own prior-state guard, so a partial batch is detectable.
- Base64 contains only `A-Za-z0-9+/=`, so dollar quoting (`$c1$ ... $c1$`) is always safe.
- **Replay safety is the whole design.** On Aug 16 2026 an old chunk from a *previous version of the same file* reappeared in `pages_upload` mid-run. Because every statement is guarded on the exact prior state, the replay simply matched nothing.

### 2.6 Copy across, guarded on the full md5

```sql
update public.pages p
   set gzb64 = u.gzb64, html = null, updated_at = now()
  from public.pages_upload u
 where p.path = '<page>.html'
   and u.path = '<page>.html.stage-<session-slug>'
   and md5(u.gzb64) = '<FULL md5 from step 2.1>'
returning p.path, length(p.gzb64), md5(p.gzb64);
```

- `html = null` is load bearing. `publish.yml` reads **only** `gzb64`, so a row with just `html` set never reaches GitHub, and a stale `html` value is dead weight.
- The full-md5 guard means a bad staging state can never publish.
- This one statement fires the publish trigger **exactly once**. That is why the chunking happens in a scratch table rather than in `pages`.
- **Zero rows returned** means either the md5 does not match, or `pages` has no row for that path. See procedure 5.
- **Do not delete the staging row afterwards.** It costs nothing to keep and it is the only clean copy left if another session clobbers the `pages` row minutes later. That is exactly how a verified `where-ive-been.html` v1.2 was recovered on Aug 16 2026.

### 2.7 Verify

The `pages` row is not proof. A fresh `updated_at` and a green line in `publish_hook_log` prove that *something* published; they say nothing about *what*.

```bash
sleep 30
git -C /tmp/py fetch --quiet
git -C /tmp/py show origin/main:<page>.html | md5sum
md5sum <page>.html                                    # the local file you encoded
git -C /tmp/py show origin/main:PUBLISH-BLOCKED.md    # must fail: "does not exist"
git -C /tmp/py log --oneline -3 origin/main           # expect a supabase-publish-bot commit
```

**Byte-identical is the proof.** Then:

1. Spot-check any image or asset the change depends on for a 200. A page can be perfect and still look broken if its pictures are missing.
2. If the change is rendered by JavaScript, grep the fetched source for the literal string (for example `takeaways.html`), because a browser view will not show it.
3. A few minutes later, re-check `md5(gzb64)` on the `pages` row. The live GitHub file and the `pages` row can disagree if another session wrote in the gap.

**Timing, measured.** End to end test Aug 14 2026: dispatch queued, GitHub returned 204, `github.io` served the new version in **20 seconds**. Re-confirmed Aug 15 and Aug 16 at 55 to 75 seconds including the fetch. `raw.githubusercontent.com` caches for several minutes, so a clone or fetch is the true repo state, not a raw fetch. `curl` to `github.io` and `supabase.co` is proxy blocked from the container.

---

## 3. Recover from a bad block

Symptom: an append returned zero rows, or the `returning` md5 does not match the value you precomputed for that step.

1. Read the true current state:
   ```sql
   select length(gzb64), md5(gzb64), left(gzb64, 40)
     from public.pages_upload where path = '<page>.html.stage-<session-slug>';
   ```
2. Decide whether this is your corruption or someone else's content. Compare `left(gzb64,40)` with the first 40 characters of your local base64. A gzip header of `H4sIAAAAAAAAA7xb...` where yours reads `H4sIAAAAAAAAA7xc...` is **a different build of the same page**, which means another session is in your row. If so, **do not re-run and do not force**. Stop and ask Scott which session should win. (This is what a session-unique staging path prevents; if you hit it, you skipped step 2.3.)
3. If it is your own bad block, roll back to the last verified offset. `N` is the `after_len` printed by step 2.2 for the last block that verified clean:
   ```sql
   update public.pages_upload set gzb64 = left(gzb64, <N>)
    where path = '<page>.html.stage-<session-slug>'
   returning length(gzb64), md5(gzb64);
   ```
4. Confirm the returned md5 equals the precomputed cumulative md5 at that offset.
5. Re-send the failed block **in smaller pieces**, 600 characters each, each guarded on its own prior md5.

If Scott sends corrections while blocks are already staged, abandon the run, rebuild the file, and re-upload from scratch. `pages_upload` is scratch with no publish trigger, so a half-finished run costs nothing to discard. **Never publish a version you already know is wrong just because it is nearly uploaded.**

**Verify:** the staging row's `md5(gzb64)` equals the full md5 of your local base64 before you run the copy-across in step 2.6. Then verify as in 2.7.

---

## 4. Force a republish when the trigger did not fire

The trigger on `pages` is `AFTER INSERT OR UPDATE OF gzb64, html` with `when (new.gzb64 is not null and new.gzb64 <> '')`. To poke it without changing content:

```sql
update public.pages set gzb64 = gzb64 where path = '<page>.html';
```

**What does NOT fire it:**

- `update public.pages set updated_at = now() where path = '...'` (the trigger watches `gzb64` and `html`, not `updated_at`).
- Setting `gzb64 = ''` (the `when` clause excludes the empty string).
- Writing only the `html` column and leaving `gzb64` null. `publish.yml` reads only `gzb64`, so nothing reaches GitHub even if the trigger fires.
- Editing the page anywhere other than the `pages` table.

**If the poke itself is broken.** Read `public.publish_hook_log` first, always. Two known causes:

- **Token expired.** The GitHub PAT lives in the Supabase Vault as `github_pat` (93 characters, starts `github_pat_`), scoped to ProjectYou with Contents: Read and write. When it expires, publishing quietly reverts to the throttled cron with no warning. To replace it, have Scott run `select vault.update_secret(...)` in the SQL Editor, and **tell him to clear the tab first**: a leftover statement underneath rolls the whole transaction back.
- **Wrong schema on the call.** `pg_net` is installed in schema **`net`**, not `extensions`. The first version of the hook called `extensions.net.http_post(...)`, which Postgres reads as database.schema.function and rejects with `cross-database references are not implemented`. The `exception when others` handler swallowed it, so publishing kept "working" while the hook silently never fired. A fail-safe hid the failure for an hour.

**Fallbacks, in order:**

1. Actions tab, "Publish pages from Supabase", **Run workflow**. Publishes immediately by hand.
2. The cron backstop. The workflow says `cron: '*/5 * * * *'` but **GitHub throttles it to roughly hourly**. Observed runs on one day: 10:40, 11:34, 12:29, 13:32. Do not plan around five minutes.

**Verify:** a new row in `publish_hook_log`, then `git -C /tmp/py fetch && git -C /tmp/py log --oneline -3 origin/main` showing a fresh `supabase-publish-bot` commit, then the md5 comparison from 2.7.

---

## 5. When NOT to use the chunked method

Check these before you start encoding. Each one wastes an hour if you find out at the copy-across.

### 5.1 The page has no `pages` row

If a page has no row in `pages`, it is served straight from GitHub (through the `site` function's proxy) and `publish.yml` will never touch it. The copy-across in 2.6 will update zero rows and report nothing wrong.

```sql
select path, length(gzb64), updated_at from public.pages where path = '<page>.html';
```

**For a large page with no `pages` row, hand Scott the file and let him upload it** with "Add files via upload" on GitHub. That is a normal commit, it needs no `pages` row, and it is faster than transcoding 75 KB by hand.

Confirmed Aug 16 2026:

- **`qs-log.html` has no `pages` row and is 75 KB.** Always deliver it as a file. Never transcode it.
- **`qs-wheel.html` also has no `pages` row.**

### 5.2 Brand new page: insert the empty row first

```sql
insert into public.pages (path, gzb64) values ('<new>.html', '')
on conflict (path) do nothing;
```

Do this **before** the copy-across, or the copy-across updates zero rows and nothing publishes. This is the normal case for every new session-tracker page. Note that the empty string does not fire the trigger, which is the point: it just creates the slot.

### 5.3 Very large pages, and the recipe method

`library.html` is 187 KB on disk. When it was first published its base64 ran to 88 KB and had to go in verified 5 KB chunks reassembled server side. It works, it is slow, and one wrong character fails the checksum.

**When a chunked run fails more than twice, stop chunking. Send the recipe, not the page.**

Proved Aug 18 2026 on `automated-tracking.html` v1.7, after three uploads corrupted in a row at two different block sizes (1,400 and 600). Every failure landed at the right length with the wrong md5, was caught by the guard, and was rolled back. The live page was never damaged, but the page sat unpublished for two days.

The chunked path fails because **a large base64 string has to be transmitted through tool calls**. Nothing to transmit means nothing to corrupt. So build the page where it already lives.

**The procedure.** Deploy a one-off edge function that:

1. `fetch`es the CURRENT live page from `https://raw.githubusercontent.com/xrodgers28/ProjectYou/main/<page>` with `cache: "no-store"`, so it is always editing the canonical version.
2. Applies the edits as ordinary string and regex replacements in JavaScript.
3. On `?check`, returns `sha256`, the byte count and a few sanity counts, and **writes nothing**.
4. On `?write` plus the API key, gzips with `CompressionStream("gzip")`, base64s it, and PATCHes `pages.gzb64`, which fires the publish trigger.

**Verify before writing, always.** Run the identical transform locally in node, compute the sha256, call `?check`, and only call `?write` when the two fingerprints match exactly. That read-only check step is what makes this safe: a mangled transform can never reach the live page, because nothing is written until you have seen the fingerprint agree.

On the Aug 18 run the local and server fingerprints matched first time, the write fired, and the file on GitHub came back byte-identical to the transform output.

**Why this beats the alternatives.** It transmits about 3 KB of replacement rules instead of 14 KB of base64, and the rules are human-readable, so a slip is visible rather than silent. A character-level `difflib` diff of the two versions was tried first and came out at 38 KB across 291 regions, larger than the whole file, with non-unique anchors: do not bother. Embedding the whole HTML in the function moves the same volume as the upload. Handing the file to Scott works but costs a wait.

**Four things that bite.**

- `crypto.subtle` in Deno has **no md5**. Use sha256 on both sides.
- Build the base64 in 8 KB slices, `String.fromCharCode(...bytes.subarray(i, i + 8192))`, or a large array blows the stack.
- Anchor every replacement on something unique. Regexes keyed on `name:"<App>", feed:"..."` worked because the app name appears once in the array.
- **Retire the function afterwards.** It can write to `pages`. Redeploy it as an inert 410 stub, the way `code-run` is, with a comment recording what it shipped and the sha256 it produced.

For anything in the `library.html` size class that is a genuinely new page rather than an edit, the recipe has nothing to fetch, so weigh the chunked run against handing Scott the file.

### 5.3a Two things that look like a failed publish and are not

Both of these have cost real time by looking like something broke. Neither is a fault. Read this before re-uploading anything or telling anyone a publish did not work.

**The site keeps showing the old version for a few minutes after you upload.**

The service that serves the pages rebuilds a minute or two behind the upload itself, and sometimes longer. During that gap the old page is what everyone sees, and a hard refresh does not help. Neither does adding something to the end of the address to dodge the cache. Both were tried on Aug 24, on a file that had already arrived correctly, and both still showed the previous version for about four minutes.

So: check that the file actually arrived before you conclude anything. The repository is the truth; the website is a copy of it that lags. If the file is there and correct, wait and check again.

The worst possible move here is telling Scott to upload a file that is already uploaded. Say "it usually takes a minute or two" before he refreshes, not after.

**Uploading a file by hand leaves the system's own copy behind, and it complains about it.**

Every page exists twice: the copy on the website, and a copy held in the database that the automatic publishing uses. Uploading by hand updates only the first one. The system then sees its own copy carrying an older version number, refuses to publish it over the newer one, and writes a note saying so. It rewrites that note every few minutes, so it looks like a page is stuck or broken when it is perfectly fine.

So: straight after any upload done by hand, bring the database copy back into line. That is one call and it takes seconds. Skip it and the complaints continue until someone works out what they mean.

The tool for it is `syncgh`, called with the file name, first to compare and then to write. It only ever copies from the website into the database, which is why it is safe to run at any time: it cannot introduce anything that is not already published.

### 5.4 Binary assets, ever

`publish.yml` skips any row whose path contains `/` or `..`, starts with `__`, or does not match `^[A-Za-z0-9._-]+$`, and it treats every payload as UTF-8 text. **A binary asset can never be published from the `pages` table.** It reaches the repo one way only: Scott drags it onto `https://github.com/xrodgers28/ProjectYou/upload/main/assets`, **the inner folder, not the wrapper folder around it.**

So when a build needs images, **plan that upload as step one, not as a surprise at the end.** While waiting, ship a self-contained preview with the images inlined as `data:` URLs, which opens offline and needs no GitHub. Inline `data:` URLs are correct for previews and handoffs; for a production page that goes through `pages` they bloat the gzip and base64 payload (about 125 KB for four map thumbnails), so host those as files.

**Verify (for the hand-to-Scott path):** `git -C /tmp/py fetch && git -C /tmp/py show origin/main:<file> | md5sum` against the file you handed over, and for an asset, confirm the page that references it renders it when the clone is served locally.

---

## 6. Fix a live page (the small-edit path)

Use this when something on the live site is missing or wrong and the fix is a targeted edit rather than a rebuild.

**The kickoff prompt, verbatim:**

> "The [thing] on [page] is missing or wrong. Read the live file, not the publish log. Then fix it through the pipeline."

That one line puts a chat on the right track, because the two ways this goes wrong are trusting a timestamp and editing a stale copy.

1. **Ask the file, not the log.** Fetch the page and search it for the thing that should be there.
   ```bash
   git -C /tmp/py fetch --quiet
   git -C /tmp/py show origin/main:<page>.html > /tmp/live-<page>.html
   grep -c '<the literal string that should be there>' /tmp/live-<page>.html
   ```
   `https://raw.githubusercontent.com/xrodgers28/ProjectYou/main/<page>.html` also works from the container but caches for several minutes. `github.io` does not work from the container. If the page builds its content in JavaScript, no browser view will show it; grep the source.
2. **Work out which copy is canonical.** Compare the `pn-ver` marker in the `pages` row, on GitHub, and in any local copy. They can genuinely differ. **The highest live version wins, and it is what you patch.** Never build on a local copy from an earlier session, and never on a copy fetched more than a few minutes ago.
3. **Patch with an asserting script, never by retyping.**
   ```python
   assert s.count(anchor) == 1
   s = s.replace(anchor, new, 1)
   ```
   If the anchor is not found exactly once, the script stops instead of silently producing a broken page. Bump the version marker in the same script, in all three places (see 10.2).
4. **Test headless twice, before publishing.** Serve the patched file locally and drive it with Playwright once with `cdn.jsdelivr.net` blocked and once allowed. **The blocked run is the one that matters: it proves the page still renders when the CDN is down.** Assert what a person would check: the number of cards, the daily meter still reading `0/4`, that clicking the new card navigates where it should. See procedure 12.
5. **Publish through the staging table.** Procedure 2. Never upload site files to GitHub by hand: that creates a second page at a new name and leaves the live one untouched.
6. **Verify.** Procedure 2.7, plus spot-check the assets the change depends on for a 200.

Cost benchmark from the Aug 15 to 16 2026 run: about 45 minutes of Claude time from diagnosis to verified live. The diagnosis itself was under 10 minutes. Most of the rest was the publish loop, which is mechanical and safe to leave running.

---

## 7. Add or change a nav link

### 7.1 Edit `nav-config.js` only

Every page ships a **hardcoded** `<div class="pynav">` containing `.pn-group` blocks. `navpatch.js` reads `window.NAV_CONFIG` from `nav-config.js` and **replaces the `.pn-links` innerHTML of any group whose grey `.pn-label` text matches a config key exactly**. So a nav change is one small file, not thirty pages.

```js
window.NAV_CONFIG = {
  "Operating System": [
    { "label": "Components",            "href": "build.html" },
    { "label": "Automated<br>Tracking", "href": "automated-tracking.html" },
    { "label": "Maps", "children": [
      { "label": "Overview",  "href": "maps.html" },
      { "label": "Data Flow Diagram", "href": "dfd.html" }
    ] },
    { "label": "Mission<br>Control",    "href": "mission.html" },
    { "label": "Docs<br>Library",       "href": "library.html" }
  ]
};
```

Conventions:

- `<br>` inside a two-word label. That is the site convention and it is what keeps the nav one line tall.
- An item with `children` becomes a dropdown. `navpatch.js` builds the `.pn-drop` / `.pn-dropbtn` / `.pn-menu` markup and its CSS itself. Do not hand-write it.
- `window.NAV_GROUP_LINKS` makes a group's grey label itself a link.
- **Do not hand-code `class="on"`.** `navpatch.js` marks the current page active by matching `href` against the last path segment, and marks the parent dropbtn active when a child matches.

### 7.2 The five rules that bite

1. **A group in the config overwrites that whole group on every page.** Always list the existing links too, or you silently delete them.
2. **Config order does not set display order.** The page's hardcoded group order wins. Keep the config in page order anyway, for readability.
3. **A group that is not in the config keeps its hardcoded links.** That is why "Editors" worked on 28 pages while being absent from the config entirely until Aug 14 2026, and why a "Parking Lot" group still appears on pages that hardcode it.
4. **A page that lacks the group's hardcoded markup never gets those links.** navpatch has nothing to match against and skips it.
5. **`navpatch.js` returns early if the page has no `.pynav` at all.**

### 7.3 Pages navpatch cannot reach

As of Aug 14 2026, no Editors group: `habit-modules.html`, `midnight-run.html`, `midnight-run-v2.html`, `qs-dashboard.html`, `qs-health.html`, `tracker.html`. The two midnight-run files have **no `.pynav` at all**, so there is no nav bar and no way to navigate away from the Midnight Run page. Adding a link for those pages means editing their HTML, not the config.

Re-derive this list rather than trusting it:

```bash
cd /tmp/py && for f in *.html; do grep -q 'class="pynav"' "$f" || echo "NO PYNAV: $f"; done
cd /tmp/py && grep -L 'pn-label">Editors' *.html
```

### 7.4 What the version guard does, and does not do

`publish.yml` reads a version marker out of the incoming page and out of the file already in the repo, in this order: `<div class="badge">...v<major>.<minor>`, then `class="ver">v<major>.<minor>`, then `class="pn-ver">v<major>.<minor>`. If the incoming version is **strictly older**, it refuses to write, logs `BLOCKED`, and writes `PUBLISH-BLOCKED.md` naming the page and both versions, for example:

> all-todos.html: incoming v2.8 is OLDER than published v2.13

That file deletes itself automatically the next time a correct version publishes. A blocked publish does not fail the run and does not email anyone.

It fires in real life, not just in tests. And it has two holes you must plan around:

- **A page with no version marker publishes as normal.** `nav-config.js` and `navpatch.js` have no marker, so they are never guarded. Take extra care.
- **An equal version number is not blocked.** On Aug 16 2026 `automated-tracking.html` was fetched at v1.4, edited, and published 36 minutes later as v1.5; another session had already published its own v1.5 in the gap, and three real changes were overwritten with no warning. Bump on every publish, and if the live version is already at or above what you were going to publish, someone else moved it. Stop and diff.

### 7.5 Historical nav facts worth keeping

The old handoff notes said "apply the nav to every page individually" because the nav genuinely was inlined per page before `nav-config.js` existed. That era's markup (`<div class="nav">`, `.grp`, `class="soon"` for a page not yet built) is dead. The current class vocabulary is `.pynav`, `.pn-logo`, `.pn-group` (with `.first`), `.pn-label`, `.pn-links`, `.pn-link` (with `.on`), `.pn-ver`, `.pn-drop`, `.pn-dropbtn`, `.pn-menu`.

- **The dropdown uses `position:fixed` on purpose.** The sticky nav's `overflow-x:auto` clips an absolutely positioned dropdown, so the JS positions a fixed menu on click and clamps it into the viewport with `Math.max(6, Math.min(r.left, window.innerWidth - 210))`.
- **Naming trap:** `blueprint.html` is labeled "Knowledge Graph" and `knowledge-graph.html` is labeled "Interactive Knowledge Graph". Both pages were originally titled "Knowledge Graph". Whether one should be renamed is still open, see 08-Roadmap-and-Open-Decisions.md.
- **Clarity Compass filename, resolved:** the live page is **`compass.html`**. There is no `clarity-compass.html` in the repo. The Aug 11 handoff that specified `clarity-compass.html` was never followed.
- **The Maps subnav strip** is a separate hardcoded `.mapsub` bar on the older map pages. The second block in `navpatch.js` appends newer maps to it, so **a new map has to be added in two places: the `EXTRA` array in `navpatch.js` and `nav-config.js`.**

### 7.6 Publish and verify

`nav-config.js` is about 2 KB, so it is two blocks. Publish it with procedure 2, using the same session-unique staging path pattern.

**Verify:**

```bash
git -C /tmp/py fetch --quiet
git -C /tmp/py show origin/main:nav-config.js | md5sum
md5sum nav-config.js
python3 -m http.server 8123 --directory /tmp/py &
```

Then load **two different pages** in Playwright, not one, and assert the new link is present in the right group on both. Include one page that does **not** carry that group's hardcoded markup and confirm it is unaffected rather than broken.

---

## 8. Make a site-wide UI change

`navpatch.js` is the shared layer. It runs on every page because `publish.yml` injects the two script tags into any HTML file missing them. It is about 6.7 KB, so a site-wide change is roughly five blocks in one publish, versus a chunked upload of every affected page.

**Always ask whether a change belongs here before touching individual pages.**

What it already does: rebuilds nav groups from `window.NAV_CONFIG`, renders dropdowns, marks the current page `.on`, injects the `.ph-h1` page-header styling and the `.secbar` / `.lead` layout CSS, stamps empty `.date` elements, inserts the QS back links, and extends the `.mapsub` strip.

### 8.1 The two-h1 login trap

Login-gated pages have an `<h1>` inside the hidden `#login` panel **and** the real one in `.secbar`. Taking "the first non-nav h1" puts your element inside the hidden sign-in panel, where it never appears. This cost a full rebuild on Aug 14 2026.

**Select by preferring `.secbar`, and skip anything inside `#login` or `#loginbox`.** The existing QS back-link code in `navpatch.js` is the reference implementation. The same applies to any future insertion keyed off a heading.

### 8.2 The auto-date trap

`navpatch.js` stamps today's date into any empty `.date`. **That is a rendering timestamp, not a verification.** On Aug 16 2026 `dfd.html` rendered today's date every day while its contents were four days out of date and wrong about four live feeds. Never let an auto-generated date sit where a reader will read it as "this was checked today". A page that states a verification date must read it from a stored record, for example `board_meta.system_map_last_verified`. See 09-Governance-and-Doc-Rules.md.

### 8.3 Testing a site-wide script change

Serve the clone and drive it with Playwright (procedure 12). Pages will throw Supabase errors without auth, which is fine: the nav layer still runs. To see gated content, force `#app` visible with `setProperty('display','block','important')`. A plain `style.display = ''` is **not** enough and will make a working change look broken.

**Verify:** md5 the published `navpatch.js` against local from `origin/main`, then serve the clone and assert the change renders on at least three pages chosen to cover the cases: one ordinary page, one login-gated page, and one page with no `.pynav` (which must be unaffected).

### 8.4 Version badge parity, handled in navpatch.js

Every page shows its version twice, and the two used to drift (1.1). Since Aug 18 2026 `navpatch.js` ends with a parity pass that runs on every page load:

- It collects `.pn-ver` plus `.secbar .ver`, `.topbar .ver`, `h1.ph-h1 .ver`, `#ver`, `h1 .ver` and `h1 .badge`. That list covers every badge markup the site uses: `library.html` puts the badge inside the h1 with `class="badge"`, and `knowledge-graph.html` puts a `.ver` span next to the h1 rather than inside it.
- On `knowledge-graph.html` the `.pn-ver` slot holds the word "Maps", used as a section label rather than a version. Anything that does not parse as a dotted number is skipped, so a label in that slot is never rewritten and never reported as a mismatch.
- It parses each as a dotted number and takes the **highest**, comparing segment by segment as integers, so v5.31 correctly beats v5.9.
- It writes that value back to every one of those elements.
- It exposes the result as `window.PY_VERSION`, which is what a Playwright check should assert on.

**Card and module badges are deliberately not in the selector list.** `james-clear.html` and `quotes.html` carry `.ver` badges inside habit-module cards that version the component, not the page. Pulling those into the parity pass would rewrite them to the page version and destroy real information. Any new selector added here must be checked against those two pages first.

**Pages that load no nav carry their own badge.** The 13 standalone pages, the session tracker index, the dated session trackers and the Aug 16 feedback page, have no `.pynav` and therefore never run the parity pass. Each carries `<span class="ver">` inside its `<h1>` with a matching `h1 .ver` rule in its own style block, added 2026-08-18. The session tracker reference template carries both, so every new tracker gets one for free. Every page on the site now has a badge, and `[VC]` reports any that does not.

The pass is a net, not a fix. A mismatch it silently corrects is still a wrong file, and the file is what the next session reads. Run the `version-check` skill (`[VC]`) to find the files that are actually wrong. A parity mismatch that survives that sweep means `navpatch.js` failed to load on that page, which is the real finding.

---

---

## 9. Add a tracker or connector

The repeatable recipe. The worked example throughout is Coffee Days, built end to end in one session on Aug 16 2026, but nothing here is about coffee.

### Step 0. Interrogate the sensor before you build anything

Two tests, before a line of code:

1. **Is the purchase the same event as the behavior?** A card charge is not a coffee day. It cannot see coffee brewed at home, coffee someone else paid for, hotel coffee, office coffee. And one $19 Starbucks charge is often a sandwich plus a kid's hot chocolate. It measures *spend*, not *days*. Whenever a financial feed is proposed as a proxy for a behavior, ask whether the two events actually coincide. They usually do not.
2. **Does the source have a real API, or a scraper wearing a costume?** Monarch has no public API. What exists is community clients that store the account password. **That is not a connector, it is a liability.**

**Read `tracking-inputs-research.md` first, every time.** It already holds the 16 confirmed dead ends and the reasons, which is why the Monarch check took minutes rather than a week.

**The historical-only rule applies here and it changes the answer.** Track only what has already happened. No forward-looking, scheduled, planned or predicted data anywhere in the system. Score a source by the **completed events it yields**, not by how easy its feed looks. Where a source offers both a future-facing bridge and a history store, **take the history store**, even when it is more work. Consequences already recorded: TripIt effectively drops off the roadmap (its value is upcoming itineraries); Flighty's calendar export is the wrong bridge and the local Mac SQLite database is the right one; Swarm fits perfectly, because a check-in is by definition something that happened.

Standing decisions: if a bank feed genuinely is the right sensor for something later, the tool is **SimpleFIN Bridge** ($15/yr, read only, documented). **Never Monarch.**

### Step 1. Check whether the answer is already in the database

Before building a new pipe, enumerate the tables and query every existing feed table.

```sql
select table_name from information_schema.tables where table_schema = 'public';
```

**A three-table query is not an audit.** The first automated-tracking audit queried `qs_log`, `todos` and `inbox`, concluded "two apps write data", and published it, while Apple Health had 12,944 rows sitting in `health_metrics`. The Coffee build found 588 coffee days already present in an 8,819-row Swarm check-in history nobody had asked the question of.

**Also check `max(created_at)` against the data's own date column.** `health_metrics` looked stale by `day` (last reading Sep 2025) while every row had been written in the previous 20 minutes: a live backfill in progress, not a dead feed. Judging by the data's own date alone would have marked a live pipe as roadmap.

### Step 2. Write the definition as ONE database function

This is the single most important structural decision in the build.

```sql
create or replace function public.is_<metric>_<event>(p_category text, p_venue text)
returns boolean language sql immutable as $$ ... $$;
```

The backfill calls it. The live trigger calls it. Every view calls it. **Nothing re-implements it in JavaScript.** When the definition changes, that is one edit and every number on every page moves together.

**Then look at what it matched, row by row.** Three false-positive traps were caught only by eyeballing, and every one would have silently inflated the count forever:

| Pattern | What it wrongly matched |
|---|---|
| `%tea%` | **S-TEA-khouse** (17 check-ins) |
| `%caf%` | **Cafeteria** |
| `\mcaf[eé]\M` on the venue *name* | Peter McManus Cafe (a pub), Ray's Pizza & Bagel Cafe, Pier 23 Cafe (seafood). **130 false positives.** |
| `\mjoe\M` (for "cup of joe") | Trader Joe's, Chicken Joe's, Joe B's Diner, and **Point Joe, a scenic lookout** |

**The rule:** let the *category* field do the classifying, because a data provider's category is curated. Match on the *name* only for unambiguous words. **Never substring-match a short common word.** About 150 false positives were caught by eyeballing on this one build.

### Step 3. Let a view own the definition of "one day"

`qs_log` is `UNIQUE (date, tracker, source)`, so a single day can legitimately hold two rows: one from the automated source and one from the manual tick. That is a feature, because provenance survives, but it means **`count(*)` over-counts.**

```sql
create or replace view public.v_coffee_days as
select date as day,
       bool_or(source = 'swarm')                      as from_checkin,
       bool_or(source in ('habit-bandit','manual'))   as self_logged,
       string_agg(distinct note, ' | ')               as venues
  from public.qs_log
 where tracker = 'Coffee' and status = 'done'
 group by date;
```

**Any future metric fed by both a device and a manual tick needs this same shape.** Do not try to force it into one row. Write the view and make the view canonical. Companion views built on the same pattern: a stats view (totals, windows, streaks), a venues view, and a per-event view so the page gets an exact day-to-venue map without re-implementing the definition in JS.

### Step 4. Backfill, then wire the live feed, from the same function

- Tag the backfill with its own `source` value so it stays distinguishable forever. `qs_log.source` has a **CHECK constraint**, so a new source value has to be added to the allowed list first.
- The live feed is a trigger on the source table, **`SECURITY DEFINER`**, because `service_role` holds no grants on `qs_log`. See the grants trap below.
- **File against the source row's own date, never `now()`.** A check-in made at 11pm and synced the next morning must not land on the following day. This is the exact bug that was fixed for habits; a new feed re-introduces it unless you think about it.
- **Tick the daily habit on INSERT only, never on UPDATE.** The sync upserts, so an UPDATE fires on every re-sync, which would silently re-tick a habit Scott had deliberately unticked.

**The Supabase grants trap.** RLS policies and table grants are two different things and you need both. A policy says *who is allowed*; a grant says *who can reach the table at all*. **A table with policies and no grants fails every write, silently.** On Aug 14 2026 `service_role` held only REFERENCES / TRIGGER / TRUNCATE on **every** table in `public`, so every write the capture edge function ever attempted was rejected at the database while Drafts got HTTP 200 back and a green success bar.

Diagnose it directly rather than assuming:

```sql
select table_name, string_agg(privilege_type, ', ' order by privilege_type)
  from information_schema.role_table_grants
 where table_schema = 'public' and grantee = 'service_role'
 group by table_name;
```

A table showing only REFERENCES / TRIGGER / TRUNCATE is unwritable by that role. The standing fix, already applied, so new tables inherit it:

```sql
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
```

**After creating any table, write one row as the actual role that will use it and confirm it lands.** Do not trust a successful migration. And never report success you have not verified: a green bar that lies costs more than a red one that tells the truth.

### Step 5. Add the manual tick, so the metric can be complete

The Swarm check-in feed caught **18 days in the last 90**. Real coffee days are far higher. **Check-in history is excellent history and poor completeness.** No passive feed is the whole answer for a consumption metric.

Implementation: one permanent `todos` row with `is_habit = true`, which the existing nightly `reset_daily_habits()` job picks up with no extra work. Mirror the closest existing habit for the field values (Take Medicine was the model: a daily binary, `est_minutes` null).

**Keep the unit constant across sources.** `value = 1, unit = 'boolean'` on every row regardless of who wrote it. The `AI` tracker is `10 minutes` on some days and `1 boolean` on others, which makes its history unsummable. Do not repeat that.

### Step 6. Test the trigger with throwaway rows, positive AND negative

1. Insert a fake matching row **and** a fake non-matching row, both dated today.
2. Assert: exactly one row appeared from the automated source, the habit auto-ticked, the habit trigger wrote its own row, and the view collapsed both sources to one day with both flags true.
3. Delete every test row and re-assert the original counts.

**Testing the negative case in the same breath is what proves the definition excludes what it should.**

### Step 7. Build the page, then prove the page against the database

Standard page anatomy: hardcoded `.pynav`, `#login` gate, `.secbar` with an empty `.date` for navpatch to stamp, and `nav-config.js` + `navpatch.js` at the bottom.

If you also want a Cowork artifact, have it read the same data over PostgREST with the anon key and no login. That works because the views are security definer and granted to `anon`. **A read-only public view is the cheapest way to make an artifact live rather than a snapshot.**

**Assert the page's numbers against the SQL, not against your expectations.** Doing that caught a real defect: the page's streak calculation kept the *first* five-day run while the stats view kept the *most recent*. Both were "right"; they disagreed. **Any statistic computed in two places will drift. Either compute it once, or assert them against each other.**

### Step 8. Surface it, then write it down

- Add the tile to `qs-dashboard.html` as a new entry in the `VIEWS` array with its own thumbnail function, and bump the `.pn-ver`.
- Add the page to `nav-config.js`. Remember rule 1 in 7.2: the group overwrites, so list the existing links too.
- Publish with procedure 2. A brand-new page needs its `pages` row created first (5.2).
- Write the memory file while the traps are fresh. The regex false positives above are the kind of thing that is obvious for two hours and invisible for a year.

### Step 9. What may be called "connected"

The dot contract on `automated-tracking.html`, approved by Scott Aug 16 2026:

- **Green** (`connected: true`): the source feeds rows into Supabase **on a schedule**.
- **Blue** (`sys: true`): authenticated and reachable, but pushes no data feed of its own.
- **No dot**: roadmap, not wired up.

**Do not promote an app to green because it has an MCP connector, a built backend, or because Scott is signed in.** A built-but-empty pipe stays roadmap until the first row lands. Scott's amendment on indirect feeds: **a device that feeds a green app is itself green** ("it feeds Apple Health, so I think we should leave that green"). Green tracks the chain, not just the app holding the API key.

One more page-specific trap: `url`, `domain` and `icon` are **three separate fields**. `domain` feeds the logo lookup, `url` is where the icon links, `icon` overrides the logo lookup entirely. Changing `domain` to "fix" a link will break the logo.

**Verify:** run the exact SQL the page runs, compare every number on the rendered page against it, and only then publish and verify per 2.7. A row in the database is not proof the page reports it correctly.

---

## 10. Add a new page

### 10.1 File naming

Lowercase, hyphen separated, `.html`, at the **repo root**. `publish.yml` accepts only paths matching `^[A-Za-z0-9._-]+$`, with no `/`, no `..`, and no leading `__`. **There are no subfolders in the publish path.** Session tracker pages follow `session-tracker-<yyyy-mm-dd>-<slug>.html`.

### 10.2 Version markers in three places

Hardcode the version in all three and bump all three on every publish:

| Marker | Where |
|---|---|
| `<span class="pn-ver">v1.0</span>` | end of the `.pynav` bar |
| `<span class="ver">v1.0</span>` | in the `.secbar` heading |
| `<div class="badge">... v1.0 ...</div>` | where a page uses the older badge style |

The guard parses `v<major>.<minor>` only, and reads `badge`, then `ver`, then `pn-ver`. A page with no marker is unguarded (7.4). Cache-bust with `?v=<version>` when checking in a browser.

### 10.3 Register it

1. Insert the empty `pages` row (5.2).
2. Add the link to `nav-config.js`, listing the whole group (7.2).
3. Confirm the page's hardcoded `.pynav` contains a `.pn-group` whose `.pn-label` text matches the config key **exactly**, or navpatch will skip it.

### 10.4 If it is a system map

Add its filename to the `system_map_pages` row in `board_meta` **in the same session**, and give it a Last verified slot fed from `system_map_last_verified`, never a date the page generates itself (8.2). The nightly System Map freshness check will then compare it against the live database and file a `[map drift]` row when it goes stale. Do not add pages that describe something other than the system: `blueprint.html` was removed from that list because it is a betterment-insight graph, not a system map, and would have flagged as stale every night forever.

### 10.5 If it is a doc

Add a card to `library.html`, in the right category section, in three parts:

```html
<button class="card" data-search="<lowercased title and description>"
        onclick="openDoc('<slug>')">
  <h3><Title></h3>
  <p><One line description></p>
  <span class="src"><source file path></span>
</button>
```

```html
<script type="text/markdown" id="doc-<slug>"
        data-title="<Title>" data-src="<source file path>">
...the raw markdown...
</script>
```

Then update the document count in the `.secbar .meta` line. `library.html` is 187 KB, so read 5.3 before deciding to publish it by chunks. Scope is OS and system canon only, not project deliverables. See 09-Governance-and-Doc-Rules.md.

**Verify:**

```bash
git -C /tmp/py fetch --quiet
git -C /tmp/py show origin/main:<new>.html | md5sum
md5sum <new>.html
```

Then serve the clone and confirm the new nav link renders on a **different** page, and that the new page itself loads with its nav, its version marker and its `.date` stamped. For a system map, confirm `system_map_pages` lists it.

---

## 11. Concurrency rules

Scott commonly has **three or more Cowork sessions running at once** on this project. Confirmed Aug 15 and 16 2026: in one evening, separate chats were doing the Swarm connector, a data flow diagram audit, the Time Bandit Wheel, and the habits tracker. They all write to the same places.

1. **Single owner per page.** Do not deploy the site nav or `index.html` from two sessions at once. If you are handed work on a page another session owns, hand it back with the exact change written down rather than publishing it yourself.
2. **Session-unique staging path, always.** `pages_upload` has one row per path, no locking, no owner column, no session id. Two sessions on the same path interleave their appends and both lose, with no error. See 2.3 and 3.
3. **Re-fetch the canonical copy immediately before publishing, not when you start editing.** It goes stale in minutes when another session is live.
4. **An equal version number is not safe.** The guard blocks only strictly older. Bump on every publish. If the live version is already at or above yours, someone else moved it: stop and diff.
5. **Merge, never overwrite.** Never pass `force: true` to get past an mtime guard on a shared file: that silently destroys the other session's work. Re-stage, re-apply your change onto their newer file, commit with the fresh `expectedMtimeMs`. The same habit applies to the `pages` table and to project memory files.
6. **Never park a finished build unpublished in one chat's workspace.** The Takeaways card was built, tested and held back until its images were uploaded; while it sat there another chat published its own copy of the same file and the work disappeared with nothing to show it had happened. If something must wait, either publish it anyway or write the exact change into project memory so it can be re-applied.
7. **Do not delete from `pages_upload` after a successful copy-across.** It is the only clean copy left when a race hits.
8. **`git log` is the recovery tool.** `git clone --depth 25` then `git show <sha>:<file>` gives every published version, so a clobbered page is always recoverable. Diff the two most recent commits to see exactly what you destroyed.
9. **If the staging row changes under you, do not re-run and do not force.** Another session's work is in there. Stop and ask Scott which session should win.

Two incidents in one hour on Aug 16 2026, both real:

- `where-ive-been.html` v1.2 was published at 04:32 and confirmed byte-identical on GitHub. At 04:39 another session overwrote the same `pages` row with an older v1.1 build. The next run **was blocked by the version guard** and wrote `PUBLISH-BLOCKED.md`. The live page was never damaged. Fixed by re-running the copy-across from `pages_upload`, which still held the verified v1.2.
- `automated-tracking.html` was fetched at v1.4, edited, and published 36 minutes later as v1.5, over another session's v1.5. **The guard does not fire on equal versions.** Three real changes were lost and had to be pulled out of git history and re-applied as v1.6.

---

## 12. Test locally

Nothing gets published without a headless run against the served clone.

### 12.1 Serve the clone

```bash
python3 -m http.server 8123 --directory /tmp/py &
```

**The `--directory` flag matters.** The shell's cwd resets between calls, so a backgrounded server started with `cd` serves the wrong folder and every page 404s.

### 12.2 Drive it with playwright-core

```bash
npm install playwright-core     # not preinstalled
```

```js
const { chromium } = require('playwright-core');

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
  });
  const page = await browser.newPage();

  // CDNs are unreachable from the container, so stub the globals the page expects.
  await page.addInitScript(() => {
    window.supabase = {
      createClient: () => ({
        auth: { getSession: async () => ({ data: { session: { access_token: 'x',
                 user: { email: '<scott@example.com>' } } } }) },
        from: () => ({ select: () => ({ eq: () => ({ order: async () => ({
                 data: [/* real row shapes here */], error: null }) }) }) })
      })
    };
    window.L = { map: () => ({ setView: () => ({}), addLayer: () => ({}) }),
                 tileLayer: () => ({ addTo: () => ({}) }) };
  });

  await page.goto('http://localhost:8123/<page>.html');
  // Gated pages: a plain style.display='' is NOT enough.
  await page.evaluate(() => {
    const a = document.getElementById('app');
    if (a) a.style.setProperty('display', 'block', 'important');
  });

  console.log(await page.locator('.card').count());
  await browser.close();
})();
```

The headless shell is at `/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell` if you prefer it. Confirm the path with `ls /opt/pw-browsers` rather than assuming the version number.

### 12.3 What the container can and cannot reach

| Reachable | Not reachable |
|---|---|
| `raw.githubusercontent.com` (200, but caches several minutes) | `github.io` |
| Anonymous `git clone` / `git fetch` over HTTPS (read only) | `supabase.co` direct (all DB access goes through the Supabase MCP `execute_sql`) |
| | `cdn.jsdelivr.net`, `unpkg.com`, `logo.clearbit.com`, `mzstatic.com` and most third-party CDNs |
| | `git push` and the GitHub API |

Because logo hosts are unreachable, **every remote logo falls back to its placeholder initial in screenshots. That is expected, not a bug.**

### 12.4 Run it twice

Once with the CDN stubbed or blocked, once allowed. **The blocked run is the one that matters: it proves the page still renders when the CDN is down.**

**Verify:** assert on human-visible things (card counts, a meter reading, that a click navigates where it should) and on numbers taken from the SQL, not from your expectations. A page that loads without console errors is not a passing test.

---

## 13. Troubleshooting

| Symptom | Likely cause | First thing to check |
|---|---|---|
| `github.io` not updating | The Supabase poke did not fire (expired `github_pat`, or the hook raised and its handler swallowed it), so you are back on the throttled hourly cron | **`select * from public.publish_hook_log order by created_at desc limit 20;`** Then the Actions tab. Force with `update public.pages set gzb64 = gzb64 where path='...'` (procedure 4) |
| `PUBLISH-BLOCKED.md` appeared in the repo | The version guard refused an incoming version strictly older than what is published | Read the file, it names the page and both versions. Re-fetch `origin/main`, re-apply your edit on the newer file, bump above live, republish. It self-clears on the next good publish |
| Page serves as raw text, not rendered | You are viewing it through `*.supabase.co`, which forces `content-type: text/plain` (Supabase anti-phishing policy, confirmed by measuring response headers) | Use `https://xrodgers28.github.io/ProjectYou/<page>.html`. Do not attempt Supabase-domain hosting again. See 02-Architecture.md |
| md5 mismatch after a block | Mistyped block, or another session is in the same `pages_upload` row | Compare `left(gzb64,40)` against your local base64. A different gzip header prefix means a different build, so another session. Otherwise roll back with `left(gzb64,N)` (procedure 3) |
| Copy-across returns zero rows | The `pages` row does not exist, or the full md5 does not match | `select path, length(gzb64) from public.pages where path='<page>.html';` then re-check the staging md5 (5.1, 5.2) |
| Page 404s on `github.io` | No `pages` row and never uploaded by hand, or the path was filtered out by `publish.yml` (contains `/`, `..`, leading `__`, or non `[A-Za-z0-9._-]` characters), or Pages has not rebuilt yet | `git -C /tmp/py fetch && git -C /tmp/py show origin/main:<page>.html \| head -c 200`. If the file is not in the repo, it never published |
| Publish verified but the change is invisible | The content is built in JavaScript, so the browser view differs from the source, or a dependent asset is missing | Grep the fetched source for the literal string. Then check each dependent asset returns 200 |
| A nav link is missing on one page only | That page lacks the group's hardcoded `.pynav` markup, or has no `.pynav` at all | `grep -L 'pn-label">Operating System' /tmp/py/*.html` and the pynav check in 7.3 |
| Logos or images blank in a local screenshot | Third-party CDNs are unreachable from the container | Expected. Confirm against the live site instead (12.3) |
| Edge function reports success, nothing in the database | The grants trap: RLS policies without table grants, so writes are rejected silently | The `information_schema.role_table_grants` query in step 4 of procedure 9 |
| Page number disagrees with the SQL number | The same statistic is computed in two places | Compute it once in a view, or assert the two against each other (procedure 9 step 7) |
| A map or system page looks fresh but is wrong | `navpatch.js` stamped today into an empty `.date`; that is a render timestamp, not a verification | Read `board_meta.system_map_last_verified`, not the header date (8.2) |

---

## 14. How to re-verify this document

Run these on any day you doubt it. Each one either confirms a claim above or tells you which line to fix.

1. **The workflow.** `git -C /tmp/py fetch && git -C /tmp/py show origin/main:.github/workflows/publish.yml`. Confirm: the `repository_dispatch` type is still `publish-pages`; the path filter is still `^[A-Za-z0-9._-]+$` with the `/`, `..` and `__` exclusions; `verOf()` still reads `badge`, then `ver`, then `pn-ver`; `PUBLISH-BLOCKED.md` is still written and self-cleared; the navpatch script injection line is still there. Note that a **stale copy of this file also sits at the repo root** as `publish.yml` and does **not** contain the version guard. The workflow under `.github/workflows/` is the live one.
2. **The nav.** `git -C /tmp/py show origin/main:nav-config.js` and confirm the group keys listed in 7.1 and the current group set (To Do List, Habit Modules, Quantified Self, Editors, Operating System).
3. **Pages navpatch cannot reach.** Re-run the two shell loops in 7.3 against a fresh clone. The Aug 14 2026 list will have drifted.
4. **Pages with no `pages` row.** `select path from public.pages order by path;` and diff against `ls /tmp/py/*.html`. Confirm `qs-log.html` and `qs-wheel.html` are still absent from `pages` before trusting 5.1.
5. **Block size.** The numbers in 2.2 are measurements from Aug 16 2026, not theory. If a run at 1,400 starts producing corrupt blocks, re-measure at 1,400, 1,000 and 600 on the same file in the same session, and replace the table with what you observe.
6. **Publish latency.** Time one real publish from copy-across to a verified `git fetch`. If it exceeds a couple of minutes, the poke is broken: read `publish_hook_log` and check the `github_pat` expiry.
7. **The version guard still fires.** Do not test this deliberately on a live page. Instead, confirm the guard code is present in step 1 and check `git -C /tmp/py log --oneline --all -- PUBLISH-BLOCKED.md` for real firings.
8. **Container reachability.** Re-test the table in 12.3 with one `curl -sS -o /dev/null -w '%{http_code}'` per host. The allowlist has changed before.
9. **Playwright paths.** `ls /opt/pw-browsers` and confirm the chromium build number in 12.2 still exists.
10. **Feed tables.** Re-run `select table_name from information_schema.tables where table_schema='public';` and update the lists referenced in procedure 9.

Anything in this document that states a number must say how to re-check it. If you add a number here and cannot write the check, do not add the number.

*As of August 18th, all times EST*
