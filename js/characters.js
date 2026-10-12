/*
  PERSONAJES: crea los sprites (imágenes PNG) con entrada, flotación independiente
  y reacción al tocarlos.

  Estructura que espera styles.css:
    .sprite-wrap  (posición --x --y, tamaño --s, profundidad --d)
      .sprite-enter.in-left|in-right|in-up|in-pop  (animación de entrada)
        img.sprite  (flotación "bob")

  CDW.characters.create(id, opciones) devuelve el elemento .sprite-wrap.
  Opciones: x, y, s, d, enter ('left'|'right'|'up'|'pop'), flip, delay (s), onTap.
*/
(function () {
  'use strict';

  var byId = {};
  CDW.config.characters.forEach(function (c) { byId[c.id] = c; });

  function isNarrow() { return window.matchMedia('(max-width: 720px)').matches; }

  function react(wrap, x, y) {
    // Rebote (propiedad "scale", independiente del transform de entrada y de la flotación)
    if (wrap.animate) {
      wrap.animate(
        [{ scale: '1 1' }, { scale: '1.2 0.8' }, { scale: '0.9 1.14' }, { scale: '1.06 0.96' }, { scale: '1 1' }],
        { duration: 640, easing: 'ease-out' }
      );
    }
    // Anillo luminoso centrado en el personaje
    var host = wrap.firstElementChild;
    var ring = document.createElement('span');
    ring.className = 'sprite-ring';
    host.appendChild(ring);
    setTimeout(function () { if (ring.parentNode) ring.parentNode.removeChild(ring); }, 650);

    if (CDW.effects) CDW.effects.burst(x, y, 14, 'love');
    if (CDW.sound) CDW.sound.play('pop');
  }

  function create(id, o) {
    o = o || {};
    var ch = byId[id];
    if (!ch) { console.warn('[CDW] Personaje desconocido:', id); return null; }

    var wrap = document.createElement('div');
    wrap.className = 'sprite-wrap depth';
    wrap.dataset.char = id;
    wrap.setAttribute('role', 'button');
    wrap.setAttribute('tabindex', '0');
    wrap.setAttribute('aria-label', ch.name);
    wrap.style.setProperty('--x', o.x || '50%');
    wrap.style.setProperty('--y', o.y || '50%');
    wrap.style.setProperty('--s', String((o.s || 1) * (ch.scale || 1)));
    wrap.style.setProperty('--d', String(o.d != null ? o.d : 0.8));

    var enter = document.createElement('div');
    enter.className = 'sprite-enter in-' + (o.enter || 'pop');
    if (o.delay) enter.style.animationDelay = o.delay + 's';

    var img = new Image();
    img.className = 'sprite' + (o.flip ? ' flip' : '');
    img.src = ch.file;
    img.alt = '';
    img.draggable = false;
    img.style.setProperty('--dur', (3.4 + Math.random() * 1.8).toFixed(2) + 's');
    img.style.setProperty('--delay', (-Math.random() * 3).toFixed(2) + 's');
    img.style.setProperty('--amp', (8 + Math.random() * 8).toFixed(1) + 'px');
    img.addEventListener('error', function () { console.warn('[CDW] No se pudo cargar la imagen:', ch.file); });

    enter.appendChild(img);
    wrap.appendChild(enter);

    function fire(x, y) {
      react(wrap, x, y);
      if (typeof o.onTap === 'function') o.onTap(ch, wrap);
    }
    wrap.addEventListener('click', function (e) { fire(e.clientX, e.clientY); });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        var r = wrap.getBoundingClientRect();
        fire(r.left + r.width / 2, r.top + r.height / 2);
      }
    });
    return wrap;
  }

  CDW.characters = { byId: byId, create: create, isNarrow: isNarrow };
})();
