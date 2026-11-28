/* Fill the Gaps nudge strip for Todays Tasks, v1.0 (Nov 28, 2026).
   Scott, Nov 28: "prompt me when there are larger than normal gaps as a rule, that way we can help
   fill in more of the empty spaces." His threshold is 60 minutes. He chose the quiet strip on Todays
   Tasks, showing anything still untagged from the past fortnight, not just yesterday.
   Shadow root, so none of the page styles leak in or out. */
(function(){
var DAYS=14, MINGAP=60;
var TAGS=["Getting ready","Eating","Commute","Family","Social","Downtime","Chores","Exercise","Project YOU","TreadWell","Day Job","Learning","Recreation","Travel"];
var MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
var CSS="\n:host{display:block;margin:8px 0}\n*{box-sizing:border-box}\n"+
".s{background:var(--c,#fff);border:1px solid #e3e7ee;border-radius:10px;font-family:Roboto,Arial,sans-serif;font-variant-numeric:tabular-nums;color:#1f2a44;overflow:hidden}\n"+
".hd{all:unset;display:flex;align-items:center;gap:9px;width:100%;padding:9px 13px;cursor:pointer;font-size:12.5px}\n"+
".hd:focus-visible{outline:2px solid #3f6f8f;outline-offset:-3px}\n"+
".dot{width:7px;height:7px;border-radius:99px;background:#b8801f;flex:none}\n"+
".hd b{font-weight:700}.hd .m{color:#5b6472;font-weight:400}\n"+
".cv{margin-left:auto;color:#9aa6b4;font-size:11px;transition:transform .2s}\n.s.o .cv{transform:rotate(180deg)}\n"+
".bd{display:none;border-top:1px solid #eef0f5;padding:4px 13px 11px}\n.s.o .bd{display:block}\n"+
".g{padding:9px 0;border-bottom:1px solid #f1f3f8}.g:last-child{border-bottom:0}\n"+
".gt{font-size:12.5px;margin-bottom:6px}.gt b{font-weight:700}.gt span{color:#5b6472}\n"+
".gt .sg{color:#3f6f8f;font-weight:700;margin-left:6px}\n"+
".pl{display:flex;gap:5px;flex-wrap:wrap}\n"+
".p{all:unset;font-family:inherit;font-size:11.5px;color:#5b6472;background:#f3f5f9;border:1px solid #e3e7ee;border-radius:99px;padding:4px 10px;cursor:pointer}\n"+
".p:hover{border-color:#3f6f8f;color:#1f2a44}.p.sug{border-style:dashed;border-color:#3f6f8f;color:#3f6f8f}\n"+
".p:focus-visible{outline:2px solid #3f6f8f;outline-offset:1px}\n"+
".mo{display:block;margin:9px 0 0;font-size:11.5px;color:#3f6f8f;text-decoration:none;font-weight:700}\n"+
"@media (prefers-color-scheme: dark){:host-context(body){}\n"+
".s{background:#1a212c;border-color:#2c3644;color:#e6ebf3}.bd{border-top-color:#222c38}\n"+
".g{border-bottom-color:#222c38}.hd .m,.gt span{color:#9aa6b6}\n"+
".p{background:#141a23;border-color:#2c3644;color:#9aa6b6}}\n";
var G=[],open=false,host,root,pend=0;
function hm(m){m=((m%1440)+1440)%1440;var h=Math.floor(m/60),x=m%60;return (h%12||12)+(x?':'+('0'+x).slice(-2):'')+(h>=12?'pm':'am')}
function dur(m){var h=Math.floor(m/60),x=m%60;return h?(h+'h'+(x?' '+x+'m':'')):(x+'m')}
function lab(ds){var d=new Date(ds+'T12:00:00');return DN[d.getDay()]+' '+MN[d.getMonth()]+' '+d.getDate()}
function wknd(ds){var d=new Date(ds+'T12:00:00');return d.getDay()===0||d.getDay()===6}
function iso(d){return d.toISOString().slice(0,10)}
/* same guess the Fill the Gaps page makes, so the two never disagree */
function suggest(g,all){var mid=g.start_min+g.mins/2,w=wknd(g.day),sc={},best=null,bv=0;
 var cnt={};
 all.forEach(function(o){if(!o.tag)return;var om=o.start_min+o.mins/2,n=Math.abs(om-mid);if(n>120)return;
  var k=(120-n)/120;if(wknd(o.day)===w)k*=1.8;sc[o.tag]=(sc[o.tag]||0)+k;cnt[o.tag]=(cnt[o.tag]||0)+1});
 for(var t in sc){if(sc[t]>bv){bv=sc[t];best=t}}
 /* two examples minimum: one tagged gap is a coincidence, not a pattern */
 return (best&&cnt[best]>=2&&bv>=0.9)?best:null}
function save(g,tries){tries=tries||0;pend++;
 window.sb.from('gap_tags').upsert({day:g.day,start_min:g.start_min,mins:g.mins,tag:g.tag,updated_at:new Date().toISOString()},{onConflict:'day,start_min'})
  .then(function(r){pend--;if(r&&r.error)throw r.error})
  .catch(function(){pend--;if(tries<4)setTimeout(function(){save(g,tries+1)},1200*(tries+1))})}
function render(){
 var un=G.filter(function(g){return !g.tag});
 if(!un.length){host.style.display='none';return}
 host.style.display='';
 var mins=un.reduce(function(a,g){return a+g.mins},0);
 var h='<div class="s'+(open?' o':'')+'"><button class="hd" type="button" data-act="t" aria-expanded="'+open+'">'+
   '<span class="dot"></span><b>'+un.length+' gap'+(un.length>1?'s':'')+'</b>'+
   '<span class="m">still to account for, '+dur(mins)+' in the last fortnight</span>'+
   '<span class="cv">&#9660;</span></button><div class="bd">';
 un.slice(0,6).forEach(function(g){var sg=suggest(g,G);
  h+='<div class="g"><div class="gt"><b>'+lab(g.day)+'</b> <span>'+hm(g.start_min)+' to '+hm(g.start_min+g.mins)+', '+dur(g.mins)+'</span>'+
     (sg?'<span class="sg">looks like '+sg+'</span>':'')+'</div><div class="pl">'+
     TAGS.map(function(t){return '<button class="p'+(sg===t?' sug':'')+'" type="button" data-d="'+g.day+'" data-s="'+g.start_min+'" data-t="'+t+'">'+t+'</button>'}).join('')+
     '</div></div>'});
 if(un.length>6)h+='<a class="mo" href="gap-filler.html">See all '+un.length+' on Fill the Gaps</a>';
 else h+='<a class="mo" href="gap-filler.html">Open Fill the Gaps</a>';
 root.innerHTML='<style>'+CSS+'</style>'+h+'</div></div>';
}
function boot(){
 host=document.getElementById('gapNudgeHost');
 if(!host||host.getAttribute('data-on'))return;
 host.setAttribute('data-on','1');host.style.display='none';
 root=host.attachShadow({mode:'open'});
 try{open=localStorage.getItem('pygap_open')==='1'}catch(e){}
 root.addEventListener('click',function(e){
  var b=e.target.closest&&e.target.closest('.p');
  if(b){var g=G.filter(function(x){return x.day===b.getAttribute('data-d')&&x.start_min==b.getAttribute('data-s')})[0];
   if(g){g.tag=b.getAttribute('data-t');render();save(g)}return}
  if(e.target.closest&&e.target.closest('[data-act="t"]')){open=!open;try{localStorage.setItem('pygap_open',open?'1':'0')}catch(x){}render()}});
 var to=new Date(),from=new Date(Date.now()-DAYS*864e5);
 window.sb.rpc('py_gaps',{p_from:iso(from),p_to:iso(to),p_min:MINGAP})
  .then(function(r){if(r.error)throw r.error;G=r.data||[];render()})
  .catch(function(){host.style.display='none'});
}
function go(){var sb=window.sb;if(!sb)return;
 if(sb.auth&&sb.auth.getSession){sb.auth.getSession().then(function(r){
   if(r&&r.data&&r.data.session)boot();else sb.auth.onAuthStateChange(function(ev,s){if(s)boot()})}).catch(boot)}
 else boot()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();
})();
