/* Design E: Stack Rings (design file ref 8). v1.0 Oct 3, 2026. Draws only; every fact comes from the engine state. */
(function () {
  function pt(cx, cy, r, deg) { var t = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function arc(cx, cy, r1, r2, a1, a2) {
    var p1 = pt(cx, cy, r2, a1), p2 = pt(cx, cy, r2, a2), p3 = pt(cx, cy, r1, a2), p4 = pt(cx, cy, r1, a1), l = (a2 - a1) > 180 ? 1 : 0;
    return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + r2 + ' ' + r2 + ' 0 ' + l + ' 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) +
      ' L' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' A' + r1 + ' ' + r1 + ' 0 ' + l + ' 0 ' + p4[0].toFixed(1) + ' ' + p4[1].toFixed(1) + ' Z';
  }
  PYHT.register({
    id: 'rings',
    render: function (st, size, P) {
      var W = size === 'phone' ? 112 : 150, hide = P.setting('ring_hide_stacks', [4]);
      var list = st.stacks.filter(function (s) { return hide.indexOf(s.idx) < 0; })
        .sort(function (a, b) { return (b.total - a.total) || (a.idx - b.idx); });
      var h = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:6px;font-family:Arial,Helvetica,sans-serif">';
      list.forEach(function (s) {
        var n = s.total, d = s.done, full = d === n, svg = '';
        s.habits.forEach(function (x, i) {
          var gap = n > 1 ? 3 : 0, a1 = i * 360 / n + gap, a2 = (i + 1) * 360 / n - gap, lit = !x.done;
          if (n === 1) { a1 = 0; a2 = 359.9; }
          svg += '<path d="' + arc(60, 60, 34, 52, a1, a2) + '" fill="' + (lit ? x.pastel : '#eef1f6') + '"/>';
          var p = pt(60, 60, 43, (a1 + a2) / 2);
          svg += '<image href="' + P.icon(x) + '" x="' + (p[0] - 7) + '" y="' + (p[1] - 7) + '" width="14" height="14" ' + (lit ? '' : 'style="filter:grayscale(1);opacity:.38"') + '/>';
        });
        svg += '<text x="60" y="68" text-anchor="middle" font-size="22" font-weight="300" fill="' + (full ? '#c68a2e' : '#3f6f8f') + '">' + d + '/' + n + '</text>';
        h += '<div style="text-align:center;border:1px solid ' + (full ? '#c68a2e' : '#e3e7ee') + ';border-radius:12px;padding:8px 4px;background:#fff;' +
          (full ? 'box-shadow:0 0 0 3px rgba(198,138,46,.18)' : '') + '"><svg viewBox="0 0 120 120" width="' + W + '" style="max-width:100%">' + svg + '</svg>' +
          '<div style="font-weight:800;font-size:12.5px;color:#1f2a44">' + P.esc(s.long) + '</div>' +
          '<div style="font-size:11px;color:#5b6472">' + (full ? 'Complete' : (n - d) + ' to go') + '</div></div>';
      });
      return h + '</div>';
    }
  });
})();
