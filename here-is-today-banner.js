/* Here is Today, habits dashboard banner. v1.5 (Nov 24, 2026).
   v1.5, Scott: This Week, This Month and This Year show only the yellow, flush right on a grey bar (no orange), so the yellow just grows or shrinks from step to step. The life headline reads HERE IS MY LIFE, so far (so far in italics). Chapter steps show their share of his life as a light percentage inside the yellow. After the first tap the date line is not bold and a touch smaller.
   v1.4, Scott: on the chapter steps the date arrow now points at the start of the yellow, so the yellow stretch matches the date shown (it used to point at the middle). The arrow over the box is the original one, pulsing from fully clear to fully solid. After the first tap the date and day count sit on the left, centred top to bottom. A tiny grey dot in the upper left opens the original wvnl.xyz/hereistoday.
   v1.3, Scott: the date and day count text sit on the left again, like before v1.2. The This Week bar now ends flush at the right with today's yellow sliver. Edit dates reads in the same plain grey, non-bold font as - back. The HERE IS TODAY headline is centred in the space above the yellow box, not pinned to the top. A small arrow pulses slowly over the box before the first tap, and disappears once tapped.
   v1.2, Scott: starts white with HERE IS TODAY centred over the yellow square. First tap inverts it to black and shows the date and day count; each tap after that steps on (no Okay + text); a tap on the last step returns to the start. Edit dates is plain dark grey text, lower right. Dates drag to reorder, and the list order is the step order.
   v1.1, Scott: the banner no longer opens. Tapping it fills the same strip with black and the steps play inside it, like the original. Folded strip is the Today square. Chapter headlines read HERE IS ... Only the Edit dates list drops down.
   Inspired by wvnl.xyz/hereistoday. Starts on today and steps back, one zoom at a time
   (week, month, year, my life), then walks through the chapters of Scott's life.
   Chapters and the birth date are his to edit (Edit button, top right when open); they save to
   app_meta.here_is_today_cfg so they follow him to every device. Only dates that have already happened are drawn.
   Shadow root, so no page styles leak in or out. The day ends at 2am Eastern (PY.today when present). */
(function(){
var KEY='here_is_today_cfg';
var DEF={birth:'1970-09-28',face:'b',chapters:[{t:'Life with Åsa',d:'2009-08-10'},{t:'Max',d:'2008-05-25'},{t:'Carson',d:'2010-03-05'},{t:'Max getting into USC',d:'2025-12-12'}]};
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MO3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
var RE=/^\d{4}-\d{2}-\d{2}$/;
function today(){try{if(window.PY&&PY.today){var v=PY.today();if(RE.test(v))return v}}catch(e){}
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()-2*3600e3))}
function P(s){var a=s.split('-');return {y:+a[0],m:+a[1],d:+a[2]}}
function N(y,m,d){return Math.round(Date.UTC(y,m-1,d)/864e5)}
function NS(s){var p=P(s);return N(p.y,p.m,p.d)}
function num(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function nice(s){var p=P(s);return MO3[p.m-1]+' '+p.d+', '+p.y}
function niceN(n){var d=new Date(n*864e5);return MO3[d.getUTCMonth()]+' '+d.getUTCDate()+', '+d.getUTCFullYear()}
function pct(x){var v=x*100;return (v<0.01?v.toFixed(3):v<1?v.toFixed(2):v.toFixed(1))+'%'}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function ago(from,to){var a=P(from),b=P(to),m=(b.y-a.y)*12+(b.m-a.m)-(b.d<a.d?1:0),y=Math.floor(m/12),r=m%12;
 var o=[];if(y)o.push(y+(y===1?' year':' years'));if(r)o.push(r+(r===1?' month':' months'));return o.length?o.join(', ')+' ago':'This month'}
function clean(c){var o={birth:DEF.birth,face:'b',chapters:[]};if(!c||typeof c!=='object')c=DEF;
 if(RE.test(c.birth||''))o.birth=c.birth;if(/^[abc]$/.test(c.face||''))o.face=c.face;
 (c.chapters||[]).forEach(function(x){if(x&&typeof x==='object')o.chapters.push({t:String(x.t||'').slice(0,60),d:RE.test(x.d||'')?x.d:''})});return o}
function build(cfg){
 var ts=today(),t=P(ts),T=NS(ts),B=NS(cfg.birth);if(B>T)B=T;var life=T-B+1,by=P(cfg.birth).y;
 var dim=N(t.y,t.m+1,1)-N(t.y,t.m,1),m0=N(t.y,t.m,1),y0=N(t.y,1,1),diy=N(t.y+1,1,1)-y0,doy=T-y0+1;
 var jsd=new Date(Date.UTC(t.y,t.m-1,t.d)).getUTCDay(),wd=(jsd+6)%7,w0=T-wd,ws=Math.max(w0,m0),we=Math.min(w0+6,m0+dim-1);
 var ticks=[];for(var k=Math.ceil((by+1)/10)*10;k<=t.y;k+=10){var x=(N(k,1,1)-B)/life;if(x>0.02&&x<0.98)ticks.push({x:x,l:String(k)})}
 var ys=Math.max(y0,B);
 var steps=[
  {h:'HERE IS TODAY',sq:1,cap:DOW[jsd]+', '+MO3[t.m-1]+' '+t.d+', '+t.y,note:'Day '+num(life)+' of your life.'},
  {h:'HERE IS THIS WEEK',a:0,c:1/7,tag:'Today',cap:'Week of '+niceN(w0),note:'Day '+(wd+1)+' of 7.',rev:1},
  {h:'HERE IS THIS MONTH',a:0,c:(we-ws+1)/dim,tag:'This week',cap:MON[t.m-1],note:'Day '+t.d+' of '+dim+'.',rev:1},
  {h:'HERE IS THIS YEAR',a:0,c:dim/diy,tag:MON[t.m-1],cap:String(t.y),note:'Day '+doy+' of '+diy+'.',rev:1},
  {h:'HERE IS MY LIFE',hx:'HERE IS MY LIFE, <em>so far</em>',a:(ys-B)/life,c:(T-ys+1)/life,tag:String(t.y),cap:nice(cfg.birth)+' to today',ticks:1,end:1,
   note:num(life)+' days lived. Today is '+pct(1/life)+' of them.'}];
 cfg.chapters.filter(function(c){return c.t&&c.d&&NS(c.d)>=B&&NS(c.d)<=T}).forEach(function(c){var D=NS(c.d),n=T-D+1;
  steps.push({h:'HERE IS '+c.t.toUpperCase(),a:(D-B)/life,c:n/life,tag:nice(c.d),cap:'Since '+nice(c.d),ticks:1,end:1,st:1,pc:n/life>=0.08?pct(n/life):'',
   note:ago(c.d,ts)+'. '+num(n)+' days, '+pct(n/life)+' of your life so far.'})});
 return {life:life,T:T,B:B,ticks:ticks,steps:steps,date:DOW[jsd]+', '+MO3[t.m-1]+' '+t.d+', '+t.y,
  lad:[{l:'Week',e:(wd+1)/7,c:1/7},{l:'Month',e:t.d/dim,c:1/dim},{l:'Year',e:doy/diy,c:1/diy},{l:'My life',e:1,c:(T-ys+1)/life}]}}
var CSS=":host{display:block;margin:9px 0;font-family:Roboto,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:#1f2a44}*{box-sizing:border-box}"
+".bn{background:#fff;border:1px solid #e3e7ee;border-radius:14px;overflow:hidden}"
+".face{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;position:relative}.face:focus-visible{outline:2px solid #3f6f8f;outline-offset:-3px}"
+".strip{height:120px;display:flex;align-items:center;gap:16px;padding:0 28px 0 16px}"
+".ttl{width:150px;flex:none;font-size:17px;line-height:1.2;font-weight:800}"
+".mini{flex:1;min-width:0;height:64px;position:relative;display:flex;border-radius:4px;overflow:hidden;background:#eef1f6}"
+".mini i,.lb i{display:block;height:100%}.o{background:#f0b48a;transition:background .2s}.y{background:#e9dc6a;transition:background .2s}.mini .y{min-width:4px}"
+".face:hover .o{background:#ff6a00}.face:hover .y{background:#e2d000}"
+".mini s{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.75)}"
+".fb{flex:1;min-width:0;display:flex;align-items:center;gap:18px}.fb .sqr{width:64px;height:64px;flex:none;border-radius:3px}.fb b{display:block;font-size:20px;font-weight:800}.fb span{font-size:12.5px;color:#5b6472}"
+".fc{flex:1;min-width:0;display:flex;gap:14px;align-items:flex-end;height:64px}.fc>div{flex:1;min-width:0}.fc>div:last-child{flex:2.2}.lb{height:40px;display:flex;border-radius:4px;overflow:hidden;background:#eef1f6}.lb .y{min-width:3px}.fc em{display:block;font-style:normal;font-size:11.5px;color:#5b6472;margin-top:5px;white-space:nowrap}"
+".rt{width:190px;flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px}.rt b{font-size:42px;font-weight:800;line-height:1;color:#9aa6b4;font-variant-numeric:tabular-nums}.rt span{font-size:11.5px;color:#5b6472}"
+".top{position:relative;height:120px}"
+".stage{position:absolute;inset:0;background:#fff;color:#1f2a44;cursor:pointer;display:flex;flex-direction:column;align-items:center;padding:0 28px 26px;transition:background .6s ease,color .6s ease;outline:none;-webkit-user-select:none;user-select:none}"
+".bn.on .stage{background:#0e1216;color:#fff}.stage:focus-visible{outline:2px solid #3f6f8f;outline-offset:-3px}"
+".htop{flex:1 1 auto;width:100%;min-height:0;display:flex;align-items:center;justify-content:center}.stage:not(.s0) .htop{align-items:flex-start;padding-top:7px}.h{font-size:19px;font-weight:800;letter-spacing:.02em;margin:0;line-height:20px;white-space:nowrap}"
+".sm{width:100%;flex:none}"
+".bar{position:relative;height:44px;width:100%;margin:0 auto;display:flex;transition:width .9s cubic-bezier(.6,0,.2,1)}.bar.sq{width:44px}"
+".bar i{display:block;height:100%;transition:width .9s cubic-bezier(.6,0,.2,1)}.bar .o{background:#ff6a00}.bar .y{background:#e2d000;min-width:3px}.bar .g{background:#23272e;flex:1}.bar.rev .g{order:-1}.bar .y{display:flex;align-items:center;justify-content:center;overflow:hidden}.pc{font-size:22px;line-height:1;font-weight:300;color:rgba(14,18,22,.5);white-space:nowrap;font-variant-numeric:tabular-nums}.h em{font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;letter-spacing:0}"
+".mk{position:absolute;bottom:100%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:1px;padding-bottom:2px;font-size:10.5px;line-height:11px;white-space:nowrap;transition:left .9s cubic-bezier(.6,0,.2,1)}"
+".mk:after{content:'';border:6px solid transparent;border-top:7px solid currentColor;border-bottom:0}"
+".tk{position:absolute;top:0;bottom:0;width:1px;background:rgba(14,18,22,.3);opacity:0;transition:opacity .6s .5s}.tk span{position:absolute;bottom:2px;left:3px;font-size:9px;line-height:1;color:rgba(14,18,22,.62)}.tk.on{opacity:1}.mk.pulse:after{animation:arwpulse 2.2s ease-in-out infinite}@keyframes arwpulse{0%,100%{opacity:0}50%{opacity:1}}"
+".cl{position:absolute;left:70px;bottom:7px;margin:0;font-size:12px;line-height:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:calc(100% - 180px);opacity:0;transition:opacity .6s ease}.s0 .cl{left:28px;bottom:auto;top:50%;transform:translateY(-50%);max-width:calc(50% - 56px);white-space:normal;font-size:13px;line-height:18px;font-weight:400}.s0 .cl i{display:block;margin:0;font-weight:400;font-size:12px}.bn.on .cl{opacity:1}.cl i{font-style:normal;color:#aeb6c0;margin-left:6px}"
+".eb,.bk{all:unset;cursor:pointer;position:absolute;bottom:6px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-weight:400;font-size:14px;color:#5b6472}.eb{right:14px}.bk{left:14px}.bn.on .eb,.bn.on .bk{color:#7c8794}.eb:hover,.bk:hover{text-decoration:underline}.bk[hidden]{display:none}"
+".src{position:absolute;top:0;left:0;width:24px;height:24px;display:block}.src:after{content:'';position:absolute;top:9px;left:10px;width:5px;height:5px;border-radius:50%;background:#5b6472}.src:hover:after{background:#e2d000}.src:focus-visible{outline:2px solid #3f6f8f;outline-offset:-3px}.eb:focus-visible,.bk:focus-visible,.pn button:focus-visible{outline:2px solid #e2d000;outline-offset:3px}"
+".drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s ease}.bn.ed .drop{grid-template-rows:1fr}.drop>.in{overflow:hidden;min-height:0}"
+".pn{background:#0e1216;color:#fff;border-top:1px solid #23272e;padding:20px 22px;text-align:left}"
+".gr{flex:none;width:22px;text-align:center;color:#7c8794;cursor:grab;font-size:16px;line-height:30px;-webkit-user-select:none;user-select:none}.gr:hover{color:#fff}.gr.no{visibility:hidden}.row.over{box-shadow:0 -2px 0 #e2d000}.row.drag{opacity:.4}"
+".pn h3{margin:0 0 4px;font-size:18px;font-weight:800}.pn p{margin:0 0 14px;font-size:12.5px;color:#aeb6c0}"
+".row{display:flex;gap:8px;align-items:center;margin:0 0 8px}.row input{font:inherit;font-size:14px;color:#fff;background:#1b2027;border:1px solid #3a424c;border-radius:8px;padding:8px 10px;min-width:0;color-scheme:dark}.row input:focus{outline:none;border-color:#e2d000}.row .t{flex:1}.row .d{width:160px;flex:none}"
+".row .x{all:unset;cursor:pointer;width:30px;height:30px;flex:none;text-align:center;border-radius:99px;color:#aeb6c0;font-size:18px}.row .x:hover{background:#2a1c1c;color:#ff8a7a}.row .x[disabled]{visibility:hidden}"
+".row small{flex:none;width:92px;font-size:11px;color:#e0ab52}"
+".pb{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}.pb button{all:unset;cursor:pointer;font-size:13.5px;font-weight:700;border-radius:8px;padding:8px 16px;border:1px solid #4a525c;color:#fff}.pb .done{background:#e2d000;border-color:#e2d000;color:#0e1216}.pb .st{font-size:12px;color:#aeb6c0}.pb .un{border:0;padding:0;color:#e2d000;text-decoration:underline;font-weight:500}"
+"@media(prefers-reduced-motion:reduce){.bar,.bar i,.mk,.drop,.tk,.stage,.cl{transition:none}.mk.pulse:after{animation:none}}"
+"@media(max-width:760px){.stage{padding:0 12px 26px}.h{font-size:16px}.cl{left:62px;max-width:calc(100% - 150px);font-size:11px}.cl i{display:none}.s0 .cl{left:12px;max-width:calc(50% - 34px);font-size:12px;line-height:16px}.s0 .cl i{display:block;font-size:11px}.row{flex-wrap:wrap}.row .t{flex:1 1 60%}.row small{display:none}}";
function faceHTML(D,f){
 var L=D.steps[4],mid;
 if(f==='b')mid='<div class="fb"><i class="sqr y"></i><div><b>'+esc(D.date)+'</b><span>Day '+num(D.life)+' of your life</span></div></div>';
 else if(f==='c')mid='<div class="fc">'+D.lad.map(function(l){var o=Math.max(0,l.e-l.c)*100;return '<div><div class="lb"><i class="o" style="width:'+o+'%"></i><i class="y" style="width:'+(l.c*100)+'%"></i></div><em>'+l.l+'</em></div>'}).join('')+'</div>';
 else mid='<div class="mini"><i class="o" style="width:'+(L.a*100)+'%"></i><i class="y" style="width:'+(L.c*100)+'%"></i>'+D.ticks.map(function(k){return '<s style="left:'+(k.x*100)+'%"></s>'}).join('')+'</div>';
 return '<div class="strip"><div class="ttl">Here is<br>Today</div>'+mid+'<div class="rt"><b>'+num(D.life)+'</b><span>days lived, counting today</span></div></div>'}
function mount(host){
 if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 var root=host.attachShadow({mode:'open'}),cfg=clean(DEF),D,step=0,open=host.hasAttribute('data-open'),editing=false,seq=0,undo=null,stat='';
 var forced=host.getAttribute('data-face');
 try{var lc=JSON.parse(localStorage.getItem(KEY)||'null');if(lc)cfg=clean(lc)}catch(e){}
 var $=function(q){return root.querySelector(q)};
 function setStat(s){stat=s;var e=$('.st');if(e)e.textContent=s}
 function save(){var v=JSON.stringify(cfg),mine=++seq,n=0;try{localStorage.setItem(KEY,v)}catch(e){}
  (function go(){if(mine!==seq)return;var sb=window.sb;if(!sb||!sb.from){setStat('Kept on this screen. Sign in to keep it everywhere.');return}
   sb.from('app_meta').upsert({key:KEY,value:v,updated_at:new Date().toISOString()}).then(function(r){if(r&&r.error)throw r.error;if(mine===seq)setStat('Saved')})
   .catch(function(){if(mine!==seq)return;if(++n<8){setStat('Weak connection. Your change is kept safe on this screen, still trying...');setTimeout(go,1500*n)}else setStat('Not saved everywhere yet. It is kept on this screen.')})})()}
 function rows(){var T=D.T,B=D.B;
  return '<div class="row"><span class="gr no">⠇</span><input class="t" value="My life starts" disabled aria-label="Name"><input class="d" type="date" data-birth value="'+cfg.birth+'" aria-label="Date my life starts"><small></small><button class="x" disabled></button></div>'
  +cfg.chapters.map(function(c,i){var w='';if(c.d){var n=NS(c.d);w=n>T?'Not yet, hidden':n<B?'Before my life':''}else w='Needs a date';
   return '<div class="row" data-r="'+i+'"><span class="gr" draggable="true" data-g="'+i+'" title="Drag to change the order">⠇⠇</span><input class="t" data-i="'+i+'" value="'+esc(c.t)+'" placeholder="Reads after HERE IS" aria-label="Name"><input class="d" type="date" data-i="'+i+'" value="'+c.d+'" aria-label="Date"><small>'+w+'</small><button class="x" type="button" data-del="'+i+'" title="Delete this date" aria-label="Delete '+esc(c.t)+'">&times;</button></div>'}).join('')}
 function render(){D=build(cfg);if(step>=D.steps.length)step=D.steps.length-1;
  root.innerHTML='<style>'+CSS+'</style><div class="bn'+(open?' on':'')+(editing?' ed':'')+'"><div class="top"><div class="stage" role="button" tabindex="0" aria-label="Here is Today. Tap to step back through time.">'
  +'<div class="htop"><h2 class="h"></h2></div><div class="sm"><div class="bar"><span class="mk"></span><i class="o"></i><i class="y"><b class="pc"></b></i><i class="g"></i>'+D.ticks.map(function(k){return '<span class="tk" style="left:'+(k.x*100)+'%"><span>'+k.l+'</span></span>'}).join('')+'</div></div><p class="cl"></p>'
  +'<button class="bk" type="button" data-a="back">- back</button><button class="eb" type="button" data-a="edit">Edit dates</button></div><a class="src" href="https://wvnl.xyz/hereistoday/" target="_blank" rel="noopener" title="The original Here is Today" aria-label="Open the original Here is Today site in a new tab"></a></div>'
  +'<div class="drop"><div class="in"><div class="pn"><h3>My dates</h3><p>Change a name or a date, delete one, or add a new one. Drag the dots to change the order. Each becomes a step after My Life, in this order, and its headline reads HERE IS plus the name. Dates that have not happened yet stay hidden until they do.</p>'
  +'<div class="rows">'+rows()+'</div><div class="pb"><button type="button" data-a="add">+ Add a date</button><button type="button" class="done" data-a="done">Done</button><span class="st">'+esc(stat)+'</span>'+(undo?'<button type="button" class="un" data-a="undo">Undo delete</button>':'')+'</div></div>'
  +'</div></div></div>';paint()}
 function paint(){var s=D.steps[step],bar=$('.bar');
  if(s.hx)$('.h').innerHTML=s.hx;else $('.h').textContent=s.h;$('.pc').textContent=s.pc||'';$('.cl').innerHTML=esc(s.cap)+'<i>'+esc(s.note)+'</i>';
  bar.classList.toggle('sq',!!s.sq);bar.classList.toggle('rev',!!s.rev);var a=s.sq?0:s.a*100,c=s.sq?100:s.c*100;
  $('.bar .o').style.width=a+'%';$('.bar .y').style.width=c+'%';$('.bar .g').style.display=(s.sq||s.end)?'none':'';
  $('.mk').style.left=(s.rev?(100-c/2):s.st?a:(a+c/2))+'%';$('.stage').classList.toggle('s0',!!s.sq);$('.mk').textContent=s.tag||'';$('.mk').classList.toggle('pulse',!open);
  [].forEach.call(root.querySelectorAll('.tk'),function(e){e.classList.toggle('on',!!s.ticks)});
  $('.bk').hidden=!open||step===0}
 function advance(){if(!open){open=true;step=0}else if(step<D.steps.length-1)step++;else{open=false;step=0}
  $('.bn').classList.toggle('on',open);paint()}
 var drag=null;
 root.addEventListener('click',function(e){var t=e.target;if(!t.closest)return;
  var d=t.closest('[data-del]');
  if(d){var i=+d.getAttribute('data-del');undo={i:i,c:cfg.chapters[i]};cfg.chapters.splice(i,1);save();render();return}
  var b=t.closest('[data-a]');
  if(b){var a=b.getAttribute('data-a');
   if(a==='back'){step=Math.max(step-1,0);paint()}
   else if(a==='edit'){editing=!editing;undo=null;stat='';if(!editing)cfg.chapters=cfg.chapters.filter(function(c){return c.t||c.d});render()}
   else if(a==='done'){editing=false;undo=null;cfg.chapters=cfg.chapters.filter(function(c){return c.t||c.d});save();render()}
   else if(a==='add'){cfg.chapters.push({t:'',d:''});render();var ins=root.querySelectorAll('.row .t');ins[ins.length-1].focus()}
   else if(a==='undo'&&undo){cfg.chapters.splice(undo.i,0,undo.c);undo=null;save();render()}
   return}
  if(t.closest('.stage'))advance()});
 root.addEventListener('keydown',function(e){if((e.key==='Enter'||e.key===' ')&&e.target.classList&&e.target.classList.contains('stage')){e.preventDefault();advance()}});
 root.addEventListener('dragstart',function(e){var g=e.target.closest&&e.target.closest('.gr');if(!g||g.classList.contains('no'))return;drag=+g.getAttribute('data-g');
  try{e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain','');e.dataTransfer.setDragImage(g.parentNode,12,18)}catch(x){}g.parentNode.classList.add('drag')});
 root.addEventListener('dragover',function(e){if(drag==null)return;var r=e.target.closest&&e.target.closest('[data-r]');if(!r)return;e.preventDefault();
  [].forEach.call(root.querySelectorAll('.row.over'),function(x){x.classList.remove('over')});r.classList.add('over')});
 root.addEventListener('drop',function(e){if(drag==null)return;var r=e.target.closest&&e.target.closest('[data-r]');if(!r)return;e.preventDefault();
  var to=+r.getAttribute('data-r'),it=cfg.chapters.splice(drag,1)[0];cfg.chapters.splice(to,0,it);drag=null;undo=null;save();render()});
 root.addEventListener('dragend',function(){drag=null;[].forEach.call(root.querySelectorAll('.row.over,.row.drag'),function(x){x.classList.remove('over');x.classList.remove('drag')})});
 root.addEventListener('input',function(e){var el=e.target;if(!el||!el.classList)return;
  if(el.hasAttribute('data-birth')){if(RE.test(el.value)&&NS(el.value)<=NS(today())){cfg.birth=el.value;save()}return}
  var i=el.getAttribute('data-i');if(i==null)return;var c=cfg.chapters[+i];if(!c)return;
  if(el.classList.contains('t'))c.t=el.value.slice(0,60);else c.d=RE.test(el.value)?el.value:'';save()});
 render();
 function pull(){var sb=window.sb;if(!sb||!sb.from)return;
  sb.from('app_meta').select('value').eq('key',KEY).maybeSingle().then(function(r){try{if(r&&r.data&&r.data.value&&!editing&&!seq){cfg=clean(JSON.parse(r.data.value));try{localStorage.setItem(KEY,JSON.stringify(cfg))}catch(e){}render()}}catch(e){}},function(){})}
 var sb=window.sb;
 if(sb&&sb.auth&&sb.auth.getSession)sb.auth.getSession().then(function(r){if(r&&r.data&&r.data.session)pull();else sb.auth.onAuthStateChange(function(ev,s){if(s)pull()})}).catch(function(){});
 else pull()}
function start(){[].forEach.call(document.querySelectorAll('#hereIsTodayHost,[data-here-is-today]'),mount)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
