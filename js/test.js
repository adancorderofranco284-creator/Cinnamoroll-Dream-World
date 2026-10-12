/*
  TEST "¿Qué personaje eres?" — versión personalizada para Melany.
  Lee CDW.config.melanyQuiz (preguntas, puntuaciones y textos). Si ese bloque no existe
  (config.js antiguo) usa CDW.config.questions como el test original, sin primera oportunidad.
  Pinta dentro de #test-card.

  PRIMERA OPORTUNIDAD
    La primera vez que se COMPLETA el test en este navegador, el resultado es siempre
    melanyQuiz.firstResultId (el conejito blanco de ojos azules), sin mirar las respuestas.
    Se anota en localStorage (clave melanyQuiz.storageKey) en el momento de mostrar ese
    resultado: abrir la web, leer la bienvenida, responder a medias, cambiar de pregunta,
    retroceder o recargar NO la consumen. La decisión y la anotación ocurren en la misma
    función síncrona (finish) y esa función solo se ejecuta una vez por intento.
    Desde la segunda vez, el resultado sale de las puntuaciones (empate: gana el primero
    en el orden de CDW.config.characters).

  SIN localStorage (navegación privada, almacenamiento bloqueado): el test sigue
    funcionando; la primera oportunidad solo se recuerda mientras la página siga abierta.

  MODO DE PRUEBA (solo existe si la dirección lleva ?cdw_dev=1): panel pequeño y rotulado
    para simular primera/segunda oportunidad. Está al final de este archivo.
*/
(function () {
  'use strict';

  // Protección contra una doble ejecución del archivo (por ejemplo, <script> incluido dos veces).
  if (CDW.melanyQuiz) {
    console.warn('[CDW] test.js ya se había ejecutado: se ignora la segunda ejecución.');
    return;
  }

  var card = document.getElementById('test-card');
  var chars = CDW.config.characters;
  var byId = {};
  chars.forEach(function (c) { byId[c.id] = c; });

  var Q = CDW.config.melanyQuiz;
  var personalised = !!(Q && Q.questions && Q.questions.length);
  if (!personalised) {
    console.warn('[CDW] config.js no contiene melanyQuiz: se usa el test original (sin primera oportunidad).');
    Q = { questions: CDW.config.questions };
  }
  var questions = Q.questions;
  var KEY = Q.storageKey || 'cdw_melany_quiz_first_result_used';
  var DEV = /[?&]cdw_dev=1(?:&|$)/.test(window.location.search);

  var stage = 'intro';       // 'intro' | 'question' | 'result'
  var index = 0;
  var answers = [];          // answers[i] = posición de la opción elegida en la pregunta i
  var result = null;         // { ch, first, scores, second }
  var finished = false;      // true en cuanto se calcula el resultado de este intento

  /* ---------- Utilidades ---------- */
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  // Ignora clics repetidos en menos de LOCK_MS (doble clic o doble toque).
  var LOCK_MS = 350;
  var lockUntil = 0;
  function locked() {
    var now = Date.now();
    if (now < lockUntil) return true;
    lockUntil = now + LOCK_MS;
    return false;
  }

  /* ---------- Primera oportunidad: almacenamiento ---------- */
  var memUsed = false;       // respaldo si localStorage no funciona
  var warned = false;
  function warnStorage(err) {
    if (warned) return;
    warned = true;
    console.warn('[CDW] localStorage no está disponible: la primera oportunidad solo se recordará mientras esta página siga abierta.',
      err && err.message ? err.message : '');
  }

  function isFirstUsed() {
    try {
      if (window.localStorage.getItem(KEY) !== null) return true;
    } catch (err) { warnStorage(err); }
    return memUsed;
  }

  // Nunca sobrescribe un registro existente.
  function markFirstUsed(resultId) {
    memUsed = true;
    try {
      var ls = window.localStorage;
      if (ls.getItem(KEY) === null) {
        ls.setItem(KEY, JSON.stringify({ v: 1, usedAt: new Date().toISOString(), result: resultId }));
      }
    } catch (err) { warnStorage(err); }
  }

  /* ---------- Puntuación (función pura: no toca el almacenamiento) ---------- */
  function computeScores(ans) {
    var s = {};
    chars.forEach(function (c) { s[c.id] = 0; });
    ans.forEach(function (optIdx, qi) {
      var q = questions[qi];
      var opt = q && q.options[optIdx];
      if (!opt) return;
      Object.keys(opt.scores || {}).forEach(function (id) { s[id] = (s[id] || 0) + opt.scores[id]; });
    });
    return s;
  }

  // Orden determinista: más puntos primero; a igualdad, el orden de config.characters.
  function ranking(scores) {
    return chars.map(function (c, i) { return { c: c, i: i, s: scores[c.id] || 0 }; })
      .sort(function (a, b) { return (b.s - a.s) || (a.i - b.i); });
  }

  function computeResult(ans) {
    var scores = computeScores(ans);
    var rank = ranking(scores);
    var second = null;
    var ratio = Q.secondaryRatio != null ? Q.secondaryRatio : 0.6;
    if (rank[1] && rank[0].s > 0 && rank[1].s >= rank[0].s * ratio) second = rank[1].c;
    return { ch: rank[0].c, scores: scores, second: second };
  }

  /* ---------- Estado ---------- */
  function reset() {
    index = 0;
    answers = [];
    result = null;
    finished = false;
    stage = personalised ? 'intro' : 'question';
  }

  /* ---------- Pantallas ---------- */
  function renderIntro() {
    stage = 'intro';
    card.textContent = '';
    var t = (isFirstUsed() ? Q.intro.returning : Q.intro.first) || Q.intro.first;
    var box = el('div', 'melany-intro');
    box.appendChild(el('p', 'result-kicker', t.kicker));
    box.appendChild(el('h2', 'q-text melany-title', t.title));
    box.appendChild(el('p', 'result-text', t.text));
    if (t.note) box.appendChild(el('p', 'melany-note', t.note));
    var actions = el('div', 'actions');
    var go = el('button', 'btn primary big', t.button || 'Comenzar');
    go.type = 'button';
    go.addEventListener('click', function () {
      if (stage !== 'intro' || locked()) return;
      renderQuestion();           // empezar NO consume la primera oportunidad
    });
    actions.appendChild(go);
    box.appendChild(actions);
    card.appendChild(box);
    refreshDev();
  }

  function renderQuestion() {
    stage = 'question';
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
    var hint = personalised && Q.transitions && Q.transitions[index];
    if (hint) card.appendChild(el('p', 'q-hint', hint));

    var opts = el('div', 'options');
    q.options.forEach(function (opt, optIdx) {
      var b = el('button', 'opt', opt.label);
      b.type = 'button';
      if (answers[index] === optIdx) {
        b.classList.add('is-picked');
        b.setAttribute('aria-pressed', 'true');
      }
      b.addEventListener('click', function () { pick(optIdx); });
      opts.appendChild(b);
    });
    card.appendChild(opts);

    if (index > 0 || answers[index] !== undefined) {
      var nav = el('div', 'actions test-nav');
      if (index > 0) {
        var prev = el('button', 'btn', 'Anterior');
        prev.type = 'button';
        prev.addEventListener('click', back);
        nav.appendChild(prev);
      }
      if (answers[index] !== undefined) {
        var next = el('button', 'btn primary', 'Siguiente');
        next.type = 'button';
        next.addEventListener('click', forward);
        nav.appendChild(next);
      }
      card.appendChild(nav);
    }

    // anima la barra hasta el valor real
    requestAnimationFrame(function () {
      fill.style.width = ((index + 1) / questions.length * 100) + '%';
    });
    refreshDev();
  }

  function pick(optIdx) {
    if (stage !== 'question' || finished || locked()) return;
    answers[index] = optIdx;
    advance();
  }

  function back() {
    if (stage !== 'question' || finished || index === 0 || locked()) return;
    index--;
    renderQuestion();
  }

  function forward() {
    if (stage !== 'question' || finished || answers[index] === undefined || locked()) return;
    advance();
  }

  function allAnswered() {
    for (var i = 0; i < questions.length; i++) if (answers[i] === undefined) return false;
    return true;
  }

  function advance() {
    if (index < questions.length - 1) { index++; renderQuestion(); }
    else if (allAnswered()) finish();
  }

  // Se ejecuta una sola vez por intento. Aquí —y solo aquí— se decide y se anota la primera oportunidad.
  function finish() {
    if (finished) return;
    finished = true;

    var r = computeResult(answers);
    var forced = personalised && !isFirstUsed();
    if (forced) {
      var main = byId[Q.firstResultId] || chars[0];
      markFirstUsed(main.id);
      r = { ch: main, scores: r.scores, second: null };
    }
    r.first = forced;
    result = r;

    CDW.state = CDW.state || {};
    CDW.state.result = r.ch.id;
    renderResult();
  }

  function renderResult() {
    stage = 'result';
    var ch = result.ch;
    card.textContent = '';
    var box = el('div', 'result');

    var stageEl = el('div', 'result-stage');
    var sprite = CDW.characters.create(ch.id, { x: '50%', y: '52%', s: 0.8, d: 0.4, enter: 'pop' });
    if (sprite) stageEl.appendChild(sprite);
    box.appendChild(stageEl);

    if (!personalised) {
      box.appendChild(el('p', 'result-kicker', 'Tu personaje es…'));
      box.appendChild(el('h2', 'result-name', ch.name));
      box.appendChild(el('p', 'result-text', ch.resultText));
    } else if (result.first) {
      box.appendChild(el('p', 'result-kicker', Q.firstResult.kicker));
      box.appendChild(el('h2', 'result-name', ch.name));
      box.appendChild(el('p', 'result-text', Q.firstResult.text));
      box.appendChild(el('p', 'melany-note', Q.firstResult.note));
    } else {
      var L = Q.laterResult;
      box.appendChild(el('p', 'result-kicker', L.kicker));
      box.appendChild(el('h2', 'result-name', ch.name));
      box.appendChild(el('p', 'result-text', ch.resultText));
      if (L.perCharacter && L.perCharacter[ch.id]) box.appendChild(el('p', 'melany-note', L.perCharacter[ch.id]));
      if (result.second && L.secondary) {
        box.appendChild(el('p', 'melany-note', L.secondary.replace('{name}', result.second.name)));
      }
      box.appendChild(el('p', 'result-text melany-closing', L.closing));
    }

    if (DEV) {
      var pts = chars.map(function (c) { return c.id + '=' + (result.scores[c.id] || 0); }).join('  ');
      box.appendChild(el('p', 'melany-dev-scores', '[PRUEBA] ' + (result.first ? 'Resultado FORZADO (primera oportunidad). ' : 'Resultado por puntuación. ') + 'Puntos: ' + pts));
    }

    var actions = el('div', 'actions');
    var again = el('button', 'btn', 'Repetir el test');
    again.type = 'button';
    again.addEventListener('click', function () {
      if (stage !== 'result' || locked()) return;
      reset();
      stage = 'question';
      renderQuestion();
    });
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
      var r = stageEl.getBoundingClientRect();
      CDW.effects.burst(r.left + r.width / 2, r.top + r.height / 2, 24);
    }
    refreshDev();
  }

  function showStart() {
    if (personalised) renderIntro(); else renderQuestion();
  }

  CDW.register('test', {
    enter: function () {
      if (result) renderResult();
      else if (!card.firstChild) { reset(); showStart(); }
      else if (stage === 'intro') renderIntro();
      else renderQuestion();
    }
  });

  reset();

  // Para inspección y pruebas desde la consola (no modifica nada por sí solo).
  CDW.melanyQuiz = {
    storageKey: KEY,
    isFirstUsed: isFirstUsed,
    computeScores: computeScores,
    computeResult: function (ans) { var r = computeResult(ans); return { id: r.ch.id, scores: r.scores, second: r.second && r.second.id }; }
  };

  /* =====================================================================================
     MODO DE PRUEBA — SOLO EXISTE SI LA DIRECCIÓN LLEVA  ?cdw_dev=1
     Sin ese parámetro nada de este bloque se ejecuta ni se muestra. No se guarda en
     localStorage, así que no queda activo al abrir la web normalmente. Si prefieres
     quitarlo, borra desde aquí hasta el final del archivo (y la llamada refreshDev()).
     ===================================================================================== */
  var devBox = null;
  var devStatus = null;

  function refreshDev() {
    if (!devStatus) return;
    devStatus.textContent = 'Primera oportunidad: ' + (isFirstUsed() ? 'YA USADA (el siguiente resultado se calcula)' : 'DISPONIBLE (el siguiente resultado será el conejito)');
  }

  function devGoToStart() {
    reset();
    showStart();
    if (CDW.current !== 'test') CDW.go('test');
  }

  function setupDev() {
    devBox = el('div', 'melany-dev');
    devBox.setAttribute('role', 'region');
    devBox.setAttribute('aria-label', 'Modo de prueba');
    devBox.appendChild(el('strong', null, 'MODO DE PRUEBA (?cdw_dev=1)'));
    devStatus = el('span', 'melany-dev-status');
    devBox.appendChild(devStatus);

    var b1 = el('button', null, 'Reiniciar: volver a la primera oportunidad');
    b1.type = 'button';
    b1.addEventListener('click', function () {
      memUsed = false;
      try { window.localStorage.removeItem(KEY); } catch (err) { warnStorage(err); }
      devGoToStart();
    });
    var b2 = el('button', null, 'Marcar como usada (probar la segunda oportunidad)');
    b2.type = 'button';
    b2.addEventListener('click', function () {
      markFirstUsed('dev');
      devGoToStart();
    });
    devBox.appendChild(b1);
    devBox.appendChild(b2);
    document.body.appendChild(devBox);
    refreshDev();
    console.info('[CDW] MODO DE PRUEBA activo (?cdw_dev=1). Clave de localStorage: ' + KEY);
  }

  if (DEV) setupDev();
})();
