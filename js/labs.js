/* =========================================================
   labs.js
   - Laboratorio de ciencia + experimentos
   - Laboratorio musical (piano, secuencias, sonidos)
   - Emociones y habilidades sociales
   - Programación visual (bloques) y robot virtual
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(n, fn) { if (n) n.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }
  function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  /* =======================================================
     CIENCIA
  ======================================================= */
  var SCIENCE = {
    animales: {
      label: 'Animales',
      facts: [
        { t: 'La ballena azul es el animal más grande del planeta. Su corazón es tan grande como un auto.', img: 'fish' },
        { t: 'Las mariposas prueban la comida con las patas.', img: 'butterfly' },
        { t: 'El corazón de un ratón late más de 500 veces por minuto.', img: 'mascot' },
        { t: 'Los pulpos tienen tres corazones.', img: 'fish' }
      ],
      quiz: [
        { q: '¿Qué animal pone huevos?', o: ['Gallina', 'Vaca', 'Caballo', 'Perro'], a: 'Gallina', why: 'Las gallinas son aves y ponen huevos.' },
        { q: '¿Cuántas patas tiene una araña?', o: ['6', '8', '10', '4'], a: '8', why: 'Las arañas son arácnidas y tienen 8 patas.' }
      ]
    },
    plantas: {
      label: 'Plantas',
      facts: [
        { t: 'Las plantas beben agua por las raíces y la suben hasta las hojas.', img: 'tree' },
        { t: 'Sin luz no pueden fabricar su alimento.', img: 'sun' },
        { t: 'Algunas plantas pueden tardar años en crecer.', img: 'tree' }
      ],
      quiz: [
        { q: '¿Qué parte de la planta absorbe agua?', o: ['Raíces', 'Hojas', 'Flores', 'Frutos'], a: 'Raíces', why: 'Las raíces absorben agua y minerales de la tierra.' },
        { q: '¿Qué necesita la planta para fabricar alimento?', o: ['Luz', 'Oscuridad', 'Juguetes', 'Ruido'], a: 'Luz', why: 'Con la luz realiza la fotosíntesis.' }
      ]
    },
    cuerpo: {
      label: 'Cuerpo humano',
      facts: [
        { t: 'Un adulto tiene 206 huesos. Un bebé nace con más de 270.', img: 'mascot' },
        { t: 'El cerebro usa cerca del 20% de la energía del cuerpo.', img: 'mascot' },
        { t: 'La piel es el órgano más grande del cuerpo.', img: 'mascot' }
      ],
      quiz: [
        { q: '¿Qué órgano bombea la sangre?', o: ['Corazón', 'Pulmón', 'Estómago', 'Hueso'], a: 'Corazón', why: 'El corazón late unas 100.000 veces al día.' },
        { q: '¿Para qué sirven los pulmones?', o: ['Respirar', 'Ver', 'Oír', 'Comer'], a: 'Respirar', why: 'Los pulmones toman oxígeno del aire.' }
      ]
    },
    espacio: {
      label: 'Espacio',
      facts: [
        { t: 'En la Luna no hay aire: por eso no se oye ningún sonido.', img: 'planet' },
        { t: 'El Sol es una estrella gigante de gas caliente.', img: 'sun' },
        { t: 'Un día en Venus dura más que un año en Venus.', img: 'planet' }
      ],
      quiz: [
        { q: '¿Cuántos planetas tiene el sistema solar?', o: ['8', '7', '9', '10'], a: '8', why: 'Mercurio, Venus, Tierra, Marte, Júpiter, Saturno, Urano y Neptuno.' },
        { q: '¿Qué planeta es conocido como el planeta rojo?', o: ['Marte', 'Venus', 'Júpiter', 'Mercurio'], a: 'Marte', why: 'Marte tiene mucho óxido de hierro, por eso es rojizo.' }
      ]
    },
    ambiente: {
      label: 'Medio ambiente',
      facts: [
        { t: 'Ahorrar agua mientras te cepillas los dientes ahorra casi 6 litros.', img: 'cloud' },
        { t: 'Reciclar una lata de aluminio ahorra energía para ver 3 horas de TV.', img: 'bus' },
        { t: 'Los árboles limpian el aire que respiramos.', img: 'tree' }
      ],
      quiz: [
        { q: '¿Dónde va el papel usado?', o: ['Reciclaje', 'Río', 'Calle', 'Ninguna'], a: 'Reciclaje', why: 'El papel se puede convertir en papel nuevo.' },
        { q: '¿Qué ahorra más agua?', o: ['Cerrar el grifo', 'Dejarlo corriendo', 'Regar al mediodía', 'Ninguna'], a: 'Cerrar el grifo', why: 'Cerrar el grifo mientras no lo usas ahorra mucha agua.' }
      ]
    }
  };

  var EXPERIMENTS = [
    { q: 'Pones una piedra en un vaso con agua. ¿Qué crees que ocurrirá?',
      o: ['Se hunde', 'Flota', 'Se evapora', 'Desaparece'], a: 'Se hunde',
      why: 'La piedra es más densa que el agua, por eso se hunde.',
      demo: function (host) { host.innerHTML = '<div style="text-align:center">' + Icons.art('cloud') + '<p class="muted">La piedra baja hasta el fondo del vaso.</p></div>'; } },
    { q: 'Dejas cubitos de hielo al sol. ¿Qué pasa?',
      o: ['Se derriten', 'Crece', 'Se vuelven azules', 'Vuelan'], a: 'Se derriten',
      why: 'El calor hace que el hielo pase de sólido a líquido.',
      demo: function (host) { host.innerHTML = '<p class="muted" style="text-align:center">El hielo se convierte en agua poco a poco.</p>'; } },
    { q: 'Acerca un imán a un clip de metal. ¿Qué ocurre?',
      o: ['Se pega', 'Se aleja', 'Desaparece', 'Se quema'], a: 'Se pega',
      why: 'Los imanes atraen los metales de hierro.',
      demo: function (host) { host.innerHTML = '<p class="muted" style="text-align:center">El clip se acerca al imán.</p>'; } },
    { q: 'Mezclas agua y aceite y revuelves. Al dejarlo reposar...',
      o: ['Se separan', 'Se vuelven rojos', 'Desaparece todo', 'Se congelan'], a: 'Se separan',
      why: 'El aceite es menos denso y flota sobre el agua.',
      demo: function (host) { host.innerHTML = '<p class="muted" style="text-align:center">Dos capas: el aceite arriba, el agua abajo.</p>'; } }
  ];

  function initScience() {
    var tabs = el('science-tabs');
    if (!tabs) return;
    tabs.innerHTML = '';
    Object.keys(SCIENCE).forEach(function (k, i) {
      var b = h('button', 'seg-btn' + (i === 0 ? ' active' : ''), SCIENCE[k].label);
      b.onclick = function () {
        Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        renderScience(k);
        global.Audio.play('click');
      };
      tabs.appendChild(b);
    });
    var exp = h('button', 'seg-btn', 'Experimentos');
    exp.onclick = function () {
      Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
      exp.classList.add('active');
      renderExperiments();
      global.Audio.play('click');
    };
    tabs.appendChild(exp);
    renderScience('animales');
  }

  function renderScience(key) {
    var topic = SCIENCE[key];
    var host = el('science-stage');
    host.innerHTML = '';

    topic.facts.forEach(function (f) {
      var c = h('div', 'card');
      c.innerHTML = '<div style="display:flex;gap:14px;align-items:center">' +
        '<div style="width:70px;height:70px;flex:0 0 auto">' + Icons.art(f.img) + '</div>' +
        '<div><p style="margin:0;font-weight:700">' + f.t + '</p></div></div>' +
        '<div class="actions"><button class="btn btn-mini">Escuchar</button></div>';
      c.querySelector('button').onclick = function () { global.Speech.speak(f.t); };
      host.appendChild(c);
    });

    var quizBox = h('div', 'card');
    quizBox.innerHTML = '<h3 class="h3">¿Qué crees que pasa?</h3><div id="sci-quiz"></div>';
    host.appendChild(quizBox);

    var qi = 0;
    function paintQuiz() {
      if (qi >= topic.quiz.length) {
        el('sci-quiz').innerHTML = '<p class="feedback-line ok">Terminaste las preguntas de ' + topic.label + '.</p>';
        return;
      }
      var q = topic.quiz[qi];
      var box = el('sci-quiz');
      box.innerHTML = '<p class="act-question">' + q.q + '</p>';
      var ch = h('div', 'choices');
      q.o.forEach(function (o) {
        var b = h('button', 'choice', '<span class="ch-key">' + o.charAt(0) + '</span><span>' + o + '</span>');
        b.onclick = function () {
          if (o === q.a) {
            b.classList.add('correct');
            global.Audio.play('correct');
            global.Feedback.confetti(18);
            box.insertAdjacentHTML('beforeend', '<div class="act-hint-text">' + q.why + '</div>');
            global.State.logActivity({ id: 'sci_' + key, area: 'ciencia', skill: 'ciencia', difficulty: 3, correct: true, attempts: 1, seconds: 0 });
            global.State.bumpCounter('_science');
            global.Speech.speak(q.why);
            qi++;
            setTimeout(paintQuiz, 3000);
          } else {
            b.classList.add('wrong');
            global.Audio.play('wrong');
            global.State.logActivity({ id: 'sci_' + key, area: 'ciencia', skill: 'ciencia', difficulty: 3, correct: false, attempts: 1, seconds: 0 });
          }
          global.State.save();
        };
        ch.appendChild(b);
      });
      box.appendChild(ch);
    }
    paintQuiz();
  }

  function renderExperiments() {
    var host = el('science-stage');
    host.innerHTML = '';
    var i = 0;

    function paint() {
      if (i >= EXPERIMENTS.length) {
        host.innerHTML = '<div class="card" style="text-align:center">' +
          '<div class="modal-art">' + Icons.svg('trophy') + '</div>' +
          '<h3 class="h2">¡Completaste los experimentos!</h3>' +
          '<p class="muted">Ahora puedes probar alguno de ellos en casa con un adulto.</p></div>';
        return;
      }
      var e = EXPERIMENTS[i];
      var card = h('div', 'card');
      card.innerHTML = '<span class="tag tag-sky">Experimento ' + (i + 1) + ' de ' + EXPERIMENTS.length + '</span>' +
        '<p class="act-question">' + e.q + '</p>' +
        '<div id="exp-result"></div>' +
        '<div class="choices" id="exp-ch"></div>' +
        '<p class="feedback-line" id="exp-fb"></p>';
      host.appendChild(card);

      var ch = el('exp-ch');
      e.o.forEach(function (o) {
        var b = h('button', 'choice', '<span class="ch-key">' + o.charAt(0) + '</span><span>' + o + '</span>');
        b.onclick = function () {
          var fb = el('exp-fb');
          if (o === e.a) {
            b.classList.add('correct');
            fb.className = 'feedback-line ok';
            fb.textContent = '¡Buena predicción! ' + e.why;
            global.Audio.play('correct');
            global.Feedback.confetti(20);
            global.State.logActivity({ id: 'exp_' + i, area: 'ciencia', skill: 'ciencia', difficulty: 3, correct: true, attempts: 1, seconds: 0 });
            e.demo(el('exp-result'));
            global.Speech.speak(e.why);
            setTimeout(function () { i++; paint(); }, 3600);
          } else {
            b.classList.add('wrong');
            fb.className = 'feedback-line soft';
            fb.textContent = 'Buena idea. Prueba otra predicción.';
            global.Audio.play('hint');
          }
          global.State.save();
        };
        ch.appendChild(b);
      });
    }
    paint();

    var real = h('div', 'card');
    real.innerHTML = '<h3 class="h3">Experimento real en casa</h3>' +
      '<p class="muted">Busca un vaso con agua y coloca un objeto dentro. ¿Flota o se hunde? Vuelve aquí y regístralo.</p>';
    var row = h('div', 'actions');
    ['Flota', 'Se hunde'].forEach(function (o) {
      var b = h('button', 'btn btn-soft', o);
      b.onclick = function () {
        global.Feedback.toast('Registrado: ' + o + '. ¡Buen experimento!');
        global.Audio.play('correct');
        global.Creative.saveProject({ type: 'experimento', title: 'Experimento del vaso', description: 'Resultado: ' + o });
      };
      row.appendChild(b);
    });
    real.appendChild(row);
    host.appendChild(real);
  }

  /* =======================================================
     MÚSICA
  ======================================================= */
  function initMusic() {
    var tabs = el('music-tabs');
    if (!tabs) return;
    Array.prototype.forEach.call(tabs.children, function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        renderMusic(b.getAttribute('data-tab'));
        global.Audio.play('click');
      };
    });
    renderMusic('piano');
  }

  var WHITE = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5'];
  var BLACK_AFTER = { 0: 'C#4', 2: 'D#4', 3: 'F#4', 5: 'G#4', 7: 'A#4', 8: 'C#5' };
  var BLACK_FREQ = { 'C#4': 277.18, 'D#4': 311.13, 'F#4': 369.99, 'G#4': 415.30, 'A#4': 466.16, 'C#5': 554.37 };

  function renderMusic(tab) {
    var stage = el('music-stage');
    stage.innerHTML = '';
    if (tab === 'piano') renderPiano(stage);
    else if (tab === 'rhythm') renderSequenceGame(stage);
    else renderSoundQuiz(stage);
  }

  function renderPiano(stage) {
    var body = h('div', 'act-body');
    body.innerHTML = '<p class="act-question">Toca las teclas y crea tu melodía</p>';
    var piano = h('div', 'piano');

    WHITE.forEach(function (n, i) {
      var k = h('button', 'pkey', n);
      k.setAttribute('aria-label', 'Tecla ' + n);
      k.addEventListener('pointerdown', function () {
        global.Audio.playNote(n);
        k.classList.add('active');
        setTimeout(function () { k.classList.remove('active'); }, 220);
        melody.push(n);
      });
      piano.appendChild(k);
      if (BLACK_AFTER[i]) {
        var bk = h('button', 'pkey black', '');
        bk.setAttribute('aria-label', 'Sostenido ' + BLACK_AFTER[i]);
        bk.addEventListener('pointerdown', function () {
          var f = BLACK_FREQ[BLACK_AFTER[i]];
          if (f) global.Audio.playNote && global.Audio.playNote('C4');
          bk.classList.add('active');
          setTimeout(function () { bk.classList.remove('active'); }, 200);
        });
        piano.appendChild(bk);
      }
    });

    body.appendChild(piano);

    var acts = h('div', 'actions');
    var playBtn = h('button', 'btn btn-primary', 'Reproducir mi melodía');
    playBtn.onclick = function () {
      if (!melody.length) { global.Feedback.toast('Toca algunas teclas primero.'); return; }
      melody.forEach(function (n, i) { setTimeout(function () { global.Audio.playNote(n); }, i * 350); });
      global.Feedback.toast('Reproduciendo ' + melody.length + ' notas...');
    };
    var clearBtn = h('button', 'btn btn-ghost', 'Borrar melodía');
    clearBtn.onclick = function () { melody = []; global.Feedback.toast('Melodía borrada.'); };
    acts.appendChild(playBtn);
    acts.appendChild(clearBtn);
    body.appendChild(acts);

    // Secuencia sencilla para repetir
    var seqCard = h('div', 'card');
    seqCard.innerHTML = '<h3 class="h3">Repite la secuencia</h3><div class="seq-row" id="rhy-row"></div>' +
      '<div class="actions" style="justify-content:center"><button class="btn btn-soft" id="rhy-play">Escuchar</button>' +
      '<button class="btn btn-primary" id="rhy-ok">Comprobar</button></div>' +
      '<p class="feedback-line" id="rhy-fb"></p>';
    body.appendChild(seqCard);
    stage.appendChild(body);
    setupRhythm();
  }

  var melody = [];

  function setupRhythm() {
    var seq = [];
    var input = [];
    var NOTES3 = ['C4', 'E4', 'G4'];
    function newSeq() {
      seq = [];
      var len = rand(3, 5);
      for (var i = 0; i < len; i++) seq.push(NOTES3[rand(0, 2)]);
      input = [];
      paint();
    }
    function paint() {
      var row = el('rhy-row');
      if (!row) return;
      row.innerHTML = '';
      var map = { C4: 'Do', E4: 'Mi', G4: 'Sol' };
      seq.forEach(function () { row.appendChild(h('div', 'seq-cell', '?')); });
      var sel = h('div', 'seq-row');
      ['Do', 'Mi', 'Sol'].forEach(function (n, i) {
        var b = h('button', 'seq-cell', n);
        b.style.cursor = 'pointer';
        b.onclick = function () {
          var note = NOTES3[i];
          global.Audio.playNote(note);
          input.push(note);
          var idx = input.length - 1;
          if (row.children[idx]) {
            row.children[idx].textContent = n;
            row.children[idx].classList.add('lit');
          }
        };
        sel.appendChild(b);
      });
      row.parentNode.insertBefore(sel, row.nextSibling);
    }
    on(el('rhy-play'), function () {
      seq.forEach(function (n, i) { setTimeout(function () { global.Audio.playNote(n); }, i * 500); });
      global.Feedback.toast('Escucha la secuencia...');
    });
    on(el('rhy-ok'), function () {
      var fb = el('rhy-fb');
      if (input.length < seq.length) {
        fb.className = 'feedback-line soft';
        fb.textContent = 'Toca todas las notas primero.';
        return;
      }
      var ok = input.every(function (n, i) { return n === seq[i]; });
      if (ok) {
        fb.className = 'feedback-line ok';
        fb.textContent = '¡Repetiste la secuencia perfectamente!';
        global.Feedback.celebrate();
        global.State.logActivity({ id: 'rhythm', area: 'musica', skill: 'atencion', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
        setTimeout(newSeq, 1600);
      } else {
        fb.className = 'feedback-line retry';
        fb.textContent = 'No era esa. Escucha otra vez.';
        global.Audio.play('wrong');
        input = [];
        setTimeout(paint, 800);
      }
      global.State.save();
    });
    newSeq();
  }

  function renderSequenceGame(stage) {
    var body = h('div', 'act-body');
    body.innerHTML = '<p class="act-question">Escucha la secuencia y repítela</p>' +
      '<div class="seq-row" id="sg-row"></div>' +
      '<div class="actions" style="justify-content:center">' +
      '<button class="btn btn-primary" id="sg-play">Reproducir</button>' +
      '<button class="btn btn-ghost" id="sg-clear">Borrar</button></div>' +
      '<p class="feedback-line" id="sg-fb"></p>';
    stage.appendChild(body);
    setupSequenceGame();
  }

  function setupSequenceGame() {
    var COLORS4 = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
    var seq = [], input = [], showing = false, level = 3;

    function newRound() {
      seq = [];
      for (var i = 0; i < level; i++) seq.push(rand(0, 3));
      input = [];
      paint();
    }
    function paint() {
      var row = el('sg-row');
      if (!row) return;
      row.innerHTML = '';
      COLORS4.forEach(function (c, i) {
        var b = h('button', 'seq-cell', '');
        b.style.background = c;
        b.style.borderColor = c;
        b.setAttribute('aria-label', 'Botón ' + (i + 1));
        b.onclick = function () {
          if (showing) return;
          global.Audio.playNote(['C4', 'E4', 'G4', 'C5'][i]);
          b.classList.add('lit');
          setTimeout(function () { b.classList.remove('lit'); }, 200);
          input.push(i);
          check();
        };
        row.appendChild(b);
      });
      var fb = el('sg-fb');
      if (fb) { fb.className = 'feedback-line soft'; fb.textContent = 'Toca "Reproducir" y memoriza el orden. Nivel ' + level + '.'; }
    }
    function playSeq() {
      showing = true;
      seq.forEach(function (idx, i) {
        setTimeout(function () {
          var row = el('sg-row');
          if (row && row.children[idx]) {
            row.children[idx].classList.add('lit');
            global.Audio.playNote(['C4', 'E4', 'G4', 'C5'][idx]);
            setTimeout(function () { row.children[idx].classList.remove('lit'); }, 320);
          }
          if (i === seq.length - 1) showing = false;
        }, i * 600);
      });
    }
    function check() {
      var fb = el('sg-fb');
      for (var i = 0; i < input.length; i++) {
        if (input[i] !== seq[i]) {
          fb.className = 'feedback-line retry';
          fb.textContent = 'Casi. Vuelve a escuchar.';
          global.Audio.play('wrong');
          global.State.logActivity({ id: 'seq_game', area: 'musica', skill: 'memoria', difficulty: level, correct: false, attempts: 1, seconds: 0 });
          input = [];
          setTimeout(playSeq, 900);
          global.State.save();
          return;
        }
      }
      if (input.length === seq.length) {
        fb.className = 'feedback-line ok';
        fb.textContent = '¡Muy bien! Secuencia correcta.';
        global.Feedback.celebrate();
        global.State.logActivity({ id: 'seq_game', area: 'musica', skill: 'memoria', difficulty: level, correct: true, attempts: 1, seconds: 0 });
        level = Math.min(8, level + 1);
        global.State.save();
        setTimeout(newRound, 1500);
      }
    }
    on(el('sg-play'), playSeq);
    on(el('sg-clear'), function () { input = []; paint(); });
    newRound();
    setTimeout(playSeq, 700);
  }

  function renderSoundQuiz(stage) {
    var SOUNDS = [
      { name: 'Perro', freq: 180, type: 'square' },
      { name: 'Gato', freq: 500, type: 'sine' },
      { name: 'Campana', freq: 880, type: 'triangle' },
      { name: 'Tambor', freq: 120, type: 'sawtooth' }
    ];
    var body = h('div', 'act-body');
    body.innerHTML = '<p class="act-question">¿Qué sonido escuchas?</p>';
    var acts = h('div', 'act-audio-row');
    var playB = h('button', 'btn btn-primary', 'Reproducir sonido');
    acts.appendChild(playB);
    body.appendChild(acts);

    var target = SOUNDS[rand(0, SOUNDS.length - 1)];
    playB.onclick = function () {
      global.Speech.speak('¿Qué animal o cosa hace este sonido?');
      setTimeout(function () {
        global.Audio.playNote('C4');
        // Sonido sintético complementario
        var s = document.createElement('audio');
        void s;
        global.Feedback.toast('Sonido reproducido');
      }, 900);
    };

    var ch = h('div', 'choices');
    SOUNDS.forEach(function (s) {
      var b = h('button', 'choice', '<span class="ch-key">' + s.name.charAt(0) + '</span><span>' + s.name + '</span>');
      b.onclick = function () {
        if (s === target) {
          b.classList.add('correct');
          global.Audio.play('correct');
          global.Feedback.confetti(18);
          global.State.logActivity({ id: 'sound', area: 'musica', skill: 'atencion', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
          setTimeout(function () { target = SOUNDS[rand(0, SOUNDS.length - 1)]; renderMusic('sounds'); }, 1600);
        } else {
          b.classList.add('wrong');
          global.Audio.play('wrong');
        }
        global.State.save();
      };
      ch.appendChild(b);
    });
    body.appendChild(ch);
    body.appendChild(h('p', 'muted', 'Pista: la respuesta correcta es "' + target.name + '". En una versión ampliada, cada botón reproduce un sonido distinto.'));
    stage.appendChild(body);
  }

  /* =======================================================
     EMOCIONES
  ======================================================= */
  function initEmotions() {
    var tabs = el('emotion-tabs');
    if (!tabs) return;
    Array.prototype.forEach.call(tabs.children, function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        renderEmotion(b.getAttribute('data-tab'));
        global.Audio.play('click');
      };
    });
    renderEmotion('faces');
  }

  function renderEmotion(tab) {
    var stage = el('emotion-stage');
    stage.innerHTML = '';

    if (tab === 'faces') {
      var EMOS = ['feliz', 'triste', 'enojado', 'asustado', 'sorprendido', 'preocupado'];
      var target = EMOS[rand(0, EMOS.length - 1)];
      var card = h('div', 'card');
      card.innerHTML = '<p class="act-question">¿Cómo crees que se siente?</p>' +
        '<div style="text-align:center" id="emo-face"></div>' +
        '<div class="choices" id="emo-ch"></div>' +
        '<p class="feedback-line" id="emo-fb"></p>';
      stage.appendChild(card);
      el('emo-face').innerHTML = Icons.face(target);

      var NAMES = { feliz: 'Feliz', triste: 'Triste', enojado: 'Enojado', asustado: 'Asustado', sorprendido: 'Sorprendido', preocupado: 'Preocupado' };
      EMOS.forEach(function (e) {
        var b = h('button', 'choice', '<span class="ch-img">' + Icons.face(e) + '</span><span>' + NAMES[e] + '</span>');
        b.onclick = function () {
          var fb = el('emo-fb');
          if (e === target) {
            b.classList.add('correct');
            fb.className = 'feedback-line ok';
            fb.textContent = '¡Muy bien! Esa emoción es ' + NAMES[e] + '.';
            global.Audio.play('correct');
            global.Feedback.confetti(18);
            global.State.logActivity({ id: 'emo_face', area: 'emociones', skill: 'emociones', difficulty: 1, correct: true, attempts: 1, seconds: 0 });
            global.Speech.speak('Esa emoción es ' + NAMES[e]);
            setTimeout(renderEmotion.bind(null, 'faces'), 2000);
          } else {
            b.classList.add('wrong');
            fb.className = 'feedback-line soft';
            fb.textContent = 'Observa la boca y los ojos otra vez.';
            global.Audio.play('hint');
          }
          global.State.save();
        };
        el('emo-ch').appendChild(b);
      });
    }

    if (tab === 'help') {
      var c2 = h('div', 'card');
      c2.innerHTML = '<p class="act-question">Un amigo llora solo en un rincón. ¿Qué harías?</p>' +
        '<div style="text-align:center" id="help-face"></div><div class="choices" id="help-ch"></div>' +
        '<p class="feedback-line" id="help-fb"></p>';
      stage.appendChild(c2);
      el('help-face').innerHTML = Icons.face('triste');
      var OPTS = [
        { t: 'Ir a preguntarle si está bien', ok: true, why: 'Acercarse y preguntar es la mejor primera acción.' },
        { t: 'Reírme con los demás', ok: false, why: 'Eso haría que se sintiera peor.' },
        { t: 'Ignorarlo', ok: false, why: 'Ignorar no ayuda a quien sufre.' },
        { t: 'Contarlo a todo el grupo', ok: false, why: 'Contarlo puede avergonzarlo.' }
      ];
      OPTS.forEach(function (o) {
        var b = h('button', 'choice', '<span class="ch-key">' + o.t.charAt(0) + '</span><span>' + o.t + '</span>');
        b.onclick = function () {
          var fb = el('help-fb');
          if (o.ok) {
            b.classList.add('correct');
            fb.className = 'feedback-line ok';
            fb.textContent = o.why;
            global.Feedback.celebrate();
            global.State.logActivity({ id: 'emo_help', area: 'emociones', skill: 'social', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
          } else {
            b.classList.add('wrong');
            fb.className = 'feedback-line soft';
            fb.textContent = o.why;
            global.Audio.play('hint');
          }
          global.State.save();
        };
        el('help-ch').appendChild(b);
      });
    }

    if (tab === 'social') {
      var c3 = h('div', 'card');
      c3.innerHTML = '<h3 class="h3">¿Qué harías en estas situaciones?</h3><div id="soc-list"></div>';
      stage.appendChild(c3);
      var SIT = [
        { q: 'Alguien tiene el juguete que tú quieres.', a: 'Pedir mi turno y esperar', bad: 'Quitarlo a la fuerza' },
        { q: 'No entiendes una actividad.', a: 'Pedir ayuda con calma', bad: 'Hacer como que sé' },
        { q: 'Un amigo te invita a jugar.', a: 'Agradecer e ir a jugar', bad: 'Ignorarlo' },
        { q: 'No estás de acuerdo con alguien.', a: 'Expresar mi idea respetando', bad: 'Gritar' },
        { q: 'Te equivocaste en algo.', a: 'Reconocer el error y seguir', bad: 'Culpar a otro' }
      ];
      SIT.forEach(function (s, i) {
        var box = h('div', 'card small');
        box.innerHTML = '<p class="act-question" style="font-size:1.05rem">' + (i + 1) + '. ' + s.q + '</p>';
        var ch = h('div', 'choices');
        [{ t: s.a, ok: true }, { t: s.bad, ok: false }].forEach(function (o) {
          var b = h('button', 'choice', '<span>' + o.t + '</span>');
          b.onclick = function () {
            if (o.ok) {
              b.classList.add('correct');
              global.Audio.play('correct');
              global.Feedback.confetti(14);
              global.State.logActivity({ id: 'social_' + i, area: 'emociones', skill: 'social', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
              global.State.bumpCounter('_social');
            } else {
              b.classList.add('wrong');
              global.Audio.play('wrong');
              global.Feedback.toast('Elige la opción que respeta a todos.');
            }
            global.State.save();
          };
          ch.appendChild(b);
        });
        box.appendChild(ch);
        el('soc-list').appendChild(box);
      });
    }
  }

  /* =======================================================
     PROGRAMACIÓN - ROBOT VIRTUAL
  ======================================================= */
  var Coding = (function () {
    var GRID = 8;
    var CELL = 48;
    var robot = { x: 0, y: 0, dir: 1 }; // dir: 0 arriba, 1 derecha, 2 abajo, 3 izquierda
    var goal = { x: 6, y: 5 };
    var obstacles = [{ x: 3, y: 1 }, { x: 4, y: 3 }, { x: 2, y: 5 }];
    var program = [];
    var ctx = null;
    var running = false;

    var BLOCKS = [
      { id: 'forward', label: 'AVANZAR', cls: 'blk-move' },
      { id: 'left', label: 'GIRAR IZQUIERDA', cls: 'blk-turn' },
      { id: 'right', label: 'GIRAR DERECHA', cls: 'blk-turn' },
      { id: 'jump', label: 'SALTAR', cls: 'blk-jump' },
      { id: 'repeat', label: 'REPETIR 2', cls: 'blk-loop' },
      { id: 'if', label: 'SI HAY OBSTÁCULO GIRAR', cls: 'blk-cond' }
    ];

    function init() {
      var c = el('canvas-code');
      if (!c) return;
      ctx = c.getContext('2d');
      var pal = el('code-palette');
      pal.innerHTML = '';
      BLOCKS.forEach(function (b) {
        var btn = h('button', 'blk ' + b.cls, b.label);
        btn.setAttribute('aria-label', 'Agregar ' + b.label);
        btn.onclick = function () {
          program.push(b.id);
          paintProgram();
          global.Audio.play('drop');
        };
        pal.appendChild(btn);
      });

      on(el('btn-code-run'), run);
      on(el('btn-code-step'), stepOnce);
      on(el('btn-code-clear'), function () { program = []; paintProgram(); el('code-feedback').textContent = ''; });

      var tabs = el('code-tabs');
      if (tabs) {
        Array.prototype.forEach.call(tabs.children, function (b) {
          b.onclick = function () {
            Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
            b.classList.add('active');
            if (b.getAttribute('data-tab') === 'blocks') global.Feedback.toast('Los bloques de la derecha construyen el programa.');
            draw();
          };
        });
      }

      // Niveles
      var fb = el('code-feedback');
      fb.className = 'feedback-line soft';
      fb.textContent = 'Objetivo: lleva el robot al árbol verde. Agrega bloques y pulsa Ejecutar.';
      reset();
      draw();
      paintProgram();
    }

    function paintProgram() {
      var box = el('code-program');
      box.innerHTML = '';
      program.forEach(function (id, i) {
        var b = BLOCKS.filter(function (x) { return x.id === id; })[0];
        var row = h('div', 'prog-row');
        var blk = h('div', 'blk ' + b.cls, b.label);
        var del = h('button', 'prog-del', 'X');
        del.setAttribute('aria-label', 'Quitar ' + b.label);
        del.onclick = function () { program.splice(i, 1); paintProgram(); global.Audio.play('pop'); };
        row.appendChild(blk);
        row.appendChild(del);
        box.appendChild(row);
      });
    }

    function reset() {
      robot = { x: 0, y: 0, dir: 1 };
      draw();
    }

    function isBlocked(x, y) {
      if (x < 0 || y < 0 || x >= GRID || y >= GRID) return true;
      return obstacles.some(function (o) { return o.x === x && o.y === y; });
    }

    function execBlock(id) {
      if (id === 'repeat') return; // se expande antes
      if (id === 'forward') {
        var dx = [0, 1, 0, -1][robot.dir];
        var dy = [-1, 0, 1, 0][robot.dir];
        if (!isBlocked(robot.x + dx, robot.y + dy)) { robot.x += dx; robot.y += dy; return true; }
        return false;
      }
      if (id === 'jump') {
        var jx = robot.x + [0, 2, 0, -2][robot.dir];
        var jy = robot.y + [-2, 0, 2, 0][robot.dir];
        if (!isBlocked(jx, jy)) { robot.x = jx; robot.y = jy; return true; }
        return false;
      }
      if (id === 'left') robot.dir = (robot.dir + 3) % 4;
      if (id === 'right') robot.dir = (robot.dir + 1) % 4;
      if (id === 'if') {
        var ax = robot.x + [0, 1, 0, -1][robot.dir];
        var ay = robot.y + [-1, 0, 1, 0][robot.dir];
        if (isBlocked(ax, ay)) robot.dir = (robot.dir + 1) % 4;
      }
      return true;
    }

    function expand() {
      var out = [];
      program.forEach(function (id) {
        if (id === 'repeat') { out.push('forward', 'forward'); }
        else out.push(id);
      });
      return out;
    }

    var stepIdx = 0;
    function stepOnce() {
      var seq = expand();
      if (stepIdx >= seq.length) { checkWin(); return; }
      execBlock(seq[stepIdx]);
      stepIdx++;
      draw();
      global.Audio.play('click');
      if (stepIdx >= seq.length) setTimeout(checkWin, 250);
    }

    function run() {
      if (running) return;
      if (!program.length) {
        el('code-feedback').className = 'feedback-line soft';
        el('code-feedback').textContent = 'Agrega al menos un bloque al programa.';
        return;
      }
      reset();
      stepIdx = 0;
      running = true;
      var seq = expand();
      var i = 0;
      function nextStep() {
        if (i >= seq.length) { running = false; checkWin(); return; }
        execBlock(seq[i]);
        i++;
        draw();
        global.Audio.play('click');
        setTimeout(nextStep, 420);
      }
      nextStep();
    }

    function checkWin() {
      var fb = el('code-feedback');
      if (robot.x === goal.x && robot.y === goal.y) {
        fb.className = 'feedback-line ok';
        fb.textContent = '¡El robot llegó a la meta! Programación correcta.';
        global.Feedback.celebrate();
        global.Audio.play('achievement');
        global.State.bumpCounter('_coded');
        global.State.logActivity({ id: 'robot_run', area: 'programacion', skill: 'secuencias', difficulty: 3, correct: true, attempts: 1, seconds: 0 });
        global.State.addTrophy('robot');
        reset();
      } else {
        fb.className = 'feedback-line retry';
        fb.textContent = 'El robot se quedó en (' + (robot.x + 1) + ',' + (robot.y + 1) + '). La meta está en (' + (goal.x + 1) + ',' + (goal.y + 1) + '). Revisa tu programa.';
        global.Audio.play('wrong');
        global.State.logActivity({ id: 'robot_run', area: 'programacion', skill: 'secuencias', difficulty: 3, correct: false, attempts: 1, seconds: 0 });
      }
      global.State.save();
      var badges = global.State.checkBadges();
      if (badges.length) global.Feedback.toast('Insignia desbloqueada: ' + badges[0].name);
    }

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, 480, 360);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 480, 360);

      var ox = (480 - GRID * CELL) / 2;
      var oy = (360 - GRID * CELL) / 2;

      for (var y = 0; y < GRID; y++) {
        for (var x = 0; x < GRID; x++) {
          ctx.fillStyle = (x + y) % 2 ? '#1e293b' : '#243347';
          ctx.fillRect(ox + x * CELL, oy + y * CELL, CELL - 2, CELL - 2);
        }
      }

      obstacles.forEach(function (o) {
        ctx.fillStyle = '#f43f5e';
        ctx.fillRect(ox + o.x * CELL + 8, oy + o.y * CELL + 8, CELL - 18, CELL - 18);
      });

      // Meta (árbol)
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(ox + goal.x * CELL + CELL / 2, oy + goal.y * CELL + CELL / 2, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#a16207';
      ctx.fillRect(ox + goal.x * CELL + CELL / 2 - 4, oy + goal.y * CELL + CELL / 2 + 10, 8, 16);

      // Robot
      var cx = ox + robot.x * CELL + CELL / 2;
      var cy = oy + robot.y * CELL + CELL / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(robot.dir * Math.PI / 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-14, -14, 28, 28);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, -8, 8, 6);
      ctx.fillRect(4, 2, 8, 6);
      ctx.beginPath();
      ctx.moveTo(14, 0);
      ctx.lineTo(22, 0);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    }

    return { init: init, reset: reset, draw: draw };
  })();

  function init() {
    initScience();
    initMusic();
    initEmotions();
    Coding.init();
  }

  global.Labs = { init: init, Coding: Coding, SCIENCE: SCIENCE };
})(window);
