/* Design G: Solid Steel Plate, Gated Marble Tubes (design file ref 55J). v1.0 Oct 3, 2026.
   Draws only; every fact comes from the engine state.
   Scott's notes: shorter tubes, marbles stay the same size; open marbles wait above a THIN steel bar and are
   never covered; finished marbles fall below it and may be slightly tucked under the bar; tube height is worked
   out from the longest stack so every habit fits at the start and the end of the day.
   Built ready for animation: layout() works out every position, the draw step only paints it.
   Each marble is a group tagged data-h="habit name"; each tube's flap is tagged data-flap="stack". */
(function () {
  var N = 0, r = 12, pU = 24, pL = 22, w = 32, yT = 8, GAP = 58;
  function rrect(x, y, w, h, r) { return 'M' + (x + r) + ',' + y + ' H' + (x + w - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w) + ',' + (y + r) + ' V' + (y + h - r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + w - r) + ',' + (y + h) + ' H' + (x + r) + ' A' + r + ',' + r + ' 0 0 1 ' + x + ',' + (y + h - r) + ' V' + (y + r) + ' A' + r + ',' + r + ' 0 0 1 ' + (x + r) + ',' + y + ' Z'; }
  function T(x, y, txt, sz, fill, wt, anc, ls) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" fill="' + fill + '" font-weight="' + (wt || 700) + '" text-anchor="' + (anc || 'middle') + '" ' + (ls ? 'letter-spacing="' + ls + '" ' : '') + '>' + txt + '</text>';
  }
  /* where everything goes: pure numbers, no drawing */
  function layout(st) {
    var tubes = st.stacks, n = Math.max.apply(null, [1].concat(tubes.map(function (t) { return t.total; })));
    var topC = yT + w / 2 + 2, FL = topC + (n - 1) * pU + 16, PT = FL + 6, yB = PT + 12 + r + 6 + (n - 1) * pL;
    var x0 = 180 - (tubes.length - 1) * GAP / 2, marbles = [];
    tubes.forEach(function (t, i) {
      t.x = x0 + i * GAP;
      var open = t.habits.filter(function (h) { return !h.done; }), done = t.habits.filter(function (h) { return h.done; });
      done.forEach(function (h, j) { marbles.push({ h: h, x: t.x, y: yB - 6 - r - j * pL, lower: true }); });
      open.forEach(function (h, k) { marbles.push({ h: h, x: t.x, y: FL - 16 - k * pU, lower: false }); });
    });
    return { tubes: tubes, FL: FL, PT: PT, yB: yB, marbles: marbles, left: x0 - 34, width: (tubes.length - 1) * GAP + 68 };
  }
  PYHT.register({
    id: 'tubes',
    render: function (st, size, P) {
      var u = 'st' + (++N), W = P.SIZES[size] || 330, e = P.esc, L = layout(st), M = 0, FL = L.FL, PT = L.PT, yB = L.yB;
      var s = '<defs><linearGradient id="' + u + 'steel" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6c747f"/><stop offset=".45" stop-color="#eef1f4"/><stop offset="1" stop-color="#7a828d"/></linearGradient>' +
        '<filter id="' + u + 'b2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4"/></filter></defs>' +
        '<rect x="-300" y="-200" width="960" height="1100" fill="#ece7df"/>';
      function marble(o) {
        var x = +o.x.toFixed(1), y = +o.y.toFixed(1), a = P.art(o.h), g = '<g data-h="' + e(o.h.n) + '">';
        if (a.type === 'svg') { var sz = r * 1.3; return g + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + a.color + '"/>' + a.svg.replace('<svg ', '<svg x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" style="color:' + (a.color2 || '#fff') + ';overflow:visible" ') + '</g>'; }
        var id = u + 'm' + (++M), sz2 = r * 1.42;
        return g + '<clipPath id="' + id + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r * .94) + '"/></clipPath><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#cfd4db" stroke-width=".8"/>' +
          '<image href="' + a.src + '" x="' + (x - sz2 / 2) + '" y="' + (y - sz2 / 2) + '" width="' + sz2 + '" height="' + sz2 + '" clip-path="url(#' + id + ')" preserveAspectRatio="xMidYMid meet"/></g>';
      }
      function glassTube(x) {
        var h = w / 2, d = 'M' + (x - h) + ',' + (yT + h) + ' A' + h + ',' + h + ' 0 0 1 ' + (x + h) + ',' + (yT + h) + ' V' + (yB - h) + ' A' + h + ',' + h + ' 0 0 1 ' + (x - h) + ',' + (yB - h) + ' Z';
        return '<path d="' + d + '" fill="#eaf2f7" fill-opacity=".62" stroke="#c4cad2" stroke-width="1"/><line x1="' + (x - h + 4) + '" y1="' + (yT + h + 2) + '" x2="' + (x - h + 4) + '" y2="' + (yB - h - 4) + '" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".85"/>' +
          '<path d="M' + (x - h + 4) + ',' + (yT + h - 1) + ' A' + (h - 4) + ',' + (h - 4) + ' 0 0 1 ' + (x - 2) + ',' + (yT + 4) + '" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
      }
      /* a glass flap seen in perspective: thin glass disc with thickness, steel hinge pin, bevel and reflection */
      function flap(x, y, name) {
        var rx = w / 2 - 1.2, ry = 4.6, o = '<g data-flap="' + e(name) + '" style="transform-origin:' + (x - w / 2 + 2.2) + 'px ' + (y + .8) + 'px">';
        o += '<ellipse cx="' + x + '" cy="' + (y + 3.4) + '" rx="' + rx + '" ry="' + ry + '" fill="#7fa4b8" fill-opacity=".55"/>';
        o += '<path d="M' + (x - rx) + ',' + y + ' L' + (x - rx) + ',' + (y + 3.4) + ' A' + rx + ',' + ry + ' 0 0 0 ' + (x + rx) + ',' + (y + 3.4) + ' L' + (x + rx) + ',' + y + ' Z" fill="#9dc0d2" fill-opacity=".6"/>';
        o += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + rx + '" ry="' + ry + '" fill="#e4f1f7" fill-opacity=".78" stroke="#ffffff" stroke-opacity=".95" stroke-width="1"/>';
        o += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (rx - 3) + '" ry="' + (ry - 1.4) + '" fill="none" stroke="#9cbccd" stroke-opacity=".6" stroke-width=".8"/>';
        o += '<path d="M' + (x - rx + 4) + ',' + (y - 1.2) + ' Q' + (x - 2) + ',' + (y - 3.4) + ' ' + (x + rx - 8) + ',' + (y - 1.6) + '" fill="none" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".95"/>';
        o += '<rect x="' + (x - w / 2 - 1) + '" y="' + (y - 3.6) + '" width="6.5" height="9" rx="2.2" fill="url(#' + u + 'steel)"/><circle cx="' + (x - w / 2 + 2.2) + '" cy="' + (y + .8) + '" r="1.3" fill="#3d444d"/></g>';
        return o;
      }
      var bx = L.left, bw = L.width, lower = '', upper = '';
      L.tubes.forEach(function (t) { s += glassTube(t.x); });
      L.marbles.forEach(function (o) { if (o.lower) lower += marble(o); else upper += marble(o); });
      L.tubes.forEach(function (t) { upper += flap(t.x, FL, t.name); });
      /* finished marbles first, then the thin steel bar over them, then the open marbles and flaps on top */
      s += lower;
      s += '<path d="' + rrect(bx, PT + 1, bw, 7, 3) + '" fill="#000" opacity=".22" transform="translate(2,4)" filter="url(#' + u + 'b2)"/>';
      s += '<path d="' + rrect(bx, PT - 2, bw, 7, 3) + '" fill="#aeb5be"/>';
      s += '<path d="' + rrect(bx, PT + 2, bw, 3, 1.5) + '" fill="#868e99"/><line x1="' + (bx + 8) + '" y1="' + (PT - 1) + '" x2="' + (bx + bw - 8) + '" y2="' + (PT - 1) + '" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>';
      s += upper;
      L.tubes.forEach(function (t) {
        var full = t.done === t.total;
        s += T(t.x, yB + 30, e(String(t.name).toUpperCase()), 7.5, '#3a3a3a', 800, 'middle', .4) + T(t.x, yB + 50, t.done + '/' + t.total, 16, full ? '#b8862a' : '#8a8478', 700);
      });
      return '<div style="background:#ece7df;border-radius:14px;padding:6px 4px 8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif"><svg viewBox="0 0 360 ' + (yB + 62) + '" width="' + W +
        '" style="max-width:100%;display:block;margin:0 auto;overflow:visible">' + s + '</svg></div>';
    }
  });
})();
