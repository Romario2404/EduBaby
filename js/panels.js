/* =========================================================
   panels.js - Panel de padres (PIN), panel docente,
   Mis proyectos y Configuración.
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(n, fn) { if (n) n.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }
  function esc(s) { return String(s == null ? '' : s).replace(/[<>&"]/g, function (c) { return ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' })[c]; }); }

  /* =======================================================
     PANEL DE PADRES (protegido con PIN)
  ======================================================= */
  var pinValue = '';

  function initParent() {
    var input = el('pin-input');
    if (input) {
      input.addEventListener('input', function () {
        pinValue = input.value.replace(/\D/g, '').slice(0, 6);
        input.value = pinValue;
        paintDots();
      });
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryUnlock(); });
    }
    on(el('btn-pin-ok'), tryUnlock);
    on(el('btn-pin-help'), function () {
      var s = global.State.get();
      global.Feedback.modal({
        title: 'Recuperar PIN',
        text: 'Tu PIN actual es ' + s.settings.pin + '. Puedes cambiarlo más abajo en la sección de seguridad. Si lo olvidaste, puedes restablecer todos los datos del dispositivo.',
        buttons: [
          { label: 'Entendido', style: 'btn-primary' },
          { label: 'Borrar datos', style: 'btn-ghost', onClick: function () {
              global.Feedback.confirm('¿Borrar todos los datos?', 'Se eliminará el progreso, los proyectos y la configuración de este dispositivo. No se puede deshacer.', function () {
                global.Storage.clear();
                location.reload();
              }, 'Sí, borrar todo');
            } }
        ]
      });
    });
    paintDots();
  }

  function paintDots() {
    var row = el('pin-row');
    if (!row) return;
    var n = 4;
    row.innerHTML = '';
    for (var i = 0; i < n; i++) row.appendChild(h('span', 'pin-dot' + (i < pinValue.length ? ' on' : '')));
  }

  function tryUnlock() {
    var s = global.State.get();
    var fb = el('pin-feedback');
    if (pinValue === String(s.settings.pin)) {
      fb.textContent = '';
      el('parent-lock').classList.add('hidden');
      var panel = el('parent-panel');
      panel.classList.remove('hidden');
      renderParent();
      global.Audio.play('correct');
    } else {
      fb.className = 'feedback-line retry';
      fb.textContent = 'PIN incorrecto.';
      global.Audio.play('wrong');
      pinValue = '';
      el('pin-input').value = '';
      paintDots();
    }
  }

  function renderParent() {
    var s = global.State.get();
    var panel = el('parent-panel');
    var stats = global.State.areaStats();
    var log = s.activityLog || [];

    var areasWorked = Object.keys(stats);
    var last7 = log.filter(function (e) { return Date.now() - e.ts < 7 * 864e5; });

    var html = '';

    html += '<div class="card"><h2 class="h2">Resumen de actividad</h2>' +
      '<div class="stat-grid">' +
      '<div class="stat"><b>' + global.State.fmtDuration(s.usage.seconds) + '</b><span>Tiempo total</span></div>' +
      '<div class="stat"><b>' + s.usage.sessions + '</b><span>Sesiones</span></div>' +
      '<div class="stat"><b>' + (s.daily.activities || 0) + '</b><span>Actividades hoy</span></div>' +
      '<div class="stat"><b>' + last7.length + '</b><span>Últimos 7 días</span></div>' +
      '<div class="stat"><b>' + s.stars + '</b><span>Estrellas</span></div>' +
      '<div class="stat"><b>' + (s.projectCount || 0) + '</b><span>Proyectos</span></div>' +
      '</div></div>';

    html += '<div class="card"><h3 class="h3">Hoy practicó</h3>';
    var todayLog = log.filter(function (e) { return new Date(e.ts).toDateString() === new Date().toDateString(); });
    if (!todayLog.length) html += '<p class="muted">Todavía no registró actividades hoy.</p>';
    else {
      var bySkill = {};
      todayLog.forEach(function (e) { bySkill[e.skill] = (bySkill[e.skill] || 0) + 1; });
      html += '<ul>' + Object.keys(bySkill).map(function (k) {
        return '<li><b>' + global.State.skillLabel(k) + '</b>: ' + bySkill[k] + ' actividad' + (bySkill[k] > 1 ? 'es' : '') + '</li>';
      }).join('') + '</ul>';
    }
    html += '</div>';

    html += '<div class="card"><h3 class="h3">Áreas exploradas</h3>';
    if (!areasWorked.length) html += '<p class="muted">Aún no ha explorado áreas.</p>';
    else {
      html += areasWorked.map(function (a) {
        var st = stats[a];
        var pct = st.total ? Math.round((st.ok / st.total) * 100) : 0;
        var info = global.Data.areas[a] || { name: a };
        return '<div class="bar-row"><div class="bar-label"><span>' + esc(info.name) + '</span><span>' + st.ok + '/' + st.total + ' correctas</span></div>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
      }).join('');
    }
    html += '</div>';

    html += '<div class="card"><h3 class="h3">Necesita seguir practicando</h3>';
    var skills = s.skills || global.State.blankSkills();
    var weakest = Object.keys(skills).sort(function (a, b) { return skills[a] - skills[b]; }).slice(0, 4);
    html += '<p class="muted">Estas son las áreas con menor puntaje interno. Sirven para adaptar actividades, no para etiquetar.</p>';
    html += weakest.map(function (k) {
      return '<div class="bar-row"><div class="bar-label"><span>' + global.State.skillLabel(k) + '</span><span>' + Math.round(skills[k]) + '%</span></div>' +
        '<div class="bar"><i style="width:' + Math.round(skills[k]) + '%"></i></div></div>';
    }).join('');
    html += '</div>';

    html += '<div class="card"><h3 class="h3">Control de tiempo</h3>' +
      '<label class="field"><span>Descanso cada <b id="sess-val">' + s.settings.sessionMinutes + '</b> minutos</span>' +
      '<input type="range" id="sess-range" min="5" max="45" step="5" value="' + s.settings.sessionMinutes + '"></label>' +
      '<label class="field"><span>Duración del descanso: <b id="rest-val">' + s.settings.restSeconds + '</b> segundos</span>' +
      '<input type="range" id="rest-range" min="15" max="90" step="15" value="' + s.settings.restSeconds + '"></label>' +
      '<p class="muted">La aplicación no usa mecanismos para mantener al niño conectado indefinidamente. Cuando se cumple el tiempo, aparece una pantalla de descanso.</p>' +
      '</div>';

    html += '<div class="card"><h3 class="h3">Seguridad y privacidad</h3>' +
      '<label class="field"><span>Cambiar PIN del panel</span>' +
      '<input type="password" id="new-pin" inputmode="numeric" maxlength="6" placeholder="Nuevo PIN" style="max-width:200px"></label>' +
      '<div class="actions">' +
      '<button class="btn btn-primary" id="save-pin">Guardar PIN</button>' +
      '<button class="btn btn-soft" id="btn-lock">Bloquear panel</button>' +
      '<button class="btn btn-ghost" id="btn-export">Exportar datos</button>' +
      '<button class="btn btn-ghost" id="btn-wipe">Borrar todos los datos</button>' +
      '</div>' +
      '<p class="muted">Esta aplicación no recoge datos personales, no tiene chat público, no muestra publicidad y no comparte los trabajos del niño. Todo se guarda en este dispositivo.</p>' +
      '<p class="muted" id="storage-info"></p>' +
      '</div>';

    html += '<div class="card"><h3 class="h3">Últimas actividades</h3>';
    if (!log.length) html += '<p class="muted">Sin registros todavía.</p>';
    else {
      html += '<div class="list">' + log.slice(0, 12).map(function (e) {
        var info = global.Data.byId(e.id);
        var area = global.Data.areas[e.area] || { name: e.area };
        return '<div class="list-item"><span class="li-body"><span class="li-title">' + esc(info ? info.question : e.id) + '</span>' +
          '<span class="li-sub">' + esc(area.name) + ' · dificultad ' + e.difficulty + ' · ' + (e.correct ? 'logrado' : 'en práctica') + '</span></span>' +
          '<span class="li-meta">' + (e.correct ? 'OK' : 'Repetir') + '</span></div>';
      }).join('') + '</div>';
    }
    html += '</div>';

    panel.innerHTML = html;

    var info = el('storage-info');
    if (info) {
      var si = global.Storage.info();
      info.textContent = 'Almacenamiento local: ' + (si.local ? 'localStorage activo' : 'sin localStorage') +
        ', ' + (si.idb ? 'IndexedDB activo' : 'sin IndexedDB') + ' · ' + si.kb + ' KB usados.';
    }

    var sr = el('sess-range');
    if (sr) sr.oninput = function () {
      global.State.get().settings.sessionMinutes = parseInt(sr.value, 10);
      el('sess-val').textContent = sr.value;
      global.State.save(true);
    };
    var rr = el('rest-range');
    if (rr) rr.oninput = function () {
      global.State.get().settings.restSeconds = parseInt(rr.value, 10);
      el('rest-val').textContent = rr.value;
      global.State.save(true);
    };
    on(el('save-pin'), function () {
      var v = (el('new-pin').value || '').replace(/\D/g, '');
      if (v.length < 4) { global.Feedback.toast('El PIN debe tener al menos 4 dígitos.'); return; }
      global.State.get().settings.pin = v;
      global.State.save(true);
      global.Feedback.toast('PIN actualizado.');
    });
    on(el('btn-lock'), function () {
      el('parent-panel').classList.add('hidden');
      el('parent-lock').classList.remove('hidden');
      pinValue = '';
      el('pin-input').value = '';
      paintDots();
    });
    on(el('btn-export'), exportData);
    on(el('btn-wipe'), function () {
      global.Feedback.confirm('¿Borrar todos los datos?', 'Se eliminará el progreso de este dispositivo. No se puede deshacer.', function () {
        global.Storage.clear();
        location.reload();
      }, 'Sí, borrar todo');
    });
  }

  function exportData() {
    try {
      var payload = {
        app: 'Mundo Crece',
        version: 1,
        exportedAt: new Date().toISOString(),
        state: global.State.get()
      };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'mundo-crece-datos.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      global.Feedback.toast('Datos exportados.');
    } catch (e) {
      global.Feedback.toast('No se pudieron exportar los datos.');
    }
  }

  /* =======================================================
     PANEL DOCENTE
  ======================================================= */
  function renderTeacher(tab) {
    var stage = el('teacher-stage');
    if (!stage) return;
    stage.innerHTML = '';
    tab = tab || 'generator';

    if (tab === 'generator') renderGenerator(stage);
    else if (tab === 'assign') renderAssign(stage);
    else if (tab === 'results') renderResults(stage);
    else renderBrand(stage);
  }

  function renderGenerator(stage) {
    var card = h('div', 'card');
    var ages = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
    var areas = Object.keys(global.Data.areas);
    var skills = global.State.blankSkills();
    var diffs = ['1 - muy fácil', '2 - fácil', '3 - medio', '4 - difícil', '5 - avanzado'];
    var modes = ['Juego', 'Escritura', 'Dibujo', 'Voz', 'Construcción', 'Selección'];

    card.innerHTML = '<h2 class="h2">Generador de actividades</h2>' +
      '<p class="muted">Elige los parámetros y la aplicación construirá la actividad.</p>' +
      '<label class="field"><span>Edad</span><select id="gen-age">' +
      ages.map(function (a) { return '<option value="' + a + '">' + a + ' años</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Área</span><select id="gen-area">' +
      areas.map(function (a) { return '<option value="' + a + '">' + global.Data.areas[a].name + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Habilidad</span><select id="gen-skill">' +
      Object.keys(skills).map(function (s) { return '<option value="' + s + '">' + global.State.skillLabel(s) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Dificultad</span><select id="gen-diff">' +
      diffs.map(function (d, i) { return '<option value="' + (i + 1) + '">' + d + '</option>'; }).join('') + '</select></label>' +
      '<label class="field"><span>Modalidad</span><select id="gen-mode">' +
      modes.map(function (m) { return '<option>' + m + '</option>'; }).join('') + '</select></label>' +
      '<div class="actions"><button class="btn btn-primary" id="gen-run">Generar actividad</button></div>' +
      '<div id="gen-out"></div>';
    stage.appendChild(card);

    on(el('gen-run'), function () {
      var age = parseInt(el('gen-age').value, 10);
      var area = el('gen-area').value;
      var diff = parseInt(el('gen-diff').value, 10);
      var mode = el('gen-mode').value;

      var pool = global.Data.activities.filter(function (a) {
        return a.area === area && age >= a.ageMin && age <= a.ageMax && Math.abs(a.difficulty - diff) <= 1;
      });
      if (!pool.length) pool = global.Data.activities.filter(function (a) { return a.area === area; });
      if (!pool.length) pool = global.Data.activities;

      var a = pool.sort(function (x, y) { return Math.abs(x.difficulty - diff) - Math.abs(y.difficulty - diff); })[0];

      var typeMap = { 'Selección': 'selection', 'Escritura': 'text', 'Voz': 'speak', 'Dibujo': 'draw', 'Construcción': 'build', 'Juego': a.type };
      var generated = Object.assign({}, a, {
        id: a.id + '_g' + Date.now().toString(36),
        type: typeMap[mode] || a.type,
        difficulty: diff
      });

      el('gen-out').innerHTML = '<div class="card small" style="margin-top:14px">' +
        '<span class="tag tag-sky">Actividad generada</span>' +
        '<p class="act-question" style="margin-top:8px;font-size:1.05rem">' + esc(generated.question) + '</p>' +
        '<p class="muted">Área: ' + esc((global.Data.areas[area] || {}).name) + ' · Habilidad: ' + esc(global.State.skillLabel(a.skill)) +
        ' · Dificultad: ' + diff + ' · Modalidad: ' + esc(mode) + ' · Tipo: ' + esc(generated.type) + '</p>' +
        '<div class="actions"><button class="btn btn-primary" id="gen-launch">Probar ahora</button>' +
        '<button class="btn btn-soft" id="gen-assign">Asignar</button></div></div>';

      global.Data.activities.push(generated);
      on(el('gen-launch'), function () { global.Activities.startActivityById(generated.id); });
      on(el('gen-assign'), function () {
        var s = global.State.get();
        s.assigned.push(generated.id);
        global.State.save(true);
        global.Feedback.toast('Actividad asignada al estudiante.');
      });
      global.Audio.play('correct');
    });
  }

  function renderAssign(stage) {
    var s = global.State.get();
    var card = h('div', 'card');
    card.innerHTML = '<h2 class="h2">Asignar actividades</h2>' +
      '<p class="muted">Las actividades asignadas aparecen primero para el estudiante.</p>';
    var list = h('div', 'list');
    if (!s.assigned || !s.assigned.length) list.innerHTML = '<p class="muted">No hay actividades asignadas todavía.</p>';
    else {
      s.assigned.forEach(function (id, i) {
        var a = global.Data.byId(id);
        var row = h('div', 'list-item');
        row.innerHTML = '<span class="li-body"><span class="li-title">' + esc(a ? a.question : id) + '</span>' +
          '<span class="li-sub">' + (a ? (global.Data.areas[a.area] || {}).name : '') + '</span></span>';
        var del = h('button', 'btn btn-mini', 'Quitar');
        del.onclick = function () {
          s.assigned.splice(i, 1);
          global.State.save(true);
          renderTeacher('assign');
        };
        row.appendChild(del);
        list.appendChild(row);
      });
    }
    card.appendChild(list);

    var add = h('div', 'actions');
    var sel = h('select');
    sel.style.cssText = 'padding:12px;border:2px solid var(--line);border-radius:14px';
    global.Data.activities.forEach(function (a) {
      var o = document.createElement('option');
      o.value = a.id;
      o.textContent = a.question.slice(0, 60);
      sel.appendChild(o);
    });
    var btn = h('button', 'btn btn-primary', 'Asignar seleccionada');
    btn.onclick = function () {
      s.assigned.push(sel.value);
      global.State.save(true);
      global.Feedback.toast('Asignada.');
      renderTeacher('assign');
    };
    add.appendChild(sel);
    add.appendChild(btn);
    card.appendChild(add);
    stage.appendChild(card);
  }

  function renderResults(stage) {
    var s = global.State.get();
    var stats = global.State.areaStats();
    var card = h('div', 'card');
    card.innerHTML = '<h2 class="h2">Resultados</h2>';
    var keys = Object.keys(stats);
    if (!keys.length) card.innerHTML += '<p class="muted">Aún no hay resultados registrados.</p>';
    else {
      card.innerHTML += keys.map(function (k) {
        var st = stats[k];
        var pct = st.total ? Math.round((st.ok / st.total) * 100) : 0;
        return '<div class="bar-row"><div class="bar-label"><span>' + esc((global.Data.areas[k] || {}).name || k) +
          '</span><span>' + st.ok + '/' + st.total + ' (' + pct + '%)</span></div>' +
          '<div class="bar"><i style="width:' + pct + '%"></i></div></div>';
      }).join('');
    }
    card.innerHTML += '<div class="actions"><button class="btn btn-soft" id="res-export">Exportar CSV</button></div>';
    stage.appendChild(card);
    on(el('res-export'), function () {
      var rows = [['id', 'area', 'habilidad', 'dificultad', 'correcto', 'intentos', 'segundos', 'fecha']];
      (s.activityLog || []).forEach(function (e) {
        rows.push([e.id, e.area, e.skill, e.difficulty, e.correct ? 1 : 0, e.attempts, e.seconds, new Date(e.ts).toISOString()]);
      });
      var csv = rows.map(function (r) { return r.join(','); }).join('\n');
      try {
        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'mundo-crece-resultados.csv';
        document.body.appendChild(a);
        a.click();
        a.remove();
        global.Feedback.toast('CSV exportado.');
      } catch (e) { global.Feedback.toast('No se pudo exportar.'); }
    });
  }

  function renderBrand(stage) {
    var s = global.State.get();
    var card = h('div', 'card');
    card.innerHTML = '<h2 class="h2">Nombre de la aplicación</h2>' +
      '<p class="muted">Se usa en toda la interfaz. Cambia cuando quieras.</p>' +
      '<label class="field"><span>Nombre</span><input type="text" id="brand-name" maxlength="40" value="' + esc(s.brand.name) + '"></label>' +
      '<label class="field"><span>Subtítulo</span><input type="text" id="brand-tag" maxlength="70" value="' + esc(s.brand.tagline) + '"></label>' +
      '<div class="actions"><button class="btn btn-primary" id="brand-save">Guardar</button></div>';
    stage.appendChild(card);
    on(el('brand-save'), function () {
      s.brand.name = (el('brand-name').value || 'MUNDO CRECE').trim() || 'MUNDO CRECE';
      s.brand.tagline = (el('brand-tag').value || '').trim();
      global.State.save(true);
      global.App.applyBrand();
      global.Feedback.toast('Nombre actualizado.');
    });
  }

  /* =======================================================
     MIS PROYECTOS
  ======================================================= */
  function renderProjects() {
    var host = el('projects-list');
    if (!host) return;
    global.Storage.allBlobs('p_').then(function (rows) {
      var items = rows.map(function (r) { return r.data; }).filter(Boolean)
        .sort(function (a, b) { return b.ts - a.ts; });
      if (!items.length) {
        host.innerHTML = '<div class="card"><p class="muted">Aún no has guardado proyectos. Dibuja, construye o crea un cuento y guárdalo aquí.</p>' +
          '<div class="actions"><button class="btn btn-primary" id="pj-go">Crear algo</button></div></div>';
        on(el('pj-go'), function () { global.App.go('create'); });
        return;
      }
      host.innerHTML = items.map(function (p) {
        var typeIcon = { dibujo: 'pencil', construccion: 'build', cuento: 'book', colorear: 'paint', experimento: 'science', mision: 'missions' }[p.type] || 'folder';
        var thumb = p.image
          ? '<img src="' + p.image + '" alt="' + esc(p.title) + '" style="width:70px;height:70px;object-fit:cover;border-radius:12px;border:1px solid var(--line)">'
          : '<span class="li-ico">' + Icons.svg(typeIcon) + '</span>';
        return '<div class="list-item" data-id="' + p.id + '">' + thumb +
          '<span class="li-body"><span class="li-title">' + esc(p.title) + '</span>' +
          '<span class="li-sub">' + esc(String(p.description || '').slice(0, 90)) + ' · ' +
          new Date(p.ts).toLocaleDateString() + '</span></span>' +
          '<span class="li-meta">' + esc(p.type) + '</span></div>';
      }).join('') +
      '<div class="actions"><button class="btn btn-soft" id="pj-add">Nuevo proyecto</button></div>';

      Array.prototype.forEach.call(host.querySelectorAll('[data-id]'), function (node) {
        node.onclick = function () { openProject(node.getAttribute('data-id')); };
      });
      on(el('pj-add'), function () { global.App.go('create'); });
    }).catch(function () {
      host.innerHTML = '<p class="muted">No se pudieron cargar los proyectos.</p>';
    });
  }

  function openProject(id) {
    global.Storage.getBlob(id).then(function (row) {
      if (!row) { global.Feedback.toast('Proyecto no encontrado.'); return; }
      var p = row.data;
      var html = '<p class="muted">' + esc(p.description || '') + '</p>';
      if (p.image) html += '<img src="' + p.image + '" alt="Proyecto" style="width:100%;border-radius:14px">';
      if (p.order) html += '<p class="muted">Escenas: ' + esc(p.order) + '</p>';
      if (p.pieces && p.pieces.length) html += '<p class="muted">Piezas: ' + p.pieces.length + '</p>';
      global.Feedback.modal({
        title: p.title, html: html,
        buttons: [
          { label: 'Escuchar', style: 'btn-soft', keepOpen: true, onClick: function () { global.Speech.speak(p.title + '. ' + (p.description || '')); } },
          { label: 'Eliminar', style: 'btn-ghost', onClick: function () {
              global.Feedback.confirm('¿Eliminar este proyecto?', 'No se puede deshacer.', function () {
                global.Storage.deleteBlob(id).then(renderProjects);
                global.Feedback.toast('Proyecto eliminado.');
              }, 'Sí, eliminar');
            }, keepOpen: true },
          { label: 'Cerrar', style: 'btn-primary' }
        ]
      });
    });
  }

  /* =======================================================
     CONFIGURACIÓN / ACCESIBILIDAD
  ======================================================= */
  function renderSettings() {
    var body = el('settings-body');
    if (!body) return;
    var s = global.State.get();
    var st = s.settings;

    body.innerHTML =
      '<h2 class="h2">Configuración</h2>' +
      '<div class="field"><span>Sonido</span>' +
        '<div class="chip-row"><button class="pick-chip' + (st.sound ? ' selected' : '') + '" data-set="sound" data-v="1">Activado</button>' +
        '<button class="pick-chip' + (!st.sound ? ' selected' : '') + '" data-set="sound" data-v="0">Silenciado</button></div></div>' +
      '<div class="field"><span>Instrucciones por voz</span>' +
        '<div class="chip-row"><button class="pick-chip' + (st.voice ? ' selected' : '') + '" data-set="voice" data-v="1">Activada</button>' +
        '<button class="pick-chip' + (!st.voice ? ' selected' : '') + '" data-set="voice" data-v="0">Desactivada</button></div></div>' +
      '<label class="field"><span>Velocidad de la voz: <b id="rate-val">' + st.rate + '</b></span>' +
        '<input type="range" id="rate-range" min="0.6" max="1.4" step="0.05" value="' + st.rate + '"></label>' +
      '<div class="field"><span>Tamaño de texto</span>' +
        '<div class="chip-row">' +
        ['base', 'lg', 'xl'].map(function (t) {
          return '<button class="pick-chip' + (st.textSize === t ? ' selected' : '') + '" data-set="textSize" data-v="' + t + '">' +
            (t === 'base' ? 'Normal' : t === 'lg' ? 'Grande' : 'Muy grande') + '</button>';
        }).join('') + '</div></div>' +
      '<div class="field"><span>Accesibilidad</span>' +
        '<div class="chip-row">' +
        '<button class="pick-chip' + (st.contrast ? ' selected' : '') + '" data-set="contrast" data-v="1">Contraste alto</button>' +
        '<button class="pick-chip' + (!st.contrast ? ' selected' : '') + '" data-set="contrast" data-v="0">Contraste normal</button>' +
        '<button class="pick-chip' + (st.reduceMotion ? ' selected' : '') + '" data-set="reduceMotion" data-v="1">Reducir movimiento</button>' +
        '<button class="pick-chip' + (!st.reduceMotion ? ' selected' : '') + '" data-set="reduceMotion" data-v="0">Movimiento normal</button>' +
        '</div></div>' +
      '<div class="field"><span>Voz de reconocimiento</span><p class="muted" id="cap-info"></p></div>' +
      '<div class="card small"><h3 class="h3">Perfil</h3>' +
        '<div class="actions"><button class="btn btn-soft" id="set-edit">Editar mi perfil</button>' +
        '<button class="btn btn-ghost" id="set-reset">Reiniciar todo el progreso</button></div></div>' +
      '<div class="actions"><button class="btn btn-primary" id="set-close">Listo</button></div>';

    var cap = el('cap-info');
    if (cap) {
      var c = global.Speech.capability();
      cap.textContent = 'Texto a voz: ' + (c.tts ? 'disponible' : 'no disponible') + ' · ' +
        'Reconocimiento de voz: ' + (c.asr ? 'disponible' : 'no disponible') + '. ' +
        (c.asr ? '' : 'Usa el teclado o las opciones de selección como alternativa.');
    }

    Array.prototype.forEach.call(body.querySelectorAll('[data-set]'), function (b) {
      b.onclick = function () {
        var key = b.getAttribute('data-set');
        var raw = b.getAttribute('data-v');
        var val = raw === '1' ? true : raw === '0' ? false : raw;
        st[key] = val;
        global.State.save(true);
        applySettings();
        renderSettings();
        global.Audio.play('click');
      };
    });

    var rr = el('rate-range');
    if (rr) rr.oninput = function () {
      st.rate = parseFloat(rr.value);
      el('rate-val').textContent = st.rate.toFixed(2);
      global.State.save(true);
    };

    on(el('set-edit'), function () {
      var u = s.user;
      global.Feedback.modal({
        title: 'Editar perfil',
        html: '<label class="field"><span>Nombre o apodo</span><input type="text" id="ed-name" maxlength="20" value="' + esc(u ? u.name : '') + '"></label>' +
          '<label class="field"><span>Edad</span><input type="number" id="ed-age" min="4" max="16" value="' + (u ? u.age : 6) + '"></label>',
        buttons: [
          { label: 'Guardar', style: 'btn-primary', onClick: function () {
              var name = (document.getElementById('ed-name') || {}).value;
              var age = parseInt((document.getElementById('ed-age') || {}).value, 10);
              if (!name || !name.trim()) { global.Feedback.toast('Escribe un nombre.'); return; }
              global.State.createUser({ name: name.trim(), age: age, character: u ? u.character : 'gato', prefs: u ? u.prefs : [] });
              global.App.renderHome();
              global.Feedback.toast('Perfil actualizado.');
            } },
          { label: 'Cancelar', style: 'btn-ghost' }
        ]
      });
    });

    on(el('set-reset'), function () {
      global.Feedback.confirm('¿Reiniciar el progreso?', 'Se borrarán actividades, estrellas, insignias y proyectos. El perfil se conserva.', function () {
        global.Storage.clear();
        location.reload();
      }, 'Sí, reiniciar');
    });

    on(el('set-close'), function () { global.App.back(); });
  }

  function applySettings() {
    var st = global.State.get().settings;
    document.body.classList.toggle('text-lg', st.textSize === 'lg');
    document.body.classList.toggle('text-xl', st.textSize === 'xl');
    document.body.classList.toggle('contrast', !!st.contrast);
    document.body.classList.toggle('reduce-motion', !!st.reduceMotion);
    document.body.classList.toggle('theme-auto', st.theme === 'auto');
    global.Audio.setEnabled(!!st.sound);
    global.Speech.setVoiceEnabled(!!st.voice);
    var btn = el('btn-sound');
    if (btn) {
      btn.querySelector('.ico-sound-on').classList.toggle('hidden', !st.sound);
      btn.querySelector('.ico-sound-off').classList.toggle('hidden', !!st.sound);
    }
  }

  function init() {
    initParent();
    applySettings();
    on(el('btn-export-projects'), exportData);
    var imp = el('import-projects');
    if (imp) imp.onchange = function (ev) {
      var f = ev.target.files && ev.target.files[0];
      if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (data && data.state) {
            global.State.set(data.state);
            global.Feedback.toast('Datos importados correctamente.');
            global.App.renderHome();
          } else {
            global.Feedback.toast('El archivo no tiene el formato correcto.');
          }
        } catch (e) {
          global.Feedback.toast('No se pudo leer el archivo.');
        }
      };
      reader.readAsText(f);
      imp.value = '';
    };
  }

  global.Panels = {
    init: init,
    renderParent: renderParent,
    renderTeacher: renderTeacher,
    renderProjects: renderProjects,
    renderSettings: renderSettings,
    applySettings: applySettings,
    exportData: exportData
  };
})(window);
