/* Photo Booth strip v1.3 — the week of morning photos, as one slim line that opens.
   v1.1: tapping an empty square no longer opens a bare file box. It opens a sheet of the
   pictures already read off the Mac's Photos app (public.recent_photos, refreshed hourly),
   newest first, with that day's shots at the top. Tap one and it is filed. The file box is
   still there as a fallback for anything older than the feed reaches.
   v1.2: ON A TOUCH DEVICE THE SHEET IS SKIPPED and the camera roll opens straight away.
   Scott's call, Sep 3 2026: the phone's own picker already shows his newest pictures, holds
   everything rather than the last six days, and is never an hour behind. The sheet is for
   the Mac, where the old button opened Finder and was no use at all.
   Self-contained on purpose: it talks to the database over plain fetch and needs NOTHING
   from the page it sits on (no window.supabase, no shared client). That is the lesson from
   needs-you.js v1.0, which worked everywhere except the one page it was built for.
   Fails silent: any error at all and the strip simply does not appear. */
(function () {
  "use strict";
  var URL_BASE = "https://arnjntspmrhigodlssbn.supabase.co";
  var KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM";
  var SERIES = ["wiwut", "bell", "platform", "street", "safari"];
  var SHORT = { wiwut: "What I woke up to", bell: "Bell", platform: "Train platform", street: "Street portrait", safari: "Local Safari" };
  var SUB = { wiwut: "WIWUT", bell: "", platform: "Mon to Fri", street: "any day", safari: "1 a work week" };
  var DOW = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  var STORE_KEY = "pb.open";
  /* Scott, Sep 3 2026: "can you window shade up street portrait and WIWUT - if i take
     those photos I'll window shade down". So these two rows are rolled away by default
     and their counts move onto the roll-away line, where he can still see them. */
  var FOLD_KEY = "pb.fold";
  var FOLDABLE = ["wiwut", "street"];

  function todayNY() {
    var p = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    return p;
  }
  function fmtDay(iso) {
    var d = new Date(iso + "T12:00:00Z");
    return d.getUTCDate();
  }
  function longDay(iso) {
    var d = new Date(iso + "T12:00:00Z");
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var w = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return w[d.getUTCDay()] + " " + m[d.getUTCMonth()] + " " + d.getUTCDate() + ", " + d.getUTCFullYear();
  }
  function publicUrl(path) {
    return URL_BASE + "/storage/v1/object/public/photobooth/" + path.split("/").map(encodeURIComponent).join("/");
  }
  function mealsUrl(path) {
    return URL_BASE + "/storage/v1/object/public/meals/" + path.split("/").map(encodeURIComponent).join("/");
  }
  /* his day runs 2am to 2am, so a picture taken at half past midnight belongs to
     the day before. Same rule as py_day() in the database, kept in step by hand. */
  function pyDayOf(iso) {
    var t = new Date(iso).getTime();
    if (isNaN(t)) return "";
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(t - 7200000));
  }
  function clockOf(iso) {
    try {
      return new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" }).format(new Date(iso)).toLowerCase().replace(/\s/g, "");
    } catch (e) { return ""; }
  }
  function shortDay(iso) {
    var d = new Date(iso + "T12:00:00Z");
    var m = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return m[d.getUTCMonth()] + " " + d.getUTCDate();
  }
  function api(path, opts) {
    opts = opts || {};
    opts.headers = Object.assign({ apikey: KEY, Authorization: "Bearer " + KEY }, opts.headers || {});
    return fetch(URL_BASE + path, opts);
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  var CSS = [
    ".pbx{background:#fff;border:1px solid #e2e6ea;border-radius:10px;overflow:hidden;margin:0 0 16px;font-family:inherit}",
    ".pbx-line{display:flex;align-items:center;gap:11px;width:100%;background:none;border:0;font:inherit;color:inherit;padding:10px 13px;cursor:pointer;text-align:left}",
    ".pbx-line:hover{background:#f5f7fa}",
    ".pbx-line:focus-visible{outline:2px solid #3f6f8f;outline-offset:-2px}",
    ".pbx-chev{width:15px;height:15px;flex:none;color:#7b8794;transition:transform .28s ease}",
    ".pbx.open .pbx-chev{transform:rotate(90deg)}",
    ".pbx-name{font-size:13px;font-weight:700;color:#1f2a44;flex:none}",
    ".pbx-today{display:flex;gap:3px;flex:none}",
    ".pbx-t{width:18px;height:18px;border-radius:3px;display:block;overflow:hidden;background:#f0f2f5}",
    ".pbx-t img{width:100%;height:100%;object-fit:cover;display:block}",
    ".pbx-t.open{border:1.5px dashed #3f6f8f;background:#eaf0f7}",
    ".pbx-t.none{border:1px dashed #c9d0d8;background:transparent}",
    ".pbx-meta{font-size:11px;color:#68737f;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".pbx-meta b{color:#1f2a44}",
    ".pbx-w7{display:flex;gap:3px;flex:none}",
    ".pbx-w7 i{width:8px;height:8px;border-radius:50%;border:1px solid #c9d0d8;display:block}",
    ".pbx-w7 i.on{background:#3f6f8f;border-color:#3f6f8f}",
    ".pbx-w7 i.now{border-color:#3f6f8f;border-width:2px}",
    ".pbx-sp{flex:1;min-width:6px}",
    ".pbx-hint{font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:#8b95a1;white-space:nowrap}",
    ".pbx-shade{max-height:0;overflow:hidden;transition:max-height .32s cubic-bezier(.4,0,.2,1)}",
    ".pbx.open .pbx-shade{max-height:900px}",
    ".pbx-in{padding:4px 13px 14px;border-top:1px solid #eef1f4}",
    ".pbx-grid{display:grid;grid-template-columns:106px repeat(7,1fr) 64px;overflow-x:auto}",
    ".pbx-s{padding:3px;display:flex;align-items:center;justify-content:center}",
    ".pbx-s.now{background:#eef3f9}",
    ".pbx-s.lab{justify-content:flex-end;padding-right:9px}",
    ".pbx-s.lab span{font-size:9.5px;letter-spacing:.04em;text-transform:uppercase;color:#68737f;text-align:right;line-height:1.25}",
    ".pbx-h{display:flex;flex-direction:column;align-items:center;padding:2px 3px 6px}",
    ".pbx-h b{font-size:9.5px;letter-spacing:.08em;color:#68737f}",
    ".pbx-h i{font-style:normal;font-size:11px;color:#1f2a44;font-variant-numeric:tabular-nums}",
    ".pbx-s.now .pbx-h b,.pbx-s.now .pbx-h i{color:#3f6f8f}",
    ".pbx-chip{font-size:10px;color:#68737f;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".pbx-chip.full{color:#2c7a58}",
    ".pbx-c{width:100%;aspect-ratio:1/1;max-width:72px;border-radius:3px;display:block;position:relative;padding:0;border:0;background:none}",
    ".pbx-c.got{box-shadow:0 0 0 1px #e2e6ea;overflow:hidden;cursor:zoom-in;background:#f0f2f5}",
    ".pbx-c.got img{width:100%;height:100%;object-fit:cover;display:block}",
    ".pbx-c.future{border:1px dashed #c9d0d8}",
    ".pbx-c.open{border:2px dashed #3f6f8f;background:#eaf0f7}",
    ".pbx-c.miss{border:1px solid #b6bfc9;cursor:pointer;background:transparent}",
    ".pbx-c.miss:before,.pbx-c.miss:after{content:'';position:absolute;left:50%;top:50%;background:#b6bfc9;border-radius:1px}",
    ".pbx-c.miss:before{width:14px;height:2px;transform:translate(-50%,-50%)}",
    ".pbx-c.miss:after{width:2px;height:14px;transform:translate(-50%,-50%)}",
    ".pbx-c.na{background:#e6eaee;border:1px solid #e6eaee}",
    ".pbx-c.na:after{content:'';position:absolute;inset:0;border-radius:2px;background:repeating-linear-gradient(135deg,transparent 0 3px,rgba(120,132,146,.42) 3px 4px)}",
    ".pbx-c.busy{opacity:.55}",
    ".pbx-grid.pbx-folded .pbx-off{display:none}",
    ".pbx-fold{display:flex;align-items:center;gap:8px;width:100%;background:none;border:0;border-top:1px dashed #e2e6ea;font:inherit;color:inherit;padding:8px 2px 2px;margin-top:4px;cursor:pointer;text-align:left}",
    ".pbx-fold:hover .pbx-flab{color:#3f6f8f}",
    ".pbx-fold:focus-visible{outline:2px solid #3f6f8f;outline-offset:2px;border-radius:4px}",
    ".pbx-fchev{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#7b8794;width:11px;flex:none;text-align:center}",
    ".pbx-flab{font-size:11.5px;color:#68737f}",
    ".pbx-fmeta{margin-left:auto;font-size:10px;color:#8b95a1;white-space:nowrap;font-variant-numeric:tabular-nums}",
    ".pbx-band{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e2e6ea;border-left:3px solid #4fa08a;border-radius:0 6px 6px 0;padding:9px 11px;margin-top:9px}",
    ".pbx-band .pbx-c{width:54px;max-width:54px;flex:none}",
    ".pbx-band .bt{flex:1;min-width:0}",
    ".pbx-band .bt b{display:block;font-size:12.5px;color:#1f2a44}",
    ".pbx-band .bt i{font-style:normal;display:block;font-size:11.5px;color:#68737f}",
    ".pbx-foot{display:flex;align-items:center;gap:10px;margin-top:10px}",
    ".pbx-foot a{font-size:11.5px;color:#3f6f8f;text-decoration:none;border-bottom:1px solid #3f6f8f}",
    ".pbx-foot span{font-size:10px;color:#9aa6b4;margin-left:auto;font-variant-numeric:tabular-nums}",
    ".pbx-lb{position:fixed;inset:0;background:rgba(16,22,29,.78);display:flex;align-items:center;justify-content:center;padding:22px;z-index:9000}",
    ".pbx-lb[hidden]{display:none}",
    ".pbx-lbc{background:#fff;border-radius:10px;max-width:520px;width:100%;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.4)}",
    ".pbx-lbc img{display:block;width:100%;background:#f0f2f5}",
    ".pbx-lbt{padding:13px 16px}",
    ".pbx-lbt b{display:block;font-size:16px;color:#1f2a44}",
    ".pbx-lbt span{font-size:11.5px;color:#68737f}",
    ".pbx-lbb{margin:0 16px 16px;padding:9px 14px;font:inherit;font-size:14px;border:1px solid #e2e6ea;background:#f5f7fa;color:#1f2a44;border-radius:6px;cursor:pointer}",
    /* the add-a-photo sheet. Its own [hidden] rule is deliberate: a display rule in a
       class beats the hidden attribute, which is how the lightbox once rendered on load. */
    ".pbx-sh{position:fixed;inset:0;background:rgba(16,22,29,.78);display:flex;align-items:flex-end;justify-content:center;z-index:9100}",
    ".pbx-sh[hidden]{display:none}",
    "@media (min-width:640px){.pbx-sh{align-items:center;padding:22px}}",
    ".pbx-shc{background:#fff;width:100%;max-width:560px;max-height:86vh;display:flex;flex-direction:column;border-radius:12px 12px 0 0;overflow:hidden;box-shadow:0 -12px 50px rgba(0,0,0,.35)}",
    "@media (min-width:640px){.pbx-shc{border-radius:12px}}",
    ".pbx-shh{padding:14px 16px 10px;border-bottom:1px solid #eef1f4}",
    ".pbx-shh b{display:block;font-size:16px;color:#1f2a44}",
    ".pbx-shh span{font-size:11.5px;color:#68737f}",
    ".pbx-shg{padding:12px 16px;overflow-y:auto;display:grid;grid-template-columns:repeat(3,1fr);gap:8px}",
    "@media (min-width:480px){.pbx-shg{grid-template-columns:repeat(4,1fr)}}",
    ".pbx-p{padding:0;border:0;background:none;cursor:pointer;text-align:center}",
    ".pbx-p img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;border-radius:6px;background:#f0f2f5;box-shadow:0 0 0 1px #e2e6ea}",
    ".pbx-p:hover img{box-shadow:0 0 0 2px #3f6f8f}",
    ".pbx-p.busy{opacity:.45}",
    ".pbx-p i{font-style:normal;display:block;font-size:10px;color:#68737f;margin-top:3px;font-variant-numeric:tabular-nums}",
    ".pbx-shn{grid-column:1/-1;font-size:12px;color:#68737f;line-height:1.5;padding:2px 0 4px}",
    ".pbx-shf{display:flex;gap:8px;padding:11px 16px 14px;border-top:1px solid #eef1f4}",
    ".pbx-shf button{flex:1;padding:10px 12px;font:inherit;font-size:13.5px;border-radius:7px;cursor:pointer;border:1px solid #e2e6ea;background:#f5f7fa;color:#1f2a44}",
    ".pbx-shf button.gh{background:#fff;color:#68737f}",
    "@media (prefers-reduced-motion:reduce){.pbx-shade,.pbx-chev{transition:none}}"
  ].join("");

  function el(html) { var t = document.createElement("div"); t.innerHTML = html; return t.firstElementChild; }

  function mount() {
    var host = document.getElementById("photobooth");
    if (!host) {
      var wrap = document.querySelector(".wrap");
      if (!wrap) return null;
      host = document.createElement("div");
      host.id = "photobooth";
      wrap.insertBefore(host, wrap.firstChild);
    }
    return host;
  }

  function build(rows) {
    var today = todayNY();
    var byS = {};
    SERIES.forEach(function (s) { byS[s] = []; });
    rows.forEach(function (r) { if (byS[r.series]) byS[r.series].push(r); });
    SERIES.forEach(function (s) { byS[s].sort(function (a, b) { return a.dow - b.dow; }); });

    var days = byS.wiwut.map(function (r) { return r.day; });
    var todayIdx = days.indexOf(today);

    function stateOf(r) {
      if (r.path) return "got";
      if (!r.expected) return "na";
      if (r.day === today) return "open";
      if (r.day < today) return "miss";
      return "future";
    }

    function cellHTML(series, r) {
      var st = stateOf(r);
      if (st === "got") {
        return '<button class="pbx-c got" data-open="' + r.path + '" data-series="' + series + '" data-day="' + r.day + '" data-place="' + (r.place || "") + '" aria-label="open photo">' +
          '<img loading="lazy" alt="" src="' + publicUrl(r.path) + '"></button>';
      }
      if (st === "miss" || st === "open") {
        /* the street portrait is opportunistic, so an empty box there is never a miss.
           It stays quiet and is still tappable. Scott's call, Sep 3, 2026. */
        var cls = (series === "street") ? "future" : st;
        return '<button class="pbx-c ' + cls + '" data-add="' + series + '" data-day="' + r.day + '" title="' +
          (series === "street" ? "tap to add a street portrait"
            : st === "open" ? "still to come today, tap to add now"
            : "missed, tap to add from your photos") + '" aria-label="add a photo"></button>';
      }
      if (st === "na") return '<span class="pbx-c na" title="not a work day"></span>';
      return '<span class="pbx-c future" title="later this week"></span>';
    }

    function chip(series) {
      var rs = byS[series], got = 0, due = 0;
      rs.forEach(function (r) {
        if (r.path) got++;
        if (r.expected && r.day <= today) due++;
      });
      if (series === "street") return { txt: got + " this wk", full: false };
      if (series === "safari") return { txt: got + " of 1", full: got >= 1 };
      return { txt: got + " of " + due, full: due > 0 && got >= due };
    }

    var folded = true;
    try { if (localStorage.getItem(FOLD_KEY) === "0") folded = false; } catch (e) { }

    var gridSeries = ["wiwut", "bell", "platform", "street"];
    var g = '<div class="pbx-grid' + (folded ? " pbx-folded" : "") + '"><div class="pbx-s lab"></div>';
    byS.wiwut.forEach(function (r, i) {
      g += '<div class="pbx-s' + (r.day === today ? " now" : "") + '"><span class="pbx-h"><b>' + DOW[i] + '</b><i>' + fmtDay(r.day) + '</i></span></div>';
    });
    g += '<div class="pbx-s"></div>';
    gridSeries.forEach(function (s) {
      /* the two he rolls away carry the marker on every cell of their row; the grid's
         own class decides whether the marker bites, so the toggle is one class flip. */
      var off = FOLDABLE.indexOf(s) >= 0 ? " pbx-off" : "";
      g += '<div class="pbx-s lab' + off + '"><span>' + SHORT[s] + (SUB[s] ? "<br>" + SUB[s] : "") + "</span></div>";
      byS[s].forEach(function (r) {
        g += '<div class="pbx-s' + (r.day === today ? " now" : "") + off + '">' + cellHTML(s, r) + "</div>";
      });
      var c = chip(s);
      g += '<div class="pbx-s' + off + '"><span class="pbx-chip' + (c.full ? " full" : "") + '">' + c.txt + "</span></div>";
    });
    g += "</div>";

    /* the roll-away line. Folded it still reports where both rows stand, so nothing
       is actually lost by hiding them. */
    var fmeta = SHORT.wiwut + " " + chip("wiwut").txt + " &middot; " + SHORT.street + " " + chip("street").txt;
    g += '<button class="pbx-fold" type="button">' +
      '<span class="pbx-fchev">' + (folded ? "+" : "&ndash;") + "</span>" +
      '<span class="pbx-flab">' + (folded ? "Show" : "Hide") + " What I woke up to and Street portrait</span>" +
      '<span class="pbx-fmeta">' + fmeta + "</span></button>";

    /* the safari band: weekly, so it never shows seven boxes */
    var saf = byS.safari.filter(function (r) { return r.path; })[0];
    var dots = "";
    byS.safari.forEach(function (r, i) { if (i < 5) dots += '<i class="' + (r.path ? "on" : "") + '"></i>'; });
    var band = '<div class="pbx-band">' +
      (saf
        ? '<button class="pbx-c got" data-open="' + saf.path + '" data-series="safari" data-day="' + saf.day + '" data-place="' + (saf.place || "") + '" aria-label="open photo"><img loading="lazy" alt="" src="' + publicUrl(saf.path) + '"></button>'
        : '<button class="pbx-c miss" data-add="safari" data-day="' + today + '" aria-label="add a photo"></button>') +
      '<span class="bt"><b>Local Safari' + (saf ? " · done " + longDay(saf.day).split(" ")[0] : " · none yet this week") + "</b>" +
      "<i>" + (saf ? (saf.place || "somewhere new") : "one work day a week, somewhere that is not a desk") + "</i></span>" +
      '<span class="pbx-w7" title="the work week">' + dots + "</span></div>";

    /* the slim line */
    var tiny = "", todayCount = 0;
    SERIES.forEach(function (s) {
      var r = byS[s][todayIdx];
      if (!r) { tiny += '<span class="pbx-t none"></span>'; return; }
      if (r.path) { todayCount++; tiny += '<span class="pbx-t"><img loading="lazy" alt="" src="' + publicUrl(r.path) + '"></span>'; }
      else if (r.expected) tiny += '<span class="pbx-t open"></span>';
      else tiny += '<span class="pbx-t none"></span>';
    });
    var weekCount = rows.filter(function (r) { return r.path; }).length;
    var w7 = "";
    byS.wiwut.forEach(function (r, i) {
      var any = SERIES.some(function (s) { return byS[s][i] && byS[s][i].path; });
      w7 += '<i class="' + (any ? "on " : "") + (r.day === today ? "now" : "") + '"></i>';
    });

    var open = false;
    try { open = localStorage.getItem(STORE_KEY) === "1"; } catch (e) { }

    var node = el(
      '<div class="pbx' + (open ? " open" : "") + '">' +
      '<button class="pbx-line" aria-expanded="' + open + '">' +
      '<svg class="pbx-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3l6 5-6 5z" fill="currentColor"/></svg>' +
      '<span class="pbx-name">Photo Booth</span>' +
      '<span class="pbx-today">' + tiny + "</span>" +
      '<span class="pbx-meta"><b>' + todayCount + "</b> today</span>" +
      '<span class="pbx-w7">' + w7 + "</span>" +
      '<span class="pbx-meta">' + weekCount + " this week</span>" +
      '<span class="pbx-sp"></span>' +
      '<span class="pbx-hint">' + (open ? "tap to close" : "tap to open") + "</span></button>" +
      '<div class="pbx-shade"><div class="pbx-in">' + g + band +
      '<div class="pbx-foot"><a href="photo-booth.html">See the whole year</a><span>Photo Booth v1.3</span></div>' +
      "</div></div></div>"
    );
    return node;
  }

  function shrink(file, cb) {
    /* the day and the series come from the file name we choose, so losing the photo's own
       header here costs nothing. The morning reader never sees a backfilled photo. */
    try {
      var img = new Image(), url = URL.createObjectURL(file);
      img.onload = function () {
        try {
          var max = 1280, w = img.width, h = img.height, s = Math.min(1, max / Math.max(w, h));
          var c = document.createElement("canvas");
          c.width = Math.round(w * s); c.height = Math.round(h * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          c.toBlob(function (b) { URL.revokeObjectURL(url); cb(b || file); }, "image/jpeg", 0.85);
        } catch (e) { URL.revokeObjectURL(url); cb(file); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); cb(file); };
      img.src = url;
    } catch (e) { cb(file); }
  }

  /* Everything already read off the Mac's Photos app. The Log Meal page shows only the
     meal_ok ones (taken from 11am, his rule); Photo Booth wants the mornings too, so it
     asks for the lot. If this cannot be read the sheet simply falls back to a file box. */
  function recentPhotos() {
    return api("/rest/v1/recent_photos?select=asset_uuid,taken_at,photo_path,lat,lng&order=taken_at.desc")
      .then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; });
  }

  /* ---- the add-a-photo sheet ------------------------------------------------------- */
  var RECENT = [];      /* what the Mac's Photos app has sent across, newest first */
  var PENDING = null;   /* which empty square is waiting to be filled */
  var SHEET = null, PICKER = null;

  function tile(p) {
    return '<button class="pbx-p" data-pick="' + p.asset_uuid + '">' +
      '<img loading="lazy" alt="" src="' + mealsUrl(p.photo_path) + '">' +
      "<i>" + shortDay(pyDayOf(p.taken_at)) + " " + clockOf(p.taken_at) + "</i></button>";
  }

  function closeSheet() { if (SHEET) SHEET.hidden = true; PENDING = null; }

  /* A finger rather than a mouse means the phone, and the phone's own picker is better
     than anything here: it holds every picture he has ever taken and it is never behind. */
  function onTouchDevice() {
    try { return !!(window.matchMedia && window.matchMedia("(pointer: coarse)").matches); }
    catch (e) { return false; }
  }

  function addPhoto(job) {
    ensureSheet();
    if (onTouchDevice()) { PENDING = job; PICKER.value = ""; PICKER.click(); return; }
    openSheet(job);
  }

  function openSheet(job) {
    ensureSheet();
    PENDING = job;
    var mine = RECENT.filter(function (p) { return pyDayOf(p.taken_at) === job.day; });
    var rest = RECENT.filter(function (p) { return pyDayOf(p.taken_at) !== job.day; });
    document.getElementById("pbx-shT").textContent = SHORT[job.series];
    document.getElementById("pbx-shS").textContent = longDay(job.day) + " · tap a picture to add it";
    var g = "";
    if (!RECENT.length) {
      g = '<p class="pbx-shn">Nothing has come across from your Photos app yet. Use Choose a file below.</p>';
    } else if (mine.length) {
      g = '<p class="pbx-shn">From your Photos app, taken ' + shortDay(job.day) + '</p>' + mine.map(tile).join("");
      if (rest.length) g += '<p class="pbx-shn">Everything else, newest first</p>' + rest.map(tile).join("");
    } else {
      g = '<p class="pbx-shn">Nothing from ' + shortDay(job.day) + ' has reached your Photos app feed yet, so here is everything it has, newest first. It refreshes every hour.</p>' + rest.map(tile).join("");
    }
    var grid = document.getElementById("pbx-shG");
    grid.innerHTML = g;
    grid.scrollTop = 0;
    SHEET.hidden = false;
  }

  function ensureSheet() {
    if (SHEET) return;
    PICKER = el('<input type="file" accept="image/*" id="pbx-file" style="position:absolute;left:-9999px">');
    document.body.appendChild(PICKER);
    SHEET = el('<div class="pbx-sh" id="pbx-sh" hidden><div class="pbx-shc">' +
      '<div class="pbx-shh"><b id="pbx-shT"></b><span id="pbx-shS"></span></div>' +
      '<div class="pbx-shg" id="pbx-shG"></div>' +
      '<div class="pbx-shf"><button id="pbx-shF">Choose a file instead</button>' +
      '<button class="gh" id="pbx-shX">Cancel</button></div></div></div>');
    document.body.appendChild(SHEET);

    SHEET.addEventListener("click", function (e) {
      if (e.target === SHEET || e.target.id === "pbx-shX") { closeSheet(); return; }
      if (e.target.id === "pbx-shF") { PICKER.value = ""; PICKER.click(); return; }
      var b = e.target.closest && e.target.closest("[data-pick]");
      if (!b || !PENDING) return;
      var id = b.getAttribute("data-pick"), p = null;
      for (var i = 0; i < RECENT.length; i++) if (RECENT[i].asset_uuid === id) p = RECENT[i];
      if (!p) return;
      var job = PENDING; PENDING = null;
      b.classList.add("busy");
      fetch(mealsUrl(p.photo_path)).then(function (r) {
        if (!r.ok) throw new Error("blob");
        return r.blob();
      }).then(function (blob) {
        return fileIt(job, blob, p, b);
      }).catch(function () { b.classList.remove("busy"); PENDING = job; });
    });

    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });

    PICKER.addEventListener("change", function () {
      if (!PENDING || !PICKER.files || !PICKER.files[0]) return;
      var job = PENDING; PENDING = null;
      if (job.btn) job.btn.classList.add("busy");
      shrink(PICKER.files[0], function (blob) { fileIt(job, blob, null, job.btn); });
    });
  }

  function fileIt(job, blob, meta, btn) {
    var path = job.series + "/" + job.day + "/" + uuid() + ".jpg";
    return api("/storage/v1/object/photobooth/" + path.split("/").map(encodeURIComponent).join("/"), {
      method: "POST",
      headers: { "Content-Type": "image/jpeg", "x-upsert": "true" },
      body: blob
    }).then(function (r) {
      if (!r.ok) throw new Error("upload");
      /* the database stamps a new row with the moment the file arrived. When the picture
         came from his Photos app we know when it was really taken, so put that back, along
         with where he was. It also lets the Photos feed drop it from the meal row. */
      if (!meta || !meta.taken_at) return null;
      return api("/rest/v1/photo_shots?path=eq." + encodeURIComponent(path), {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
        body: JSON.stringify({ shot_at: meta.taken_at, lat: meta.lat, lng: meta.lng })
      }).catch(function () { return null; });
    }).then(function () {
      closeSheet();
      start();
    }).catch(function () {
      if (btn) btn.classList.remove("busy");
      PENDING = job;
    });
  }

  function start() {
    var host = mount();
    if (!host) return;

    Promise.all([
      api("/rest/v1/rpc/photo_week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}"
      }).then(function (r) {
        if (!r.ok) throw new Error("no");
        return r.json();
      }),
      recentPhotos()
    ]).then(function (both) {
      var rows = both[0], recent = both[1] || [];
      if (!rows || !rows.length) return;

      var style = document.getElementById("pbx-css");
      if (!style) { style = document.createElement("style"); style.id = "pbx-css"; style.textContent = CSS; document.head.appendChild(style); }

      var node = build(rows);
      host.innerHTML = "";
      host.appendChild(node);

      var fold = node.querySelector(".pbx-fold");
      if (fold) fold.addEventListener("click", function () {
        var off = node.querySelector(".pbx-grid").classList.toggle("pbx-folded");
        try { localStorage.setItem(FOLD_KEY, off ? "1" : "0"); } catch (e) { }
        fold.querySelector(".pbx-fchev").innerHTML = off ? "+" : "&ndash;";
        fold.querySelector(".pbx-flab").textContent = (off ? "Show" : "Hide") + " What I woke up to and Street portrait";
      });

      var line = node.querySelector(".pbx-line");
      line.addEventListener("click", function () {
        var open = node.classList.toggle("open");
        line.setAttribute("aria-expanded", open ? "true" : "false");
        node.querySelector(".pbx-hint").textContent = open ? "tap to close" : "tap to open";
        try { localStorage.setItem(STORE_KEY, open ? "1" : "0"); } catch (e) { }
      });

      var lb = document.getElementById("pbx-lb");
      if (!lb) {
        lb = el('<div class="pbx-lb" id="pbx-lb" hidden><div class="pbx-lbc"><img alt="" id="pbx-lbi"><div class="pbx-lbt"><b id="pbx-lbb"></b><span id="pbx-lbs"></span></div><button class="pbx-lbb" id="pbx-lbx">Close</button></div></div>');
        document.body.appendChild(lb);
        lb.addEventListener("click", function (e) { if (e.target === lb || e.target.id === "pbx-lbx") lb.hidden = true; });
        document.addEventListener("keydown", function (e) { if (e.key === "Escape") lb.hidden = true; });
      }

      RECENT = recent;
      ensureSheet();

      node.addEventListener("click", function (e) {
        var o = e.target.closest("[data-open]");
        if (o) {
          document.getElementById("pbx-lbi").src = publicUrl(o.getAttribute("data-open"));
          document.getElementById("pbx-lbb").textContent = SHORT[o.getAttribute("data-series")];
          document.getElementById("pbx-lbs").textContent =
            longDay(o.getAttribute("data-day")) + (o.getAttribute("data-place") ? " · " + o.getAttribute("data-place") : "");
          lb.hidden = false;
          return;
        }
        var a = e.target.closest("[data-add]");
        if (a) addPhoto({ series: a.getAttribute("data-add"), day: a.getAttribute("data-day"), btn: a });
      });
    }).catch(function () { /* silent by design */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
