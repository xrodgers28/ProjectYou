/* TIME BANDIT METERS v1.0 (Oct 10, 2026)
   ---------------------------------------------------------------------------
   The four stacking meters that sit on the left of the Daily Habits page.
   Each one answers the same question a different way: how much of today's
   habit time have I actually banked.

   ONE DEFINITION OF A SEGMENT, AND IT LIVES HERE.
   The number above every meter is the same number that sits in the middle of
   the Time Bandit Wheel: segments used out of segments the habits add up to.
   The rules are copied from the wheel exactly and written down once, in
   SEG below, so a meter can never quietly disagree with the wheel.

   KNOWN GAP, SAY IT OUT LOUD: the wheel still carries its own copy of these
   rules inside time-bandit-wheel-v2.html. Until that page is pointed at this
   file there are two copies of one definition, which is the thing we try never
   to have. Next job.

   What counts toward the bar (all four must be true):
     - the row is a habit, still live, and its cadence is Daily
     - it is not Walk or Ride (exercise is not habit time, Sep 29 2026)
     - its "counts toward my habit time" switch is not off
     - it is not on the hidden list the wheel keeps
   A row with no minutes typed in is worth 10 minutes, one segment, which is
   what the wheel assumes. A row set to EXACTLY 0 is respected as zero, because
   "Lights out by 11pm" and "Water" are yes/no habits that cost no time and
   must not quietly add ten minutes each to the bar they are measured against.

   Motion follows the Motion Style Guide v1.0 as Scott's brief instructed:
   Tap 120, Lift 160, Reveal 220, Settle 400. Overshoot is reward only, and the
   only overshoot here is the day finishing.
   --------------------------------------------------------------------------- */
(function () {
  'use strict';

  var TBM = window.TBM = { version: '1.0' };

  /* ---------- the one definition ---------- */
  var SEG = TBM.SEG = {
    unit: 10,
    exercise: ['walk', 'ride'],
    hidden: ['photo booth', 'coffee', 'vices', 'human moment',
             'send a birthday message as they come up',
             'share a brief human moment while i am out'],
    plain: function (s) { return String(s == null ? '' : s).replace(/[^\x20-\x7EÀ-ɏ]/g, '').trim().toLowerCase(); },
    /* does this daily_template row set the bar? */
    counts: function (r) {
      if (!r || r.is_habit !== true) return false;
      if (r.live === false) return false;
      var cad = String(r.cadence == null ? 'daily' : r.cadence).trim().toLowerCase();
      if (cad && cad !== 'daily') return false;
      var k = SEG.plain(r.task), tr = SEG.plain(r.tracker);
      if (SEG.exercise.indexOf(k) >= 0) return false;
      if (SEG.hidden.indexOf(k) >= 0) return false;
      if (tr && SEG.hidden.indexOf(tr) >= 0) return false;
      if (r.count_time === false) return false;
      return true;
    },
    minutes: function (r) { return r.est_minutes == null ? 10 : (+r.est_minutes || 0); },
    segments: function (mins) { return Math.round(mins / SEG.unit); }
  };

  /* ---------- Clarity Compass colours ---------- */
  var SEC = {
    'Physical Health':      { c: '#c05f7a', k: 'PHYS' },
    'Environmental Health': { c: '#4fa08a', k: 'ENVR' },
    'Social Well-Being':    { c: '#5b8fce', k: 'SOCL' },
    'Recreational Health':  { c: '#e0975a', k: 'RECR' },
    'Sense of Purpose':     { c: '#cf9088', k: 'PURP' },
    'Mental Fitness':       { c: '#c6a63f', k: 'MENT' },
    'Emotional Health':     { c: '#7d81c2', k: 'EMOT' }
  };
  var ORDER = ['Physical Health', 'Mental Fitness', 'Emotional Health', 'Social Well-Being',
               'Sense of Purpose', 'Environmental Health', 'Recreational Health'];
  function colOf(s) { return (SEC[s] || {}).c || '#9aa3b0'; }
  function keyOf(s) { return (SEC[s] || {}).k || '----'; }

  var SLIVER = 0.34, BONUS = 0.08, GAP = 3;

  /* A habit becomes one or more marks: a full brick per whole ten minutes,
     then a sliver for the remainder, and a sliver on its own for a habit that
     costs no time at all so that nothing ever disappears from the picture. */
  function marksOf(r) {
    var m = SEG.minutes(r), out = [], f = Math.floor(m / SEG.unit), i;
    for (i = 0; i < f; i++) out.push({ full: true, mins: SEG.unit });
    if (m % SEG.unit > 0 || f === 0) out.push({ full: false, mins: m % SEG.unit });
    return out;
  }
  function unitsOf(list) {
    return list.reduce(function (a, m) { return a + (m.full ? 1 : SLIVER); }, 0);
  }

  /* ---------- styles ---------- */
  var CSS = [
    '.tbm{--tap:120ms;--lift:160ms;--reveal:220ms;--settle:400ms;',
    '  --standard:cubic-bezier(.2,.7,.3,1);--enter:cubic-bezier(.16,.84,.3,1);',
    '  --settlec:cubic-bezier(.33,.9,.42,1);--overshoot:cubic-bezier(.32,1.14,.5,1);',
    '  background:#fff;border:1px solid #e3e7ee;border-radius:16px;padding:14px 14px 16px;',
    '  box-shadow:0 8px 22px rgba(31,42,68,.06)}',
    '.tbm h2{font-size:14px;font-weight:800;color:#1f2a44;margin:0 0 2px;letter-spacing:-.01em}',
    '.tbm .tbmsub{font-size:11.5px;color:#5b6472;line-height:1.45;margin:0 0 12px}',
    '.tbm .tbmgrid{display:grid;grid-template-columns:1fr 1fr;gap:12px}',
    '.tbm .met{background:#fbfcfd;border:1px solid #edf0f5;border-radius:12px;padding:10px 8px 9px;',
    '  display:flex;flex-direction:column;align-items:center}',
    '.tbm .big{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:25px;font-weight:800;',
    '  color:#1e8e5a;line-height:1;letter-spacing:-.02em;font-variant-numeric:tabular-nums}',
    '.tbm .big .of{font-size:15px;color:#8a8f99;font-weight:700}',
    '.tbm .biglab{font-size:9px;letter-spacing:.09em;text-transform:uppercase;color:#8a8f99;',
    '  font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;margin:1px 0 9px}',
    '.tbm .mname{font-size:10px;letter-spacing:.05em;text-transform:uppercase;color:#5b6472;',
    '  font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;margin-top:9px;text-align:center;line-height:1.3}',
    '.tbm .mwrap{position:relative}',
    /* pile */
    '.tbm .pile{background:#eef2f8;border:1px solid #e3e7ee;border-radius:9px;display:flex;',
    '  flex-direction:column-reverse;padding:6px;gap:3px;overflow:hidden;position:relative}',
    '.tbm .band{height:0;border-radius:4px;opacity:0;flex:none;',
    '  transition:height var(--settle) var(--settlec),opacity var(--reveal) var(--enter)}',
    '.tbm .goal{position:absolute;left:-3px;right:-3px;height:0;border-top:1.5px dashed #1e8e5a;z-index:3;pointer-events:none}',
    '.tbm .goal.hit{border-top-style:solid}',
    /* stacks */
    '.tbm .stacks{display:flex;gap:4px;align-items:flex-end;background:#eef2f8;border:1px solid #e3e7ee;',
    '  border-radius:9px;padding:6px 5px}',
    '.tbm .scol{display:flex;flex-direction:column;align-items:center;gap:3px}',
    '.tbm .stube{width:16px;background:#fff;border:1px solid #e3e7ee;border-radius:5px;display:flex;',
    '  flex-direction:column-reverse;padding:2px;gap:2px;overflow:hidden;position:relative}',
    '.tbm .skey{font-family:"IBM Plex Mono",ui-monospace,Menlo,monospace;font-size:7px;color:#8a8f99;letter-spacing:.02em}',
    '.tbm .scol.full .skey{color:#1e8e5a;font-weight:700}',
    /* thermo */
    '.tbm .thermo{width:26px;background:#eef2f8;border:1px solid #e3e7ee;border-radius:13px;display:flex;',
    '  flex-direction:column-reverse;padding:3px;gap:2px;overflow:hidden;position:relative}',
    /* caption */
    '.tbm .cap{text-align:center;font-size:11px;font-weight:800;color:#1e8e5a;margin-top:8px;min-height:15px;',
    '  opacity:0;transform:translateY(5px);',
    '  transition:opacity var(--settle) var(--overshoot),transform var(--settle) var(--overshoot)}',
    '.tbm .cap.on{opacity:1;transform:none}',
    '.tbm .foot{font-size:10.5px;color:#8a8f99;line-height:1.5;margin-top:11px;padding-top:9px;border-top:1px solid #edf0f5}',
    '.tbm .foot b{color:#5b6472}',
    '@media (prefers-reduced-motion:reduce){.tbm *{transition:none !important}}'
  ].join('');

  function style() {
    if (document.getElementById('tbm-css')) return;
    var s = document.createElement('style'); s.id = 'tbm-css'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* ---------- drawing helpers ---------- */
  function band(mark, color, h, label) {
    var b = document.createElement('i');
    b.className = 'band';
    b.style.background = color;
    b.title = label;
    b.dataset.h = h;
    return { el: b, h: h };
  }
  function grow(b) {
    void b.el.offsetWidth;
    b.el.style.height = b.h + 'px';
    b.el.style.opacity = '1';
  }

  /* ---------- the four meters ---------- */
  /* A: one column, brick height set by minutes, section colours, in list order */
  function drawColumn(host, data, equal) {
    var H = 212, inner = H - 14;
    var all = [], doneMarks = [];
    data.rows.forEach(function (r) {
      var ms = equal ? [{ full: true, mins: SEG.minutes(r) }] : marksOf(r);
      ms.forEach(function (m) {
        var rec = { m: m, r: r };
        all.push(rec);
        if (data.done[r.id]) doneMarks.push(rec);
      });
    });
    var units = equal ? all.length : unitsOf(all.map(function (x) { return x.m; }));
    var capUnits = units * (1 + BONUS);
    var capMarks = Math.ceil(all.length * (1 + BONUS));
    var per = (inner - capMarks * GAP) / capUnits;
    var hOf = function (m) { return equal ? per : (m.full ? per : Math.max(3, per * SLIVER)); };

    var wrap = document.createElement('div'); wrap.className = 'mwrap';
    var pile = document.createElement('div'); pile.className = 'pile';
    pile.style.width = '100%'; pile.style.height = H + 'px';
    wrap.appendChild(pile);

    /* the daily goal line: where the stack reaches when everything is done */
    var goalH = all.reduce(function (a, x) { return a + hOf(x.m) + GAP; }, 0);
    var g = document.createElement('div'); g.className = 'goal';
    g.style.bottom = (6 + goalH) + 'px';
    pile.appendChild(g);

    var bs = [];
    doneMarks.forEach(function (x) {
      var b = band(x.m, colOf(x.r.section), hOf(x.m),
        x.r.task + (equal ? '' : ' · ' + (x.m.full ? '10 min' : (x.m.mins || 0) + ' min')));
      pile.appendChild(b.el); bs.push(b);
    });
    bs.forEach(function (b, i) { setTimeout(function () { grow(b); }, i * 45); });
    if (doneMarks.length >= all.length && all.length) g.classList.add('hit');
    host.appendChild(wrap);
    return { done: doneMarks.length, total: all.length };
  }

  /* B: one tube per compass section that has a daily habit, each with its own goal line.
     EVERY TUBE IS DRAWN TO THE SAME SCALE. The first version sized each tube to its own
     section total, which made WIWUT, a one minute habit and the whole of Environmental
     Health, draw a full tube taller than Physical Health with three habits done. A brick
     has to mean the same amount of time in every tube or the row of tubes lies. So the
     scale is shared, and it is each section's GOAL LINE that sits low or high depending
     on how much that part of life actually asks of you today. */
  function drawStacks(host, data) {
    var H = 212;
    var live = ORDER.filter(function (s) {
      return data.rows.some(function (r) { return r.section === s; });
    });
    var tubeH = H - 14;
    var biggest = 0, mostMarks = 0;
    live.forEach(function (s) {
      var ms = [];
      data.rows.filter(function (r) { return r.section === s; })
        .forEach(function (r) { marksOf(r).forEach(function (m) { ms.push(m); }); });
      biggest = Math.max(biggest, unitsOf(ms));
      mostMarks = Math.max(mostMarks, ms.length);
    });
    var perShared = (tubeH - Math.ceil(mostMarks * (1 + BONUS)) * 2) / (biggest * (1 + BONUS));

    var box = document.createElement('div'); box.className = 'stacks';
    live.forEach(function (s) {
      var rs = data.rows.filter(function (r) { return r.section === s; });
      var all = [], doneM = [];
      rs.forEach(function (r) {
        marksOf(r).forEach(function (m) {
          all.push({ m: m, r: r }); if (data.done[r.id]) doneM.push({ m: m, r: r });
        });
      });
      var per = perShared;
      var hOf = function (m) { return m.full ? per : Math.max(2, per * SLIVER); };

      var col = document.createElement('div'); col.className = 'scol';
      var tube = document.createElement('div'); tube.className = 'stube';
      tube.style.height = tubeH + 'px';

      /* THE DAILY GOAL LINE Scott asked for: this section's full day. */
      var goalH = all.reduce(function (a, x) { return a + hOf(x.m) + 2; }, 0);
      var g = document.createElement('div'); g.className = 'goal';
      g.style.left = '-2px'; g.style.right = '-2px';
      g.style.bottom = (3 + goalH) + 'px';
      tube.appendChild(g);

      var bs = [];
      doneM.forEach(function (x) {
        var b = band(x.m, colOf(s), hOf(x.m), x.r.task);
        tube.appendChild(b.el); bs.push(b);
      });
      bs.forEach(function (b, i) { setTimeout(function () { grow(b); }, i * 45); });
      if (doneM.length >= all.length && all.length) { g.classList.add('hit'); col.classList.add('full'); }

      var key = document.createElement('div'); key.className = 'skey'; key.textContent = keyOf(s);
      col.appendChild(tube); col.appendChild(key);
      col.title = s + ': ' + doneM.length + ' of ' + all.length + ' marks';
      box.appendChild(col);
    });
    host.appendChild(box);
  }

  /* C: the slim tube with the goal line across it */
  function drawThermo(host, data) {
    var H = 212, inner = H - 8;
    var all = [], doneM = [];
    data.rows.forEach(function (r) {
      marksOf(r).forEach(function (m) {
        all.push({ m: m, r: r }); if (data.done[r.id]) doneM.push({ m: m, r: r });
      });
    });
    var units = unitsOf(all.map(function (x) { return x.m; }));
    var capUnits = units * (1 + BONUS), capMarks = Math.ceil(all.length * (1 + BONUS));
    var per = (inner - capMarks * 2) / capUnits;
    var hOf = function (m) { return m.full ? per : Math.max(2, per * SLIVER); };
    var wrap = document.createElement('div'); wrap.className = 'mwrap';
    var t = document.createElement('div'); t.className = 'thermo'; t.style.height = H + 'px';
    var goalH = all.reduce(function (a, x) { return a + hOf(x.m) + 2; }, 0);
    var g = document.createElement('div'); g.className = 'goal'; g.style.bottom = (3 + goalH) + 'px';
    t.appendChild(g);
    var bs = [];
    doneM.forEach(function (x) {
      var b = band(x.m, colOf(x.r.section), hOf(x.m), x.r.task);
      t.appendChild(b.el); bs.push(b);
    });
    bs.forEach(function (b, i) { setTimeout(function () { grow(b); }, i * 45); });
    if (doneM.length >= all.length && all.length) g.classList.add('hit');
    wrap.appendChild(t); host.appendChild(wrap);
  }

  var METERS = [
    { id: 'column', name: 'Brick<br>Column',   draw: function (h, d) { drawColumn(h, d, false); } },
    { id: 'equal',  name: 'Equal<br>Bricks',   draw: function (h, d) { drawColumn(h, d, true); } },
    { id: 'stacks', name: 'Thin<br>Stacks',    draw: drawStacks },
    { id: 'thermo', name: 'Thermo&shy;meter',  draw: drawThermo }
  ];

  /* ---------- mount ---------- */
  /* rows: the daily_template rows the page already holds. sb: the page's client. */
  TBM.mount = function (opts) {
    style();
    TBM._el = opts.el; TBM._sb = opts.sb;
    return TBM.refresh(opts.rows);
  };

  TBM.refresh = function (rows) {
    var el = TBM._el, sb = TBM._sb;
    if (!el) return Promise.resolve();
    var day = (window.PY && window.PY.today) ? window.PY.today() : null;
    var counting = (rows || []).filter(SEG.counts);
    return sb.from('todos').select('task,done,skipped')
      .eq('is_habit', true).eq('for_date', day)
      .then(function (r) {
        var tick = {};
        (r.data || []).forEach(function (t) {
          if (t.done && !t.skipped) tick[SEG.plain(t.task)] = 1;
        });
        var done = {};
        counting.forEach(function (row) {
          if (tick[SEG.plain(row.task)]) done[row.id] = 1;
        });
        paint(el, { rows: counting, done: done, day: day });
      }, function () { paint(el, { rows: counting, done: {}, day: day, err: true }); });
  };

  function paint(el, data) {
    var minsTotal = data.rows.reduce(function (a, r) { return a + SEG.minutes(r); }, 0);
    var minsUsed = data.rows.reduce(function (a, r) { return a + (data.done[r.id] ? SEG.minutes(r) : 0); }, 0);
    var segTotal = SEG.segments(minsTotal), segUsed = SEG.segments(minsUsed);
    var habitsDone = data.rows.filter(function (r) { return data.done[r.id]; }).length;

    el.className = 'tbm';
    el.innerHTML =
      '<h2>Time Bandit Meters</h2>' +
      '<p class="tbmsub">Every brick is one ten minute block of habit time banked today. ' +
      'The number is the same one in the middle of the Time Bandit Wheel. ' +
      'The dashed line is the day\'s goal.</p>' +
      '<div class="tbmgrid" id="tbmgrid"></div>' +
      '<div class="cap" id="tbmcap">Day complete</div>' +
      '<div class="foot"><b>' + habitsDone + ' of ' + data.rows.length + '</b> habits ticked &middot; ' +
      '<b>' + minsUsed + ' of ' + minsTotal + ' min</b>' +
      (data.err ? ' &middot; could not read today\'s ticks' : '') + '</div>';

    var grid = el.querySelector('#tbmgrid');
    METERS.forEach(function (m) {
      var cell = document.createElement('div'); cell.className = 'met';
      cell.innerHTML =
        '<div class="big">' + segUsed + '<span class="of"> / ' + (segTotal || '—') + '</span></div>' +
        '<div class="biglab">segments</div>';
      var host = document.createElement('div');
      cell.appendChild(host);
      var nm = document.createElement('div'); nm.className = 'mname'; nm.innerHTML = m.name;
      cell.appendChild(nm);
      grid.appendChild(cell);
      m.draw(host, data);
    });

    if (data.rows.length && habitsDone >= data.rows.length) {
      setTimeout(function () {
        var c = el.querySelector('#tbmcap'); if (c) c.classList.add('on');
      }, 300);
    }
  }
})();
