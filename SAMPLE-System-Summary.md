# SAMPLE — ProjectYOU System Summary

## What it is, and who it is for

ProjectYOU is a personal operating system with one user. It began after a flat 50th birthday and a sense of living on auto-pilot, and it describes itself as "a gamified operating manual that turns your life goals into an actionable program."

Three names get used, and they mean different things. **CoWork** is the operating layer: the project folders, the working standards, the skills and rituals, and the rules for where a thought goes. **ProjectYou** is the web app CoWork runs, a multi-page site behind one login. **Today's Tasks** is the board inside ProjectYou where the daily work actually happens, and it is the site home page. An older name, CrushingIt, is dead but still survives in login copy on a few pages; if you see it, it means Today's Tasks.

The whole thing is organized around the Clarity Compass: seven sections of well-being (Physical Health, Environmental Health, Social Well-Being, Recreational Health, Sense of Purpose, Mental Fitness, Emotional Health). On top of that sits a quantified-self layer that logs what actually happened, on the principle that "your data becomes your coach."

A few rules shape everything else. Capture is instant and verbatim; routing is a separate step. Nothing files itself: every captured note stops at a review gate. One log, many dashboards, because when two pages compute the same number independently they drift, and they have. And the system records only what has already happened, never what is planned.

## The moving parts

**The site.** A set of self-contained HTML pages served from GitHub Pages at `xrodgers28.github.io/ProjectYou/`. Each page carries its own CSS and JavaScript inline and holds no data of its own. Pages read and write the database directly from the browser.

**The database.** One Supabase Postgres project is the single source of truth for every piece of data: `todos` for the board, `qs_log` for habits and activity, `health_metrics` for the Apple Health feed, `checkins` for locations, and about thirty more. Access is locked to Scott's email through row-level security, with a small number of deliberately public read-only views where a page needs to read without a login.

**The shared UI layer.** The navigation bar is not maintained page by page. `nav-config.js` declares the links, `navpatch.js` rewrites each page's nav skeleton on load, and the publish workflow attaches both to every page automatically. A site-wide UI change is therefore one small file, not fifty large ones.

**The habit modules.** A Cue Cards board fronts four ticking card decks (AI Insights, Atomic Habits, Things Worth Knowing, Compass) plus a browse-only Takeaways library. Ticking a card writes a row into the activity log, which is what feeds the streak badge and the Time Bandit Wheel on the board.

**The capture pipeline.** Scott dictates a thought into the Drafts app, on his phone or his watch. An edge function interprets it and writes the raw text plus a staged row into the database; a sweep every two hours acts as a backstop. The note then waits in the Staging Area with a suggested destination and a confidence dot until he approves, parks or dismisses it. Approval writes the real row in the real table and archives the draft so it is never captured twice.

**Compass Sources.** The knowledge graph behind the model. New books and podcasts are broken into points and mapped onto the seven Compass sections as a matrix: tenets are columns, sources are rows, each filled cell is one source speaking to one tenet. It reads four tables at load, so adding a source is a few rows rather than a rebuild. This is the record of how the seven sections were chosen.

## How a change reaches the live site

Four steps, and any one of them can be the thing that failed.

1. **Local edit.** Fetch the canonical file first. The GitHub repo is the canonical copy, not the database and not a folder on disk. Read the version marker before touching anything, build on that file, and bump the version.
2. **Into the `pages` table.** The edited page is gzipped, base64-encoded and written into the `gzb64` column of its row in `pages`. Large pages are staged in chunks through a scratch table first, so the real row is written once.
3. **The publish action.** Writing `gzb64` fires a database trigger that pokes GitHub. A workflow then pulls every row, decompresses it, applies a version guard, injects the nav scripts and commits the files as a bot.
4. **GitHub Pages.** The site rebuilds and serves the new file. End to end this takes roughly 20 to 75 seconds. If a publish is taking an hour, the poke did not fire and the fallback schedule is doing the work; the `publish_hook_log` table is the first place to look.

Two things to know before publishing anything. The version guard blocks a strictly older version, but it does not block an equal one, and it cannot check a page with no version marker at all. And several chats work on this site at the same time, so fetch the live file immediately before you edit it, not at the start of the session.

## What to read next

- **doc-00-start-here.md.** The front door. It routes a question to the document that owns the answer, which is faster than guessing by topic.
- **doc-01-product-overview.md.** What actually exists: every page, module and connector, with a status against each. Read this before claiming a feature is there.
- **doc-02-architecture.md.** How the pieces fit and the exact path a page takes from an edit to a browser. Read it before changing anything structural.
- **doc-04-runbook-build-and-deploy.md.** The numbered procedures: publish a page, fix a live page, add a nav link, add a tracker. This is the one to have open while working.
- **doc-03-data-model.md.** The real table, column and view names, plus the triggers and scheduled jobs. Go here when a number in a dashboard looks wrong.
- **doc-05-capture-pipeline.md.** How a spoken note becomes a row, and where to look when one goes missing.
- **doc-06-how-we-work.md.** The working standards and the session rituals, including what `[wrap]` does.
- **doc-08-roadmap-and-open-decisions.md.** What is settled, what is broken, and what was never built. Check it before re-litigating a decision.
- **doc-10-foundations.md.** Why the system is shaped this way: the Compass, the frameworks and the source material behind them.

Two documents are for maintainers rather than newcomers: doc-07-templates.md holds the reusable templates, and doc-09-governance-and-doc-rules.md holds the rules this library itself runs on.
