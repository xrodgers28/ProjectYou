/* health-strip.js - Project YOU
   The morning body strip: last night's sleep, HRV, steps and daylight from Apple Health,
   each read against Scott's own rolling 30-day baseline rather than a generic target.
   Reads public.py_body_latest(), which reads v_health_daily (one honest row per day).
   No library: plain fetch against PostgREST, so this file can load on any page.

   Mounting: a page can say exactly where the strip goes by putting an empty
   <div id="bodystrip-mount"></div> (or any element with [data-health-strip])
   in its markup. If there is no such slot, the strip falls back to guessing an
   anchor, which is how index.html has always used it.

   v1.1 - Aug 25, 2026 - explicit mount slot, single-fetch guard
*/
(function () {
  'use strict';
  var URL_BASE = 'https://arnjntspmrhigodlssbn.supabase.co/rest/v1/rpc/py_body_latest';
  var KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM';

  var CSS = [
    '#bodystrip{margin:10px 0 2px;font-family:Arial,Helvetica,sans-serif}',
    '#bodystrip .bs-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#e3e7ee;border:1px solid #e3e7ee;border-radius:10px;overflow:hidden}',
    '#bodystrip .bs-cell{background:#fff;padding:9px 11px;min-width:0}',
    '#bodystrip .bs-lbl{font-size:8.5px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#aab2bd}',
    '#bodystrip .bs-val{font-size:20px;font-weight:800;line-height:1.15;font-variant-numeric:tabular-nums;margin-top:1px}',
    '#bodystrip .bs-base{font-size:10.5px;color:#5b6472;margin-top:1px;line-height:1.3}',
    '#bodystrip .bs-bar{height:3px;border-radius:2px;background:#e8ecf2;margin-top:5px;overflow:hidden}',
    '#bodystrip .bs-bar i{display:block;height:100%;border-radius:2px}',
    '#bodystrip .bs-foot{font-size:10.5px;color:#8a8f99;margin:5px 2px 0;display:flex;gap:6px;flex-wrap:wrap;align-items:baseline}',
    '#bodystrip .bs-foot b{color:#1f2a44;font-weight:700}',
    '#bodystrip .up{color:#1e8e5a;font-weight:700}',
    '#bodystrip .down{color:#c0453b;font-weight:700}',
    '#bodystrip .flat{color:#8a8f99;font-weight:700}',
    '#bodystrip .stale{font-size:9px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:#b07d1a;background:#fdf3dc;border-radius:5px;padding:1px 5px}',
    '@media(max-width:640px){#bodystrip .bs-grid{grid-template-columns:repeat(2,1fr)}}'
  ].join('');

  var TONE = { sleep: '#3f6f8f', hrv: '#2f8f5b', steps: '#c07a3b', daylight: '#b8860b' };

  function hm(hours) {
    if (hours == null) return null;
    var t = Math.round(hours * 60);
    return Math.floor(t / 60) + 'h' + String(t % 60).padStart(2, '0');
  }
  function commas(n) {
    return n == null ? null : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function pct(v, base) {
    if (v == null || !base) return 50;
    return Math.max(4, Math.min(100, Math.round((v / (base * 1.6)) * 100)));
  }
  function etDay(iso) {
    if (!iso) return '';
    var p = iso.split('-');
    var M = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return M[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  }

  /* One cell. `fmt` renders the value, `phrase` writes the comparison in words. */
  function cell(label, node, colour, fmt, phrase) {
    var v = node && node.value != null ? Number(node.value) : null;
    var b = node && node.base != null ? Number(node.base) : null;
    var body;
    if (v == null) {
      body = '<div class="bs-val" style="color:#c3c8d1">no data</div>'
           + '<div class="bs-base">nothing has arrived for this one yet</div>';
    } else {
      body = '<div class="bs-val" style="color:' + colour + '">' + fmt(v) + '</div>'
           + '<div class="bs-base">' + phrase(v, b) + '</div>'
           + '<div class="bs-bar"><i style="width:' + pct(v, b) + '%;background:' + colour + '"></i></div>';
    }
    return '<div class="bs-cell"><div class="bs-lbl">' + label + '</div>' + body + '</div>';
  }

  function compare(v, b, unitWord, fmt) {
    if (b == null) return 'no baseline yet, too few days logged';
    var d = v - b;
    var cls = Math.abs(d) < b * 0.03 ? 'flat' : (d > 0 ? 'up' : 'down');
    var mark = cls === 'flat' ? '=' : (d > 0 ? '▲' : '▼');
    var word = cls === 'flat' ? 'level with' : (d > 0 ? 'over' : 'under');
    return '<span class="' + cls + '">' + mark + '</span> ' + word
         + ' your 30-day ' + fmt(b) + ' ' + unitWord;
  }

  function render(d) {
    var host = document.getElementById('bodystrip');
    if (!host) return;

    var html = '<div class="bs-grid">';
    html += cell('Slept', d.sleep, TONE.sleep,
      function (v) { return hm(v); },
      function (v, b) { return compare(v, b, 'average', function (x) { return hm(x); }); });
    html += cell('HRV', d.hrv, TONE.hrv,
      function (v) { return v.toFixed(1); },
      function (v, b) { return compare(v, b, 'average', function (x) { return Number(x).toFixed(1); }); });
    html += cell('Steps', d.steps, TONE.steps,
      function (v) { return commas(v); },
      function (v, b) { return compare(v, b, 'average', function (x) { return commas(x); }); });
    html += cell('Daylight', d.daylight, TONE.daylight,
      function (v) { return hm(v / 60); },
      function (v, b) { return compare(v, b, 'average', function (x) { return hm(x / 60); }); });
    html += '</div>';

    /* Honest footer: say which day these readings belong to, and flag a stale feed. */
    var asOf = d.as_of;
    var foot = '<div class="bs-foot"><b>Your body, ' + etDay(asOf) + '</b>';
    var todayET = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
    var gap = Math.round((Date.parse(todayET) - Date.parse(asOf)) / 86400000);
    if (gap > 1) foot += '<span class="stale">' + gap + ' days behind</span>';
    foot += '<span>read from Apple Health, compared with your own last 30 days</span></div>';

    host.innerHTML = html + foot;
  }

  function addCSS() {
    if (document.getElementById('bodystrip-css')) return;
    var style = document.createElement('style');
    style.id = 'bodystrip-css';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function mount() {
    if (document.getElementById('bodystrip')) return true;

    /* A page that knows where it wants the strip declares a slot, and that
       always wins over the anchor guess below. The page owns the layout in
       that case, so the strip adds no width or padding of its own. */
    var slot = document.getElementById('bodystrip-mount')
            || document.querySelector('[data-health-strip]');
    if (slot) {
      addCSS();
      var mounted = document.createElement('div');
      mounted.id = 'bodystrip';
      slot.appendChild(mounted);
      return true;
    }

    /* No slot: guess. .boardwrap is a flex child of .maincols, so anchoring to
       it would put the strip beside the board instead of above it. Anchor to
       the column wrapper. */
    var anchor = document.querySelector('.maincols')
              || document.querySelector('.boardwrap')
              || document.getElementById('board');
    if (!anchor || !anchor.parentNode) return false;

    addCSS();

    var host = document.createElement('div');
    host.id = 'bodystrip';
    host.className = 'wrap';
    host.style.maxWidth = '1120px';
    host.style.margin = '0 auto';
    host.style.padding = '0 16px';
    host.style.width = '100%';
    anchor.parentNode.insertBefore(host, anchor);
    return true;
  }

  var painted = false;

  function load() {
    if (painted) return;
    if (!mount()) return;
    painted = true;
    fetch(URL_BASE, {
      method: 'POST',
      headers: { 'apikey': KEY, 'Authorization': 'Bearer ' + KEY, 'Content-Type': 'application/json' },
      body: '{}'
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('HTTP ' + r.status)); })
      .then(render)
      .catch(function (e) {
        /* Let the retry below have another go at it. */
        painted = false;
        var host = document.getElementById('bodystrip');
        if (host) host.innerHTML = '<div class="bs-foot">Body data could not be read just now (' + e.message + ').</div>';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
  /* The board renders after its own data call, so try once more shortly after. */
  setTimeout(load, 1200);
})();
