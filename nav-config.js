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
  /* Calendar (Aug 29 2026, Scott). ONE slot in the top bar, in line with the
     sub-nav principle: the bar holds sections, and the two ways of looking at
     the calendar - the running list and the week grid - are a tab strip on the
     page itself, built from CAL_NAV further down this file. */
  "Calendar": [
    { "label": "Calendar", "href": "calendar.html" }
  ],
  "Habit Modules": [
    { "label": "Cue Cards", "href": "habit-modules.html" },
    { "label": "Habit<br>Worksheets", "href": "habit-worksheets.html" }
  ],
  /* Sep 3 2026, Scott. Two items left this group. Food Log moved to LISTS, where
     it is now the fifth tab. Intrinsic Capacity came off the bar entirely and is
     reached from Mission Control. What is left is the hub and the wheel. */
  "Quantified Self": [
    { "label": "YouMatics", "href": "qs-dashboard.html" },
    { "label": "Time Bandit<br>Wheel", "href": "index.html#wheel" }
  ],
  /* Displayed as LISTS - see NAV_GROUP_RENAME below. The key stays "Parking Lot"
     because that string is baked into every page's markup and is what navpatch
     matches on. Aug 24 2026, Scott. */
  "Parking Lot": [
    { "label": "All Lists", "href": "connections.html" }
  ],
  /* Sep 3 2026, Scott: "travel list should be removed from main nav, it already
     sits in Where I've Been." The Travel slot is gone from the top bar. The three
     travel pages still link to each other through the TRAVEL_NAV strip below, and
     the way in from the bar is Mission Control, which carries a card for each. */
  /* Style Guide moved OUT of here into Mission Control, Sep 3 2026 (Scott).
     Sub-nav principle: the top bar holds sections, and the Style Guide is a
     thing you look up rather than a place you go, so it lives as a card on
     mission.html under "Maps & dashboards". Do not put it back in the bar. */
  "Editors": [
    { "label": "Daily<br>Habits", "href": "daily-template.html" },
    { "label": "Midnight<br>Run", "href": "midnight-run-v2.html" }
  ],
  "Operating System": [
    { "label": "Automated<br>Tracking", "href": "automated-tracking.html" },
    /* Sep 3 2026, Scott. Import moved to Mission Control and Guardrails moved to
       the Docs Library, so neither needs a slot in the bar any more. */
    { "label": "Cheat<br>Sheet", "href": "cheat-sheet.html" },
    { "label": "Maps &amp;<br>Diagrams", "href": "maps.html" },
    { "label": "Mission<br>Control", "href": "mission.html" },
    { "label": "Docs<br>Library", "href": "library.html" }
  ]
};

/* Group labels that link to an index/landing page.
   When a group name here has a URL, navpatch.js renders its grey label as a
   clickable link (and marks it active on that page). */
window.NAV_GROUP_LINKS = {
  "Calendar": "calendar.html",
  "Habit Modules": "habit-modules.html",
  "Parking Lot": "connections.html"
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
  "Parking Lot": "LISTS"
};

/* Maps & Diagrams subsection.
   No dropdown: the top nav links straight to the Overview hub (maps.html), and
   navpatch.js renders THIS list as a horizontal strip on the six sub pages.
   One list, two places, so the strip can never drift from the nav again.
   Add a new map here and it appears on every sub page automatically. */
window.MAPS_NAV = {
  "label": "\uD83D\uDDFA Maps",
  "hub": "maps.html",
  "ver": "Maps",
  "items": [
    { "label": "\u2190 Overview", "href": "maps.html" },
    { "label": "Site Map", "href": "site-map.html" },
    { "label": "Knowledge Graph", "href": "blueprint.html" },
    { "label": "Architecture Map", "href": "architecture-map.html" },
    { "label": "Data Flow Chart", "href": "dfd.html" },
    { "label": "Data Flow Map", "href": "data-flow-map.html" },
    { "label": "Spider Diagram", "href": "knowledge-graph.html" },
    { "label": "Adding to Knowledge Graph", "href": "kg-ingest-process.html" }
  ]
};

/* LISTS subsection (Aug 24 2026, Scott).
   Same idea as MAPS_NAV above, different shape: navpatch.js renders THIS list
   as a segmented tab bar across the four list pages, so the top nav needs one
   slot instead of six. The top-nav item points at the first list, which is why
   landing on LISTS puts you on Connections.

   ORDER IS FIXED (Scott, Aug 24: "dont have the items in the list change
   order"). The active tab lights up where it stands; it never moves to the
   front. Add a list here and it appears on every list page automatically.

   `count` is the key in the public.v_list_counts view, which returns one row
   per list. navpatch fetches that view ONCE, and only on these four pages, to
   fill the number beside each tab. A list with no `count` key simply shows no
   number - nothing breaks. */
window.LISTS_NAV = {
  "label": "Lists",
  "ver": "Lists",
  "counts": "v_list_counts",
  "items": [
    { "label": "Connections",    "href": "connections.html",    "count": "connections" },
    { "label": "Movies",         "href": "movies.html",         "count": "movies" },
    { "label": "Bucket List",    "href": "my-bucket-list.html", "count": "bucket_list" },
    { "label": "Asa Activities", "href": "asa-activities.html", "count": "asa_activities" },
    /* Sep 3 2026, Scott: "move food log out of main nav and into lists." Added at
       the END because the order here is fixed and never re-sorts. No `count` key:
       v_list_counts has no row for meals, and a tab with no count simply shows no
       number, which is the honest thing to show rather than a wrong one. */
    { "label": "Food Log",       "href": "food-log.html" }
  ]
};

/* CALENDAR subsection (Aug 29 2026, Scott).
   Third use of the same pattern as MAPS_NAV and LISTS_NAV, and deliberately not
   a fourth invention: navpatch.js renders this list as the segmented tab strip
   that sits under the top nav on the calendar pages, so the top bar needs one
   slot instead of two.

   ORDER IS FIXED, same as LISTS. The top-nav item points at items[0], which is
   why landing on Calendar lands on the running list rather than the week grid.
   Add a third way of looking at the calendar here and it appears on both
   existing pages on its own. */
window.CAL_NAV = {
  "label": "Calendar",
  "ver": "Calendar",
  "items": [
    { "label": "List", "href": "calendar.html" },
    { "label": "Week", "href": "calendar-week.html" }
  ]
};

/* TRAVEL subsection (Sep 1 2026, Scott; top-bar slot removed Sep 3 2026).
   Fourth use of the same strip pattern as MAPS_NAV, LISTS_NAV and CAL_NAV.
   navpatch.js renders this list as the segmented tab strip under the top nav on
   the three travel pages.

   THE TOP BAR NO LONGER HAS A TRAVEL SLOT. This strip is what still ties the
   three pages together, so do not delete it: without it, opening any one travel
   page would give you no way to reach the other two. The way in from the bar is
   Mission Control. ORDER IS FIXED, same as LISTS and CALENDAR.

   No counts. The Travel Log reads travel_trips with Scott's signed-in session
   only (anon is REVOKED on those tables), so a count fetched with the public
   key would always come back empty. */
window.TRAVEL_NAV = {
  "label": "Travel",
  "ver": "Travel",
  "items": [
    { "label": "Travel Log", "href": "travel-log.html" },
    { "label": "Where I've Been", "href": "where-ive-been.html" },
    { "label": "Future Travel", "href": "future-travel.html" }
  ]
};

/* Read-only PostgREST endpoint used by the LISTS tab counts above. The anon key
   is already public in the source of every page on this site; it is lifted here
   so navpatch.js stays config-driven and no credential is typed into the shared
   script itself. */
window.PY_REST = {
  "url": "https://arnjntspmrhigodlssbn.supabase.co",
  "anon": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM"
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
  "social-orbit.html": "v1.1",
  "social-rings.html": "v1.0",
  "social-sky.html": "v1.0",
  "qs-health.html": "v0.1",
  "tracker.html": "v1.0",
  "midnight-run.html": "v3.0",

  /* ---- Site-wide reconciliation, Aug 23 2026 ----------------------------------
     Audited all 72 pages by running navpatch's own pageVer() logic in a browser
     rather than grepping, which is what caught that library.html and maps.html
     were fine and my regex was wrong. Result: nothing on the site displayed a
     WRONG version, but these 15 pages declared nothing at all. Their version
     existed only as a literal typed into the nav chip, which is a mirror. Nothing
     could verify it, and navpatch had nothing to sync from, so any future drift
     would have been silent, exactly as it was on how-we-work.html.

     Declared here rather than by editing 15 pages: one file instead of fifteen
     publishes, and the page still wins if it ever grows a real .ver chip, because
     pageVer() reads PY_VERSION, then the page markup, and only then this map.
     The values are what each page was already showing, so nothing changed on
     screen. decade.html and the old compass-sources tracker showed nothing at all
     and start at v1.0. reconciliation.html read a bare "v1", which the publish
     guard's regex cannot parse, so it is written properly as v1.0. */
  "ai.html": "v1.17",
  "bucket-list.html": "v1.4",
  "compass.html": "v1.8",
  "decade.html": "v1.0",
  "environmental.html": "v1.5",
  "feed.html": "v1.5",
  "habit-modules.html": "v5.6",
  "creativity.html": "v1.1",
  "habit-worksheets.html": "v2.9",
  "life-snapshot.html": "v1.0",
  "open-mode.html": "v1.5",
  "qs-dashboard.html": "v3.0",
  "reconciliation.html": "v1.0",
  "recreational.html": "v1.3",
  "session-tracker-2026-08-18-compass-sources-shipped.html": "v1.0",
  "takeaways.html": "v2.4",
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


/* ============================================================
   SECTION VERSION CHIPS, MADE SELF-CORRECTING (Aug 30, 2026)

   The Maps, Lists and Calendar tab strips each carried a hand-typed
   version, and they drifted. On Aug 30 2026 the Calendar strip still
   read "Calendar v1.0" while the two calendar pages were on v1.8, and
   Scott reasonably read the old number and concluded the work had not
   shipped. That is the second time a duplicated version number has
   misled him, so the fix is not to retype these three, it is to stop
   them being a second copy at all.

   The "ver" values above are now just the section NAME. This appends
   the version the PAGE ITSELF is showing, read from the same chip
   navpatch already treats as the page version. One source of truth,
   so the two can never disagree again. If anything here fails the chip
   simply reads the section name with no number, which is honest.
   ============================================================ */
(function(){try{
  var SEL='.secbar .ver, h1.ph-h1 .ver, .topbar .ver, #ver, h1 .ver, h1 .badge';
  function pageVer(){
    var els=document.querySelectorAll(SEL);
    for(var i=0;i<els.length;i++){
      var t=(els[i].textContent||'').trim();
      if(/^v\d+(\.\d+)*$/.test(t)) return t;
    }
    return null;
  }
  function fix(){
    var v=pageVer(); if(!v) return;
    var chips=document.querySelectorAll('.msub-ver, .lsub-ver, .csub-ver');
    for(var i=0;i<chips.length;i++){
      var base=(chips[i].textContent||'').trim().replace(/\s+v\d+(\.\d+)*$/,'');
      if(!base) continue;
      var want=base+' '+v;
      if(chips[i].textContent!==want) chips[i].textContent=want;
    }
  }
  function arm(){ fix(); setTimeout(fix,250); setTimeout(fix,1200); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',arm);
  else arm();
  window.addEventListener('load',fix);
}catch(e){ if(window.console) console.log('section version sync skipped',e); }})();
