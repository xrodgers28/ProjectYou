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
  "Habit Modules": [
    { "label": "Cue Cards", "href": "habit-modules.html" }
  ],
  "Quantified Self": [
    { "label": "QS Dashboard", "href": "qs-dashboard.html" },
    { "label": "Where I've<br>Been", "href": "where-ive-been.html" }
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
window.NAV_GROUP_LINKS = {};

/* Maps & Diagrams subsection.
   No dropdown: the top nav links straight to the Overview hub (maps.html), and
   navpatch.js renders THIS list as a horizontal strip on the five sub pages.
   One list, two places, so the strip can never drift from the nav again.
   Add a new map here and it appears on every sub page automatically. */
window.MAPS_NAV = {
  "label": "\uD83D\uDDFA Maps",
  "hub": "maps.html",
  "ver": "Maps v1.3",
  "items": [
    { "label": "Overview", "href": "maps.html" },
    { "label": "Knowledge Graph", "href": "blueprint.html" },
    { "label": "Architecture Map", "href": "architecture-map.html" },
    { "label": "Data Flow Chart", "href": "dfd.html" },
    { "label": "Data Flow Map", "href": "data-flow-map.html" },
    { "label": "Spider Diagram", "href": "knowledge-graph.html" }
  ]
};
