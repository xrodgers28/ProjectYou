/* Design B: Heap Ring, Soft Matte, tube-style icons (design file ref 42B-B). v1.0 Oct 3, 2026.
   Draws only; every fact comes from the engine state. Open marbles ride the top of the groove and rest
   on one long flap hinged at its left end; finished marbles heap at the bottom in grey. */
(function () {
  var N = 0;
  function P(cx, cy, r, deg) { var t = (deg - 90) * Math.PI / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; }
  function circD(cx, cy, r) { return 'M' + (cx - r) + ',' + cy + ' a' + r + ',' + r + ' 0 1,0 ' + (2 * r) + ',0 a' + r + ',' + r + ' 0 1,0 ' + (-2 * r) + ',0 Z '; }
  function mixc(c, v, t) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(x) { return Math.round(x + (v - x) * t); } return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  function T(x, y, txt, sz, fill, wt, anc, ls) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" fill="' + fill + '" font-weight="' + (wt || 700) + '" text-anchor="' + (anc || 'middle') + '" ' + (ls ? 'letter-spacing="' + ls + '" ' : '') + '>' + txt + '</text>';
  }
  function settle(list, cx, cy, Rin, Rout, rc, seed, gate, ov, pull) {
    var rnd = function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    var b = list.map(function (h) { var ang = 180 + (rnd() - .5) * 80, rr = (Rin + Rout) / 2 + (rnd() - .5) * (Rout - Rin - 2 * rc), p = P(cx, cy, rr, ang); return { h: h, r: rc, x: p[0], y: p[1] }; });
    function clamp(o) { var dx = o.x - cx, dy = o.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, mx = Rout - o.r - 1, mn = Rin + o.r + 1; if (d > mx) { o.x = cx + dx / d * mx; o.y = cy + dy / d * mx; } else if (d < mn) { o.x = cx + dx / d * mn; o.y = cy + dy / d * mn; } if (o.y < cy + gate) o.y = cy + gate; }
    for (var it = 0; it < 1500; it++) {
      b.forEach(function (o) { o.y += .8; o.x += (cx - o.x) * pull; clamp(o); });
      for (var pass = 0; pass < 3; pass++) { for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) { var a = b[i], c = b[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || .01, min = (a.r + c.r) * ov; if (d < min) { var k = (min - d) / 2 / d; a.x -= dx * k; a.y -= dy * k; c.x += dx * k; c.y += dy * k; } } b.forEach(clamp); }
    }
    return b;
  }
  function settleTop(list, cx, cy, Ri, Ro, r) {
    var n = list.length || 1;
    var b = list.map(function (h, i) { var a = -80 + 160 * (i + .5) / n, p = P(cx, cy, (Ri + Ro) / 2 + ((i % 2) ? -9 : 9), a); return { h: h, r: r, x: p[0], y: p[1] }; });
    function clamp(o) { var dx = o.x - cx, dy = o.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1, mx = Ro - o.r - 1, mn = Ri + o.r + 1; if (d > mx) { o.x = cx + dx / d * mx; o.y = cy + dy / d * mx; } else if (d < mn) { o.x = cx + dx / d * mn; o.y = cy + dy / d * mn; } var fl = cy - 9 - o.r; if (o.y > fl) o.y = fl; }
    for (var it = 0; it < 3000; it++) {
      b.forEach(function (o) { var dx = o.x - cx, dy = o.y - cy, d = Math.sqrt(dx * dx + dy * dy) || 1; o.x += -dy / d * .9; o.y += dx / d * .9; clamp(o); });
      for (var pass = 0; pass < 3; pass++) { for (var i = 0; i < b.length; i++) for (var j = i + 1; j < b.length; j++) { var a = b[i], c = b[j], dx = c.x - a.x, dy = c.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || .01, min = (a.r + c.r) + .8; if (d < min) { var k = (min - d) / 2 / d; a.x -= dx * k; a.y -= dy * k; c.x += dx * k; c.y += dy * k; } } b.forEach(clamp); }
    }
    return b;
  }
  PYHT.register({
    id: 'heap',
    render: function (st, size, PY) {
      var u = 'hp' + (++N), W = PY.SIZES[size] || 330, cx = 160, cy = 160, Ro = 152, Ri = 78, r = 15, s = '';
      var defs = '<defs><filter id="' + u + 'b1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.1"/></filter>' +
        '<filter id="' + u + 'b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter>' +
        '<filter id="' + u + 'b3" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4.5"/></filter>' +
        '<linearGradient id="' + u + 'vsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>' +
        '<clipPath id="' + u + 'gc"><path clip-rule="evenodd" fill-rule="evenodd" d="' + circD(cx, cy, Ro) + circD(cx, cy, Ri) + '"/></clipPath>' +
        '<linearGradient id="' + u + 'ge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#5c5c64"/></linearGradient>' +
        '<linearGradient id="' + u + 'gi" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a7a82"/><stop offset="1" stop-color="#000"/></linearGradient></defs>';
      /* the groove */
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + ((Ro + Ri) / 2) + '" fill="none" stroke="#09090b" stroke-width="' + (Ro - Ri) + '"/>';
      s += '<g clip-path="url(#' + u + 'gc)"><path fill-rule="evenodd" d="M-60,-60H400V400H-60Z ' + circD(cx, cy, Ro) + '" fill="#000" opacity=".9" transform="translate(0,9)" filter="url(#' + u + 'b3)"/><circle cx="' + cx + '" cy="' + cy + '" r="' + Ri + '" fill="#000" opacity=".7" transform="translate(0,9)" filter="url(#' + u + 'b3)"/></g>';
      s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + Ro + '" fill="none" stroke="url(#' + u + 'ge)" stroke-width="3"/><circle cx="' + cx + '" cy="' + cy + '" r="' + Ri + '" fill="#1d1d21" stroke="url(#' + u + 'gi)" stroke-width="3"/>';
      /* dial ticks */
      for (var i = 0; i < 60; i++) { var big = i % 5 === 0, p1 = P(cx, cy, big ? Ri - 15 : Ri - 10, i * 6), p2 = P(cx, cy, Ri - 4, i * 6); s += '<line x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" stroke="#8d8d97" stroke-width="' + (big ? 1.5 : .7) + '" opacity=".75"/>'; }
      var M = 0;
      function marble(x, y, h, dim) {
        x = +x.toFixed(1); y = +y.toFixed(1); var id = u + 'm' + (++M), a = PY.art(h), card = a.type === 'svg', base = card ? a.color : null, o = '';
        var g = dim ? '<stop offset="0" stop-color="#dcdce2"/><stop offset=".3" stop-color="#b0b0ba"/><stop offset=".66" stop-color="#77777f"/><stop offset="1" stop-color="#34343b"/>'
          : base ? '<stop offset="0" stop-color="' + mixc(base, 255, .58) + '"/><stop offset=".3" stop-color="' + mixc(base, 255, .16) + '"/><stop offset=".66" stop-color="' + base + '"/><stop offset="1" stop-color="' + mixc(base, 0, .62) + '"/>'
          : '<stop offset="0" stop-color="#ffffff"/><stop offset=".42" stop-color="#ececf1"/><stop offset=".78" stop-color="#bdbdc8"/><stop offset="1" stop-color="#7c7c8a"/>';
        o += '<defs><radialGradient id="' + id + 'g" cx=".5" cy=".24" r=".92">' + g + '</radialGradient><clipPath id="' + id + 'c"><circle cx="' + x + '" cy="' + y + '" r="' + (r * .95) + '"/></clipPath></defs>';
        o += '<ellipse cx="' + x + '" cy="' + (y + r * .82) + '" rx="' + (r * .9) + '" ry="' + (r * .3) + '" fill="#000" opacity=".55" filter="url(#' + u + 'b2)"/><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + id + 'g)"/>';
        if (card) { var sz = r * 1.2; o += a.svg.replace('<svg ', '<svg x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" style="color:' + (a.color2 || '#fff') + ';overflow:visible" '); }
        else { var sz2 = r * 1.34; o += '<image href="' + a.src + '" x="' + (x - sz2 / 2) + '" y="' + (y - sz2 / 2) + '" width="' + sz2 + '" height="' + sz2 + '" clip-path="url(#' + id + 'c)" preserveAspectRatio="xMidYMid meet" style="mix-blend-mode:multiply' + (dim ? ';filter:grayscale(1) contrast(1.1)' : '') + '"/>'; }
        o += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="url(#' + u + 'vsh)"/>';
        if (dim) o += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#000" opacity=".12"/>';
        o += '<ellipse cx="' + (x - r * .2) + '" cy="' + (y - r * .55) + '" rx="' + (r * .36) + '" ry="' + (r * .16) + '" fill="#fff" opacity="' + (dim ? .5 : .7) + '" filter="url(#' + u + 'b1)"/>';
        return o;
      }
      var open = st.habits.filter(function (h) { return !h.done; });
      settleTop(open, cx, cy, Ri, Ro, r).sort(function (a, b) { return a.y - b.y; }).forEach(function (q) { s += marble(q.x, q.y, q.h, false); });
      /* one long flap, hinged at its left (dial) end */
      var hx = cx + Ri + 3, hy = cy - 9, ex = cx + Ro - 2, ey = cy - 5;
      s += '<line x1="' + (hx + 1) + '" y1="' + (hy + 4) + '" x2="' + (ex + 1) + '" y2="' + (ey + 4) + '" stroke="#000" stroke-opacity=".55" stroke-width="5" stroke-linecap="round" filter="url(#' + u + 'b1)"/>' +
        '<line x1="' + hx + '" y1="' + hy + '" x2="' + ex + '" y2="' + ey + '" stroke="#3c3c44" stroke-width="4.2" stroke-linecap="round"/>' +
        '<line x1="' + hx + '" y1="' + (hy - 1.4) + '" x2="' + ex + '" y2="' + (ey - 1.4) + '" stroke="#8a8a94" stroke-opacity=".6" stroke-width="1" stroke-linecap="round"/>' +
        '<circle cx="' + hx + '" cy="' + hy + '" r="4" fill="#2a2a30" stroke="#8a8a94" stroke-width="1.2"/>';
      settle(st.done, cx, cy, Ri, Ro, r, 11, 6, .72, .012).sort(function (a, b) { return a.y - b.y; }).forEach(function (b) { s += marble(b.x, b.y, b.h, true); });
      s += T(160, 150, st.open.length, 36, '#f2f2f4', 300) + T(160, 164, 'TO GO', 8.5, '#9a9aa6', 800, 'middle', 1.4) +
        '<line x1="132" y1="172" x2="188" y2="172" stroke="#3a3a42"/>' + T(160, 206, st.done.length, 36, '#f2f2f4', 300) + T(160, 220, 'DONE', 8.5, '#9a9aa6', 800, 'middle', 1.4);
      return '<div style="background:#131315;border-radius:14px;padding:6px 4px 8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif"><svg viewBox="0 0 320 320" width="' + W +
        '" style="max-width:100%;display:block;margin:0 auto;overflow:visible">' + defs + s + '</svg></div>';
    }
  });
})();
