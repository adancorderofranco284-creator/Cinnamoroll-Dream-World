/*
  MEJORA VISUAL (se carga después de app.js; no sustituye ninguna función existente).
  - Pantalla de carga con barra (espera a las imágenes, con límite de 3,5 s)
  - Título con letras que rebotan
  - Atmósfera: aurora, rayos, nubes y doodles flotantes con parallax
  - Transición en iris con el personaje principal
  - Ambiente por pantalla (body[data-screen]) y dock con píldora deslizante
  - Ripples en botones, anillo al tocar el fondo, saltitos aleatorios y estela del cursor
  Cada bloque está aislado: si uno falla, los demás y la web original siguen funcionando.
*/
(function () {
  'use strict';
  if (!window.CDW || !CDW.config) return;

  var doc = document;
  var body = doc.body;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var narrowMq = window.matchMedia('(max-width: 720px)');

  function rnd(a, b) { return a + Math.random() * (b - a); }
  function pick(a) { return a[(Math.random() * a.length) | 0]; }
  function safe(name, fn) {
    try { fn(); } catch (err) { console.error('[CDW enhance] ' + name + ':', err); }
  }

  /* ---------- 1. Pantalla de carga ---------- */
  safe('loader', function () {
    var loader = doc.getElementById('loader');
    var fill = doc.getElementById('loader-fill');
    var urls = [];
    CDW.config.characters.forEach(function (c) { if (urls.indexOf(c.file) < 0) urls.push(c.file); });
    urls.push(window.matchMedia('(orientation: portrait)').matches ? 'Fondos/fondo-movil.png' : 'Fondos/fondo-pc.png');

    var done = 0, finished = false, t0 = performance.now();

    function finish() {
      if (finished) return;
      finished = true;
      var wait = reduce.matches ? 0 : Math.max(0, 900 - (performance.now() - t0));
      setTimeout(function () {
        if (loader) loader.classList.add('done');
        body.classList.remove('is-loading');
        setTimeout(function () { if (loader && loader.parentNode) loader.parentNode.removeChild(loader); }, 900);
        if (CDW.effects) CDW.effects.burst(window.innerWidth / 2, window.innerHeight * 0.4, 18, 'love');
      }, wait);
    }
    function tick() {
      done++;
      if (fill) fill.style.width = Math.round(done / urls.length * 100) + '%';
      if (done >= urls.length) finish();
    }
    urls.forEach(function (u) {
      var im = new Image();
      im.onload = im.onerror = tick;
      im.src = u;
    });
    setTimeout(finish, 3500);
  });

  /* ---------- 2. Título: letras que rebotan ---------- */
  safe('title', function () {
    var h1 = doc.querySelector('.hero h1');
    if (!h1 || !h1.firstChild || h1.firstChild.nodeType !== 3) return;
    var frag = doc.createDocumentFragment();
    h1.firstChild.nodeValue.split('').forEach(function (ch, i) {
      var s = doc.createElement('i'); // <i>, no <span>: styles.css da formato a "h1 span"
      s.className = 'ch';
      s.style.setProperty('--i', i);
      s.setAttribute('aria-hidden', 'true');
      s.textContent = ch;
      frag.appendChild(s);
    });
    h1.setAttribute('aria-label', 'Cinnamoroll Dream World');
    h1.replaceChild(frag, h1.firstChild);
  });

  /* ---------- 3. Atmósfera: aurora, rayos, nubes y doodles ---------- */
  safe('atmosphere', function () {
    var fx = doc.getElementById('fx');
    function add(cls) {
      var d = doc.createElement('div');
      d.className = cls;
      d.setAttribute('aria-hidden', 'true');
      body.insertBefore(d, fx);
      return d;
    }
    add('ambience');
    add('aurora');
    add('rays');

    var nClouds = narrowMq.matches ? 3 : 5;
    for (var i = 0; i < nClouds; i++) {
      var c = add('cloud');
      c.style.setProperty('--w', rnd(28, 52).toFixed(0) + 'vmin');
      c.style.setProperty('--t', rnd(4, 46).toFixed(0) + '%');
      c.style.setProperty('--o', rnd(0.3, 0.6).toFixed(2));
      c.style.setProperty('--b', rnd(2, 6).toFixed(1) + 'px');
      c.style.setProperty('--sp', rnd(70, 140).toFixed(0) + 's');
      c.style.setProperty('--dl', (-rnd(0, 120)).toFixed(0) + 's');
    }

    var SHAPES = [
      { k: 'fill', p: '<path d="M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z"/>' },
      { k: 'fill', p: '<path d="M12 21s-7-4.6-9.3-9.2C1 8.3 3 5 6.300 5c2 0 3.700 1.200 5.700 3.300C14 6.200 15.700 5 17.700 5 21 5 23 8.300 21.300 11.800 19 16.400 12 21 12 21z"/>' },
      { k: 'line', p: '<path d="M3 14c3-8 7-8 7 0s4 8 7 0 3-6 4-4"/>' },
      { k: 'line', p: '<circle cx="12" cy="12" r="7"/>' },
      { k: 'line', p: '<path d="M12 4v16M4 12h16"/>' },
      { k: 'line', p: '<path d="M7 18h10a4 4 0 0 0 .6-7.960A5.500 5.500 0 0 0 7 9.500 4.300 4.300 0 0 0 7 18z"/>' }
    ];
    var COLORS = ['255,255,255', '255,196,224', '186,226,255', '255,242,170'];
    var holder = add('doodles');
    var nDoodles = narrowMq.matches ? 9 : 16;
    for (var j = 0; j < nDoodles; j++) {
      var sh = pick(SHAPES);
      var w = doc.createElement('span');
      w.className = 'doodle depth';
      w.style.setProperty('--x', rnd(3, 94).toFixed(1) + '%');
      w.style.setProperty('--y', rnd(4, 88).toFixed(1) + '%');
      w.style.setProperty('--d', rnd(0.3, 1.2).toFixed(2));
      w.style.setProperty('--sz', rnd(18, 44).toFixed(0) + 'px');
      w.style.setProperty('--c', pick(COLORS));
      w.style.setProperty('--fd', rnd(6, 11).toFixed(1) + 's');
      w.style.setProperty('--fdl', (-rnd(0, 8)).toFixed(1) + 's');
      w.style.setProperty('--td', rnd(3, 6).toFixed(1) + 's');
      w.style.setProperty('--tdl', (-rnd(0, 5)).toFixed(1) + 's');
      w.innerHTML = '<svg viewBox="0 0 24 24" class="' + sh.k + '" aria-hidden="true">' + sh.p + '</svg>';
      holder.appendChild(w);
    }
  });

  /* ---------- 4. Transición en iris: origen en el toque + personaje ---------- */
  safe('curtain', function () {
    var curtain = doc.getElementById('curtain');
    if (!curtain) return;
    var c1 = CDW.config.characters[0];
    if (c1) {
      var im = new Image();
      im.className = 'curtain-sprite';
      im.alt = '';
      im.draggable = false;
      im.src = c1.file;
      curtain.appendChild(im);
    }
    doc.addEventListener('pointerdown', function (e) {
      if (e.target.closest && e.target.closest('[data-go], #story-next, .btn')) {
        curtain.style.setProperty('--cx', e.clientX + 'px');
        curtain.style.setProperty('--cy', e.clientY + 'px');
      }
    }, true);
  });

  /* ---------- 5. Ambiente por pantalla + dock deslizante ---------- */
  safe('screens', function () {
    var main = doc.querySelector('main');
    function sync() {
      var a = doc.querySelector('.screen.is-active');
      if (a) body.setAttribute('data-screen', a.id);
    }
    sync();
    if (main && window.MutationObserver) {
      new MutationObserver(sync).observe(main, { attributes: true, attributeFilter: ['class'], subtree: true });
    }
  });

  safe('dock', function () {
    var dock = doc.querySelector('.dock');
    if (!dock) return;
    var pill = doc.createElement('span');
    pill.className = 'dock-pill';
    pill.setAttribute('aria-hidden', 'true');
    dock.insertBefore(pill, dock.firstChild);

    function move() {
      var cur = dock.querySelector('[aria-current]');
      if (!cur) return;
      pill.style.width = cur.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + cur.offsetLeft + 'px)';
    }
    move();
    if (window.MutationObserver) {
      new MutationObserver(move).observe(dock, { attributes: true, attributeFilter: ['aria-current'], subtree: true });
    }
    window.addEventListener('resize', move);
    window.addEventListener('load', move);
    if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(move);
  });

  /* ---------- 6. Ripples en botones y anillo al tocar el fondo ---------- */
  safe('taps', function () {
    doc.addEventListener('pointerdown', function (e) {
      var t = e.target.closest ? e.target.closest('.btn, .opt, .dock button, .round') : null;
      if (t && !t.disabled && !reduce.matches) {
        var r = t.getBoundingClientRect();
        var size = Math.max(r.width, r.height) * 0.6;
        var s = doc.createElement('span');
        s.className = 'ripple';
        s.style.width = s.style.height = size + 'px';
        s.style.left = (e.clientX - r.left - size / 2) + 'px';
        s.style.top = (e.clientY - r.top - size / 2) + 'px';
        t.appendChild(s);
        setTimeout(function () { if (s.parentNode) s.parentNode.removeChild(s); }, 700);
        return;
      }
      if (e.target.closest && e.target.closest('button, .sprite-wrap, a')) return;
      if (reduce.matches) return;
      var ring = doc.createElement('span');
      ring.className = 'tap-ring';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
      body.appendChild(ring);
      setTimeout(function () { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 750);
    });
  });

  /* ---------- 7. Saltitos aleatorios de los personajes ---------- */
  safe('hops', function () {
    (function loop() {
      setTimeout(function () {
        if (!doc.hidden && !reduce.matches && !body.classList.contains('is-loading')) {
          var list = doc.querySelectorAll('.screen.is-active .sprite-wrap');
          if (list.length) {
            var w = list[(Math.random() * list.length) | 0];
            if (w.animate) {
              w.animate(
                [{ translate: '0 0' }, { translate: '0 -2.6vmin' }, { translate: '0 0.4vmin' }, { translate: '0 0' }],
                { duration: 640, easing: 'ease-out' }
              );
            }
          }
        }
        loop();
      }, rnd(3200, 6800));
    })();
  });

  /* ---------- 8. Estela de destellos del cursor (solo ratón) ---------- */
  safe('trail', function () {
    var lastT = 0;
    window.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse' || reduce.matches || !CDW.effects || !CDW.effects.trail) return;
      var n = performance.now();
      if (n - lastT < 55) return;
      lastT = n;
      CDW.effects.trail(e.clientX, e.clientY);
    }, { passive: true });
  });
})();
