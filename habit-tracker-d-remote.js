/* Design H: Remote Lights, Grid (design file ref 61). v1.7 Oct 6, 2026 (uses the latest picked icons; v1.6: glow dimmed to 30% of v1.5; v1.5: a lit button is now one full disc with a coloured rim, no dark ring around it; v1.4: lights now use a soft glow: each light is a bright centre fading to nothing with a wide, gentle halo, like the green SIG light, instead of a hard-edged dot; v1.3: a section with no habits now still shows its label and a hint; four separate sections: CORE large keys in a 3 by 3 grid, then SECONDARY, BONUS and WEEKLY as smaller key rows, each with its own label and count. Bonus counts toward lights out like secondary; weekly never counts toward today's lights). Core habits are big round keys in a 3 by 3 grid, secondary habits a smaller row of keys. An open habit has its LED lit in its section colour and its key backlit; a finished habit has its LED off and its key grey. "Lights out" means all of them dark.
   Animation-ready: every key is tagged data-h, every LED data-led, every key face data-key. Draws only; every fact comes from the engine state. */
(function () {
  PYHT.register({
    id: 'remote',
    render: function (st, size, P) {
      var phone = size === 'phone', W = phone ? 236 : 304, e = P.esc;
      var c = st.counts, core = st.habits.filter(function (h) { return h.core; }),
          sec = st.habits.filter(function (h) { return !h.core && h.lvl !== 'bonus'; }),
          bon = st.habits.filter(function (h) { return h.lvl === 'bonus'; }),
          wk = st.weekly || [];
      var coreLeft = c.ct - c.cd, secLeft = c.st - c.sd, left = coreLeft + secLeft, out = left === 0;
      var kc = Math.round(W * 0.2), ks = Math.min(Math.round(W * 0.118), Math.floor((W - 6) / Math.max(sec.length, bon.length, wk.length, 1)) - 5), fs = phone ? 8 : 9.5;
      var GOLD = '#f4c95d', MUTE = '#9aa3c0';
      var KEYBG = 'radial-gradient(circle at 35% 30%,#42454f,#1e2026)';
      function art(x, s) {
        var a = P.art(x, true), inner;
        if (a.type === 'svg') inner = '<span style="display:flex;width:66%;height:66%;color:' + (a.color || x.color) + '">' + a.svg + '</span>';
        else inner = '<img alt="" src="' + a.src + '" style="width:74%;height:74%;object-fit:contain">';
        return inner;
      }
      /* v1.4 soft light: hex colour + alpha (0-255) as #rrggbbaa; the colours come in as #rrggbb */
      function a(hex, al) { var h = String(hex || '#ffffff'); if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; var n = Math.max(0, Math.min(255, Math.round(al))).toString(16); return h.slice(0, 7) + (n.length < 2 ? '0' + n : n); }
      function ledHtml(x, led, lit) {
        var c = x.color, L = Math.round(led * 1.5), off = Math.round(-L * .5);
        if (!lit) return '<i data-led style="position:absolute;left:' + Math.round(off + led * .35) + 'px;top:' + Math.round(off + led * .45) + 'px;width:' + Math.round(L * .8) + 'px;height:' + Math.round(L * .8) + 'px;border-radius:50%;background:radial-gradient(circle at 50% 50%,#1c1e24 0,#24272e 45%,#2b2e3500 100%);pointer-events:none"></i>';
        return '<i data-led style="position:absolute;left:' + Math.round(off + led * .1) + 'px;top:' + Math.round(off + led * .2) + 'px;width:' + L + 'px;height:' + L + 'px;border-radius:50%;pointer-events:none;' +
          'background:radial-gradient(circle at 50% 46%,#ffffff 0,' + a(c, 255) + ' 28%,' + a(c, 215) + ' 52%,' + a(c, 90) + ' 78%,' + a(c, 0) + ' 100%);' +
          'box-shadow:0 0 ' + Math.round(led * .9) + 'px ' + Math.round(led * .2) + 'px ' + a(c, 57) + ',0 0 ' + Math.round(led * 2.4) + 'px ' + Math.round(led * .5) + 'px ' + a(c, 29) + ',0 0 ' + Math.round(led * 4.5) + 'px ' + Math.round(led * 1) + 'px ' + a(c, 14) + '"></i>';
      }
      function key(x, d, led) {
        var lit = !x.done, c = x.color;
        if (lit) {
          /* v1.5: a lit key is one full disc, light face and a coloured rim, with no dark bezel around it */
          var rim = Math.max(2, Math.round(d * .045));
          return '<div data-h="' + e(x.n) + '" style="position:relative;width:' + d + 'px;height:' + d + 'px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;box-sizing:border-box;background:radial-gradient(circle at 40% 35%,#f1f1f3,#dcdce0);border:' + rim + 'px ' + (x.lvl === 'bonus' ? 'dashed ' : 'solid ') + a(c, 255) + ';box-shadow:0 4px 8px #000b,0 0 16px 2px ' + a(c, 26) + ',0 0 34px 6px ' + a(c, 12) + '">' +
            '<span data-key style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;border-radius:50%">' + art(x, d) + '</span>' + ledHtml(x, led, lit) + '</div>';
        }
        var face = '<span data-key style="display:flex;align-items:center;justify-content:center;width:' + Math.round(d * .66) + 'px;height:' + Math.round(d * .66) + 'px;border-radius:50%;background:#2c2f38;opacity:.5;filter:grayscale(1)">' + art(x, d) + '</span>';
        return '<div data-h="' + e(x.n) + '" style="position:relative;width:' + d + 'px;height:' + d + 'px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + KEYBG + ';border:1px ' + (x.lvl === 'bonus' ? 'dashed #8a90a0' : 'solid #555a68') + ';box-shadow:0 4px 8px #000b,inset 0 1px 0 #6a6f7e">' + face + ledHtml(x, led, lit) + '</div>';
      }
      /* a smaller section: its own label and count, then a left-aligned row of smaller keys that wraps */
      function small(label, list, note) {
        if (!list.length) return '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:' + MUTE + ';margin:16px 0 6px">' + label + ' &middot; none yet</div><div style="font-size:10.5px;color:#6b7280;padding-left:3px">' + (label === 'WEEKLY' ? 'No weekly habits yet. Tag one W in Stack Builder.' : 'No ' + label.toLowerCase() + ' habits yet. Tag one in Stack Builder.') + '</div>';
        return '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:' + MUTE + ';margin:16px 0 10px">' + label + ' &middot; ' + note + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:' + (phone ? 8 : 10) + 'px;padding-left:3px">' + list.map(function (x) { return key(x, ks, Math.round(ks * .24)); }).join('') + '</div>';
      }
      var h = '<div style="background:linear-gradient(#272930,#14151a);border:1px solid #3b3e48;border-radius:20px;padding:' + (phone ? 12 : 16) + 'px;font-family:Arial,Helvetica,sans-serif;box-shadow:inset 0 1px 0 #4b4f5b">' +
        '<div style="color:' + (out ? GOLD : '#fff') + '"><div style="font-size:' + (phone ? 20 : 26) + 'px;font-weight:900;line-height:1.05">' + (out ? 'Lights out' : left + (left === 1 ? ' light still on' : ' lights still on')) + '</div>' +
        '<div style="font-size:11.5px;font-weight:700;opacity:.7;margin-top:3px">' + (out ? 'All ' + (c.ct + c.st) + ' are dark' : (c.cd + c.sd) + ' of ' + (c.ct + c.st) + ' are off') + '</div></div>' +
        '<div style="font-size:10px;font-weight:700;letter-spacing:.08em;color:' + GOLD + ';margin:14px 0 8px">CORE &middot; ' + coreLeft + ' of ' + c.ct + ' on</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:' + (phone ? 12 : 14) + 'px 6px;justify-items:center">' + core.map(function (x) {
          return '<div style="display:flex;flex-direction:column;align-items:center;width:100%">' + key(x, kc, Math.round(kc * .19)) +
            '<div style="font-size:' + fs + 'px;line-height:1.1;font-weight:700;text-align:center;margin-top:6px;color:' + (x.done ? '#5f6371' : '#fff') + '">' + e(x.n) + '</div></div>';
        }).join('') + '</div>' +
        small('SECONDARY', sec, sec.filter(function (x) { return !x.done; }).length + ' of ' + sec.length + ' on') +
        small('BONUS', bon, bon.filter(function (x) { return !x.done; }).length + ' of ' + bon.length + ' on') +
        small('WEEKLY', wk, c.wd + ' of ' + c.wt + ' done this week') + '</div>';
      return h;
    }
  });
})();
