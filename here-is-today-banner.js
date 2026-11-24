/* Here is Today, habits dashboard banner. v0.1 MOCK (Nov 23, 2026).
   Inspired by wvnl.xyz/hereistoday. Starts on today and steps back, one zoom at a time,
   to the day Scott's life started (Sep 28, 1970). Only time that has already happened is coloured.
   Shadow root, so no page styles leak in or out. The day ends at 2am Eastern (PY.today when present). */
(function(){
var BIRTH='1970-09-28';
var MON=['January','February','March','April','May','June','July','August','September','October','November','December'];
var MO3=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var DOW=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
function today(){try{if(window.PY&&PY.today){var v=PY.today();if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v}}catch(e){}
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()-2*3600e3))}
function P(s){var a=s.split('-');return {y:+a[0],m:+a[1],d:+a[2]}}
function N(y,m,d){return Math.round(Date.UTC(y,m-1,d)/864e5)}
function num(n){return String(n).replace(/\B(?=(\d{3})+(?!\d))/g,',')}
function nice(s){var p=P(s);return MO3[p.m-1]+' '+p.d+', '+p.y}
function pct(x){var v=x*100;return (v<0.01?v.toFixed(3):v<1?v.toFixed(2):v.toFixed(1))+'%'}
function build(){
 var t=P(today()),b=P(BIRTH),T=N(t.y,t.m,t.d),B=N(b.y,b.m,b.d),life=T-B+1;
 var dim=N(t.y,t.m+1,1)-N(t.y,t.m,1),m0=N(t.y,t.m,1),y0=N(t.y,1,1),diy=N(t.y+1,1,1)-y0,doy=T-y0+1;
 var dy=Math.floor(t.y/10)*10,d0=N(dy,1,1),dlen=N(dy+10,1,1)-d0;
 var dow=DOW[new Date(Date.UTC(t.y,t.m-1,t.d)).getUTCDay()];
 var ticks=[];for(var k=Math.ceil((b.y+1)/10)*10;k<=t.y;k+=10)ticks.push({x:(N(k,1,1)-B)/life,l:String(k)});
 return {life:life,steps:[
  {h:'HERE IS TODAY',sq:1,cap:dow+', '+MO3[t.m-1]+' '+t.d+', '+t.y,note:'Day '+num(life)+' of your life.'},
  {h:'HERE IS THIS MONTH',a:(t.d-1)/dim,c:1/dim,tag:'Today',cap:MON[t.m-1],note:'Day '+t.d+' of '+dim+'.'},
  {h:'HERE IS THIS YEAR',a:(m0-y0)/diy,c:dim/diy,tag:MON[t.m-1],cap:String(t.y),note:'Day '+doy+' of '+diy+'.'},
  {h:'HERE IS THIS DECADE',a:(y0-d0)/dlen,c:diy/dlen,tag:String(t.y),cap:'The '+dy+'s',note:'Year '+(t.y-dy+1)+' of 10.'},
  {h:'HERE IS MY LIFE',a:(d0-B)/life,c:(T-d0+1)/life,tag:'The '+dy+'s',cap:nice(BIRTH)+' to today',ticks:ticks,
   note:num(life)+' days lived. Today is one of them: '+pct(1/life)+' of the whole. '+t.y+' so far is '+pct(doy/life)+'.'}
 ]}}
var CSS=":host{display:block;margin:9px 0;font-family:Roboto,Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:#1f2a44}*{box-sizing:border-box}"
+".bn{background:#fff;border:1px solid #e3e7ee;border-radius:14px;overflow:hidden}"
+".face{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;position:relative}.face:focus-visible{outline:2px solid #3f6f8f;outline-offset:-3px}"
+".strip{height:120px;display:flex;align-items:center;gap:16px;padding:0 28px 0 16px}"
+".ttl{width:150px;flex:none;font-size:17px;line-height:1.2;font-weight:800}"
+".mini{flex:1;min-width:0;height:64px;position:relative;display:flex;border-radius:4px;overflow:hidden;background:#eef1f6}"
+".mini i{display:block;height:100%}.mini .o{background:#f0b48a;transition:background .2s}.mini .y{background:#e9dc6a;min-width:4px;transition:background .2s}"
+".face:hover .mini .o{background:#ff6a00}.face:hover .mini .y{background:#e2d000}"
+".mini s{position:absolute;top:0;bottom:0;width:1px;background:rgba(255,255,255,.75)}"
+".rt{width:190px;flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:2px}.rt b{font-size:42px;font-weight:800;line-height:1;color:#9aa6b4;font-variant-numeric:tabular-nums}.rt span{font-size:11.5px;color:#5b6472}"
+".arr{position:absolute;left:50%;bottom:1px;transform:translateX(-50%);color:#9aa6b4;opacity:.55;display:flex;pointer-events:none}.arr svg{width:10px;height:10px;transition:transform .25s ease}.bn.open .arr svg{transform:rotate(180deg)}"
+".drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s ease}.bn.open .drop{grid-template-rows:1fr}.drop>.in{overflow:hidden;min-height:0}"
+".stage{background:#0e1216;background-image:radial-gradient(ellipse at 50% -20%,#2a2f36 0,#0e1216 60%);color:#fff;padding:44px 6% 30px;text-align:center}"
+".h{font-size:clamp(28px,4.4vw,52px);font-weight:800;letter-spacing:.01em;margin:0 0 54px;line-height:1.05}"
+".bar{position:relative;height:110px;width:100%;margin:0 auto;display:flex;transition:width .9s cubic-bezier(.6,0,.2,1)}"
+".bar.sq{width:110px}"
+".bar i{display:block;height:100%;transition:width .9s cubic-bezier(.6,0,.2,1)}.bar .o{background:#ff6a00}.bar .y{background:#e2d000;min-width:3px}.bar .g{background:#23272e;flex:1}"
+".mk{position:absolute;bottom:100%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px;padding-bottom:7px;font-size:13px;white-space:nowrap;transition:left .9s cubic-bezier(.6,0,.2,1)}"
+".mk:after{content:'';border:13px solid transparent;border-top:15px solid #fff;border-bottom:0}"
+".tk{position:absolute;top:100%;font-size:11px;color:#7c8794;transform:translateX(-50%);padding-top:5px;opacity:0;transition:opacity .6s .5s}.tk:before{content:'';position:absolute;left:50%;bottom:100%;height:110px;width:1px;background:rgba(14,18,22,.35)}.tk.on{opacity:1}"
+".cap{margin:30px 0 0;font-size:15px;min-height:21px}.note{margin:8px auto 0;font-size:13.5px;color:#aeb6c0;min-height:19px;max-width:70ch}"
+".rule{width:min(400px,60%);height:1px;background:#8d949c;margin:26px auto 22px}"
+".nav{display:flex;justify-content:center;gap:26px;font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:30px}"
+".nav button{all:unset;cursor:pointer;color:#fff;padding:2px 6px;border-bottom:1px solid transparent}.nav button:hover{border-bottom-color:#fff}.nav button:focus-visible{outline:2px solid #e2d000;outline-offset:3px}.nav button[hidden]{display:none}"
+"@media(prefers-reduced-motion:reduce){.bar,.bar i,.mk,.drop,.tk{transition:none}}"
+"@media(max-width:640px){.rt{display:none}.ttl{width:104px}.strip{padding:0 16px}.bar{height:80px}.bar.sq{width:80px}.tk:before{height:80px}.nav{font-size:24px}}";
function mount(host){
 if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 var root=host.attachShadow({mode:'open'}),D=build(),step=0,open=host.hasAttribute('data-open');
 var L=D.steps[D.steps.length-1];
 root.innerHTML='<style>'+CSS+'</style><div class="bn'+(open?' open':'')+'">'
  +'<button class="face" type="button" aria-expanded="'+open+'"><div class="strip"><div class="ttl">Here is<br>Today</div>'
  +'<div class="mini"><i class="o" style="width:'+(L.a*100)+'%"></i><i class="y" style="width:'+(L.c*100)+'%"></i>'+L.ticks.map(function(k){return '<s style="left:'+(k.x*100)+'%"></s>'}).join('')+'</div>'
  +'<div class="rt"><b>'+num(D.life)+'</b><span>days lived, counting today</span></div></div>'
  +'<span class="arr"><svg viewBox="0 0 10 10"><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span></button>'
  +'<div class="drop"><div class="in"><div class="stage"><h2 class="h"></h2>'
  +'<div class="bar"><span class="mk"></span><i class="o"></i><i class="y"></i><i class="g"></i><span class="tks"></span></div>'
  +'<p class="cap"></p><p class="note"></p><div class="rule"></div>'
  +'<div class="nav"><button type="button" data-a="back">- back</button><button type="button" data-a="next">Okay +</button><button type="button" data-a="again">Start again</button></div>'
  +'</div></div></div></div>';
 var $=function(q){return root.querySelector(q)},bn=$('.bn'),bar=$('.bar');
 $('.tks').innerHTML=L.ticks.map(function(k){return '<span class="tk" style="left:'+(k.x*100)+'%">'+k.l+'</span>'}).join('');
 function paint(){var s=D.steps[step],last=step===D.steps.length-1;
  $('.h').textContent=s.h;$('.cap').textContent=s.cap;$('.note').textContent=s.note;
  bar.classList.toggle('sq',!!s.sq);
  var a=s.sq?0:s.a*100,c=s.sq?100:s.c*100;
  $('.bar .o').style.width=a+'%';$('.bar .y').style.width=c+'%';
  $('.bar .g').style.display=(s.sq||last)?'none':'';
  $('.mk').style.left=(a+c/2)+'%';$('.mk').textContent=s.tag||'';
  [].forEach.call(root.querySelectorAll('.tk'),function(e){e.classList.toggle('on',!!s.ticks)});
  $('[data-a=back]').hidden=step===0;$('[data-a=next]').hidden=last;$('[data-a=again]').hidden=!last}
 root.addEventListener('click',function(e){var f=e.target.closest&&e.target.closest('.face');
  if(f){open=!open;bn.classList.toggle('open',open);f.setAttribute('aria-expanded',open);return}
  var b=e.target.closest&&e.target.closest('[data-a]');if(!b)return;var a=b.getAttribute('data-a');
  if(a==='next')step=Math.min(step+1,D.steps.length-1);else if(a==='back')step=Math.max(step-1,0);else step=0;paint()});
 paint()}
function start(){mount(document.getElementById('hereIsTodayHost'))}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
