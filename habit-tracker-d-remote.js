/* Design H: Remote Lights, Grid (design file ref 61). v1.3 Oct 5, 2026 (a section with no habits now still shows its label and a hint; four separate sections: CORE large keys in a 3 by 3 grid, then SECONDARY, BONUS and WEEKLY as smaller key rows, each with its own label and count. Bonus counts toward lights out like secondary; weekly never counts toward today's lights). Core habits are big round keys in a 3 by 3 grid, secondary habits a smaller row of keys. An open habit has its LED lit in its section colour and its key backlit; a finished habit has its LED off and its key grey. "Lights out" means all of them dark.
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
        var a = P.art(x), inner;
        if (a.type === 'svg') inner = '<span style="display:flex;width:62%;height:62%;color:' + (a.color || x.color) + '">' + a.svg + '</span>';
        else inner = '<img alt="" src="' + a.src + '" style="width:70%;height:70%;object-fit:contain">';
        return inner;
      }
      function key(x, d, led) {
        var lit = !x.done;
        var face = lit
          ? '<span data-key style="display:flex;align-items:center;justify-content:center;width:' + Math.round(d * .66) + 'px;height:' + Math.round(d * .66) + 'px;border-radius:50%;background:#fff;box-shadow:0 0 0 2px ' + x.color + '">' + art(x, d) + '</span>'
          : '<span data-key style="display:flex;align-items:center;justify-content:center;width:' + Math.round(d * .66) + 'px;height:' + Math.round(d * .66) + 'px;border-radius:50%;background:#2c2f38;opacity:.5;filter:grayscale(1)">' + art(x, d) + '</span>';
        return '<div data-h="' + e(x.n) + '" style="position:relative;width:' + d + 'px;height:' + d + 'px;flex:none;border-radius:50%;display:flex;align-items:center;justify-content:center;background:' + KEYBG + ';border:1px ' + (x.lvl === 'bonus' ? 'dashed #8a90a0' : 'solid #555a68') + ';box-shadow:0 4px 8px #000b,inset 0 1px 0 #6a6f7e' + (lit ? ',0 0 14px 1px ' + x.color + '77' : '') + '">' + face +
          '<i data-led style="position:absolute;left:' + Math.round(-led * .35) + 'px;top:' + Math.round(-led * .25) + 'px;width:' + led + 'px;height:' + led + 'px;border-radius:50%;background:' + (lit ? x.color : '#2b2e35') + ';box-shadow:' + (lit ? '0 0 ' + Math.round(led * 1.3) + 'px ' + Math.round(led * .5) + 'px ' + x.color + 'cc,inset 0 0 3px #fff' : 'inset 0 1px 2px #000') + '"></i></div>';
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
