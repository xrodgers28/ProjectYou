/* Where my Project YOU time went, habits dashboard strip v1.0 (Nov 23, 2026).
   One stacked bar for the chosen week plus a 4-week trend, split by the work label on each
   dragged Project You block (day_blocks.work_label). Time with no label shows grey.
   Numbers come from the database function py_work_label_minutes: each block counts once,
   only time that has already happened. Shadow root, so no page styles leak in. */
(function(){
var L=[['new','New functionality','#3f6f8f','<path fill-rule="evenodd" d="M5.5 3h13A2.5 2.5 0 0 1 21 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 18.5v-13A2.5 2.5 0 0 1 5.5 3zM11 7v4H7v2h4v4h2v-4h4v-2h-4V7z"/>'],
['design','Finessing design','#c0577f','<path fill-rule="evenodd" d="M12 2l6.5 7.5L16 18H8L5.5 9.5zM12 9a1.6 1.6 0 1 0 0 3.2A1.6 1.6 0 0 0 12 9zm-.8-4.5v4h1.6v-4z"/><rect x="8" y="19.2" width="8" height="2.8" rx="1"/>'],
['insights','Crafting insights','#e8a23a','<path d="M12 2a7 7 0 0 0-4.2 12.6V17h8.4v-2.4A7 7 0 0 0 12 2z"/><rect x="8.8" y="18.2" width="6.4" height="1.8" rx=".9"/><rect x="10" y="20.8" width="4" height="1.6" rx=".8"/>'],
['debug','Debugging','#5f9e6a','<ellipse cx="12" cy="14.5" rx="5" ry="6"/><circle cx="12" cy="6.8" r="3"/>'],
['none','Not labelled yet','#d5dae1','']];
var CSS=':host{display:block;margin:9px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.4;color:#1f2a44}*{box-sizing:border-box}'+
'.bn{background:#fff;border:1px solid #e3e7ee;border-radius:14px;padding:14px 18px;display:flex;gap:28px;flex-wrap:wrap}'+
'.a{flex:1 1 360px;min-width:0}.b{flex:1 1 300px;min-width:0}'+
'.k{font-size:10.5px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase;color:#9aa6b4;margin:0 0 6px}'+
'.big{display:flex;align-items:baseline;gap:8px;margin-bottom:8px}.big b{font-size:26px}.big span{color:#5b6472;font-size:13px}'+
'.bar{display:flex;height:26px;border-radius:7px;overflow:hidden;background:#d5dae1}.bar i{display:block;height:100%}'+
'.leg{display:flex;flex-wrap:wrap;gap:6px 16px;margin-top:10px;font-size:12.5px}.leg span{display:inline-flex;align-items:center;gap:6px}'+
'.leg svg{width:14px;height:14px;fill:currentColor}.leg em{font-style:normal;color:#5b6472}'+
'.trend{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;height:128px;margin-top:2px}'+
'.col{display:flex;flex-direction:column;justify-content:flex-end;height:100%;font-size:11.5px;color:#5b6472;text-align:center}'+
'.stack{display:flex;flex-direction:column-reverse;border-radius:6px;overflow:hidden;width:100%}.col .h{font-weight:700;color:#1f2a44;margin-bottom:3px}.col .d{margin-top:5px}'+
'.col.cur .d{font-weight:700;color:#1f2a44}.note{font-size:12px;color:#8a93a1;margin-top:8px}';
function addD(d,n){var t=new Date(d+'T12:00:00');t.setDate(t.getDate()+n);return t.toISOString().slice(0,10)}
function pd(d){var t=new Date(d+'T12:00:00');return t.toLocaleDateString('en-US',{month:'short',day:'numeric'})}
function hrs(m){return (m/60).toFixed(1)}
function start(){var host=document.getElementById('workLabelHost');if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 var root=host.attachShadow({mode:'open'}),busy=false,again=false;
 function mon(){try{if(typeof WEEK_END!=='undefined'&&/^\d{4}-\d{2}-\d{2}$/.test(WEEK_END))return addD(WEEK_END,-6)}catch(e){}var t=new Date();var d=t.toISOString().slice(0,10);var w=new Date(d+'T12:00:00').getDay();return addD(d,-((w+6)%7))}
 function one(sb,m){return sb.rpc('py_work_label_minutes',{week_start:m}).then(function(r){if(r.error)throw r.error;var o={new:0,design:0,insights:0,debug:0,none:0};(r.data||[]).forEach(function(x){o[x.label in o?x.label:'none']+=x.minutes||0});return o})}
 function sum(o){return o.new+o.design+o.insights+o.debug+o.none}
 function paint(m,ws){var cur=ws[3],t=sum(cur);
  var bar=t?L.map(function(l){var v=cur[l[0]];return v?'<i style="width:'+(v/t*100)+'%;background:'+l[2]+'" title="'+l[1]+' '+hrs(v)+' h"></i>':''}).join(''):'';
  var leg=L.map(function(l){var v=cur[l[0]];if(!v)return '';return '<span><svg viewBox="0 0 24 24" style="color:'+l[2]+'">'+l[3]+'</svg>'+l[1]+' <em>'+hrs(v)+' h · '+Math.round(v/t*100)+'%</em></span>'}).join('');
  var mx=Math.max.apply(null,ws.map(sum).concat([60]));
  var tr=ws.map(function(o,i){var tt=sum(o),st=L.map(function(l){var v=o[l[0]];return v?'<i style="display:block;height:'+(v/tt*100)+'%;background:'+l[2]+'"></i>':''}).join('');
   return '<div class="col'+(i===3?' cur':'')+'"><div class="h">'+hrs(tt)+' h</div><div class="stack" style="height:'+Math.max(4,tt/mx*86)+'px">'+st+'</div><div class="d">'+pd(addD(m,-21+7*i))+'</div></div>'}).join('');
  root.innerHTML='<style>'+CSS+'</style><div class="bn"><div class="a"><p class="k">Where my Project YOU time went · '+pd(m)+' to '+pd(addD(m,6))+'</p><div class="big"><b>'+hrs(t)+' h</b><span>Project YOU</span></div><div class="bar">'+bar+'</div><div class="leg">'+leg+'</div><p class="note">Only time that has already happened counts. Tap the small corner mark on a Project You block in Todays Tasks to label it.</p></div><div class="b"><p class="k">Last four weeks</p><div class="trend">'+tr+'</div></div></div>'}
 function load(){var sb=window.sb;if(!sb||!sb.rpc)return;if(busy){again=true;return}busy=true;var m=mon();
  Promise.all([-21,-14,-7,0].map(function(k){return one(sb,addD(m,k))})).then(function(ws){busy=false;paint(m,ws);if(again){again=false;load()}}).catch(function(e){busy=false;again=false;if(window.console)console.error('[work label strip]',e)})}
 function go(){load();var lab=document.getElementById('weekLabel'),tm=null;if(lab&&window.MutationObserver)new MutationObserver(function(){clearTimeout(tm);tm=setTimeout(load,150)}).observe(lab,{childList:true,characterData:true,subtree:true})}
 var sb=window.sb;if(!sb){go();return}
 if(sb.auth&&sb.auth.getSession){sb.auth.getSession().then(function(r){if(r&&r.data&&r.data.session)go();else sb.auth.onAuthStateChange(function(ev,s){if(s)go()})}).catch(go)}else go()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
