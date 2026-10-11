/*
  ARRANQUE Y NAVEGACIÓN
  - Navegación entre pantallas con transición (cortina) para todo elemento con [data-go].
  - Registra los clics ANTES de iniciar los módulos: si un módulo falla, los botones siguen vivos.
  - Parallax con el ratón, destellos al tocar, sonido opcional.
  Funciona abriendo index.html directamente (file://): no usa fetch ni módulos ES.
*/
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var curtain = doc.getElementById('curtain');
  var screens = Array.prototype.slice.call(doc.querySelectorAll('.screen'));
  var current = 'inicio';
  var busy = false;

  CDW.current = current;

  function call(id, name) {
    var hooks = CDW.hooks[id];
    if (hooks && typeof hooks[name] === 'function') {
      try { hooks[name](); } catch (err) { console.error('[CDW] Error en ' + id + '.' + name + ':', err); }
    }
  }

  function setDock(id) {
    Array.prototype.forEach.call(doc.querySelectorAll('.dock [data-go]'), function (b) {
      if (b.getAttribute('data-go') === id) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
  }

  /* ---------- Navegación ---------- */
  function go(id) {
    if (busy || id === current || !doc.getElementById(id)) return;
    busy = true;
    curtain.classList.add('on');
    setTimeout(function () {
      call(current, 'leave');
      screens.forEach(function (s) { s.classList.toggle('is-active', s.id === id); });
      current = id;
      CDW.current = id;
      setDock(id);
      call(id, 'enter');
      setTimeout(function () { curtain.classList.remove('on'); }, 120);
      setTimeout(function () { busy = false; }, 560);
    }, reduce.matches ? 60 : 450);
  }
  CDW.go = go;

  doc.addEventListener('click', function (e) {
    var t = e.target.closest ? e.target.closest('[data-go]') : null;
    if (t) { e.preventDefault(); go(t.getAttribute('data-go')); }
  });

  /* ---------- Sonido (opcional) ---------- */
  var sfx = {};
  var ambient = null;
  var soundOn = false;
  var soundBtn = doc.getElementById('sound-toggle');
  var audioCfg = CDW.config.audio || {};

  function makeAudio(path, loop, vol) {
    if (!path) return null;
    var a = new Audio(path);
    a.loop = !!loop;
    a.volume = vol;
    a.addEventListener('error', function () {
      console.warn('[CDW] No se pudo cargar el sonido:', path);
      if (loop) soundBtn.textContent = 'Sonido: no se pudo cargar ' + path.split('/').pop();
    });
    return a;
  }

  function play(name) {
    if (!soundOn) return;
    var a = sfx[name] || (sfx[name] = makeAudio(audioCfg[name], false, 0.5));
    if (!a) return;
    try { a.currentTime = 0; var p = a.play(); if (p && p.catch) p.catch(function () {}); } catch (err) {}
  }

  function setSound(on) {
    soundOn = on;
    soundBtn.textContent = 'Sonido: ' + (on ? 'on' : 'off');
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (!ambient && audioCfg.ambient) ambient = makeAudio(audioCfg.ambient, true, 0.35);
    if (on && !audioCfg.ambient) soundBtn.textContent = 'Sonido: sin canción en config.js';
    if (ambient) {
      if (on) {
        var p = ambient.play();
        if (p && p.catch) p.catch(function (err) {
          console.warn('[CDW] El navegador no permitió reproducir:', err);
          if (err && err.name !== 'AbortError') soundBtn.textContent = 'Sonido: no se pudo reproducir';
        });
      } else ambient.pause();
    }
  }

  var hasAudio = !!(audioCfg.ambient || audioCfg.click || audioCfg.pop);
  soundBtn.title = hasAudio ? 'Activar o silenciar el sonido' : 'Aún no hay archivos en la carpeta Sonidos/';
  soundBtn.addEventListener('click', function () { setSound(!soundOn); });
  CDW.sound = { play: play, set: setSound };

  doc.addEventListener('click', function (e) {
    if (e.target.closest && e.target.closest('.btn, .opt, .dock button, .round, .thumb')) play('click');
  });

  /* ---------- Parallax con el ratón ---------- */
  var mx = 0, my = 0, ticking = false;
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduce.matches) return;
    mx = e.clientX; my = e.clientY;
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      root.style.setProperty('--px', ((mx / window.innerWidth) * 2 - 1).toFixed(3));
      root.style.setProperty('--py', ((my / window.innerHeight) * 2 - 1).toFixed(3));
      root.style.setProperty('--lx', mx + 'px');
      root.style.setProperty('--ly', my + 'px');
    });
  });

  /* ---------- Destellos al tocar el fondo ---------- */
  doc.addEventListener('pointerdown', function (e) {
    if (!CDW.effects) return;
    if (e.target.closest && e.target.closest('button, .sprite-wrap, a')) return;
    CDW.effects.burst(e.clientX, e.clientY, 8);
  });

  /* ---------- Reajuste al cambiar de tamaño/orientación ---------- */
  var narrowWas = CDW.characters.isNarrow();
  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var now = CDW.characters.isNarrow();
      if (now === narrowWas) return;
      narrowWas = now;
      var h = CDW.hooks[current];
      if (h && typeof h.resize === 'function') { try { h.resize(); } catch (err) { console.error(err); } }
    }, 200);
  });

  /* ---------- Inicio ---------- */
  CDW.register('inicio', {
    enter: function () { buildHome(); },
    resize: function () { buildHome(); }
  });

  function buildHome() {
    var layer = doc.getElementById('inicio-sprites');
    var narrow = CDW.characters.isNarrow();
    layer.textContent = '';
    (CDW.config.home || []).forEach(function (h, i) {
      var el = CDW.characters.create(h.id, {
        x: narrow && h.mx ? h.mx : h.x,
        y: narrow && h.my ? h.my : h.y,
        s: h.s, d: h.d, enter: h.enter, delay: 0.3 + i * 0.25
      });
      if (el) layer.appendChild(el);
    });
  }

  setDock(current);
  call(current, 'enter');
})();
