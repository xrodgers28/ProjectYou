/* Design D: Two-Ring Wheel (design file ref 2). v1.1 Oct 3, 2026. Animation-ready: each habit piece is tagged data-h. Draws only; every fact comes from the engine state. */
(function () {
  var CX = 160, CY = 160;
  function pt(cx, cy, r, deg) { var t = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function arc(cx, cy, r1, r2, a1, a2) {
    var p1 = pt(cx, cy, r2, a1), p2 = pt(cx, cy, r2, a2), p3 = pt(cx, cy, r1, a2), p4 = pt(cx, cy, r1, a1), l = (a2 - a1) > 180 ? 1 : 0;
    return 'M' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1) + ' A' + r2 + ' ' + r2 + ' 0 ' + l + ' 1 ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1) +
      ' L' + p3[0].toFixed(1) + ' ' + p3[1].toFixed(1) + ' A' + r1 + ' ' + r1 + ' 0 ' + l + ' 0 ' + p4[0].toFixed(1) + ' ' + p4[1].toFixed(1) + ' Z';
  }
  function dw(n) { return String(n).length * .556; }
  PYHT.register({
    id: 'wheel',
    render: function (st, size, P) {
      var c = st.counts, s = '', W = P.SIZES[size] || 330;
      var core = st.habits.filter(function (h) { return h.core; }), sec = st.habits.filter(function (h) { return !h.core; });
      function ic(h, x, y, sz, on) {
        return '<image href="' + P.icon(h) + '" x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" ' +
          (on ? '' : 'style="filter:grayscale(1);opacity:.38"') + '/>';
      }
      [[core, 98, 132, 22], [sec, 70, 90, 16]].forEach(function (q) {
        var list = q[0], n = list.length;
        list.forEach(function (h, i) {
          var a1 = i * 360 / n + 1, a2 = (i + 1) * 360 / n - 1, lit = !h.done;
          s += '<g data-h="' + P.esc(h.n) + '"><path d="' + arc(CX, CY, q[1], q[2], a1, a2) + '" fill="' + (lit ? h.pastel : '#eef1f6') + '" stroke="#fff" stroke-width="1"/>';
          var p = pt(CX, CY, (q[1] + q[2]) / 2, (a1 + a2) / 2);
          s += ic(h, p[0], p[1], q[3], lit) + '</g>';
        });
      });
      var total = c.ct + c.st, done = c.cd + c.sd, s1 = 28, s2 = 28, lw = dw(done) * s1, rw = dw(total) * s2, gap = 14,
          x0 = CX - (lw + gap + rw) / 2, by = CY - 2;
      s += '<text x="' + x0.toFixed(1) + '" y="' + by + '" font-size="' + s1 + '" font-weight="300" fill="#3f6f8f">' + done + '</text>';
      s += '<line x1="' + (x0 + lw + 3).toFixed(1) + '" y1="' + (by + 1) + '" x2="' + (x0 + lw + gap - 3).toFixed(1) + '" y2="' + (by - 17) + '" stroke="#3f6f8f" stroke-width=".7"/>';
      s += '<text x="' + (x0 + lw + gap).toFixed(1) + '" y="' + by + '" font-size="' + s2 + '" font-weight="300" fill="#3f6f8f">' + total + '</text>';
      s += '<text x="' + CX + '" y="' + (CY + 18) + '" text-anchor="middle" font-size="8.5" font-weight="800" fill="#5b6472" letter-spacing="1.6">HABITS DONE</text>' +
        '<text x="' + CX + '" y="' + (CY + 32) + '" text-anchor="middle" font-size="8.5" font-weight="700" fill="#9aa6b4">' + (c.ct - c.cd) + ' core left</text>';
      return '<div style="background:#fff;border-radius:14px;padding:6px 4px 8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif"><svg viewBox="20 20 280 280" width="' + W +
        '" style="max-width:100%;display:block;margin:0 auto;overflow:visible">' + s + '</svg></div>';
    }
  });
})();
