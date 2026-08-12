/* Master nav config for Project YOU.
   Edit THIS file to change the top navigation on every page.
   - A group key must match the grey label text in the nav (e.g. "Operating System").
   - Each item is either a plain link {label, href}
     or a dropdown {label, children:[{label, href}, ...]}.
   - Any item can be given a "children" list to turn it into a sub-nav. */
window.NAV_CONFIG = {
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
