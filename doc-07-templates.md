# Templates

**What this is:** every reusable template in the system, held inline in one file, so there is one place to copy from instead of five folders to hunt through.

**Read this when:** you are starting a new project, writing a project brief or an instructions file, building a session tracker, or adding a new document to this library.

**Last verified:** 2026-08-16, by reading `_SER Templates/project-brief-template.md`, `_SER Templates/project-instructions-template.md`, `_SER Templates/START-A-NEW-PROJECT.md`, `_Global Assets/Session-Tracker-Template.md`, `_archived files/project-instructions-to-paste.md`, and the `new-project` and `session-tracker` skill backups in `CoWork/Claude Skills Backup/`, then reconciling each pair of overlapping sources and recording which one was kept.

**Supersedes:** project-brief-template.md, project-instructions-template.md, START-A-NEW-PROJECT.md, Session-Tracker-Template.md, project-instructions-to-paste.md.

---

## How to use this

Copy the block, fill the square brackets, delete anything that does not apply. Nothing here is executable and nothing here drives behavior on its own.

Three things to know before you copy:

1. **The skills are the executable versions.** Where a template describes something a skill also does (starting a project, building a tracker), the skill runs it and this file only shows the shape. When they disagree, the skill wins. The skills are mapped in **06-How-We-Work.md**.
2. **Two blanks cannot live in this file.** `to-dos-template.xlsx` and `time-tracker-template.xlsx` are spreadsheets and stay as files in `CoWork/_SER Templates/`. Copy them, rename them, and never edit the masters.
3. **Every filled template follows the house rules:** American English, Arial, no em-dashes, dates as "Aug 16, 2026", times labeled EST, and a date stamp on the last line. Those rules are in **06-How-We-Work.md** and are checked.

Governance for this library, including who may add a template here, is in **09-Governance-and-Doc-Rules.md**.

---

## Project brief template

The standing context document for a project. One per project, in `00-Project Setup/`, named `[Project Name]-Project-Brief.md`.

Reconciled from `project-brief-template.md` and the structure the real briefs actually use. The five sections are kept as written, because they are already the shape the live briefs follow. Two things were added: a "Read first" pointer, so the brief itself says which files it was distilled from, and an "Open questions" section, because every real brief in the tree grew one.

The italic standing note is the load-bearing part. It carries the precedence rule that settles most conflicts inside a project, so keep it verbatim.

```markdown
# [Project Name], Project Brief and Current Status

*A standing context document. Distilled from the source-of-truth files in this folder. Read first each session. Where this brief and a folder file disagree, the folder file wins. Last distilled: [Aug 16, 2026].*

## What this is
[A short paragraph in plain language. What the project is, for whom. No acronyms in the first sentence.]

## Why it matters
[The problem it addresses, or the goal. What changes if it works.]

## Where things stand
[Current status, the key numbers, what is in progress, and the coverage gaps. Every number here is either verified or labeled "not yet verified".]

## How we work here
[Project-specific conventions that are not already global. Do not restate the global standards; they apply automatically. If there is nothing project-specific, say "Nothing beyond the global standards."]

## Read first
- [key file 1, and one line on what it holds]
- [key file 2]
- to-dos.xlsx, for what is open

## Folder map
| Folder | What it holds |
|---|---|
| 00-Project Setup | Instructions, this brief, the short description, and knowledge files |
| 10-Project Trackers | to-dos.xlsx and [project]-time-tracker.xlsx |
| _archived files | Retired documents |
| [working folder] | [what it holds] |

## Open questions
- [Anything unresolved that a future session would otherwise re-litigate, with the date it was raised.]

*As of [Month Day with ordinal] · all times EST*
```

---

## Project instructions template

What goes into the project's instructions field in the app, and what gets saved as `00-Project Setup/[Project Name]-Project-Instructions.md` so the project is recoverable if the tile is ever deleted.

**Reconciliation, in one line: the structure of `project-instructions-template.md` was kept in full and `project-instructions-to-paste.md` was dropped entirely, because the archived file is a one-time Aug 1, 2026 migration document whose three structural claims are all dead (it names the retired skills `document-formatting-standards` and `mission193-time-tracking`, points at `to-dos.docx` rather than `to-dos.xlsx`, and carries a three-row "where things live" table superseded by the two much richer maps in `how-we-work-rules`).** Its only surviving value is the project facts it records for Positive Footprint and Mission 193, which are content, not template, and belong in those projects' own files.

Two additions to the live template: the Session rituals section now names all the commands that work in every project, not just two, and a Do not restate line was made explicit.

```markdown
# [Project Name], Project Instructions

This project is [one line: what it is and who it is for].

## Source of truth
The connected folder is the source of truth, not the chat. Read the relevant files fresh each session, and write decisions back into the right file as they are made. to-dos.xlsx is the record of truth for open work. The time tracker holds hours (Scott enters hours) and the Accomplishments log (Claude fills).

## Read first
- [key file 1, for example the mission or overview]
- [key file 2]
- to-dos.xlsx, for what is open

## Key facts
- [The durable facts: current status, constraints, the single most important thing to know.]

## Terminology
- [Any words this project uses in a specific way, and words to avoid.]

## Priority and deadlines
- [How this project ranks against others. Any real deadline, or "no deadline".]

## Copy and voice
[Only if the project produces public-facing content. Any project-specific copy rules. Delete this section otherwise.]

## Session rituals
[wrap], [SC], [ST] and [start new project] work here as everywhere, and "hardpull" sweeps captured notes into the to-do system. The global working standards in how-we-work-rules always apply. Do not restate them here: a rule copied into a project instruction is a rule that will go stale when the master changes.

*As of [Month Day with ordinal] · all times EST*
```

---

## New project checklist

One ordered list, reconciled from `START-A-NEW-PROJECT.md` (the manual procedure for a human) and the `new-project` skill (the automated one). Neither was a superset of the other, so both were merged: the manual file uniquely held the Description file step and the global to-dos path, and the skill uniquely held the name options, the voice brief, the seed-the-to-dos step, the kickoff card, and the closing handshake.

**The `new-project` skill is the executable version.** Typing `[start new project]` runs steps 1 through 8 and 11 below. Steps 9 and 10 are Scott's, because Claude cannot create a project tile or connect a folder. Use this list when the skill is not available, or to check that a project got set up completely.

1. **Name the project.** If Scott is unsure, offer three to five options. A good name telegraphs the idea. *(Skill step 1.)*
2. **Create the folder structure:** `CoWork/[Project Name]/` holding `00-Project Setup`, `10-Project Trackers`, `_archived files`, plus the working folders that project needs (research, drafts, and so on). *(Skill step 1, manual steps 1 and 3.)*
3. **Copy the tracker blanks** from `CoWork/_SER Templates/` into `10-Project Trackers`: `to-dos-template.xlsx` becomes `to-dos.xlsx`, and `time-tracker-template.xlsx` becomes `[project]-time-tracker.xlsx`. **Never edit the master templates.** *(Skill step 1, manual step 2.)*
4. **Take the brief by voice.** Invite a voice note talking through the project, whatever is in his head. Transcribe it, shape it, reflect it back structured, and ask only for the gaps. Offer to model the shape on an existing project ("base it on TreadWell's setup?") and read that project's `00-Project Setup` if he says yes. *(Skill step 2.)*
5. **Start the setup docs from the templates above,** saved into `00-Project Setup` as `[Project Name]-Project-Brief.md` and `[Project Name]-Project-Instructions.md`. *(Manual step 2 names the template files. The skill generates these from the voice brief without naming them, which is the one place the two procedures produce different results.)*
6. **Seed the to-do list from the brief.** Pull every actionable item out into the new `to-dos.xlsx` under the right subsection. Capture first, tidy second. *(Skill step 3.)*
7. **Run the kickoff card** at `_SER Templates/project-kickoff-card.html` for the click questions, and gather four things: **Goals** (what success looks like), **Connections** (other folders, documents, apps or data to connect or reference), **Research and discovery** (a competitor or landscape scan, market data, best practices, sourcing, a deep-research doc, or none), and **Output format** (deck, document, spreadsheet, prototype, website, other). The card carries an always-visible selectable copy box, because the clipboard API is blocked in the artifact sandbox. He pastes his choices back, or just answers in chat. *(Skill step 4.)*
8. **Fill and deliver the setup files** from the brief and the card answers, then commit them to the device. *(Skill step 5.)*
9. **Write the short description file,** `00-Project Setup/[Project Name] - Description.md`, as soon as there is enough information: a one-line tagline plus two or three plain sentences. *(Manual step 6. The skill omits this entirely, which is the second place the two procedures diverge.)*
10. **Scott does the app steps.** Settings, then the projects area, create the project tile, name it, connect the new folder, paste the filled instructions from `00-Project Setup` into the instructions field, and paste the one-line tagline into the short description field. Keep the brief and any knowledge as files, not only in the app. *(Manual steps 4, 5 and 6, skill step 6.)*
11. **Confirm and start.** Once he confirms the tile exists and the folder is connected, run a quick `[SC]`, kick off any research he asked for, and log the kickoff with `log-accomplishments`. From then on `[wrap]` and `[SC]` work and the global skills apply automatically. *(Skill step 7, manual step 7.)*

### Global versus project, so things go in the right place

- Global rules live in the `how-we-work-rules` skill and apply to every project automatically. **Never copy them into a project.**
- Project-specific facts and rules live in that project's instructions and `00-Project Setup`.
- Global to-dos live in `CoWork/global-to-dos.xlsx`. Project to-dos live in the project's own `to-dos.xlsx`.

This same rule is currently written out in five different files. Four of them should point at the master instead. See the drift table in **06-How-We-Work.md**.

---

## Session tracker template

The five-column interactive HTML status page. This is the default format for every summary and status update.

**Two written specs for this page exist and they disagree. The `session-tracker` skill wins, because it is the executable one.** `_Global Assets/Session-Tracker-Template.md` is a near-duplicate that carries its own competing YAML `name: session-tracker` block, which means it is an older copy of the skill file itself rather than a template. Where they conflict, use the skill.

| Point | Skill (`session-tracker.md`) | Template (`Session-Tracker-Template.md`) | Use |
|---|---|---|---|
| Which wrap step publishes it | Not stated; the wrap owns the timing | "Step 6 of `its-a-wrap`, between logging the accomplishments and the shutdown reminders" | **Step 2**, per the current `its-a-wrap.md` and project memory. The template is wrong |
| The index at `session-tracker.html` | "Update the index", and the pre-delivery checklist says "the index regenerated" | "It reads the table live, so it does not need republishing" | **Reads live.** Both the template and project memory agree the index reads `session_trackers` directly. Upsert the row, do not republish the index |
| Publish chunk size | About 2400 characters | About 1,400, with the incident: a 5,588-character block was mistyped on Aug 15, 2026 and had to be rolled back | **Neither.** See **04-Runbook-Build-and-Deploy.md**, which owns the publishing procedure and carries the current verified number |
| Reference file path | `reference/session-tracker-reference.html`, with the `_Global Assets` copy treated as conditional | `CoWork/_Global Assets/session-tracker-reference.html` | **`CoWork/_Global Assets/`.** Three other documents and project memory agree, and the copy bundled in the skill folder lags |

**Four operational details live only in the template and should be harvested into the skill before the template is retired.** They are recorded here so they are not lost: a brand new tracker has no `pages` row yet and needs an empty row inserted for the path first, or the copy-across updates nothing; staging goes into `pages_upload` under a session-unique path with an md5 verify after every block, then one guarded update into `pages` so the publish trigger fires once; rows must allow `max-height:900px` or long step lists get clipped; and anything left amber must already exist as a row in the project's `to-dos.xlsx`, or it is lost the moment he closes the tab.

### The five columns, in this order

| # | Column | What goes in it |
|---|---|---|
| 1 | **Traffic light** | One 13px dot in a 34px column. The fastest read on the page. Green `#1e8e5a` done, amber `#e08b1f` awaiting Scott, red `#c0453b` not started. It must agree with the status pill next to it |
| 2 | **Input / Task** | The request, hyperlinked to where Scott can review it: a live page, a repo file, an on-disk file via a `computer://` link, or a pinned artifact. Every row is hyperlinked. A one-line grey description sits underneath, explaining rather than restating the label |
| 3 | **Status** | A colored pill: Live or Done (green), Built (blue), Blocked (red), Awaiting you (amber) |
| 4 | **Your call** | A Got It button on finished rows, which files that item into the day's saved session content and drops it off the list. Yes and No buttons on decision rows. Every row also gets an optional note field |
| 5 | **What you do next** | The exact next action plus a rough minute estimate in a small grey pill. Three states: **Needs Scott** (amber tint, amber left border, a bold `YOUR MOVE` label, written as numbered click-by-click steps naming every button and field, with a one-line lead above explaining what the thing even is), **Nothing to do** (plain grey, and "Nothing." goes lighter still), and **Decision rows** (plain text saying what Yes means and what No means) |

Under the intro line, always render the legend and an italic grey `As of <Month> <day>` line.

### Two tables

- **Work this session.** Everything that happened, done and undone. The header counts what is left.
- **Your call, decisions.** Open questions only, with Yes and No. Never more than three or four. If there are more, Claude is asking Scott to do its thinking.

At the bottom, an always-visible read-only box that compiles every choice and note as he taps, so his answers survive a sync failure. This is required, not optional: the clipboard API is blocked in the artifact sandbox.

### The rules for writing the rows

- One tracker per chat, never one global file. Slug is `<yyyy-mm-dd>-<two to four word topic>`, lowercase and hyphenated, derived from what the conversation was actually about. Example: `2026-08-15-all-todos-publishing`.
- `SLUG` inside the file must match the filename stem, every row's `item` carries it as a prefix, and every read filters on it. Without that, one night's answers clear another night's rows.
- Copy `session-tracker-reference.html` and change only the rows. Do not restyle it, do not rebuild it, do not improve the layout. Every redesign costs Scott a re-read of a page he already knows how to scan.
- Written for a man reading it cold at 6am with no memory of the conversation. Lead with the outcome, not the task.
- Plain language. Name buttons and fields exactly as they appear on screen. If a step involves a menu, say which menu.
- Never an em-dash. Comma or period.
- Own mistakes in the row itself, in the description, not in a footnote. If something was published wrong, say so and say what it cost.
- A green row that needs nothing says "Nothing." rather than inventing busywork.
- Do not pad. If the session did four things, the tracker has four rows.
- Anything left amber must already be a row in `to-dos.xlsx`.

### The persistence layer

| Table | Columns | What it is for |
|---|---|---|
| `session_trackers` | `slug` (pk), `title`, `subtitle`, `day`, `url`, `project`, `open_count`, `created_at`, `updated_at` | The registry the index reads. `url` is the full github.io address. `open_count` is amber work rows plus decisions. An unregistered tracker is invisible |
| `session_content` | `day`, `item`, `label`, `session`, `saved_at` | A Got It files the row here and hides it. On load, filter by `session` and today's `day` |
| `tracker` | `item` (pk), `label`, `choice`, `note`, `session`, `updated_at` | Yes and No answers, and notes. `item` carries the slug, so it is globally unique on its own |

Client line: `window.supabase.createClient('https://arnjntspmrhigodlssbn.supabase.co', <anon key from the reference file>)`. Show a sync chip: "saved. Claude can see it" on success, "offline: copy the box below" on failure.

Reading his answers back: `select item, label, choice, note, updated_at from public.tracker where session = '<slug>'`. Act on each choice and note, then update the tracker.

### Pre-delivery checklist

1. Slug picked, and every item key carries it as a prefix.
2. Row upserted into `session_trackers`, with the full github.io URL.
3. Zero em-dashes in the file.
4. Every row hyperlinked, and every link resolves.
5. Every row has a traffic light, and it matches the status pill.
6. Amber rows have numbered steps, not a vague instruction.
7. Render it and look at it before sending.
8. Give Scott the direct link to this tracker, not just the index.

### Style tokens

Arial or Helvetica throughout. `--ink:#20242b`, `--muted:#6b7280`, `--line:#e7e9ee`, `--bg:#fbfbfa`, `--card:#fff`, `--accent:#3f6f8f`, `--hub:#2f5a74`, `--green:#1e8e5a`, `--blue:#3f6f8f`, `--red:#c0453b`, `--amber:#c68a2e`. Corner radius 14px on tables, 8px on buttons.

---

## Doc header template

Every document in this library opens with the same five-line block, so a reader can tell in ten seconds whether this is the file they want and whether to trust it. Copy this into any new document.

```markdown
# [Title, plain and descriptive, no colon-subtitle cleverness]

**What this is:** [one line, what the document contains].

**Read this when:** [one line, the situation that sends someone here].

**Last verified:** [YYYY-MM-DD], [how: which files were read, which queries were run, which live pages were fetched. Name them. "Reviewed" is not a method].

**Supersedes:** [comma separated list of the old filenames this replaces, or "Nothing, this is new"].

---

[First section. No preamble, no restating the header.]

*As of [Month Day with ordinal] · all times EST*
```

Rules that go with it:

- **"Last verified" states the method, not just the date.** A date with no method is a claim, not a verification. Name the files, the queries, or the URLs. Anything measured carries the date it was measured.
- **"Supersedes" is a list of filenames,** so a reader who finds an old file knows it is dead. Say "Nothing, this is new" where that is true rather than leaving the line off.
- **Numbered filenames** (`00-`, `01-`, and so on) set the reading order. Cross-reference siblings by filename in bold, not by a bare link.
- **The last line is the date stamp,** italic, using the Eastern date. This is the house rule that eleven of the fifteen files reviewed on Aug 16, 2026 were breaking.

*As of August 16th · all times EST*

---

## How to re-verify this document

These templates are copies, so the check is that they still match what the executable versions do.

```bash
# The two templates with an executable counterpart. Diff the shape, not the wording.
sed -n '/Session tracker template/,/^## /p' CoWork/_Docs/07-Templates.md
grep -n "column" "CoWork/Claude Skills Backup/session-tracker.md" | head -40

# The new project checklist against the skill that executes it.
grep -n "^[0-9]*\." "CoWork/Claude Skills Backup/new-project.md"
```

Then confirm the doc header template here still matches the required shape in **09-Governance-and-Doc-Rules.md** section 3. If the two ever disagree, 09 is the rule and this file is the copy.

*As of August 16th, all times EST*
