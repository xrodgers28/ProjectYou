/* daylight-meter.js v1.1 (Oct 10, 2026)
   The daylight meter on the Cue Cards board (habit-modules.html). A small Hours of Daylight
   tile sits at the right end of the page header. Rolling over it, or tapping it, opens the
   full meter as a pop-up with an X to close it.

   What it draws: one year of daylight for a place. Yellow is daylight, the three
   tan bands above it are twilight, grey is night. A blue line marks a date (it
   starts on today and can be dragged), a dotted line marks the longest day.

   How it works: no outside data for the sun. Day length is worked out from the
   date and the latitude with the standard sunrise equation, so it works offline.
   The only outside call is the optional zip code lookup (zippopotam.us, free,
   no key).

   It finds its own place: the end of the .meter row in the page header (or an optional
   <div id="daylightmeter"></div>). Today comes from PY.today() so the
   2am to 2am day rule is respected; it falls back to the device date if that is
   missing. Settings (zip, compare on or off) are saved on this device. */
(function () {
  'use strict';

  var KEY = 'py_daylight_v1';
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  /* the home place, shown when the device clock is on Eastern time */
  var HOME = { name: 'Old Greenwich, CT', lat: 41.0343, lon: -73.5662, tz: 'America/New_York' };

  /* a place for each common device clock, so the meter follows the clock's zone */
  var CLOCKS = {
    'America/New_York': HOME,
    'America/Detroit': HOME,
    'America/Chicago': { name: 'Chicago, IL', lat: 41.8781, lon: -87.6298, tz: 'America/Chicago' },
    'America/Denver': { name: 'Denver, CO', lat: 39.7392, lon: -104.9903, tz: 'America/Denver' },
    'America/Phoenix': { name: 'Phoenix, AZ', lat: 33.4484, lon: -112.074, tz: 'America/Phoenix' },
    'America/Los_Angeles': { name: 'Los Angeles, CA', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles' },
    'America/Anchorage': { name: 'Anchorage, AK', lat: 61.2181, lon: -149.9003, tz: 'America/Anchorage' },
    'Pacific/Honolulu': { name: 'Honolulu, HI', lat: 21.3069, lon: -157.8583, tz: 'Pacific/Honolulu' },
    'America/Toronto': { name: 'Toronto, ON', lat: 43.6532, lon: -79.3832, tz: 'America/Toronto' },
    'America/Costa_Rica': { name: 'Costa Rica', lat: 9.9281, lon: -84.0907, tz: 'America/Costa_Rica' },
    'Europe/London': { name: 'London, UK', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
    'Europe/Paris': { name: 'Paris, France', lat: 48.8566, lon: 2.3522, tz: 'Europe/Paris' },
    'Europe/Berlin': { name: 'Berlin, Germany', lat: 52.52, lon: 13.405, tz: 'Europe/Berlin' },
    'Asia/Tokyo': { name: 'Tokyo, Japan', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
    'Australia/Sydney': { name: 'Sydney, Australia', lat: -33.8688, lon: 151.2093, tz: 'Australia/Sydney' }
  };

  /* the comparison places, set for now (Scott's list) */
  var COMPARE = [
    { name: 'San Diego', lat: 32.7157, lon: -117.1611, tz: 'America/Los_Angeles', color: '#d6336c' },
    { name: 'Charlotte NC', lat: 35.2271, lon: -80.8431, tz: 'America/New_York', color: '#2b8a3e' },
    { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, tz: 'America/Los_Angeles', color: '#7048e8' },
    { name: 'Costa Rica', lat: 9.9281, lon: -84.0907, tz: 'America/Costa_Rica', color: '#e8590c' }
  ];

  var C = {
    night: '#2b3552', astro: '#3b4570', nautical: '#575f98', civil: '#7d81c2', day: '#f4e6b4',
    blue: '#3f6f8f', dst: '#4fa08a', dstText: '#5ba898', ink: '#1f2a44', muted: '#8a93a0', up: '#4fa08a', down: '#c05f7a'
  };

  /* ---------- small helpers ---------- */
  function esc(t) {
    return String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function f1(n) { return n.toFixed(1); }
  function lsGet() { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } }
  function lsSet(o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} }
  function deviceTz() { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } }

  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function daysIn(y) { return isLeap(y) ? 366 : 365; }
  function doy0(y, m, d) { return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(y, 0, 1)) / 864e5); }

  function todayParts() {
    var k = null;
    try { if (window.PY && typeof window.PY.today === 'function') k = window.PY.today(); } catch (e) {}
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k || '');
    if (!m) { var d = new Date(); return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }; }
    return { y: +m[1], m: +m[2], d: +m[3] };
  }

  function dateLabel(y, i) {
    var dt = new Date(Date.UTC(y, 0, 1 + i));
    return MON[dt.getUTCMonth()] + ' ' + dt.getUTCDate() + ', ' + y;
  }

  /* 12 hr, 10 min */
  function fmtLong(h) {
    var t = Math.round(h * 60), hh = Math.floor(t / 60), mm = t % 60;
    return hh + ' hr, ' + mm + ' min';
  }
  /* 15h, 8m */
  function fmtShort(h) {
    var t = Math.round(h * 60), hh = Math.floor(t / 60), mm = t % 60;
    return hh + 'h, ' + mm + 'm';
  }

  /* ---------- the sun maths ---------- */
  /* the sun's tilt on a given day (radians), taken at that place's solar noon.
     Low-precision Astronomical Almanac formula, good to about 0.01 degree, which
     is well under a minute of day length. i counts days from Jan 1 of year y. */
  function decl(y, i, lon) {
    var rad = Math.PI / 180;
    var jd = Date.UTC(y, 0, 1 + i, 12) / 864e5 + 2440587.5 - lon / 360;
    var d = jd - 2451545.0;
    var L = 280.460 + 0.9856474 * d;
    var g = (357.528 + 0.9856003 * d) * rad;
    var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    var eps = (23.439 - 0.0000004 * d) * rad;
    return Math.asin(Math.sin(eps) * Math.sin(lam));
  }
  /* hours the sun spends above a given height (degrees). -0.833 is sunrise and
     sunset, -6 / -12 / -18 are the three twilights. 0 and 24 at the poles. */
  function hrs(latDeg, dec, altDeg) {
    var phi = latDeg * Math.PI / 180, a = altDeg * Math.PI / 180;
    var c = (Math.sin(a) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
    if (c >= 1) return 0;
    if (c <= -1) return 24;
    return 2 * Math.acos(c) * 180 / Math.PI / 15;
  }
  /* the equation of time (minutes): how far the real sun runs ahead of or behind the clock sun */
  function eotMin(y, i, lon) {
    var rad = Math.PI / 180;
    var jd = Date.UTC(y, 0, 1 + i, 12) / 864e5 + 2440587.5 - lon / 360;
    var d = jd - 2451545.0;
    var L = (((280.460 + 0.9856474 * d) % 360) + 360) % 360;
    var g = (357.528 + 0.9856003 * d) * rad;
    var lam = (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g)) * rad;
    var eps = (23.439 - 0.0000004 * d) * rad;
    var ra = Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) / rad;
    var diff = L - ra;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    return diff * 4;
  }
  /* sunrise and sunset as real moments (ms), for day i of year y. i may run past either end of the year. */
  function sunMs(lat, lon, y, i) {
    var h = hrs(lat, decl(y, i, lon), -0.833);
    if (h <= 0.01) return { none: 'down' };
    if (h >= 23.99) return { none: 'up' };
    var noon = Date.UTC(y, 0, 1 + i, 12) - (lon * 4 + eotMin(y, i, lon)) * 60000; /* UTC noon, moved to this place's solar noon */
    return { rise: noon - h * 18e5, set: noon + h * 18e5, h: h };
  }
  /* how many seconds of daylight the day gains (+) or loses (-) per day, around day i */
  function dayChangeSec(lat, lon, y, i) {
    var a = hrs(lat, decl(y, i - 1, lon), -0.833), b = hrs(lat, decl(y, i + 1, lon), -0.833);
    return (b - a) / 2 * 3600;
  }
  var seriesCache = {};
  function series(lat, lon, y, n) {
    var k = lat + '|' + lon + '|' + y;
    if (seriesCache[k]) return seriesCache[k];
    var o = { dec: [], day: [], civ: [], nau: [], ast: [] };
    for (var i = 0; i < n; i++) {
      var dc = decl(y, i, lon);
      o.dec.push(dc);
      o.day.push(hrs(lat, dc, -0.833));
      o.civ.push(hrs(lat, dc, -6));
      o.nau.push(hrs(lat, dc, -12));
      o.ast.push(hrs(lat, dc, -18));
    }
    seriesCache[k] = o;
    return o;
  }
  function argmax(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] > a[b]) b = i; return b; }
  function argmin(a) { var b = 0; for (var i = 1; i < a.length; i++) if (a[i] < a[b]) b = i; return b; }

  /* the four turning points of the year, found from the sun's tilt */
  function sunEvents(sr, n) {
    var ev = [], i;
    for (i = 0; i < n - 1; i++) {
      if ((sr.dec[i] <= 0 && sr.dec[i + 1] > 0) || (sr.dec[i] >= 0 && sr.dec[i + 1] < 0)) {
        ev.push({ i: Math.abs(sr.dec[i]) < Math.abs(sr.dec[i + 1]) ? i : i + 1, kind: 'equinox' });
      }
    }
    ev.push({ i: argmax(sr.dec), kind: 'solstice' });
    ev.push({ i: argmin(sr.dec), kind: 'solstice' });
    return ev;
  }

  /* days until the days start to last longer. If they already are, days until
     the longest day instead, so the number always means something. */
  function lightStat(lat, lon, y, t0, n) {
    var L = [], k;
    for (k = 0; k <= n + 1; k++) L.push(hrs(lat, decl(y, t0 + k, lon), -0.833));
    var s = L[1] - L[0];
    if (Math.abs(s) < 1e-7) return null;
    if (s < 0) {
      for (k = 1; k < n; k++) { if (L[k + 1] > L[k]) break; }
      return { label: 'Days till more light', days: k };
    }
    for (k = 1; k < n; k++) { if (L[k + 1] < L[k]) break; }
    return { label: 'Days till longest day', days: k };
  }

  /* ---------- daylight savings: the next clock change in a time zone ---------- */
  var dtf = {};
  function offMin(tz, ms) {
    try {
      var fm = dtf[tz] || (dtf[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset', hour: 'numeric' }));
      var parts = fm.formatToParts(new Date(ms)), name = '';
      for (var i = 0; i < parts.length; i++) if (parts[i].type === 'timeZoneName') name = parts[i].value;
      var m = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(name);
      if (!m) return 0;
      return (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + (+(m[3] || 0)));
    } catch (e) { return null; }
  }
  function nextDst(tz, t) {
    var base = Date.UTC(t.y, t.m - 1, t.d, 12), prev = offMin(tz, base);
    if (prev === null) return null;
    for (var d = 1; d <= 400; d++) {
      var cur = offMin(tz, base + d * 864e5);
      if (cur === null) return null;
      if (cur !== prev) return { days: d, starts: cur > prev };
      prev = cur;
    }
    return { none: true };
  }

  /* every clock change in the calendar year, as day numbers (0 is Jan 1) */
  var dstCache = {};
  function dstDays(tz, y, n) {
    if (!tz) return [];
    var key = tz + '|' + y + '|' + n;
    if (dstCache[key]) return dstCache[key];
    var out = [], prev = offMin(tz, Date.UTC(y, 0, 1, 12)), i, cur;
    if (prev !== null) {
      for (i = 1; i < n; i++) {
        cur = offMin(tz, Date.UTC(y, 0, 1 + i, 12));
        if (cur === null) break;
        if (cur !== prev) out.push({ i: i, ahead: cur > prev });
        prev = cur;
      }
    }
    return (dstCache[key] = out);
  }

  /* ---------- state ---------- */
  var saved = lsGet();
  var S = {
    loc: null,            /* the place being shown */
    custom: !!(saved.loc && typeof saved.loc.lat === 'number'),
    compare: !!saved.compare,
    open: false,          /* the pop-up is showing */
    pinned: false,        /* it stays open until closed (clicked, dragged, or tapped open) */
    sel: null,            /* day picked with the blue line; null means today */
    drag: false,
    W: 0, H: 160,
    M: { l: 36, r: 40, t: 8, b: 22 },
    t: null, n: 365, todayIdx: 0
  };

  function defaultLoc() { return CLOCKS[deviceTz()] || HOME; }
  function pickLoc() { return S.custom ? saved.loc : defaultLoc(); }
  function persist() { lsSet({ loc: S.custom ? S.loc : null, compare: S.compare }); }

  function readClock() {
    S.t = todayParts();
    S.n = daysIn(S.t.y);
    S.todayIdx = doy0(S.t.y, S.t.m, S.t.d);
  }

  /* ---------- page pieces ---------- */
  var host = null, tile, tileNum, tileChg, sunEl, chgEl, infoTimer = null, float, card, wrap, svg, tip, locBtn, backBtn, statsEl, legendEl, pop, msgEl, zipIn, cmpBox, xBtn, hoverT = null;

  function injectCss() {
    if (document.getElementById('dl-css')) return;
    var s = document.createElement('style');
    s.id = 'dl-css';
    s.textContent =
      '.dl-tile{flex:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;min-width:80px;min-height:76px;padding:6px 8px;background:#fff;border:1.5px solid #3f6f8f;border-radius:12px;box-shadow:0 4px 12px rgba(31,42,68,.06);cursor:pointer;font-family:Arial,Helvetica,sans-serif;color:#1f2a44}' +
      '.dl-tile:hover,.dl-tile[aria-expanded="true"]{border-color:#3f6f8f}' +
      '.dl-tile:focus-visible{outline:2px solid #3f6f8f;outline-offset:2px}' +
      '.dl-tl{font-size:9.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;line-height:1.15;color:#5b6472;text-align:center}' +
      '.dl-td{font-size:9px;font-weight:800;line-height:1.1;white-space:nowrap;letter-spacing:.01em}' +
      '.dl-tn{font-size:28px;font-weight:800;line-height:1;font-variant-numeric:tabular-nums}' +
      '.dl-float{position:absolute;z-index:45;left:0;top:0;display:none}' +
      '.dl-float.on{display:block;animation:dlin .12s ease-out}' +
      '@keyframes dlin{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}' +
      '@media(prefers-reduced-motion:reduce){.dl-float.on{animation:none}}' +
      '.dl-card{position:relative;background:#fff;border:1px solid #e3e7ee;border-radius:14px;box-shadow:0 16px 44px rgba(31,42,68,.26);padding:10px 12px 8px;font-family:Arial,Helvetica,sans-serif;color:#1f2a44}' +
      '.dl-head{display:flex;justify-content:space-between;align-items:flex-start;gap:6px 16px;flex-wrap:wrap}' +
      '.dl-left{display:flex;align-items:center;gap:10px;flex-wrap:wrap;min-width:0}' +
      '.dl-loc{font:700 13px Arial,Helvetica,sans-serif;color:#5b6472;background:none;border:0;border-bottom:1px dotted #9aa6b4;padding:2px 0;cursor:pointer}' +
      '.dl-loc:hover,.dl-loc:focus-visible{color:#3f6f8f;border-bottom-color:#3f6f8f;outline:none}' +
      '.dl-loc .dl-car{font-size:10px;margin-left:5px}' +
      '.dl-back{font:800 11px Arial,Helvetica,sans-serif;color:#3f6f8f;background:#e2ecf3;border:0;border-radius:999px;padding:3px 10px;cursor:pointer}' +
      '.dl-back[hidden]{display:none}' +
      '.dl-legend{display:flex;gap:4px 14px;flex-wrap:wrap;margin-top:6px;font-size:11px;font-weight:700;color:#5b6472}' +
      '.dl-legend:empty{display:none}' +
      '.dl-legend em{font-style:normal;font-weight:800;color:#1f2a44;font-variant-numeric:tabular-nums;margin-left:2px}' +
      '.dl-legend i{display:inline-block;width:14px;height:3px;border-radius:2px;vertical-align:middle;margin-right:5px}' +
      '.dl-right{display:flex;align-items:flex-start;gap:12px}' +
      '.dl-stats{display:flex;flex-direction:column;align-items:flex-end;gap:1px;text-align:right}' +
      '.dl-stat{font-size:12px;color:#8a93a0;line-height:1.35;white-space:nowrap}' +
      '.dl-stat b{font-size:16px;font-weight:800;margin-left:7px;color:#8a93a0;font-variant-numeric:tabular-nums}' +
      '.dl-stat.dl-blue b{color:#3f6f8f}' +
      '.dl-x{flex:none;width:28px;height:28px;margin:-3px -3px 0 0;display:flex;align-items:center;justify-content:center;background:none;border:0;border-radius:8px;color:#8a93a0;font-size:20px;line-height:1;cursor:pointer}' +
      '.dl-x:hover,.dl-x:focus-visible{background:#eef2f8;color:#1f2a44;outline:none}' +
      '.dl-info{display:flex;justify-content:space-between;gap:2px 16px;flex-wrap:wrap;margin-top:6px;font-size:12px;line-height:1.4;color:#5b6472}' +
      '.dl-info b{color:#1f2a44;font-weight:800}' +
      '.dl-info .dl-up{color:#2f7a66}.dl-info .dl-dn{color:#a14560}' +
      '.dl-info:empty{display:none}' +
      '.dl-chart{position:relative;margin-top:2px}' +
      '.dl-chart svg{display:block;width:100%;touch-action:pan-y;user-select:none;-webkit-user-select:none;cursor:ew-resize;outline:none}' +
      '.dl-chart svg:focus-visible{outline:2px solid #3f6f8f;outline-offset:2px;border-radius:4px}' +
      '.dl-chart .maxhit{cursor:help}' +
      '.dl-tip{position:absolute;z-index:5;pointer-events:none;background:#fff;border:1px solid #e3e7ee;border-radius:8px;box-shadow:0 6px 16px rgba(31,42,68,.16);padding:5px 9px;font-size:11.5px;line-height:1.35;color:#5b6472;white-space:nowrap}' +
      '.dl-tip b{display:block;color:#1f2a44;font-size:13px}' +
      '.dl-tip[hidden]{display:none}' +
      '.dl-pop{position:absolute;z-index:30;left:10px;top:34px;width:min(310px,calc(100% - 20px));background:#fff;border:1px solid #e3e7ee;border-radius:12px;box-shadow:0 12px 30px rgba(31,42,68,.2);padding:12px}' +
      '.dl-pop[hidden]{display:none}' +
      '.dl-pt{font-size:12px;font-weight:800;color:#1f2a44;margin-bottom:8px}' +
      '.dl-zipf{display:flex;gap:6px}' +
      '.dl-zipf input{flex:1;min-width:0;font:600 14px Arial,Helvetica,sans-serif;padding:7px 10px;border:1px solid #cfd6e0;border-radius:8px;color:#1f2a44}' +
      '.dl-zipf input:focus{outline:2px solid #3f6f8f;outline-offset:0;border-color:#3f6f8f}' +
      '.dl-btn{font:800 12px Arial,Helvetica,sans-serif;color:#fff;background:#3f6f8f;border:0;border-radius:8px;padding:7px 14px;cursor:pointer}' +
      '.dl-btn:hover{background:#345d79}' +
      '.dl-lnk{display:block;margin-top:8px;font:700 12px Arial,Helvetica,sans-serif;color:#3f6f8f;background:none;border:0;padding:0;cursor:pointer;text-align:left}' +
      '.dl-lnk:hover{text-decoration:underline}' +
      '.dl-lnk[hidden]{display:none}' +
      '.dl-sw{position:relative;display:flex;align-items:flex-start;gap:9px;margin-top:12px;padding-top:10px;border-top:1px solid #edf0f4;font-size:12px;line-height:1.4;color:#5b6472;cursor:pointer}' +
      '.dl-sw input{position:absolute;opacity:0;width:0;height:0}' +
      '.dl-sl{flex:none;position:relative;width:34px;height:20px;border-radius:999px;background:#cfd6e0;transition:background .15s;margin-top:1px}' +
      '.dl-sl:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .15s}' +
      '.dl-sw input:checked + .dl-sl{background:#3f6f8f}' +
      '.dl-sw input:checked + .dl-sl:after{transform:translateX(14px)}' +
      '.dl-sw input:focus-visible + .dl-sl{outline:2px solid #3f6f8f;outline-offset:2px}' +
      '.dl-msg{margin-top:8px;font-size:12px;font-weight:700;color:#5b6472;min-height:0}' +
      '.dl-msg:empty{display:none}' +
      '.dl-msg.bad{color:#c0392b}' +
      '@media(max-width:600px){.dl-card{padding:9px 10px 6px}.dl-stats{align-items:flex-start;text-align:left}.dl-right{width:100%;justify-content:space-between}.dl-tile{min-width:68px;min-height:64px}.dl-tn{font-size:24px}}';
    document.head.appendChild(s);
  }

  function build() {
    tile = document.createElement('button');
    tile.type = 'button';
    tile.className = 'dl-tile';
    tile.setAttribute('aria-haspopup', 'dialog');
    tile.setAttribute('aria-expanded', 'false');
    tile.innerHTML = '<span class="dl-tl">Hours of<br>daylight</span><span class="dl-tn"></span><span class="dl-td"></span>';
    tileNum = tile.querySelector('.dl-tn'); tileChg = tile.querySelector('.dl-td');
    host.appendChild(tile);

    float = document.createElement('div');
    float.className = 'dl-float';
    float.setAttribute('role', 'dialog');
    float.setAttribute('aria-label', 'Daylight meter');
    card = document.createElement('div');
    card.className = 'dl-card';
    card.innerHTML =
      '<div class="dl-head">' +
        '<div class="dl-left">' +
          '<button type="button" class="dl-loc" aria-haspopup="dialog" aria-expanded="false" title="Tap to change the location"></button>' +
          '<button type="button" class="dl-back" hidden>Back to today</button>' +
        '</div>' +
        '<div class="dl-right">' +
          '<div class="dl-stats" aria-live="polite"></div>' +
          '<button type="button" class="dl-x" aria-label="Close the daylight meter" title="Close">&times;</button>' +
        '</div>' +
      '</div>' +
      '<div class="dl-legend"></div>' +
      '<div class="dl-info" aria-live="off"><span class="dl-sunt"></span><span class="dl-chg"></span></div>' +
      '<div class="dl-pop" role="dialog" aria-label="Daylight location" hidden>' +
        '<div class="dl-pt">Where do you want to see daylight for?</div>' +
        '<form class="dl-zipf" novalidate>' +
          '<input type="text" inputmode="numeric" pattern="[0-9]*" maxlength="5" placeholder="Zip code" aria-label="US zip code" autocomplete="postal-code">' +
          '<button type="submit" class="dl-btn">Set</button>' +
        '</form>' +
        '<button type="button" class="dl-lnk dl-gps">Use my current location</button>' +
        '<button type="button" class="dl-lnk dl-reset" hidden>Back to the default location</button>' +
        '<label class="dl-sw"><input type="checkbox" class="dl-cmp"><span class="dl-sl"></span>' +
          '<span>Compare with ' + esc(COMPARE.map(function (c) { return c.name; }).join(', ')) + '</span></label>' +
        '<div class="dl-msg" role="status"></div>' +
      '</div>' +
      '<div class="dl-chart">' +
        '<svg role="slider" tabindex="0" aria-label="Date on the daylight chart. Use the left and right arrow keys to move it." aria-valuemin="1"></svg>' +
        '<div class="dl-tip" hidden></div>' +
      '</div>';
    float.appendChild(card);
    document.body.appendChild(float);

    wrap = card.querySelector('.dl-chart');
    svg = card.querySelector('svg');
    tip = card.querySelector('.dl-tip');
    locBtn = card.querySelector('.dl-loc');
    backBtn = card.querySelector('.dl-back');
    statsEl = card.querySelector('.dl-stats');
    legendEl = card.querySelector('.dl-legend');
    pop = card.querySelector('.dl-pop');
    msgEl = card.querySelector('.dl-msg');
    zipIn = card.querySelector('.dl-zipf input');
    cmpBox = card.querySelector('.dl-cmp');
    xBtn = card.querySelector('.dl-x');
    sunEl = card.querySelector('.dl-sunt');
    chgEl = card.querySelector('.dl-chg');
  }

  /* ---------- header ---------- */
  function comps() {
    if (!S.compare) return [];
    return COMPARE.filter(function (c) { return c.name !== S.loc.name; });
  }

  var tmFmt = {};
  function fmtClock(ms, tz) {
    try {
      var k = tz || 'local', f = tmFmt[k] || (tmFmt[k] = new Intl.DateTimeFormat('en-US', { timeZone: tz || undefined, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }));
      var parts = f.formatToParts(new Date(ms)), hh = '', mm = '', ap = '', zn = '';
      parts.forEach(function (p) { if (p.type === 'hour') hh = p.value; else if (p.type === 'minute') mm = p.value; else if (p.type === 'dayPeriod') ap = p.value.toLowerCase(); else if (p.type === 'timeZoneName') zn = p.value; });
      return hh + ':' + mm + ap + (zn ? ' ' + zn : '');
    } catch (e) { return ''; }
  }
  function fmtDur(ms) {
    var t = Math.max(0, Math.round(ms / 60000)), hh = Math.floor(t / 60), mm = t % 60;
    return hh > 0 ? hh + ' hr, ' + mm + ' min' : mm + ' min';
  }
  function fmtChange(sec) {
    var a = Math.abs(Math.round(sec)), m = Math.floor(a / 60), r = a % 60;
    return m > 0 ? m + 'm ' + r + 's' : r + 's';
  }
  /* "Losing 2m 40s a day" for the tile and the pop-up */
  function changeParts(i) {
    var sec = dayChangeSec(S.loc.lat, S.loc.lon, S.t.y, i);
    if (Math.abs(sec) < 15) return { cls: '', arrow: '\u25CF', word: 'Holding steady', short: 'steady', color: C.muted };
    return sec < 0
      ? { cls: 'dl-dn', arrow: '\u25BC', word: 'Losing', short: fmtChange(sec) + '/day', amt: fmtChange(sec), color: C.down }
      : { cls: 'dl-up', arrow: '\u25B2', word: 'Gaining', short: fmtChange(sec) + '/day', amt: fmtChange(sec), color: C.up };
  }

  /* sunrise, sunset and the light that is left, for the day the blue line is on */
  function drawInfo() {
    if (!sunEl) return;
    var i = S.sel == null ? S.todayIdx : S.sel, y = S.t.y, lat = S.loc.lat, lon = S.loc.lon, tz = S.loc.tz;
    var sm = sunMs(lat, lon, y, i), txt = '';
    if (sm.none) {
      txt = sm.none === 'up' ? 'The sun does not set on this day' : 'The sun does not rise on this day';
    } else {
      txt = 'Sunrise <b>' + esc(fmtClock(sm.rise, tz)) + '</b> &middot; Sunset <b>' + esc(fmtClock(sm.set, tz)) + '</b>';
      if (i === S.todayIdx) {
        var now = Date.now(), left = '';
        for (var k = i - 1; k <= i + 1 && !left; k++) {
          var q = sunMs(lat, lon, y, k);
          if (q.none) continue;
          if (now >= q.rise && now < q.set) left = '<b>' + fmtDur(q.set - now) + '</b> of light left';
          else if (now < q.rise) left = 'Sunrise in <b>' + fmtDur(q.rise - now) + '</b>';
        }
        if (left) txt += ' &middot; ' + left;
      }
    }
    sunEl.innerHTML = txt;
    var c = changeParts(i);
    chgEl.innerHTML = c.amt ? '<span class="' + c.cls + '"><b class="' + c.cls + '">' + c.arrow + ' ' + c.word + ' ' + c.amt + ' a day</b></span>' : '<b>' + c.arrow + ' ' + c.word + '</b>';
  }

  function drawHeader() {
    locBtn.innerHTML = esc(S.loc.name) + '<span class="dl-car" aria-hidden="true">&#9662;</span>';
    cmpBox.checked = S.compare;
    card.querySelector('.dl-reset').hidden = !S.custom;

    var cs = comps();
    legendEl.innerHTML = cs.length
      ? '<span><i style="background:#1f2a44"></i>' + esc(S.loc.name) + ' <em class="dl-lv"></em></span>' +
        cs.map(function (c) { return '<span><i style="background:' + c.color + '"></i>' + esc(c.name) + ' <em class="dl-lv"></em></span>'; }).join('')
      : '';

    var html = '', ds = null;
    if (S.loc.tz) ds = nextDst(S.loc.tz, S.t);
    if (ds && !ds.none) {
      html += '<div class="dl-stat">Days till daylight savings ' + (ds.starts ? 'starts' : 'ends') + '<b>' + ds.days + '</b></div>';
    } else if (ds && ds.none) {
      html += '<div class="dl-stat">No daylight savings here</div>';
    }
    var ls = lightStat(S.loc.lat, S.loc.lon, S.t.y, S.todayIdx, S.n);
    if (ls) html += '<div class="dl-stat dl-blue">' + ls.label + '<b>' + ls.days + '</b></div>';
    statsEl.innerHTML = html;

    var th = series(S.loc.lat, S.loc.lon, S.t.y, S.n).day[S.todayIdx];
    tileNum.textContent = Math.floor(Math.round(th * 60) / 60);
    var tc = changeParts(S.todayIdx);
    tileChg.textContent = tc.arrow + ' ' + tc.short;
    tileChg.style.color = tc.color === C.muted ? '#5b6472' : (tc.color === C.down ? '#a14560' : '#2f7a66');
    tile.setAttribute('aria-label', 'Hours of daylight today in ' + S.loc.name + ': ' + fmtLong(th) + ', ' + (tc.amt ? tc.word.toLowerCase() + ' ' + tc.amt + ' a day' : 'holding steady') + '. Open the daylight meter.');
    backBtn.hidden = (S.sel == null || S.sel === S.todayIdx);
  }

  /* ---------- the chart ---------- */
  function geom() {
    var M = S.M, W = S.W, H = S.H;
    return { x0: M.l, x1: W - M.r, y0: M.t, y1: H - M.b, n: S.n };
  }
  function Xf(g, i) { return g.x0 + (i + 0.5) / g.n * (g.x1 - g.x0); }
  function Yf(g, h) { return g.y0 + (1 - h / 24) * (g.y1 - g.y0); }

  function band(g, arr, color) {
    var p = 'M' + f1(g.x0) + ',' + f1(g.y1) + ' L' + f1(g.x0) + ',' + f1(Yf(g, arr[0]));
    for (var i = 0; i < g.n; i++) p += ' L' + f1(Xf(g, i)) + ',' + f1(Yf(g, arr[i]));
    p += ' L' + f1(g.x1) + ',' + f1(Yf(g, arr[g.n - 1])) + ' L' + f1(g.x1) + ',' + f1(g.y1) + ' Z';
    return '<path d="' + p + '" fill="' + color + '"/>';
  }
  function line(g, arr, color, w) {
    var pts = [];
    for (var i = 0; i < g.n; i++) pts.push(f1(Xf(g, i)) + ',' + f1(Yf(g, arr[i])));
    return '<polyline points="' + pts.join(' ') + '" fill="none" stroke="' + color + '" stroke-width="' + w + '" stroke-linejoin="round" stroke-linecap="round"/>';
  }

  function drawStatic() {
    var g = geom(), n = S.n, y = S.t.y, sr = series(S.loc.lat, S.loc.lon, y, n), h = '', i, k;
    var pw = g.x1 - g.x0, ph = g.y1 - g.y0;

    h += '<rect x="' + f1(g.x0) + '" y="' + f1(g.y0) + '" width="' + f1(pw) + '" height="' + f1(ph) + '" fill="' + C.night + '"/>';
    h += band(g, sr.ast, C.astro) + band(g, sr.nau, C.nautical) + band(g, sr.civ, C.civil) + band(g, sr.day, C.day);

    /* grid: month lines and a line every 4 hours */
    for (k = 1; k < 12; k++) {
      var gx = g.x0 + doy0(y, k + 1, 1) / n * pw;
      h += '<line x1="' + f1(gx) + '" y1="' + f1(g.y0) + '" x2="' + f1(gx) + '" y2="' + f1(g.y1) + '" stroke="rgba(0,0,0,.2)" stroke-width="1"/>';
    }
    for (k = 4; k < 24; k += 4) {
      var gy = Yf(g, k);
      h += '<line x1="' + f1(g.x0) + '" y1="' + f1(gy) + '" x2="' + f1(g.x1) + '" y2="' + f1(gy) + '" stroke="rgba(0,0,0,.2)" stroke-width="1"/>';
    }
    h += '<rect x="' + f1(g.x0) + '" y="' + f1(g.y0) + '" width="' + f1(pw) + '" height="' + f1(ph) + '" fill="none" stroke="rgba(0,0,0,.35)" stroke-width="1"/>';

    /* axis words */
    for (k = 0; k <= 24; k += 4) {
      var ay = Yf(g, k) + 4;
      h += '<text x="' + f1(g.x0 - 6) + '" y="' + f1(ay) + '" text-anchor="end" font-size="10.5" fill="' + C.muted + '">' + k + ' hr</text>';
      h += '<text x="' + f1(g.x1 + 6) + '" y="' + f1(ay) + '" text-anchor="start" font-size="10.5" fill="' + C.muted + '">' + (24 - k) + ' hr</text>';
    }
    for (k = 1; k <= 12; k++) {
      var a = doy0(y, k, 1), b = k === 12 ? n : doy0(y, k + 1, 1);
      h += '<text x="' + f1(g.x0 + (a + b) / 2 / n * pw) + '" y="' + f1(g.y1 + 15) + '" text-anchor="middle" font-size="11" fill="' + C.muted + '">' + (pw / 12 < 34 ? MON[k - 1].charAt(0) : MON[k - 1]) + '</text>';
    }
    h += '<text x="' + f1(g.x0 + pw * 0.08) + '" y="' + f1(g.y0 + 17) + '" text-anchor="middle" font-size="13" fill="rgba(255,255,255,.7)">night</text>';
    h += '<text x="' + f1(g.x0 + pw * 0.92) + '" y="' + f1(g.y0 + 17) + '" text-anchor="middle" font-size="13" fill="rgba(255,255,255,.7)">night</text>';
    h += '<text x="' + f1(g.x0 + pw * 0.5) + '" y="' + f1(g.y1 - 8) + '" text-anchor="middle" font-size="13" fill="rgba(90,70,10,.6)">day</text>';

    /* the comparison places, then the main place on top */
    comps().forEach(function (c) { h += line(g, series(c.lat, c.lon, y, n).day, c.color, 1.8); });
    h += line(g, sr.day, C.ink, 2.3);

    /* equinoxes and solstices */
    sunEvents(sr, n).forEach(function (e) {
      var dt = new Date(Date.UTC(y, 0, 1 + e.i));
      var nm = MON[dt.getUTCMonth()] + ' ' + (e.kind === 'equinox' ? 'equinox' : 'solstice');
      h += '<circle cx="' + f1(Xf(g, e.i)) + '" cy="' + f1(Yf(g, sr.day[e.i])) + '" r="2.6" fill="#1f2a44"><title>' + esc(nm + ': ' + fmtLong(sr.day[e.i])) + '</title></circle>';
    });

    /* daylight savings: a thin teal line on each day the clocks change */
    dstDays(S.loc.tz, y, n).forEach(function (d) {
      var dx = Xf(g, d.i), dt = new Date(Date.UTC(y, 0, 1 + d.i));
      var when = MON[dt.getUTCMonth()] + ' ' + dt.getUTCDate();
      var word = d.ahead ? 'Clocks ahead' : 'Clocks back';
      h += '<line x1="' + f1(dx) + '" y1="' + f1(g.y0) + '" x2="' + f1(dx) + '" y2="' + f1(g.y1) + '" stroke="' + C.dst + '" stroke-width="1" stroke-dasharray="1.5 3"/>';
      h += '<rect x="' + f1(dx - 5) + '" y="' + f1(g.y0) + '" width="10" height="' + f1(ph) + '" fill="transparent"><title>' + esc('Daylight savings: ' + when + ', ' + word.toLowerCase() + ' 1 hr') + '</title></rect>';
      if (pw >= 420) {
        var right = dx < g.x1 - 70;
        h += '<text x="' + f1(dx + (right ? 4 : -4)) + '" y="' + f1(g.y1 - 5) + '" text-anchor="' + (right ? 'start' : 'end') + '" font-size="9.5" font-weight="400" fill="' + C.dstText + '">' + esc(word) + '</text>';
      }
    });

    /* the longest day: dotted line plus a wider invisible strip to hover on */
    var mi = argmax(sr.day), mx = Xf(g, mi);
    S.maxX = mx; S.maxH = sr.day[mi];
    h += '<line x1="' + f1(mx) + '" y1="' + f1(g.y0) + '" x2="' + f1(mx) + '" y2="' + f1(g.y1) + '" stroke="#1f2a44" stroke-width="1" stroke-dasharray="2 3"/>';
    h += '<rect class="maxhit" x="' + f1(mx - 7) + '" y="' + f1(g.y0) + '" width="14" height="' + f1(ph) + '" fill="transparent"/>';

    S.stEl.innerHTML = h;
  }

  function drawDyn() {
    var g = geom(), n = S.n, y = S.t.y;
    var i = S.sel == null ? S.todayIdx : S.sel;
    var sr = series(S.loc.lat, S.loc.lon, y, n), x = Xf(g, i), h = '';
    var cs = comps();

    h += '<line x1="' + f1(x) + '" y1="' + f1(g.y0) + '" x2="' + f1(x) + '" y2="' + f1(g.y1) + '" stroke="' + C.blue + '" stroke-width="2"/>';
    h += '<circle cx="' + f1(x) + '" cy="' + f1(g.y0 + 1) + '" r="5" fill="' + C.blue + '" stroke="#fff" stroke-width="1.5"/>';
    cs.forEach(function (c) {
      h += '<circle cx="' + f1(x) + '" cy="' + f1(Yf(g, series(c.lat, c.lon, y, n).day[i])) + '" r="3.2" fill="' + c.color + '" stroke="#fff" stroke-width="1"/>';
    });
    h += '<circle cx="' + f1(x) + '" cy="' + f1(Yf(g, sr.day[i])) + '" r="3.6" fill="#1f2a44" stroke="#fff" stroke-width="1.2"/>';

    /* the read-out: the day length and date, smaller than the mock, beside the blue line.
       With comparison on, the other places' numbers for this date sit in the legend. */
    var rows = [{ t: fmtLong(sr.day[i]), b: true }, { t: dateLabel(y, i), s: true }];
    var lh = 15, bh = rows.length * lh + 6;
    var onRight = x < (g.x0 + g.x1) / 2;
    var tx = onRight ? x + 5 : x - 5;
    var by = Math.min(Math.max(Yf(g, sr.day[i]) + 8, g.y0 + 4), g.y1 - bh - 3);
    rows.forEach(function (r, k) {
      var ty = by + 3 + (k + 1) * lh - 4;
      h += '<text x="' + f1(tx) + '" y="' + f1(ty) + '" text-anchor="' + (onRight ? 'start' : 'end') + '" font-size="' + (r.b ? 13 : 11.5) + '" font-weight="' + (r.b ? 800 : 600) + '" fill="' + (r.s ? '#5b6472' : C.ink) + '">' + esc(r.t) + '</text>';
    });

    var lv = legendEl.querySelectorAll('.dl-lv');
    if (lv.length) {
      lv[0].textContent = fmtLong(sr.day[i]);
      cs.forEach(function (c, k) { if (lv[k + 1]) lv[k + 1].textContent = fmtLong(series(c.lat, c.lon, y, n).day[i]); });
    }

    S.dynEl.innerHTML = h;
    drawInfo();
    svg.setAttribute('aria-valuemax', String(n));
    svg.setAttribute('aria-valuenow', String(i + 1));
    svg.setAttribute('aria-valuetext', dateLabel(y, i) + ', ' + fmtLong(sr.day[i]) + ' of daylight in ' + S.loc.name);
    backBtn.hidden = (S.sel == null || S.sel === S.todayIdx);
  }

  function drawAll() {
    var W = Math.floor(wrap.clientWidth);
    if (!S.open || W < 60) return;
    S.W = W;
    S.H = W < 520 ? 150 : 160;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + S.H);
    svg.setAttribute('height', S.H);
    drawStatic();
    drawDyn();
  }

  /* ---------- picking a day ---------- */
  function idxFromEvent(e) {
    var r = svg.getBoundingClientRect(), g = geom();
    var px = e.clientX - r.left;
    var i = Math.round((px - g.x0) / (g.x1 - g.x0) * g.n - 0.5);
    return Math.max(0, Math.min(g.n - 1, i));
  }
  function setSel(i) {
    S.sel = Math.max(0, Math.min(S.n - 1, i));
    drawDyn();
  }

  function showTip(e) {
    var r = wrap.getBoundingClientRect(), left = S.maxX + 10;
    tip.innerHTML = 'Max daylight:<b>' + fmtShort(S.maxH) + '</b>';
    tip.hidden = false;
    if (left + tip.offsetWidth > r.width) left = S.maxX - 10 - tip.offsetWidth;
    tip.style.left = Math.max(0, left) + 'px';
    tip.style.top = (S.M.t + 6) + 'px';
  }

  function wireChart() {
    svg.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0) return;
      S.drag = true;
      try { svg.setPointerCapture(ev.pointerId); } catch (e) {}
      setSel(idxFromEvent(ev));
      if (ev.target.classList && ev.target.classList.contains('maxhit')) showTip(ev); else tip.hidden = true;
    });
    svg.addEventListener('pointermove', function (ev) {
      if (S.drag) { setSel(idxFromEvent(ev)); tip.hidden = true; return; }
      if (ev.target.classList && ev.target.classList.contains('maxhit')) showTip(ev); else tip.hidden = true;
    });
    function end(ev) {
      S.drag = false;
      try { svg.releasePointerCapture(ev.pointerId); } catch (e) {}
    }
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('pointerleave', function () { if (!S.drag) tip.hidden = true; });
    svg.addEventListener('keydown', function (ev) {
      var cur = S.sel == null ? S.todayIdx : S.sel, step = 0;
      if (ev.key === 'ArrowLeft') step = ev.shiftKey ? -7 : -1;
      else if (ev.key === 'ArrowRight') step = ev.shiftKey ? 7 : 1;
      else if (ev.key === 'PageUp') step = -30;
      else if (ev.key === 'PageDown') step = 30;
      else if (ev.key === 'Home') { ev.preventDefault(); setSel(0); return; }
      else if (ev.key === 'End') { ev.preventDefault(); setSel(S.n - 1); return; }
      else return;
      ev.preventDefault();
      setSel(cur + step);
    });
  }

  /* ---------- location pop-up ---------- */
  function say(t, bad) { msgEl.textContent = t || ''; msgEl.className = 'dl-msg' + (bad ? ' bad' : ''); }
  function openPop() {
    pop.hidden = false;
    locBtn.setAttribute('aria-expanded', 'true');
    say('');
    setTimeout(function () { try { zipIn.focus(); } catch (e) {} }, 0);
  }
  function closePop() { pop.hidden = true; locBtn.setAttribute('aria-expanded', 'false'); }

  function applyLoc(loc, custom) {
    S.loc = loc;
    S.custom = custom;
    saved.loc = custom ? loc : null;
    S.sel = null;
    persist();
    drawHeader();
    drawAll();
  }

  function lookupZip(zip) {
    say('Looking that up...');
    fetch('https://api.zippopotam.us/us/' + zip).then(function (r) {
      if (r.status === 404) throw new Error('nf');
      if (!r.ok) throw new Error('net');
      return r.json();
    }).then(function (j) {
      var p = j && j.places && j.places[0];
      if (!p) throw new Error('nf');
      var st = p['state abbreviation'];
      var tz = st === 'AZ' ? 'America/Phoenix' : st === 'HI' ? 'Pacific/Honolulu' : 'America/New_York';
      applyLoc({ name: p['place name'] + ', ' + st, lat: parseFloat(p.latitude), lon: parseFloat(p.longitude), tz: tz }, true);
      say('');
      closePop();
    }).catch(function (e) {
      if (e && e.message === 'nf') say('I could not find that zip code. Check it and try again.', true);
      else say('I could not reach the zip lookup. Check your connection and try again.', true);
    });
  }

  function useGps() {
    if (!navigator.geolocation) { say('This device cannot share its location.', true); return; }
    say('Asking your device...');
    navigator.geolocation.getCurrentPosition(function (pos) {
      var tz = deviceTz();
      applyLoc({ name: 'My location', lat: pos.coords.latitude, lon: pos.coords.longitude, tz: tz }, true);
      say('');
      closePop();
    }, function () {
      say('Your device did not share its location. You can type a zip code instead.', true);
    }, { timeout: 10000, maximumAge: 600000 });
  }

  function wirePop() {
    locBtn.addEventListener('click', function () { if (pop.hidden) openPop(); else closePop(); });
    card.querySelector('.dl-zipf').addEventListener('submit', function (ev) {
      ev.preventDefault();
      var z = zipIn.value.replace(/\s+/g, '');
      if (!/^\d{5}$/.test(z)) { say('Please type a 5 digit zip code.', true); return; }
      lookupZip(z);
    });
    card.querySelector('.dl-gps').addEventListener('click', useGps);
    card.querySelector('.dl-reset').addEventListener('click', function () {
      applyLoc(defaultLoc(), false);
      say('');
      closePop();
    });
    cmpBox.addEventListener('change', function () {
      S.compare = cmpBox.checked;
      persist();
      drawHeader();
      drawAll();
    });
    backBtn.addEventListener('click', function () { S.sel = null; drawDyn(); });
    document.addEventListener('click', function (ev) {
      if (!pop.hidden && !pop.contains(ev.target) && !locBtn.contains(ev.target)) closePop();
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.key !== 'Escape') return;
      if (!pop.hidden) { closePop(); try { locBtn.focus(); } catch (e) {} return; }
      if (S.open) { closeFloat(); try { tile.focus(); } catch (e) {} }
    });
  }

  /* ---------- the pop-up: opens on rollover or tap, closes with the X ---------- */
  function place() {
    var r = tile.getBoundingClientRect(), root = document.documentElement;
    var vw = root.clientWidth, w = Math.min(760, vw - 24);
    var sx = window.pageXOffset || 0, sy = window.pageYOffset || 0;
    var left = r.right + sx - w;
    if (left < sx + 12) left = sx + 12;
    if (left > sx + vw - 12 - w) left = sx + vw - 12 - w;
    float.style.width = w + 'px';
    float.style.left = left + 'px';
    float.style.top = (r.bottom + sy + 8) + 'px';
  }
  function openFloat(pin) {
    if (tile.offsetParent === null) return;
    if (pin) S.pinned = true;
    clearTimeout(hoverT);
    if (S.open) return;
    S.open = true;
    place();
    float.classList.add('on');
    tile.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(drawAll);
    clearInterval(infoTimer);
    infoTimer = setInterval(drawInfo, 30000);
  }
  function closeFloat() {
    clearTimeout(hoverT);
    S.open = false;
    S.pinned = false;
    S.drag = false;
    clearInterval(infoTimer);
    float.classList.remove('on');
    tile.setAttribute('aria-expanded', 'false');
    tip.hidden = true;
    closePop();
  }
  function maybeClose() {
    clearTimeout(hoverT);
    if (S.pinned) return;
    hoverT = setTimeout(function () { if (!S.pinned) closeFloat(); }, 350);
  }
  function wireFloat() {
    tile.addEventListener('pointerenter', function (ev) { if (ev.pointerType !== 'touch') openFloat(false); });
    tile.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'touch') maybeClose(); });
    float.addEventListener('pointerenter', function () { clearTimeout(hoverT); });
    float.addEventListener('pointerleave', function (ev) { if (ev.pointerType !== 'touch') maybeClose(); });
    /* touching or dragging anything inside keeps it open until the X */
    float.addEventListener('pointerdown', function () { S.pinned = true; clearTimeout(hoverT); });
    float.addEventListener('focusin', function () { S.pinned = true; clearTimeout(hoverT); });
    tile.addEventListener('click', function () {
      if (S.open && S.pinned) closeFloat(); else openFloat(true);
    });
    xBtn.addEventListener('click', closeFloat);
    document.addEventListener('pointerdown', function (ev) {
      if (S.open && S.pinned && !float.contains(ev.target) && !tile.contains(ev.target)) closeFloat();
    });
    /* if the tile is hidden (the Projects board), the pop-up goes with it */
    document.addEventListener('click', function () { if (S.open && tile.offsetParent === null) closeFloat(); });
    window.addEventListener('resize', function () { if (S.open) place(); });
  }

  /* ---------- start ---------- */
  function init() {
    host = document.querySelector('.pagehead .meter') || document.getElementById('daylightmeter');
    if (!host || host.getAttribute('data-dl')) return;
    host.setAttribute('data-dl', '1');
    injectCss();
    readClock();
    S.loc = pickLoc();
    build();

    /* two layers in the chart: the static drawing and the moving blue line */
    svg.innerHTML = '<g id="dl-st"></g><g id="dl-dyn"></g>';
    S.stEl = svg.querySelector('#dl-st');
    S.dynEl = svg.querySelector('#dl-dyn');

    wireChart();
    wirePop();
    wireFloat();
    drawHeader();

    if (window.ResizeObserver) {
      var last = 0;
      new ResizeObserver(function () {
        var w = Math.floor(wrap.clientWidth);
        if (w !== last) { last = w; drawAll(); }
      }).observe(wrap);
    } else {
      window.addEventListener('resize', drawAll);
    }

    /* if the page was left open past the 2am change, pick up the new day */
    document.addEventListener('visibilitychange', function () {
      if (document.visibilityState !== 'visible') return;
      var before = S.todayIdx + '/' + S.t.y;
      readClock();
      if (before !== S.todayIdx + '/' + S.t.y) { S.sel = null; drawHeader(); drawAll(); if (S.open) place(); }
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  /* a tiny hook so a test or another page can read the numbers */
  window.PYDaylight = { dayHours: function (lat, lon, y, m, d) { return hrs(lat, decl(y, doy0(y, m, d), lon), -0.833); }, fmtLong: fmtLong, fmtShort: fmtShort, sunMs: sunMs, dayChangeSec: dayChangeSec };
})();
