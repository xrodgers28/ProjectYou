(function(){try{var cfg=window.NAV_CONFIG;if(!cfg)return;var nav=document.querySelector('.pynav');if(!nav)return;var cur=(location.pathname.split('/').pop()||'index.html');if(!cur)cur='index.html';function linkHTML(it){return '<a href="'+it.href+'" class="pn-link">'+it.label+'</a>';}function dropHTML(it){var kids=(it.children||[]).map(function(c){return '<a href="'+c.href+'" class="pn-link">'+c.label+'</a>';}).join('');return '<span class="pn-drop"><span class="pn-link pn-dropbtn" tabindex="0">'+it.label+' &#9662;</span><span class="pn-menu">'+kids+'</span></span>';}var groups=nav.querySelectorAll('.pn-group');var gLinks=window.NAV_GROUP_LINKS||{};Object.keys(cfg).forEach(function(gl){var links=null,labelEl=null;groups.forEach(function(g){var l=g.querySelector('.pn-label');if(l&&(l.textContent||'').trim()===gl){links=g.querySelector('.pn-links');labelEl=l;}});if(!links)return;links.innerHTML=cfg[gl].map(function(it){return it.children?dropHTML(it):linkHTML(it);}).join('');if(gLinks[gl]&&labelEl&&labelEl.tagName!=='A'){var la=document.createElement('a');la.className='pn-label';la.setAttribute('href',gLinks[gl]);la.innerHTML=labelEl.innerHTML;labelEl.parentNode.replaceChild(la,labelEl);}});if(!document.getElementById('pn-maps-css')){var st=document.createElement('style');st.id='pn-maps-css';st.textContent='.pynav{z-index:9000}.pn-drop{position:relative;display:inline-flex;align-items:stretch}.pn-dropbtn{cursor:pointer;user-select:none}.pn-menu{position:fixed;background:#fff;border:1px solid #e3e7ee;border-radius:9px;box-shadow:0 10px 28px rgba(31,42,68,.16);padding:5px;display:none;flex-direction:column;min-width:200px;z-index:2147483000}.pn-menu.open{display:flex}.pn-menu .pn-link{white-space:nowrap;text-align:left;justify-content:flex-start;padding:6px 9px}a.pn-label{text-decoration:none;cursor:pointer}a.pn-label:hover{color:#3f6f8f}a.pn-label.on{color:#3f6f8f}.pn-links>a.pn-link:only-child{min-height:31px}';document.head.appendChild(st);}if(!document.getElementById('ph-header-css')){var hs=document.createElement('style');hs.id='ph-header-css';hs.textContent='.secbar-wrap{max-width:1080px;margin:0 auto;padding:22px 34px 0}.secbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap}h1.ph-h1{font-size:26px!important;font-weight:800!important;color:#2f5a74!important;letter-spacing:.2px;line-height:1.1;margin:0;display:flex;align-items:center;gap:12px;flex-wrap:wrap}h1.ph-h1 .ver,.secbar .ver{font-size:11px!important;font-weight:800!important;color:#9aa6b4!important;background:none!important;border:1px solid #e3e7ee!important;border-radius:999px!important;padding:2px 8px!important;letter-spacing:0!important;vertical-align:middle}h1.ph-h1 .date,.secbar .date{font-size:11.5px!important;color:#9aa6b4!important;font-weight:400!important}.lead{max-width:1080px;margin:0 auto;padding:4px 34px 0;color:#5b6472;font-size:15px}.lead p{max-width:660px;margin:2px 0 0}';document.head.appendChild(hs);}try{var _mk=function(h){if(h&&!h.classList.contains('ph-h1')&&!h.closest('.pagehead'))h.classList.add('ph-h1');};document.querySelectorAll('.secbar h1').forEach(_mk);document.querySelectorAll('h1').forEach(function(h){if(h.closest('.pynav'))return;if(h.querySelector('.ver,.date'))_mk(h);});var _all=document.querySelectorAll('h1');for(var _i=0;_i<_all.length;_i++){if(!_all[_i].closest('.pynav')){_mk(_all[_i]);break;}}var _hd=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});document.querySelectorAll('.secbar .date,h1.ph-h1 .date').forEach(function(x){if(!(x.textContent||'').trim())x.textContent=_hd;});}catch(_e){}nav.querySelectorAll('a.pn-link').forEach(function(a){if(a.getAttribute('href')===cur)a.classList.add('on');});nav.querySelectorAll('a.pn-label').forEach(function(a){if(a.getAttribute('href')===cur)a.classList.add('on');});nav.querySelectorAll('.pn-drop').forEach(function(d){var on=false;d.querySelectorAll('.pn-menu a.pn-link').forEach(function(a){if(a.getAttribute('href')===cur)on=true;});if(on){var b=d.querySelector('.pn-dropbtn');if(b)b.classList.add('on');}});if(!window.__pnMapsJs&&!document.getElementById('pn-maps-js')){window.__pnMapsJs=1;document.addEventListener('click',function(e){var b=e.target.closest('.pn-dropbtn');var m=b?b.parentNode.querySelector('.pn-menu'):null;document.querySelectorAll('.pn-menu.open').forEach(function(x){if(x!==m)x.classList.remove('open');});if(b){var r=b.getBoundingClientRect();m.style.left=Math.max(6,Math.min(r.left,window.innerWidth-210))+'px';m.style.top=(r.bottom+2)+'px';m.classList.toggle('open');e.stopPropagation();e.preventDefault();}});}try{var QSBACK={'qs-log.html':1,'qs-wheel.html':1,'life-snapshot.html':1,'coffee-days.html':1};var mkBack=function(){var a=document.createElement('a');a.className='pn-back';a.href='qs-dashboard.html';a.setAttribute('aria-label','Back to YouMatics');a.innerHTML='\u2190 back to YouMatics';return a;};if(!document.getElementById('pn-back-css')){var bs=document.createElement('style');bs.id='pn-back-css';bs.textContent='.pn-back{display:inline-block;font-size:11.5px;font-weight:700;color:#9aa6b4;text-decoration:none;letter-spacing:.1px}.pn-back:hover{color:#3f6f8f}.pn-backwrap{margin:3px 0 8px}';document.head.appendChild(bs);}if(!document.querySelector('.pn-back')){if(QSBACK[cur]){var bh=null,bl=document.querySelectorAll('h1');for(var bi=0;bi<bl.length;bi++){var bc=bl[bi];if(bc.closest('.pynav')||bc.closest('#login')||bc.closest('#loginbox'))continue;if(bc.closest('.secbar')){bh=bc;break;}if(!bh)bh=bc;}if(bh){var an=bh.closest('.secbar')||bh;var bw=document.createElement('div');bw.className='pn-backwrap';bw.appendChild(mkBack());an.parentNode.insertBefore(bw,an.nextSibling);}}else if(cur==='index.html'){var wv=document.getElementById('wheelview');if(wv){var bw2=document.createElement('div');bw2.className='pn-backwrap';bw2.appendChild(mkBack());wv.insertBefore(bw2,wv.firstChild);}}}}catch(_b){}}catch(err){if(window.console)console.log('navpatch error',err);}})();

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

  if(cur===CFG.hub) return;
  if(document.querySelector('.msub')) return;

  if(!document.getElementById('msub-css')){
    var st=document.createElement('style'); st.id='msub-css';
    st.textContent='.msub{display:flex;flex-wrap:wrap;align-items:center;gap:6px;max-width:1180px;margin:12px auto 2px;padding:8px 12px;background:#fff;border:1px solid #e3e7ee;border-radius:12px;box-shadow:0 4px 14px rgba(31,42,68,.05);font-family:Arial,Helvetica,sans-serif}'
      +'.msub-lbl{font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;color:#3f6f8f;margin-right:2px;display:inline-flex;align-items:center;gap:5px}'
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
  var lbl=document.createElement('span');
  lbl.className='msub-lbl'; lbl.textContent=CFG.label||'Maps';
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
