/* =========================================================
   state.js - Estado global, perfil, progreso y adaptación
   ========================================================= */
(function (global) {
  'use strict';

  var KEY = 'state_v1';

  var DEFAULTS = {
    version: 1,
    brand: { name: 'MUNDO CRECE', tagline: 'Aprende, crea, juega y descubre.' },
    user: null,           // {name, age, character, prefs[], role}
    createdAt: null,
    skills: null,         // {lenguaje:50, matematica:50, ...}
    diagnosticDone: false,
    level: 1,             // 1..5 dificultad adaptativa
    streak: 0,
    stars: 0,
    coins: 0,
    xp: 0,
    badges: [],
    trophies: [],
    activityLog: [],      // últimos 300 registros
    projectCount: 0,
    settings: {
      sound: true,
      voice: true,
      rate: 0.95,
      textSize: 'base',
      contrast: false,
      reduceMotion: false,
      theme: 'light',
      sessionMinutes: 15,
      restSeconds: 30,
      pin: '1234'
    },
    usage: { seconds: 0, sessions: 0, lastDay: null },
    daily: { date: null, missionDone: false, activities: 0 },
    weekly: { date: null, missionDone: false },
    assigned: []          // actividades asignadas por docente
  };

  var state = load();

  function load() {
    var saved = global.Storage.get(KEY, null);
    if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(DEFAULTS));
    // Fusiona con defaults para tolerar cambios de esquema
    var s = JSON.parse(JSON.stringify(DEFAULTS));
    Object.keys(saved).forEach(function (k) {
      if (saved[k] && typeof saved[k] === 'object' && !Array.isArray(saved[k]) &&
        s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) {
        Object.keys(saved[k]).forEach(function (kk) { s[k][kk] = saved[k][kk]; });
      } else {
        s[k] = saved[k];
      }
    });
    return s;
  }

  var saveTimer = null;
  function save(immediate) {
    if (saveTimer) clearTimeout(saveTimer);
    var write = function () {
      try { global.Storage.set(KEY, state); }
      catch (e) { console.warn('No se pudo guardar el estado', e); }
    };
    if (immediate) write();
    else saveTimer = setTimeout(write, 350);
  }

  /* ---------- Niveles por edad ---------- */
  function levelForAge(age) {
    if (age <= 5) return 1;
    if (age <= 7) return 2;
    if (age <= 9) return 3;
    if (age <= 12) return 4;
    return 5;
  }

  var LEVEL_NAMES = {
    1: 'N1 · 4 a 5 años',
    2: 'N2 · 6 a 7 años',
    3: 'N3 · 8 a 9 años',
    4: 'N4 · 10 a 12 años',
    5: 'N5 · 13 años en adelante'
  };

  /* ---------- Perfil ---------- */
  function createUser(data) {
    state.user = {
      name: (data.name || 'Amiguito').slice(0, 20),
      age: Math.min(16, Math.max(4, parseInt(data.age, 10) || 6)),
      character: data.character || 'gato',
      prefs: data.prefs || [],
      role: data.role || 'student'
    };
    state.level = levelForAge(state.user.age);
    if (!state.createdAt) state.createdAt = Date.now();
    if (!state.skills) state.skills = blankSkills();
    save(true);
    return state.user;
  }

  function blankSkills() {
    return {
      lenguaje: 50, matematica: 50, logica: 50, memoria: 50,
      atencion: 50, creatividad: 50, ciencia: 50, coordinacion: 50,
      comprension_auditiva: 50, comunicacion: 50, social: 50, programacion: 40
    };
  }

  function skillLabel(key) {
    var map = {
      lenguaje: 'Lenguaje', matematica: 'Matematica', logica: 'Logica',
      memoria: 'Memoria', atencion: 'Atencion', creatividad: 'Creatividad',
      ciencia: 'Ciencia', coordinacion: 'Coordinacion',
      comprension_auditiva: 'Comprension auditiva', comunicacion: 'Comunicacion',
      social: 'Habilidades sociales', programacion: 'Programacion'
    };
    return map[key] || key;
  }

  /* ---------- Registro de actividad ---------- */
  function logActivity(entry) {
    entry = entry || {};
    entry.ts = entry.ts || Date.now();
    state.activityLog.unshift(entry);
    if (state.activityLog.length > 300) state.activityLog.length = 300;

    var today = new Date().toISOString().slice(0, 10);
    if (state.daily.date !== today) {
      state.daily = { date: today, missionDone: false, activities: 0 };
    }
    state.daily.activities++;

    // Sube XP y estrellas
    var gain = entry.correct ? 10 : 3;
    if (entry.attempts === 1 && entry.correct) gain += 5;
    state.xp += gain;
    if (entry.correct) state.stars += entry.difficulty || 1;

    // Ajusta habilidad
    if (entry.skill) {
      var delta = entry.correct ? 4 : 1;
      adjustSkill(entry.skill, delta);
    }

    // Adaptación de dificultad
    adaptLevel(entry);
    save();
    global.Missions && global.Missions.checkMilestones();
  }

  function adjustSkill(skill, delta) {
    if (!state.skills) state.skills = blankSkills();
    var cur = state.skills[skill];
    if (typeof cur !== 'number') cur = 50;
    state.skills[skill] = Math.max(5, Math.min(100, cur + delta));
  }

  function adaptLevel(entry) {
    var win = entry.correct === true;
    state._winStreak = win ? (state._winStreak || 0) + 1 : 0;
    state._failStreak = win ? 0 : (state._failStreak || 0) + 1;

    if (state._winStreak >= 3 && state.level < 5) {
      state.level++;
      state._winStreak = 0;
      global.Feedback && global.Feedback.toast('Se subio la dificultad. ¡Vamos a por mas!');
    }
    if (state._failStreak >= 3 && state.level > 1) {
      state.level--;
      state._failStreak = 0;
      global.Feedback && global.Feedback.toast('Ajuste la dificultad para que sea mas comoda.');
    }
    save();
  }

  /* ---------- Recompensas ---------- */
  var BADGES = [
    { id: 'first', name: 'Primer paso', sub: 'Termina tu primera actividad', check: function (s) { return s.activityLog.length >= 1; } },
    { id: 'ten', name: 'Diez retos', sub: '10 actividades completadas', check: function (s) { return countDone(s) >= 10; } },
    { id: 'fifty', name: 'Medio centenar', sub: '50 actividades', check: function (s) { return countDone(s) >= 50; } },
    { id: 'streak3', name: 'Racha de 3', sub: '3 aciertos seguidos', check: function (s) { return (s._bestStreak || 0) >= 3 || (s._winStreak || 0) >= 3; } },
    { id: 'streak5', name: 'Racha de 5', sub: '5 aciertos seguidos', check: function (s) { return (s._bestStreak || 0) >= 5; } },
    { id: 'artist', name: 'Artista', sub: '3 dibujos guardados', check: function (s) { return (s._draws || 0) >= 3; } },
    { id: 'writer', name: 'Escritor', sub: '3 textos guardados', check: function (s) { return (s._writings || 0) >= 3; } },
    { id: 'builder', name: 'Constructor', sub: '2 construcciones', check: function (s) { return (s._builds || 0) >= 2; } },
    { id: 'story', name: 'Cuentacuentos', sub: 'Crea un cuento', check: function (s) { return (s._stories || 0) >= 1; } },
    { id: 'coder', name: 'Programador', sub: 'Lleva el robot a la meta', check: function (s) { return (s._coded || 0) >= 1; } },
    { id: 'curious', name: 'Curioso', sub: '5 ciencias', check: function (s) { return (s._science || 0) >= 5; } },
    { id: 'kind', name: 'Buen amigo', sub: '5 actividades sociales', check: function (s) { return (s._social || 0) >= 5; } },
    { id: 'explorer', name: 'Explorador', sub: 'Usa 6 areas distintas', check: function (s) { return uniqueAreas(s) >= 6; } },
    { id: 'daily', name: 'Constante', sub: 'Mision del dia', check: function (s) { return !!s.daily.missionDone; } }
  ];

  function countDone(s) { return (s.activityLog || []).filter(function (e) { return e.correct; }).length; }
  function uniqueAreas(s) {
    var set = {};
    (s.activityLog || []).forEach(function (e) { if (e.area) set[e.area] = 1; });
    return Object.keys(set).length;
  }

  function bumpCounter(name, n) {
    state[name] = (state[name] || 0) + (n || 1);
    save();
  }

  function checkBadges() {
    var earned = [];
    BADGES.forEach(function (b) {
      if (state.badges.indexOf(b.id) === -1) {
        try {
          if (b.check(state)) { state.badges.push(b.id); earned.push(b); }
        } catch (e) { /* ignorar */ }
      }
    });
    if (earned.length) { save(true); }
    return earned;
  }

  function allBadges() { return BADGES; }

  function addTrophy(id) {
    if (state.trophies.indexOf(id) === -1) {
      state.trophies.push(id);
      save(true);
      return true;
    }
    return false;
  }

  /* ---------- Uso / tiempo ---------- */
  var lastTick = Date.now();
  function tickUsage() {
    var now = Date.now();
    var delta = Math.min(60, Math.round((now - lastTick) / 1000));
    lastTick = now;
    if (delta > 0) state.usage.seconds += delta;
    var today = new Date().toISOString().slice(0, 10);
    if (state.usage.lastDay !== today) {
      state.usage.lastDay = today;
      state.usage.sessions++;
    }
    save();
  }
  setInterval(tickUsage, 20000);
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { tickUsage(); save(true); }
    else lastTick = Date.now();
  });

  function fmtDuration(sec) {
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    if (h > 0) return h + ' h ' + m + ' min';
    return m + ' min ' + (sec % 60) + ' s';
  }

  /* ---------- Progreso por área ---------- */
  function areaStats() {
    var out = {};
    (state.activityLog || []).forEach(function (e) {
      if (!e.area) return;
      if (!out[e.area]) out[e.area] = { total: 0, ok: 0, time: 0 };
      out[e.area].total++;
      if (e.correct) out[e.area].ok++;
      out[e.area].time += e.seconds || 0;
    });
    return out;
  }

  function reset() {
    state = JSON.parse(JSON.stringify(DEFAULTS));
    save(true);
  }

  global.State = {
    get: function () { return state; },
    set: function (patch) { Object.keys(patch).forEach(function (k) { state[k] = patch[k]; }); save(true); return state; },
    save: save,
    reset: reset,
    createUser: createUser,
    blankSkills: blankSkills,
    skillLabel: skillLabel,
    levelForAge: levelForAge,
    levelName: function (l) { return LEVEL_NAMES[l || state.level]; },
    logActivity: logActivity,
    adjustSkill: adjustSkill,
    bumpCounter: bumpCounter,
    checkBadges: checkBadges,
    allBadges: allBadges,
    addTrophy: addTrophy,
    areaStats: areaStats,
    fmtDuration: fmtDuration,
    countDone: countDone
  };
})(window);
