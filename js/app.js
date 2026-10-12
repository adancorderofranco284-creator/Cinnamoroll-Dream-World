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

  /* Lista de canciones (config.audio.playlist). Compatibilidad: si solo existe audio.ambient, se usa como lista de una. */
  var tracks = (audioCfg.playlist || []).filter(Boolean);
  if (!tracks.length && audioCfg.ambient) tracks = [audioCfg.ambient];
  var trackIndex = 0;
  var failStreak = 0;
  var wantMusic = false;   // el usuario (o el arranque automático) quiere música sonando

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

  /* Un único <audio> para toda la lista: al cambiar de canción solo cambia su src. Así no hay
     reproducción duplicada y, en móvil, el permiso que dio el primer toque sigue valiendo. */
  function trackUrl(i) { return encodeURI(tracks[i]); }

  function makeMusic() {
    var a = new Audio();
    a.preload = 'auto';
    a.loop = tracks.length === 1;
    a.volume = 0.35;
    a.addEventListener('ended', function () { loadTrack(trackIndex + 1, true); });
    a.addEventListener('canplay', function () { failStreak = 0; });
    a.addEventListener('error', onTrackError);
    a.src = trackUrl(0);
    return a;
  }

  function loadTrack(i, andPlay) {
    trackIndex = (i + tracks.length) % tracks.length;
    ambient.src = trackUrl(trackIndex);
    if (!andPlay) return;
    var p = ambient.play();
    if (p && p.then) {
      p.then(function () { if (wantMusic && !soundOn) markOn(); })
       .catch(function (err) {
        if (!err || err.name === 'AbortError') return;
        if (err.name === 'NotAllowedError') { armGesture(); return; }
        console.warn('[CDW] No se pudo reproducir:', tracks[trackIndex], err);
      });
    }
  }

  function onTrackError() {
    console.warn('[CDW] No se pudo cargar la canción:', tracks[trackIndex]);
    failStreak++;
    if (failStreak >= tracks.length) {
      console.error('[CDW] Ninguna canción de la lista se pudo cargar.');
      wantMusic = false;
      soundOn = false;
      soundBtn.textContent = 'Sonido: no se pudo cargar la música';
      soundBtn.setAttribute('aria-pressed', 'false');
      return;
    }
    loadTrack(trackIndex + 1, wantMusic);   // salta a la siguiente y continúa
  }

  function setSound(on) {
    soundOn = on;
    wantMusic = on;
    if (typeof disarm === 'function') disarm();
    soundBtn.textContent = 'Sonido: ' + (on ? 'on' : 'off');
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    if (!ambient && tracks.length) ambient = makeMusic();
    if (on && !tracks.length) soundBtn.textContent = 'Sonido: sin canciones en config.js';
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

  var hasAudio = !!(tracks.length || audioCfg.click || audioCfg.pop);
  soundBtn.title = hasAudio ? 'Activar o silenciar el sonido' : 'Aún no hay archivos en la carpeta Sonidos/';
  soundBtn.addEventListener('click', function () { setSound(!soundOn); });
  CDW.sound = { play: play, set: setSound };

  /* Música automática al entrar. Los navegadores bloquean el audio hasta que haya una
     interacción, así que si lo bloquean, empieza con el primer clic/toque/tecla. */
  var armed = false;
  var armEvents = ['pointerdown', 'pointerup', 'touchend', 'keydown'];

  function markOn() {
    soundOn = true;
    soundBtn.textContent = 'Sonido: on';
    soundBtn.setAttribute('aria-pressed', 'true');
  }

  function disarm() {
    if (!armed) return;
    armed = false;
    armEvents.forEach(function (n) { doc.removeEventListener(n, onFirstGesture, true); });
  }

  function onFirstGesture(e) {
    if (e.target && e.target.closest && e.target.closest('#sound-toggle')) return; // lo gestiona el propio botón
    if (soundOn) { disarm(); return; }
    wantMusic = true;
    var p = ambient.play();
    if (p && p.then) {
      p.then(function () { markOn(); disarm(); })
       .catch(function (err) { if (err && err.name !== 'NotAllowedError') disarm(); });
    }
  }

  function autoStart() {
    if (!tracks.length) return;
    ambient = ambient || makeMusic();
    wantMusic = true;
    var p = ambient.play();
    if (p && p.then) {
      p.then(markOn).catch(function (err) {
        if (err && err.name === 'NotAllowedError') armGesture();
      });
    }
  }

  function armGesture() {
    if (armed) return;
    armed = true;
    armEvents.forEach(function (n) { doc.addEventListener(n, onFirstGesture, true); });
  }

  // Pausa la música cuando la pestaña no está visible y la reanuda al volver
  doc.addEventListener('visibilitychange', function () {
    if (!ambient || !soundOn) return;
    if (doc.hidden) ambient.pause();
    else { var q = ambient.play(); if (q && q.catch) q.catch(function () {}); }
  });

  autoStart();

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
