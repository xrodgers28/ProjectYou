/* Here is Today, habits dashboard banner. v1.1 (Nov 23, 2026).
   v1.1, Scott: the banner no longer opens. Tapping it fills the same strip with black and the steps play inside it, like the original. Folded strip is the Today square. Chapter headlines read HERE IS ... Only the Edit dates list drops down.
   Inspired by wvnl.xyz/hereistoday. Starts on today and steps back, one zoom at a time
   (week, month, year, my life), then walks through the chapters of Scott's life.
   Chapters and the birth date are his to edit (Edit button, top right when open); they save to
   app_meta.here_is_today_cfg so they follow him to every device. Only dates that have already happened are drawn.
   Shadow root, so no page styles leak in or out. The day ends at 2am Eastern (PY.today when present). */
(function(){
var KEY='here_is_today_cfg';
var DEF={birth:'1970-09-28',face:'b',chapters:[{t:'Life with Åsa',d:'2006-08-10'},{t:'Max',d:'2008-05-25'},{t:'Carson',d:'2010-03-05'},{t:'Max getting into USC',d:'2025-12-12'}]};
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
  {h:'HERE IS THIS WEEK',a:wd/7,c:1/7,tag:'Today',cap:'Week of '+niceN(w0),note:'Day '+(wd+1)+' of 7.'},
  {h:'HERE IS THIS MONTH',a:(ws-m0)/dim,c:(we-ws+1)/dim,tag:'This week',cap:MON[t.m-1],note:'Day '+t.d+' of '+dim+'.'},
  {h:'HERE IS THIS YEAR',a:(m0-y0)/diy,c:dim/diy,tag:MON[t.m-1],cap:String(t.y),note:'Day '+doy+' of '+diy+'.'},
  {h:'HERE IS MY LIFE',a:(ys-B)/life,c:(T-ys+1)/life,tag:String(t.y),cap:nice(cfg.birth)+' to today',ticks:1,end:1,
   note:num(life)+' days lived. Today is one of them: '+pct(1/life)+' of the whole. '+t.y+' so far is '+pct((T-ys+1)/life)+'.'}];
 cfg.chapters.filter(function(c){return c.t&&c.d&&NS(c.d)>=B&&NS(c.d)<=T}).sort(function(p,q){return NS(p.d)-NS(q.d)}).forEach(function(c){var D=NS(c.d),n=T-D+1;
  steps.push({h:'HERE IS '+c.t.toUpperCase(),a:(D-B)/life,c:n/life,tag:nice(c.d),cap:'Since '+nice(c.d),ticks:1,end:1,
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
+".stage{position:absolute;inset:0;background:#0e1216;background-image:radial-gradient(ellipse at 50% -60%,#2a2f36 0,#0e1216 70%);color:#fff;display:flex;align-items:center;gap:22px;padding:0 22px;opacity:0;visibility:hidden;transition:opacity .6s ease,visibility 0s .6s}"
+".bn.on .stage{opacity:1;visibility:visible;transition:opacity .6s ease}"
+".sl{width:250px;flex:none;text-align:left;min-width:0}.h{font-size:21px;font-weight:800;letter-spacing:.01em;margin:0;line-height:1.1}.cap{margin:6px 0 0;font-size:12.5px}.note{margin:3px 0 0;font-size:11.5px;line-height:1.3;color:#aeb6c0}"
+".sm{flex:1;min-width:0;padding-top:22px}"
+".bar{position:relative;height:52px;width:100%;margin:0 auto;display:flex;transition:width .9s cubic-bezier(.6,0,.2,1)}.bar.sq{width:52px}"
+".bar i{display:block;height:100%;transition:width .9s cubic-bezier(.6,0,.2,1)}.bar .o{background:#ff6a00}.bar .y{background:#e2d000;min-width:3px}.bar .g{background:#23272e;flex:1}"
+".mk{position:absolute;bottom:100%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:2px;padding-bottom:3px;font-size:11.5px;white-space:nowrap;transition:left .9s cubic-bezier(.6,0,.2,1)}"
+".mk:after{content:'';border:7px solid transparent;border-top:8px solid #fff;border-bottom:0}"
+".tk{position:absolute;top:100%;font-size:10px;color:#7c8794;transform:translateX(-50%);padding-top:3px;opacity:0;transition:opacity .6s .5s}.tk:before{content:'';position:absolute;left:50%;bottom:100%;height:52px;width:1px;background:rgba(14,18,22,.35)}.tk.on{opacity:1}"
+".nav{flex:none;width:176px;display:flex;justify-content:flex-end;gap:14px;padding-top:16px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:21px;white-space:nowrap}"
+".nav button{all:unset;cursor:pointer;color:#fff;padding:2px 3px;border-bottom:1px solid transparent}.nav button:hover{border-bottom-color:#fff}.nav button:focus-visible,.eb:focus-visible,.pn button:focus-visible{outline:2px solid #e2d000;outline-offset:3px}.nav button[hidden]{display:none}"
+".tr{position:absolute;top:7px;right:12px;display:flex;gap:6px;align-items:center}"
+".eb{all:unset;cursor:pointer;font-size:11px;font-weight:700;color:#aeb6c0;border:1px solid #3a424c;border-radius:99px;padding:2px 10px}.eb:hover{color:#fff;border-color:#fff}.eb.cl{padding:2px 8px;font-size:13px;line-height:1.2}"
+".drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s ease}.bn.ed .drop{grid-template-rows:1fr}.drop>.in{overflow:hidden;min-height:0}"
+".pn{background:#0e1216;color:#fff;border-top:1px solid #23272e;padding:20px 22px;text-align:left}"
+".pn h3{margin:0 0 4px;font-size:18px;font-weight:800}.pn p{margin:0 0 14px;font-size:12.5px;color:#aeb6c0}"
+".row{display:flex;gap:8px;align-items:center;margin:0 0 8px}.row input{font:inherit;font-size:14px;color:#fff;background:#1b2027;border:1px solid #3a424c;border-radius:8px;padding:8px 10px;min-width:0;color-scheme:dark}.row input:focus{outline:none;border-color:#e2d000}.row .t{flex:1}.row .d{width:160px;flex:none}"
+".row .x{all:unset;cursor:pointer;width:30px;height:30px;flex:none;text-align:center;border-radius:99px;color:#aeb6c0;font-size:18px}.row .x:hover{background:#2a1c1c;color:#ff8a7a}.row .x[disabled]{visibility:hidden}"
+".row small{flex:none;width:92px;font-size:11px;color:#e0ab52}"
+".pb{display:flex;gap:12px;align-items:center;margin-top:14px;flex-wrap:wrap}.pb button{all:unset;cursor:pointer;font-size:13.5px;font-weight:700;border-radius:8px;padding:8px 16px;border:1px solid #4a525c;color:#fff}.pb .done{background:#e2d000;border-color:#e2d000;color:#0e1216}.pb .st{font-size:12px;color:#aeb6c0}.pb .un{border:0;padding:0;color:#e2d000;text-decoration:underline;font-weight:500}"
+"@media(prefers-reduced-motion:reduce){.bar,.bar i,.mk,.drop,.tk,.stage{transition:none}}"
+"@media(max-width:760px){.rt{display:none}.ttl{width:104px}.strip{padding:0 16px}.stage{gap:10px;padding:0 12px}.sl{width:118px}.h{font-size:15px}.note{display:none}.nav{width:auto;font-size:17px;gap:8px}.row{flex-wrap:wrap}.row .t{flex:1 1 100%}.row small{display:none}}";
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
  return '<div class="row"><input class="t" value="My life starts" disabled aria-label="Name"><input class="d" type="date" data-birth value="'+cfg.birth+'" aria-label="Date my life starts"><small></small><button class="x" disabled></button></div>'
  +cfg.chapters.map(function(c,i){var w='';if(c.d){var n=NS(c.d);w=n>T?'Not yet, hidden':n<B?'Before my life':''}else w='Needs a date';
   return '<div class="row"><input class="t" data-i="'+i+'" value="'+esc(c.t)+'" placeholder="Reads after HERE IS" aria-label="Name"><input class="d" type="date" data-i="'+i+'" value="'+c.d+'" aria-label="Date"><small>'+w+'</small><button class="x" type="button" data-del="'+i+'" title="Delete this date" aria-label="Delete '+esc(c.t)+'">&times;</button></div>'}).join('')}
 function render(){D=build(cfg);if(step>=D.steps.length)step=D.steps.length-1;
  root.innerHTML='<style>'+CSS+'</style><div class="bn'+(open?' on':'')+(editing?' ed':'')+'"><div class="top">'
  +'<button class="face" type="button" aria-label="Here is Today. Tap to play.">'+faceHTML(D,forced||cfg.face)+'</button>'
  +'<div class="stage"><div class="sl"><h2 class="h"></h2><p class="cap"></p><p class="note"></p></div>'
  +'<div class="sm"><div class="bar"><span class="mk"></span><i class="o"></i><i class="y"></i><i class="g"></i>'+D.ticks.map(function(k){return '<span class="tk" style="left:'+(k.x*100)+'%">'+k.l+'</span>'}).join('')+'</div></div>'
  +'<div class="nav"><button type="button" data-a="back">- back</button><button type="button" data-a="next">Okay +</button><button type="button" data-a="again">Start again</button></div>'
  +'<div class="tr"><button class="eb" type="button" data-a="edit">Edit dates</button><button class="eb cl" type="button" data-a="close" title="Close" aria-label="Close">&times;</button></div></div></div>'
  +'<div class="drop"><div class="in"><div class="pn"><h3>My dates</h3><p>Change a name or a date, delete one, or add a new one. Each becomes a step after My Life, and its headline reads HERE IS plus the name. Dates that have not happened yet stay hidden until they do.</p>'
  +'<div class="rows">'+rows()+'</div><div class="pb"><button type="button" data-a="add">+ Add a date</button><button type="button" class="done" data-a="done">Done</button><span class="st">'+esc(stat)+'</span>'+(undo?'<button type="button" class="un" data-a="undo">Undo delete</button>':'')+'</div></div>'
  +'</div></div></div>';paint()}
 function paint(){var s=D.steps[step],last=step===D.steps.length-1,bar=$('.bar');
  $('.h').textContent=s.h;$('.cap').textContent=s.cap;$('.note').textContent=s.note;
  bar.classList.toggle('sq',!!s.sq);var a=s.sq?0:s.a*100,c=s.sq?100:s.c*100;
  $('.bar .o').style.width=a+'%';$('.bar .y').style.width=c+'%';$('.bar .g').style.display=(s.sq||s.end)?'none':'';
  $('.mk').style.left=(a+c/2)+'%';$('.mk').textContent=s.tag||'';
  [].forEach.call(root.querySelectorAll('.tk'),function(e){e.classList.toggle('on',!!s.ticks)});$('.sm').style.paddingBottom=s.ticks?'14px':'0';
  $('[data-a=back]').hidden=step===0;$('[data-a=next]').hidden=last;$('[data-a=again]').hidden=!last}
 root.addEventListener('click',function(e){var f=e.target.closest&&e.target.closest('.face');
  if(f){open=true;step=0;paint();$('.bn').classList.add('on');return}
  var d=e.target.closest&&e.target.closest('[data-del]');
  if(d){var i=+d.getAttribute('data-del');undo={i:i,c:cfg.chapters[i]};cfg.chapters.splice(i,1);save();render();return}
  var b=e.target.closest&&e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
  if(a==='next'){step=Math.min(step+1,D.steps.length-1);paint()}else if(a==='back'){step=Math.max(step-1,0);paint()}else if(a==='again'){step=0;paint()}
  else if(a==='edit'){editing=!editing;undo=null;stat='';if(!editing)cfg.chapters=cfg.chapters.filter(function(c){return c.t||c.d});render()}
  else if(a==='close'){open=false;editing=false;undo=null;render()}
  else if(a==='done'){editing=false;undo=null;cfg.chapters=cfg.chapters.filter(function(c){return c.t||c.d});save();render()}
  else if(a==='add'){cfg.chapters.push({t:'',d:''});render();var ins=root.querySelectorAll('.row .t');ins[ins.length-1].focus()}
  else if(a==='undo'&&undo){cfg.chapters.splice(undo.i,0,undo.c);undo=null;save();render()}});
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
