/* task-moves.js v1.0, Nov 23 2026. ONE PLACE THAT DECIDES WHERE A TASK LIVES.

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
function patch(id,body){body.updated_at=new Date().toISOString();
 return fetch(SUPA+'/rest/v1/todos?id=eq.'+encodeURIComponent(id),{method:'PATCH',headers:H({'Content-Type':'application/json',Prefer:'return=representation'}),body:JSON.stringify(body)})
  .then(function(r){return r.ok?r.json():fail(r)})
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
var BLOCKS=['⏳ Waiting On','Waiting On','Need to Schedule','Coming Appointments','✓ Completed Tasks'];
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

window.PYMoves={version:'1.0',signedIn:signedIn,loadPlaces:loadPlaces,places:function(){return PLACES||[]},placeText:placeText,findPlace:findPlace,
 placeForLabel:placeForLabel,labelForPlace:labelForPlace,toToday:toToday,toLibrary:toLibrary,toStaging:toStaging,insertStaged:insertStaged,patch:patch,get:get,lineBy:lineBy};
})();
