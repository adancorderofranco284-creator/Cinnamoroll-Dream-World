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

  var HEART_COLORS = ['255,150,190', '255,182,214', '255,120,170'];
  var orbSprite = (function () {
    var c = document.createElement('canvas');
    c.width = c.height = 64;
    var g = c.getContext('2d');
    var gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,0.95)');
    gr.addColorStop(0.4, 'rgba(255,240,250,0.45)');
    gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr;
    g.fillRect(0, 0, 64, 64);
    return c;
  })();

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
    var r0 = Math.random();
    var orb = r0 > 0.86;
    var spark = !orb && r0 < 0.35;
    return {
      kind: orb ? 'orb' : (spark ? 'spark' : 'petal'),
      x: rnd(-20, W + 20),
      y: initial ? rnd(-20, H) : rnd(-60, -10),
      size: orb ? rnd(14, 34) : (spark ? rnd(3, 7) : rnd(5, 11)),
      vx: rnd(-8, 14),
      vy: orb ? rnd(3, 10) : (spark ? rnd(4, 14) : rnd(14, 34)),
      rot: rnd(0, Math.PI * 2),
      vr: rnd(-1.2, 1.2),
      sway: rnd(8, 26),
      swayT: rnd(0.5, 1.4),
      phase: rnd(0, Math.PI * 2),
      color: spark ? pick(SPARK_COLORS) : pick(PETAL_COLORS),
      alpha: orb ? rnd(0.18, 0.4) : rnd(0.45, 0.9),
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

  function drawHeart(x, y, r, rot, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot * 0.15);
    ctx.fillStyle = 'rgba(' + color + ',' + alpha + ')';
    ctx.beginPath();
    ctx.moveTo(0, r * 0.9);
    ctx.bezierCurveTo(-r * 1.6, -r * 0.1, -r * 0.8, -r * 1.2, 0, -r * 0.45);
    ctx.bezierCurveTo(r * 0.8, -r * 1.2, r * 1.6, -r * 0.1, 0, r * 0.9);
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
      if (p.kind === 'orb') {
        ctx.globalAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.t * 1.2 + p.phase));
        ctx.drawImage(orbSprite, p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
        ctx.globalAlpha = 1;
        continue;
      }
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
      var ba = Math.min(1, b.life / b.max * 1.4);
      if (b.heart) drawHeart(b.x, b.y, b.size * 1.1 * (b.life / b.max), b.rot, b.color, ba);
      else drawStar(b.x, b.y, b.size * (b.life / b.max), b.rot, b.color, ba);
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

  function burst(x, y, n, kind) {
    if (reduce.matches) return;
    n = n || (narrowMq.matches ? 8 : 14);
    for (var i = 0; i < n; i++) {
      var ang = rnd(0, Math.PI * 2), sp = rnd(50, 170), life = rnd(0.6, 1.1);
      var heart = kind === 'love' && Math.random() < 0.55;
      bursts.push({
        x: x, y: y,
        vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 40,
        size: rnd(4, 9), rot: rnd(0, 6), vr: rnd(-4, 4),
        heart: heart, color: heart ? pick(HEART_COLORS) : pick(SPARK_COLORS), life: life, max: life
      });
    }
    if (bursts.length > 120) bursts.splice(0, bursts.length - 120);
    start();
  }

  function trail(x, y) {
    if (reduce.matches) return;
    var life = rnd(0.45, 0.8);
    bursts.push({
      x: x + rnd(-4, 4), y: y + rnd(-4, 4),
      vx: rnd(-14, 14), vy: rnd(6, 26),
      size: rnd(3, 6), rot: rnd(0, 6), vr: rnd(-3, 3),
      heart: false, color: pick(SPARK_COLORS), life: life, max: life
    });
    if (bursts.length > 120) bursts.splice(0, bursts.length - 120);
    start();
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else start();
  });

  CDW.effects = { start: start, stop: stop, burst: burst, trail: trail, resize: resize };
  resize();
  start();
})();
