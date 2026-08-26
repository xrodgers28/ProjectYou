# Product Overview

**What this is:** The single inventory of the CoWork / ProjectYou system: what it is, what it stands for, every page that exists, every module that carries behavior, and every data source that feeds it.

**Read this when:** You need to know whether something exists, what it does, and where it lives, before you build, document or claim anything about it.

**Last verified:** 2026-08-16, against three live sources: `nav-config.js` in the read-only site clone at `/tmp/py`, the file list of that clone, and the `pages` table plus feed tables in Supabase project `arnjntspmrhigodlssbn`. Every "Live" in the page inventory means a file that actually exists and renders, not a file a document once promised. Row counts in the connector table are query results from the same date. Re-verification commands are at the bottom.

**Updated 2026-08-25:** section 6 gained the iPhone calendar feed and its operating conditions, written from the live behaviour of the shortcut and the ingest function on the day the feed first worked. The row count is a query against `calendar_events` filtered on `source = 'phone'`.

**Supersedes:** `CoWork Operating System - Feature Set.md`, `CoWork-Project-Brief.md`, `CoWork-Project-Instructions.md`, `Project YOU - Description.md`, `Project YOU - Project Brief.md`, `Project YOU - Project Instructions.md`, `Project YOU - Knowledge Base.md`, `Habit Building Cue Cards - Name Options.md`, `Todays-Tasks-Project-Brief.md`, `Todays-Tasks-Project-Instructions.md`, `Todays-Tasks-Feature-Set.md`, `Todays-Tasks-TimeWheel-How-It-Works.md`, `Social Well-Being - Overview.md`, `AI-Intelligence-How-It-Works.md`, `AI-Intelligence-Scan-2026-08-09.md`, `Atomic-Habits-Module-Handoff.md`

---

## 1. What this is

A personal operating system built on top of Claude that runs every project the same way: capture ideas, route them to the right place, do the work to a fixed standard, measure the time, and never lose anything because it all lives in real files. The flagship thing it runs is Project YOU, "a gamified operating manual that turns your life goals into an actionable program." Project YOU began after a flat 50th birthday and a sense of living on auto-pilot, and it is organized around the Clarity Compass: seven sections of well-being (Physical Health, Environmental Health, Social Well-Being, Recreational Health, Sense of Purpose, Mental Fitness, Emotional Health), each with its own habits, cards and trackers. On top of that sits a Quantified Self layer that logs what actually happened, because "your data becomes your coach."

### The naming, settled

| Name | What it means |
|---|---|
| **CoWork** | The operating layer and the control room. The project folder, the working standards, the skills, the rituals, the routing rules. It is about the interface itself, not the work of any one project. |
| **ProjectYou** (also written Project YOU) | The web app CoWork runs. A multi-page site on GitHub Pages behind one login, backed by Supabase. The name is always "Project YOU," never "Project U." |
| **Today's Tasks** | The board inside ProjectYou. It is the site home page, `index.html`. The nav labels it "Todays Tasks" with no apostrophe. |
| **CrushingIt** | A dead name. It was the board's name before Aug 11, 2026 and it is not fully gone: 45 occurrences survive across seven live pages (`ai.html`, `compass.html`, `habit-modules.html`, `james-clear.html`, `library.html`, `qs-log.html`, `quotes.html`), mostly in login copy, plus the repo README. If you see it, it means Today's Tasks. |
| **SER** | Scott's own initials-style label for the operating system. It appears in page titles (`Automated Tracking · SER`, `Docs Library · SER Operating System`) and in the system spec filename. Same system, older skin. |

A structural note worth stating plainly: Today's Tasks is both a top-level CoWork project with its own folder, and a single page inside another project's website. That ambiguity is real, not an error in the docs. Treat CoWork as the folder estate and ProjectYou as the deployed product.

---

## 2. Principles

These are the rules the system is actually built on, each with the reason it exists.

**The two-bucket rule.** Every rule, idea or task is either global (applies to every project) or project specific, and it is filed accordingly the moment it is captured. Without the split, a preference stated once in one chat quietly governs one project and no others, and nobody can tell which rules are universal.

**Capture then route.** Capture happens verbatim and instantly, into an inbox. Routing is a second, separate step. The original design note is still the sharpest statement of why: "The capture step works well. The step between capture and an organized list is the failure." A single walk can produce thirty items, so anything that slows capture down to make filing easier kills the whole pipeline. See 05-Capture-Pipeline.md.

**Nothing files itself.** Every Drafts capture stops in the Staging Area, and nothing lands on a board section until Scott approves it. Claude proposes a destination and a confidence, so he is confirming a suggestion, not sorting a blank pile. This reversed an earlier "high confidence auto-files" design after both capture paths were caught skipping the gate.

**One log, many dashboards.** A tracker writes once, to one canonical place, and every page reads from there. `qs_log` is the habit and activity log, `todos` is the board, `health_metrics` is the health feed, `checkins` is the location feed. When two pages compute the same statistic independently they drift, and they have: the Coffee Days page and `v_coffee_stats` disagreed on which 5-day streak to show until the page was made to read the view.

**Historical only.** The system tracks what has already happened. No scheduled, planned or predicted data anywhere. The system is a record of an actual life, not a planner, and intent is not evidence. This rule is retroactive and it decides which data sources are worth building: it dropped TripIt, it chose Flighty's local history database over its calendar export, and it is why Swarm check-ins fit perfectly.

**Nothing lives only in a chat.** A decision, a number or a design that exists only in a conversation is gone the moment the tab closes. Durable facts go to project memory, working rules go to the skills and `/preferences.md`, and every `[wrap]` publishes a session tracker page so the next morning has something to read.

**Recoverable from files.** Everything is written to real files on disk and to a database that can be re-read. A project survives even if its tile disappears, and skills are backed up as files. The corollary that bites in practice: Claude cannot save a skill, it can only hand the file over, so a skill reported as "delivered" is not the same as "saved."

---

## 3. The twelve core feature sets

These are the spine of the system, kept in their original order. The "Today" column says what is actually true now.

| # | Feature set | Today |
|---|---|---|
| 1 | **Project workspaces.** Every project is a self-contained folder with its own instructions, brief, to-dos, trackers and memory, in a standard structure. | Unchanged and still the model. CoWork is the root; TreadWell, Mission 193, Project YOU and Today's Tasks are nested projects. |
| 2 | **Two-bucket rule routing.** Every rule, idea or task is captured, then routed to global or project specific. `Interface-Directions.md` is the capture-and-route inbox. | Unchanged for thoughts about the system. For tasks, routing now happens in the Staging Area against live board sections, not in a markdown file. |
| 3 | **Standing working standards.** One master skill, `how-we-work-rules`, holds the universal standards. Always on, every project. | Live, plus a web mirror at `how-we-work.html`. Design work now follows mock or prototype first, then build (set Aug 12). No em-dashes is a global writing rule. |
| 4 | **Session commands and rituals.** `[wrap]`, `[SC]`, `/morning`, `[new project]`. | All live, plus `hardpull` for an instant Drafts sweep. `[wrap]` now also publishes a session tracker page as step 2. See section 8 and 06-How-We-Work.md. |
| 5 | **Session-start safeguards.** Each new chat confirms which project it is in, tags the first reply, and stamps the location as work goes. | Unchanged. Concurrent sessions are now the bigger hazard: several chats write the same file and the same memory, so merge, never overwrite. |
| 6 | **Time and measurement (the Quantified Self layer).** A global time tracker rolls hours up by project; per-project hours settle at wrap. | Split in two. Project hours still settle at wrap into the xlsx tracker. Life measurement moved into Supabase and grew far past the original plan: `qs_log`, `health_metrics`, `checkins`, `time_log`, the QS Dashboard and four connectors. |
| 7 | **To-do system.** Global and per-project to-do lists are the record of truth, click not type, every task carries a time estimate, estimate versus actual is tracked, duplicates flagged not silently added. | The record of truth for the board is now Supabase `public.todos`, not any file on disk. The xlsx lists survive for CoWork-level and per-project work. Estimate versus actual is live: `est_minutes` and `actual_minutes` on the board, on the Staging Area, and as accuracy scoring in `staging_events`. |
| 8 | **Accomplishment logging.** Dated accomplishments per project, one row per real change, separate from hours. | Live, via the `log-accomplishments` skill. |
| 9 | **Habit and coaching layer.** Identity-based habits, the four laws, habit stacking, the two-minute rule, habit tracking, plus the time wheel. | The methodology is still the frame. What shipped is concrete: the Cue Cards board with a daily meter and a streak, four ticking habit modules, a nightly habit reset, and the Time Bandit Wheel. Note that "Atomic Habits" now names three different things (see section 6). |
| 10 | **Interactive input tools.** Decisions served as tick-boxes and buttons with an always-visible copy-back field. Click, do not type. | Still the rule for artifacts. On the site it is superseded by real pages: the board, the Staging Area and the Midnight Run control page take input directly and save to the database, so there is nothing to copy back. |
| 11 | **Cross-surface memory and preferences.** Durable facts and behavior rules live in memory and stay in sync with the master skill. | Live and now load-bearing: 39 memory files, and they are the only record of everything shipped after Aug 12. |
| 12 | **Recoverability guarantee.** Everything is written to real files. Nothing important lives only in a conversation. | Holds, with one qualification. The site's real backup is the `pages` table plus the GitHub repo, and the two can disagree. GitHub is canonical; read 02-Architecture.md and 04-Runbook-Build-and-Deploy.md before editing any page. |

---

## 4. The page inventory

Ground rules for reading this table:

- A page can exist as a file in the repo, or as a row in the `pages` table, or both. The repo is what GitHub Pages serves, so **the repo file is what a person sees**.
- The `pages` table is the publish store. A GitHub Action decompresses `gzb64` into repo files every five minutes. A row with no content is skipped by the Action, so an **empty `pages` row does not mean a dead page**: seven rows are empty while their repo files are live and current.
- **Status** here means: `Live` = the file exists in the repo and is reachable from the nav. `Not in nav` = the file exists and works but has no nav entry, usually because it is reached from a hub page instead. `Empty shell` = nothing to serve.
- Counts on 2026-08-16: 48 `.html` files in the repo, 45 rows in `pages` (42 of them `.html`), 7 rows with no content, 1 row with no matching repo file.

### To Do List

| File | What it is for | Status |
|---|---|---|
| `index.html` | Today's Tasks, the board and the site home. Also holds the Time Bandit Wheel at `#wheel`. v5.30. | Live |
| `staging-area.html` | The review gate. Drafts captures land here with a proposed destination and a confidence dot. v0.5. | Live |
| `all-todos.html` | The cross-section working list: sessions, fixes, rules, the Midnight Run queue, the Archive. v2.18. | Live |

### Habit Modules

| File | What it is for | Status |
|---|---|---|
| `habit-modules.html` | The Cue Cards board, titled "1% Better Every Day." Five cards, a daily x/4 meter and the streak badge. It is the hub for every card module. v3.5. | Live |

### Quantified Self

| File | What it is for | Status |
|---|---|---|
| `qs-dashboard.html` | The QS hub. Six tiles linking to the Wheel, Habits Tracker, Clarity Compass, Life Snapshot, Where I've Been and Coffee Days. Its tile statistics are hardcoded. v2.2. | Live |
| `where-ive-been.html` | Travel. Four panels: Countries map, Places (Swarm), Trips (empty), Someday (mirrors Future Travel). v1.4. | Live |
| `coffee-days.html` | Every day with a coffee, back to 2009, from check-ins plus manual ticks. v1.0. | Live |

### Editors

| File | What it is for | Status |
|---|---|---|
| `daily-template.html` | Daily Habits. Edits the `daily_template` rows that reseed the board each morning. v2.2. | Live |
| `midnight-run-v2.html` | Midnight Run control center. Three planning lanes plus a Finished/Shipped shade. v4.0. **No `pages` row: it exists only in the repo.** | Live |
| `style-guide.html` | The color, type and component reference for the whole site. Its `pages` row is empty. v1.0. | Live |

### Operating System

| File | What it is for | Status |
|---|---|---|
| `build.html` | Components. Every piece of the system at a glance, marked live or in progress. v1.1. | Live |
| `automated-tracking.html` | Every data source and roadmap app, with green / blue / no dot showing what actually feeds data. v1.6. | Live |
| `maps.html` | Maps overview, the landing page for the five map views below. v1.5. | Live |
| `dfd.html` | Data Flow Diagram, the conceptual view. v1.0. | Live |
| `blueprint.html` | Knowledge Graph, static. v1.1. | Live |
| `knowledge-graph.html` | Interactive Knowledge Graph. | Live |
| `architecture-map.html` | Architecture Map, how the system is wired end to end. v1.0. | Live |
| `data-flow-map.html` | Data Flow Map, the literal wiring. Reconciled nightly against the database. v1.5. | Live |
| `mission.html` | Mission Control. The page-of-pages hub, and the only route to most of the not-in-nav pages. Its `pages` row is empty. v1.3. | Live |
| `library.html` | Docs Library. 27 OS docs in six categories, rendered client side. v1. | Live |

### Exists but not in the nav

Most of these are deliberate: they hang off a hub page rather than the top nav.

| File | What it is for | Reached from | Status |
|---|---|---|---|
| `ai.html` | AI Insights. The original daily card deck and the design model every other module copies. v1.7. | Cue Cards board | Not in nav |
| `james-clear.html` | Atomic Habits. Daily blend of 2 ideas, 1 quote, 1 question from the 3-2-1 archive. v1.5. | Cue Cards board | Not in nav |
| `quotes.html` | Things Worth Knowing, also called Clever Phrases. v1.4. | Cue Cards board | Not in nav |
| `compass.html` | Compass. One reflection question a day, tagged by category and minutes. This is the Year Compass daily-questions design, built. v1.4. | Cue Cards board | Not in nav |
| `takeaways.html` | Takeaways. 12 cards, 58 tiles, one tile at a time. Browse only, no tick. v1.3. | Cue Cards board (first card) | Not in nav |
| `qs-log.html` | Habits Tracker. The year-in-habits dot grid. v1.1 delivered, v1.0 in repo. **No `pages` row.** | QS Dashboard | Not in nav |
| `qs-wheel.html` | Clarity Compass. Static seven-section wheel image plus the daily template. Its interactive `draw()` is dead code. Empty `pages` row. v1.3. | QS Dashboard | Not in nav |
| `life-snapshot.html` | Life Snapshot. A life in weeks, 52 across, one year per row. v1.0. | QS Dashboard | Not in nav |
| `movies.html` | Movie List. Empty `pages` row. v1.0. | Staging Area, Mission Control | Not in nav |
| `connections.html` | Social. People logged or planned to see. Also the Friends Visit destination. v1.0. | Staging Area, Mission Control | Not in nav |
| `future-travel.html` | Future Travel. Destinations and bucket list, mirrored by the Where I've Been Someday tab. v1.1. | Staging Area, Mission Control | Not in nav |
| `ai-tools.html` | The AI platform database the AI Insights platform cards draw from. v1.0. | Mission Control | Not in nav |
| `cheat-sheet.html` | The Claude commands and skills card. v1.1. | Mission Control | Not in nav |
| `how-we-work.html` | The working standards, on the web. v1.5. **No `pages` row.** | Direct link only | Not in nav |
| `qs-health.html` | QS Data Health. Whether each tracker is still logging on cadence. **No `pages` row, no version marker.** | Direct link only | Not in nav |
| `reconciliation.html` | The nightly reconciliation manifest. v1. | Docs Library | Not in nav |
| `session-tracker.html` | The index of session trackers. | Direct link | Not in nav |
| `session-tracker-2026-08-15-*.html`, `session-tracker-2026-08-16-*.html` | Eight published per-session tracker pages (All ToDos publishing, Takeaways cue cards, Apple Health import, Coffee Days, Someday tab redesign, Swarm connector, Takeaways card restore, Time Bandit Wheel). | Session tracker index | Not in nav |
| `midnight-run.html` | The earlier Midnight Run control page, superseded by `midnight-run-v2.html`. **No `pages` row.** | Legacy links | Not in nav |
| `all-todos-v215.html` | A stale copy of All ToDos v2.15. **No `pages` row.** Dead file, safe to remove. | Nothing | Not in nav |
| `tracker.html` | A 569-byte redirect stub titled "Moved to All ToDos." **No `pages` row.** | Legacy links | Not in nav |
| `morning-update.html` | A `pages` row with no content and **no repo file**. Nothing is served. | Nothing | Empty shell |

Supporting files that are not pages: `nav-config.js` (the nav source of truth), `navpatch.js` (the shared layer that rewrites the nav on every page), `nav.html` (a legacy single-nav block used by the `site` edge function only), `world-countries.js` (130 KB of map geometry, uploaded by hand), `publish.yml` (the publish Action), plus `project-you-logo.png`, `scott-avatar.jpg`, `clarity-compass-wheel.png` and `assets/takeaways/` (58 tiles).

---

## 5. The modules in detail

### Today's Tasks board and its sections

The board is one master to-do list organized by the seven Clarity Compass domains, plus operational sections. The day flips at 3:00 AM local, and the first open after that runs the daily rollover: promote Tomorrow's Core into Core, archive finished tasks, reset habits, reseed Tomorrow from the editable `daily_template`. New Core items always prepend. Some sections are omnipresent and render even when empty (Tomorrow's Core To-Dos, Waiting On, Asa topics, Carson College) because a hidden empty section reads as a missing feature. Live sections on 2026-08-16, with row counts: `✓ Completed Tasks` 76, `Core To-Dos` 28, `🧩 New projects to build` 11, `After Core` 10, `🗑️ Dismissed` 9, `Social Well-Being` 7, `Tomorrow's Core To-Dos` 6, `💬 Asa topics` 6, `Emotional Health` 6, `Sense of Purpose (Ikigai)` 5, `Work/Amazon` 4, `📥 Inbox · uncategorized captures` 3, and one row each in `Environmental Health`, `Recreational Health`, `Scotts Uniqueness`, `Tracking`, `Physical Health`, `🎓 Carson College` and `Mental Fitness`. The `🅿️ Parking Lot` named in older docs has no rows today. Habit rows carry three boxes: est, act, and a dashed log box for the QS value.

### All ToDos and the Archive

The cross-section working list, and where session work is managed. Archive is the single completion word: the Done button was renamed and Got It was removed because it duplicated it. Archiving sets `done`, `done_at` and `archived_at`, moves the row out of the live list and offers Undo for ten seconds. Nothing is destroyed; hard delete is a separate `×` path writing `deleted_at`. Every task also carries 🔧 Needs a fix (files a `Fix:` row under `🔧 Fixes to make`), 📏 Make it a rule (writes a `rule_candidates` row for a later yes or no), and ⚙️ Send to Midnight Run. This page uses `session_todos`, not `todos`, which is a real schema fork: see 03-Data-Model.md.

### The Staging Area

The mandatory gate between capture and the board, and the only place a destination is chosen. Rows are `todos` rows in section `📥 Inbox · uncategorized captures` carrying `stage_guess`, `stage_conf` and `staging_note`. Each row shows a cleaned headline, one plain read line, a 🍿 Popcorn link revealing the raw dictation, a comment box, a destination dropdown read live from the board's real sections, and Approve / Park it / Dismiss. Confidence dots are a stoplight and split the list into "Scott to review" and "Looks clear," with an Approve all sweep on the clear group. Approving a Learning module destination does not just relabel: it inserts into that module's own table (`movies`, `quotes`, `future_travel`, `connections`) and deletes the staged row. Every decision writes a `staging_events` row, which drives the real "% approved as-is" sparkline and estimate accuracy. Both scores stay blank until there are enough decisions rather than showing a fake number. 23 events so far.

### The Time Bandit Wheel and its two rings

The wheel is a view of the day drawn as a clock, not a second list. It lives inside `index.html` at `#wheel`, waking day 7am to 11pm. **The two rings encode different things on purpose and should not be reconciled.** The outer thin ring is actual time against the clock: each completed habit or activity drawn at the hour it happened, arc length set by `actual_minutes`. The inner donut pie is where the day went in proportions only, across seven day categories (Eating, Family, Seeing People, Personal, Amazon, Other tasks, Unaccounted) plus Habits. The conflict rule is the fragile part: each category's value is either the typed override or the sum of its ticked tasks, never both added, or a meal gets counted twice. The center reads minutes divided by ten out of 96, so a two-minute habit moves it by 0.2 and Take Medicine, which has no `actual_minutes`, never moves it at all. Hovering any wedge or table row lights everything sharing a key. The wheel draws today only; past-day navigation is blocked on data, not code, because the nightly reset wipes habit minutes before anything snapshots them. It is called the Time Bandit Wheel; "Habit Bandit" in old docs is the same object, and HABIT BANDIT survives as the board's habit subsection label.

### Habits and cue cards

Habits are one permanent row each in `todos` with `is_habit` true. A pg_cron job, `reset_daily_habits`, clears them at 4am ET nightly, and a trigger writes each tick into `qs_log` against the tick date in Eastern time. Habit history exists only in `qs_log`; `todos` holds one row per habit and is wiped nightly. The Cue Cards board is the daily surface: five cards, four of them tickable (AI Insights, Atomic Habits, Things Worth Knowing, Compass) plus browse-only Takeaways, a x/4 meter, and a streak badge. The streak rule changed inside 24 hours and the later one is live: **a day counts when any card was ticked**, which currently reads 6. The earlier all-four rule could never exceed 1 because Atomic Habits had only ever been ticked once. Ticking a card writes `done`, `done_at` and `actual_minutes` (default 10) so it lands on the wheel's outer ring. Renaming a card, a module page or a tracker on one side only breaks the streak silently; the habit-name contract is in 03-Data-Model.md.

### The Atomic Habits and James Clear modules

One page, `james-clear.html`, and three unrelated meanings of the phrase to keep straight. The **methodology** (identity-based habits, the four laws, habit stacking, the two-minute rule) is the frame for feature set 9. The **daily mantra** on the wheel is a rotating line. The **module** is a card deck whose display name is "Atomic Habits" and whose content is James Clear's "3-2-1 Thursday" newsletter, stored in `jc_321`: 57 issues, 342 cards. The filename stays `james-clear.html` because the nav and live site already point at it; renaming it to `atomic-habits.html` was tried and reverted. Today's mix is a deterministic-by-date blend of 2 ideas, 1 quote and 1 question drawn from the whole archive, with a searchable browse pool and a Send to Clever Phrases action on quote cards.

### Takeaways

The first card on the Cue Cards board and the only real cue-card library that exists: 12 takeaway cards, 58 tiles, cut from Scott's "Gold Standard Master Cue Cards Library" PDF. Three layout rules came out of building it and apply to every future card: one tile at a time, the tile is the card with no wrapper chrome, and use the AI Insights navigation at the AI Insights size (344px wide). It is deliberately browse only, outside the module set, so it does not create a habit row, does not move the meter and does not affect the streak. Adding a fifth ticking module would change what the streak number means.

### The Clarity Compass and the Year Compass questions

Two things share the word. The **Clarity Compass** is the program's seven-sided wheel of well-being sections; on the site it is `qs-wheel.html`, and what renders there is a static image, not a live chart. The **Compass module** at `compass.html` is the Year Compass daily-questions design, built: it serves one reflection question a day from `compass_questions`, tagged with a category and a 5, 10 or 20 minute estimate, and logs answers to `compass_log`. Old docs describe this as designed but unbuilt. It exists, with 8 questions loaded and 8 answered, so the bank is the constraint, not the engine. The sub-question ladder and the Parking Lot skip from the design doc are not visible in the shipped page.

### Social Well-Being and Connections

Social Well-Being is one of the seven Clarity Compass sections and also a board section with 7 open rows. Completing a row in that section fires a trigger that writes into both `connections` and `daily_completed`. `connections.html` is the page: 3 rows so far. The Staging Area's "👋 Friends Visit" destination writes to the same `connections` table with `happened_on` deliberately NULL, because a Friends Visit is a plan and not a logged event. Friends Visit and Connections are therefore the same store under two labels, not two features. This is also the thinnest-fed part of the system: research confirmed Google Calendar is not the easy win it looks like (one genuine multi-attendee event in six weeks), so Gmail sent-metadata is the candidate. The `People I Want to Meet.md` list and the `Connection - Journal.md` file still live as plain markdown in the Project YOU folder; the journal holds sensitive personal content and conflicts with the privacy rule that says such notes live only in the RLS-locked database. That is a decision for Scott, not an edit.

### Where I've Been

The travel page, four panels. **Countries** is a world map driven by `visited_countries`, 51 rows: 31 proved by Swarm check-ins and 20 still unverified TreadWell imports, which the page says on its face. **Places** is live from Swarm, reading four small aggregate views rather than the 8,819 raw rows. **Trips** is built and empty, waiting on a flight-history source. **Someday** is a full mirror of `future-travel.html` on the same table, so the two pages stay in sync. Known gap: four imported territories (Guadeloupe, Martinique, French Polynesia, Kiribati) have no outline in the map geometry and no dot coordinates, so the counter reads higher than the map draws.

### Coffee Days

Built end to end in one session from the question "can I sync my credit card statements or Monarch to count coffee days?" The answer, worth keeping because it generalizes: a card charge is not a consumption day, and Monarch has no public API. The tracker is check-in data only, zero financial records touched. A single SQL function, `is_coffee_checkin()`, defines coffee-ness once and every view and trigger calls it. 588 distinct coffee days from Aug 2009 to Aug 2026, 622 check-ins, 175 venues, longest run 5 days, Friday is the coffee day. A day can hold both a `swarm` row and a `habit-bandit` row in `qs_log`, so `v_coffee_days` is the canonical answer and `qs_log` must never be counted directly. Stated limit: Swarm caught roughly 18 days in the last 90, so the history is excellent and the completeness is poor.

### The QS Dashboard

Six tiles: Time Bandit Wheel, Habits Tracker, Clarity Compass, Life Snapshot, Where I've Been, Coffee Days. It is a launcher, and **every statistic on its tiles is hardcoded**, including a "142-day streak" and "41 / 193 countries" that the database now contradicts (the streak reads 6 and `visited_countries` holds 51). Wiring the tiles live is an open decision in 08-Roadmap-and-Open-Decisions.md.

### Midnight Run and Ready to Code

The overnight worklist and its control page, `midnight-run-v2.html`. Items are `session_todos` rows with `lane='queue_run'`, sent there by the ⚙️ Send to Midnight Run button on any All ToDos task. The page has three planning lanes plus a shade, and the lane a card sits in **is** its `run_status`: `⚡ Code Now` (queued), `🌙 After Midnight` (overnight), `🅿️ Parking Lot` (parked), then `✓ Finished / Shipped`. Cards move by drag, arrows or chips, with one continuous run order down the whole page. Two hard facts about how it really runs. First, **scheduled sessions have no Supabase connector**, confirmed by test fire, so the nightly autonomous run wrote nothing on every attempt and could not even signal its own failure. Second, Scott does not want to pay for third-party services, so the paid edge-function worker was replaced with an inert v2 returning 410 and `ANTHROPIC_API_KEY` was never set. What works today is the live catch-up: the page sets `code_status='requested'` from the browser for free, and an interactive session runs the queue on the words "run the Midnight Run queue."

### Mission Control

The page-of-pages hub at `mission.html`. It is the only route to most of the not-in-nav pages, which makes it more load-bearing than its nav position suggests: `ai-tools.html`, `cheat-sheet.html`, `life-snapshot.html`, `movies.html`, `connections.html`, `future-travel.html`, `qs-log.html`, `qs-wheel.html`, `quotes.html`, `compass.html`, `tracker.html` and `style-guide.html` all hang off it. Its `pages` row is empty, so it is served purely from the repo.

### The AI Intelligence card deck

`ai.html`, "AI Insights," backed by `ai_cards` (42 items) with favorites mirrored into `favorites`. It is the design model every other module copies: the "Daily Blend" anatomy of datestamp, accent kicker, big headline, italic source line, favorite star, and a "Keep what mattered" review-and-save close with Mark done and Log time. Categories are a fixed set: Ways of Working, Thought-Leader Insights, Industry Insights, Platforms & Tools. The keep-or-discard loop is the contract: nothing enters the database without a yes. Platform cards want a logo, a screenshot of the tool in use, a name and one verified line of definition, with anything unconfirmed flagged "to verify." The companion database of platforms is `ai-tools.html`. The overnight web scan and the dedicated AI-inspiration email described in the old doc were never built, and the `ai-daily-card.xlsx` it names is dead.

### Clever Phrases and Movies

`quotes.html`, titled "Things Worth Knowing," is the Clever Phrases deck: 60 quotes, the same card engine, its own favorites table, and it is one of the four ticking habit modules under the board name `Clever Phrases`. Quote cards elsewhere in the system can push into it. `movies.html` is the Movie List, 3 rows, fed by the Staging Area's 🎬 Movie List destination with kind and status defaults. Both are small on purpose: they are capture destinations first and browsing surfaces second.

### Named in the old docs but not built

Say this plainly rather than describing these as if they exist.

- **The Habit Building Cue Cards deck as specified**, 5 to 20 four-part cards inside each of the seven sections. What exists is the Cue Cards board and the 12-card Takeaways library. The naming brainstorm file is dead; the name was settled Aug 9, 2026.
- **The identity-based habit tables**, the nine-column schema from the source deck.
- **The nine annual dot-grid QS trackers** (Physical/Cardio, Learning, Meditation, Cognitive Focus, Safaris, Social Interactions, Sense of Purpose, Preventative Health, Emotional Health). Only the Habits Tracker grid at `qs-log.html` exists.
- **The 10 Year Future Cast LifeMap.** `life-snapshot.html` is a life-in-weeks grid, a different thing.
- **The Relationship Map** and the concentric circles (inner 5, middle 15, affinity, outer).
- **Ground Crew, Pilots, the Pilot's Log Book, Footprints of Change, the 193-countries page.** Concepts from the deck, not features.
- **Talk-to-Capture**, the trigger-word voice surface routing straight to four tables. Specced Aug 12, never built, and superseded by the rule that everything stops in the Staging Area. Its `session_todos` schema still collides with `todos`; see 03-Data-Model.md.
- **The morning day-planner**, the north star where Today's Tasks proposes three ways to spend the day and Scott picks one.
- **A points or score gamification layer.**
- **The Trips panel** on Where I've Been: built, empty, awaiting a source.
- **A mindfulness bridge** from Apple Health into the Meditation habit. Decided, not built.

---

## 6. Connectors and data sources

Green means the source writes rows into Supabase on a schedule. A device that feeds a green app is itself green. Do not promote something to green because it has an MCP connector, a built backend, or because Scott is signed in.

| Source | Live | Rows produced | Feeds |
|---|---|---|---|
| **Drafts** (desktop bridge, `task-capture` skill) | Yes | `inbox` 43 | The Staging Area, then the board. The busiest capture path. Sweeps every 2 hours 7am to 11pm ET, or instantly on `hardpull`. Needs the desktop app online. |
| **Swarm / Foursquare** | Yes, since Aug 16 2026 | `checkins` 8,819, Apr 2009 to Aug 2026, 3,683 venues, 31 countries | Where I've Been Places panel, `visited_countries` (31 of 51 rows), Coffee Days (588 days, 622 coffee check-ins). Syncs 4x daily. |
| **Apple Health** via **Health Auto Export** | Yes, since Aug 16 2026 | `health_metrics` 16,826, last day 2026-08-15 | `health_feed_status`. No page consumes it yet. Backfilled to 2016. |
| **Apple Watch** | Yes, by the chain rule | The `source` label on 13,874 of those readings | Same. |
| **Apple Fitness** (active energy, exercise time) | Yes, by the chain rule | 3,111 readings | Same. |
| **Strava** | Yes | `qs_log` 15 rows, plus completed `todos` rows | The Time Bandit Wheel outer ring. Syncs every 2 hours, 7am to 9pm ET. Dedupes on the activity link. |
| **Habit ticks** (`habit-bandit`) | Internal, not an app | `qs_log` 33 | The streak, the Habits Tracker, the wheel. |
| **Waking Up** (mindful minutes) | Arriving, 1 reading | 1 | Nothing yet. The Meditation bridge is unbuilt. |
| **FITINDEX** (weight, body fat, lean mass) | No, allow-listed but silent | 0 | Nothing. One of six allow-listed metrics with zero rows ever; the likely cause is a Health Auto Export read permission. |
| **Your iPhone's Calendar app** (Shortcuts automation) | Yes, since Aug 25 2026 | `calendar_events`, 25 meetings across the first two days | The calendar column on Todays Tasks, the six-bucket day tally, and through it the Time Bandit Wheel and the YouMatics day history. Four pulls a day at 7, 11, 2 and 5. What has to be true for it to run is below. |
| **Google Calendar, Gmail, Google Drive, Supabase, 1Password, Claude in Chrome** | Authenticated, no data feed | 0 | Blue dots on the Automated Tracking page. Useful capabilities, not trackers. Note that Scott's Amazon and Google meetings DO reach the system, but through his iPhone's Calendar app above, not through this connector. |

Two facts that put live feeds at risk: **Strava standard API access now requires an active paid Strava subscription** (changed June 2026), so if the subscription lapses the 2-hourly sync stops, and the base URL moves to `api-v3.strava.com` in January 2027. And Apple forbids reading health data while the phone is locked, so the Apple pipe is reliable over a week and never to the minute. Design anything downstream as "latest known value."

### What has to be true for the calendar to feed itself

Four things, and only four.

1. **Your iPhone is on.** Not your Mac. The Mac has nothing to do with it and never did; it was only ever a comfortable place to edit the shortcut. The Mac can be shut in a bag in another country.
2. **Your phone has internet.** Wifi or cellular, either is fine. This is the one that matters on a plane.
3. **The Calendar app on your phone has the meetings in it.** Not the Calendar app being open, just the meetings having arrived. The phone quietly syncs with Amazon and Google in the background all day, and the shortcut reads whatever the phone has already downloaded. Outlook does not need to be installed or open. Nothing needs to be on screen.
4. **The phone is awake enough to run an automation.** This is the one that is not yet proven. Some iPhone automations run happily with the phone locked in a pocket, others want it unlocked. See the open item in `08-Roadmap-and-Open-Decisions.md`, section 4.

That is the whole list. Nothing needs to be open and Scott does not need to be at his desk.

**Flying without wifi.** The automation still fires and still reads the calendar perfectly. The send fails, because there is nowhere to send it. Nothing lands, and nothing breaks. The last good pull stays exactly as it was, and the "as of" stamp on the page turns amber once it is more than two hours old, so a glance tells you that you are looking at this morning rather than now. The next pull after landing catches up on its own, or Scott taps Refresh.

That protection is real and it was tested on Aug 25 2026. A pull came back nearly empty and the old code would have wiped the whole day. It no longer can.

**Flying with wifi.** Works normally, no difference.

**Looking at the page while offline.** That does not work. The page reads the day from the database every time it opens, so with no connection the column is empty. The to-do list has the same limitation, so this is nothing new.

<details>
<summary>The technical detail behind those four conditions</summary>

**Condition 1 and 3, why the Mac is irrelevant.** The feed is an iOS Shortcuts automation running `Find Calendar Events Where`, which reads EventKit on the device. EventKit returns whatever the device's own calendar database holds, which CalDAV and Exchange sync populate in the background. There is no desktop step anywhere in the chain, so nothing about macOS, iCal or Outlook affects it. The Mac appeared in the story only because the shortcut was edited there, and at one point that misled us: the desktop Calendar app did not hold all of Scott's calendars, which made the shortcut look broken when it was reading a different device.

**Condition 2, where the send goes.** The shortcut posts the assembled text to the `calpull` edge function at `https://arnjntspmrhigodlssbn.supabase.co/functions/v1/calpull`, which calls `calendar_ingest`. `calpull` is deployed with `verify_jwt` false and accepts the event lines as a raw request body, deliberately with no JSON key to pick, because that slot is what broke the shortcut twice. A GET on the same URL in any browser returns a plain-English pull status, which is the right way to check a pull rather than the stale result box inside Shortcuts.

**Condition 4, and what the 7am run is testing.** Four `Time of Day` automations exist, at 7, 11, 2 and 5. iOS decides on its own whether a given automation may run unattended. The Aug 26 2026 7am run is the first unattended test and the result belongs in 08.

**Why a failed send cannot damage a good day.** `calendar_ingest` used to hide every phone-sourced meeting on the day that was not in the incoming batch, so a partial pull declared the morning cancelled. It now tracks the earliest and latest time the pull actually covers, per day, and hides only inside that span:

```sql
update public.calendar_events e
   set hidden = true, updated_at = now()
 where e.source='phone' and e.hidden is not true
   and not (e.external_id = any(v_seen))
   and exists (select 1 from unnest(v_days, v_mins, v_maxs) as w(d, mn, mx)
                where w.d = e.date and e.start_time >= w.mn and e.start_time <= w.mx);
```

A pull that returns nothing covers no span, so it hides nothing.

**The two-hour amber stamp** is drawn by the calendar column from the newest `pulled_at` on the day's rows, so it measures when the phone last succeeded, not when the page last loaded.

**One known inefficiency, harmless today.** The shortcut sends each meeting roughly thirteen times, because the loop rebuilds the accumulating text on every pass. The database de-duplicates, so nothing is wrong in the data, but it must be tidied before the window is widened much past three days.

</details>

### Confirmed dead ends, verified Aug 15 to 16 2026

Do not research these again. Labcorp (no patient API, and info-blocking rules bind providers, not reference labs). Monarch (no public API; SimpleFIN Bridge at $15/yr is the tool if a bank feed is ever wanted). Google Maps Timeline (moved on-device, desktop killed; Dawarich is the replacement, not a supplement). Letterboxd (closed beta, explicitly declines personal and AI projects; use Trakt, which syncs out to it). Goodreads (API dead since Dec 2020). YouTube watch history (removed from the Data API in 2016). Fitbit Web API (sunsets Sept 2026) and Google Fit REST (deprecated). Elevate (no API, no export, no email; the company rebranded to The Mind Company, and a DSAR is the only route). Impulse (no API; note the brain-training one is brainimpulse.me, not impulse.app). Imprint (no API; milestone streak emails are the only bridge and the account looks lapsed since Dec 2025). Hello Habit. Be My Eyes. Upright Posture (no API, and HealthKit has no posture type). Sun Ally (no API; use Time in Daylight). Gondola (it just parses email, so parse the email directly). JetLovers (no API, and already migrated off). Pocket Casts (unofficial API has no listen timestamps). Apple Podcasts. LinkedIn. WhatsApp.

Two general findings worth more than any single entry. **Google Calendar is not the cheap Social Well-Being win**: a live check across six weeks found exactly one genuine multi-attendee event, so a dashboard built on attendee counts will look broken when it is merely accurate. And **when a consumer app has no API, look for a Mac app with a local SQLite store before concluding it is a dead end**: iMessage `chat.db`, `CallHistoryDB` and Flighty's `MainFlightyDatabase.db` are three of the strongest routes found, and none of them is an API.

---

## 7. The session rituals

One line each. The mechanics live in 06-How-We-Work.md.

| Ritual | What it does |
|---|---|
| `[wrap]` | Clean shutdown. Punch list, session tracker page (step 2, always, without being asked), hours settled, to-dos processed, accomplishments logged. |
| `[SC]` | Status check. Read-only snapshot of the current project: what is in progress, to-do counts, what got done today. Touches nothing. |
| `/morning` | The daily brief, rendered as a styled artifact. Calendar plus the day ahead. |
| `[new project]` | Project setup. Creates the standard folder structure, brief and instructions. |
| Session trackers | Five-column interactive status pages, published as `session-tracker-<slug>.html` and indexed at `session-tracker.html`. Nine rows in `session_trackers`, eight pages in the repo. Anything left amber must already be a to-do row. |
| `hardpull` | Fires the Drafts sweep immediately instead of waiting for the 2-hour schedule. "Pull everything" widens the window past today. |

---

## 8. How to re-verify this document

Every number and every status above is reproducible. Run these.

**Regenerate the nav groups and their targets**

```bash
cat /tmp/py/nav-config.js
```

**Regenerate the repo page list with titles and version markers**

```bash
cd /tmp/py && git fetch origin && git checkout origin/main -- . 2>/dev/null
for f in *.html; do
  t=$(grep -oiE '<title>[^<]*</title>' "$f" | head -1 | sed -e 's/<[^>]*>//g')
  v=$(grep -oE 'pn-ver[^<]*>[^<]*' "$f" | head -1 | sed 's/.*>//')
  printf "%-56s | %-44s | %s\n" "$f" "$t" "$v"
done
```

**Regenerate the `pages` table and find the empty rows**

```sql
select path,
       coalesce(length(html),0)  as html_len,
       coalesce(length(gzb64),0) as gz_len,
       updated_at::date
from pages
order by path;
-- empty shells:
select path from pages
where coalesce(length(html),0) = 0 and coalesce(length(gzb64),0) = 0;
```

**Diff the repo against the table.** Anything in the repo with no row is served from GitHub only and will not survive a `pages`-driven rebuild. Anything in the table with no repo file is serving nothing.

```bash
ls /tmp/py/*.html | xargs -n1 basename | sort > /tmp/repo_pages.txt
# paste the path column from the query above into /tmp/db_pages.txt, then:
comm -23 /tmp/repo_pages.txt /tmp/db_pages.txt   # in repo, no row
comm -13 /tmp/repo_pages.txt /tmp/db_pages.txt   # row, no repo file
```

**Regenerate the board section list in section 5**

```sql
select section, count(*) n, count(*) filter (where done) done
from todos group by 1 order by 2 desc;
```

**Regenerate the connector row counts in section 6**

```sql
select 'checkins' t, count(*) n, max(ts)::date last from checkins
union all select 'health_metrics', count(*), max(day)          from health_metrics
union all select 'qs_log',         count(*), max(date)         from qs_log
union all select 'todos',          count(*), max(done_at)::date from todos
union all select 'inbox',          count(*), max(created_at)::date from inbox
union all select 'visited_countries', count(*), max(last_visited)::date from visited_countries
union all select 'staging_events', count(*), max(decided_at)::date from staging_events
order by 1;

select source, count(*) n, max(date) last from qs_log group by 1 order by 2 desc;
select * from health_feed_status;   -- per-feed liveness, NBSP-normalized
```

**Before calling any source "connected," enumerate the tables first.** A three-table query once concluded two apps write data while Apple Health had 12,944 rows sitting in a table nobody queried.

```sql
select table_name from information_schema.tables where table_schema = 'public';
```

Also check `max(created_at)` as well as the data's own date column: a decade-deep backfill running oldest-first looks like a dead feed if you judge it by the data's dates alone.

**When the old docs and the live system disagree, the live system wins.** Three cases resolved that way in this document: the Year Compass daily questions are described as unbuilt and are live at `compass.html`; the Staging Area is described as a mock and shipped at v0.5; and the QS Dashboard's tile statistics are hardcoded and contradict the database they claim to summarize.

---

**Siblings:** 00-START-HERE.md, 02-Architecture.md, 03-Data-Model.md, 04-Runbook-Build-and-Deploy.md, 05-Capture-Pipeline.md, 06-How-We-Work.md, 08-Roadmap-and-Open-Decisions.md

**Also see:** 10-Foundations.md for why the life sections, habit frameworks and measurement philosophy are shaped the way they are. This document says what exists; that one says why.

*As of August 16th, all times EST*
