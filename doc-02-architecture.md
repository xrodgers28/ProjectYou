# Architecture

**What this is:** the reference for how ProjectYou is put together, and the exact path a page takes from an edit to a browser.

**Read this when:** you need to understand the shape of the system before changing it, or you need to know why a change did or did not reach the live site.

**Last verified:** 2026-08-16, by reading `/tmp/py` (a read-only clone of `xrodgers28/ProjectYou`, HEAD `42bf74c`, committed 2026-08-16 05:25 UTC), specifically `.github/workflows/publish.yml`, `nav-config.js`, `navpatch.js` and the page files themselves, and by querying the live Supabase project `arnjntspmrhigodlssbn` for the `pages` and `pages_upload` schemas, the `pages_publish_now` trigger, the body of `notify_github_publish()`, the `publish_hook_log` contents, the Vault secret list and the edge function list. Every query and command is reproduced in "How to re-verify this document" at the end.

**Supersedes:** ProjectYou-Deploy-and-Hosting.md, Web-App-Build-Playbook.md, Supabase-textplain-support-ticket.md, and the infrastructure half of Todays-Tasks-Tech-Spec.md.

---

## How to read this

This document explains the shape of the system. It does not tell you which keys to press. Procedures live in 04-Runbook-Build-and-Deploy.md, the database schema lives in 03-Data-Model.md, and the capture path from a spoken note to a row lives in 05-Capture-Pipeline.md. Where this file states a fact about the live system, that fact has a query or a file behind it and the query is written down at the end. Treat any number here as a snapshot with a date on it, never as a standing truth.

Known-broken things and undecided questions are deliberately not argued here. They are listed in 08-Roadmap-and-Open-Decisions.md.

---

## Constants

| Thing | Value |
| --- | --- |
| Render host | GitHub Pages |
| Live site | `https://xrodgers28.github.io/ProjectYou/` |
| Repo | `xrodgers28/ProjectYou`, branch `main`, site served from repo root |
| Supabase project ref | `arnjntspmrhigodlssbn` |
| Supabase REST base | `https://arnjntspmrhigodlssbn.supabase.co` |
| Supabase function base | `https://arnjntspmrhigodlssbn.supabase.co/functions/v1/site/<page>` |
| Publishing workflow | `.github/workflows/publish.yml` |
| Publish observability | `public.publish_hook_log` |
| Raw read that works from the container | `https://raw.githubusercontent.com/xrodgers28/ProjectYou/main/<page>` |

---

## 1. The system in one picture

```
                            +-------------------------------+
   Scott's browser  <-----  |  GitHub Pages                 |   THE RENDER HOST
   (phone, desktop)         |  xrodgers28.github.io/        |   serves the static
          |                 |  ProjectYou/                  |   HTML, CSS, JS, images
          |                 +-------------------------------+
          |                                ^
          |                                | commit + push (supabase-publish-bot)
          |                                |
          |                 +-------------------------------+
          |                 |  GitHub Action                |   THE PUBLISHER
          |                 |  .github/workflows/           |   gunzips pages rows,
          |                 |  publish.yml                  |   version-guards them,
          |                 +-------------------------------+   writes files, commits
          |                                ^
          |                                | repository_dispatch (publish-pages)
          |                                |
          |                 +-------------------------------+
          |                 |  notify_github_publish()      |   THE POKE
          |                 |  fired by trigger             |   reads github_pat from
          |                 |  pages_publish_now            |   Vault, calls the
          |                 +-------------------------------+   GitHub API via pg_net
          |                                ^
          |                                | insert/update of gzb64
          |                                |
          |                 +-------------------------------+
          |                 |  public.pages                 |   THE PUBLISH QUEUE
          |                 |  path / html / gzb64 /        |   one row per publishable
          |                 |  updated_at                   |   file, gzip+base64
          |                 +-------------------------------+
          |                                ^
          |                                | execute_sql (Supabase MCP)
          |                                | staged through public.pages_upload
          |                                |
          |                          Claude sessions
          |
          |    data reads and writes, live, from the page itself
          v
   +---------------------------------------------------------------+
   |  Supabase Postgres  (project arnjntspmrhigodlssbn)             |
   |  todos, qs_log, checkins, health_metrics, inbox, and the rest  |
   |  RLS locked to Scott's email; anon-readable views where a      |
   |  page or artifact needs to read without a login                |
   +---------------------------------------------------------------+
          ^                        ^                      ^
          |                        |                      |
   +--------------+       +----------------+     +------------------+
   | capture      |       | health-in      |     | swarm            |   THE CONNECTORS
   | (Drafts)     |       | (Apple Health  |     | (Foursquare      |   edge functions that
   |              |       |  via Health    |     |  Swarm check-ins)|   take outside data in
   +--------------+       |  Auto Export)  |     +------------------+
                          +----------------+

   +-------------------------------+
   |  site edge function (v13)     |   THE SECOND FRONT DOOR, NOT USABLE TODAY
   |  functions/v1/site/<page>     |   reads pages, falls back to proxying
   |                               |   GitHub Pages. Supabase forces
   |                               |   content-type: text/plain, so a browser
   |                               |   shows source instead of a page.
   +-------------------------------+
```

What each layer is for:

| Layer | Purpose | Notes |
| --- | --- | --- |
| Browser | The whole application UI. Each page is one self-contained HTML file with its CSS and JS inline. | Pages hold no data. They read and write Supabase directly with the anon key plus a logged-in session. |
| GitHub Pages | The render host. Serves every page, script and image. | This is the only URL that renders today. |
| The repo | The canonical copy of every page. | See section 5. This is the rule that matters most. |
| `publish.yml` | Turns rows in `pages` into committed files. | Version guard, path filter and navpatch injection all live here. |
| `pages` table | The publish queue and the handoff point between Claude and GitHub. | Not a content management system. A page can exist on the site with no row here. |
| `notify_github_publish()` | Makes publishing near-instant instead of hourly. | Fail-safe by design: if it breaks, publishing still works, just slowly. |
| Postgres | The single source of truth for all data. | Schema in 03-Data-Model.md. |
| Connector edge functions | Bring outside data in (Drafts, Apple Health, Swarm). | See 05-Capture-Pipeline.md for the capture path. |
| `site` edge function | An alternative front door that cannot render. See section 3. | Still useful as a read-through of what the `pages` table currently holds. |

---

## 2. Hosting reality, settled

**The render host is GitHub Pages at `https://xrodgers28.github.io/ProjectYou/`. It is the only URL that renders. This is true as of 2026-08-16.**

The old docs disagree about this, so here is the resolution in one place.

| Old claim | Where it came from | Status today |
| --- | --- | --- |
| "You cannot host the page from Supabase. Edge Functions are reachable but the gateway forces `text/plain`." | Web-App-Build-Playbook.md, Aug 10 | Correct, but stated as a limit of Edge Functions specifically. It is broader than that. |
| "Supabase forces `content-type: text/plain` on everything served from `*.supabase.co`, an anti-phishing policy. Do not attempt Supabase-domain hosting again." | ProjectYou-Deploy-and-Hosting.md, Aug 11 | Correct, and this is the settled verdict. |
| "Is there a platform incident or a misconfiguration forcing `text/plain`? What is the recommended fix?" | Supabase-textplain-support-ticket.md, Aug 12 | Wrong premise. The ticket was written a day after the verdict and treats settled policy as a bug. No resolution to the ticket is recorded anywhere. |
| "From now on we serve from Supabase." | deploy-projectyou memory, recorded as a standing Scott preference | An intent, not a fact. It requires a custom domain, which does not exist. |

The mechanism, plainly: Supabase serves any `text/html` response as `Content-Type: text/plain` on the shared `*.supabase.co` domain, for both Edge Functions and Storage. It is an anti-abuse measure, not a defect on this project. JSON and other content types are unaffected, which is why the REST API works normally from the same domain. The evidence gathered at the time: a minimal `cttest` function returning HTML came back as `text/plain` while the same function returning JSON came back as `application/json`, and a `__test.html` file uploaded to a public Storage bucket did the same. Supabase's own position is documented under custom domains.

The `site` function itself is written correctly. Its `ctFor()` helper sets `text/html; charset=utf-8` for `.html` paths, `application/javascript` for `.js`, and so on. The platform overrides it. Nothing in the function code can fix this.

**The only route to making Supabase the front door is a Supabase custom domain pointed at the `site` function. That has not been done.** Scott has stated he wants a clean custom URL, and the same custom domain would solve both wants at once, so the "text/plain fix" and the "clean URL" are one task, not two. The decision, the cost and the alternatives (a static host such as Cloudflare Pages with Supabase kept purely as the data backend) belong in 08-Roadmap-and-Open-Decisions.md.

Practical consequence for anyone debugging: `https://arnjntspmrhigodlssbn.supabase.co/functions/v1/site/<page>` is still a useful diagnostic, because it shows you what the `pages` table currently holds and falls back to proxying GitHub when there is no row. Just never send Scott that URL as a link to look at.

---

## 3. The publish chain

An edit reaches the browser through six links. Every one of them can be the thing that failed.

```
1. Claude writes gzip+base64 into public.pages.gzb64   (via Supabase MCP execute_sql,
                                                        staged through pages_upload)
        |
2. Trigger pages_publish_now fires on that row
        |
3. notify_github_publish() reads github_pat from Vault and calls
   POST https://api.github.com/repos/xrodgers28/ProjectYou/dispatches
   with {"event_type":"publish-pages"}, via net.http_post, 8s timeout
        |
4. GitHub Actions receives repository_dispatch type publish-pages and runs publish.yml
        |
5. The Action pulls every pages row over REST with the anon key, gunzips gzb64,
   applies the version guard, writes the files, injects the navpatch scripts,
   commits as supabase-publish-bot and pushes to main
        |
6. GitHub Pages rebuilds and serves the new file
```

### Timing, measured

| Measurement | Value | When |
| --- | --- | --- |
| End to end, dispatch queued to new version served by github.io | about 20 seconds | Aug 14 2026 test, GitHub returned 204 on the dispatch |
| Re-confirmation, including the fetch back | 55 to 75 seconds | Aug 15 and Aug 16 2026 |
| Without the poke, on GitHub's throttled cron | up to about an hour | the cron in the workflow says `*/5 * * * *`, GitHub ignores it and runs it roughly hourly |

The `*/5 * * * *` schedule is still in the file and is still throttled. It is a backstop, not the mechanism. If a publish is taking an hour, the poke is not firing.

### When it stops working, read `publish_hook_log` first

`public.publish_hook_log` is the observability table for step 3. Columns: `id`, `path`, `request_id`, `ok`, `detail`, `created_at`. Every attempt writes a row whether it succeeded or not. As of 2026-08-16 it holds 72 rows, all with `ok = true`, most recent at 2026-08-16 05:24:59 UTC.

This table exists because of a specific failure. The first version of `notify_github_publish()` called `extensions.net.http_post(...)`. Postgres reads that three-part name as database.schema.function and raises `cross-database references are not implemented`. The function's `exception when others` handler swallowed the error, so publishing appeared to keep working while the hook silently never fired, and everything fell back to the hourly cron with no warning. `pg_net` is installed in schema `net`, not `extensions`. The fix was to call `net.http_post(...)` and to log every attempt. The lesson is worth stating plainly: **a fail-safe that swallows its own errors hides the failure, so it must log.**

Also true of the trigger, and non-obvious:

- The trigger is `AFTER INSERT OR UPDATE OF gzb64, html ... WHEN (new.gzb64 is not null and new.gzb64 <> '')`.
- `update pages set updated_at = now()` does **not** fire it. Neither does setting `gzb64 = ''`.
- To force a publish without changing content, write the column to itself: `update public.pages set gzb64 = gzb64 where path = '...'`.
- The GitHub token lives in Supabase Vault as the secret `github_pat` (confirmed present, 2026-08-16). If it expires, publishing quietly reverts to hourly and `publish_hook_log` starts recording `ok = false`.

### What `publish.yml` actually does

The file that runs is `.github/workflows/publish.yml`. **There is also a `publish.yml` at the repo root. It is an older copy, it is not what GitHub executes, and it does not contain the version guard or the `repository_dispatch` trigger.** Do not read the root copy and believe it. Verified 2026-08-16: the two files differ, and only files under `.github/workflows/` run.

The workflow, in order:

1. Triggers: `schedule` (`*/5 * * * *`, throttled), `workflow_dispatch` (the Run workflow button), and `repository_dispatch` on type `publish-pages`. Concurrency group `publish-pages` with `cancel-in-progress: false`, so runs queue instead of clobbering each other.
2. Fetches `/rest/v1/pages?select=path,gzb64` with the anon key, which is hardcoded in the workflow.
3. **Reads only `gzb64`.** A row with only `html` set never reaches GitHub. Rows with a null or empty `gzb64` are skipped, not blanked.
4. Filters paths: skips anything containing `/` or `..`, anything starting `__`, and anything failing `^[A-Za-z0-9._-]+$`. **This is why binary assets and anything in a subfolder can never be published through the `pages` table.** Images reach the repo only by Scott uploading them; the alternative is an inline SVG or a `data:` URL inside the page.
5. Gunzips. A row that fails to decompress is logged as `SKIP corrupt` and skipped, and the rest of the run continues.
6. **Version guard.** For each page it extracts a version from the incoming HTML and from the file already in the repo, using three regexes in this order: `<div class="badge">...vN.N`, then `class="ver"> vN.N`, then `class="pn-ver"> vN.N`. If the incoming version is **strictly older**, the page is skipped and a line is appended to `PUBLISH-BLOCKED.md` in the repo, for example `all-todos.html: incoming v2.8 is OLDER than published v2.13`. If nothing was blocked on a run, `PUBLISH-BLOCKED.md` is deleted, so the file clears itself.
   - Limits, all real and all bitten: a page with no recognizable version marker publishes with no check at all. **An equal version is not blocked.** A page whose marker is in some other element (`maps.html` uses `.verbadge`, which does not match) falls back to whatever the nav's `.pn-ver` happens to say.
   - The guard fires in real life. On Aug 16 one session cloned `where-ive-been.html` at v1.0 while another published v1.2 twelve minutes later; the first session's v1.1 was correctly refused. On the same day, an equal-version publish of `automated-tracking.html` silently destroyed another session's work, because equal is not older.
7. **Navpatch injection.** For every `.html` file in the repo root that does not already mention `navpatch.js`, it appends `<script src="nav-config.js"></script><script src="navpatch.js"></script>` before `</body>`. This is why the shared UI layer in section 6 runs everywhere without anyone wiring it up per page.
8. Commits as `supabase-publish-bot` with the message `Publish pages from Supabase [skip ci]` and pushes.

### `pages` and `pages_upload`

| Table | Columns | RLS | Role |
| --- | --- | --- | --- |
| `public.pages` | `path` (not null), `html` (nullable), `gzb64` (nullable), `updated_at` (not null) | enabled, 1 policy | The publish queue. 45 rows on 2026-08-16, 37 with a non-empty `gzb64`, 1 with `html` set (`nav.html`). |
| `public.pages_upload` | `path` (not null), `gzb64` (not null), `updated_at` (not null) | **not enabled, no policies** | Scratch staging for chunked uploads. 24 rows on 2026-08-16. No publish trigger, which is why a collision here is harmless. |

Two structural facts that catch people out:

- **A page can be live on the site with no `pages` row.** Of the 48 HTML files in the repo clone, seven have no row at all: `all-todos-v215.html`, `how-we-work.html`, `midnight-run.html`, `midnight-run-v2.html`, `qs-health.html`, `qs-log.html`, `tracker.html`. The script `world-countries.js` has no row either. Those files are only ever changed by uploading them to GitHub. `publish.yml` will never touch them, and a copy-across into a non-existent row updates zero rows and reports success.
- **A `pages` row can exist for a file that is not in the repo.** `morning-update.html` and `nav.html` are rows with no repo file. `nav.html` is a leftover from an older design in which the `site` function injected a shared nav fragment into every page. The current `site` function (v13) does no injection.

The chunked staging protocol, the block size, the md5 guards and the session-unique staging path are procedure, not architecture. They are in 04-Runbook-Build-and-Deploy.md. The one architectural point to carry: `pages_upload` holds **one row per path with no owner column and no locking**, so two sessions staging the same path interleave their appends and both lose, silently.

---

## 4. Canonical source: the repo is the truth

**This is the single most important rule in this document.**

> **The GitHub repo `xrodgers28/ProjectYou` is the canonical copy of every page. Not the `pages` table, not your session's working copy, and above all not `CoWork/ProjectYou-deploy-Aug11/`. Before editing any existing page, clone or fetch the repo, read the version marker, and build on that file. Re-fetch again immediately before you publish, not when you started editing.**

Why the repo and not the database:

- Scott sometimes uploads files to GitHub directly, with "Add files via upload" commits. Those changes never pass through `pages`. **GitHub can therefore be ahead of the database**, and the database can be ahead of GitHub for the few seconds a publish is in flight. Only one of the two receives every change, and that is GitHub.
- Eight repo files have no `pages` row at all (listed above). For those the repo is not merely canonical, it is the only copy.
- `git log` on a file gives you every published version, so a clobbered page is always recoverable with `git show <sha>:<file>`.

**The incident that established the rule.** On 2026-08-14 the local folder `CoWork/ProjectYou-deploy-Aug11/` held **v2.7** of `all-todos.html` while the live page was **v2.11**. A session edited the local copy and published it. That silently wiped Scott's Parking Lot section, the Known Bugs category, the Queue and Run and Scott to Drive lanes, and the mini section-nav. Nothing in the pipeline stopped it, because v2.7 was published over v2.11 before the version guard existed in its current form and because nobody had compared version markers first. Scott caught it, not the process.

`CoWork/ProjectYou-deploy-Aug11/` is a working copy from a single day in August. **Treat it as stale until proven otherwise.** It is not a backup and it is not a mirror.

Two corollaries, both learned from real damage:

- **A fresh `updated_at` on a `pages` row and a green line in `publish_hook_log` prove that something published. They say nothing about what.** Verify by reading the file itself, from `raw.githubusercontent.com` or from a fresh clone, and comparing md5 or the version marker.
- **The canonical copy goes stale in minutes when another session is live.** A page fetched, edited, and published 36 minutes later wiped three real changes another session had made in the gap, and the version guard did not catch it because the version numbers matched. Read `publish_hook_log` for the last 30 minutes before you start. Activity on your page means stop.

Note on verifying this yourself: the clone at `/tmp/py` is shallow (depth 1, one commit), so it cannot show you the authorship history. Clone with `--depth 25` if you need to see who committed what.

---

## 5. The shared UI layer

Every page ships a **hardcoded** `<div class="pynav">` containing `.pn-group` blocks, each with a grey `.pn-label` and a `.pn-links` span. Two shared scripts then run on every page, appended automatically by `publish.yml`:

- **`nav-config.js`** declares `window.NAV_CONFIG`, an object keyed by group label.
- **`navpatch.js`** reads it and, for each group whose hardcoded `.pn-label` text matches a config key **exactly**, replaces that group's `.pn-links` innerHTML.

**A site-wide UI change belongs in `navpatch.js`, not in the pages.** This is both the correct design and the cheap path: `navpatch.js` is about 6.7 KB, so changing it is a small publish, while making the same change page by page means re-encoding files up to 117 KB each, one at a time. Always ask whether a change belongs in the shared layer before touching individual pages.

Beyond the nav, `navpatch.js` currently also: injects the `pn-maps-css` dropdown styles and the `ph-header-css` page-header styles, adds `.ph-h1` to the page's real `<h1>`, stamps today's date into any empty `.date` element, marks the current page's link `.on` (including marking a dropdown button active when one of its children is the current page), positions dropdown menus with `position: fixed` on click, inserts the "back to YouMatics" link on `qs-log.html`, `qs-wheel.html`, `life-snapshot.html` and inside `#wheelview` on `index.html`, and appends newer maps to the hardcoded `.mapsub` strip from an `EXTRA` array at the bottom of the file.

### Current nav groups and items

Reproduced verbatim from `/tmp/py/nav-config.js` as of 2026-08-16. `<br>` inside a label is the site convention for a two-word nav item.

| Group | Items (in config order) |
| --- | --- |
| To Do List | Todays Tasks (`index.html`), Staging Area (`staging-area.html`), All ToDos (`all-todos.html`) |
| Habit Modules | Cue Cards (`habit-modules.html`) |
| Quantified Self | YouMatics (`qs-dashboard.html`), Where I've Been (`where-ive-been.html`), Coffee Days (`coffee-days.html`) |
| Editors | Daily Habits (`daily-template.html`), Midnight Run (`midnight-run-v2.html`), Style Guide (`style-guide.html`) |
| Operating System | Components (`build.html`), Automated Tracking (`automated-tracking.html`), **Maps** (dropdown), Mission Control (`mission.html`), Docs Library (`library.html`) |

The Maps dropdown children, in order: Overview (`maps.html`), Data Flow Diagram (`dfd.html`), Knowledge Graph (`blueprint.html`), Interactive Knowledge Graph (`knowledge-graph.html`), Architecture Map (`architecture-map.html`), Data Flow Map (`data-flow-map.html`).

`window.NAV_GROUP_LINKS` is declared and currently empty. When a group name is given a URL there, navpatch renders that group's grey label as a clickable link.

### How the config behaves, and where it cannot reach

Four rules govern this, and three of them are traps.

1. **A group listed in `nav-config.js` overwrites that whole group on every page.** Adding one link means listing all the existing ones too, or you silently delete them.
2. **Config order does not set display order.** The page's hardcoded group order wins. Keep the config in page order for readability anyway.
3. **A group that is not in the config keeps its hardcoded links on every page.** This is live today: 30 of the 35 pages that carry a nav also carry a hardcoded **Parking Lot** group (Future Travel, Social, Movies, Cheat Sheet, AI Tools) that appears nowhere in `nav-config.js`. Editing `nav-config.js` will never change those links. They are page by page.
4. **A page that lacks a group's hardcoded markup never gets that group's links**, because navpatch has nothing to match against.

Pages navpatch cannot reach at all, verified by grepping the clone on 2026-08-16. `navpatch.js` returns early when a page has no `.pynav`, so these 13 of 48 HTML files get no shared nav, no shared header styling and no date stamp:

`midnight-run.html`, `midnight-run-v2.html`, `qs-health.html`, `tracker.html`, `session-tracker.html`, and the eight dated session tracker pages (`session-tracker-2026-08-15-all-todos-publishing.html`, `session-tracker-2026-08-15-takeaways-cue-cards.html`, `session-tracker-2026-08-16-apple-health-import.html`, `session-tracker-2026-08-16-coffee-days.html`, `session-tracker-2026-08-16-someday-tab-redesign.html`, `session-tracker-2026-08-16-swarm-connector.html`, `session-tracker-2026-08-16-takeaways-card-restore.html`, `session-tracker-2026-08-16-time-bandit-wheel.html`).

The two Midnight Run pages are the ones that matter: with no nav bar at all, there is no way to navigate away from them.

Partially reachable: four pages that do carry a nav are missing the hardcoded **Editors** group, so no Editors links can be pushed to them: `coffee-days.html`, `habit-modules.html`, `qs-dashboard.html`, `takeaways.html`.

One known defect in the shared layer: the date stamp uses `toLocaleDateString` with the **browser's** clock, not Eastern. Scott's standing choice is Always Eastern, so this needs an explicit `timeZone: 'America/New_York'`. It affects every page. Tracked in 08-Roadmap-and-Open-Decisions.md.

---

## 6. Edge functions

Live list from the Supabase project on 2026-08-16, via `list_edge_functions`. Versions and `verify_jwt` are as returned by that call.

| Slug | Version | verify_jwt | Role |
| --- | --- | --- | --- |
| `site` | 13 | false | Serves a page from `public.pages` (gunzips `gzb64`, else uses `html`), and falls back to proxying `xrodgers28.github.io/ProjectYou/` when there is no row. Sets correct content types in code; the platform overrides them to `text/plain`. Version 13 does **no** nav injection, unlike earlier versions. |
| `app` | 7 | false | A second slug carrying the same site-serving code. An alias, kept from the text/plain investigation. |
| `capture` | 7 | false | Intake endpoint for the Drafts capture pipeline. See 05-Capture-Pipeline.md. |
| `health-in` | 2 | false | Ingest endpoint for Apple Health data pushed hourly from the phone by Health Auto Export, writing `health_metrics`. |
| `swarm` | 1 | false | Pulls Foursquare Swarm check-ins into `checkins`. |
| `code-run` | 3 | **true** | The Ready to Code path: builds queued tasks server-side. The only function on the project that requires a JWT. |
| `cttest` | 5 | false | The minimal reproduction from the text/plain investigation: returns a short HTML document. Diagnostic only. |
| `dbgpages` | 2 | false | Diagnostic: fetches `/rest/v1/pages?select=path,gzb64` with the anon key and returns the status plus the first 400 characters, to prove what the Action will see. |
| `stput` | 3 | false | Diagnostic: creates a public `site` Storage bucket, uploads a `__test.html`, and reports the public URL's content type. This is the experiment that proved the `text/plain` behavior applies to Storage as well as Functions. |

`cttest`, `dbgpages` and `stput` are leftovers from the August 12 hosting investigation. They are harmless and they are also the evidence trail for section 2. Whether to delete them is an open question, not a decision this document makes.

Note that eight of the nine functions run with `verify_jwt: false`. That is deliberate for the ones that receive pushes from devices and for the public site path, but it means their own code is the only access control they have. See section 8.

---

## 7. Environment and access constraints

These are properties of the Claude container, not preferences. Every procedure in 04-Runbook-Build-and-Deploy.md is shaped by them.

| Constraint | Consequence |
| --- | --- |
| Direct network to `*.supabase.co` is firewalled from the container. | All database reads and writes go through the Supabase MCP `execute_sql` tool, never `curl`. Publishing means pasting gzip+base64 through SQL. |
| `git clone` over anonymous HTTPS works. **`git push` and the GitHub API are blocked.** | Claude can read the canonical repo but can never write to it directly. The only write path to GitHub is the publish chain, or Scott uploading by hand. |
| `raw.githubusercontent.com` returns 200 from the container. `github.io` does not. | Verify a publish with `raw.githubusercontent.com/xrodgers28/ProjectYou/main/<page>` or with `git fetch && git show origin/main:<page>`. `curl` to github.io returns 0 bytes. |
| `raw.githubusercontent.com` caches for several minutes. | A deleted `PUBLISH-BLOCKED.md` kept returning 200 for two checks after it was gone. For true repo state, clone and read the working tree. |
| Most third-party CDNs are unreachable: `cdn.jsdelivr.net`, `unpkg.com`, `logo.clearbit.com`, `mzstatic.com`. | Local testing must stub `window.supabase` (and `window.L` for Leaflet pages) with `addInitScript`. Remote logos always fall back to placeholders in screenshots, which is not a bug in the page. |
| The container cannot push to GitHub and cannot drive a browser to GitHub. | Anything requiring the GitHub web UI, above all binary uploads, is Scott's job and must be planned as step one of a build, not discovered at the end. |
| Local testing runs against a served clone. | `python3 -m http.server --directory <dir>` (the `--directory` flag matters, because the shell's working directory resets between calls) driven by playwright-core at `/opt/pw-browsers/chromium`. `npm install playwright-core` first; it is not preinstalled. |
| `execute_sql` statements are sometimes replayed by the transport. | Every write must be idempotent and guarded on prior state. This is the reason the staging protocol looks the way it does. |
| `execute_sql` returns only the last statement's result in a multi-statement call. | Use `returning length(gzb64), md5(gzb64)` on the update itself rather than pairing an update with a separate select. |

---

## 8. Security posture

The short version, with the detail elsewhere.

- **The intended model is private by RLS, not by obscurity.** Every user-data table checked on 2026-08-16 has RLS enabled: `todos`, `qs_log`, `inbox`, `checkins`, `health_metrics`, and `pages`. The intended pattern is an email match against the JWT, and `todos`, `qs_log` and `inbox` do exactly that (`(auth.jwt() ->> 'email') = 'scottyex@gmail.com'`).
- **Two of those tables are not actually private.** Verified 2026-08-16: `checkins` and `health_metrics` each carry a `SELECT` policy with `using (true)` granted to **`anon`** as well as `authenticated`, with writes restricted to `service_role`. Anyone holding the anon key, which is published in every page and in `publish.yml`, can read all 8,819 check-ins and all 16,826 health rows. That may have been deliberate so pages could read them without a login, but it is not the email-locked model the rest of the schema uses. Flag it in 08-Roadmap-and-Open-Decisions.md rather than assuming it was a choice.
- **`pages` is anon-readable on purpose.** Its single policy is `pages_anon_read`, `SELECT` to `anon` with `using (true)`. The publish Action depends on it. It exposes compressed page source, which is already public on GitHub Pages.
- **The anon key is public by design.** It is hardcoded in `publish.yml`, in `dbgpages`, and in every page. That is normal for Supabase and safe only for as long as RLS and grants are correct. See 03-Data-Model.md for the standing grants trap: an RLS policy without the matching grant fails silently, and a `SECURITY DEFINER` function can hand out access that the policies were meant to prevent.
- **Anon-readable views are a deliberate exception.** Read-only, security-definer views granted to `anon` are how a Cowork artifact reads live data without a login. Each one is a decision to publish that slice of data. They are enumerated in 03-Data-Model.md.
- **Two infrastructure tables have RLS off and no policies:** `pages_upload` and `publish_hook_log`. Neither holds personal data. `pages_upload` holds compressed page source in transit and `publish_hook_log` holds publish timestamps and paths. This is noted rather than defended.
- **The GitHub token is a scoped fine-grained PAT** stored in Supabase Vault as `github_pat`, limited to the ProjectYou repository with Contents read and write. It has an expiry, and when it expires publishing quietly degrades to hourly rather than failing loudly.
- **Eight of nine edge functions run with `verify_jwt: false`**, so their own code is their only gate.

Known gaps and the plan for them belong in 08-Roadmap-and-Open-Decisions.md. Doc rules and who owns what are in 09-Governance-and-Doc-Rules.md.

---

## How to re-verify this document

Run these on the date you need the answer. If a result disagrees with the text above, the result is right and this file is stale. Fix the file in the same session.

**Repo clone (the canonical source, and the basis of sections 4, 5 and the publish.yml description)**

```bash
git clone --depth 25 https://github.com/xrodgers28/ProjectYou.git /tmp/py
cd /tmp/py && git log -1 --pretty='%h %an %ad %s' --date=iso
```

**The workflow that actually runs, including the version guard and the navpatch injection**

```bash
cat /tmp/py/.github/workflows/publish.yml
# confirm the root copy is still a stale decoy:
diff /tmp/py/publish.yml /tmp/py/.github/workflows/publish.yml
```

**The nav config, verbatim**

```bash
cat /tmp/py/nav-config.js
cat /tmp/py/navpatch.js
```

**Which pages navpatch cannot reach, and which groups are hardcoded only**

```bash
cd /tmp/py
ls *.html | wc -l
grep -l 'class="pynav"' *.html | wc -l
for f in *.html; do grep -ql 'class="pynav"' "$f" || echo "NO PYNAV: $f"; done
for g in "To Do List" "Habit Modules" "Quantified Self" "Editors" "Operating System" "Parking Lot"; do
  echo "$g -> $(grep -l ">$g<" *.html | wc -l) pages"
done
```

**`pages` and `pages_upload` shape and contents**

```sql
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema='public' and table_name in ('pages','pages_upload')
order by table_name, ordinal_position;

select count(*) as page_rows,
       count(*) filter (where gzb64 is not null and gzb64 <> '') as with_gzb64,
       count(*) filter (where html is not null) as with_html,
       max(updated_at) as newest
from public.pages;

select path, (gzb64 is not null and gzb64 <> '') as has_gz,
       (html is not null) as has_html, updated_at
from public.pages order by path;
```

Compare that path list against `ls /tmp/py/*.html /tmp/py/*.js` to refresh the "no `pages` row" and "row with no file" lists in section 3.

**The publish trigger and the poke function**

```sql
select t.tgname, c.relname as table_name, p.proname as function_name,
       pg_get_triggerdef(t.oid) as def
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_proc  p on p.oid = t.tgfoid
where not t.tgisinternal and c.relname in ('pages','pages_upload');

select pg_get_functiondef(p.oid)
from pg_proc p
where p.proname = 'notify_github_publish';
```

**Publish health, and whether another session is live right now**

```sql
select count(*) as total,
       count(*) filter (where ok) as ok_rows,
       count(*) filter (where not ok) as fail_rows,
       max(created_at) as last_hook
from public.publish_hook_log;

select created_at, path, ok, detail
from public.publish_hook_log
where created_at > now() - interval '30 minutes'
order by created_at desc;
```

**The GitHub token is still in Vault**

```sql
select name from vault.secrets where name = 'github_pat';
```

**Edge functions, versions and verify_jwt**

Not available over SQL. Use the Supabase MCP tool `list_edge_functions` with project id `arnjntspmrhigodlssbn`, and `get_edge_function` for any one function's source.

**RLS state on the tables named in section 8**

```sql
select c.relname, c.relrowsecurity as rls_enabled,
       (select count(*) from pg_policies p
        where p.tablename = c.relname and p.schemaname = 'public') as policies
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
  and c.relname in ('pages','pages_upload','publish_hook_log','todos','qs_log','checkins','health_metrics','inbox')
order by c.relname;

select tablename, policyname, cmd, roles::text, qual::text as using_clause
from pg_policies
where schemaname = 'public'
  and tablename in ('pages','todos','qs_log','checkins','health_metrics','inbox')
order by tablename, policyname;
```

The second query is the one that matters. A policy with `using (true)` and `anon` in its roles list means the table is world-readable to anyone holding the published anon key, whatever RLS says.

**The text/plain verdict in section 2**

This one cannot be re-checked from the container, because `*.supabase.co` is firewalled. Confirm it from a browser or from a machine with open internet:

```bash
curl -sI "https://arnjntspmrhigodlssbn.supabase.co/functions/v1/cttest/" | grep -i content-type
# expect: content-type: text/plain
curl -sI "https://arnjntspmrhigodlssbn.supabase.co/functions/v1/site/index.html" | grep -i content-type
```

If either ever returns `text/html`, Supabase has changed its policy or a custom domain has been attached, and section 2 of this document is out of date.

**The end to end timing claim**

Publish any small file through the chain, note the `publish_hook_log` row's `created_at`, then poll `git fetch && git show origin/main:<file>` until the content changes. The runbook has the full procedure. Expect roughly 20 to 75 seconds. Anything approaching an hour means the poke is not firing, so read `publish_hook_log` first.

*As of August 16th, all times EST*
