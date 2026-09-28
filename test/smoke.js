/* Prueba de humo: carga la aplicación en jsdom, ejecuta todos los
   módulos y recorre las pantallas principales para detectar errores
   de ejecución.  Uso:  node test/smoke.js */
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');
const errors = [];
const warnings = [];

const vc = new VirtualConsole();
vc.on('jsdomError', (e) => {
  const msg = String(e && e.message ? e.message : e);
  if (/Not implemented|Could not load/i.test(msg)) return;
  errors.push('jsdomError: ' + msg + (e && e.stack ? '\n' + e.stack : ''));
});
vc.on('error', (...a) => errors.push('console.error: ' + a.join(' ')));
vc.on('warn', (...a) => warnings.push('console.warn: ' + a.join(' ')));

let html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
// Quita scripts externos (se inyectan a mano) y el CDN de Tailwind.
html = html.replace(/<link rel="stylesheet" href="https:\/\/[^"]*">/g, '');
html = html.replace(/<script src="[^"]*"><\/script>/g, '');

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole: vc
});

const { window } = dom;

/* ---------- Shims que jsdom no trae ---------- */
class FakeResizeObserver {
  constructor(cb) { this.cb = cb; }
  observe() {} unobserve() {} disconnect() {}
}
window.ResizeObserver = FakeResizeObserver;

const CANVAS_PROPS = new Set([
  'canvas', 'fillStyle', 'strokeStyle', 'lineWidth', 'lineCap', 'lineJoin',
  'miterLimit', 'lineDashOffset', 'font', 'textAlign', 'textBaseline',
  'direction', 'letterSpacing', 'wordSpacing', 'globalAlpha',
  'globalCompositeOperation', 'imageSmoothingEnabled', 'imageSmoothingQuality',
  'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'filter',
  'filterQuality'
]);

const FAKE_CTX = () => {
  const store = {};
  return new Proxy(store, {
    get(t, prop) {
      if (prop === 'canvas') return null;
      if (prop === 'getImageData') {
        return (x, y, w, h) => ({
          data: new Uint8ClampedArray(Math.max(4, (w || 1) * (h || 1) * 4)),
          width: w || 1, height: h || 1
        });
      }
      if (prop === 'measureText') return () => ({ width: 10 });
      if (prop === 'createLinearGradient' || prop === 'createRadialGradient' ||
          prop === 'createPattern' || prop === 'createConicGradient') {
        return () => ({ addColorStop() {} });
      }
      if (typeof prop === 'string' && CANVAS_PROPS.has(prop)) return t[prop];
      return () => undefined;
    },
    set(t, prop, v) { t[prop] = v; return true; }
  });
};
window.HTMLCanvasElement.prototype.getContext = function () { return FAKE_CTX(); };
window.HTMLCanvasElement.prototype.toDataURL = function () { return 'data:image/png;base64,iVBORw0KGgo='; };

window.URL.createObjectURL = () => 'blob:fake';
window.URL.revokeObjectURL = () => {};

if (!window.performance) window.performance = { now: () => Date.now() };

/* ---------- Carga los módulos en orden ---------- */
const order = [
  'icons.js', 'storage.js', 'state.js', 'audio.js', 'speech.js', 'feedback.js',
  'canvas.js', 'data.js', 'activities.js', 'creative.js', 'language.js',
  'math.js', 'labs.js', 'missions.js', 'panels.js', 'app.js'
];

function load(name) {
  const code = fs.readFileSync(path.join(ROOT, 'js', name), 'utf8');
  try {
    window.eval(code + '\n//# sourceURL=' + name);
  } catch (e) {
    errors.push('Carga de ' + name + ': ' + (e && e.stack ? e.stack : e));
  }
}

const doc = window.document;
function click(idOrSel) {
  const node = typeof idOrSel === 'string'
    ? (doc.getElementById(idOrSel) || doc.querySelector(idOrSel))
    : idOrSel;
  if (!node) { errors.push('No se encontró el elemento: ' + idOrSel); return false; }
  try {
    // dispatchEvent ya dispara el manejador `onclick` registrado en el nodo.
    node.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
  } catch (e) {
    errors.push('Click en ' + idOrSel + ': ' + (e && e.stack ? e.stack : e));
    return false;
  }
  return true;
}

async function step(label, fn) {
  const before = errors.length;
  try { await fn(); } catch (e) { errors.push(label + ': ' + (e && e.stack ? e.stack : e)); }
  const bad = errors.length - before;
  console.log((bad ? 'FALLO ' : 'OK    ') + label);
  if (bad) {
    for (let i = before; i < errors.length; i++) {
      console.log('        ! ' + String(errors[i]).split('\n').slice(0, 6).join('\n          '));
    }
  }
  await new Promise((r) => setTimeout(r, 10));
}

(async function run() {
  await step('Cargar módulos', () => order.forEach(load));

  // El arranque se ejecuta al cargar; da un tick.
  await new Promise((r) => setTimeout(r, 100));

  await step('Objetos globales expuestos', () => {
    ['Icons', 'Storage', 'State', 'Audio', 'Speech', 'Feedback', 'CanvasKit',
     'Data', 'Activities', 'Creative', 'Language', 'MathLab', 'Labs',
     'Missions', 'Panels', 'App'].forEach((k) => {
      if (!window[k]) throw new Error('Falta el global: ' + k);
    });
  });

  await step('Banco de actividades', () => {
    if (window.Data.count < 70) throw new Error('Solo hay ' + window.Data.count + ' actividades');
    const areas = ['matematica', 'lenguaje', 'logica', 'memoria', 'dibujo', 'trazado',
      'construccion', 'lectura', 'ciencia', 'emociones', 'programacion'];
    areas.forEach((a) => {
      const list = window.Data.byArea(a);
      if (list.length < 5) throw new Error('El área ' + a + ' solo tiene ' + list.length + ' actividades');
    });
    console.log('      actividades: ' + window.Data.count);
  });

  await step('Abrir bienvenida', () => {
    if (!doc.getElementById('screen-welcome').classList.contains('active')) {
      throw new Error('La pantalla de bienvenida no está activa');
    }
    const title = doc.querySelector('.brand-title').textContent.trim();
    if (!title) throw new Error('El nombre de la marca está vacío');
    console.log('      marca: ' + title);
  });

  await step('Comenzar → perfil', () => {
    click('btn-start');
    if (!doc.getElementById('screen-setup').classList.contains('active')) {
      throw new Error('No se abrió la pantalla de perfil');
    }
    doc.getElementById('setup-name').value = 'Nico';
    doc.getElementById('setup-age').value = '7';
    doc.getElementById('setup-age').dispatchEvent(new window.Event('input'));
    click('btn-save-profile');
  });

  await step('Diagnóstico visible', () => {
    if (!doc.getElementById('screen-diagnostic').classList.contains('active')) {
      throw new Error('No se abrió la pantalla de diagnóstico');
    }
    if (!doc.getElementById('diag-areas').children.length) throw new Error('No hay áreas de diagnóstico');
    click('btn-skip-diagnostic');
    if (!doc.getElementById('screen-home').classList.contains('active')) {
      throw new Error('No se llegó al panel del niño');
    }
  });

  await step('Panel del niño', () => {
    const cards = doc.getElementById('home-cards').children.length;
    if (cards < 6) throw new Error('Solo hay ' + cards + ' tarjetas en el inicio');
    if (!doc.getElementById('home-greeting').textContent.includes('Nico')) {
      throw new Error('El saludo no muestra el nombre');
    }
    const nav = doc.getElementById('bottomnav').children.length;
    if (nav < 10) throw new Error('La navegación solo tiene ' + nav + ' entradas');
  });

  await step('Pintar navegación completa', () => {
    const nav = doc.getElementById('bottomnav');
    const ids = Array.from(nav.children).map((b) => b.getAttribute('aria-label'));
    console.log('      nav: ' + ids.join(', '));
    for (const b of Array.from(nav.children)) {
      const label = b.getAttribute('aria-label');
      click(b);
      const active = doc.querySelector('.screen.active');
      if (!active) throw new Error('Ninguna pantalla activa tras pulsar ' + label);
      if (!active.id || active.id === 'screen-welcome') {
        throw new Error('La pantalla activa no es válida tras ' + label + ' (' + active.id + ')');
      }
    }
  });

  await step('Volver a inicio', () => {
    window.App.go('home');
    if (window.App.current() !== 'home') throw new Error('App.go falló');
    window.App.back();
  });

  await step('Motor de actividades (selección)', () => {
    window.Activities.startArea('matematica', { count: 3 });
    if (!doc.getElementById('screen-activity').classList.contains('active')) {
      throw new Error('No se abrió la pantalla de actividad');
    }
    const q = doc.querySelector('.act-question');
    if (!q || !q.textContent.trim()) throw new Error('La actividad no muestra pregunta');
    // Puede pedir opción múltiple, número/texto, orden o secuencia
    const choice = doc.querySelector('#act-choices .choice');
    const input = doc.getElementById('act-input');
    const seq = doc.getElementById('act-seq');
    const order = doc.getElementById('act-order');
    if (!choice && !input && !seq && !order) throw new Error('La actividad no ofrece control de respuesta');
    console.log('      pregunta: ' + q.textContent.trim().slice(0, 60));

    if (choice) {
      click(choice); // al elegir una opción la actividad se comprueba sola
    } else if (input) {
      input.value = '7';
      input.dispatchEvent(new window.Event('input'));
      click('act-check');
    } else if (order) {
      Array.from(order.querySelectorAll('button')).slice(0, 2).forEach((b) => click(b));
      click('act-check');
    } else if (seq) {
      const nxt = doc.getElementById('act-seq-next');
      let guard = 0;
      while (nxt && !nxt.disabled && guard++ < 12) click(nxt);
      click('act-check');
    }

    const fb = doc.getElementById('act-feedback');
    if (!fb || !fb.textContent.trim()) throw new Error('Responder no mostró retroalimentación');
    console.log('      respuesta: ' + fb.textContent.trim().slice(0, 70));
  });

  await step('Retroalimentación con pista', () => {
    click('act-hint');
    const fb = doc.getElementById('act-feedback');
    if (!fb || !fb.textContent.trim()) throw new Error('La pista no se mostró');
    console.log('      pista: ' + fb.textContent.trim().slice(0, 70));
  });

  await step('Módulo de dibujo', () => {
    window.App.go('draw');
    const c = window.Creative.getDrawCanvas();
    if (!c) throw new Error('No se creó el canvas de dibujo');
    const tools = doc.getElementById('draw-toolbar').children.length;
    if (tools < 6) throw new Error('La barra de herramientas tiene solo ' + tools + ' controles');
    c.setBrush('marker'); c.setColor('#ff0000'); c.setBrushSize(10);
    if (c.undo()) c.redo();
    c.clear();
    Array.from(doc.getElementById('draw-modes').children).forEach((b) => click(b));
  });

  await step('Cuaderno digital', () => {
    window.App.go('notebook');
    if (!doc.getElementById('nb-page-label').textContent.includes('1')) {
      throw new Error('El paginador del cuaderno no funciona');
    }
    click('btn-nb-page-next');
    click('btn-nb-page-prev');
  });

  await step('Colorear', () => {
    window.App.go('color');
    const shapes = doc.querySelectorAll('#color-svg .shape');
    if (!shapes.length) throw new Error('No hay figuras para colorear');
    shapes[0].dispatchEvent(new window.Event('click'));
    if (shapes[0].getAttribute('fill') === '#ffffff') throw new Error('El relleno no cambió');
    const cats = doc.getElementById('color-cats').children.length;
    if (cats < 4) throw new Error('Solo ' + cats + ' categorías');
    Array.from(doc.getElementById('color-cats').children).forEach((b) => click(b));
  });

  await step('Trazado', () => {
    window.App.go('trace');
    if (!doc.getElementById('trace-target').textContent.trim()) throw new Error('No hay letra objetivo');
    click('btn-trace-check');
    const fb = doc.getElementById('trace-feedback');
    if (!fb.textContent.trim()) throw new Error('No hay retroalimentación de trazado');
    Array.from(doc.getElementById('trace-kind').children).forEach((b) => click(b));
  });

  await step('Construcción', () => {
    window.App.go('build');
    const pal = doc.getElementById('build-palette').children.length;
    if (pal < 6) throw new Error('La paleta solo tiene ' + pal + ' piezas');
    for (let i = 0; i < 6; i++) click(doc.getElementById('build-palette').children[0]);
    const pieces = doc.getElementById('build-canvas').children.length;
    if (pieces !== 6) throw new Error('Se añadieron ' + pieces + ' piezas (esperaba 6)');
    Array.from(doc.getElementById('build-challenges').children).forEach((b) => click(b));
    click('btn-build-check');
    if (!doc.getElementById('build-feedback').textContent.trim()) throw new Error('Sin retroalimentación');
    click('btn-build-clear');
  });

  await step('Rompecabezas', () => {
    window.App.go('puzzles');
    const tabs = doc.getElementById('puzzle-tabs').children.length;
    if (tabs < 5) throw new Error('Solo ' + tabs + ' tipos de juego');
    Array.from(doc.getElementById('puzzle-tabs').children).forEach((b) => click(b));
    if (!doc.getElementById('puzzle-stage').children.length) throw new Error('El escenario está vacío');
  });

  await step('Programación / robot', () => {
    window.App.go('code');
    const palette = doc.getElementById('code-palette').children.length;
    if (palette < 5) throw new Error('Solo ' + palette + ' bloques');
    for (let i = 0; i < 3; i++) click(doc.getElementById('code-palette').children[0]);
    const prog = doc.getElementById('code-program').children.length;
    if (prog !== 3) throw new Error('El programa tiene ' + prog + ' bloques');
    click('btn-code-run');
    click('btn-code-clear');
  });

  await step('Música', () => {
    window.App.go('music');
    const keys = doc.querySelectorAll('.pkey').length;
    if (keys < 8) throw new Error('El piano solo tiene ' + keys + ' teclas');
    Array.from(doc.getElementById('music-tabs').children).forEach((b) => click(b));
  });

  await step('Ciencia', () => {
    window.App.go('science');
    const tabs = Array.from(doc.getElementById('science-tabs').children);
    if (tabs.length < 5) throw new Error('Solo ' + tabs.length + ' temas de ciencia');
    click(tabs[0]);
    const first = doc.getElementById('science-stage').innerHTML;
    tabs.forEach((b) => click(b));
    const last = doc.getElementById('science-stage').innerHTML;
    if (!doc.getElementById('science-stage').children.length) throw new Error('Ciencia sin contenido');
    if (last === first) throw new Error('La pestaña activa no cambió el contenido de ciencia');
    console.log('      tema: ' + (doc.getElementById('science-stage').textContent.trim().slice(0, 50)));
  });

  await step('Emociones', () => {
    window.App.go('emotions');
    const tabs = Array.from(doc.getElementById('emotion-tabs').children);
    click(tabs[0]);
    const first = doc.getElementById('emotion-stage').innerHTML;
    tabs.forEach((b) => click(b));
    const last = doc.getElementById('emotion-stage').innerHTML;
    if (!doc.getElementById('emotion-stage').children.length) throw new Error('Sin contenido');
    if (last === first) throw new Error('La pestaña activa no cambió el contenido de emociones');
  });

  await step('Música (pestañas)', () => {
    const tabs = Array.from(doc.getElementById('music-tabs').children);
    if (tabs.length < 2) throw new Error('Faltan pestañas de música');
    click(tabs[0]);
    const first = doc.getElementById('music-stage').innerHTML;
    click(tabs[1]);
    const second = doc.getElementById('music-stage').innerHTML;
    if (!second.trim()) throw new Error('La pestaña dejó la música vacía');
    if (second === first) throw new Error('La pestaña activa no cambió el contenido de música');
  });

  await step('Lectura', () => {
    window.App.go('read');
    Array.from(doc.getElementById('read-tabs').children).forEach((b) => click(b));
    if (!doc.getElementById('read-content').children.length) throw new Error('Sin contenido');
  });

  await step('Cuento interactivo', () => {
    window.App.go('story');
    window.Language.renderStory();
    const text = doc.getElementById('story-text').textContent.trim();
    if (!text) throw new Error('El cuento no tiene texto');
    const choices = doc.getElementById('story-choices').children.length;
    if (!choices) throw new Error('El cuento no ofrece decisiones');
    console.log('      decisión 1: ' + doc.getElementById('story-choices').children[0].textContent.trim());
    click(doc.getElementById('story-choices').children[0]);
  });

  await step('Creador de historias', () => {
    window.App.go('story-create');
    window.StoryCreator.render();
    const cards = doc.getElementById('story-create-body').querySelectorAll('.card').length;
    if (cards < 6) throw new Error('El creador solo tiene ' + cards + ' bloques');
    const opt = doc.querySelector('#story-create-body .char-opt');
    click(opt);
    click('story-auto');
    const ta = doc.getElementById('story-text-area');
    if (!ta.value.trim()) throw new Error('El borrador automático no generó texto');
    console.log('      borrador: ' + ta.value.slice(0, 70) + '...');
  });

  await step('Misiones', () => {
    window.App.go('missions');
    Array.from(doc.getElementById('mission-tabs').children).forEach((b) => click(b));
    if (!doc.getElementById('mission-stage').children.length) throw new Error('Sin misiones');
    click('cm-roll');
    const out = doc.getElementById('cm-out').textContent.trim();
    if (!out) throw new Error('La máquina de retos no generó nada');
    console.log('      reto: ' + out.slice(0, 70));
  });

  await step('Logros y mapa de aprendizaje', () => {
    window.App.go('achievements');
    window.Missions.renderAchievements();
    if (!doc.getElementById('learning-map').children.length) throw new Error('El mapa está vacío');
    if (!doc.getElementById('badge-grid').children.length) throw new Error('No hay insignias');
    if (!doc.getElementById('ach-summary').textContent.trim()) throw new Error('Sin resumen');
  });

  await step('Proyectos', () => {
    window.Creative.saveProject({ type: 'dibujo', title: 'Prueba', description: 'Dibujo de prueba', image: 'data:image/png;base64,iVBORw0KGgo=' });
    window.App.go('projects');
    window.Panels.renderProjects();
  });

  await step('Panel de padres con PIN', async () => {
    window.App.go('parent');
    const input = doc.getElementById('pin-input');
    input.value = '9999';
    input.dispatchEvent(new window.Event('input'));
    click('btn-pin-ok');
    const fb = doc.getElementById('pin-feedback').textContent;
    if (!/incorrecto/i.test(fb)) throw new Error('El PIN incorrecto fue aceptado');
    input.value = '1234';
    input.dispatchEvent(new window.Event('input'));
    click('btn-pin-ok');
    if (doc.getElementById('parent-panel').classList.contains('hidden')) {
      throw new Error('El PIN correcto no abrió el panel');
    }
    const cards = doc.getElementById('parent-panel').querySelectorAll('.card').length;
    if (cards < 5) throw new Error('El panel de padres solo tiene ' + cards + ' bloques');
    console.log('      bloques del panel: ' + cards);
  });

  await step('Panel docente + generador', () => {
    window.App.go('teacher');
    window.Panels.renderTeacher('generator');
    if (!doc.getElementById('gen-run')) throw new Error('No hay generador');
    click('gen-run');
    if (!doc.getElementById('gen-out').textContent.trim()) throw new Error('No generó actividad');
    ['assign', 'results', 'brand'].forEach((t) => window.Panels.renderTeacher(t));
    if (!doc.getElementById('brand-name')) throw new Error('No se puede cambiar el nombre');
    doc.getElementById('brand-name').value = 'MI APP';
    doc.getElementById('brand-tag').value = 'Subtítulo nuevo';
    click('brand-save');
    const t = doc.querySelector('.brand-title').textContent.trim();
    if (t !== 'MI APP') throw new Error('El nombre no se actualizó: ' + t);
    console.log('      nombre cambiado a: ' + t);
    doc.querySelector('.brand-title').textContent = 'MUNDO CRECE';
    window.State.get().brand = { name: 'MUNDO CRECE', tagline: 'Aprende, crea, juega y descubre.' };
    window.App.applyBrand();
  });

  await step('Configuración y accesibilidad', () => {
    window.App.go('settings');
    window.Panels.renderSettings();
    Array.from(doc.querySelectorAll('#settings-body [data-set]')).forEach((b) => click(b));
    if (!doc.getElementById('cap-info').textContent.includes('voz')) {
      throw new Error('No se muestra la capacidad de voz');
    }
    console.log('      ' + doc.getElementById('cap-info').textContent.slice(0, 90));
    window.Panels.applySettings();
  });

  await step('Persistencia del estado', () => {
    const raw = window.localStorage.getItem('mundo_crece_state_v1');
    if (!raw) throw new Error('El estado no se guardó en localStorage');
    const parsed = JSON.parse(raw);
    if (!parsed.user || parsed.user.name !== 'Nico') throw new Error('El perfil no persistió');
    if (!parsed.activityLog || !parsed.activityLog.length) throw new Error('No se registró actividad');
    console.log('      registros: ' + parsed.activityLog.length + ', estrellas: ' + parsed.stars);
  });

  await step('Canvas reutilizable', () => {
    const api = window.CanvasKit;
    ['create', 'get', 'reset', 'evaluateTrace', 'linePath'].forEach((k) => {
      if (typeof api[k] !== 'function') throw new Error('Falta CanvasKit.' + k);
    });
    const path = api.linePath(0, 0, 1, 1, 10);
    if (path.length !== 11) throw new Error('linePath devolvió ' + path.length + ' puntos');
    // evaluateTrace espera los puntos del niño en píxeles y la guía en 0..1
    const px = path.map((p) => ({ x: p.x * 100, y: p.y * 100 }));
    const res = api.evaluateTrace(px, path, 100, 100);
    if (!res.ok) throw new Error('evaluateTrace no reconoció un trazado perfecto');
    console.log('      cobertura: ' + Math.round(res.coverage * 100) + '%');
    const bad = api.evaluateTrace([{ x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 1 }], path, 100, 100);
    if (bad.ok) throw new Error('evaluateTrace aceptó un trazado vacío');
  });

  await step('Reactivo: pestañas del área matemática', () => {
    window.App.openArea('matematica');
    if (!doc.getElementById('area-cards').children.length) throw new Error('Sin tarjetas de área');
    if (!doc.getElementById('area-list').children.length) throw new Error('Sin widgets de área');
    const labels = Array.from(doc.getElementById('area-cards').children).map((n) => n.textContent.trim().split('\n')[0]);
    console.log('      tarjetas: ' + labels.length + ' (' + labels[0] + ')');
  });

  await new Promise((r) => setTimeout(r, 400));

  console.log('\n=================== RESUMEN ===================');
  console.log('Errores: ' + errors.length);
  errors.forEach((e) => console.log('\n- ' + e));
  if (warnings.length) {
    console.log('\nAvisos (' + warnings.length + '):');
    warnings.slice(0, 10).forEach((w) => console.log('  · ' + w));
  }

  window.close();
  process.exit(errors.length ? 1 : 0);
})();
