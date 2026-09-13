/* backfill.js — the ONE place a past-day tick reaches history.
   Loaded by habit-modules.html and by every deck-backed cue card page
   (open-mode, environmental, recreational, social-fitness, takeaways,
   bucket-list). Built Sep 13 2026 for the Cue Cards "step back a day" nav.

   RULE THIS FILE EXISTS TO PROTECT: today's live `todos` row is the single
   source the 4am reset job and every "today" page read. A past day must
   NEVER touch it. So this writes straight into qs_log, mirroring exactly
   what the habit_to_qs_log() Postgres trigger already does for a live tick
   (same columns, same on-conflict key), which is what lets the streak, the
   Time Bandit Wheel and the weekly review pick a backfilled day up with no
   extra plumbing on their end. See [[projectyou-worksheets]] in memory for
   why `todos` can't hold history: one row per habit, wiped every night. */
window.PYBackfill = (function () {
  "use strict";

  function today() {
    if (window.PY && typeof window.PY.today === "function") {
      try { return window.PY.today(); } catch (e) {}
    }
    var n = new Date(), e = new Date(n.toLocaleString("en-US", { timeZone: "America/New_York" }));
    if (e.getHours() < 2) e.setDate(e.getDate() - 1);
    return e.getFullYear() + "-" + String(e.getMonth() + 1).padStart(2, "0") + "-" + String(e.getDate()).padStart(2, "0");
  }

  /* walk a YYYY-MM-DD string by N days without tripping on daylight saving */
  function shiftDate(dateStr, days) {
    var p = dateStr.split("-").map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2], 12, 0, 0));
    d.setUTCDate(d.getUTCDate() + days);
    return d.getUTCFullYear() + "-" + String(d.getUTCMonth() + 1).padStart(2, "0") + "-" + String(d.getUTCDate()).padStart(2, "0");
  }

  /* the arrows' range: today back 13 days, 14 days total (Scott's call, Sep 13 2026) */
  var WINDOW_DAYS = 14;
  function minDate() { return shiftDate(today(), -(WINDOW_DAYS - 1)); }
  function inWindow(dateStr) {
    return typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) &&
      dateStr >= minDate() && dateStr <= today();
  }

  /* read a ?backfill=YYYY-MM-DD param, but only if it's inside the allowed window */
  function paramDate() {
    try {
      var q = new URLSearchParams(location.search).get("backfill");
      return inWindow(q) ? q : null;
    } catch (e) { return null; }
  }

  /* File a past-day tick straight into qs_log, same shape habit_to_qs_log()
     writes for a live one, so nothing downstream can tell the difference. */
  function log(sb, opts) {
    var row = {
      date: opts.date,
      group: opts.group || "Not sure yet",
      tracker: opts.tracker,
      value: opts.value != null ? opts.value : 1,
      unit: opts.unit || "done",
      minutes: opts.minutes != null ? opts.minutes : null,
      minutes_estimated: opts.estimated !== false,
      status: "done",
      source: "habit-bandit",
      logged_at: new Date().toISOString(),
      note: "Backfilled via Cue Cards date nav on " + today()
    };
    return sb.from("qs_log").upsert([row], { onConflict: "date,tracker,source" });
  }

  function unlog(sb, tracker, dateStr) {
    return sb.from("qs_log").delete().eq("date", dateStr).eq("tracker", tracker).eq("source", "habit-bandit");
  }

  /* which of `trackers` already have a habit-bandit qs_log row on dateStr */
  async function loggedSet(sb, trackers, dateStr) {
    var r = await sb.from("qs_log").select("tracker").eq("date", dateStr).eq("source", "habit-bandit").in("tracker", trackers);
    var set = {};
    (r.data || []).forEach(function (x) { set[x.tracker] = true; });
    return set;
  }

  /* small fixed banner every backfill-aware page shows when a ?backfill= date
     is active, so a tap on that page can never be mistaken for today's. */
  function showBanner(dateStr, backHref) {
    if (document.getElementById("bf-banner")) return;
    var d = new Date(dateStr + "T12:00:00");
    var nice = d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", year: "numeric" });
    var div = document.createElement("div");
    div.id = "bf-banner";
    div.setAttribute("style",
      "position:sticky;top:0;z-index:99;background:#b8962f;color:#fff;" +
      "font-family:Arial,Helvetica,sans-serif;font-size:13px;font-weight:800;" +
      "text-align:center;padding:9px 14px;box-shadow:0 2px 8px rgba(0,0,0,.12)");
    div.innerHTML = "Logging for " + nice + " — not today" +
      (backHref ? '&nbsp;&nbsp;<a href="' + backHref + '" style="color:#fff;text-decoration:underline">Back to the board</a>' : "");
    document.body.insertBefore(div, document.body.firstChild);
  }

  return {
    today: today, shiftDate: shiftDate, minDate: minDate, inWindow: inWindow,
    paramDate: paramDate, log: log, unlog: unlog, loggedSet: loggedSet, showBanner: showBanner
  };
})();
