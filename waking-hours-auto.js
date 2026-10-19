/* ============================================================================
   Time Bandit Scoreboard: automatic weekly fill, v1.1, Oct 18, 2026. Friend box counts only Social entries of 60 minutes or more. The list page uses these same rules.
   Builds the week's list if it does not exist yet, then fills in every line from what
   Project YOU has already logged (day blocks, habit log, day tallies, tagged calendar events).
   Used by the Habit Dashboard so nobody has to open the list page and press Calculate.
   Rules:
   - Lines you typed yourself (confidence "typed") are never touched.
   - Hand-worked weeks are left alone. Only lines still marked "needs your number", or lines
     this script filled earlier (note starts with "Auto") for a week that ended within 3 days.
   - Nothing is invented: no data means 0 hours, and the note says so.
   Public: WHAuto.run(sb, weekStart) -> Promise<rows>  (rows shaped like waking_hours_items)
   ============================================================================ */
(function(){
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function addDays(iso,n){var d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
function fmtDate(iso){var p=iso.split('-').map(Number);return MON[p[1]-1]+' '+p[2]+', '+p[0];}
function todayET(){try{if(window.PY&&PY.today)return PY.today();}catch(e){}return new Date(Date.now()-2*3600e3).toLocaleDateString('en-CA',{timeZone:'America/New_York'});}
function stamp(){var d=new Date();var t=d.toLocaleTimeString('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'2-digit'}).replace(' ','').toLowerCase();
  var z=(d.toLocaleTimeString('en-US',{timeZone:'America/New_York',timeZoneName:'short'}).split(' ').pop())||'ET';return fmtDate(todayET())+' · '+t+' '+z;}
function r2(n){return Math.round(n*100)/100;}
function fh(n){n=r2(n);return Math.abs(n-Math.round(n))<0.005?String(Math.round(n)):n.toFixed(2).replace(/0$/,'');}
function tmin(s){var p=String(s).split(':');return +p[0]*60+ +p[1];}

/* the starting list (same lines and order as the list page) */
var SEED=[
 ['desk','At my desk',1,'chart'],['d_amz','Amazon work (not in meetings)','desk','chart'],['d_py','Project YOU','desk','chart'],['tw','TreadWell','desk','chart'],
 ['meet','In meetings (Amazon)',0,'chart'],
 ['commute','Commuting',1,'chart'],['c_train','On the train','commute','chart'],['c_plat','Waiting on the platform','commute','chart'],['c_bike','On my bike to the stations','commute','chart'],['c_walk','Walking to and from the office','commute','chart'],
 ['bike','On a bike (not commuting)',0,'chart'],['zingo','Zingo walks (any time of day)',0,'chart'],['walks','Other walks',0,'chart'],['runs','Runs',0,'chart'],
 ['social','Social',1,'chart'],['s_friend','Face to face with a friend','social','chart'],['s_asa','Time with Åsa','social','chart'],['s_son','Being a good dad','social','chart'],['s_culture','Culture events','social','chart'],
 ['safari','Safaris (new places)',0,'chart'],
 ['mind','Mind and body habits',1,'chart'],['m_mf','Mental Fitness apps (Elevate, Imprint, Impulse)','mind','chart'],['m_ai','AI Workout','mind','chart'],['m_mc','MasterClass','mind','chart'],['m_med','Meditation','mind','chart'],['m_str','Stretching','mind','chart'],
 ['home','Home and household (Irvine)',0,'chart'],['eat','Eating',0,'chart'],['balance','Balance practice',0,'chart'],['travel','Travel (flights, trips)',0,'chart'],
 ['p_sleep','Sleep',0,'parking'],['p_day','Time in daylight',0,'parking'],['p_wall','The Wall (Sparkboard)',0,'parking'],['p_wrap',"It's a wrap",0,'parking'],['p_photo','Photo Booth',0,'parking'],
 ['p_things','Things Worth Knowing, Takeaways, The Feed',0,'parking'],['p_atomic','Atomic Habits card',0,'parking'],['p_med','Medicine, What I Woke Up To, Posture',0,'parking'],['p_coffee','Coffee making',0,'parking']
];
function seedRows(wk){return SEED.map(function(s,i){return {id:wk+':'+s[0],week_start:wk,label:s[1],parent_id:(typeof s[2]==='string')?wk+':'+s[2]:null,zone:s[3],hours:0,source_note:'Not filled in yet.',confidence:'need',sort:i,is_custom:false,updated_at:new Date().toISOString()};});}

/* tagged calendar events, overlaps removed */
async function tagged(sb,wk,tag){
  var r=await sb.from('calendar_events').select('date,start_time,end_time,hidden,skipped,dismissed').eq('tag_override',tag).gte('date',wk).lte('date',addDays(wk,6)).limit(2000);
  var byDay={},n=0;
  ((r&&r.data)||[]).filter(function(x){return !x.hidden&&!x.skipped&&!x.dismissed&&x.start_time&&x.end_time;}).forEach(function(x){(byDay[x.date]=byDay[x.date]||[]).push([tmin(x.start_time),Math.max(tmin(x.end_time),tmin(x.start_time))]);n++;});
  var mins=0;Object.keys(byDay).forEach(function(d){var iv=byDay[d].sort(function(a,b){return a[0]-b[0];}),cs=null,ce=null;
    iv.forEach(function(x){if(cs===null){cs=x[0];ce=x[1];}else if(x[0]<=ce){ce=Math.max(ce,x[1]);}else{mins+=ce-cs;cs=x[0];ce=x[1];}});if(cs!==null)mins+=ce-cs;});
  return {h:mins/60,n:n};
}

/* work out every line: returns {key:{h,conf,note}} */
async function compute(sb,wk){
  var end=addDays(wk,6);
  var res=await Promise.all([
    sb.from('day_blocks').select('day,title,mins,done').gte('day',wk).lte('day',end).limit(3000),
    sb.from('qs_log').select('date,tracker,minutes').gte('date',wk).lte('date',end).limit(3000),
    sb.from('day_tally').select('day,py,treadwell,commute,eating').gte('day',wk).lte('day',end).limit(50),
    tagged(sb,wk,'meeting'),tagged(sb,wk,'asa')]);
  var allBlocks=((res[0]&&res[0].data)||[]).filter(function(b){return b.mins>0;});
  var blocks=allBlocks.filter(function(b){return b.done!==false;});   /* habits and walks count once done; work and place blocks are saved as planned, so they count as they stand */
  var qs=((res[1]&&res[1].data)||[]).filter(function(q){return q.minutes>0;});
  var tally=(res[2]&&res[2].data)||[],tm=res[3],ta=res[4];
  var bm=function(re,all){var l=(all?allBlocks:blocks).filter(function(b){return re.test(b.title||'');});return {m:l.reduce(function(a,b){return a+b.mins;},0),n:l.length,l:l};};
  var qm=function(re){var l=qs.filter(function(q){return re.test(q.tracker||'');});var days={};l.forEach(function(q){days[q.date]=1;});return {m:l.reduce(function(a,q){return a+q.minutes;},0),n:l.length,d:Object.keys(days).length};};
  var tsum=function(f){return tally.reduce(function(a,t){return a+(+t[f]||0);},0);};
  var out={};
  function put(k,mins,conf,note){out[k]={h:r2(mins/60),conf:conf,note:note};}
  function fromQs(k,re,what){var q=qm(re);put(k,q.m,'measured',q.m?q.m+' min logged'+(q.d?', '+q.d+' day'+(q.d>1?'s':''):'')+' in your habit log.':'Nothing logged for '+what+' this week.');}

  /* desk and meetings */
  var amz=bm(/^amazon$/i,true);put('d_amz',amz.m,'worked',amz.m?'Your own Amazon blocks, '+amz.m+' min.':'No Amazon blocks this week.');
  var py=tsum('py');put('d_py',py,'measured',py?'Day tally, '+py+' min.':'No Project YOU time tallied this week.');
  var tw=tsum('treadwell');put('tw',tw,'measured',tw?'Day tally, '+tw+' min.':'No TreadWell time tallied this week.');
  put('meet',tm.h*60,'worked',tm.n?tm.n+' event'+(tm.n>1?'s':'')+' you tagged "Meeting" on Today\'s Todos, overlaps removed.':'No events tagged "Meeting" this week.');
  /* commute */
  var plat=bm(/train platform/i,true);put('c_plat',plat.m,'measured',plat.m?'Train platform blocks, '+plat.m+' min.':'No platform blocks.');
  var officeDays={};tally.forEach(function(t){if(+t.commute>0)officeDays[t.day]=1;});blocks.forEach(function(b){if(/train platform|^commute$/i.test(b.title||''))officeDays[b.day]=1;});
  var walks=blocks.filter(function(b){return /^🚶/.test(b.title||'');});
  var ny=walks.filter(function(b){return /new york/i.test(b.title);}),gw=walks.filter(function(b){return !/new york/i.test(b.title);});
  var sm=function(l){return l.reduce(function(a,b){return a+b.mins;},0);};
  var cw=ny.filter(function(b){return officeDays[b.day];}),ow=ny.filter(function(b){return !officeDays[b.day];});
  put('c_walk',sm(cw),'worked',cw.length?cw.length+' Manhattan walk'+(cw.length>1?'s':'')+' on office days.':'No recorded office-day walks.');
  put('walks',sm(ow),'measured',ow.length?ow.length+' Manhattan walk'+(ow.length>1?'s':'')+' on non-commute days.':'No other walks recorded.');
  put('zingo',sm(gw),'measured',gw.length?gw.length+' Greenwich and morning walk'+(gw.length>1?'s':'')+', any time of day.':'No Zingo walks recorded.');
  var rides=blocks.filter(function(b){return /^🚴/.test(b.title||'');});
  var cb=rides.filter(function(b){return /greenwich/i.test(b.title);}),ob=rides.filter(function(b){return !/greenwich/i.test(b.title);});
  put('c_bike',sm(cb),'worked',cb.length?cb.length+' Greenwich ride'+(cb.length>1?'s':'')+' to or from the station.':'No station rides recorded.');
  put('bike',sm(ob),'measured',ob.length?ob.length+' other ride'+(ob.length>1?'s':'')+'.':'No other rides recorded.');
  var runs=bm(/^🏃/);put('runs',runs.m,'measured',runs.m?runs.n+' run'+(runs.n>1?'s':'')+'.':'No runs recorded.');
  var comm=tsum('commute');var train=Math.max(comm-plat.m-sm(cb)-sm(cw),0);
  put('c_train',train,'worked',comm?'Commute time tallied ('+comm+' min) minus the platform, station rides and office walks.':'No commute time tallied this week.');
  /* social */
  var socAll=qs.filter(function(q){return /^social$/i.test(q.tracker||'');}),socBig=socAll.filter(function(q){return q.minutes>=60;});
  var socM=socBig.reduce(function(a,q){return a+q.minutes;},0);
  put('s_friend',socM,'worked',socM?socM+' min from '+socBig.length+' Social entr'+(socBig.length>1?'ies':'y')+' of 60 minutes or more (shorter ticks are not counted).':'No Social entries of 60 minutes or more this week.');
  var asaB=bm(/(^|\s)(åsa|asa)\b/i);
  if(ta.n)put('s_asa',ta.h*60,'worked',ta.n+' event'+(ta.n>1?'s':'')+' you tagged "With Åsa" on Today\'s Todos.');
  else put('s_asa',asaB.m,'measured',asaB.m?'Time with Åsa blocks, '+asaB.m+' min.':'Nothing tagged or blocked as time with Åsa.');
  var dad=bm(/dad/i);put('s_son',dad.m,'measured',dad.m?'Being a good dad blocks, '+dad.m+' min.':'Nothing logged this week.');
  fromQs('s_culture',/culture/i,'culture events');
  fromQs('safari',/safari/i,'safaris');
  /* mind and body */
  fromQs('m_mf',/^mental fitness$/i,'Mental Fitness');fromQs('m_ai',/^ai workout$/i,'AI Workout');fromQs('m_mc',/masterclass/i,'MasterClass');
  fromQs('m_med',/^meditat/i,'meditation');fromQs('m_str',/^stretch/i,'stretching');
  /* the rest */
  var irv=bm(/irvine/i,true);put('home',irv.m,'measured',irv.m?'Irvine blocks, '+irv.m+' min.':'No Irvine blocks this week.');
  var eat=tsum('eating');put('eat',eat,'rule',eat?'Only '+eat+' min logged, probably under-counted.':'No eating time logged, so this is under-counted.');
  fromQs('balance',/^balance$/i,'balance practice');
  put('travel',0,'measured','No trips tracked this week.');
  /* parking lot (not drawn) */
  fromQs('p_wall',/^the wall$/i,'The Wall');fromQs('p_wrap',/wrap/i,"It's a wrap");fromQs('p_photo',/photo booth/i,'Photo Booth');
  fromQs('p_things',/^(takeaways|things worth knowing|the feed)$/i,'those cards');fromQs('p_atomic',/^atomic habits/i,'Atomic Habits');
  fromQs('p_med',/^(medicine|what i woke up to|posture)$/i,'those cards');fromQs('p_coffee',/^coffee/i,'coffee');
  return out;
}

/* the entry point */
async function run(sb,wk){
  var r=await sb.from('waking_hours_items').select('id,label,parent_id,zone,hours,source_note,confidence,sort,is_custom').eq('week_start',wk).order('sort');
  var rows=(r&&r.data)||[];
  var created=false;
  if(!rows.length){rows=seedRows(wk);created=true;}
  var weekEnded=addDays(wk,6)<todayET();
  var fresh=addDays(wk,9)>=todayET();   /* ended within 3 days, or still running */
  var todo=rows.filter(function(x){
    var key=String(x.id).split(':').slice(1).join(':');
    if(x.is_custom||x.confidence==='typed'||/^(p_sleep|p_day)$/.test(key))return false;
    if(rows.some(function(y){return y.parent_id===x.id;}))return false;   /* group headers hold no hours */
    if(x.confidence==='need')return true;
    return fresh&&/^Auto/.test(x.source_note||'');
  });
  if(!todo.length&&!created)return rows;
  var vals=await compute(sb,wk),when=stamp(),changed=[];
  rows.forEach(function(x){
    if(todo.indexOf(x)<0&&!created)return;
    var key=String(x.id).split(':').slice(1).join(':'),v=vals[key];if(!v)return;
    if(created&&/^(p_sleep|p_day)$/.test(key))return;
    var isGroup=rows.some(function(y){return y.parent_id===x.id;})||SEED.some(function(s){return s[0]===key&&s[2]===1;});
    x.hours=isGroup?0:v.h;x.confidence=v.conf;x.source_note='Auto, '+when+': '+v.note;x.updated_at=new Date().toISOString();changed.push(x);
  });
  if(changed.length||created){
    try{await sb.from('waking_hours_items').upsert((created?rows:changed).map(function(x){return {id:x.id,week_start:wk,label:x.label,parent_id:x.parent_id,zone:x.zone,hours:x.hours,source_note:x.source_note,confidence:x.confidence,sort:x.sort,is_custom:!!x.is_custom,updated_at:x.updated_at};}));}
    catch(e){try{console.warn('Scoreboard auto-fill could not save',e);}catch(_){}}
  }
  return rows;
}
window.WHAuto={run:run,compute:compute,stamp:stamp};
})();
