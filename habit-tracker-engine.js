/* Daily Habit Tracker ENGINE v1.0 (Oct 3, 2026)
   The one place that knows about habits. Designs only draw what this hands them.

   READ-ONLY on habit data: it reads the sorted habit list and settings, and today's ticks
   (todos). The ONLY thing it writes is comments (PYHT.comments.add).
   Day: the 2am-to-2am Eastern day from py-day.js (PY.today()). No date helper here.
   Needs on the page, before this file: supabase-js, py-day.js, py-icons.js (row icons),
   habit-tracker-art.js (board art), habit-tracker-designs.js (the design registry).

   A design is a small plug-in: PYHT.register({id, name, render(state, size, PYHT) -> html string}).
   size is 'card' (cue card page) or 'phone' (one-tap iPhone view).
   v1.5 (Oct 9, 2026): E.icon(h, true) prefers a camera-free small picture (ICONS[icon_key + '_sm']) when one exists; only Train platform has one today. Used by Stack Rings and the Two-Ring Wheel inner ring. v1.4 (Oct 6, 2026): E.art(h, true) prefers the latest Stack Builder icon (worksheet_rows.icon through wsicons-v2.js). v1.3 (Oct 5, 2026): four levels. core, secondary, bonus, weekly. Bonus counts like secondary. Weekly habits are NOT in state.habits (so no design counts them in today's lights); they are in state.weekly, done if ticked any day this week (Monday to Sunday, 2am days), counts.wt and counts.wd.
   state.habits[i] = {lvl, n, ic, sec, core(1/0), st(stack index), stack, pos, done, art, color, pastel, bg, secName}. */
(function () {
  var TZ = 'America/New_York';
  var E = window.PYHT = { version: '1.4', SIZES: { card: 330, phone: 262 }, _designs: {} };
  var sb = null, userId = null, cfg = [], set = {}, ready = null;

  /* Match names between the sorted list and the daily habits: ignore emoji, case, curly quotes. */
  function norm(s) {
    return String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[^\p{L}\p{N}\s'()&,.-]/gu, '')
      .replace(/\s+/g, ' ').trim().toLowerCase();
  }
  E.norm = norm;

  E.init = function (client, uid) {
    sb = client; userId = uid || null;
    var wsLoad = new Promise(function (ok) {
      if (window.WSV2) return ok();
      var s = document.createElement('script'); s.src = 'wsicons-v2.js'; s.onload = ok; s.onerror = ok; document.head.appendChild(s);
    });
    ready = Promise.all([wsLoad,
      sb.from('habit_tracker_config').select('*').eq('enabled', true).order('stack_idx').order('stack_pos'),
      sb.from('habit_tracker_settings').select('*'),
      sb.from('worksheet_rows').select('habit,icon').not('icon', 'is', null)
    ]).then(function (r0) {
      var r = r0.slice(1);
      /* v1.4: the latest icon picks live on the worksheet rows (set in Stack Builder). Not fatal if unreadable. */
      E.wsIcons = {};
      ((r[2] && r[2].data) || []).forEach(function (w) { if (w.icon) E.wsIcons[norm(w.habit)] = w.icon; });
      if (r[0].error) throw r[0].error;
      if (r[1].error) throw r[1].error;
      var rows = r[0].data || [];
      var mine = userId ? rows.filter(function (x) { return x.user_id === userId; }) : [];
      cfg = mine.length ? mine : rows.filter(function (x) { return x.user_id == null; });
      set = {};
      (r[1].data || []).filter(function (x) { return x.user_id == null; }).forEach(function (x) { set[x.key] = x.value; });
      (r[1].data || []).filter(function (x) { return userId && x.user_id === userId; }).forEach(function (x) { set[x.key] = x.value; });
      return true;
    });
    return ready;
  };

  E.setting = function (k, d) { return k in set ? set[k] : d; };
  /* The chosen design for this user. Stored value only, no picker screen yet. */
  E.chosenDesign = function () { return E.setting('chosen_design', 'grid'); };
  E.refreshSeconds = function () { return Math.max(15, +E.setting('refresh_seconds', 60) || 60); };

  /* mode: 'live' (real ticks) | 'start' | 'mid' | 'done'  (the last three are samples, never saved) */
  E.getState = function (mode) {
    mode = mode || 'live';
    return ready.then(function () {
      var day = (window.PY && window.PY.today) ? window.PY.today() : null;
      var dow0 = day ? new Date(day + 'T12:00:00Z').getUTCDay() : 1;
      var weekStart = day ? new Date(new Date(day + 'T12:00:00Z').getTime() - ((dow0 + 6) % 7) * 86400000).toISOString().slice(0, 10) : day;
      var q = mode === 'live'
        ? sb.from('todos').select('task,done,skipped,for_date').eq('is_habit', true).gte('for_date', weekStart).lte('for_date', day)
        : Promise.resolve({ data: [] });
      return q.then(function (r) {
        if (r.error) throw r.error;
        var doneSet = {}, weekSet = {};
        (r.data || []).forEach(function (t) {
          if (t.done && !t.skipped) { var k = norm(t.task); weekSet[k] = t.for_date; if (t.for_date === day) doneSet[k] = 1; }
        });
        var mid = (set.sample_mid || []).map(norm), secs = set.sections || {};
        /* Weekday-only stacks: Train (stack 1) is hidden on Saturdays and Sundays (the 2am-to-2am day). */
        var dow = day ? new Date(day + 'T12:00:00Z').getUTCDay() : -1;
        var weekend = dow === 0 || dow === 6;
        var H = cfg.filter(function (c) { return c.level !== 'weekly' && !(weekend && c.stack_idx === 1); }).map(function (c) {
          var d;
          if (mode === 'done') d = true;
          else if (mode === 'start') d = false;
          else if (mode === 'mid') d = mid.indexOf(norm(c.habit)) >= 0;
          else d = (c.db_names || []).some(function (n) { return doneSet[norm(n)]; });
          var sc = secs[c.sec] || {};
          return {
            n: c.habit, lvl: c.level, ic: c.icon_key, sec: c.sec, core: c.level === 'core' ? 1 : 0,
            st: c.stack_idx, stack: c.stack, pos: c.stack_pos, done: d,
            art: { kind: c.art_kind, key: c.art_key, color: c.art_color, color2: c.art_color2 },
            color: sc.color, pastel: sc.pastel, bg: sc.bg, secName: sc.name
          };
        });
        var W = cfg.filter(function (c) { return c.level === 'weekly'; }).map(function (c) {
          var nm = (c.db_names && c.db_names.length ? c.db_names : [c.habit]).map(norm), d = false, on = null;
          if (mode === 'done') d = true;
          else if (mode === 'live') nm.forEach(function (k) { if (weekSet[k]) { d = true; on = weekSet[k]; } });
          var sc = secs[c.sec] || {};
          return {
            n: c.habit, lvl: 'weekly', ic: c.icon_key, sec: c.sec, core: 0, st: c.stack_idx, stack: c.stack, pos: c.stack_pos,
            done: d, doneOn: on, doneToday: mode === 'done' || (mode === 'live' && nm.some(function (k) { return doneSet[k]; })),
            art: { kind: c.art_kind, key: c.art_key, color: c.art_color, color2: c.art_color2 },
            color: sc.color, pastel: sc.pastel, bg: sc.bg, secName: sc.name
          };
        });
        return build(H, mode, day, W);
      });
    });
  };

  function build(H, mode, day, W) {
    W = W || [];
    var c = { ct: 0, cd: 0, st: 0, sd: 0 };
    H.forEach(function (h) {
      if (h.core) { c.ct++; if (h.done) c.cd++; } else { c.st++; if (h.done) c.sd++; }
    });
    function byCore(a) { return a.slice().sort(function (x, y) { return y.core - x.core; }); }
    var open = byCore(H.filter(function (h) { return !h.done; }));
    var done = byCore(H.filter(function (h) { return h.done; }));
    var names = set.stack_names || [], longs = set.stack_long_names || names;
    var stacks = names.map(function (nm, i) {
      var l = H.filter(function (h) { return h.st === i; });
      return { idx: i, name: nm, long: longs[i] || nm, habits: l, total: l.length,
        done: l.filter(function (h) { return h.done; }).length };
    }).filter(function (s) { return s.total > 0; });
    var next = null;
    open.forEach(function (h) { if (!next && h.core) next = h; });
    return {
      mode: mode, day: day, habits: H, weekly: W, counts: Object.assign(c, { wt: W.length, wd: W.filter(function (x) { return x.done; }).length }),
      total: H.length, doneCount: done.length, left: open.length,
      open: open, done: done, next: next, stacks: stacks,
      sections: set.sections || {}, loadedAt: new Date()
    };
  }

  /* Art for a habit: {type:'img', src} for board and row art; {type:'svg', svg, color, color2} for cue card art. */
  /* latest = true (Remote Lights only so far): use the newest picked icon from Stack Builder when there is one. */
  var ALIAS = { 'inspiration wall': 'sparkboard', 'the wall': 'sparkboard' };
  E.art = function (h, latest) {
    if (latest && window.WSV2 && E.wsIcons) {
      var k = E.wsIcons[norm(h.n)] || E.wsIcons[ALIAS[norm(h.n)]];
      if (k && window.WSV2[k]) return { type: 'img', src: window.WSV2[k] };
    }
    var A = window.PYHT_ART || {}, a = h.art || {};
    if (a.kind === 'card' && A.ICB && A.ICB[a.key]) return { type: 'svg', svg: A.ICB[a.key], color: a.color, color2: a.color2 };
    if (a.kind === 'board' && A.BIMG && A.BIMG[a.key]) return { type: 'img', src: A.BIMG[a.key] };
    var I = window.ICONS || {};
    return { type: 'img', src: I[a.key] || I[h.ic] || '' };
  };
  /* The simple row icon (used by the flat designs). */
  E.icon = function (h, small) { var I = window.ICONS || {}; return (small && I[h.ic + '_sm']) || I[h.ic] || ''; };

  /* Design registry: the list lives in habit-tracker-designs.js, one line per design. */
  E.register = function (d) { E._designs[d.id] = d; };
  E.registry = function () { return window.PYHT_REGISTRY || []; };
  E.loadDesigns = function () {
    return Promise.all(E.registry().filter(function (r) { return r.file; }).map(function (r) {
      return new Promise(function (ok) {
        var s = document.createElement('script');
        s.src = r.file; s.onload = ok; s.onerror = function () { r.failed = true; ok(); };
        document.head.appendChild(s);
      });
    }));
  };
  E.has = function (id) { return !!E._designs[id]; };
  E.render = function (state, id, size) {
    var d = E._designs[id];
    if (!d) return '';
    try { return d.render(state, size, E); }
    catch (e) { return '<div style="padding:12px;color:#c0453b;font:12px Arial">This design could not draw: ' + E.esc(e.message) + '</div>'; }
  };
  E.esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  };

  /* One quiet refresh on a timer. fn() should call getState and redraw. Returns a stop function. */
  E.every = function (fn) { var t = setInterval(fn, E.refreshSeconds() * 1000); return function () { clearInterval(t); }; };


  /* Tap to complete (v1.1, Oct 4, 2026). Marks a habit done or open on TODAY's row(s) in Today's Tasks, the same rows the trackers read.
     It only changes the done flag (and its time stamps). If today has no row for the habit it creates one, as Scott chose.
     It never edits minutes or counts. Sample modes (start, mid, done) are never saved. */
  E.reflect = function (state, name, done) {
    state.habits.forEach(function (h) { if (h.n === name) h.done = !!done; });
    (state.weekly || []).forEach(function (h) { if (h.n === name) { h.done = !!done; h.doneToday = !!done; h.doneOn = done ? state.day : null; } });
    var s2 = build(state.habits, state.mode, state.day, state.weekly);
    s2.loadedAt = state.loadedAt;
    return s2;
  };
  E.setDone = function (name, done) {
    return ready.then(function () {
      var c = cfg.filter(function (x) { return x.habit === name; })[0];
      if (!c) throw new Error('Habit not found: ' + name);
      var day = (window.PY && window.PY.today) ? window.PY.today() : null;
      if (!day) throw new Error('Could not work out today');
      var names = (c.db_names && c.db_names.length ? c.db_names : [c.habit]).map(norm);
      return sb.from('todos').select('id,task,done,skipped').eq('is_habit', true).eq('for_date', day).then(function (r) {
        if (r.error) throw r.error;
        var rows = (r.data || []).filter(function (t) { return names.indexOf(norm(t.task)) >= 0; });
        var now = new Date().toISOString();
        if (done) {
          var open = rows.filter(function (t) { return !t.done || t.skipped; });
          if (!rows.length) {
            var sc = (set.sections || {})[c.sec] || {};
            return sb.from('todos').insert({
              section: 'Core To-Dos', subsection: 'HABIT BANDIT', category: 'HABIT BANDIT', task: (c.db_names && c.db_names[0]) || c.habit,
              is_habit: true, for_date: day, bucket: 'today', status: 'todo', done: true, skipped: false, done_at: now, completed_at: now,
              qs_group: sc.name || null
            }).then(function (x) { if (x.error) throw x.error; return 'created'; });
          }
          if (!open.length) return 'already';
          return sb.from('todos').update({ done: true, skipped: false, done_at: now, completed_at: now })
            .in('id', open.map(function (t) { return t.id; })).then(function (x) { if (x.error) throw x.error; return 'done'; });
        }
        var ticked = rows.filter(function (t) { return t.done; });
        if (!ticked.length) return 'already';
        return sb.from('todos').update({ done: false, done_at: null })
          .in('id', ticked.map(function (t) { return t.id; })).then(function (x) { if (x.error) throw x.error; return 'undone'; });
      });
    });
  };

  /* Eastern time, zone named: "Oct 3, 2026 · 1:42pm EDT" */
  E.fmtET = function (ts) {
    var p = {};
    new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).formatToParts(new Date(ts))
      .forEach(function (x) { p[x.type] = x.value; });
    return p.month + ' ' + p.day + ', ' + p.year + ' · ' + p.hour + ':' + p.minute +
      String(p.dayPeriod || '').toLowerCase() + ' ' + p.timeZoneName;
  };
  E.fmtDay = function (ymd) {
    if (!ymd) return '';
    var m = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], p = ymd.split('-');
    return m[+p[1] - 1] + ' ' + (+p[2]) + ', ' + p[0];
  };

  /* Comments, plus tap to complete above: the only things the trackers write. */
  E.comments = {
    list: function (id) {
      return sb.from('habit_tracker_comments').select('id,design_id,body,created_at')
        .eq('design_id', id).order('created_at', { ascending: false }).then(function (r) {
          if (r.error) throw r.error; return r.data || [];
        });
    },
    all: function () {
      return sb.from('habit_tracker_comments').select('id,design_id,body,created_at')
        .order('created_at', { ascending: true }).then(function (r) {
          if (r.error) throw r.error; return r.data || [];
        });
    },
    add: function (id, body) {
      return sb.from('habit_tracker_comments').insert({ design_id: id, body: body, user_id: userId })
        .select('id,design_id,body,created_at').then(function (r) {
          if (r.error) throw r.error; return r.data && r.data[0];
        });
    }
  };
})();
