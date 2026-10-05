/* Design E: Stack Rings (design file ref 8). v1.3 Oct 5, 2026 (four levels shown without touching the wheel: E = outer rim, thick for Core, thin for Secondary, dotted for Bonus; I = letter badges C, S, B. Rings stay one per stack. Weekly habits sit in a small This week strip, never counted in a ring. A short Features note sits at the bottom of each card.)
   Animation-ready: each habit piece is tagged data-h. Draws only; every fact comes from the engine state. */
(function () {
  function pt(cx, cy, r, deg) { var t = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function f(x) { return x.toFixed(1); }
  function arc(cx, cy, r1, r2, a1, a2) {
    var p1 = pt(cx, cy, r2, a1), p2 = pt(cx, cy, r2, a2), p3 = pt(cx, cy, r1, a2), p4 = pt(cx, cy, r1, a1), l = (a2 - a1) > 180 ? 1 : 0;
    return 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' A' + r2 + ' ' + r2 + ' 0 ' + l + ' 1 ' + f(p2[0]) + ' ' + f(p2[1]) +
      ' L' + f(p3[0]) + ' ' + f(p3[1]) + ' A' + r1 + ' ' + r1 + ' 0 ' + l + ' 0 ' + f(p4[0]) + ' ' + f(p4[1]) + ' Z';
  }
  function line(r, a1, a2) { var p1 = pt(60, 60, r, a1), p2 = pt(60, 60, r, a2), l = (a2 - a1) > 180 ? 1 : 0; return 'M' + f(p1[0]) + ' ' + f(p1[1]) + ' A' + r + ' ' + r + ' 0 ' + l + ' 1 ' + f(p2[0]) + ' ' + f(p2[1]); }
  var LV = { core: '#3f6f8f', secondary: '#3f6f8f', bonus: '#b8801f' }, LT = { core: 'C', secondary: 'S', bonus: 'B' };
  function legend(mode) {
    var t = mode === 'rim'
      ? '<b>Features:</b> the rim around each segment shows its level. <b>Thick</b> = Core, <b>thin</b> = Secondary, <b>dotted</b> = Bonus. Weekly habits are in the This week row and never count in a ring.'
      : '<b>Features:</b> the small badge on each segment shows its level. <b>C</b> = Core (solid), <b>S</b> = Secondary, <b>B</b> = Bonus (dashed). Weekly habits are in the This week row and never count in a ring.';
    return '<div style="grid-column:1/-1;font-size:10.5px;line-height:1.45;color:#5b6472;border-top:1px solid #e3e7ee;padding:8px 6px 2px">' + t + '</div>';
  }
  function make(id, letterName, mode) {
    PYHT.register({
      id: id,
      render: function (st, size, P) {
        var W = size === 'phone' ? 112 : 150, hide = P.setting('ring_hide_stacks', [4]);
        var list = st.stacks.filter(function (s) { return hide.indexOf(s.idx) < 0; })
          .sort(function (a, b) { return (b.total - a.total) || (a.idx - b.idx); });
        var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:6px;font-family:Arial,Helvetica,sans-serif">';
        list.forEach(function (s) {
          var n = s.total, d = s.done, full = d === n, svg = '';
          s.habits.forEach(function (x, i) {
            var gap = n > 1 ? 3 : 0, a1 = i * 360 / n + gap, a2 = (i + 1) * 360 / n - gap, lit = !x.done, am = (a1 + a2) / 2, lv = x.lvl === 'core' ? 'core' : (x.lvl === 'bonus' ? 'bonus' : 'secondary'), extra = '';
            if (n === 1) { a1 = 0; a2 = 359.9; am = 180; }
            if (mode === 'rim') {
              var c = lit ? x.color : '#cfd5de';
              if (n === 1) { extra = '<circle cx="60" cy="60" r="56.5" fill="none" stroke="' + c + '" stroke-width="' + (lv === 'core' ? 4.2 : 2) + '"' + (lv === 'bonus' ? ' stroke-dasharray="0.1 4.4" stroke-linecap="round"' : '') + '/>'; }
              else if (lv === 'core') extra = '<path d="' + line(56.5, a1, a2) + '" fill="none" stroke="' + c + '" stroke-width="4.2"/>';
              else if (lv === 'secondary') extra = '<path d="' + line(56.5, a1, a2) + '" fill="none" stroke="' + c + '" stroke-width="2"/>';
              else extra = '<path d="' + line(56.5, a1 + 2, a2 - 2) + '" fill="none" stroke="' + c + '" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="0.1 4.4"/>';
            } else {
              var bp = pt(60, 60, 59, am), bc = LV[lv];
              extra = '<circle cx="' + f(bp[0]) + '" cy="' + f(bp[1]) + '" r="5.2" fill="' + (lv === 'core' ? bc : '#fff') + '" stroke="' + bc + '" stroke-width="1.2"' + (lv === 'bonus' ? ' stroke-dasharray="2 1.4"' : '') + '/><text x="' + f(bp[0]) + '" y="' + f(bp[1] + 2.6) + '" text-anchor="middle" font-size="7" font-weight="800" fill="' + (lv === 'core' ? '#fff' : bc) + '">' + LT[lv] + '</text>';
            }
            svg += '<g data-h="' + P.esc(x.n) + '"><path d="' + arc(60, 60, 34, 52, a1, a2) + '" fill="' + (lit ? x.pastel : '#eef1f6') + '"/>';
            var p = pt(60, 60, 43, am);
            svg += '<image href="' + P.icon(x) + '" x="' + (p[0] - 7) + '" y="' + (p[1] - 7) + '" width="14" height="14" ' + (lit ? '' : 'style="filter:grayscale(1);opacity:.38"') + '/>' + extra + '</g>';
          });
          svg += '<text x="60" y="68" text-anchor="middle" font-size="22" font-weight="300" fill="' + (full ? '#c68a2e' : '#3f6f8f') + '">' + d + '/' + n + '</text>';
          h += '<div style="text-align:center;border:1px solid ' + (full ? '#c68a2e' : '#e3e7ee') + ';border-radius:12px;padding:8px 4px;background:#fff;' +
            (full ? 'box-shadow:0 0 0 3px rgba(198,138,46,.18)' : '') + '"><svg viewBox="-6 -6 132 132" width="' + W + '" style="max-width:100%">' + svg + '</svg>' +
            '<div style="font-weight:800;font-size:12.5px;color:#1f2a44">' + P.esc(s.long) + '</div>' +
            '<div style="font-size:11px;color:#5b6472">' + (full ? 'Complete' : (n - d) + ' to go') + '</div></div>';
        });
        var wk = st.weekly || [];
        if (wk.length) {
          h += '<div style="grid-column:1/-1;text-align:center;border:1px solid #e3e7ee;border-radius:12px;padding:8px 6px;background:#fff"><div style="font-size:10.5px;font-weight:800;letter-spacing:.08em;color:#5b6472;margin-bottom:6px">THIS WEEK &middot; ' + st.counts.wd + ' of ' + st.counts.wt + '</div><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">';
          wk.forEach(function (x) {
            h += '<span data-h="' + P.esc(x.n) + '" title="' + P.esc(x.n) + '" style="width:30px;height:30px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:2px solid ' + (x.done ? '#eef1f6' : x.color) + ';background:' + (x.done ? '#eef1f6' : x.pastel) + '"><img alt="" src="' + P.icon(x) + '" width="16" height="16" ' + (x.done ? 'style="filter:grayscale(1);opacity:.38"' : '') + '></span>';
          });
          h += '</div></div>';
        }
        return h + legend(mode) + '</div>';
      }
    });
  }
  make('rings', 'Stack Rings', 'rim');
  make('rings-badges', 'Stack Rings: Letter Badges', 'badge');
})();
