/* Master nav config for Project YOU.
   Edit THIS file to change the top navigation on every page.
   - A group key must match the grey label text in the nav (e.g. "Operating System").
   - Each item is either a plain link {label, href}
     or a dropdown {label, children:[{label, href}, ...]}.
   - Any item can be given a "children" list to turn it into a sub-nav. */
window.NAV_CONFIG = {
  "To Do List": [
    { "label": "Todays<br>Tasks", "href": "index.html" },
    { "label": "All<br>ToDos", "href": "all-todos.html" },
    { "label": "Staging<br>Area", "href": "staging-area.html" }
  ],
  "Habit Modules": [
    { "label": "AI<br>Insights", "href": "ai.html" },
    { "label": "Clever<br>Phrases", "href": "quotes.html" },
    { "label": "Compass", "href": "compass.html" },
    { "label": "James<br>Clear", "href": "james-clear.html" }
  ],
  "Quantified Self": [
    { "label": "Time Bandit<br>Wheel", "href": "index.html#wheel" },
    { "label": "Habits<br>Tracker", "href": "qs-log.html" },
    { "label": "Clarity<br>Compass", "href": "qs-wheel.html" },
    { "label": "Life<br>Snapshot", "href": "life-snapshot.html" }
  ],
  "Editors": [
    { "label": "Daily<br>Habits", "href": "daily-template.html" },
    { "label": "Midnight<br>Run", "href": "midnight-run.html" },
    { "label": "Style<br>Guide", "href": "style-guide.html" }
  ],
  "Operating System": [
    { "label": "Components", "href": "build.html" },
    { "label": "Automated<br>Tracking", "href": "automated-tracking.html" },
    { "label": "Maps", "children": [
      { "label": "Overview", "href": "maps.html" },
      { "label": "Data Flow Diagram", "href": "dfd.html" },
      { "label": "Knowledge Graph", "href": "blueprint.html" },
      { "label": "Interactive Knowledge Graph", "href": "knowledge-graph.html" },
      { "label": "Architecture Map", "href": "architecture-map.html" }
    ] },
    { "label": "Mission<br>Control", "href": "mission.html" },
    { "label": "Docs<br>Library", "href": "library.html" }
  ]
};
