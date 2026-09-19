/* social-log.js - THE ONE social log form. Project YOU, Sep 16 2026.

   Scott: "I want to be able to add a social event from Todays Tasks' calendar,
   cue cards, the calendar etc." So the compact form built on Social Fitness v2.8
   lives here once, and every page that wants it loads this file:

     PYSocial.mount(el, opts)  draws the form inside el (Social Fitness does this)
     PYSocial.open(opts)       draws it in a pop-up sheet (Todays Tasks, Calendar)

   opts: sb (Supabase client, required), when (YYYY-MM-DD), startMin (minutes after
   midnight, optional; timeIsGuess:true when a page picked the slot itself, so it
   does not turn a tap into a plan), mins (length, optional), title (an event title to read a
   name and a kind from), showSoon, showRecent, onSaved(result), onClose().

   WHAT A SAVE DOES
   - Already happened (a past day, or today at or before now): a row in
     connections (who, what, where, note), a lasting note in person_notes if
     "Keep on their card" is ticked, and the "Social" habit is ticked for that
     day - today through the live habit row (its trigger files qs_log), a past
     day straight into qs_log, the same shape backfill.js writes.
   - Still to come (a later day, or later today): a to-do under Social Well-Being
     for that day. It files itself into connections the day it is ticked, which is
     the rule Todays Tasks already follows. Nothing is tracked before it happens.

   Change the form here and every page gets the change. Do not copy it into a page.

   v2.0, Sep 19 2026, Scott's changes:
   - Every pill now comes from public.social_pills rather than from this file, so
     one added here is there tomorrow. The lists below are only the fallback for
     when that table cannot be read.
   - Every row has a + on the end. Type a name, and it asks once whether to keep
     it as a permanent pill or use it just this time.
   - A new SOURCE row after IS: Outreach if he reached out, Inbound if it came to
     him. Saved on the connection as `direction`.
   - IS gained Friend and Barista Style Exchange.

   v2.1, Sep 19 2026: every row also has a pencil next to its +. Tap it and the
   pills on that row grow a small grey x, so a tap removes instead of selects.
   Removing only switches the pill off; it stays on the entries that already used
   it, and an Undo sits under the row for as long as the form is open. Scott asked
   for an x on every pill; it lives behind the pencil because these pills are
   12 pixels tall and an always-there x would be hit by a thumb aiming to select.

   v2.2, Sep 19 2026, "Log Social Moment". Scott's reconciliation of the two forms:
   - RENAMED. The form is now Log Social Moment everywhere.
   - ONE WORD LIST. Every pill now comes from public.people_vocab (read through
     v_people_vocab), the same list the Social page's editor reads. The old
     social_pills table is retired. The bug this fixes: this form used to save
     "Lunch" while the Social page only knew "lunch", so anything logged here
     showed as "(retired)" over there. Occasions are lowercase now, and the
     Social page gained Meeting; this form gained Breakfast, Get Together and
     Creative Event. A + pill is kept into people_vocab, and the pencil's remove
     switches it off there, so both forms always agree.
   - GROUP row (coloured, the year-grid colours the Social page uses) and a
     CIRCLE row that only appears for a new or untagged person. Both are carried
     from the person's last entry, so a regular still logs in three taps. */
window.PYSocial = (function () {
  'use strict';

  /* the fallback set. The real one is people_vocab; this only shows if that
     list cannot be read, so the form still works rather than coming up empty. */
  var DEFAULTS = {
    is:     [['family','Family'],['friend','Friend'],['colleague','Colleague'],['ex-colleague','Ex-Colleague'],
             ['industry','Industry'],['group','Group'],['barista-style','Barista Style Exchange']],
    source: [['outreach','Outreach'],['inbound','Inbound']],
    what:   [['breakfast','Breakfast'],['coffee','Coffee'],['lunch','Lunch'],['dinner','Dinner'],['drinks','Drinks'],
             ['party','Party'],['get together','Get Together'],['creative event','Creative Event'],['call','Call'],
             ['text','Text'],['walk','Walk'],['meeting','Meeting'],['other','Other']],
    where:  [['Home','Home'],['Coffee shop','Coffee shop'],['Restaurant','Restaurant'],['Office','Office'],
             ['Outdoors','Outdoors'],['Event','Event'],['Phone / video','Phone / video']],
    group:  [['my family','My Family',{color:'#bfbdfb'}],['extended family','Extended Family',{color:'#cdd4ff'}],
             ['personal friend','Personal Friend',{color:'#c5ebff'}],['old greenwich','Old Greenwich',{color:'#f5e992'}],
             ['creative social','Creative Social',{color:'#eed7f0'}],['work related','Work Related',{color:'#fed8b4'}],
             ['ex work','Ex Work',{color:'#c4dfc6'}],['tribe','Tribe',{color:'#44c1ff'}],['mom','Mom',{color:'#c9d0da'}]],
    circle: [['inner','Inner 5',{}],['middle','Middle 15',{}],['affinity','Affinity',{}],['outer','Outer',{}]]
  };
  var FIELDS = ['is','source','what','where','group','circle'];
  /* how this form's rows map onto the one shared list */
  var DIM = { is:'label', source:'source', what:'occasion', where:'where', group:'social_group', circle:'circle' };
  var PILLS = null;
  function emptyPills(){ return { is:[], source:[], what:[], where:[], group:[], circle:[] }; }
  async function loadPills(sb){
    if (PILLS) return PILLS;
    var out = emptyPills();
    try {
      var r = await sb.from('v_people_vocab').select('dimension,value,label,sort_order,meta').eq('active', true)
        .order('sort_order', { ascending: true });
      (r.data || []).forEach(function(x){
        FIELDS.forEach(function(f){
          if (DIM[f] !== x.dimension) return;
          var lab = x.label, m = x.meta || {};
          if (f === 'circle' && m.n) lab = lab + ' ' + m.n;
          out[f].push([x.value, lab, m]);
        });
      });
    } catch (e) {}
    FIELDS.forEach(function(f){ if (!out[f].length) out[f] = DEFAULTS[f].slice(); });
    PILLS = out;
    return out;
  }
  function pillsFor(f){ return (PILLS && PILLS[f] && PILLS[f].length) ? PILLS[f] : (DEFAULTS[f] || []); }
  function pillLabel(f, v){
    var l = pillsFor(f);
    for (var i = 0; i < l.length; i++) if (l[i][0] === v) return l[i][1];
    return v;
  }
  function slug(t){
    return String(t||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);
  }
  var KINDS  = DEFAULTS.what.map(function(x){ return x[0]; });
  var PLACES = DEFAULTS.where.map(function(x){ return x[0]; });
  var HABIT_TRACKER = 'Social', HABIT_GROUP = 'Social Well-Being';
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  /* ---------- small helpers ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function att(s){ return esc(s).replace(/"/g,'&quot;'); }
  function today(){
    if (window.PY && typeof window.PY.today === 'function') { try { return window.PY.today(); } catch (e) {} }
    var n = new Date(), e = new Date(n.toLocaleString('en-US', { timeZone: 'America/New_York' }));
    if (e.getHours() < 2) e.setDate(e.getDate() - 1);
    return e.getFullYear() + '-' + String(e.getMonth()+1).padStart(2,'0') + '-' + String(e.getDate()).padStart(2,'0');
  }
  function shift(d, n){
    var p = d.split('-').map(Number), x = new Date(Date.UTC(p[0], p[1]-1, p[2], 12));
    x.setUTCDate(x.getUTCDate() + n);
    return x.getUTCFullYear() + '-' + String(x.getUTCMonth()+1).padStart(2,'0') + '-' + String(x.getUTCDate()).padStart(2,'0');
  }
  function shortD(d){ var p = String(d||'').split('-'); if (p.length < 3) return d || ''; return MON[+p[1]-1] + ' ' + (+p[2]) + ', ' + p[0]; }
  function nowMin(){
    var e = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/New_York' }));
    var m = e.getHours()*60 + e.getMinutes();
    return e.getHours() < 2 ? m + 1440 : m;   /* after midnight still belongs to the day before */
  }
  function hhmm(m){ m = ((m|0)+1440) % 1440; var h = Math.floor(m/60), mm = m % 60, ap = h >= 12 ? 'pm' : 'am'; h = h % 12 || 12; return h + (mm ? ':' + String(mm).padStart(2,'0') : '') + ap; }
  function channelFor(k){ k = String(k||'').toLowerCase(); return k === 'call' ? 'phone' : (k === 'text' ? 'text' : 'in person'); }
  function tidyName(s){
    var t = String(s||'').trim(), note = '';
    var d = t.split(/\s+[-–—]\s+/);
    if (d.length > 1) { t = d[0].trim(); note = d.slice(1).join(' - ').trim(); }
    t = t.replace(/^(?:chat|call|ring|talk|catch\s*up|coffee|lunch|dinner|breakfast|drinks|walk|meeting|party|text|message|email)\s+with\s+/i, '');
    t = t.replace(/^(?:with|at|the)\s+/i, '');
    return { name: t.trim(), note: note };
  }
  /* the same reading of a line Todays Tasks does */
  function nameIn(s){
    var t = String(s||'').trim().replace(/\s*[-:]\s*/, ' with ');
    var m = t.match(/\bwith\s+(.+)$/i);
    if (!m) m = t.match(/^(?:call|ring|text|email|message|meet|see|visit)\s+(.+)$/i);
    if (!m) m = t.match(/^(?:lunch|dinner|breakfast|coffee|drinks|walk|meeting|party)\s+(.+)$/i);
    if (!m) return { person: '', others: '' };
    var rest = m[1].replace(/^\s*(?:at|the)\s+/i, '').replace(/[.;]+$/, '').trim();
    var parts = rest.split(/\s*(?:,|\band\b|&|\+)\s*/i).map(function(x){ return x.trim(); }).filter(Boolean);
    var VAGUE = /^(someone|somebody|anyone|anybody|people|a friend|friends|the team|everyone)$/i;
    var named = parts.filter(function(x){ return !VAGUE.test(x); });
    return { person: named[0] || '', others: named.slice(1).join(', ') };
  }
  function kindIn(s){
    var t = String(s||'');
    return /lunch/i.test(t)?'lunch':/coffee/i.test(t)?'coffee':/dinner/i.test(t)?'dinner'
      :/breakfast/i.test(t)?'breakfast':/drinks/i.test(t)?'drinks':/\bwalk\b/i.test(t)?'walk'
      :/\bparty\b/i.test(t)?'party':/\b(call|ring|zoom|phone)\b/i.test(t)?'call'
      :/\b(text|message|whatsapp)\b/i.test(t)?'text':'meeting';
  }
  function kindPill(s){
    if (!s) return '';
    var k = kindIn(s);
    var l = pillsFor('what');
    for (var i = 0; i < l.length; i++) if (String(l[i][0]).toLowerCase() === k) return l[i][0];
    return '';
  }
  function placeParts(p){
    var s = String(p||''), i = s.indexOf(' · ');
    if (i > -1) return { pill: s.slice(0, i), typed: s.slice(i+3) };
    var known = pillsFor('where').some(function(x){ return x[0] === s; });
    return known ? { pill: s, typed: '' } : { pill: '', typed: s };
  }

  /* ---------- the habit tick ---------- */
  async function tickHabit(sb, date, minutes){
    var DAY = today();
    try {
      if (date === DAY) {
        var r = await sb.from('todos').select('id,done').eq('is_habit', true).eq('tracker', HABIT_TRACKER).limit(1);
        var row = r.data && r.data[0];
        if (!row) return null;
        if (!row.done) {
          var now = new Date().toISOString();
          await sb.from('todos').update({ done: true, status: 'done', done_at: now, completed_at: now,
            actual_minutes: minutes || null, for_date: DAY, updated_at: now }).eq('id', row.id);
        }
        return row.id;
      }
      if (date < DAY) {
        await sb.from('qs_log').upsert([{ date: date, group: HABIT_GROUP, tracker: HABIT_TRACKER, value: 1, unit: 'done',
          minutes: minutes || null, minutes_estimated: !minutes, status: 'done', source: 'habit-bandit',
          logged_at: new Date().toISOString(), note: 'Logged from the social log on ' + DAY }], { onConflict: 'date,tracker,source' });
      }
    } catch (e) {}
    return null;
  }

  /* ---------- the look, scoped to .pysl so it sits inside any page ---------- */
  function css(){
    if (document.getElementById('pysl-css')) return;
    var s = document.createElement('style'); s.id = 'pysl-css';
    s.textContent = [
      '.pysl{--sl-bg:#fff;--sl-soft:#f4f6fa;--sl-line:#e3e7ee;--sl-ink:#26313a;--sl-ink2:#5b6270;--sl-mut:#8b949b;--sl-blue:#4a7fa8;--sl-tag:#4d5a64;--sl-good:#3f7d5c;--sl-warm:#c06a35;',
      ' color:var(--sl-ink);font:13px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif;text-align:left}',
      '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .pysl.pysl-auto{--sl-bg:#1e2328;--sl-soft:#242a30;--sl-line:#333a41;--sl-ink:#e8eaec;--sl-ink2:#bcc3c9;--sl-mut:#8b949b;--sl-blue:#6f9fc6;--sl-tag:#8b97a1;--sl-good:#5fae7e;--sl-warm:#e29a63}}',
      '.pysl *{box-sizing:border-box}',
      '.pysl h3{font-size:16px;font-weight:700;margin:0 0 8px;letter-spacing:-.01em}',
      '.pysl .sl-at{font-size:11px;font-weight:600;color:var(--sl-mut);margin-left:6px}',
      '.pysl .fld{display:grid;grid-template-columns:40px minmax(0,1fr);column-gap:6px;row-gap:3px;align-items:start;margin:0 0 5px}',
      '.pysl .fld>.lab{grid-column:1;padding-top:2px;font-size:9px;font-weight:700;letter-spacing:.06em;line-height:12px;text-transform:uppercase;color:var(--sl-mut)}',
      '.pysl .fld>*:not(.lab){grid-column:2;min-width:0}',
      '.pysl .picks{display:flex;gap:3px;flex-wrap:nowrap;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}',
      '.pysl .picks::-webkit-scrollbar{display:none}',
      '.pysl .p{flex:none;white-space:nowrap;font:inherit;font-size:10px;line-height:12px;padding:0 6px;cursor:pointer;border:1px solid var(--sl-line);border-radius:99px;background:var(--sl-bg);color:var(--sl-ink2)}',
      '.pysl .p:hover{border-color:var(--sl-blue)}',
      '.pysl .p.on{background:var(--sl-blue);border-color:var(--sl-blue);color:#fff;font-weight:700}',
      '.pysl .tags .p.on{background:var(--sl-tag);border-color:var(--sl-tag)}',
      /* Group pills wear the year-grid colours the Social page uses; a chosen one
         gets a ring rather than the blue fill, so the colour stays readable. */
      '.pysl .p.gp{border-color:transparent;color:#2b3348}',
      '.pysl .p.gp.on{color:#1f2a44;border-color:transparent;box-shadow:0 0 0 2px #6f8fae;font-weight:700}',
      '.pysl .circ .p.on{background:var(--sl-tag);border-color:var(--sl-tag)}',
      '.pysl .fld[hidden]{display:none}',
      '.pysl .recent .p{color:var(--sl-blue)}',
      '.pysl .used .p{border-style:dashed;color:var(--sl-blue)}',
      '.pysl input[type=text],.pysl input[type=date],.pysl textarea{width:100%;font:inherit;font-size:16px;line-height:1.25;padding:3px 8px;border:1px solid var(--sl-line);border-radius:7px;background:var(--sl-soft);color:var(--sl-ink)}',
      '@media (hover:hover) and (pointer:fine){.pysl input[type=text],.pysl input[type=date],.pysl textarea{font-size:13px}}',
      '.pysl input:focus-visible,.pysl textarea:focus-visible{outline:2px solid var(--sl-blue);outline-offset:1px}',
      '.pysl textarea{height:28px;resize:vertical}.pysl textarea:focus{height:60px}',
      '.pysl .pair{display:flex;gap:4px}',
      '.pysl .why{margin:0;font-size:11px;line-height:1.3;color:var(--sl-mut)}',
      '.pysl .why:empty{display:none}',
      '.pysl .why.warn{color:var(--sl-warm)}.pysl .why.ok{color:var(--sl-good);font-weight:600}',
      '.pysl .pnote{padding:3px 8px;font-size:11.5px;border-left:3px solid var(--sl-blue);background:var(--sl-soft);border-radius:0 7px 7px 0;color:var(--sl-ink2)}',
      '.pysl .pnote b{color:var(--sl-ink)}',
      '.pysl .keep{display:flex;gap:5px;align-items:center;font-size:11px;color:var(--sl-ink2);cursor:pointer}',
      '.pysl .keep input{margin:0}',
      '.pysl .go{width:100%;margin-top:3px;padding:7px;border:0;border-radius:8px;background:var(--sl-good);color:#fff;font:inherit;font-size:14px;font-weight:700;cursor:pointer}',
      '.pysl .go.plan{background:var(--sl-blue)}.pysl .go:disabled{opacity:.6}',
      '.pysl .msg{margin:5px 0 0;font-size:12px;color:var(--sl-mut)}.pysl .msg:empty{display:none}',
      '.pysl .msg.warn{color:var(--sl-warm)}.pysl .msg.ok{color:var(--sl-good);font-weight:600}',
      '.pysl .list{margin:10px 0 0;padding-top:8px;border-top:1px solid var(--sl-line)}',
      '.pysl .list h4{font-size:12px;font-weight:700;margin:0 0 3px}',
      '.pysl .row{display:flex;align-items:center;gap:6px;padding:3px 0;font-size:12px;line-height:1.35;border-bottom:1px solid var(--sl-line)}',
      '.pysl .row:last-child{border-bottom:0}',
      '.pysl .row .what{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
      '.pysl .row .meta,.pysl .row .nt{margin-left:6px;font-size:11px;color:var(--sl-mut)}.pysl .row .nt{font-style:italic;color:var(--sl-ink2)}',
      '.pysl .row .sp{display:flex;gap:4px;flex:none}',
      '.pysl .row button{font:inherit;font-size:10px;line-height:12px;padding:1px 7px;cursor:pointer;border:1px solid var(--sl-line);border-radius:99px;background:var(--sl-bg);color:var(--sl-ink2)}',
      '.pysl .past .row{flex-wrap:wrap}',
      '.pysl .addn{width:100%;display:none;margin-top:3px}.pysl .addn.open{display:block}',
      /* the + on the end of every row, and the little strip it opens */
      /* the rows scroll sideways, so the + and the pencil are pinned to the right
         edge. A control you have to scroll to find is a control you do not have. */
      '.pysl .pends{position:sticky;right:0;z-index:2;flex:none;display:flex;gap:3px;padding-left:5px;background:var(--sl-bg);box-shadow:-9px 0 9px -6px rgba(0,0,0,.18)}',
      '.pysl .p.padd{font-weight:700;color:var(--sl-blue);border-style:dashed;padding:0 7px}',
      '.pysl .p.ptidy{font-weight:700;color:var(--sl-ink2);border-style:solid;padding:0 7px}',
      '.pysl .p.ptidy.on{background:var(--sl-blue);border-style:solid;border-color:var(--sl-blue);color:#fff}',
      '.pysl .p .xx{margin-left:4px;font-weight:700;color:var(--sl-mut)}',
      '.pysl .p.rm{border-style:dashed;border-color:var(--sl-warm);color:var(--sl-ink2)}',
      '.pysl .p.rm:hover{border-color:var(--sl-warm);background:var(--sl-soft)}',
      '.pysl .addp{display:flex;gap:4px;margin-top:3px}',
      '.pysl .addp[hidden]{display:none}',
      '.pysl .addp input{flex:1;min-width:0}',
      '.pysl .addp .ago{flex:none;padding:0 9px}',
      '.pysl .keepq{margin-top:3px}',
      '.pysl .keepq[hidden]{display:none}',
      '.pysl .keepq button{font:inherit;font-size:10px;line-height:12px;padding:1px 7px;margin-left:5px;cursor:pointer;border:1px solid var(--sl-line);border-radius:99px;background:var(--sl-bg);color:var(--sl-ink2)}',
      '.pysl .keepq button.yes{background:var(--sl-good);border-color:var(--sl-good);color:#fff;font-weight:700}',
      '.pysl .addn textarea{height:44px}.pysl .addn .sp{margin-top:4px}',
      '.pysl-ov{position:fixed;inset:0;z-index:10000;background:rgba(20,24,30,.38);display:flex;align-items:flex-start;justify-content:center;padding:6vh 12px 12px;overflow:auto}',
      '.pysl-ov .pysl-card{position:relative;width:100%;max-width:440px;background:var(--sl-bg);border:1px solid var(--sl-line);border-radius:14px;padding:12px 14px;box-shadow:0 18px 50px rgba(0,0,0,.28)}',
      '.pysl-ov .pysl-x{position:absolute;top:8px;right:10px;border:0;background:none;font-size:20px;line-height:1;color:var(--sl-mut);cursor:pointer;padding:2px 4px}'
    ].join('\n');
    (document.head || document.documentElement).appendChild(s);
  }

  /* ---------- one form ---------- */
  function Form(box, o){
    this.box = box; this.o = o || {}; this.sb = this.o.sb;
    var DAY = today();
    this.when = this.o.when || DAY;
    var guess = this.o.title ? nameIn(this.o.title) : { person: '', others: '' };
    this.kind = kindPill(this.o.title);
    this.who0 = guess.person; this.with0 = guess.others;
    this.place = ''; this.labels = []; this.labelsTouched = false; this.source = '';
    this.tidy = { is:false, source:false, what:false, where:false, group:false }; this.lastRm = null;
    this.group = ''; this.circle = ''; this.groupTouched = false; this.circleTouched = false;
    this.known = []; this.loaded = false; this.timer = null;
  }
  Form.prototype.isFuture = function(){
    var DAY = today();
    if (this.when > DAY) return true;
    if (this.when === DAY && this.o.startMin != null && !this.o.timeIsGuess && this.o.startMin > nowMin()) return true;
    return false;
  };
  Form.prototype.$ = function(sel){ return this.box.querySelector(sel); };
  Form.prototype.carry = function(name){
    var n = String(name||'').trim().toLowerCase();
    for (var i = 0; i < this.known.length; i++) {
      var k = this.known[i];
      if (String(k.person||'').trim().toLowerCase() === n || String(k.person_key||'').trim().toLowerCase() === n) return k;
    }
    return null;
  };
  Form.prototype.load = async function(){
    try { await loadPills(this.sb); } catch (e) {}
    try {
      var r = await this.sb.from('connections')
        .select('id,person,person_key,circle,social_group,labels,age_band,entity_type,happened_on,kind,place,notes,planned')
        .eq('superseded', false).order('happened_on', { ascending: false }).limit(400);
      this.known = r.data || [];
    } catch (e) { this.known = []; }
    this.loaded = true;
  };
  /* One row of pills, drawn from the live list, with the + on the end. Used at
     draw time and again whenever a row needs repainting, so there is one place
     that decides what a row looks like. */
  Form.prototype.picksHtml = function(field){
    var self = this;
    var attr = { is:'data-l', source:'data-src', what:'data-k', where:'data-pl', group:'data-g', circle:'data-c' }[field];
    function isOn(v){
      if (field === 'is')     return self.labels.indexOf(v) > -1;
      if (field === 'source') return self.source === v;
      if (field === 'what')   return self.kind === v;
      if (field === 'group')  return self.group === v;
      if (field === 'circle') return self.circle === v;
      return self.place === v;
    }
    var tidy = !!this.tidy[field];
    var pills = pillsFor(field).map(function(x){
      /* in tidy mode the pill carries the remove attributes instead of the select
         one, so the same tap cannot do both things */
      if (tidy) {
        return '<button type="button" class="p rm" data-rmf="' + att(field) + '" data-rmv="' + att(x[0]) + '">' +
          esc(x[1]) + '<span class="xx">&times;</span></button>';
      }
      var m = x[2] || {}, col = (field === 'group' && m.color) ? m.color : '';
      return '<button type="button" class="p' + (col ? ' gp' : '') + (isOn(x[0]) ? ' on' : '') + '" ' + attr + '="' + att(x[0]) + '"' +
        (col ? ' style="background:' + att(col) + '"' : '') + (m.hint || m.quip ? ' title="' + att(m.hint || m.quip) + '"' : '') + '>' + esc(x[1]) + '</button>';
    }).join('');
    if (field === 'circle') return pills;   /* the four circles are fixed: no +, no pencil */
    return pills +
      '<span class="pends">' +
        '<button type="button" class="p padd" data-add="' + field + '" title="Add one of your own">+</button>' +
        '<button type="button" class="p ptidy' + (tidy ? ' on' : '') + '" data-tidy="' + att(field) + '" title="' +
          (tidy ? 'Finished removing' : 'Remove ones you do not use') + '">' + (tidy ? 'Done' : 'Edit') + '</button>' +
      '</span>';
  };
  Form.prototype.addHtml = function(field){
    return '<div class="addp" data-af="' + field + '" hidden>' +
      '<input type="text" class="ap" placeholder="Name it" autocomplete="off">' +
      '<button type="button" class="p ago" data-ago="' + field + '">Add</button></div>' +
      '<p class="why keepq" data-kq="' + field + '" hidden></p>';
  };
  Form.prototype.repaint = function(field){
    var c = this.box.querySelector('[data-picks="' + field + '"]');
    if (c) c.innerHTML = this.picksHtml(field);
  };
  Form.prototype.names = function(max){
    var seen = {}, out = [];
    for (var i = 0; i < this.known.length && (!max || out.length < max); i++) {
      var k = this.known[i], p = String(k.person||'').trim();
      if (!p || seen[p] || (k.entity_type && k.entity_type !== 'person')) continue;
      seen[p] = 1; out.push(p);
    }
    return out;
  };
  Form.prototype.usedPlaces = function(){
    var seen = {}, out = [];
    for (var i = 0; i < this.known.length && out.length < 5; i++) {
      var t = placeParts(this.known[i].place).typed.trim();
      if (!t || seen[t.toLowerCase()]) continue; seen[t.toLowerCase()] = 1; out.push(t);
    }
    return out;
  };
  Form.prototype.draw = async function(msg, cls){
    var self = this, o = this.o, box = this.box, DAY = today();
    css();
    box.classList.add('pysl');
    if (o.auto !== false) box.classList.add('pysl-auto');
    var s = null;
    try { s = await this.sb.auth.getSession(); } catch (e) {}
    if (!(s && s.data && s.data.session)) {
      box.innerHTML = '<h3>Log Social Moment</h3><p class="why warn">Sign in on this page first. Your social log is private.</p>';
      return;
    }
    if (!this.loaded) await this.load();
    var soon = [];
    if (o.showSoon) {
      try {
        var q = await this.sb.from('todos').select('id,task,for_date').eq('section', 'Social Well-Being').eq('done', false)
          .order('for_date', { ascending: true, nullsFirst: false });
        soon = q.data || [];
      } catch (e) {}
    }
    var fut = this.isFuture();
    var ww = function(d){ return d === DAY ? 'today' : d === shift(DAY,-1) ? 'yesterday' : d === shift(DAY,1) ? 'tomorrow' : shortD(d); };
    var quick = [DAY, shift(DAY,-1), shift(DAY,1)];
    var h = '<h3>Log Social Moment' + (o.startMin != null ? '<span class="sl-at">' + esc(shortD(this.when)) + ' · ' + esc(hhmm(o.startMin)) + '</span>' : '') + '</h3>' +
      '<div class="fld"><span class="lab">Who</span>' +
        '<input type="text" class="sl-who" list="sl-names" placeholder="A first name is enough" autocomplete="off" value="' + att(this.who0) + '">' +
        '<datalist id="sl-names">' + this.names().map(function(n){ return '<option value="' + att(n) + '">'; }).join('') + '</datalist>' +
        (this.names(6).length ? '<div class="picks recent">' + this.names(6).map(function(n){ return '<button type="button" class="p" data-who="' + att(n) + '">' + esc(n) + '</button>'; }).join('') + '</div>' : '') +
      '</div>' +
      '<div class="fld"><span class="lab">Is</span><div class="picks tags" data-picks="is">' + this.picksHtml('is') +
        '</div>' + this.addHtml('is') + '<p class="why sl-whonote"></p><div class="pnote" hidden></div></div>' +
      '<div class="fld"><span class="lab">Group</span><div class="picks" data-picks="group">' + this.picksHtml('group') +
        '</div>' + this.addHtml('group') + '</div>' +
      /* Circle only shows for a new or untagged person; a regular already has one. */
      '<div class="fld sl-circle"' + (this.needsCircle() ? '' : ' hidden') + '><span class="lab">Circle</span><div class="picks circ" data-picks="circle">' + this.picksHtml('circle') +
        '</div></div>' +
      '<div class="fld"><span class="lab">Source</span><div class="picks" data-picks="source">' + this.picksHtml('source') +
        '</div>' + this.addHtml('source') + '</div>' +
      '<div class="fld"><span class="lab">What</span><div class="picks sl-kinds" data-picks="what">' + this.picksHtml('what') +
      '</div>' + this.addHtml('what') + '</div>' +
      '<div class="fld"><span class="lab">When</span><div class="picks sl-when">' +
        '<button type="button" class="p' + (this.when === DAY ? ' on' : '') + '" data-w="0">Today</button>' +
        '<button type="button" class="p' + (this.when === shift(DAY,-1) ? ' on' : '') + '" data-w="-1">Yesterday</button>' +
        '<button type="button" class="p' + (this.when === shift(DAY,1) ? ' on' : '') + '" data-w="1">Tomorrow</button>' +
        '<button type="button" class="p' + (quick.indexOf(this.when) < 0 ? ' on' : '') + '" data-w="pick">' + (quick.indexOf(this.when) < 0 ? esc(shortD(this.when)) : 'Pick date') + '</button>' +
        '</div><input type="date" class="sl-date" value="' + att(this.when) + '"' + (quick.indexOf(this.when) > -1 ? ' style="display:none"' : '') + '></div>' +
      '<div class="fld"><span class="lab">Where</span><div class="picks sl-where" data-picks="where">' + this.picksHtml('where') + '</div>' + this.addHtml('where') +
        (this.usedPlaces().length ? '<div class="picks used">' + this.usedPlaces().map(function(x){ return '<button type="button" class="p" data-used="' + att(x) + '">' + esc(x) + '</button>'; }).join('') + '</div>' : '') +
        '<div class="pair"><input type="text" class="sl-place" placeholder="Where exactly?" autocomplete="off">' +
        '<input type="text" class="sl-with" placeholder="Anyone else?" autocomplete="off" value="' + att(this.with0) + '"></div></div>' +
      '<div class="fld"><span class="lab">Note</span><textarea class="sl-note" rows="1" placeholder="How it went"></textarea>' +
        '<label class="keep"><input type="checkbox" class="sl-keep"> Keep on their card</label></div>' +
      '<button type="button" class="go' + (fut ? ' plan' : '') + '">' + (fut ? 'Add to what is coming up' : 'Log it') + '</button>' +
      '<p class="msg' + (cls ? ' ' + cls : '') + '">' + esc(msg || '') + '</p>';

    if (o.showSoon && soon.length) {
      h += '<div class="list soon"><h4>Coming up</h4>' + soon.map(function(r){
        var w = r.for_date ? ((r.for_date < DAY ? 'was ' : '') + ww(r.for_date)) : 'no date';
        return '<div class="row" data-id="' + att(r.id) + '"><span class="what">' + esc(r.task || '') + '<span class="meta">' + esc(w) + '</span></span>' +
          '<span class="sp"><button class="yes">It happened</button><button class="no">Did not</button></span></div>';
      }).join('') + '</div>';
    }
    if (o.showRecent) {
      var past = this.known.filter(function(k){ return k.id && !k.planned && k.happened_on && k.happened_on <= DAY && (!k.entity_type || k.entity_type === 'person'); }).slice(0, 6);
      if (past.length) {
        h += '<div class="list past"><h4>Recently logged</h4>' + past.map(function(k){
          var meta = [ww(k.happened_on), k.place].filter(Boolean).join(' · ');
          return '<div class="row" data-cid="' + att(k.id) + '" data-who="' + att(k.person || '') + '">' +
            '<span class="what">' + esc((k.kind ? (k.kind.charAt(0).toUpperCase() + k.kind.slice(1)) : 'Time') + ' with ' + (k.person || '')) +
              '<span class="meta">' + esc(meta) + '</span>' + (k.notes ? '<span class="nt">' + esc(k.notes) + '</span>' : '') + '</span>' +
            '<span class="sp"><button class="an">Add note</button></span>' +
            '<div class="addn"><textarea placeholder="Add to the note"></textarea>' +
              '<label class="keep"><input type="checkbox" class="ak"> Also keep this on ' + esc(k.person || 'their') + '’s card</label>' +
              '<div class="sp"><button class="sv">Save note</button><button class="cx">Cancel</button></div></div></div>';
        }).join('') + '</div>';
      }
    }
    box.innerHTML = h;
    this.wire();
    if (this.who0) this.showCarry();
  };
  Form.prototype.paintTags = function(){ this.repaint('is'); };
  /* The Circle row earns its place only for someone new or never circled. */
  Form.prototype.needsCircle = function(){
    var w = this.$('.sl-who'), raw = String((w ? w.value : this.who0) || '').trim();
    if (!raw) return false;
    if (this.circleTouched) return true;
    var c = this.carry(tidyName(raw).name);
    return !(c && c.circle);
  };
  Form.prototype.showCircle = function(){
    var row = this.$('.sl-circle'); if (!row) return;
    row.hidden = !this.needsCircle();
  };
  Form.prototype.refreshGo = function(){
    var g = this.$('.go'); if (!g) return;
    var fut = this.isFuture();
    g.textContent = fut ? 'Add to what is coming up' : 'Log it';
    g.classList.toggle('plan', fut);
  };
  Form.prototype.showCarry = function(){
    var self = this, w = this.$('.sl-who'), note = this.$('.sl-whonote'); if (!w || !note) return;
    note.className = 'why sl-whonote';
    var raw = String(w.value || '').trim();
    if (!raw) {
      if (!this.labelsTouched) { this.labels = []; this.paintTags(); }
      if (!this.groupTouched)  { this.group = '';  this.repaint('group'); }
      if (!this.circleTouched) { this.circle = ''; this.repaint('circle'); }
      this.showCircle(); note.textContent = ''; this.personNote(''); return;
    }
    var tn = tidyName(raw), c = this.carry(tn.name), line = '';
    /* Group and Circle ride along from the person's last entry unless he tapped them */
    if (!this.groupTouched)  { this.group  = (c && c.social_group) || ''; this.repaint('group'); }
    if (!this.circleTouched) { this.circle = (c && c.circle) || '';       this.repaint('circle'); }
    this.showCircle();
    if (tn.name !== raw) line = 'Filing as ' + tn.name + (tn.note ? ', with "' + tn.note + '" as the note' : '') + '. ';
    if (this.labelsTouched && this.labels.length) {
      line += 'Filing under ' + this.labels.map(function(v){ return pillLabel('is', v); }).join(', ') + '.';
    } else if (c) {
      if (!this.labelsTouched) { this.labels = (c.labels || []).slice(); this.paintTags(); }
      line += (c.labels && c.labels.length) ? 'Known already. Tap to change.' : 'Known already, but never tagged. Tap who they are.';
    } else {
      if (!this.labelsTouched) { this.labels = []; this.paintTags(); }
      line += 'New here. Tap who they are once and it sticks.';
    }
    note.textContent = line;
    this.personNote(tn.name);
  };
  Form.prototype.personNote = function(name){
    var self = this, box = this.$('.pnote'); if (!box) return;
    clearTimeout(this.timer);
    var c = this.carry(name), key = String((c && c.person_key) || name || '').trim();
    if (!key) { box.hidden = true; box.innerHTML = ''; return; }
    this.timer = setTimeout(async function(){
      try {
        var r = await self.sb.from('person_notes').select('note,noted_on').ilike('person_key', key).order('created_at', { ascending: false }).limit(2);
        var rows = r.data || [];
        if (!rows.length) { box.hidden = true; box.innerHTML = ''; return; }
        box.innerHTML = rows.map(function(n){ return '<div><b>' + esc(shortD(n.noted_on)) + ':</b> ' + esc(n.note) + '</div>'; }).join('');
        box.hidden = false;
      } catch (e) { box.hidden = true; }
    }, 250);
  };
  Form.prototype.wire = function(){
    var self = this, box = this.box, DAY = today();
    var who = this.$('.sl-who'), date = this.$('.sl-date');
    date.addEventListener('change', function(){
      if (!date.value) return;
      self.when = date.value;
      var ws = self.$('.sl-when'); ws.querySelectorAll('.p').forEach(function(x){ x.classList.remove('on'); });
      var pk = ws.querySelector('[data-w="pick"]'); pk.classList.add('on'); pk.textContent = shortD(self.when);
      self.refreshGo();
    });
    who.addEventListener('input', function(){ self.labelsTouched = false; self.showCarry(); });
    who.addEventListener('change', function(){ self.labelsTouched = false; self.showCarry(); });
    if (this.wired) return;   /* the box keeps one click listener across redraws */
    this.wired = true;
    box.addEventListener('click', function(e){
      var DAY = today(), who = self.$('.sl-who'), date = self.$('.sl-date');
      var b = e.target.closest('button'); if (!b || !box.contains(b)) return;
      var grp = b.parentNode;   /* kept for the older handlers below */
      if (b.hasAttribute('data-who')) { who.value = b.getAttribute('data-who'); self.labelsTouched = false; self.showCarry(); return; }
      /* + on a row: open the little strip, type a name, then it asks once whether
         to keep the pill for good or use it just this time. */
      if (b.hasAttribute('data-add')) {
        var af = b.getAttribute('data-add');
        var strip = box.querySelector('.addp[data-af="' + af + '"]');
        if (strip) { strip.hidden = !strip.hidden; if (!strip.hidden) strip.querySelector('.ap').focus(); }
        return;
      }
      if (b.hasAttribute('data-ago')) { self.addPill(b.getAttribute('data-ago')); return; }
      if (b.hasAttribute('data-tidy')) {
        var tf = b.getAttribute('data-tidy');
        self.tidy[tf] = !self.tidy[tf];
        if (!self.tidy[tf]) { var qq = box.querySelector('.keepq[data-kq="' + tf + '"]'); if (qq) { qq.hidden = true; qq.innerHTML = ''; } }
        self.repaint(tf); return;
      }
      if (b.hasAttribute('data-rmf')) { self.removePill(b.getAttribute('data-rmf'), b.getAttribute('data-rmv')); return; }
      if (b.hasAttribute('data-undo')) { self.undoRemove(); return; }
      if (b.hasAttribute('data-keepyes')) { self.keepPill(b.getAttribute('data-keepyes')); return; }
      if (b.hasAttribute('data-keepno')) {
        var kf = b.getAttribute('data-keepno');
        var q = box.querySelector('.keepq[data-kq="' + kf + '"]');
        if (q) { q.hidden = true; q.innerHTML = ''; }
        return;
      }
      if (b.hasAttribute('data-g')) {
        var gv = b.getAttribute('data-g');
        self.group = (self.group === gv) ? '' : gv; self.groupTouched = true;
        self.repaint('group'); return;
      }
      if (b.hasAttribute('data-c')) {
        var cv = b.getAttribute('data-c');
        self.circle = (self.circle === cv) ? '' : cv; self.circleTouched = true;
        self.repaint('circle'); return;
      }
      if (b.hasAttribute('data-src')) {
        var sv = b.getAttribute('data-src');
        self.source = (self.source === sv) ? '' : sv;
        self.repaint('source'); return;
      }
      if (b.hasAttribute('data-l')) {
        var v = b.getAttribute('data-l'), i = self.labels.indexOf(v);
        if (i > -1) self.labels.splice(i, 1); else self.labels.push(v);
        self.labelsTouched = true; self.paintTags(); self.showCarry(); return;
      }
      if (b.hasAttribute('data-k')) {
        self.kind = b.getAttribute('data-k');
        self.repaint('what'); return;
      }
      if (b.hasAttribute('data-w')) {
        var w = b.getAttribute('data-w');
        if (w === 'pick') { date.style.display = ''; date.focus(); if (date.showPicker) { try { date.showPicker(); } catch (x) {} } return; }
        self.when = shift(DAY, +w); date.value = self.when; date.style.display = 'none';
        grp.querySelectorAll('.p').forEach(function(x){ x.classList.toggle('on', x === b); });
        self.refreshGo(); return;
      }
      if (b.hasAttribute('data-pl')) {
        var pv = b.getAttribute('data-pl');
        self.place = (self.place === pv) ? '' : pv;
        self.repaint('where'); return;
      }
      if (b.hasAttribute('data-used')) { self.$('.sl-place').value = b.getAttribute('data-used'); return; }
      if (b.classList.contains('go')) { self.save(); return; }
      var row = b.closest('.row');
      if (row && row.closest('.soon')) { self.onSoon(b, row); return; }
      if (row && row.closest('.past')) { self.onPast(b, row); return; }
    });
  };
  /* A pill typed into the + strip. It is usable straight away; whether it lasts
     is the next question, asked once, right under the row. */
  Form.prototype.addPill = function(field){
    var box = this.box;
    var strip = box.querySelector('.addp[data-af="' + field + '"]');
    var inp = strip && strip.querySelector('.ap');
    var label = inp ? String(inp.value || '').trim() : '';
    if (!label) { if (inp) inp.focus(); return; }
    /* the Social page's list keeps its words lowercase (occasions, groups); places keep their case */
    var value = (field === 'is' || field === 'source') ? slug(label)
              : (field === 'what' || field === 'group') ? label.toLowerCase() : label;
    if (!value) { if (inp) inp.focus(); return; }
    var list = pillsFor(field);
    var already = list.some(function(x){ return x[0] === value; });
    if (!already) {
      if (!PILLS) PILLS = emptyPills();
      if (!PILLS[field] || !PILLS[field].length) PILLS[field] = DEFAULTS[field].slice();
      PILLS[field].push([value, label, {}]);
    }
    if (field === 'is') { if (this.labels.indexOf(value) < 0) this.labels.push(value); this.labelsTouched = true; }
    else if (field === 'source') this.source = value;
    else if (field === 'what')   this.kind = value;
    else if (field === 'group')  { this.group = value; this.groupTouched = true; }
    else                         this.place = value;
    inp.value = ''; strip.hidden = true;
    this.repaint(field);
    if (field === 'is') this.showCarry();
    if (already) return;
    var q = box.querySelector('.keepq[data-kq="' + field + '"]');
    if (q) {
      q.className = 'why keepq';
      q.innerHTML = 'Keep <b>' + esc(label) + '</b> on this list for next time?' +
        '<button type="button" class="yes" data-keepyes="' + att(field + '|' + value + '|' + label) + '">Keep it</button>' +
        '<button type="button" data-keepno="' + att(field) + '">Just this once</button>';
      q.hidden = false;
    }
  };
  /* Removing only switches a pill off. Anything already logged with it keeps it,
     which is why this is an update and not a delete. One Undo is held for as long
     as the form is open, so a mis-tap costs nothing. */
  Form.prototype.removePill = async function(field, value){
    var list = pillsFor(field), i = -1, label = value;
    for (var n = 0; n < list.length; n++) if (list[n][0] === value) { i = n; label = list[n][1]; }
    if (i < 0) return;
    if (!PILLS) PILLS = emptyPills();
    if (!PILLS[field] || !PILLS[field].length) PILLS[field] = DEFAULTS[field].slice();
    PILLS[field].splice(i, 1);
    this.lastRm = { field: field, value: value, label: label, at: i };
    if (field === 'is') { var li = this.labels.indexOf(value); if (li > -1) this.labels.splice(li, 1); }
    else if (field === 'source' && this.source === value) this.source = '';
    else if (field === 'what'   && this.kind   === value) this.kind = '';
    else if (field === 'where'  && this.place  === value) this.place = '';
    else if (field === 'group'  && this.group  === value) this.group = '';
    this.repaint(field);
    var q = this.box.querySelector('.keepq[data-kq="' + field + '"]');
    if (q) {
      q.className = 'why keepq';
      q.innerHTML = 'Removed <b>' + esc(label) + '</b>. It stays on anything you already logged with it.' +
        '<button type="button" class="yes" data-undo="1">Undo</button>';
      q.hidden = false;
    }
    try {
      var r = await this.sb.from('people_vocab').update({ active: false }).eq('dimension', DIM[field]).eq('value', value);
      if (r.error && q) {
        q.className = 'why keepq warn';
        q.innerHTML = 'Taken off this list, but it will be back next time. ' + esc(r.error.message || '') +
          '<button type="button" class="yes" data-undo="1">Undo</button>';
      }
    } catch (e) {}
  };
  Form.prototype.undoRemove = async function(){
    var r = this.lastRm; if (!r) return;
    this.lastRm = null;
    if (!PILLS[r.field] || !PILLS[r.field].length) PILLS[r.field] = DEFAULTS[r.field].slice();
    var already = PILLS[r.field].some(function(x){ return x[0] === r.value; });
    if (!already) PILLS[r.field].splice(Math.min(r.at, PILLS[r.field].length), 0, [r.value, r.label, {}]);
    this.repaint(r.field);
    var q = this.box.querySelector('.keepq[data-kq="' + r.field + '"]');
    if (q) { q.hidden = true; q.innerHTML = ''; }
    try { await this.sb.from('people_vocab').update({ active: true }).eq('dimension', DIM[r.field]).eq('value', r.value); } catch (e) {}
  };
  Form.prototype.keepPill = async function(spec){
    var p = String(spec || '').split('|'), field = p[0], value = p[1], label = p.slice(2).join('|');
    var q = this.box.querySelector('.keepq[data-kq="' + field + '"]');
    var sorts = pillsFor(field).length * 10 + 10;
    try {
      /* upsert, not insert: a name he used once before and turned off should come
         back on rather than fail on the unique key and read as "could not be kept". */
      var r = await this.sb.from('people_vocab')
        .upsert([{ dimension: DIM[field], value: value, label: label, sort_order: sorts, active: true,
                   meta: { note: 'added from Log Social Moment ' + today() } }],
                { onConflict: 'dimension,value' });
      if (q) {
        q.className = 'why keepq ' + (r.error ? 'warn' : 'ok');
        q.textContent = r.error ? ('That one could not be kept, so it counts for this entry only. ' + (r.error.message || '')) : 'Kept. It will be there next time.';
      }
    } catch (e) {
      if (q) { q.className = 'why keepq warn'; q.textContent = 'That one could not be kept, so it counts for this entry only.'; }
    }
  };
  Form.prototype.say = function(t, cls){ var m = this.$('.msg'); if (m) { m.textContent = t; m.className = 'msg' + (cls ? ' ' + cls : ''); } };
  Form.prototype.keepNote = function(name, text, cid){
    var c = this.carry(name) || {};
    return this.sb.from('person_notes').insert({ person_key: (c.person_key || name), note: text, noted_on: today(), connection_id: cid || null });
  };
  Form.prototype.save = async function(){
    var self = this, o = this.o, sb = this.sb, DAY = today();
    var raw = String(this.$('.sl-who').value || '').trim();
    var tn = tidyName(raw), who = tn.name;
    if (!who) { this.say('Put a name in first. A first name is enough.', 'warn'); this.$('.sl-who').focus(); return; }
    if (!this.kind) { this.say('Pick what it was.', 'warn'); return; }
    var fut = this.isFuture(), carry = this.carry(who) || {};
    var others = String(this.$('.sl-with').value || '').trim();
    var typed = String(this.$('.sl-note').value || '').trim(), keep = this.$('.sl-keep').checked;
    var t2 = String(this.$('.sl-place').value || '').trim();
    var where = [this.place, t2].filter(Boolean).join(' · ') || null;
    var kindWord = (this.kind === 'other' || this.kind === 'Something else') ? 'Time' : pillLabel('what', this.kind);
    var title = kindWord + ' with ' + who + (others ? ' and ' + others : '');
    if (!fut && !this.labels.length) {
      this.say('Tap who ' + who + ' is first: ' + pillsFor('is').map(function(x){ return x[1]; }).join(', ') + '.', 'warn');
      return;
    }
    var go = this.$('.go'); go.disabled = true; this.say('Saving...');
    var res = { future: fut, who: who, kind: this.kind, date: this.when, title: title, where: where, todoId: null, connectionId: null, habitId: null };
    var r;
    if (fut) {
      /* a plan is a line on the to-do board under Social Well-Being, one home for plans */
      r = await sb.from('todos').insert({ task: title, section: 'Social Well-Being', subsection: null, position: 0,
        bucket: 'today', status: 'todo', done: false, for_date: this.when, source_project: 'social-log' }).select('id').single();
      if (!r.error && r.data) res.todoId = r.data.id;
    } else {
      var notes = [typed, tn.note, others ? ('with ' + others) : ''].filter(Boolean).join(' | ');
      r = await sb.from('connections').insert({
        person: who, person_key: (carry.person_key || who), entity_type: 'person',
        kind: this.kind, channel: channelFor(this.kind), happened_on: this.when, planned: false,
        notes: notes || null, place: where,
        circle: this.circle || carry.circle || null, social_group: this.group || carry.social_group || null, age_band: carry.age_band || null,
        labels: this.labels.slice(), direction: this.source || null,
        source: 'logged-by-hand', superseded: false
      }).select('id').single();
      if (!r.error && r.data) {
        res.connectionId = r.data.id;
        res.habitId = await tickHabit(sb, this.when, o.mins || null);
      }
    }
    if (!r.error && keep && typed) { try { await this.keepNote(who, typed, res.connectionId); } catch (e) {} }
    go.disabled = false;
    if (r.error) { this.say('That did not save. Try again in a moment.', 'warn'); return; }
    var said = fut ? ('On your board under Social Well-Being: ' + title + ', ' + shortD(this.when) + '.')
                   : ('Logged: ' + title + ', ' + shortD(this.when) + '. Social habit ticked.');
    this.kind = ''; this.place = ''; this.labels = []; this.labelsTouched = false; this.source = ''; this.who0 = ''; this.with0 = '';
    this.tidy = { is:false, source:false, what:false, where:false, group:false }; this.lastRm = null;
    this.group = ''; this.circle = ''; this.groupTouched = false; this.circleTouched = false;
    this.loaded = false;
    if (typeof o.onSaved === 'function') { try { o.onSaved(res); } catch (e) {} }
    if (o.closeOnSave) return;
    await this.draw(said, 'ok');
  };
  Form.prototype.onSoon = async function(b, row){
    var sb = this.sb, DAY = today();
    var id = row.getAttribute('data-id'), text = (row.querySelector('.what').firstChild || {}).textContent || '';
    b.disabled = true;
    try {
      if (b.classList.contains('yes')) {
        var f = nameIn(text), k = kindIn(text);
        if (f.person) {
          var c = this.carry(f.person) || {};
          await sb.from('connections').insert({ person: f.person, person_key: (c.person_key || f.person), entity_type: 'person',
            kind: k, channel: channelFor(k), happened_on: DAY, planned: false, notes: (f.others ? ('with ' + f.others) : text),
            circle: c.circle || null, social_group: c.social_group || null, age_band: c.age_band || null, labels: c.labels || [],
            source: 'logged-by-hand', superseded: false });
          await tickHabit(sb, DAY, null);
        }
        var now = new Date().toISOString();
        await sb.from('todos').update({ done: true, status: 'done', done_at: now, completed_at: now, updated_at: now }).eq('id', id);
      } else {
        await sb.from('todos').delete().eq('id', id);
      }
      this.loaded = false; await this.draw();
    } catch (e) { b.disabled = false; }
  };
  Form.prototype.onPast = async function(b, row){
    var box = row.querySelector('.addn');
    if (b.classList.contains('an')) { box.classList.add('open'); box.querySelector('textarea').focus(); return; }
    if (b.classList.contains('cx')) { box.classList.remove('open'); return; }
    if (!b.classList.contains('sv')) return;
    var text = String(box.querySelector('textarea').value || '').trim(); if (!text) return;
    var cid = row.getAttribute('data-cid'), who = row.getAttribute('data-who');
    var k = null; for (var i = 0; i < this.known.length; i++) if (this.known[i].id === cid) { k = this.known[i]; break; }
    b.disabled = true;
    var r = await this.sb.from('connections').update({ notes: (k && k.notes) ? (k.notes + '\n' + text) : text }).eq('id', cid);
    if (!r.error && box.querySelector('.ak').checked) { try { await this.keepNote(who, text, cid); } catch (e) {} }
    b.disabled = false;
    if (r.error) { this.say('That note did not save. Try again in a moment.', 'warn'); return; }
    this.loaded = false; await this.draw('Note added to ' + who + '.', 'ok');
  };

  function mount(el, opts){
    if (!el || !opts || !opts.sb) return null;
    var f = new Form(el, opts); f.draw(); return f;
  }
  function open(opts){
    css();
    var old = document.getElementById('pysl-ov'); if (old) old.remove();
    var ov = document.createElement('div'); ov.className = 'pysl-ov'; ov.id = 'pysl-ov';
    var card = document.createElement('div'); card.className = 'pysl pysl-card';
    var x = document.createElement('button'); x.className = 'pysl-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
    var inner = document.createElement('div');
    card.appendChild(x); card.appendChild(inner); ov.appendChild(card);
    document.body.appendChild(ov);
    var done = false;
    function close(){ if (done) return; done = true; ov.remove(); document.removeEventListener('keydown', onKey); if (typeof opts.onClose === 'function') { try { opts.onClose(); } catch (e) {} } }
    function onKey(e){ if (e.key === 'Escape') close(); }
    x.onclick = close;
    ov.addEventListener('mousedown', function(e){ if (e.target === ov) close(); });
    document.addEventListener('keydown', onKey);
    var o = Object.assign({}, opts, { closeOnSave: true, auto: opts.auto, onSaved: function(res){
      if (typeof opts.onSaved === 'function') { try { opts.onSaved(res); } catch (e) {} }
      done = true; ov.remove(); document.removeEventListener('keydown', onKey);
    } });
    var f = new Form(inner, o);
    card.classList.add(opts.auto === false ? 'pysl-light' : 'pysl-auto');
    f.draw();
    return { close: close, form: f };
  }

  return { mount: mount, open: open, tickHabit: tickHabit, nameIn: nameIn, kindIn: kindIn, version: '2.2' };
})();
