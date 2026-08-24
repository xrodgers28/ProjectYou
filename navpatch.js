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
  st.textContent='.pynav,.msub,.pn-back,.pn-backwrap{display:none!important}';
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
