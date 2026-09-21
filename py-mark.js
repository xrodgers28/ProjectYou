/* py-mark.js  v1.0  Sep 21, 2026
   ------------------------------------------------------------------
   SOURCE MARKS. One small badge beside anything that came from a
   named source, so Scott can see at a glance whose research a habit,
   a section or an insight rests on.

   Nothing in this file names a person. public.kg_sources decides:
     mark      the key of the artwork below  (null = no mark, the default)
     mark_url  where clicking it goes
     mark_tip  what the tooltip says

   To mark a new source, one UPDATE on kg_sources and, if it needs its
   own artwork, one new entry in ART. Nothing else changes, anywhere.

   How a thing gets its mark, in order of precedence:
     1. an explicit source_code column on the row itself
        (worksheet_sections.source_code, worksheet_rows.source_code)
     2. otherwise, for a tenet, whichever marked source has filed an
        insight against it in kg_links. That is what makes it automatic:
        file a new Santos insight against a tenet and the tenet lights up
        on its own, with nobody tagging anything.

   Usage on a page:
     <script src="py-mark.js"></script>
     await PYMark.load();
     el.innerHTML = PYMark.html('S02');            // by source
     el.innerHTML = PYMark.forTenet('T030');       // by tenet, automatic
   ------------------------------------------------------------------ */
(function (g) {
  'use strict';

  var SB_URL = 'https://arnjntspmrhigodlssbn.supabase.co';
  var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM';

  /* ---- the artwork ----------------------------------------------
     Drawn, not photographed, so it survives at 14px. The full
     Happiness Lab logo sets its words in a ring and turns to mush
     below about 40px, which is why the mark keeps the yellow and the
     smile and drops the type. Scott's call, Sep 21 2026.          */
  var ART = {
    'happiness-lab':
      '<svg viewBox="0 0 24 24" width="100%" height="100%" aria-hidden="true" focusable="false">' +
        '<circle cx="12" cy="12" r="11.2" fill="#ecdf1c"/>' +
        '<circle cx="8.6" cy="9" r="1.75" fill="#101010"/>' +
        '<circle cx="15.4" cy="9" r="1.75" fill="#101010"/>' +
        '<path d="M6.1 13.5a6.3 6.3 0 0 0 11.8 0" fill="none" stroke="#101010" ' +
          'stroke-width="2.3" stroke-linecap="round"/>' +
      '</svg>'
  };

  var MARKS = {};      /* source code -> row            */
  var BY_TENET = {};   /* tenet code  -> source code    */
  var ready = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function api(path) {
    return fetch(SB_URL + '/rest/v1/' + path, {
      headers: { apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY }
    }).then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  function styleOnce() {
    if (document.getElementById('pymark-css')) return;
    var s = document.createElement('style');
    s.id = 'pymark-css';
    s.textContent =
      '.pymark{display:inline-flex;align-items:center;justify-content:center;' +
        'vertical-align:-0.15em;line-height:0;border-radius:50%;flex:none;' +
        'text-decoration:none;opacity:.92;transition:opacity .12s ease,transform .12s ease}' +
      '.pymark:hover{opacity:1;transform:scale(1.12)}' +
      '.pymark:focus-visible{outline:2px solid currentColor;outline-offset:2px}' +
      '@media (prefers-reduced-motion:reduce){.pymark{transition:none}' +
        '.pymark:hover{transform:none}}';
    document.head.appendChild(s);
  }

  /* Load every marked source, plus the tenets they have filed against. */
  function load() {
    if (ready) return ready;
    ready = Promise.all([
      api('kg_sources?select=code,name,mark,mark_url,mark_tip&mark=not.is.null'),
      api('kg_links?select=source_code,tenet_code')
    ]).then(function (res) {
      (res[0] || []).forEach(function (r) { MARKS[r.code] = r; });
      (res[1] || []).forEach(function (l) {
        if (MARKS[l.source_code] && l.tenet_code && !BY_TENET[l.tenet_code]) {
          BY_TENET[l.tenet_code] = l.source_code;
        }
      });
      styleOnce();
      return MARKS;
    });
    return ready;
  }

  /* The badge for one source. Empty string when the source has no mark,
     so a page can concatenate this unconditionally and nothing shows. */
  function html(code, size) {
    var m = MARKS[code];
    if (!m || !ART[m.mark]) return '';
    var px = (+size || 16);
    var tip = m.mark_tip || m.name || '';
    var url = m.mark_url || '';
    var box = 'width:' + px + 'px;height:' + px + 'px';
    var inner = '<span class="pymark" style="' + box + '" title="' + esc(tip) +
                '" role="img" aria-label="' + esc(tip) + '">' + ART[m.mark] + '</span>';
    if (!url) return inner;
    return '<a class="pymark" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" ' +
           'style="' + box + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '">' +
           ART[m.mark] + '</a>';
  }

  function forTenet(tenetCode, size) { return html(BY_TENET[tenetCode], size); }
  function has(code) { return !!MARKS[code]; }
  function sourceOfTenet(tenetCode) { return BY_TENET[tenetCode] || ''; }

  g.PYMark = {
    load: load, html: html, forTenet: forTenet,
    has: has, sourceOfTenet: sourceOfTenet, art: ART, marks: MARKS
  };
})(window);
