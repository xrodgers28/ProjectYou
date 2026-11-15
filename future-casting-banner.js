/* Time Spent Future Casting, habits dashboard banner v1.0 (Nov 15, 2026).
   How much of the week's FREE time went on things that plan for the future.
   Free time = every day's 24 hours (5am to 5am) minus sleep, the day job, commute and eating.
   Reads day_blocks (Todays Tasks time blocks) and health_metrics (Apple Watch sleep times); settings live in app_meta.future_casting_cfg.
   Only time that has already happened counts. Shadow root, so no page styles leak in. */
(function(){
var CSS="\n:host{display:block;margin:9px 0;--card:#fff;--sunk:#f4f6f9;--line:#e3e7ee;--ink:#1f2a44;--muted:#5b6472;--faint:#9aa6b4;--accent:#3f6f8f;--good:#1e8e5a;--goodink:#17734a;--goodbg:#e9f5ef;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:var(--ink)}\n*{box-sizing:border-box}button,input,select{font-family:inherit}\n.bn{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}\n.face{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;position:relative}\n.face:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}\n.strip{height:120px;display:flex;align-items:center;gap:16px;padding:0 28px 0 16px}\n.ttl{width:150px;height:108px;display:flex;align-items:center;flex:none}\n.ttl span{font-size:17px;line-height:1.2;font-weight:800;color:var(--ink)}\n.bars{flex:1;height:108px;display:flex;gap:2px;min-width:0}\n.grp{display:flex;gap:2px;min-width:0}\n.seg{position:relative;border-radius:4px;min-width:3px}\n.seg .lbl{position:absolute;left:6px;top:50%;transform:translateY(-50%);white-space:nowrap;font-size:12px;font-weight:700;color:var(--ink);background:rgba(255,255,255,.96);border-radius:6px;padding:4px 8px;opacity:0;z-index:5;pointer-events:none;box-shadow:0 1px 4px rgba(31,42,68,.15)}\n.seg:hover .lbl{opacity:1}\n.seg:hover{z-index:4}\n.rt{display:flex;flex-direction:column;align-items:flex-end;gap:2px;width:190px;flex:none}\n.pct{font-size:42px;font-weight:800;line-height:1;color:var(--faint)}\n.rt .of{font-size:11.5px;color:#8a93a1}\n.rt .tot{font-size:11.5px;color:var(--muted);margin-top:4px;text-align:right}\n.arr{position:absolute;left:50%;bottom:1px;transform:translateX(-50%);color:#9aa6b4;opacity:.55;display:flex;pointer-events:none}\n.arr svg{width:10px;height:10px;transition:transform .25s ease}.bn.open .arr svg{transform:rotate(180deg)}\n.drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s ease}\n.bn.open .drop{grid-template-rows:1fr}.drop>.in{overflow:hidden;min-height:0}\n@media(prefers-reduced-motion:reduce){.drop,.arr svg{transition:none}}\n.tabs{display:flex;align-items:center;height:50px;padding:0 28px;border-top:1px solid var(--line);border-bottom:1px solid var(--line);gap:28px}\n.tabs .nm{font-size:15px;font-weight:800;width:220px;flex:none}\n.tab{all:unset;cursor:pointer;font-size:13px;font-weight:700;color:var(--muted);height:47px;display:flex;align-items:center;box-sizing:border-box;border-bottom:3px solid transparent}\n.tab[aria-selected=true]{color:var(--accent);border-bottom-color:var(--accent)}\n.tab:focus-visible{outline:2px solid var(--accent);outline-offset:-2px}\n.tabs .wk{margin-left:auto;font-size:12px;color:var(--faint)}\n.cls{all:unset;cursor:pointer;font-size:12px;font-weight:700;color:var(--accent)}\n.p1{display:flex;gap:36px;padding:24px 28px 28px}\n.p1 .l{flex:1 1 56%;min-width:0;display:flex;flex-direction:column;gap:14px}\n.p1 .r{flex:1 1 40%;min-width:0;display:flex;flex-direction:column;gap:16px}\nh3{margin:0;font-size:14px;font-weight:800}\n.ebar{display:flex;height:48px;gap:2px;border-radius:10px;overflow:hidden}\n.ebar div{color:var(--ink);padding:6px 8px;display:flex;flex-direction:column;justify-content:center;min-width:0;overflow:hidden;white-space:nowrap}\n.ebar b{font-size:12px}.ebar span{font-size:11px}\n.tbl{border:1px solid var(--line);border-radius:10px;overflow:hidden}\n.tr{display:flex;align-items:center;padding:9px 14px;gap:10px;font-size:13px;border-top:1px solid var(--line)}\n.tr.h{border-top:0;background:var(--sunk);font-size:11px;font-weight:700;letter-spacing:.06em;color:var(--muted)}\n.tr .sw{width:12px;height:12px;border-radius:3px;flex:none}\n.tr img{width:24px;height:24px;object-fit:contain;flex:none}\n.tr .n{flex:1;min-width:0}.tr .t{width:80px;text-align:right}.tr .p{width:110px;text-align:right;font-weight:700}\n.tr.sum{border-top:2px solid var(--ink);background:var(--goodbg);font-size:14px;font-weight:800;padding:11px 14px}.tr.sum .n{color:var(--goodink)}.tr.sum .p{color:var(--goodink)}\n.empty{padding:16px 14px;font-size:13px;color:var(--muted)}\n.sub{font-size:12.5px;color:var(--muted)}\n.day{display:flex;flex-direction:column;gap:5px}\n.day .row{display:flex;justify-content:space-between;align-items:baseline}\n.day .row b{font-size:13px}.day .row .v{font-size:22px;font-weight:800;color:var(--goodink)}.day .row .v i{font-style:normal;font-size:12px;font-weight:600;color:var(--muted)}\n.trk{height:12px;border-radius:6px;background:#eef1f6;overflow:hidden}.trk div{height:100%;background:var(--good)}\n.day small{font-size:11.5px;color:var(--muted)}\n.wkline{display:flex;justify-content:space-between;font-size:12px;color:var(--muted);border-top:1px solid var(--line);padding-top:8px}.wkline b{color:var(--ink)}\n.trend{border-top:1px solid var(--line);padding-top:14px;display:flex;flex-direction:column;gap:8px}\n.tb{display:flex;align-items:flex-end;gap:16px;height:96px}\n.tb div{display:flex;flex-direction:column;align-items:center;gap:3px;width:60px}\n.tb em{font-style:normal;font-size:12px;color:var(--muted)}.tb i{display:block;width:36px;border-radius:6px 6px 0 0;background:#9ac9b5}.tb span{font-size:11px;color:var(--muted)}\n.tb .now em{font-weight:700;color:var(--goodink)}.tb .now i{background:var(--good)}.tb .now span{font-weight:700;color:var(--ink)}\n.chips{display:flex;gap:10px;align-items:center;flex-wrap:wrap}\n.chip{font-size:12.5px;font-weight:700;color:var(--goodink);background:var(--goodbg);border-radius:999px;padding:5px 12px}\n.chips .sm{font-size:12px;color:var(--muted)}\n.btn{all:unset;cursor:pointer;font-size:12px;font-weight:700;color:#fff;background:var(--accent);border-radius:999px;padding:5px 12px}\n.btn:focus-visible{outline:2px solid var(--ink);outline-offset:2px}\n.steps{display:flex;gap:10px;padding:18px 28px 0}\n.step{flex:1;background:var(--sunk);border-radius:10px;padding:10px 12px;display:flex;gap:10px;align-items:flex-start;font-size:12.5px;line-height:1.4}\n.step u{text-decoration:none;width:22px;height:22px;border-radius:50%;background:var(--accent);color:#fff;font-size:12px;font-weight:700;display:flex;align-items:center;justify-content:center;flex:none}\n.step.g{background:var(--goodbg)}.step.g u{background:var(--good)}\n.p2{display:flex;gap:36px;padding:20px 28px 26px}\n.p2 .l{flex:1 1 58%;min-width:0;display:flex;flex-direction:column;gap:12px}.p2 .r{flex:1 1 38%;min-width:0;display:flex;flex-direction:column;gap:12px}\n.add{display:flex;gap:10px}\n.add input{flex:1;min-width:0;border:2px solid var(--accent);border-radius:10px;height:44px;padding:0 14px;font-size:13.5px;color:var(--ink);background:#fff}\n.add select{width:150px;border:1px solid var(--line);border-radius:10px;height:44px;padding:0 10px;font-size:12.5px;background:var(--sunk);color:var(--ink)}\n.add .btn{height:44px;display:flex;align-items:center;border-radius:10px;padding:0 20px;font-size:13px;font-weight:800}\n.lists{display:flex;gap:16px}\n.box{flex:1;min-width:0;border:1px solid var(--good);border-radius:12px;overflow:hidden;align-self:flex-start}\n.box.no{border-color:#c2c8d1;background:var(--sunk)}\n.box .hd{background:var(--goodbg);padding:10px 14px;display:flex;justify-content:space-between;align-items:baseline}.box .hd b{font-size:13px;color:var(--goodink)}.box .hd span{font-size:11.5px;color:var(--muted)}\n.box.no .hd{background:#eceff2}.box.no .hd b{color:var(--muted)}\n.li{display:flex;align-items:center;gap:9px;padding:9px 14px;border-top:1px solid var(--line);font-size:12.5px}\n.li.new{background:#fdf6e6}\n.li input{width:16px;height:16px;accent-color:var(--good);margin:0;flex:none;cursor:pointer}\n.li input:disabled{cursor:not-allowed}\n.li .sw{width:10px;height:10px;border-radius:3px;flex:none}\n.li label{flex:1;min-width:0;cursor:pointer}.box.no .li label{color:var(--muted)}\n.li .tg{font-size:10.5px;font-weight:700;color:var(--muted);white-space:nowrap}.li .tg.bk{color:#8a5d10}\n.li .hh{font-size:11px;color:var(--muted);white-space:nowrap}\n.li .rm{all:unset;cursor:pointer;color:#aab4c8;font-size:15px;line-height:1;padding:0 2px}\n.li .rm:hover{color:var(--ink)}\n.hint{font-size:12px;color:var(--muted)}\n.ex{display:flex;flex-direction:column;gap:4px}.ex .row{display:flex;justify-content:space-between;font-size:13px}.ex small{font-size:11px;color:var(--muted)}\n.ex .tk{height:8px;border-radius:4px;background:#eef1f6}.ex .tk div{height:8px;border-radius:4px}\n.free{border-top:2px solid var(--ink);padding-top:10px;display:flex;flex-direction:column;gap:5px}\n.free .row{display:flex;justify-content:space-between;font-size:13px}\n.free .fr{font-size:14px;font-weight:800;color:var(--goodink);background:var(--goodbg);border-radius:8px;padding:8px 10px}\n.msg{padding:26px 28px;font-size:13px;color:var(--muted)}\n.bn.narrow .strip{height:auto;flex-wrap:wrap;padding:12px 14px;gap:10px}.bn.narrow .ttl{width:auto;height:auto;flex:1 1 55%}.bn.narrow .rt{width:auto;align-items:flex-end;flex:1 1 35%}.bn.narrow .pct{font-size:32px}.bn.narrow .bars{flex:1 1 100%;height:56px}\n.bn.narrow .tabs{padding:0 14px;gap:14px;overflow-x:auto}.bn.narrow .tabs .nm{display:none}.bn.narrow .p1,.bn.narrow .p2{flex-direction:column;padding:16px 14px;gap:20px}.bn.narrow .lists{flex-direction:column}.bn.narrow .steps{flex-direction:column;padding:14px 14px 0}\n";
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
var WIN0=300,WIN1=1740; /* a day runs 5am to 5am, same window as Daily Routine of a Creative */
var BK='#CF9088',NOWC='#DFE7F0',UNLC='#F4F6F9';
var CUSTOM_COLORS=['#7FB8C9','#B79BD0','#8DBE6E','#D9A441'];
/* The rules. Order matters: the first one that matches a block decides where its time goes.
   b is the default bucket: f = Future, k = Looking back, n = Now. A flipped rule moves across. */
var RULES=[
 {id:'rap',label:"[RAP] and It\u2019s a wrap",b:'k',t:function(x){return /\[rap\]|\brap\b|it.?s a wrap/i.test(x.title)}},
 {id:'wr',label:'Weekly Review',b:'k',t:function(x){return /weekly review|week in review/i.test(x.title)}},
 {id:'log',label:'Social, Learning, Safari logging',b:'k',t:function(x){return /(social|learning|safari)[^a-z]{0,3}log|log[^a-z]{0,3}(social|learning|safari)/i.test(x.title)}},
 {id:'sort',label:'Photo and receipt sorting',b:'k',t:function(x){return /photo|receipt/i.test(x.title)}},
 {id:'pyup',label:'Project YOU upkeep',b:'n',t:function(x){return x.cat==='py'&&/upkeep|fix|maint|bug|publish|clean/i.test(x.title)}},
 {id:'tw',label:'TreadWell building',b:'f',c:'#4FA08A',ic:'countries',t:function(x){return x.pill==='treadwell'||/treadwell/i.test(x.title)}},
 {id:'py',label:'Project YOU, new building',b:'f',c:'#5B8FCE',ic:'pywheel',t:function(x){return x.cat==='py'}},
 {id:'learn',label:'Learning and skills',b:'f',c:'#C6A63F',ic:'lifelong',t:function(x){return /learn|course|study|lesson|podcast/i.test(x.title)}},
 {id:'trips',label:'Planning trips and events',b:'f',c:'#E0975A',ic:'travelplan',t:function(x){return /trip|itinerary|tripit|travel plan|places to visit|plan.{0,12}(event|trip)/i.test(x.title)}},
 {id:'life',label:'Money, family and life planning',b:'f',c:'#7D81C2',ic:'finance',t:function(x){return /family planning|financ|money|budget|invest|\btax|estate|life plan|college|retire/i.test(x.title)}}
];
var SHORT={tw:'TreadWell',py:'Project YOU',learn:'Learning',trips:'Trips',life:'Life'};
var cfg={custom:[],flip:{},target:null};
var allRules=[];
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function rebuildRules(){
 var cs=cfg.custom.map(function(c,i){var kw=String(c.kw||c.label).toLowerCase();return {id:c.id,label:c.label,b:c.b,c:c.b==='f'?CUSTOM_COLORS[i%CUSTOM_COLORS.length]:null,custom:true,isNew:!!c.isNew,t:function(x){return x.title.toLowerCase().indexOf(kw)>=0}}});
 allRules=cs.concat(RULES);
}
function eff(r){var f=!!cfg.flip[r.id];return f?(r.b==='f'?'n':'f'):r.b}
/* ---------- dates and times ---------- */
function ymd(t){var a=t.split('-');return Date.UTC(+a[0],+a[1]-1,+a[2])}
function addD(s,n){var d=new Date(ymd(s)+n*864e5);return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2)}
function today(){try{if(window.PY&&PY.today){var t=PY.today();if(/^\d{4}-\d{2}-\d{2}$/.test(t))return t}}catch(e){}return new Date().toISOString().slice(0,10)}
function nowMin(){try{var p=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'numeric',minute:'numeric',hour12:false}).formatToParts(new Date()),h=0,m=0;p.forEach(function(x){if(x.type==='hour')h=+x.value%24;if(x.type==='minute')m=+x.value});var v=h*60+m;return v<WIN0?v+1440:v}catch(e){return WIN1}}
function mins(str,base){var m=/^(\d{4}-\d{2}-\d{2})T(\d\d):(\d\d)/.exec(str||'');if(!m)return null;return Math.round((ymd(m[1])-ymd(base))/864e5)*1440+(+m[2])*60+(+m[3])}
function lab(s){var a=s.split('-');return MON[+a[1]-1]+' '+(+a[2])}
function monOf(t){var dow=new Date(ymd(t)).getUTCDay();return addD(t,-((dow+6)%7))}
function fm(m){m=Math.round(m);var h=Math.floor(m/60),r=m%60;return h?(r?h+'h '+(r<10?'0':'')+r+'m':h+'h'):r+'m'}
function pc(a,b,d){return b>0?(100*a/b).toFixed(d==null?1:d):'0'}
/* ---------- the numbers ---------- */
function weekStats(mon,raw){
 var td=today(),nm=nowMin(),days=[],tot={free:0,fut:0,back:0,now:0,unl:0,s:0,j:0,c:0,e:0,n:0},by={};
 for(var i=0;i<7;i++){
  var iso=addD(mon,i),nx=addD(iso,1),d={iso:iso,d:DN[i],counted:iso<=td,free:0,fut:0,back:0,now:0,unl:0,s:0,j:0,c:0,e:0};
  if(!d.counted){days.push(d);continue}
  var lim=iso===td?Math.min(WIN1,Math.max(WIN0,nm)):WIN1,arr=new Int16Array(WIN1-WIN0),sl=raw.sleep[iso],sn=raw.sleep[nx];
  var rise=sl?mins(sl.sleepEnd,iso):null,bed=sn?mins(sn.sleepStart,iso):null;
  if(rise==null||rise<WIN0||rise>900)rise=raw.avgRise;if(bed==null||bed<900||bed>WIN1)bed=raw.avgBed;
  var bl=(raw.blocks[iso]||[]).filter(function(b){return b.mins>0&&b.start_min<lim&&(b.cat!=='hab'||b.done)});
  var mark=function(s,m,v){var a=Math.max(WIN0,s),z=Math.min(lim,s+m);for(var q=a;q<z;q++)arr[q-WIN0]=v};
  [2,1,0].forEach(function(bi){ /* Now first, Looking back over it, Future over both */
   bl.forEach(function(b){
    if(b.pill==='amz'||(b.cat==='own'&&b.amz)||b.pill==='commute'||b.pill==='eating')return;
    var hit=null,k;for(k=0;k<allRules.length;k++){if(allRules[k].t(b)){hit=allRules[k];break}}
    var e=hit?eff(hit):'n',bu=e==='f'?0:e==='k'?1:2;if(bu!==bi)return;
    mark(b.start_min,b.mins,hit?100+k*3+bu:10)})});
  /* what you cannot spend: eating first, then commute, day job, sleep on top, so sleep wins any overlap */
  bl.forEach(function(b){if(b.pill==='eating')mark(b.start_min,b.mins,4)});
  bl.forEach(function(b){if(b.pill==='commute')mark(b.start_min,b.mins,3)});
  bl.forEach(function(b){if(b.pill==='amz'||(b.cat==='own'&&b.amz))mark(b.start_min,b.mins,2)});
  mark(WIN0,rise-WIN0,1);mark(bed,WIN1-bed,1);
  var mh=Math.min(lim,WIN1);
  for(var q=WIN0;q<mh;q++){var v=arr[q-WIN0];
   if(v===0){d.unl++;d.free++}
   else if(v>=1&&v<=4){if(v===1)d.s++;else if(v===2)d.j++;else if(v===3)d.c++;else d.e++}
   else{d.free++;if(v===10)d.now++;else{var ri=Math.floor((v-100)/3),bu=(v-100)%3;by[allRules[ri].id]=(by[allRules[ri].id]||0)+1;if(bu===0)d.fut++;else if(bu===1)d.back++;else d.now++}}}
  days.push(d)}
 days.forEach(function(d){['free','fut','back','now','unl','s','j','c','e'].forEach(function(k){tot[k]+=d[k]});if(d.counted)tot.n++});
 return {mon:mon,end:addD(mon,6),days:days,tot:tot,by:by,pct:tot.free>0?100*tot.fut/tot.free:0}}
function futByRule(st){var out=[];allRules.forEach(function(r){if(eff(r)!=='f')return;var m=0;
 /* only blocks that ended in the Future bucket; by[] holds every rule's minutes, so a flipped rule is handled here */
 m=st.by[r.id]||0;if(m>0)out.push({r:r,m:m})});return out}
/* ---------- drawing ---------- */
var chev='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function icon(k){try{var s=window.ICONS&&ICONS[k];return s?'<img src="'+s+'" alt="">':''}catch(e){return ''}}
function strip(S){
 var st=S.st,t=st.tot,fr=futByRule(st),fut=fr.reduce(function(a,x){return a+x.m},0),segs='';
 var one=function(m,c,name){if(m<=0)return '';return '<div class="seg" style="flex:'+m+';background:'+c+'"><span class="lbl">'+esc(name)+' &middot; '+fm(m)+' &middot; '+pc(m,t.free,0)+'%</span></div>'};
 segs+='<div class="grp" style="flex:'+Math.max(fut,0.0001)+'">'+fr.map(function(x){return one(x.m,x.r.c,SHORT[x.r.id]||x.r.label).replace('style="flex:'+x.m+';','style="flex:'+x.m+';')}).join('')+'</div>';
 segs+=one(t.now,NOWC,'Now')+one(t.back,BK,'Looking back')+one(t.unl,UNLC,'Unlogged');
 if(t.free<=0)segs='<div class="seg" style="flex:1;background:'+UNLC+'"></div>';
 var avg=t.n?fut/t.n:0;
 return '<div class="strip"><div class="ttl"><span>Time Spent<br>Future Casting</span></div><div class="bars">'+segs+'</div><div class="rt"><span class="pct">'+Math.round(t.free>0?100*fut/t.free:0)+'%</span><span class="of">of free time</span><span class="tot">'+fm(fut)+' total &middot; '+fm(avg)+' a day avg</span></div></div>'}
function dayRow(name,sub,avgMin,v){return '<div class="day"><div class="row"><b>'+name+'</b><span class="v">'+fm(avgMin)+' <i>a day</i></span></div><div class="trk"><div style="width:'+Math.min(100,100*avgMin/1440).toFixed(1)+'%"></div></div><small>'+sub+'</small></div>'}
function panel1(S){
 var st=S.st,t=st.tot,fr=futByRule(st).sort(function(a,b){return b.m-a.m}),fut=fr.reduce(function(a,x){return a+x.m},0);
 var left='<h3>Where your Future Casting time went this week</h3>';
 if(!fr.length){left+='<div class="tbl"><div class="empty">Nothing logged as Future Casting yet this week. Time shows up here once it has happened and is tagged to something that counts.</div></div>'}
 else{
  left+='<div class="ebar">'+fr.map(function(x){return '<div style="flex:'+x.m+';background:'+x.r.c+'"><b>'+esc(SHORT[x.r.id]||x.r.label)+'</b><span>'+fm(x.m)+'</span></div>'}).join('')+'</div>';
  left+='<div class="tbl"><div class="tr h"><span class="n">EVENT</span><span class="t">TIME</span><span class="p">% OF FREE TIME</span></div>'+fr.map(function(x){return '<div class="tr"><span class="sw" style="background:'+x.r.c+'"></span>'+(x.r.ic?icon(x.r.ic):'')+'<span class="n">'+esc(x.r.label)+'</span><span class="t">'+fm(x.m)+'</span><span class="p">'+pc(x.m,t.free)+'%</span></div>'}).join('')+'<div class="tr sum"><span class="n">Future Casting total</span><span class="t">'+fm(fut)+'</span><span class="p">'+pc(fut,t.free)+'%</span></div></div>'}
 var wd=st.days.slice(0,5).filter(function(d){return d.counted}),we=st.days.slice(5).filter(function(d){return d.counted});
 var sum=function(a){return a.reduce(function(x,d){return x+d.free},0)};
 var right='<div class="day" style="gap:10px"><h3>Your free time per day</h3><span class="sub">Only the hours left after sleep, your day job, commute and eating. These hours are what the % is out of.</span></div>';
 right+=wd.length?dayRow('Weekdays (Mon to Fri)',fm(sum(wd))+' across '+wd.length+(wd.length===1?' day':' days'),sum(wd)/wd.length):'<div class="day"><b>Weekdays (Mon to Fri)</b><small>No weekday has happened yet in this week.</small></div>';
 right+=we.length?dayRow('Weekend days (Sat, Sun)',fm(sum(we))+' across '+we.length+(we.length===1?' day':' days'),sum(we)/we.length):'<div class="day"><b>Weekend days (Sat, Sun)</b><small>The weekend has not happened yet in this week.</small></div>';
 right+='<div class="wkline"><span>Whole week free time</span><b>'+fm(t.free)+'</b></div>';
 var tr=S.trend,mx=Math.max.apply(null,tr.map(function(w){return w.pct}).concat([1]));
 right+='<div class="trend"><h3>Last 4 weeks</h3><div class="tb">'+tr.map(function(w,i){var now=i===tr.length-1;return '<div class="'+(now?'now':'')+'"><em>'+Math.round(w.pct)+'%</em><i style="height:'+Math.max(4,Math.round(58*w.pct/mx))+'px"></i><span>'+(now?(S.isCur?'this wk':lab(w.mon)):lab(w.mon))+'</span></div>'}).join('')+'</div>'+targetBlock(S)+'</div>';
 return '<div class="p1"><div class="l">'+left+'</div><div class="r">'+right+'</div></div>'}
function sugTarget(S){var done=S.trend.filter(function(w){return w.end<today()&&w.tot.free>0});if(done.length<3)return null;return Math.max(1,Math.round(done.reduce(function(a,w){return a+w.pct},0)/done.length))}
function targetBlock(S){
 var tg=cfg.target,tr=S.trend,h='<div class="chips">';
 if(tg){var hit=0;for(var i=tr.length-1;i>=0;i--){if(tr[i].pct>=tg)hit++;else break}
  h+=(hit?'<span class="chip">'+hit+(hit===1?' week':' weeks')+' in a row at target</span>':'<span class="chip" style="color:#8a5d10;background:#fdf6e6">Below target this week</span>')+'<span class="sm">Target '+tg+'% of free time</span><button class="btn" data-act="clear-target" style="background:#9aa6b4">Change</button>'}
 else{var sg=sugTarget(S);
  if(sg)h+='<span class="sm">Target: not set yet. Your last weeks average '+sg+'%.</span><button class="btn" data-act="set-target" data-v="'+sg+'">Set target to '+sg+'%</button>';
  else h+='<span class="sm">Target: set after week 4</span>'}
 return h+'</div>'}
function ruleLi(r,st,on){
 var m=st.by[r.id]||0;
 return '<div class="li'+(r.isNew?' new':'')+'"><input type="checkbox" id="r_'+r.id+'" data-rule="'+r.id+'"'+(on?' checked':'')+'>'+(on&&r.c?'<span class="sw" style="background:'+r.c+'"></span>':'')+'<label for="r_'+r.id+'"'+(r.isNew?' style="font-weight:700"':'')+'>'+esc(r.label)+'</label>'+(m?'<span class="hh">'+fm(m)+'</span>':'')+(on?'':'<span class="tg'+(r.b==='k'?' bk':'')+'">'+(r.b==='k'?'Looking back':'Now')+'</span>')+(r.custom?'<button class="rm" data-act="rm" data-id="'+r.id+'" title="Remove">&times;</button>':'')+'</div>'}
function panel2(S){
 var st=S.st,t=st.tot,yes=allRules.filter(function(r){return eff(r)==='f'}),no=allRules.filter(function(r){return eff(r)!=='f'});
 var fut=futByRule(st).reduce(function(a,x){return a+x.m},0),span=t.free+t.s+t.j+t.c+t.e;
 var steps='<div class="steps"><div class="step"><u>1</u><span><b>Start with the week.</b> Every day counts from 5am to 5am, up to now.</span></div><div class="step"><u>2</u><span><b>Take out what you cannot use.</b> Sleep, day job, commute, eating.</span></div><div class="step"><u>3</u><span><b>Sort what is left.</b> Future, Now or Looking back.</span></div><div class="step g"><u>4</u><span><b>Future time divided by free time</b> is your Future Casting %.</span></div></div>';
 var add='<div class="add"><input id="newTxt" type="text" placeholder="Type something to add, like Lisbon neighborhoods" aria-label="New thing to count" maxlength="60"><select id="newB" aria-label="Where it goes"><option value="f">Counts</option><option value="n">Does not count</option></select><button class="btn" data-act="add" type="button">Add</button></div><span class="hint">Matches any time block whose name contains those words. Tick or untick to move an item across.</span>';
 var lists='<div class="lists"><div class="box"><div class="hd"><b>COUNTS as Future</b><span>'+yes.length+(yes.length===1?' thing':' things')+'</span></div>'+yes.map(function(r){return ruleLi(r,st,true)}).join('')+'</div><div class="box no"><div class="hd"><b>DOES NOT COUNT</b><span>'+(no.length+1)+' things</span></div><div class="li"><input type="checkbox" disabled title="The day job never counts as Future"><label style="cursor:default">Day job (Amazon)</label>'+(t.j?'<span class="hh">'+fm(t.j)+'</span>':'')+'<span class="tg">Never</span></div>'+no.map(function(r){return ruleLi(r,st,false)}).join('')+'</div></div>';
 var ex=function(n,v,c,src){return '<div class="ex"><div class="row"><span>'+n+'</span><b>'+fm(v)+'</b></div><div class="tk"><div style="width:'+Math.min(100,100*v/span).toFixed(1)+'%;background:'+c+'"></div></div><small>'+src+'</small></div>'};
 var left=t.s+t.j+t.c+t.e;
 var r='<div><h3>Left out of the math</h3><span class="sub">Time you cannot spend on Future Casting.</span></div>'+ex('Sleep',t.s,'#9AA6B4','from Apple Watch sleep times')+ex('Day job (Amazon)',t.j,'#8A93A1','from your calendar')+ex('Commute',t.c,'#8A93A1','from your Commute tags')+ex('Eating',t.e,'#8A93A1','from your Eating pills')+'<div class="free"><div class="row"><span>Total left out</span><b>'+fm(left)+'</b></div><div class="row fr"><span>Free time</span><span>'+fm(t.free)+'</span></div><span class="hint">'+fm(span)+' minus '+fm(left)+'. Future Casting '+fm(fut)+' is '+pc(fut,t.free,0)+'% of this.</span></div>';
 return steps+'<div class="p2"><div class="l">'+add+lists+'</div><div class="r">'+r+'</div></div>'}
/* ---------- the banner ---------- */
function mk(host){
 var root=host.attachShadow({mode:'open'}),open=false,tab=1,S=null,busy=false,again=false,err=null;
 try{open=localStorage.getItem('fcb_open')==='1'}catch(e){}
 function render(){
  var body;
  if(err)body='<div class="msg">Time Spent Future Casting could not load this week. Try the page again in a minute.</div>';
  else if(!S)body='<div class="msg">Counting this week...</div>';
  else body=tab===1?panel1(S):panel2(S);
  var face=err||!S?'<div class="strip"><div class="ttl"><span>Time Spent<br>Future Casting</span></div><div class="bars"><div class="seg" style="flex:1;background:'+UNLC+'"></div></div><div class="rt"><span class="pct">&middot;&middot;&middot;</span></div></div>':strip(S);
  var tabs='<div class="tabs" role="tablist"><span class="nm">Time Spent Future Casting</span>'+[[1,'1&nbsp;&nbsp;How it went'],[2,'2&nbsp;&nbsp;How it is counted']].map(function(x){return '<button class="tab" role="tab" type="button" data-tab="'+x[0]+'" aria-selected="'+(tab===x[0])+'">'+x[1]+'</button>'}).join('')+'<span class="wk">'+(S?(S.isCur?'This week':lab(S.st.mon)+' to '+lab(S.st.end))+(S.st.tot.n<7&&S.st.tot.n>0?' &middot; '+S.st.tot.n+' of 7 days so far':''):'')+'</span><button class="cls" type="button" data-act="toggle">Close &#9652;</button></div>';
  var keep=root.getElementById&&root.getElementById('newTxt'),val=keep?keep.value:'';
  root.innerHTML='<style>'+CSS+'</style><div class="bn'+(open?' open':'')+'" id="bn"><button class="face" type="button" aria-expanded="'+open+'" data-act="toggle" aria-label="Time Spent Future Casting, tap to '+(open?'close':'open')+'">'+face+'<span class="arr">'+chev+'</span></button><div class="drop"><div class="in">'+tabs+body+'</div></div></div>';
  fit();var nt=root.getElementById('newTxt');if(nt&&val)nt.value=val}
 function fit(){var b=root.getElementById('bn');if(b)b.classList.toggle('narrow',host.clientWidth<640)}
 function save(){var v=JSON.stringify(cfg);try{localStorage.setItem('fcb_cfg',v)}catch(e){}
  try{var sb=window.sb;if(sb)sb.from('app_meta').upsert({key:'future_casting_cfg',value:v,updated_at:new Date().toISOString()}).then(function(){},function(){})}catch(e){}}
 function recompute(){rebuildRules();if(!S)return;S.st=weekStats(S.mon,S.raw);S.trend=[3,2,1,0].map(function(k){return k?weekStats(addD(S.mon,-7*k),S.raw):S.st});render()}
 root.addEventListener('click',function(e){var el;
  if((el=e.target.closest('[data-tab]'))){tab=+el.getAttribute('data-tab');render();return}
  if((el=e.target.closest('[data-act]'))){var a=el.getAttribute('data-act');
   if(a==='toggle'){open=!open;try{localStorage.setItem('fcb_open',open?'1':'0')}catch(x){}var b=root.getElementById('bn');b.classList.toggle('open',open);var f=root.querySelector('.face');if(f)f.setAttribute('aria-expanded',open);return}
   if(a==='add'){var inp=root.getElementById('newTxt'),sel=root.getElementById('newB'),txt=(inp.value||'').trim();if(!txt)return;
    cfg.custom.unshift({id:'c'+Date.now().toString(36),label:txt,kw:txt,b:sel.value==='f'?'f':'n',isNew:true});inp.value='';save();recompute();return}
   if(a==='rm'){var id=el.getAttribute('data-id');cfg.custom=cfg.custom.filter(function(c){return c.id!==id});delete cfg.flip[id];save();recompute();return}
   if(a==='set-target'){cfg.target=+el.getAttribute('data-v');save();render();return}
   if(a==='clear-target'){cfg.target=null;save();render();return}}});
 root.addEventListener('change',function(e){var el=e.target;if(el&&el.getAttribute&&el.getAttribute('data-rule')){var id=el.getAttribute('data-rule');if(cfg.flip[id])delete cfg.flip[id];else cfg.flip[id]=true;cfg.custom.forEach(function(c){if(c.id===id)c.isNew=false});save();recompute()}});
 root.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target&&e.target.id==='newTxt'){e.preventDefault();var b=root.querySelector('[data-act="add"]');if(b)b.click()}});
 if(window.ResizeObserver)new ResizeObserver(fit).observe(host);
 /* ---------- data ---------- */
 function weekMon(){try{if(typeof WEEK_END!=='undefined'&&/^\d{4}-\d{2}-\d{2}$/.test(WEEK_END))return addD(WEEK_END,-6)}catch(e){}return monOf(today())}
 function load(){
  var mon=weekMon(),sb=window.sb;if(!sb)return;if(busy){again=true;return}busy=true;var lo=addD(mon,-21),hi=addD(mon,6);
  Promise.all([
   sb.from('day_blocks').select('day,start_min,mins,cat,pill,title,done,amz').gte('day',lo).lte('day',hi).limit(4000),
   sb.from('health_metrics').select('day,extras').gte('day',addD(lo,-1)).lte('day',addD(hi,1)).limit(4000)
  ]).then(function(r){var e0=r[0].error||r[1].error;if(e0)throw e0;
   var raw={blocks:{},sleep:{},avgRise:405,avgBed:1395};
   (r[0].data||[]).forEach(function(b){b.title=b.title||'';(raw.blocks[b.day]=raw.blocks[b.day]||[]).push(b)});
   var rs=[],bs=[];
   (r[1].data||[]).forEach(function(h){var x=h.extras||{};if(x.sleepStart&&x.sleepEnd&&!raw.sleep[h.day])raw.sleep[h.day]=x});
   Object.keys(raw.sleep).forEach(function(d){var a=mins(raw.sleep[d].sleepEnd,d);if(a!=null&&a>=WIN0&&a<=900)rs.push(a);var n=addD(d,1);if(raw.sleep[n]){var b=mins(raw.sleep[n].sleepStart,d);if(b!=null&&b>=900&&b<=WIN1)bs.push(b)}});
   if(rs.length)raw.avgRise=Math.round(rs.reduce(function(a,v){return a+v},0)/rs.length);
   if(bs.length)raw.avgBed=Math.round(bs.reduce(function(a,v){return a+v},0)/bs.length);
   rebuildRules();S={mon:mon,raw:raw,isCur:monOf(today())===mon};S.st=weekStats(mon,raw);S.trend=[3,2,1,0].map(function(k){return k?weekStats(addD(mon,-7*k),raw):S.st});err=null;busy=false;render();if(window.__fcb)window.__fcb.S=S;if(again){again=false;load()}
  }).catch(function(e){busy=false;again=false;err=e;if(window.console)console.error('[future casting banner]',e);render()})}
 render();
 return {load:load,render:render}}
/* ---------- start ---------- */
function start(){var host=document.getElementById('futureCastHost');if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 window.__fcb={};var ui=mk(host),started=false;
 function loadCfg(){var sb=window.sb;var local=null;try{local=JSON.parse(localStorage.getItem('fcb_cfg')||'null')}catch(e){}
  var done=function(c){if(c&&typeof c==='object'){cfg={custom:c.custom||[],flip:c.flip||{},target:c.target==null?null:+c.target}}rebuildRules();ui.load()};
  if(!sb||!sb.from){done(local);return}
  sb.from('app_meta').select('value').eq('key','future_casting_cfg').maybeSingle().then(function(r){var c=null;try{if(r&&r.data&&r.data.value)c=JSON.parse(r.data.value)}catch(e){}done(c||local)},function(){done(local)})}
 function go(){if(started)return;started=true;loadCfg();
  var lab=document.getElementById('weekLabel'),tm=null;
  if(lab&&window.MutationObserver)new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(function(){ui.load()},150)}).observe(lab,{childList:true,characterData:true,subtree:true})}
 var sb=window.sb;if(!sb){go();return}
 if(sb.auth&&sb.auth.getSession){sb.auth.getSession().then(function(r){if(r&&r.data&&r.data.session)go();else sb.auth.onAuthStateChange(function(ev,s){if(s)go()})}).catch(go)}else go()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
