/* =========================================================
   language.js - Lectura, cuentos interactivos y creación
   de historias.
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(n, fn) { if (n) n.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }

  /* -------------------------------------------------------
     LETRAS, SÍLABAS Y PALABRAS
  ------------------------------------------------------- */
  var LETTERS = 'AEIOLMPSRT'.split('');
  var SYLLABLES = ['MA', 'PA', 'SO', 'LA', 'ME', 'PE', 'GI', 'CA', 'NU', 'TO'];
  var WORDS = [
    { w: 'MARIPOSA', img: 'butterfly' },
    { w: 'ELEFANTE', img: 'bus' },
    { w: 'CASA', img: 'house' },
    { w: 'SOL', img: 'sun' },
    { w: 'PEZ', img: 'fish' },
    { w: 'ARBOL', img: 'tree' },
    { w: 'PLANETA', img: 'planet' }
  ];

  function renderRead(tab) {
    var host = el('read-content');
    if (!host) return;
    host.innerHTML = '';

    if (tab === 'letters') {
      var grid = h('div', 'grid-cards');
      LETTERS.forEach(function (L) {
        var c = h('button', 'mod-card');
        c.innerHTML = '<div style="font-size:3rem;font-weight:900;color:#a855f7">' + L + '</div>' +
          '<div class="mod-sub">Escuchar y repetir</div>';
        c.onclick = function () {
          global.Audio.play('pop');
          global.Speech.speak('Letra ' + L, { rate: 0.7 });
          quizLetter(L);
        };
        grid.appendChild(c);
      });
      host.appendChild(grid);
      host.appendChild(h('p', 'muted', 'Toca una letra para escucharla y luego elige con qué palabra empieza.'));
    }

    if (tab === 'syllables') {
      var g2 = h('div', 'grid-cards');
      SYLLABLES.forEach(function (s) {
        var c = h('button', 'mod-card');
        c.innerHTML = '<div style="font-size:2.4rem;font-weight:900;color:#38bdf8">' + s + '</div><div class="mod-sub">Leer en voz alta</div>';
        c.onclick = function () {
          global.Audio.play('pop');
          global.Speech.speak(s + '. ' + s.split('').join('-'), { rate: 0.75 });
        };
        g2.appendChild(c);
      });
      host.appendChild(g2);
      var b = h('button', 'btn btn-primary', 'Jugar con sílabas');
      b.style.marginTop = '14px';
      b.onclick = function () { global.Activities.startArea('lectura', { count: 4 }); };
      host.appendChild(b);
    }

    if (tab === 'words') {
      var g3 = h('div', 'grid-cards');
      WORDS.forEach(function (item) {
        var c = h('button', 'mod-card');
        c.innerHTML = '<div class="mod-ico" style="background:#e0f2fe">' + Icons.art(item.img) + '</div>' +
          '<div style="font-weight:900">' + item.w + '</div><div class="mod-sub">Escuchar la palabra</div>';
        c.onclick = function () {
          global.Audio.play('pop');
          global.Speech.speak(item.w, { rate: 0.7 });
        };
        g3.appendChild(c);
      });
      host.appendChild(g3);

      // Actividad de escucha y pronunciación
      var box = h('div', 'card');
      box.innerHTML = '<h3 class="h3">Escucha y pronuncia</h3>' +
        '<p class="muted">Escucha la palabra y después repítela.</p>' +
        '<div class="act-audio-row">' +
        '<button class="btn btn-primary" id="say-word">' + Icons.svg('speaker') + ' Reproducir</button>' +
        '<button class="btn btn-soft" id="say-mic">' + Icons.svg('mic') + ' Responder</button>' +
        '<button class="btn btn-ghost" id="say-repeat">' + Icons.svg('repeat') + ' Repetir</button>' +
        '</div><p class="feedback-line" id="say-fb"></p>';
      host.appendChild(box);

      var idx = Math.floor(Math.random() * WORDS.length);
      var current = WORDS[idx].w;
      function pickWord() {
        idx = Math.floor(Math.random() * WORDS.length);
        current = WORDS[idx].w;
        el('say-fb').textContent = 'Palabra: ' + current.split('').join(' ');
      }
      pickWord();

      on(el('say-word'), function () { global.Speech.speak(current, { rate: 0.75 }); });
      on(el('say-repeat'), function () { global.Speech.speak(current, { rate: 0.65, force: true }); });
      on(el('say-mic'), function () {
        var fb = el('say-fb');
        if (!global.Speech.listenSupported()) {
          fb.className = 'feedback-line soft';
          fb.textContent = 'Tu navegador no reconoce voz. Escribe la palabra para practicar.';
          return;
        }
        fb.className = 'feedback-line soft';
        fb.textContent = 'Te escucho... di: ' + current;
        global.Speech.listen({
          onResult: function (t, fin) {
            if (!fin) return;
            var res = global.Speech.compareWord(t, current);
            if (res.ok) {
              fb.className = 'feedback-line ok';
              fb.textContent = 'Muy bien. Escuché "' + t + '".';
              global.Audio.play('correct');
              global.Feedback.confetti(20);
              global.State.logActivity({ id: 'say_' + current, area: 'lectura', skill: 'expresion', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
              setTimeout(pickWord, 1600);
            } else {
              fb.className = 'feedback-line retry';
              fb.textContent = 'Intenta pronunciarla de nuevo. Escucha otra vez.';
              global.Audio.play('wrong');
              global.Speech.speak(current, { rate: 0.6, force: true });
            }
          },
          onError: function () {
            fb.className = 'feedback-line soft';
            fb.textContent = 'No pude escuchar. Vuelve a intentarlo o escribe la palabra.';
          }
        });
      });
    }

    if (tab === 'stories') renderStoryList(host);
  }

  /* -------------------------------------------------------
     PREGUNTA RÁPIDA DE LETRA
  ------------------------------------------------------- */
  function quizLetter(letter) {
    var pool = WORDS.filter(function (w) { return w.w.charAt(0) === letter; });
    var correct = pool.length ? pool[0].w : WORDS[0].w;
    var opts = [correct];
    while (opts.length < 4) {
      var cand = WORDS[Math.floor(Math.random() * WORDS.length)].w;
      if (opts.indexOf(cand) < 0) opts.push(cand);
    }
    opts = opts.sort(function () { return Math.random() - 0.5; });

    var box = h('div', 'card');
    box.innerHTML = '<p class="act-question">¿Cuál palabra empieza con ' + letter + '?</p>';
    var ch = h('div', 'choices');
    opts.forEach(function (o) {
      var b = h('button', 'choice', '<span class="ch-key">' + o.charAt(0) + '</span><span>' + o + '</span>');
      b.onclick = function () {
        if (o === correct) {
          b.classList.add('correct');
          global.Audio.play('correct');
          global.Feedback.confetti(16);
          global.State.logActivity({ id: 'letter_' + letter, area: 'lectura', skill: 'letras', difficulty: 1, correct: true, attempts: 1, seconds: 0 });
          setTimeout(function () { box.remove(); }, 1400);
        } else {
          b.classList.add('wrong');
          global.Audio.play('wrong');
        }
      };
      ch.appendChild(b);
    });
    box.appendChild(ch);
    var close = h('button', 'btn btn-ghost', 'Cerrar');
    close.style.marginTop = '10px';
    close.onclick = function () { box.remove(); };
    box.appendChild(close);
    var host = el('read-content');
    if (host) host.appendChild(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* -------------------------------------------------------
     CUENTO INTERACTIVO
  ------------------------------------------------------- */
  var STORY = {
    start: {
      art: 'house',
      text: 'Luna encontró una puerta misteriosa al final de su jardín. Estaba cubierta de musgo y brillaba un poco.',
      choices: [
        { label: 'Abrir la puerta', next: 'open' },
        { label: 'Buscar otra entrada', next: 'search' },
        { label: 'Preguntar a alguien', next: 'ask' }
      ]
    },
    open: {
      art: 'planet',
      text: 'La puerta se abrió y detrás había un cielo lleno de estrellas. Un pequeño zorro de luz la esperaba.',
      choices: [
        { label: 'Hablar con el zorro', next: 'foxtalk' },
        { label: 'Tocar una estrella', next: 'star' }
      ]
    },
    search: {
      art: 'tree',
      text: 'Luna rodeó el jardín y encontró una ventana vieja. Desde ahí entraba una luz cálida y se oía una canción.',
      choices: [
        { label: 'Entrar por la ventana', next: 'foxtalk' },
        { label: 'Escuchar la canción', next: 'star' }
      ]
    },
    ask: {
      art: 'book',
      text: 'Preguntó a su abuelo, quien le contó que esa puerta aparece solo para quien imagina mucho.',
      choices: [
        { label: 'Volver a la puerta', next: 'open' },
        { label: 'Dibujar la puerta', next: 'draw' }
      ]
    },
    foxtalk: {
      art: 'sun',
      text: 'El zorro le dijo: "Para pasar necesitas resolver un acertijo: ¿qué crece cuando se comparte?"',
      choices: [
        { label: 'El conocimiento', next: 'end1' },
        { label: 'La comida', next: 'end2' },
        { label: 'El juguete', next: 'end2' }
      ]
    },
    star: {
      art: 'planet',
      text: 'La estrella le susurró un secreto: en el cielo hay un lugar donde los dibujos cobran vida.',
      choices: [
        { label: 'Dibujar ese lugar', next: 'draw' },
        { label: 'Seguir al zorro', next: 'foxtalk' }
      ]
    },
    draw: {
      art: 'butterfly',
      text: 'Luna dibujó la puerta y, sorprendente, su dibujo se movió. Desde entonces dibuja todos los días.',
      choices: [{ label: 'Volver a empezar', next: 'start' }]
    },
    end1: {
      art: 'book',
      text: "¡Correcto! El zorro sonrió: " + '"Lo que se comparte crece." La puerta se abrió de par en par y Luna entró a un mundo hecho de historias.',
      choices: [{ label: 'Volver a empezar', next: 'start' }]
    },
    end2: {
      art: 'house',
      text: 'El zorro negó con la cabeza y le dio otra oportunidad. Luna pensó un poco más y volvió a intentarlo.',
      choices: [{ label: 'Volver a intentar', next: 'foxtalk' }, { label: 'Empezar de nuevo', next: 'start' }]
    }
  };

  var storyNode = 'start';
  var storyPath = [];

  function renderStoryList(host) {
    host.innerHTML = '';
    var list = h('div', 'list');
    [['La puerta misteriosa de Luna', 'start'],
     ['Crea tu propio cuento', '__create']].forEach(function (s) {
      var item = h('button', 'list-item');
      item.innerHTML = '<span class="li-ico">' + Icons.svg('book') + '</span>' +
        '<span class="li-body"><span class="li-title">' + s[0] + '</span>' +
        '<span class="li-sub">Lee, toma decisiones y cambia la historia</span></span>' +
        '<span class="li-meta">Abrir</span>';
      item.onclick = function () {
        global.Audio.play('click');
        if (s[1] === '__create') { global.App.go('story-create'); global.StoryCreator.render(); }
        else { storyNode = 'start'; storyPath = []; global.App.go('story'); renderStory(); }
      };
      list.appendChild(item);
    });
    host.appendChild(list);

    var comp = h('div', 'card');
    comp.innerHTML = '<h3 class="h3">Comprensión lectora</h3>' +
      '<p>¿Quién era la personaje principal de "La puerta misteriosa"?</p>';
    var ch = h('div', 'choices');
    ['Luna', 'El zorro', 'El abuelo', 'El gato'].forEach(function (o) {
      var b = h('button', 'choice', '<span class="ch-key">' + o.charAt(0) + '</span><span>' + o + '</span>');
      b.onclick = function () {
        if (o === 'Luna') {
          b.classList.add('correct');
          global.Audio.play('correct');
          global.Feedback.confetti(16);
          global.State.logActivity({ id: 'comp_1', area: 'lectura', skill: 'comprension', difficulty: 3, correct: true, attempts: 1, seconds: 0 });
        } else { b.classList.add('wrong'); global.Audio.play('wrong'); }
      };
      ch.appendChild(b);
    });
    comp.appendChild(ch);

    var open = h('button', 'btn btn-soft', 'Cuéntame con tus propias palabras qué ocurrió');
    open.style.marginTop = '12px';
    open.onclick = function () {
      global.Feedback.modal({
        title: 'Cuéntalo con tus palabras',
        html: '<textarea id="comp-text" rows="4" style="width:100%;padding:12px;border:2px solid var(--line);border-radius:14px"></textarea>' +
          '<div class="actions"><button class="btn btn-soft" id="comp-mic">Hablar</button></div>',
        buttons: [
          { label: 'Guardar', style: 'btn-primary', onClick: function () {
              var t = (document.getElementById('comp-text') || {}).value || '';
              global.Creative.saveProject({ type: 'cuento', title: 'Mi versión del cuento', description: t });
              global.State.bumpCounter('_writings');
              global.Feedback.toast('Guardado en Mis proyectos.');
            } },
          { label: 'Cerrar', style: 'btn-ghost' }
        ]
      });
      var mic = document.getElementById('comp-mic');
      if (mic) mic.onclick = function () {
        if (!global.Speech.listenSupported()) { global.Feedback.toast('Tu navegador no permite dictado.'); return; }
        global.Speech.listen({ onResult: function (t, f) { if (f) document.getElementById('comp-text').value = t; } });
      };
    };
    comp.appendChild(open);
    host.appendChild(comp);
  }

  function renderStory() {
    var node = STORY[storyNode] || STORY.start;
    var art = el('story-art');
    var text = el('story-text');
    var choices = el('story-choices');
    if (!art) return;
    art.innerHTML = Icons.art(node.art);
    text.textContent = node.text;
    choices.innerHTML = '';
    node.choices.forEach(function (c) {
      var b = h('button', 'choice-scene');
      b.innerHTML = Icons.svg('play') + '<span>' + c.label + '</span>';
      b.onclick = function () {
        global.Audio.play('pop');
        storyPath.push(c.label);
        storyNode = c.next;
        renderStory();
        global.Speech.speak((STORY[storyNode] || STORY.start).text);
      };
      choices.appendChild(b);
    });
    global.State.save();
  }

  function initStoryScreen() {
    on(el('btn-story-listen'), function () {
      var n = STORY[storyNode] || STORY.start;
      global.Speech.speak(n.text);
    });
    on(el('btn-story-restart'), function () {
      storyNode = 'start';
      storyPath = [];
      renderStory();
    });
  }

  /* -------------------------------------------------------
     CREADOR DE HISTORIAS
  ------------------------------------------------------- */
  var StoryCreator = (function () {
    var pick = { character: null, place: null, object: null, problem: null, solution: null };

    var OPTIONS = {
      character: [{ n: 'Luna', a: 'mascot' }, { n: 'Un zorro', a: 'butterfly' }, { n: 'Un robot', a: 'robot' }, { n: 'Un gato', a: 'sun' }],
      place: [{ n: 'El bosque', a: 'tree' }, { n: 'La ciudad', a: 'city' }, { n: 'El espacio', a: 'planet' }, { n: 'El mar', a: 'fish' }],
      object: [{ n: 'Una llave', a: 'book' }, { n: 'Un mapa', a: 'book' }, { n: 'Una semilla', a: 'apple' }, { n: 'Un cohete', a: 'robot' }],
      problem: [{ n: 'Se perdió', a: 'cloud' }, { n: 'Apareció una tormenta', a: 'cloud' }, { n: 'Faltaba una pieza', a: 'robot' }, { n: 'Nadie podía dormir', a: 'sun' }],
      solution: [{ n: 'Con la ayuda de un amigo', a: 'mascot' }, { n: 'Con paciencia', a: 'book' }, { n: 'Inventando algo nuevo', a: 'robot' }, { n: 'Compartiendo', a: 'city' }]
    };

    var TITLES = ['character', 'place', 'object', 'problem', 'solution'];
    var LABELS = { character: '1. Elige tu personaje', place: '2. Elige el lugar', object: '3. Elige un objeto', problem: '4. Crea el problema', solution: '5. Crea la solución' };

    function render() {
      var host = el('story-create-body');
      host.innerHTML = '';
      TITLES.forEach(function (key) {
        var card = h('div', 'card');
        card.innerHTML = '<h3 class="h3">' + LABELS[key] + '</h3>';
        var row = h('div', 'char-grid');
        OPTIONS[key].forEach(function (o) {
          var b = h('button', 'char-opt' + (pick[key] === o.n ? ' selected' : ''));
          b.innerHTML = '<div style="width:56px;height:56px">' + Icons.art(o.a) + '</div><span>' + o.n + '</span>';
          b.onclick = function () {
            pick[key] = o.n;
            Array.prototype.forEach.call(row.children, function (x) { x.classList.remove('selected'); });
            b.classList.add('selected');
            global.Audio.play('pop');
            saveDraft();
          };
          row.appendChild(b);
        });
        card.appendChild(row);
        host.appendChild(card);
      });

      // Ordenar escenas
      var orderCard = h('div', 'card');
      orderCard.innerHTML = '<h3 class="h3">6. Ordena las escenas</h3><div class="list" id="story-order"></div>';
      host.appendChild(orderCard);
      var scenes = ['El comienzo', 'El problema', 'Lo que intentó', 'La solución', 'El final'];
      var state = scenes.slice();
      function paintOrder() {
        var box = el('story-order');
        box.innerHTML = '';
        state.forEach(function (s, i) {
          var r = h('div', 'list-item');
          r.innerHTML = '<span class="ch-key">' + (i + 1) + '</span><span class="li-body"><span class="li-title">' + s + '</span></span>';
          var up = h('button', 'btn btn-mini', 'Subir');
          var dn = h('button', 'btn btn-mini', 'Bajar');
          up.onclick = function () { if (i > 0) { var t = state[i]; state[i] = state[i - 1]; state[i - 1] = t; paintOrder(); } };
          dn.onclick = function () { if (i < state.length - 1) { var t = state[i]; state[i] = state[i + 1]; state[i + 1] = t; paintOrder(); } };
          r.appendChild(up); r.appendChild(dn);
          box.appendChild(r);
        });
        draft.order = state.slice();
      }
      paintOrder();

      // Texto / dictado / grabación
      var txt = h('div', 'card');
      txt.innerHTML = '<h3 class="h3">7. Escribe o dicta tu historia</h3>' +
        '<textarea id="story-text-area" rows="6" style="width:100%;padding:14px;border:2px solid var(--line);border-radius:14px" placeholder="Érase una vez..."></textarea>' +
        '<div class="actions">' +
        '<button class="btn btn-soft" id="story-dictate">' + Icons.svg('mic') + ' Dictar</button>' +
        '<button class="btn btn-ghost" id="story-auto">Generar borrador</button>' +
        '<button class="btn btn-primary" id="story-play">' + Icons.svg('play') + ' Reproducir mi cuento</button>' +
        '</div><p class="feedback-line" id="story-fb"></p>';
      host.appendChild(txt);

      var saveBox = h('div', 'card');
      saveBox.innerHTML = '<h3 class="h3">8. Guardar como proyecto</h3>';
      var acts = h('div', 'actions');
      var saveBtn = h('button', 'btn btn-primary', 'Guardar mi cuento');
      saveBtn.onclick = function () {
        var text = (el('story-text-area') || {}).value || '';
        if (!text.trim()) { global.Feedback.toast('Escribe o dicta tu historia primero.'); return; }
        global.Creative.saveProject({
          type: 'cuento',
          title: draftTitle(),
          description: text,
          meta: JSON.parse(JSON.stringify(pick)),
          order: (draft.order || []).join(' > '),
          activity: null
        });
        global.State.bumpCounter('_stories');
        global.Feedback.celebrate();
        global.Feedback.modal({
          art: Icons.svg('trophy'), title: 'Cuento guardado',
          text: 'Lo encuentras en Mis proyectos.',
          buttons: [{ label: 'Ver mis proyectos', style: 'btn-primary', onClick: function () { global.App.go('projects'); global.Panels.renderProjects(); } },
                    { label: 'Seguir aquí', style: 'btn-ghost' }]
        });
      };
      acts.appendChild(saveBtn);
      saveBox.appendChild(acts);
      host.appendChild(saveBox);

      on(el('story-dictate'), function () {
        if (!global.Speech.listenSupported()) { global.Feedback.toast('Tu navegador no permite dictado.'); return; }
        global.Feedback.toast('Habla ahora...');
        global.Speech.listen({
          onResult: function (t, f) {
            var ta = el('story-text-area');
            if (ta) ta.value = (ta.value ? ta.value + ' ' : '') + t;
            if (f) el('story-fb').textContent = 'Escuché: ' + t;
          }
        });
      });

      on(el('story-auto'), function () {
        var ta = el('story-text-area');
        var ch = pick.character || 'un pequeño héroe';
        var pl = pick.place || 'un lugar por descubrir';
        var ob = pick.object || 'algo desconocido';
        var pr = pick.problem || 'algo inesperado';
        var so = pick.solution || 'pidió ayuda a un amigo';
        ta.value = 'Érase una vez ' + ch + ' que vivía en ' + pl + '. ' +
          'Un día apareció ' + ob + ' y ocurrió que ' + pr + '. ' +
          'Para resolverlo, ' + so + '. ' +
          'Y así, ' + ch + ' aprendió algo nuevo para siempre.';
        if (!pick.character || !pick.place) {
          global.Feedback.toast('Usé una idea rápida. Elige personaje y lugar para personalizarlo.');
        }
        global.Speech.speak(ta.value);
      });

      on(el('story-play'), function () {
        var ta = el('story-text-area');
        if (!ta.value.trim()) { global.Feedback.toast('Primero escribe tu cuento.'); return; }
        global.Speech.speak(ta.value, { rate: 0.92 });
      });
    }

    var draft = {};

    function draftTitle() {
      return 'Cuento: ' + (pick.character || 'personaje') + ' en ' + (pick.place || 'lugar');
    }

    function saveDraft() {
      global.Storage.set('story_draft', { pick: pick, ts: Date.now() });
    }

    function load() {
      var d = global.Storage.get('story_draft', null);
      if (d && d.pick) pick = d.pick;
    }

    return { render: render, load: load };
  })();

  function init() {
    var tabs = el('read-tabs');
    if (tabs) {
      Array.prototype.forEach.call(tabs.children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          renderRead(b.getAttribute('data-tab'));
          global.Audio.play('click');
        };
      });
    }
    renderRead('letters');
    initStoryScreen();
    StoryCreator.load();
  }

  global.Language = { init: init, renderRead: renderRead, renderStory: renderStory, StoryCreator: StoryCreator };
  global.StoryCreator = StoryCreator;
})(window);
