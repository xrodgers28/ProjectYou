/* safari-log.js - THE ONE safari log form. Project YOU, Oct 3 2026.

   Scott: "local and national safaris should have a log similar to the social log."
   This is Log Safari Moment, built the same way as Log Social Moment (social-log.js):
   the form lives here once and every page that wants it loads this file.

     PYSafari.mount(el, opts)  draws the form inside el (the Safari Log page does this)
     PYSafari.open(opts)       draws it in a pop-up sheet (Weekly Review, Todays Tasks, cue cards)

   opts: sb (Supabase client, required), when (YYYY-MM-DD), which ('Local' or 'National'),
         place, town, onSaved(result), onClose().

   WHAT A SAVE DOES (Scott's answers, Oct 3 2026)
   - A row in safari_log: which, place, town, kind, why, with, when, how long, felt, note.
   - The place is kept on the Safari places list (safaris): a new place is added as been,
     an existing one flips to been, and the favourite tick makes it a favourite.
   - The Local Safari or National Safari habit is ticked for that day, the same way the
     Social form ticks Social: today through the live habit row, a past day straight
     into the quantified-self log.
   - Only things that already happened. A date ahead of today is refused; a planned
     safari stays a to-do until it happens.
   - NATIONAL means outside Connecticut and New York. When the town you type or tap
     has a state, the Which row follows it, unless you already chose.
   - The Where row offers recent new places from your Swarm check-ins. One tap fills
     the place and town.
   - Felt is 1 to 7 and never required. Favourite is optional.

   Change the form here and every page gets the change. Do not copy it into a page.

   v1.2, Oct 3 2026, Scott's answer: a note that starts with the word fix also becomes a to-do for Claude
   (Fixes to make), the shortcut the Weekly Review's old note box had. Safari minutes count for real.

   v1.1, Oct 3 2026, Scott's answer: one centralized form that updates all trackers. A save now
   also writes the day's tracker row WITH the place as its note, the same shape the Weekly
   Review's old Where? popup wrote, so rollover and counts agree. PYSafari.dropTrackers(sb, id)
   removes those rows when an entry is deleted. opts.which and opts.place pre-fill the form.

   v1.0, Oct 3 2026. First version. Custom words added with + are kept in this browser. */
window.PYSafari = (function () {
  'use strict';
  var VERSION = '1.2';
  var HOME_STATES = ['ct', 'connecticut', 'ny', 'new york'];
  var KINDS = ['Library','Park','Museum','Cafe','Gallery','Hotel lobby','Waterfront','Trail','Town','Landmark','Other'];
  var WHYS = ['Work from here','Explore','Both'];
  var WITHS = ['Solo','Åsa','Family','Friend','Colleague'];
  var LONGS = [[30,'30 min'],[60,'1 hour'],[120,'2 hours'],[240,'Half day'],[480,'All day']];
  var LONG_NAT = [1440,'Overnight or more'];
  var MON = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var LENS = { 'Work from here':'work', 'Explore':'culture', 'Both':'both' };

  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
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
  var STATES = ['alabama','alaska','arizona','arkansas','california','colorado','connecticut','delaware','florida','georgia','hawaii','idaho','illinois','indiana','iowa','kansas','kentucky','louisiana','maine','maryland','massachusetts','michigan','minnesota','mississippi','missouri','montana','nebraska','nevada','new hampshire','new jersey','new mexico','new york','north carolina','north dakota','ohio','oklahoma','oregon','pennsylvania','rhode island','south carolina','south dakota','tennessee','texas','utah','vermont','virginia','washington','west virginia','wisconsin','wyoming','district of columbia'];
  /* a state is only a state if it looks like one: two letters, or a full name. "Manhattan" is not. */
  function stateOf(town){
    var m = String(town||'').match(/,\s*([A-Za-z .]+)\s*$/);
    if (!m) return '';
    var s = m[1].trim(), k = s.toLowerCase().replace(/\./g, '');
    if (/^[a-z]{2}$/.test(k) || STATES.indexOf(k) > -1) return s;
    return '';
  }
  function isHome(state){ return HOME_STATES.indexOf(String(state||'').toLowerCase().replace(/\./g,'')) > -1; }
  function readVocab(key){ try { return JSON.parse(localStorage.getItem('pysf_' + key) || '[]') || []; } catch (e) { return []; } }
  function writeVocab(key, arr){ try { localStorage.setItem('pysf_' + key, JSON.stringify(arr)); } catch (e) {} }

  /* ---------- the trackers: one write that every page reads ----------
     Scott, Oct 3 2026: "this should be a centralized form that updates all trackers
     from one source." So the form writes the same rows the old Weekly Review popup
     wrote: a quantified-self row for the day with the place as its note (the Weekly
     Review rollover reads that note), plus, for today, the habit row on Todays
     Tasks. The habit's own automatic row is removed so the day counts once. */
  async function recordTrackers(sb, logId, which, date, minutes, place){
    var TASK = which === 'National' ? 'National Safari' : 'Local Safari', DAY = today();
    var out = { habitId: null, qs: null };
    try {
      var qs = { date: date, group: 'Environmental Health', tracker: TASK, value: 1, unit: 'done', minutes: minutes || 0,
        minutes_estimated: false, status: 'done', note: place, source: 'safari-log:' + logId,
        logged_at: date === DAY ? new Date().toISOString() : date + 'T16:00:00Z' };
      var r = await sb.from('qs_log').insert(qs);
      if (!r.error) out.qs = qs;
      if (date === DAY) {
        var h = await sb.from('todos').select('id,done').eq('is_habit', true).eq('task', TASK).limit(1);
        var row = h.data && h.data[0];
        if (row) {
          out.habitId = row.id;
          if (!row.done) {
            var now = new Date().toISOString();
            await sb.from('todos').update({ done: true, status: 'done', done_at: now, completed_at: now,
              actual_minutes: minutes || null, for_date: DAY, updated_at: now }).eq('id', row.id);
            await sb.from('qs_log').delete().eq('date', DAY).eq('tracker', TASK).eq('source', 'habit-bandit');
          }
        }
      }
    } catch (e) {}
    return out;
  }

  /* ---------- the look, scoped to .pysf so it sits inside any page ---------- */
  function css(){
    if (document.getElementById('pysf-css')) return;
    var s = document.createElement('style'); s.id = 'pysf-css';
    s.textContent = [
      '.pysf{--ink:#1f2a44;--mut:#5b6472;--line:#e3e7ee;--card:#fff;--acc:#3f6f8f;--warn:#c0453b;--good:#3f7d5c;',
      ' color:var(--ink);font:13px/1.4 Arial,Helvetica,sans-serif;text-align:left}',
      '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .pysf.pysf-auto{--ink:#e6ebf3;--mut:#9aa6b6;--line:#2c3644;--card:#1a212c;--acc:#7fb0d0;--warn:#e0776d;--good:#78bd97}}',
      '.pysf *{box-sizing:border-box}',
      '.pysf h3{font-size:16px;font-weight:800;margin:0 0 4px;letter-spacing:-.01em}',
      '.pysf .sf-ver{font-size:10.5px;color:var(--mut);margin:0 0 12px}',
      '.pysf .sf-row{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:0 0 9px;padding:8px 10px;border-radius:10px}',
      '.pysf .sf-lab{font-size:9.5px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:var(--mut);width:62px;flex:none}',
      '.pysf .r-which{background:rgba(63,111,143,.09)}.pysf .r-where{background:rgba(63,150,100,.09)}.pysf .r-kind{background:rgba(184,128,31,.09)}',
      '.pysf .r-why{background:rgba(111,90,168,.09)}.pysf .r-with{background:rgba(192,69,59,.07)}.pysf .r-when{background:rgba(91,143,206,.10)}',
      '.pysf .r-long{background:rgba(47,143,138,.09)}.pysf .r-felt{background:rgba(224,163,38,.10)}',
      '.pysf .sf-chip{font:inherit;font-size:11.5px;font-weight:700;color:var(--mut);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px 11px;cursor:pointer;line-height:1.15}',
      '.pysf .sf-chip:hover{border-color:var(--acc)}',
      '.pysf .sf-chip.on{color:#fff;border-color:transparent;background:var(--acc)}',
      '.pysf .r-where .sf-chip.on{background:#3f966a}.pysf .r-kind .sf-chip.on{background:#b8801f}.pysf .r-why .sf-chip.on{background:#6f5aa8}',
      '.pysf .r-with .sf-chip.on{background:#c0453b}.pysf .r-when .sf-chip.on{background:#5b8fce}.pysf .r-long .sf-chip.on{background:#2f8f8a}',
      '.pysf .r-felt .sf-chip.on{background:#d9a31f;color:#1f2a44}',
      '.pysf .sf-chip.plus{border-style:dashed}',
      '.pysf .sf-sug{margin:-3px 0 9px 72px;display:flex;gap:6px;flex-wrap:wrap;align-items:center}',
      '.pysf .sf-sug small{font-size:11px;color:var(--mut);width:100%}',
      '.pysf input[type=text],.pysf input[type=date],.pysf textarea{font:inherit;font-size:13px;padding:8px 10px;border:1px solid var(--line);border-radius:8px;background:var(--card);color:var(--ink)}',
      '.pysf .sf-place{flex:1;min-width:170px}.pysf .sf-town{width:160px}.pysf .sf-add{width:120px;padding:5px 9px}',
      '.pysf textarea{width:100%;min-height:60px;resize:vertical;margin-top:2px}',
      '.pysf .sf-fav{display:flex;align-items:center;gap:8px;margin:8px 0 4px;color:var(--mut);font-size:12.5px}',
      '.pysf .sf-go{display:block;width:60%;margin:14px auto 6px;font:inherit;font-weight:800;font-size:15px;padding:12px;border:none;border-radius:10px;background:var(--acc);color:#fff;cursor:pointer}',
      '.pysf .sf-go:disabled{opacity:.5;cursor:default}',
      '.pysf .sf-say{text-align:center;font-size:12.5px;min-height:18px;color:var(--good);margin-top:2px}',
      '.pysf .sf-say.warn{color:var(--warn)}',
      '.pysf .sf-link{text-align:center;font-size:12px;margin-top:2px}.pysf .sf-link a{color:var(--acc)}',
      '.pysf .sf-hint{font-size:11px;color:var(--mut);margin:0 0 0 72px}',
      '.pysf-ov{position:fixed;inset:0;background:rgba(20,28,40,.5);z-index:9999;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:4vh 12px}',
      '.pysf-card{position:relative;background:#fff;border-radius:16px;padding:20px 18px 14px;width:100%;max-width:640px;box-shadow:0 20px 50px rgba(0,0,0,.3)}',
      '@media (prefers-color-scheme:dark){html:not([data-theme="light"]) .pysf-card.pysf-auto{background:#1a212c}}',
      '.pysf-x{position:absolute;top:8px;right:12px;border:none;background:none;font-size:24px;color:#8b949b;cursor:pointer}',
      '@media (max-width:560px){.pysf .sf-lab{width:100%}.pysf .sf-sug,.pysf .sf-hint{margin-left:0}.pysf .sf-go{width:90%}}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ---------- the form ---------- */
  function Form(el, o){
    this.el = el; this.o = o || {}; this.sb = o.sb;
    this.s = { which: o.which === 'National' ? 'National' : 'Local', whichTouched: !!o.which, place: o.place || '', town: o.town || '',
               kind: '', why: '', withs: ['Solo'], when: o.when || today(), mins: null, felt: null, note: '', fav: false, lat: null, lng: null };
    this.sug = [];
    if (o.lat) this.s.lat = o.lat; if (o.lng) this.s.lng = o.lng;
    if (o.category) { var kw = String(o.category).toLowerCase(); for (var i = 0; i < KINDS.length; i++) if (kw.indexOf(KINDS[i].toLowerCase()) > -1) { this.s.kind = KINDS[i]; break; } }
    if (o.town && !o.which) this.autoWhich();
  }
  Form.prototype.$ = function(q){ return this.el.querySelector(q); };
  Form.prototype.say = function(t, cls){ var e = this.$('.sf-say'); if (e) { e.textContent = t || ''; e.className = 'sf-say' + (cls ? ' ' + cls : ''); } };
  Form.prototype.chips = function(group, list, cur, plusKey){
    var self = this, extra = plusKey ? readVocab(plusKey) : [];
    var all = list.concat(extra.filter(function(x){ return list.indexOf(x) < 0; }));
    var h = all.map(function(w){
      var on = Array.isArray(cur) ? cur.indexOf(w) > -1 : cur === w;
      return '<button type="button" class="sf-chip' + (on ? ' on' : '') + '" data-g="' + group + '" data-v="' + esc(w) + '">' + esc(w) + '</button>';
    }).join('');
    if (plusKey) h += '<button type="button" class="sf-chip plus" data-plus="' + plusKey + '" title="Add your own word">+</button>';
    return h;
  };
  Form.prototype.draw = async function(){
    css();
    var s = this.s, self = this, isNat = s.which === 'National';
    var longs = LONGS.concat(isNat ? [LONG_NAT] : []);
    var h = '<div class="pysf pysf-auto"><h3>Log Safari Moment</h3><div class="sf-ver">Safari Log v' + VERSION + '</div>' +
      '<div class="sf-row r-which"><span class="sf-lab">Which</span>' + ['Local','National'].map(function(w){ return '<button type="button" class="sf-chip' + (s.which === w ? ' on' : '') + '" data-g="which" data-v="' + w + '">' + w + '</button>'; }).join('') + '</div>' +
      '<div class="sf-hint" style="margin-bottom:8px">National means outside Connecticut and New York.</div>' +
      '<div class="sf-row r-where"><span class="sf-lab">Where</span><input type="text" class="sf-place" placeholder="Place name" value="' + esc(s.place) + '"><input type="text" class="sf-town" placeholder="Town, ST" value="' + esc(s.town) + '"></div>' +
      '<div class="sf-sug" id="sf-sug"></div>' +
      '<div class="sf-row r-kind"><span class="sf-lab">Kind</span>' + this.chips('kind', KINDS, s.kind, 'kinds') + '</div>' +
      '<div class="sf-row r-why"><span class="sf-lab">Why</span>' + this.chips('why', WHYS, s.why) + '</div>' +
      '<div class="sf-row r-with"><span class="sf-lab">With</span>' + this.chips('with', WITHS, s.withs, 'withs') + '</div>' +
      '<div class="sf-row r-when"><span class="sf-lab">When</span>' +
        '<button type="button" class="sf-chip' + (s.when === today() ? ' on' : '') + '" data-g="when" data-v="today">Today</button>' +
        '<button type="button" class="sf-chip' + (s.when === shift(today(), -1) ? ' on' : '') + '" data-g="when" data-v="yesterday">Yesterday</button>' +
        '<input type="date" class="sf-date" max="' + today() + '" value="' + esc(s.when) + '"></div>' +
      '<div class="sf-row r-long"><span class="sf-lab">Long</span>' + longs.map(function(l){ return '<button type="button" class="sf-chip' + (s.mins === l[0] ? ' on' : '') + '" data-g="mins" data-v="' + l[0] + '">' + l[1] + '</button>'; }).join('') + '</div>' +
      '<div class="sf-row r-felt"><span class="sf-lab">Felt</span>' + [1,2,3,4,5,6,7].map(function(n){ return '<button type="button" class="sf-chip' + (s.felt === n ? ' on' : '') + '" data-g="felt" data-v="' + n + '">' + n + '</button>'; }).join('') + '</div>' +
      '<textarea class="sf-note" placeholder="What did you notice? (optional)">' + esc(s.note) + '</textarea>' +
      '<label class="sf-fav"><input type="checkbox" class="sf-favck"' + (s.fav ? ' checked' : '') + '> Keep as a favourite, I would go back</label>' +
      '<button type="button" class="sf-go">Log It</button><div class="sf-say"></div>' +
      (this.o.noLink ? '' : '<div class="sf-link"><a href="safari-log.html" target="_blank" rel="noopener">Safari Log</a></div>') + '</div>';
    this.el.innerHTML = h;
    this.wire();
    this.drawSug();
    if (!this.sugLoaded) this.loadSug();
  };
  Form.prototype.drawSug = function(){
    var self = this, box = this.$('#sf-sug'); if (!box) return;
    if (!this.sug.length) { box.innerHTML = ''; return; }
    box.innerHTML = '<small>New places from your check-ins, tap to fill:</small>' + this.sug.map(function(p, i){
      return '<button type="button" class="sf-chip" data-sug="' + i + '">' + esc(p.venue) + '</button>'; }).join('');
    box.querySelectorAll('[data-sug]').forEach(function(b){ b.onclick = function(){ self.fillFrom(self.sug[+b.getAttribute('data-sug')]); }; });
  };
  Form.prototype.loadSug = async function(){
    this.sugLoaded = true;
    try {
      var d = today(), r = await this.sb.rpc('safari_week', { ws: shift(d, -14), we: d });
      var rows = (r.data || []).filter(function(x){ return !x.is_errand; });
      rows.sort(function(a, b){ return a.ts < b.ts ? 1 : -1; });
      this.sug = rows.slice(0, 6);
      this.drawSug();
    } catch (e) {}
  };
  Form.prototype.fillFrom = function(p){
    var st = this.s; if (!p) return;
    st.place = p.venue || ''; st.town = [p.city, p.state].filter(Boolean).join(', ');
    st.lat = p.lat || null; st.lng = p.lng || null;
    if (p.day) st.when = p.day;
    var kw = String(p.category || '').toLowerCase();
    for (var i = 0; i < KINDS.length; i++) if (kw.indexOf(KINDS[i].toLowerCase()) > -1) { st.kind = KINDS[i]; break; }
    this.autoWhich();
    this.draw();
  };
  Form.prototype.autoWhich = function(){
    var st = this.s; if (st.whichTouched) return;
    var state = stateOf(st.town);
    if (state) st.which = isHome(state) ? 'Local' : 'National';
  };
  Form.prototype.grab = function(){
    var st = this.s;
    var p = this.$('.sf-place'), t = this.$('.sf-town'), n = this.$('.sf-note'), f = this.$('.sf-favck'), d = this.$('.sf-date');
    if (p) st.place = p.value; if (t) st.town = t.value; if (n) st.note = n.value; if (f) st.fav = f.checked; if (d && d.value) st.when = d.value;
  };
  Form.prototype.wire = function(){
    var self = this, st = this.s;
    this.el.querySelectorAll('.sf-chip[data-g]').forEach(function(b){
      b.onclick = function(){
        self.grab();
        var g = b.getAttribute('data-g'), v = b.getAttribute('data-v');
        if (g === 'which') { st.which = v; st.whichTouched = true; if (v === 'Local' && st.mins === 1440) st.mins = null; }
        else if (g === 'kind') st.kind = st.kind === v ? '' : v;
        else if (g === 'why') st.why = st.why === v ? '' : v;
        else if (g === 'with') { var i = st.withs.indexOf(v); if (v === 'Solo') st.withs = ['Solo']; else { st.withs = st.withs.filter(function(x){ return x !== 'Solo'; }); if (i > -1) st.withs = st.withs.filter(function(x){ return x !== v; }); else st.withs.push(v); if (!st.withs.length) st.withs = ['Solo']; } }
        else if (g === 'when') st.when = v === 'today' ? today() : shift(today(), -1);
        else if (g === 'mins') st.mins = st.mins === +v ? null : +v;
        else if (g === 'felt') st.felt = st.felt === +v ? null : +v;
        self.draw();
      };
    });
    this.el.querySelectorAll('.sf-chip[data-plus]').forEach(function(b){
      b.onclick = function(){
        self.grab();
        var key = b.getAttribute('data-plus');
        var inp = document.createElement('input'); inp.type = 'text'; inp.className = 'sf-add'; inp.placeholder = 'New word, Enter';
        b.replaceWith(inp); inp.focus();
        inp.onkeydown = function(e){
          if (e.key === 'Escape') { self.draw(); return; }
          if (e.key !== 'Enter') return;
          var w = inp.value.trim(); if (!w) { self.draw(); return; }
          var arr = readVocab(key); if (arr.indexOf(w) < 0) { arr.push(w); writeVocab(key, arr); }
          if (key === 'kinds') st.kind = w; else { st.withs = st.withs.filter(function(x){ return x !== 'Solo'; }); if (st.withs.indexOf(w) < 0) st.withs.push(w); }
          self.draw();
        };
      };
    });
    var town = this.$('.sf-town');
    if (town) town.onchange = function(){ self.grab(); var before = st.which; self.autoWhich(); if (before !== st.which) self.draw(); };
    var date = this.$('.sf-date'); if (date) date.onchange = function(){ self.grab(); self.draw(); };
    this.$('.sf-go').onclick = function(){ self.save(); };
  };
  Form.prototype.save = async function(){
    var self = this, st = this.s, sb = this.sb, o = this.o;
    this.grab();
    var place = String(st.place || '').trim(), town = String(st.town || '').trim();
    if (!place) { this.say('Type or tap a place first.', 'warn'); return; }
    if (st.when > today()) { this.say('Only things that already happened. Pick today or earlier.', 'warn'); return; }
    var go = this.$('.sf-go'); go.disabled = true; this.say('Saving...');
    var withs = st.withs.slice();
    var row = { kind: st.which, place: place, town: town || null, place_kind: st.kind || null, why: st.why || null,
                with_whom: withs, happened_on: st.when, mins: st.mins || null, felt: st.felt || null,
                note: String(st.note || '').trim() || null, favourite: !!st.fav, source: 'logged-by-hand' };
    var res = { place: place, which: st.which, date: st.when, safariId: null, logId: null, habitId: null };
    try {
      /* the place on the Safari places list: add it, or flip an idea to been */
      var found = await sb.from('safaris').select('id,status,visited_on,tags').ilike('name', place).limit(1);
      var sid = null, now = new Date().toISOString();
      if (found.data && found.data[0]) {
        var f = found.data[0], patch = { updated_at: now };
        if (f.status === 'idea' || st.fav) patch.status = st.fav ? 'favourite' : 'been';
        if (!f.visited_on || f.visited_on < st.when) patch.visited_on = st.when;
        await sb.from('safaris').update(patch).eq('id', f.id); sid = f.id;
      } else {
        var ins = await sb.from('safaris').insert({ name: place, place: town || null, kind: st.kind || null, lens: LENS[st.why] || 'both',
          lat: st.lat, lng: st.lng, status: st.fav ? 'favourite' : 'been', visited_on: st.when, source: 'safari-log' }).select('id').single();
        if (ins.data) sid = ins.data.id;
      }
      row.safari_id = sid; res.safariId = sid;
      var r = await sb.from('safari_log').insert(row).select('id').single();
      if (r.error) throw r.error;
      res.logId = r.data.id;
      var tr = await recordTrackers(sb, res.logId, st.which, st.when, st.mins, place);
      if (/^fix\b/i.test(row.note || '')) {
        try { await sb.from('session_todos').insert({ cat: 'Fixes to make', txt: 'Safari, ' + place + ': ' + row.note.replace(/^fix[:\s]*/i, ''), own: 'Claude', project: 'Project YOU', page: 'safari-log.html' }); res.fixTodo = true; } catch (e) {}
      }
      res.habitId = tr.habitId; res.qsRow = tr.qs; res.mins = st.mins || 0; res.tracker = st.which === 'National' ? 'National Safari' : 'Local Safari';
    } catch (e) {
      go.disabled = false; this.say('That did not save. Try again in a moment.', 'warn'); return;
    }
    go.disabled = false;
    var said = 'Logged: ' + place + ', ' + shortD(st.when) + '. ' + (st.which === 'National' ? 'National' : 'Local') + ' Safari ticked.' + (res.fixTodo ? ' Added to Claude\'s list under Fixes to make.' : '');
    this.s = { which: st.which, whichTouched: false, place: '', town: '', kind: '', why: '', withs: ['Solo'], when: today(), mins: null, felt: null, note: '', fav: false, lat: null, lng: null };
    this.sugLoaded = false;
    if (typeof o.onSaved === 'function') { try { o.onSaved(res); } catch (e) {} }
    if (o.closeOnSave) return;
    await this.draw(); this.say(said, '');
  };

  async function dropTrackers(sb, logId){
    try { await sb.from('qs_log').delete().eq('source', 'safari-log:' + logId); } catch (e) {}
  }

  function mount(el, opts){
    if (!el || !opts || !opts.sb) return null;
    var f = new Form(el, opts); f.draw(); return f;
  }
  function open(opts){
    css();
    var old = document.getElementById('pysf-ov'); if (old) old.remove();
    var ov = document.createElement('div'); ov.className = 'pysf-ov'; ov.id = 'pysf-ov';
    var card = document.createElement('div'); card.className = 'pysf-card pysf-auto';
    var x = document.createElement('button'); x.className = 'pysf-x'; x.type = 'button'; x.setAttribute('aria-label', 'Close'); x.innerHTML = '&times;';
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
    var f = new Form(inner, o); f.draw();
    return { close: close, form: f };
  }

  return { mount: mount, open: open, shortD: shortD, dropTrackers: dropTrackers, version: VERSION };
})();
