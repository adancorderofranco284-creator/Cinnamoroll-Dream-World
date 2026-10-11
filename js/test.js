/*
  TEST "¿Qué personaje eres?"
  Lee CDW.config.questions. Cada opción suma puntos (scores) a los personajes indicados.
  Pinta dentro de #test-card. Si hay empate, gana el primero en el orden de config.characters.
*/
(function () {
  'use strict';

  var card = document.getElementById('test-card');
  var questions = CDW.config.questions;
  var index = 0;
  var scores = {};
  var result = null;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function reset() {
    index = 0;
    result = null;
    scores = {};
    CDW.config.characters.forEach(function (c) { scores[c.id] = 0; });
  }

  function renderQuestion() {
    var q = questions[index];
    card.textContent = '';

    var head = el('div', 'test-head');
    head.appendChild(el('span', 'test-count', 'Pregunta ' + (index + 1) + ' de ' + questions.length));
    var bar = el('div', 'progress');
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', String(questions.length));
    bar.setAttribute('aria-valuenow', String(index));
    var fill = el('div', 'progress-fill');
    fill.style.width = (index / questions.length * 100) + '%';
    bar.appendChild(fill);
    head.appendChild(bar);
    card.appendChild(head);

    card.appendChild(el('h2', 'q-text', q.text));

    var opts = el('div', 'options');
    q.options.forEach(function (opt) {
      var b = el('button', 'opt', opt.label);
      b.type = 'button';
      b.addEventListener('click', function () { answer(opt); });
      opts.appendChild(b);
    });
    card.appendChild(opts);

    // anima la barra hasta el valor real
    requestAnimationFrame(function () {
      fill.style.width = ((index + 1) / questions.length * 100) + '%';
    });
  }

  function answer(opt) {
    Object.keys(opt.scores || {}).forEach(function (id) {
      scores[id] = (scores[id] || 0) + opt.scores[id];
    });
    index++;
    if (index >= questions.length) finish(); else renderQuestion();
  }

  function finish() {
    var best = CDW.config.characters[0];
    CDW.config.characters.forEach(function (c) {
      if ((scores[c.id] || 0) > (scores[best.id] || 0)) best = c;
    });
    result = best;
    CDW.state = CDW.state || {};
    CDW.state.result = best.id;
    renderResult();
  }

  function renderResult() {
    var ch = result;
    card.textContent = '';
    var box = el('div', 'result');

    var stage = el('div', 'result-stage');
    var sprite = CDW.characters.create(ch.id, { x: '50%', y: '52%', s: 0.8, d: 0.4, enter: 'pop' });
    if (sprite) stage.appendChild(sprite);
    box.appendChild(stage);

    box.appendChild(el('p', 'result-kicker', 'Tu personaje es…'));
    box.appendChild(el('h2', 'result-name', ch.name));
    box.appendChild(el('p', 'result-text', ch.resultText));

    var actions = el('div', 'actions');
    var again = el('button', 'btn', 'Repetir el test');
    again.type = 'button';
    again.addEventListener('click', function () { reset(); renderQuestion(); });
    var see = el('button', 'btn', 'Ver personajes');
    see.type = 'button';
    see.addEventListener('click', function () {
      if (CDW.explore) CDW.explore.select(ch.id);
      CDW.go('personajes');
    });
    var story = el('button', 'btn primary', 'Vivir la historia');
    story.type = 'button';
    story.addEventListener('click', function () { CDW.go('historia'); });
    actions.appendChild(again);
    actions.appendChild(see);
    actions.appendChild(story);
    box.appendChild(actions);
    card.appendChild(box);

    if (CDW.effects) {
      var r = stage.getBoundingClientRect();
      CDW.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 24);
    }
  }

  CDW.register('test', {
    enter: function () {
      if (result) renderResult();
      else if (!card.firstChild) { reset(); renderQuestion(); }
      else renderQuestion();
    }
  });

  reset();
})();
