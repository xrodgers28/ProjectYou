/* weak-connection.js v1.0, Nov 23 2026. Scott: "screen updates at once, and a weak connection must never lose a change."
   Load this FIRST in <head>, before any Supabase code. Every save to the database (POST, PATCH, PUT,
   DELETE on /rest/v1/) that fails because the connection is weak is tried again on its own, with a
   growing wait, until it goes through. Reads are left alone. A small note shows while changes are waiting.
   Pages that already show their own note (Today, Task Library, Staging Area) keep theirs. */
(function(){
 if(window.PYWeak||!window.fetch)return;
 var orig=window.fetch.bind(window),pending=0,waiting=0;
 var W=window.PYWeak={version:'1.0',pending:function(){return pending},waiting:function(){return waiting}};
 function note(){
  if(window.saveNote||window.PYMoves)return;
  var n=document.getElementById('pyweaknote');
  if(!n){if(!document.body)return;n=document.createElement('div');n.id='pyweaknote';
   n.style.cssText='position:fixed;left:14px;bottom:14px;z-index:9990;background:#1f2a44;color:#fff;font:700 12.5px system-ui,sans-serif;padding:7px 12px;border-radius:999px;box-shadow:0 4px 14px rgba(0,0,0,.25);display:none';
   document.body.appendChild(n)}
  if(!pending){n.style.display='none';return}
  n.style.display='block';
  n.textContent=waiting?'Weak connection. '+pending+' change'+(pending>1?'s':'')+' kept safe on this screen, still trying...':'Saving...'}
 function isWrite(input,init){
  var u=typeof input==='string'?input:(input&&input.url)||'';
  var m=((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
  return m!=='GET'&&m!=='HEAD'&&u.indexOf('/rest/v1/')>-1}
 window.fetch=function(input,init){
  if(!isWrite(input,init))return orig(input,init);
  var m=((init&&init.method)||(input&&input.method)||'GET').toUpperCase();
  var plainInsert=m==='POST'&&!/resolution=/.test(JSON.stringify((init&&init.headers)||{}));
  var max=plainInsert?3:10,n=0;
  /* a Request object can only be sent once, so keep a fresh copy for each try */
  var base=(typeof Request!=='undefined'&&input instanceof Request)?input:null;
  pending++;note();
  return new Promise(function(res,rej){
   function done(f,v){pending--;note();f(v)}
   function again(){n++;waiting++;note();setTimeout(function(){waiting=Math.max(0,waiting-1);go()},Math.min(1500*Math.pow(1.6,n-1),15000))}
   function go(){
    var p;try{p=orig(base?base.clone():input,init)}catch(e){p=Promise.reject(e)}
    p.then(function(r){
     if((r.status>=500||r.status===408||r.status===429)&&n<max)return again();
     done(res,r)},function(e){if(n<max)again();else done(rej,e)})}
   go()})};
 window.addEventListener('beforeunload',function(e){if(pending){e.preventDefault();e.returnValue=''}});
})();
