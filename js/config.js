/*
  CONFIGURACIÓN PRINCIPAL DE CINNAMOROLL DREAM WORLD
  Aquí se editan personajes, preguntas del test, historia, sonidos y partículas.
  Las rutas son relativas a index.html.
*/
window.CDW = window.CDW || {};

/* Sello de versión: app.js comprueba que coincide con el suyo. Si no, hay archivos mezclados
   (por ejemplo un config.js antiguo en caché o en GitHub Pages) y lo avisa en la consola. */
CDW.build = '2026-10-12-musica-v3';

/* Registro de módulos: cada archivo de funcionalidad se registra aquí y app.js lo inicia. */
CDW.modules = {};
CDW.hooks = {};
CDW.register = function (screenId, hooks) {
  CDW.modules[screenId] = hooks;
  CDW.hooks[screenId] = hooks;
};

CDW.config = {

  /* ---------- PERSONAJES ----------
     file: ruta a la imagen. Los que terminan en _sin_fondo.png son versiones
           generadas a partir de los originales, que tenían fondo blanco.
     scale: multiplicador de tamaño (1 = tamaño base).
     Los nombres son provisionales: cámbialos aquí y se actualizan en toda la web. */
  characters: [
    {
      id: 'c1',
      name: 'Cinnamoroll',
      file: 'Personajes/IMG_8604_sin_fondo.png',
      scale: 1,
      tags: ['Tranquilo', 'Soñador', 'Nubes'],
      description: 'Siempre mira las nubes y piensa que el cielo tiene algo que contar. Ve la vida con calma y un poco de nostalgia dulce.',
      resultText: 'Eres un soñador tranquilo, de los que encuentran historias en las nubes.'
    },
    {
      id: 'c2',
      name: 'Cinnamoroll con osito',
      file: 'Personajes/IMG_8606.PNG',
      scale: 1,
      tags: ['Cariñoso', 'Detallista', 'Compartir'],
      description: 'Atento y cariñoso, siempre lleva algo pequeño para compartir con sus amigos.',
      resultText: 'Tienes un corazón detallista: siempre llevas algo bonito para compartir.'
    },
    {
      id: 'c3',
      name: 'Amiga de flores',
      file: 'Personajes/IMG_8609.PNG',
      scale: 1,
      tags: ['Curiosa', 'Alegre', 'Flores'],
      description: 'Curiosa y alegre, lleva flores en la cabeza y siempre tiene una sonrisa lista.',
      resultText: 'Eres curioso y alegre, con flores en la cabeza y ganas de descubrir cosas nuevas.'
    },
    {
      id: 'c4',
      name: 'Amigo nubecita',
      file: 'Personajes/IMG_8611_sin_fondo.png',
      scale: 1,
      tags: ['Juguetón', 'Abrazos', 'Esponjoso'],
      description: 'Juguetón y esponjoso, siempre busca un abrazo y un momento divertido.',
      resultText: 'Eres juguetón y esponjoso: siempre buscas un abrazo y un motivo para reír.'
    },
    {
      id: 'c5',
      name: 'Dormilón',
      file: 'Personajes/IMG_8614.PNG',
      scale: 1,
      tags: ['Relajado', 'Siesta', 'Tierno'],
      description: 'Relajado y tierno, disfruta de la siesta y de los días sin prisa.',
      resultText: 'Tu tesoro es el descanso: sabes disfrutar de los días sin prisa.'
    }
  ],

  /* ---------- PERSONAJES EN LA PORTADA ----------
     x, y: posición en porcentaje. s: tamaño relativo.
     mx, my: posición alternativa en vertical (móvil), para no tapar el título. */
  home: [
    { id: 'c1', x: '83%', y: '64%', s: 1.15, d: 1.1, enter: 'right', mx: '70%', my: '80%' },
    { id: 'c4', x: '20%', y: '74%', s: 0.85, d: 0.7, enter: 'left', mx: '22%', my: '90%' },
    { id: 'c3', x: '84%', y: '24%', s: 0.6, d: 0.5, enter: 'up', mx: '82%', my: '15%' }
  ],

  /* ---------- TEST ----------
     scores: puntos que suma cada opción a cada personaje (por id). */
  questions: [
    {
      text: 'Es una mañana perfecta en la colina de flores. ¿Qué haces primero?',
      options: [
        { label: 'Mirar el cielo y contar las nubes', scores: { c1: 2, c4: 1 } },
        { label: 'Bajar corriendo hacia el mar', scores: { c2: 2, c3: 1 } },
        { label: 'Recoger flores para un amigo', scores: { c3: 2, c2: 1 } },
        { label: 'Tumbarme a descansar con la brisa', scores: { c5: 2, c4: 1 } }
      ]
    },
    {
      text: 'Un pétalo azul cae justo frente a ti. ¿Qué haces?',
      options: [
        { label: 'Lo sigo con la mirada hasta que se pierde', scores: { c1: 2, c5: 1 } },
        { label: 'Intento atraparlo con las dos manos', scores: { c4: 2, c3: 1 } },
        { label: 'Lo guardo como un pequeño tesoro', scores: { c2: 2, c5: 1 } },
        { label: 'Le hago una foto mental para recordarlo', scores: { c3: 2, c1: 1 } }
      ]
    },
    {
      text: 'Llega la tarde y el puerto se llena de luces. ¿Qué te gusta hacer?',
      options: [
        { label: 'Pasear sin prisa por las calles blancas', scores: { c1: 2, c3: 1 } },
        { label: 'Mirar los barcos desde lo alto', scores: { c5: 2, c1: 1 } },
        { label: 'Compartir algo rico con alguien', scores: { c2: 2, c4: 1 } },
        { label: 'Jugar con las olas del muelle', scores: { c4: 2, c3: 1 } }
      ]
    },
    {
      text: '¿Qué te haría sonreír de verdad?',
      options: [
        { label: 'Un abrazo inesperado', scores: { c4: 2, c2: 1 } },
        { label: 'Un recuerdo bonito', scores: { c1: 2, c5: 1 } },
        { label: 'Un día sin preocupaciones', scores: { c5: 2, c3: 1 } },
        { label: 'Un nuevo amigo', scores: { c3: 2, c1: 1 } }
      ]
    },
    {
      text: '¿Cuál es tu sueño favorito?',
      options: [
        { label: 'Volar entre las nubes', scores: { c1: 2, c4: 1 } },
        { label: 'Dormir sobre la hierba', scores: { c5: 2 } },
        { label: 'Descubrir lugares nuevos', scores: { c2: 2, c3: 1 } },
        { label: 'Hacer feliz a los demás', scores: { c4: 2, c2: 1 } }
      ]
    }
  ],

  /* ---------- TEST PERSONALIZADO PARA MELANY ----------
     js/test.js usa este bloque. Si NO existiera (config.js antiguo), test.js vuelve a usar
     el array "questions" de arriba, que se conserva sin cambios como respaldo.

     REGLA DE LA PRIMERA OPORTUNIDAD
       La primera vez que se COMPLETA el test (en este navegador) el resultado es siempre
       firstResultId, sin mirar las respuestas. Se anota en localStorage (storageKey) al
       mostrar ese resultado. Desde la segunda vez el resultado sale de las puntuaciones.

     PUNTUACIONES (scores): puntos que suma cada opción a cada personaje (id), como en el
     test original: 2 al personaje que mejor encaja y 1 a uno secundario. Se apoyan SOLO en
     lo que existe en "characters" (sus tags, descripción y nombre):
       - tierna / tranquila / soñadora / nubes / cielo ........ c1 (Tranquilo, Soñador, Nubes)
       - alegre / enérgica / curiosa / jardín .................. c3 (Curiosa, Alegre, Flores)
       - juguetona / abrazos / consuelo ........................ c4 (Juguetón, Abrazos)
       - cariño / pequeños detalles / compartir / cuidar ....... c2 (Cariñoso, Detallista, Compartir)
       - descanso / ritmo sin prisa / estar a solas ............ c5 (Relajado, Siesta, Tierno)
     LIMITACIONES: ningún personaje tiene un rasgo "misterioso/observador" ni "responsable/
     protector". Las opciones reservadas/observadoras se reparten entre c5 y c1 (lo más
     cercano: calma y ritmo propio) y las protectoras entre c2 y c4 (cariño y abrazos).
     Las dos veces que una opción habla de "nubes" (preguntas 5 y 10) el secundario es c4 por
     su nombre ("Amigo nubecita"), no por una descripción explícita.
     Empate: gana el primero en el orden de "characters" (siempre el mismo resultado). */
  melanyQuiz: {
    storageKey: 'cdw_melany_quiz_first_result_used',
    firstResultId: 'c1',        // el conejito blanco de ojos azules (Cinnamoroll)
    secondaryRatio: 0.6,        // se menciona un segundo personaje si llega al 60 % del primero

    intro: {
      first: {
        kicker: 'Un pequeño regalo para ti',
        title: 'Melany, bienvenida a tu pequeño rincón entre las nubes. ☁️💙',
        text: 'Responde a cada pregunta con sinceridad y descubre qué personaje mágico acompaña mejor tu personalidad.',
        note: 'No hay respuestas correctas, y puedes tomarte todo el tiempo que quieras.',
        button: 'Comenzar'
      },
      returning: {
        kicker: 'Otra vez entre las nubes',
        title: 'Melany, qué bonito verte de nuevo por aquí. ☁️',
        text: 'Esta vez, tus respuestas dirán qué personaje se parece más a ti en este momento.',
        note: 'Sin prisa: aquí nadie corre.',
        button: 'Comenzar'
      }
    },

    /* Una línea suave bajo cada pregunta (una por pregunta, en orden). */
    transitions: [
      'Sin prisa: aquí no hay respuestas correctas. ☁️',
      'Cada elección enciende una pequeña estrella. ✨',
      'Puedes responder a tu ritmo, como lo hacen las nubes.',
      'Melany, este cielo es tuyo mientras quieras quedarte. 💙',
      'Vas por la mitad. Los pequeños detalles significan mucho. 💙',
      'El cielo azul sigue aquí, esperándote. ☁️',
      'Otra estrella se enciende. ✨',
      'Ya falta menos; sigue a tu ritmo.',
      'Casi llegas a la última nube. ☁️',
      'Última pregunta. Gracias por responder con calma, Melany. 💙'
    ],

    firstResult: {
      kicker: 'Tu historia comienza con…',
      text: 'Melany, hay un pequeño mundo entre las nubes que estaba esperando tu llegada. Hoy, tu historia comienza con un conejito celestial de ojos azules. ☁️💙',
      note: 'Los pequeños detalles significan mucho, y este es el primero de ellos. ✨'
    },

    laterResult: {
      kicker: 'Esta vez, tu personaje es…',
      /* Una línea por personaje, redactada sobre las RESPUESTAS de hoy (no sobre cómo es Melany). */
      perCharacter: {
        c1: 'Tus respuestas de hoy miran al cielo con calma, igual que él.',
        c2: 'Tus respuestas de hoy guardan cariño y pequeños detalles, justo lo que él lleva para compartir. 🧸',
        c3: 'Tus respuestas de hoy tienen curiosidad y alegría, como las flores de su cabeza. 🌸',
        c4: 'Tus respuestas de hoy suenan juguetonas y esponjosas, como un abrazo con sonrisa. 🤍',
        c5: 'Tus respuestas de hoy piden un ritmo sin prisa y un rato de descanso, y eso también es precioso. 🌙'
      },
      secondary: 'También hay un poquito de {name} en tus respuestas.',
      closing: 'A veces, los pequeños detalles guardan la magia más bonita. Este pequeño mundo tiene un lugar especial para ti, Melany. ✨'
    },

    questions: [
      {
        text: '¿Cómo describirías tu personalidad?',
        options: [
          { label: 'Tierna, tranquila y soñadora.',        scores: { c1: 2, c5: 1 } },
          { label: 'Alegre, energética y divertida.',      scores: { c3: 2, c4: 1 } },
          { label: 'Reservada, misteriosa y observadora.', scores: { c5: 2, c1: 1 } },
          { label: 'Amable, responsable y protectora.',    scores: { c2: 2, c4: 1 } }
        ]
      },
      {
        text: '¿Qué prefieres hacer en un día libre?',
        options: [
          { label: 'Ver películas o descansar cómodamente.',    scores: { c5: 2, c1: 1 } },
          { label: 'Salir y hacer algo divertido.',             scores: { c3: 2, c4: 1 } },
          { label: 'Escuchar música y estar en mi mundo.',      scores: { c1: 2, c5: 1 } },
          { label: 'Pasar tiempo con las personas que quiero.', scores: { c4: 2, c2: 1 } }
        ]
      },
      {
        text: 'Cuando conoces a alguien nuevo, ¿cómo eres?',
        options: [
          { label: 'Tímida al principio, pero cariñosa.',     scores: { c5: 2, c2: 1 } },
          { label: 'Hablo mucho y hago bromas.',              scores: { c4: 2, c3: 1 } },
          { label: 'Observo primero y después me abro.',      scores: { c1: 2, c5: 1 } },
          { label: 'Intento que se sienta en confianza.',     scores: { c2: 2, c4: 1 } }
        ]
      },
      {
        text: '¿Qué es lo más importante para ti en una amistad?',
        options: [
          { label: 'El cariño y los pequeños detalles.',             scores: { c2: 2, c4: 1 } },
          { label: 'Reír y vivir aventuras juntos.',                 scores: { c3: 2, c4: 1 } },
          { label: 'La confianza y que respeten mi espacio.',        scores: { c5: 2, c1: 1 } },
          { label: 'La lealtad y estar cuando me necesitan.',        scores: { c4: 2, c2: 1 } }
        ]
      },
      {
        text: '¿Cuál de estos lugares elegirías?',
        options: [
          { label: 'Un cielo lleno de nubes y estrellas.',      scores: { c1: 2, c4: 1 } },
          { label: 'Un parque lleno de colores.',               scores: { c3: 2, c4: 1 } },
          { label: 'Una habitación oscura con luces bonitas.',  scores: { c5: 2, c1: 1 } },
          { label: 'Un jardín tranquilo y acogedor.',           scores: { c3: 2, c2: 1 } }
        ]
      },
      {
        text: '¿Cómo reaccionas cuando estás triste?',
        options: [
          { label: 'Busco consuelo en alguien de confianza.',          scores: { c4: 2, c2: 1 } },
          { label: 'Intento distraerme y animarme.',                   scores: { c3: 2, c4: 1 } },
          { label: 'Prefiero procesarlo a solas.',                     scores: { c5: 2, c1: 1 } },
          { label: 'Hablo con alguien que me haga sentir segura.',     scores: { c2: 2, c5: 1 } }
        ]
      },
      {
        text: '¿Qué detalle te haría más feliz?',
        options: [
          { label: 'Una carta hecha especialmente para mí.',               scores: { c2: 2, c1: 1 } },
          { label: 'Una sorpresa divertida e inesperada.',                 scores: { c3: 2, c4: 1 } },
          { label: 'Algo pequeño que demuestre que me conocen.',           scores: { c2: 2, c5: 1 } },
          { label: 'Que alguien recuerde algo importante para mí.',        scores: { c1: 2, c2: 1 } }
        ]
      },
      {
        text: '¿Qué papel tienes en tu grupo de amigos?',
        options: [
          { label: 'La dulce que escucha a todos.',                       scores: { c2: 2, c5: 1 } },
          { label: 'La que aporta energía y diversión.',                  scores: { c3: 2, c4: 1 } },
          { label: 'La tranquila que nota hasta los pequeños detalles.',  scores: { c1: 2, c2: 1 } },
          { label: 'La que cuida y apoya a los demás.',                   scores: { c2: 2, c4: 1 } }
        ]
      },
      {
        text: '¿Qué frase se parece más a ti?',
        options: [
          { label: 'Los pequeños momentos hacen la vida bonita.',        scores: { c1: 2, c2: 1 } },
          { label: 'Siempre hay algo nuevo por descubrir.',              scores: { c3: 2, c4: 1 } },
          { label: 'No todos conocen mi verdadero mundo.',               scores: { c5: 2, c1: 1 } },
          { label: 'Quiero que las personas que amo estén bien.',        scores: { c4: 2, c2: 1 } }
        ]
      },
      {
        text: 'Si fueras un personaje de un mundo mágico, ¿qué serías?',
        options: [
          { label: 'Un conejito celestial entre las nubes.',   scores: { c1: 2, c4: 1 } },
          { label: 'Una criatura arcoíris llena de energía.',  scores: { c3: 2, c4: 1 } },
          { label: 'Un espíritu de estrellas y secretos.',     scores: { c5: 2, c1: 1 } },
          { label: 'Un guardián mágico del jardín.',           scores: { c2: 2, c3: 1 } }
        ]
      }
    ]
  },

  /* ---------- HISTORIA ----------
     Cada capítulo: título, texto, color de ambiente (tint) y escena
     (personajes que aparecen, con posición y dirección de entrada). */
  story: {
    chapters: [
      {
        title: 'Capítulo 1: El cielo que sonríe',
        text: 'Una mañana sin prisa, Cinnamoroll notó que las nubes parecían formar caras. Le dio la sensación de que querían decirle algo.',
        tint: 'rgba(255, 220, 240, 0.10)',
        scene: [
          { id: 'c1', x: '32%', y: '42%', s: 1.2, enter: 'left' }
        ]
      },
      {
        title: 'Capítulo 2: La colina de flores',
        text: 'Bajó por la colina cubierta de flores azules. Cada paso dejaba un pétalo flotando en el aire, como si lo siguiera.',
        tint: 'transparent',
        scene: [
          { id: 'c1', x: '24%', y: '42%', s: 1.1, enter: 'left' },
          { id: 'c3', x: '74%', y: '42%', s: 0.95, enter: 'right', flip: true }
        ]
      },
      {
        title: 'Capítulo 3: Un encuentro dulce',
        text: 'Por el camino se encontró con sus amigos. Cada uno tenía una forma distinta de soñar, y todos tenían algo que compartir.',
        tint: 'rgba(200, 235, 255, 0.10)',
        scene: [
          { id: 'c2', x: '20%', y: '42%', s: 0.95, enter: 'left' },
          { id: 'c4', x: '50%', y: '42%', s: 0.9, enter: 'up' },
          { id: 'c5', x: '80%', y: '42%', s: 1.0, enter: 'right', flip: true }
        ]
      },
      {
        title: 'Capítulo 4: Las luces del puerto',
        text: 'Cuando llegó la tarde, el puerto se llenó de luces. Juntos miraron los barcos y prometieron volver a soñar otra vez.',
        tint: 'rgba(255, 190, 140, 0.16)',
        scene: [
          { id: 'c1', x: '30%', y: '42%', s: 1.05, enter: 'left' },
          { id: 'c3', x: '56%', y: '42%', s: 0.9, enter: 'up' },
          { id: 'c5', x: '80%', y: '42%', s: 0.95, enter: 'right' }
        ]
      },
      {
        title: 'Fin del sueño… por ahora',
        text: 'Y así, en Dream World, cada día termina con una nueva historia esperando a que la descubras.',
        tint: 'rgba(255, 240, 200, 0.14)',
        scene: [
          { id: 'c1', x: '38%', y: '42%', s: 1.15, enter: 'up' },
          { id: 'c4', x: '66%', y: '42%', s: 1.0, enter: 'up', flip: true }
        ]
      }
    ]
  },

  /* ---------- SONIDOS ----------
     playlist: canciones locales de la carpeta Sonidos/, en orden. Al terminar una suena la
     siguiente y, tras la última, vuelve a la primera. Rutas relativas (válidas en GitHub Pages
     aunque la web esté en una subruta). Los nombres están escritos con códigos \uXXXX para que
     no dependan de la codificación del archivo; el nombre real va en el comentario de cada línea.
     click / pop: sonidos opcionales (null = sin sonido). */
  audio: {
    playlist: [
      'Sonidos/Star Dome (\u30b9\u30bf\u30fc\u30c9\u30fc\u30e0) \u2014 Cinnamoroll.mp3',  // 1. Star Dome (スタードーム) — Cinnamoroll.mp3
      'Sonidos/Tokimeki Rainbow (\u3068\u304d\u3081\u304d\u30ec\u30a4\u30f3\u30dc\u30fc) \u2014 Cinnamoroll.mp3',  // 2. Tokimeki Rainbow (ときめきレインボー) — Cinnamoroll.mp3
      'Sonidos/Shiawase no Label.mp3',  // 3. Shiawase no Label.mp3
      'Sonidos/Fure Fure Ganbare! (\u3075\u308c\u30fc\u3075\u308c\u30fc\u304c\u3093\u3070\u308c\u30fc\uff01).mp3'  // 4. Fure Fure Ganbare! (ふれーふれーがんばれー！).mp3
    ],
    click: null,     // sonido al pulsar botones
    pop: null        // sonido al tocar un personaje
  },

  /* ---------- PARTÍCULAS ---------- */
  particles: {
    desktop: 70,
    mobile: 26
  }
};
