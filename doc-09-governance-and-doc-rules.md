# Governance and Doc Rules

**What this is:** the rules the documentation itself runs on. What counts as a document, what every document must contain, who owns which one, and how the library is kept honest.

**Read this when:** you are about to add a document, retire one, or trust one.

**Last verified:** 2026-08-16, on the day the library was rebuilt. The reconciliation job details below were read from the live scheduled task list; the doc-rule content is policy rather than live state and does not go stale on its own.

**Supersedes:** Reconciliation-Watch-List.md (the process half), Nightly-Reconciliation-Report.md (the process half), _Feature-Docs/README.md (the "how feature docs are shaped" half).

---

## 1. Why this library is small on purpose

The previous version had 27 shelved documents drawing on 61 files. Six of them contradicted each other on where the site is hosted. Four described the database, and all four were wrong in different ways. Two of the largest were one-time build handoffs for work that shipped days earlier.

That is the failure mode this library is built against: a document is cheap to write and expensive to keep true, so every document that exists is a standing liability. The rule that follows is the whole governance model.

> **Add a document only when no existing document could own the content. Adding a section is almost always right; adding a file is almost always wrong.**

Eleven documents is the target. If it reaches fifteen, something has been filed lazily. Consolidate before adding twelve.

---

## 2. What counts as a document

A document belongs in `_Docs/` if all four are true:

1. It is **canon**. Someone should be able to act on it without checking anything else first.
2. It is **durable**. It describes a standing state or a repeatable procedure, not a single piece of work.
3. It has **one owner document**. No other file in the library also owns this content.
4. It is **about the operating system**, not about one project's subject matter.

Things that fail the test, and where they go instead:

| Not a document | Where it goes |
|---|---|
| A build handoff for one specific page | Extract the repeatable procedure into 04, discard the task list |
| A dated audit or scan | Findings into 08, then archive |
| A running capture log | Stays a working file at the CoWork root |
| A session tracker | A dated page, published, never shelved as canon |
| An executable Claude skill | Stays in `Claude Skills Backup/`, mapped by 06 |
| A single decision | A row in the 08 decision log |
| Another project's material | That project's folder |

---

## 3. Required shape of every document

Every file in `_Docs/` opens with this block. No exceptions, including this one.

```markdown
# <Title>

**What this is:** one line, the scope.

**Read this when:** one line, the trigger. Write the reader's situation, not the topic.

**Last verified:** <date>, and by what method. Name the queries, files or commands.

**Supersedes:** comma separated list of old filenames, or "Nothing, this is new".
```

And every file closes with a **How to re-verify this document** section containing the actual commands and queries that regenerate every number and list in it.

**Style rules**, which are the global writing standards from 06-How-We-Work.md applied here:

- American English.
- No em-dashes and no en-dashes, anywhere. Commas, colons, periods or parentheses instead. This one is checked mechanically.
- Scannable. Headings, tables and bullets for facts. Prose only where reasoning is the point.
- Numbers carry their source. "Measured Aug 16" beats "roughly".
- Cross-reference siblings by filename. Never duplicate a sibling's content to save the reader a click, because the copy is what goes stale.

---

## 4. The self-verification rule

**A document that describes the system is a claim, and a claim has to be re-checked on a schedule.**

This is the rule that cost the most to learn. On Aug 16, 2026 the data flow diagram was four days stale: Swarm had gone live with 8,819 check-ins, Apple Health with 16,826 rows, the Staging Area had become a mandatory gate, and Where I've Been had shipped. The page knew none of it and still showed two sources that were never connected.

What made it invisible was the date. The page stamped itself with `new Date()`, and `navpatch.js` does the same to any empty `.date` on every page. So it rendered today's date every day regardless of how old its contents were. It looked freshly checked while being four days wrong.

The rules that follow from that:

1. **An auto-generated date is a rendering timestamp, not a verification.** Never let one sit where a reader will read it as "this was checked today."
2. A date shown to a reader must come from a stored verification record, for example `board_meta.system_map_last_verified`.
3. Every document states its verification date and its verification method in the header, and carries the commands to redo it at the end.
4. **Writing the date down makes you check.** Of the five map pages audited that day, the single most accurate one was the only one that stated its verification date in prose.

---

## 5. Ownership, and the no-overlap rule

Each document owns a domain, and content lives in exactly one of them.

| Document | Owns | Explicitly does not own |
|---|---|---|
| 00 START-HERE | The index, the routing table, the old-file map | Any content of its own |
| 01 Product-Overview | What exists and what it is for | How it is built, why it is shaped that way |
| 02 Architecture | The shape of the system, the publish chain | The keystrokes, the schema |
| 03 Data-Model | Tables, columns, views, triggers, jobs, vocabularies | Procedures, product framing |
| 04 Runbook | Numbered procedures and troubleshooting | Architecture, schema |
| 05 Capture-Pipeline | Drafts to destination, the Staging Area gate | The destination tables' schemas |
| 06 How-We-Work | Working standards and session rituals | Anything about the web app |
| 07 Templates | Reusable templates, inline | Guidance on when to use them, beyond a line |
| 08 Roadmap | Decisions, open questions, known problems, gaps | Anything already settled and working |
| 09 Governance | The rules for the library itself | The content of any other document |
| 10 Foundations | Reasoning, frameworks, source material | Anything that could change tomorrow |

**The rule this table exists to enforce:** no document carries its own "open items" tail. That is the single habit that produced the old duplication, because every file grew a stale backlog nobody reconciled. Open items go in 08, always, and the owning document links to it.

---

## 6. Nightly reconciliation

A scheduled task re-checks the library and the maps overnight. It proposes; it never publishes, edits or deploys.

| Job | Scheduled task | Cron (UTC) | Local | What it does |
|---|---|---|---|---|
| Docs Library reconciliation | `trig_01G2FCFTkYdkeHVBivKqZ41A` | `30 6 * * *` | 2:30am ET | Reconciles the library documents, checks the live nav against the nav handoffs, verifies every Library link resolves, appends dated findings to the report and updates its last-run line |
| System Map freshness check | `trig_014uwjZ62nr12fYG7i6AK1yz` | `15 7 * * *` | 3:15am ET | Recaptures the database fingerprint, classifies drift, fetches each map page and reports which fail to name the change, writes the verdict to `board_meta.system_map_last_verified` |

Three `board_meta` rows drive the map check: `system_map_baseline` (the last verified fingerprint of tables, views, cron jobs, triggers and per-feed row counts), `system_map_pages` (which pages count as system maps), and `system_map_last_verified` (the verdict a page should display).

Two behaviors worth knowing, because both were deliberate:

- **Clean nights advance the baseline and stay silent. Drift nights do not advance it.** If drift advanced the baseline, the check would quietly forget what it found.
- **`blueprint.html` is excluded from `system_map_pages` on purpose.** It sits in the Maps nav and is titled "Knowledge Graph", but its data is a betterment-insight graph rather than a system description. It names no table, function or job, so the check would have flagged it stale every night forever. Do not put it back.

Since the library was consolidated, the reconciliation job's document list is out of date. Updating it to the eleven documents is tracked in **08-Roadmap-and-Open-Decisions.md**.

---

## 7. Adding, changing and retiring a document

**To add one**, in order:

1. Test it against section 2. If any of the four fails, it is a section in an existing document, not a file.
2. Copy the header block from **07-Templates.md**.
3. Write it, ending with the re-verification section.
4. Add it to the table and the routing table in **00-START-HERE.md**.
5. Add a card to `library.html` and publish, following **04-Runbook-Build-and-Deploy.md**.
6. Add it to the nightly reconciliation job's list.

**To change one**: update the `Last verified` line in the same edit, or the edit is not finished. If the change contradicts a sibling document, fix the sibling in the same session. A contradiction left overnight becomes two documents that are each half true.

**To retire one**: move the file to `_to_delete/`, never delete it outright. Add its name to the Supersedes line of whatever absorbed it, and add a row to the old-file map in 00. A retired document that is not named in a Supersedes line is a content loss nobody will notice.

---

## 8. Concurrency

Several chats write these files and the project memory at the same time. Two rules, both learned the hard way:

1. **Merge, never overwrite wholesale.** The memory index has twice lost lines because a session regenerated it from memory instead of reading it first. Read the current file, apply your change, write the whole thing back.
2. **One owner per page and per document at a time.** Publishing races on the same page corrupt each other. The publish protocol and the session-unique staging path that prevent it are in **04-Runbook-Build-and-Deploy.md**.

---

## 9. How to re-verify this document

```bash
# Every library document has the four required header lines.
for f in CoWork/_Docs/*.md; do
  for k in "What this is:" "Read this when:" "Last verified:" "Supersedes:"; do
    grep -q "$k" "$f" || echo "MISSING [$k] in $f"
  done
done

# Every library document ends with a re-verification section.
grep -L "How to re-verify this document" CoWork/_Docs/*.md

# No em-dashes or en-dashes anywhere in the library.
grep -nP '\x{2014}|\x{2013}' CoWork/_Docs/*.md
```

```sql
-- The two reconciliation jobs and what the map check last concluded.
select key, value from public.board_meta
where key in ('system_map_baseline','system_map_pages','system_map_last_verified');
```

And list the live scheduled tasks to confirm both jobs are still enabled and still on the schedules in section 6.

*As of August 16th, all times EST*
