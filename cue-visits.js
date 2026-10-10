/* cue-visits.js v1.0, Oct 9 2026 (Scott's answers 4, 5 and 6 to the Cue Card Timer Review)
   One shared helper for every Cue Card page, the Cue Cards board, Today's Tasks and the Habit Tracker.

   1. SEPARATE VISITS. Every time you finish a card page, that visit is saved as its own line in
      card_visits (day, card, minutes, source 'page'). A database trigger keeps the day's minutes on the
      habit row equal to the SUM of the day's visits, so a second visit adds to the first instead of
      overwriting it. The minutes stamp on the board still shows one daily total.
   2. FIX BUTTON. finish() replaces each page's plain 3 second wait. The little bar says what was saved and
      has a Fix button: tap it, the countdown stops and a minutes box opens. The fix corrects THIS visit.
   3. TICKED BY HAND. handTick() asks you to type the minutes when a cue card is ticked without its page
      (board, Today's Tasks, Habit Tracker). No estimate is filled in. Saved as a 'hand' visit.
   Whole minutes only. Nothing here changes how any page's clock counts. */
(function(){
  if (window.CueVisits) return;

  var HABIT = {
    takeaways:'Takeaways', rundown:'AI Workout', atomic:'Atomic Habits', twk:'Things Worth Knowing',
    compass:'Compass YIR', openmode:'Open Mode', env:'Environmental Health', feed:'The Feed',
    rec:'Recreational Health', social:'Social Fitness dare', creativity:'Creativity Challenge',
    bucket:'Bucket List', wall:'SparkBoard', tnt:"It's a wrap", masterclass:'MasterClass'
  };
  /* other names the same card has gone by in the database */
  var ALIAS = { 'the wall':'SparkBoard', 'inspiration wall':'SparkBoard', 'the sparkboard':'SparkBoard',
                'ai insights':'AI Workout', 'compass':'Compass YIR' };
  var CARD_OF = {};
  Object.keys(HABIT).forEach(function(k){ CARD_OF[norm(HABIT[k])] = k; });
  Object.keys(ALIAS).forEach(function(a){ CARD_OF[a] = CARD_OF[norm(ALIAS[a])]; });

  function norm(s){ return String(s||'').replace(/\s+/g,' ').trim().toLowerCase(); }
  function habitFor(card){ return HABIT[card] || null; }
  function cardForHabit(name){ return CARD_OF[norm(name)] || null; }
  function isCueHabit(name){ return !!cardForHabit(name); }
  function canonHabit(name){ var c = cardForHabit(name); return c ? HABIT[c] : String(name||'').trim(); }

  /* the app's day ends at 2am Eastern; PY.today() knows that, with a fallback if py-day.js is not on the page */
  function today(){
    try { if (window.PY && typeof PY.today === 'function') { var t = PY.today(); if (t) return t; } } catch(e){}
    var d = new Date(Date.now() - 2*3600*1000);
    return new Intl.DateTimeFormat('en-CA', { timeZone:'America/New_York', year:'numeric', month:'2-digit', day:'2-digit' }).format(d);
  }
  function sum(rows, skipEdit){
    return (rows||[]).reduce(function(a, r){ return a + ((skipEdit && r.source === 'edit') ? 0 : (+r.minutes||0)); }, 0);
  }
  function whole(n){ n = Math.round(+n); return (n >= 1 && n <= 600) ? n : NaN; }
  function css(){
    if (document.getElementById('cvcss')) return;
    var s = document.createElement('style'); s.id = 'cvcss';
    s.textContent =
      '.cvbar{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:99998;display:flex;align-items:center;gap:12px;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px);padding:11px 14px 11px 16px;border-radius:14px;background:#1f2a44;color:#fff;font:600 14px/1.3 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;box-shadow:0 10px 30px rgba(31,42,68,.35)}' +
      '.cvbar b{font-weight:800}.cvbar .cvsub{font-weight:500;opacity:.8}' +
      '.cvbar button{font:800 13px/1 inherit;font-family:inherit;border:0;border-radius:9px;padding:9px 14px;cursor:pointer;background:#fff;color:#1f2a44}' +
      '.cvbar button.cvghost{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5)}' +
      '.cvbar .cverr{flex-basis:100%;text-align:center;color:#ffd7a8;font-weight:600}' +
      '.cvmask{position:fixed;inset:0;z-index:99999;background:rgba(20,28,48,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif}' +
      '.cvsheet{width:100%;max-width:360px;background:#fff;color:#1f2a44;border-radius:18px;padding:20px 18px 16px;box-shadow:0 18px 50px rgba(0,0,0,.35)}' +
      '.cvsheet h3{margin:0 0 4px;font-size:18px;font-weight:800}.cvsheet p{margin:0 0 12px;font-size:13.5px;color:#5b6577;line-height:1.4}' +
      '.cvchips{display:flex;flex-wrap:wrap;gap:7px;margin-bottom:12px}' +
      '.cvchips button{font:700 14px/1 inherit;font-family:inherit;padding:9px 12px;border-radius:999px;border:1px solid #d5dbe6;background:#f6f8fb;color:#1f2a44;cursor:pointer}' +
      '.cvchips button.on{background:#1f2a44;color:#fff;border-color:#1f2a44}' +
      '.cvrow{display:flex;align-items:center;gap:8px;margin-bottom:14px;font-weight:700}' +
      '.cvrow input{width:96px;font:700 20px/1 inherit;font-family:inherit;padding:10px;border-radius:10px;border:1.5px solid #c5cddb;text-align:center}' +
      '.cvact{display:flex;gap:10px;justify-content:flex-end}' +
      '.cvact button{font:800 14px/1 inherit;font-family:inherit;padding:11px 18px;border-radius:11px;border:0;cursor:pointer}' +
      '.cvact .cvok{background:#1f2a44;color:#fff}.cvact .cvno{background:#eef1f6;color:#1f2a44}' +
      '.cvact button:disabled{opacity:.5;cursor:default}';
    document.head.appendChild(s);
  }

  /* ---- the minutes box. Resolves to whole minutes, or null if cancelled ---- */
  function askMinutes(o){
    o = o || {};
    css();
    return new Promise(function(resolve){
      var mask = document.createElement('div'); mask.className = 'cvmask'; mask.setAttribute('role','dialog'); mask.setAttribute('aria-modal','true');
      var chips = [5,10,15,20,30,45,60,90];
      mask.innerHTML = '<div class="cvsheet"><h3></h3><p></p><div class="cvchips"></div>' +
        '<div class="cvrow"><input type="number" inputmode="numeric" min="1" max="600" step="1" aria-label="Minutes"><span>minutes</span></div>' +
        '<div class="cverr" style="color:#b45309;font-size:13px;font-weight:600;min-height:0;margin:-6px 0 8px"></div>' +
        '<div class="cvact"><button type="button" class="cvno">' + (o.cancelLabel || 'Cancel') + '</button><button type="button" class="cvok">' + (o.okLabel || 'Save') + '</button></div></div>';
      mask.querySelector('h3').textContent = o.title || 'How many minutes?';
      mask.querySelector('p').textContent = o.sub || '';
      if (!o.sub) mask.querySelector('p').style.display = 'none';
      var inp = mask.querySelector('input'), box = mask.querySelector('.cvchips'), err = mask.querySelector('.cverr');
      if (o.value > 0) inp.value = Math.round(o.value);
      function draw(){
        var v = +inp.value;
        box.innerHTML = chips.map(function(n){ return '<button type="button" data-n="' + n + '" class="' + (v === n ? 'on' : '') + '">' + n + '</button>'; }).join('');
        Array.prototype.forEach.call(box.querySelectorAll('button'), function(b){ b.onclick = function(){ inp.value = b.getAttribute('data-n'); err.textContent = ''; draw(); }; });
      }
      function done(v){ document.removeEventListener('keydown', key, true); if (mask.parentNode) mask.parentNode.removeChild(mask); resolve(v); }
      function save(){
        var n = whole(inp.value);
        if (!(n >= 1)) { err.textContent = 'Type a whole number of minutes, 1 to 600.'; try { inp.focus(); } catch(e){} return; }
        done(n);
      }
      function key(e){ if (e.key === 'Escape') { e.preventDefault(); done(null); } else if (e.key === 'Enter') { e.preventDefault(); save(); } }
      inp.oninput = function(){ err.textContent = ''; draw(); };
      mask.querySelector('.cvno').onclick = function(){ done(null); };
      mask.querySelector('.cvok').onclick = save;
      document.addEventListener('keydown', key, true);
      document.body.appendChild(mask);
      draw();
      setTimeout(function(){ try { inp.focus(); inp.select(); } catch(e){} }, 30);
    });
  }

  /* ---- Done screen: save the visit, show the bar with Fix, then go back to the board ---- */
  function finish(o){
    css();
    var sb = o.sb, card = o.card, habit = o.habit || habitFor(card);
    var url = o.url || ('habit-modules.html?done=' + card);
    var ms = o.ms || 3000;
    var mins = Math.max(1, Math.round(+o.minutes || 1));
    var st = { id:null, mins:mins, gone:false, fixing:false, left:Math.ceil(ms/1000), timer:null, tick:null, saved:null };

    var bar = document.createElement('div'); bar.className = 'cvbar'; bar.setAttribute('role','status');
    bar.innerHTML = '<span><b class="cvm"></b> <span class="cvsub"></span></span><button type="button" class="cvfix">Fix</button>';
    document.body.appendChild(bar);
    var elM = bar.querySelector('.cvm'), elS = bar.querySelector('.cvsub'), btn = bar.querySelector('.cvfix');
    function paint(){
      elM.textContent = '✓ ' + st.mins + ' min saved';
      elS.textContent = st.fixing ? '' : '· back to the board in ' + Math.max(1, st.left);
    }
    function go(){ if (st.gone) return; st.gone = true; clearTimeout(st.timer); clearInterval(st.tick); location.href = url; }
    function showErr(msg){
      var e = bar.querySelector('.cverr');
      if (!e) { e = document.createElement('div'); e.className = 'cverr'; bar.appendChild(e); }
      e.textContent = msg;
    }
    paint();

    if (sb && habit) {
      st.saved = Promise.resolve(sb.from('card_visits').insert({
        day: today(), habit: habit, card: card, minutes: mins, source: 'page',
        started_at: o.started || new Date(Date.now() - mins*60000).toISOString()
      }).select('id').single()).then(function(r){
        if (r.error || !r.data) { showErr('Time saved, but the visit list did not update: ' + ((r.error && r.error.message) || 'no answer')); return; }
        st.id = r.data.id;
      }).catch(function(e){ showErr('Time saved, but the visit list did not update: ' + (e && e.message || e)); });
    } else { st.saved = Promise.resolve(); }

    st.tick = setInterval(function(){ st.left--; if (!st.fixing) paint(); }, 1000);
    st.timer = setTimeout(go, ms);

    btn.onclick = function(){
      if (st.fixing) return;
      st.fixing = true; clearTimeout(st.timer); clearInterval(st.tick);
      paint(); btn.disabled = true;
      st.saved.then(function(){
        return askMinutes({ title:'Fix this visit', sub:'How many minutes did you really spend this time? This changes only this visit.', value:st.mins, okLabel:'Fix it', cancelLabel:'Keep ' + st.mins });
      }).then(function(n){
        if (!n || n === st.mins) { go(); return; }
        var write;
        if (sb && st.id) {
          write = sb.from('card_visits').update({ minutes:n }).eq('id', st.id);
        } else if (sb && habit) {
          write = sb.from('todos').update({ actual_minutes:n, updated_at:new Date().toISOString() }).eq('is_habit', true).eq('for_date', today()).ilike('task', habit);
        } else { go(); return; }
        return Promise.resolve(write).then(function(r){
          if (r && r.error) { throw r.error; }
          st.mins = n; paint(); showErr('');
          setTimeout(go, 900);
        });
      }).catch(function(e){
        btn.disabled = false; st.fixing = false;
        showErr('Did not save the fix: ' + (e && e.message || e));
        btn.textContent = 'Try again';
        var back = document.createElement('button'); back.type = 'button'; back.className = 'cvghost'; back.textContent = 'Back to the board'; back.onclick = go;
        bar.appendChild(back);
      });
    };
    return st;
  }

  /* ---- ticked by hand: ask for the minutes. Resolves { minutes, asked } or null if you cancel ---- */
  function handTick(o){
    var sb = o.sb, name = canonHabit(o.habit), day = today();
    return Promise.resolve(sb.from('card_visits').select('minutes,source').eq('day', day).ilike('habit', name)).then(function(r){
      var have = r && !r.error ? sum(r.data) : 0;
      if (have > 0) return { minutes:have, asked:false };
      if (+o.currentMinutes > 0) return { minutes:Math.round(+o.currentMinutes), asked:false };
      return askMinutes({ title:'How long on ' + (o.title || name) + '?', sub:'You ticked it without opening the card, so type the minutes you really spent.' }).then(function(n){
        if (!n) return null;
        return Promise.resolve(sb.from('card_visits').insert({
          day:day, habit:name, card:cardForHabit(name), minutes:n, source:'hand',
          started_at:new Date(Date.now() - n*60000).toISOString()
        })).then(function(ins){
          return { minutes:n, asked:true, error:(ins && ins.error) || null };
        });
      });
    });
  }

  /* unticking a hand tick removes its hand/edit minutes, so ticking again asks again. Page visits stay. */
  function clearHand(o){
    var name = canonHabit(o.habit);
    return Promise.resolve(o.sb.from('card_visits').delete().eq('day', today()).ilike('habit', name).in('source', ['hand','edit']));
  }

  /* the tap-to-edit minutes stamp: the day's total becomes `total`, kept as one 'edit' line that makes up the difference */
  function setTotal(o){
    var sb = o.sb, name = canonHabit(o.habit), day = today(), total = whole(o.total);
    if (!(total >= 1)) return Promise.reject(new Error('Minutes must be a whole number, 1 to 600.'));
    return Promise.resolve(sb.from('card_visits').select('id,minutes,source').eq('day', day).ilike('habit', name)).then(function(r){
      if (r.error) throw r.error;
      var rows = r.data || [], base = sum(rows, true), diff = total - base;
      var edits = rows.filter(function(x){ return x.source === 'edit'; }).map(function(x){ return x.id; });
      var step = edits.length ? Promise.resolve(sb.from('card_visits').delete().in('id', edits)) : Promise.resolve({});
      return step.then(function(d){
        if (d && d.error) throw d.error;
        if (diff === 0) return { ok:true };
        return Promise.resolve(sb.from('card_visits').insert({ day:day, habit:name, card:cardForHabit(name), minutes:diff, source:'edit' })).then(function(i){
          if (i && i.error) throw i.error;
          return { ok:true };
        });
      });
    });
  }

  window.CueVisits = {
    version:'1.0', habitFor:habitFor, cardForHabit:cardForHabit, isCueHabit:isCueHabit, canonHabit:canonHabit,
    today:today, askMinutes:askMinutes, finish:finish, handTick:handTick, clearHand:clearHand, setTotal:setTotal
  };
})();
