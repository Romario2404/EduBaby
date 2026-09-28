/* =========================================================
   app.js - Orquestador principal
   Navegación, inicio de sesión, diagnóstico, panel del niño,
   temporizador de descanso e inicialización.
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(n, fn) { if (n) n.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }

  /* =======================================================
     NAVEGACIÓN
  ======================================================= */
  var stack = [];
  var currentScreen = 'welcome';

  var NAV = [
    { id: 'home', label: 'Inicio', icon: 'home' },
    { id: 'create', label: 'Crear', icon: 'create' },
    { id: 'hub_writing', label: 'Escribir', icon: 'write' },
    { id: 'read', label: 'Leer', icon: 'read' },
    { id: 'hub_math', label: 'Matemática', icon: 'math' },
    { id: 'hub_think', label: 'Pensar', icon: 'think' },
    { id: 'science', label: 'Ciencia', icon: 'science' },
    { id: 'music', label: 'Música', icon: 'music' },
    { id: 'puzzles', label: 'Juegos', icon: 'games' },
    { id: 'build', label: 'Construir', icon: 'build' },
    { id: 'code', label: 'Programar', icon: 'code' },
    { id: 'emotions', label: 'Emociones', icon: 'heart' },
    { id: 'missions', label: 'Misiones', icon: 'missions' },
    { id: 'achievements', label: 'Logros', icon: 'trophy' },
    { id: 'projects', label: 'Proyectos', icon: 'folder' }
  ];

  /* Hubs: pantallas con tarjetas que abren otras pantallas */
  var HUBS = {
    hub_writing: {
      title: 'Escribir', icon: 'write',
      cards: [
        { label: 'Trazar letras', sub: 'Sigue el camino de la letra', icon: 'write', action: function () { go('trace'); } },
        { label: 'Cuaderno digital', sub: 'Escribe y dibuja', icon: 'pencil', action: function () { go('notebook'); } },
        { label: 'Practicar palabras', sub: 'Escucha y escribe', icon: 'read', action: function () { go('read'); Language.renderRead('words'); } },
        { label: 'Actividades de escritura', sub: 'Retos guiados', icon: 'grid', action: function () { Activities.startArea('lenguaje', { count: 5 }); } }
      ]
    },
    hub_math: {
      title: 'Matemática', icon: 'math',
      area: 'matematica',
      cards: [
        { label: 'Sumar con objetos', sub: 'Conteo visual', icon: 'math', action: function () { openArea('matematica'); } },
        { label: 'Torres y bloques', sub: 'Suma y resta manipulando', icon: 'build', action: function () { openArea('matematica'); } },
        { label: 'Dinero y compras', sub: 'Situaciones reales', icon: 'star', action: function () { openArea('matematica'); } },
        { label: 'Retos de matemática', sub: 'Actividades adaptativas', icon: 'grid', action: function () { Activities.startArea('matematica', { count: 5 }); } }
      ]
    },
    hub_think: {
      title: 'Pensar', icon: 'think',
      cards: [
        { label: 'Lógica', sub: 'Patrones, series y acertijos', icon: 'think', action: function () { openArea('logica'); } },
        { label: 'Memoria', sub: 'Recordar imágenes y sonidos', icon: 'star', action: function () { openArea('memoria'); } },
        { label: 'Atención', sub: 'Encontrar y comparar', icon: 'grid', action: function () { openArea('atencion'); } },
        { label: 'Rompecabezas', sub: 'Piezas, laberintos y figuras', icon: 'puzzle', action: function () { go('puzzles'); } }
      ]
    }
  };

  var SCREEN_TITLES = {};

  function computeTitles() {
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (s) {
      SCREEN_TITLES[s.id.replace('screen-', '')] = s.getAttribute('data-title') || 'Mundo Crece';
    });
    Object.keys(HUBS).forEach(function (k) { SCREEN_TITLES[k] = HUBS[k].title; });
  }

  /* Los hubs comparten una única pantalla contenedora (#screen-area) */
  function screenEl(id) {
    return el('screen-' + (HUBS[id] ? 'area' : id));
  }

  function go(id, replace) {
    if (id === currentScreen) return;
    var target = screenEl(id);
    if (!target) { console.warn('Pantalla no encontrada:', id); return; }
    if (!replace && currentScreen) stack.push(currentScreen);

    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (s) { s.classList.remove('active'); });
    target.classList.add('active');
    currentScreen = id;

    // Hub genérico
    if (HUBS[id]) renderHub(id);

    // Actualiza barra y navegación
    var chrome = (id !== 'welcome');
    el('topbar').classList.toggle('hidden', !chrome);
    el('bottomnav').classList.toggle('hidden', !chrome);
    el('topbar-title').textContent = HUBS[id] ? HUBS[id].title : (SCREEN_TITLES[id] || 'Mundo Crece');
    el('level-chip').textContent = 'N' + global.State.get().level;
    paintNav(id);

    // Render por pantalla
    onEnter(id);
    window.scrollTo(0, 0);
    global.Audio && global.Audio.play('click');
    location.hash = id;
  }

  function back() {
    if (!stack.length) { go('home', true); return; }
    var prev = stack.pop();
    var target = screenEl(prev);
    if (!target) { go('home', true); return; }
    Array.prototype.forEach.call(document.querySelectorAll('.screen'), function (s) { s.classList.remove('active'); });
    target.classList.add('active');
    currentScreen = prev;
    if (HUBS[prev]) renderHub(prev);
    el('topbar-title').textContent = HUBS[prev] ? HUBS[prev].title : (SCREEN_TITLES[prev] || 'Mundo Crece');
    paintNav(prev);
    onEnter(prev);
    window.scrollTo(0, 0);
  }

  function onEnter(id) {
    if (id === 'home') renderHome();
    if (id === 'achievements') global.Missions.renderAchievements();
    if (id === 'projects') global.Panels.renderProjects();
    if (id === 'settings') global.Panels.renderSettings();
    if (id === 'parent') { /* espera PIN */ }
    if (id === 'teacher') global.Panels.renderTeacher('generator');
    if (id === 'missions') global.Missions.render('daily');
    if (id === 'create') renderCreateHub();
    if (id === 'story-create') global.StoryCreator.render();
    if (id === 'read') global.Language.renderRead('active');
    if (id === 'puzzles') global.Creative.Puzzles.render();
    if (id === 'code') global.Labs.Coding.draw();
    if (id === 'diagnostic') renderDiagnostic();
    if (id === 'area') { /* se renderiza al abrir */ }
  }

  function paintNav(activeId) {
    var nav = el('bottomnav');
    nav.innerHTML = '';
    var items = NAV.concat([
      { id: 'settings', label: 'Ajustes', icon: 'settings' },
      { id: 'parent', label: 'Padres', icon: 'parent' },
      { id: 'teacher', label: 'Docentes', icon: 'teacher' }
    ]);
    items.forEach(function (it) {
      var b = h('button', 'nav-item' + (it.id === activeId || (HUBS[activeId] && it.id === activeId) ? ' active' : ''));
      b.innerHTML = Icons.svg(it.icon) + '<span>' + it.label + '</span>';
      b.setAttribute('aria-label', it.label);
      b.onclick = function () {
        if (it.id === 'parent') { resetParentLock(); }
        go(it.id);
      };
      nav.appendChild(b);
    });
  }

  function resetParentLock() {
    var lock = el('parent-lock');
    var panel = el('parent-panel');
    if (lock) lock.classList.remove('hidden');
    if (panel) panel.classList.add('hidden');
    var i = el('pin-input');
    if (i) i.value = '';
    var f = el('pin-feedback');
    if (f) f.textContent = '';
  }

  /* =======================================================
     HUBS Y CREAR
  ======================================================= */
  function renderHub(id) {
    var hub = HUBS[id];
    var head = el('area-head');
    var cards = el('area-cards');
    var list = el('area-list');
    if (!head || !cards) return;

    head.innerHTML = '<div style="display:flex;gap:14px;align-items:center">' +
      '<div class="li-ico" style="width:56px;height:56px">' + Icons.svg(hub.icon) + '</div>' +
      '<div><h2 class="h2" style="margin:0">' + hub.title + '</h2>' +
      '<p class="muted" style="margin:0">Elige una opción para comenzar.</p></div></div>';

    cards.innerHTML = '';
    hub.cards.forEach(function (c) {
      var b = h('button', 'mod-card');
      b.innerHTML = '<div class="mod-ico" style="background:linear-gradient(135deg,#38bdf8,#a855f7)">' + Icons.svg(c.icon) + '</div>' +
        '<div>' + c.label + '</div><div class="mod-sub">' + c.sub + '</div>';
      b.onclick = function () { global.Audio.play('click'); c.action(); };
      cards.appendChild(b);
    });

    if (list) {
      list.innerHTML = '';
      if (hub.area) {
        var acts = global.Data.byArea(hub.area);
        if (acts.length) {
          list.appendChild(h('h3', 'h3', 'Actividades disponibles (' + acts.length + ')'));
          acts.forEach(function (a) {
            var item = h('button', 'list-item');
            item.innerHTML = '<span class="li-ico">' + Icons.svg((global.Data.areas[hub.area] || {}).icon || 'grid') + '</span>' +
              '<span class="li-body"><span class="li-title">' + a.question + '</span>' +
              '<span class="li-sub">' + global.State.skillLabel(a.skill) + ' · dificultad ' + a.difficulty + '</span></span>' +
              '<span class="li-meta">Jugar</span>';
            item.onclick = function () { global.Audio.play('click'); global.Activities.startActivityById(a.id); };
            list.appendChild(item);
          });
        }
        global.MathLab.renderAreaExtras(list, hub.area);
      }
    }
  }

  function openArea(area) {
    var info = global.Data.areas[area];
    var head = el('area-head');
    var cards = el('area-cards');
    var list = el('area-list');
    if (!head) return;

    head.innerHTML = '<div style="display:flex;gap:14px;align-items:center">' +
      '<div class="li-ico" style="width:56px;height:56px;background:' + (info ? info.color : '#38bdf8') + '22">' +
      Icons.svg(info ? info.icon : 'grid') + '</div>' +
      '<div><h2 class="h2" style="margin:0">' + (info ? info.name : area) + '</h2>' +
      '<p class="muted" style="margin:0">' + (info ? info.desc : '') + '</p></div></div>';

    cards.innerHTML = '';
    var lvl = global.State.get().level;
    var acts = global.Data.byArea(area);

    // Tarjeta principal: jugar un set adaptativo
    var play = h('button', 'mod-card');
    play.innerHTML = '<div class="mod-ico" style="background:linear-gradient(135deg,#22c55e,#0ea5e9)">' + Icons.svg('play') + '</div>' +
      '<div>Jugar ahora</div><div class="mod-sub">Set adaptativo de 5 retos</div>';
    play.onclick = function () { global.Audio.play('click'); global.Activities.startArea(area, { count: 5 }); };
    cards.appendChild(play);

    acts.forEach(function (a) {
      var c = h('button', 'mod-card');
      c.innerHTML = '<div class="mod-ico" style="background:' + (info ? info.color : '#38bdf8') + '">' + Icons.svg(info ? info.icon : 'grid') + '</div>' +
        '<div style="font-size:.9rem">' + a.question.slice(0, 42) + (a.question.length > 42 ? '…' : '') + '</div>' +
        '<div class="mod-sub">Dificultad ' + a.difficulty + '</div>';
      c.onclick = function () { global.Audio.play('click'); global.Activities.startActivityById(a.id); };
      cards.appendChild(c);
    });
    void lvl;

    if (list) {
      list.innerHTML = '';
      global.MathLab.renderAreaExtras(list, area);
    }

    go('area');
    el('topbar-title').textContent = info ? info.name : 'Área';
  }

  function renderCreateHub() {
    var cards = el('create-cards');
    if (!cards) return;
    var items = [
      { label: 'Dibujar', sub: 'Libre, guiado y con instrucciones', icon: 'pencil', color: '#f43f5e', action: function () { go('draw'); } },
      { label: 'Colorear', sub: 'Animales, naturaleza, espacio', icon: 'paint', color: '#a855f7', action: function () { go('color'); } },
      { label: 'Cuaderno', sub: 'Escribir y guardar páginas', icon: 'write', color: '#8b5cf6', action: function () { go('notebook'); } },
      { label: 'Diseñar', sub: 'Casas, ciudades, robots', icon: 'build', color: '#10b981', action: function () { go('design'); renderDesign(); } },
      { label: 'Crear un cuento', sub: 'Personaje, lugar, problema', icon: 'book', color: '#6366f1', action: function () { go('story-create'); } },
      { label: 'Construir', sub: 'Bloques y retos', icon: 'build', color: '#0ea5e9', action: function () { go('build'); } }
    ];
    cards.innerHTML = '';
    items.forEach(function (c) {
      var b = h('button', 'mod-card');
      b.innerHTML = '<div class="mod-ico" style="background:' + c.color + '">' + Icons.svg(c.icon) + '</div>' +
        '<div>' + c.label + '</div><div class="mod-sub">' + c.sub + '</div>';
      b.onclick = function () { global.Audio.play('click'); c.action(); };
      cards.appendChild(b);
    });
  }

  function renderDesign() {
    var host = el('design-cards');
    if (!host) return;
    var items = [
      { n: 'Una casa', icon: 'home' }, { n: 'Una ciudad', icon: 'build' },
      { n: 'Una habitación', icon: 'grid' }, { n: 'Un parque', icon: 'tree' },
      { n: 'Un vehículo', icon: 'bus' }, { n: 'Un robot', icon: 'robot' },
      { n: 'Una nave espacial', icon: 'planet' }, { n: 'Un jardín', icon: 'tree' },
      { n: 'Una escuela', icon: 'book' }
    ];
    host.innerHTML = '';
    items.forEach(function (it) {
      var b = h('button', 'mod-card');
      b.innerHTML = '<div class="mod-ico" style="background:linear-gradient(135deg,#ec4899,#8b5cf6)">' + Icons.svg(it.icon === 'tree' || it.icon === 'bus' || it.icon === 'planet' || it.icon === 'robot' ? 'grid' : it.icon) + '</div>' +
        '<div>' + it.n + '</div><div class="mod-sub">Diseñar y explicar</div>';
      b.onclick = function () {
        global.Audio.play('click');
        go('build');
        el('topbar-title').textContent = 'Diseñar: ' + it.n;
        global.Feedback.say('Diseña ' + it.n + '. Cuando termines, explícanos cómo funciona.', 'think');
        var fb = el('build-feedback');
        if (fb) { fb.className = 'feedback-line soft'; fb.textContent = 'Reto de diseño: ' + it.n; }
      };
      host.appendChild(b);
    });
  }

  /* =======================================================
     PANTALLA DE BIENVENIDA
  ======================================================= */
  function initWelcome() {
    el('brand-mark').innerHTML = Icons.art('logo');
    applyBrand();

    var s = global.State.get();
    if (s.user) el('btn-continue').classList.remove('hidden');

    on(el('btn-start'), function () {
      if (s.user) { go('home'); return; }
      go('setup');
    });
    on(el('btn-continue'), function () { go('home'); });

    Array.prototype.forEach.call(document.querySelectorAll('[data-role]'), function (b) {
      b.onclick = function () {
        var role = b.getAttribute('data-role');
        global.Audio.play('click');
        if (role === 'student') { go(s.user ? 'home' : 'setup'); }
        else if (role === 'parent') { resetParentLock(); go('parent'); }
        else { go('teacher'); }
      };
    });
  }

  function applyBrand() {
    var b = global.State.get().brand;
    Array.prototype.forEach.call(document.querySelectorAll('[data-brand="name"]'), function (n) { n.textContent = b.name; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-brand="tagline"]'), function (n) { n.textContent = b.tagline; });
    document.title = b.name + ' - ' + b.tagline;
  }

  /* =======================================================
     CONFIGURACIÓN DE PERFIL
  ======================================================= */
  function initSetup() {
    var chars = [
      { id: 'gato', n: 'Gato' }, { id: 'lobo', n: 'Lobo' }, { id: 'rana', n: 'Rana' },
      { id: 'pajaro', n: 'Pájaro' }, { id: 'conejo', n: 'Conejo' }, { id: 'robot', n: 'Robot' }
    ];
    var prefs = ['Dibujar', 'Números', 'Leer', 'Música', 'Ciencia', 'Construir', 'Juegos', 'Historias'];
    var selected = { character: 'gato', prefs: [] };

    var grid = el('setup-characters');
    grid.innerHTML = '';
    chars.forEach(function (c) {
      var b = h('button', 'char-opt' + (c.id === selected.character ? ' selected' : ''));
      b.innerHTML = '<div style="width:56px;height:56px">' + Icons.avatar(c.id) + '</div><span>' + c.n + '</span>';
      b.onclick = function () {
        selected.character = c.id;
        Array.prototype.forEach.call(grid.children, function (x) { x.classList.remove('selected'); });
        b.classList.add('selected');
        global.Audio.play('pop');
      };
      grid.appendChild(b);
    });

    var prefHost = el('setup-prefs');
    prefHost.innerHTML = '';
    prefs.forEach(function (p) {
      var b = h('button', 'pick-chip', p);
      b.onclick = function () {
        var i = selected.prefs.indexOf(p);
        if (i >= 0) { selected.prefs.splice(i, 1); b.classList.remove('selected'); }
        else { selected.prefs.push(p); b.classList.add('selected'); }
        global.Audio.play('click');
      };
      prefHost.appendChild(b);
    });

    var age = el('setup-age');
    age.oninput = function () {
      el('setup-age-value').textContent = age.value;
      var lvl = global.State.levelForAge(parseInt(age.value, 10));
      el('setup-level-hint').textContent = global.State.levelName(lvl);
    };
    age.oninput();

    on(el('btn-save-profile'), function () {
      var name = (el('setup-name').value || '').trim();
      if (!name) {
        global.Feedback.toast('Escribe tu nombre o apodo para continuar.');
        el('setup-name').focus();
        return;
      }
      global.State.createUser({
        name: name,
        age: parseInt(age.value, 10),
        character: selected.character,
        prefs: selected.prefs
      });
      global.Audio.play('start');
      go('diagnostic');
    });
  }

  /* =======================================================
     DIAGNÓSTICO
  ======================================================= */
  function renderDiagnostic() {
    var areas = ['lenguaje', 'matematica', 'memoria', 'atencion', 'creatividad', 'logica', 'coordinacion', 'comprension_auditiva'];
    var host = el('diag-areas');
    host.innerHTML = areas.map(function (a) {
      return '<div class="diag-area">' + global.State.skillLabel(a) + '<span class="da-val">--</span></div>';
    }).join('');

    on(el('btn-start-diagnostic'), function () {
      global.Feedback.modal({
        art: Icons.art('mascot'),
        title: '¡Vamos a jugar un rato!',
        text: 'Te voy a mostrar 8 mini retos muy cortos. No hay nota: solo quiero conocerte mejor para elegir actividades a tu medida.',
        buttons: [{ label: '¡Empezar!', style: 'btn-primary', onClick: function () {
          global.Activities.runDiagnostic(function (results) {
            showDiagnosticResults(results);
          });
        } }]
      });
    });

    on(el('btn-skip-diagnostic'), function () {
      var s = global.State.get();
      if (!s.skills) s.skills = global.State.blankSkills();
      s.diagnosticDone = true;
      global.State.save(true);
      go('home');
    });
  }

  function showDiagnosticResults(results) {
    var html = '<div class="diag-areas">' + Object.keys(results).map(function (k) {
      return '<div class="diag-area">' + global.State.skillLabel(k) + '<span class="da-val">' + results[k] + '%</span></div>';
    }).join('') + '</div>' +
      '<p class="muted" style="margin-top:14px">Estos porcentajes no sirven para etiquetarte. Nos ayudan a elegir retos que te queden bien: si algo es sencillo, subimos el reto; si cuesta, lo bajamos.</p>';

    global.Feedback.modal({
      art: Icons.svg('star'),
      title: '¡Ya conozco tu perfil!',
      html: html,
      buttons: [
        { label: 'Ir a mi panel', style: 'btn-primary', onClick: function () { go('home'); } }
      ]
    });
    global.Feedback.celebrate();
    // El panel queda visible incluso si el niño cierra el modal con Escape.
    go('home');
  }

  /* =======================================================
     PANEL DEL NIÑO
  ======================================================= */
  function renderHome() {
    var s = global.State.get();
    var name = s.user ? s.user.name : 'Amiguito';

    el('home-greeting').textContent = 'Hola, ' + name + '.';
    el('home-avatar').innerHTML = s.user ? Icons.avatar(s.user.character) : Icons.art('mascot');
    el('level-chip').textContent = 'N' + s.level;

    // Misión
    global.Missions.ensure();
    var m = s.daily.mission;
    if (m) el('daily-mission-text').textContent = m.text + (s.daily.missionDone ? ' (¡cumplida!)' : '');

    // Tarjetas principales
    var cards = el('home-cards');
    var HOME = [
      { label: 'Crear', sub: 'Dibuja y colorea', icon: 'create', color: '#ec4899', action: function () { go('create'); } },
      { label: 'Pensar', sub: 'Lógica y memoria', icon: 'think', color: '#f59e0b', action: function () { go('hub_think'); } },
      { label: 'Leer', sub: 'Cuentos y palabras', icon: 'read', color: '#6366f1', action: function () { go('read'); } },
      { label: 'Resolver', sub: 'Matemática', icon: 'math', color: '#38bdf8', action: function () { go('hub_math'); } },
      { label: 'Descubrir', sub: 'Ciencia', icon: 'science', color: '#0ea5e9', action: function () { go('science'); } },
      { label: 'Construir', sub: 'Bloques y diseños', icon: 'build', color: '#10b981', action: function () { go('build'); } },
      { label: 'Música', sub: 'Piano y ritmos', icon: 'music', color: '#f97316', action: function () { go('music'); } },
      { label: 'Programar', sub: 'Robot virtual', icon: 'code', color: '#7c3aed', action: function () { go('code'); } }
    ];
    cards.innerHTML = '';
    HOME.forEach(function (c) {
      var b = h('button', 'mod-card');
      b.innerHTML = '<div class="mod-ico" style="background:' + c.color + '">' + Icons.svg(c.icon) + '</div>' +
        '<div>' + c.label + '</div><div class="mod-sub">' + c.sub + '</div>';
      b.onclick = function () { global.Audio.play('click'); c.action(); };
      cards.appendChild(b);
    });

    // Progreso
    var skills = s.skills || global.State.blankSkills();
    var top = Object.keys(skills).sort(function (a, b) { return skills[b] - skills[a]; }).slice(0, 4);
    el('home-progress').innerHTML =
      '<div class="stat-grid" style="margin-bottom:10px">' +
      '<div class="stat"><b>' + s.stars + '</b><span>Estrellas</span></div>' +
      '<div class="stat"><b>' + global.State.countDone(s) + '</b><span>Retos</span></div>' +
      '</div>' +
      top.map(function (k) {
        return '<div class="bar-row"><div class="bar-label"><span>' + global.State.skillLabel(k) + '</span><span>' + Math.round(skills[k]) + '%</span></div>' +
          '<div class="bar"><i style="width:' + Math.round(skills[k]) + '%"></i></div></div>';
      }).join('');

    // Proyecto actual
    global.Storage.allBlobs('p_').then(function (rows) {
      var items = rows.map(function (r) { return r.data; }).filter(Boolean).sort(function (a, b) { return b.ts - a.ts; });
      var host = el('home-project');
      if (!host) return;
      if (!items.length) {
        host.className = 'muted';
        host.textContent = 'Todavía no has guardado un proyecto. ¡Crea el primero!';
        return;
      }
      host.className = '';
      host.innerHTML = '<b>' + esc(items[0].title) + '</b><p class="muted" style="margin:4px 0">' +
        esc(String(items[0].description || '').slice(0, 70)) + '</p>' +
        '<button class="btn btn-mini" id="home-open-project">Abrir mis proyectos</button>';
      var btn = el('home-open-project');
      if (btn) btn.onclick = function () { go('projects'); global.Panels.renderProjects(); };
    }).catch(function () { /* silenciar */ });
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) {
      return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c];
    });
  }

  /* =======================================================
     DESCANSO
  ======================================================= */
  var restTimer = null;
  function startRest() {
    go('rest');
    el('rest-art').innerHTML = Icons.art('rest');
    var left = global.State.get().settings.restSeconds || 30;
    var node = el('rest-timer');
    node.textContent = '00:' + String(left).padStart(2, '0');
    if (restTimer) clearInterval(restTimer);
    restTimer = setInterval(function () {
      left--;
      node.textContent = '00:' + String(Math.max(0, left)).padStart(2, '0');
      if (left <= 0) {
        clearInterval(restTimer);
        global.Feedback.celebrate();
        global.Speech.speak('¡Listo! Puedes continuar.');
      }
    }, 1000);
    global.Speech.speak('Es momento de descansar los ojos y moverte un poco.');
    on(el('btn-rest-done'), function () {
      if (restTimer) clearInterval(restTimer);
      go('home');
    });
  }

  function scheduleRest() {
    var minutes = global.State.get().settings.sessionMinutes || 15;
    setTimeout(function () {
      if (currentScreen !== 'welcome' && currentScreen !== 'rest') startRest();
      scheduleRest();
    }, minutes * 60 * 1000);
  }

  /* =======================================================
     INICIALIZACIÓN
  ======================================================= */
  function initChrome() {
    on(el('btn-back'), back);
    on(el('btn-settings'), function () { go('settings'); });
    on(el('btn-sound'), function () {
      var st = global.State.get().settings;
      st.sound = !st.sound;
      global.State.save(true);
      global.Panels.applySettings();
      global.Feedback.toast(st.sound ? 'Sonido activado' : 'Sonido silenciado');
    });
    on(el('btn-voice'), function () {
      var st = global.State.get().settings;
      st.voice = !st.voice;
      global.State.save(true);
      global.Panels.applySettings();
      global.Feedback.toast(st.voice ? 'Voz activada' : 'Voz desactivada');
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && currentScreen !== 'welcome') back();
    });

    window.addEventListener('hashchange', function () {
      var id = location.hash.replace('#', '');
      if (id && id !== currentScreen && screenEl(id)) go(id, true);
    });
  }

  function initModules() {
    global.Creative.init();
    global.Language.init();
    global.Labs.init();
    global.Missions.init();
    global.Panels.init();

    /* Cada módulo enlaza sus propias pestañas al crearse (ciencia,
       música, emociones, código, lectura y misiones). Aquí solo falta
       el panel docente, que depende de Panels. */
    var teacherTabs = el('teacher-tabs');
    if (teacherTabs) {
      Array.prototype.forEach.call(teacherTabs.children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(teacherTabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          global.Panels.renderTeacher(b.getAttribute('data-tab'));
          global.Audio.play('click');
        };
      });
    }
  }

  function boot() {
    computeTitles();
    initWelcome();
    initSetup();
    initChrome();
    initModules();
    global.Panels.applySettings();

    // Pestañas de lectura
    var readTabs = el('read-tabs');
    if (readTabs) {
      Array.prototype.forEach.call(readTabs.children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(readTabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          global.Language.renderRead(b.getAttribute('data-tab'));
          global.Audio.play('click');
        };
      });
    }

    // Pestañas de misiones
    var missionTabs = el('mission-tabs');
    if (missionTabs) {
      Array.prototype.forEach.call(missionTabs.children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(missionTabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          global.Missions.render(b.getAttribute('data-tab'));
          global.Audio.play('click');
        };
      });
    }

    /* Las pestañas de ciencia, música, emociones, código, lectura y
       misiones ya están enlazadas por Labs.init(), Language.init(),
       Coding.init() y MissionTabs: aquí no se vuelven a asignar para
       no pisar sus manejadores de render. */

    paintNav('welcome');
    el('topbar').classList.add('hidden');
    el('bottomnav').classList.add('hidden');

    var s = global.State.get();
    if (s.user) el('btn-continue').classList.remove('hidden');

    var initial = location.hash.replace('#', '');
    if (initial && screenEl(initial)) go(initial, true);
    else go('welcome', true);

    scheduleRest();
    setInterval(function () { global.State.save(); }, 30000);

    // Evita el menú contextual en tablets dentro de la app
    document.addEventListener('contextmenu', function (e) {
      if (e.target && e.target.closest && e.target.closest('canvas, .build-piece')) e.preventDefault();
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.App = {
    go: go,
    back: back,
    renderHome: renderHome,
    applyBrand: applyBrand,
    openArea: openArea,
    current: function () { return currentScreen; },
    startRest: startRest
  };
})(window);
