# Data Model

**What this is:** the reference for what is actually in the ProjectYou Supabase database, table by table, verified against the live schema rather than against intent.

**Read this when:** you need to know a real table name, column name, allowed value or row count before writing a query, a page, a trigger or a migration.

**Last verified:** 2026-08-16, by querying the live database (project ref arnjntspmrhigodlssbn).

**Supersedes:** Quantified-Self-Data-Model.md, QS-Master-Log-Spec.md, Quantified-Self-Project-Summary.md, Todays-Tasks-Backend-Schema-Spec.md, and the schema sections of Todays-Tasks-Tech-Spec.md.

---

## How to read this

The database is the source of truth. This document is a snapshot of it, taken on the date above. Every count, every vocabulary list and every fill rate here came from a query, and every one of those queries is reproduced in the final section, "How to re-verify this document." If a number here disagrees with the database, the database is right and this file is stale.

Three rules for keeping it honest:

1. Never quote a number from this file as current without re-running its query. The counts drift daily.
2. When you add a table, a view, a trigger, a cron job or an edge function, add it here in the same session. The largest failure mode of the previous documentation set was silence: 31 of the 35 live tables, including the two largest, appeared in no document at all.
3. When a vocabulary in this file is not enforced by a constraint, it says so. Treat those lists as observed behavior, not as guarantees.

For what the system is for, see 01-Product-Overview.md. For how the pieces fit together at runtime, see 02-Architecture.md. For the publish pipeline, see 04-Runbook-Build-and-Deploy.md. For how notes become rows, see 05-Capture-Pipeline.md. For everything known to be broken or undecided, see 08-Roadmap-and-Open-Decisions.md.

---

## The one-log principle

The design argument behind the quantified self layer is worth preserving in full, because it is the reason `qs_log` is shaped the way it is.

Every dashboard is the same underlying data sliced a different way. The monthly grid is date across the top and tracker down the side. The annual dot grids are one tracker across a year. The Time Bandit Wheel is blocks grouped by area for a week. If each of those keeps its own data, they drift apart and nothing reconciles.

The fix is one master log where every daily entry lands as a single row, tagged well enough that any dashboard can be built by filtering and pivoting it. As the original spec put it: "You never enter the same fact twice."

So the canonical store is long format. One row per tracker per day per source. From that one table:

- **Monthly grid:** filter a date range, pivot date across and tracker down, show the icon or value per cell.
- **Annual dot grid:** filter to one tracker, lay the year out, fill each day's dot by status.
- **Time Wheel outer ring:** sum minutes or blocks by group for the day or week.
- **Ecosystem view:** group the latest value and streak per tracker under its group band.

### The tag at source rule

The pipeline that makes the log self populating is tagging tasks at the point of capture, not at the point of reporting. Each habit item carries, beyond its text: tracker, group, value, unit and tags. Completing a tagged item writes a clean row into the log with no re-entry. Untagged items stay ordinary tasks and feed no dashboard.

> "The tag is what turns a task into a data point."

This is now enforced mechanically by the `trg_habit_to_qs_log` trigger on `todos`, described under Triggers below. The discipline, though, is still human: only 12 of 178 `todos` rows currently carry a tracker.

### Why measure at all

This paragraph exists nowhere else in the documentation set, so it is preserved here verbatim in substance.

- **Hawthorne effect:** the moment you measure something, it starts to change. The tracker is the nudge, not just the record.
- **See the benefit sooner:** pair each habit with a near term signal so the payoff is visible fast rather than abstract.
- **n=1 experiments:** run small self experiments and let your own data settle them, rather than relying on generic advice.
- **The payoff twice:** every data point pays off once as measurement and once as raw material for reflection. Measuring it changes it. Your data becomes your coach.

---

## Table catalogue

35 base tables in `public`. Row counts are `pg_stat_user_tables.n_live_tup` as of 2026-08-16 and are approximate by design, though they matched `count(*)` on every table spot checked.

### Site and publishing

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `pages` | 45 | The website itself. One row per file, keyed by `path`, HTML stored gzip plus base64 in `gzb64`. Writing a row fires the GitHub publish trigger. | Previously undocumented. This is the deploy mechanism, not a cache. |
| `pages_upload` | 24 | Scratch buffer for hand pasted chunked page uploads. Chunks append here with no publish trigger, get md5 verified, then copy into `pages` in one statement so publish fires exactly once. | Previously undocumented. RLS is off. |
| `publish_hook_log` | 72 | Outcome of each attempt to poke GitHub after a page publish. First place to look if github.io stops updating. | Previously undocumented. RLS is off. |
| `overnight_build` | 11 | Input and output buffers for overnight build runs, keyed `in:<file>` and `out:<file>`, plus a `spec` key. | Previously undocumented. RLS is off. |
| `build_recipe` | 2 | Stored build and patch scripts, both currently targeting `index.html`, with `from_version` and `to_version`. | Previously undocumented. RLS is off. |

### Tasks and board

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `todos` | 178 | The Today's Tasks board. One row per task or habit. 40 columns. Both the board view and the Time Wheel read these same rows. | Documented before, but with a wrong primary key type and a column that never existed. |
| `daily_template` | 17 | The standing daily set the rollover reseeds from. 11 habits marked live, plus meals and home tasks. One row has `live = false`. | Named correctly in the old tech spec, never detailed. |
| `app_meta` | 8 | Key and value app state: `last_rollover`, `section_order`, `custom_sections`, `last_friday_nudge`. Also holds three API credentials in plaintext. | The credential storage was undocumented. See Security posture. |
| `board_meta` | 13 | Board and system configuration as JSONB. Holds the overnight run schedule and heartbeat, the Drafts sweep watermark, and the system map verification state. | Previously undocumented. |
| `daily_completed` | 1 | Completion ledger. Currently written only by the Social Well-Being trigger. | Previously undocumented. |
| `time_log` | 3 | Daily minutes by `(day, kind, name)` where kind is office, project or category. This is the global time tracker. | Previously undocumented as a table, though the concept appears in the QS docs. |

### Capture and staging

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `inbox` | 43 | Voice and Drafts captures awaiting routing, with `confidence`, `dest_guess`, `headline` and `read_line`. | Previously undocumented. See 05-Capture-Pipeline.md. |
| `staging_events` | 23 | Learning log for the Staging Area. One row per approve, reroute, park or dismiss. `agreed = true` means the guessed destination was accepted as is, which powers the percent approved as is metric. | Previously undocumented. |
| `movies` | 3 | Watchlist. `watch_on` is set from the Staging Area mini calendar. | Previously undocumented. A Staging Area destination. |
| `connections` | 3 | People met, with `happened_on`. Auto populated by the Social Well-Being trigger and by Staging Area approvals. | Previously undocumented. A Staging Area destination. |
| `future_travel` | 21 | Places to go, with lat, lng, recommender, flag and `kind` (default `destination`). | Previously undocumented. |
| `rule_candidates` | 1 | Proposed working rules awaiting a keep or discard decision. | Previously undocumented. |
| `feedback` | 0 | Empty. No writer found. Candidate for removal. | Previously undocumented. |

### Quantified self

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `qs_log` | 637 | The master log. One row per date, tracker and source. Fed by the habit trigger, the coffee check-in trigger, Strava and manual entry. | Documented, and the old spec predicted it accurately. Two source values were added since. |
| `compass_questions` | 8 | Clarity Compass question bank, with an ordered `ladder` array and JSONB `hints`. | Concept documented, schema was not. |
| `compass_log` | 8 | Answer state per question: pending, answered or parked, with `resurface_on` and `shown_on`. | Concept documented, schema was not. |

### Feeds and connectors

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `health_metrics` | 16,826 | Apple Health readings pushed from the iPhone by the Health Auto Export app through the `health-in` edge function. One row per reading. `day` is the New York date of `ts`. | Previously undocumented. This is the largest table in the database. |
| `health_ingest_log` | 1 | Per push audit: metric names seen, metrics ignored, rows received, rows written. | Previously undocumented. |
| `checkins` | 8,819 | Foursquare and Swarm check-ins, pulled by the `swarm` edge function. Primary key is the Foursquare check-in id, so re-running a sync is idempotent. | Previously undocumented. Second largest table, and the source of 92 percent of `qs_log`. |
| `visited_countries` | 51 | Countries actually visited, driving `where-ive-been.html`. `source` records provenance: `treadwell-import` (carried over from a prototype and not independently verified), `swarm`, `tripit` or `manual`. | Previously undocumented. |

### Content modules

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `quotes` | 60 | The Clever Phrases pool: `text`, `meaning`, `author`, `tags`, `favorite`, `is_new`, `seen_on`. | Previously undocumented under this name. An old handoff proposed a `clever_phrases` table that was never created. |
| `ai_deck_pool` | 30 | Source pool for the daily AI deck. `card_type` is tip, insight or platform. Carries `active`, `needs_verify`, `times_used` and `last_used` for rotation. | Previously undocumented. An old handoff proposed `ai_daily_items` instead. |
| `ai_cards` | 42 | The deck actually dealt on a given day, keyed by `for_date` and `deck_position`. `card_type` is tip, insight, quote or platform. | Previously undocumented. An old handoff proposed `card_used_log` instead. |
| `jc_321` | 342 | James Clear 3-2-1 newsletter cards, typed idea, quote or question, with issue date, theme and roman numeral. Drives `james-clear.html`. | Previously undocumented. |
| `cue_favorites` | 3 | Starred habit building cue cards, keyed by `module` and `card_id`. | Previously undocumented. |
| `favorites` | 15 | Cross module favorites, polymorphic via `ref_table` plus `ref_id`. | Previously undocumented. |

### Session and ops

| Table | Rows | Purpose | Note |
|---|---:|---|---|
| `session_todos` | 76 | The working queue for Claude and Scott, with a full lifecycle: lane, run status, approval, review comment, deploy request, archive, and a code execution block used by the `code-run` edge function. | Previously undocumented. |
| `session_content` | 28 | Saved per day session items, keyed by `day`, `item` and `session`. | Previously undocumented. |
| `session_trackers` | 9 | Registry of published session tracker pages: slug, title, day, url, project, open count. | Previously undocumented. |
| `tracker` | 42 | Session decision and question log: `item`, `label`, `choice`, `note`, `seen`, `session`. **Nothing to do with quantified self trackers.** | Previously undocumented. See Naming traps. |

---

## The core tables in detail

### `todos`

The board. 40 columns, primary key `id uuid default gen_random_uuid()`. RLS is enabled with a single policy `owner_by_email`, `(auth.jwt() ->> 'email') = 'scottyex@gmail.com'`.

**Identity and ownership**

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key, `gen_random_uuid()`. Not bigint. Older docs said bigint and were wrong. |
| `user_id` | uuid | Nullable. **NULL in all 178 rows.** Vestigial. The real access control is the email policy. |

**Placement**

| Column | Type | Notes |
|---|---|---|
| `section` | text | Default `'Inbox'`. Holds life domain names and board sections. See vocabulary below. |
| `subsection` | text | Nullable. Holds `HABIT BANDIT`, `🏠 Home Tasks`, `🍽️ Meals`, `🚗 Errands`. |
| `position` | double precision | Default 0. Float so rows can slot between neighbors without renumbering. |
| `indent` | integer | Default 0. Sub-item nesting. 1 row currently indented. |
| `bucket` | text | Default `'today'`. Values `today` and `tomorrow`. |
| `for_date` | date | Default `CURRENT_DATE`. The day the row belongs to. |
| `origin_section` | text | Where a completed item came from, so it can be restored. |
| `origin_subsection` | text | Same. |

**Content**

| Column | Type | Notes |
|---|---|---|
| `task` | text | The text. |
| `task_html` | text | Rich text variant. |
| `link` | text | Habit app URL, opened from the row. |

**State**

| Column | Type | Notes |
|---|---|---|
| `done` | boolean | Default false. The flag the QS trigger watches. |
| `status` | text | Default `'todo'`. Observed: `todo`, `done`, one stray `open`. No CHECK constraint. |
| `starred` | boolean | Default false. Top Priority. |
| `skipped` | boolean | Default false. A habit marked not doing today. Distinct from done, excluded from time totals, regenerates tomorrow. |
| `is_habit` | boolean | Default false. Gates the QS trigger. 12 rows true. |

**Time**

| Column | Type | Notes |
|---|---|---|
| `est_minutes` | integer | The estimate. 76 rows populated. |
| `actual_minutes` | integer | What it really took. 42 rows populated. Kept separate from the estimate on purpose: the gap between them is the point. |
| `created_at` | timestamptz | Default `now()`. |
| `updated_at` | timestamptz | Default `now()`. |
| `started_at` | timestamptz | Nullable. |
| `done_at` | timestamptz | The clock time of completion. 76 rows populated. Required by the Time Wheel outer ring, which draws each finished task from `done_at` minus `actual_minutes` to `done_at`. |
| `completed_at` | timestamptz | Nullable. **Unused.** Duplicates `done_at`. See Known data quality problems. |
| `skipped_at` | timestamptz | Nullable. |

**Quantified self tags**

| Column | Type | Notes |
|---|---|---|
| `tracker` | text | The QS metric this task maps to. 12 rows populated. |
| `qs_group` | text | The life group band. 12 rows populated (7 Physical Health, 8 Mental Fitness, 1 Emotional Health, 1 junk value `cue-cards`). |
| `value` | numeric | The logged number. 12 rows populated. |
| `unit` | text | What the value means. |
| `tags` | text[] | Array on `todos`, unlike `qs_log.tags` which is plain text. |
| `category` | text | The wheel color bucket. See vocabulary below. |
| `source_project` | text | Which project the task came from. **173 of 178 rows are NULL.** Vestigial for now. |

**Staging Area block**

This whole block was undocumented before. It supports the Staging Area page, where captured notes are shown with a guessed destination for approval.

| Column | Type | Notes |
|---|---|---|
| `stage_guess` | text | The destination Claude guesses. |
| `stage_conf` | text | Confidence in that guess. |
| `staging_note` | text | Free note shown in the staging row. |
| `stage_board` | text | Which dropdown is pre-selected. `todays` means the Today's To-Do section named in `stage_guess`; `alltodos` means the All ToDos category named in `stage_cat`. (This is the column's own comment in the database.) |
| `stage_cat` | text | The All ToDos category. |
| `stage_own` | text | Proposed owner. |
| `stage_date` | date | Staging Area mini calendar. Used by destinations that record a date: Movie List (when to watch) and Friends Visit (when to meet). Carried into `movies.watch_on` and `connections.happened_on` on approval. |

11 rows currently carry a `stage_board` value.

**Live vocabularies on `todos`**

None of these are enforced by a constraint. They are what the data contains today.

`section`, 19 distinct values, no NULLs:

| Value | Rows |
|---|---:|
| `✓ Completed Tasks` | 76 |
| `Core To-Dos` | 28 |
| `🧩 New projects to build` | 11 |
| `After Core` | 10 |
| `🗑️ Dismissed` | 9 |
| `Social Well-Being` | 7 |
| `Emotional Health` | 6 |
| `💬 Asa topics` | 6 |
| `Tomorrow's Core To-Dos` | 6 |
| `Sense of Purpose (Ikigai)` | 5 |
| `Work/Amazon` | 4 |
| `📥 Inbox · uncategorized captures` | 3 |
| `Recreational Health`, `Mental Fitness`, `🎓 Carson College`, `Physical Health`, `Tracking`, `Environmental Health`, `Scotts Uniqueness` | 1 each |

There is no `Waiting On` or `Waiting Area` section in the data, despite both appearing in older docs.

`category`: `Eating` 20, `HABIT BANDIT` 12, `Personal` 12, `Strava` 4, `WEEKLY_LUNCH` 1, `Core` 1, `build` 1, NULL 127. Older docs claimed the allowed set was HABIT BANDIT, Home Tasks, Meals, Core to-dos, After Core. Only HABIT BANDIT overlaps. Home Tasks and Meals live in `subsection`; Core To-Dos and After Core live in `section`.

`status`: `todo` 102, `done` 75, `open` 1.

`bucket`: `today` 172, `tomorrow` 6.

### `qs_log`

The master log. Primary key `id uuid`. RLS enabled, policy `owner_by_email_qs` on the same email.

| Column | Type | Constraint | Notes |
|---|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` | Not text. |
| `date` | date | not null | The day the entry belongs to. |
| `group` | text | none | The life band. Quoted in SQL because `group` is a reserved word. |
| `tracker` | text | none | The metric. |
| `value` | numeric | nullable | Blank for a simple done. |
| `unit` | text | none | What the value means. |
| `status` | text | CHECK in (`done`, `rest`, `skipped`, `partial`) | Default `'done'`. |
| `tags` | text | none | Semicolon separated. **Plain text here, not an array.** `todos.tags` is `text[]`. |
| `note` | text | nullable | Short context. Used by the coffee trigger to accumulate venue names. |
| `source` | text | CHECK in (`habit-bandit`, `manual`, `strava`, `apple-health`, `tripit`, `calendar`, `fitindex`, `swarm`) | Default `'manual'`. |
| `logged_at` | timestamptz | default `now()` | When it was recorded. |
| `created_at` | timestamptz | default `now()` | Row creation. |

**The real grain**

```
UNIQUE (date, tracker, source)   -- constraint qs_log_date_tracker_source_key
```

This matters and is commonly misread. The grain is not one row per tracker per day. It is one row per tracker per day **per source**. The same tracker logged from two sources on the same day produces two rows. That is why `v_coffee_days` has to group by date and use `bool_or` across sources rather than assuming one row.

The constraint is also the idempotency mechanism: every writer upserts with `on conflict (date, tracker, source)`, so re-running a sync never double logs.

**Vocabularies that are NOT enforced**

`group` and `unit` are plain text with no CHECK constraint. The intended eight groups are Physical Health, Recreational Health, Emotional Health, Environmental Health, Sense of Purpose, Social Well-Being, Mental Fitness and Operating System. What the data actually holds:

| `group` | Rows |
|---|---:|
| `Physical Health` | 608 |
| `Mental Fitness` | 26 |
| `Emotional Health` | 1 |
| `Operating System` | 1 |
| `compass` | 1 (junk, lowercase, not one of the eight) |

Four of the eight groups have never been used.

| `unit` | Rows |
|---|---:|
| `boolean` | 608 |
| `miles` | 15 |
| `minutes` | 13 |
| `min` | 1 (should be `minutes`) |

Intended unit vocabulary: reps, seconds, minutes, miles, count, ratio (store 0.75, not 3/4), boolean, score, text.

**Trackers actually in use**, 15 distinct:

| Tracker | Rows | First | Last | Sources |
|---|---:|---|---|---|
| `Coffee` | 588 | 2009-08-14 | 2026-08-08 | swarm |
| `Cardio` | 15 | 2026-07-07 | 2026-08-15 | strava |
| `Learning` | 7 | 2026-08-10 | 2026-08-16 | habit-bandit |
| `AI` | 5 | 2026-08-11 | 2026-08-15 | habit-bandit |
| `Compass` | 4 | 2026-08-11 | 2026-08-15 | habit-bandit |
| `Micro Learning` | 3 | 2026-08-10 | 2026-08-15 | habit-bandit |
| `Medicine` | 3 | 2026-08-10 | 2026-08-15 | habit-bandit |
| `Cognitive` | 3 | 2026-08-10 | 2026-08-15 | habit-bandit |
| `Walk` | 2 | 2026-08-11 | 2026-08-15 | habit-bandit |
| `Elevate` | 2 | 2026-08-11 | 2026-08-15 | habit-bandit |
| `Lunch` | 1 | 2026-08-10 | 2026-08-10 | manual |
| `Meditation` | 1 | 2026-08-15 | 2026-08-15 | habit-bandit |
| `Flashcard` | 1 | 2026-08-16 | 2026-08-16 | habit-bandit |
| `Reflection` | 1 | 2026-08-10 | 2026-08-10 | habit-bandit |
| `Atomic Habits` | 1 | 2026-08-15 | 2026-08-15 | habit-bandit |

`source` distribution: `swarm` 588, `habit-bandit` 33, `strava` 15, `manual` 1. Zero rows from `apple-health`, `tripit`, `calendar` or `fitindex`, even though all four are permitted by the CHECK.

`status` distribution: `done` 637. The values `rest`, `skipped` and `partial` are allowed and have never been used, so streak logic that depends on distinguishing rest from missed has no data yet.

### `pages`

| Column | Type | Notes |
|---|---|---|
| `path` | text | Primary key. The filename, for example `index.html`. |
| `html` | text | Plain HTML. Only `nav.html` uses this, at 2,068 bytes. |
| `gzb64` | text | Gzip plus base64 HTML. This is what everything else uses. |
| `updated_at` | timestamptz | Default `now()`. |

45 rows. RLS enabled with a deliberate `pages_anon_read` SELECT policy so the site can be served without login. Writing any row fires `pages_publish_now`. Six rows are empty shells with zero length content: `daily-template.html`, `mission.html`, `morning-update.html`, `movies.html`, `quotes.html`, `qs-wheel.html`, `style-guide.html`. Note that `qs-wheel.html` being empty means the Clarity Compass nav link is currently dead.

See 04-Runbook-Build-and-Deploy.md for the publish flow.

### `inbox`

Captures awaiting routing. 43 rows. RLS locked to the owner email.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK. |
| `text` | text | The raw capture. |
| `source` | text | Default `'voice'`. |
| `routed` | boolean | Default false. |
| `routed_to` | text | Where it went. |
| `confidence` | text | Classifier confidence. |
| `dest_guess` | text | Guessed destination. |
| `headline` | text | Short display title. |
| `read_line` | text | Read-back line for confirmation. |
| `staging_note` | text | Note carried into staging. |
| `filed_at` | timestamptz | When routed. |
| `dismissed_at` | timestamptz | When discarded. |
| `created_at` | timestamptz | Default `now()`. |

See 05-Capture-Pipeline.md.

### `checkins`

Foursquare and Swarm history. 8,819 rows.

| Column | Type | Notes |
|---|---|---|
| `id` | text | Primary key. **The Foursquare check-in id**, which is what makes re-sync idempotent. |
| `ts` | timestamptz | Check-in time. |
| `day` | date | New York date of `ts`. |
| `venue`, `city`, `state`, `country`, `country_code` | text | Location. |
| `lat`, `lng` | double precision | Coordinates. |
| `category` | text | Foursquare venue category. Used by `is_coffee_checkin()`. |
| `shout` | text | The check-in message. |
| `kind` | text | Classification. |
| `raw` | jsonb | Full API payload. |
| `created_at` | timestamptz | Default `now()`. |

Known caveat, recorded as the table's own comment: the Foursquare API returns the venue's **current** name, not its name at the time of the check-in, so old rows can show a renamed venue.

### `health_metrics`

Apple Health. 16,826 rows, the largest table.

| Column | Type | Notes |
|---|---|---|
| `id` | bigint | Identity PK. |
| `metric` | text | Metric name, for example `step_count`. |
| `day` | date | New York date of `ts`. |
| `ts` | timestamptz | Reading time. |
| `value` | numeric | The reading. |
| `unit` | text | Unit. |
| `source` | text | Device or app name. |
| `extras` | jsonb | Anything else in the payload. |
| `created_at` | timestamptz | Default `now()`. |

```
UNIQUE (metric, ts, source)   -- constraint health_metrics_uniq
```

Repeated pushes are therefore idempotent. Metrics present:

| Metric | Rows | First | Last |
|---|---:|---|---|
| `step_count` | 3,607 | 2016-09-14 | 2026-08-15 |
| `active_energy` | 1,563 | 2019-01-02 | 2026-08-15 |
| `apple_exercise_time` | 1,548 | 2019-01-17 | 2026-08-15 |
| `sleep_awake` | 1,452 | 2016-10-11 | 2026-08-15 |
| `sleep_core` | 1,452 | 2016-10-11 | 2026-08-15 |
| `sleep_in_bed` | 1,452 | 2016-10-11 | 2026-08-15 |
| `sleep_rem` | 1,452 | 2016-10-11 | 2026-08-15 |
| `sleep_deep` | 1,452 | 2016-10-11 | 2026-08-15 |
| `sleep_asleep` | 1,452 | 2016-10-11 | 2026-08-15 |
| `heart_rate_variability` | 1,393 | 2019-12-27 | 2026-08-15 |
| `resting_heart_rate` | 1 | 2026-08-15 | 2026-08-15 |
| `mindful_minutes` | 1 | 2026-08-15 | 2026-08-15 |
| `time_in_daylight` | 1 | 2026-08-15 | 2026-08-15 |

### `board_meta` keys

13 rows of JSONB configuration. The keys are the useful part.

| Key | What it holds |
|---|---|
| `cat_order` | Ordered All ToDos categories. Currently `["🔧 Add a new task", "Quantified Self", "🐞 Known Bugs"]`. |
| `cat_labels` | Category label overrides. Currently empty. |
| `custom_cats` | User added categories. Currently empty. |
| `drafts_sweep_watermark` | Timestamp of the last Drafts sweep, so captures are not processed twice. |
| `midnight_run_cron` | `"0 8 * * *"`. The overnight run schedule, in UTC. |
| `midnight_run_time` | `"4:00 AM"`. The same thing expressed in Eastern time. |
| `midnight_run_heartbeat` | Last start timestamp of the overnight run. |
| `midnight_run_last_result` | Free text result of the last run. |
| `midnight_run_testfire` | Test fire state. |
| `midnight_run_wrap` | Free text wrap up of the last run. |
| `system_map_baseline` | Snapshot of feed row counts used to detect drift. |
| `system_map_last_verified` | Date, method and status of the last system map audit. Currently reads `drift`. |
| `system_map_pages` | List of pages the system map covers. |

`app_meta` keys, for comparison: `last_rollover`, `section_order`, `custom_sections`, `last_friday_nudge`, plus `fsq_client_id`, `fsq_client_secret`, `fsq_token` and `health_ingest_key`. The last four are credentials. See Security posture.

---

## Views

Nine views, all in `public`.

| View | Reads | What it returns |
|---|---|---|
| `health_feed_status` | `health_metrics` | One row per feed with `last_day` and `readings`: `apple_health`, `health_auto_export`, `apple_watch` (source matches "apple watch"), `apple_fitness` (metric in active_energy, apple_exercise_time), `fitindex` (metric in weight_body_mass, body_fat_percentage, lean_body_mass), `waking_up` (mindful_minutes with a matching source). Note that the `fitindex` and `waking_up` rows are filters over Apple Health data, not separate integrations. |
| `v_checkin_stats` | `checkins` | Total, distinct venues, cities, countries, first and last day, active days, and count in the last 365 days. |
| `v_checkin_years` | `checkins` | Visits, venues and countries per calendar year. |
| `v_coffee_checkins` | `checkins` | Check-ins passing `is_coffee_checkin(category, venue)`. |
| `v_coffee_days` | **`qs_log`** | Days where `tracker = 'Coffee'` and `status = 'done'`, flagging `from_checkin` (source swarm) versus `self_logged` (source habit-bandit or manual), and aggregating distinct venue names out of `note`. This is the view that has to reconcile the per source grain. |
| `v_coffee_stats` | `v_coffee_days`, `qs_log` | Streak engine: total days, first and last day, days in the last 365 and 90, days this year, days that came from check-ins, longest streak and when it ended, and the current streak. Uses `America/New_York` for today. |
| `v_coffee_venues` | `checkins` | Per venue visit counts, distinct days, first and last visit. |
| `v_top_cities` | `checkins` | Top 60 cities by check-in count. |
| `v_top_venues` | `checkins` | Top 60 venues by check-in count. |

Worth noting what does **not** exist: there is no view for the monthly grid, the annual dot grid, the Time Wheel aggregation, the ecosystem dashboard or estimate versus actual. Those five read patterns are described in the design docs but are implemented, if at all, as client side queries inside the page HTML. The only views built over `qs_log` are the coffee ones.

---

## Triggers

Four non-internal triggers. `information_schema.triggers` returns six rows because two of them fire on both INSERT and UPDATE.

### `todos` → `trg_habit_to_qs_log` (AFTER UPDATE, function `habit_to_qs_log()`)

This is the day close append step, implemented as a database trigger rather than a manual routine. It fires when `done` flips from false to true on a row where `is_habit` is true.

What it writes into `qs_log`:

- **tracker:** `todos.tracker` if set, otherwise the task text with a trailing parenthetical stripped by `regexp_replace(new.task, '\s*\([^()]*\)\s*$', '')`, otherwise the raw task text. This is why the habit "Elevate (Mental Fitness)" logs as tracker `Elevate`.
- **group:** `todos.qs_group` if set, otherwise **it silently defaults to `'Mental Fitness'`**. This default is undocumented anywhere else and it skews the group distribution: some of the 26 Mental Fitness rows are untagged habits, not measurements of mental fitness.
- **value:** `todos.value`, defaulting to 1.
- **unit:** `todos.unit`, defaulting to `'boolean'`.
- **status:** `'done'`. **source:** `'habit-bandit'`. **logged_at:** `now()`.
- **date:** the date of `done_at` (falling back to `now()`) converted to `America/New_York`. Explicitly **not** `for_date`. The function carries a comment explaining why: `for_date` used to go stale and misfile completions onto the wrong day.

Upserts on `(date, tracker, source)`, updating value, status, group and `logged_at`.

### `todos` → `trg_social_wellbeing_completion` (AFTER UPDATE, function `sync_social_wellbeing_completion()`)

When a row in section `Social Well-Being` is completed, it inserts the task text as a person into `connections` (dated `for_date`, kind `Social Well-Being`) and inserts a row into `daily_completed` tagged `social`. Both inserts are guarded by `not exists` checks, so re-ticking does not duplicate.

### `checkins` → `trg_checkin_to_coffee_log` (AFTER INSERT, AFTER UPDATE, function `checkin_to_coffee_log()`)

If `is_coffee_checkin(category, venue)` returns true, it upserts a `qs_log` row: group `Physical Health`, tracker `Coffee`, value 1, unit `boolean`, status `done`, source `swarm`, note set to the venue name, `logged_at` set to the check-in timestamp.

Two deliberate behaviors, both carrying comments in the function body:

- The row is dated to **the check-in's own day, never `now()`**. A check-in made at 11pm but synced the next morning must not land on the following day.
- On conflict, the venue name is appended to the existing note rather than replacing it, capped at 400 characters and skipping names already present.
- The cosmetic tick of today's Coffee habit in `todos` happens **on INSERT only**, and only when the check-in is today, so that re-syncing an old check-in cannot re-tick something that was deliberately unticked.

### `pages` → `pages_publish_now` (AFTER INSERT, AFTER UPDATE, function `notify_github_publish()`)

The deploy pipeline. Reads the `github_pat` secret from Supabase Vault, POSTs a `repository_dispatch` with `event_type: publish-pages` to `https://api.github.com/repos/xrodgers28/ProjectYou/dispatches` with an 8 second timeout, and logs the result to `publish_hook_log`. Every failure path (missing secret, unreadable secret, failed HTTP post) writes a log row and returns null rather than raising, so a publish attempt can never block a page write. Full walkthrough in 04-Runbook-Build-and-Deploy.md.

---

## Cron jobs

Two jobs in `cron.job`, both active. **Schedules are UTC.**

| jobid | Name | Schedule (UTC) | Eastern | Command |
|---:|---|---|---|---|
| 1 | `ensure-ai-deck-daily` | `0 9 * * *` | 5:00 AM ET | `select public.ensure_today_deck();` |
| 2 | `reset-daily-habits` | `0 8 * * *` | **4:00 AM ET** | `select public.reset_daily_habits();` |

**The day boundary is 4 AM Eastern, not 3 AM.** Older documentation stated a 3 AM boundary. The cron schedule says 08:00 UTC and `board_meta.midnight_run_time` independently says `"4:00 AM"`, so 4 AM is correct in two places.

**What `reset_daily_habits()` actually does:** it updates rows in `todos` where `is_habit` is true and either `for_date` is not today or `done` is true, setting `done = false`, `status = 'todo'`, `done_at = null`, `actual_minutes = null`, `for_date = today`, `bucket = 'today'`, `updated_at = now()`. It returns the row count.

That is the whole function. It does **not** promote `bucket = 'tomorrow'` rows into Core, does not archive finished tasks, and never reads `daily_template`. Older documentation described the rollover as doing all four things. If promotion, archiving and reseeding happen at all, they happen client side in `index.html` on first open, which means they depend on someone opening the page. This is an open item in 08-Roadmap-and-Open-Decisions.md.

**What `ensure_today_deck()` does:** if `ai_cards` already has rows for today it returns the count and stops. Otherwise it deals a deck from `ai_deck_pool` where `active` is true and `needs_verify` is false: one tip and one insight, each preferring cards not used in 7 days and falling back to the least recently used; one quote drawn from `quotes` ordered by `is_new` then `seen_on` then `favorite`; and three platform cards preferring cards not used in 14 days, with a top up pass that fills any shortfall without repeating a title already dealt today.

---

## Edge functions

Nine functions, all status ACTIVE.

| Slug | Version | verify_jwt | Role |
|---|---:|---|---|
| `site` | 13 | false | Serves pages. Highest version, so the most iterated function in the project. |
| `app` | 7 | false | Application level endpoint. |
| `capture` | 7 | false | Voice and Drafts capture intake, writing to `inbox`. See 05-Capture-Pipeline.md. |
| `cttest` | 5 | false | Test and diagnostic endpoint. |
| `code-run` | 3 | **true** | Executes queued code tasks. Pairs with the `session_todos` columns `code_status`, `code_requested_at`, `code_started_at`, `code_finished_at`, `code_result`, `code_error`. The only function that requires a JWT. |
| `stput` | 3 | false | Session tracker put. |
| `health-in` | 2 | false | Apple Health ingest. Writes `health_metrics` and `health_ingest_log`. Authenticated by the `health_ingest_key` in `app_meta`, not by JWT. |
| `dbgpages` | 2 | false | Pages debugging. |
| `swarm` | 1 | false | Foursquare and Swarm pull into `checkins`, using the credentials in `app_meta`. |

---

## Known data quality problems

These are real and present in the data today. None of them is fixed by this document.

| Problem | Detail | Impact |
|---|---|---|
| Junk group value | One `qs_log` row has `group = 'compass'`, lowercase, not one of the eight bands. | Any group-by-band chart gets a stray category. |
| Unit inconsistency | One `qs_log` row has `unit = 'min'` where every other minute row uses `'minutes'`. | Sums by unit undercount by one row. |
| Vocabularies unenforced | `qs_log.group`, `qs_log.unit`, `qs_log.tracker`, `todos.section`, `todos.category` and `todos.status` are all plain text with no CHECK constraint. | Nothing prevents the next junk value. The two above are what leaked in already. |
| Mental Fitness default | `habit_to_qs_log()` defaults `group` to `'Mental Fitness'` when `todos.qs_group` is NULL, silently. | The 26 Mental Fitness rows are partly an artifact of missing tags, not a measurement. Do not read that count as signal. |
| Vestigial `user_id` | `todos.user_id` is NULL in all 178 rows. Access control is the email based RLS policy instead. | Dead column. Anyone writing `auth.uid() = user_id` logic will lock themselves out. |
| Vestigial `source_project` | 173 of 178 `todos` rows are NULL (4 say `strava`, 1 says `Project You`). | The cross project flywheel cannot be built on this field until it is populated. |
| Duplicate completion timestamps | `todos.completed_at` exists alongside `todos.done_at` and is never written. `done_at` is the live one, at 76 rows. | Pick `done_at`. Ignore `completed_at`. |
| Stray status value | One `todos` row has `status = 'open'` where the rest use `todo` or `done`. | Filters written as `status = 'todo'` silently drop it. |
| Unused status vocabulary | `qs_log.status` permits `rest`, `skipped` and `partial`. All 637 rows are `done`. | Streak logic that distinguishes a rest day from a missed day has no data to work with yet. |
| Junk qs_group | One `todos` row has `qs_group = 'cue-cards'`, which is not a life group. | Will propagate into `qs_log` if that row is a habit and gets ticked. |
| Empty page rows | Seven rows in `pages` have zero length content, including `qs-wheel.html`, which is linked from the nav. | Dead links on the live site. |

---

## Security posture

Stated as fact, not as alarm. This is what the database looks like right now.

**RLS is disabled on 4 tables:** `overnight_build`, `publish_hook_log`, `pages_upload`, `build_recipe`. Anyone holding the anon key can read and modify every row. Two of these, `pages_upload` and `build_recipe`, sit on the publish path.

**12 tables have policies with `USING (true)` for ALL commands**, which means anon read and anon write: `board_meta`, `checkins`, `cue_favorites`, `daily_completed`, `feedback`, `health_metrics`, `rule_candidates`, `session_content`, `session_trackers`, `time_log`, `tracker`, `visited_countries`. Note that `health_metrics` and `checkins` are the two largest personal data tables in the project.

**Plaintext credentials in `app_meta`:** the keys `fsq_client_id`, `fsq_client_secret`, `fsq_token` and `health_ingest_key` hold live credentials as table rows. `app_meta` itself is RLS locked to the owner email, so this is not open to anon, but the project already uses Supabase Vault for `github_pat`, which is where these belong.

**Deliberate public read**, and these are intentional so the site works without login: `pages` (`pages_anon_read`, SELECT), `ai_cards` (`public_read_ai`, SELECT), `jc_321` (`public_read_jc`, SELECT).

**Correctly locked to the owner email** with `(auth.jwt() ->> 'email') = 'scottyex@gmail.com'`: `todos`, `qs_log`, `app_meta`, `daily_template`, `inbox`, `quotes`, `ai_cards` (write), `ai_deck_pool`, `jc_321` (write), `compass_questions`, `compass_log`, `connections`, `movies`, `favorites`, `future_travel`, `session_todos`, `staging_events`.

### Recommended fixes

Not applied here. Tracked in 08-Roadmap-and-Open-Decisions.md.

1. Enable RLS on the four exposed tables **with policies written first**. Enabling RLS without a policy blocks all access, including the publish path.
2. Move the four `app_meta` credentials into Supabase Vault and read them the way `notify_github_publish()` already reads `github_pat`.
3. Narrow the `USING (true)` policies, starting with `health_metrics` and `checkins`, to owner email or service role.
4. Add CHECK constraints to `qs_log.group` and `qs_log.unit` after cleaning the two junk values, so the vocabularies stop being advisory.

---

## Naming traps

Three things that will send a reader to the wrong place.

**The `tracker` table is not a QS tracker.** `public.tracker` (42 rows) is a session decision and question log with columns `item`, `label`, `choice`, `note`, `seen`, `session`. Sample rows read like "AI Deck upgraded to Imprint style" and "Clean up the stale Clever Phrases row? / Yes". It has nothing to do with quantified self. The QS tracker vocabulary lives in two **columns**: `qs_log.tracker` and `todos.tracker`.

**`qs-log.html` does not exist.** Older docs referenced it twice as the "Habits Tracker" page. There is no such row in `pages`. The live quantified self page is **`qs-dashboard.html`**. The companion page `qs-wheel.html` exists as a row but is empty.

**CrushingIt is a dead name.** The app is Today's Tasks, and the site is ProjectYou, served from the `xrodgers28/ProjectYou` repository. Nothing in the database references CrushingIt. If you find it in a document, that document predates August 2026 and should be treated as historical.

---

## Schema gaps worth knowing

Three places where the design in the docs outruns what the schema can store. These are gaps, not bugs.

**1. Nothing stores a task's planned time.** The Time Wheel is specified as two concentric rings: the inner ring draws each task at its scheduled time with arc length equal to its estimate, and the outer ring draws it at the real clock time it finished with length equal to what it actually took. The outer ring is fully supported: `done_at` minus `actual_minutes` to `done_at`. The inner ring is not. There is no `planned_at`, `scheduled_at` or `slot` column on `todos`. `started_at` exists but records when work began, not when it was planned. Today the inner ring can only be inferred from `position` ordering, which is not a time. Adding a planned time column is the single most useful schema change available.

**2. Apple Health and `qs_log` do not talk to each other.** `health_metrics` holds 16,826 readings going back to 2016, including step count, sleep stages, active energy and heart rate variability. `qs_log` has zero rows with `source = 'apple-health'`, even though the CHECK constraint permits it. The two stores are entirely separate. Nothing summarizes a day of Apple Health into a QS row, so none of the QS dashboards can see any of it. Compare the Swarm path, which does exactly this via `trg_checkin_to_coffee_log` and is the model to copy.

**3. The flywheel fields exist and are unused.** The cross project design is that the top tasks from every project surface in Today's Tasks, plus one ten minute habit per project, and that each task carries its origin. `todos.source_project` is the column for this and it is NULL in 173 of 178 rows. There is no per project task table and no aggregation. The schema is ready; the data and the mechanism are not.

---

## How to re-verify this document

Run these against project ref `arnjntspmrhigodlssbn`. Together they regenerate every count, list and vocabulary in this file. Anything that disagrees means this document is stale and should be corrected in place.

**Table list and row counts**

```sql
select relname, n_live_tup
from pg_stat_user_tables
where schemaname = 'public'
order by relname;
```

**Authoritative table and view list**

```sql
select table_name, table_type
from information_schema.tables
where table_schema = 'public'
order by table_type, table_name;
```

**Full column detail for any table**

```sql
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name = 'todos'
order by ordinal_position;
```

**Constraints: primary keys, unique keys and checks**

```sql
select conrelid::regclass::text as tbl, conname, pg_get_constraintdef(oid) as def
from pg_constraint
where connamespace = 'public'::regnamespace
  and contype in ('p','u','c')
order by 1, 2;
```

**Column comments, which are the only documentation for some fields**

```sql
select c.relname as tbl, a.attname as col, d.description
from pg_description d
join pg_class c on c.oid = d.objoid
join pg_attribute a on a.attrelid = c.oid and a.attnum = d.objsubid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and d.objsubid > 0
order by 1, 2;
```

**`todos` vocabularies**

```sql
select 'section' as f, coalesce(section,'(null)') as v, count(*) as n from todos group by 2
union all select 'category', coalesce(category,'(null)'), count(*) from todos group by 2
union all select 'status',   coalesce(status,'(null)'),   count(*) from todos group by 2
union all select 'bucket',   coalesce(bucket,'(null)'),   count(*) from todos group by 2
union all select 'qs_group', coalesce(qs_group,'(null)'), count(*) from todos group by 2
union all select 'source_project', coalesce(source_project,'(null)'), count(*) from todos group by 2
order by 1, 3 desc;
```

**`todos` fill rates**

```sql
select
  count(*)                                          as total,
  count(*) filter (where is_habit)                  as habits,
  count(*) filter (where tracker is not null)       as with_tracker,
  count(*) filter (where value is not null)         as with_value,
  count(*) filter (where est_minutes is not null)   as with_est,
  count(*) filter (where actual_minutes is not null) as with_actual,
  count(*) filter (where done_at is not null)       as with_done_at,
  count(*) filter (where completed_at is not null)  as with_completed_at,
  count(*) filter (where user_id is not null)       as with_user_id,
  count(*) filter (where source_project is not null) as with_source_project,
  count(*) filter (where skipped)                   as skipped,
  count(*) filter (where indent > 0)                as indented,
  count(*) filter (where stage_board is not null)   as staged
from todos;
```

**`qs_log` vocabularies**

```sql
select 'group'  as f, "group" as v, count(*) as n from qs_log group by 2
union all select 'source', source, count(*) from qs_log group by 2
union all select 'status', status, count(*) from qs_log group by 2
union all select 'unit',   coalesce(unit,'(null)'), count(*) from qs_log group by 2
order by 1, 3 desc;
```

**`qs_log` trackers with date ranges and sources**

```sql
select tracker, count(*) as n, min(date) as first_day, max(date) as last_day,
       string_agg(distinct source, ',') as sources
from qs_log
group by 1
order by 2 desc;
```

**`health_metrics` coverage**

```sql
select metric, count(*) as n, min(day) as first_day, max(day) as last_day
from health_metrics
group by 1
order by 2 desc;
```

**Pages, including the empty ones**

```sql
select path, updated_at::date as updated,
       length(coalesce(html,'')) as html_len,
       length(coalesce(gzb64,'')) as gz_len
from pages
order by path;
```

**Config keys**

```sql
select 'app_meta' as src, key, left(coalesce(value,''), 60) as val from app_meta
union all
select 'board_meta', key, left(coalesce(val::text,''), 60) from board_meta
order by 1, 2;
```

**Triggers**

```sql
select event_object_table, trigger_name, action_timing, event_manipulation
from information_schema.triggers
where trigger_schema = 'public'
order by 1, 2;
```

**Trigger function bodies**

```sql
select t.tgname, c.relname as tbl, p.proname as fn, pg_get_functiondef(p.oid) as def
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
where n.nspname = 'public' and not t.tgisinternal
order by 2, 1;
```

**Cron jobs, including the commands**

```sql
select jobid, jobname, schedule, command, active
from cron.job
order by jobid;
```

**Cron function bodies**

```sql
select proname, pg_get_functiondef(oid)
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in ('reset_daily_habits','ensure_today_deck');
```

**View definitions**

```sql
select table_name, view_definition
from information_schema.views
where table_schema = 'public'
order by table_name;
```

**RLS state and policies**

```sql
select c.relname as tbl, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r'
order by c.relrowsecurity, c.relname;

select tablename, policyname, cmd, qual::text as using_clause
from pg_policies
where schemaname = 'public'
order by tablename, policyname;
```

**Edge functions**

Not available over SQL. Use the Supabase MCP tool `list_edge_functions` with project id `arnjntspmrhigodlssbn`, or `supabase functions list` from the CLI.

*As of August 16th, all times EST*
