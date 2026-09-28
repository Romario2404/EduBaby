/* =========================================================
   missions.js - Misiones diarias/semanales, máquina de
   retos, mapa de aprendizaje, insignias y recompensas.
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(n, fn) { if (n) n.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }
  function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  var DAILY_POOL = [
    { text: 'Encuentra tres objetos circulares en tu casa y regístralos aquí.', skill: 'atencion', goal: 1, type: 'write' },
    { text: 'Dibuja algo que te haga feliz.', skill: 'creatividad', goal: 1, type: 'draw' },
    { text: 'Resuelve cuatro operaciones matemáticas.', skill: 'matematica', goal: 4, type: 'activity', area: 'matematica' },
    { text: 'Lee una palabra en voz alta.', skill: 'lenguaje', goal: 1, type: 'speak' },
    { text: 'Escucha un cuento y cuéntalo con tus palabras.', skill: 'comprension_auditiva', goal: 1, type: 'write' },
    { text: 'Completa tres retos de lógica.', skill: 'logica', goal: 3, type: 'activity', area: 'logica' },
    { text: 'Construye algo con al menos 6 piezas.', skill: 'coordinacion', goal: 1, type: 'build' },
    { text: 'Reconoce dos emociones en las personas de tu casa.', skill: 'social', goal: 1, type: 'write' }
  ];

  var WEEKLY_POOL = [
    { text: 'Proyecto: Construye una ciudad sostenible. Diseña, construye, explica y presenta tu proyecto.', skill: 'creatividad' },
    { text: 'Proyecto: Escribe un cuento de cinco escenas y léelo en voz alta.', skill: 'lenguaje' },
    { text: 'Proyecto: Haz un experimento casero y registra el resultado.', skill: 'ciencia' },
    { text: 'Proyecto: Programa el robot para recorrer todo el tablero.', skill: 'programacion' }
  ];

  function today() { return new Date().toISOString().slice(0, 10); }
  function weekStart() {
    var d = new Date();
    var day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d.toISOString().slice(0, 10);
  }

  function ensure() {
    var s = global.State.get();
    if (s.daily.date !== today() || !s.daily.mission) {
      s.daily = { date: today(), missionDone: false, activities: s.daily.date === today() ? s.daily.activities : 0, mission: DAILY_POOL[rand(0, DAILY_POOL.length - 1)], progress: 0 };
      global.State.save(true);
    }
    if (s.weekly.date !== weekStart() || !s.weekly.mission) {
      s.weekly = { date: weekStart(), missionDone: false, mission: WEEKLY_POOL[rand(0, WEEKLY_POOL.length - 1)] };
      global.State.save(true);
    }
    return s;
  }

  /* -------------------------------------------------------
     Pantalla de misiones
  ------------------------------------------------------- */
  function render(tab) {
    var stage = el('mission-stage');
    if (!stage) return;
    ensure();
    stage.innerHTML = '';
    tab = tab || 'daily';

    if (tab === 'daily') renderDaily(stage);
    else if (tab === 'weekly') renderWeekly(stage);
    else renderChallengeMachine(stage);
  }

  function renderDaily(stage) {
    var s = ensure();
    var m = s.daily.mission;
    var card = h('div', 'card');
    card.innerHTML = '<span class="tag tag-amber">Misión del día</span>' +
      '<p class="act-question" style="margin-top:10px">' + m.text + '</p>' +
      '<div class="bar"><i style="width:' + Math.min(100, (s.daily.progress / m.goal) * 100) + '%"></i></div>' +
      '<p class="muted">Progreso: ' + Math.min(s.daily.progress, m.goal) + ' de ' + m.goal + '</p>' +
      '<p class="feedback-line ' + (s.daily.missionDone ? 'ok' : '') + '" id="dm-fb">' +
      (s.daily.missionDone ? '¡Misión cumplida! Vuelve mañana por otra.' : '') + '</p>';
    stage.appendChild(card);

    var actions = h('div', 'actions');
    if (!s.daily.missionDone) {
      var b1 = h('button', 'btn btn-primary', m.type === 'draw' ? 'Abrir el estudio de dibujo' :
        m.type === 'build' ? 'Abrir el constructor' :
        m.type === 'speak' ? 'Practicar lectura en voz alta' :
        m.type === 'activity' ? 'Empezar las actividades' : 'Registrar mi respuesta');
      b1.onclick = function () {
        global.Audio.play('click');
        if (m.type === 'draw') global.App.go('draw');
        else if (m.type === 'build') global.App.go('build');
        else if (m.type === 'speak') { global.App.go('read'); global.Language.renderRead('words'); }
        else if (m.type === 'activity') global.Activities.startArea(m.area, { count: m.goal });
        else openWriteBox(m);
      };
      actions.appendChild(b1);

      var b2 = h('button', 'btn btn-ghost', 'Ya lo hice');
      b2.onclick = function () { advanceDaily(1); };
      actions.appendChild(b2);
    }
    stage.appendChild(actions);
  }

  function openWriteBox(m) {
    global.Feedback.modal({
      title: 'Registra tu misión',
      html: '<textarea id="dm-text" rows="4" style="width:100%;padding:12px;border:2px solid var(--line);border-radius:14px" placeholder="Escribe aquí..."></textarea>' +
        '<div class="actions"><button class="btn btn-soft" id="dm-mic">Dictar</button></div>',
      buttons: [
        { label: 'Guardar', style: 'btn-primary', onClick: function () {
            var t = (document.getElementById('dm-text') || {}).value || '';
            if (!t.trim()) { global.Feedback.toast('Escribe algo primero.'); return; }
            global.Creative.saveProject({ type: 'mision', title: 'Misión del día', description: t });
            advanceDaily(m.goal);
          } },
        { label: 'Cerrar', style: 'btn-ghost' }
      ]
    });
    var mic = document.getElementById('dm-mic');
    if (mic) mic.onclick = function () {
      if (!global.Speech.listenSupported()) { global.Feedback.toast('Tu navegador no permite dictado.'); return; }
      global.Speech.listen({ onResult: function (t, f) { if (f) document.getElementById('dm-text').value = t; } });
    };
  }

  function advanceDaily(n) {
    var s = ensure();
    s.daily.progress = (s.daily.progress || 0) + n;
    if (s.daily.progress >= s.daily.mission.goal) {
      s.daily.missionDone = true;
      s.stars += 25;
      s.xp += 60;
      global.Feedback.celebrate();
      global.Feedback.modal({
        art: Icons.svg('trophy'),
        title: '¡Misión del día cumplida!',
        text: 'Ganaste 25 estrellas y 60 de experiencia.',
        buttons: [{ label: 'Genial', style: 'btn-primary' }]
      });
      global.Audio.play('achievement');
      global.State.addTrophy('daily');
      global.State.checkBadges();
    } else {
      global.Feedback.toast('Buen progreso: ' + s.daily.progress + '/' + s.daily.mission.goal);
      global.Audio.play('pop');
    }
    global.State.save(true);
    render('daily');
    refreshHome();
  }

  function renderWeekly(stage) {
    var s = ensure();
    var m = s.weekly.mission;
    var card = h('div', 'card');
    card.innerHTML = '<span class="tag tag-grape">Misión de la semana</span>' +
      '<p class="act-question" style="margin-top:10px">' + m.text + '</p>' +
      '<p class="muted">Pasos sugeridos: 1) Diseñar  2) Construir  3) Explicar  4) Resolver problemas  5) Presentar.</p>' +
      '<p class="feedback-line ' + (s.weekly.missionDone ? 'ok' : '') + '">' +
      (s.weekly.missionDone ? '¡Proyecto completado!' : 'Cuando termines, márcalo como completo.') + '</p>';
    stage.appendChild(card);

    var actions = h('div', 'actions');
    var b1 = h('button', 'btn btn-primary', 'Abrir Mis proyectos');
    b1.onclick = function () { global.App.go('projects'); global.Panels.renderProjects(); };
    actions.appendChild(b1);

    if (!s.weekly.missionDone) {
      var b2 = h('button', 'btn btn-soft', 'Marcar como completado');
      b2.onclick = function () {
        var st = global.State.get();
        st.weekly.missionDone = true;
        st.stars += 100;
        st.xp += 200;
        global.State.addTrophy('weekly');
        global.State.save(true);
        global.Feedback.celebrate();
        global.Feedback.toast('¡Proyecto semanal completado! +100 estrellas');
        render('weekly');
        refreshHome();
      };
      actions.appendChild(b2);
    }
    stage.appendChild(actions);
  }

  /* -------------------------------------------------------
     MÁQUINA DE RETOS (combina habilidades)
  ------------------------------------------------------- */
  var COMBOS = [
    { areas: ['matematica', 'dibujo'], text: 'Resuelve una suma y dibuja esa cantidad de estrellas.' },
    { areas: ['lenguaje', 'musica'], text: 'Escucha una palabra, escríbela y pronúnciala.' },
    { areas: ['logica', 'construccion'], text: 'Construye la figura que corresponde al patrón.' },
    { areas: ['ciencia', 'lenguaje'], text: 'Explica con tus palabras un experimento que hayas hecho.' },
    { areas: ['memoria', 'programacion'], text: 'Memoriza una secuencia y después prográmala en el robot.' },
    { areas: ['matematica', 'construccion'], text: 'Construye una torre de 8 bloques y quita 3. ¿Cuántos quedan?' },
    { areas: ['lectura', 'dibujo'], text: 'Lee una palabra y dibuja lo que significa.' },
    { areas: ['emociones', 'lenguaje'], text: 'Describe una emoción con tres adjetivos.' }
  ];

  function renderChallengeMachine(stage) {
    var card = h('div', 'card');
    card.innerHTML = '<span class="tag tag-sky">Máquina de retos</span>' +
      '<p class="muted">Combina dos habilidades en un solo reto.</p>' +
      '<div id="cm-out" class="act-hint-text">Pulsa el botón para obtener un reto.</div>' +
      '<div class="actions"><button class="btn btn-primary" id="cm-roll">Generar reto</button>' +
      '<button class="btn btn-soft" id="cm-accept">Aceptar reto</button>' +
      '<button class="btn btn-ghost" id="cm-lucky">Reto de la suerte</button></div>' +
      '<p class="feedback-line" id="cm-fb"></p>';
    stage.appendChild(card);

    var picked = null;
    on(el('cm-roll'), function () {
      picked = COMBOS[rand(0, COMBOS.length - 1)];
      el('cm-out').innerHTML = '<b>' + picked.areas.map(function (a) { return (global.Data.areas[a] || {}).name || a; }).join(' + ') + '</b><br>' + picked.text;
      el('cm-fb').textContent = '';
      global.Audio.play('pop');
      global.Speech.speak(picked.text);
    });
    on(el('cm-lucky'), function () {
      var pool = global.Data.activities;
      var a = pool[rand(0, pool.length - 1)];
      el('cm-out').innerHTML = '<b>Reto de la suerte</b><br>' + a.question;
      picked = { areas: [a.area], id: a.id, text: a.question };
      el('cm-fb').textContent = '';
      global.Audio.play('achievement');
    });
    on(el('cm-accept'), function () {
      if (!picked) { global.Feedback.toast('Genera un reto primero.'); return; }
      if (picked.id) { global.Activities.startActivityById(picked.id); return; }
      var first = picked.areas[0];
      if (first === 'dibujo' || first === 'lectura' && false) { global.App.go('draw'); return; }
      global.Activities.startArea(picked.areas[0], { count: 3 });
    });
  }

  /* -------------------------------------------------------
     Hito / hitos
  ------------------------------------------------------- */
  function checkMilestones() {
    var s = global.State.get();
    var done = global.State.countDone(s);
    var msgs = [];
    if (done === 10 && s.trophies.indexOf('ten') < 0) { global.State.addTrophy('ten'); msgs.push('10 actividades completadas'); }
    if (done === 50 && s.trophies.indexOf('fifty') < 0) { global.State.addTrophy('fifty'); msgs.push('50 actividades completadas'); }
    if (msgs.length) {
      global.Feedback.toast('Trofeo desbloqueado: ' + msgs[0]);
      global.Audio.play('achievement');
    }
  }

  /* -------------------------------------------------------
     Mapa de aprendizaje + insignias
  ------------------------------------------------------- */
  function renderAchievements() {
    var s = global.State.get();
    var sum = el('ach-summary');
    if (sum) {
      sum.innerHTML = '<div class="stat-grid">' +
        '<div class="stat"><b>' + s.stars + '</b><span>Estrellas</span></div>' +
        '<div class="stat"><b>' + s.xp + '</b><span>Experiencia</span></div>' +
        '<div class="stat"><b>' + global.State.countDone(s) + '</b><span>Actividades correctas</span></div>' +
        '<div class="stat"><b>' + (s.badges || []).length + '</b><span>Insignias</span></div>' +
        '<div class="stat"><b>' + global.State.fmtDuration(s.usage.seconds) + '</b><span>Tiempo jugando</span></div>' +
        '</div>';
    }

    var map = el('learning-map');
    if (map) {
      var skills = s.skills || global.State.blankSkills();
      var icons = {
        lenguaje: Icons.svg('read'), matematica: Icons.svg('math'), logica: Icons.svg('think'),
        memoria: Icons.svg('star'), atencion: Icons.svg('star'), creatividad: Icons.svg('create'),
        ciencia: Icons.svg('science'), coordinacion: Icons.svg('build'),
        comprension_auditiva: Icons.svg('speaker'), comunicacion: Icons.svg('mic'),
        social: Icons.svg('heart'), programacion: Icons.svg('code')
      };
      map.innerHTML = Object.keys(skills).map(function (k) {
        var v = Math.round(skills[k]);
        return '<div class="map-node"><div class="mn-ico" style="color:#0284c7">' + (icons[k] || Icons.svg('grid')) + '</div>' +
          '<div class="mn-name">' + global.State.skillLabel(k) + '</div>' +
          '<div class="mn-bar"><i style="width:' + v + '%"></i></div>' +
          '<div class="mn-val">' + v + '%</div></div>';
      }).join('');
    }

    var badges = el('badge-grid');
    if (badges) {
      var iconsB = { first: 'star', ten: 'trophy', fifty: 'trophy', streak3: 'star', streak5: 'star',
        artist: 'pencil', writer: 'write', builder: 'build', story: 'book', coder: 'code',
        curious: 'science', kind: 'heart', explorer: 'grid', daily: 'missions' };
      badges.innerHTML = global.State.allBadges().map(function (b) {
        var earned = (s.badges || []).indexOf(b.id) >= 0;
        return '<div class="badge' + (earned ? ' earned' : '') + '">' +
          '<div class="b-ico" style="color:#f59e0b">' + Icons.svg(iconsB[b.id] || 'star') + '</div>' +
          '<div class="b-name">' + b.name + '</div>' +
          '<div class="b-sub">' + b.sub + '</div></div>';
      }).join('');
    }
  }

  function refreshHome() {
    if (global.App && global.App.renderHome) global.App.renderHome();
  }

  function init() {
    ensure();
    var tabs = el('mission-tabs');
    if (tabs) {
      Array.prototype.forEach.call(tabs.children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          render(b.getAttribute('data-tab'));
          global.Audio.play('click');
        };
      });
    }
    on(el('btn-open-mission'), function () {
      global.App.go('missions');
      render('daily');
    });
    render('daily');
  }

  global.Missions = {
    init: init,
    render: render,
    ensure: ensure,
    checkMilestones: checkMilestones,
    renderAchievements: renderAchievements,
    refresh: refreshHome
  };
})(window);
