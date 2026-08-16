# Capture Pipeline

**What this is:** the end to end reference for how a thought Scott speaks into Drafts becomes a row in the right table, and the gate it has to pass on the way.

**Read this when:** you are changing the `capture` edge function, the every 2 hours sweep, the Staging Area page, or any routing rule, or when a captured note did not arrive and you need to find out where it stopped.

**Last verified:** 2026-08-16, by querying the live Supabase project `arnjntspmrhigodlssbn` (schema, column comments, row counts, grants, triggers), by reading the deployed `capture` edge function source, by reading the scheduled trigger prompt for `trig_01Dmm4JdFxtwkkzJsDCR4TZM`, and by fetching the live Staging Area page. Every number below has its query in the last section.

**Supersedes:** Drafts-Import.md, Staging-Area.md, Talk-to-Capture-Build-Spec.md, Drafts-Import-Feature.md.

---

## The pipeline in one line

Scott dictates into Drafts, the `capture` function or the 2 hourly sweep interprets the note and writes it to `inbox` plus a staged `todos` row, the Staging Area is the gate where he approves it, approval writes the real row in the destination table, and the draft is archived so it is never captured twice.

### The stages

| # | Stage | What runs | What it writes |
|---|---|---|---|
| 1 | Dictate | Drafts app on iPhone or Apple Watch | a draft in the Drafts inbox |
| 2a | Instant push | edge function `capture` (v7, ACTIVE, `verify_jwt=false`) | `inbox` row plus a staged `todos` row |
| 2b | Backstop sweep | skill `task-capture`, trigger `trig_01Dmm4JdFxtwkkzJsDCR4TZM`, every 2 hours | same two rows, plus it advances the watermark |
| 3 | Raw log | either path | `inbox.text` holds the verbatim dictation |
| 4 | The gate | `staging-area.html` v0.5, nav item 3, right after All ToDos | nothing until Scott acts |
| 5 | Approval | Scott taps Approve, Park it, Dismiss or Send to All ToDos | the destination row, plus a `staging_events` row |
| 6 | Cleanup | the sweep or the Drafts action | draft tagged `task-added` and archived |

### Stage 1: dictate

No prefix, no format, no list picking. He says the thought: "refill the medicine bottle", "add undo to the board". The design assumption is "popcorn brain": ideas fire while he is walking, so the capture surface has to cost nothing.

**The Apple Watch limit, which has bitten twice.** The Drafts watch app only captures dictation into the inbox. It cannot run a Drafts action. So from the wrist there are three options:

1. Let the 2 hourly sweep pick it up (nothing to set up).
2. Tap the action on the phone when instant matters.
3. An Apple Shortcut (Dictate Text, then Get Contents of URL POSTing to the `capture` endpoint with the secret header) which does run on the watch.

The decision recorded Aug 15 2026 was to **push from the device rather than pull from the cloud**: an hourly Apple Shortcuts personal automation on the iPhone runs the Drafts action named exactly `Sweep to ProjectYou`. His phone is always awake, so this does not depend on the Mac being online. The cloud sweep stays as a backstop and is still enabled.

### Stage 2a: the `capture` edge function (instant push)

| Fact | Value |
|---|---|
| URL | `https://arnjntspmrhigodlssbn.supabase.co/functions/v1/capture` |
| Method | POST, `verify_jwt=false` |
| Auth | header `x-capture-secret` must equal the `CAPTURE_SECRET` env var |
| Body | `{ "text": "<memo>", "source": "drafts", "draft_uuid": "<optional>" }`, also accepts form encoded `text=` or a bare body |
| Deployed version | 7 (the source header comment still says v6) |
| Model | `CAPTURE_MODEL`, default `claude-3-5-haiku-latest` |
| Secrets needed | `CAPTURE_SECRET`, `ANTHROPIC_API_KEY`. `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically |
| DB role | service role, so it bypasses RLS (see the grants trap below) |
| Returns | `{ ok, staged, headline, description, board, proposed, owner, confidence, est_minutes, summary }` |

Flow inside the function: insert the raw memo into `inbox`, call the Anthropic API with the interpreter system prompt, insert one staged `todos` row into section `📥 Inbox · uncategorized captures`, then update the `inbox` row with `routed`, `routed_to='Staging Area'`, `confidence`, `dest_guess` and `headline`. If the Anthropic call fails the note is still staged, with `stage_conf='lo'` and the description "Interpreter offline, needs your eyes." Nothing is dropped.

The Drafts action script is a single Script step. It POSTs `draft.content`, archives the draft on success, and shows an error on failure. The secret lives in the Supabase secrets store and in the action, never in this document.

### Stage 2b: the backstop sweep

| Fact | Value |
|---|---|
| Skill | `task-capture` |
| Trigger id | `trig_01Dmm4JdFxtwkkzJsDCR4TZM`, name "Task Capture, Drafts sweep (every 2h)" |
| Cron (UTC) | `0 1,3,11,13,15,17,19,21,23 * * *` |
| In Eastern | 7am, 9am, 11am, 1pm, 3pm, 5pm, 7pm, 9pm, 11pm |
| Enabled | yes |
| Reach | Drafts through the desktop bridge, so it needs the desktop app online |
| On demand | "hardpull", "hard pull", "pull my tasks", "process my drafts", "sweep my drafts", "capture my tasks", "empty my drafts", "run the task capture" |

Unattended runs ask nothing and leave a report. A hard pull is interactive: show the planned table, get a quick OK, unless Scott says just do it.

### Stage 3 to 6

`inbox` is the raw log and the audit trail. The Staging Area is the gate. Approval writes the destination row. The draft is tagged `task-added` and archived, which is what stops a second capture. Archiving never deletes, so the original words survive in Drafts as well as in `inbox`.

The All ToDos page carries a **Recent captures** strip at the top that reads the newest `inbox` rows live (note, then `routed_to`, then time) with a realtime subscription. That strip is the at a glance proof the pipeline is moving.

---

## The interpretation contract

Set Aug 15 2026 after Scott pushed back twice, having asked for it "many times in the past". The trigger for it was a draft he filed Aug 13: "Bug - claude did not attempt to interpret or assign a task to anything that came in today - I have to sort all of it." Capture that only relays his words moves the sorting work onto him, which is the opposite of the point.

Every captured note gets interpreted, not dumped. Four parts, all required.

| # | Part | Column | Rule | Why it exists |
|---|---|---|---|---|
| 1 | Clean headline | `todos.task` | His rough dictation rewritten as one short imperative line. Fix speech to text garble, drop filler, keep his meaning, invent nothing. Split a multi task note into several rows. | The headline is what he skims. Walking dictation is messy, and a messy line has to be re read and rewritten before it can be acted on. |
| 2 | Short description | `todos.staging_note` | One plain sentence, under 15 words, describing the TASK. Not the routing rationale. | The v0.3 and v0.4 pages wrote the reasoning here and Scott corrected it. He does not need to be told why Claude guessed; he needs to remember what the note was about. |
| 3 | Pre-selected dropdown | `stage_board` plus `stage_guess` or `stage_cat` and `stage_own` | Pick one of the two Staging Area dropdowns and fill it. The other stays as his override. | Confirming a suggestion is one tap. Sorting a blank pile is the work he was trying to avoid. |
| 4 | Raw text kept verbatim | `inbox.text` | Never condensed, never cleaned. | This is the 🍿 Popcorn view. Dictation garbles things, so the original has to be one tap away to sanity check the headline against. |

Two more fields are always set, never left null:

- `stage_conf`, exactly `lo`, `mid` or `hi`.
- `est_minutes`, an integer. 5 for a trivial errand, 15 to 30 for normal, 60 or more for real work.

### The join rule that makes Popcorn work

The Staging Area joins the raw dictation to the staged row by matching `inbox.headline` to `todos.task`. **Those two strings must be written identically.** If a writer cleans the headline in one place and not the other, Popcorn silently shows nothing for that row. Captures created before Aug 15 2026 have no raw text stored and the page says so rather than pretending.

### The two dropdowns

`stage_board` decides which one is live. The column comment on `todos.stage_board` states it: "Staging Area: which dropdown Claude pre-selects. todays = the Todays To-Do section in stage_guess. alltodos = the All ToDos category in stage_cat."

| `stage_board` | Meaning | Fill | Leave null |
|---|---|---|---|
| `todays` | Scott's personal life: errands, health, family, work admin, things to watch or read, places, phrases, people | `stage_guess` = one exact Todays To-Do section | `stage_cat`, `stage_own` |
| `alltodos` | Build work on the Project YOU site itself: a feature, a bug, a page redesign, anything that changes the software | `stage_cat` = one exact All ToDos category, `stage_own` = `Scott` or `Claude` | uses `🧩 New projects to build` in `stage_guess` as a resting value |

Allowed `stage_guess` values (the Todays list, copied exactly): `Core To-Dos`, `Tomorrow's Core To-Dos`, `After Core`, `⏳ Waiting On`, `🧩 New projects to build`, `Work/Amazon`, `Tracking`, `💬 Asa topics`, `🎓 Carson College`, `Physical Health`, `Mental Fitness`, `Emotional Health`, `Social Well-Being`, `Environmental Health`, `Recreational Health`, `Sense of Purpose (Ikigai)`, `Scotts Uniqueness`, `🅿️ Parking Lot`, `🎬 Movie List`, `👋 Friends Visit`, `✈️ Future Travel`, `💬 Clever Phrase`.

Allowed `stage_cat` values (the All ToDos list): `⭐ This Session`, `🔧 Fixes to make`, `🐞 Known Bugs`, `Dashboards`, `Habit Modules`, `Quantified Self`, `Editors`, `Operating System`, `Parking Lot`, `Mission Control`.

Neither list is enforced by a database constraint. The edge function validates against its own copy and falls back to `Core To-Dos` or `Operating System` when the model returns something off list. The sweep has the same lists in its prompt with no validation step, so a typo there lands in the row.

### The watermark: the thing that breaks silently

The sweep used to look only at drafts created since 3am today. Any run that was missed, because the desktop was asleep at the firing time, left that day's drafts permanently ineligible: the next run's window had already moved past them. **37 drafts from Aug 10 to 14 2026 were stranded this way, 11 of them from Aug 14 alone, none tagged `task-added`.** 17 more went the same way on Aug 15. The scheduled task fired on time throughout and exited quietly, because its own prompt says that if the Drafts connector is unreachable it should stop silently.

The fix, Aug 15 2026:

- **`board_meta.drafts_sweep_watermark`** holds an ISO timestamp as a JSON string.
- The sweep processes every inbox draft created **strictly after** that timestamp, oldest first.
- If the key is missing, it falls back to the last 24 hours and carries on.
- It advances the watermark **only after** every draft in the batch is captured and archived, setting it to the creation time of the newest draft processed.
- A run that fails partway leaves the watermark alone. Re-doing a draft is harmless because the `task-added` tag stops duplicates. Losing one is not harmless.
- **Never move the watermark backwards.** It is also what protects Scott's 50 plus standing older drafts, which he keeps on purpose and does not want swept.

Scott's call on the 37 stranded drafts: leave them alone, just fix it going forward.

The advance statement:

```sql
insert into board_meta (key, val, updated_at)
values ('drafts_sweep_watermark', to_jsonb('<ISO timestamp>'::text), now())
on conflict (key) do update set val = excluded.val, updated_at = now();
```

**Why this is the thing that breaks silently:** a stalled watermark looks exactly like a quiet day. The trigger still fires, the run still reports, and nothing in the UI says "the last 9 runs captured nothing." The only honest signal is the watermark's own `updated_at`. As of this verification the watermark reads `2026-08-15T11:21:00` and was last written `2026-08-15 16:52 UTC`, while the trigger last fired `2026-08-16 11:14 UTC`. That is roughly 9 firings with no advance, which is the desktop bridge being unreachable, not a quiet day.

### Diagnosing "the sweep isn't working"

- `drafts_get_drafts` with no `createdAfter` **times out** against his inbox, because there are too many drafts. Always pass `createdAfter`.
- A timeout is not evidence the connector is down. `drafts_list_workspaces` returns instantly and proves the bridge is alive.
- Check actual draft timestamps before concluding anything, and never tell him nothing arrived without showing the newest draft's date.

---

## The Staging Area

`staging-area.html`, live at **v0.5**, nav item 3, directly after All ToDos.

### It is a mandatory gate

**Drafts app, then Staging Area, then Scott approves, then the appropriate board.** Nothing captured from Drafts may appear on a board, in any form, until he has approved it. There is no exception for high confidence. Scott stated this twice on Aug 15 2026 and it replaces the earlier Aug 12 "alongside mode" design, where high confidence captures auto filed and only shaky ones parked.

Both writers had to change:

- The sweep prompt used to say "use Inbox by default, or an obviously correct existing section", so it filed straight to the board whenever it felt confident. Rewritten to always use `📥 Inbox · uncategorized captures`.
- The `capture` function used to route directly into `todos`, `connections`, `movies`, `quotes` and `future_travel`. Rewritten to classify and then park.

**A gate has two halves, and the first fix only closed one.** Staged rows live in `todos` with `section = '📥 Inbox · uncategorized captures'`, and the Todays Tasks board was pinning that exact section to the top of the board ("Inbox always shows, always first"). So every unapproved capture appeared on his list anyway, displayed as "📥 Tasks to sort". Fixed in `index.html` v5.23 by filtering the Inbox section out of the board entirely. The lesson generalizes: stopping the write is not the same as hiding the row, so when something should not appear somewhere, check every surface that reads that table.

Naming note: the DB section key is and stays `📥 Inbox · uncategorized captures`. "📥 Tasks to sort" is a display only rename in a `DISPLAY` map in `index.html`.

### Confidence: `stage_conf`

| Value | Dot | Group | Meaning |
|---|---|---|---|
| `lo` | red | Scott to review | Guessing. The destination is not clear from the note. |
| `mid` | orange | Scott to review | Plausible, worth a glance. |
| `hi` | green | Looks clear | Unmistakable. Eligible for the "Approve all" sweep on that group. |

Group headers are "Scott to review" in dark amber `#c68a2e` and "Looks clear" in dark green `#1e8e5a`, with no counts. Standing instruction to every writer: use `hi` only when the destination is unmistakable, because an honest `lo` costs him far less than a confident wrong answer.

**The gotcha that silently broke the dots:** `stage_conf` must be the abbreviated `lo` / `mid` / `hi`. A row written as `low` fell through to the `mid` default, so everything rendered orange. `confOf()` now accepts both spellings, but writers must emit the short form.

### The row

1. **Headline**, from `todos.task`.
2. **Read line**, one plain sentence from `todos.staging_note`, no "Claude reads this as" preamble.
3. **🍿 Popcorn**, toggles to "Hide Popcorn", reveals the raw dictation from `inbox.text`.
4. **💬 comment**, auto saves on blur, with 🎤 dictation. The comment becomes the destination record's note or meaning when the row files to a module.
5. **Two dropdowns**, pre-set per the interpretation contract, and they double as the reroute control. The Todays sections are read live from `todos`, never hardcoded.
6. **est and act minute boxes**, mirroring Todays Tasks, writing `todos.est_minutes` and `todos.actual_minutes`. A faint dash placeholder was added in v0.4 because empty boxes read as "the feature is missing".
7. **Approve**, **Park it** (small link centered under Approve), **Dismiss**, and **Send to All ToDos**.

A search box sits at the bottom of the page and a Features card explains every label.

### The four actions and what each writes

| Action | What it writes | Notes |
|---|---|---|
| **Approve** | For a Todays destination: sets `todos.section` to the chosen section, clearing the row out of the staging list. For a Learning module destination: inserts into that module's own table, then deletes the `todos` row. | Shows a few second Undo strip before committing. Undo deletes the module row and restores the capture from a full snapshot. If the module insert succeeds but the `todos` delete fails, the module row is deleted again rather than leaving a duplicate. |
| **Reroute** | The same as Approve, but to a destination other than the guess. Logged with `agreed = false`. | Rerouting is the training signal, so it must be logged, not treated as a correction to hide. |
| **Park it** | Files the capture straight to the existing `🅿️ Parking Lot` section, skipping the dropdown. | The Parking Lot section already existed on the board. Do not create a new one. |
| **Dismiss** | Soft delete: moves the `todos` row to section `🗑️ Dismissed` (9 rows today), leaving `done = false`, recoverable from the Dismissed bin with its own Undo. | The source Drafts note stays archived and is never hard deleted. |

`Send to All ToDos` is the fifth control and is logged as its own action, `send_board`. It uses `stage_cat` and `stage_own` to place the item on the All ToDos project board (`session_todos`) rather than a Todays section.

Every one of these writes a row to `staging_events`. See the learning loop below.

### The mini calendar and `stage_date`

`todos.stage_date` is a date column and its comment is the specification: "Staging Area mini calendar. Used by destinations that record a date: 🎬 Movie List (when to watch) and 👋 Friends Visit (when to meet). Carried into `movies.watch_on` / `connections.happened_on` on approval."

- The date picker appears **only** on those two destinations. Every other destination has no date to record, so showing one would be noise.
- 🎬 Movie List asks "watch on", and on approval `stage_date` is written to `movies.watch_on`. The column comment: "When Scott plans to watch it, set from the Staging Area mini calendar. Null means no date chosen."
- 👋 Friends Visit asks "meet on", and on approval `stage_date` is written to `connections.happened_on`.
- **Friends Visit with no date set leaves `connections.happened_on` NULL on purpose.** A Friends Visit is a plan, not a logged event, and `happened_on` defaults to `CURRENT_DATE` at the database level, so the approval path has to write NULL explicitly rather than letting the default fire. Getting this wrong back dates a plan to today and it shows up as a connection that already happened.

---

## Routing: which table a capture lands in

The gate means routing is always a **proposal** until Scott approves. What follows is what the interpreter should propose, and where the row lands once it is approved.

### Destination map

| Destination | Trigger signals in the text | Table on approval | Columns written |
|---|---|---|---|
| Todays Tasks sections | anything personal that is a task | `todos` | `section` (the chosen section), `task`, `est_minutes`, `position`, `bucket='today'`, `status='todo'` |
| `⏳ Waiting On` | plainly waiting on another person | `todos` | as above with that section |
| `Work/Amazon` | the note mentions **Amazon** as his job (a standing rule Scott stated Aug 13) | `todos` | as above |
| `💬 Asa topics` / `🎓 Carson College` | names Asa, or Carson's college business | `todos` | as above |
| `Social Well-Being` | a lunch, coffee or social plan | `todos` | as above. Note the completion trigger below |
| `🧩 New projects to build` | "build X", a new project idea | `todos` | as above |
| ✈️ Future Travel | travel, trip, go to, visit, destination, a place he wants to go | `future_travel` | `place` (NOT NULL), `city`, `country`, `recommender`, `notes`, `kind` defaults to `destination`. `flag`, `lat`, `lng` left null and enriched later by the map view |
| 👋 Friends Visit / Connections | connection, connect, saw, met, call, catch up with, a person he wants to see | `connections` | `person`, `kind`, `place`, `notes`, `happened_on` from `stage_date` or NULL for a plan |
| 🎬 Movie List | movie, watch, show, film, series | `movies` | `title` (NOT NULL), `kind` (`movie`, `tv`, `series`, `documentary`), `recommender`, `notes`, `status` defaults to `want to watch`, `watch_on` from `stage_date` |
| 💬 Clever Phrase | a saying or phrase worth keeping. "Little-known fact" rides as a slide inside Clever Phrase, it is not its own board | `quotes` | `text` (NOT NULL), `meaning`, `author`, `is_new` defaults true, `source_module` set to the capturing surface (`staging`) |
| All ToDos categories | build work on the site itself, including `🐞 Known Bugs` for a bug report about the site | `session_todos` | `cat` from `stage_cat`, `own` from `stage_own`, `txt`, `note` |
| Midnight Run | work Scott wants built overnight | `session_todos` | `lane='queue_run'`, `run_status='queued'`, `run_order`, spec in `note`. Reached from the All ToDos board's "Send to Midnight Run" button, not directly from a capture |
| Ready to Code | the same queue, worked on demand | `session_todos` | `code_status='requested'`, then `running`, then `complete` or `error`. Set from the Midnight Run control page |
| 🅿️ Parking Lot | a someday maybe idea | `todos` section `🅿️ Parking Lot`, or `session_todos` cat `Parking Lot` | whichever board fits |

### The default

**When unsure, the Inbox section.** Every capture already lands in `📥 Inbox · uncategorized captures` and stays there until approved, and if no destination is convincing the correct proposal is to leave it there with `stage_conf='lo'`. The Inbox exists for uncategorized captures, so routing there is a correct outcome, never a failure. A note is never silently discarded, and it is never invented into something more specific than what he said.

Two guards worth keeping from the earlier Talk to Capture spec:

- **Trigger false positive guard.** If a trigger word matched but the required field cannot be parsed ("watch out for the ice" matches movie but has no title), fall through to the Inbox rather than writing a junk row.
- **Idempotence.** Dedupe against the last 60 seconds of the same table on the same `place`, `person` or `title`, so a double tap does not double write.

`✓ Completed Tasks` is never a destination.

---

## The learning loop

`public.staging_events` is the training record. One row per decision, written by the Staging Area on every approve, reroute, park, dismiss and send_board. Before v0.3 every metric on the page was a hardcoded placeholder.

| Column | Meaning |
|---|---|
| `todo_id` | the staged `todos` row |
| `headline` | the task text at decision time |
| `guessed` | the destination Claude proposed |
| `chosen` | the destination Scott picked |
| `conf` | the `stage_conf` on the row |
| `action` | `approve`, `reroute`, `park`, `dismiss`, `send_board` |
| `agreed` | true when the guess was accepted as is |
| `est_minutes`, `actual_minutes` | for the estimate accuracy metric |
| `decided_at` | default `now()` |

RLS is `owner_by_email`. The page holds the scores blank until 8 decisions exist (5 timed tasks for estimate accuracy) rather than showing a fake number off a tiny sample.

### The percent approved as is query

```sql
select round(100.0 * count(*) filter (where agreed) / nullif(count(*), 0)) as pct_approved_as_is,
       count(*) as decisions
from staging_events
where action in ('approve','reroute','park','dismiss');
```

As of 2026-08-16 that returns **54 percent over 13 decisions**. The full table holds 23 rows: 10 `send_board`, 7 `approve`, 4 `reroute`, 2 `dismiss`, and 0 `park`. Every `send_board` row is logged with `agreed = false`, so including them drops the figure to 30 percent (7 of 23). Decide deliberately which set the sparkline uses, and say so on the page, because the two numbers are far apart.

The 6 week sparkline is the same measure bucketed by week:

```sql
select date_trunc('week', decided_at)::date as wk,
       count(*) as decisions,
       round(100.0 * count(*) filter (where agreed) / nullif(count(*), 0)) as pct
from staging_events
where action in ('approve','reroute','park','dismiss')
  and decided_at > now() - interval '6 weeks'
group by 1 order by 1;
```

To see which guesses are wrong most often, which is the point of collecting this:

```sql
select guessed, chosen, count(*) n
from staging_events
where agreed is false and chosen is not null and chosen <> guessed
group by 1,2 order by n desc;
```

---

## Downstream automations that fire on capture

A captured task can set off a database trigger once it is completed, so a capture change can move quantified self data without anyone touching the quantified self code. Both triggers are `AFTER UPDATE` on `public.todos` and both are SECURITY DEFINER. Full detail is in 03-Data-Model.md.

| Trigger | Function | Fires when | Writes |
|---|---|---|---|
| `trg_habit_to_qs_log` | `habit_to_qs_log()` | a `todos` row flips to `done` and `is_habit` is true | upserts `qs_log` on `(date, tracker, source)`. Tracker is `todos.tracker`, else the task text with a trailing bracketed part stripped. Group defaults to Mental Fitness when `qs_group` is empty. Date is Eastern, from `done_at` |
| `trg_social_wellbeing_completion` | `sync_social_wellbeing_completion()` | a row in section `Social Well-Being` is completed | inserts into both `connections` and `daily_completed` |

Two consequences that matter to this pipeline:

1. **Approving a capture into `Social Well-Being` creates a future `connections` row the moment that task is ticked.** So a social capture can reach `connections` by two different routes: the Staging Area module path (👋 Friends Visit, `happened_on` from `stage_date` or NULL) and this trigger. If connection counts look inflated, this is why.
2. **The two triggers disagree about what a day is.** The habit trigger converts to Eastern. The Social Well-Being trigger uses `coalesce(for_date, current_date)` on a server running UTC. Late evening Eastern activity can be dated a day forward by one and not the other.

The habit trigger fires only on a false to true transition and never deletes, which is why unticking a habit did nothing until the page was made to clear its own row.

---

## Failure modes and how to spot them

### 1. The watermark is not advancing

**Symptom:** the sweep fires on schedule, reports nothing to do, and drafts pile up in Drafts untagged. Looks identical to a quiet day.

**Cause:** the desktop bridge is unreachable, so the run stops silently by design and correctly leaves the watermark alone. Or a run failed partway. Either way, nothing has moved.

```sql
select val #>> '{}' as watermark,
       updated_at,
       now() - updated_at as age
from board_meta
where key = 'drafts_sweep_watermark';
```

If `age` is more than about 3 hours during his waking day, the sweep has not completed a run. Cross check the newest capture:

```sql
select max(created_at) as newest_capture, count(*) as total from inbox;
```

Then check Drafts itself with `drafts_get_drafts` and an explicit `createdAfter`, and confirm the bridge is alive with `drafts_list_workspaces` before concluding anything.

### 2. Drafts archived without landing

**Symptom:** a note is tagged `task-added` and out of the Drafts inbox, but there is no row anywhere.

**Cause:** the archive step ran and the insert did not, or the insert failed and was not checked.

Check for `inbox` rows that never produced a staged row, matching on the headline join:

```sql
select i.created_at, i.headline, i.routed, i.routed_to
from inbox i
where i.created_at > now() - interval '7 days'
  and i.source = 'drafts'
  and not exists (
    select 1 from todos t where t.task = i.headline
  )
  and not exists (
    select 1 from staging_events s where s.headline = i.headline
  )
order by i.created_at desc;
```

Any row here was logged but never staged and never decided on. Also look for the explicit failure flag:

```sql
select id, created_at, left(text, 80) as text, routed, routed_to
from inbox
where routed = false
order by created_at desc;
```

### 3. The capture function reports success while writing nothing (the grants trap)

**This is the worst one, because everything looks fine.** In Supabase, RLS policies and table grants are two different things and you need both. A policy says who is allowed. A grant says who can reach the table at all. A table with policies and no grants fails every write, silently.

On Aug 14 2026, `service_role` held only REFERENCES, TRIGGER and TRUNCATE on **every** table in `public`. The `capture` function authenticates with the service key, so every write it ever attempted was rejected at the database. Drafts got HTTP 200 back, the green bar said the notes were swept, and nothing was stored. The same day, `staging_events` was created with an owner policy and no grants to `authenticated`, so every approve and dismiss failed to log while the metrics sat at zero looking perfectly configured.

Fixed with explicit grants plus a default so new tables inherit them:

```sql
alter default privileges in schema public
  grant select, insert, update, delete on tables to service_role;
```

Check any time a write vanishes:

```sql
select table_name, string_agg(privilege_type, ', ' order by privilege_type) as privs
from information_schema.role_table_grants
where table_schema = 'public'
  and grantee = 'service_role'
  and table_name in ('todos','inbox','staging_events','movies','connections','future_travel','quotes','board_meta')
group by table_name
order by table_name;
```

A table showing only REFERENCES, TRIGGER and TRUNCATE is unwritable by that role. All eight read SELECT, INSERT, UPDATE, DELETE as of this verification.

**Still outstanding:** the `capture` function returns `ok: true` even when `staged = false`, and its `inbox` insert never checks `error`. Drafts reads only the HTTP status, so it will still report success on a failed stage. The standing rule is that a service must not return success unless it has confirmed the write landed. Fix the function to return the failure and make the Drafts action say "stored 0, failed N".

### 4. Duplicates

**Symptom:** the same thought appears twice in the Staging Area.

**Causes, in order of likelihood:** the instant push and the sweep both processed the same draft because the archive or tag step did not run; a sweep re-ran a batch after a partial failure and the `task-added` guard was missing; a double tap on the Drafts action.

```sql
select task, count(*) n, min(created_at) first_seen, max(created_at) last_seen
from todos
where section = '📥 Inbox · uncategorized captures'
group by task
having count(*) > 1
order by n desc;
```

And on the raw side, near duplicate captures within a minute of each other:

```sql
select a.id, b.id, a.created_at, left(a.text, 60) as text
from inbox a
join inbox b
  on a.text = b.text
 and a.id < b.id
 and abs(extract(epoch from (a.created_at - b.created_at))) < 300
order by a.created_at desc;
```

Re-doing a draft is the acceptable failure. Losing one is not, which is why the guard is the `task-added` tag rather than a narrower sweep window.

### 5. The installed skill file has drifted from the trigger prompt

The current interpretation contract and the watermark live in the **scheduled trigger's prompt**. The installed `task-capture` SKILL.md is still the pre Aug 15 version: it says today's drafts only, it has no watermark, and it does not set `stage_guess`, `stage_conf`, `staging_note`, `stage_board`, `stage_cat`, `stage_own` or `est_minutes`. A hard pull run from the skill alone will therefore capture without interpreting and can re-strand a day. Either update the skill file to match the trigger prompt, or treat the trigger prompt as canonical and say so inside the skill. See 06-How-We-Work.md for the canonical source rule.

---

## How to re-verify this document

Run these against project `arnjntspmrhigodlssbn`. Direct network to `supabase.co` is firewalled from the container, so use the Supabase MCP tools rather than curl.

**Every number in this document**

```sql
select
  (select val #>> '{}' from board_meta where key='drafts_sweep_watermark') as watermark,
  (select updated_at from board_meta where key='drafts_sweep_watermark')   as watermark_updated,
  (select count(*) from inbox)                                             as inbox_rows,
  (select max(created_at) from inbox)                                      as inbox_newest,
  (select count(*) from inbox where routed = false)                        as inbox_unrouted,
  (select count(*) from staging_events)                                    as staging_events_rows,
  (select count(*) from todos
     where section = '📥 Inbox · uncategorized captures' and not done)     as staged_now,
  (select count(*) from todos where section = '🗑️ Dismissed')             as dismissed_rows,
  (select count(*) from movies)                                            as movies,
  (select count(*) from connections)                                       as connections,
  (select count(*) from future_travel)                                     as future_travel,
  (select count(*) from quotes)                                            as quotes;
```

Values on 2026-08-16: watermark `2026-08-15T11:21:00` updated `2026-08-15 16:52 UTC`, inbox 43 rows with the newest at `2026-08-15 16:52 UTC` and 1 unrouted (a `daily-habits-editor` row from Aug 11, not a Drafts capture), `staging_events` 23, staged now 3, dismissed 9, movies 3, connections 3, future_travel 21, quotes 60.

**The Staging Area columns and their comments**

```sql
select c.column_name, c.data_type, c.is_nullable, c.column_default, pgd.description
from information_schema.columns c
left join pg_catalog.pg_statio_all_tables st
       on st.schemaname = 'public' and st.relname = c.table_name
left join pg_catalog.pg_description pgd
       on pgd.objoid = st.relid and pgd.objsubid = c.ordinal_position
where c.table_schema = 'public' and c.table_name = 'todos'
  and c.column_name in ('stage_conf','stage_guess','staging_note','stage_board','stage_cat','stage_own','stage_date')
order by c.ordinal_position;
```

The comments on `stage_board` and `stage_date` are the only written specification of those two columns. Read them before changing either. Do the same for `movies.watch_on`.

**The destination tables**

```sql
select table_name, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('inbox','staging_events','movies','connections','future_travel','quotes')
order by table_name, ordinal_position;
```

**Where captures have actually been routed**

```sql
select source, routed, routed_to, count(*) n, max(created_at) last
from inbox group by 1,2,3 order by n desc;
```

On 2026-08-16: 27 to `Staging Area` (the gate era, newest Aug 15), 14 to `Todays Tasks · Inbox` and 1 to `Clever Phrases` (both pre gate, newest Aug 12), 1 unrouted from the habits editor.

**The percent approved as is metric**

Use the query in the learning loop section, and check the action mix as well:

```sql
select action, count(*) n,
       count(*) filter (where agreed) agreed_true,
       count(*) filter (where agreed is false) agreed_false,
       max(decided_at) last_at
from staging_events group by action order by n desc;
```

**The triggers on `todos`**

```sql
select tgname, pg_get_triggerdef(t.oid)
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname = 'todos' and not t.tgisinternal;
```

Expect exactly `trg_habit_to_qs_log` and `trg_social_wellbeing_completion`.

**Grants, the silent write killer**

Use the query in failure mode 3.

**The `capture` edge function and its version**

Not available over SQL. Use the Supabase MCP tools `list_edge_functions` and `get_edge_function` with slug `capture`, or `supabase functions list` from the CLI. On 2026-08-16 it is version 7, status ACTIVE, `verify_jwt=false`. Read the source to confirm it still parks everything rather than filing, and check whether it still returns `ok: true` on a failed stage.

**The sweep trigger**

Use the scheduled task tools to list triggers and read `trig_01Dmm4JdFxtwkkzJsDCR4TZM`. Confirm it is enabled, that the cron is still `0 1,3,11,13,15,17,19,21,23 * * *` UTC, and that its prompt still carries the watermark block and the interpretation contract. Compare `last_fired_at` against the watermark's `updated_at`, since a gap between them is failure mode 1.

**The Staging Area page version**

Fetch `https://xrodgers28.github.io/ProjectYou/staging-area.html` with WebFetch, not curl, and read the version marker. It was v0.5 on 2026-08-16. If you publish a new version, bump the marker and regenerate or delete the offline mock, because a stale mock has already caused Scott to report a missing feature that was live.

---

**Related:** 01-Product-Overview.md for what the system is for. 03-Data-Model.md for the full table, trigger and column reference. 04-Runbook-Build-and-Deploy.md for publishing the Staging Area page and deploying the `capture` function. 06-How-We-Work.md for the canonical source rule, the living docs rule and the no dash writing rule.

*As of August 16th, all times EST*
