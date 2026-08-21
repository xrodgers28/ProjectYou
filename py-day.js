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
  PY.today = function () { return day(); };
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
