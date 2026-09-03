/* Photo Booth strip v1.0 — the week of morning photos, as one slim line that opens.
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

    var gridSeries = ["wiwut", "bell", "platform", "street"];
    var g = '<div class="pbx-grid"><div class="pbx-s lab"></div>';
    byS.wiwut.forEach(function (r, i) {
      g += '<div class="pbx-s' + (r.day === today ? " now" : "") + '"><span class="pbx-h"><b>' + DOW[i] + '</b><i>' + fmtDay(r.day) + '</i></span></div>';
    });
    g += '<div class="pbx-s"></div>';
    gridSeries.forEach(function (s) {
      g += '<div class="pbx-s lab"><span>' + SHORT[s] + (SUB[s] ? "<br>" + SUB[s] : "") + "</span></div>";
      byS[s].forEach(function (r) {
        g += '<div class="pbx-s' + (r.day === today ? " now" : "") + '">' + cellHTML(s, r) + "</div>";
      });
      var c = chip(s);
      g += '<div class="pbx-s"><span class="pbx-chip' + (c.full ? " full" : "") + '">' + c.txt + "</span></div>";
    });
    g += "</div>";

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
      '<div class="pbx-foot"><a href="photo-booth.html">See the whole year</a><span>Photo Booth v1.0</span></div>' +
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

  function start() {
    var host = mount();
    if (!host) return;

    api("/rest/v1/rpc/photo_week", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    }).then(function (r) {
      if (!r.ok) throw new Error("no");
      return r.json();
    }).then(function (rows) {
      if (!rows || !rows.length) return;

      var style = document.getElementById("pbx-css");
      if (!style) { style = document.createElement("style"); style.id = "pbx-css"; style.textContent = CSS; document.head.appendChild(style); }

      var node = build(rows);
      host.innerHTML = "";
      host.appendChild(node);

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

      var picker = el('<input type="file" accept="image/*" style="position:absolute;left:-9999px">');
      document.body.appendChild(picker);
      var pending = null;

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
        if (a) { pending = { series: a.getAttribute("data-add"), day: a.getAttribute("data-day"), btn: a }; picker.value = ""; picker.click(); }
      });

      picker.addEventListener("change", function () {
        if (!pending || !picker.files || !picker.files[0]) return;
        var job = pending; pending = null;
        job.btn.classList.add("busy");
        shrink(picker.files[0], function (blob) {
          var path = job.series + "/" + job.day + "/" + uuid() + ".jpg";
          api("/storage/v1/object/photobooth/" + path.split("/").map(encodeURIComponent).join("/"), {
            method: "POST",
            headers: { "Content-Type": "image/jpeg", "x-upsert": "true" },
            body: blob
          }).then(function (r) {
            if (r.ok) start(); else job.btn.classList.remove("busy");
          }).catch(function () { job.btn.classList.remove("busy"); });
        });
      });
    }).catch(function () { /* silent by design */ });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
