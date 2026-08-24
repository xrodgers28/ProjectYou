# SAMPLE — Glossary

This sample is deliberately pitched at a smart reader who does not code: every entry says what the thing is in ordinary words before it names a single file, table or column, so someone who uses the system daily can follow it without opening a terminal. At the 170 words per term this sample actually runs, a full 45-term glossary would come to roughly 7,600 words, which is about 28 printed pages, or a 35 minute read cover to cover.

---

## `gzb64`

**Plain English.** A column on the `pages` table that holds a whole web page squeezed down and rewritten as plain text. The page is gzipped, then base64-encoded, so a 100 KB HTML file becomes one long string of ordinary characters that can travel through a SQL statement without anything choking on it.

**Why it matters.** It is the entire deploy mechanism, not a cache. Writing that column is what fires the publish trigger, and the GitHub Action reads only `gzb64`, so a row with just `html` set never reaches the site at all. A null or empty value is skipped rather than blanked, which is why an empty `pages` row does not mean a dead page. To force a republish with no content change you write the column to itself.

**Where it shows up.** `public.pages.gzb64` and `public.pages_upload.gzb64`, the `pages_publish_now` trigger condition, `.github/workflows/publish.yml`, and doc-02-architecture.md section 3.

---

## The version guard

**Plain English.** A check inside the publish workflow that compares the version number on the page being published against the version number of the page already live, and refuses the publish if the incoming one is strictly older. Blocked pages are named in a `PUBLISH-BLOCKED.md` file in the repo, which deletes itself on the next clean run.

**Why it matters.** Several chats work on this site at once, and the guard is what stops a session that started from a stale copy overwriting newer work. It has two real holes, both of which have cost real work: a page with no recognizable version marker publishes with no check at all, and an equal version is not blocked, which is how an equal-numbered publish of `automated-tracking.html` silently destroyed another session's changes on Aug 16, 2026.

**Where it shows up.** Step 6 of `.github/workflows/publish.yml`, the `PUBLISH-BLOCKED.md` file in the repo root, doc-02-architecture.md section 3, and the standing rule in doc-06-how-we-work.md: never publish a version number lower than what is live.

---

## The recipe method

**Plain English.** A way of updating a very large page by sending the instructions for the change instead of the changed page. A one-off edge function fetches the current live file straight from GitHub, applies the edits as ordinary find-and-replace rules, and writes the result back itself. Nothing large ever travels through a tool call.

**Why it matters.** Big pages used to be uploaded as base64 in verified chunks, and one wrong character fails the checksum. On Aug 18, 2026 three consecutive chunked uploads of `automated-tracking.html` v1.7 corrupted at two different block sizes and the page sat unpublished for two days. The recipe moves about 3 KB of human-readable rules rather than 14 KB of base64: nothing to transmit means nothing to corrupt. The safety comes from a read-only `?check` mode that returns a sha256 fingerprint and writes nothing, so you only call `?write` once the local and server fingerprints match.

**Where it shows up.** doc-04-runbook-build-and-deploy.md section 5.3, and the `build_recipe` table.

---

## The shared nav layer

**Plain English.** The site's navigation bar is not maintained page by page. Every page ships an empty skeleton of the bar, one script (`nav-config.js`) declares what the links should be, and a second script (`navpatch.js`) rewrites the skeleton on load. The publish workflow staples both scripts onto every page automatically, so nobody wires them up by hand.

**Why it matters.** It is the cheap path and the correct one: `navpatch.js` is about 6.7 KB, so a site-wide change is one small publish instead of re-encoding pages up to 117 KB each. It also has hard edges. A group named in the config overwrites that whole group everywhere, so adding one link means listing all of them. A group missing from the config keeps whatever links are hardcoded on each page, which is why an old Parking Lot group survives on 30 of 35 pages. A page with no nav skeleton at all gets nothing.

**Where it shows up.** `nav-config.js`, `navpatch.js`, step 7 of `publish.yml`, doc-02-architecture.md section 5.

---

## The 2am-to-2am day

**Plain English.** A day in this system runs from 2am Eastern to 2am Eastern, not midnight to midnight. Scott often works past midnight, and that work belongs to the day he started, so anything logged before 2am is filed under the previous date.

**Why it matters.** The rule only works if there is exactly one copy of it. The moment a page writes its own little `todayKey` helper, the two definitions drift and the drift is invisible for days, because both look right most of the time. So every page calls the shared helper, and the database has a matching twin so a browser and a query never disagree about which day a row belongs to. Writing a fresh date helper on a page is the bug, even when the arithmetic happens to be correct.

**Where it shows up.** `py-day.js`, loaded in the `<head>` before a page's own script, exposing `PY.today()` and `PY.day()`. The SQL twins are `public.py_today()` and `public.py_day(ts)`. Separate from the nightly habit reset, which runs on its own 4am ET schedule.

---

## The Clarity Compass

**Plain English.** The seven-part model of well-being the whole program is organized around: Physical Health, Environmental Health, Social Well-Being, Recreational Health, Sense of Purpose, Mental Fitness and Emotional Health. Project YOU began after a flat 50th birthday, and the Compass is how a vague sense of "get better at life" was turned into seven named places work can actually go.

**Why it matters.** It is the shared vocabulary that keeps the pieces aligned. The to-do board's sections are Compass sections, the habit modules and trackers hang off them, and new source material is mapped onto them rather than filed loose. Two rulings are worth knowing: money belongs to Emotional Health rather than being an eighth section, and the canonical spelling is Social Well-Being with the hyphen, a named exception to the no-dashes writing rule, because a database trigger matches that string exactly.

**Where it shows up.** Board sections in `todos`, `qs-wheel.html` (a static image, its interactive drawing code is dead), doc-10-foundations.md.

---

## Compass Sources

**Plain English.** The page where a new book or podcast is read, broken into individual points, and mapped onto the Clarity Compass. It is a matrix, not a list: the seven life areas are column groups, tenets are the columns, sources are the rows, and every filled cell is one source saying something about one tenet.

**Why it matters.** This is how the Compass sections were decided in the first place, so it is the audit trail behind the model rather than a reading log. As of Aug 18, 2026 it held the seven areas plus a holding pile called "Not sure yet", 37 active tenets, 9 sources and 59 notes, 14 of them placeholders with no insight yet. Coverage is openly uneven. Since v2.0 the page holds no content of its own and recomputes every count on load, so the numbers cannot quietly go stale.

**Where it shows up.** `blueprint.html`, in the Operating System nav under Maps. Renamed from "Knowledge Graph" on Aug 16, 2026 to end a collision with `knowledge-graph.html`, which is a different page entirely.

---

## `kg_areas`, `kg_tenets`, `kg_sources`, `kg_links`

**Plain English.** The four tables behind Compass Sources. `kg_areas` holds the seven life areas plus the holding pile, `kg_tenets` the principles inside them, `kg_sources` the books and podcasts, and `kg_links` the individual notes joining one source to one tenet. Cover artwork lives on the source row.

**Why it matters.** Because the page reads these four tables at load, adding a source is a handful of rows rather than a republish, and the stored page shrank from 29,768 characters to 10,376 when it stopped carrying its own contents. The codes are the other half of the design: areas are `A1` to `A7` plus `A0`, tenets `T001` upward, sources `S01` upward, assigned once and never reused or renumbered. A code deliberately says nothing about which area it belongs to, so a tenet can move without breaking a note filed years earlier, and a retired tenet keeps its code forever.

**Where it shows up.** Supabase project `arnjntspmrhigodlssbn`, read live by `blueprint.html`; documented in doc-10-foundations.md section 10.

---

## The Staging Area

**Plain English.** The review screen every captured note has to pass through before it lands anywhere. A dictated thought arrives with a cleaned-up headline, one plain line explaining it, a suggested destination, a confidence dot, and a link that reveals the raw dictation exactly as it was spoken. Scott then taps Approve, Park it or Dismiss.

**Why it matters.** Nothing files itself. This reversed an earlier design where high-confidence notes auto-filed, after both capture paths were caught skipping the gate. The point is that he confirms a suggestion rather than sorting a blank pile, which is what keeps capture fast enough to survive a walk that produces thirty items. Approving a destination is a real move, not a relabel: it inserts into that module's own table and deletes the staged row.

**Where it shows up.** `staging-area.html`, third in the To Do List nav. Rows are `todos` rows in section `📥 Inbox · uncategorized captures` carrying `stage_guess`, `stage_conf` and `staging_note`; every decision writes a `staging_events` row. Full detail in doc-05-capture-pipeline.md.

---

## Session tracker

**Plain English.** The five-column status page published at the end of a working session: a traffic light, what was worked on, its status, a Yes/No or "Got It" button for Scott, and the exact next thing he has to do. It is written for a man reading it cold at 6am on his phone with no memory of the conversation.

**Why it matters.** It is the only artifact of a session that survives the chat scrolling away, which is why it is step 2 of every wrap rather than an afterthought, and why it is the default shape of any status update without being asked for twice. One tracker per conversation, slugged by date and topic, so two chats can never overwrite each other's answers. Anything left amber must already exist as a real to-do row, or it disappears when he closes the tab.

**Where it shows up.** `session-tracker-<slug>.html` pages, indexed by `session-tracker.html` reading the `session_trackers` table. Answers land in `tracker`, dismissed rows in `session_content`. Specs in doc-07-templates.md and doc-06-how-we-work.md.
