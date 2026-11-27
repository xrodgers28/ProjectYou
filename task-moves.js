/* task-moves.js v1.5, Nov 26 2026 (v1.5: pickup times are hourly; v1.4: every save retries on a weak connection). ONE PLACE THAT DECIDES WHERE A TASK LIVES.

   Scott, Nov 22 2026: "making sure today todos, staging area and task library all move
   tasks back and forth as they should."

   Every task is one row in todos, and it has exactly ONE home:
     Staging Area    staged = true
     Today's Todos   staged = false, bucket = 'today'
     Task Library    staged = false, bucket = 'library',
                     section = the Library list it sits in (Family, Amazon, 6 Irvine...),
                     subsection = the place inside that list (Carson, P&G...), or empty

   Before this file, bucket was 'today' on every row and nothing told Today apart from the
   Library, so a task filed to the Library would also have shown up on Today. All three
   pages now load this file and make every move through it, so the rule lives in one spot.

   While a task sits in the Library, its Today label (Carson, Amazon...) is kept in
   origin_section, so it comes back to Today wearing the same label it left with. */
(function(){
var SUPA='https://arnjntspmrhigodlssbn.supabase.co';
var ANON='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFybmpudHNwbXJoaWdvZGxzc2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYzMTQ0NTgsImV4cCI6MjEwMTg5MDQ1OH0.UN4JMuoKaAWQfhiCstuoOJQ1sVU2hU5pK0tLBY60dfM';
function tok(){try{var s=JSON.parse(localStorage.getItem('sb-arnjntspmrhigodlssbn-auth-token')||'null');if(s&&s.access_token)return s.access_token}catch(e){}return ANON}
function signedIn(){return tok()!==ANON}
function H(x){var h={apikey:ANON,Authorization:'Bearer '+tok()};if(x)for(var k in x)h[k]=x[k];return h}
function fail(r){return r.text().then(function(t){return Promise.reject(new Error(t||('HTTP '+r.status)))})}
function get(path){return fetch(SUPA+'/rest/v1/'+path,{headers:H()}).then(function(r){return r.ok?r.json():fail(r)})}
/* v1.4, Scott Nov 23: "screen updates at once". Every save goes through run(): it retries on its
   own when the connection is weak, and a small note shows until everything is safe. */
var SAVING=0,WAITING=0;
function note(){
 if(window.saveNote){window.saveNote();return}
 var n=document.getElementById('pymnote');
 if(!n){n=document.createElement('div');n.id='pymnote';n.style.cssText='position:fixed;left:14px;bottom:14px;z-index:9990;background:#1f2a44;color:#fff;font:700 12.5px system-ui,sans-serif;padding:7px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);display:none';document.body&&document.body.appendChild(n)}
 if(!SAVING){n.style.display='none';return}
 n.style.display='block';
 n.textContent=WAITING?'Weak connection. '+SAVING+' change'+(SAVING>1?'s':'')+' kept safe on this screen, still trying...':'Saving...'}
function isNet(e){return !!(e&&(e.net||e instanceof TypeError))}
function run(factory){
 SAVING++;note();
 return new Promise(function(res,rej){
  var n=0;
  function done(f,v){SAVING--;note();f(v)}
  function again(){n++;WAITING++;note();setTimeout(function(){WAITING=Math.max(0,WAITING-1);go()},Math.min(1500*Math.pow(1.6,n-1),15000))}
  function go(){
   var p;try{p=Promise.resolve(factory())}catch(e){p=Promise.reject(e)}
   p.then(function(r){
    if(r&&r.error&&(!r.error.code||/^(5|08|57)/.test(String(r.error.code)))&&n<8)return again();
    done(res,r)},function(e){if(isNet(e)&&n<8)again();else done(rej,e)})}
  go()})}
window.addEventListener('beforeunload',function(e){if(SAVING){e.preventDefault();e.returnValue=''}});
function patch(id,body){body.updated_at=new Date().toISOString();
 return run(function(){return fetch(SUPA+'/rest/v1/todos?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:H({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify(body)})
  .then(function(r){return r.ok?r.json():((r.status>=500||r.status===408||r.status===429)?Promise.reject(Object.assign(new Error('HTTP '+r.status),{net:true})):fail(r))})})
  .then(function(rows){if(!rows||!rows.length)return Promise.reject(new Error('Not saved. Sign in on Todays Tasks and try again.'));return rows[0]})}
/* New rows always go in as staged first and are then moved home with a PATCH. The
   database's sentence guard holds back long multi-sentence inserts on its own, so this
   keeps every new task on the same, predictable path. */
function insertStaged(rows){
 rows=rows.map(function(r){var o={};for(var k in r)o[k]=r[k];o.staged=true;o.bucket='today';o.status=o.status||'todo';o.done=false;return o});
 return fetch(SUPA+'/rest/v1/todos',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify(rows)})
  .then(function(r){return r.ok?r.json():fail(r)})}

/* ---------- the Library's places ---------- */
var PLACES=null;
function loadPlaces(force){
 if(PLACES&&!force)return Promise.resolve(PLACES);
 return get('task_library?select=id,parent_id,level,name,position,archived,status&archived=eq.false&order=position.asc').then(function(rows){
  var by={};rows.forEach(function(r){by[r.id]=r});
  function chain(r){var c=[r],g=0;while(r.parent_id&&by[r.parent_id]&&g++<9){r=by[r.parent_id];c.unshift(r)}return c}
  var out=[];
  function walk(pid,depth){rows.filter(function(r){return (r.parent_id||null)===pid}).sort(function(a,b){return a.position-b.position}).forEach(function(r){
   var c=chain(r);out.push({id:r.id,top:c[0].name,sub:r.parent_id?r.name:'',depth:depth,path:c.map(function(x){return x.name}),name:r.name,parked:c[0].status==='Parked'});
   walk(r.id,depth+1)})}
  walk(null,0);PLACES=out;return out})}
function placeText(p){return p?(p.sub?p.path.slice(1).join(' › '):p.top):''}
function findPlace(top,sub){if(!PLACES)return null;sub=sub||'';
 return PLACES.filter(function(p){return p.top===top&&p.sub===sub})[0]||null}

/* Today label -> the Library place it most likely belongs in. Names that match a place
   exactly win; these few are the ones that are spelled differently on the two sides. */
var L2P={'project you':['Projects','Project YOU'],'treadwell':['Projects','TreadWell'],'asa':['Family','Asa'],'max':['Family','Max'],
 'carson':['Family','Carson'],'carson college':['Family','Carson'],'🎓 carson college':['Family','Carson'],'irvine':['6 Irvine',''],
 'groceries':['6 Irvine','Groceries'],'social':['Social',''],'social well-being':['Social',''],'amazon':['Amazon',''],'flying':['Travel',''],'travel':['Travel','']};
function placeForLabel(label){
 if(!PLACES||!label)return null;var k=String(label).toLowerCase().trim();
 if(L2P[k])return findPlace(L2P[k][0],L2P[k][1]);
 var hit=PLACES.filter(function(p){return p.name.toLowerCase()===k})[0];
 return hit||null}
/* and back: a Library place -> a Today label, for tasks that started life in the Library */
var P2L={'Project YOU':'Project You','TreadWell':'TreadWell','Asa':'Asa','Max':'Max','Carson':'Carson','6 Irvine':'Irvine','Groceries':'Groceries','Amazon':'Amazon','Social':'Social'};
function labelForPlace(section,subsection){
 var p=findPlace(section,subsection),names=p?p.path.slice().reverse():[subsection,section];
 for(var i=0;i<names.length;i++){if(names[i]&&P2L[names[i]])return P2L[names[i]]}
 return 'Core To-Dos'}

/* ---------- Today's line ---------- */
var BLOCKS=['⏳ Waiting On','Waiting On','Need to Schedule','Coming Appointments','✓ Completed Tasks','Today Box 2','Today Box 3','Today Box 5','Today Box 6'];
function getLine(){return get('board_meta?select=val&key=eq.master_line').then(function(d){var n=d&&d[0]?Number(d[0].val):5;return isFinite(n)&&n>=0?n:5})}
function setLine(n){return fetch(SUPA+'/rest/v1/board_meta?on_conflict=key',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify({key:'master_line',val:n})}).then(function(r){if(!r.ok)return fail(r)})}
function lineBy(d){return getLine().then(function(n){return setLine(Math.max(0,n+d))})}
function todayRows(){return get('todos?select=id,position&done=not.is.true&skipped=not.is.true&archived=not.is.true&staged=not.is.true&is_habit=not.is.true&star_color=is.null&bucket=neq.library'
 +'&section=not.in.('+BLOCKS.map(function(s){return encodeURIComponent('"'+s+'"')}).join(',')+')&order=position.asc&limit=2000')}

/* ---------- the three moves ---------- */
/* TO TODAY. Lands at the bottom of today, just above the "Today ends here" line, and the
   line moves down one - the rule Scott set for the Staging Area on Nov 22, now the same
   from the Library too. */
function toToday(id,label,extra){
 return Promise.all([todayRows(),getLine()]).then(function(v){
  var rest=v[0].filter(function(r){return r.id!==id}),cut=Math.max(0,Math.min(v[1],rest.length)),pos;
  var before=rest[cut-1],after=rest[cut];
  if(!rest.length)pos=1;else if(!before)pos=(after.position||1)-1;else if(!after)pos=(before.position||0)+1;
  else pos=((before.position||0)+(after.position||0))/2;
  var body={staged:false,bucket:'today',section:label||'Core To-Dos',subsection:null,origin_section:null,status:'todo',position:pos};
  if(extra)for(var k in extra)body[k]=extra[k];
  return patch(id,body).then(function(row){return setLine(cut+1).then(function(){return row},function(){return row})});
 })}
/* TO THE LIBRARY. place = {top, sub}. Stars come off: the Library has no Urgent box. */
function toLibrary(id,place,label,extra){
 if(!place||!place.top)return Promise.reject(new Error('Pick a place in the Task Library first.'));
 var body={staged:false,bucket:'library',section:place.top,subsection:place.sub||null,origin_section:label||null,
  star_color:null,starred:false,star_position:0,status:'todo'};
 if(extra)for(var k in extra)body[k]=extra[k];
 return patch(id,body)}
/* BACK TO THE STAGING AREA. It takes its Today label with it, and remembers where it was
   headed so the Staging Area's tag shows the same way round. */
function toStaging(id,label,guess,extra){
 var body={staged:true,bucket:'today',section:label||'Core To-Dos',subsection:null,origin_section:null,star_color:null,starred:false,star_position:0,stage_guess:guess||null};
 if(extra)for(var k in extra)body[k]=extra[k];
 return patch(id,body)}

/*CLAUDE*/
/* ---------- Claude's work on a task (v1.2, Nov 23 2026) ----------
   Scott: "every task that Claude's working on show up as a task within the to-do list ...
   just a status on each task". Tag a filed task Claude and the database queues it; an
   hourly pickup (7am to midnight Eastern, up to 3 tasks) works it and writes back here.
   One chip + one panel, used by Today and the Task Library alike. */
var CL={queued:['Queued','q'],working:['Working','w'],needs:['Needs you','n'],review:['Review','r']};
/* v1.5, Nov 26 2026: pickups now run every hour at :08 past, 6:08am to 10:08pm ET (was 3 a day) */
var PICKS=[];for(var ph=6;ph<=22;ph++)PICKS.push([ph,8]);
function nextPickup(){var et=new Date(new Date().toLocaleString('en-US',{timeZone:'America/New_York'})),now=et.getHours()*60+et.getMinutes();
 var p=PICKS.filter(function(x){return x[0]*60+x[1]>now})[0],tom=!p;if(!p)p=PICKS[0];
 var h=p[0],ap=h<12?'am':'pm',h12=h%12||12;return h12+':'+String(p[1]).padStart(2,'0')+ap+(tom?' tomorrow':'')}
function fmtET(ts){try{return new Date(ts).toLocaleString('en-US',{timeZone:'America/New_York',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})+' ET'}catch(e){return ''}}
function css(){if(document.getElementById('pycl-css'))return;var s=document.createElement('style');s.id='pycl-css';s.textContent=
'.pycl{border:1px solid #e3c9a0;background:#fff;color:#a9741a;border-radius:99px;font:700 10.5px Roboto,Arial,sans-serif;padding:1px 8px;line-height:16px;cursor:pointer;white-space:nowrap}'+
'.pycl.q{border-color:#d5dbe3;color:#5b6472;background:#f5f7fa}.pycl.w{border-color:#cfe0ee;color:#2f5a74;background:#eaf1f7}'+
'.pycl.n{border-color:#e8c48a;color:#8a5a12;background:#fdf1dc}.pycl.r{border-color:#bfe0cc;color:#1e8e5a;background:#eef8f2}'+
'.pycl-pop{position:absolute;z-index:200;width:320px;background:#fff;border:1px solid #d5dae0;border-radius:10px;box-shadow:0 10px 28px rgba(31,42,68,.18);padding:12px 13px;font:13px/1.45 Arial,Helvetica,sans-serif;color:#1f2a44}'+
'.pycl-pop h5{margin:0 0 4px;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#5b6472}'+
'.pycl-pop .q{font-weight:700;margin:6px 0}.pycl-pop .row{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0}'+
'.pycl-pop button{border:1px solid #d5dae0;background:#fff;border-radius:7px;font:700 12px Arial,sans-serif;padding:3px 10px;cursor:pointer;color:#3c4761}'+
'.pycl-pop button.pri{background:#3f6f8f;border-color:#3f6f8f;color:#fff}.pycl-pop textarea{width:100%;min-height:48px;border:1px solid #cfd6df;border-radius:7px;padding:5px 7px;font:13px Arial,sans-serif}'+
'.pycl-pop a{color:#3f6f8f;font-weight:700}.pycl-pop .sm{font-size:11.5px;color:#7d8b9a}';
 document.head.appendChild(s)}
function claudeLabel(t){var s=CL[t.claude_status];return s?s:['Claude','']}
function closePop(){var p=document.getElementById('pycl-pop');if(p)p.remove();document.removeEventListener('mousedown',outside,true)}
function outside(e){var p=document.getElementById('pycl-pop');if(p&&!p.contains(e.target)&&!e.target.closest('.pycl'))closePop()}
function claudePanel(t,anchor,changed){
 css();closePop();
 var p=document.createElement('div');p.className='pycl-pop';p.id='pycl-pop';
 var st=t.claude_status,h='';
 function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
 h+='<h5>Claude on this task</h5>';
 if(!st)h+='<div>Tagged Claude but not in the queue yet.</div><div class="row"><button class="pri" data-x="queue">Queue it</button></div>';
 if(st==='queued')h+='<div>Waiting for the next pickup, about <b>'+nextPickup()+'</b>.</div>';
 if(st==='working')h+='<div>Claude is on it now'+(t.claude_updated?' (started '+esc(fmtET(t.claude_updated))+')':'')+'.</div>';
 if(st==='needs'){h+='<div class="q">'+esc(t.claude_question||'Claude needs a word from you.')+'</div>';
  var o=Array.isArray(t.claude_options)?t.claude_options:[];
  if(o.length)h+='<div class="row">'+o.map(function(x,i){return '<button class="pri" data-o="'+i+'">'+esc(x)+'</button>'}).join('')+'</div>';
  h+='<textarea placeholder="Or type your answer"></textarea><div class="row"><button class="pri" data-x="send">Send to Claude</button></div>'}
 if(st==='review'){h+='<div>Done and ready for you to look at. Tick the task off when you are happy.</div>';
  h+='<textarea placeholder="Not quite? Say what to change and send it back"></textarea><div class="row"><button data-x="send">Send back to Claude</button></div>'}
 if(t.claude_note)h+='<div class="sm" style="margin-top:6px">'+esc(t.claude_note)+'</div>';
 var links=[];if(t.claude_result)links.push('<a href="'+esc(t.claude_result)+'" target="_blank" rel="noopener">Open what Claude made</a>');
 if(t.claude_session)links.push('<a href="'+esc(t.claude_session)+'" target="_blank" rel="noopener">Claude run</a>');
 if(links.length)h+='<div class="row">'+links.join(' &middot; ')+'</div>';
 h+='<div class="row" style="margin-top:8px;border-top:1px solid #eef1f5;padding-top:8px"><button data-x="back">Take it back (make it Mine)</button></div>';
 p.innerHTML=h;document.body.appendChild(p);
 var r=anchor.getBoundingClientRect();p.style.top=(window.scrollY+r.bottom+6)+'px';p.style.left=Math.max(8,Math.min(window.scrollX+r.right-320,window.scrollX+document.documentElement.clientWidth-330))+'px';
 setTimeout(function(){document.addEventListener('mousedown',outside,true)},0);
 function go(body,msg){patch(t.id,body).then(function(row){for(var k in body)t[k]=body[k];closePop();if(changed)changed(row,msg)},function(e){alert('That did not save. '+(e&&e.message||''))})}
 p.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var ta=p.querySelector('textarea');
  if(b.dataset.o!=null){var o=t.claude_options[+b.dataset.o];go({claude_answer:o,claude_status:'queued',claude_question:null,claude_options:null,claude_updated:new Date().toISOString()},'Sent to Claude: '+o);return}
  var x=b.dataset.x;
  if(x==='queue')go({claude_status:'queued',claude_updated:new Date().toISOString()},'Queued for Claude.');
  else if(x==='send'){var v=(ta&&ta.value||'').trim();if(!v){ta&&ta.focus();return}go({claude_answer:v,claude_status:'queued',claude_question:null,claude_options:null,claude_updated:new Date().toISOString()},'Sent to Claude.')}
  else if(x==='back')go({owner:null},'Yours again.')});
}
function claudeChip(t,changed){css();var L=claudeLabel(t),b=document.createElement('button');b.type='button';b.className='pycl '+L[1];b.textContent=L[0];
 b.title={q:'Queued for Claude, next pickup about '+nextPickup(),w:'Claude is working on this',n:'Claude needs you: tap to answer',r:'Ready for you to review'}[L[1]]||'Claude owns this one: tap for options';
 b.addEventListener('click',function(e){e.stopPropagation();claudePanel(t,b,changed)});return b}

/* v1.5 (Nov 27 2026): teach(text,field,value) saves one lesson to the shared word list (staging_rules), the same list the Staging Area reads. */
var TSTOP=('a an and or but the to of in on at for with from by as is are was be it its this that these those my me i you your we our they them so then also just very really can could should would will want wanna need needs make get have has do does did not no any all some each into about like what which who how why when where there here one two three four five six seven eight nine ten number').split(' ');
function twords(t){var s={},o=[];String(t||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).forEach(function(w){if(w.length>3&&TSTOP.indexOf(w)<0&&!s[w]){s[w]=1;o.push(w)}});return o}
var SRCNAME='Task Library';
function teach(text,field,value){try{if(!signedIn()||!value||['place_text','tag','label'].indexOf(field)<0)return Promise.resolve();
 text=String(text||'');var pm=text.match(/^\s*([A-Za-z ]{2,24}):/),ws=twords(pm?pm[1]:'');
 twords(text).sort(function(a,b){return b.length-a.length}).slice(0,2).forEach(function(w){if(ws.indexOf(w)<0)ws.push(w)});
 if(!ws.length)return Promise.resolve();
 return get('staging_rules?select=*&word=in.('+ws.map(function(w){return '"'+w+'"'}).join(',')+')').catch(function(){return []}).then(function(ex){var by={};(ex||[]).forEach(function(r){by[r.word]=r});
  var LS=[];var rows=ws.map(function(w){var r=by[w]||{word:w,hits:0,seeded:false};var ov=r[field]||null;r[field]=value;if(ov!==value)LS.push({word:w,field:field,old_value:ov,new_value:value,source:SRCNAME});return {word:w,place_text:r.place_text||null,tag:r.tag||null,label:r.label||null,hits:(r.hits||0)+1,seeded:!!r.seeded,updated_at:new Date().toISOString()}});
  return fetch(SUPA+'/rest/v1/staging_rules?on_conflict=word',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'resolution=merge-duplicates,return=minimal'}),body:JSON.stringify(rows)}).then(function(){if(LS.length)return fetch(SUPA+'/rest/v1/staging_lessons',{method:'POST',headers:H({'Content-Type':'application/json',Prefer:'return=minimal'}),body:JSON.stringify(LS)})}).catch(function(){})})}catch(e){return Promise.resolve()}}
window.PYMoves={version:'1.6',teach:teach,run:run,pending:function(){return SAVING},waiting:function(){return WAITING},claudeChip:claudeChip,claudePanel:claudePanel,nextPickup:nextPickup,signedIn:signedIn,loadPlaces:loadPlaces,places:function(){return PLACES||[]},placeText:placeText,findPlace:findPlace,
 placeForLabel:placeForLabel,labelForPlace:labelForPlace,toToday:toToday,toLibrary:toLibrary,toStaging:toStaging,insertStaged:insertStaged,patch:patch,get:get,lineBy:lineBy};
})();
