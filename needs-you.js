/* ===== Project YOU · Needs You v1.0 =====================================
   The pop-up that asks Scott a question when a module gets stuck.

   ONE queue, any module, any page. A module writes a row into public.asks with
   a short question and up to four tappable answers; this shows it wherever he
   happens to be; the answer goes home through the database trigger that raised
   it. Nothing here knows anything about food.

   A COMMENT IS ALWAYS AVAILABLE. Scott's rule, Sep 2 2026: the tappable answers
   are a guess at what he might say, so the box to say something else is never
   hidden behind another tap, and a comment on its own is a complete answer.

   It fails silent by design. No Supabase on the page, not signed in, nothing
   waiting, or anything at all going wrong: it does nothing and says nothing.
   It must never be the reason a page looks broken.
   ======================================================================== */
(function () {
  "use strict";
  if (window.__needsYou) return;            // one per page, whatever loads it
  window.__needsYou = true;

  var URL_ = "https://arnjntspmrhigodlssbn.supabase.co";
  var KEY_ = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM";

  var CSS = [
    '.ny-card{position:fixed;right:16px;bottom:16px;width:288px;max-width:calc(100vw - 32px);',
    '  background:#fff;border:1px solid #dbe0e6;border-radius:12px;z-index:9000;',
    '  box-shadow:0 12px 32px rgba(31,42,68,.22);padding:13px 14px 12px;',
    '  font-family:Arial,Helvetica,sans-serif;color:#1f2a44;font-size:13px;line-height:1.45;',
    '  opacity:0;transform:translateY(10px);transition:opacity .22s,transform .22s}',
    '.ny-card.ny-in{opacity:1;transform:translateY(0)}',
    '@media (max-width:560px){.ny-card{right:12px;left:12px;width:auto;',
    '  bottom:calc(12px + env(safe-area-inset-bottom))}}',
    '@media (prefers-reduced-motion:reduce){.ny-card{transition:none}}',
    '.ny-h{display:flex;align-items:center;gap:6px;margin-bottom:5px}',
    '.ny-dot{width:7px;height:7px;border-radius:50%;background:#8a6d1f;flex:0 0 auto}',
    '.ny-k{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;letter-spacing:.09em;',
    '  text-transform:uppercase;color:#8a6d1f;font-weight:700}',
    '.ny-x{margin-left:auto;background:none;border:none;color:#b0b4bb;font-size:17px;line-height:1;',
    '  cursor:pointer;padding:0 2px}',
    '.ny-x:hover{color:#6b7280}',
    '.ny-mod{font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;color:#9aa6b4;margin-bottom:3px}',
    '.ny-q{font-size:13.5px;font-weight:700;margin-bottom:3px}',
    '.ny-d{font-size:11.5px;color:#8a8f98;margin-bottom:9px}',
    '.ny-opts{display:flex;flex-direction:column;gap:6px;margin-bottom:9px}',
    '.ny-opt{font-family:inherit;font-size:12.5px;font-weight:700;background:#fdf4dd;color:#8a6d1f;',
    '  border:1px solid #eeddab;border-radius:999px;padding:8px 12px;cursor:pointer;text-align:center;width:100%}',
    '.ny-opt:hover{background:#f8ebc6}',
    '.ny-opt:active{transform:scale(.98)}',
    '.ny-opt[disabled]{opacity:.5;cursor:default}',
    /* The comment box is always here, never behind a "add a note" link. */
    '.ny-cw{display:flex;gap:6px;align-items:flex-end}',
    '.ny-c{flex:1 1 auto;min-width:0;font-family:inherit;font-size:12.5px;color:#1f2a44;background:#fbfbfc;',
    '  border:1px solid #e4e6ea;border-radius:8px;padding:7px 9px;resize:none;height:34px;max-height:96px;',
    '  line-height:1.35;overflow-y:auto}',
    '.ny-c:focus{outline:none;border-color:#9aa0a8;background:#fff}',
    '.ny-send{flex:0 0 auto;font-family:inherit;font-size:12.5px;font-weight:700;background:#3f6f8f;color:#fff;',
    '  border:none;border-radius:8px;padding:8px 11px;cursor:pointer;height:34px}',
    '.ny-send:hover{background:#345a75}',
    '.ny-send[disabled]{background:#c8cdd4;cursor:default}',
    '.ny-f{display:flex;align-items:center;gap:8px;margin-top:9px;',
    '  font-family:ui-monospace,Menlo,Consolas,monospace;font-size:9.5px;color:#9aa6b4}',
    '.ny-f button,.ny-f a{font:inherit;background:none;border:none;color:#3f6f8f;cursor:pointer;padding:0;text-decoration:none}',
    '.ny-f button:hover,.ny-f a:hover{text-decoration:underline}',
    '.ny-f .ny-cnt{margin-right:auto}',
    '.ny-f span[aria-hidden]{color:#c8cdd4}',
    '.ny-done{text-align:center;color:#2f8f5b;font-weight:700;font-size:13px;padding:6px 0 2px}'
  ].join('');

  function esc(s){ return String(s == null ? '' : s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  function style(){
    if (document.getElementById('ny-style')) return;
    var s = document.createElement('style');
    s.id = 'ny-style'; s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* Snoozing is remembered in this browser only. Deliberate: "ask me later"
     should not follow him from his laptop to his phone, because later on the
     phone is a different moment. */
  function snoozedHere(id){
    try { return localStorage.getItem('ny-snooze-' + id) === new Date().toDateString(); }
    catch (e) { return false; }
  }
  function snoozeHere(id){
    try { localStorage.setItem('ny-snooze-' + id, new Date().toDateString()); } catch (e) {}
  }

  var sb, ASKS = [], at = 0, card;

  function start(){
    try {
      if (!window.supabase || !window.supabase.createClient) return;   // page has no client library
      sb = window.supabase.createClient(URL_, KEY_);
    } catch (e) { return; }

    sb.auth.getSession().then(function (r) {
      if (!r || !r.data || !r.data.session) return;                    // not signed in, say nothing
      return sb.from('v_asks_open').select('*').limit(20).then(function (q) {
        if (q.error || !q.data || !q.data.length) return;
        ASKS = q.data.filter(function (a) { return !snoozedHere(a.id); });
        if (!ASKS.length) return;
        style();
        setTimeout(show, 1200);            // let the page settle first
      });
    }).catch(function () {});
  }

  function show(){
    var a = ASKS[at];
    if (!a) { close(); return; }
    if (!card) {
      card = document.createElement('div');
      card.className = 'ny-card';
      card.setAttribute('role','dialog');
      card.setAttribute('aria-label','Needs you');
      document.body.appendChild(card);
    }
    var opts = [];
    try { opts = Array.isArray(a.options) ? a.options : JSON.parse(a.options || '[]'); }
    catch (e) { opts = []; }

    card.innerHTML =
      '<div class="ny-h"><span class="ny-dot"></span><span class="ny-k">Needs you</span>' +
      '<button class="ny-x" type="button" aria-label="Close">&times;</button></div>' +
      '<div class="ny-mod">' + esc(a.module) + '</div>' +
      '<div class="ny-q">' + esc(a.question) + '</div>' +
      (a.detail ? '<div class="ny-d">' + esc(a.detail) + '</div>' : '') +
      (opts.length ? '<div class="ny-opts">' + opts.map(function (o, i) {
        return '<button class="ny-opt" type="button" data-i="' + i + '">' + esc(o) + '</button>';
      }).join('') + '</div>' : '') +
      '<div class="ny-cw">' +
        '<textarea class="ny-c" rows="1" placeholder="Add a comment"></textarea>' +
        '<button class="ny-send" type="button" disabled>Send</button>' +
      '</div>' +
      '<div class="ny-f"><span class="ny-cnt">' + (at + 1) + ' of ' + ASKS.length + '</span>' +
        '<button class="ny-later" type="button">Ask me later</button>' +
        (a.link ? '<span aria-hidden="true">&middot;</span><a href="' + esc(a.link) + '">Open ' + esc(a.module) + '</a>' : '') +
      '</div>';

    var box  = card.querySelector('.ny-c');
    var send = card.querySelector('.ny-send');

    /* A typed comment is a complete answer on its own, so Send comes alive as
       soon as there is anything in the box even if no option was tapped. */
    box.addEventListener('input', function () {
      send.disabled = !box.value.trim();
      box.style.height = '34px';
      box.style.height = Math.min(box.scrollHeight, 96) + 'px';
    });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey && box.value.trim()) { e.preventDefault(); answer(null); }
    });
    send.addEventListener('click', function () { if (box.value.trim()) answer(null); });

    /* Tapping an option sends the comment WITH it when there is one, so he never
       loses something he typed by tapping a button afterwards. */
    Array.prototype.forEach.call(card.querySelectorAll('.ny-opt'), function (b) {
      b.addEventListener('click', function () { answer(opts[+b.dataset.i]); });
    });
    card.querySelector('.ny-x').addEventListener('click', function () { snoozeHere(a.id); next(); });
    card.querySelector('.ny-later').addEventListener('click', function () { snoozeHere(a.id); next(); });

    requestAnimationFrame(function () { card.classList.add('ny-in'); });
  }

  function answer(picked){
    var a = ASKS[at];
    if (!a) return;
    var box = card.querySelector('.ny-c');
    var note = box ? box.value.trim() : '';
    Array.prototype.forEach.call(card.querySelectorAll('button'), function (b) { b.disabled = true; });

    sb.from('asks').update({
      status: 'answered',
      answer: picked || null,
      comment: note || null
    }).eq('id', a.id).then(function (r) {
      if (r && r.error) {
        Array.prototype.forEach.call(card.querySelectorAll('button'), function (b) { b.disabled = false; });
        var q = card.querySelector('.ny-q');
        if (q) q.textContent = 'That did not save. Try again in a moment.';
        return;
      }
      card.innerHTML = '<div class="ny-done">Got it, thank you.</div>';
      setTimeout(next, 900);
    });
  }

  function next(){
    at++;
    if (at >= ASKS.length) { close(); return; }
    card.classList.remove('ny-in');
    setTimeout(show, 160);
  }

  function close(){
    if (!card) return;
    card.classList.remove('ny-in');
    setTimeout(function () { if (card && card.parentNode) card.parentNode.removeChild(card); card = null; }, 240);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
