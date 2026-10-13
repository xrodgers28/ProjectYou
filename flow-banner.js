/* ============================================================================
   Flow Time banner, v1.0, Oct 12, 2026
   Sits under Sleep Synopsis on the habit dashboard. Tap it and the week unfolds,
   the same way the trip banner does.

   Everything lives in a sealed shadow root because nine of the Flow Time style
   names (bar, cell, msg, sub, cnt, undo, shade, tiny and the headline) are
   already used elsewhere on this page. Nothing here can reach out, nothing out
   there can reach in.

   Showing only. Dragging, resizing, moving and parking are deliberately absent
   until the blocks are read from, and written back to, the database. The week
   below is Oct 5 to Oct 11, 2026, as Scott gave it in chat on Oct 11.

   Icons come from the shared py-icons.js the page already loads.
   Whether it was left open, and which layers are showing, are saved in
   page_prefs under page 'habit-modules', key 'flow-banner'.
   ========================================================================== */
(function(){
  var CSS = ":host{display:block;margin:9px 0;\n  --bg:#f4f6f9;--card:#fff;--sunk:#f1f3f8;--line:#e3e7ee;--hair:#eef0f5;\n  --ink:#1f2a44;--muted:#5b6472;--faint:#9aa6b4;--accent:#3f6f8f;\n  --flow:#A8841F;--flow-tint:#f0dd93;\n  --safari:#0F8A74;--safari-tint:#a4d6ca;\n  --nature:#2F7D53;--nature-tint:#cfe6d6;--mtn:#1C5B41;--lake:#4E93B8;--lake-tint:#cfe2ee;\n  --sky:#a6c4e8;--lilac:#c6b9e8;--peach:#f3c6a1;--neutral:#c3cbd8;\n  --warn:#a9741a;\n  --fh:Arial,Helvetica,sans-serif;--fb:Arial,Helvetica,sans-serif;\n  --fm:ui-monospace,'SF Mono',Menlo,Consolas,monospace;\n  font-family:var(--fb);font-size:14px;line-height:1.45;color:var(--ink)}\n*{box-sizing:border-box}\nbutton{font-family:inherit}\n\n/* the banner shell, folds like the travel banner */\n.bn{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}\n.face{all:unset;box-sizing:border-box;display:block;width:100%;cursor:pointer;padding:9px 12px 0}\n.face:focus-visible{outline:2px solid var(--accent);outline-offset:-3px}\n.fhead{display:flex;align-items:flex-start;gap:10px}\n.ftxt{min-width:0;flex:1 1 auto}\n.kick{font-family:var(--fm);font-size:9.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--faint);margin:0 0 1px}\nh2.ft{font-family:var(--fh);font-weight:700;font-size:21px;line-height:1.15;margin:0;letter-spacing:-.01em}\n.creed{margin:2px 0 0;font-family:var(--fh);font-style:italic;font-weight:400;color:var(--faint);font-size:clamp(11px,2.5vw,14px);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}\n.chv{flex:none;width:22px;height:22px;display:grid;place-items:center;color:var(--faint);transition:transform .25s ease;margin-top:3px}\n.bn.open .chv{transform:rotate(180deg);color:var(--ink)}\n.openhint{font-family:var(--fm);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);margin:5px 0 0;text-align:right}\n\n/* the six numbers */\n.bar{display:flex;flex-wrap:wrap;background:var(--card);border:1px solid var(--line);border-radius:11px;overflow:hidden;margin:8px 0 9px}\n.cell{background:var(--card);padding:7px 10px;min-width:0;flex:1 1 150px;display:flex;align-items:center;gap:10px;\n  border-left:1px solid var(--line);border-top:1px solid var(--line);margin-left:-1px;margin-top:-1px}\n.cell img{width:34px;height:34px;flex:none}\n.cell b{display:block;font-family:var(--fh);font-weight:700;font-size:19px;line-height:.96;font-variant-numeric:tabular-nums;white-space:nowrap}\n.cell b .u{display:inline;font-weight:400;font-size:.72em;letter-spacing:0;text-transform:none;margin:0 0 0 .18em;color:var(--muted)}\n.cell span{display:block;font-family:var(--fm);font-size:8.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);margin-top:2px}\n.cell.phoneonly{display:none}\n@media(max-width:700px){\n  .cell{display:none}\n  .cell.keep,.cell.phoneonly{display:flex}\n  h2.ft{font-size:19px}\n}\n\n/* the fold */\n.drop{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s ease}\n.bn.open .drop{grid-template-rows:1fr}\n.drop>.in{overflow:hidden;min-height:0}\n.pad{padding:0 12px 11px;border-top:1px solid var(--line);margin-top:1px}\n@media(prefers-reduced-motion:reduce){.drop,.chv{transition:none}}\n\n/* the week */\n.wkhead{display:flex;align-items:baseline;gap:10px;padding:9px 0 5px}\n.wkhead h3{font-family:var(--fh);font-weight:700;font-size:15px;margin:0}\n.wkhead .cnt{margin-left:auto;font-family:var(--fm);font-size:11px;color:var(--faint)}\n.canvas svg{display:block;width:100%;height:auto}\n.t-hr{font-family:var(--fm);font-size:11px;fill:var(--faint)}\n.t-day{font-family:var(--fm);font-size:12px;fill:var(--muted)}\n.t-day.on{fill:var(--ink);font-weight:700}\n.t-note{font-family:var(--fm);font-size:8.5px;fill:var(--faint);letter-spacing:.05em}\n\n/* layers, attached under the week */\n.layrow{display:flex;align-items:flex-start;gap:10px;margin-top:8px;padding-top:8px;border-top:1px solid var(--hair)}\n.allbtns{display:flex;flex-direction:column;gap:5px;flex:none}\n.allbtns .tiny{width:100%;text-align:center;padding:4px 10px}\n.layers{display:flex;gap:6px 7px;flex-wrap:wrap;flex:1 1 auto;min-width:0}\n.lay{display:inline-flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--card);\n  border-radius:999px;padding:5px 12px 5px 6px;font:inherit;font-size:13px;cursor:pointer;color:var(--muted)}\n.lay img{width:25px;height:25px;display:block;opacity:.4}\n.lay[aria-pressed=\"true\"]{border-color:var(--ink);color:var(--ink);font-weight:700;background:var(--sunk)}\n.lay[aria-pressed=\"true\"] img{opacity:1}\n.lay .mins{font-family:var(--fm);font-size:11px;color:var(--faint)}\n.tiny{border:1px solid var(--line);background:var(--card);border-radius:7px;padding:5px 11px;font-size:12.5px;cursor:pointer;color:var(--ink)}\nbutton:focus-visible,summary:focus-visible{outline:2px solid var(--accent);outline-offset:2px}\n\n/* the two shades under the week */\ndetails.shade{background:var(--card);border:1px solid var(--line);border-radius:11px;overflow:hidden;margin-top:8px}\ndetails.shade>summary{list-style:none;cursor:pointer;padding:9px 13px;display:flex;align-items:center;gap:10px;\n  font-family:var(--fh);font-weight:700;font-size:14px;user-select:none}\ndetails.shade>summary::-webkit-details-marker{display:none}\ndetails.shade>summary::before{content:\"\";width:7px;height:7px;border-right:2px solid var(--faint);border-bottom:2px solid var(--faint);\n  transform:rotate(-45deg);margin:0 2px;transition:transform .15s;flex:none}\ndetails.shade[open]>summary::before{transform:rotate(45deg)}\ndetails.shade>summary .cnt{margin-left:auto;font-family:var(--fm);font-size:11px;color:var(--faint);font-weight:400}\n.sbody{padding:0 14px 13px}\n\n.quotes{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:18px}\nblockquote{margin:0;padding-top:5px;border-top:2px solid var(--ink);min-width:0}\nblockquote p{margin:0 0 7px;font-size:15px;line-height:1.35;font-weight:700}\nblockquote cite{font-style:normal;font-family:var(--fm);font-size:9.5px;letter-spacing:.06em;color:var(--faint);display:block;line-height:1.5}\n.steps{display:grid;grid-template-columns:repeat(auto-fit,minmax(205px,1fr));gap:1px;background:var(--line);border:1px solid var(--line);border-radius:10px;overflow:hidden;margin-top:16px}\n.step{background:var(--card);padding:12px 14px;min-width:0}\n.step i{font-family:var(--fm);font-style:normal;font-size:9.5px;letter-spacing:.1em;color:var(--flow);display:block;margin-bottom:5px}\n.step b{display:block;font-size:13.5px;margin-bottom:2px}.step span{font-size:12.5px;color:var(--muted)}\n.callout{background:var(--flow-tint);color:var(--ink);padding:12px 15px;border-radius:9px;font-family:var(--fh);font-weight:700;font-size:15px;margin:15px 0 0}\n\ntable{width:100%;border-collapse:collapse;min-width:560px}\nth{font-family:var(--fm);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint);text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);font-weight:400}\ntd{padding:7px 10px;border-bottom:1px solid var(--hair);font-size:13px;vertical-align:middle}\ntr:last-child td{border-bottom:0}\n.scroll{overflow-x:auto}\n.tico{width:21px;height:21px;vertical-align:-6px;margin-right:7px}\n.empty{padding:16px;color:var(--faint);text-align:center;font-size:13px}\n.lbl{font-family:var(--fm);font-size:9.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--faint)}\n.readonly{font-family:var(--fm);font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:var(--faint);margin:6px 0 0;text-align:right}\n.foot{font-size:11.5px;color:var(--faint);border-top:1px solid var(--line);padding-top:8px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:9px}\n.foot .mono{font-family:var(--fm)}\n/* planned blocks: promises, never facts. Dotted, dim, no icon, italic label. */\n.t-plan{font-family:var(--fm);font-size:9px;font-style:italic;fill:var(--faint);letter-spacing:.03em}\n.ghost rect.inv{animation:gpulse 2.6s ease-in-out 3}\n@keyframes gpulse{0%,100%{stroke-opacity:.38;fill-opacity:.14}50%{stroke-opacity:.95;fill-opacity:.40}}\n.ghost{cursor:pointer}\n.ghost:hover rect.inv{stroke-opacity:1;fill-opacity:.42}\n.plan{cursor:pointer}\n@media(prefers-reduced-motion:reduce){.ghost rect.inv{animation:none;stroke-opacity:.72;fill-opacity:.26}}\n/* the Monday moment */\n.setwk{display:none;align-items:center;gap:10px;flex-wrap:wrap;background:var(--sunk);border:1px solid var(--line);\n  border-radius:10px;padding:9px 12px;margin:9px 0 0}\n.setwk.show{display:flex}\n.setwk b{font-family:var(--fh);font-size:13.5px}\n.setwk span{font-size:12.5px;color:var(--muted);min-width:0}\n.setwk .tiny{margin-left:auto;flex:none}\n.planline{font-family:var(--fm);font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--faint);margin:7px 0 0}\n.nosrc{font-family:var(--fm);font-size:11px;color:var(--faint);font-style:italic}\n/* drag a pill onto the week to place time */\n.lay.drg{cursor:grab;touch-action:none}\n.lay.drg:active{cursor:grabbing}\n.lay.lifted{opacity:.35}\n.plan,.ghost{touch-action:none}\n.flyer{position:fixed;z-index:9999;pointer-events:none;display:inline-flex;align-items:center;gap:7px;\n  border:1px solid var(--ink);background:var(--card);border-radius:999px;padding:5px 12px 5px 6px;\n  font-family:var(--fb);font-size:13px;font-weight:700;color:var(--ink);box-shadow:0 6px 18px rgba(31,42,68,.22);\n  transform:translate(-50%,-165%);opacity:.96}\n.flyer img{width:25px;height:25px;display:block}\n.flyer .when{font-family:var(--fm);font-size:11px;font-weight:400;color:var(--muted)}\n.dropping .canvas svg{outline:2px dashed var(--accent);outline-offset:3px;border-radius:6px}\n";
  var HTML = "<div class=\"bn\" id=\"bn\">\n  <button class=\"face\" id=\"face\" type=\"button\" aria-expanded=\"false\" aria-controls=\"drop\">\n    <div class=\"fhead\">\n      <div class=\"ftxt\">\n        <p class=\"kick\" id=\"kick\">Project YOU</p>\n        <h2 class=\"ft\">Flow Time</h2>\n        <p class=\"creed\" id=\"creed\"></p>\n      </div>\n      <span class=\"chv\" aria-hidden=\"true\"><svg width=\"15\" height=\"15\" viewBox=\"0 0 15 15\"><path d=\"M3 5.5 L7.5 10 L12 5.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg></span>\n    </div>\n    <div class=\"bar\" id=\"bar\"></div>\n    <p class=\"openhint\" id=\"openhint\">Tap to open the week</p>\n  </button>\n  <div class=\"drop\" id=\"drop\"><div class=\"in\"><div class=\"pad\">\n\n    <div class=\"setwk\" id=\"setwk\">\n      <b>Set the week</b>\n      <span id=\"setwk-sub\">Tap a dotted slot to promise yourself the time.</span>\n      <button class=\"tiny\" id=\"samelast\" type=\"button\" style=\"display:none\">Same as last week</button>\n    </div>\n\n    <div class=\"wkhead\"><h3>The week</h3><span class=\"cnt\" id=\"cnt-cal\"></span></div>\n    <div class=\"canvas\" id=\"grid\"></div>\n    <div class=\"layrow\">\n      <div class=\"allbtns\">\n        <button class=\"tiny\" id=\"all-on\" type=\"button\">All on</button>\n        <button class=\"tiny\" id=\"all-off\" type=\"button\">All off</button>\n      </div>\n      <div class=\"layers\" id=\"layers\"></div>\n    </div>\n    <p class=\"planline\" id=\"planline\"></p>\n    <p class=\"readonly\" id=\"ro\">Logged blocks are read only here. Change them on the Flow Time page.</p>\n\n    <details class=\"shade\" id=\"sh-why\">\n      <summary>Why this page exists</summary>\n      <div class=\"sbody\">\n        <div class=\"quotes\">\n          <blockquote><p>&ldquo;I get in the zone when I&rsquo;m interested in something, often focusing so deeply that everything else falls away.&rdquo;</p><cite>Your own ADHD Characteristics sheet</cite></blockquote>\n          <blockquote><p>&ldquo;Our minds are lost in useless thoughts almost 47 percent of the time.&rdquo;</p><cite>Project YOU deck, after Killingsworth and Gilbert, Science, 2010</cite></blockquote>\n          <blockquote><p>&ldquo;Work expands to fill the time available for its completion.&rdquo;</p><cite>Parkinson&rsquo;s Law, Reference Library</cite></blockquote>\n        </div>\n        <div class=\"steps\">\n          <div class=\"step\"><i>STEP 01</i><b>Ask &ldquo;when?&rdquo;</b><span>Every intention gets a time, not just a wish. Ali Alqaraghuli, in your Project YOU notes.</span></div>\n          <div class=\"step\"><i>STEP 02</i><b>Put it in a calendar slot</b><span>Timeboxing: assign the work to a named block. Zao-Sanders, Harvard Business Review, 2018.</span></div>\n          <div class=\"step\"><i>STEP 03</i><b>Shape the room for deep work</b><span>Phone away, door closed, same place each time. Environmental Health, Knowledge Base.</span></div>\n        </div>\n        <p class=\"callout\" id=\"callout\"></p>\n      </div>\n    </details>\n\n    <details class=\"shade\" id=\"sh-blk\">\n      <summary>Every block, by type <span class=\"cnt\" id=\"cnt-blk\"></span></summary>\n      <div class=\"sbody\">\n        <div class=\"scroll\"><div id=\"log-wrap\"></div></div>\n        <p class=\"lbl\" style=\"margin:15px 0 7px\">Parking lot</p>\n        <div class=\"scroll\"><div id=\"park-wrap\"></div></div>\n      </div>\n    </details>\n\n    <p class=\"foot\"><span>Times Eastern. Days run 2 a.m. to 2 a.m., so a Saturday night block stays on Saturday past midnight.</span><span class=\"mono\" id=\"vstamp\"></span></p>\n  </div></div></div>\n</div>\n";

  function mount(){
    var host=document.getElementById('flowBannerHost');
    if(!host||host.getAttribute('data-mounted'))return;
    host.setAttribute('data-mounted','1');
    var R=host.attachShadow({mode:'open'});
    var st=document.createElement('style'); st.textContent=CSS; R.appendChild(st);
    var wrap=document.createElement('div'); wrap.innerHTML=HTML; R.appendChild(wrap);
    try{ build(R); }catch(e){ if(window.console)console.error('[flow banner]',e); }
  }

  function build(R){
    var VER='Flow Time banner v2.1';
    /* A different line each time the page loads. Written here rather than quoted from a
       book, so nothing is reproduced; say the word and I will swap in sourced quotations. */
    var LINES=[
      /* yours, pulled from your own files: the identity lines, the ADHD sheet,
         the Knowledge Base and the Reference Library */
      'Attention is your truest sense of wealth.',
      'I notice where my attention goes.',
      'Five minutes a day beats an hour once a week.',
      'Hard enough to hold interest, easy enough to finish.',
      'Work expands to fill the time available.',
      'Minds wander 47 percent of the time.',
      'For ADHD there are two times: now, and not now.',
      /* mine */
      'Flow needs a block with your name on it.',
      'Protect the morning, the week protects itself.',
      'Attention is the one budget nobody refills.',
      'Nobody drifts into their best work.',
      'Depth beats duration, every week.',
      'Make the room before you need it.'
    ];
    var DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    var FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    var NS='http://www.w3.org/2000/svg';
    var WIN0=360, WIN1=1440;
    var ICONS=window.ICONS||{};

    var LAYERS=[
     {k:'flow',     n:'FlowTime',               ic:'airplanemode', col:'var(--flow)',    strong:true},
     {k:'safari',   n:'Local Safari',           ic:'safari',       col:'var(--safari)',  strong:true},
     {k:'nature',   n:'Time in Nature',         ic:'outdoors',     col:'var(--nature)',  strong:true},
     {k:'dad',      n:'Being a Good Dad',       ic:'dad',          col:'var(--sky)',     strong:false},
     {k:'asa',      n:'Asa Date',               ic:'date',         col:'var(--lilac)',   strong:false},
     {k:'studio',   n:'Remote Creative Studio', ic:'remotework',   col:'var(--peach)',   strong:false},
     {k:'transport',n:'Transport Modes',        ic:'bike',         col:'var(--neutral)', strong:false},
     {k:'commute',  n:'Commute Time',           ic:'commute',      col:'var(--neutral)', strong:false}
    ];
    var LMAP={}; LAYERS.forEach(function(l){LMAP[l.k]=l;});

    function b(d,s,m,k,t,note){return {id:k+'-'+d+'-'+s+'-'+(uid2++),day:d,s:s,m:m,k:k,t:t,note:note||''};}
    var uid2=0;

    /* Logged blocks are facts, read from day_blocks.
       Planned blocks are promises, read from flow_plan, a table of their own so that
       no total, wheel or streak anywhere can ever pick planned minutes up. */
    var state={log:[],plan:[],park:[]};
    var WEEKD=null;          /* the seven dates the board is showing, Monday first */
    var OWNWEEK=false;       /* true when we had to work the week out ourselves */
    var LASTWK=[];           /* copyable blocks from the week before, for Same as last week */
    var LOADED=false, LOADERR='';

    /* ---------- which week is the board on ---------- */
    function isoOf(dt){return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate());}
    function boardWeek(){
      /* weekDays() is the dashboard's own helper. Both files are plain scripts, so it is
         shared. Using it means this banner can never disagree with the week picker. */
      try{
        if(typeof weekDays==='function'){
          var a=weekDays();
          if(a&&a.length===7&&/^\d{4}-\d{2}-\d{2}$/.test(a[0])){OWNWEEK=false;return a;}
        }
      }catch(e){}
      OWNWEEK=true;
      var t=new Date(), off=(t.getDay()+6)%7, out=[];
      for(var i=0;i<7;i++)out.push(isoOf(new Date(t.getFullYear(),t.getMonth(),t.getDate()-off+i)));
      return out;
    }
    function dayIdx(iso){ if(!WEEKD)return -1; for(var i=0;i<7;i++)if(WEEKD[i]===iso)return i; return -1; }
    function shortDate(iso){
      var p=String(iso).split('-'),M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      return M[(+p[1])-1]+' '+(+p[2]);
    }
    function todayISO(){
      try{ if(window.PY&&typeof PY.today==='function')return PY.today(); }catch(e){}
      return isoOf(new Date());
    }

    /* ---------- which layer does a logged block belong to ---------- */
    function layerOf(r){
      var lt=String(r.title||'').toLowerCase(), p=String(r.pill||'').toLowerCase();
      if(p==='commute'||/\bcommute\b/.test(lt))return 'commute';
      if(/safari/.test(lt))return 'safari';
      /* Walk and Run are both outdoor foot time, so both land in Time in Nature */
      if(/\bwalk\b|\brun\b|\u{1F6B6}|\u{1F3C3}/u.test(lt))return 'nature';
      if(/\bride\b|\u{1F6B4}/u.test(lt)||/train platform|subway|\bbus\b|ferry|omny/.test(lt))return 'transport';
      if(p==='asa'||/åsa|\basa\b|date night/.test(lt))return 'asa';
      /* time with Max is logged on its own pill, and it is the Being a Good Dad layer */
      if(p==='max'||/good dad|\bdad\b/.test(lt))return 'dad';
      if(/\bflow\b|deep work|focus block/.test(lt))return 'flow';
      if(/remote creative studio/.test(lt))return 'studio';
      return null;
    }

    /* ---------- loading ---------- */
    function rowsToLog(rows){
      var out=[];
      (rows||[]).forEach(function(r){
        var k=layerOf(r); if(!k)return;
        var d=dayIdx(r.day); if(d<0)return;
        var st=+r.start_min, mn=+r.mins;
        if(!(st>=0)||!(mn>0))return;
        out.push(b(d,st,mn,k,String(r.title||'').replace(/^[^\wÀ-ɏ(]*\s*/,'').trim()||LMAP[k].n));
      });
      return out;
    }
    function loadWeek(done){
      WEEKD=boardWeek();
      state.log=[]; state.plan=[]; LASTWK=[]; LOADED=false; LOADERR='';
      if(!window.sb){LOADERR='no database connection';LOADED=true;done();return;}
      var W=WEEKD, prevA=addISO(W[0],-7), prevB=addISO(W[0],-1);
      var qs=[
        window.sb.from('day_blocks').select('day,start_min,mins,title,cat,pill,tag')
          .gte('day',W[0]).lte('day',W[6]).not('start_min','is',null).limit(2000),
        window.sb.from('flow_plan').select('id,day,start_min,mins,kind,label,auto')
          .eq('week_start',W[0]).limit(500),
        window.sb.from('day_blocks').select('day,start_min,mins,title,cat,pill,tag')
          .gte('day',prevA).lte('day',prevB).not('start_min','is',null).limit(2000)
      ];
      Promise.all(qs.map(function(q){return Promise.resolve(q).then(function(r){return r;},function(e){return {error:e};});}))
      .then(function(res){
        if(res[0]&&res[0].error)LOADERR='could not read the logged blocks';
        state.log=rowsToLog(res[0]&&res[0].data);
        var pr=(res[1]&&res[1].data)||[];
        state.plan=pr.map(function(r){
          var d=dayIdx(r.day); if(d<0)return null;
          return {pid:r.id,day:d,s:+r.start_min,m:+r.mins,k:r.kind,t:r.label||'',auto:!!r.auto,
                  id:'plan-'+r.id,iso:r.day};
        }).filter(Boolean);
        /* last week, only the layers worth copying forward */
        var lw=(res[2]&&res[2].data)||[];
        lw.forEach(function(r){
          var k=layerOf(r); if(PLANNABLE.indexOf(k)<0)return;
          var p=String(r.day).split('-'), dt=new Date(Date.UTC(+p[0],+p[1]-1,+p[2]));
          var d=(dt.getUTCDay()+6)%7;
          if(+r.start_min>=0&&+r.mins>0)LASTWK.push({day:d,s:+r.start_min,m:+r.mins,k:k,t:String(r.title||'')});
        });
        LOADED=true; done();
      },function(){LOADERR='could not reach the database';LOADED=true;done();});
    }
    function addISO(iso,n){
      var p=String(iso).split('-').map(Number);
      var d=new Date(Date.UTC(p[0],p[1]-1,p[2]+n));
      return d.toISOString().slice(0,10);
    }

    /* ---------- planning ----------
       Three guardrails, built in rather than remembered:
         1. a planned block is drawn dotted and dim, never like a logged one
         2. planned minutes are kept out of every figure in the number bar and the rail
         3. plans are scoped to their own week, so they expire instead of becoming history */
    /* Layers you can plan. Commute and Transport are left out on purpose: those
       happen to you and get measured, they are not something you choose in advance. */
    var PLANNABLE=['flow','studio','asa','dad','safari','nature'];
    /* How long a block lands when you drag its pill onto the week. */
    var DROPMINS={flow:90,studio:180,asa:180,dad:120,safari:180,nature:30};
    var INVITE={
      flow:   {s:480, m:90,  days:[0,1,2,3,4], why:'Three of four flow sessions started at 8 a.m.'},
      asa:    {s:1140,m:180, days:[5,6],       why:'Asa Date lands on a weekend.'},
      studio: {s:600, m:180, days:[0,1,2,3,4], why:'The studio day only happens if it has a slot.'},
      dad:    {s:1080,m:120, days:[0,1,2,3,4], why:'Evening time with Max.'}
    };
    /* Exactly one invitation on the board at a time. Thirty blinking slots is thirty
       competing cues; one is a cue. The queue decides which. */
    var INVORDER=['flow','studio','asa'];
    var SHORT={flow:'Flow Time',studio:'Studio day',asa:'Asa Date',dad:'Dad time'};
    function hasAny(k,d){
      var f=state.log.some(function(x){return x.k===k&&(d==null||x.day===d);});
      var p=state.plan.some(function(x){return x.k===k&&(d==null||x.day===d);});
      return f||p;
    }
    function dayBusyAt(d,st,m){
      function hit(x){return x.day===d&&x.s<st+m&&st<x.s+x.m;}
      return state.log.some(hit)||state.plan.some(hit);
    }
    function nowMin(){
      try{
        var f=new Intl.DateTimeFormat('en-US',{timeZone:'America/New_York',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date());
        var p=f.split(':'); return (+p[0])*60+(+p[1]);
      }catch(e){var d=new Date();return d.getHours()*60+d.getMinutes();}
    }
    function theInvitation(){
      if(!WEEKD)return null;
      var tISO=todayISO(), nm=nowMin();
      for(var i=0;i<INVORDER.length;i++){
        var k=INVORDER[i], cfg=INVITE[k];
        if(!P.on[k])continue;
        if(hasAny(k,null))continue;               /* already real or already promised this week */
        for(var j=0;j<cfg.days.length;j++){
          var d=cfg.days[j];
          if(WEEKD[d]<tISO)continue;              /* never invite into a day that has gone */
          if(WEEKD[d]===tISO&&cfg.s+cfg.m<=nm)continue;  /* nor into an hour that has gone */
          if(dayBusyAt(d,cfg.s,cfg.m))continue;
          return {day:d,s:cfg.s,m:cfg.m,k:k,why:cfg.why};
        }
      }
      return null;
    }

    /* ---------- drag a pill onto the week, or a placed block to a new slot ----------
       One engine for both. A short press is still a tap, so tapping a placed block
       to take it back keeps working. Nothing here can create a logged block: every
       drop writes a promise, never a fact. */
    var DRAG=null, DROPPED=0, SNAP=15;

    function gridSvg(){ var b=R.getElementById('grid'); return b?b.querySelector('svg'):null; }
    function toSvg(cx,cy){
      var sv=gridSvg(); if(!sv||!sv.getScreenCTM)return null;
      var m=sv.getScreenCTM(); if(!m)return null;
      var pt=sv.createSVGPoint(); pt.x=cx; pt.y=cy;
      try{ var o=pt.matrixTransform(m.inverse()); return {x:o.x,y:o.y}; }catch(e){ return null; }
    }
    /* where on the week is the pointer, snapped to a day and a quarter hour */
    function slotAt(cx,cy,mins){
      var pnt=toSvg(cx,cy); if(!pnt)return null;
      if(pnt.x<GL-8||pnt.x>GR+8||pnt.y<GT-14||pnt.y>GB+14)return null;
      var d=Math.floor((pnt.x-GL)/COLW); if(d<0)d=0; if(d>6)d=6;
      var mn=WIN0+((pnt.y-GT)/(GB-GT))*(WIN1-WIN0);
      mn=Math.round(mn/SNAP)*SNAP;
      if(mn+mins>WIN1)mn=WIN1-mins;
      if(mn<WIN0)mn=WIN0;
      return {day:d,s:mn};
    }
    function clearPreview(){ var g=R.getElementById('prevg'); if(g&&g.parentNode)g.parentNode.removeChild(g); }
    function showPreview(k,slot,mins){
      clearPreview();
      var sv=gridSvg(); if(!sv||!slot)return;
      var l=LMAP[k]||{col:'var(--neutral)',n:k};
      var g=mk('g',{id:'prevg','pointer-events':'none'},sv);
      var y0=Y(slot.s), bh=Math.max(Y(slot.s+mins)-y0,9);
      var bx=colX(slot.day)+3, bw=COLW-8;
      var gone=WEEKD&&WEEKD[slot.day]<todayISO();
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:4,
        fill:gone?'var(--neutral)':l.col,'fill-opacity':gone?.12:.30,
        stroke:gone?'var(--neutral)':l.col,'stroke-width':1.6,'stroke-dasharray':'4 3'},g);
      if(bh>=13)mk('text',{x:(bx+5).toFixed(1),y:(y0+11).toFixed(1),class:'t-plan'},g,
        gone?'that day has gone':fmtT(slot.s));
    }
    function makeFlyer(k){
      var l=LMAP[k]||{n:k,ic:null};
      var el=document.createElement('div'); el.className='flyer';
      if(ICONS[l.ic]){var im=document.createElement('img');im.src=ICONS[l.ic];im.alt='';el.appendChild(im);}
      el.appendChild(h('span',{text:SHORT[k]||l.n}));
      var w=h('span',{class:'when',text:''}); el.appendChild(w);
      R.appendChild(el);
      return {el:el,when:w};
    }

    function beginDrag(opt,ev){
      if(DRAG)return;
      ev.stopPropagation();
      DRAG={k:opt.k,mins:opt.mins,plan:opt.plan||null,src:opt.src||null,
            x0:ev.clientX,y0:ev.clientY,moved:false,slot:null,fly:null};
      window.addEventListener('pointermove',dragMove,true);
      window.addEventListener('pointerup',dragUp,true);
      window.addEventListener('pointercancel',dragUp,true);
    }
    function dragMove(ev){
      if(!DRAG)return;
      var dx=ev.clientX-DRAG.x0, dy=ev.clientY-DRAG.y0;
      if(!DRAG.moved&&dx*dx+dy*dy<36)return;      /* under 6px is still a tap */
      if(!DRAG.moved){
        DRAG.moved=true;
        DRAG.fly=makeFlyer(DRAG.k);
        var bn=R.getElementById('bn'); if(bn)bn.classList.add('dropping');
        if(DRAG.src)DRAG.src.classList.add('lifted');
      }
      if(ev.cancelable)ev.preventDefault();
      DRAG.fly.el.style.left=ev.clientX+'px';
      DRAG.fly.el.style.top=ev.clientY+'px';
      var sl=slotAt(ev.clientX,ev.clientY,DRAG.mins);
      DRAG.slot=sl;
      DRAG.fly.when.textContent = sl ? (DAYS[sl.day]+' '+fmtT(sl.s)) : 'drop it on the week';
      showPreview(DRAG.k,sl,DRAG.mins);
    }
    function dragUp(ev){
      if(!DRAG)return;
      var d=DRAG; DRAG=null;
      window.removeEventListener('pointermove',dragMove,true);
      window.removeEventListener('pointerup',dragUp,true);
      window.removeEventListener('pointercancel',dragUp,true);
      if(d.fly&&d.fly.el.parentNode)d.fly.el.parentNode.removeChild(d.fly.el);
      if(d.src)d.src.classList.remove('lifted');
      var bn=R.getElementById('bn'); if(bn)bn.classList.remove('dropping');
      clearPreview();
      if(!d.moved)return;                      /* a tap: let the click handler have it */
      DROPPED=Date.now();                      /* and swallow the click that follows a drag */
      ev.stopPropagation(); if(ev.cancelable)ev.preventDefault();
      if(!d.slot){ if(d.plan)render(); return; }
      if(WEEKD&&WEEKD[d.slot.day]<todayISO()){ render(); return; }   /* never into a day that has gone */
      if(d.plan) planMove(d.plan,d.slot.day,d.slot.s,function(){render();});
      else planAdd(d.slot.day,d.slot.s,d.mins,d.k,null,false,function(){render();});
    }
    function justDragged(){ return (Date.now()-DROPPED)<350; }

    function planMove(x,day,st,then){
      var iso=WEEKD[day], od=x.day, os=x.s;
      x.day=day; x.s=st; x.iso=iso;
      if(!window.sb||String(x.pid).indexOf('tmp')===0){ if(then)then(); return; }
      try{
        window.sb.from('flow_plan').update({day:iso,start_min:st,week_start:WEEKD[0],
          updated_at:new Date().toISOString()}).eq('id',x.pid).then(
          function(r){ if(r&&r.error){x.day=od;x.s=os;} if(then)then(); },
          function(){ x.day=od; x.s=os; if(then)then(); });
      }catch(e){ if(then)then(); }
    }

    function planMinutes(){var t=0;state.plan.forEach(function(x){t+=x.m;});return t;}

    function planAdd(d,st,m,k,label,auto,then){
      var iso=WEEKD[d];
      var row={week_start:WEEKD[0],day:iso,start_min:st,mins:m,kind:k,label:label||LMAP[k].n,auto:!!auto};
      if(!window.sb){ if(then)then(false); return; }
      window.sb.from('flow_plan').upsert(row,{onConflict:'day,start_min,kind'}).select('id').then(function(r){
        var id=(r&&r.data&&r.data[0]&&r.data[0].id)||('tmp'+Date.now());
        state.plan.push({pid:id,day:d,s:st,m:m,k:k,t:row.label,auto:row.auto,id:'plan-'+id,iso:iso});
        if(then)then(true);
      },function(){ if(then)then(false); });
    }
    function planDel(x,then){
      if(!window.sb||String(x.pid).indexOf('tmp')===0){
        state.plan=state.plan.filter(function(y){return y!==x;}); if(then)then(true); return;
      }
      window.sb.from('flow_plan').delete().eq('id',x.pid).then(function(){
        state.plan=state.plan.filter(function(y){return y!==x;}); if(then)then(true);
      },function(){ if(then)then(false); });
    }
    /* Asa Date is the one near-certain thing with no source of its own, so a fresh
       week gets it laid down for you. Being a Good Dad is NOT seeded: it does not repeat. */
    function seedWeek(then){
      if(!WEEKD||state.plan.length){ then(); return; }
      if(WEEKD[6]<todayISO()){ then(); return; }      /* never seed a week that has gone */
      if(hasAny('asa',null)){ then(); return; }
      planAdd(5,INVITE.asa.s,INVITE.asa.m,'asa','Asa Date',true,function(){then();});
    }
    function sameAsLastWeek(then){
      var pick=LASTWK.filter(function(x){return x.k==='flow'||x.k==='studio';});
      if(!pick.length){then(0);return;}
      var n=0, left=pick.length;
      pick.forEach(function(x){
        planAdd(x.day,x.s,x.m,x.k,x.t,false,function(ok){ if(ok)n++; if(!--left)then(n); });
      });
    }

    /* what the banner remembers: whether it was open, and which layers are showing */
    var P={open:false, on:{}};
    LAYERS.forEach(function(l){P.on[l.k]=true;});
    var LKEY='py-flow-banner';

    function loadPrefs(done){
      var fell=false;
      try{var r=JSON.parse(localStorage.getItem(LKEY)||'null'); if(r){P.open=!!r.open; if(r.on)P.on=r.on;}}catch(e){}
      if(!window.sb){done();return;}
      try{
        window.sb.from('page_prefs').select('value').eq('page','habit-modules').eq('key','flow-banner').maybeSingle()
          .then(function(res){
            if(!fell&&res&&res.data&&res.data.value){
              var v=res.data.value; P.open=!!v.open; if(v.on)P.on=v.on;
            }
            done();
          },function(){done();});
      }catch(e){done();}
    }
    function savePrefs(){
      try{localStorage.setItem(LKEY,JSON.stringify(P));}catch(e){}
      if(!window.sb)return;
      try{
        window.sb.from('page_prefs').upsert(
          {page:'habit-modules',key:'flow-banner',value:P,updated_at:new Date().toISOString()},
          {onConflict:'page,key'}).then(function(){},function(){});
      }catch(e){}
    }

    function mk(t,a,p,x){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(x!=null)e.textContent=x;if(p)p.appendChild(e);return e;}
    function h(t,a,ks){var e=document.createElement(t);for(var k in (a||{})){if(k==='text')e.textContent=a[k];else if(k==='class')e.className=a[k];else e.setAttribute(k,a[k]);}(ks||[]).forEach(function(c){e.appendChild(c);});return e;}
    var pad=function(n){return String(n).padStart(2,'0');};
    function fmtT(mn){var m=((mn%1440)+1440)%1440,hh=Math.floor(m/60),mm=m%60,ap=hh>=12?'pm':'am';return (hh%12||12)+(mm?':'+pad(mm):'')+ap;}
    function fmtLong(m){var hh=Math.floor(m/60),mm=m%60;if(!hh)return mm+' min';return hh+' h'+(mm?' '+mm+' min':'');}
    function fmtShort(m){if(!m)return '0';var hh=Math.floor(m/60),mm=m%60;if(!hh)return mm+'m';return hh+'h'+(mm?' '+mm+'m':'');}
    function hrLab(c){return (c%12||12)+(c>=12?'p':'a');}

    function model(){
      var byLayer={},clip=0,all=0;
      LAYERS.forEach(function(l){byLayer[l.k]=0;});
      state.log.forEach(function(x){byLayer[x.k]=(byLayer[x.k]||0)+x.m; all+=x.m; if(x.s+x.m>WIN1)clip+=x.s+x.m-WIN1;});
      var fd=DAYS.map(function(){return 0;});
      state.log.filter(function(x){return x.k==='flow';}).forEach(function(x){fd[x.day]+=x.m;});
      /* planned minutes are deliberately NOT added to byLayer, total or all */
      var pLayer={}; LAYERS.forEach(function(l){pLayer[l.k]=0;});
      state.plan.forEach(function(x){pLayer[x.k]=(pLayer[x.k]||0)+x.m;});
      return {byLayer:byLayer,fd:fd,total:byLayer.flow||0,all:all,clip:clip,pLayer:pLayer,planned:planMinutes()};
    }

    /* ---------- geometry ---------- */
    var W=1000, GL=54, GR=988, GT=38, GB=562, COLW=(GR-GL)/7, HT=GB+26;
    function Y(mn){return GT+(Math.max(WIN0,Math.min(WIN1,mn))-WIN0)/(WIN1-WIN0)*(GB-GT);}
    function colX(d){return GL+d*COLW;}
    var uid=0;

    function iconAt(s,name,cx,cy,sz,op){
      if(!ICONS[name])return null;
      return mk('image',{href:ICONS[name],x:(cx-sz/2).toFixed(1),y:(cy-sz/2).toFixed(1),width:sz,height:sz,
        opacity:(op==null?1:op),preserveAspectRatio:'xMidYMid meet'},s);
    }

    function draw(M){
      var box=R.getElementById('grid'); box.textContent='';
      var s=mk('svg',{viewBox:'0 0 '+W+' '+HT,role:'img','aria-label':'Week grid, days across the top, 6am to midnight down the side'},box);
      var defs=mk('defs',{},s);

      for(var hh=6;hh<=24;hh++){
        var y=Y(hh*60),maj=(hh%3===0);
        mk('line',{x1:GL,y1:y.toFixed(1),x2:GR,y2:y.toFixed(1),stroke:maj?'var(--line)':'var(--hair)','stroke-width':1},s);
        if(maj)mk('text',{x:GL-9,y:(y+3.9).toFixed(1),'text-anchor':'end',class:'t-hr'},s,hrLab(hh%24));
      }
      for(var d=0;d<7;d++){
        var x=colX(d);
        if(d%2)mk('rect',{x:x.toFixed(1),y:GT,width:COLW.toFixed(1),height:GB-GT,fill:'var(--sunk)'},s);
        mk('line',{x1:x.toFixed(1),y1:GT,x2:x.toFixed(1),y2:GB,stroke:'var(--hair)','stroke-width':1},s);
        mk('text',{x:(x+COLW/2).toFixed(1),y:16,'text-anchor':'middle',class:'t-day'+(M.fd[d]?' on':'')},s,DAYS[d]);
        mk('text',{x:(x+COLW/2).toFixed(1),y:29,'text-anchor':'middle',class:'t-hr'},s,WEEKD?shortDate(WEEKD[d]):'');
      }
      mk('rect',{x:GL,y:GT,width:GR-GL,height:GB-GT,fill:'none',stroke:'var(--line)','stroke-width':1},s);

      var vis=state.log.filter(function(x){return P.on[x.k];});
      var pos={};
      for(var dd=0;dd<7;dd++){
        var day=vis.filter(function(x){return x.day===dd;}).sort(function(a,bb){return a.s-bb.s||bb.m-a.m;});
        var ends=[];
        day.forEach(function(x){var ln=0;while(ends[ln]!=null&&ends[ln]>x.s)ln++;ends[ln]=x.s+x.m;pos[x.id]={lane:ln};});
        var n=Math.max(1,ends.length);
        day.forEach(function(x){var w=(COLW-6)/n;pos[x.id].x=colX(dd)+3+pos[x.id].lane*w;pos[x.id].w=w;});
      }
      ['dad','asa','studio','transport','commute'].forEach(function(k){
        if(!P.on[k])return;
        state.log.filter(function(x){return x.k===k&&pos[x.id];}).forEach(function(x){drawSoft(s,x,LMAP[k],pos[x.id]);});
      });
      if(P.on.nature)state.log.filter(function(x){return x.k==='nature'&&pos[x.id];}).forEach(function(x){drawNature(s,defs,x,pos[x.id]);});
      if(P.on.safari)state.log.filter(function(x){return x.k==='safari'&&pos[x.id];}).forEach(function(x){drawSafari(s,x,pos[x.id]);});
      if(P.on.flow)state.log.filter(function(x){return x.k==='flow'&&pos[x.id];}).forEach(function(x){drawFlow(s,defs,x,pos[x.id]);});

      /* promises sit under the facts, so a fact always reads on top */
      state.plan.forEach(function(x){ if(P.on[x.k])drawPlan(s,x); });
      var inv=theInvitation(); if(inv)drawGhost(s,inv);

      mk('text',{x:GR,y:HT-7,'text-anchor':'end',class:'t-note'},s,fmtLong(M.total).toUpperCase()+' IN FLOW');
    }

    /* A planned block. Dotted, dim, no icon, italic label: it must never be
       mistaken for something that happened. Tap it to take the promise back. */
    function drawPlan(s,x){
      var l=LMAP[x.k]||{col:'var(--neutral)',n:x.k};
      var y0=Y(x.s), y1=Y(x.s+x.m), bh=Math.max(y1-y0,6);
      var bx=colX(x.day)+3, bw=COLW-8;
      var gone=WEEKD&&WEEKD[x.day]<todayISO();
      var g=mk('g',{class:'plan'},s);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:4,
        fill:l.col,'fill-opacity':gone?.07:.15,stroke:l.col,'stroke-width':1.2,
        'stroke-dasharray':'4 3','stroke-opacity':gone?.3:.7},g);
      if(bh>=13&&!gone)mk('text',{x:(bx+5).toFixed(1),y:(y0+11).toFixed(1),class:'t-plan'},g,
        'planned'+(bh>=26?' · '+(SHORT[x.k]||l.n):''));
      mk('title',{},g,'Planned, not counted · '+l.n+' · '+FULL[x.day]+' '+fmtT(x.s)+' to '+fmtT(x.s+x.m)+
        ' · '+fmtLong(x.m)+(gone?' · the day has gone':' · drag to move it, tap to take it back'));
      if(!gone){
        g.addEventListener('click',function(ev){
          ev.stopPropagation();
          if(justDragged())return;           /* it was moved, not tapped away */
          planDel(x,function(){render();});
        });
        g.addEventListener('pointerdown',function(ev){
          if(ev.button)return;
          beginDrag({k:x.k,mins:x.m,plan:x},ev);
        });
        g.setAttribute('title','');
      }
    }

    /* The invitation. One slot, pulsing three times and then resting. */
    function drawGhost(s,inv){
      var l=LMAP[inv.k]||{col:'var(--neutral)',n:inv.k};
      var y0=Y(inv.s), y1=Y(inv.s+inv.m), bh=Math.max(y1-y0,18);
      var bx=colX(inv.day)+3, bw=COLW-8;
      var g=mk('g',{class:'ghost',role:'button',tabindex:'0'},s);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:4,class:'inv',
        fill:l.col,stroke:l.col,'stroke-width':1.4,'stroke-dasharray':'5 4'},g);
      mk('text',{x:(bx+bw/2).toFixed(1),y:(y0+bh/2-2).toFixed(1),'text-anchor':'middle',class:'t-plan'},g,'+ '+(SHORT[inv.k]||l.n));
      if(bh>=34)mk('text',{x:(bx+bw/2).toFixed(1),y:(y0+bh/2+10).toFixed(1),'text-anchor':'middle',class:'t-plan'},g,fmtT(inv.s));
      mk('title',{},g,'Tap to plan '+l.n+' here · '+FULL[inv.day]+' '+fmtT(inv.s)+' to '+fmtT(inv.s+inv.m)+' · '+inv.why);
      function take(ev){ev.stopPropagation();planAdd(inv.day,inv.s,inv.m,inv.k,null,false,function(){render();});}
      g.addEventListener('click',take);
      g.addEventListener('keydown',function(ev){if(ev.key==='Enter'||ev.key===' ')take(ev);});
    }

    function drawSoft(s,x,l,Pp){
      var y0=Y(x.s),y1=Y(x.s+x.m),bh=Math.max(y1-y0,3.5),bx=Pp.x,bw=Pp.w-2;
      var g=mk('g',{},s);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:3,fill:l.col,'fill-opacity':.55},g);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:3,height:bh.toFixed(1),fill:l.col},g);
      var cap=(l.k==='commute')?38:32;
      if(bh>=15&&bw>=20)iconAt(g,l.ic,bx+bw/2,y0+bh/2,Math.min(cap,bh-3,bw-8),.9);
      mk('title',{},g,l.n+' · '+FULL[x.day]+' '+fmtT(x.s)+' to '+fmtT(x.s+x.m)+' · '+fmtLong(x.m)+(x.t?' · '+x.t:''));
    }
    function drawSafari(s,x,Pp){
      var y0=Y(x.s),y1=Y(x.s+x.m),bh=Math.max(y1-y0,4),bx=Pp.x,bw=Pp.w-2;
      var g=mk('g',{},s);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:3,fill:'var(--safari)','fill-opacity':.2},g);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:3,fill:'none',stroke:'var(--safari)','stroke-width':1.5},g);
      iconAt(g,'safari',bx+bw/2,y0+bh/2,Math.min(40,bh-4,bw-6),1);
      mk('title',{},g,'Local Safari · '+FULL[x.day]+' '+fmtT(x.s)+' to '+fmtT(x.s+x.m)+' · '+fmtLong(x.m));
    }
    function drawNature(s,defs,x,Pp){
      var y0=Y(x.s),y1=Y(x.s+x.m),bh=Math.max(y1-y0,7),bx=Pp.x,bw=Pp.w-2,g=mk('g',{},s);
      var r=Math.min(4,bh/2), base=y0+bh-0.5, top=Math.max(bh-1.5,4);
      var cid='fbnc'+(++uid);
      var cp=mk('clipPath',{id:cid},defs);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:r},cp);
      var sc=mk('g',{'clip-path':'url(#'+cid+')'},g);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),fill:'var(--nature-tint)','fill-opacity':.9},sc);
      var mw=bw*0.34, mx=bx+1;
      var pk1=mx+mw*0.36, h1=top;
      mk('path',{d:'M'+mx.toFixed(1)+' '+base.toFixed(1)+' L'+pk1.toFixed(1)+' '+(base-h1).toFixed(1)+
          ' L'+(mx+mw*0.72).toFixed(1)+' '+base.toFixed(1)+' Z',fill:'var(--mtn)'},sc);
      var pk2=mx+mw*0.78, h2=top*0.68;
      mk('path',{d:'M'+(mx+mw*0.44).toFixed(1)+' '+base.toFixed(1)+' L'+pk2.toFixed(1)+' '+(base-h2).toFixed(1)+
          ' L'+(mx+mw*1.12).toFixed(1)+' '+base.toFixed(1)+' Z',fill:'var(--mtn)','fill-opacity':.72},sc);
      if(h1>=11){
        var capH=h1*0.26, capW=mw*0.36*(capH/h1);
        mk('path',{d:'M'+(pk1-capW).toFixed(1)+' '+(base-h1+capH).toFixed(1)+' L'+pk1.toFixed(1)+' '+(base-h1).toFixed(1)+
            ' L'+(pk1+capW).toFixed(1)+' '+(base-h1+capH).toFixed(1)+' Z',fill:'var(--card)','fill-opacity':.9},sc);
      }
      var tx0=bx+bw*0.37, tw=bw*0.30, th=top*0.66, step=Math.max(5,tw/3.2), k=0;
      for(var tx=tx0;tx<tx0+tw;tx+=step){
        var hh2=th*(k%2?0.78:1), hw=Math.max(2,step*0.34);
        mk('path',{d:'M'+tx.toFixed(1)+' '+base.toFixed(1)+' L'+(tx+hw).toFixed(1)+' '+(base-hh2).toFixed(1)+
            ' L'+(tx+hw*2).toFixed(1)+' '+base.toFixed(1)+' Z',fill:'var(--nature)'},sc);
        k++;
      }
      var lx=bx+bw*0.66, lw=bx+bw-lx, lh=Math.max(3,top*0.30), ly=base-lh;
      mk('rect',{x:lx.toFixed(1),y:ly.toFixed(1),width:lw.toFixed(1),height:(base-ly+1).toFixed(1),fill:'var(--lake-tint)'},sc);
      mk('rect',{x:lx.toFixed(1),y:(base-lh*0.42).toFixed(1),width:lw.toFixed(1),height:(lh*0.42+1).toFixed(1),
        fill:'var(--lake)','fill-opacity':.28},sc);
      mk('line',{x1:lx.toFixed(1),y1:ly.toFixed(1),x2:(lx+lw).toFixed(1),y2:ly.toFixed(1),stroke:'var(--lake)','stroke-width':.9},sc);
      if(lh>=7){
        for(var w=0;w<2;w++){
          var wy=ly+3+w*3.2; if(wy>base-1)break;
          mk('path',{d:'M'+(lx+3).toFixed(1)+' '+wy.toFixed(1)+' q2.6 -1.4 5.2 0 t5.2 0',
            fill:'none',stroke:'var(--lake)','stroke-width':.9,'stroke-opacity':.6,'stroke-linecap':'round'},sc);
        }
      }
      mk('line',{x1:bx.toFixed(1),y1:base.toFixed(1),x2:(bx+bw).toFixed(1),y2:base.toFixed(1),
        stroke:'var(--nature)','stroke-width':1,'stroke-opacity':.5},sc);
      mk('title',{},g,'Time in Nature · '+FULL[x.day]+' '+fmtT(x.s)+' to '+fmtT(x.s+x.m)+' · '+fmtLong(x.m)+(x.t?' · '+x.t:''));
    }
    function drawFlow(s,defs,x,Pp){
      var y0=Y(x.s),y1=Y(x.s+x.m),bh=Math.max(y1-y0,6),bx=Pp.x+1,bw=Pp.w-4;
      var taper=Math.min(14,bh/3), f=taper/bh, gid='fbt'+(++uid), mid='fbm'+uid;
      var lg=mk('linearGradient',{id:gid,x1:0,y1:y0.toFixed(1),x2:0,y2:y1.toFixed(1),gradientUnits:'userSpaceOnUse'},defs);
      mk('stop',{offset:0,'stop-color':'#fff','stop-opacity':0},lg);
      mk('stop',{offset:f.toFixed(3),'stop-color':'#fff','stop-opacity':1},lg);
      mk('stop',{offset:(1-f).toFixed(3),'stop-color':'#fff','stop-opacity':1},lg);
      mk('stop',{offset:1,'stop-color':'#fff','stop-opacity':0},lg);
      var msk=mk('mask',{id:mid},defs);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),fill:'url(#'+gid+')'},msk);
      var g=mk('g',{mask:'url(#'+mid+')'},s);
      mk('rect',{x:bx.toFixed(1),y:y0.toFixed(1),width:bw.toFixed(1),height:bh.toFixed(1),rx:3,
        fill:'var(--flow-tint)','fill-opacity':.34},g);
      var tight=bh<34;
      var gap=tight?9:6.5, amp=Math.min(tight?1.6:2.6,bw/9), i=0;
      for(var lx=bx+3.5;lx<bx+bw-2;lx+=gap){
        var d1='M'+lx.toFixed(1)+' '+y0.toFixed(1);
        var segs=Math.max(2,Math.round(bh/16));
        for(var q=1;q<=segs;q++){
          var yA=y0+bh*(q-0.5)/segs, yB=y0+bh*q/segs;
          var off=(q%2? amp : -amp)*(i%2?1:-1);
          d1+=' Q'+(lx+off).toFixed(1)+' '+yA.toFixed(1)+' '+lx.toFixed(1)+' '+yB.toFixed(1);
        }
        mk('path',{d:d1,fill:'none',stroke:'var(--flow)','stroke-width':1.1,'stroke-opacity':.35,'stroke-linecap':'round'},g);
        i++;
      }
      if(bh>=34&&bw>=26)iconAt(s,'airplanemode',bx+bw/2,y0+bh/2,Math.min(52,bh-8,bw-6),.95);
      mk('title',{},g,'FlowTime · '+FULL[x.day]+' '+fmtT(x.s)+' to '+fmtT(x.s+x.m)+' · '+fmtLong(x.m)+(x.note?' · '+x.note:''));
      if(x.s+x.m>WIN1){
        var cut=mk('path',{d:'M'+bx.toFixed(1)+' '+(GB-5)+' l'+(bw/2).toFixed(1)+' 5 l'+(bw/2).toFixed(1)+' -5',
          fill:'none',stroke:'var(--warn)','stroke-width':2,'stroke-linejoin':'round'},s);
        mk('title',{},cut,fmtLong(x.s+x.m-WIN1)+' of this runs past midnight, outside this view.');
      }
    }

    function figure(mins){
      var hh=Math.floor(mins/60), mm=mins%60, out=[];
      function row(n,unit){
        var bb=h('b',{});
        bb.appendChild(document.createTextNode(String(n)));
        bb.appendChild(h('span',{class:'u',text:unit}));
        return bb;
      }
      if(hh)out.push(row(hh,'h'));
      if(mm||!hh)out.push(row(mm,'min'));
      return out;
    }

    function chrome(M){
      var bar=R.getElementById('bar'); bar.textContent='';
      var cells=[{ic:'airplanemode',m:M.total,l:'flowtime',keep:true},
                 {ic:'outdoors',m:M.byLayer.nature||0,l:'time in nature'},
                 {ic:'safari',m:M.byLayer.safari||0,l:'local safari'},
                 {ic:'dad',m:M.byLayer.dad||0,l:'being a good dad'},
                 {ic:'date',m:M.byLayer.asa||0,l:'asa date'},
                 {ic:'commute',m:(M.byLayer.commute||0)+(M.byLayer.transport||0),l:'commute and transport'},
                 {ic:null,m:M.all,l:'tracked in all',phone:true}];
      cells.forEach(function(c){
        var cell=h('div',{class:'cell'+(c.keep?' keep':'')+(c.phone?' phoneonly':'')});
        if(c.ic&&ICONS[c.ic]){var im=document.createElement('img');im.src=ICONS[c.ic];im.alt='';cell.appendChild(im);}
        var txt=h('div',{});
        figure(c.m).forEach(function(n){txt.appendChild(n);});
        txt.appendChild(h('span',{text:c.l}));
        cell.appendChild(txt);
        cell.setAttribute('title',c.l.charAt(0).toUpperCase()+c.l.slice(1)+': '+fmtLong(c.m));
        bar.appendChild(cell);
      });

      var lw=R.getElementById('layers'); lw.textContent='';
      LAYERS.forEach(function(l){
        var btn=h('button',{class:'lay',type:'button'});
        btn.setAttribute('aria-pressed',P.on[l.k]?'true':'false');
        if(ICONS[l.ic]){var im=document.createElement('img');im.src=ICONS[l.ic];im.alt='';btn.appendChild(im);}
        btn.appendChild(h('span',{text:l.n}));
        var real=M.byLayer[l.k]||0, prom=M.pLayer[l.k]||0;
        var lab = real ? fmtShort(real) : (prom ? fmtShort(prom)+' planned' : (PLANNABLE.indexOf(l.k)>=0?'nothing yet':'none'));
        var mn=h('span',{class:'mins',text:lab});
        if(!real&&prom)mn.setAttribute('style','font-style:italic');
        btn.appendChild(mn);
        var canPlan=PLANNABLE.indexOf(l.k)>=0;
        btn.setAttribute('title','Tap to show or hide this layer.'
          +(canPlan?' Drag it onto the week to plan '+fmtLong(DROPMINS[l.k]||60)+' of it.':'')
          +(prom?' '+fmtLong(prom)+' planned here, which is not counted.':''));
        btn.addEventListener('click',function(){
          if(justDragged())return;            /* the drag already did the work */
          P.on[l.k]=!P.on[l.k];savePrefs();render();
        });
        if(canPlan){
          btn.classList.add('drg');
          btn.addEventListener('pointerdown',function(ev){
            if(ev.button)return;
            beginDrag({k:l.k,mins:DROPMINS[l.k]||60,src:btn},ev);
          });
        }
        lw.appendChild(btn);
      });

      /* the week, named from the board itself so the two can never disagree */
      var kick=R.getElementById('kick');
      if(WEEKD){
        var yr=String(WEEKD[6]).slice(0,4);
        kick.textContent='Project YOU · '+shortDate(WEEKD[0])+' to '+shortDate(WEEKD[6])+', '+yr+
          (OWNWEEK?' · this week':'');
      }
      R.getElementById('cnt-cal').textContent=fmtLong(M.total)+' in flow';
      R.getElementById('cnt-blk').textContent=state.log.length+' logged'+(state.plan.length?', '+state.plan.length+' planned':'');
      R.getElementById('callout').textContent='Before Monday: your flow keeps starting at 8 a.m. Put a standing block there on the mornings that are empty.';
      /* planned minutes, kept visibly apart from everything that is counted */
      var pl=R.getElementById('planline');
      pl.textContent = M.planned ? (fmtLong(M.planned)+' planned, not counted in any total') : '';

      var ro=R.getElementById('ro');
      var missing=PLANNABLE.filter(function(k){return !M.byLayer[k];}).map(function(k){return LMAP[k].n;});
      ro.textContent = LOADERR
        ? ('Showing nothing: '+LOADERR+'.')
        : (missing.length
            ? ('Nothing logged this week for '+missing.join(', ')+'. Those are the ones you can plan.')
            : 'Logged blocks are read only here. Change them on the Flow Time page.');

      /* the Monday moment: only on a week you can still act on, and only before you have planned it */
      var strip=R.getElementById('setwk'), sl=R.getElementById('samelast');
      var liveWeek = WEEKD && WEEKD[6]>=todayISO();
      var mine = state.plan.filter(function(x){return !x.auto;}).length;
      var showStrip = liveWeek && !mine && LOADED;
      strip.classList.toggle('show',!!showStrip);
      var copyable=LASTWK.filter(function(x){return x.k==='flow'||x.k==='studio';});
      sl.style.display = (showStrip&&copyable.length) ? '' : 'none';
      sl.textContent = copyable.length ? ('Same as last week ('+copyable.length+')') : 'Same as last week';
      R.getElementById('setwk-sub').textContent = copyable.length
        ? 'Take last week’s blocks, or drag a pill below onto the week.'
        : 'Drag any pill below onto the week, or tap the dotted slot.';

      R.getElementById('vstamp').textContent=VER;
    }

    function tbl(list,wrap,empty){
      wrap.textContent='';
      var all=state[list];
      if(!all.length){wrap.appendChild(h('div',{class:'empty',text:empty}));return;}
      var order={}; LAYERS.forEach(function(l,i){order[l.k]=i;});
      var items=all.slice().sort(function(a,bb){
        var oa=order[a.k]==null?99:order[a.k], ob=order[bb.k]==null?99:order[bb.k];
        return oa-ob || (a.day*1440+a.s)-(bb.day*1440+bb.s);
      });
      var th=h('thead',{},[h('tr',{},['','Day','When','Length','Detail'].map(function(t){return h('th',{text:t});}))]);
      var tb=h('tbody'), lastK=null;
      items.forEach(function(x){
        if(x.k!==lastK){
          lastK=x.k;
          var LL=LMAP[x.k]||{n:x.k,ic:null};
          var grp=items.filter(function(y){return y.k===x.k;});
          var mins=grp.reduce(function(a2,y){return a2+y.m;},0);
          var hr=h('tr'); hr.setAttribute('style','background:var(--sunk)');
          var hc=h('td'); hc.setAttribute('colspan','5');
          hc.setAttribute('style','font-weight:700;font-size:13px;padding:8px 10px');
          if(ICONS[LL.ic]){var hi=document.createElement('img');hi.className='tico';hi.src=ICONS[LL.ic];hi.alt='';hc.appendChild(hi);}
          hc.appendChild(document.createTextNode(LL.n));
          var tot=h('span',{text:grp.length+(grp.length===1?' block':' blocks')+'  ·  '+fmtLong(mins)});
          tot.setAttribute('style','float:right;font-family:var(--fm);font-size:11.5px;font-weight:400;color:var(--muted)');
          hc.appendChild(tot);
          hr.appendChild(hc); tb.appendChild(hr);
        }
        var tr=h('tr'), td0=h('td');
        td0.setAttribute('style','color:var(--faint);font-family:var(--fm);font-size:11px;padding-left:20px');
        td0.appendChild(document.createTextNode('└'));
        tr.appendChild(td0);
        tr.appendChild(h('td',{text:DAYS[x.day]+(WEEKD?' '+shortDate(WEEKD[x.day]):'')}));
        tr.appendChild(h('td',{text:fmtT(x.s)+' to '+fmtT(x.s+x.m)}));
        tr.appendChild(h('td',{text:fmtLong(x.m)}));
        tr.appendChild(h('td',{text:(x.t||'')+(x.note?'  ('+x.note+')':'')}));
        tb.appendChild(tr);
      });
      wrap.appendChild(h('table',{},[th,tb]));
    }

    function setOpen(v){
      P.open=!!v;
      R.getElementById('bn').classList.toggle('open',P.open);
      var f=R.getElementById('face');
      f.setAttribute('aria-expanded',P.open?'true':'false');
      R.getElementById('openhint').textContent=P.open?'Tap to fold it away':'Tap to open the week';
    }

    function render(){
      uid=0; var M=model();
      chrome(M); draw(M);
      tbl('log',R.getElementById('log-wrap'),'Nothing here yet.');
      tbl('park',R.getElementById('park-wrap'),'Nothing parked.');
    }

    R.getElementById('face').addEventListener('click',function(){setOpen(!P.open);savePrefs();});
    R.getElementById('all-on').addEventListener('click',function(){LAYERS.forEach(function(l){P.on[l.k]=true;});savePrefs();render();});
    R.getElementById('all-off').addEventListener('click',function(){LAYERS.forEach(function(l){P.on[l.k]=false;});savePrefs();render();});
    /* the two shades live inside the fold, so their clicks must not close the banner */
    ['sh-why','sh-blk'].forEach(function(id){
      var d=R.getElementById(id); if(d)d.addEventListener('click',function(e){e.stopPropagation();});
    });

    R.getElementById('creed').textContent=LINES[Math.floor(Math.random()*LINES.length)];

    /* Same as last week: one tap instead of five drags. Dragging five blocks onto an
       empty week is five decisions on a Monday; tapping one and nudging it is one. */
    R.getElementById('samelast').addEventListener('click',function(ev){
      ev.stopPropagation();
      var btn=ev.currentTarget; btn.disabled=true; btn.textContent='Laying it down...';
      sameAsLastWeek(function(n){ btn.disabled=false; render(); });
    });
    R.getElementById('setwk').addEventListener('click',function(e){e.stopPropagation();});

    var BUSY=false;
    function refresh(){
      if(BUSY)return; BUSY=true;
      loadWeek(function(){ seedWeek(function(){ BUSY=false; render(); }); });
    }

    /* The board owns the week. When the picker moves, its label changes, and this
       follows it. Nothing in the dashboard had to be touched to make that work. */
    function watchWeek(){
      var lab=document.getElementById('weekLabel');
      if(!lab)return;
      var seen=lab.textContent;
      try{
        new MutationObserver(function(){
          if(lab.textContent===seen)return;
          seen=lab.textContent;
          setTimeout(refresh,250);   /* let the board finish its own load first */
        }).observe(lab,{childList:true,characterData:true,subtree:true});
      }catch(e){}
    }

    loadPrefs(function(){
      setOpen(P.open);
      render();          /* frame first, so the banner never flashes empty */
      refresh();
      watchWeek();
    });

  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
  else mount();
})();
