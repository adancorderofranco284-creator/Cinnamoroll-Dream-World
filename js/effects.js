/*
  EFECTOS: pétalos y destellos en un canvas (#fx).
  - Cantidad según CDW.config.particles (desktop / mobile).
  - Se pausa cuando la pestaña no está visible.
  - CDW.effects.burst(x, y, n) lanza un pequeño estallido de destellos.
*/
(function () {
  'use strict';

  var canvas = document.getElementById('fx');
  if (!canvas || !canvas.getContext) { CDW.effects = { burst: function () {}, start: function () {}, stop: function () {} }; return; }

  var ctx = canvas.getContext('2d');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowMq = window.matchMedia('(max-width: 720px)');
  var W = 0, H = 0, dpr = 1;
  var ambient = [];
  var bursts = [];
  var running = false, raf = 0, last = 0;

  var PETAL_COLORS = ['255,182,214', '255,255,255', '178,225,255', '255,214,235'];
  var SPARK_COLORS = ['255,255,255', '255,246,200', '200,235,255', '255,200,230'];

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, narrowMq.matches ? 1.5 : 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    fillAmbient();
  }

  function target() {
    var p = CDW.config.particles || {};
    return narrowMq.matches ? (p.mobile || 24) : (p.desktop || 60);
  }

  function makeAmbient(initial) {
    var spark = Math.random() < 0.35;
    return {
      kind: spark ? 'spark' : 'petal',
      x: rnd(-20, W + 20),
      y: initial ? rnd(-20, H) : rnd(-60, -10),
      size: spark ? rnd(3, 7) : rnd(5, 11),
      vx: rnd(-8, 14),
      vy: spark ? rnd(4, 14) : rnd(14, 34),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-1.2, 1.2),
      sway: rnd(8, 26),
      swayT: rnd(0.5, 1.4),
      phase: rnd(0, Math.PI * 2),
      color: spark ? pick(SPARK_COLORS) : pick(PETAL_COLORS),
      alpha: rnd(0.45, 0.9),
      t: 0
    };
  }

  function fillAmbient() {
    var n = target();
    while (ambient.length < n) ambient.push(makeAmbient(true));
    if (ambient.length > n) ambient.length = n;
  }

  function drawPetal(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = 'rgba(' + p.color + ',' + p.alpha + ')';
    ctx.beginPath();
    ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawStar(x, y, r, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')';
    ctx.beginPath();
    for (var i = 0; i < 8; i++) {
      var rad = i % 2 === 0 ? r : r * 0.3;
      var a = (Math.PI / 4) * i;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < ambient.length; i++) {
      var p = ambient[i];
      p.t += dt;
      p.x += (p.vx + Math.sin(p.t * p.swayT + p.phase) * p.sway) * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      if (p.y > H + 20 || p.x > W + 40 || p.x < -40) { ambient[i] = makeAmbient(false); continue; }
      if (p.kind === 'spark') {
        var tw = 0.5 + 0.5 * Math.sin(p.t * 3 + p.phase);
        drawStar(p.x, p.y, p.size * (0.6 + tw * 0.6), p.rot, p.color, p.alpha * tw);
      } else {
        drawPetal(p);
      }
    }

    for (var j = bursts.length - 1; j >= 0; j--) {
      var b = bursts[j];
      b.life -= dt;
      if (b.life <= 0) { bursts.splice(j, 1); continue; }
      b.vy += 90 * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.rot += b.vr * dt;
      drawStar(b.x, b.y, b.size * (b.life / b.max), b.rot, b.color, Math.min(1, b.life / b.max * 1.4));
    }

    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (running || reduce.matches) return;
    running = true;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(raf);
  }

  function burst(x, y, n) {
    if (reduce.matches) return;
    n = n || (narrowMq.matches ? 8 : 14);
    for (var i = 0; i < n; i++) {
      var ang = rnd(0, Math.PI * 2), sp = rnd(50, 170), life = rnd(0.6, 1.1);
      bursts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 40,
        size: rnd(4, 9), rot: rnd(0, 6), vr: rnd(-4, 4),
        color: pick(SPARK_COLORS), life: life, max: life
      });
    }
    if (bursts.length > 120) bursts.splice(0, bursts.length - 120);
    start();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  CDW.effects = { start: start, stop: stop, burst: burst, resize: resize };
  resize();
  start();
})();
