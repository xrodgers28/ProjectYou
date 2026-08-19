/* Guardrails: the mechanisms that keep Project YOU OS honest.
   ONE source of truth. Published once, read by every page that shows the list.
   Add a guardrail here and it appears on guardrails.html, cheat-sheet.html and
   build.html at the same time. Never retype this list into a page.

   To render it, a page needs only:
     <div class="guardrails" data-mode="full"></div>      full cards
     <div class="guardrails" data-mode="compact"></div>   one line each
     <script src="guardrails.js"></script>

   Each entry:
     id       stable key, never reused
     name     what we call it
     catches  the failure it prevents, always starts with a verb
     how      the mechanism, one sentence
     where    the file, table or trigger it actually lives in
     status   'live' or 'proposed'
     recover  optional: what to run to undo or inspect
     since    date it went in
*/
window.GUARDRAILS = [
  { id:'version-guard', name:'Runtime version guard', status:'live', since:'2026-08-18',
    catches:'A page telling you it is v1.6 when the work you asked for shipped as v1.7.',
    how:'Every page carries its version in two badges. On each page load the highest number found wins and is written to both, so they can never visibly disagree.',
    where:'navpatch.js' },

  { id:'check-before-write', name:'Check before write', status:'live', since:'2026-08-18',
    catches:'Publishing a file that was never verified, or overwriting newer work by a parallel session.',
    how:'Every edit runs in check mode first. The sha256 of the live source must match what was expected before the edit, and the result must match what was computed locally, or it aborts and writes nothing.',
    where:'the recipe edge functions' },

  { id:'hash-chain', name:'Cumulative hash chain', status:'live', since:'2026-08-14',
    catches:'A corrupted block shipping anyway and silently mangling a page.',
    how:'A large page uploads in blocks, each one guarded on the running md5 of everything before it. A block that does not line up is refused rather than appended.',
    where:'pages_upload' },

  { id:'one-write-path', name:'One write path to production', status:'live', since:'2026-08-11',
    catches:'A page edited by hand drifting away from what the database thinks it is.',
    how:'Writing the page content to the database is what publishes it. A trigger fires the GitHub build. There is no second way in.',
    where:'pages_publish_now trigger on public.pages' },

  { id:'one-nav', name:'One nav config', status:'live', since:'2026-08-16',
    catches:'A menu that is correct on some pages and stale on others.',
    how:'Links are defined once. Every page renders the same config at load, so adding a page to the menu is a one-file change.',
    where:'nav-config.js' },

  { id:'archive-first', name:'Archive before delete', status:'live', since:'2026-08-18',
    catches:'Losing something you turn out to need three weeks later.',
    how:'Nothing is deleted without a verbatim copy being written first, with the reason and the date it was removed.',
    where:'pages_archive',
    recover:'select * from pages_archive' },

  { id:'retired-not-deleted', name:'Retired, never deleted', status:'live', since:'2026-08-18',
    catches:'Nobody remembering what a one-off script actually changed.',
    how:'A used-up publishing function is replaced by a stub that returns 410, and its source keeps the record: every file it touched and the hash before and after.',
    where:'the pub* edge functions' },

  { id:'site-sweep', name:'The site sweep', status:'live', since:'2026-08-18',
    catches:'Badges disagreeing, pages with no badge, broken links, pages that fell out of the shared nav.',
    how:'A read-only pass over every published page, reading from the canonical source rather than a browser, so a cached copy can never make a broken thing look fixed. Changes nothing.',
    where:'the version-check skill',
    recover:'[VC]' },

  { id:'db-owns-definition', name:'The database owns the definition', status:'live', since:'2026-08-16',
    catches:'History and the live feed quietly disagreeing about what a number means.',
    how:'One function defines a metric and one view defines what a day is. The backfill and the live feed both call the same function, so they cannot drift apart.',
    where:'the metric functions and views' },

  { id:'manual-tick', name:'Manual tick beside every feed', status:'live', since:'2026-08-16',
    catches:'A broken sensor logging a false zero that then looks like a real day off.',
    how:'Every automated metric keeps a way to complete it by hand, so a gap in the feed never becomes a gap in the record.',
    where:'the tracker pages' },

  { id:'grants-not-policies', name:'Grants, not just policies', status:'live', since:'2026-08-15',
    catches:'A new table accepting writes that silently go nowhere.',
    how:'Row-level policies without table grants fail quietly. Every new table has both checked before it is called done. This has bitten three times.',
    where:'the setup checklist in the runbook' },

  { id:'registry-or-invisible', name:'Registry or invisible', status:'live', since:'2026-08-15',
    catches:'A page that exists but that nothing links to, so nobody ever opens it.',
    how:'A session tracker is only reachable through its registry row. Publishing without registering makes the page invisible, which surfaces the mistake immediately instead of months later.',
    where:'session_trackers' },

  { id:'repeat-question', name:'The repeat-question catch', status:'live', since:'2026-08-18',
    catches:'Building a second version of something you already have, because you asked for it in different words.',
    how:'When a request matches something that already exists, the earlier thing gets named and the overlap shown, before anything new is built.',
    where:'how-we-work-rules, section 6' },

  { id:'duplicate-detector', name:'Duplicate detector', status:'live', since:'2026-08-18',
    catches:'Two pages quietly doing the same job, or a page wearing the wrong heading because it was copied from another one.',
    how:'The sweep normalises every page title and heading and compares all of them, reporting any pair more than 85 percent alike. Pages generated from one template are treated as a family and compared as a group, so a legitimate shared heading is not eleven false alarms.',
    where:'the version-check skill' },

  { id:'orphan-check', name:'Orphan check', status:'live', since:'2026-08-18',
    catches:'A page that is published and correct but that nothing anywhere links to, so it is effectively lost.',
    how:'The sweep builds the whole link graph, counting the shared nav as an inbound link, and reports any page nothing points at. A page whose index builds its links at runtime from the database is not counted as an orphan.',
    where:'the version-check skill' },

  { id:'links-in-scripts', name:'Links hidden in scripts', status:'live', since:'2026-08-18',
    catches:'A broken link that lives inside JavaScript rather than an href, which a plain link checker never sees.',
    how:'The sweep also reads page names out of script strings and resolves them. It found a dead link on the Docs Library the first time it ran. Working ones are counted quietly, because they are what makes the orphan check accurate.',
    where:'the version-check skill' },

  { id:'staleness-clock', name:'Staleness clock', status:'live', since:'2026-08-18',
    catches:'A document that describes how the system works but has not been re-checked against it in weeks.',
    how:'The sweep reads the Last verified date off every canonical document and reports anything older than the threshold, seven days by default, plus any document carrying no verified date at all.',
    where:'the version-check skill' },
];

(function(){
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function css(){
    if(document.getElementById('gr-css')) return;
    var st=document.createElement('style'); st.id='gr-css';
    st.textContent=
      '.gr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:13px}'+
      '.gr-card{background:#fff;border:1px solid #e3e7ee;border-radius:13px;padding:14px 16px;box-shadow:0 5px 14px rgba(31,42,68,.05)}'+
      '.gr-card.prop{background:#fbfaf6;border-style:dashed}'+
      '.gr-top{display:flex;align-items:baseline;gap:9px;flex-wrap:wrap;margin-bottom:7px}'+
      '.gr-name{font-size:14.5px;font-weight:800;color:#2f5a74}'+
      '.gr-tag{font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;border-radius:999px;padding:2px 8px}'+
      '.gr-tag.live{color:#1e8e5a;background:#e8f5ef}.gr-tag.proposed{color:#b07d1e;background:#fbf2e0}'+
      '.gr-lbl{font-size:10px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;color:#9aa6b4;display:block;margin-top:8px}'+
      '.gr-txt{font-size:12.5px;color:#5b6472;line-height:1.5}'+
      '.gr-where{font-family:"Courier New",monospace;font-size:11.5px;color:#3f6f8f}'+
      '.gr-rec{display:inline-block;margin-top:8px;font-family:"Courier New",monospace;font-size:11.5px;'+
        'color:#3f6f8f;background:#eef2f8;border-radius:7px;padding:4px 8px}'+
      '.gr-line{display:flex;gap:12px;align-items:baseline;padding:7px 0;border-bottom:1px solid #eef1f6}'+
      '.gr-line:last-child{border-bottom:0}'+
      '.gr-line .n{flex:0 0 190px;font-size:12.5px;font-weight:800;color:#2f5a74}'+
      '.gr-line .c{font-size:12.5px;color:#5b6472;line-height:1.45}'+
      '.gr-line .c i{font-style:normal;color:#b07d1e;font-weight:800;font-size:10px;'+
        'text-transform:uppercase;letter-spacing:.4px;margin-left:6px}'+
      '.gr-empty{background:#fff;border:1px dashed #dfe4ec;border-radius:13px;padding:16px 18px;'+
        'font-size:12.5px;color:#8a93a0;line-height:1.5}';
    document.head.appendChild(st);
  }
  function full(g){
    return '<div class="gr-card'+(g.status==='proposed'?' prop':'')+'">'+
      '<div class="gr-top"><span class="gr-name">'+esc(g.name)+'</span>'+
      '<span class="gr-tag '+g.status+'">'+(g.status==='live'?'Running':'Proposed')+'</span></div>'+
      '<span class="gr-lbl">Catches</span><div class="gr-txt">'+esc(g.catches)+'</div>'+
      '<span class="gr-lbl">How</span><div class="gr-txt">'+esc(g.how)+'</div>'+
      '<span class="gr-lbl">Lives in</span><div class="gr-txt gr-where">'+esc(g.where)+'</div>'+
      (g.recover?'<span class="gr-rec">'+esc(g.recover)+'</span>':'')+
      '</div>';
  }
  function compact(g){
    return '<div class="gr-line"><div class="n">'+esc(g.name)+'</div>'+
      '<div class="c">'+esc(g.catches)+
      (g.status==='proposed'?'<i>proposed</i>':'')+
      (g.recover?' <span class="gr-where">'+esc(g.recover)+'</span>':'')+'</div></div>';
  }
  function render(){
    var mounts=document.querySelectorAll('.guardrails');
    if(!mounts.length) return;
    css();
    Array.prototype.forEach.call(mounts,function(m){
      var mode=m.getAttribute('data-mode')||'full';
      var only=m.getAttribute('data-status');
      var list=window.GUARDRAILS.filter(function(g){return !only||g.status===only;});
      if(!list.length){
        m.innerHTML='<div class="gr-empty">'+(m.getAttribute('data-empty')||
          'Nothing here right now.')+'</div>';
        return;
      }
      m.innerHTML = mode==='compact'
        ? list.map(compact).join('')
        : '<div class="gr-grid">'+list.map(full).join('')+'</div>';
    });
    window.GUARDRAILS_RENDERED = document.querySelectorAll('.gr-card, .gr-line').length;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',render); else render();
})();
