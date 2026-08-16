# Start Here

**What this is:** the front door to the ProjectYou / CoWork documentation. Eleven documents, what each one answers, and where everything else went.

**Read this when:** you are opening this library for the first time in a session, or you are about to write something down and need to know which document owns it.

**Last verified:** 2026-08-16, on the day the library was consolidated from 61 files into 11. The document list below is the library; if a file exists in `_Docs/` that is not listed here, one of the two is wrong.

**Supersedes:** _Feature-Docs/README.md, CoWork-Project-Brief.md, CoWork-Project-Instructions.md, Project YOU - Project Brief.md, Project YOU - Project Instructions.md, Todays-Tasks-Project-Brief.md, Todays-Tasks-Project-Instructions.md.

---

## The system in three sentences

CoWork is the operating layer: the projects, the rituals, the working standards, and the rules for where a thought goes. ProjectYou is the web app CoWork runs, a set of pages served from GitHub Pages and backed by one Supabase database. Today's Tasks is the board inside ProjectYou where the daily work actually happens.

Full inventory in **01-Product-Overview.md**.

---

## The eleven documents

| # | Document | Answers |
|---|---|---|
| 00 | **START-HERE** | Which document owns this, and where did the old file go |
| 01 | **Product-Overview** | What exists: every page, module, connector, and what each is for |
| 02 | **Architecture** | How it is put together, and how a change reaches the live site |
| 03 | **Data-Model** | What is actually in the database: tables, columns, views, triggers, jobs |
| 04 | **Runbook-Build-and-Deploy** | The numbered procedures. Publish, fix, add a nav link, add a tracker |
| 05 | **Capture-Pipeline** | How a spoken note becomes a row in the right table |
| 06 | **How-We-Work** | The working standards and the session rituals |
| 07 | **Templates** | Every reusable template, inline, in one file |
| 08 | **Roadmap-and-Open-Decisions** | What is settled, what needs Scott, what is broken, what was never built |
| 09 | **Governance-and-Doc-Rules** | The rules the library itself runs on |
| 10 | **Foundations** | Why the system is shaped this way: the frameworks and the source material |

---

## Which document owns what

Pick by the question you are asking, not by the topic.

| Your question | Document |
|---|---|
| Does this page or feature exist? | 01 |
| What is this page for? | 01 |
| Why does the system have these life sections? | 10 |
| What is the real name of that table or column? | 03 |
| Why is a number in a dashboard wrong? | 03, then 08 |
| How does a page get from an edit to the browser? | 02 |
| How do I publish this change without breaking it? | 04 |
| The live site did not update. What now? | 04, troubleshooting table |
| Where did my dictated note go? | 05 |
| What does `[wrap]` actually do? | 06 |
| I am starting a new project | 07 |
| Has this already been decided? | 08 |
| Is this a known problem? | 08 |
| What must a new document contain? | 09 |

**The default rule when it is genuinely ambiguous:** live state goes in 01, 02, 03 or 05, procedures go in 04, unresolved things go in 08, and reasoning goes in 10. If a fact would change tomorrow, it does not belong in 10.

---

## Three rules that will save you an hour

These are the ones that have actually cost time. Each has its full treatment elsewhere.

1. **The GitHub repo is canonical, not the local deploy folder.** `CoWork/ProjectYou-deploy-Aug11/` is a stale working copy. Editing a page out of it and publishing has already silently wiped live sections once. Pull the canonical file and read its version marker first. See **02-Architecture.md**.

2. **A document that states a number must say how to re-check it.** Every doc here ends with a "How to re-verify this document" section for that reason. A page that stamps itself with today's date is showing you a rendering timestamp, not a verification. See **09-Governance-and-Doc-Rules.md**.

3. **Several chats write these files at the same time.** Merge, never overwrite wholesale. This applies to the docs, to project memory, and to any page in the `pages` table. See **06-How-We-Work.md**.

---

## What is not in this library, on purpose

- **The Claude skills** in `CoWork/Claude Skills Backup/` are live executable files. They are the source of truth for their own behavior. 06-How-We-Work.md maps them; it does not replace them, and neither does anything else here.
- **Other projects.** TreadWell, Mission 193, the 2026 Calendar, Clever Phrases, Warming Sign and the SER Travel Database each keep their own documents in their own folders. This library covers the operating system only.
- **`Interface-Directions.md`** at the CoWork root is a working capture log, not a document. It stays where it is.
- **Session tracker pages** are dated artifacts of individual sessions. They are not canon and are not shelved here.

---

## Where the old files went

Sixty-one documents became eleven. Nothing was thrown away without being read: everything durable was merged into the document listed below, and the originals were moved to `_to_delete/` rather than deleted, so this is reversible for as long as that folder survives.

| Old file | Went to |
|---|---|
| CoWork Operating System - Feature Set.md | 01 |
| 00-Project Setup/CoWork-Project-Brief.md | 00, 01 |
| 00-Project Setup/CoWork-Project-Instructions.md | 00, 06 |
| 20-Build Directory/CoWork-Build-Directory.md | 04 |
| 20-Build Directory/Web-App-Build-Playbook.md | 04 |
| 20-Build Directory/web/SER-nav-handoff.md | 04 |
| 20-Build Directory/web/Clarity-Compass-nav-handoff.md | 04, 08 |
| 20-Build Directory/web/DEPLOY-automated-tracking-and-life-snapshot.md | 04 |
| 20-Build Directory/web/AI-Favorites-and-Great-Quotes-BUILD.md | 04, 01 |
| AI Intelligence/AI-Intelligence-How-It-Works.md | 01 |
| AI Intelligence/AI-Intelligence-Scan-2026-08-09.md | 08 |
| Project YOU/00-Project Setup/Project YOU - Description.md | 01 |
| Project YOU/00-Project Setup/Project YOU - Project Brief.md | 00, 01 |
| Project YOU/00-Project Setup/Project YOU - Project Instructions.md | 00, 06 |
| Project YOU/00-Project Setup/Project YOU - Knowledge Base.md | 10 |
| Project YOU/00-Project Setup/Habit Building Cue Cards - Name Options.md | 10 |
| Project YOU/00-Project Setup/ProjectYou-Deploy-and-Hosting.md | 02 |
| Project YOU/05-Resource-Library/Project YOU - Reference Library.md | 10 |
| Project YOU/Components/Connection/Connection - Journal.md | 10 |
| Project YOU/Components/Year Compass/YearCompass-Daily-Questions-Design.md | 10 |
| Project YOU/Components/QS Trackers/Quantified-Self-Data-Model.md | 03, 10 |
| Project YOU/Components/QS Trackers/QS-Master-Log-Spec.md | 03 |
| Project YOU/Components/QS Trackers/Quantified-Self-Project-Summary.md | 10 |
| Project YOU/Components/QS Trackers/Project YOU - Trackers List.md | 10 |
| Project YOU/Social Well-Being/Social Well-Being - Overview.md | 10 |
| ProjectYou-deploy-Aug11/MAPS-NAV-HANDOFF.md | 04 |
| ProjectYou-deploy-Aug11/SETUP-two-fixes.md | 04, 08 |
| ProjectYou-deploy-Aug11/maps-index-handoff/MAPS-INDEX-BUILD-SPEC.md | 04, 08 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Project-Brief.md | 00, 01 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Project-Instructions.md | 00, 06 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Feature-Set.md | 01, 08 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Tech-Spec.md | 02, 03 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Backend-Schema-Spec.md | 03 |
| Today's Tasks/00-Project Setup/Todays-Tasks-TimeWheel-How-It-Works.md | 01, 10 |
| Today's Tasks/00-Project Setup/Todays-Tasks-Web-Build-Plan.md | archived, superseded end to end |
| Today's Tasks/00-Project Setup/Todays-Tasks-Web-Build-Handoff-Notes.md | 03, 06 |
| Today's Tasks/00-Project Setup/Supabase-textplain-support-ticket.md | 02, 08 |
| _Feature-Docs/README.md | 00 |
| _Feature-Docs/Drafts-Import.md | 05 |
| _Feature-Docs/Staging-Area.md | 05 |
| _Feature-Docs/Talk-to-Capture-Build-Spec.md | 05 |
| _Feature-Docs/Fix-a-live-page.md | 04 |
| _Feature-Docs/Build-A-Tracker-Playbook.md | 04 |
| _Global Assets/Session-Tracker-Template.md | 07 |
| _SER Templates/project-brief-template.md | 07 |
| _SER Templates/project-instructions-template.md | 07 |
| _SER Templates/START-A-NEW-PROJECT.md | 07 |
| _archived files/project-instructions-to-paste.md | dropped, every structural claim in it is dead |
| current-modules/Atomic-Habits-Module-Handoff.md | 01, 10 |
| wheel-publish/spec.md | 04, 08 |
| wheel-publish/DO-NOT-PUBLISH.md | 04, 08 |
| Reconciliation-Watch-List.md | 08, 09 |
| Nightly-Reconciliation-Report.md | 08, 09 |
| _to_delete/Drafts-Import-Feature.md | 05 |

Files kept in place and deliberately not folded in: everything in `Claude Skills Backup/`, `Interface-Directions.md`, `Project YOU/Social Well-Being/People I Want to Meet.md`, `ProjectYou-deploy-Aug11/_STALE-do-not-edit.txt`, and every other project's folder.

---

## How to re-verify this document

```bash
# The library should contain exactly the eleven files listed above.
ls -1 "CoWork/_Docs/"

# Nothing in the library should reference a document that does not exist.
grep -oh '[0-9][0-9]-[A-Za-z-]*\.md' CoWork/_Docs/*.md | sort -u
```

Then confirm every "Went to" target above still contains the content it claims: open the named document and search for a distinctive phrase from the old file. If a merge target has since been rewritten and dropped the content, that is a real loss and the original is still in `_to_delete/`.

*As of August 16th, all times EST*
