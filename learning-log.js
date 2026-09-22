/* learning-log.js - THE ONE learning log form. Project YOU, Sep 19 2026.

   Scott: "Sometimes I take time to do learning and I want to track it when I do",
   for instance two 30 minute stretches of the Claude podcast while driving. So the
   Learning pill on Todays Tasks opens this compact form, the same way the Social
   pill opens social-log.js, and any other page that wants it loads this file:

     PYLearn.mount(el, opts)   draws the form inside el
     PYLearn.open(opts)        draws it in a pop-up sheet (Todays Tasks)

   opts also takes tracker and group (Sep 21 2026): the habit box to tick and
   the Compass section it files under. Leave them out and it is the shared
   Learning habit under Mental Fitness, which is what every page did before.

   opts: sb (Supabase client, required), when (YYYY-MM-DD), startMin (minutes after
   midnight, optional; timeIsGuess:true when the page picked the slot itself), mins
   (length, optional), what (a title to prefill), onSaved(result), onClose().

   WHAT A SAVE DOES
   - A row in learning_log (what, kind, while doing, minutes, takeaway).
   - The "Learning" habit is ticked for that day. Lifelong learning is part of
     Mental Fitness on the Clarity Compass, so that is the group the habit files
     under: today through the live habit row (its trigger files qs_log), a past
     day straight into qs_log, the same shape social-log.js writes.
   - Nothing is tracked before it happens: this form only records learning that
     has already been done.

   Change the form here and every page gets the change. Do not copy it into a page. */
window.PYLearn = (function () {
  'use strict';

  var KINDS = ['Podcast','Audiobook','Book','Course','Video','Article','Newsletter','Something else'];
  var WHILE = ['Driving','Walking','At my desk','On the couch','Commuting','Flying'];
  var QUICK = [15, 30, 45, 60];
  var HABIT_TRACKER = 'Learning', HABIT_GROUP = 'Mental Fitness';
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ---------- small helpers, the same ones social-log.js uses ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function att(s){ return esc(s).replace(/"/g,'&quot;'); }
  function today(){
    if (window.PY && typeof window.PY.today === 'function') { try { return window.PY.today(); } catch (e) {} }
    var n = new Date(), e = new Date(n.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    if (e.getHours() < 2) e.setDate(e.getDate() - 1);
    return e.getFullYear() + '-' + String(e.getMonth()+1).padStart(2,'0') + '-' + String(e.getDate()).padStart(2,'0');
  }
  function shortD(d){ var p = String(d||'').split('-'); if (p.length < 3) return d || ''; return MON[+p[1]-1] + ' ' + (+p[2]) + ', ' + p[0]; }
  function hhmm(m){ m = ((m|0)+1440) % 1440; var h = Math.floor(m/60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (mm ? ':' + String(mm).padStart(2,'0') : '') + ap; }
  function kindIn(s){
    var t = String(s||'');
    return /podcast/i.test(t)?'Podcast':/audiobook/i.test(t)?'Audiobook':/\b(book|chapter)\b/i.test(t)?'Book'
      :/\b(course|class|lesson|module)\b/i.test(t)?'Course':/\b(video|youtube|talk|webinar)\b/i.test(t)?'Video'
      :/\b(article|blog|post|paper)\b/i.test(t)?'Article':/newsletter/i.test(t)?'Newsletter':'';
  }
  function titleOf(what, kind){
    var w = String(what||'').trim();
    if (!w) return kind && kind !== 'Something else' ? 'Learning: ' + kind : 'Learning';
    return 'Learning: ' + w;
  }

  /* ---------- the habit tick ---------- */
  async function tickHabit(sb, date, minutes, tracker, group){
    var DAY = today();
    /* A caller can name its own habit box. Omit them and it is the shared
       Learning habit, exactly as before, so every existing page is unchanged. */
    var TR = tracker || HABIT_TRACKER, GR = group || HABIT_GROUP;
    try {
      if (date === DAY) {
        var r = await sb.from('todos').select('id,done,actual_minutes').eq('is_habit', true).eq('tracker', TR).limit(1);
        var row = r.data && r.data[0];
        if (!row) return null;
        var now = new Date().toISOString();
        /* A second stretch the same day adds to the first: two 30 minute drives are
           an hour of learning, not the last one. The trigger re-files qs_log when
           actual_minutes changes, so the log follows. */
        var total = (row.done ? (+row.actual_minutes || 0) : 0) + (+minutes || 0);
        await sb.from('todos').update({ done: true, status: 'done', done_at: row.done ? undefined : now, completed_at: row.done ? undefined : now,
          actual_minutes: total || null, for_date: DAY, updated_at: now }).eq('id', row.id);
        return row.id;
      }
      if (date < DAY) {
        await sb.from('qs_log').upsert([{ date: date, group: GR, tracker: TR, value: 1, unit: 'done',
          minutes: minutes || null, minutes_estimated: !minutes, status: 'done', source: 'habit-bandit',
          logged_at: new Date().toISOString(), note: 'Logged from the learning log on ' + DAY }], { onConflict: 'date,tracker,source' });
      }
    } catch (e) {}
    return null;
  }

  /* ---------- the look, scoped to .pyll so it sits inside any page ---------- */
  function css(){
    if (document.getElementById('pyll-css')) return;
    var s = document.createElement('style'); s.id = 'pyll-css';
    s.textContent = [
      '.pyll{--ll-bg:#fff;--ll-soft:#f7f5ee;--ll-line:#e3e7ee;--ll-ink:#26313a;--ll-ink2:#5b6270;--ll-mut:#8b949b;--ll-acc:#a8892a;--ll-good:#3f7d5c;--ll-warm:#c06a35;',
      ' color:var(--ll-ink);font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;text-align:left}',
      '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .pyll.pyll-auto{--ll-bg:#1e2328;--ll-soft:#262a24;--ll-line:#333a41;--ll-ink:#e8eaec;--ll-ink2:#bcc3c9;--ll-mut:#8b949b;--ll-acc:#d2b556;--ll-good:#5fae7e;--ll-warm:#e29a63}}',
      '.pyll *{box-sizing:border-box}',
      '.pyll h3{font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:-.01em}',
      '.pyll .ll-at{font-size:11px;font-weight:600;color:var(--ll-mut);margin-left:6px}',
      '.pyll .fld{display:grid;grid-template-columns:54px minmax(0,1fr);column-gap:6px;row-gap:3px;align-items:start;margin:0 0 6px}',
      '.pyll .fld>.lab{grid-column:1;padding-top:2px;font-size:9px;font-weight:700;letter-spacing:.06em;line-height:12px;text-transform:uppercase;color:var(--ll-mut)}',
      '.pyll .fld>*:not(.lab){grid-column:2;min-width:0}',
      '.pyll .picks{display:flex;gap:3px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
      '.pyll .picks::-webkit-scrollbar{display:none}',
      '.pyll .p{flex:none;white-space:nowrap;font:inherit;font-size:10px;line-height:12px;padding:0 6px;cursor:pointer;border:1px solid var(--ll-line);border-radius:99px;background:var(--ll-bg);color:var(--ll-ink2)}',
      '.pyll .p:hover{border-color:var(--ll-acc)}',
      '.pyll .p.on{background:var(--ll-acc);border-color:var(--ll-acc);color:#fff;font-weight:700}',
      '.pyll .recent .p{color:var(--ll-acc)}',
      '.pyll input[type=text],.pyll input[type=number],.pyll textarea{width:100%;font:inherit;font-size:16px;line-height:1.25;padding:3px 8px;border:1px solid var(--ll-line);border-radius:7px;background:var(--ll-soft);color:var(--ll-ink)}',
      '@media (hover:hover) and (pointer:fine){.pyll input[type=text],.pyll input[type=number],.pyll textarea{font-size:13px}}',
      '.pyll input:focus-visible,.pyll textarea:focus-visible{outline:2px solid var(--ll-acc);outline-offset:1px}',
      '.pyll textarea{height:28px;resize:vertical}.pyll textarea:focus{height:60px}',
      '.pyll .pair{display:flex;gap:6px;align-items:center}',
      '.pyll .pair input[type=number]{width:64px}',
      '.pyll .why{margin:0;font-size:11px;line-height:1.3;color:var(--ll-mut)}',
      '.pyll .why:empty{display:none}',
      '.pyll .why.warn{color:var(--ll-warm)}.pyll .why.ok{color:var(--ll-good);font-weight:600}',
      '.pyll .go{width:100%;margin-top:3px;padding:7px;border:0;border-radius:8px;background:var(--ll-good);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer}',
      '.pyll .go[disabled]{opacity:.55;cursor:default}',
      '.pyll-ov{position:fixed;inset:0;z-index:10000;background:rgba(20,24,30,.38);display:flex;align-items:flex-start;justify-content:center;padding:6vh 12px 12px;overflow:auto}',
      '.pyll-ov .pyll-card{position:relative;width:100%;max-width:440px;background:var(--ll-bg);border:1px solid var(--ll-line);border-radius:14px;padding:12px 14px;box-shadow:0 18px 50px rgba(0,0,0,.28)}',
      '.pyll-ov .pyll-x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:20px;line-height:1;color:var(--ll-mut);cursor:pointer;padding:2px 4px}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- the form ---------- */
  function Form(el, opts){
    this.el = el; this.sb = opts.sb; this.opts = opts || {};
    this.when = opts.when || today();
    this.what = String(opts.what || '').trim();
    this.kind = kindIn(this.what);
    this.doing = '';
    this.mins = +opts.mins || 30;
    this.takeaway = '';
    this.recent = [];
  }
  Form.prototype.draw = function(){
    var self = this, o = this.opts;
    var at = o.startMin != null ? '<span class="ll-at">' + esc(shortD(this.when)) + ' · ' + esc(hhmm(o.startMin)) + (o.timeIsGuess ? ' (about)' : '') + '</span>'
                                : '<span class="ll-at">' + esc(shortD(this.when)) + '</span>';
    var h = '<h3>Learning' + at + '</h3>';
    h += '<div class="fld"><span class="lab">What</span><div><input type="text" id="ll-what" maxlength="80" placeholder="Claude podcast, chapter 4 of Atomic Habits, a course module..." value="' + att(this.what) + '"><div class="picks recent" id="ll-recent"></div></div></div>';
    h += '<div class="fld"><span class="lab">Kind</span><div class="picks" id="ll-kind">' + KINDS.map(function(k){ return '<button type="button" class="p' + (k === self.kind ? ' on' : '') + '" data-k="' + att(k) + '">' + esc(k) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="fld"><span class="lab">While</span><div class="picks" id="ll-while">' + WHILE.map(function(k){ return '<button type="button" class="p" data-k="' + att(k) + '">' + esc(k) + '</button>'; }).join('') + '</div></div>';
    h += '<div class="fld"><span class="lab">Minutes</span><div class="pair"><input type="number" id="ll-mins" min="1" max="600" step="5" value="' + this.mins + '"><div class="picks" id="ll-quick">' + QUICK.map(function(m){ return '<button type="button" class="p' + (m === self.mins ? ' on' : '') + '" data-m="' + m + '">' + m + '</button>'; }).join('') + '</div></div></div>';
    h += '<div class="fld"><span class="lab">Takeaway</span><textarea id="ll-take" placeholder="One line worth keeping (optional)"></textarea></div>';
    h += '<p class="why" id="ll-why"></p>';
    h += '<button type="button" class="go" id="ll-go">Log it, tick Learning</button>';
    this.el.innerHTML = h;
    var q = function(id){ return self.el.querySelector('#' + id); };
    q('ll-what').addEventListener('input', function(){ self.what = this.value.trim(); if (!self.kindPicked) { self.kind = kindIn(self.what); self.paintKind(); } });
    q('ll-kind').addEventListener('click', function(e){ var b = e.target.closest('.p'); if (!b) return; self.kind = (self.kind === b.dataset.k) ? '' : b.dataset.k; self.kindPicked = !!self.kind; self.paintKind(); });
    q('ll-while').addEventListener('click', function(e){ var b = e.target.closest('.p'); if (!b) return; self.doing = (self.doing === b.dataset.k) ? '' : b.dataset.k; self.paintWhile(); });
    q('ll-quick').addEventListener('click', function(e){ var b = e.target.closest('.p'); if (!b) return; self.mins = +b.dataset.m; q('ll-mins').value = self.mins; self.paintMins(); });
    q('ll-mins').addEventListener('input', function(){ self.mins = Math.max(1, +this.value || 0); self.paintMins(); });
    q('ll-take').addEventListener('input', function(){ self.takeaway = this.value.trim(); });
    q('ll-recent').addEventListener('click', function(e){ var b = e.target.closest('.p'); if (!b) return; self.what = b.dataset.k; q('ll-what').value = self.what; if (b.dataset.kind) { self.kind = b.dataset.kind; self.kindPicked = true; self.paintKind(); } if (b.dataset.doing) { self.doing = b.dataset.doing; self.paintWhile(); } });
    q('ll-go').addEventListener('click', function(){ self.save(); });
    this.loadRecent();
    setTimeout(function(){ try { q('ll-what').focus(); } catch (e) {} }, 30);
  };
  Form.prototype.paintKind = function(){ var k = this.kind; this.el.querySelectorAll('#ll-kind .p').forEach(function(b){ b.classList.toggle('on', b.dataset.k === k); }); };
  Form.prototype.paintWhile = function(){ var k = this.doing; this.el.querySelectorAll('#ll-while .p').forEach(function(b){ b.classList.toggle('on', b.dataset.k === k); }); };
  Form.prototype.paintMins = function(){ var m = this.mins; this.el.querySelectorAll('#ll-quick .p').forEach(function(b){ b.classList.toggle('on', +b.dataset.m === m); }); };
  Form.prototype.loadRecent = async function(){
    /* The last few things he learned from, so a running podcast is one tap. */
    try {
      var r = await this.sb.from('learning_log').select('what,kind,while_doing').order('created_at', { ascending: false }).limit(40);
      var seen = {}, out = [];
      (r.data || []).forEach(function(x){ var k = String(x.what || '').trim(); if (!k || seen[k.toLowerCase()]) return; seen[k.toLowerCase()] = 1; out.push(x); });
      this.recent = out.slice(0, 6);
      var box = this.el.querySelector('#ll-recent'); if (!box) return;
      box.innerHTML = this.recent.map(function(x){ return '<button type="button" class="p" data-k="' + att(x.what) + '" data-kind="' + att(x.kind || '') + '" data-doing="' + att(x.while_doing || '') + '">' + esc(x.what) + '</button>'; }).join('');
    } catch (e) {}
  };
  Form.prototype.say = function(msg, cls){ var w = this.el.querySelector('#ll-why'); if (!w) return; w.textContent = msg || ''; w.className = 'why' + (cls ? ' ' + cls : ''); };
  Form.prototype.save = async function(){
    var self = this, o = this.opts, go = this.el.querySelector('#ll-go');
    var what = String(this.el.querySelector('#ll-what').value || '').trim();
    if (!what && !this.kind) { this.say('Say what you were learning from, or pick a kind', 'warn'); return; }
    if (!(this.mins > 0)) { this.say('How many minutes?', 'warn'); return; }
    if (this.when > today()) { this.say('Only learning that has already happened gets logged', 'warn'); return; }
    go.disabled = true; this.say('Saving...');
    var title = titleOf(what, this.kind);
    try {
      var ins = await this.sb.from('learning_log').insert({
        happened_on: this.when, start_min: o.startMin != null ? o.startMin : null, minutes: this.mins,
        time_is_guess: !!o.timeIsGuess, what: what || this.kind, kind: this.kind || null,
        while_doing: this.doing || null, takeaway: this.takeaway || null, block_id: o.blockId || null, source: o.source || 'learning-log'
      }).select('id').single();
      if (ins.error) throw ins.error;
      var habitId = await tickHabit(this.sb, this.when, this.mins, o.tracker, o.group);
      var res = { id: ins.data && ins.data.id, title: title, what: what, kind: this.kind, minutes: this.mins, whileDoing: this.doing, habitId: habitId, when: this.when };
      this.say('Logged: ' + title, 'ok');
      if (typeof o.onSaved === 'function') { try { o.onSaved(res); } catch (e) {} }
      if (!o.closeOnSave) { go.disabled = false; this.el.querySelector('#ll-what').value = ''; this.what = ''; this.takeaway = ''; this.el.querySelector('#ll-take').value = ''; this.loadRecent(); }
    } catch (e) {
      go.disabled = false;
      this.say('Could not save: ' + (e && e.message ? e.message : e), 'warn');
    }
  };

  function mount(el, opts){ css(); el.classList.add('pyll', opts && opts.auto === false ? 'pyll-light' : 'pyll-auto'); var f = new Form(el, opts || {}); f.draw(); return f; }

  function open(opts){
    css();
    var old = document.getElementById('pyll-ov'); if (old) old.remove();
    var ov = document.createElement('div'); ov.className = 'pyll-ov'; ov.id = 'pyll-ov';
    var card = document.createElement('div'); card.className = 'pyll pyll-card';
    var x = document.createElement('button'); x.className = 'pyll-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
    var inner = document.createElement('div');
    card.appendChild(x); card.appendChild(inner); ov.appendChild(card);
    document.body.appendChild(ov);
    var done = false;
    function close(){ if (done) return; done = true; ov.remove(); document.removeEventListener('keydown', onKey); if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) {} } }
    function onKey(e){ if (e.key === 'Escape') close(); }
    x.onclick = close;
    ov.addEventListener('mousedown', function(e){ if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    var o = Object.assign({}, opts, { closeOnSave: true, onSaved: function(res){
      if (typeof opts.onSaved === 'function') { try { opts.onSaved(res); } catch (e) {} }
      done = true; ov.remove(); document.removeEventListener('keydown', onKey);
    } });
    var f = new Form(inner, o);
    card.classList.add(opts.auto === false ? 'pyll-light' : 'pyll-auto');
    f.draw();
    return { close: close, form: f };
  }

  return { mount: mount, open: open, tickHabit: tickHabit, kindIn: kindIn, version: '1.1' };
})();
