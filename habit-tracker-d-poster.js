/* Design A: Poster Hourglass, Gravity Fill, Black on Beige (design file ref 34B). v1.0 Oct 3, 2026.
   Draws only; every fact comes from the engine state. The glass shape is traced from the poster. */
(function () {
  var HOUR = 'M20,0 H300 V94.0 L299.4,94.0 L299.2,95.3 L299.0,96.7 L298.8,98.0 L298.7,99.4 L298.6,100.7 L298.4,102.1 L298.1,103.4 L297.9,104.8 L297.8,106.1 L297.5,107.5 L297.1,108.8 L296.8,110.2 L296.4,111.5 L296.1,112.8 L295.7,114.2 L295.3,115.5 L294.8,116.9 L294.3,118.2 L293.8,119.6 L293.1,120.9 L292.6,122.3 L291.9,123.6 L291.2,125.0 L290.4,126.3 L289.5,127.7 L288.5,129.0 L287.5,130.3 L286.4,131.7 L285.1,133.0 L283.8,134.4 L282.4,135.7 L281.1,137.1 L279.4,138.4 L277.7,139.8 L276.1,141.1 L274.3,142.5 L272.3,143.8 L270.4,145.2 L268.2,146.5 L266.1,147.8 L263.8,149.2 L261.4,150.5 L258.9,151.9 L256.4,153.2 L253.6,154.6 L250.8,155.9 L247.8,157.3 L244.7,158.6 L241.5,160.0 L238.4,161.3 L235.2,162.7 L231.8,164.0 L228.4,165.3 L224.6,166.7 L221.1,168.0 L217.4,169.4 L213.9,170.7 L210.2,172.1 L206.6,173.4 L202.9,174.8 L199.6,176.1 L196.3,177.5 L193.5,178.8 L191.2,180.2 L189.1,181.5 L187.2,182.8 L185.5,184.2 L183.9,185.5 L182.5,186.9 L181.2,188.2 L179.9,189.6 L178.8,190.9 L177.9,192.3 L176.9,193.6 L176.0,195.0 L175.2,196.3 L174.4,197.7 L173.7,199.0 L173.0,200.3 L172.4,201.7 L171.8,203.0 L171.2,204.4 L170.8,205.7 L170.3,207.1 L170.0,208.4 L169.6,209.8 L169.4,211.1 L169.1,212.5 L168.9,213.8 L168.8,215.2 L168.7,216.5 L168.6,217.8 L168.4,219.2 L168.3,220.5 L168.4,221.9 L168.6,223.2 L168.7,224.6 L168.8,225.9 L168.9,227.3 L169.1,228.6 L169.4,230.0 L169.6,231.3 L170.0,232.7 L170.3,234.0 L170.8,235.3 L171.2,236.7 L171.8,238.0 L172.4,239.4 L173.0,240.7 L173.7,242.1 L174.4,243.4 L175.2,244.8 L176.0,246.1 L176.9,247.5 L177.9,248.8 L178.8,250.2 L179.9,251.5 L181.2,252.8 L182.5,254.2 L183.9,255.5 L185.5,256.9 L187.2,258.2 L189.1,259.6 L191.2,260.9 L193.5,262.3 L196.3,263.6 L199.6,265.0 L202.9,266.3 L206.6,267.7 L210.2,269.0 L213.9,270.3 L217.4,271.7 L221.1,273.0 L224.6,274.4 L228.4,275.7 L231.8,277.1 L235.2,278.4 L238.4,279.8 L241.5,281.1 L244.7,282.5 L247.8,283.8 L250.8,285.2 L253.6,286.5 L256.4,287.8 L258.9,289.2 L261.4,290.5 L263.8,291.9 L266.1,293.2 L268.2,294.6 L270.4,295.9 L272.3,297.3 L274.3,298.6 L276.1,300.0 L277.7,301.3 L279.4,302.7 L281.1,304.0 L282.4,305.3 L283.8,306.7 L285.1,308.0 L286.4,309.4 L287.5,310.7 L288.5,312.1 L289.5,313.4 L290.4,314.8 L291.2,316.1 L291.9,317.5 L292.6,318.8 L293.1,320.2 L293.8,321.5 L294.3,322.8 L294.8,324.2 L295.3,325.5 L295.7,326.9 L296.1,328.2 L296.4,329.6 L296.8,330.9 L297.1,332.3 L297.5,333.6 L297.8,335.0 L297.9,336.3 L298.1,337.7 L298.4,339.0 L298.6,340.3 L298.7,341.7 L298.8,343.0 L299.0,344.4 L299.2,345.7 L299.4,347.1 V441.1 H20 V347.1 L20.6,347.1 L20.8,345.7 L21.0,344.4 L21.2,343.0 L21.3,341.7 L21.4,340.3 L21.6,339.0 L21.9,337.7 L22.1,336.3 L22.2,335.0 L22.5,333.6 L22.9,332.3 L23.2,330.9 L23.6,329.6 L23.9,328.2 L24.3,326.9 L24.7,325.5 L25.2,324.2 L25.7,322.8 L26.2,321.5 L26.9,320.2 L27.4,318.8 L28.1,317.5 L28.8,316.1 L29.6,314.8 L30.5,313.4 L31.5,312.1 L32.5,310.7 L33.6,309.4 L34.9,308.0 L36.2,306.7 L37.6,305.3 L38.9,304.0 L40.6,302.7 L42.3,301.3 L43.9,300.0 L45.7,298.6 L47.7,297.3 L49.6,295.9 L51.8,294.6 L53.9,293.2 L56.2,291.9 L58.6,290.5 L61.1,289.2 L63.6,287.8 L66.4,286.5 L69.2,285.2 L72.2,283.8 L75.3,282.5 L78.5,281.1 L81.6,279.8 L84.8,278.4 L88.2,277.1 L91.6,275.7 L95.4,274.4 L98.9,273.0 L102.6,271.7 L106.1,270.3 L109.8,269.0 L113.4,267.7 L117.1,266.3 L120.4,265.0 L123.7,263.6 L126.5,262.3 L128.8,260.9 L130.9,259.6 L132.8,258.2 L134.5,256.9 L136.1,255.5 L137.5,254.2 L138.8,252.8 L140.1,251.5 L141.2,250.2 L142.1,248.8 L143.1,247.5 L144.0,246.1 L144.8,244.8 L145.6,243.4 L146.3,242.1 L147.0,240.7 L147.6,239.4 L148.2,238.0 L148.8,236.7 L149.2,235.3 L149.7,234.0 L150.0,232.7 L150.4,231.3 L150.6,230.0 L150.9,228.6 L151.1,227.3 L151.2,225.9 L151.3,224.6 L151.4,223.2 L151.6,221.9 L151.7,220.5 L151.6,219.2 L151.4,217.8 L151.3,216.5 L151.2,215.2 L151.1,213.8 L150.9,212.5 L150.6,211.1 L150.4,209.8 L150.0,208.4 L149.7,207.1 L149.2,205.7 L148.8,204.4 L148.2,203.0 L147.6,201.7 L147.0,200.3 L146.3,199.0 L145.6,197.7 L144.8,196.3 L144.0,195.0 L143.1,193.6 L142.1,192.3 L141.2,190.9 L140.1,189.6 L138.8,188.2 L137.5,186.9 L136.1,185.5 L134.5,184.2 L132.8,182.8 L130.9,181.5 L128.8,180.2 L126.5,178.8 L123.7,177.5 L120.4,176.1 L117.1,174.8 L113.4,173.4 L109.8,172.1 L106.1,170.7 L102.6,169.4 L98.9,168.0 L95.4,166.7 L91.6,165.3 L88.2,164.0 L84.8,162.7 L81.6,161.3 L78.5,160.0 L75.3,158.6 L72.2,157.3 L69.2,155.9 L66.4,154.6 L63.6,153.2 L61.1,151.9 L58.6,150.5 L56.2,149.2 L53.9,147.8 L51.8,146.5 L49.6,145.2 L47.7,143.8 L45.7,142.5 L43.9,141.1 L42.3,139.8 L40.6,138.4 L38.9,137.1 L37.6,135.7 L36.2,134.4 L34.9,133.0 L33.6,131.7 L32.5,130.3 L31.5,129.0 L30.5,127.7 L29.6,126.3 L28.8,125.0 L28.1,123.6 L27.4,122.3 L26.9,120.9 L26.2,119.6 L25.7,118.2 L25.2,116.9 L24.7,115.5 L24.3,114.2 L23.9,112.8 L23.6,111.5 L23.2,110.2 L22.9,108.8 L22.5,107.5 L22.2,106.1 L22.1,104.8 L21.9,103.4 L21.6,102.1 L21.4,100.7 L21.3,99.4 L21.2,98.0 L21.0,96.7 L20.8,95.3 L20.6,94.0 Z', HW = null, RFIT = {};
  function mixc(c, v, t) { var n = parseInt(c.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; function f(x) { return Math.round(x + (v - x) * t); } return 'rgb(' + f(r) + ',' + f(g) + ',' + f(b) + ')'; }
  function T(x, y, txt, sz, fill, wt, anc, ls) {
    return '<text x="' + x + '" y="' + y + '" font-size="' + sz + '" fill="' + fill + '" font-weight="' + (wt || 700) + '" text-anchor="' + (anc || 'middle') + '" ' + (ls ? 'letter-spacing="' + ls + '" ' : '') + '>' + txt + '</text>';
  }
  /* half-width of the glass at every height, measured once from the traced outline */
  function makeHW(d) {
    var ns = 'http://www.w3.org/2000/svg', sv = document.createElementNS(ns, 'svg'), p = document.createElementNS(ns, 'path');
    sv.setAttribute('width', '0'); sv.setAttribute('height', '0'); sv.style.position = 'absolute'; p.setAttribute('d', d); sv.appendChild(p); document.body.appendChild(sv);
    var L = p.getTotalLength(), tab = [], i, N = 6000;
    for (i = 0; i <= N; i++) { var pt = p.getPointAtLength(L * i / N); if (pt.x >= 160) { var yi = Math.round(pt.y); tab[yi] = Math.max(tab[yi] || 0, pt.x - 160); } }
    document.body.removeChild(sv);
    for (var y = 0; y <= 442; y++) {
      if (tab[y] == null) { var lo = y - 1, hi = y + 1; while (lo >= 0 && tab[lo] == null) lo--; while (hi <= 442 && tab[hi] == null) hi++;
        tab[y] = (lo >= 0 && hi <= 442) ? tab[lo] + (tab[hi] - tab[lo]) * (y - lo) / (hi - lo) : (lo >= 0 ? tab[lo] : tab[hi]); }
    }
    return function (y) { y = Math.max(0, Math.min(442, Math.round(y))); return tab[y]; };
  }
  function hwSafe(y, r) { return Math.min(HW(y - r), HW(y), HW(y + r)) - 2; }
  function gridPackTop(list, R) {
    var out = [];
    list.forEach(function (h) {
      var best = null;
      for (var y = 214 - R; y >= R + 80; y -= 2) {
        var lim = hwSafe(y, R) - R; if (lim < 0) continue;
        for (var x = 160 - lim; x <= 160 + lim; x += 2) {
          var ok = true;
          for (var k = 0; k < out.length; k++) { var dx = out[k].x - x, dy = out[k].y - y; if (dx * dx + dy * dy < (2 * R + 2) * (2 * R + 2)) { ok = false; break; } }
          if (ok) { var sc = y * 10 - Math.abs(x - 160) * 0.01; if (!best || sc > best.sc) best = { x: x, y: y, sc: sc }; }
        }
        if (best && best.y > y + 14) break;
      }
      if (best) out.push({ h: h, r: R, x: best.x, y: best.y });
    });
    return out;
  }
  function rollPile(list, R, floorY) {
    var fixed = [];
    list.forEach(function (h, i) {
      var o = { h: h, r: R, x: 160 + (i % 2 ? 2 : -2), y: 292 };
      for (var it = 0; it < 2600; it++) {
        o.y += 1.6; o.x += (i % 2 ? .12 : -.12) * (it < 400 ? 1 : 0);
        for (var p = 0; p < 3; p++) {
          fixed.forEach(function (f) { var dx = o.x - f.x, dy = o.y - f.y, d = Math.sqrt(dx * dx + dy * dy) || .01, min = (o.r + f.r) * .94; if (d < min) { o.x += dx / d * (min - d); o.y += dy / d * (min - d); } });
          var lim = hwSafe(o.y, o.r) - o.r; if (lim < 0) lim = 0;
          if (o.x > 160 + lim) o.x = 160 + lim; if (o.x < 160 - lim) o.x = 160 - lim; if (o.y > floorY - o.r) o.y = floorY - o.r;
        }
      }
      fixed.push(o);
    });
    return fixed;
  }
  /* ball size: the biggest that lets every habit fit in the top of the glass at the start of the day */
  function fitR(all) {
    var n = all.length; if (RFIT[n]) return RFIT[n];
    for (var R = 22; R >= 12; R--) { if (gridPackTop(all, R).length === all.length) { RFIT[n] = R; break; } }
    return (RFIT[n] = RFIT[n] || 12);
  }
  PYHT.register({
    id: 'poster',
    render: function (st, size, P) {
      if (!HW) HW = makeHW(HOUR);
      var W = P.SIZES[size] || 330, e = P.esc, BEI = '#efe7d6', INK = '#151515', s = '';
      var R = fitR(st.habits), nextH = st.next;
      function iw(h, x, y, sz) {
        return '<image href="' + P.icon(h) + '" x="' + (x - sz / 2) + '" y="' + (y - sz / 2) + '" width="' + sz + '" height="' + sz + '" style="filter:grayscale(1) invert(1) brightness(1.3);mix-blend-mode:screen;opacity:.95"/>';
      }
      function openB(x, y, r, h, gold) {
        x = +x.toFixed(1); y = +y.toFixed(1); var c = gold ? '#c9a227' : h.color;
        return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + c + '"/>' + iw(h, x, y, r * 1.16) +
          '<circle cx="' + (x - r * .36) + '" cy="' + (y - r * .4) + '" r="' + (r * .2) + '" fill="#fff" opacity=".45"/>';
      }
      function flat(x, y, r, h) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + mixc(h.color, 125, .68) + '"/>'; }
      var order = st.habits.filter(function (h) { return !h.done && h !== nextH; }), openList = nextH ? order.concat([nextH]) : order;
      s += '<rect x="-600" y="-200" width="1520" height="1100" fill="' + BEI + '"/>' +
        '<path d="' + HOUR + '" fill="#000" opacity=".26" transform="translate(8,13)" filter="url(#phb1)"/><path d="' + HOUR + '" fill="' + INK + '"/>';
      var pile = gridPackTop(openList, R);
      pile.forEach(function (o) { s += openB(o.x, o.y, o.r, o.h, o.h === nextH); });
      var nx = pile.filter(function (o) { return o.h === nextH; })[0];
      var dp = rollPile(st.done, R, 438).sort(function (a, b) { return a.y - b.y; });
      dp.forEach(function (o) { s += flat(o.x, o.y, o.r, o.h); });
      var nm = nextH ? e(nextH.n) : 'All done', tag = nextH ? 'NEXT UP' : 'TODAY';
      s += T(160, 34, tag, 9.5, '#e3b23c', 800, 'middle', 2.2) + T(160, 64, nm, 26, '#f3f3f3', 300);
      if (nx && nx.y - nx.r > 78) s += '<line x1="' + nx.x + '" y1="78" x2="' + nx.x + '" y2="' + (nx.y - nx.r - 3) + '" stroke="#8a8a92" stroke-width="1"/>';
      s += T(132, 480, st.open.length, 38, '#1a2340', 300) + T(132, 493, 'TO GO', 9.5, '#6b7390', 800, 'middle', 2) +
        T(188, 480, st.done.length, 38, '#1a2340', 300) + T(188, 493, 'DONE', 9.5, '#6b7390', 800, 'middle', 2);
      return '<div style="background:' + BEI + ';border-radius:14px;padding:6px 4px 8px;overflow:hidden;font-family:Arial,Helvetica,sans-serif">' +
        '<svg viewBox="0 0 320 502" width="' + W + '" style="max-width:100%;display:block;margin:0 auto;overflow:visible">' +
        '<defs><filter id="phb1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.1"/></filter></defs>' + s + '</svg></div>';
    }
  });
})();
