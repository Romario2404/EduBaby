/* =========================================================
   activities.js - Motor de actividades multimodal
   renderiza cualquier actividad definida en data.js
   Soporta: selection, number, text, speak, visual, order,
   sequence, errorFind, open, memory, audio_selection,
   sequence_audio, build, draw, trace.
   Incluye retroalimentación escalonada:
   intento -> pista -> ejemplo -> nuevo intento.
   ========================================================= */
(function (global) {
  'use strict';

  var current = null;
  var attempt = 0;
  var answered = false;
  var startedAt = 0;
  var queue = [];
  var queueIndex = 0;
  var history = [];

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  /* ---------------------------------------------------
     Selección de actividades
  --------------------------------------------------- */
  function queueFor(area, count, age, level) {
    var seen = history.slice(-40);
    var list = [];
    var n = count || 5;
    for (var i = 0; i < n; i++) {
      var a = global.Data.pickFor(level, area, age, seen.concat(list.map(function (x) { return x.id; })));
      if (a) list.push(a);
    }
    return list;
  }

  function startArea(areaId, opts) {
    opts = opts || {};
    var st = global.State.get();
    var age = st.user ? st.user.age : 6;
    queue = opts.queue || queueFor(areaId, opts.count || 5, age, st.level);
    if (!queue.length) { global.Feedback.toast('Todavía no hay actividades aquí.'); return; }
    queueIndex = 0;
    global.App.go('activity');
    next();
  }

  function startActivityById(id) {
    var a = global.Data.byId(id);
    if (!a) { global.Feedback.toast('Actividad no encontrada.'); return; }
    queue = [a];
    queueIndex = 0;
    global.App.go('activity');
    next();
  }

  function next() {
    if (queueIndex >= queue.length) return finishSet();
    current = queue[queueIndex];
    attempt = 0;
    answered = false;
    startedAt = Date.now();
    render();
  }

  function finishSet() {
    var ok = history.slice(-queue.length).filter(function (e) { return e.correct; }).length;
    var stage = el('activity-stage');
    stage.innerHTML =
      '<div class="act-body" style="text-align:center">' +
        '<div class="modal-art">' + Icons.art('mascot') + '</div>' +
        '<h3 class="h2">¡Terminaste este set!</h3>' +
        '<p class="muted">Respuestas correctas: ' + ok + ' de ' + queue.length + '</p>' +
        '<div class="actions center">' +
          '<button class="btn btn-primary" id="act-again">Jugar otra vez</button>' +
          '<button class="btn btn-ghost" id="act-exit">Volver</button>' +
        '</div>' +
      '</div>';
    global.Audio.play('complete');
    global.Feedback.confetti();
    el('act-again').onclick = function () { startArea(queue[0] ? queue[0].area : null, { count: queue.length }); };
    el('act-exit').onclick = function () { global.App.back(); };
    global.State.checkBadges().forEach(function (b) {
      global.Feedback.modal({ title: 'Nueva insignia', text: b.name + ' - ' + b.sub, art: Icons.svg('trophy') });
      global.Audio.play('achievement');
    });
  }

  /* ---------------------------------------------------
     Render
  --------------------------------------------------- */
  function header(a) {
    return '<div class="act-head">' +
      '<div class="li-ico" style="background:' + ((global.Data.areas[a.area] || {}).color || '#38bdf8') + '22">' +
        Icons.svg((global.Data.areas[a.area] || {}).icon || 'grid') +
      '</div>' +
      '<div style="flex:1;min-width:150px">' +
        '<b>' + ((global.Data.areas[a.area] || {}).name || a.area) + '</b>' +
        '<div class="li-sub">Dificultad ' + a.difficulty + ' · ' + global.State.skillLabel(a.skill) + '</div>' +
      '</div>' +
      '<div class="progress-dots" id="act-dots"></div>' +
      '<button class="btn btn-mini" id="act-exit-x">Salir</button>' +
    '</div>';
  }

  function dots() {
    var box = el('act-dots');
    if (!box) return;
    var html = '';
    for (var i = 0; i < queue.length; i++) {
      var cls = i < queueIndex ? 'done' : (i === queueIndex ? 'now' : '');
      html += '<i class="' + cls + '"></i>';
    }
    box.innerHTML = html;
  }

  function mascot(text, mood) {
    return '<div id="mascot-live">' + global.Feedback.mascotHTML(mood || 'happy', text) + '</div>';
  }

  function artFor(a) {
    if (a.face) return Icons.face(a.face);
    if (a.art) return Icons.art(a.art);
    if (a.visual) return visualObjects(a.visual, a.visualCount);
    return '';
  }

  function visualObjects(kind, n) {
    var artMap = { apple: 'apple', star: 'star', fish: 'fish', tree: 'tree', sun: 'sun', cloud: 'cloud', house: 'house' };
    var svg = Icons.art(artMap[kind] || 'sun');
    var out = '<div class="object-row">';
    for (var i = 0; i < n; i++) out += '<div class="obj" data-i="' + i + '">' + svg + '</div>';
    return out + '</div>';
  }

  function render() {
    var a = current;
    if (!a) return;
    var stage = el('activity-stage');
    var body = '';

    /* --- Actividades que se resuelven en otra pantalla --- */
    if (a.type === 'draw' || a.type === 'build' || a.type === 'trace') {
      stage.innerHTML = header(a) +
        '<div class="act-body">' +
          '<p class="act-question">' + a.question + '</p>' +
          (a.prompt ? '<p class="muted">' + a.prompt + '</p>' : '') +
          '<div class="actions">' +
            '<button class="btn btn-primary" id="act-go">Abrir ' +
              (a.type === 'draw' ? 'el estudio de dibujo' : a.type === 'build' ? 'el constructor' : 'el taller de escritura') +
            '</button>' +
            '<button class="btn btn-ghost" id="act-next">Otra actividad</button>' +
          '</div>' +
          '<div id="mascot-live"></div>' +
        '</div>';
      dots();
      el('act-go').onclick = function () {
        global.Audio.play('click');
        var target = a.type === 'draw' ? 'draw' : a.type === 'build' ? 'build' : 'trace';
        global.Creative.openForActivity(a, target);
      };
      el('act-next').onclick = function () { queueIndex++; next(); };
      bindExit();
      global.Feedback.say(a.hint || 'Vamos a ello.', 'think');
      return;
    }

    body += '<div class="act-body">';
    body += '<p class="act-question">' + a.question + '</p>';

    var art = artFor(a);
    if (art) body += '<div style="text-align:center;margin:10px 0">' + art + '</div>';

    /* --- memoria: muestra y oculta --- */
    if (a.type === 'memory' && a.memoryItems) {
      body += '<div class="object-row" id="mem-show" style="justify-content:center"></div>';
    }
    if (a.type === 'memory' && a.memoryGrid) {
      body += '<div class="seq-row" id="mem-grid" style="display:grid;grid-template-columns:repeat(3,64px);justify-content:center"></div>';
    }

    /* --- audio --- */
    if (a.type === 'audio_selection' || a.type === 'sequence_audio' || a.audio) {
      body += '<div class="act-audio-row">' +
        '<button class="btn btn-soft" id="act-listen">' + Icons.svg('speaker') + ' Escuchar</button>' +
        '<button class="btn btn-ghost" id="act-listen-again">' + Icons.svg('repeat') + ' Repetir</button>' +
      '</div>';
    }

    /* --- respuesta por voz --- */
    if (a.type === 'speak') {
      body += '<div class="act-audio-row">' +
        '<button class="btn btn-primary" id="act-speak">' + Icons.svg('mic') + ' Responder hablando</button>' +
        '<span class="muted" id="act-heard">Toca el micrófono y di la palabra.</span>' +
      '</div>' +
        '<input type="text" id="act-text" class="" placeholder="O escribe aquí si prefieres" style="width:100%;padding:14px;border:2px solid var(--line);border-radius:14px;margin-top:8px">';
    }

    /* --- campo numérico --- */
    if (a.type === 'number') {
      body += '<input type="number" inputmode="numeric" id="act-input" class="pin-input" style="max-width:200px" aria-label="Tu respuesta">';
    }

    /* --- campo de texto --- */
    if (a.type === 'text') {
      body += '<input type="text" id="act-input" placeholder="Escribe tu respuesta" style="width:100%;padding:14px;border:2px solid var(--line);border-radius:14px" aria-label="Tu respuesta">';
    }

    /* --- respuesta abierta --- */
    if (a.type === 'open') {
      body += '<textarea id="act-input" rows="4" placeholder="Escribe tu respuesta aquí..." style="width:100%;padding:14px;border:2px solid var(--line);border-radius:14px"></textarea>' +
        '<div class="act-audio-row">' +
          '<button class="btn btn-soft" id="act-speak">' + Icons.svg('mic') + ' Responder hablando</button>' +
          '<button class="btn btn-ghost" id="act-to-draw">' + Icons.svg('pencil') + ' Dibujar mi respuesta</button>' +
        '</div>';
    }

    /* --- opciones --- */
    if (a.options && a.options.length && a.type !== 'order') {
      if (a.type === 'sequence' || a.type === 'errorFind') {
        body += '<div class="seq-row" id="act-seq"></div>';
      }
      body += '<div class="choices" id="act-choices"></div>';
      if (a.type === 'sequence') {
        body += '<div class="actions"><button class="btn btn-mini" id="act-seq-next">Siguiente elemento</button></div>';
      }
    }

    /* --- ordenar --- */
    if (a.type === 'order') {
      body += '<div class="list" id="act-order"></div>';
    }

    body += '<div class="act-feedback" id="act-feedback"></div>';
    body += '<div class="act-audio-row">' +
      '<button class="btn btn-soft" id="act-hint">' + Icons.svg('lightbulb') + ' Pista</button>' +
      '<button class="btn btn-primary" id="act-check">Comprobar</button>' +
      '<button class="btn btn-ghost" id="act-next">Otra actividad</button>' +
    '</div>';
    body += '<div id="mascot-live"></div>';
    body += '</div>';

    stage.innerHTML = header(a) + body;
    dots();
    bindExit();
    bindCommon();
    if (a.type === 'memory') setupMemory(a);
    if (a.type === 'sequence') setupSequence(a);
    if (a.type === 'order') setupOrder(a);
    if (a.options && a.options.length && a.type !== 'order') setupChoices(a);
    if (a.type === 'audio_selection' || a.type === 'sequence_audio') setupAudio(a);

    global.Feedback.say(a.prompt || a.hint || 'Vamos a intentarlo.', 'happy');
    var first = stage.querySelector('input, button');
    if (first) setTimeout(function () { first.focus(); }, 120);
  }

  function bindExit() {
    var x = el('act-exit-x');
    if (x) x.onclick = function () { global.App.back(); };
  }

  function selectedChoice() {
    var box = el('act-choices');
    if (!box) return null;
    var sel = box.querySelector('.choice.selected');
    return sel ? sel.getAttribute('data-value') : null;
  }

  function setupChoices(a) {
    var box = el('act-choices');
    box.innerHTML = '';
    var keys = 'ABCDEFGH';
    a.options.forEach(function (opt, i) {
      var b = h('button', 'choice');
      b.setAttribute('data-value', opt);
      b.innerHTML = '<span class="ch-key">' + keys[i] + '</span><span>' + opt + '</span>';
      b.onclick = function () {
        global.Audio.play('click');
        Array.prototype.forEach.call(box.children, function (c) { c.classList.remove('selected', 'correct', 'wrong'); });
        b.classList.add('selected');
        if (a.type !== 'order') check(false);
      };
      box.appendChild(b);
    });
  }

  function setupSequence(a) {
    var seq = el('act-seq');
    if (!seq) return;
    seq.innerHTML = '';
    a.options.forEach(function (opt) {
      var c = h('div', 'seq-cell', '?');
      c.setAttribute('data-value', opt);
      seq.appendChild(c);
    });
    var nxt = el('act-seq-next');
    var idx = 0;
    if (nxt) nxt.onclick = function () {
      global.Audio.play('click');
      var cells = seq.children;
      if (idx >= cells.length) return;
      cells[idx].textContent = a.options[idx];
      cells[idx].classList.add('lit');
      idx++;
      if (idx >= cells.length) nxt.disabled = true;
    };
  }

  function setupOrder(a) {
    var box = el('act-order');
    if (!box) return;
    // Mezcla las opciones (salvo si el enunciado ya trae un orden intencionado)
    var items = a.options.slice();
    if (a.id === 'log_009' || a.id === 'rd_003') items = shuffle(items);
    else items = shuffle(items);

    var state = items.slice();
    function paint() {
      box.innerHTML = '';
      state.forEach(function (v, i) {
        var row = h('div', 'list-item');
        row.innerHTML = '<span class="ch-key">' + (i + 1) + '</span>' +
          '<span class="li-body"><span class="li-title">' + v + '</span></span>';
        var up = h('button', 'btn btn-mini', 'Subir');
        var dn = h('button', 'btn btn-mini', 'Bajar');
        up.setAttribute('aria-label', 'Subir ' + v);
        dn.setAttribute('aria-label', 'Bajar ' + v);
        up.onclick = function () { if (i > 0) { swap(state, i, i - 1); paint(); global.Audio.play('drop'); } };
        dn.onclick = function () { if (i < state.length - 1) { swap(state, i, i + 1); paint(); global.Audio.play('drop'); } };
        row.appendChild(up);
        row.appendChild(dn);
        box.appendChild(row);
      });
      box.setAttribute('data-value', state.join(','));
    }
    paint();
  }

  function swap(arr, i, j) { var t = arr[i]; arr[i] = arr[j]; arr[j] = t; }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      swap(a, i, j);
    }
    return a;
  }

  function setupMemory(a) {
    if (a.memoryItems) {
      var host = el('mem-show');
      if (!host) return;
      var artMap = { sol: 'sun', pez: 'fish', casa: 'house', arbol: 'tree', luna: 'planet', estrella: 'star' };
      host.innerHTML = a.memoryItems.map(function (m) {
        return '<div class="obj" style="width:70px;height:70px">' + Icons.art(artMap[m] || 'sun') + '</div>';
      }).join('');
      var btn = h('button', 'btn btn-primary', 'Ya los memoricé');
      btn.style.display = 'block';
      btn.style.margin = '10px auto';
      host.parentNode.appendChild(btn);
      btn.onclick = function () {
        host.innerHTML = '<p class="muted">¿Cuál había? Elige abajo.</p>';
        btn.remove();
        global.Audio.play('click');
      };
      setTimeout(function () {
        if (host.innerHTML.indexOf('class="obj"') >= 0) btn.click();
      }, 12000);
    } else if (a.memoryGrid) {
      var g = el('mem-grid');
      if (!g) return;
      var target = a.targetIndex;
      var cells = [];
      for (var i = 1; i <= a.memoryGrid; i++) {
        var star = '<span style="color:#f59e0b;font-size:1.6rem">&#9733;</span>';
        var c = h('div', 'seq-cell', i === target ? star : '');
        g.appendChild(c);
        cells.push(c);
      }
      var b2 = h('button', 'btn btn-primary', 'Ya la memoricé');
      b2.style.display = 'block';
      b2.style.margin = '10px auto';
      g.parentNode.appendChild(b2);
      b2.onclick = function () {
        cells.forEach(function (c) { c.innerHTML = ''; });
        b2.remove();
        global.Audio.play('click');
      };
      setTimeout(function () { if (b2.parentNode) b2.click(); }, 9000);
    }
  }

  function setupAudio(a) {
    var listen = el('act-listen');
    var again = el('act-listen-again');
    function sayIt() {
      var text = a.audio || (a.audioSeq ? a.audioSeq.join(', ') : '');
      global.Speech.speak(text, { rate: a.type === 'sequence_audio' ? 0.8 : 0.9 });
      global.Audio.play('click');
    }
    if (listen) listen.onclick = sayIt;
    if (again) again.onclick = sayIt;
    setTimeout(sayIt, 400);
  }

  function bindCommon() {
    var hintBtn = el('act-hint');
    if (hintBtn) hintBtn.onclick = giveHint;
    var checkBtn = el('act-check');
    if (checkBtn) checkBtn.onclick = function () { check(true); };
    var nextBtn = el('act-next');
    if (nextBtn) nextBtn.onclick = function () { queueIndex++; next(); };
    var speakBtn = el('act-speak');
    if (speakBtn) speakBtn.onclick = startListening;
    var drawBtn = el('act-to-draw');
    if (drawBtn) drawBtn.onclick = function () {
      global.Creative.openForActivity(current, 'draw');
    };
    var listenBtn = el('act-listen');
    if (listenBtn && current.audio) listenBtn.onclick = function () {
      global.Speech.speak(current.audio);
    };
  }

  /* ---------------------------------------------------
     Voz
  --------------------------------------------------- */
  function startListening() {
    var status = el('act-heard');
    if (!global.Speech.listenSupported()) {
      if (status) status.textContent = 'Este navegador no reconoce voz. Usa el campo de texto.';
      global.Feedback.toast('Tu navegador no permite reconocimiento de voz. Puedes escribir.');
      return;
    }
    if (status) status.textContent = 'Te escucho... habla ahora.';
    global.Audio.play('pop');
    global.Speech.listen({
      onResult: function (text, isFinal) {
        if (status) status.textContent = 'Escuché: "' + text + '"';
        var box = el('act-input');
        if (box) box.value = text;
        if (isFinal) check(false);
      },
      onError: function (e) {
        if (status) status.textContent = e === 'not-allowed'
          ? 'Permiso de micrófono denegado. Puedes escribir.'
          : 'No pude escuchar. Intenta otra vez o escribe.';
      }
    });
  }

  /* ---------------------------------------------------
     Comprobación
  --------------------------------------------------- */
  function getUserAnswer() {
    var a = current;
    if (a.type === 'selection' || a.type === 'audio_selection' || a.type === 'sequence' || a.type === 'errorFind') {
      var sc = selectedChoice();
      if (sc != null) return sc;
      var seq = el('act-seq');
      if (seq) {
        var cells = Array.prototype.slice.call(seq.children);
        var filled = cells.every(function (c) { return c.textContent !== '?'; });
        if (filled) return cells[cells.length - 1].getAttribute('data-value');
      }
      return null;
    }
    if (a.type === 'order') {
      var box = el('act-order');
      return box ? box.getAttribute('data-value') : null;
    }
    if (a.type === 'speak') {
      var t1 = el('act-input');
      if (t1 && t1.value.trim()) return t1.value.trim();
      var heard = el('act-heard');
      if (heard && heard.textContent.indexOf('Escuché:') === 0) {
        return heard.textContent.replace('Escuché: ', '').replace(/"/g, '');
      }
      return null;
    }
    var inp = el('act-input');
    return inp && inp.value.trim() ? inp.value.trim() : null;
  }

  function showFeedback(kind, text, extra) {
    var box = el('act-feedback');
    if (!box) return;
    box.className = 'act-feedback show ' + kind;
    box.innerHTML = '<span>' + text + '</span>' + (extra || '');
    if (kind === 'ok') {
      global.Audio.play('correct');
      global.Feedback.confetti(24);
      var m = document.getElementById('live-mascot');
      if (m) { m.classList.add('bounce'); setTimeout(function () { m.classList.remove('bounce'); }, 700); }
    } else if (kind === 'retry') {
      global.Audio.play('wrong');
    } else {
      global.Audio.play('hint');
    }
    global.Speech.speak(text);
  }

  function giveHint() {
    var a = current;
    var text = a.hint || global.Feedback.hint();
    showFeedback('soft', 'Pista: ' + text);
    var extra = '';
    if (attempt >= 1) {
      extra = '<div class="act-hint-text">Ejemplo: ' + (a.explain || global.Feedback.hint()) + '</div>';
      var box = el('act-feedback');
      if (box) box.innerHTML += extra;
    }
  }

  function check(fromButton) {
    if (answered) { queueIndex++; next(); return; }
    var a = current;
    var user = getUserAnswer();

    if (user == null || user === '') {
      global.Feedback.toast('Elige o escribe una respuesta primero.');
      return;
    }

    attempt++;

    /* Respuestas abiertas: siempre se aceptan si aportan algo */
    if (a.type === 'open') {
      finish(true, 'open', user);
      return;
    }

    var result;
    if (a.type === 'speak') {
      var cmp = global.Speech.compareWord(user, a.expected || a.answer);
      result = { correct: cmp.ok, score: cmp.score };
      if (cmp.ok) { finish(true, 'correct', user); return; }
      showFeedback('retry', 'Escuché "' + user + '". Intenta pronunciarla de nuevo.');
      if (attempt >= 2) {
        global.Speech.speak(a.expected || a.answer, { rate: 0.7, force: true });
        showFeedback('soft', 'Escucha otra vez: ' + (a.expected || a.answer));
      }
      record(false);
      return;
    }

    if (a.type === 'number') result = global.Feedback.evaluateAnswer(user, a.answer, { type: 'number' });
    else if (a.type === 'text') result = global.Feedback.evaluateAnswer(user, a.answer, { type: 'contains' });
    else if (a.type === 'order') {
      var exp = Array.isArray(a.answer) ? a.answer.join(',') : a.answer;
      result = { correct: String(user).replace(/\s/g, '') === String(exp).replace(/\s/g, '') };
    } else {
      result = global.Feedback.evaluateAnswer(user, a.answer, { type: 'string' });
    }

    if (result.correct) { finish(true, 'correct', user); return; }

    /* --- fallo: pista, luego ejemplo, luego reintento --- */
    markChoices(a, user, false);
    record(false);

    if (attempt === 1) {
      showFeedback('soft', global.Feedback.messageFor(result, 1) + ' ' + (a.hint || global.Feedback.hint()));
    } else if (attempt === 2) {
      showFeedback('retry', 'Observa este ejemplo.');
      var box = el('act-feedback');
      if (box) box.innerHTML += '<div class="act-hint-text">' + (a.explain || 'Revisa la información de la actividad.') + '</div>';
      global.Speech.speak(a.explain || a.hint || '');
    } else {
      showFeedback('retry', 'La respuesta era: ' + a.answer + '. ¡Ahora sí lo tienes!');
      markChoices(a, a.answer, true);
      setTimeout(function () { queueIndex++; next(); }, 2600);
    }
  }

  function markChoices(a, value, correct) {
    var box = el('act-choices');
    if (!box) return;
    Array.prototype.forEach.call(box.children, function (c) {
      var v = c.getAttribute('data-value');
      if (v === value) c.classList.add(correct ? 'correct' : 'wrong');
      if (correct && v === a.answer) c.classList.add('correct');
    });
  }

  function record(correct) {
    var a = current;
    var entry = {
      id: a.id, area: a.area, skill: a.skill, difficulty: a.difficulty,
      correct: correct, attempts: attempt, seconds: Math.round((Date.now() - startedAt) / 1000)
    };
    history.push(entry);
    global.State.logActivity(entry);
    if (correct) {
      var areas = ['draw', 'build', 'stories', 'science', 'social', 'coded'];
      if (a.area === 'dibujo') global.State.bumpCounter('_draws');
      if (a.area === 'construccion') global.State.bumpCounter('_builds');
      if (a.area === 'ciencia') global.State.bumpCounter('_science');
      if (a.area === 'emociones') global.State.bumpCounter('_social');
      if (a.area === 'programacion') global.State.bumpCounter('_coded');
      void areas;
    }
  }

  function finish(correct, kind, user) {
    answered = true;
    markChoices(current, current.answer, true);
    record(correct);
    var msg = correct
      ? global.Feedback.messageFor({ correct: true })
      : global.Feedback.messageFor({ correct: false }, attempt);
    showFeedback(correct ? 'ok' : 'soft', msg);

    var extra = '';
    if (correct && current.explain) {
      extra = '<div class="act-hint-text">' + current.explain + '</div>';
    }
    var box = el('act-feedback');
    if (box && extra) box.innerHTML += extra;

    var nextBtn = el('act-next');
    if (nextBtn) nextBtn.textContent = queueIndex >= queue.length - 1 ? 'Terminar' : 'Siguiente';
    void user; void kind;

    var badges = global.State.checkBadges();
    if (badges.length) {
      setTimeout(function () {
        global.Feedback.modal({
          art: Icons.svg('trophy'),
          title: '¡Insignia desbloqueada!',
          text: badges[0].name + ' — ' + badges[0].sub,
          buttons: [{ label: 'Genial', style: 'btn-primary' }]
        });
        global.Audio.play('achievement');
      }, 700);
    }
  }

  /* ---------------------------------------------------
     Diagnóstico inicial
  --------------------------------------------------- */
  function runDiagnostic(done) {
    var areas = ['lenguaje', 'matematica', 'memoria', 'atencion', 'creatividad', 'logica', 'coordinacion', 'comprension_auditiva'];
    var results = {};
    var idx = 0;
    var picked = ['lang_003', 'math_001', 'mem_001', 'log_002', 'log_003', 'trz_002', 'drw_005', 'lang_012'];

    function step() {
      if (idx >= picked.length) {
        // Completa las áreas no medidas con un valor neutro adaptado
        areas.forEach(function (ar) {
          if (results[ar] == null) results[ar] = 50 + Math.round(Math.random() * 15);
        });
        var st = global.State.get();
        st.skills = Object.assign(global.State.blankSkills(), results);
        st.diagnosticDone = true;
        global.State.save(true);
        if (done) done(results);
        return;
      }
      var id = picked[idx++];
      var act = global.Data.byId(id);
      if (!act) { step(); return; }
      var before = global.State.get().activityLog.length;
      queue = [act];
      queueIndex = 0;
      answered = false;
      attempt = 0;
      startedAt = Date.now();
      current = act;
      render();

      // Intercepta el fin de la actividad
      var wait = setInterval(function () {
        var log = global.State.get().activityLog;
        if (log.length > before && log[0].id === act.id) {
          clearInterval(wait);
          var ok = log[0].correct;
          var skill = act.skill;
          var map = {
            lenguaje: 'lenguaje', matematica: 'matematica', conteo: 'matematica',
            memoria: 'memoria', logica: 'logica', patrones: 'logica',
            creatividad: 'creatividad', coordinacion: 'coordinacion',
            motricidad: 'coordinacion', comprension: 'lenguaje',
            comprension_auditiva: 'comprension_auditiva', audio: 'comprension_auditiva'
          };
          var key = map[skill] || map[act.area] || act.area;
          results[key] = ok ? 75 + Math.round(Math.random() * 20) : 35 + Math.round(Math.random() * 20);
          setTimeout(step, 500);
        }
      }, 250);
    }
    step();
  }

  global.Activities = {
    startArea: startArea,
    startActivityById: startActivityById,
    queueFor: queueFor,
    runDiagnostic: runDiagnostic,
    getCurrent: function () { return current; },
    notifyExternalDone: function (correct) {
      if (!current) return;
      answered = true;
      attempt = Math.max(1, attempt);
      record(correct);
      var box = el('act-feedback');
      if (box) {
        box.className = 'act-feedback show ' + (correct ? 'ok' : 'soft');
        box.innerHTML = '<span>' + (correct ? global.Feedback.praise() : 'Casi. Revisa el dibujo y vuelve a intentarlo.') + '</span>';
      }
      global.App.go('activity');
    }
  };
})(window);
