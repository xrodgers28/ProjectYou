/* Daily Habit Tracker: drag to reorder, v1.0 (Oct 18, 2026). Scott: "make these drag and droppable, then save them for the days to come."
   On the Habit Bandit Remote, drag any habit to a new spot in its section, or into another section.
   Tap still ticks, press-and-hold still snoozes; moving a few pixels starts a drag instead.
   The new order is saved through PYHT.saveOrder to the same list Stack Builder uses, so it sticks for every later day. Sample views are never saved. */
(function () {
  function boot() {
    var box = document.getElementById('designs'); if (!box || !window.PYHT) return;
    var E = window.PYHT, MOVE = 7, drag = null, swallow = false, bar = null, raf = 0, lastY = 0;

    var st = document.createElement('style');
    st.textContent = '#d-remote [data-cell]{touch-action:none;-webkit-touch-callout:none}' +
      '#d-remote [data-cell].pydrag-src{opacity:.25}' +
      '#d-remote [data-stack].pydrag-over{outline:2px dashed #f4c95d;outline-offset:4px;border-radius:8px}' +
      '#pydrag-ghost{position:fixed;z-index:9998;pointer-events:none;opacity:.92;transform:scale(1.12);filter:drop-shadow(0 8px 14px #000c);width:64px}' +
      '#pydrag-bar{position:fixed;z-index:9997;width:4px;border-radius:2px;background:#f4c95d;box-shadow:0 0 8px #f4c95d;pointer-events:none}';
    document.head.appendChild(st);

    function say(m, err) { if (window.__pySay) window.__pySay(m, false, err); }
    function find(n) { var s = window.STATE; if (!s) return null; for (var i = 0; i < s.habits.length; i++) if (s.habits[i].n === n) return s.habits[i]; return null; }
    function nameOf(cell) { var k = cell.querySelector('[data-h]'); return k ? k.getAttribute('data-h') : null; }

    function over(x, y) {
      var grids = [].slice.call(box.querySelectorAll('#d-remote [data-stack]')), best = null, bd = 1e9;
      grids.forEach(function (g) {
        var r = g.getBoundingClientRect(), dy = y < r.top - 22 ? r.top - 22 - y : (y > r.bottom ? y - r.bottom : 0), dx = x < r.left ? r.left - x : (x > r.right ? x - r.right : 0), d = dy * 2 + dx;
        if (d < bd) { bd = d; best = g; }
      });
      if (!best) return null;
      var cells = [].slice.call(best.querySelectorAll('[data-cell]')).filter(function (c) { return c !== drag.cell; });
      var at = cells.length, side = 'before', ref = cells[0] || null, nd = 1e9;
      cells.forEach(function (c, i) {
        var r = c.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, d = Math.hypot(x - cx, (y - cy) * 1.6);
        if (d < nd) { nd = d; ref = c; at = (Math.abs(y - cy) < r.height / 2 ? x > cx : y > cy) ? i + 1 : i; side = at === i ? 'before' : 'after'; }
      });
      return { grid: best, idx: +best.getAttribute('data-stack'), at: at, ref: ref, side: side };
    }
    function showTarget(t) {
      box.querySelectorAll('.pydrag-over').forEach(function (g) { g.classList.remove('pydrag-over'); });
      if (!t) { if (bar) bar.style.display = 'none'; return; }
      t.grid.classList.add('pydrag-over');
      if (!bar) { bar = document.createElement('div'); bar.id = 'pydrag-bar'; document.body.appendChild(bar); }
      if (!t.ref) { bar.style.display = 'none'; return; }
      var r = t.ref.getBoundingClientRect(), kb = t.ref.querySelector('[data-h]').getBoundingClientRect();
      bar.style.display = 'block'; bar.style.height = kb.height + 'px'; bar.style.top = kb.top + 'px';
      bar.style.left = ((t.side === 'before' ? r.left : r.right) - 2) + 'px';
    }
    function move(ev) {
      drag.ghost.style.left = (ev.clientX - 32) + 'px'; drag.ghost.style.top = (ev.clientY - 32) + 'px';
      drag.t = over(ev.clientX, ev.clientY); showTarget(drag.t); lastY = ev.clientY;
    }
    function scrollLoop() {
      if (!drag) return;
      var h = window.innerHeight; if (lastY < 70) window.scrollBy(0, -12); else if (lastY > h - 70) window.scrollBy(0, 12);
      raf = requestAnimationFrame(scrollLoop);
    }
    function end(commit) {
      var d = drag; if (!d) return; drag = null; cancelAnimationFrame(raf);
      document.removeEventListener('pointermove', onMove, true); document.removeEventListener('pointerup', onUp, true); document.removeEventListener('pointercancel', onCancel, true);
      d.ghost.remove(); d.cell.classList.remove('pydrag-src'); showTarget(null); window.__snzBusy = false;
      swallow = true; setTimeout(function () { swallow = false; }, 450);
      if (!commit || !d.t) return;
      save(d.name, d.t);
    }
    function onMove(ev) { move(ev); }
    function onUp() { end(true); }
    function onCancel() { end(false); }

    async function save(name, t) {
      var s = window.STATE, h = find(name); if (!s || !h) return;
      var from = h.st, to = t.idx;
      function names(i) { var a = []; s.habits.forEach(function (x) { if (x.st === i && x.n !== name) a.push(x.n); }); return a; }
      var tn = names(to); tn.splice(Math.min(t.at, tn.length), 0, name);
      var cur = []; s.habits.forEach(function (x) { if (x.st === to) cur.push(x.n); });
      if (from === to && cur.join('|') === tn.join('|')) return;
      if (s.mode !== 'live') { say('Sample view: the new order for ' + name + ' was not saved'); return; }
      var plans = [{ idx: to, names: tn }]; if (from !== to) plans.push({ idx: from, names: names(from) });
      window.__snzBusy = true;
      try {
        await E.saveOrder(plans, name);
        say(name + (from === to ? ' moved. Order saved for every day.' : ' moved to another section. Saved for every day.'));
      } catch (e) {
        var m = String((e && e.message) || e), auth = /jwt|auth|expired|401|permission|policy/i.test(m);
        say(auth ? 'Sign in again, then move ' + name + ' once more' : 'Could not save the new order: ' + m, true);
      } finally { window.__snzBusy = false; if (window.redraw) window.redraw(); }
    }

    var pend = null;
    box.addEventListener('pointerdown', function (ev) {
      if (ev.button > 0 || drag) return;
      var cell = ev.target.closest && ev.target.closest('#d-remote [data-cell]'); if (!cell || !box.contains(cell)) return;
      var n = nameOf(cell); if (!n || !find(n)) return;
      pend = { cell: cell, name: n, x: ev.clientX, y: ev.clientY };
    });
    document.addEventListener('pointermove', function (ev) {
      if (!pend || drag) return;
      if (Math.abs(ev.clientX - pend.x) < MOVE && Math.abs(ev.clientY - pend.y) < MOVE) return;
      var p = pend; pend = null;
      var g = p.cell.cloneNode(true); g.id = 'pydrag-ghost'; g.removeAttribute('data-cell'); g.querySelectorAll('[data-h],[data-tap]').forEach(function (q) { q.removeAttribute('data-h'); q.removeAttribute('data-tap'); });
      document.body.appendChild(g);
      drag = { cell: p.cell, name: p.name, ghost: g, t: null }; p.cell.classList.add('pydrag-src');
      window.__snzBusy = true; lastY = ev.clientY;
      document.addEventListener('pointermove', onMove, true); document.addEventListener('pointerup', onUp, true); document.addEventListener('pointercancel', onCancel, true);
      move(ev); raf = requestAnimationFrame(scrollLoop);
    }, true);
    ['pointerup', 'pointercancel'].forEach(function (n) { document.addEventListener(n, function () { pend = null; }, true); });
    document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape' && drag) end(false); });
    /* Runs before the snooze and tap handlers: a drop must not also tick or snooze. */
    document.addEventListener('click', function (ev) { if (swallow) { ev.stopImmediatePropagation(); ev.preventDefault(); } }, true);
    document.addEventListener('contextmenu', function (ev) { if (drag) ev.preventDefault(); }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
