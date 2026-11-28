/* Daily Routine of a Creative, habits dashboard banner v1.5 (Nov 28, 2026).
   v1.5.2: Family is its own band, the Social pill finally counts (it read zero before),
   plain to-do blocks count, and the week shown is the one he is in, last week on the toggle.
   Last full Monday to Sunday week from day_blocks, health_metrics (Apple Watch sleep times) and habit_history. Shadow root, so no page styles leak in. */
(function(){
var CSS="\n:host{display:block;margin:9px 0;--card:#fff;--sunk:#f1f3f8;--line:#e3e7ee;--hair:#eef0f5;--ink:#1f2a44;--muted:#5b6472;--faint:#9aa6b4;--accent:#3f6f8f;\n--fh:Arial,Helvetica,sans-serif;--fm:Roboto,Arial,sans-serif;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.45;color:var(--ink)}\n*{box-sizing:border-box}button{font-family:inherit}\n.bn{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}\n.face{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;padding:0 12px;position:relative}\n.face:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}\n.fhead{display:flex;align-items:flex-start;gap:10px}.ftxt{min-width:0;flex:1 1 auto}\n.kick{font-family:var(--fm);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 1px}\nh2.ft{font-family:var(--fh);font-weight:700;font-size:21px;line-height:1.15;margin:0;letter-spacing:-.01em}\n.sub{margin:2px 0 0;font-style:italic;color:var(--faint);font-size:clamp(11px,2.5vw,14px);line-height:1.2}\n.chv{flex:none;width:22px;height:22px;display:grid;place-items:center;color:var(--faint);transition:transform .25s ease;margin-top:3px}\n.bn.open .chv{transform:rotate(180deg);color:var(--ink)}\n.openhint{font-family:var(--fm);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin:4px 0 0;text-align:right}\n\n.xx{display:flex;height:30px;border-radius:6px;overflow:hidden}\n.mini ul{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 12px;font-size:12px}\n.mini li{display:flex;align-items:center;gap:6px}.mini i{width:11px;height:11px;border-radius:2px;flex:none}.mini b{margin-left:auto;font-variant-numeric:tabular-nums}\n.bn.narrow .bar{display:none}.bn.narrow .mini{display:block}\n\n.hint{font-family:var(--fm);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);white-space:nowrap;margin-top:5px}\n.fhead .hint{margin-left:auto}\n.bar1 svg{display:block;width:100%;margin:4px 0 0}\n.l2{display:flex;flex-wrap:wrap;gap:3px 12px;font-size:11.5px;color:#2b3446;margin-top:5px}\n.l2 span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.l2 i,.cell i{display:inline-block;width:10px;height:10px;border-radius:2px}\n.l2.one{display:block;color:var(--muted)}\n.split{display:grid;grid-template-columns:minmax(150px,24%) 1fr;gap:6px 16px;align-items:center;position:relative;padding-right:118px}\n.split .abs{position:absolute;right:0;top:0;display:flex;align-items:flex-start;gap:6px}\n.split .rt svg{display:block;width:100%}\n.wk svg{height:66px}\n.cells{display:flex;margin-top:5px;border:1px solid var(--line);border-radius:10px;overflow:hidden}\n.cell{flex:1 1 0;min-width:0;padding:4px 8px;border-left:1px solid var(--line)}.cell:first-child{border-left:0}\n.cell i{display:block;width:100%;height:4px;border-radius:2px;margin-bottom:4px}\n.cell b{display:block;font-size:17px;line-height:1;font-variant-numeric:tabular-nums}.cell b u{text-decoration:none;font-weight:400;font-size:.7em;color:var(--muted);margin-left:2px}\n.cell span{display:block;font-family:var(--fm);font-size:8.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);margin-top:3px}\n.bn.narrow .split{grid-template-columns:1fr;padding-right:0}.bn.narrow .split .abs{top:0}.bn.narrow .split .ftxt{padding-right:90px}\n.bn.narrow .cells{flex-wrap:wrap}.bn.narrow .cell{flex:1 1 30%;border-top:1px solid var(--line)}\n\n.face{position:relative}\n.two{display:grid;grid-template-columns:minmax(170px,22%) 1fr;gap:16px;align-items:center;padding:13px 0}\n.two .ft{font-size:20px;line-height:1.12}\n.segs{display:flex;height:60px;border-radius:8px;position:relative;margin-bottom:0}\n.seg:first-child{border-radius:8px 0 0 8px}.seg:last-child{border-radius:0 8px 8px 0}\n.seg{position:relative;flex:var(--v) 1 0;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:var(--m);transition:flex .28s ease,background .2s ease;cursor:pointer}\n.seg:hover{background:var(--c)}\n.seg.hab:hover{box-shadow:inset 0 0 0 1.2px #111}\n.seg b,.seg span{white-space:nowrap;pointer-events:none;color:#1f2a44}.seg span{opacity:0;transition:opacity .15s}\n.seg.out{overflow:visible}.seg.out>b,.seg.out>span{position:absolute;left:50%;transform:translateX(-50%);top:calc(100% + 3px)}.seg.out>b{font-size:12px;font-weight:700}.seg.out>span{top:calc(100% + 3px);background:#fff;padding:0 3px;z-index:3;font-size:11px}.seg.out:hover>b{opacity:0}u{display:none;text-decoration:none}.seg.out u{display:inline}.seg.out.l1>b,.seg.out.l1>span{top:calc(100% + 17px)}.seg.out.l2>b,.seg.out.l2>span{top:calc(100% + 31px)}.seg.out::after{content:'';position:absolute;left:50%;top:100%;width:1px;background:#b9c1cc;height:3px}.seg.out.l1::after{height:17px}.seg.out.l2::after{height:31px}\n.seg b{font-size:14px;line-height:1.15}.seg span{font-size:11px;line-height:1.2;color:#2b3446}\n.seg:hover span{opacity:1}\n.arr{position:absolute;left:50%;bottom:1px;transform:translateX(-50%);color:#9aa6b4;opacity:.55;display:flex;pointer-events:none}\n.arr svg{width:10px;height:10px;transition:transform .25s ease}.bn.open .arr svg{transform:rotate(180deg)}\n.bn.narrow .two{grid-template-columns:1fr;gap:6px}\n.drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s ease}\n.bn.open .drop{grid-template-rows:1fr}.drop>.in{overflow:hidden;min-height:0}\n.pad{padding:0 12px 11px;border-top:1px solid var(--line);margin-top:1px}\n@media(prefers-reduced-motion:reduce){.drop,.chv{transition:none}}\n.tabs .dt{margin-left:auto;align-self:center;font-family:var(--fm);font-size:11px;color:var(--faint)}.tabs{display:flex;gap:7px;flex-wrap:wrap;padding:9px 0 6px}\n.tab{border:1px solid var(--line);background:var(--card);border-radius:999px;padding:5px 13px;font-size:13px;cursor:pointer;color:var(--muted)}\n.tab[aria-selected=\"true\"]{border-color:var(--ink);background:var(--ink);color:#fff;font-weight:700}\n.tab:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n.scroll{overflow-x:auto}.scroll>.w{min-width:640px}\n.w svg{display:block;width:100%;height:auto}\n.leg{display:flex;flex-wrap:wrap;justify-content:center;gap:5px 11px;font-size:11.5px;color:#a3adba;padding:8px 0 2px}\n.leg span{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}.leg i{display:inline-block;width:12px;height:12px;border-radius:2px}.leg svg{width:18px;height:18px}\n.t-lab{font-size:10.5px;fill:#1f2a44;font-family:Arial,Helvetica,sans-serif}\n.t-day{font-family:var(--fm);font-size:12px;fill:#8a93a0}\n.t-chip{font-size:10.5px;fill:#7b8594;font-family:Arial,Helvetica,sans-serif}\n.row{cursor:pointer}\n.note{font-size:12px;color:var(--muted);margin:6px 0 0}\ntable{width:100%;border-collapse:collapse;font-size:14px}\nth{font-family:var(--fm);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#7b8490;text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);font-weight:400}\ntd{padding:7px 10px;border-bottom:1px solid var(--hair)}tr:last-child td{border-bottom:0}\ntd i{display:inline-block;width:11px;height:11px;border-radius:2px;margin-right:7px;vertical-align:-1px}\n";
var T={sleep:{c:'#d3d9e6',n:'Sleep'},work:{c:'#fe8f26',n:'Day Job (Amazon)'},proj:{c:'#e496af',n:'Creative Time (Project YOU & TreadWell)'},mind:{c:'#1f8353',n:'Mind and cue cards'},move:{c:'#b7556e',n:'Walking'},social:{c:'#d58f9b',n:'Social'},fam:{c:'#8f6fa6',n:'Family'},other:{c:'#dccfb6',n:'Personal and calendar'},free:{c:'#eef0f5',n:'Unlogged time'}};
var HAB={mind:1,move:1,social:1};
var FAMP={asa:1,carson:1,max:1};/* Nov 28 2026, Scott: family gets its own band, Social stays for people outside the house. Irvine is unresolved, so it still falls to Personal. */


var WEEK={label:'',days:[]},D=[];
function fmt(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),mm=m%60;return (h%12||12)+':'+(mm<10?'0':'')+mm+' '+(h>=12?'p.m.':'a.m.')}
function segs(i){var a=[{s:300,m:D[i].rise-300,t:'sleep'},{s:D[i].bed,m:1740-D[i].bed,t:'sleep'}],o={other:-1,work:0,proj:1,move:2,social:3,mind:4};
 return a.concat(D[i].blocks.slice().sort(function(x,y){return o[x.t]-o[y.t]}))}
var xs=function(X0,X1){return function(m){return X0+(m-300)/1440*(X1-X0)}};
var CS='text';
function chips(X0,X1,y,H){var f=xs(X0,X1),h=[360,540,720,900,1080,1260,1440,1620],L=['6 a.m.','9 a.m.','Noon','3 p.m.','6 p.m.','9 p.m.','Midnight','3 a.m.'],s='';
 h.forEach(function(v,k){var x=f(v);
  if(CS==='text')s+='<text class="t-chip" x="'+x+'" y="'+(y+12)+'" text-anchor="middle">'+L[k]+'</text><line x1="'+x+'" x2="'+x+'" y1="'+(y+17)+'" y2="'+(y+23)+'" stroke="#cfd6e2"/>';
  else if(CS==='pill')s+='<rect x="'+(x-27)+'" y="'+y+'" width="54" height="18" rx="9" fill="#eef0f5"/><text class="t-chip" x="'+x+'" y="'+(y+12.5)+'" text-anchor="middle">'+L[k]+'</text>';
  else s+='<text class="t-chip" x="'+x+'" y="'+(y+12)+'" text-anchor="middle">'+L[k]+'</text><line x1="'+x+'" x2="'+x+'" y1="'+(y+20)+'" y2="'+(y+(H||200))+'" stroke="#e6eaf1" stroke-dasharray="2 3"/>'});return s}
var IC='#5f6b7d';
function sun(x,y,r){var s='<g transform="translate('+x+' '+y+')" opacity=".72"><circle r="'+r*0.5+'" fill="'+IC+'"/>';for(var k=0;k<8;k++){var a=k*Math.PI/4,c=Math.cos(a),n=Math.sin(a);s+='<line x1="'+(c*r*0.78)+'" y1="'+(n*r*0.78)+'" x2="'+(c*r*1.08)+'" y2="'+(n*r*1.08)+'" stroke="'+IC+'" stroke-width="'+(r*0.16)+'" stroke-linecap="round"/>'}return s+'</g>'}
function moon(x,y,r){return '<g transform="translate('+x+' '+y+')" opacity=".72"><path d="M'+(r*0.35)+' '+(-r)+'A'+r+' '+r+' 0 1 0 '+(r*0.9)+' '+(r*0.6)+'A'+(r*0.85)+' '+(r*0.85)+' 0 0 1 '+(r*0.35)+' '+(-r)+'Z" fill="'+IC+'"/></g>'}
function strip(i,X0,X1,y,h,withIcons){var f=xs(X0,X1),s='<rect x="'+X0+'" y="'+y+'" width="'+(X1-X0)+'" height="'+h+'" fill="'+T.free.c+'"/>';
 segs(i).forEach(function(b){var x=f(b.s),w=Math.max(f(b.s+b.m)-x,2.6),ti=b.l?'<title>'+fmt(b.s)+' '+b.l+', '+b.m+' min</title>':'';
  s+='<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+T[b.t].c+'"'+(HAB[b.t]?' stroke="#111" stroke-width="1.2"':'')+'>'+ti+'</rect>'});
 D[i].miss.forEach(function(m){s+='<circle cx="'+f(m)+'" cy="'+(y+h/2)+'" r="'+(h*0.22)+'" fill="#fff" stroke="#111" stroke-width="1.2"><title>Meditate skipped</title></circle>'});
 if(withIcons&&D[i].rise>300&&D[i].bed<1740){s+='<g><title>Up at '+fmt(D[i].rise)+'</title>'+sun(f(D[i].rise),y+h/2,h*0.34)+'</g><g><title>Lights out '+fmt(D[i].bed)+'</title>'+moon(f(D[i].bed)-2,y+h/2,h*0.25)+'</g>'}return s}
var LB=26,LG=5;
function place(items,X0,X1){var slots=[],out=[],a=0,b=0,k;for(k=0;k<3;k++){slots.push({side:'a',k:k,r:-1e9});slots.push({side:'b',k:k,r:-1e9})}
 items.sort(function(p,q){return p.x-q.x});
 items.forEach(function(it){var w=Math.max(it.l1.length,it.l2.length)*5.6+6,x0=Math.min(it.x,X1-w+6),pick=null;
  for(var q=0;q<slots.length;q++){if(slots[q].r<x0-6){pick=slots[q];break}}if(!pick)return;pick.r=x0+w;
  if(pick.side==='a')a=Math.max(a,pick.k+1);else b=Math.max(b,pick.k+1);out.push({it:it,x0:x0,side:pick.side,k:pick.k})});return {list:out,a:a,b:b}}
var aH=function(p){return p.a?10+p.a*(LB+LG):0},bH=function(p){return p.b?10+p.b*(LB+LG):0};
function callouts(pl,top,bot){var L='',X='';pl.list.forEach(function(e){var it=e.it,yL=e.side==='a'?top-10-(e.k+1)*LB-e.k*LG:bot+10+e.k*(LB+LG),y1=e.side==='a'?top:bot,y2=e.side==='a'?yL+LB:yL;
 L+='<line x1="'+it.x+'" x2="'+it.x+'" y1="'+y1+'" y2="'+y2+'" stroke="#1f2a44"/>';
 X+='<text class="t-lab" x="'+e.x0+'" y="'+(yL+10)+'" stroke="#fff" stroke-width="3" paint-order="stroke"><tspan font-weight="700" x="'+e.x0+'">'+it.l1+'</tspan><tspan x="'+e.x0+'" dy="12">'+it.l2+'</tspan></text>'});return L+X}
var hrs=function(m){return (m/60).toFixed(1)};
var pct=function(m){var v=100*m/TT.tot;return v<1?'<1%':Math.round(v)+'%'};
function totals(){var out={sleep:0,other:0,work:0,proj:0,mind:0,move:0,social:0,fam:0},order=['sleep','other','work','proj','fam','move','social','mind'];
 for(var i=0;i<D.length;i++){var arr=new Array(1440).fill('');segs(i).sort(function(a,b){return (a.t==='sleep'?-1:0)-(b.t==='sleep'?-1:0)});
  order.forEach(function(t){D[i].blocks.concat([{s:300,m:D[i].rise-300,t:'sleep'},{s:D[i].bed,m:1740-D[i].bed,t:'sleep'}]).forEach(function(b){if(b.t!==t)return;for(var m=b.s;m<b.s+b.m;m++){if(m>=300&&m<1740)arr[m-300]=b.t}})});
  arr.forEach(function(v){if(v)out[v]++})}
 var tot=D.length*1440,a=[],u=0;['work','proj','mind','move','social','fam','other','sleep'].forEach(function(k){u+=out[k]});['work','proj','mind','move','social','fam','other'].forEach(function(k){a.push([k,out[k]])});a.push(['free',tot-u]);a.push(['sleep',out.sleep]);return {a:a,tot:tot,sl:out.sleep}}
var TT={a:[],tot:1};
function setWeek(w){WEEK=w;D=(w.days&&w.days.length)?w.days:[];TT=D.length?totals():{a:[],tot:1,sl:0}}
function legend(){var ic=function(f){return '<svg viewBox="-12 -12 24 24">'+f+'</svg>'},
 it=function(t){return '<span><i style="background:'+T[t].c+(HAB[t]?';outline:1.2px solid #111':'')+'"></i>'+T[t].n+'</span>'};
 return '<div class="leg"><span>'+ic(sun(0,0,10))+'Rise</span>'+['sleep','mind','move','social','fam','work','proj','other','free'].map(it).join('')+'<span><i style="background:#fff;border-radius:50%;border:1.2px solid #111"></i>Skipped habit</span><span>'+ic(moon(0,0,9))+'Lights out</span></div>'}
function banner(){var X0=10,X1=990,h=52,x=X0,items=[],bars='';
 TT.a.forEach(function(p){var w=(X1-X0)*p[1]/TT.tot;bars+='<rect x="'+x+'" y="@@" width="'+w+'" height="'+h+'" fill="'+T[p[0]].c+'"'+(HAB[p[0]]?' stroke="#111" stroke-width="1.2"':'')+'/>';items.push({x:x+w/2,l1:hrs(p[1])+' hours',l2:T[p[0]].n});x+=w});
 var pl=place(items,X0,X1),top=10+aH(pl),bot=top+h,H=bot+bH(pl)+6;
 return '<svg viewBox="0 0 1000 '+H+'" role="img" aria-label="Where the week went, as one bar">'+bars.replace(/@@/g,top)+callouts(pl,top,bot)+'</svg>'}
function mini(){var s='<div class="strip">'+TT.a.map(function(p){return '<div style="flex:'+p[1]+';background:'+T[p[0]].c+'"></div>'}).join('')+'</div><ul>'+TT.a.map(function(p){return '<li><i style="background:'+T[p[0]].c+'"></i>'+T[p[0]].n.replace(/ \(.*\)| &.*$/,'')+'<b>'+hrs(p[1])+' h</b></li>'}).join('')+'</ul>';return s}
var sel=0;
function dayByDay(){var X0=40,X1=996,RH=20,G=9,top=34,s='<svg viewBox="0 0 1000 '+(top+D.length*(RH+G)+4)+'" role="img" aria-label="Seven day strips">'+chips(X0,X1,0,top+D.length*(RH+G));
 D.forEach(function(d,i){var y=top+i*(RH+G);s+='<g class="row" data-d="'+i+'"><rect x="0" y="'+(y-4)+'" width="1000" height="'+(RH+8)+'" fill="'+(i===sel?'rgba(63,111,143,.10)':'transparent')+'"/><text class="t-day" x="2" y="'+(y+14)+'" style="font-weight:'+(i===sel?700:400)+'">'+d.d+'</text>'+strip(i,X0,X1,y,RH,true)+'</g>'});
 var d=D[sel];return s+'</svg><p class="note"><b>'+d.d+' '+d.dt+':</b> up at '+fmt(d.rise)+', lights out '+fmt(d.bed)+' Both times come from your Apple Watch.</p>'}
function medianStart(l){var st=[];D.forEach(function(d){var f=null;d.blocks.forEach(function(b){if(b.l===l&&(f===null||b.s<f))f=b.s});if(f!==null)st.push(f)});st.sort(function(a,b){return a-b});return {n:st.length,m:st[Math.floor(st.length/2)]}}
function rhythm(){var X0=60,X1=996,rh=24,gp=7,f=xs(X0,X1),items=[];
 [['Meditate'],['Walk'],['Social'],['Mental Fitness'],['Cue cards']].forEach(function(g){var r=medianStart(g[0]);if(r.n)items.push({x:f(r.m),l1:'About '+fmt(r.m),l2:g[0]+', '+r.n+' of '+D.length+' days'})});
 var pl=place(items,X0,X1),top=30+aH(pl),bot=top+3*rh+2*gp,H=bot+bH(pl)+8,w=(X1-X0)/96,sc=[],q,i;
 for(q=0;q<96;q++)sc.push({hab:{mind:0,move:0,social:0},wk:{work:0,proj:0},sl:0});
 for(i=0;i<D.length;i++){var g=segs(i);for(q=0;q<96;q++){var a=300+q*15,b=a+15,seen={};g.forEach(function(s){if(s.s<b&&s.s+s.m>a)seen[s.t]=1});for(var t in seen){if(HAB[t])sc[q].hab[t]++;else if(t==='work'||t==='proj')sc[q].wk[t]++;else if(t==='sleep')sc[q].sl++}}}
 var mx=function(o){var best=null,v=0;for(var k in o){if(o[k]>v){v=o[k];best=k}}return [best,v]};
 var s='<svg viewBox="0 0 1000 '+H+'" role="img" aria-label="Week rhythm">'+chips(X0,X1,0,bot);
 [['Habits',0],['Work',1],['Sleep',2]].forEach(function(rw){var y=top+rw[1]*(rh+gp);s+='<text class="t-day" x="2" y="'+(y+16)+'">'+rw[0]+'</text><rect x="'+X0+'" y="'+y+'" width="'+(X1-X0)+'" height="'+rh+'" fill="#eef0f5"/>';
  for(var k=0;k<96;k++){var t,v,r;if(rw[1]===0){r=mx(sc[k].hab);t=r[0];v=r[1]}else if(rw[1]===1){r=mx(sc[k].wk);t=r[0];v=r[1]}else{t='sleep';v=sc[k].sl}
   if(v>0)s+='<rect x="'+(X0+k*w)+'" y="'+y+'" width="'+(w+0.4)+'" height="'+rh+'" fill="'+T[t].c+'" fill-opacity="'+(0.22+0.78*v/D.length).toFixed(2)+'"/>'}});
 return s+callouts(pl,top,bot)+'</svg><p class="note">Darker means more of the '+D.length+' days had something in that quarter hour. Pale means one day.</p>'}
function whereWent(){var h='<table><tr><th>Where it went</th><th>Hours</th><th>Share of the week</th><th>A day on average</th></tr>';
 TT.a.forEach(function(p){h+='<tr><td><i style="background:'+T[p[0]].c+'"></i>'+T[p[0]].n+'</td><td>'+hrs(p[1])+'</td><td>'+Math.round(100*p[1]/TT.tot)+'%</td><td>'+hrs(p[1]/D.length)+' h</td></tr>'});return h+'</table><p class="note">Sleep counts from lights out to getting up, so it runs a little longer than the hours the Watch scores as asleep.</p>'}

var SH={other:'Personal',sleep:'Sleep',work:'Day Job',proj:'Creative',mind:'Mind',move:'Walking',social:'Social',fam:'Family',free:'Unlogged'};
function leg2(){return '<div class="l2">'+TT.a.map(function(p){return '<span><i style="background:'+T[p[0]].c+(HAB[p[0]]?';outline:1.2px solid #111':'')+'"></i>'+SH[p[0]]+' <b>'+hrs(p[1])+'</b></span>'}).join('')+'</div>'}
function bar(h){var X0=0,X1=1000,x=0,s='';TT.a.forEach(function(p){var w=1000*p[1]/TT.tot;s+='<rect x="'+x+'" y="0" width="'+w+'" height="'+h+'" fill="'+T[p[0]].c+'"'+(HAB[p[0]]?' stroke="#111" stroke-width="2.4"':'')+'/>';x+=w});return '<svg viewBox="0 0 1000 '+h+'" preserveAspectRatio="none" style="height:'+(h*0.34)+'px" role="img" aria-label="Where the week went">'+s+'</svg>'}
function weekMini(){var RH=9,G=2,X0=34,X1=996,s='<svg viewBox="0 0 1000 '+(D.length*(RH+G))+'" role="img" aria-label="Seven days at a glance">';
 D.forEach(function(d,i){var y=i*(RH+G);s+='<text class="t-day" x="2" y="'+(y+8)+'" style="font-size:10px">'+d.d.charAt(0)+'</text>'+strip(i,X0,X1,y,RH,false).replace(/<title>[^<]*<\/title>/g,'');
  var f=xs(X0,X1);s+=sun(f(d.rise),y+RH/2,5.2)+moon(f(d.bed)-2,y+RH/2,4)});return s+'</svg>'}
function avgDay(){var X0=6,X1=994,h=26,f=xs(X0,X1),r=Math.round(D.reduce(function(a,d){return a+d.rise},0)/D.length),b=Math.round(D.reduce(function(a,d){return a+d.bed},0)/D.length),s='<svg viewBox="0 0 1000 '+(h+22)+'" role="img" aria-label="An average day">';
 s+='<rect x="'+X0+'" y="6" width="'+(X1-X0)+'" height="'+h+'" fill="'+T.free.c+'"/><rect x="'+X0+'" y="6" width="'+(f(r)-X0)+'" height="'+h+'" fill="'+T.sleep.c+'"/><rect x="'+f(b)+'" y="6" width="'+(X1-f(b))+'" height="'+h+'" fill="'+T.sleep.c+'"/>';
 var tot={work:0,proj:0,mind:0,move:0,social:0};
 ['work','proj','move','social','mind'].forEach(function(t){var occ=new Array(96).fill(0);D.forEach(function(d){d.blocks.forEach(function(bk){if(bk.t!==t)return;for(var q=0;q<96;q++){var a=300+q*15;if(bk.s<a+15&&bk.s+bk.m>a)occ[q]++}})});
  occ.forEach(function(v,q){if(v>0)s+='<rect x="'+f(300+q*15)+'" y="6" width="'+((X1-X0)/96+.4)+'" height="'+h+'" fill="'+T[t].c+'" fill-opacity="'+(0.25+0.75*v/D.length).toFixed(2)+'"/>'})});
 s+=sun(f(r),6+h/2,h*0.62)+moon(f(b)-3,6+h/2,h*0.42);
 [[360,'6a'],[720,'Noon'],[1080,'6p'],[1440,'12a'],[1620,'3a']].forEach(function(t){s+='<text x="'+f(t[0])+'" y="'+(h+16)+'" text-anchor="middle" style="font:10px Arial" fill="#9aa6b4">'+t[1]+'</text>'});
 return s+'</svg>'}
function avgTxt(){var r=Math.round(D.reduce(function(a,d){return a+d.rise},0)/D.length),b=Math.round(D.reduce(function(a,d){return a+d.bed},0)/D.length);return 'Typical day: up <b>'+fmt(r)+'</b>, lights out <b>'+fmt(b)+'</b>'}
function cells(){return '<div class="cells">'+TT.a.map(function(p){return '<div class="cell"><i style="background:'+T[p[0]].c+(HAB[p[0]]?';outline:1.2px solid #111':'')+'"></i><b>'+hrs(p[1])+'<u>h</u></b><span>'+SH[p[0]]+'</span></div>'}).join('')+'</div>'}
function mute(h){var r=parseInt(h.slice(1,3),16),g=parseInt(h.slice(3,5),16),b=parseInt(h.slice(5,7),16),k=.725,f=function(v){return Math.round(v*k+255*(1-k))};return 'rgb('+f(r)+','+f(g)+','+f(b)+')'}
var chev='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';
function titleBlock(){return '<div class="ftxt"><p class="kick">Habits dashboard &middot; Project YOU</p><h2 class="ft">Habit Week</h2></div>'}
function face(v,open){var hint='<span class="hint">'+(open?'Tap to close':'Tap to open')+'</span>',c='<span class="chv">'+chev+'</span>';
 if(v===1)return '<div class="fhead">'+titleBlock()+hint+c+'</div><div class="bar1">'+bar(70)+'</div>'+leg2();
 if(v===2)return '<div class="two"><h2 class="ft">Daily Routine<br>of a Creative</h2><div class="segs">'+TT.a.map(function(p){return '<div class="seg'+(HAB[p[0]]?' hab':'')+'" style="--v:'+p[1]+';--c:'+T[p[0]].c+';--m:'+mute(T[p[0]].c)+'"><b>'+SH[p[0]]+'</b><span><u>'+SH[p[0]]+' &middot; </u>'+hrs(p[1])+' h &middot; '+pct(p[1])+'</span></div>'}).join('')+'</div></div><span class="arr">'+chev+'</span>'
 if(v===3)return '<div class="split">'+titleBlock()+'<div class="rt wk">'+weekMini()+'</div><span class="abs">'+hint+c+'</span></div>';
 if(v===4)return '<div class="fhead">'+titleBlock()+hint+c+'</div><div class="bar1">'+bar(26)+'</div>'+cells();
 return '<div class="split">'+titleBlock()+'<div class="rt">'+avgDay()+'<div class="l2 one">'+avgTxt()+' &middot; '+hrs(TT.sl/D.length)+' h in bed</div></div><span class="abs">'+hint+c+'</span></div>'}
function mk(host,v,cs){var root=host.attachShadow({mode:'open'}),tab=1,open=false;try{open=localStorage.getItem('hwk_open')==='1'}catch(e){}
 function body(){CS=cs;return tab===3?whereWent():'<div class="scroll"><div class="w">'+(tab===1?dayByDay():rhythm())+'</div></div>'+legend()}
 function render(){root.innerHTML='<style>'+CSS+'</style><div class="bn v'+v+(open?' open':'')+'" id="bn"><button class="face" type="button" aria-expanded="'+open+'" data-act="toggle">'+face(v,open)+'</button><div class="drop"><div class="in"><div class="pad"><div class="tabs" role="tablist">'+[[1,'Day by Day'],[2,'The Week&rsquo;s Rhythm'],[3,'Where it Went']].map(function(t){return '<button class="tab" role="tab" type="button" data-tab="'+t[0]+'" aria-selected="'+(tab===t[0])+'">'+t[1]+'</button>'}).join('')+'<button class="tab dt" type="button" data-act="wk" title="Switch week">'+WEEK.label+' &#8646;</button></div>'+body()+'</div></div></div></div>';fit()}
 function fit(){var b=root.getElementById('bn');if(b)b.classList.toggle('narrow',host.clientWidth<560);labs()}
 function labs(){var sg=root.querySelector('.segs');if(!sg)return;var ss=[].slice.call(sg.children),ed=[0,0,0],lv=0;
  ss.forEach(function(e){e.classList.remove('out','l1','l2')});
  ss.forEach(function(e){var l=e.querySelector('b');if(l.scrollWidth<=e.clientWidth-6)return;e.classList.add('out');var c=e.offsetLeft+e.offsetWidth/2,w=l.scrollWidth,k=0;while(k<2&&c-w/2<ed[k]+4)k++;ed[k]=c+w/2;lv=Math.max(lv,k+1);if(k)e.classList.add('l'+k)});
  sg.style.marginBottom=lv?(lv*14+6)+'px':'0'}
 root.addEventListener('click',function(e){var el;
  if((el=e.target.closest('[data-tab]'))){tab=+el.getAttribute('data-tab');render();return}
  if((el=e.target.closest('[data-d]'))){sel=+el.getAttribute('data-d');render();return}
  if(e.target.closest('[data-act="wk"]')){WOFF=WOFF?0:1;fetchWeek().then(function(w){setWeek(w);render()});return}
  if(e.target.closest('[data-act="toggle"]')){open=!open;try{localStorage.setItem('hwk_open',open?'1':'0')}catch(x){}render()}});
 if(window.ResizeObserver)new ResizeObserver(fit).observe(host);
 root.addEventListener('mouseover',function(e){var el=e.target.closest&&e.target.closest('.seg');if(!el)return;if(el.getBoundingClientRect().width<96)el.style.flex='0 0 96px'});
 root.addEventListener('mouseout',function(e){var el=e.target.closest&&e.target.closest('.seg');if(el&&!el.contains(e.relatedTarget))el.style.flex=''});
 render();return{render:render}}


/* ---------- real data: last full Monday to Sunday week ---------- */
var MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DN=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function ymd(t){var a=t.split('-');return Date.UTC(+a[0],+a[1]-1,+a[2])}
function addD(s,n){var d=new Date(ymd(s)+n*864e5);return d.getUTCFullYear()+'-'+('0'+(d.getUTCMonth()+1)).slice(-2)+'-'+('0'+d.getUTCDate()).slice(-2)}
function today(){try{if(window.PY&&PY.today)return PY.today()}catch(e){}return new Date().toISOString().slice(0,10)}
var WOFF=0;/* Nov 28 2026, Scott: 0 = the week he is actually in, 1 = last week behind the toggle. */
function weekStart(){var t=today(),dow=new Date(ymd(t)).getUTCDay(),thisMon=addD(t,-((dow+6)%7));return addD(thisMon,-7*WOFF)}
function lastWeekStart(){return weekStart()}
function mins(str,base){var m=/^(\d{4}-\d{2}-\d{2})T(\d\d):(\d\d)/.exec(str||'');if(!m)return null;return Math.round((ymd(m[1])-ymd(base))/864e5)*1440+(+m[2])*60+(+m[3])}
function lab(s){var a=s.split('-');return MON[+a[1]-1]+' '+(+a[2])}
var CAP={'2026-11-08|966':15};/* Scott, Nov 15: Sunday walk logged as 143 min shows as 15 on the banner only */
var EXW=/^\S+\s+(Walk|Hike|Ride|Run|Swim|Workout|Weight|Yoga|Row|Ski|Elliptical|Stair)\b/i;
function tm(t){if(!t)return null;var p=String(t).split(':');return (+p[0])*60+(+p[1])}
/* THE CALENDAR IS THE SOURCE OF TRUTH (Scott, Nov 15, 2026). Same rules as the Todays Tasks calendar column:
   blocks laid down first, meetings paint over them except habits and exercise, dismissed or hidden or
   dragged-away meetings and removed titles and switched-off calendars do not count. */
function build(mon,bl,hm,hh,ev,drops,hid){
 var days=[],sleep={};
 hm.forEach(function(r){var x=r.extras||{};if(x.sleepStart&&x.sleepEnd&&!sleep[r.day])sleep[r.day]=x});
 var TDY=today();
 for(var i=0;i<7;i++){var day=addD(mon,i),nx=addD(mon,i+1);if(day>TDY)break;var b=[],cue=[],meds=false,miss=[],own=new Array(1440).fill(null),hab={mind:1,move:1,social:1};
  function mark(s,m,t){for(var k=Math.max(0,s|0);k<Math.min(1440,(s+m)|0);k++)own[k]=t}
  bl.filter(function(r){return r.day===day}).forEach(function(r){var t=r.title||'',s=r.start_min,m=r.mins;if(!(m>0))return;
   if(r.cat==='hab'){if(!r.done)return;
    if(t.indexOf('🚶')===0||EXW.test(t)||/^walk/i.test(t)){m=CAP[day+'|'+s]&&m>CAP[day+'|'+s]?CAP[day+'|'+s]:m;b.push({s:s,m:m,t:'move',l:'Walk'});mark(s,m,'move')}
    else if(/social/i.test(t)){b.push({s:s,m:m,t:'social',l:'Social'});mark(s,m,'social')}
    else if(/^meditate/i.test(t)){b.push({s:s,m:m,t:'mind',l:'Meditate'});mark(s,m,'mind');meds=true}
    else if(/mental fitness/i.test(t)){b.push({s:s,m:m,t:'mind',l:'Mental Fitness'});mark(s,m,'mind')}
    else if(!/lights out|train platform/i.test(t)){cue.push({s:s,m:m});mark(s,m,'mind')}}
   else if(r.cat==='py')mark(s,m,'proj');
   else if(r.cat==='own'){if(r.pill==='treadwell')mark(s,m,'proj');else if(r.pill==='amz')mark(s,m,'work');else if(FAMP[r.pill])mark(s,m,'fam');else if(r.pill==='social'||t.trim()==='Social'){b.push({s:s,m:m,t:'social',l:'Social'});mark(s,m,'social')}else mark(s,m,'other')}
   });
  /* Nov 28 2026, Scott: "what I ticked wins". A ticked to-do is what actually happened; a block he set
     is only what he planned. So to-dos are laid down LAST, in their own pass, and paint over the plan.
     Done in a second pass on purpose: applying them inline made the winner depend on the order rows
     came back in. Habits (walks, meditate, social) are never painted over, they carry streaks. */
  bl.filter(function(r){return r.day===day&&r.cat==='todo'&&r.mins>0&&r.done})
    .sort(function(a,c){return a.start_min-c.start_min})
    .forEach(function(r){for(var k=Math.max(0,r.start_min|0);k<Math.min(1440,(r.start_min+r.mins)|0);k++){if(!hab[own[k]])own[k]='other'}});
  var seen={};
  ev.filter(function(r){return r.date===day}).forEach(function(r){
   if(r.hidden||r.dismissed||!r.start_time||!r.end_time)return;if(drops.indexOf((r.title||'').trim())>=0)return;
   var s=r.start_override?tm(r.start_override):tm(r.start_time),e0=r.start_override?tm(r.end_override||r.start_override):tm(r.end_time),e=Math.max(e0,s+5),k=(r.title||'')+'|'+s+'|'+e;
   if(seen[k])return;seen[k]=1;if(r.skipped)return;if(hid.indexOf(r.cal_override||r.source_calendar||'')>=0)return;
   var work=r.work_override===true?true:r.work_override===false?false:(r.is_work||/amazon/i.test(r.title||''));
   var cm=r.tag_override==='commute';
   for(var q=Math.max(0,s);q<Math.min(1440,e);q++)if(!hab[own[q]]&&own[q]!=='fam')own[q]=(cm||!work)?'other':'work'});
  var run=null;for(var q=0;q<=1440;q++){var t=q<1440?own[q]:null;if(run&&t!==run.t){if(!hab[run.t])b.push({s:run.s,m:q-run.s,t:run.t});run=null}if(t&&!run)run={s:q,t:t}}
  cue.sort(function(a,c){return a.s-c.s});var cur=null;
  cue.forEach(function(c){if(cur&&c.s<=cur.s+cur.m+2){cur.m=Math.max(cur.m,c.s+c.m-cur.s)}else{if(cur)b.push({s:cur.s,m:cur.m,t:'mind',l:'Cue cards'});cur={s:c.s,m:c.m}}});
  if(cur)b.push({s:cur.s,m:cur.m,t:'mind',l:'Cue cards'});
  if(!meds&&!hh.some(function(h){return h.day===day}))miss.push(380);/* Meditate only shows where a real time was tagged on the cue card page */
  var rise=sleep[day]?mins(sleep[day].sleepEnd,day):null,bed=sleep[nx]?mins(sleep[nx].sleepStart,day):null;
  days.push({d:DN[i],dt:lab(day),rise:rise,bed:bed,blocks:b,miss:miss})}
 var rs=days.filter(function(d){return d.rise!=null}),bs=days.filter(function(d){return d.bed!=null});
 var ar=rs.length?Math.round(rs.reduce(function(a,d){return a+d.rise},0)/rs.length):300,ab=bs.length?Math.round(bs.reduce(function(a,d){return a+d.bed},0)/bs.length):1740;
 days.forEach(function(d){if(d.rise==null)d.rise=rs.length?ar:300;if(d.bed==null)d.bed=bs.length?ab:1740});
 var end=addD(mon,days.length?days.length-1:6);return {label:lab(mon)+' to '+lab(end)+', '+end.slice(0,4)+(WOFF?'':' so far'),days:days}}
function jarr(r){try{return JSON.parse((r.data&&r.data.value)||'[]')}catch(e){return[]}}
function fetchWeek(){var sb=window.sb,mon=weekStart(),sun=addD(mon,6),nx=addD(mon,7);
 return Promise.all([
  sb.from('day_blocks').select('day,start_min,mins,cat,pill,title,done').gte('day',mon).lte('day',sun),
  sb.from('health_metrics').select('day,extras').gte('day',mon).lte('day',nx),
  sb.from('habit_history').select('day,task,done').gte('day',mon).lte('day',sun).eq('done',true).ilike('task','Meditate%'),
  sb.from('calendar_events').select('date,title,start_time,end_time,start_override,end_override,is_work,skipped,hidden,dismissed,cal_override,work_override,source_calendar,tag_override').gte('date',mon).lte('date',sun),
  sb.from('app_meta').select('value').eq('key','cx_drop_titles').maybeSingle(),
  sb.from('app_meta').select('value').eq('key','cx_cal_hidden').maybeSingle()
 ]).then(function(r){var e=r[0].error||r[1].error||r[2].error||r[3].error;if(e)throw e;return build(mon,r[0].data||[],r[1].data||[],r[2].data||[],r[3].data||[],jarr(r[4]),jarr(r[5]))})}
function start(){var host=document.getElementById('habitWeekHost');if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 var done=false;function go(){if(done)return;done=true;
  fetchWeek().then(function(w){
    if(!w.days.length&&!WOFF){WOFF=1;return fetchWeek().then(function(w2){setWeek(w2);mk(host,2,'text')})}
    setWeek(w);mk(host,2,'text')}).catch(function(e){if(window.console)console.error('[habit week banner]',e);host.textContent='Daily Routine of a Creative could not load this week. Try the page again in a minute.';host.style.cssText='font:12px Arial;color:#9aa6b4;padding:14px'})}
 var sb=window.sb;if(!sb){go();return}
 if(sb.auth&&sb.auth.getSession){sb.auth.getSession().then(function(r){if(r&&r.data&&r.data.session)go();else sb.auth.onAuthStateChange(function(ev,s){if(s)go()})}).catch(go)}else go()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();

})();
