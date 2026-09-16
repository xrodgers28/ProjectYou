/* THE ONE DEFINITION OF A DAY, browser side.  ProjectYOU, Aug 20 2026.

   Scott's rule: a day runs 2am Eastern to 2am Eastern, NOT midnight to
   midnight, because he often works past midnight and that work belongs to the
   day he started. Anything before 2am still counts as the previous day.

   NOTHING ELSE MAY REIMPLEMENT THIS. Every page calls PY.today() / PY.day().
   Writing a fresh etToday / todayKey / localDate helper on a page is the bug,
   even when the arithmetic happens to be right, because the moment there are
   two definitions they drift and the drift is invisible for days.

   The SQL twin is public.py_today() / public.py_day(ts). Keep them in step.
   Background: project memory day-boundary-rule.md.

   Load this in the HEAD, before the page's own script. */
(function () {
  var TZ = 'America/New_York';
  var BOUNDARY_HOUR = 2;

  function etYMD(d) {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit'
    }).format(d || new Date());
  }

  /* hourCycle h23 on purpose: hour12:false under en-US returns 24 at midnight
     in several engines, which silently defeats a "before Nam" comparison. */
  function etHour(d) {
    var h = +new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, hour: '2-digit', hourCycle: 'h23'
    }).format(d || new Date());
    return h === 24 ? 0 : h;
  }

  function shiftBack(ymd) {
    var p = ymd.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12, 0, 0));
    d.setUTCDate(d.getUTCDate() - 1);
    return d.toLocaleDateString('en-CA', { timeZone: 'UTC' });
  }

  function day(when) {
    var d = when ? new Date(when) : new Date();
    var ymd = etYMD(d);
    return etHour(d) < BOUNDARY_HOUR ? shiftBack(ymd) : ymd;
  }

  var PY = window.PY || (window.PY = {});
  PY.TZ = TZ;
  PY.BOUNDARY_HOUR = BOUNDARY_HOUR;
  PY.day = day;
  /* VIEW DAY (Sep 16 2026). Scott steps back to a past day on the Cue Cards
     board and every card must open on THAT day. The board adds ?day=YYYY-MM-DD
     to each card link. Here PY.today() then answers that day, so every page
     that already asks PY.today() follows it with no change of its own.
     PY.realToday() is always the real day.
     - never on the board itself (it keeps its own date nav)
     - only a past day counts; today or a future day is ignored
     - The Wall and The Feed show a live outside feed, so they stay on today
       and say so in the strip
     - the board remembers the day for one hour (sessionStorage py_view_day) */
  var PAGE = (location.pathname.split('/').pop() || '').toLowerCase();
  var BOARD = 'habit-modules.html';
  var LIVE_FEED = { 'wall.html': 1, 'feed.html': 1 };
  var VIEW = null;
  try {
    var q = new URLSearchParams(location.search).get('day');
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q) && q < day() && PAGE !== BOARD) VIEW = q;
  } catch (e) {}
  PY.realToday = function () { return day(); };
  PY.viewDay = function () { return VIEW; };
  PY.today = function () { return (VIEW && !LIVE_FEED[PAGE]) ? VIEW : day(); };
  if (VIEW) {
    try { sessionStorage.setItem('py_view_day', JSON.stringify({ d: VIEW, t: Date.now() })); } catch (e) {}
    var showStrip = function () {
      if (document.getElementById('py-view-strip') || !document.body) return;
      var p = VIEW.split('-').map(Number);
      var label = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12)).toLocaleDateString('en-US',
        { timeZone: 'UTC', weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      var s = document.createElement('div');
      s.id = 'py-view-strip';
      s.setAttribute('role', 'status');
      s.style.cssText = 'position:sticky;top:0;z-index:9999;background:#b8962f;color:#1a1408;' +
        'font:600 14px/1.35 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;' +
        'padding:9px 16px;text-align:center';
      var msg = LIVE_FEED[PAGE]
        ? 'Looking back: ' + label + '. This card is a live feed, so it shows today’s.'
        : 'Looking back: ' + label + '. Anything you save counts for that day.';
      var a = document.createElement('a');
      a.textContent = 'Back to today';
      a.href = location.pathname + location.hash;
      a.style.cssText = 'color:#1a1408;text-decoration:underline;margin-left:10px;white-space:nowrap';
      a.onclick = function () { try { sessionStorage.removeItem('py_view_day'); } catch (e) {} };
      s.appendChild(document.createTextNode(msg));
      s.appendChild(a);
      document.body.insertBefore(s, document.body.firstChild);
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showStrip);
    else showStrip();
  }
  PY.etHour = etHour;
  PY.etYMD = etYMD;

  /* "Need more content", the standing notice when a cue card runs dry.
     Scott, Aug 20 2026: any cue card that runs out of content says so, in dark
     red, rather than showing a cheerful empty state that reads like success. */
  PY.NEED_MORE = 'Need more content';
  PY.needMore = function (extra) {
    return '<div class="py-need-more">' + PY.NEED_MORE +
      (extra ? '<span class="py-need-more-why">' + extra + '</span>' : '') + '</div>';
  };

  try {
    if (!document.getElementById('py-need-more-css')) {
      var s = document.createElement('style');
      s.id = 'py-need-more-css';
      s.textContent =
        '.py-need-more{color:#8B0000;font-weight:800;font-size:15px;letter-spacing:.01em;' +
        'margin:16px auto 2px;text-align:center;display:flex;flex-direction:column;gap:4px;align-items:center}' +
        '.py-need-more-why{color:#8B0000;opacity:.72;font-weight:600;font-size:12.5px;letter-spacing:0}';
      (document.head || document.documentElement).appendChild(s);
    }
  } catch (e) {}
})();
