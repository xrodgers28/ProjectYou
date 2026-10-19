/* Daily Habit Tracker: snooze, v1.2 (Oct 18, 2026: menu now opens next to the key you held, not the top-left corner; v1.1 Oct 13: starts after the page is ready). Scott's pick: Mock A, press and hold.
   Press and hold a key on the Habit Bandit Remote (or right-click) to open a small menu.
   Core habits ask for a reason first; Secondary and Bonus snooze in one tap. Tap a snoozed key to wake it.
   A snoozed habit leaves today's count and the streak is safe. Saved through PYHT.setSnooze; sample views are never saved. */
(function () {
  function boot() {
  var HOLD_MS = 450, MOVE_PX = 8, REASONS = ['Busy day', 'Traveling', 'Out of energy', 'Plans changed'];
  var box = document.getElementById('designs'); if (!box || !window.PYHT) return;
  var E = window.PYHT, timer = null, startX = 0, startY = 0, lastX = 0, lastY = 0, swallow = false, pop = null, inflight = 0;

  var st = document.createElement('style');
  st.textContent =
    '#d-remote [data-h],#d-wheel [data-h],#d-rings [data-h],#d-rings-badges [data-h]{-webkit-touch-callout:none;-webkit-user-select:none;user-select:none;touch-action:manipulation}' +
    '#snzpop{position:fixed;z-index:9999;background:#0f1117;color:#fff;border:1px solid #3b3e48;border-radius:12px;padding:8px;display:flex;flex-direction:column;gap:6px;box-shadow:0 10px 28px #000a;min-width:176px;max-width:240px;font-family:Arial,Helvetica,sans-serif}' +
    '#snzpop b{font-size:11px;color:#9aa3c0;font-weight:700;padding:2px 4px;line-height:1.3}' +
    '#snzpop button{font-family:inherit;font-size:13px;font-weight:700;border:1px solid #3b3e48;background:#1b1e27;color:#fff;border-radius:8px;padding:9px 10px;text-align:left;cursor:pointer}' +
    '#snzpop button:hover,#snzpop button:focus-visible{border-color:#6f93e6;outline:none}' +
    '#snzpop button.s{color:#6f93e6}';
  document.head.appendChild(st);

  function say(m, err) { if (window.__pySay) window.__pySay(m, false, err); }
  function find(n) { var s = window.STATE; if (!s) return null; var a = s.habits; for (var i = 0; i < a.length; i++) if (a[i].n === n) return a[i]; return null; }
  function closePop() { if (pop) { pop.remove(); pop = null; } }

  async function apply(name, on, reason) {
    var s = window.STATE, h = find(name); if (!s || !h) return;
    window.STATE = E.reflectSnooze(s, name, on); drawStat(); drawDesigns();
    if (s.mode !== 'live') { say('Sample view: ' + name + ' not saved'); return; }
    inflight++; window.__snzBusy = true;
    try {
      await E.setSnooze(name, on, reason);
      say(name + (on ? ' snoozed for today' : ' woken up'));
    } catch (e) {
      window.STATE = E.reflectSnooze(window.STATE, name, !on); drawStat(); drawDesigns();
      var m = String((e && e.message) || e), auth = /jwt|auth|expired|401|permission|policy/i.test(m);
      say(auth ? 'Sign in again, then try ' + name + ' once more' : 'Could not save ' + name + ': ' + m, true);
    } finally { inflight--; if (!inflight) { window.__snzBusy = false; setTimeout(function () { redraw(); }, 600); } }
  }

  function openPop(el, h) {
    closePop();
    pop = document.createElement('div'); pop.id = 'snzpop'; pop.setAttribute('role', 'menu');
    var html = '<b>' + E.esc(h.n) + '</b>';
    if (h.snz) html += '<button type="button" class="s" data-a="wake">Wake it up</button>';
    else if (h.lvl === 'core') html += '<b style="color:#f4c95d">Core habit. Why snooze it today?</b>' + REASONS.map(function (r) { return '<button type="button" class="s" data-a="snooze" data-r="' + r + '">' + r + '</button>'; }).join('');
    else html += '<button type="button" class="s" data-a="snooze" data-r="No reason given">Snooze today</button>';
    html += '<button type="button" data-a="close">Cancel</button>';
    pop.innerHTML = html; document.body.appendChild(pop);
    /* v1.2: the page redraws its keys every few seconds, so the key held 450ms ago may be gone from the page (its box reads as all zeros, which put the menu in the top-left corner). If the key is gone, open the menu right where the finger or mouse is. */
    var b = el.isConnected && el.getBoundingClientRect().width ? el.getBoundingClientRect() : { left: lastX, right: lastX, top: lastY, bottom: lastY, width: 0, height: 0 };
    var pw = pop.offsetWidth, ph = pop.offsetHeight;
    var x = Math.max(8, Math.min(window.innerWidth - pw - 8, b.left + b.width / 2 - pw / 2));
    var y = b.bottom + 8; if (y + ph > window.innerHeight - 8) y = Math.max(8, b.top - ph - 8);
    pop.style.left = x + 'px'; pop.style.top = y + 'px';
    pop.addEventListener('click', function (ev) {
      var t = ev.target.closest('button'); if (!t) return;
      var a = t.getAttribute('data-a'), name = h.n; closePop();
      if (a === 'snooze') apply(name, true, t.getAttribute('data-r'));
      else if (a === 'wake') apply(name, false);
    });
    var first = pop.querySelector('button'); if (first) first.focus();
  }

  function target(ev) {
    var el = ev.target.closest && ev.target.closest('#d-remote [data-h],#d-wheel [data-h],#d-rings [data-h],#d-rings-badges [data-h]'); if (!el || !box.contains(el)) return null;
    var h = find(el.getAttribute('data-h')); if (!h || h.lvl === 'weekly') return null;
    return { el: el, h: h };
  }
  function cancel() { clearTimeout(timer); timer = null; }

  box.addEventListener('pointerdown', function (ev) {
    if (ev.button > 0) return;
    var t = target(ev); if (!t || t.h.done) return;
    startX = lastX = ev.clientX; startY = lastY = ev.clientY; cancel();
    timer = setTimeout(function () { timer = null; swallow = true; setTimeout(function () { swallow = false; }, 600); openPop(t.el, t.h); }, HOLD_MS);
  });
  box.addEventListener('pointermove', function (ev) { lastX = ev.clientX; lastY = ev.clientY; if (timer && (Math.abs(ev.clientX - startX) > MOVE_PX || Math.abs(ev.clientY - startY) > MOVE_PX)) cancel(); });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { box.addEventListener(n, cancel); });
  box.addEventListener('contextmenu', function (ev) { var t = target(ev); if (!t || t.h.done) return; lastX = ev.clientX; lastY = ev.clientY; ev.preventDefault(); cancel(); openPop(t.el, t.h); });

  /* Capture phase: runs before the page's tap-to-complete handler. A hold must not also tick; a tap on a snoozed key opens the wake menu. */
  box.addEventListener('click', function (ev) {
    var t = target(ev); if (!t) return;
    if (swallow) { ev.stopImmediatePropagation(); ev.preventDefault(); return; }
    if (t.h.snz) { ev.stopImmediatePropagation(); ev.preventDefault(); openPop(t.el, t.h); }
  }, true);

  document.addEventListener('pointerdown', function (ev) { if (pop && !pop.contains(ev.target)) closePop(); }, true);
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closePop(); });
  }
  /* v1.1: this file loads in the page head, before #designs exists, so start once the page body is ready. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
