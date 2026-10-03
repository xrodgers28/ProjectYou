/* Design F: Icon Grid (design file ref 1). v1.0 Oct 3, 2026. Draws only; every fact comes from the engine state. */
(function () {
  PYHT.register({
    id: 'grid',
    render: function (st, size, P) {
      var phone = size === 'phone', cols = phone ? 4 : 6, fs = phone ? 7.5 : 8, LG = '#b9bfc9', e = P.esc;
      var c = st.counts, core = st.habits.filter(function (h) { return h.core; }),
          sec = st.habits.filter(function (h) { return !h.core; });
      var coreLeft = c.ct - c.cd, secLeft = c.st - c.sd;
      function img(x, lit) {
        return '<img alt="" src="' + P.icon(x) + '" style="width:60%;aspect-ratio:1;object-fit:contain;' +
          (lit ? '' : 'filter:grayscale(1);opacity:.32') + ';mix-blend-mode:multiply">';
      }
      var h = '<div style="background:#fff;border-radius:14px;padding:10px;font-family:Arial,Helvetica,sans-serif">' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px">' +
        '<div style="font-size:22px;font-weight:800;color:#1f2a44">' + coreLeft + ' of ' + c.ct + ' Core left</div>' +
        '<div style="font-size:12px;font-weight:700;color:#5b6472">' + (coreLeft ? c.cd + ' done' : 'All done') + '</div></div>';
      h += '<div style="display:grid;gap:8px;grid-template-columns:repeat(' + cols + ',1fr)">' + core.map(function (x) {
        var lit = !x.done;
        return '<div style="position:relative;aspect-ratio:.9;min-width:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:4px 1px 3px;' +
          (lit ? 'background:' + x.bg + ';border:1.5px solid ' + x.pastel : 'background:#eef1f6;border:1.5px dashed #e3e7ee') + '">' +
          img(x, lit) +
          '<div style="font-size:' + fs + 'px;line-height:1.05;color:' + LG + ';text-align:center;margin-top:2px;font-weight:600">' + e(x.n) + '</div>' +
          (lit ? '' : '<span style="position:absolute;right:-4px;top:-4px;width:17px;height:17px;border-radius:50%;background:#c9d3da;color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center;border:2px solid #fff">&#10003;</span>') +
          '</div>';
      }).join('') + '</div>';
      h += '<div style="font-size:10.5px;font-weight:800;letter-spacing:1.4px;color:#5b6472;margin:10px 0 6px">SECONDARY &middot; ' + secLeft + ' OF ' + c.st + ' LEFT</div>' +
        '<div style="display:flex;gap:' + (phone ? 6 : 10) + 'px;flex-wrap:wrap">' + sec.map(function (x) {
          var d = phone ? 38 : 46, lit = !x.done;
          return '<div style="width:' + (phone ? 52 : 62) + 'px;text-align:center"><div style="width:' + d + 'px;height:' + d + 'px;margin:0 auto;border-radius:50%;display:flex;align-items:center;justify-content:center;' +
            (lit ? 'background:' + x.bg + ';border:1.5px solid ' + x.pastel : 'background:#eef1f6;border:1.5px dashed #e3e7ee') + '">' + img(x, lit) + '</div>' +
            '<div style="font-size:' + fs + 'px;line-height:1.05;color:' + LG + ';margin-top:3px;font-weight:600">' + e(x.n) + '</div></div>';
        }).join('') + '</div></div>';
      return h;
    }
  });
})();
