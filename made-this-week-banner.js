/* What I made this week, habits dashboard banner. v1.8 (Nov 24, 2026).
   Scott's weekly highlight reel. The window shade suggests what he made that week, he taps the
   ones worth showing off (or types his own and tags it with a label), presses "Take screenshots
   and build banner", and the closed strip becomes a contact sheet of real screenshots of those
   pages. Once built, only a tiny grey Edit at the bottom right opens it again.
   Picks live in made_items, labels in made_labels, pictures in made_shots. A picked page with no
   picture yet asks for one (a made_shots row with no image) and the overnight job takes it.
   v1.8, Scott: the banner is always the same height, the one it had with four across. Everything
   stays on one row and the pictures get narrower as more are added, rather than wrapping onto a
   second row and making the banner taller. At six or more the titles are short, so the full title
   shows on rollover.
   v1.7, Scott: a tile only becomes a link when its picture belongs to a real page on the site. The
   TreadWell pictures and his own dropped-in ones are shown but not clickable, so there are no dead links.
   v1.6, Scott: he can drop in his own picture. The Add your own row has an "Add a picture" button,
   and any suggestion with no page of its own (his typed ones, and everything in TreadWell) shows a
   small "add a picture" where the picture note would be. The picture is shrunk on his screen before
   it is saved, so it is the same small size as the ones taken automatically.
   v1.5, Scott: a tile with no picture says what it is waiting for, "Not on the site yet" or
   "Picture on the way", instead of repeating its label, which read badly with several TreadWell ones.
   v1.4, Scott: the strip holds up to eight now instead of five. Five or more lay out in two even
   rows (five as 3 and 2, six as 3 and 3, seven as 4 and 3, eight as 4 and 4) and the pictures sit a
   little shorter so the banner does not get tall.
   v1.3, Scott: the small "picture ready" note beside each suggestion is tiny and grey again (an
   earlier edit dropped its styling by mistake).
   v1.2, Scott: opening the shade fetches every picture it already has, so "picture ready" and the
   live preview above are right before the button is pressed, not only after.
   v1.1, Scott: suggestion titles wrap instead of truncating, the repeated colour key at the bottom
   is gone (the label chips are the key), and the tiny grey button reads Close while the shade is open.
   Shadow root, so no page styles leak in or out. The week runs Monday to Sunday and the day ends
   at 2am Eastern (PY.today when present). */
(function(){
var MAX=8;
var MO=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var SPARE=['#7a6bb5','#c9742f','#5f8f4a','#b05070','#3f6f8f','#8a7355'];
var RE=/^\d{4}-\d{2}-\d{2}$/;
function today(){try{if(window.PY&&PY.today){var v=PY.today();if(RE.test(v))return v}}catch(e){}
 return new Intl.DateTimeFormat('en-CA',{timeZone:'America/New_York',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}
function d2(s){var p=String(s).split('-');return new Date(+p[0],+p[1]-1,+p[2])}
function iso(d){return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
function monday(s){var d=d2(s),w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return iso(d)}
function plus(s,n){var d=d2(s);d.setDate(d.getDate()+n);return iso(d)}
function pretty(s){var d=d2(s);return MO[d.getMonth()]+' '+d.getDate()}
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]})}
function tint(hex){var h=String(hex||'#5b6472').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
 var r=parseInt(h.slice(0,2),16),g=parseInt(h.slice(2,4),16),b=parseInt(h.slice(4,6),16);
 return 'rgba('+r+','+g+','+b+',.14)'}

var CSS=".wrap{font-family:Roboto,Arial,sans-serif;color:#1f2a44;position:relative;-webkit-font-smoothing:antialiased}"
+"*{box-sizing:border-box}"
+".strip{display:flex;align-items:center;gap:14px;min-height:118px;padding:2px 0 10px}"
+".ttl{width:134px;flex:none}"
+".ttl b{display:block;font-size:19px;line-height:1.16;font-weight:700;letter-spacing:-.25px}"
+".ttl span{display:block;margin-top:6px;font-size:10.5px;color:#9aa6b4;letter-spacing:.5px;text-transform:uppercase}"
+".reel{flex:1;display:grid;grid-template-columns:repeat(var(--cols,4),minmax(0,1fr));gap:9px;min-width:0}"
+".tile{min-width:0;height:98px;border:1px solid #e3e7ee;border-radius:7px;overflow:hidden;position:relative;background:#f7f9fb;display:block;text-decoration:none;color:inherit}"
+".tile:hover{border-color:#c6d0dc}"+".reel.many{gap:6px}"+".reel.many .cap{font-size:9.5px;padding:3px 5px;line-height:1.25}"
+".tile img{width:100%;height:100%;object-fit:cover;object-position:top center;display:block}"
+".note{width:100%;height:100%;display:flex;align-items:center;justify-content:center;text-align:center;padding:10px 8px 26px;font-size:10.5px;color:#5b6472;line-height:1.35}"
+".cap{position:absolute;left:0;right:0;bottom:0;background:rgba(255,255,255,.94);border-top:1px solid rgba(31,42,68,.07);font-size:10.5px;line-height:1.3;padding:4px 7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}"
+".pip{position:absolute;top:7px;right:7px;width:8px;height:8px;border-radius:50%;box-shadow:0 0 0 2px rgba(255,255,255,.92)}"
+".empty{flex:1;height:98px;border:1px dashed #d4dbe4;border-radius:7px;display:flex;align-items:center;justify-content:center;gap:12px;color:#9aa6b4;font-size:12.5px}"
+".edit{position:absolute;right:0;bottom:-2px;font:inherit;font-size:11px;color:#a9afb8;background:none;border:0;padding:2px 3px;cursor:pointer}"
+".edit:hover{color:#5b6472}"+".edit.up{top:4px;bottom:auto}"
+".shade{border-top:1px solid #e3e7ee;padding:12px 0 4px}"
+".lead{margin:0 0 9px;font-size:12px;color:#5b6472}"
+".grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(252px,1fr));gap:7px}"
+".opt{display:flex;align-items:flex-start;gap:8px;width:100%;text-align:left;font:inherit;font-size:12.5px;color:#1f2a44;background:#fff;border:1px solid #e3e7ee;border-radius:8px;padding:7px 9px;cursor:pointer}"
+".opt:hover{border-color:#c6d0dc}"
+".opt[aria-pressed=true]{border-color:#3f6f8f;box-shadow:inset 0 0 0 1px #3f6f8f}"
+".box{width:15px;height:15px;border-radius:4px;border:1.5px solid #c4ccd6;flex:none;display:flex;align-items:center;justify-content:center;font-size:10px;color:#fff;line-height:1}"
+".opt[aria-pressed=true] .box{background:#3f6f8f;border-color:#3f6f8f}"
+".pickbtn{flex:1;min-width:0;display:flex;align-items:flex-start;gap:8px;background:none;border:0;padding:0;font:inherit;font-size:12.5px;color:inherit;text-align:left;cursor:pointer}"+".opt .t{flex:1;min-width:0;line-height:1.3}"+".cam{font-size:9.5px;color:#b3bcc7;letter-spacing:.2px;white-space:nowrap;padding-top:2px}"+".camb{font:inherit;font-size:9.5px;color:#8d96a3;letter-spacing:.2px;white-space:nowrap;background:none;border:0;border-bottom:1px dotted #c6d0dc;padding:0 0 1px;margin-top:2px;cursor:pointer}"+".camb:hover{color:#3f6f8f;border-bottom-color:#3f6f8f}"+".b.on{border-color:#3f6f8f;color:#3f6f8f}"+".opt .t em{display:block;font-style:normal;font-size:9.5px;color:#b3bcc7;letter-spacing:.2px;margin-top:2px}"+".box{margin-top:1px}"

+".dot{width:8px;height:8px;border-radius:50%;flex:none;display:inline-block}"
+".own{margin-top:10px;border:1px solid #e3e7ee;border-radius:8px;padding:9px 10px;background:#fbfcfd}"
+".own h4{margin:0 0 7px;font-size:10.5px;letter-spacing:.5px;text-transform:uppercase;color:#9aa6b4;font-weight:700}"
+".r{display:flex;gap:7px}"
+".r input{flex:1;min-width:0;font:inherit;font-size:12.5px;padding:6px 9px;border:1px solid #d8dfe8;border-radius:6px;color:#1f2a44;background:#fff}"
+".r input:focus{outline:none;border-color:#3f6f8f}"
+".b{font:inherit;font-size:12px;padding:6px 11px;border:1px solid #d8dfe8;border-radius:6px;background:#fff;color:#1f2a44;cursor:pointer;white-space:nowrap}"
+".b:hover{border-color:#3f6f8f;color:#3f6f8f}"
+".chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;align-items:center}"
+".chip{display:inline-flex;align-items:center;gap:6px;font:inherit;font-size:11.5px;padding:4px 10px;border-radius:999px;border:1px solid #e3e7ee;background:#fff;color:#5b6472;cursor:pointer}"
+".chip[aria-pressed=true]{border-color:#3f6f8f;color:#1f2a44;box-shadow:inset 0 0 0 1px #3f6f8f}"
+".err{margin:7px 0 0;font-size:12px;color:#c0453b;min-height:15px}"
+".foot{display:flex;align-items:center;gap:14px;flex-wrap:wrap;margin-top:10px}"
+".legend{display:flex;gap:13px;flex-wrap:wrap;align-items:center;font-size:11px;color:#5b6472}"
+".legend span{display:inline-flex;align-items:center;gap:6px}"
+".st{font-size:11.5px;color:#9aa6b4}"
+".go{margin-left:auto;font:inherit;font-size:12.5px;padding:8px 14px;border-radius:7px;border:1px solid #3f6f8f;background:#3f6f8f;color:#fff;cursor:pointer}"
+".go:hover{background:#35607c}.go[disabled]{opacity:.6;cursor:default}"
+"@media(max-width:760px){.strip{flex-direction:column;align-items:stretch;gap:9px}.ttl{width:auto}.reel{grid-template-columns:repeat(2,minmax(0,1fr))!important}.tile{height:86px}.go{margin-left:0;width:100%}}";

function mount(host){
 if(!host||host.getAttribute('data-mounted'))return;host.setAttribute('data-mounted','1');
 var root=host.attachShadow({mode:'open'});
 var week=monday(today()),wkEnd=plus(week,6);
 var labels=[],items=[],shots={},open=false,cur=0,newlab=false,draft='',err='',stat='',busy=false,ready=false,pend=null,picFor=null;
 var $=function(q){return root.querySelector(q)};
 function sbc(){return (window.sb&&window.sb.from)?window.sb:null}
 function colorOf(n){for(var i=0;i<labels.length;i++)if(labels[i].name===n)return labels[i].color;return '#9aa6b4'}
 function picks(){return items.filter(function(i){return i.picked}).sort(function(a,b){return (a.pos||0)-(b.pos||0)}).slice(0,MAX)}

 function tileHTML(it){
  var c=colorOf(it.label),img=it.path?shots[it.path]:null;
  var inner=img?'<img src="'+img+'" alt="'+esc(it.title)+'">'
   :'<div class="note" style="background:'+tint(c)+'"><span>'+(it.path?'Picture on the way':'Not on the site yet')+'</span></div>';
  var body=inner+'<div class="cap">'+esc(it.title)+'</div><i class="pip" style="background:'+c+'"></i>';
  var tip=' title="'+esc(it.title)+'"';
  var href=(it.path&&it.path.indexOf(':')<0)?String(it.path).split('#')[0]:'';
  return href?'<a class="tile"'+tip+' href="'+esc(href)+'">'+body+'</a>':'<div class="tile"'+tip+'>'+body+'</div>'}

 function stripHTML(){
  var ps=picks(),h='<div class="strip"><div class="ttl"><b>What I made<br>this week</b><span>'+esc(pretty(week))+' to '+esc(pretty(wkEnd))+'</span></div>';
  var n=ps.length;
  h+=n?'<div class="reel'+(n>5?' many':'')+'" style="--cols:'+Math.max(n,1)+'">'+ps.map(tileHTML).join('')+'</div>'
   :'<div class="empty"><span>'+(ready?'Nothing picked yet. Open it and choose what to show off.':'Looking up what you made...')+'</span>'+(ready?'<button class="b" type="button" data-a="open">Open</button>':'')+'</div>';
  return h+'</div>'}

 function shadeHTML(){
  var h='<div class="shade"><p class="lead">Made '+esc(pretty(week))+' to '+esc(pretty(wkEnd))+'. Tap the ones worth showing off, up to '+MAX+'.</p>';
  h+='<div class="grid">'+items.map(function(it,i){
   var has=it.path&&shots[it.path];
   var note=has?'<span class="cam">picture ready</span>'
    :(it.path&&it.path.indexOf(':')<0?'<span class="cam">picture to come</span>'
    :'<button class="camb" type="button" data-a="picfor" data-i="'+i+'">add a picture</button>');
   return '<div class="opt" aria-pressed="'+(it.picked?'true':'false')+'"><button class="pickbtn" type="button" data-a="pick" data-i="'+i+'" aria-label="Show this off"><span class="box">'+(it.picked?'&#10003;':'')+'</span><span class="t">'+esc(it.title)+'</span></button>'+note+'<i class="dot" style="background:'+colorOf(it.label)+'"></i></div>'}).join('')+'</div>';
  h+='<div class="own"><h4>Add your own</h4><div class="r"><input id="own" type="text" value="'+esc(draft)+'" placeholder="Rewrote the TreadWell story" aria-label="Your own highlight"><button class="b'+(pend?' on':'')+'" type="button" data-a="pic">'+(pend?'Picture ready':'Add a picture')+'</button><button class="b" type="button" data-a="add">Add mine</button></div>';
  h+='<div class="chips">'+labels.map(function(l,i){return '<button class="chip" type="button" data-a="lab" data-i="'+i+'" aria-pressed="'+(i===cur?'true':'false')+'"><i class="dot" style="background:'+l.color+'"></i>'+esc(l.name)+'</button>'}).join('')
   +'<button class="chip" type="button" data-a="newlab">+ New label</button></div>';
  if(newlab)h+='<div class="r" style="margin-top:8px"><input id="nl" type="text" placeholder="Family Planning" aria-label="New label name"><button class="b" type="button" data-a="savelab">Save label</button></div>';
  h+='</div><input id="pf" type="file" accept="image/*" style="position:absolute;left:-9999px;width:1px;height:1px" aria-label="Choose a picture"><p class="err">'+esc(err)+'</p>';
  h+='<div class="foot"><span class="st">'+esc(stat)+'</span>'
   +'<button class="go" type="button" data-a="build"'+(busy?' disabled':'')+'>'+(busy?'Taking screenshots...':'Take screenshots and build banner')+'</button></div></div>';
  return h}

 function render(){
  root.innerHTML='<style>'+CSS+'</style><div class="wrap">'+stripHTML()+(open?shadeHTML():'')+((picks().length||open)?'<button class="edit'+(open?' up':'')+'" type="button" data-a="open">'+(open?'Close':'Edit')+'</button>':'')+'</div>';
  if(open){var o=$('#own');if(o&&draft)o.setSelectionRange(draft.length,draft.length)}}

 root.addEventListener('input',function(e){if(e.target&&e.target.id==='own')draft=e.target.value});
 root.addEventListener('change',function(e){if(!e.target||e.target.id!=='pf')return;
  var fl=e.target.files&&e.target.files[0];if(!fl)return;shrink(fl,function(img,w,hh){
   if(picFor==null){pend={img:img,w:w,h:hh};err='';render()}else{attach(picFor,img,w,hh);picFor=null}})});
 function newKey(){return 'own:'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)}
 function shrink(file,cb){
  if(file.size>12*1024*1024){err='That picture is too big. Try one under 12 MB.';render();return}
  var fr=new FileReader();
  fr.onload=function(){var im=new Image();
   im.onload=function(){var W=460,full=Math.max(1,Math.round(im.height*W/im.width)),hh=Math.min(full,900);
    var c=document.createElement('canvas');c.width=W;c.height=hh;
    var x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,W,hh);x.drawImage(im,0,0,W,full);
    try{cb(c.toDataURL('image/jpeg',0.72),W,hh)}catch(e2){err='Could not use that picture.';render()}};
   im.onerror=function(){err='That file is not a picture I can read.';render()};
   im.src=fr.result};
  fr.onerror=function(){err='Could not read that file.';render()};
  fr.readAsDataURL(file)}
 function attach(i,img,w,hh){
  var it=items[i];if(!it)return;var sb=sbc();
  var key=(it.path&&it.path.indexOf('own:')===0)?it.path:(it.path||newKey());
  shots[key]=img;var setPath=it.path!==key;if(setPath)it.path=key;
  err='';render();
  if(!sb){err='The picture is on this screen only. It did not save.';render();return}
  var jobs=[sb.from('made_shots').upsert({path:key,img:img,w:w,h:hh,captured_at:new Date().toISOString()},{onConflict:'path'})];
  if(setPath&&it.id)jobs.push(sb.from('made_items').update({path:key}).eq('id',it.id));
  Promise.all(jobs).then(function(){},function(){err='The picture is on this screen but did not save.';render()})}
 root.addEventListener('keydown',function(e){if(e.key!=='Enter')return;
  if(e.target.id==='own'){e.preventDefault();addOwn()}
  else if(e.target.id==='nl'){e.preventDefault();saveLabel(e.target.value)}});
 root.addEventListener('click',function(e){
  var el=e.target.closest?e.target.closest('[data-a]'):null;if(!el)return;
  var a=el.getAttribute('data-a');
  if(a!=='open'||!el.classList.contains('tile'))e.preventDefault();
  if(a==='open'){open=!open;err='';render();if(open)loadShots(items).then(render,function(){})}
  else if(a==='pick'){toggle(+el.getAttribute('data-i'))}
  else if(a==='lab'){cur=+el.getAttribute('data-i');render()}
  else if(a==='newlab'){newlab=true;render();var n=$('#nl');if(n)n.focus()}
  else if(a==='savelab'){saveLabel(($('#nl')||{}).value)}
  else if(a==='pic'){picFor=null;err='';var p=$('#pf');if(p){p.value='';p.click()}}
  else if(a==='picfor'){picFor=+el.getAttribute('data-i');err='';var p2=$('#pf');if(p2){p2.value='';p2.click()}}
  else if(a==='add'){addOwn()}
  else if(a==='build'){build()}});

 function toggle(i){var it=items[i];if(!it)return;err='';
  if(it.picked){it.picked=false}
  else{if(picks().length>=MAX){err='The strip is full. Untap one first.';render();return}
   var mx=0;items.forEach(function(x){if(x.picked&&(x.pos||0)>mx)mx=x.pos||0});it.pos=mx+1;it.picked=true}
  render()}

 function addOwn(){var v=(draft||'').trim();err='';
  if(!v){err='Type what you made first.';render();return}
  if(picks().length>=MAX){err='The strip is full. Untap one first.';render();return}
  var sb=sbc();if(!sb){err='Not connected yet. Try again in a moment.';render();return}
  var mx=0;items.forEach(function(x){if(x.picked&&(x.pos||0)>mx)mx=x.pos||0});
  var key=pend?newKey():null;
  var row={week:week,title:v.slice(0,80),label:(labels[cur]||{}).name||null,path:key,picked:true,pos:mx+1,source:'scott'};
  if(pend){shots[key]=pend.img;sb.from('made_shots').upsert({path:key,img:pend.img,w:pend.w,h:pend.h,captured_at:new Date().toISOString()},{onConflict:'path'}).then(function(){},function(){});pend=null}
  draft='';render();
  sb.from('made_items').insert(row).select('id,title,label,path,picked,pos,source').single().then(function(r){
   if(r&&r.error)throw r.error;items.push(r.data||row);render()},
   function(){items.push(row);err='Kept on this screen. It did not save.';render()})}

 function saveLabel(v){v=(v||'').trim();err='';
  if(!v){err='Give the new label a name first.';render();return}
  if(labels.some(function(l){return l.name.toLowerCase()===v.toLowerCase()})){err='That label already exists. Tap it above.';render();return}
  var sb=sbc();if(!sb){err='Not connected yet. Try again in a moment.';render();return}
  var row={name:v.slice(0,40),color:SPARE[(labels.length-2+SPARE.length)%SPARE.length],pos:labels.length+1};
  labels.push(row);cur=labels.length-1;newlab=false;render();
  sb.from('made_labels').insert(row).then(function(r){if(r&&r.error){err='The label is on this screen but did not save.';render()}},function(){err='The label is on this screen but did not save.';render()})}

 function build(){
  var ps=picks();err='';
  if(!ps.length){err='Pick at least one highlight first.';render();return}
  var sb=sbc();if(!sb){err='Not connected yet. Try again in a moment.';render();return}
  busy=true;stat='Saving your picks...';render();
  var jobs=items.filter(function(i){return i.id}).map(function(i){
   return sb.from('made_items').update({picked:!!i.picked,pos:i.pos||0,updated_at:new Date().toISOString()}).eq('id',i.id)});
  var want=ps.filter(function(i){return i.path&&!shots[i.path]}).map(function(i){return{path:i.path}});
  if(want.length)jobs.push(sb.from('made_shots').upsert(want,{onConflict:'path',ignoreDuplicates:true}));
  jobs.push(sb.from('made_week').upsert({week:week,built:true,built_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'week'}));
  Promise.all(jobs).then(function(){return loadShots(ps)}).then(function(){
   var have=0,miss=0,none=0;
   picks().forEach(function(i){if(!i.path)none++;else if(shots[i.path])have++;else miss++});
   busy=false;open=false;
   stat=miss?(have+' picture'+(have===1?'':'s')+' ready, '+miss+' on the way'):'';
   render();
   if(miss){var w=$('.wrap');if(w){var p=document.createElement('div');p.className='st';p.style.cssText='position:absolute;right:38px;bottom:0;font-size:11px;color:#a9afb8';p.textContent=miss+' picture'+(miss===1?'':'s')+' still to come';w.appendChild(p)}}
  },function(){busy=false;err='Could not save just now. Your picks are still on this screen.';render()})}

 function loadShots(list){
  var sb=sbc(),paths=(list||items).filter(function(i){return i.path}).map(function(i){return i.path});
  if(!sb||!paths.length)return Promise.resolve();
  return sb.from('made_shots').select('path,img').in('path',paths).then(function(r){
   if(r&&r.data)r.data.forEach(function(s){if(s.img)shots[s.path]=s.img})},function(){})}

 function load(){
  var sb=sbc();
  if(!sb){setTimeout(load,700);return}
  Promise.all([
   sb.from('made_labels').select('name,color,pos').order('pos'),
   sb.from('made_items').select('id,title,label,path,picked,pos,source').eq('week',week).order('pos')
  ]).then(function(r){
   labels=(r[0]&&r[0].data)||[];if(!labels.length)labels=[{name:'Project YOU',color:'#e8a0b8',pos:1},{name:'TreadWell',color:'#2e8b9a',pos:2}];
   items=(r[1]&&r[1].data)||[];ready=true;render();
   return loadShots(items.filter(function(i){return i.picked}))}).then(function(){render()},
   function(){ready=true;err='Could not reach your list just now.';render()})}

 render();load()}

function start(){[].forEach.call(document.querySelectorAll('#madeWeekHost,[data-made-this-week]'),mount)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
