/* Master nav config for Project YOU.
   Edit THIS file to change the top navigation on every page.
   - A group key must match the grey label text in the nav (e.g. "Operating System").
   - Each item is either a plain link {label, href}
     or a dropdown {label, children:[{label, href}, ...]}.
   - Any item can be given a "children" list to turn it into a sub-nav. */
window.NAV_CONFIG = {
  "To Do List": [
    { "label": "Todays<br>Tasks", "href": "index.html" },
    { "label": "Staging<br>Area", "href": "staging-area.html" },
    { "label": "All<br>ToDos", "href": "all-todos.html" }
  ],
  "Worksheets": [
    { "label": "Habit<br>Worksheets", "href": "habit-worksheets.html" }
  ],
  "Habit Modules": [
    { "label": "Cue Cards", "href": "habit-modules.html" }
  ],
  "Quantified Self": [
    { "label": "YouMatics", "href": "qs-dashboard.html" },
    { "label": "Where I've<br>Been", "href": "where-ive-been.html" }
  ],
  "Parking Lot": [
    { "label": "Bucket<br>List", "href": "my-bucket-list.html" },
    { "label": "Future<br>Travel", "href": "future-travel.html" },
    { "label": "Social", "href": "connections.html" },
    { "label": "Movies", "href": "movies.html" },
    { "label": "Cheat<br>Sheet", "href": "cheat-sheet.html" },
    { "label": "AI<br>Tools", "href": "ai-tools.html" }
  ],
  "Editors": [
    { "label": "Daily<br>Habits", "href": "daily-template.html" },
    { "label": "Midnight<br>Run", "href": "midnight-run-v2.html" },
    { "label": "Style<br>Guide", "href": "style-guide.html" }
  ],
  "Operating System": [
    { "label": "Automated<br>Tracking", "href": "automated-tracking.html" },
    { "label": "Guardrails", "href": "guardrails.html" },
    { "label": "Maps &amp;<br>Diagrams", "href": "maps.html" },
    { "label": "Mission<br>Control", "href": "mission.html" },
    { "label": "Docs<br>Library", "href": "library.html" }
  ]
};

/* Group labels that link to an index/landing page.
   When a group name here has a URL, navpatch.js renders its grey label as a
   clickable link (and marks it active on that page). */
window.NAV_GROUP_LINKS = {
  "Habit Modules": "habit-modules.html",
  "Worksheets": "habit-worksheets.html"
};

/* Rename a group WITHOUT touching a single page.
   The grey label text is baked into all 45 pages and is also the key that
   navpatch matches on, so you cannot rename a group by renaming its key here -
   it would stop matching and the group would go stale. Instead leave the key
   alone and add a line below: "<key in NAV_CONFIG above>": "<what to display>".
   navpatch applies this last, so nothing else has to change.
   Example:  "Habit Modules": "Cue Cards",
   Delete a line to go back to the original name. */
window.NAV_GROUP_RENAME = {
};

/* Maps & Diagrams subsection.
   No dropdown: the top nav links straight to the Overview hub (maps.html), and
   navpatch.js renders THIS list as a horizontal strip on the six sub pages.
   One list, two places, so the strip can never drift from the nav again.
   Add a new map here and it appears on every sub page automatically. */
window.MAPS_NAV = {
  "label": "\uD83D\uDDFA Maps",
  "hub": "maps.html",
  "ver": "Maps v1.6",
  "items": [
    { "label": "\u2190 Overview", "href": "maps.html" },
    { "label": "Knowledge Graph", "href": "blueprint.html" },
    { "label": "Architecture Map", "href": "architecture-map.html" },
    { "label": "Data Flow Chart", "href": "dfd.html" },
    { "label": "Data Flow Map", "href": "data-flow-map.html" },
    { "label": "Spider Diagram", "href": "knowledge-graph.html" },
    { "label": "Adding new content to Knowledge Graph", "href": "kg-ingest-process.html" }
  ]
};

/* ============================================================
   THE VERSION RULE  (written Aug 21, 2026 — closes ToDo 101)
   ============================================================
   Which pages must carry a version number, and where it lives.

   1. Every page a human navigates to carries a version. The only
      exemption is session-tracker-*.html: those are dated records
      of one session, not living pages, and a version on them
      would be noise.

   2. The version is declared in ONE place per page, in this order
      of preference:
        a. a .ver chip inside or next to the page's <h1>
        b. window.PY_VERSION set by the page
        c. an entry in PAGE_VERSIONS below, for pages that have
           neither and are not worth republishing to add one
      Never declare it twice in the source. navpatch.js copies the
      declared version everywhere else it needs to appear.

   3. Everything else that displays a version is a MIRROR, never a
      source: the .pn-ver chip in the nav, the fixed corner .badge,
      card-header chips drawn by JavaScript, and .verbadge on
      maps.html. navpatch.js syncs all of them at runtime. If you
      find a version number typed into any of those, it is a bug —
      the fix is to delete the literal, not to update it.

   4. Bump the version when you change what the page DOES. Not for
      copy tweaks. One bump per publish, not one per edit.

   5. If you add a new mirror element, add its selector to
      fixCardChips() in navpatch.js in the same commit, or it will
      silently drift the way maps.html did.
   ============================================================ */

/* Declared page versions.
   navpatch.js reads a page's version out of its own markup first. These are the
   pages that carry no version anywhere — no .ver chip, no badge — so the nav
   would sit empty forever. Declaring it here means one edit, not a page publish.
   Bump the number here when you ship a change to one of these pages. */
window.PAGE_VERSIONS = {
  "qs-health.html": "v0.1",
  "tracker.html": "v1.0",
  "midnight-run.html": "v3.0",
  /* how-we-work.html shows its version in a .badge, which navpatch does not read as
     a declaration, so the nav chip sat on a hardcoded v1.5 while the page said v2.0.
     It has NO row in the pages table, so it cannot be republished from here at all,
     which is exactly the case this register exists for. If Scott ever uploads that
     page with a .ver chip in its h1, the page wins and this line can go. */
  "how-we-work.html": "v2.0"
};

/* ============================================================
   DARK-BACKGROUND HEADINGS  (rule, Aug 21, 2026, Scott)
   ============================================================
   On any page whose heading sits on a dark background, the
   heading text is VERY LIGHT GREY, never white and never the
   dark ink used on white pages.

   Change the shade here and every dark-bar heading on the site
   follows. navpatch.js works out which backgrounds are dark at
   load, so a new page inherits the rule with no extra work.
   ============================================================ */
window.ONDARK_INK = "#d6dce4";
