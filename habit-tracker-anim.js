/* Daily Habit Tracker ANIMATIONS v1.0 (Oct 10, 2026).
   Scott's picks from the Tracker Animation Ideas page. Draws only: it never reads or writes habit data.
   Tap a habit: a short animation (about one second) on each design below.
   Last habit of the day: a bigger finish, once a day (every time in the Sample views so it can be previewed).
   Designs with animations: D Two-Ring Wheel, H Remote Lights, F Icon Grid, C Color Blocks, G Steel Plate Tubes, I Letter Badges.
   E, A and B have none yet. The Animations On/Off switch on the page turns all of this off. */
(function () {
  'use strict';
  var KEY = 'pyht-anim', running = 0, layer = null;
  var GOLD = ['#f4c95d', '#e8884a', '#fff3c4', '#c68a2e'];

  function readOn() {
    try { var v = localStorage.getItem(KEY); if (v === 'on') return true; if (v === 'off') return false; } catch (e) {}
    return !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  }
  var ON = readOn();

  function noop() {}
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  /* Animate any element. SVG pieces turn around their own middle unless a pivot is given. */
  function A(el, kf, opt) {
    if (!el) return Promise.resolve();
    opt = opt || {};
    if (opt.keep) { /* the shape already carries its own pivot */ }
    else if (el instanceof SVGElement) {
      if (opt.pivot) { el.style.transformBox = 'view-box'; el.style.transformOrigin = opt.pivot; }
      else if (el.ownerSVGElement) { el.style.transformBox = 'fill-box'; el.style.transformOrigin = 'center'; }
      else el.style.transformOrigin = '50% 50%';
    } else if (!el.style.transformOrigin) el.style.transformOrigin = '50% 50%';
    var o = { duration: 400, easing: 'ease-out', fill: opt.fill || 'none' };
    if (opt.duration != null) o.duration = opt.duration;
    if (opt.easing) o.easing = opt.easing;
    if (opt.delay) o.delay = opt.delay;
    var an;
    try { an = el.animate(kf, o); } catch (e) { return Promise.resolve(); }
    return an.finished.then(function () { return an; }, noop);
  }

  /* Sparkles and confetti live in one floating layer on the page, so a redraw of the designs never wipes them. */
  function getLayer() {
    if (!layer || !layer.isConnected) {
      layer = document.createElement('div');
      layer.id = 'pyfx';
      layer.style.cssText = 'position:absolute;left:0;top:0;width:0;height:0;pointer-events:none;z-index:55;overflow:visible';
      document.body.appendChild(layer);
    }
    return layer;
  }
  function fx(css) { var d = document.createElement('div'); d.style.position = 'absolute'; Object.assign(d.style, css); getLayer().appendChild(d); return d; }
  function box(el) {
    var a = el.getBoundingClientRect(), sx = window.pageXOffset || 0, sy = window.pageYOffset || 0;
    return { x: a.left + sx, y: a.top + sy, w: a.width, h: a.height, cx: a.left + sx + a.width / 2, cy: a.top + sy + a.height / 2 };
  }
  function qa(rt) { return Array.prototype.slice.call(rt.mount.querySelectorAll('[data-h]')); }
  function q(rt, name) { var a = qa(rt); for (var i = 0; i < a.length; i++) if (a[i].getAttribute('data-h') === name) return a[i]; return null; }
  function snap(rt) { var m = {}; qa(rt).forEach(function (el) { m[el.getAttribute('data-h')] = el.getBoundingClientRect(); }); return m; }
  function colorOf(name) {
    var s = window.STATE; if (!s) return '#3f6f8f';
    var h = s.habits.concat(s.weekly || []).filter(function (x) { return x.n === name; })[0];
    return (h && h.color) || '#3f6f8f';
  }

  function ripple(x, y, color, size, dur) {
    var d = fx({ left: x + 'px', top: y + 'px', width: '10px', height: '10px', marginLeft: '-5px', marginTop: '-5px', border: '3px solid ' + color, borderRadius: '50%' });
    return A(d, [{ transform: 'scale(1)', opacity: .9 }, { transform: 'scale(' + ((size || 80) / 10) + ')', opacity: 0 }], { duration: dur || 700 }).then(function () { d.remove(); });
  }
  function burst(x, y, n, colors, spread, dur) {
    var ps = [];
    for (var i = 0; i < n; i++) {
      var d = fx({ left: x + 'px', top: y + 'px', width: '7px', height: '10px', marginLeft: '-3px', marginTop: '-5px', background: colors[i % colors.length], borderRadius: '1px' });
      var ang = rnd(0, Math.PI * 2), dist = rnd(.4, 1) * (spread || 90), dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist - rnd(10, 40);
      ps.push(A(d, [{ transform: 'translate(0,0) rotate(0)', opacity: 1 },
        { transform: 'translate(' + dx + 'px,' + dy + 'px) rotate(' + rnd(-300, 300) + 'deg)', opacity: 1, offset: .55 },
        { transform: 'translate(' + (dx * 1.1) + 'px,' + (dy + rnd(30, 70)) + 'px) rotate(' + rnd(-500, 500) + 'deg)', opacity: 0 }],
        { duration: (dur || 1100) + rnd(0, (dur || 1100) * .25), easing: 'cubic-bezier(.2,.7,.4,1)' }).then((function (dd) { return function () { dd.remove(); }; })(d)));
    }
    return Promise.all(ps);
  }
  function pop(el, big) { return A(el, [{ transform: 'scale(1)' }, { transform: 'scale(' + (big || 1.2) + ')' }, { transform: 'scale(1)' }], { duration: 380, easing: 'cubic-bezier(.3,1.6,.5,1)' }); }
  function tick(el) { return A(el, [{ transform: 'translateY(9px) scale(.9)', opacity: 0 }, { transform: 'translateY(0) scale(1)', opacity: 1 }], { duration: 380, easing: 'cubic-bezier(.3,1.5,.5,1)' }); }

  /* FLIP: after the tracker has redrawn, glide every piece from where it was to where it is now. */
  function flip(rt, before, opt) {
    var ps = [];
    qa(rt).forEach(function (el) {
      var n = el.getAttribute('data-h'), b = before[n];
      if (!b) return;
      var a = el.getBoundingClientRect(), dx = b.left - a.left, dy = b.top - a.top;
      if (Math.abs(dx) < .5 && Math.abs(dy) < .5) return;
      var sx = 1, sy = 1;
      if (el instanceof SVGElement && el.getScreenCTM) { var m = el.getScreenCTM(); if (m) { sx = m.a || 1; sy = m.d || 1; } }
      var ux = dx / sx, uy = dy / sy;
      var kf = opt.kf ? opt.kf(ux, uy, n) : [{ transform: 'translate(' + ux + 'px,' + uy + 'px)' }, { transform: 'translate(0,0)' }];
      ps.push(A(el, kf, { duration: opt.dur || 700, easing: opt.easing || 'ease-in-out' }));
    });
    return Promise.all(ps);
  }
  function drop(dur, bounce) {
    return function (ux, uy) {
      return [{ transform: 'translate(' + ux + 'px,' + uy + 'px)', easing: 'cubic-bezier(.5,0,.9,.5)' }, { transform: 'translate(0,0)', offset: .72, easing: 'ease-out' },
        { transform: 'translate(0,-' + (bounce || 6) + 'px)', offset: .86, easing: 'ease-in' }, { transform: 'translate(0,0)' }];
    };
  }

  function garden(rt) { return Array.prototype.slice.call(rt.mount.querySelectorAll('[data-spin]')); }
  function whirl(rt, turns, dur, stagger) {
    return Promise.all(garden(rt).map(function (s, i) { return A(s, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(' + (360 * turns) + 'deg)' }], { keep: true, duration: dur, delay: i * (stagger || 0), easing: 'ease-in-out' }); }));
  }
  function fullCards(rt) { return Array.prototype.slice.call(rt.mount.querySelectorAll('svg')).map(function (s) { return s.parentNode; }).filter(function (d) { return /Complete/.test(d.textContent); }); }

  /* ---------- the picks. pre = before the redraw, flip/post = after it, done = the big finish ---------- */
  var SPEC = {};

  /* D Two-Ring Wheel: glow then settle on a tap; the victory spin when the day is done */
  SPEC.wheel = {
    pre: async function (el, rt, name) {
      var c = colorOf(name), b = box(el);
      ripple(b.cx, b.cy, c, 150, 800);
      await A(el, [{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.22)', filter: 'brightness(1.2) drop-shadow(0 0 7px ' + c + ')' }], { duration: 280, fill: 'forwards' });
    },
    post: function (nel, rt) {
      var t = rt.mount.querySelector('svg text'); if (t) tick(t);
      return A(nel, [{ transform: 'scale(1.22)', opacity: .5 }, { transform: 'scale(1)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.3,1.6,.5,1)' });
    },
    done: async function (rt) {
      var segs = qa(rt), svg = rt.mount.querySelector('svg'); if (!svg) return;
      var b = box(svg);
      burst(b.cx, b.cy, 34, GOLD, 120, 1400);
      segs.forEach(function (el, i) { A(el, [{ filter: 'brightness(1)' }, { filter: 'sepia(1) saturate(4) brightness(1.15)' }, { filter: 'brightness(1)' }], { duration: 700, delay: i * 45 }); });
      await Promise.all(segs.map(function (el) { return A(el, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }], { pivot: '160px 160px', duration: 1500, easing: 'cubic-bezier(.65,0,.25,1)' }); }));
      await pop(rt.mount.querySelector('svg text'), 1.3);
    }
  };

  /* H Remote Lights: press and fade; lights out */
  SPEC.remote = {
    pre: async function (el) {
      var led = el.querySelector('[data-led]');
      await A(el, [{ transform: 'scale(1) translateY(0)' }, { transform: 'scale(.88) translateY(2px)' }], { duration: 120, fill: 'forwards' });
      if (led) await A(led, [{ filter: 'blur(.8px) brightness(1)', opacity: 1 }, { filter: 'blur(1.5px) brightness(3)', opacity: 1, offset: .25 }, { filter: 'blur(.8px) brightness(1)', opacity: 0 }], { duration: 480, fill: 'forwards' });
    },
    post: function (nel, rt) {
      var head = rt.mount.firstElementChild && rt.mount.firstElementChild.firstElementChild;
      return Promise.all([A(nel, [{ transform: 'scale(.88)' }, { transform: 'scale(1.04)' }, { transform: 'scale(1)' }], { duration: 300 }), head ? tick(head) : null]);
    },
    done: async function (rt) {
      var b = box(rt.mount), head = rt.mount.firstElementChild && rt.mount.firstElementChild.firstElementChild;
      var dim = fx({ left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', background: '#000', borderRadius: '14px', opacity: 0 });
      await A(dim, [{ opacity: 0 }, { opacity: .6, offset: .25 }, { opacity: .6, offset: .6 }, { opacity: 0 }], { duration: 1500 });
      dim.remove();
      await A(head, [{ transform: 'scale(1)', textShadow: '0 0 0 #f4c95d' }, { transform: 'scale(1.14)', textShadow: '0 0 22px #f4c95d' }, { transform: 'scale(1)', textShadow: '0 0 8px #f4c95d' }], { duration: 900, easing: 'ease-in-out' });
    }
  };

  /* F Icon Grid: flip and stamp; the wave */
  SPEC.grid = {
    pre: function (el, rt) {
      rt.mount.style.perspective = '700px';
      return A(el, [{ transform: 'rotateY(0deg)' }, { transform: 'rotateY(90deg)' }], { duration: 200, easing: 'ease-in', fill: 'forwards' });
    },
    post: function (nel) {
      var chk = nel.querySelector('span');
      return Promise.all([A(nel, [{ transform: 'rotateY(-90deg)' }, { transform: 'rotateY(0deg)' }], { duration: 260, easing: 'ease-out' }),
        chk ? A(chk, [{ transform: 'scale(3) rotate(-30deg)', opacity: 0 }, { transform: 'scale(1) rotate(0)', opacity: 1 }], { duration: 380, delay: 200, easing: 'cubic-bezier(.3,1.5,.5,1)', fill: 'backwards' }) : null]);
    },
    done: async function (rt) {
      var first = rt.mount.firstElementChild; if (!first) return;
      var b = box(first), cols = ['#5865f2', '#0fb39b', '#f0436f'];
      burst(b.x + b.w * .25, b.y + 20, 22, GOLD.concat(cols), 110, 1500);
      burst(b.x + b.w * .75, b.y + 20, 22, GOLD.concat(cols), 110, 1500);
      var tiles = qa(rt), nc = 6;
      await Promise.all(tiles.map(function (el, i) { var r = Math.floor(i / nc), c = i % nc; return A(el, [{ transform: 'scale(1)' }, { transform: 'scale(1.18)', offset: .4 }, { transform: 'scale(1)' }], { duration: 480, delay: (r + c) * 70, easing: 'ease-in-out' }); }));
      await pop(first.firstElementChild, 1.15);
    }
  };

  /* C Color Blocks: the marble drops into the bowl and the garden whirls once; at the end the garden blooms and the marbles giggle */
  SPEC.blocks = {
    flip: { dur: 600, kf: drop(600, 6) },
    post: function (nel, rt) { var n = Math.max(1, garden(rt).length); return sleep(380).then(function () { return whirl(rt, 1, 500, Math.min(18, 240 / n)); }); },
    done: async function (rt) {
      var first = rt.mount.firstElementChild; if (!first) return;
      var b = box(first), ps = [];
      ps.push(burst(b.cx, b.y + 60, 32, ['#d94b45', '#0a1b54', '#9fc4dd', '#f1e7d3'], 140, 1500));
      ps.push(whirl(rt, 2, 1300, 60));
      qa(rt).forEach(function (el, i) {
        ps.push(A(el, [{ transform: 'translateY(0) rotate(0deg)' }, { transform: 'translateY(-9px) rotate(-14deg)', offset: .2 }, { transform: 'translateY(0) rotate(12deg)', offset: .4 },
          { transform: 'translateY(-6px) rotate(-10deg)', offset: .6 }, { transform: 'translateY(0) rotate(6deg)', offset: .8 }, { transform: 'translateY(0) rotate(0deg)' }], { duration: 900, delay: 300 + i * 35 }));
      });
      await Promise.all(ps);
    }
  };

  /* G Steel Plate Tubes: drop through the plate; marbles dance */
  SPEC.tubes = {
    flip: { dur: 600, kf: function (ux, uy) { return [{ transform: 'translate(' + ux + 'px,' + uy + 'px)', easing: 'cubic-bezier(.55,0,1,.5)' }, { transform: 'translate(0,0)', offset: .72, easing: 'ease-out' }, { transform: 'translate(0,-6px)', offset: .86, easing: 'ease-in' }, { transform: 'translate(0,0)' }]; } },
    post: function (nel) {
      var b = box(nel);
      return sleep(400).then(function () {
        var l = fx({ left: (b.cx - 20) + 'px', top: (b.cy - 2) + 'px', width: '40px', height: '3px', background: 'linear-gradient(90deg,transparent,#fff,transparent)' });
        return Promise.all([A(l, [{ opacity: 0, transform: 'scaleX(.3)' }, { opacity: 1, transform: 'scaleX(1.3)', offset: .3 }, { opacity: 0, transform: 'scaleX(1.6)' }], { duration: 350 }).then(function () { l.remove(); }),
          burst(b.cx, b.cy, 8, ['#e8eef3', '#aeb9c4'], 26, 400)]);
      });
    },
    done: async function (rt) {
      var first = rt.mount.firstElementChild; if (!first) return;
      var marbles = qa(rt).sort(function (a, b) { return a.getBoundingClientRect().left - b.getBoundingClientRect().left; }), ps = [];
      marbles.forEach(function (el, i) { ps.push(A(el, [{ transform: 'translateY(0)' }, { transform: 'translateY(-9px)', offset: .4 }, { transform: 'translateY(0)' }], { duration: 520, delay: i * 40, easing: 'ease-in-out' })); });
      Array.prototype.slice.call(rt.mount.querySelectorAll('[data-flap]')).forEach(function (f, i) { ps.push(A(f, [{ transform: 'rotate(0deg)' }, { transform: 'rotate(-14deg)' }, { transform: 'rotate(10deg)' }, { transform: 'rotate(0deg)' }], { duration: 700, delay: i * 120 })); });
      var b = box(first);
      ps.push(burst(b.cx, b.y + b.h * .5, 26, GOLD, 120, 1300));
      await Promise.all(ps);
    }
  };

  /* I Stack Rings (letter badges): badge spin; domino ring */
  SPEC['rings-badges'] = {
    pre: async function (el, rt, name) {
      var c = colorOf(name), kids = Array.prototype.slice.call(el.children), badge = kids.slice(-2), b = box(el);
      ripple(b.cx, b.cy, c, 90, 750);
      var path = el.querySelector('path');
      await Promise.all(badge.map(function (k) { return A(k, [{ transform: 'rotateY(0) scale(1)' }, { transform: 'rotateY(540deg) scale(1.9)' }, { transform: 'rotateY(720deg) scale(1)' }], { duration: 600, easing: 'ease-in-out' }); })
        .concat([path ? A(path, [{ opacity: 1 }, { opacity: .55 }], { duration: 600 }) : null]));
    },
    post: function (nel) { return A(nel, [{ opacity: .4 }, { opacity: 1 }], { duration: 250 }); },
    done: async function (rt) {
      var ps = [];
      fullCards(rt).forEach(function (card) {
        var b = box(card);
        Array.prototype.slice.call(card.querySelectorAll('[data-h]')).forEach(function (g, i) {
          ps.push(A(g, [{ transform: 'scale(1)', filter: 'brightness(1)' }, { transform: 'scale(1.18)', filter: 'sepia(1) saturate(4) brightness(1.2)' }, { transform: 'scale(1)', filter: 'brightness(1)' }], { duration: 520, delay: i * 130 }));
        });
        ps.push(burst(b.cx, b.y + b.h * .45, 18, GOLD, 70, 1100));
      });
      await Promise.all(ps);
    }
  };

  /* ---------- running it ---------- */
  function hosts() {
    var out = [], vh = window.innerHeight || 800;
    Object.keys(SPEC).forEach(function (id) {
      var m = document.querySelector('.mount[data-d="' + id + '"]');
      if (!m || !m.querySelector('[data-h]')) return;
      var r = m.getBoundingClientRect();
      if (r.bottom < -150 || r.top > vh + 150) return; /* off screen, nothing to watch */
      out.push({ id: id, mount: m });
    });
    return out;
  }
  /* The big finish plays once a day in the real view. In the Sample views it plays every time, so it can be previewed. */
  function claimFinale(mode) {
    if (mode !== 'live') return true;
    try {
      var k = 'pyht-anim-day-' + (window.PY && PY.today ? PY.today() : 'x');
      if (localStorage.getItem(k)) return false;
      localStorage.setItem(k, '1');
    } catch (e) {}
    return true;
  }
  function cleanup(rts) {
    rts.forEach(function (rt) { rt.mount.style.perspective = ''; });
    running--;
    var s = window.STATE;
    if (running === 0 && s && s.mode === 'live' && typeof window.redraw === 'function') window.redraw();
  }

  /* go() is the page's own "mark it done and redraw". It runs once, after the short before-part.
     The returned promise resolves right after go(), so saving is not held back by the rest of the animation. */
  function tap(name, go) {
    if (!ON || running > 0) { go(); return Promise.resolve(); }
    var rts = hosts();
    if (!rts.length) { go(); return Promise.resolve(); }
    running++;
    var went = false, bg = null;
    function doGo() { if (!went) { went = true; go(); } }
    var front = (async function () {
      rts.forEach(function (rt) { rt.b0 = snap(rt); });
      await Promise.all(rts.map(function (rt) {
        var el = q(rt, name), s = SPEC[rt.id];
        return (s.pre && el) ? s.pre(el, rt, name).catch(noop) : null;
      }));
      doGo();
      var ps = [];
      rts.forEach(function (rt) {
        var s = SPEC[rt.id], nel = q(rt, name);
        if (s.flip) ps.push(flip(rt, rt.b0, s.flip));
        if (s.post && nel) ps.push(Promise.resolve().then(function () { return s.post(nel, rt, name, rt.b0); }).catch(noop));
      });
      var S = window.STATE, fin = !!(S && S.left === 0 && claimFinale(S.mode));
      bg = Promise.all(ps).then(function () {
        if (!fin) return;
        return sleep(150).then(function () { return Promise.all(rts.map(function (rt) { return SPEC[rt.id].done ? SPEC[rt.id].done(rt).catch(noop) : null; })); });
      });
    })();
    return front.catch(function () { doGo(); }).then(function () {
      Promise.resolve(bg).catch(noop).then(function () { cleanup(rts); });
    });
  }

  /* ---------- the On/Off switch ---------- */
  function paintSwitch() {
    document.querySelectorAll('#animseg button').forEach(function (b) { b.classList.toggle('on', (b.getAttribute('data-a') === 'on') === ON); });
  }
  function setOn(v) {
    ON = !!v;
    try { localStorage.setItem(KEY, ON ? 'on' : 'off'); } catch (e) {}
    paintSwitch();
  }
  function init() {
    var seg = document.getElementById('animseg');
    if (seg) seg.addEventListener('click', function (ev) { var b = ev.target.closest && ev.target.closest('button[data-a]'); if (b) setOn(b.getAttribute('data-a') === 'on'); });
    paintSwitch();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

  window.PYHT_ANIM = { version: '1.0', tap: tap, busy: function () { return running > 0; }, on: function () { return ON; }, setOn: setOn };
})();
