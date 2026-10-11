/*
  EXPLORACIÓN DE PERSONAJES
  Flechas, miniaturas, deslizar (táctil/ratón) y teclado ← →.
  CDW.explore.select(id) permite abrir directamente un personaje (lo usa el test).
*/
(function () {
  'use strict';

  var chars = CDW.config.characters;
  var stage = document.getElementById('explore-stage');
  var info = document.getElementById('explore-info');
  var nameEl = document.getElementById('explore-name');
  var descEl = document.getElementById('explore-desc');
  var tagsEl = document.getElementById('explore-tags');
  var thumbsEl = document.getElementById('explore-thumbs');
  var current = 0;
  var thumbs = [];
  var built = false;

  function buildThumbs() {
    if (built) return;
    built = true;
    chars.forEach(function (c, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'thumb';
      b.setAttribute('aria-label', c.name);
      b.setAttribute('aria-pressed', 'false');
      var img = new Image();
      img.src = c.file;
      img.alt = '';
      img.draggable = false;
      b.appendChild(img);
      b.addEventListener('click', function () { show(i, i > current ? 1 : -1); });
      thumbsEl.appendChild(b);
      thumbs.push(b);
    });
  }

  function show(i, dir) {
    i = (i + chars.length) % chars.length;
    var c = chars[i];
    dir = dir || 1;
    current = i;

    stage.textContent = '';
    var sprite = CDW.characters.create(c.id, {
      x: '50%', y: '52%', s: 1.1, d: 0.6,
      enter: dir > 0 ? 'right' : 'left'
    });
    if (sprite) stage.appendChild(sprite);

    nameEl.textContent = c.name;
    descEl.textContent = c.description;
    tagsEl.textContent = '';
    (c.tags || []).forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'tag';
      s.textContent = t;
      tagsEl.appendChild(s);
    });
    info.classList.remove('swap');
    void info.offsetWidth; // reinicia la animación
    info.classList.add('swap');

    thumbs.forEach(function (b, k) {
      b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
    });
    if (thumbs[i] && thumbs[i].scrollIntoView) {
      try { thumbs[i].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }); } catch (e) {}
    }
  }

  function step(d) { show(current + d, d); }

  function select(id) {
    for (var i = 0; i < chars.length; i++) {
      if (chars[i].id === id) { current = i; break; }
    }
    if (built) show(current, 1);
  }

  // Controles
  document.getElementById('prev-char').addEventListener('click', function () { step(-1); });
  document.getElementById('next-char').addEventListener('click', function () { step(1); });

  document.addEventListener('keydown', function (e) {
    if (CDW.current !== 'personajes') return;
    if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  // Deslizar sobre el escenario
  var startX = null, swiped = false;
  stage.addEventListener('pointerdown', function (e) { startX = e.clientX; swiped = false; });
  stage.addEventListener('pointerup', function (e) {
    if (startX == null) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) { swiped = true; step(dx < 0 ? 1 : -1); }
  });
  stage.addEventListener('pointercancel', function () { startX = null; });
  // Un deslizamiento no debe contar también como toque sobre el personaje
  stage.addEventListener('click', function (e) {
    if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; }
  }, true);

  CDW.explore = { select: select, show: show };

  CDW.register('personajes', {
    enter: function () {
      buildThumbs();
      show(current, 1);
    },
    leave: function () { stage.textContent = ''; }
  });
})();
