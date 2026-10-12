# Cinnamoroll Dream World

Página web interactiva con un test de personalidad, exploración de personajes y una pequeña historia.
HTML, CSS y JavaScript puros. Sin frameworks ni dependencias externas.

## Cómo ejecutarlo

**Opción rápida:** haz doble clic en `index.html`. Funciona directamente en el navegador.

**Opción con servidor local (recomendada si luego añades audio o cambias rutas):**

```bash
cd cinnamoroll-dream-world
python3 -m http.server 8000
```

Después abre `http://localhost:8000` en el navegador. En el móvil, usa la IP de tu ordenador
en la misma red Wi-Fi (por ejemplo `http://192.168.1.20:8000`).

## Estructura

```
cinnamoroll-dream-world/
├── index.html          Estructura de las pantallas
├── css/styles.css      Estilos, parallax, animaciones y adaptación móvil
├── js/
│   ├── config.js       ★ Personajes, preguntas del test, historia, sonidos y partículas
│   ├── app.js          Arranque, navegación con transiciones, sonido, puntero/parallax
│   ├── effects.js      Partículas (pétalos y destellos) en canvas
│   ├── characters.js   Creación de personajes (entrada, flotación independiente)
│   ├── test.js         Test "¿Qué personaje eres?"
│   ├── explore.js      Exploración de personajes (flechas, miniaturas, deslizar)
│   └── story.js        Historia por capítulos con escritura progresiva
├── Fondos/             fondo-pc.png (horizontal) y fondo-movil.png (vertical)
├── Personajes/         Imágenes originales + versiones sin fondo (ver abajo)
├── Sonidos/            Vacía, preparada para audio
└── Referencias/        Vacía (capturas de inspiración)
```

## Dónde editar cosas

- **Nombres, descripciones y etiquetas de personajes:** `characters` en `js/config.js`.
- **Preguntas y puntuaciones del test:** `questions` en `js/config.js`. Cada opción suma puntos a los personajes que indique.
- **Capítulos de la historia:** `story.chapters` en `js/config.js` (texto, color de ambiente y personajes en escena).
- **Posición de los personajes en la portada:** `home` en `js/config.js`.
- **Sonidos:** `audio.playlist` en `js/config.js`: lista de rutas a las canciones de `Sonidos/`, en orden (suenan en bucle). Si cambias archivos de la web, sube también `index.html` y recarga sin caché (Ctrl+F5). El botón "Sonido" activa o desactiva la música de fondo.
- **Colores y tamaños:** variables al inicio de `css/styles.css`.

## Imágenes de personajes

Los dos personajes con fondo blanco sólido (`IMG_8604.PNG` e `IMG_8611.PNG`) se usan en las versiones
`IMG_8604_sin_fondo.png` e `IMG_8611_sin_fondo.png`, generadas a partir de los originales. Los originales no se han modificado.

Los nombres de los personajes (por ejemplo "Amiga de flores" o "Dormilón") son provisionales. Son descriptivos
según lo que se ve en cada imagen y conviene cambiarlos en `config.js` por los nombres oficiales.

## Limitaciones conocidas

- **IMG_8604.PNG:** la oreja derecha sale recortada por el borde de la imagen original. Al quitar el fondo
  blanco, ese trozo de oreja se ve sólo con el contorno. Para corregirlo, hay que exportar de nuevo la imagen con margen.
- **IMG_8614.PNG:** también toca el borde derecho de la imagen original.
- **Referencias/** está vacía, así que no se ha usado ninguna referencia visual adicional.
- **Sonidos/** contiene las cuatro canciones de la lista. La reproducción en navegador real no se ha probado en Safari/iOS ni Firefox.

## Compatibilidad y pruebas

Probado con Chromium en modo headless (Playwright):
- La portada carga sin errores de consola ni de red.
- Recorrido completo del test (5 preguntas y resultado), de la exploración de personajes y de la historia (con avance de capítulos y vuelta al inicio), tanto en escritorio (1440×900) como en móvil (390×844, con táctil).
- Se corrigieron problemas de visualización detectados en las capturas: legibilidad de la portada, panel de la historia que tapaba a los personajes y escenario de personajes descentrado en móvil.

No probado: Safari/iOS, Firefox, dispositivos físicos reales, reproducción de audio y comportamiento con
"reducir movimiento" activado en el sistema (el CSS lo contempla, pero no lo he verificado en un navegador real).
