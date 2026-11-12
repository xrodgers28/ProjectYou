/* Project YOU fireworks.js v1.0 (Oct 15, 2026)
   Small firework celebrations drawn on a canvas. Eight kinds play today:
   peony, willow, ring, spiral, crackle, crossette, strobe, palm.
   Use:  var fw = PYFireworks.attach(canvasElement);
         fw.play('peony', {scale:1});     one rocket, one burst
         fw.finale(n, {scale:1});         n bursts of mixed kinds, one after another
   scale (0.4 to 1.6) is how big the day was: more dots, more bursts.
   Original code, no libraries. */
(function () {
  var PAL = {
    gold: [255,196,80], red: [255,84,72], white: [255,255,245], green: [110,255,150],
    pink: [255,110,200], blue: [110,170,255], orange: [255,150,60], silver: [215,228,255], amber: [255,170,40]
  };
  var KINDS = ['peony','willow','ring','spiral','crackle','crossette','strobe','palm'];
  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function reduced() {
    try { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; }
  }

  function attach(cv, opts) {
    opts = opts || {};
    var ctx = cv.getContext('2d');
    var W = 0, H = 0, dpr = 1, parts = [], rockets = [], raf = 0, last = 0, flash = 0, flashCol = PAL.white, timers = [];

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var r = cv.getBoundingClientRect();
      W = Math.max(50, r.width); H = Math.max(50, r.height);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSky();
    }
    function unit() { return Math.min(W, H * 1.35) / 340; }   // so bursts fit small stages

    function add(o) {
      o.age = 0; o.hist = []; o.delay = o.delay || 0;
      o.size = o.size || 1.8; o.drag = o.drag || 0.97; o.grav = o.grav || 0.03;
      o.trail = o.trail || 0; o.life = o.life || 60;
      parts.push(o);
    }
    function comet(x, y, ang, sp, o) {
      o.x = x; o.y = y; o.vx = Math.cos(ang) * sp; o.vy = Math.sin(ang) * sp; o.ang = ang;
      add(o);
    }

    var BURST = {
      peony: function (x, y, s, u) {
        var c = pick([PAL.red, PAL.pink, PAL.blue, PAL.orange]), n = Math.round(100 * s);
        for (var i = 0; i < n; i++) comet(x, y, rnd(0, 6.283), rnd(3.0, 3.7) * u, { col: c, life: rnd(55, 72), drag: 0.965, grav: 0.03 * u, trail: 4, size: 2 });
        flashIt(c, 0.10 * s);
      },
      willow: function (x, y, s, u) {
        var n = Math.round(72 * s);
        for (var i = 0; i < n; i++) comet(x, y, rnd(0, 6.283), rnd(1.2, 3.6) * u, { col: pick([PAL.gold, PAL.amber]), life: rnd(110, 160), drag: 0.975, grav: 0.062 * u, trail: 26, size: 1.7 });
        flashIt(PAL.gold, 0.10 * s);
      },
      ring: function (x, y, s, u) {
        var n = Math.round(46 * s), tilt = rnd(-0.6, 0.6), sq = rnd(0.35, 0.6), cs = Math.cos(tilt), sn = Math.sin(tilt), c = pick([PAL.gold, PAL.pink, PAL.green]);
        for (var i = 0; i < n; i++) {
          var a = i / n * 6.283, vx = Math.cos(a) * 3.3 * u, vy = Math.sin(a) * 3.3 * u * sq;
          add({ x: x, y: y, vx: vx * cs - vy * sn, vy: vx * sn + vy * cs, col: c, life: 58, drag: 0.968, grav: 0.012 * u, trail: 3, size: 2 });
        }
        var m = Math.round(24 * s);
        for (i = 0; i < m; i++) {
          a = i / m * 6.283; vx = Math.cos(a) * 1.7 * u; vy = Math.sin(a) * 1.7 * u * sq;
          add({ x: x, y: y, vx: vx * cs - vy * sn, vy: vx * sn + vy * cs, col: PAL.white, life: 52, drag: 0.968, grav: 0.012 * u, trail: 2, size: 1.6 });
        }
        flashIt(c, 0.08 * s);
      },
      spiral: function (x, y, s, u) {
        var arms = 3, per = Math.round(26 * s), spin = rnd(0, 6.283), dir = Math.random() < 0.5 ? 1 : -1;
        for (var k = 0; k < arms; k++) for (var i = 0; i < per; i++) {
          comet(x, y, spin + k * 6.283 / arms + dir * i * 0.27, 2.7 * u, { col: PAL.green, life: 74, drag: 0.972, grav: 0.012 * u, trail: 2, size: 1.9, delay: i * 1.5 });
        }
        flashIt(PAL.green, 0.07 * s);
      },
      crackle: function (x, y, s, u) {
        var n = Math.round(40 * s);
        for (var i = 0; i < n; i++) comet(x, y, rnd(0, 6.283), rnd(0.5, 2.8) * u, {
          col: pick([PAL.gold, PAL.white, PAL.amber]), life: rnd(42, 70), drag: 0.955, grav: 0.02 * u, trail: 0, size: 2.2, flick: true, pop: true
        });
        flashIt(PAL.white, 0.12 * s);
      },
      crossette: function (x, y, s, u) {
        var n = Math.max(3, Math.round(5 * s)), c = pick([PAL.red, PAL.green, PAL.blue, PAL.gold]);
        for (var i = 0; i < n; i++) comet(x, y, i / n * 6.283 + rnd(-0.2, 0.2), rnd(3.2, 3.8) * u, { col: c, life: 28, drag: 0.962, grav: 0.015 * u, trail: 9, size: 2.4, split: true });
        flashIt(c, 0.09 * s);
      },
      strobe: function (x, y, s, u) {
        var n = Math.round(74 * s);
        for (var i = 0; i < n; i++) comet(x, y, rnd(0, 6.283), rnd(0.8, 3.3) * u, { col: pick([PAL.white, PAL.silver]), life: rnd(90, 135), drag: 0.975, grav: 0.02 * u, trail: 0, size: 2.2, strobe: true, phase: Math.random() * 14, period: rnd(8, 15) });
        flashIt(PAL.silver, 0.08 * s);
      },
      palm: function (x, y, s, u) {
        var arms = Math.max(5, Math.round(8 * s));
        for (var i = 0; i < arms; i++) comet(x, y, i / arms * 6.283 + rnd(-0.15, 0.15), rnd(3.3, 4.0) * u, { col: PAL.gold, life: 84, drag: 0.975, grav: 0.07 * u, trail: 30, size: 3.2, emit: true });
        flashIt(PAL.gold, 0.12 * s);
      }
    };

    function flashIt(c, a) { flash = Math.min(0.22, a); flashCol = c; }

    function launch(kind, o) {
      o = o || {};
      var x = o.x != null ? o.x : W * rnd(0.3, 0.7), ty = H * rnd(0.22, 0.4);
      rockets.push({ kind: kind, x: x, y: H, y0: H, ty: ty, t: 0, dur: 38, s: o.scale != null ? o.scale : 1 });
      kick();
    }

    function step(dt) {
      var i, p;
      for (i = rockets.length - 1; i >= 0; i--) {
        var r = rockets[i]; r.t += dt;
        var k = Math.min(1, r.t / r.dur), e = 1 - Math.pow(1 - k, 2.2);
        r.y = r.y0 + (r.ty - r.y0) * e;
        add({ x: r.x + rnd(-1, 1), y: r.y, vx: rnd(-0.3, 0.3), vy: rnd(0.4, 1.2), col: PAL.orange, life: 14, drag: 0.95, grav: 0.02, size: 1.1 });
        if (k >= 1) { rockets.splice(i, 1); BURST[r.kind](r.x, r.y, r.s, unit()); }
      }
      var born = [];
      for (i = parts.length - 1; i >= 0; i--) {
        p = parts[i];
        if (p.delay > 0) { p.delay -= dt; continue; }
        p.hist.push(p.x, p.y); if (p.hist.length > p.trail * 2) p.hist.splice(0, 2);
        p.vx *= Math.pow(p.drag, dt); p.vy = p.vy * Math.pow(p.drag, dt) + p.grav * dt;
        p.x += p.vx * dt; p.y += p.vy * dt; p.age += dt;
        if (p.emit && Math.random() < 0.5) born.push({ x: p.x, y: p.y, vx: rnd(-0.4, 0.4), vy: rnd(0, 0.6), col: PAL.amber, life: 20, drag: 0.95, grav: 0.03, size: 1.1 });
        if (p.age >= p.life) {
          if (p.split) for (var q = 0; q < 4; q++) born.push({ x: p.x, y: p.y, vx: Math.cos(p.ang + q * 1.5708) * 3.1, vy: Math.sin(p.ang + q * 1.5708) * 3.1, ang: p.ang + q * 1.5708, col: p.col, life: 30, drag: 0.955, grav: 0.02, trail: 9, size: 2.2 });
          if (p.pop) for (q = 0; q < 2; q++) born.push({ x: p.x + rnd(-6, 6), y: p.y + rnd(-6, 6), vx: 0, vy: 0, col: PAL.white, life: rnd(5, 9), drag: 1, grav: 0, size: 2.8, delay: rnd(0, 14) });
          parts.splice(i, 1);
        }
      }
      for (i = 0; i < born.length; i++) add(born[i]);
      flash = Math.max(0, flash - 0.012 * dt);
    }

    function drawSky() {
      var g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#060a1c'); g.addColorStop(1, '#1d2145');
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#05070f';
      ctx.beginPath(); ctx.moveTo(0, H);
      for (var x = 0; x <= W; x += W / 12) ctx.lineTo(x, H - 8 - 10 * Math.abs(Math.sin(x * 0.021 + 1)));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    }

    function draw() {
      drawSky();
      if (flash > 0.001) { ctx.fillStyle = 'rgba(' + flashCol.join(',') + ',' + flash + ')'; ctx.fillRect(0, 0, W, H); }
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';
      var i, j, p, a, c;
      for (i = 0; i < rockets.length; i++) {
        ctx.fillStyle = 'rgba(255,230,180,.95)'; ctx.beginPath(); ctx.arc(rockets[i].x, rockets[i].y, 2, 0, 6.283); ctx.fill();
      }
      for (i = 0; i < parts.length; i++) {
        p = parts[i]; if (p.delay > 0) continue;
        var k = p.age / p.life;
        a = Math.max(0, Math.min(1, (1 - k) * 1.5));
        if (p.flick && Math.random() < 0.55) a *= 0.15;
        if (p.strobe) a *= (((p.age + p.phase) % p.period) < p.period * 0.28) ? 1 : 0.04;
        if (a < 0.02) continue;
        c = p.col;
        if (p.trail && p.hist.length > 3) {
          ctx.lineWidth = p.size * 0.9;
          var n = p.hist.length / 2;
          for (j = 1; j < n; j++) {
            ctx.strokeStyle = 'rgba(' + c.join(',') + ',' + (a * j / n * 0.8).toFixed(3) + ')';
            ctx.beginPath(); ctx.moveTo(p.hist[j * 2 - 2], p.hist[j * 2 - 1]); ctx.lineTo(p.hist[j * 2], p.hist[j * 2 + 1]); ctx.stroke();
          }
        }
        ctx.fillStyle = 'rgba(' + c.join(',') + ',' + (a * 0.22).toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 2.6, 0, 6.283); ctx.fill();
        ctx.fillStyle = 'rgba(' + c.join(',') + ',' + a.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * 0.85, 0, 6.283); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    }

    function loop(now) {
      var dt = Math.min(2.5, (now - last) / 16.667 || 1); last = now;
      step(dt); draw();
      if (parts.length || rockets.length || flash > 0.001) raf = requestAnimationFrame(loop);
      else { raf = 0; drawSky(); }
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

    // for people who ask their device for less motion: one still frame, no movement
    function still(kind, o) {
      o = o || {};
      parts = []; rockets = [];
      BURST[kind](W * 0.5, H * 0.4, o.scale != null ? o.scale : 1, unit());
      for (var i = 0; i < 26; i++) step(1);
      draw(); parts = []; flash = 0;
      cv.style.transition = 'none'; cv.style.opacity = '1';
      setTimeout(function () { cv.style.transition = 'opacity 1.2s'; cv.style.opacity = '0.25'; }, 900);
      setTimeout(function () { cv.style.transition = 'none'; cv.style.opacity = '1'; drawSky(); }, 2300);
    }

    function play(kind, o) {
      o = o || {};
      if (!BURST[kind]) return;
      if (reduced() && !o.force) { still(kind, o); return; }
      launch(kind, o);
    }
    function finale(n, o) {
      o = o || {};
      n = Math.max(1, Math.round(n || 3));
      timers.forEach(clearTimeout); timers = [];
      if (reduced() && !o.force) { still(pick(KINDS), o); return; }
      for (var i = 0; i < n; i++) (function (i) {
        timers.push(setTimeout(function () { launch(pick(KINDS), { scale: o.scale, x: W * (0.15 + 0.7 * ((i * 0.618 + Math.random() * 0.2) % 1)) }); }, i * 280));
      })(i);
    }

    window.addEventListener('resize', resize);
    resize();
    return { play: play, finale: finale, resize: resize, kinds: KINDS };
  }

  window.PYFireworks = { attach: attach, kinds: KINDS };
})();
