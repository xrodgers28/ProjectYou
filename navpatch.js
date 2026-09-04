/* EMBEDDED PAGES CARRY NO NAV (Aug 23 2026, Scott: "clicking a sub page in the
   maps section creates a 2nd main nav row").
   The Maps hub previews each map in an iframe. The embedded page is a whole
   page, so it renders its own .pynav underneath the hub's — two identical main
   navs stacked, plus the maps strip. Any page shown inside any frame gets the
   same treatment: the frame is a preview, the chrome belongs to the host.
   Runs FIRST so the nav is never painted, not hidden after the fact. The nav
   injector below still builds the markup; this only stops it being displayed,
   so nothing downstream that queries .pynav breaks. */
(function(){try{
  if(window.self===window.top)return;
  var st=document.createElement('style'); st.id='pn-embed-css';
  st.textContent='.pynav,.msub,.lsub,.pn-back,.pn-backwrap{display:none!important}';
  (document.head||document.documentElement).appendChild(st);
}catch(e){}})();

/* NAV INJECTOR (Aug 21 2026, Scott: "midnight run page has no navigation").
   Some pages were built standalone and never got the shared .pynav markup —
   midnight-run, qs-health, tracker and every session tracker. Every page loads
   nav-config.js + navpatch.js, so the cheapest correct fix is to BUILD the nav
   here when it is missing, then let the existing patch below fill in the links.
   Runs first, on purpose: everything after it starts with `if(!nav)return`. */
/* The canonical nav stylesheet, hoisted out of the injector Aug 23 2026.
   It used to be added ONLY when navpatch built a nav from scratch. Pages that
   ship their own .pynav markup but no nav CSS therefore got links with no
   styling at all: library, nightly-scorecard and recall-game rendered the full
   21 links as raw underlined blue text. Defining it here lets the repair block
   at the foot of this file call it for any page whose nav is unstyled. */
window.__pnNavCss=function(){
  if(document.getElementById('pn-inject-css'))return;
  var st=document.createElement('style'); st.id='pn-inject-css';
  st.textContent='.pynav{position:sticky;top:0;z-index:30;background:#fff;border-bottom:1px solid #e3e7ee;display:flex;align-items:center;flex-wrap:nowrap;overflow-x:auto;padding:6px 12px;gap:1px}.pynav::-webkit-scrollbar{height:0}.pn-logo{display:flex;align-items:center;margin-right:5px;flex:none}.pn-logo img{height:28px;width:auto;display:block}.pn-group{display:inline-flex;flex-direction:column;align-items:flex-start;gap:2px;padding:2px 7px;margin:2px 0;border-left:1px solid #edf0f4;flex:none}.pn-group.first{border-left:none}.pn-label{font-size:8px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#aab2bd;white-space:nowrap;padding-left:3px}a.pn-label{text-decoration:none;cursor:pointer}a.pn-label:hover{color:var(--accent)}a.pn-label.on{color:var(--accent)}.pn-links{display:flex;gap:1px;align-items:stretch}.pn-link{font-size:11.5px;font-weight:700;color:#5b6472;text-decoration:none;padding:3px 6px;border-radius:7px;white-space:normal;text-align:center;line-height:1.08;display:inline-flex;align-items:center;flex:none}.pn-link:hover{background:#eef2f8;color:#3f6f8f}.pn-link.on{background:#3f6f8f;color:#fff}.pn-link.pn-solo{min-height:31px}.pn-ver{margin-left:auto;font-size:10.5px;font-weight:700;color:#9aa6b4;font-variant-numeric:tabular-nums;padding:0 6px;flex:none}.pn-user{display:flex;align-items:center;gap:8px;background:#f4f6f9;border:1px solid #e3e7ee;border-radius:999px;padding:3px 11px 3px 3px;margin-left:6px;flex:none}.pn-ava{width:30px;height:30px;border-radius:50%;overflow:hidden;border:2px solid #4cc07a;flex:none;background:#dfe7f0}.pn-ava img{width:100%;height:100%;object-fit:cover;display:block}.pn-uinfo{display:flex;flex-direction:column;line-height:1.05}.pn-uname{font-size:12px;font-weight:800;color:#1f2a44}.pn-usub{font-size:8px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#2f8f5b}.pn-dot{width:9px;height:9px;border-radius:50%;background:#2fbf71;box-shadow:0 0 0 2px #d7f0e0}.pn-drop{position:relative;display:inline-flex;align-items:stretch}.pn-dropbtn{cursor:pointer;user-select:none}.pn-menu{position:fixed;background:#fff;border:1px solid #e3e7ee;border-radius:9px;box-shadow:0 10px 28px rgba(31,42,68,.16);padding:5px;display:none;flex-direction:column;min-width:200px;z-index:60}.pn-menu.open{display:flex}.pn-menu .pn-link{white-space:nowrap;text-align:left;justify-content:flex-start;padding:6px 9px}';
  document.head.appendChild(st);
};

(function(){try{
  if(document.querySelector('.pynav'))return;
  var cfg=window.NAV_CONFIG; if(!cfg)return;
  window.__pnNavCss();
  var nav=document.createElement('div'); nav.className='pynav';
  var h='<a href="mission.html" class="pn-logo"><img src="project-you-logo.png" alt="Project YOU"></a>';
  var first=true;
  Object.keys(cfg).forEach(function(gl){
    h+='<span class="pn-group'+(first?' first':'')+'"><span class="pn-label">'+gl+'</span><span class="pn-links"></span></span>';
    first=false;
  });
  h+='<span class="pn-ver"></span>';
  h+='<div class="pn-user"><div class="pn-ava"><img src="scott-avatar.jpg" alt="Scott"></div>'+
     '<div class="pn-uinfo"><div class="pn-uname">Scott</div><div class="pn-usub">Signed in</div></div><span class="pn-dot"></span></div>';
  nav.innerHTML=h;
  document.body.insertBefore(nav,document.body.firstChild);
}catch(e){if(window.console)console.log('nav inject error',e);}})();

/* GROUP PARITY. Pages with hand-written nav markup predate later NAV_CONFIG
   groups, so e.g. "Editors" is simply absent on some of them and no amount of
   editing nav-config.js can make it appear. Reconcile the groups present in the
   bar against the config, in config order, so every page shows the same nav. */
(function(){try{
  var cfg=window.NAV_CONFIG; if(!cfg)return;
  var nav=document.querySelector('.pynav'); if(!nav)return;
  var keys=Object.keys(cfg); if(!keys.length)return;
  var have={};
  nav.querySelectorAll('.pn-group').forEach(function(g){
    var l=g.querySelector('.pn-label');
    if(l)have[(l.textContent||'').trim()]=g;
  });
  /* library.html's hand-written nav has no version slot and no user chip at all,
     so there is nowhere for the version to land. Give it one. */
  if(!nav.querySelector('.pn-ver')){
    var vs=document.createElement('span'); vs.className='pn-ver'; nav.appendChild(vs);
  }
  var anchor=nav.querySelector('.pn-ver')||nav.querySelector('.pn-user');
  keys.forEach(function(gl,i){
    var g=have[gl];
    if(!g){
      g=document.createElement('span');
      g.className='pn-group';
      g.innerHTML='<span class="pn-label">'+gl+'</span><span class="pn-links"></span>';
    }
    g.classList.toggle('first',i===0);
    if(anchor)nav.insertBefore(g,anchor); else nav.appendChild(g);
  });
}catch(e){if(window.console)console.log('nav group parity error',e);}})();

(function(){try{var cfg=window.NAV_CONFIG;if(!cfg)return;var nav=document.querySelector('.pynav');if(!nav)return;var cur=(location.pathname.split('/').pop()||'index.html');if(!cur)cur='index.html';function linkHTML(it){return '<a href="'+it.href+'" class="pn-link">'+it.label+'</a>';}function dropHTML(it){var kids=(it.children||[]).map(function(c){return '<a href="'+c.href+'" class="pn-link">'+c.label+'</a>';}).join('');return '<span class="pn-drop"><span class="pn-link pn-dropbtn" tabindex="0">'+it.label+' &#9662;</span><span class="pn-menu">'+kids+'</span></span>';}var groups=nav.querySelectorAll('.pn-group');var gLinks=window.NAV_GROUP_LINKS||{};Object.keys(cfg).forEach(function(gl){var links=null,labelEl=null;groups.forEach(function(g){var l=g.querySelector('.pn-label');if(l&&(l.textContent||'').trim()===gl){links=g.querySelector('.pn-links');labelEl=l;}});if(!links)return;links.innerHTML=cfg[gl].map(function(it){return it.children?dropHTML(it):linkHTML(it);}).join('');if(gLinks[gl]&&labelEl&&labelEl.tagName!=='A'){var la=document.createElement('a');la.className='pn-label';la.setAttribute('href',gLinks[gl]);la.innerHTML=labelEl.innerHTML;labelEl.parentNode.replaceChild(la,labelEl);}});if(!document.getElementById('pn-maps-css')){var st=document.createElement('style');st.id='pn-maps-css';st.textContent='.pynav{z-index:9000}.pn-drop{position:relative;display:inline-flex;align-items:stretch}.pn-dropbtn{cursor:pointer;user-select:none}.pn-menu{position:fixed;background:#fff;border:1px solid #e3e7ee;border-radius:9px;box-shadow:0 10px 28px rgba(31,42,68,.16);padding:5px;display:none;flex-direction:column;min-width:200px;z-index:2147483000}.pn-menu.open{display:flex}.pn-menu .pn-link{white-space:nowrap;text-align:left;justify-content:flex-start;padding:6px 9px}a.pn-label{text-decoration:none;cursor:pointer}a.pn-label:hover{color:#3f6f8f}a.pn-label.on{color:#3f6f8f}.pn-links>a.pn-link:only-child{min-height:31px}';document.head.appendChild(st);}if(!document.getElementById('ph-header-css')){var hs=document.createElement('style');hs.id='ph-header-css';hs.textContent='.secbar-wrap{max-width:1080px;margin:0 auto;padding:22px 34px 0}.secbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}h1.ph-h1{font-size:26px!important;font-weight:800!important;color:#2f5a74!important;letter-spacing:.2px;line-height:1.1;margin:0;display:flex;align-items:center;gap:12px;flex-wrap:wrap}h1.ph-h1 .ver,.secbar .ver{font-size:11px!important;font-weight:800!important;color:#9aa6b4!important;background:none!important;border:1px solid #e3e7ee!important;border-radius:999px!important;padding:2px 8px!important;letter-spacing:0!important;vertical-align:middle}h1.ph-h1 .date,.secbar .date{font-size:11.5px!important;color:#9aa6b4!important;font-weight:400!important}.lead{max-width:1080px;margin:0 auto;padding:4px 34px 0;color:#5b6472;font-size:15px}.lead p{max-width:660px;margin:2px 0 0}';document.head.appendChild(hs);}try{var _mk=function(h){if(h&&!h.classList.contains('ph-h1')&&!h.closest('.pagehead'))h.classList.add('ph-h1');};document.querySelectorAll('.secbar h1').forEach(_mk);document.querySelectorAll('h1').forEach(function(h){if(h.closest('.pynav'))return;if(h.querySelector('.ver,.date'))_mk(h);});var _all=document.querySelectorAll('h1');for(var _i=0;_i<_all.length;_i++){if(!_all[_i].closest('.pynav')){_mk(_all[_i]);break;}}var _hd=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});document.querySelectorAll('.secbar .date,h1.ph-h1 .date').forEach(function(x){if(!(x.textContent||'').trim())x.textContent=_hd;});}catch(_e){}nav.querySelectorAll('a.pn-link').forEach(function(a){if(a.getAttribute('href')===cur)a.classList.add('on');});nav.querySelectorAll('a.pn-label').forEach(function(a){if(a.getAttribute('href')===cur)a.classList.add('on');});nav.querySelectorAll('.pn-drop').forEach(function(d){var on=false;d.querySelectorAll('.pn-menu a.pn-link').forEach(function(a){if(a.getAttribute('href')===cur)on=true;});if(on){var b=d.querySelector('.pn-dropbtn');if(b)b.classList.add('on');}});if(!window.__pnMapsJs&&!document.getElementById('pn-maps-js')){window.__pnMapsJs=1;document.addEventListener('click',function(e){var b=e.target.closest('.pn-dropbtn');var m=b?b.parentNode.querySelector('.pn-menu'):null;document.querySelectorAll('.pn-menu.open').forEach(function(x){if(x!==m)x.classList.remove('open');});if(b){var r=b.getBoundingClientRect();m.style.left=Math.max(6,Math.min(r.left,window.innerWidth-210))+'px';m.style.top=(r.bottom+2)+'px';m.classList.toggle('open');e.stopPropagation();e.preventDefault();}});}try{var QSBACK={'qs-log.html':1,'qs-wheel.html':1,'life-snapshot.html':1,'coffee-days.html':1,'decade.html':1,
    /* Aug 23 2026: Where I've Been was taken out of the Quantified Self nav in the
       same change that put the Time Bandit Wheel there. Every other QS view pulled
       from the nav is on this list; it was the one that got missed, which left it
       the only QS page with no way back to the hub it belongs to. */
    'where-ive-been.html':1};var mkBack=function(){var a=document.createElement('a');a.className='pn-back';a.href='qs-dashboard.html';a.setAttribute('aria-label','Back to YouMatics');a.innerHTML='\u2190 back to YouMatics';return a;};if(!document.getElementById('pn-back-css')){var bs=document.createElement('style');bs.id='pn-back-css';bs.textContent='.pn-back{display:inline-block;font-size:11.5px;font-weight:700;color:#9aa6b4;text-decoration:none;letter-spacing:.1px}.pn-back:hover{color:#3f6f8f}.pn-backwrap{margin:3px 0 8px}';document.head.appendChild(bs);}if(!document.querySelector('.pn-back')){if(QSBACK[cur]){var bh=null,bl=document.querySelectorAll('h1');for(var bi=0;bi<bl.length;bi++){var bc=bl[bi];if(bc.closest('.pynav')||bc.closest('#login')||bc.closest('#loginbox'))continue;if(bc.closest('.secbar')){bh=bc;break;}if(!bh)bh=bc;}if(bh){var an=bh.closest('.secbar')||bh;var bw=document.createElement('div');bw.className='pn-backwrap';bw.appendChild(mkBack());an.parentNode.insertBefore(bw,an.nextSibling);}}else if(cur==='index.html'){var wv=document.getElementById('wheelview');if(wv){var bw2=document.createElement('div');bw2.className='pn-backwrap';bw2.appendChild(mkBack());wv.insertBefore(bw2,wv.firstChild);}}}}catch(_b){}}catch(err){if(window.console)console.log('navpatch error',err);}})();

/* ONE NAV PER SUBSECTION — Maps & Diagrams (Aug 19 2026, Scott).
   The top nav has NO dropdown for this subsection. It is a plain link to the
   Overview hub (maps.html), and the five sub pages carry the horizontal strip
   built below from window.MAPS_NAV in nav-config.js. One list drives both, so
   the strip can never drift from the nav the way the old hand-written
   .mapsub / .mapnav rows did.

   Also removes any legacy in-page maps nav still baked into a page's HTML:
   the .mapsub bar on blueprint / dfd / data-flow-map and the .mapnav pill row
   on architecture-map. That dead markup is still in those files, so this
   removal has to keep running.

   The hub itself gets NO strip: its cards already are the menu, and a strip
   listing the same five things above them is the double-nav problem again. */
(function(){try{
  document.querySelectorAll('.mapsub, .mapnav').forEach(function(el){
    if(!el.closest('.pynav')) el.remove();
  });

  var CFG=window.MAPS_NAV;
  if(!CFG||!CFG.items||!CFG.items.length) return;
  var cur=(location.pathname.split('/').pop()||'index.html');
  var inSection=CFG.items.some(function(i){return i.href===cur;});
  if(!inSection) return;

  /* Keep the top-nav item lit on every page in the subsection, not just the hub. */
  document.querySelectorAll('.pynav a.pn-link').forEach(function(a){
    if(a.getAttribute('href')===CFG.hub) a.classList.add('on');
  });

  /* The hub used to be the one page in the section WITHOUT the strip, on the
     reasoning that its cards already are the menu. In practice the strip
     appearing on six pages and vanishing on the seventh read as a fault, and
     Scott reported it as missing on Aug 23 2026. It now renders everywhere,
     with Overview lit on the hub itself. */
  if(document.querySelector('.msub')) return;

  if(!document.getElementById('msub-css')){
    var st=document.createElement('style'); st.id='msub-css';
    st.textContent='.msub{display:flex;flex-wrap:wrap;align-items:center;gap:6px;max-width:1180px;margin:12px auto 2px;padding:8px 12px;background:#fff;border:1px solid #e3e7ee;border-radius:12px;box-shadow:0 4px 14px rgba(31,42,68,.05);font-family:Arial,Helvetica,sans-serif}'
      +'.msub-lbl{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#3f6f8f;margin-right:2px;display:inline-flex;align-items:center;gap:5px}'
      +'a.msub-lbl{text-decoration:none;cursor:pointer;border-radius:8px;padding:4px 6px;margin-left:-4px}a.msub-lbl:hover{background:#eef2f8;color:#2f5a74}'
      +'.msub a{font-size:12.5px;font-weight:700;color:#5b6472;text-decoration:none;padding:5px 10px;border-radius:8px;white-space:nowrap}'
      +'.msub a:hover{background:#eef2f8;color:#3f6f8f}'
      +'.msub a.on{background:#3f6f8f;color:#fff}'
      +'.msub .msub-ver{margin-left:auto;font-size:10.5px;font-weight:800;color:#9aa6b4;font-variant-numeric:tabular-nums;padding-left:6px}'
      +'@media(max-width:820px){.msub{margin:10px 12px 2px;padding:7px 9px;gap:4px}.msub a{font-size:12px;padding:5px 8px}}';
    document.head.appendChild(st);
  }

  var bar=document.createElement('nav');
  bar.className='msub';
  bar.setAttribute('aria-label','Maps and Diagrams');
  /* The label is the way back to the hub (Aug 23 2026, Scott: "all the maps and
     diagrams sub pages are missing a way to get back to the maps index page").
     It already reads as the section anchor at the left of the row, so making it
     a link adds an affordance without adding a third row of chrome. */
  var lbl=document.createElement(CFG.hub?'a':'span');
  lbl.className='msub-lbl'; lbl.textContent=CFG.label||'Maps';
  if(CFG.hub){lbl.setAttribute('href',CFG.hub);lbl.setAttribute('title','Back to '+(CFG.label||'Maps'));}
  bar.appendChild(lbl);
  CFG.items.forEach(function(it){
    var a=document.createElement('a');
    a.setAttribute('href',it.href); a.textContent=it.label;
    if(it.href===cur){a.className='on';a.setAttribute('aria-current','page');}
    bar.appendChild(a);
  });
  if(CFG.ver){
    var v=document.createElement('span');
    v.className='msub-ver'; v.textContent=CFG.ver; bar.appendChild(v);
  }

  var nav=document.querySelector('.pynav');
  if(nav&&nav.parentNode) nav.parentNode.insertBefore(bar,nav.nextSibling);
  else document.body.insertBefore(bar,document.body.firstChild);
}catch(e){}})();

/* ONE NAV PER SUBSECTION — LISTS (Aug 24 2026, Scott).
   Same contract as the Maps strip above, different shape. The top nav used to
   carry six separate list links; it now carries one, and the four list pages
   share the segmented tab bar built below from window.LISTS_NAV.

   Two things Scott set explicitly and neither should be "improved":
     1. ORDER IS FIXED. The active tab lights up where it stands. It never
        moves to the front, and the list never re-sorts by count or by recency.
     2. LANDING ON LISTS LANDS ON CONNECTIONS. The top-nav item points at
        items[0], and that item stays lit on all four pages.

   Counts come from ONE fetch of the v_list_counts view, and only on these four
   pages - navpatch runs on all 72 and must not add a network call to the other
   68. If the fetch fails the tabs simply carry no number; nothing else changes.
   The strip renders first and the counts arrive after, so a slow or dead
   endpoint can never delay the nav. */
(function(){try{
  var CFG=window.LISTS_NAV;
  if(!CFG||!CFG.items||!CFG.items.length) return;
  var cur=(location.pathname.split('/').pop()||'index.html');
  var here=-1;
  CFG.items.forEach(function(it,i){ if(it.href===cur) here=i; });
  if(here<0) return;                       /* not a list page - do nothing */
  if(document.querySelector('.lsub')) return;

  /* Keep the single top-nav item lit on every page in the subsection. */
  document.querySelectorAll('.pynav a.pn-link').forEach(function(a){
    if(a.getAttribute('href')===CFG.items[0].href) a.classList.add('on');
  });

  if(!document.getElementById('lsub-css')){
    var st=document.createElement('style'); st.id='lsub-css';
    st.textContent='.lsub{display:flex;align-items:flex-end;gap:2px;max-width:1180px;margin:14px auto 0;padding:0 4px;border-bottom:2px solid #e3e7ee;font-family:Arial,Helvetica,sans-serif;overflow-x:auto}'
      +'.lsub::-webkit-scrollbar{height:0}'
      +'.lsub-lbl{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#aab2bd;padding:0 12px 11px 2px;white-space:nowrap;flex:none}'
      +'.lsub a{position:relative;font-size:14px;font-weight:800;color:#8d96a3;text-decoration:none;padding:9px 15px 10px;border-radius:9px 9px 0 0;white-space:nowrap;flex:none}'
      +'.lsub a:hover{color:#3f6f8f;background:#f4f7fb}'
      +'.lsub a .lsub-n{font-size:10.5px;font-weight:800;color:#b3bcc7;margin-left:6px;font-variant-numeric:tabular-nums}'
      +'.lsub a.on{color:#2f5a74;background:#fff;box-shadow:0 -2px 10px rgba(31,42,68,.05)}'
      +'.lsub a.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-2px;height:3px;border-radius:2px;background:#3f6f8f}'
      +'.lsub a.on .lsub-n{color:#3f6f8f}'
      +'.lsub-ver{margin-left:auto;font-size:10.5px;font-weight:800;color:#9aa6b4;padding:0 4px 11px;white-space:nowrap;flex:none;font-variant-numeric:tabular-nums}'
      +'@media(max-width:820px){.lsub{margin:10px 12px 0;padding:0}.lsub a{font-size:13px;padding:8px 11px 9px}.lsub-lbl{display:none}}';
    document.head.appendChild(st);
  }

  var bar=document.createElement('nav');
  bar.className='lsub';
  bar.setAttribute('aria-label','Lists');

  var lbl=document.createElement('span');
  lbl.className='lsub-lbl'; lbl.textContent=CFG.label||'Lists';
  bar.appendChild(lbl);

  CFG.items.forEach(function(it,i){
    var a=document.createElement('a');
    a.setAttribute('href',it.href);
    a.appendChild(document.createTextNode(it.label));
    if(it.count){
      a.setAttribute('data-count',it.count);
      var n=document.createElement('span');
      n.className='lsub-n'; n.textContent='';
      a.appendChild(n);
    }
    if(i===here){ a.className='on'; a.setAttribute('aria-current','page'); }
    bar.appendChild(a);
  });

  if(CFG.ver){
    var v=document.createElement('span');
    v.className='lsub-ver'; v.textContent=CFG.ver; bar.appendChild(v);
  }

  var nav=document.querySelector('.pynav');
  if(nav&&nav.parentNode) nav.parentNode.insertBefore(bar,nav.nextSibling);
  else document.body.insertBefore(bar,document.body.firstChild);

  /* Match the page's own content column. The four list pages are not all the
     same width (Connections and Asa Activities are 820px, others wider), and a
     tab bar that does not line up with the h1 beneath it reads as a mistake.
     Copy the width and side padding off whatever wrapper the page actually
     uses; if it has none, the 1180px default in the stylesheet stands. */
  try{
    var probe=document.querySelector('.secbar-wrap')||document.querySelector('.wrap');
    if(probe){
      var cs=getComputedStyle(probe);
      if(cs.maxWidth&&cs.maxWidth!=='none'){
        bar.style.maxWidth=cs.maxWidth;
        bar.style.paddingLeft=cs.paddingLeft;
        bar.style.paddingRight=cs.paddingRight;
      }
    }
  }catch(_w){}

  /* Counts, best effort. Never blocks the bar, never throws. */
  var R=window.PY_REST;
  if(R&&R.url&&R.anon&&CFG.counts&&window.fetch){
    fetch(R.url+'/rest/v1/'+CFG.counts+'?select=list,n',
          {headers:{apikey:R.anon,Authorization:'Bearer '+R.anon}})
      .then(function(r){ return r.ok?r.json():null; })
      .then(function(rows){
        if(!rows||!rows.length) return;
        var m={}; rows.forEach(function(x){ m[x.list]=x.n; });
        bar.querySelectorAll('a[data-count]').forEach(function(a){
          var v=m[a.getAttribute('data-count')];
          if(v===undefined||v===null) return;
          var s=a.querySelector('.lsub-n');
          if(s) s.textContent=v;
        });
      })
      .catch(function(){});
  }
}catch(e){ if(window.console) console.log('navpatch lists strip',e); }})();

/* ONE NAV PER SUBSECTION - CALENDAR (Aug 29 2026, Scott).
   Third use of the strip pattern, same contract as MAPS and LISTS above: the
   top nav carries one Calendar slot, and the two ways of looking at the same
   calendar_events table - the running list on calendar.html and the week grid
   on calendar-week.html - share the tab strip built below from CAL_NAV.

   It reuses the .lsub stylesheet the LISTS strip injects, on purpose. Two tab
   strips that look different would be two patterns, and the whole point of
   this being the third copy rather than a third invention is that they cannot
   drift apart. The id guard means whichever strip renders first injects the
   CSS and the other finds it already there.

   No counts. There is no number worth putting on a calendar tab, and the
   counts fetch is the one part of the LISTS strip that touches the network. */
(function(){try{
  var CFG=window.CAL_NAV;
  if(!CFG||!CFG.items||!CFG.items.length) return;
  var cur=(location.pathname.split('/').pop()||'index.html');
  var here=-1;
  CFG.items.forEach(function(it,i){ if(it.href===cur) here=i; });
  if(here<0) return;                       /* not a calendar page - do nothing */
  if(document.querySelector('.lsub')) return;

  /* Keep the single top-nav item lit on both pages in the subsection. */
  document.querySelectorAll('.pynav a.pn-link').forEach(function(a){
    if(a.getAttribute('href')===CFG.items[0].href) a.classList.add('on');
  });

  if(!document.getElementById('lsub-css')){
    var st=document.createElement('style'); st.id='lsub-css';
    st.textContent='.lsub{display:flex;align-items:flex-end;gap:2px;max-width:1180px;margin:14px auto 0;padding:0 4px;border-bottom:2px solid #e3e7ee;font-family:Arial,Helvetica,sans-serif;overflow-x:auto}'
      +'.lsub::-webkit-scrollbar{height:0}'
      +'.lsub-lbl{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#aab2bd;padding:0 12px 11px 2px;white-space:nowrap;flex:none}'
      +'.lsub a{position:relative;font-size:14px;font-weight:800;color:#8d96a3;text-decoration:none;padding:9px 15px 10px;border-radius:9px 9px 0 0;white-space:nowrap;flex:none}'
      +'.lsub a:hover{color:#3f6f8f;background:#f4f7fb}'
      +'.lsub a.on{color:#2f5a74;background:#fff;box-shadow:0 -2px 10px rgba(31,42,68,.05)}'
      +'.lsub a.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-2px;height:3px;border-radius:2px;background:#3f6f8f}'
      +'.lsub-ver{margin-left:auto;font-size:10.5px;font-weight:800;color:#9aa6b4;padding:0 4px 11px;white-space:nowrap;flex:none;font-variant-numeric:tabular-nums}'
      +'@media(max-width:820px){.lsub{margin:10px 12px 0;padding:0}.lsub a{font-size:13px;padding:8px 11px 9px}.lsub-lbl{display:none}}';
    document.head.appendChild(st);
  }

  var bar=document.createElement('nav');
  bar.className='lsub';
  bar.setAttribute('aria-label','Calendar');

  var lbl=document.createElement('span');
  lbl.className='lsub-lbl'; lbl.textContent=CFG.label||'Calendar';
  bar.appendChild(lbl);

  CFG.items.forEach(function(it,i){
    var a=document.createElement('a');
    a.setAttribute('href',it.href);
    a.appendChild(document.createTextNode(it.label));
    if(i===here){ a.className='on'; a.setAttribute('aria-current','page'); }
    bar.appendChild(a);
  });

  if(CFG.ver){
    var v=document.createElement('span');
    v.className='lsub-ver'; v.textContent=CFG.ver; bar.appendChild(v);
  }

  var nav=document.querySelector('.pynav');
  if(nav&&nav.parentNode) nav.parentNode.insertBefore(bar,nav.nextSibling);
  else document.body.insertBefore(bar,document.body.firstChild);

  /* Match the page's own content column, same reason as the LISTS strip: a tab
     bar that does not line up with the heading beneath it reads as a mistake.
     The calendar pages use .pagehead rather than .wrap. */
  try{
    var probe=document.querySelector('.pagehead')||document.querySelector('.secbar-wrap')||document.querySelector('.wrap');
    if(probe){
      var cs=getComputedStyle(probe);
      if(cs.maxWidth&&cs.maxWidth!=='none'){
        bar.style.maxWidth=cs.maxWidth;
        bar.style.paddingLeft=cs.paddingLeft;
        bar.style.paddingRight=cs.paddingRight;
      }
    }
  }catch(_w){}
}catch(e){ if(window.console) console.log('navpatch calendar strip',e); }})();

/* ONE NAV PER SUBSECTION - TRAVEL (Sep 1 2026, Scott).
   Fourth use of the strip pattern, same contract as MAPS, LISTS and CALENDAR
   above: the top nav carries one Travel slot, and the three travel pages - the
   Travel Log, Where I've Been and Future Travel - share the tab strip built
   below from TRAVEL_NAV.

   It reuses the .lsub stylesheet, on purpose, for the same reason the calendar
   strip does: four tab strips that looked different would be four patterns.
   The id guard means whichever strip renders first injects the CSS.

   No counts. anon is revoked on the travel_ tables, so a number fetched with
   the public key would always read zero. */
(function(){try{
  var CFG=window.TRAVEL_NAV;
  if(!CFG||!CFG.items||!CFG.items.length) return;
  var cur=(location.pathname.split('/').pop()||'index.html');
  var here=-1;
  CFG.items.forEach(function(it,i){ if(it.href===cur) here=i; });
  if(here<0) return;                       /* not a travel page - do nothing */
  if(document.querySelector('.lsub')) return;

  /* Keep the single top-nav item lit on all three pages in the subsection. */
  document.querySelectorAll('.pynav a.pn-link').forEach(function(a){
    if(a.getAttribute('href')===CFG.items[0].href) a.classList.add('on');
  });

  if(!document.getElementById('lsub-css')){
    var st=document.createElement('style'); st.id='lsub-css';
    st.textContent='.lsub{display:flex;align-items:flex-end;gap:2px;max-width:1180px;margin:14px auto 0;padding:0 4px;border-bottom:2px solid #e3e7ee;font-family:Arial,Helvetica,sans-serif;overflow-x:auto}'
      +'.lsub::-webkit-scrollbar{height:0}'
      +'.lsub-lbl{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#aab2bd;padding:0 12px 11px 2px;white-space:nowrap;flex:none}'
      +'.lsub a{position:relative;font-size:14px;font-weight:800;color:#8d96a3;text-decoration:none;padding:9px 15px 10px;border-radius:9px 9px 0 0;white-space:nowrap;flex:none}'
      +'.lsub a:hover{color:#3f6f8f;background:#f4f7fb}'
      +'.lsub a.on{color:#2f5a74;background:#fff;box-shadow:0 -2px 10px rgba(31,42,68,.05)}'
      +'.lsub a.on:after{content:"";position:absolute;left:8px;right:8px;bottom:-2px;height:3px;border-radius:2px;background:#3f6f8f}'
      +'.lsub-ver{margin-left:auto;font-size:10.5px;font-weight:800;color:#9aa6b4;padding:0 4px 11px;white-space:nowrap;flex:none;font-variant-numeric:tabular-nums}'
      +'@media(max-width:820px){.lsub{margin:10px 12px 0;padding:0}.lsub a{font-size:13px;padding:8px 11px 9px}.lsub-lbl{display:none}}';
    document.head.appendChild(st);
  }

  var bar=document.createElement('nav');
  bar.className='lsub';
  bar.setAttribute('aria-label','Travel');

  var lbl=document.createElement('span');
  lbl.className='lsub-lbl'; lbl.textContent=CFG.label||'Travel';
  bar.appendChild(lbl);

  CFG.items.forEach(function(it,i){
    var a=document.createElement('a');
    a.setAttribute('href',it.href);
    a.appendChild(document.createTextNode(it.label));
    if(i===here){ a.className='on'; a.setAttribute('aria-current','page'); }
    bar.appendChild(a);
  });

  if(CFG.ver){
    var v=document.createElement('span');
    v.className='lsub-ver'; v.textContent=CFG.ver; bar.appendChild(v);
  }

  var nav=document.querySelector('.pynav');
  if(nav&&nav.parentNode) nav.parentNode.insertBefore(bar,nav.nextSibling);
  else document.body.insertBefore(bar,document.body.firstChild);

  /* Line the strip up with the page's own content column, same as the other
     three strips. The travel pages use .wrap; the older map page uses .secbar-wrap. */
  try{
    var probe=document.querySelector('.pagehead')||document.querySelector('.secbar-wrap')||document.querySelector('.wrap');
    if(probe){
      var cs=getComputedStyle(probe);
      if(cs.maxWidth&&cs.maxWidth!=='none'){
        bar.style.maxWidth=cs.maxWidth;
        bar.style.paddingLeft=cs.paddingLeft;
        bar.style.paddingRight=cs.paddingRight;
      }
    }
  }catch(_w){}
}catch(e){ if(window.console) console.log('navpatch travel strip',e); }})();

/* Version chip parity. A page carries its version in two places: the chip in the
   nav bar (.pn-ver) and the chip beside the page heading (.secbar .ver, and the
   older .topbar / #ver variants). They are hand-maintained and used to drift.
   This makes them self-correcting: the highest version found wins and is written
   to every chip on the page. Card and module badges are never touched.
   Added 2026-08-18. */
(function(){
  function sync(){try{
    var PAGE_SEL='.secbar .ver, .topbar .ver, h1.ph-h1 .ver, #ver, h1 .ver, h1 .badge';
    var els=[].slice.call(document.querySelectorAll('.pn-ver, '+PAGE_SEL));
    if(els.length<2) return;
    function key(t){var m=String(t||'').trim().match(/^v?(\d+(?:\.\d+)*)$/);
      return m?m[1].split('.').map(Number):null;}
    function cmp(a,b){var n=Math.max(a.length,b.length);
      for(var i=0;i<n;i++){var x=a[i]||0,y=b[i]||0;if(x!==y)return x-y;}return 0;}
    var best=null,txt=null;
    els.forEach(function(e){var k=key(e.textContent);if(!k)return;
      if(!best||cmp(k,best)>0){best=k;txt=e.textContent.trim();}});
    if(!txt) return;
    els.forEach(function(e){if(key(e.textContent)&&e.textContent.trim()!==txt)e.textContent=txt;});
    window.PY_VERSION=txt;
  }catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync);else sync();
})();

/* Card-header version parity, and nav chips that hold a label instead of a number.
   Added 2026-08-21.

   Why: the deck pages draw their card header with JavaScript AFTER load, and the
   version inside that template string was hand-typed. On james-clear.html and
   quotes.html it read v1.0 while the page badge had been bumped three separate
   times, v1.5 to v1.6 to v1.7. Every bump moved the badge and left the number
   Scott actually looks at, the one on the card, reading v1.0. A badge sweep can
   never catch it because it is not in the HTML at all.

   Two fixes, both runtime and both safe:
   1. Sync any card-header chip (.hd .ver) to the page version, re-running when
      the deck re-renders, because that content does not exist at DOMContentLoaded.
   2. If the nav chip (.pn-ver) holds something that is not a version number, for
      example the word "Maps" on knowledge-graph.html, fill it with the page
      version rather than leaving the page with no number at all.

   This is a safety net, not a licence to leave the source wrong. The hardcoded
   v1.0 strings still need removing from james-clear.html and quotes.html so the
   next session reads the right thing in the file. Tracked on the ToDo board. */
(function(){
  function isVer(t){return /^v?\d+(?:\.\d+)*$/.test(String(t||'').trim());}
  function curPage(){var p=(location.pathname.split('/').pop()||'index.html');return p||'index.html';}
  function pageVer(){
    if(window.PY_VERSION&&isVer(window.PY_VERSION))return window.PY_VERSION;
    var e=document.querySelector('.secbar .ver, h1.ph-h1 .ver, .topbar .ver, #ver, h1 .ver, h1 .badge, header > .ver, h1 + .ver, h1 + .verbadge');
    if(e&&isVer(e.textContent))return e.textContent.trim();
    /* declared fallback for pages that carry no version anywhere in their markup */
    try{
      var m=window.PAGE_VERSIONS||{}, v=m[curPage()];
      if(isVer(v))return String(v).trim();
    }catch(_){}
    return null;
  }
  function fixNavChip(){try{
    var n=document.querySelector('.pn-ver'); if(!n)return;
    var v=pageVer();
    /* The nav chip is a MIRROR, never the declaration. If the page declares a
       version at its heading, the chip follows it even when the chip already
       holds a plausible-looking number — that disagreement is exactly the
       maps.html bug, where the chip said v1.5 and the heading said v1.2. When
       the page declares nothing, pageVer is null and we leave the chip alone,
       because on those pages the chip is all there is. */
    if(!v)return;
    if(n.textContent.trim()!==v)n.textContent=v;
  }catch(e){}}
  function fixCardChips(){try{
    var v=pageVer(); if(!v)return;
    /* maps.html calls its heading chip .verbadge, not .ver, which is why its
       nav said v1.5 while the heading said v1.2 for weeks. Sync both. */
    document.querySelectorAll('.hd .ver, .verbadge').forEach(function(e){
      if(isVer(e.textContent)&&e.textContent.trim()!==v)e.textContent=v;
    });
  }catch(e){}}
  /* The floating corner badge. On james-clear.html and quotes.html this is a
     position:fixed pill in the bottom-right reading "Atomic Habits v1.0" and
     "Things Worth Knowing v1.0" — literal text in the HTML, never bumped, and
     on screen the entire time you use the page. Rewrite only the version token
     at the end, leave the module name alone. */
  function fixCornerBadge(){try{
    var v=pageVer(); if(!v)return;
    document.querySelectorAll('.badge').forEach(function(e){
      if(e.children.length)return;                 /* only plain-text badges */
      var t=(e.textContent||'').trim();
      /* The v is REQUIRED. It used to be optional, so ANY plain-text badge ending
         in a bare number matched: "Reconciled Aug 13, 2026" on how-we-work.html
         was rewritten to "Reconciled Aug 13, v2.0" the moment that page declared
         a version. A date or a count is not a version. Aug 23 2026. */
      var m=t.match(/^(.*\S)\s+(v\d+(?:\.\d+)*)$/);
      if(!m)return;
      if(m[2]===v)return;
      e.textContent=m[1]+' '+v;
    });
  }catch(e){}}
  function run(){fixNavChip();fixCardChips();fixCornerBadge();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run);else run();
  /* the decks render their cards later, and re-render on every Next, so watch */
  try{
    var mo=new MutationObserver(function(){fixCardChips();fixCornerBadge();});
    var start=function(){mo.observe(document.body,{childList:true,subtree:true});};
    if(document.body)start(); else document.addEventListener('DOMContentLoaded',start);
  }catch(e){}
})();

/* LIGHT HEADINGS ON DARK BARS  (rule, Aug 21 2026, Scott)
   ========================================================
   THE RULE: on any page whose heading sits on a dark background, the heading
   text is very light grey (#d6dce4), never white and never the dark ink used
   on white pages. One shared definition, applied at runtime, so a new page
   inherits it without anyone remembering to.

   Why this exists: ph-header-css above sets h1.ph-h1 to #2f5a74 !important for
   every page. That is correct on the white pages it was written for, but it is
   also the exact end colour of the dark header gradient on library.html
   (.secbar) and midnight-run-v2.html (header.top), so the headings on those two
   pages were dark blue on dark blue and effectively invisible.

   How it decides: it walks up from the heading to the first ancestor that
   actually paints a background (a solid colour or a gradient), works out that
   colour's brightness, and only recolours when the background is dark. Light
   pages are never touched. Change ONE value, ONDARK below, to restyle every
   dark-bar heading on the site. */
(function(){
  var ONDARK = window.ONDARK_INK || '#d6dce4';
  var HEADS = 'h1.ph-h1, .secbar h1, header.top h1, .pagehead h1';

  function firstRGB(s){
    var m = String(s||'').match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s/]+([\d.]+))?\s*\)/g);
    if(!m || !m.length) return null;
    var r=0,g=0,b=0,n=0;
    m.forEach(function(one){
      var p = one.match(/[\d.]+/g);
      if(!p) return;
      if(p.length>3 && parseFloat(p[3])<0.35) return;   /* near transparent stop */
      r+=+p[0]; g+=+p[1]; b+=+p[2]; n++;
    });
    return n ? [r/n, g/n, b/n] : null;
  }
  function bright(c){ return (0.299*c[0] + 0.587*c[1] + 0.114*c[2]) / 255; }

  function bgBehind(el){
    var node = el;
    while(node && node.nodeType===1){
      var cs = getComputedStyle(node);
      if(cs.backgroundImage && cs.backgroundImage!=='none'){
        var g = firstRGB(cs.backgroundImage);
        if(g) return g;
      }
      var c = firstRGB(cs.backgroundColor);
      if(c){
        var a = String(cs.backgroundColor).match(/[\d.]+/g);
        if(!a || a.length<4 || parseFloat(a[3])>=0.9) return c;
      }
      node = node.parentElement;
    }
    return null;
  }

  function paint(){try{
    document.querySelectorAll(HEADS).forEach(function(h){
      if(h.closest('.pynav')) return;
      if(h.dataset.pnOndark==='1') return;
      var bg = bgBehind(h);
      if(!bg || bright(bg) > 0.5) return;              /* light bar, leave alone */
      h.dataset.pnOndark='1';
      h.style.setProperty('color', ONDARK, 'important');
      h.querySelectorAll('.ver, .date, .badge').forEach(function(x){
        x.style.setProperty('color', ONDARK, 'important');
        x.style.setProperty('border-color', 'rgba(255,255,255,.35)', 'important');
      });
    });
  }catch(e){}}

  var queued=false;
  function run(){ if(queued) return; queued=true; setTimeout(function(){queued=false;paint();},60); }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',paint);
  else paint();
  /* headings behind a sign-in gate (midnight-run) only become visible later */
  try{
    var mo=new MutationObserver(run);
    var start=function(){mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','style']});};
    if(document.body) start(); else document.addEventListener('DOMContentLoaded',start);
  }catch(e){}
})();

/* ============================================================
   GROUP RENAME  (layer 4)
   The grey .pn-label text is hardcoded into every page's markup AND is the key
   navpatch matches a NAV_CONFIG group on, so a group cannot be renamed from
   nav-config.js alone - change the key and it simply stops matching.
   window.NAV_GROUP_RENAME maps  config key -> the text to display.
   Runs LAST, after the links are filled and after NAV_GROUP_LINKS may have
   swapped the label for an <a>, so it only ever changes what you READ.
   Renaming a group is therefore one line in nav-config.js and nothing else.
   ============================================================ */
(function(){try{
  var map=window.NAV_GROUP_RENAME; if(!map)return;
  var nav=document.querySelector('.pynav'); if(!nav)return;
  nav.querySelectorAll('.pn-group .pn-label').forEach(function(l){
    var k=(l.textContent||'').trim();
    if(Object.prototype.hasOwnProperty.call(map,k)&&map[k])l.textContent=map[k];
  });
}catch(e){if(window.console)console.log('nav rename error',e);}})();


/* NAV STYLE REPAIR (Aug 23 2026, Scott: "Go" on nav item 102).
   Runs last, once the links are in. Every page renders the same six groups and
   21 links already, but three pages carried a hand-written .pynav with no nav
   stylesheet behind it, so the bar came out as a stack of underlined links.
   Detect that and add the canonical stylesheet. Pages that already style their
   own nav are left alone, so this cannot shift the look of the other 69. */
(function(){try{
  var nav=document.querySelector('.pynav'); if(!nav) return;
  var link=nav.querySelector('a.pn-link'); if(!link) return;
  var navOk=getComputedStyle(nav).display==='flex';
  var linkOk=getComputedStyle(link).textDecorationLine==='none';
  if(navOk&&linkOk) return;
  if(typeof window.__pnNavCss==='function') window.__pnNavCss();
}catch(e){if(window.console)console.log('nav style repair error',e);}})();


/* ============================================================
   THE MINUTE BAR (Sep 2 2026)
   Scott: "adding how much time is currently too difficult. you have to type in
   a number ... the vast majority of my time its 1,2,3,4,5,6,7,8,9,10 minutes."
   He picked the bar out of five mock-ups and asked for it a bit smaller.

   Every cue card ends with a typed minute box (#tmin on the AI family, #mins on
   the nav2 family and creativity). This replaces that box, on all eleven pages
   at once, with a ten-block strip: tap the seventh block and the bar fills to
   seven. The strip only SETS the page's own input and then presses the page's
   own finish control, so every module keeps its existing save logic, its own
   toast and its own bounce back to the board. Nothing about the database
   contract changes, which is why this can live in the shared layer instead of
   eleven separate page edits.

   Behaviour, deliberately the same everywhere:
   - tap a block  -> the bar fills, the number lands in the hidden input, and
                     after a short grace the page's finish control is pressed.
   - tap again inside the grace -> the number changes, nothing has been saved.
   - "10+"        -> gives the original typing box back for the rare long one.
   - the finish control is disabled or refuses (creativity's "you have not drawn
     anything yet") -> the number is still set, the page says its own piece.
   ============================================================ */
(function(){try{
  /* EVERY card that asks for minutes gets the bar, including cards built after
     this was written. Sep 3 2026: the old allow-list of eleven pages silently
     skipped three-new-things, social-fitness and wall, and would have skipped
     every card built later. Two pages keep their typing box on purpose, because
     hours are entered there and "3h" / "2:30" needs a keyboard. */
  var NEVER={'index.html':1,'habit-worksheets.html':1};
  var page=(location.pathname.split('/').pop()||'').toLowerCase();
  if(NEVER[page]) return;
  if(window.self!==window.top) return;   /* embedded previews carry no chrome */

  var GRACE=1100;                        /* ms before the finish is pressed */
  var bar=null, seg=[], now=null, pend=null, chosen=0, committed=false, typing=false;

  function css(){
    if(document.getElementById('pymb-css')) return;
    var s=document.createElement('style'); s.id='pymb-css';
    s.textContent=
      '.pymb{margin:14px 0 2px;font-family:Arial,Helvetica,sans-serif;text-align:left;'+
        '--pymb-off:#eef2f8;--pymb-offink:#9aa6b4;--pymb-on:#3f6f8f;--pymb-onink:#fff;'+
        '--pymb-lab:#8a93a0;--pymb-panel:#fff;--pymb-line:#e3e7ee}'+
      '.pymb.pymb-dark{font-family:inherit}'+
      '.pymb.pymb-dark .pymb-seg{font-family:inherit}'+
      '.pymb-lab{display:flex;align-items:baseline;gap:8px;font-size:11.5px;font-weight:700;'+
        'color:var(--pymb-lab);margin:0 0 6px;line-height:1.3}'+
      '.pymb-now{margin-left:auto;font-weight:800;color:var(--pymb-on);font-variant-numeric:tabular-nums;'+
        'white-space:nowrap}'+
      '.pymb-strip{display:flex;gap:3px;height:32px;align-items:stretch}'+
      '.pymb-seg{flex:1 1 0;min-width:0;padding:0 0 4px;margin:0;border:0;border-radius:6px;'+
        'background:var(--pymb-off);color:var(--pymb-offink);font:800 10px/1 Arial,Helvetica,sans-serif;'+
        'display:flex;align-items:flex-end;justify-content:center;cursor:pointer;'+
        'font-variant-numeric:tabular-nums;-webkit-appearance:none;appearance:none;'+
        'transition:background .1s ease,color .1s ease}'+
      '.pymb-seg.on{background:var(--pymb-on);color:var(--pymb-onink)}'+
      '.pymb-more{flex:0 0 44px;align-items:center;padding:0;font-size:9.5px;letter-spacing:.3px;'+
        'background:var(--pymb-panel);border:1px solid var(--pymb-line);color:var(--pymb-lab)}'+
      '.pymb-more:hover{background:var(--pymb-off);color:var(--pymb-on)}'+
      '.pymb-panel{background:var(--pymb-panel);border:1px solid var(--pymb-line);border-radius:14px;padding:10px 12px}'+
      '.pymb-locked .pymb-seg{cursor:default}'+
      '@media (prefers-reduced-motion:reduce){.pymb-seg{transition:none}}';
    (document.head||document.documentElement).appendChild(s);
  }

  function theInput(){
    var el=document.getElementById('tmin')||document.getElementById('mins');
    if(!el||el.tagName!=='INPUT') return null;
    return el;
  }
  function wanted(el){ return !!el && !el.classList.contains('hidden'); }

  function finisher(){
    var sels=['#nx','.mc-cta','#did','#btnNext','#finbtn','.btn[data-go="finish"]','.foot .next'];
    for(var i=0;i<sels.length;i++){
      var e=document.querySelector(sels[i]);
      if(e&&e.offsetParent!==null) return e;
    }
    return null;
  }

  /* Dark cards, Sep 3 2026. The strip shipped in one light palette because the
     first eleven cards were all light. three-new-things is near black, so a white
     panel sat on it like a sticker. The page is measured instead of listed: if the
     background is dark the strip switches to the dark tokens, and the "on" colour
     is taken from the page's own finish button so it always looks native. */
  function pymbRGB(s){
    var m=/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,\/]+([\d.]+))?/.exec(s||'');
    if(!m) return null;
    return {r:+m[1],g:+m[2],b:+m[3],a:(m[4]===undefined?1:parseFloat(m[4]))};
  }
  function pymbDark(){
    var els=[document.body,document.documentElement];
    for(var i=0;i<els.length;i++){
      if(!els[i]) continue;
      var c=pymbRGB(getComputedStyle(els[i]).backgroundColor);
      if(c&&c.a>0.5) return (0.2126*c.r+0.7152*c.g+0.0722*c.b)/255 < 0.45;
    }
    return false;
  }
  function pymbAccent(){
    var f=finisher(); if(!f) return null;
    var st=getComputedStyle(f), bg=pymbRGB(st.backgroundColor);
    if(!bg||bg.a<0.6) return null;
    return {bg:st.backgroundColor, ink:st.color};
  }

  function paint(n){
    for(var i=0;i<seg.length;i++){
      if(i<n) seg[i].classList.add('on'); else seg[i].classList.remove('on');
    }
  }

  function build(){
    css();
    var d=document.createElement('div'); d.className='pymb';
    if(pymbDark()){
      d.classList.add('pymb-dark');
      var ac=pymbAccent();
      d.style.setProperty('--pymb-on',   ac?ac.bg :'#e07b41');
      d.style.setProperty('--pymb-onink',ac?ac.ink:'#1a120c');
      d.style.setProperty('--pymb-off','rgba(255,255,255,.09)');
      d.style.setProperty('--pymb-offink','rgba(255,255,255,.42)');
      d.style.setProperty('--pymb-lab','rgba(255,255,255,.5)');
      d.style.setProperty('--pymb-panel','rgba(255,255,255,.05)');
      d.style.setProperty('--pymb-line','rgba(255,255,255,.14)');
    }
    var lab=document.createElement('div'); lab.className='pymb-lab';
    var l1=document.createElement('span'); l1.textContent='How long did that take?';
    now=document.createElement('span'); now.className='pymb-now'; now.textContent='tap the minutes';
    lab.appendChild(l1); lab.appendChild(now);
    var strip=document.createElement('div'); strip.className='pymb-strip';
    seg=[];
    for(var i=1;i<=10;i++){
      var b=document.createElement('button');
      b.type='button'; b.className='pymb-seg'; b.setAttribute('data-v',i);
      b.setAttribute('aria-label',i+(i===1?' minute':' minutes'));
      b.textContent=i;
      strip.appendChild(b); seg.push(b);
    }
    var more=document.createElement('button');
    more.type='button'; more.className='pymb-seg pymb-more'; more.textContent='10+';
    more.setAttribute('aria-label','more than ten minutes');
    strip.appendChild(more);
    d.appendChild(lab); d.appendChild(strip);

    strip.addEventListener('mouseover',function(e){
      if(committed||typing) return;
      var b=e.target.closest?e.target.closest('.pymb-seg'):null;
      if(!b||b===more) return;
      paint(+b.getAttribute('data-v'));
    });
    strip.addEventListener('mouseleave',function(){
      if(committed||typing) return;
      paint(chosen);
    });
    strip.addEventListener('click',function(e){
      var b=e.target.closest?e.target.closest('.pymb-seg'):null;
      if(!b||committed) return;
      if(b===more){ showBox(); return; }
      pick(+b.getAttribute('data-v'));
    });
    return d;
  }

  function showBox(){
    var el=theInput(); if(!el) return;
    typing=true;
    if(pend){ clearTimeout(pend); pend=null; }
    var host=el.__pymbWrap||el;
    host.style.display='';
    el.style.display='';
    var f=finisher();
    now.textContent='type it, then press '+(f?(f.textContent||'').trim().slice(0,24):'finish');
    var strip=bar.querySelector('.pymb-strip');
    if(strip) strip.style.display='none';
    try{ el.focus(); }catch(e){}
  }

  function pick(n){
    var el=theInput(); if(!el) return;
    chosen=n; paint(n);
    el.value=n;
    try{
      el.dispatchEvent(new Event('input',{bubbles:true}));
      el.dispatchEvent(new Event('change',{bubbles:true}));
    }catch(e){}
    now.textContent=n+(n===1?' minute':' minutes')+' — saving';
    if(pend) clearTimeout(pend);
    pend=setTimeout(commit,GRACE);
  }

  function commit(){
    pend=null;
    if(committed) return;
    committed=true;
    if(bar) bar.classList.add('pymb-locked');
    now.textContent=chosen+(chosen===1?' minute':' minutes')+' ✓';
    var f=finisher();
    if(f&&!f.disabled&&!f.classList.contains('disabled')){
      try{ f.click(); }catch(e){}
    }else{
      /* nothing to press yet - leave the strip live so the number can change */
      committed=false;
      if(bar) bar.classList.remove('pymb-locked');
    }
  }

  function sync(){
    var el=theInput();
    if(!el){
      if(bar&&bar.parentNode) bar.parentNode.removeChild(bar);
      bar=null; seg=[]; chosen=0; committed=false; typing=false;
      if(pend){ clearTimeout(pend); pend=null; }
      return;
    }
    if(el.getAttribute('data-pymb')==='1' && bar && bar.parentNode && document.contains(bar)){
      bar.style.display=wanted(el)?'':'none';
      return;
    }
    /* new input node (the deck re-rendered) - build a fresh strip for it */
    if(bar&&bar.parentNode) bar.parentNode.removeChild(bar);
    chosen=0; committed=false; typing=false;
    if(pend){ clearTimeout(pend); pend=null; }

    bar=build();
    var wrap=el.closest?el.closest('.howlong,.mc-time,.took,.minrow,.minl'):null;
    if(wrap){
      el.__pymbWrap=wrap;
      wrap.style.display='none';
      if(wrap.parentNode) wrap.parentNode.insertBefore(bar,wrap.nextSibling);
    }else{
      el.__pymbWrap=null;
      el.style.display='none';
      bar.classList.add('pymb-panel');
      var row=el.parentNode;
      if(row&&row.parentNode) row.parentNode.insertBefore(bar,row);
      else return;
    }
    el.setAttribute('data-pymb','1');
    bar.style.display=wanted(el)?'':'none';
  }

  function boot(){
    sync();
    try{
      var mo=new MutationObserver(function(){
        if(boot.q) return;
        boot.q=true;
        setTimeout(function(){ boot.q=false; try{ sync(); }catch(e){} },60);
      });
      mo.observe(document.body,{childList:true,subtree:true,attributes:true,
                                attributeFilter:['class','style']});
    }catch(e){}
    setInterval(function(){ try{ sync(); }catch(e){} },1500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot);
  else boot();
}catch(e){if(window.console)console.log('minute bar error',e);}})();


/* ===== Needs You loader =====================================================
   KEEP THIS. It loads needs-you.js, the little pop-up that asks Scott the one
   question a module is stuck on. It used to live at the end of nav-config.js
   and has now been deleted TWICE by other sessions republishing that file from
   an older copy, each time silently switching the pop-up off on every page.
   It lives here instead because navpatch.js is injected into every page by the
   same publish step and is edited far less often. Moved Sep 3 2026, after the
   nightly nav check found two of his questions stranded behind the missing
   loader. Fails silent: if the script cannot load, nothing is said.
   ========================================================================== */
(function(){try{
  if(window.__needsYouLoaded) return;
  window.__needsYouLoaded = true;
  if(document.querySelector('script[src*="needs-you.js"]')) return;
  var add=function(){
    try{
      var s=document.createElement('script');
      s.src='needs-you.js';
      s.async=true;
      s.onerror=function(){};
      (document.body||document.head||document.documentElement).appendChild(s);
    }catch(e){}
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',add);
  else add();
}catch(e){}})();
