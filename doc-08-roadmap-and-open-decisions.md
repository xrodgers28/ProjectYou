# Roadmap and Open Decisions

**What this is:** the single register of what has been settled, what still needs Scott, what is known to be broken, and what was described in old docs but never built.
**Read this when:** you are about to re-argue a decision, you have hit something that looks wrong, or you are choosing what to build next.
**Last verified:** 2026-08-16, by reading the three recon reports and the four sibling docs in this library, re-running the RLS, policy, row count, `board_meta`, `pages` and `session_todos` queries against Supabase project `arnjntspmrhigodlssbn`, listing the live scheduled tasks, and reading six project memory files. Every number and every claim below has a query or a file behind it, and the queries are at the end.
**Supersedes:** Reconciliation-Watch-List.md, Nightly-Reconciliation-Report.md (the findings log), Supabase-textplain-support-ticket.md, wheel-publish/DO-NOT-PUBLISH.md, wheel-publish/spec.md (the outstanding list), SETUP-two-fixes.md (the "what needs you" section), Clarity-Compass-nav-handoff.md (open questions), MAPS-INDEX-BUILD-SPEC.md (unresolved items), Habit Building Cue Cards - Name Options.md, AI-Intelligence-Scan-2026-08-09.md, Todays-Tasks-Feature-Set.md (the backlog), Interface-Directions.md (the unrouted Inbox rows).

## How to maintain this file

This is the only place in the library where open items live. Every other document states what is true and points here for what is not. When you find a new open question, a new defect or a new gap, add it here in the session you found it, with the evidence that proves it, and add nothing to the bottom of the doc you were reading. When something is settled, do not delete the open item: move it into the decision log with the date it was decided and one line on why, so nobody relitigates it in three weeks. When something is fixed, do not delete the problem: strike it in place by adding the date and what changed, so the next person can see the failure class as well as the fix. Nothing is deleted from this file. It grows, and its history is the point.

For what the system is for, see 01-Product-Overview.md. For how the pieces fit together, see 02-Architecture.md. For the schema, see 03-Data-Model.md. For procedures, see 04-Runbook-Build-and-Deploy.md. For capture, see 05-Capture-Pipeline.md. For working rules, see 06-How-We-Work.md. For who owns which document, see 09-Governance-and-Doc-Rules.md.

---

## 1. Decision log

Settled. Do not re-argue any of these without new evidence. Dates are the date the decision was recorded, not always the date it shipped.

| Date | Decision | Why | Where it is implemented |
|---|---|---|---|
| Aug 8, 2026 | Drafts stays the capture layer | It is the only thing that works on the Apple Watch, and capture speed is the non-negotiable requirement | `task-capture` skill, sweep task `trig_01Dmm4JdFxtwkkzJsDCR4TZM`, 05-Capture-Pipeline.md |
| Aug 8, 2026 | Workflowy dropped. Siri and Apple Reminders ruled out as a capture route | Neither survived the speed and reliability test | Todays-Tasks-Project-Brief.md settled decisions table |
| Aug 8, 2026 | Prototype before plumbing | Cheaper to throw away a mock than a pipeline | Reaffirmed Aug 12 as the mock-first rule |
| Aug 9, 2026 | The name is always "Project YOU", never "Project U" | One name, one search term | Project YOU - Project Instructions.md, all page titles |
| Aug 9, 2026 | The deck is "Habit Building Cue Cards". Airplane names (Take Flight Deck, Cockpit Cards) are retired | The aviation naming was decoration, not meaning | Project YOU - Knowledge Base.md settled decisions |
| Aug 9, 2026 | The airplane metaphor is presentation only, not part of the core program | It was being mistaken for structure | Project YOU - Project Instructions.md |
| Aug 9, 2026 | "5,000 weeks" is kept over the book's 4,000 | Scott's deliberate framing, not an error to correct | Project YOU - Reference Library.md |
| Aug 9, 2026 | Quantified Self stays a component inside Project YOU, not its own project | It is a measurement layer that serves the flagship, and splitting it would fork the trackers | `qs_log`, `qs-dashboard.html`, 03-Data-Model.md |
| Aug 9, 2026 | One global 5 AM rundown covers every project, not one per project | Per-project briefs would be five notifications nobody reads | Task `trig_014n4qmmetCTnT8WT2JNpW78`, cron `0 9 * * *` UTC |
| Aug 9, 2026 | One copy of `global-time-tracker.xlsx`, at Project YOU/Components/Quantified Self Trackers | The duplicate at CoWork/Quantified Self was drifting | Interface-Directions.md Routed log |
| Aug 9, 2026 | "Cool phrases" renamed "clever phrases" everywhere | One vocabulary | `quotes` table, Clever Phrases module |
| Aug 10, 2026 | GitHub Pages is the render host | It is the only host in the chain that renders HTML | `https://xrodgers28.github.io/ProjectYou/`, 02-Architecture.md section 2 |
| Aug 11, 2026 | Supabase Postgres is the single source of truth, not spreadsheets | Phone check-offs, live aggregation and cross-device sync are impossible on a file | `public.todos`, `public.qs_log`, 03-Data-Model.md |
| Aug 11, 2026 | The `pages` table is the publish channel. Deploys never require Scott to upload files through GitHub's web UI | The upload page is unreliable and was a named pain point | `.github/workflows/publish.yml`, 04-Runbook-Build-and-Deploy.md section 2 |
| Aug 11, 2026 | Every publish sets `html = null` | `publish.yml` reads only `gzb64`, so a stale `html` is dead weight that misleads readers | The upsert in 04-Runbook-Build-and-Deploy.md |
| Aug 11, 2026 | The app is Today's Tasks. CrushingIt is a dead name | One name in the docs and in the nav | 03-Data-Model.md naming traps |
| Aug 11, 2026 | The board's code file must stay `index.html` | GitHub Pages serves the site home from that name | Repo root |
| Aug 11, 2026 | No em-dashes, ever, in any deliverable or in chat | Scott's standing style rule | 06-How-We-Work.md |
| Aug 11, 2026 | Privacy first: real data only behind login plus RLS, sensitive notes only in the database | The site is public by URL | RLS policies on `todos`, `qs_log`, `inbox` |
| Aug 12, 2026 | Supabase-domain HTML hosting is a dead end. Do not retry it | Supabase serves any `text/html` as `text/plain` on `*.supabase.co` as an anti-abuse measure, proved with a minimal `cttest` function and a Storage `__test.html` | 02-Architecture.md section 2, memory `projectyou-serving-bug` |
| Aug 12, 2026 | Single owner per page. One session deploys a given page, and never two at once | Four separate clobber incidents, all from concurrent publishes | 04-Runbook-Build-and-Deploy.md section 11 |
| Aug 12, 2026 | Design a new page or component as a mock or prototype first, then build | Set as a global rule after review churn | 06-How-We-Work.md |
| Aug 13, 2026 | Nothing auto-files. The Staging Area is a mandatory gate on every capture | The earlier miss was a silent guess accepted as truth | `staging-area.html`, 05-Capture-Pipeline.md |
| Aug 13, 2026 | Capture reads Drafts through the desktop bridge, not through a Google Drive inbox file | The Drive route needed an action-created file, could only write to the Drive root, and had an unverified overwrite report against it | `task-capture` skill, `capture` edge function |
| Aug 13, 2026 | The staging source is `public.todos` filtered on the Inbox section. The legacy `public.inbox` table is not the staging source | Two stores for one queue drifted immediately | 05-Capture-Pipeline.md |
| Aug 13, 2026 | The publish pipeline carries a version guard, and Supabase pokes GitHub the instant a page is written | An old copy of All ToDos was published over a newer one and wiped a day of work, and GitHub throttles the 5 minute cron to roughly hourly | `publish.yml` version guard, trigger `pages_publish_now`, `github_pat` in Supabase Vault |
| Aug 14, 2026 | The GitHub repo is canonical, not the `pages` table and not `CoWork/ProjectYou-deploy-Aug11/` | Scott uploads files directly, so GitHub receives every change and the database does not. Eight repo files have no `pages` row at all | 02-Architecture.md section 4 |
| Aug 14, 2026 | Every new table needs grants as well as policies, and one row must be written as the real role to prove it | `service_role` held only REFERENCES, TRIGGER and TRUNCATE on every table, so the capture function's writes were silently rejected while returning HTTP 200 | `alter default privileges in schema public grant select, insert, update, delete on tables to service_role`, memory `supabase-grants-trap` |
| Aug 14, 2026 | No paid third-party services | Scott's words: "Why do I have to pay for this? I haven't had to pay for anything else." The free path is also better, because a Cowork session can read the repo, check the live site and test, and a single API call cannot | `code-run` replaced with an inert v2 returning 410, `ANTHROPIC_API_KEY` never set, memory `ready-to-code` |
| Aug 15, 2026 | Publish in blocks of about 1,400 characters, each guarded on the md5 of the prior state | A 5,588 character block was mistyped and had to be rolled back. Eight 1,400 character blocks went through clean straight after, and a later run landed 21 of 21 | 04-Runbook-Build-and-Deploy.md section 2 |
| Aug 15, 2026 | One Session Tracker per chat, slugged by date and topic, with every item key prefixed by the slug | A rolling file let one conversation read back another's answers | `session_trackers`, `session_content`, `tracker` |
| Aug 15, 2026 | Binary assets can never be published through the `pages` table | `publish.yml` skips any path containing `/` and treats every payload as text. Images reach the repo only by Scott dragging them into the inner `assets` folder | 04-Runbook-Build-and-Deploy.md section 5.4 |
| Aug 16, 2026 | Track only what has already happened. No future or scheduled data | A source is scored by the completed events it yields, not by how easy its feed looks | Memory `historical-only-rule`, applied in the Build a Tracker steps |
| Aug 16, 2026 | One definition lives as one database function, and a view owns the definition of "one day" | The backfill, the trigger and every view call the same function, so nothing re-implements it in JavaScript. Any statistic computed in two places will drift | `is_coffee_checkin()`, `v_coffee_days`, 04-Runbook-Build-and-Deploy.md section 9 |
| Aug 16, 2026 | Keep the unit constant across sources for a given tracker | The `AI` tracker is 10 minutes on some days and 1 boolean on others, which makes its history unsummable | Coffee rows are `value=1, unit='boolean'` from every source |
| Aug 16, 2026 | Never Monarch. If a bank feed is genuinely the right sensor later, the tool is SimpleFIN Bridge | Monarch has no public API and the community clients store the account password. That is not a connector, it is a liability | Memory `tracking-inputs-research` |
| Aug 16, 2026 | Green dot contract: a built but empty pipe stays roadmap until the first row lands, and a device that feeds a green app is itself green | Scott's amendment, in his words: "it feeds Apple Health, so I think we should leave that green" | `automated-tracking.html`, 04-Runbook-Build-and-Deploy.md section 9.9 |
| Aug 16, 2026 | `blueprint.html` is deliberately excluded from the system map freshness check | It is titled "Knowledge Graph" and sits in the Maps nav, but its data is a betterment-insight graph of 9 sources mapped onto the Clarity Compass sections. It names no table, function or job, so the nightly check would flag it as stale every night forever | `board_meta.system_map_pages`, memory `living-docs-must-self-verify` |
| Aug 16, 2026 | A page that describes the system must show a stored Last verified date, never one it generates itself | `dfd.html` rendered today's date every day while being four days wrong about four live feeds | `board_meta.system_map_last_verified`, task `trig_014uwjZ62nr12fYG7i6AK1yz` |
| Aug 16, 2026 | The day boundary is 4 AM Eastern | The cron says `0 8 * * *` UTC and `board_meta.midnight_run_time` independently says "4:00 AM". Older docs saying 3 AM are wrong | `reset_daily_habits()` job, 03-Data-Model.md |
| Aug 16, 2026 | Two task lists on purpose: `public.todos` is Scott's life board, `session_todos` is the build queue | They answer different questions and have different lifecycles. This closes the old "which is the master table" argument, which assumed one had to win | 03-Data-Model.md, 05-Capture-Pipeline.md routing map |

---

## 2. Open decisions that need Scott

Each block is a question, the options with what each one costs, a recommendation, and what cannot move until it is answered. Nothing here should be decided by a session on Scott's behalf.

### 2.1 The custom domain: is Supabase or GitHub Pages the front door?

**The question.** Today the only URL that renders is `https://xrodgers28.github.io/ProjectYou/`. Scott has said he wants a clean custom URL, and separately the memory note `deploy-projectyou` records a stated preference to serve from Supabase. Both wants resolve to the same task, because the only way Supabase can serve HTML is behind a custom domain.

**Options.**

1. **Supabase custom domain add-on.** Points a domain at the project so the `site` function serves renderable HTML. Needs the Pro plan plus the add-on, roughly $10 a month, plus DNS. Keeps the current architecture and makes the `pages` table the live source with no GitHub round trip. Cost: it is a paid service, which collides head-on with the Aug 14 no-paid-services decision.
2. **Keep GitHub Pages and point a custom domain at it.** A CNAME file in the repo and a DNS record. Free. Gives the clean URL immediately. Cost: the two-layer publish chain (Supabase writes, GitHub Action commits, Pages rebuilds) stays exactly as it is, with its roughly 20 to 75 second latency and its version guard.
3. **Move to a free static host such as Cloudflare Pages or Netlify, with Supabase kept purely as the data backend.** Free, renders HTML natively, gives the clean URL, and gets off both the broken function hosting and the GitHub Action. Cost: a real migration, a new deploy path to learn and document, and every runbook procedure in 04-Runbook-Build-and-Deploy.md would need rewriting.

**Recommendation.** Option 2. It satisfies the stated want (a clean URL) at zero cost, honors the no-paid-services decision, and changes nothing that currently works. Option 3 is the right answer only if the GitHub Action itself becomes the problem, and it has not.

**Blocked until answered.** Whether the `site` edge function gets maintained or retired. Whether 02-Architecture.md section 2 stays as written. Whether the Supabase support ticket in 2.2 has any remaining purpose.

### 2.2 The `text/plain` support ticket, with no known response

**The question.** `Supabase-textplain-support-ticket.md` was written Aug 12, 2026, marked severity High, and asks Supabase three questions: is there a platform incident, is there a custom-domain or API-gateway misconfiguration, and what is the recommended fix. No response is recorded anywhere in the corpus, in memory, or in the database.

The ticket's premise was already wrong when it was written. `ProjectYou-Deploy-and-Hosting.md`, dated a day earlier, had concluded that the behavior is Supabase's deliberate anti-abuse policy on the shared `*.supabase.co` domain. The evidence in the ticket is genuinely good, and worth keeping: reproduced across three slugs, across string, `Blob` and `TextEncoder` bodies, on both the database-served and the GitHub-proxy path, not a cache, not a crash (200s in `function_edge_logs`), and the same in Safari and Chrome. The conclusion drawn from that evidence was wrong.

**Options.**

1. **Close the ticket.** Record that the behavior is policy, not a defect, and that the fix is a custom domain.
2. **Chase it.** Ask Supabase for a written confirmation, which mostly buys a citation Scott already has from Supabase's own discussions and custom domain docs.
3. **Leave it open.** The current state. It costs nothing except that anyone reading the file believes a fix might be coming.

**Recommendation.** Option 1, and keep the evidence section as the permanent record of what was ruled out, because that is the expensive part to reproduce.

**Blocked until answered.** Nothing technical. This is a tidy-up, and it stops the next reader from re-opening a closed dead end for a fourth time.

### 2.3 Does "percent approved as-is" count `send_board`?

**The question.** The Staging Area footer shows a sparkline of the share of Claude's guesses Scott accepted unchanged. `staging_events` holds 23 rows today: 10 `send_board`, 7 `approve`, 4 `reroute`, 2 `dismiss`, 0 `park`. Every `send_board` row is logged with `agreed = false`. Excluding `send_board` gives **54 percent over 13 decisions**. Including it gives **30 percent over 23**. Those are very different stories about the same behavior.

**Options.**

1. **Exclude `send_board`.** Argument: `send_board` means "this is site build work, put it on the All ToDos board", which is a different kind of routing than a Todays section, and logging it as a disagreement punishes Claude for a distinction the interpreter was never asked to make. Reads 54 percent.
2. **Include `send_board`.** Argument: it is still a case where the suggestion was not accepted as offered, and the metric exists to make Claude better. Reads 30 percent, which is harsher and probably more honest about the current interpreter.
3. **Fix the logging instead.** Set `agreed = true` on a `send_board` where the destination Claude proposed was already an All ToDos category. Then include it. This is the only option that changes the data rather than the filter.

**Recommendation.** Option 3, then option 2. The current `agreed = false` on every `send_board` is a logging shortcut, not a measurement. Until it is fixed, publish the 54 percent figure and state on the page which rows it counts, because a metric whose definition is invisible is worse than no metric.

**Blocked until answered.** The sparkline on `staging-area.html` and the query in 05-Capture-Pipeline.md, which currently documents both numbers and picks neither.

### 2.4 Does Claude bring a measured hours figure to the wrap, or never?

**The question.** Two skill files give opposite instructions about the same moment. `its-a-wrap.md` step 3: "Claude never invents an hours figure, but must always bring one to the table, because asking Scott to recall it cold is how the tracker falls out of date", then measures file modification timestamps and offers the figure as AskUserQuestion options. `log-accomplishments.md`: "Claude never writes an hours figure. Ever. Not an estimate, not a measurement, not a suggested number for Scott to react to", and then names the wrap's exact behavior as an invention "because it anchors him". `how-we-work-rules.md` sits between them and leans to the wrap, allowing measured elapsed time to be reported "when asked", which is not the same as always bringing one.

**Options.**

1. **The wrap wins.** Claude measures and offers, clearly labeled as elapsed time between the first and last file written, not desk time. Risk: the tracker once showed more than three times the hours a day actually took, which is why the prohibition exists.
2. **`log-accomplishments` wins.** Claude asks "How long were you actually working today?" and writes only what Scott says. Risk: the tracker falls out of date, which is why the wrap rule exists.
3. **Split by role.** Claude may display a measured span (which `status-check` already does, read-only) but never pre-fills it as an option in the question that writes to the tracker.

**Recommendation.** Option 3. It keeps the useful half of both rules: Scott gets a number to react to when he wants one, and the write path never carries a Claude-generated figure into the spreadsheet. Whichever way this goes, one of the two skill files has to change, so it cannot be left as it is.

**Blocked until answered.** Both skill files, and every wrap that runs in the meantime is following one rule and breaking the other.

### 2.5 The Session Tracker has four specs and they disagree on four things

**The question.** Four documents specify one page. `session-tracker.md` (the installed skill), `Session-Tracker-Template.md` (a former copy of that skill, held in `_Global Assets`), `how-we-work-rules.md` section 2, and `its-a-wrap.md` step 2. They disagree on:

- **Columns.** The skill and the template say five, with a Traffic light dot in front. `how-we-work-rules.md` says four, in both its table of contents and its body.
- **Position in the wrap.** `its-a-wrap.md` says step 2. `how-we-work-rules.md` and the template both say step 6. The wrap's actual step 6 is "reconcile against the working rules". The position matters: at step 2 the tracker cannot show settled hours or the final to-do state, because neither has happened yet.
- **Publish block size.** The skill says about 2,400 characters. The template says about 1,400, and carries the incident that produced the number.
- **The index.** The skill says regenerate `session-tracker.html`. The template says it reads the table live and needs no republishing.

**Options.** Pick one master and make the other three point at it, or keep the duplication and accept that each is right about something.

**Recommendation.** Make `session-tracker.md` the single executable master. Harvest into it the five things only the template holds: a brand new tracker needs its empty `pages` row inserted first, staging goes into a session-unique `pages_upload` path, the 1,400 character block with its Aug 15 incident, the `max-height:900px` rule that stops long step lists being clipped, and the rule that anything left amber must already exist as a row in `to-dos.xlsx` or it is lost the moment Scott closes the tab. Then correct the block size to 1,400 (the template carries the evidence), correct `how-we-work-rules.md` to five columns and make it point at the skill instead of restating the format, and confirm the tracker is step 2. Retire the template.

**Blocked until answered.** Every wrap builds a tracker, so this drifts further every day it is left. It is a small edit that needs one yes.

### 2.6 Can a scheduled session reach Supabase?

**The question.** The Midnight Run has produced zero database writes on every scheduled firing: Aug 13, two firings on Aug 14, and an on-demand test fire on Aug 14 that wrote neither a heartbeat nor its test marker four minutes after firing, while the interactive session doing the testing wrote fine. The diagnosis recorded in memory is that scheduled sessions spawn headless and do not inherit interactively authenticated MCP connectors. Neither escape hatch could report the failure, because both needed the missing connector.

This has since become a live experiment rather than a settled fact. The System Map freshness check (`trig_014uwjZ62nr12fYG7i6AK1yz`, created Aug 16, first run due 2026-08-17 07:15 UTC) is a scheduled session whose entire job is to read and write Supabase. Its first run settles the question either way. Note that `data-flow-map.html` currently states the negative as settled fact, which it is not.

**Options.**

1. **Scott checks in the app** whether the Midnight Run task can be granted the Supabase connector explicitly. Claude cannot see or toggle this from a session. If it can, the existing design works unchanged.
2. **Move the durable work into Supabase**: pg_cron for the SQL-side checks. Connector independent and bulletproof, but real engineering, and the build half of the work still needs a session.
3. **Make the trigger connector-free.** It only pushes Scott ("queue has N items, open Cowork to run it") through the task's own notification channel, and the work runs in an interactive session. This already works today as the live catch-up pattern.

**Recommendation.** Read the System Map check's first run on Aug 17 before deciding anything. If it writes, option 1 is unnecessary and the Midnight Run's problem is something else. If it does not write, option 3, because it is the only one that is free and already proven.

**Blocked until answered.** The Midnight Run, the "no phone ping" gap on the Ready to Code page, the self-rescheduling run-time control on `midnight-run-v2.html`, and the accuracy of `data-flow-map.html`.

### 2.7 `blueprint.html` and `knowledge-graph.html` were both titled "Knowledge Graph"

**The question.** Two live pages shipped under the same title and were disambiguated only in the Maps dropdown, where `blueprint.html` reads "Knowledge Graph" and `knowledge-graph.html` reads "Interactive Knowledge Graph". Two separate handoff docs flagged this and both ended with "flag for Scott if he wants one renamed". Neither got an answer. It matters more now that `blueprint.html` has been formally classified as a betterment-insight graph rather than a system map (see the decision log).

**Options.** Rename `blueprint.html` to match what it actually is (a Clarity Compass source graph), rename `knowledge-graph.html`, or leave both and accept that the dropdown labels are the only distinction.

**Recommendation.** Rename `blueprint.html`. Its content is nine sources mapped onto the seven sections, which is how those sections were decided, and calling that a Knowledge Graph is what caused it to be wrongly enrolled in the system map check in the first place. A rename means a new `pages` row, a `nav-config.js` edit and a redirect or a retained stub, so it is a small job, not a free one.

**Blocked until answered.** Nothing is broken. This is a clarity cost that has now caused one real misclassification.

### 2.8 The Maps page says "Five ways" and shows four tiles

**The question.** `MAPS-INDEX-BUILD-SPEC.md` shipped with the sub-copy "Five ways to see how Project YOU OS fits together" on a page with four tiles, because the fifth was the Overview tile which was removed as circular (the page is the overview). The spec itself says "change to 'Four' if preferred, Scott's call".

**Options.** Change the word to "Four", or restore a fifth tile.

**Recommendation.** Change the word. The reasoning for removing the Overview tile is sound and recorded.

**Blocked until answered.** Nothing. It is a one-word edit that has been open since Aug 13.

### 2.9 Seven `pages` rows are empty shells, and one of them is in the nav

**The question.** Seven rows in `pages` have zero bytes in both `html` and `gzb64`: `daily-template.html`, `mission.html`, `morning-update.html`, `movies.html`, `qs-wheel.html`, `quotes.html`, `style-guide.html`. Three of these are live nav targets: `mission.html` (Operating System group), `daily-template.html` and `style-guide.html` (Editors group). `qs-wheel.html` is referenced by `navpatch.js`, which inserts a "back to YouMatics" link into it. An empty row is not automatically a dead link, because `publish.yml` skips empty rows rather than blanking the repo file, so the repo copy may still be serving. But nothing in the pipeline will ever update these pages again.

**Options.** For each page: rebuild it, delete the row so the repo file is the only copy and the confusion ends, or leave it.

**Recommendation.** Check each of the seven against the repo first (`git show origin/main:<page>`). Delete the row for any page whose repo copy is live and correct, because an empty row in the publish queue is a trap: a future copy-across into it will look successful. Rebuild `qs-wheel.html` or remove its `navpatch.js` special case, because right now the shared layer maintains a link into a page nobody owns.

**Blocked until answered.** Nothing urgent. But every one of these is a place where a future session will publish into a row and believe it worked.

### 2.10 Where does the global functional spec live?

**The question.** Open on the board as `session_todos` id 29 since Aug 11, owned by Scott: "Decide where the global functional spec lives." Related open row id 53: "Create a ways-of-working golden rules doc." The old answer was `SER CoWork Operating System.docx` at the CoWork root, which is a Word file nobody in a session can read reliably.

**Options.** The rebuilt docs library (this set), the .docx, or the `how-we-work-rules` account skill.

**Recommendation.** This library, with the .docx retired to an archive and the skill kept as the executable copy of the working rules only. That is what the rebuild assumes, so if Scott disagrees, several documents change.

**Blocked until answered.** 09-Governance-and-Doc-Rules.md cannot state a single canonical home until this is settled.

### 2.11 The global cross-project time and money ledger

**The question.** Scott asked for this on Aug 9, in his words: "I'd love to keep tabs on all the hours I'm spending building this and fold that into the time tracking system so I can see in reality how much time I'm spending on what", refined to "we want to create one global tracker with categories under it". The Inbox row in `Interface-Directions.md` still reads IN PROGRESS with "structure decision pending". Its stated destination (a new Quantified Self project) was subsequently ruled out, and the row was never updated. Meanwhile `its-a-wrap.md` step 7 says money is project scoped by default and that a cross-project total "needs a global spend ledger above the project folders". Scott has asked. The ledger does not exist.

**Options.** A single `global-to-dos`-style spreadsheet at the CoWork root with a category column, a Supabase table so the wrap can write it without a file round trip, or drop the request.

**Recommendation.** A Supabase table, because every other measurement in this system already lives there and a spreadsheet at the CoWork root cannot be read by a scheduled session. Note this decision interacts with 2.4: if Claude never writes hours, the ledger is Scott-entered and its value drops considerably.

**Blocked until answered.** Every wrap's money line, which currently has to say plainly that money tracking is not set up.

### 2.12 How much of the anon-readable surface is intentional?

**The question.** Twelve tables carry `USING (true)` policies, which means anon read and in most cases anon write. Some of that is deliberate and load bearing: read-only anon views are how a Cowork artifact shows live data with no login, and `pages`, `ai_cards` and `jc_321` are anon-readable on purpose so the site works before sign-in. Some of it is almost certainly not deliberate: `checkins` (8,819 rows of where Scott has physically been since 2009) and `health_metrics` (16,826 readings including sleep and heart rate variability) are both anon-readable with a key that is hardcoded in every page and in `publish.yml`.

**Options.**

1. **Lock everything that is not needed for an unauthenticated page or artifact,** starting with `checkins` and `health_metrics`. Cost: any artifact or page currently reading them without a login stops working until it is either signed in or given a narrow security-definer view.
2. **Lock only the write half,** keeping anon SELECT. Cheaper and stops tampering, but leaves the exposure.
3. **Accept it** and record the acceptance, on the argument that the URL is unguessable in practice.

**Recommendation.** Option 1 for `checkins` and `health_metrics`, with a narrow anon view for whatever a page genuinely needs, which is the pattern already used for the coffee views. Option 3 is not defensible for sleep and location history, and the whole point of writing this down is that it should be an explicit decision rather than an accident.

**Blocked until answered.** The security fixes in section 4, which should be applied as one deliberate change rather than piecemeal.

### 2.13 The Connection Journal is a plaintext personal file on disk

**The question.** `Project YOU/Components/Connection/Connection - Journal.md` holds dated, named, highly personal relationship entries as an ordinary markdown file in the connected folder. The Aug 11 privacy rule says sensitive personal notes live only in the RLS-locked database, "never in memory or any open page". The board also has a private Relationship capture area and a `💬 Asa topics` section, so one concern has three homes.

**Options.** Move the content into the database and leave a pointer, keep the file and carve an explicit exception into the privacy rule, or consolidate the three homes into one.

**Recommendation.** This is Scott's to decide and nobody else's. No session should move, merge, sweep or rename this file. What can be done without asking is stating the conflict, which is what this entry does. Whatever he chooses, 09-Governance-and-Doc-Rules.md should record the file as off limits to automated sweeps.

**Blocked until answered.** Nothing technical. Recorded here so it stops being rediscovered.

### 2.14 The standing review of the check-in arrangement is eight days overdue

**The question.** `how-we-work-rules.md` records that Scott asked to be re-asked "around August 8, 2026" whether the current check-in arrangement (run freely on execution, ask on judgment calls) is still helping. It is Aug 16 and it has not been asked.

**Recommendation.** Ask it at the next wrap, as a single tick-box question, and record the answer with a date in `how-we-work-rules.md` so the next review has a baseline.

**Blocked until answered.** Nothing, but it is the only rule in the system with an explicit expiry date on it, and letting it lapse silently is the failure mode the rest of this file exists to prevent.

---

## 3. Known problems

Ranked by **severity of consequence**, which is the only ranking used here: what does it cost if this stays broken. That is not the same as Scott's priority order, and no priority he has not expressed is implied. The bands are: **Critical** (personal data exposed, or work destroyed), **High** (data silently wrong, or a pipeline dead while reporting healthy), **Medium** (a visible thing is wrong, or a rule is unenforceable), **Low** (cosmetic or documentation drift).

| Severity | Problem | Evidence | Where it is documented | Suggested fix |
|---|---|---|---|---|
| Critical | Anyone with the anon key can read 8,819 Swarm check-ins going back to 2009 and 16,826 Apple Health readings including sleep and heart rate variability | `pg_policies` on 2026-08-16 returns `checkins_read` and `health_metrics_read`, both SELECT to `{anon,authenticated}` with `using (true)`. Row counts confirmed by `select count(*)`. The anon key is hardcoded in every page and in `publish.yml` | 03-Data-Model.md security posture, 02-Architecture.md section 8 | Narrow both policies to the owner email or `service_role`, and expose only what a page needs through a security-definer view, the way the coffee views already do. Decide 2.12 first |
| Critical | Twelve tables in total carry `USING (true)` policies, and ten of them allow anon writes as well as reads | Same query. `board_meta`, `cue_favorites`, `daily_completed`, `feedback`, `rule_candidates`, `session_content`, `session_trackers`, `time_log`, `tracker`, `visited_countries` all allow ALL commands to anon or public. `board_meta` holds the sweep watermark and the day boundary | 03-Data-Model.md security posture | Same fix. `board_meta` is the most urgent of the ten, because an anon write to `drafts_sweep_watermark` can strand a day of captures |
| Critical | RLS is off entirely on four tables, two of which sit on the publish path | `select relname from pg_class where relrowsecurity = false` returns exactly `build_recipe`, `overnight_build`, `pages_upload`, `publish_hook_log` on 2026-08-16 | 03-Data-Model.md, 02-Architecture.md section 8 | Enable RLS **with the policies written first**. Enabling it without a policy blocks all access, including the publish path itself |
| Critical | Four live credentials sit in `app_meta` as plaintext table rows | `select key from app_meta` returns `fsq_client_id`, `fsq_client_secret`, `fsq_token`, `health_ingest_key` on 2026-08-16. `app_meta` is RLS locked to the owner email, so this is not open to anon, but the project already uses Vault for `github_pat` | 03-Data-Model.md security posture | Move all four into Supabase Vault and read them the way `notify_github_publish()` already reads `github_pat` |
| High | The Drafts sweep watermark is stalled. Captures made since yesterday morning may be sitting in Drafts unswept | `board_meta.drafts_sweep_watermark` reads `2026-08-15T11:21:00` and its row was last updated 2026-08-15 16:52 UTC, about 20 hours before this verification. The sweep task `trig_01Dmm4JdFxtwkkzJsDCR4TZM` fires every two hours across the waking day and is enabled | 05-Capture-Pipeline.md failure mode 1 | Check the desktop bridge is alive with `drafts_list_workspaces`, then run a hard pull. The design correctly leaves the watermark alone when the bridge is unreachable, which is why this looks identical to a quiet day |
| High | The installed `task-capture` skill file has drifted from the scheduled trigger's prompt, so a hard pull run from the skill captures without interpreting | The installed SKILL.md is the pre Aug 15 version: today's drafts only, no watermark, and it sets none of `stage_guess`, `stage_conf`, `staging_note`, `stage_board`, `stage_cat`, `stage_own`, `est_minutes` | 05-Capture-Pipeline.md failure mode 5 | Either update the skill file to match the trigger prompt, or declare the trigger prompt canonical and say so inside the skill. Leaving both is how a day gets re-stranded |
| High | The `capture` edge function returns `ok: true` even when `staged = false`, and its `inbox` insert never checks `error` | Function source. On Aug 14 Drafts showed a green "Swept N to the Staging Area" bar for an hour while `service_role` grants made every write fail. Scott pressed the button repeatedly believing it worked | 05-Capture-Pipeline.md failure mode 3, memory `supabase-grants-trap` | Return the failure, and make the Drafts action say "stored 0, failed N". The standing rule is that a service must not report success it has not confirmed. This is the third time a fail-safe hid a failure in this project |
| High | The daily rollover does less than every document claims. Only the habit reset is server side | `pg_get_functiondef` on `reset_daily_habits()`: it updates habit rows and returns a count. It does not promote `bucket='tomorrow'` into Core, does not archive finished tasks, and never reads `daily_template`. If those three happen at all, they happen client side in `index.html` on first open, which means they depend on someone opening the page | 03-Data-Model.md cron jobs | Read `index.html` and confirm whether the client does them. If it does, say so in 03-Data-Model.md. If it does not, three documented behaviors have never run |
| High | The version guard does not stop an equal-version publish, and one session's work was destroyed by exactly that | `publish.yml` compares versions and skips only when the incoming one is strictly older. On Aug 16 an equal-version publish of `automated-tracking.html` silently destroyed another session's work. Separately, a page fetched, edited and published 36 minutes later wiped three changes because the versions matched | 04-Runbook-Build-and-Deploy.md section 7.4 | The guard cannot be made to catch this alone. The mitigation is procedural: re-fetch immediately before publishing, and read `publish_hook_log` for the last 30 minutes before starting. A stronger fix is to compare content md5 as well as version |
| High | A stale copy of `publish.yml` sits at the repo root, without the version guard or the `repository_dispatch` trigger | Verified 2026-08-16: the root file and `.github/workflows/publish.yml` differ, and only files under `.github/workflows/` run | 04-Runbook-Build-and-Deploy.md section 14 | Delete the root copy. It is a decoy that a reader will believe. Nothing depends on it |
| High | The Midnight Run scheduled task has never written to the database | Four scheduled firings (Aug 13, two on Aug 14, and an on-demand test fire) all produced zero writes: no heartbeat, no `midnight_run_testfire` marker. `board_meta.midnight_run_last_result` says so in its own words. The task `trig_01JGNC33ATCfrHjotZa9oZbH` is enabled and next fires 2026-08-17 08:02 UTC | Memory `midnight-run` | See open decision 2.6. The System Map check's first run on Aug 17 settles the diagnosis |
| High | `pages_upload` has one row per path, no owner column and no locking, so two sessions staging the same page silently corrupt each other | Table definition, 24 rows on 2026-08-16. No publish trigger on it, which is the only reason a collision is recoverable | 02-Architecture.md section 3, memory `pages-upload-collision` | Always stage under a session-unique path. A schema fix (a session column in the primary key) would make the rule enforceable instead of advisory |
| High | Four of the five system map pages are known stale, with six drift rows parked and unactioned | `session_todos` ids 77 to 82, all created 2026-08-16, all still `done = false`. `board_meta.system_map_last_verified` reads status `drift` for 2026-08-16. Worst is `architecture-map.html`: its Presentation section is wrong in 5 of 6 nav groups, it lists a Parking Lot group that no longer exists in the nav, it still shows TripIt as the travel source after Where I've Been shipped on Swarm, Apple Health is absent entirely, and it claims row-level security on every table when four have none | Memory `living-docs-must-self-verify` | Work the six parked rows. `dfd.html` already has a corrected v1.1 built and waiting on Scott to say publish (id 77) |
| High | The Nightly Docs Library Reconciliation has no recorded run, four nights after it was created | `Nightly-Reconciliation-Report.md` still reads "Last run: pending first nightly run" and "No runs yet". The task `trig_01G2FCFTkYdkeHVBivKqZ41A` exists, is enabled, cron `30 6 * * *` UTC (2:30 AM ET), and next fires 2026-08-17 | Nightly-Reconciliation-Report.md | Likely the same connector problem as 2.6. Confirm after the Aug 17 System Map run, then either fix it or delete the claim that it runs |
| High | The nightly reconciliation manifest instructs the automated pass to enforce a hosting story that is wrong | `Nightly-Reconciliation-Report.md`: "Watch for hosting story drift (Supabase is the final host; GitHub Pages retired)". Four documents state the opposite, and the live site is on GitHub Pages | Nightly-Reconciliation-Report.md, 02-Architecture.md section 2 | Fix the line before the task ever runs. As written, the pass would "correct" the correct files |
| Medium | Six vocabularies are plain text with no CHECK constraint, and junk has already leaked into four of them | `qs_log.group`, `qs_log.unit`, `qs_log.tracker`, `todos.section`, `todos.category`, `todos.status` are unconstrained. Present in the data: one `qs_log` row with `group = 'compass'` (lowercase, not one of the eight bands), one with `unit = 'min'` where every other minute row says `'minutes'`, one `todos` row with `status = 'open'`, one with `qs_group = 'cue-cards'` | 03-Data-Model.md known data quality problems | Clean the four values, then add CHECK constraints to `qs_log.group` and `qs_log.unit` at minimum, so the vocabularies stop being advisory |
| Medium | `habit_to_qs_log()` silently defaults `group` to Mental Fitness when `todos.qs_group` is NULL | Function body. The 26 Mental Fitness rows in `qs_log` are partly an artifact of missing tags, not a measurement | 03-Data-Model.md | Either require a group or default to a visible `unassigned` value. A silent default that looks like data is worse than a gap |
| Medium | The two capture triggers disagree about what a day is | `habit_to_qs_log()` converts to Eastern from `done_at`. `sync_social_wellbeing_completion()` uses `coalesce(for_date, current_date)` on a server running UTC. Late evening Eastern activity is dated a day forward by one and not the other | 05-Capture-Pipeline.md, 03-Data-Model.md triggers | Make both Eastern. The rule already exists elsewhere: file against the source row's own date, never `now()` |
| Medium | `navpatch.js` stamps the date using the browser's clock, not Eastern, on every page | Function source. Scott's standing rule is Always Eastern, named as the zone | 02-Architecture.md section 5 | Add `timeZone: 'America/New_York'` to the `toLocaleDateString` call. One edit in the shared layer fixes every page |
| Medium | Six pages cannot receive Editors nav links, and two of them have no nav bar at all | As of Aug 14: `habit-modules.html`, `midnight-run.html`, `midnight-run-v2.html`, `qs-dashboard.html`, `qs-health.html`, `tracker.html` lack the hardcoded Editors group. The two midnight-run files have no `.pynav` at all, so there is no way to navigate away from the Midnight Run page | 04-Runbook-Build-and-Deploy.md section 7.3 | Add the group markup to the six pages. This cannot be fixed from `nav-config.js`, because navpatch has nothing to match against |
| Medium | Junk rows sit on the live build queue | `session_todos` open rows include `wtqwet` (id 64), `hiccup` (id 63), `dgsdgsg` (id 62) under `🔧 Add a new task`, and three rows reading `New item` (ids 9, 10, 11) under Quantified Self, all still `done = false` | Live query, 2026-08-16 | Delete them. They are test typing from Aug 11 and Aug 15 |
| Medium | Five rules Scott dictated have no verifiable home | `Interface-Directions.md` records five rules as ROUTED into `how-we-work-rules`: activity timestamping, scannable-not-read layout, artifact pinning, the start-of-session project tick-box, and "use every capability, think outside the box". None of the five appears in the 32KB file. Two more were routed to "its-a-wrap step 9", and the wrap has eight steps | Recon report on working rules, contradictions 9 and 10 | Re-ask Scott which of the five he still wants, then write them once. The likely root cause is recorded in the same file: "installed its-a-wrap account copy was behind the backup; re-save needed", never confirmed done |
| Medium | The wrap never received the document reconciliation step that two other documents say it runs | `Interface-Directions.md` records a reference re-scan and an overlapping-documents check as added to "the wrap (step 5)". Step 5 is accomplishment logging. Step 6 reconciles rules only. The `morning` skill did get its half, as a full Maintain section. Both `Reconciliation-Watch-List.md` and `Nightly-Reconciliation-Report.md` then state as fact that the wrap runs this scan | Recon report on working rules, contradiction 11 | Add the step to `its-a-wrap.md`, or correct the two documents that claim it exists. On-demand reconciliation currently does not run at all |
| Medium | `Interface-Directions.md` stopped capturing on Aug 10, in a file whose stated premise is "Nothing gets lost here" | Newest Routed entry is Aug 10. Footer says "As of August 9th". Six days of silence to Aug 16. Its Inbox rows were never moved to the Routed log, so the file is two logs rather than a queue, and one Inbox row still presents as open a question the Routed log resolved the same day | Recon report on working rules, part 3 | Harvest the Routed log's operational facts (two scheduled task IDs, the M365 admin lock and its ICS workaround, the QS ruling, the Mission Control deploy commit) into this library, re-open the four genuinely unrouted items, and either restart capture or retire the file explicitly |
| Low | Eleven of fifteen working-rules files break the house date-stamp rule, including the master | `how-we-work-rules.md` is stamped "As of August 14th" and has two Aug 15 change history entries. `its-a-wrap.md`, `status-check.md`, `session-tracker.md`, `log-accomplishments.md`, `morning.md`, `new-project.md`, `Session-Tracker-Template.md`, `START-A-NEW-PROJECT.md` and both templates have no stamp at all | Recon report on working rules, contradiction 16 | Stamp them. The rule is one line and the master file is the one breaking it |
| Low | `maps.html` carries its version in a `.verbadge` element, which none of the guard's three regexes match | `publish.yml` looks for `.badge`, then `.ver`, then `.pn-ver`. A page with an unrecognized marker publishes with no version check at all, falling back to whatever the nav's `.pn-ver` happens to say | 04-Runbook-Build-and-Deploy.md section 7.4 | Change the element to `.pn-ver` on `maps.html`, or add `.verbadge` to the guard |
| Low | The `markSeen()` snippet in the AI Favorites build doc never increments `times_used` | It writes `times_used: /* current+1 */ undefined`, which defeats the `times_used asc` tiebreaker in the card rotation rule. It also keys the update on `.eq('title', card.title)` rather than an id, which is brittle if two pool rows share a title | AI-Favorites-and-Great-Quotes-BUILD.md | Rewrite as an RPC keyed on id. The doc half admits the problem already |
| Low | `todos.completed_at` and `todos.user_id` are dead columns that look live | `completed_at` is never written and sits beside `done_at`, which has 76 rows. `user_id` is NULL in all 178 rows, because access control is the email-based RLS policy | 03-Data-Model.md | Leave them but keep them documented. Anyone writing `auth.uid() = user_id` logic will lock themselves out |

---

## 4. Gaps and unbuilt things

Described in the old docs as if it existed, or specified and then never shipped. None of these is broken. They simply are not there.

**The flywheel.** The cross-project design is that the top three tasks from every project surface in Today's Tasks, plus one ten minute habit per project, with each task carrying its origin. `todos.source_project` is the column for it and it is NULL in 173 of 178 rows (4 say `strava`, 1 says `Project You`). There is no per-project task table and no aggregation anywhere. The schema is ready. The data and the mechanism are not. This was parked in `Interface-Directions.md` on Aug 9 and never picked up.

**Apple Health does not feed `qs_log`.** `health_metrics` holds 16,826 readings back to 2016, including step count, sleep stages, active energy and heart rate variability. `qs_log` has zero rows with `source = 'apple-health'`, even though the CHECK constraint already permits the value. The two stores are entirely separate, so no QS dashboard can see any Apple Health data. The Swarm path does exactly this job through `trg_checkin_to_coffee_log`, and is the model to copy.

**No column stores a task's planned time, so the Time Wheel's inner ring has no backing store.** The wheel is specified as two rings: the inner ring draws each task at its scheduled time with arc length equal to its estimate, and the outer ring draws it at the real clock time it finished. The outer ring is fully supported (`done_at` minus `actual_minutes` to `done_at`). The inner ring is not. There is no `planned_at`, `scheduled_at` or `slot` column on `todos`. `started_at` records when work began, not when it was planned. Today the inner ring can only be inferred from `position` ordering, which is not a time. **Adding a planned time column is the single most useful schema change available.**

**Five dashboard read patterns were specified and never built as views.** There is no view for the monthly grid, the annual dot grids, the Time Wheel aggregation, the ecosystem dashboard, or estimate versus actual. The only views over `qs_log` are the coffee ones. Where these read patterns exist at all, they are client-side queries inside page HTML, which is exactly the "any statistic computed in two places will drift" trap the tracker playbook warns about.

**The Time Bandit Wheel v5.28 backlog.** Approved with Scott across 27 numbered decisions (stored as `build_recipe` id 2) and not present as of v5.30: the `6 / 96 segments` centre readout, the inner-ring donut pie with its fixed slice order, group subtotal rows in the habit table, plain `18m` and `1h 2m` habit times against `1.02` style day-panel times, whole-number percentages, the three-column layout with the nowrap pair, the stacked LOG TIME box saving to `time_log`, ordinary task categories feeding the pie with an `Other tasks` bucket, and the day-total override rule. `public.time_log` was created for this and is empty. One item in that list is a live data bug rather than a feature: **the morning template regeneration in `index.html` does not copy `category`, so tomorrow's Lunch arrives uncategorised.**

**Connectors named and never built.** From the Aug 15 research pass, verified against current API docs and ranked: Dawarich (self-hosted location, API key auth), Gmail sent-metadata (connector already live, cheapest fill for Social Well-Being), iMessage `chat.db` plus `CallHistoryDB` on the Mac (unencrypted since macOS 13, needs Full Disk Access), Chess.com (no auth at all), Lichess, Steam, Trakt (free, OAuth device flow, also syncs to Letterboxd), Readwise (incremental sync, already holds Kindle highlights), OpenStreetMap changesets (unauthenticated read), SimpleFIN Bridge ($15/yr, only if a bank feed is ever the right sensor), Flighty via its local Mac SQLite file, Withings Sleep mat (free OAuth plus webhooks), Oura (OAuth only now). Also worth knowing: TripIt and Outlook appear on `architecture-map.html` and `dfd.html` as sources and **neither has ever been connected**.

**Two Clarity Compass sections have zero automated sources.** Recreational Health and Social Well-Being. That is the real gap on `automated-tracking.html`, not the app count. Note the finding that contradicts the obvious fix: Google Calendar is not the cheap Social Well-Being win. Live-checked Jul 1 to Aug 15 2026, there was exactly one multi-attendee `eventType: DEFAULT` event; everything else was `FROM_GMAIL` travel confirmations with Scott as the sole attendee. Gmail metadata has to carry that section.

**Sleep is measured by nothing,** and it is the largest missing metric on the roadmap. The cheapest route is the Apple Watch through the Health Auto Export pipe that is already built.

**Year Compass daily questions:** fully designed (question bank with spiced wording, a sub-question ladder, 5/10/20 minute tags, a Parking Lot, an Answered log), never built.

**Talk to Capture:** specced Aug 12 as a trigger-word routing surface, never built. Its useful parts (the trigger false-positive guard and the 60 second dedupe) have been folded into 05-Capture-Pipeline.md; the rest is superseded by the Staging Area gate.

**Smaller unbuilt items, each named in exactly one place:** where the Favorites view lives was left open in the AI Favorites build doc and never resolved, and `favorites.html` appears in no nav spec anywhere. The 🅿️ Parking Lot exists as a board section but does not render at the bottom of All ToDos when empty. The Dismissed bin is specced and not confirmed built. The Atomic Habits follow-ups are all open: the official 3-2-1 Top 10 as a Best-of collection, a weekly auto-capture for each new Thursday issue, the deeper archive of roughly 350 more issues back to Aug 2019, and a habit hook matching a `todos` row on `%James Clear%`. The morning brief's two-overnight-ideas-per-project feature was requested Aug 9 and is not in `morning.md`. The Claude usage and weekly limit readout was requested twice, routed to a step of the wrap that does not exist, and separately flagged as impossible because Claude cannot read subscription billing.

---

## 5. Confirmed dead ends

Researched, ruled out with a reason, and recorded here so nobody spends a second afternoon on them. The source is the Aug 15 to 16 research pass in memory `tracking-inputs-research`, plus the hosting work.

**Data sources with no viable automated route.**

| Source | Why it is dead |
|---|---|
| Labcorp | No patient API and no FHIR endpoint. Information-blocking rules bind providers and certified EHRs, not reference labs. Accept manual entry, 1 to 4 events a year |
| Monarch | No public API. The community client is 19 months stale and stores the account password. Use SimpleFIN Bridge if a bank feed is ever genuinely the right sensor |
| Google Maps Timeline | Moved on-device, desktop killed, and the cloud "backup" is device-restore rather than queryable. Dawarich is the replacement, not a supplement |
| Elevate | No API, no export, no HealthKit, and no email of any kind in Scott's Gmail. The company rebranded to The Mind Company. Its sibling app Balance does write Mindful Minutes to HealthKit, so they can ship it and chose not to. A DSAR with a 45 day window is the only route |
| Impulse | The brain-training one is GMRD Apps Limited at brainimpulse.me, not impulse.app. No API, no emails at all. Machine-readable data on request only |
| Imprint | The only one of the three with a bridge, and it is lossy: milestone streak emails from `hello@mail.imprintapp.com` carry parseable numbers, but the cadence is milestone-based so absence is ambiguous, and the lesson count is cumulative. His last Imprint email was Dec 22 2025, so the account looks lapsed |
| JetLovers | No API, and Scott has already migrated off it |
| Letterboxd API | Closed beta, and the terms explicitly decline personal, AI and data-analysis projects. Trakt syncs out to Letterboxd, which solves it anyway |
| Goodreads API | Dead since Dec 2020. The shelf RSS still works |
| YouTube watch history | Removed from the Data API in 2016 |
| Fitbit Web API | Sunsets Sept 2026. Google Fit REST is deprecated. Start nothing on either |
| Upright Posture | No API, and HealthKit has no posture type |
| Sun Ally | No API. Use Apple Health's Time in Daylight instead |
| Hello Habit, Be My Eyes, LinkedIn, WhatsApp, Apple Podcasts | No usable personal-data route |
| Pocket Casts | The unofficial API returns no listen timestamps, so it cannot measure a completed event |
| Gondola | It only parses email. Parse the email directly |
| Personal CRMs (Clay/Mesh, Dex, Monica, Covve) | They measure logging discipline, not connection. Prefer passive local sources |
| Spotify | Locked down Feb 2026. `recently-played` survives but the app owner needs Premium and individuals are permanently capped at development mode. It returns only the last 50 plays, so a missed cron run loses that listening forever. Pair with Last.fm as the archive if it is ever built |

**Live source risk, not a dead end, recorded here so it is not rediscovered.** Strava standard API access has required an **active paid Strava subscription since June 2026**. If Scott's subscription lapses, the two-hourly sync (`trig_017o9WPbPvXp9RzWhMRTCAt9`) stops. The Club Activities, Members and Admins endpoints **retire Sept 1, 2026**, and this project does not use them. The base URL moves to `api-v3.strava.com` in **Jan 2027**, so the sync task needs updating before then.

**Architecture and process dead ends.**

- **Serving the site from Supabase, on the `*.supabase.co` domain.** Confirmed policy, not a bug. See open decision 2.1 for the only route that changes this.
- **Serving HTML from a Supabase Storage bucket.** Same policy, proved with a `__test.html` upload that came back as `text/plain`.
- **Publishing a binary asset through the `pages` table.** `publish.yml` skips any path containing `/` and treats every payload as text. Images reach the repo only by Scott uploading them to the inner `assets` folder.
- **A paid edge function build worker.** Built, then withdrawn on cost. It was also worse: one API call with no tools, unable to read the repo, check the live site, test, or notice a task was already done. Never re-pitch it as a quality upgrade.
- **The Google Drive inbox file as the capture pipe.** Google only lets Drafts modify files Drafts itself created, and Drafts can only write to the Drive root or a folder directly in root. Superseded by the desktop bridge.
- **Siri and Apple Reminders as a capture route,** and **Workflowy** as the list.
- **A three-table query as an audit.** The first automated tracking audit queried `qs_log`, `todos` and `inbox`, concluded that two apps write data, and published it, while Apple Health had 12,944 rows sitting in `health_metrics`. Enumerate `information_schema.tables` first, every time.

---

## 6. How to re-verify this document

Run all of this against project ref `arnjntspmrhigodlssbn`. Anything that disagrees means an entry here is out of date and should be corrected in place, with the date.

**The four security claims, all at once.**

```sql
-- tables with RLS off. Expect exactly: build_recipe, overnight_build, pages_upload, publish_hook_log
select c.relname
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'r' and c.relrowsecurity = false
order by 1;

-- every policy that lets anyone through
select tablename, policyname, cmd, roles::text
from pg_policies
where schemaname = 'public' and coalesce(qual::text,'') = 'true'
order by tablename;

-- the exposure, in rows
select (select count(*) from checkins) as checkins,
       (select count(*) from health_metrics) as health_metrics;

-- plaintext credentials still in app_meta
select key from app_meta
where key in ('fsq_client_id','fsq_client_secret','fsq_token','health_ingest_key');
```

**The capture pipeline's pulse.**

```sql
select val #>> '{}' as watermark, updated_at, now() - updated_at as age
from board_meta where key = 'drafts_sweep_watermark';
```

More than about 3 hours of age during the waking day means the sweep has not completed a run. Then check the bridge with `drafts_list_workspaces` before concluding anything.

**The learning metric, both readings.**

```sql
select round(100.0 * count(*) filter (where agreed) / nullif(count(*),0)) as pct, count(*) as decisions
from staging_events where action in ('approve','reroute','park','dismiss');

select action, count(*) from staging_events group by 1 order by 2 desc;
```

**The map drift backlog and the open build queue.**

```sql
select id, cat, own, left(txt, 120) as txt, created_at
from session_todos where done = false order by cat, position;

select key, val, updated_at from board_meta
where key in ('system_map_last_verified','system_map_pages','midnight_run_last_result');
```

**The empty page shells.**

```sql
select path, updated_at::date,
       length(coalesce(html,'')) as html_len, length(coalesce(gzb64,'')) as gz_len
from pages
where length(coalesce(gzb64,'')) = 0 and length(coalesce(html,'')) = 0
order by path;
```

**The junk data values.**

```sql
select 'qs_log.group' as f, "group" as v, count(*) from qs_log group by 2
union all select 'qs_log.unit', coalesce(unit,'(null)'), count(*) from qs_log group by 2
union all select 'todos.status', coalesce(status,'(null)'), count(*) from todos group by 2
union all select 'todos.qs_group', coalesce(qs_group,'(null)'), count(*) from todos group by 2
order by 1, 3 desc;
```

**The rollover, read the function rather than the docs.**

```sql
select proname, pg_get_functiondef(oid) from pg_proc
where pronamespace = 'public'::regnamespace and proname = 'reset_daily_habits';
```

**The scheduled tasks.** Use `list_triggers`. Confirm that the System Map freshness check (`trig_014uwjZ62nr12fYG7i6AK1yz`), the Nightly Docs Library Reconciliation (`trig_01G2FCFTkYdkeHVBivKqZ41A`) and the Midnight Run (`trig_01JGNC33ATCfrHjotZa9oZbH`) are still enabled, and read their most recent effect in `board_meta` rather than trusting that they fired.

**The two publish.yml files.**

```
git -C /tmp/py fetch && git -C /tmp/py show origin/main:.github/workflows/publish.yml
git -C /tmp/py show origin/main:publish.yml
```

They differ. Only the one under `.github/workflows/` runs. If the root copy is gone, strike that row in section 3 with the date.

*As of August 16th*

**Also see:** 10-Foundations.md before changing any life section, tracker category or card format. The reasoning behind the current shape is recorded there.
