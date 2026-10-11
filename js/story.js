/*
  HISTORIA POR CAPÍTULOS
  Lee CDW.config.story.chapters. Escritura progresiva del texto (toca el texto para verlo completo),
  personajes en escena con entrada propia y color de ambiente (tint) por capítulo.
  Activa las barras de cine (body.cinematic) mientras está abierta.
*/
(function () {
  'use strict';

  var chapters = CDW.config.story.chapters;
  var stage = document.getElementById('story-stage');
  var tint = document.getElementById('story-tint');
  var counter = document.getElementById('story-counter');
  var titleEl = document.getElementById('story-title');
  var textEl = document.getElementById('story-text');
  var prevBtn = document.getElementById('story-prev');
  var nextBtn = document.getElementById('story-next');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var index = 0;
  var timer = null;
  var fullText = '';

  function stopTyping() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function type(text) {
    stopTyping();
    fullText = text;
    if (reduce.matches) { textEl.textContent = text; return; }
    var n = 0;
    textEl.textContent = '';
    timer = setInterval(function () {
      n += 1;
      textEl.textContent = text.slice(0, n);
      if (n >= text.length) stopTyping();
    }, 22);
  }

  function skipTyping() {
    if (timer) { stopTyping(); textEl.textContent = fullText; }
  }

  function buildScene(ch) {
    stage.textContent = '';
    var narrow = CDW.characters.isNarrow();
    var many = ch.scene.length >= 3;
    ch.scene.forEach(function (sp, i) {
      // En móvil los personajes se reducen y suben para no quedar tras el panel de texto.
      var s = sp.s * (narrow ? (many ? 0.72 : 0.85) : 1);
      var y = narrow ? (parseFloat(sp.y) * 0.62) + '%' : (parseFloat(sp.y) * 0.8) + '%';
      var el = CDW.characters.create(sp.id, {
        x: sp.x, y: y, s: s, d: 0.7 + i * 0.15,
        enter: sp.enter, flip: sp.flip, delay: i * 0.18
      });
      if (el) stage.appendChild(el);
    });
  }

  function render() {
    var ch = chapters[index];
    var last = index === chapters.length - 1;
    counter.textContent = (index + 1) + ' / ' + chapters.length;
    titleEl.textContent = ch.title;
    tint.style.background = ch.tint || 'transparent';
    prevBtn.disabled = index === 0;
    nextBtn.textContent = last ? 'Volver al inicio' : 'Siguiente';
    buildScene(ch);
    type(ch.text);
  }

  prevBtn.addEventListener('click', function () {
    if (index > 0) { index--; render(); }
  });
  nextBtn.addEventListener('click', function () {
    if (index < chapters.length - 1) { index++; render(); }
    else { index = 0; CDW.go('inicio'); }
  });
  textEl.addEventListener('click', skipTyping);

  CDW.register('historia', {
    enter: function () {
      document.body.classList.add('cinematic');
      render();
    },
    leave: function () {
      stopTyping();
      document.body.classList.remove('cinematic');
      stage.textContent = '';
    },
    resize: function () { buildScene(chapters[index]); }
  });
})();
