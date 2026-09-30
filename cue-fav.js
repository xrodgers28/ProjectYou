/* Cue Fav v1.0 (Sep 29, 2026). Adds a small Keep star and a Do this! button to any cue card page,
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
  function payload(c){return {content_type:c.type||'card',title:c.title,body:c.body||null,url:c.url||null,source:c.source||M.label,
    source_module:M.module,ref_table:TIP+M.module,ref_id:idFor(M.module+'|'+c.key)};}
  function paint(){
    if(!bar)return;
    if(!cur){bar.style.display='none';return;}
    bar.style.display='flex';
    var kp=bar.querySelector('.kp'),dt=bar.querySelector('.dt');
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
        var r=await s.from('favorites').select('id,do_this').eq('ref_table',TIP+M.module).eq('ref_id',idFor(M.module+'|'+c.key)).limit(1);
        row=(r.data&&r.data[0])||null;
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
  window.CueFav={
    idFor:idFor,
    mount:function(o){
      M=o; if(!M||!M.module||typeof M.current!=='function')return;
      M.label=M.label||M.module;
      build();
      new MutationObserver(later).observe(document.body,{childList:true,subtree:true,characterData:false});
      var s=db(); if(s&&s.auth&&s.auth.onAuthStateChange) s.auth.onAuthStateChange(function(){ lastKey=undefined; later(); });
      later();
    }
  };
})();
