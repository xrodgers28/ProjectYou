/* Cue Fav v1.1 (Sep 29, 2026). v1.1 adds doOnly mode (a Do this! button for modules that keep their own stars) and mountItems (one Do this! pill per item).
   v1.0: Adds a small Keep star and a Do this! button to any cue card page,
   so every module can put a card into the shared Cue Card Library (cue-card-library.html).
   A page calls CueFav.mount({module, label, current}) once. `current()` returns the card on screen as
   {key,title,body,type,url,source}, or null when no real card is showing. The button bar redraws itself
   whenever the page redraws. Everything saves to public.favorites, the list the library reads. */
(function(){
  var TIP='mod:';
  function db(){ try{ return (typeof sb!=='undefined'&&sb)?sb:null; }catch(e){ return null; } }
  function h32(str,seed){var h=seed^0xdeadbeef;for(var i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),2654435761);h^=h>>>13;h=Math.imul(h,1597334677);}return (h>>>0).toString(16).padStart(8,'0');}
  function idFor(s){var a=h32(s,1)+h32(s,2)+h32(s,3)+h32(s,4);
    return a.slice(0,8)+'-'+a.slice(8,12)+'-4'+a.slice(13,16)+'-8'+a.slice(17,20)+'-'+a.slice(20,32);}
  var css='#cuefav{position:fixed;left:12px;bottom:12px;z-index:40;display:none;gap:8px;align-items:center;font-family:Arial,Helvetica,sans-serif}'+
   '#cuefav button{font:700 12.5px/1 Arial,Helvetica,sans-serif;height:32px;padding:0 12px;border-radius:16px;border:1px solid #d3d9e2;background:#fff;color:#5b6472;cursor:pointer;box-shadow:0 2px 8px rgba(31,42,68,.14)}'+
   '#cuefav button.on{color:#fff;border-color:transparent}'+
   '#cuefav .kp.on{background:#d9a400}#cuefav .dt.on{background:#c0453b}'+
   '#cuefav a{font-size:11.5px;font-weight:700;color:#3f6f8f;text-decoration:none;background:#fff;border:1px solid #d3d9e2;border-radius:16px;padding:9px 11px;box-shadow:0 2px 8px rgba(31,42,68,.14)}'+
   '#cuefav .tst{position:absolute;left:0;bottom:40px;background:#1f2a44;color:#fff;font-size:12px;padding:7px 11px;border-radius:9px;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none}'+
   '#cuefav .tst.show{opacity:1}';
  var M=null, cur=null, row=null, bar=null, busy=false, lastKey=null, timer=null;
  function say(t){var e=bar&&bar.querySelector('.tst');if(!e)return;e.textContent=t;e.classList.add('show');clearTimeout(e._x);e._x=setTimeout(function(){e.classList.remove('show');},2400);}
  function normT(t){return String(t||'').replace(/\s+/g,' ').trim();}
  async function lookup(title){
    var s=db(); if(!s||!M||!title)return null;
    var r=await s.from('favorites').select('id,do_this').eq('source_module',M.sourceModule||M.module).eq('title',normT(title)).limit(1);
    return (r.data&&r.data[0])||null;
  }
  function payload(c){return {content_type:c.type||'card',title:c.title,body:c.body||null,url:c.url||null,source:c.source||M.label,
    source_module:M.module,ref_table:TIP+M.module,ref_id:idFor(M.module+'|'+c.key)};}
  function paint(){
    if(!bar)return;
    if(!cur){bar.style.display='none';return;}
    bar.style.display='flex';
    var kp=bar.querySelector('.kp'),dt=bar.querySelector('.dt');
    if(M.doOnly){kp.style.display='none';}
    var kept=!!row, doing=!!(row&&row.do_this);
    kp.className='kp'+(kept?' on':''); kp.textContent=kept?'★ Kept':'☆ Keep';
    dt.className='dt'+(doing?' on':''); dt.textContent='Do this!';
    dt.setAttribute('aria-pressed',doing?'true':'false'); kp.setAttribute('aria-pressed',kept?'true':'false');
  }
  async function refresh(){
    var s=db(); if(!s||!M)return;
    var c=null; try{ c=M.current(); }catch(e){ c=null; }
    var key=c?c.key:null;
    if(key===lastKey&&(!!c===!!cur))return;
    lastKey=key; cur=c; row=null;
    if(c){
      try{
        var ses=await s.auth.getSession(); if(!(ses&&ses.data&&ses.data.session)){cur=null;paint();return;}
        if(M.doOnly){ row=await lookup(c.title); }
        else{
          var r=await s.from('favorites').select('id,do_this').eq('ref_table',TIP+M.module).eq('ref_id',idFor(M.module+'|'+c.key)).limit(1);
          row=(r.data&&r.data[0])||null;
        }
      }catch(e){ row=null; }
    }
    paint();
  }
  async function keep(){
    if(!cur||busy)return; busy=true; var s=db();
    try{
      if(row){
        var d=await s.from('favorites').delete().eq('id',row.id); if(d.error)throw d.error;
        row=null; say('Taken out of favorites.');
      }else{
        var r=await s.from('favorites').upsert(payload(cur),{onConflict:'ref_table,ref_id'}).select('id,do_this').single(); if(r.error)throw r.error;
        row=r.data; say('Saved to favorites ★');
      }
    }catch(e){ say('Could not save: '+(e.message||e)); }
    busy=false; paint();
  }
  async function doit(){
    if(!cur||busy)return; busy=true; var s=db();
    try{
      if(M.doOnly&&!row) row=await lookup(cur.title);
      if(M.doOnly&&!row){ say('Star this one first, then tap Do this!'); busy=false; return; }
      var on=!(row&&row.do_this), at=on?new Date().toISOString():null;
      if(!row){
        var p=payload(cur); p.do_this=on; p.do_this_at=at;
        var r=await s.from('favorites').upsert(p,{onConflict:'ref_table,ref_id'}).select('id,do_this').single(); if(r.error)throw r.error;
        row=r.data;
      }else{
        var u=await s.from('favorites').update({do_this:on,do_this_at:at}).eq('id',row.id); if(u.error)throw u.error;
        row.do_this=on;
      }
      say(on?'Tagged Do this! ✓':'Removed from Do this!');
    }catch(e){ say('Could not save: '+(e.message||e)); }
    busy=false; paint();
  }
  function build(){
    var st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
    bar=document.createElement('div'); bar.id='cuefav';
    bar.innerHTML='<span class="tst" role="status"></span><button class="kp" type="button"></button><button class="dt" type="button"></button><a href="cue-card-library.html?module='+encodeURIComponent(M.module)+'">Library</a>';
    document.body.appendChild(bar);
    bar.querySelector('.kp').onclick=keep; bar.querySelector('.dt').onclick=doit;
  }
  function later(){ clearTimeout(timer); timer=setTimeout(refresh,300); }
  /* One Do this! pill per item, for pages that list several starred-able items on one card.
     o = {module, sourceModule?, scan: function() -> [{anchor: element to place the pill after, title}]} */
  function mountItems(o){
    var map={}, timer2=null, tst=null;
    var st=document.createElement('style');
    st.textContent='.cfdo{font:700 11.5px/1 Arial,Helvetica,sans-serif;height:26px;padding:0 11px;margin:6px 0;border-radius:13px;border:1px solid #d3d9e2;background:#fff;color:#5b6472;cursor:pointer;display:inline-block}.cfdo.on{background:#c0453b;border-color:#c0453b;color:#fff}'+
      '#cfdo-toast{position:fixed;left:12px;bottom:12px;z-index:40;background:#1f2a44;color:#fff;font:12px Arial,Helvetica,sans-serif;padding:8px 12px;border-radius:10px;opacity:0;transition:opacity .2s;pointer-events:none}#cfdo-toast.show{opacity:1}';
    document.head.appendChild(st);
    function say2(t){ if(!tst){tst=document.createElement('div');tst.id='cfdo-toast';tst.setAttribute('role','status');document.body.appendChild(tst);} tst.textContent=t; tst.classList.add('show'); clearTimeout(tst._x); tst._x=setTimeout(function(){tst.classList.remove('show');},2600); }
    async function load(){
      var s=db(); if(!s)return;
      try{ var ses=await s.auth.getSession(); if(!(ses&&ses.data&&ses.data.session))return;
        var r=await s.from('favorites').select('id,title,do_this').eq('source_module',o.sourceModule||o.module).limit(2000);
        map={}; (r.data||[]).forEach(function(x){map[normT(x.title)]=x;}); }catch(e){}
      paint();
    }
    function paint(){
      var list=[]; try{ list=o.scan()||[]; }catch(e){ list=[]; }
      list.forEach(function(x){
        if(!x||!x.anchor||!x.anchor.parentNode)return;
        var b=x.anchor.nextElementSibling;
        if(!b||!b.classList||!b.classList.contains('cfdo')){ b=document.createElement('button'); b.type='button'; x.anchor.insertAdjacentElement('afterend',b); }
        var t=normT(x.title), r=map[t];
        b.setAttribute('data-t',t); b.textContent='Do this!'; b.className='cfdo'+(r&&r.do_this?' on':'');
        b.setAttribute('aria-pressed',(r&&r.do_this)?'true':'false');
      });
    }
    document.addEventListener('click',async function(e){
      var b=e.target.closest&&e.target.closest('.cfdo'); 
      if(!b){ setTimeout(load,1100); return; }
      e.preventDefault(); e.stopPropagation();
      var s=db(); if(!s)return; var t=b.getAttribute('data-t'), r=map[t];
      if(!r){ await load(); r=map[t]; }
      if(!r){ say2('Star this one first, then tap Do this!'); return; }
      var on=!r.do_this, at=on?new Date().toISOString():null;
      var u=await s.from('favorites').update({do_this:on,do_this_at:at}).eq('id',r.id);
      if(u.error){ say2('Could not save: '+u.error.message); return; }
      r.do_this=on; paint(); say2(on?'Tagged Do this! \u2713':'Removed from Do this!');
    },true);
    new MutationObserver(function(){ clearTimeout(timer2); timer2=setTimeout(paint,250); }).observe(document.body,{childList:true,subtree:true});
    var s0=db(); if(s0&&s0.auth&&s0.auth.onAuthStateChange) s0.auth.onAuthStateChange(function(){ setTimeout(load,300); });
    setTimeout(load,600);
  }
  window.CueFav={
    mountItems:mountItems,
    idFor:idFor,
    mount:function(o){
      M=o; if(!M||!M.module||typeof M.current!=='function')return;
      M.label=M.label||M.module;
      build();
      new MutationObserver(later).observe(document.body,{childList:true,subtree:true,characterData:false});
      var s=db(); if(s&&s.auth&&s.auth.onAuthStateChange) s.auth.onAuthStateChange(function(){ lastKey=undefined; later(); });
      if(M.doOnly) document.addEventListener('click',function(){ setTimeout(function(){ lastKey=undefined; later(); },1100); },true);
      later();
    }
  };
})();
