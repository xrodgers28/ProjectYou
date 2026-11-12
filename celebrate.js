/* Project YOU celebration: celebrate.js v2.0 (Oct 15, 2026)
   A short, loose swarm of dots that follows your cursor a little.
   v2.0: about 30% fewer dots than v1, spread out more widely, and a "scale" option
   (0.3 to 1.5) so a bigger day can play a bigger burst.
   Use:  window.celebrate({x, y, scale})            plays once, about 1.5 seconds
         window.celebrateOncePerDay({x, y, scale})  plays at most once per day (2am to 2am Eastern)
   Original code, inspired by the swarm feel of the Liquid Particles demo. */
(function () {
  var DURATION = 1500;   // total length in milliseconds
  var COUNT = 350;       // number of dots (v1 was 500)
  var SPREAD = 125;      // how wide the starting cloud is (v1 was 70)
  var running = false;
  // The seven Clarity Compass section colors
  var COLORS = ['#c05f7a','#4fa08a','#5b8fce','#e0975a','#cf9088','#c6a63f','#7d81c2'];

  function celebrate(opts) {
    opts = opts || {};
    if (running) return;
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches && !opts.force) return;
    running = true;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = window.innerWidth, H = window.innerHeight;
    var cv = document.createElement('canvas');
    cv.width = W * dpr; cv.height = H * dpr;
    cv.style.cssText = 'position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:99999';
    document.body.appendChild(cv);
    var ctx = cv.getContext('2d');
    ctx.scale(dpr, dpr);

    var ox = opts.x != null ? opts.x : W / 2;
    var oy = opts.y != null ? opts.y : H / 2;
    var scale = opts.scale != null ? Math.max(0.2, Math.min(1.6, opts.scale)) : 1;

    // the swarm leans toward the cursor (or a finger) while it plays
    var tx = ox, ty = oy;
    function track(e) {
      var pt = e.touches && e.touches[0] ? e.touches[0] : e;
      if (pt && pt.clientX != null) { tx = pt.clientX; ty = pt.clientY; }
    }
    window.addEventListener('pointermove', track, { passive: true });
    window.addEventListener('touchmove', track, { passive: true });

    function rnd(a, b) { return a + Math.random() * (b - a); }
    function blob(r) { return r * Math.pow(Math.random(), 1.35); }

    var count = Math.round(Math.min(COUNT, W * 0.55) * scale);
    var P = [];
    for (var i = 0; i < count; i++) {
      var a = Math.random() * Math.PI * 2, d = blob(SPREAD);
      var sp = Math.pow(Math.random(), 2) * 10 + 0.3;
      var da = a + rnd(-1.4, 1.4);
      P.push({
        x: ox + Math.cos(a) * d, y: oy + Math.sin(a) * d,
        vx: Math.cos(da) * sp, vy: Math.sin(da) * sp,
        r: rnd(1.4, 4.4),
        color: COLORS[(Math.random() * COLORS.length) | 0],
        wob: Math.random() * 6.28,
        wobSpeed: rnd(0.004, 0.012),
        pull: rnd(0.0006, 0.0034),
        delay: Math.random() * 0.25,
        life: rnd(0.75, 1)
      });
    }

    var t0 = performance.now();
    function stop() {
      window.removeEventListener('pointermove', track);
      window.removeEventListener('touchmove', track);
      cv.remove(); running = false;
    }

    function frame(now) {
      var t = now - t0, k = t / DURATION;
      if (k >= 1) { stop(); return; }
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      var master = k < 0.06 ? k / 0.06 : Math.min(1, (1 - k) / 0.45);
      for (var i = 0; i < P.length; i++) {
        var p = P[i];
        if (k < p.delay) continue;
        var ang = Math.sin(t * p.wobSpeed + p.wob) * 2 + Math.cos(t * 0.0031 + p.y * 0.01) * 1.5;
        p.vx += Math.cos(ang) * 0.4;
        p.vy += Math.sin(ang) * 0.4;
        p.vx += (tx - p.x) * p.pull;
        p.vy += (ty - p.y) * p.pull;
        p.vx *= 0.93; p.vy *= 0.93;
        p.x += p.vx; p.y += p.vy;
        var alpha = master * p.life;
        if (alpha <= 0.01) continue;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * (1 - k * 0.35), 0, 6.2832);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Plays at most once per day. The day runs 2am to 2am Eastern.
  function celebrateOncePerDay(opts) {
    var day;
    try {
      day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' })
        .format(new Date(Date.now() - 2 * 3600 * 1000));
    } catch (e) { day = new Date().toDateString(); }
    var key = 'py-celebrated-mental-fitness';
    try { if (localStorage.getItem(key) === day) return false; } catch (e) {}
    try { localStorage.setItem(key, day); } catch (e) {}
    celebrate(opts);
    return true;
  }

  window.celebrate = celebrate;
  window.celebrateOncePerDay = celebrateOncePerDay;
})();
