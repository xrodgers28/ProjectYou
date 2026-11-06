/* habit-insights.js v1.0, Nov 6, 2026
   Habit Dashboard (weekly-review.html): "What your habits say".
   Per habit: best and worst weekday (bars or text only, switch at the top) and three
   auto-written facts, each with an X (for now, this week, for good). Choices are saved
   in page_prefs so they follow Scott across phone and Mac.
   Reads qs_log only. Draws one new card under "The week, habit by habit". Touches nothing else.
   Rules from Scott (Nov 6, 2026): a habit stays quiet until it has 6 weeks; ties name both days;
   week starts Monday; compare to the previous 30 days until a year of history exists. */
(function(){
  'use strict';
  var URL_='https://arnjntspmrhigodlssbn.supabase.co', KEY_='sb_publishable_c570L9svjlGd4bHyJClkFA_gNWv1b6v';
  var PAGE='weekly-review', MIN_WEEKS=6;
  var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var db=null, prefs={style:'bars',hidden:{}}, showHidden=false, cache=null, building=false, timer=null;

  function today(){
    try{ if(window.PY&&PY.today) return PY.today(); }catch(e){}
    var d=new Date(Date.now()-2*3600*1000);
    var f=new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
    return f;
  }
  function parse(s){ var p=s.split('-'); return Date.UTC(+p[0],+p[1]-1,+p[2]); }
  function iso(ms){ var d=new Date(ms); return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2); }
  function addDays(s,n){ return iso(parse(s)+n*86400000); }
  function wd(s){ return (new Date(parse(s)).getUTCDay()+6)%7; } /* Monday = 0 */
  function fmt(s){ var p=s.split('-'); return MON[+p[1]-1]+' '+(+p[2])+', '+p[0]; }
  function esc(t){ return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];}); }

  function css(){
    if(document.getElementById('ins-css')) return;
    var s=document.createElement('style'); s.id='ins-css';
    s.textContent=
'#insCard .ins-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 10px}'+
'#insCard .ins-sub{font-size:12px;color:#7d8b9a;margin:0 0 12px}'+
'#insCard .ins-sw{display:inline-flex;border:1px solid #dde3ea;border-radius:99px;overflow:hidden;margin-left:auto}'+
'#insCard .ins-sw button{font:inherit;font-size:12px;font-weight:600;border:0;background:#fff;color:#4a5a6b;padding:4px 12px;cursor:pointer}'+
'#insCard .ins-sw button.on{background:#e2ecf3;color:#233140}'+
'#insCard .ins-link{font-size:12px;color:#3f6f8f;background:none;border:0;cursor:pointer;text-decoration:underline;padding:0;font-family:inherit}'+
'#insCard .ins-row{border-top:1px solid #e9edf2;padding:10px 0}'+
'#insCard .ins-n{font-weight:700;font-size:13.5px;margin:0 0 4px;display:flex;gap:8px;align-items:baseline;flex-wrap:wrap}'+
'#insCard .ins-n small{font-weight:400;color:#7d8b9a;font-size:11.5px}'+
'#insCard .ins-wk{display:flex;gap:5px;height:44px;align-items:flex-end;max-width:260px;margin:2px 0 4px}'+
'#insCard .ins-wc{flex:1;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;height:100%}'+
'#insCard .ins-wc i{display:block;width:100%;background:#3f6f8f;opacity:.45;border-radius:2px 2px 0 0;min-height:2px}'+
'#insCard .ins-wc i.hi{background:#1e8e5a;opacity:1}#insCard .ins-wc i.lo{background:#b06a2c;opacity:1}'+
'#insCard .ins-wc span{font:9px "IBM Plex Mono",monospace;color:#7d8b9a;margin-top:2px}'+
'#insCard .ins-line{font-size:13px;color:#4a5a6b;margin:0 0 4px}'+
'#insCard .ins-facts{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:3px}'+
'#insCard .ins-facts li{font-size:12.5px;color:#4a5a6b;display:flex;gap:8px;align-items:flex-start;justify-content:space-between}'+
'#insCard .ins-x{border:1px solid #dde3ea;background:#fff;color:#7d8b9a;border-radius:99px;width:20px;height:20px;line-height:16px;font-size:14px;cursor:pointer;flex:none;padding:0}'+
'#insCard .ins-x:hover{color:#233140;border-color:#3f6f8f}'+
'#insCard .ins-ch{display:inline-flex;gap:5px;flex-wrap:wrap;font-size:12px}'+
'#insCard .ins-ch button{font:inherit;font-size:12px;font-weight:600;border:1px solid #3f6f8f;background:#e2ecf3;color:#233140;border-radius:99px;padding:1px 9px;cursor:pointer}'+
'#insCard .ins-ch button.g{background:#fff;border-color:#dde3ea;color:#7d8b9a}'+
'#insCard li.ins-off{opacity:.55;font-style:italic}'+
'#insCard .ins-warm{font-size:12px;color:#7d8b9a;margin:10px 0 0}';
    document.head.appendChild(s);
  }

  /* ---------- saved choices ---------- */
  function loadPrefs(){
    return db.from('page_prefs').select('key,value').eq('page',PAGE).in('key',['ins_style','ins_hidden']).then(function(r){
      (r.data||[]).forEach(function(x){
        if(x.key==='ins_style'&&x.value&&x.value.v) prefs.style=x.value.v;
        if(x.key==='ins_hidden'&&x.value) prefs.hidden=x.value;
      });
    }).catch(function(){});
  }
  function savePref(key,value){
    try{ localStorage.setItem('py-'+PAGE+'-'+key,JSON.stringify(value)); }catch(e){}
    return db.from('page_prefs').select('key').eq('page',PAGE).eq('key',key).then(function(r){
      var row={value:value,updated_at:new Date().toISOString()};
      if(r.data&&r.data.length) return db.from('page_prefs').update(row).eq('page',PAGE).eq('key',key);
      return db.from('page_prefs').insert({page:PAGE,key:key,value:value,updated_at:row.updated_at});
    }).catch(function(e){ console.warn('habit-insights: could not save',e); });
  }
  function isHidden(habit,fid){
    var h=prefs.hidden[habit]&&prefs.hidden[habit][fid];
    if(!h) return false;
    if(h==='good') return true;
    return today()<h; /* h is the first day it comes back */
  }
  function monday(){ var t=today(); return addDays(t,7-wd(t)); }

  /* ---------- data ---------- */
  function names(){
    var seen={},out=[]; document.querySelectorAll('#habitGrid tr.hrow').forEach(function(tr){
      var t=tr.getAttribute('data-t'); if(t&&!seen[t]){ seen[t]=1; out.push(t); }
    }); return out;
  }
  function fetchDays(list){
    var by={}; list.forEach(function(n){ by[n]={}; });
    function page(from){
      return db.from('qs_log').select('date,tracker').in('tracker',list).gte('date','2025-01-01').order('date').range(from,from+999).then(function(r){
        var d=r.data||[]; d.forEach(function(x){ if(by[x.tracker]) by[x.tracker][x.date]=1; });
        if(d.length===1000) return page(from+1000);
      });
    }
    return page(0).then(function(){ return by; });
  }

  /* ---------- maths ---------- */
  function analyse(set,T){
    var days=Object.keys(set).sort(); if(!days.length) return null;
    var first=days[0], end=addDays(T,-1);
    var weeks=Math.floor((parse(end)-parse(first))/86400000/7);
    if(weeks<MIN_WEEKS) return {warm:true,weeks:weeks};
    var done=[0,0,0,0,0,0,0], poss=[0,0,0,0,0,0,0];
    for(var d=first; d<=end; d=addDays(d,1)){ var w=wd(d); poss[w]++; if(set[d]) done[w]++; }
    var rate=done.map(function(x,i){ return poss[i]?x/poss[i]:0; });
    var mx=Math.max.apply(null,rate), mn=Math.min.apply(null,rate);
    var best=[],worst=[]; rate.forEach(function(r,i){ if(Math.abs(r-mx)<1e-9) best.push(i); if(Math.abs(r-mn)<1e-9) worst.push(i); });
    var flat=(mx-mn)<1e-9;
    /* facts */
    var s30=addDays(T,-29), p30s=addDays(T,-59), p30e=addDays(T,-30);
    function cnt(a,b){ var n=0; for(var d=a; d<=b; d=addDays(d,1)) if(set[d]) n++; return n; }
    var last=cnt(s30,T);
    var yearOK=parse(first)<=parse(addDays(s30,-364));
    var cmpLabel, prev;
    if(yearOK){ prev=cnt(addDays(s30,-364),addDays(T,-364)); cmpLabel='the same 30 days last year'; }
    else { prev=cnt(p30s,p30e); cmpLabel='the 30 days before'; }
    var run=0,runS=null,bestRun=0,bestRunS=null,bestRunE=null, gap=0,gapS=null,bestGap=0,bestGapS=null,bestGapE=null;
    for(var d2=s30; d2<=T; d2=addDays(d2,1)){
      if(set[d2]){ if(!run) runS=d2; run++; if(run>bestRun){ bestRun=run; bestRunS=runS; bestRunE=d2; } gap=0; }
      else { if(!gap) gapS=d2; gap++; if(gap>bestGap){ bestGap=gap; bestGapS=gapS; bestGapE=d2; } run=0; }
    }
    return {weeks:weeks,rate:rate,best:best,worst:worst,flat:flat,last:last,prev:prev,cmp:cmpLabel,run:bestRun,runS:bestRunS,runE:bestRunE,gap:bestGap,gapS:bestGapS,gapE:bestGapE};
  }
  function dayList(ix){
    if(ix.length>3) return null;
    var n=ix.map(function(i){return DAYS[i];});
    return n.length<3?n.join(' and '):n.slice(0,-1).join(', ')+' and '+n[n.length-1];
  }
  function weekdayLine(a){
    if(a.flat) return 'About the same every day of the week. Based on '+a.weeks+' weeks.';
    var b=dayList(a.best), w=dayList(a.worst);
    return (b?'Best day: <b>'+b+'</b>.':'No single best day (four or more tie).')+' '+(w?'Worst day: <b>'+w+'</b>.':'No single worst day (four or more tie).')+' Based on '+a.weeks+' weeks.';
  }
  function facts(a){
    var f=[];
    var diff=a.last===a.prev?'the same as':(a.last>a.prev?'up from':'down from');
    f.push({id:'count',t:'Done on <b>'+a.last+' of the last 30 days</b>, '+diff+' '+a.prev+' in '+a.cmp+'.'});
    f.push({id:'run',t:a.run>=2?'Longest run: <b>'+a.run+' days in a row</b> ('+fmt(a.runS)+' to '+fmt(a.runE)+').':'No run of 2 days in a row in the last 30 days.'});
    f.push({id:'gap',t:a.gap>=2?'Longest gap: <b>'+a.gap+' days without it</b> ('+fmt(a.gapS)+' to '+fmt(a.gapE)+').':'Never missed 2 days in a row in the last 30 days.'});
    return f;
  }

  /* ---------- drawing ---------- */
  function ensureCard(){
    var c=document.getElementById('insCard'); if(c) return c;
    var anchor=document.getElementById('habitCard'); if(!anchor||!anchor.parentNode) return null;
    c=document.createElement('div'); c.className='card block'; c.id='insCard';
    anchor.parentNode.insertBefore(c,anchor.nextSibling); return c;
  }
  function hiddenCount(){
    var n=0; Object.keys(prefs.hidden).forEach(function(h){ Object.keys(prefs.hidden[h]).forEach(function(f){ if(isHidden(h,f)) n++; }); }); return n;
  }
  function draw(){
    var card=ensureCard(); if(!card||!cache) return;
    var list=cache.order, html='', warm=[];
    html+='<div class="ins-top"><div class="h2" style="margin:0">What your habits say</div>'+
      '<div class="ins-sw" role="group" aria-label="Weekday view"><button type="button" data-st="bars" class="'+(prefs.style==='bars'?'on':'')+'">Bars and text</button><button type="button" data-st="text" class="'+(prefs.style==='text'?'on':'')+'">Text only</button></div></div>'+
      '<p class="ins-sub">Best and worst weekday for each habit, plus three facts written from your logged days. A habit appears once it has '+MIN_WEEKS+' weeks of days.'+
      (hiddenCount()||showHidden?' <button type="button" class="ins-link" id="insShow">'+(showHidden?'Hide the hidden ones':'Show hidden ('+hiddenCount()+')')+'</button>':'')+'</p>';
    list.forEach(function(n){
      var a=cache.an[n]; if(!a) return; if(a.warm){ warm.push(n); return; }
      html+='<div class="ins-row"><p class="ins-n">'+esc(n)+'<small>'+a.weeks+' weeks of days</small></p>';
      if(prefs.style==='bars'){
        var mx=Math.max.apply(null,a.rate)||1;
        html+='<div class="ins-wk">'+a.rate.map(function(r,i){
          var cl=a.flat?'':(a.best.indexOf(i)>-1?'hi':(a.worst.indexOf(i)>-1?'lo':''));
          return '<div class="ins-wc"><i class="'+cl+'" style="height:'+Math.max(4,Math.round(r/mx*100))+'%" title="'+DAYS[i]+': done on '+Math.round(r*100)+'% of those days"></i><span>'+DAYS[i]+'</span></div>';
        }).join('')+'</div>';
      }
      html+='<p class="ins-line">'+weekdayLine(a)+'</p><ul class="ins-facts">';
      facts(a).forEach(function(f){
        var hid=isHidden(n,f.id);
        if(hid&&!showHidden) return;
        html+='<li class="'+(hid?'ins-off':'')+'" data-h="'+esc(n)+'" data-f="'+f.id+'"><span>'+f.t+'</span>'+
          (hid?'<button type="button" class="ins-link" data-back="1">Bring back</button>':'<button type="button" class="ins-x" aria-label="Hide this fact" data-x="1">&times;</button>')+'</li>';
      });
      html+='</ul></div>';
    });
    if(warm.length) html+='<p class="ins-warm">Still warming up, no line yet ('+MIN_WEEKS+' weeks needed): '+warm.map(esc).join(', ')+'.</p>';
    if(!list.length) html+='<p class="ins-warm">No habits found on the grid yet.</p>';
    card.innerHTML=html; wire(card);
  }
  function wire(card){
    card.querySelectorAll('[data-st]').forEach(function(b){ b.addEventListener('click',function(){ prefs.style=b.getAttribute('data-st'); savePref('ins_style',{v:prefs.style}); draw(); }); });
    var sh=card.querySelector('#insShow'); if(sh) sh.addEventListener('click',function(){ showHidden=!showHidden; draw(); });
    card.querySelectorAll('[data-x]').forEach(function(b){
      b.addEventListener('click',function(){
        var li=b.closest('li'), h=li.getAttribute('data-h'), f=li.getAttribute('data-f');
        var box=document.createElement('span'); box.className='ins-ch'; box.appendChild(document.createTextNode('Hide this: '));
        [['For now',addDays(today(),1)],['This week',monday()],['For good','good']].forEach(function(o){
          var q=document.createElement('button'); q.type='button'; q.textContent=o[0];
          q.addEventListener('click',function(){ prefs.hidden[h]=prefs.hidden[h]||{}; prefs.hidden[h][f]=o[1]; savePref('ins_hidden',prefs.hidden); draw(); });
          box.appendChild(q);
        });
        var c=document.createElement('button'); c.type='button'; c.className='g'; c.textContent='Keep it'; c.addEventListener('click',draw); box.appendChild(c);
        b.replaceWith(box);
      });
    });
    card.querySelectorAll('[data-back]').forEach(function(b){
      b.addEventListener('click',function(){ var li=b.closest('li'),h=li.getAttribute('data-h'),f=li.getAttribute('data-f'); if(prefs.hidden[h]) delete prefs.hidden[h][f]; savePref('ins_hidden',prefs.hidden); draw(); });
    });
  }

  /* ---------- run ---------- */
  function build(){
    if(building) return; var list=names(); if(!list.length) return;
    var key=list.join('|'); if(cache&&cache.key===key&&document.getElementById('insCard')){ return; }
    building=true;
    fetchDays(list).then(function(by){
      var T=today(), an={}; list.forEach(function(n){ an[n]=analyse(by[n],T); });
      cache={key:key,order:list,an:an}; draw();
    }).catch(function(e){ console.warn('habit-insights: could not build',e); }).then(function(){ building=false; });
  }
  function start(){
    try{ if(typeof sb!=='undefined'&&sb&&sb.from) db=sb; }catch(e){}
    if(!db){ if(!window.supabase){ return setTimeout(start,400); } db=window.supabase.createClient(URL_,KEY_); }
    css();
    loadPrefs().then(function(){
      var tries=0;
      (function wait(){
        if(document.querySelector('#habitGrid tr.hrow')&&document.getElementById('habitCard')){ build(); }
        else if(tries++<60) setTimeout(wait,500);
      })();
      var g=document.getElementById('habitGrid');
      if(g&&window.MutationObserver){
        new MutationObserver(function(){ clearTimeout(timer); timer=setTimeout(function(){ if(!document.getElementById('insCard')) cache=null; build(); },600); }).observe(g,{childList:true});
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start); else start();
})();
