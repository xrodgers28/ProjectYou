/* Design C: Color Blocks, Spinner Garden (design file ref 50C). v1.0 Oct 3, 2026.
   Draws only; every fact comes from the engine state.
   Built ready for animation: layout() works out where every piece sits, draw() only paints it.
   Every habit piece is a group tagged data-h="habit name", and every spinner is a group tagged
   data-spin with its own pivot, so a later animation can move or turn them by name. */
(function () {
  var NVY = '#0a1b54', COR = '#d94b45', SKY = '#9fc4dd', CRM = '#f1e7d3', N = 0;
  function mixc(c, v, t) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(x) { return Math.round(x + (v - x) * t); } return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  function T(x, y, txt, sz, fill, wt, anc, ls, ex) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" fill="' + fill + '" font-weight="' + (wt || 700) + '" text-anchor="' + (anc || 'middle') + '" ' + (ls ? 'letter-spacing="' + ls + '" ' : '') + (ex || '') + '>' + txt + '</text>';
  }
  function rowsPile(list, cx, y0, step, hw, rc, rs, margin) {
    var rows = [], cur = [], w = 0, k = 0;
    function cap(k) { return Math.max(2 * rc + 2, 2 * (hw(y0 - k * step) - margin)); }
    list.forEach(function (h) { var r = h.core ? rc : rs, ww = 2 * r + 3; if (cur.length && w + ww > cap(k)) { rows.push(cur); cur = []; w = 0; k++; } cur.push([h, r, ww]); w += ww; });
    if (cur.length) rows.push(cur);
    var out = [];
    rows.forEach(function (row, k) { var y = y0 - k * step, tw = 0; row.forEach(function (b) { tw += b[2]; }); var x = cx - tw / 2; row.forEach(function (b) { out.push({ h: b[0], r: b[1], x: x + b[2] / 2, y: y }); x += b[2]; }); });
    return out;
  }
  /* where everything goes: pure numbers, no drawing */
  function layout(st) {
    var BOT = 290, PIT = 26, cols = st.stacks.map(function (s) { return { name: String(s.name).toUpperCase(), open: s.habits.filter(function (h) { return !h.done; }) }; });
    var nc = cols.length, maxOpen = Math.max.apply(null, [0].concat(cols.map(function (c) { return c.open.length; })));
    var top = BOT - (maxOpen * PIT + 34), open = [];
    cols.forEach(function (c, k) { c.x = 160 + (k - (nc - 1) / 2) * 52; c.open.forEach(function (h, idx) { open.push({ h: h, x: c.x, y: BOT - 15 - idx * PIT, r: 13 }); }); });
    var hw = function (y) { var dy = Math.min(Math.max(y - 487, 0), 40); return 116 - (40 - Math.sqrt(1600 - dy * dy)); };
    var done = rowsPile(st.done, 160, 527 - 12, 20.5, hw, 10, 10, 3).map(function (o) { return { h: o.h, x: o.x, y: o.y + 56, r: 10 }; });
    return { BOT: BOT, top: top, maxOpen: maxOpen, cols: cols, open: open, done: done };
  }
  PYHT.register({
    id: 'blocks',
    render: function (st, size, P) {
      var u = 'cb' + (++N), W = P.SIZES[size] || 330, e = P.esc, L = layout(st), s = '<rect x="-300" y="-200" width="900" height="1100" fill="' + CRM + '"/>', M = 0;
      function marble(o) {
        var x = +o.x.toFixed(1), y = +o.y.toFixed(1), r = o.r, a = P.art(o.h), g = '<g data-h="' + e(o.h.n) + '">';
        if (a.type === 'svg') { var sz = r * 1.3; return g + '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + a.color + '"/>' + a.svg.replace('<svg ', '<svg x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" style="color:' + (a.color2 || '#fff') + ';overflow:visible" ') + '</g>'; }
        var id = u + 'm' + (++M), sz2 = r * 1.42;
        return g + '<clipPath id="' + id + '"><circle cx="' + x + '" cy="' + y + '" r="' + (r * .94) + '"/></clipPath><circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" stroke="#cfd4db" stroke-width=".8"/>' +
          '<image href="' + a.src + '" x="' + (x - sz2 / 2) + '" y="' + (y - sz2 / 2) + '" width="' + sz2 + '" height="' + sz2 + '" clip-path="url(#' + id + ')" preserveAspectRatio="xMidYMid meet"/></g>';
      }
      function spin(x, y, inner) { return '<g data-spin="1" style="transform-origin:' + x + 'px ' + y + 'px">' + inner + '</g>'; }
      /* the open habits, one column per stack, resting at the bottom of the blue box */
      var nOpen = st.open.length;
      s += nOpen ? T(160, L.top - 12, nOpen + '<tspan font-size="9" font-weight="700" fill="#6a6a6a" letter-spacing="1.4" dx="7">TO GO</tspan>', 36, NVY, 300) : T(160, L.BOT - 16, 'ALL DONE', 22, NVY, 300, 'middle', 3);
      if (L.maxOpen > 0) {
        s += '<rect x="20" y="' + L.top + '" width="280" height="' + (L.BOT - L.top) + '" fill="' + SKY + '"/>';
        L.cols.forEach(function (c) { if (c.open.length) s += T(c.x, L.top + 14, e(c.name), 6.8, NVY, 800, 'middle', .4, 'opacity=".6"'); });
        L.open.forEach(function (o) { s += marble(o); });
      }
      /* the pin field */
      s += '<g transform="translate(0,56)">';
      var rows = [[266, [50, 106, 162, 218, 274]], [302, [78, 134, 190, 246]], [338, [50, 106, 162, 218, 274]], [374, [78, 134, 190, 246]]],
        shapes = { '106,266': 'arc', '218,266': 'ring', '134,302': 'fan', '246,302': 'pad1', '162,338': 'tri', '78,374': 'pad2', '190,374': 'fan' };
      rows.forEach(function (rw) {
        rw[1].forEach(function (x) {
          var y = rw[0], kind = shapes[x + ',' + y];
          if (!kind) { s += '<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="6" height="6" fill="' + NVY + '"/>'; return; }
          if (kind === 'fan') s += spin(x, y, '<path d="M' + (x - 22) + ',' + y + ' A22,22 0 0 1 ' + (x + 22) + ',' + y + ' Z" fill="' + NVY + '"/><path d="M' + (x + 22) + ',' + y + ' A22,22 0 0 1 ' + (x - 22) + ',' + y + ' Z" fill="' + COR + '"/><circle cx="' + x + '" cy="' + y + '" r="5" fill="' + CRM + '"/>');
          else if (kind === 'tri') { var s0 = 18; s += spin(x, y, '<polygon points="' + x + ',' + (y - s0) + ' ' + (x + s0 * .87) + ',' + (y + s0 / 2) + ' ' + (x - s0 * .87) + ',' + (y + s0 / 2) + '" fill="' + COR + '"/><circle cx="' + x + '" cy="' + y + '" r="4" fill="' + CRM + '"/>'); }
          else if (kind === 'ring') s += '<circle cx="' + x + '" cy="' + y + '" r="16" fill="' + NVY + '"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="' + CRM + '"/>';
          else if (kind === 'arc') s += '<path d="M' + (x - 17) + ',' + (y + 8) + ' Q' + x + ',' + (y - 18) + ' ' + (x + 17) + ',' + (y + 8) + '" fill="none" stroke="' + COR + '" stroke-width="9"/>';
          else { var sg = kind === 'pad1' ? -1 : 1; s += spin(x, y, '<line x1="' + (x - 20) + '" y1="' + (y + sg * 9) + '" x2="' + (x + 20) + '" y2="' + (y - sg * 9) + '" stroke="' + SKY + '" stroke-width="10"/>') + '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="8" height="8" fill="' + NVY + '"/>'; }
        });
      });
      s += '<polygon points="108,396 212,396 160,422" fill="' + NVY + '"/>';
      s += '<path d="M44,439 H276 V485 Q276,527 236,527 H84 Q44,527 44,485 Z" fill="' + NVY + '"/></g>';
      /* finished habits, flat and muted in the tub */
      L.done.forEach(function (o) { s += '<g data-h="' + e(o.h.n) + '"><circle cx="' + o.x.toFixed(1) + '" cy="' + o.y.toFixed(1) + '" r="10" fill="' + mixc(o.h.color, 128, .58) + '"/></g>'; });
      var dn = st.done.length;
      s += T(160, 606, dn + (dn === 1 ? ' HABIT COMPLETED' : ' HABITS COMPLETED'), 11, '#6a6a6a', 700, 'middle', 1.2);
      return '<div style="background:' + CRM + ';border-radius:14px;padding:6px 4px 8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif"><svg viewBox="0 0 320 622" width="' + W +
        '" style="max-width:100%;display:block;margin:0 auto;overflow:visible">' + s + '</svg></div>';
    }
  });
})();
