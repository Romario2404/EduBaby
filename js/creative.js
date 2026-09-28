/* =========================================================
   creative.js
   - Estudio de dibujo (libre, guiado, instruido, describe)
   - Cuaderno digital multipágina
   - Colorear (SVG con relleno por clic)
   - Trazado de letras y números con medición de seguimiento
   - Constructor de bloques con retos
   - Rompecabezas, laberinto, secuencias y diferencias
   ========================================================= */
(function (global) {
  'use strict';

  var COLORS = ['#0f172a', '#ef4444', '#f97316', '#fbbf24', '#22c55e', '#06b6d4',
                '#3b82f6', '#8b5cf6', '#ec4899', '#ffffff'];
  var SIZES = [3, 6, 12, 22];

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function on(node, fn) { if (node) node.onclick = function (e) { global.Audio && global.Audio.play('click'); fn(e); }; }

  /* =======================================================
     TOOLBAR compartido
  ======================================================= */
  function buildToolbar(hostId, cnv, opts) {
    opts = opts || {};
    var host = el(hostId);
    if (!host) return;
    host.innerHTML = '';

    var tools = [
      { id: 'pencil', label: 'Lápiz', icon: 'pencil' },
      { id: 'marker', label: 'Marcador', icon: 'marker' },
      { id: 'brush', label: 'Pincel', icon: 'paint' },
      { id: 'eraser', label: 'Borrador', icon: 'eraser' }
    ];
    if (opts.shapes !== false) {
      tools.push({ id: 'line', label: 'Línea', icon: 'shapes' });
      tools.push({ id: 'rect', label: 'Rectángulo', icon: 'grid' });
      tools.push({ id: 'circle', label: 'Círculo', icon: 'puzzle' });
    }

    tools.forEach(function (t) {
      var b = h('button', 'tool' + (cnv.tool === t.id ? ' active' : ''));
      b.innerHTML = Icons.svg(t.icon) + '<span>' + t.label + '</span>';
      b.setAttribute('aria-label', t.label);
      b.onclick = function () {
        cnv.setBrush(t.id);
        Array.prototype.forEach.call(host.querySelectorAll('.tool'), function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        global.Audio.play('click');
      };
      host.appendChild(b);
    });

    // Colores
    var sw = h('div', 'swatches');
    COLORS.forEach(function (c) {
      var s = h('button', 'swatch' + (cnv.color === c ? ' active' : ''));
      s.style.background = c;
      s.setAttribute('aria-label', 'Color ' + c);
      s.onclick = function () {
        cnv.setColor(c);
        Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        if (cnv.tool === 'eraser') cnv.setBrush('pencil');
        global.Audio.play('pop');
      };
      sw.appendChild(s);
    });
    host.parentNode.insertBefore(sw, host.nextSibling);

    // Tamaños
    var sz = h('div', 'sizes');
    sz.style.padding = '10px 14px';
    sz.style.background = '#f8fafc';
    SIZES.forEach(function (n) {
      var d = h('button', 'size-dot' + (cnv.size === n ? ' active' : ''));
      d.innerHTML = '<i style="width:' + Math.max(5, n) + 'px;height:' + Math.max(5, n) + 'px"></i>';
      d.setAttribute('aria-label', 'Grosor ' + n);
      d.onclick = function () {
        cnv.setBrushSize(n);
        Array.prototype.forEach.call(sz.children, function (x) { x.classList.remove('active'); });
        d.classList.add('active');
        global.Audio.play('click');
      };
      sz.appendChild(d);
    });
    host.appendChild(sz);

    // Acciones
    var acts = [
      { label: 'Deshacer', icon: 'undo', fn: function () { cnv.undo(); } },
      { label: 'Rehacer', icon: 'redo', fn: function () { cnv.redo(); } },
      { label: 'Limpiar', icon: 'trash', fn: function () {
          global.Feedback.confirm('¿Borrar todo?', 'Se limpiará la hoja. No se puede deshacer fácilmente.', function () { cnv.clear(); }, 'Sí, borrar');
        } }
    ];
    if (opts.save) acts.push({ label: 'Guardar', icon: 'save', fn: opts.save });
    acts.forEach(function (a) {
      var b = h('button', 'tool');
      b.innerHTML = Icons.svg(a.icon) + '<span>' + a.label + '</span>';
      b.setAttribute('aria-label', a.label);
      b.onclick = function () { global.Audio.play('click'); a.fn(); };
      host.appendChild(b);
    });
  }

  /* =======================================================
     ESTUDIO DE DIBUJO
  ======================================================= */
  var drawCnv = null;
  var drawMode = 'free';
  var guidedStep = 0;
  var activeActivity = null;

  var GUIDED = {
    arbol: { title: 'Dibuja un árbol', steps: ['Tronco', 'Ramas', 'Hojas', 'Frutas'] },
    casa: { title: 'Dibuja una casa', steps: ['Base', 'Techo', 'Puerta', 'Ventanas'] },
    sol: { title: 'Dibuja un sol', steps: ['Círculo', 'Rayos', 'Cara', 'Nubes'] },
    barco: { title: 'Dibuja un barco', steps: ['Casco', 'Mástil', 'Vela', 'Agua'] }
  };

  function initDraw() {
    drawCnv = global.CanvasKit.create('canvas-draw', {
      tool: 'pencil', color: '#0f172a', size: 6,
      onChange: function () { updateGuidedProgress(); }
    });
    buildToolbar('draw-toolbar', drawCnv, { save: saveDrawing });

    Array.prototype.forEach.call(el('draw-modes').children, function (b) {
      b.onclick = function () {
        Array.prototype.forEach.call(el('draw-modes').children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        setDrawMode(b.getAttribute('data-mode'));
        global.Audio.play('click');
      };
    });

    on(el('btn-draw-speak'), function () {
      if (!global.Speech.listenSupported()) { global.Feedback.toast('Tu navegador no permite dictado.'); return; }
      global.Speech.listen({
        onResult: function (t, fin) { if (fin) el('draw-desc-text').value = t; }
      });
      global.Feedback.toast('Habla ahora...');
    });

    on(el('btn-draw-desc-save'), function () {
      var txt = el('draw-desc-text').value.trim();
      if (drawCnv.isBlank()) { global.Feedback.toast('Primero dibuja algo.'); return; }
      saveProject({
        type: 'dibujo',
        title: (activeActivity ? activeActivity.question : 'Mi dibujo').slice(0, 60),
        description: txt || '(sin descripción)',
        image: drawCnv.save(),
        activity: activeActivity ? activeActivity.id : null
      });
      if (activeActivity) global.Activities.notifyExternalDone(true);
      global.Feedback.celebrate();
      global.Feedback.toast('Dibujo guardado en Mis proyectos.');
    });

    setDrawMode('free');
  }

  function setDrawMode(mode) {
    drawMode = mode;
    var prompt = el('draw-prompt');
    var steps = el('draw-guided-steps');
    var describe = el('draw-describe');
    steps.classList.add('hidden');
    describe.classList.add('hidden');
    prompt.innerHTML = '';

    if (mode === 'free') {
      prompt.innerHTML = '<span>Dibuja lo que quieras. No hay respuestas incorrectas.</span>';
    } else if (mode === 'guided') {
      steps.classList.remove('hidden');
      var keys = Object.keys(GUIDED);
      var html = '<div class="mini-list">';
      keys.forEach(function (k, i) {
        html += '<button class="mini-btn' + (i === 0 ? ' active' : '') + '" data-g="' + k + '">' + GUIDED[k].title + '</button>';
      });
      html += '</div><div class="mini-list" id="guided-step-list"></div>';
      steps.innerHTML = html;
      Array.prototype.forEach.call(steps.querySelectorAll('[data-g]'), function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(steps.querySelectorAll('[data-g]'), function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          guidedStep = 0;
          renderGuidedSteps(b.getAttribute('data-g'));
          global.Audio.play('click');
        };
      });
      renderGuidedSteps(keys[0]);
      prompt.innerHTML = '<span>Ve paso a paso. Levanta el lápiz entre cada paso.</span>';
    } else if (mode === 'instructed') {
      prompt.innerHTML = '<span>Dibuja una casa con una puerta azul y dos ventanas.</span>' +
        '<button class="btn btn-mini" id="btn-instr-say">Escuchar</button>';
      on(el('btn-instr-say'), function () { global.Speech.speak('Dibuja una casa con una puerta azul y dos ventanas.'); });
    } else if (mode === 'describe') {
      describe.classList.remove('hidden');
      prompt.innerHTML = '<span>Después de dibujar, cuéntame qué hiciste.</span>';
    }
  }

  var guidedKey = 'arbol';
  function renderGuidedSteps(key) {
    guidedKey = key;
    guidedStep = 0;
    var g = GUIDED[key];
    var host = el('draw-guided-steps');
    var list = host.querySelector('#guided-step-list');
    if (!list) {
      list = h('div', 'mini-list');
      list.id = 'guided-step-list';
      host.appendChild(list);
    }
    paintGuided(list, g);
  }

  function paintGuided(list, g) {
    list.innerHTML = g.steps.map(function (s, i) {
      return '<button class="mini-btn' + (i === guidedStep ? ' active' : '') + '" data-s="' + i + '">' +
        (i + 1) + '. ' + s + '</button>';
    }).join('') + '<button class="mini-btn" id="guided-next">Listo, siguiente paso</button>';

    Array.prototype.forEach.call(list.querySelectorAll('[data-s]'), function (b) {
      b.onclick = function () {
        guidedStep = parseInt(b.getAttribute('data-s'), 10);
        paintGuided(list, g);
        global.Speech.speak(g.steps[guidedStep]);
      };
    });
    var nx = list.querySelector('#guided-next');
    if (nx) nx.onclick = function () {
      guidedStep = Math.min(g.steps.length - 1, guidedStep + 1);
      paintGuided(list, g);
      if (guidedStep === g.steps.length - 1) {
        global.Feedback.toast('Último paso: ' + g.steps[guidedStep]);
        global.Feedback.celebrate();
      } else {
        global.Speech.speak('Paso ' + (guidedStep + 1) + ': ' + g.steps[guidedStep]);
      }
    };
  }

  function updateGuidedProgress() { /* hook para futuras mediciones */ }

  function saveDrawing() {
    if (drawCnv.isBlank()) { global.Feedback.toast('Dibuja algo antes de guardar.'); return; }
    var desc = el('draw-desc-text') ? el('draw-desc-text').value.trim() : '';
    saveProject({
      type: 'dibujo',
      title: (activeActivity ? activeActivity.question : 'Mi dibujo').slice(0, 60),
      description: desc || 'Dibujo guardado',
      image: drawCnv.save(),
      activity: activeActivity ? activeActivity.id : null
    });
    global.State.bumpCounter('_draws');
    global.Feedback.toast('Guardado en Mis proyectos.');
    global.Feedback.celebrate();
  }

  function openForActivity(activity, target) {
    activeActivity = activity;
    global.App.go(target);
    if (target === 'draw') {
      setDrawMode(activity && activity.type === 'draw' && activity.criteria && activity.criteria.length
        ? 'instructed' : 'free');
      el('draw-prompt').innerHTML = '<span>' + (activity ? activity.prompt || activity.question : '') + '</span>';
      if (activity && activity.hint) global.Feedback.say(activity.hint, 'think');
    } else if (target === 'trace') {
      Trace.openFor(activity);
    } else if (target === 'build') {
      Build.openFor(activity);
    }
  }

  /* =======================================================
     CUADERNO DIGITAL
  ======================================================= */
  var nbCnv = null;
  var nbPages = [];
  var nbIndex = 0;

  function initNotebook() {
    nbCnv = global.CanvasKit.create('canvas-notebook', { tool: 'pencil', size: 5 });
    buildToolbar('notebook-toolbar', nbCnv, { save: saveNotebook });
    on(el('btn-nb-page-next'), function () { nbPages[nbIndex] = nbCnv.save(); nbIndex++; ensurePage(); });
    on(el('btn-nb-page-prev'), function () { nbPages[nbIndex] = nbCnv.save(); nbIndex = Math.max(0, nbIndex - 1); ensurePage(); });
    on(el('btn-nb-save'), saveNotebook);
    loadNotebook();
  }

  function ensurePage() {
    while (nbPages.length <= nbIndex) nbPages.push(null);
    el('nb-page-label').textContent = 'Página ' + (nbIndex + 1) + ' de ' + nbPages.length;
    if (nbPages[nbIndex]) nbCnv.load(nbPages[nbIndex]);
    else nbCnv.clear();
  }

  function loadNotebook() {
    var saved = global.Storage.get('notebook', null);
    if (saved && saved.pages && saved.pages.length) {
      nbPages = saved.pages;
      nbIndex = 0;
      ensurePage();
    }
  }

  function saveNotebook() {
    nbPages[nbIndex] = nbCnv.save();
    global.Storage.set('notebook', { pages: nbPages, ts: Date.now() });
    global.State.bumpCounter('_writings');
    global.Feedback.toast('Páginas guardadas.');
    global.Feedback.celebrate();
  }

  /* =======================================================
     COLOREAR (SVG)
  ======================================================= */
  var colorShapes = null;
  var currentColor = '#ef4444';
  var colorTool = 'fill';
  var colorUndo = [];

  var COLORING = {
    animales: [
      { name: 'Pez', svg: '<ellipse cx="200" cy="150" rx="90" ry="60" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="cuerpo"/>' +
        '<path d="M290 150l70-45v90z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="cola"/>' +
        '<circle cx="160" cy="130" r="12" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ojo"/>' },
      { name: 'Mariposa', svg: '<ellipse cx="200" cy="150" rx="14" ry="70" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="cuerpo"/>' +
        '<path d="M186 110C150 60 90 60 80 110s50 70 106 45z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala1"/>' +
        '<path d="M214 110c36-50 96-50 106 0s-50 70-106 45z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala2"/>' +
        '<path d="M186 190c-30 40-80 40-90 10s40-50 90-20z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala3"/>' +
        '<path d="M214 190c30 40 80 40 90 10s-40-50-90-20z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala4"/>' },
      { name: 'Gato', svg: '<circle cx="200" cy="160" r="80" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="cara"/>' +
        '<path d="M140 110l10-50 45 30z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="oreja1"/>' +
        '<path d="M260 110l-10-50-45 30z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="oreja2"/>' +
        '<circle cx="175" cy="150" r="12" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ojo1"/>' +
        '<circle cx="225" cy="150" r="12" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ojo2"/>' +
        '<path d="M180 195q20 20 40 0" fill="none" stroke="#0f172a" stroke-width="5" class="shape" data-part="boca"/>' }
    ],
    naturaleza: [
      { name: 'Árbol', svg: '<rect x="180" y="200" width="40" height="80" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="tronco"/>' +
        '<circle cx="200" cy="130" r="75" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="copa"/>' +
        '<circle cx="170" cy="120" r="14" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="fruta1"/>' +
        '<circle cx="230" cy="150" r="14" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="fruta2"/>' },
      { name: 'Sol', svg: '<circle cx="200" cy="150" r="60" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="centro"/>' +
        [0, 45, 90, 135, 180, 225, 270, 315].map(function (a) {
          var r = a * Math.PI / 180;
          var x1 = 200 + Math.cos(r) * 75, y1 = 150 + Math.sin(r) * 75;
          var x2 = 200 + Math.cos(r) * 105, y2 = 150 + Math.sin(r) * 105;
          return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" stroke="#0f172a" stroke-width="8" stroke-linecap="round" class="shape" data-part="rayo"/>';
        }).join('') }
    ],
    vehiculos: [
      { name: 'Auto', svg: '<rect x="70" y="140" width="260" height="70" rx="20" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="carroceria"/>' +
        '<path d="M120 140l40-50h80l40 50z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="teto"/>' +
        '<circle cx="130" cy="215" r="30" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="rueda1"/>' +
        '<circle cx="270" cy="215" r="30" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="rueda2"/>' },
      { name: 'Barco', svg: '<path d="M70 190h260l-40 60H110z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="casco"/>' +
        '<line x1="200" y1="190" x2="200" y2="60" stroke="#0f172a" stroke-width="6" class="shape" data-part="mastil"/>' +
        '<path d="M205 70l90 100h-90z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="vela"/>' }
    ],
    casas: [
      { name: 'Casa', svg: '<path d="M60 150L200 50l140 100" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="techo"/>' +
        '<rect x="90" y="150" width="220" height="120" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="muro"/>' +
        '<rect x="170" y="195" width="60" height="75" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="puerta"/>' +
        '<rect x="105" y="175" width="45" height="45" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ventana1"/>' +
        '<rect x="250" y="175" width="45" height="45" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ventana2"/>' }
    ],
    espacio: [
      { name: 'Cohete', svg: '<path d="M200 40c40 40 55 100 55 150h-110c0-50 15-110 55-150z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="cuerpo"/>' +
        '<circle cx="200" cy="120" r="26" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ventana"/>' +
        '<path d="M145 160l-40 60 40-10z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala1"/>' +
        '<path d="M255 160l40 60-40-10z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="ala2"/>' +
        '<path d="M175 195q25 55 50 0z" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="fuego"/>' },
      { name: 'Planeta', svg: '<circle cx="200" cy="150" r="70" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="mundo"/>' +
        '<ellipse cx="200" cy="155" rx="125" ry="35" fill="none" stroke="#0f172a" stroke-width="7" class="shape" data-part="anillo"/>' +
        '<circle cx="175" cy="130" r="14" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="crater1"/>' +
        '<circle cx="225" cy="175" r="10" fill="#fff" stroke="#0f172a" stroke-width="5" class="shape" data-part="crater2"/>' }
    ]
  };

  function initColoring() {
    var cats = el('color-cats');
    var keys = Object.keys(COLORING);
    cats.innerHTML = '';
    keys.forEach(function (k, i) {
      var b = h('button', 'seg-btn' + (i === 0 ? ' active' : ''), k.charAt(0).toUpperCase() + k.slice(1));
      b.onclick = function () {
        Array.prototype.forEach.call(cats.children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        renderColorList(k);
        global.Audio.play('click');
      };
      cats.appendChild(b);
    });
    renderColorList(keys[0]);
    buildColorToolbar();
  }

  function renderColorList(cat) {
    var list = el('color-list');
    list.innerHTML = '';
    COLORING[cat].forEach(function (item, i) {
      var b = h('button', 'mini-btn' + (i === 0 ? ' active' : ''), item.name);
      b.onclick = function () {
        Array.prototype.forEach.call(list.children, function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        loadColoring(item);
        global.Audio.play('click');
      };
      list.appendChild(b);
    });
    loadColoring(COLORING[cat][0]);
  }

  function loadColoring(item) {
    var svg = el('color-svg');
    svg.innerHTML = item.svg;
    colorUndo = [];
    Array.prototype.forEach.call(svg.querySelectorAll('.shape'), function (s) {
      s.addEventListener('click', function () {
        colorUndo.push({ node: s, fill: s.getAttribute('fill') });
        if (colorTool === 'fill') {
          s.setAttribute('fill', currentColor);
        } else if (colorTool === 'eraser') {
          s.setAttribute('fill', '#ffffff');
        } else {
          // pincel: tiñe el borde
          s.setAttribute('stroke', currentColor);
        }
        global.Audio.play('pop');
        var filled = Array.prototype.filter.call(svg.querySelectorAll('.shape'), function (x) {
          return x.getAttribute('fill') && x.getAttribute('fill') !== '#ffffff' && x.getAttribute('fill') !== 'none';
        }).length;
        var total = svg.querySelectorAll('.shape').length;
        if (total && filled === total) {
          global.Feedback.celebrate();
          global.Feedback.toast('¡Terminaste de colorear!');
          saveProject({
            type: 'colorear',
            title: 'Colorear ' + item.name,
            description: 'Coloreado completo',
            image: svgToDataURL(svg),
            activity: null
          });
        }
      });
    });
  }

  function svgToDataURL(svg) {
    try {
      var xml = new XMLSerializer().serializeToString(svg);
      return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    } catch (e) { return null; }
  }

  function buildColorToolbar() {
    var host = el('color-toolbar');
    host.innerHTML = '';
    [{ id: 'fill', label: 'Relleno', icon: 'paint' },
     { id: 'brush', label: 'Pincel', icon: 'pencil' },
     { id: 'eraser', label: 'Borrar', icon: 'eraser' }].forEach(function (t) {
      var b = h('button', 'tool' + (t.id === 'fill' ? ' active' : ''));
      b.innerHTML = Icons.svg(t.icon) + '<span>' + t.label + '</span>';
      b.onclick = function () {
        colorTool = t.id;
        Array.prototype.forEach.call(host.querySelectorAll('.tool'), function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        global.Audio.play('click');
      };
      host.appendChild(b);
    });

    var sw = h('div', 'swatches');
    COLORS.filter(function (c) { return c !== '#ffffff'; }).forEach(function (c) {
      var s = h('button', 'swatch' + (c === currentColor ? ' active' : ''));
      s.style.background = c;
      s.setAttribute('aria-label', 'Color ' + c);
      s.onclick = function () {
        currentColor = c;
        Array.prototype.forEach.call(sw.children, function (x) { x.classList.remove('active'); });
        s.classList.add('active');
        global.Audio.play('pop');
      };
      sw.appendChild(s);
    });
    host.parentNode.insertBefore(sw, host.nextSibling);

    var undo = h('button', 'tool');
    undo.innerHTML = Icons.svg('undo') + '<span>Deshacer</span>';
    undo.onclick = function () {
      var last = colorUndo.pop();
      if (last) { last.node.setAttribute('fill', last.fill); global.Audio.play('click'); }
    };
    host.appendChild(undo);
  }

  /* =======================================================
     TRAZADO
  ======================================================= */
  var Trace = (function () {
    var cnv = null;
    var pts = [];
    var target = 'A';
    var guideOn = true;
    var activity = null;
    var kind = 'letter';

    function init() {
      cnv = global.CanvasKit.create('canvas-trace', { tool: 'pencil', size: 14, color: '#3b82f6' });
      Array.prototype.forEach.call(el('trace-kind').children, function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(el('trace-kind').children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          kind = b.getAttribute('data-kind');
          renderPicker();
          global.Audio.play('click');
        };
      });
      renderPicker();
      setTarget('A');

      el('canvas-trace').addEventListener('pointerdown', function () { pts = []; });
      el('canvas-trace').addEventListener('pointermove', function (ev) {
        var r = ev.target.getBoundingClientRect();
        pts.push({ x: (ev.clientX - r.left) / r.width, y: (ev.clientY - r.top) / r.height });
      });

      on(el('btn-trace-clear'), function () { cnv.clear(); pts = []; el('trace-feedback').textContent = ''; el('trace-bar').style.width = '0'; });
      on(el('btn-trace-listen'), function () { global.Speech.speak(target, { rate: 0.7 }); });
      on(el('btn-trace-guide'), function () {
        guideOn = !guideOn;
        el('trace-target').classList.toggle('guided-off', !guideOn);
        el('btn-trace-guide').textContent = guideOn ? 'Quitar guía' : 'Mostrar guía';
      });
      on(el('btn-trace-check'), check);
    }

    function renderPicker() {
      var host = el('trace-picker');
      var items = kind === 'letter' ? ['A', 'B', 'C', 'M', 'S', 'O', 'E']
        : kind === 'number' ? ['1', '2', '3', '5', '8']
        : ['SOL', 'LUNA', 'GATO'];
      host.innerHTML = '';
      items.forEach(function (t, i) {
        var b = h('button', 'mini-btn' + (i === 0 ? ' active' : ''), t);
        b.onclick = function () {
          Array.prototype.forEach.call(host.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          setTarget(t);
          global.Audio.play('click');
        };
        host.appendChild(b);
      });
    }

    function setTarget(t) {
      target = t;
      var node = el('trace-target');
      node.textContent = t;
      node.style.fontSize = t.length > 2 ? 'min(24vw,150px)' : 'min(46vw,300px)';
      cnv.clear();
      pts = [];
      el('trace-feedback').textContent = '';
      el('trace-bar').style.width = '0';
      global.Speech.speak(t, { rate: 0.7 });
    }

    /** Trayectoria esperada: para letras usamos un patrón genérico de barrido */
    function expectedPath() {
      var p = [];
      var n = 30;
      if (target.length > 1) {
        // barrido en zigzag letra por letra
        for (var i = 0; i <= n; i++) {
          var t = i / n;
          p.push({ x: 0.15 + t * 0.7, y: 0.5 + Math.sin(t * Math.PI * (target.length)) * 0.2 });
        }
        return p;
      }
      // Letra simple: recorrido de arriba hacia abajo con curva
      for (var j = 0; j <= n; j++) {
        var u = j / n;
        p.push({ x: 0.5 + Math.sin(u * Math.PI * 2) * 0.16, y: 0.18 + u * 0.64 });
      }
      return p;
    }

    function check() {
      if (pts.length < 8) {
        el('trace-feedback').className = 'feedback-line retry';
        el('trace-feedback').textContent = 'Todavía no has trazado nada. Empieza desde arriba.';
        global.Audio.play('wrong');
        return;
      }
      var r = el('canvas-trace').getBoundingClientRect();
      var res = global.CanvasKit.evaluateTrace(pts, expectedPath(), r.width, r.height);
      el('trace-bar').style.width = Math.round(res.coverage * 100) + '%';

      var fb = el('trace-feedback');
      var pct = Math.round(res.coverage * 100);
      if (res.ok) {
        fb.className = 'feedback-line ok';
        fb.textContent = pct >= 85
          ? '¡Muy bien! Seguiste casi todo el camino.'
          : '¡Bien! Seguiste ' + pct + '% del camino. Intenta cubrirlo entero.';
        global.Audio.play('correct');
        global.Feedback.confetti(20);
        global.State.logActivity({
          id: 'trace_' + target, area: 'trazado', skill: 'coordinacion',
          difficulty: 2, correct: true, attempts: 1, seconds: 0
        });
        if (activity) global.Activities.notifyExternalDone(true);
        setTimeout(function () { global.Speech.speak(fb.textContent); }, 400);
      } else {
        fb.className = 'feedback-line soft';
        fb.textContent = res.startOk
          ? 'Llevas ' + pct + '% del camino. Sigue desde donde empezaste y no te salgas.'
          : 'Empieza desde el punto de arriba y baja despacio.';
        global.Audio.play('hint');
        global.State.logActivity({
          id: 'trace_' + target, area: 'trazado', skill: 'coordinacion',
          difficulty: 2, correct: false, attempts: 1, seconds: 0
        });
      }
      global.State.save();
    }

    function openFor(act) {
      activity = act;
      if (act && act.letter) setTarget(act.letter);
      el('trace-feedback').textContent = act ? act.hint || '' : '';
      global.Feedback.say(act ? act.question : 'Traza con cuidado.', 'think');
    }

    return { init: init, openFor: openFor };
  })();

  /* =======================================================
     CONSTRUCCIÓN
  ======================================================= */
  var Build = (function () {
    var pieces = [];
    var selected = null;
    var uid = 0;
    var activity = null;
    var challenge = 'free';

    var PALETTE = [
      { id: 'cube', label: 'Cubo', w: 60, h: 60, color: '#38bdf8', svg: '<rect x="4" y="4" width="40" height="40" fill="#38bdf8"/>' },
      { id: 'cyl', label: 'Cilindro', w: 50, h: 70, color: '#a855f7', svg: '<rect x="8" y="8" width="32" height="36" rx="14" fill="#a855f7"/>' },
      { id: 'tri', label: 'Triángulo', w: 66, h: 56, color: '#f59e0b', svg: '<path d="M24 6l20 38H4z" fill="#f59e0b"/>' },
      { id: 'rect', label: 'Rectángulo', w: 90, h: 44, color: '#22c55e', svg: '<rect x="4" y="12" width="44" height="22" fill="#22c55e"/>' },
      { id: 'wheel', label: 'Rueda', w: 44, h: 44, color: '#334155', svg: '<circle cx="24" cy="24" r="18" fill="#334155"/><circle cx="24" cy="24" r="7" fill="#94a3b8"/>' },
      { id: 'door', label: 'Puerta', w: 44, h: 70, color: '#f43f5e', svg: '<rect x="8" y="4" width="32" height="44" rx="4" fill="#f43f5e"/>' },
      { id: 'window', label: 'Ventana', w: 50, h: 50, color: '#bae6fd', svg: '<rect x="6" y="6" width="36" height="36" fill="#bae6fd" stroke="#38bdf8" stroke-width="4"/>' },
      { id: 'tree', label: 'Árbol', w: 56, h: 76, color: '#16a34a', svg: '<rect x="20" y="30" width="14" height="22" fill="#a16207"/><circle cx="27" cy="22" r="18" fill="#16a34a"/>' },
      { id: 'flat', label: 'Plancha', w: 130, h: 26, color: '#0ea5e9', svg: '<rect x="2" y="6" width="52" height="16" fill="#0ea5e9"/>' }
    ];

    var CHALLENGES = [
      { id: 'free', label: 'Libre', test: function () { return null; } },
      { id: 'tower5', label: 'Torre de 5', test: function (p) { return count(p, 'cube') >= 5 || p.length >= 5 ? null : 'Necesitas al menos 5 bloques apilados.'; } },
      { id: 'house', label: 'Casa con 2 ventanas', test: function (p) {
          var w = count(p, 'window');
          if (p.length < 3) return 'Necesitas una base, paredes y ventanas.';
          if (w < 2) return 'Faltan ventanas: pon exactamente dos.';
          return null;
        } },
      { id: 'bridge', label: 'Puente', test: function (p) {
          if (count(p, 'rect') + count(p, 'flat') < 1) return 'Un puente necesita una parte larga arriba.';
          if (p.length < 3) return 'Añade al menos dos soportes.';
          return null;
        } },
      { id: 'vehicle', label: 'Vehículo con 4 ruedas', test: function (p) {
          var w = count(p, 'wheel');
          if (w < 4) return 'El vehículo necesita 4 ruedas. Llevas ' + w + '.';
          return null;
        } },
      { id: 'city', label: 'Ciudad', test: function (p) {
          if (p.length < 8) return 'Una ciudad necesita más elementos (mínimo 8).';
          if (count(p, 'tree') < 1) return 'Añade al menos un árbol.';
          return null;
        } }
    ];

    function count(p, id) { return p.filter(function (x) { return x.type === id; }).length; }

    function init() {
      var pal = el('build-palette');
      pal.innerHTML = '';
      PALETTE.forEach(function (item) {
        var b = h('button', 'pal-item');
        b.innerHTML = '<svg viewBox="0 0 48 56">' + item.svg + '</svg>';
        b.title = item.label;
        b.setAttribute('aria-label', 'Agregar ' + item.label);
        b.onclick = function () { addPiece(item, 40 + Math.random() * 60, 40 + Math.random() * 80); };
        pal.appendChild(b);
      });

      var tools = el('build-toolbar');
      tools.className = 'toolbar build-toolbar';
      tools.innerHTML = '';
      [['Girar', 'undo', function () { if (selected) { selected.rot = (selected.rot + 45) % 360; paint(); } }],
       ['Duplicar', 'redo', function () { if (selected) addPiece(typeOf(selected.type), selected.x + 40, selected.y + 20); }],
       ['Eliminar', 'trash', function () { if (selected) removePiece(selected.id); }]].forEach(function (t) {
        var b = h('button', 'tool');
        b.innerHTML = Icons.svg(t[1]) + '<span>' + t[0] + '</span>';
        b.onclick = function () { global.Audio.play('click'); t[2](); };
        tools.appendChild(b);
      });

      var ch = el('build-challenges');
      ch.innerHTML = '';
      CHALLENGES.forEach(function (c, i) {
        var b = h('button', 'seg-btn' + (i === 0 ? ' active' : ''), c.label);
        b.onclick = function () {
          Array.prototype.forEach.call(ch.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          challenge = c.id;
          el('build-feedback').textContent = '';
          el('build-feedback').className = 'feedback-line';
          global.Audio.play('click');
        };
        ch.appendChild(b);
      });

      on(el('btn-build-check'), checkChallenge);
      on(el('btn-build-clear'), function () {
        global.Feedback.confirm('¿Limpiar la escena?', 'Se borrarán todas las piezas.', function () {
          pieces = []; selected = null; paint();
        }, 'Sí, limpiar');
      });
      on(el('btn-build-explain'), explain);

      el('build-canvas').addEventListener('pointerdown', function (ev) {
        if (ev.target === el('build-canvas')) { selected = null; paint(); }
      });
    }

    function typeOf(id) { for (var i = 0; i < PALETTE.length; i++) if (PALETTE[i].id === id) return PALETTE[i]; return PALETTE[0]; }

    function addPiece(item, x, y) {
      pieces.push({
        id: ++uid, type: item.id, x: Math.round(x), y: Math.round(y),
        w: item.w, h: item.h, rot: 0, color: item.color
      });
      selected = pieces[pieces.length - 1];
      paint();
      global.Audio.play('drop');
    }

    function removePiece(id) {
      pieces = pieces.filter(function (p) { return p.id !== id; });
      selected = null;
      paint();
      global.Audio.play('pop');
    }

    function paint() {
      var host = el('build-canvas');
      host.innerHTML = '';
      pieces.forEach(function (p) {
        var node = h('div', 'build-piece' + (selected && selected.id === p.id ? ' selected' : ''));
        node.style.left = p.x + 'px';
        node.style.top = p.y + 'px';
        node.style.width = p.w + 'px';
        node.style.height = p.h + 'px';
        node.style.background = p.color;
        node.style.transform = 'rotate(' + p.rot + 'deg)';
        node.textContent = '';
        node.setAttribute('role', 'button');
        node.setAttribute('aria-label', 'Pieza ' + p.type);
        makeDraggable(node, p);
        node.addEventListener('click', function (ev) {
          ev.stopPropagation();
          selected = p;
          paint();
        });
        host.appendChild(node);
      });
    }

    function makeDraggable(node, piece) {
      var startX, startY, ox, oy, dragging = false;
      node.addEventListener('pointerdown', function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        dragging = true;
        node.setPointerCapture && node.setPointerCapture(ev.pointerId);
        startX = ev.clientX; startY = ev.clientY;
        ox = piece.x; oy = piece.y;
        selected = piece;
        node.classList.add('selected');
      });
      node.addEventListener('pointermove', function (ev) {
        if (!dragging) return;
        var host = el('build-canvas').getBoundingClientRect();
        piece.x = Math.max(0, Math.min(host.width - piece.w, ox + ev.clientX - startX));
        piece.y = Math.max(0, Math.min(host.height - piece.h, oy + ev.clientY - startY));
        node.style.left = piece.x + 'px';
        node.style.top = piece.y + 'px';
      });
      function stop() { if (dragging) { dragging = false; } }
      node.addEventListener('pointerup', stop);
      node.addEventListener('pointercancel', stop);
    }

    function checkChallenge() {
      var c = CHALLENGES.filter(function (x) { return x.id === challenge; })[0];
      if (!c) return;
      if (challenge === 'free') { global.Feedback.toast('Estás en modo libre: construye lo que quieras.'); return; }
      var err = c.test(pieces);
      var fb = el('build-feedback');
      if (err) {
        fb.className = 'feedback-line soft';
        fb.textContent = 'Casi: ' + err;
        global.Audio.play('hint');
        global.Speech.speak('Casi. ' + err);
        global.State.logActivity({ id: 'build_' + challenge, area: 'construccion', skill: 'coordinacion', difficulty: 2, correct: false, attempts: 1, seconds: 0 });
      } else {
        fb.className = 'feedback-line ok';
        fb.textContent = global.Feedback.praise() + ' Cumpliste el reto.';
        global.Audio.play('correct');
        global.Feedback.celebrate();
        global.State.bumpCounter('_builds');
        global.State.logActivity({ id: 'build_' + challenge, area: 'construccion', skill: 'coordinacion', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
        saveProject({
          type: 'construccion',
          title: 'Reto: ' + c.label,
          description: pieces.length + ' piezas',
          pieces: pieces.map(function (p) { return { type: p.type, x: Math.round(p.x), y: Math.round(p.y), rot: p.rot, color: p.color }; }),
          image: null,
          activity: activity ? activity.id : null
        });
        if (activity) global.Activities.notifyExternalDone(true);
      }
      global.State.save();
    }

    function explain() {
      var types = {};
      pieces.forEach(function (p) { types[p.type] = (types[p.type] || 0) + 1; });
      var desc = Object.keys(types).map(function (k) { return types[k] + ' ' + k; }).join(', ');
      var m = global.Feedback.modal({
        title: 'Explícanos tu construcción',
        html: '<p class="muted">Tienes ' + pieces.length + ' piezas: ' + (desc || 'ninguna') + '.</p>' +
          '<textarea id="build-expl" rows="4" style="width:100%;padding:12px;border:2px solid var(--line);border-radius:14px" placeholder="¿Qué construiste y para qué sirve?"></textarea>' +
          '<div class="actions"><button class="btn btn-soft" id="build-say">Hablar</button></div>',
        buttons: [
          { label: 'Guardar', style: 'btn-primary', onClick: function () {
              var txt = (document.getElementById('build-expl') || {}).value || '';
              saveProject({ type: 'construccion', title: 'Mi construcción', description: txt || desc, pieces: pieces, image: null });
              global.State.bumpCounter('_builds');
              global.Feedback.toast('Guardado en Mis proyectos.');
            } },
          { label: 'Cerrar', style: 'btn-ghost' }
        ]
      });
      var say = document.getElementById('build-say');
      if (say) say.onclick = function () {
        if (!global.Speech.listenSupported()) { global.Feedback.toast('Tu navegador no permite dictado.'); return; }
        global.Speech.listen({ onResult: function (t, f) { if (f) document.getElementById('build-expl').value = t; } });
      };
      void m;
    }

    function openFor(act) {
      activity = act;
      challenge = 'free';
      var ch = el('build-challenges');
      if (act && act.buildRule) {
        var map = { tower: 'tower5', house: 'house', bridge: 'bridge', vehicle: 'vehicle', triangles: 'free', remove: 'free' };
        challenge = map[act.buildRule] || 'free';
        Array.prototype.forEach.call(ch.children, function (b) {
          b.classList.toggle('active', b.textContent.toLowerCase().indexOf(challenge === 'free' ? 'libre' : challenge.substring(0, 4)) === 0);
        });
      }
      el('build-feedback').textContent = act ? act.question : '';
      el('build-feedback').className = 'feedback-line soft';
      global.Feedback.say(act ? act.hint || act.question : 'Construye lo que quieras.', 'think');
    }

    function getResults() { return { count: pieces.length, pieces: pieces }; }

    return { init: init, openFor: openFor, getResults: getResults };
  })();

  /* =======================================================
     ROMPECABEZAS / JUEGOS
  ======================================================= */
  var Puzzles = (function () {
    var mode = 'sliding';

    var SLIDING = [
      { name: 'Pez', color: '#38bdf8', shape: '<circle cx="100" cy="100" r="60" fill="#38bdf8"/><circle cx="80" cy="85" r="10" fill="#fff"/>' },
      { name: 'Sol', color: '#fbbf24', shape: '<circle cx="100" cy="100" r="55" fill="#fbbf24"/>' },
      { name: 'Casa', color: '#fb7185', shape: '<rect x="50" y="90" width="100" height="70" fill="#fb7185"/><path d="M45 90l55-45 55 45z" fill="#f43f5e"/>' }
    ];

    function init() {
      var tabs = el('puzzle-tabs');
      tabs.innerHTML = '';
      [['sliding', 'Rompecabezas'], ['sequence', 'Secuencia'], ['maze', 'Laberinto'], ['differences', 'Diferencias'], ['tangram', 'Figuras']].forEach(function (t, i) {
        var b = h('button', 'seg-btn' + (i === 0 ? ' active' : ''), t[1]);
        b.onclick = function () {
          Array.prototype.forEach.call(tabs.children, function (x) { x.classList.remove('active'); });
          b.classList.add('active');
          mode = t[0];
          render();
          global.Audio.play('click');
        };
        tabs.appendChild(b);
      });
      render();
    }

    function render() {
      var stage = el('puzzle-stage');
      stage.innerHTML = '';
      if (mode === 'sliding') renderSliding(stage);
      else if (mode === 'sequence') renderSequence(stage);
      else if (mode === 'maze') renderMaze(stage);
      else if (mode === 'differences') renderDifferences(stage);
      else renderTangram(stage);
    }

    function renderSliding(stage) {
      var pic = SLIDING[Math.floor(Math.random() * SLIDING.length)];
      var dataUri = 'data:image/svg+xml;base64,' + btoa(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f1f5f9"/>' + pic.shape + '</svg>');

      var wrap = h('div', 'jigsaw');
      wrap.style.gridTemplateColumns = 'repeat(3,1fr)';
      var order = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]);
      var cells = [];
      for (var i = 0; i < 9; i++) {
        var c = h('div', 'cell');
        c.style.backgroundImage = 'url(' + dataUri + ')';
        c.style.backgroundSize = '300% 300%';
        c.style.backgroundPosition = (i % 3) * 50 + '% ' + Math.floor(i / 3) * 50 + '%';
        c.setAttribute('data-target', i);
        c.addEventListener('click', function (ev) { drop(ev.currentTarget); });
        wrap.appendChild(c);
        cells.push(c);
      }

      var rack = h('div', 'tile-rack');
      order.forEach(function (idx) {
        var t = h('div', 'tile');
        t.style.backgroundImage = 'url(' + dataUri + ')';
        t.style.backgroundSize = '300% 300%';
        t.style.backgroundPosition = (idx % 3) * 50 + '% ' + Math.floor(idx / 3) * 50 + '%';
        t.setAttribute('data-idx', idx);
        t.setAttribute('tabindex', '0');
        t.setAttribute('role', 'button');
        t.setAttribute('aria-label', 'Pieza ' + (idx + 1));
        t.addEventListener('click', function () {
          Array.prototype.forEach.call(rack.children, function (x) { x.classList.remove('active'); x.style.outline = ''; });
          t.style.outline = '3px solid #38bdf8';
          rack.setAttribute('data-selected', idx);
        });
        rack.appendChild(t);
      });

      var info = h('p', 'muted', 'Elige una pieza y toca la casilla donde va. Piezas colocadas: <b id="pz-count">0</b>/9');
      var hint = h('div', 'actions');
      var btnR = h('button', 'btn btn-primary', 'Comprobar');
      btnR.onclick = function () {
        var ok = cells.every(function (c) { return c.classList.contains('filled') && c.getAttribute('data-placed') === c.getAttribute('data-target'); });
        if (ok) win(stage, 'Rompecabezas completado');
        else {
          var placed = cells.filter(function (c) { return c.getAttribute('data-placed') === c.getAttribute('data-target'); }).length;
          global.Feedback.toast('Colocaste ' + placed + ' bien. Sigue buscando.');
          global.Audio.play('wrong');
        }
      };
      hint.appendChild(btnR);
      stage.appendChild(h('div', 'puzzle-board')).appendChild(wrap);
      stage.appendChild(rack);
      stage.appendChild(info);
      stage.appendChild(hint);

      function drop(cell) {
        var sel = rack.getAttribute('data-selected');
        if (sel == null) { global.Feedback.toast('Primero elige una pieza.'); return; }
        cell.style.backgroundImage = rack.children[parseInt(sel, 10)].style.backgroundImage;
        cell.style.backgroundSize = '300% 300%';
        cell.style.backgroundPosition = rack.children[parseInt(sel, 10)].style.backgroundPosition;
        cell.classList.add('filled');
        cell.setAttribute('data-placed', sel);
        rack.children[parseInt(sel, 10)].style.visibility = 'hidden';
        rack.removeAttribute('data-selected');
        var cnt = document.getElementById('pz-count');
        if (cnt) cnt.textContent = cells.filter(function (c) { return c.classList.contains('filled'); }).length;
        global.Audio.play('drop');
      }
    }

    function renderSequence(stage) {
      var seq = shuffle(['circle', 'square', 'triangle']);
      var pattern = [];
      for (var i = 0; i < 9; i++) pattern.push(seq[i % seq.length]);
      var shown = pattern.slice(0, 6);

      var body = h('div', 'act-body');
      body.innerHTML = '<p class="act-question">¿Qué sigue en el patrón?</p>';
      var row = h('div', 'seq-row');
      shown.forEach(function (s) {
        var c = h('div', 'seq-cell', shapeChar(s));
        row.appendChild(c);
      });
      var q = h('div', 'seq-cell', '?');
      q.style.borderStyle = 'dashed';
      row.appendChild(q);
      body.appendChild(row);

      var choices = h('div', 'choices');
      ['circle', 'square', 'triangle', 'star'].forEach(function (s) {
        var b = h('button', 'choice', '<span class="ch-key">' + shapeChar(s) + '</span><span>' + s + '</span>');
        b.onclick = function () {
          if (s === pattern[6]) { win(stage, '¡Completaste el patrón!'); }
          else { global.Audio.play('wrong'); global.Feedback.toast('Casi. Observa qué se repite.'); b.classList.add('wrong'); }
        };
        choices.appendChild(b);
      });
      body.appendChild(choices);
      body.appendChild(h('div', 'muted', 'Pista: mira de 3 en 3, se repite el mismo orden.'));
      stage.appendChild(body);
    }

    function shapeChar(s) {
      return { circle: '●', square: '■', triangle: '▲', star: '★' }[s] || '?';
    }

    function renderMaze(stage) {
      var size = 7;
      var walls = [];
      // Genera un laberinto simple por DFS
      var cellsArr = [];
      for (var i = 0; i < size * size; i++) cellsArr.push({ v: false, n: true, e: true, s: true, w: true });
      var stack = [0];
      cellsArr[0].v = true;
      var dirs = [{ d: -size, wall: 'n', opp: 's' }, { d: 1, wall: 'e', opp: 'w' }, { d: size, wall: 's', opp: 'n' }, { d: -1, wall: 'w', opp: 'e' }];
      while (stack.length) {
        var cur = stack[stack.length - 1];
        var row = Math.floor(cur / size), col = cur % size;
        var avail = dirs.filter(function (dd) {
          var nx = cur + dd.d;
          if (nx < 0 || nx >= size * size) return false;
          if (dd.d === -1 && col === 0) return false;
          if (dd.d === 1 && col === size - 1) return false;
          return !cellsArr[nx].v;
        });
        if (!avail.length) { stack.pop(); continue; }
        var pick = avail[Math.floor(Math.random() * avail.length)];
        var nxt = cur + pick.d;
        cellsArr[cur][pick.wall] = false;
        cellsArr[nxt][pick.opp] = false;
        cellsArr[nxt].v = true;
        stack.push(nxt);
      }

      var pos = 0;
      var stageBox = h('div', 'puzzle-board');
      var msg = h('p', 'muted', 'Lleva el punto desde la esquina superior izquierda hasta la meta.');
      var info = h('div', 'actions');
      var lbl = h('span', 'li-meta', 'Posición 1');
      info.appendChild(lbl);
      var body = h('div', 'act-body');
      var grid = h('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + size + ',1fr);gap:3px;max-width:420px;margin:0 auto';

      function paintGrid() {
        grid.innerHTML = '';
        for (var i = 0; i < size * size; i++) {
          var c = cellsArr[i];
          var d = h('div');
          var bd = [];
          if (c.n) bd.push('3px solid #38bdf8');
          if (c.e) bd.push('3px solid #38bdf8');
          if (c.s) bd.push('3px solid #38bdf8');
          if (c.w) bd.push('3px solid #38bdf8');
          d.style.cssText = 'aspect-ratio:1;background:' + (i === pos ? '#f59e0b' : i === size * size - 1 ? '#86efac' : '#fff') + ';border:' + (bd.length === 4 ? '3px solid #38bdf8' : '') + ';border-top:' + (c.n ? '3px solid #38bdf8' : '0') + ';border-right:' + (c.e ? '3px solid #38bdf8' : '0') + ';border-bottom:' + (c.s ? '3px solid #38bdf8' : '0') + ';border-left:' + (c.w ? '3px solid #38bdf8' : '0') + ';';
          d.setAttribute('data-i', i);
          d.onclick = (function (idx) { return function () { move(idx); }; })(i);
          grid.appendChild(d);
        }
      }

      function move(idx) {
        var row = Math.floor(idx / size), col = idx % size;
        var prow = Math.floor(pos / size), pcol = pos % size;
        var ok = (Math.abs(row - prow) + Math.abs(col - pcol)) === 1;
        if (!ok) { global.Audio.play('error'); return; }
        var diff = idx - pos;
        var blocked = (diff === 1 && cellsArr[pos].e) || (diff === -1 && cellsArr[pos].w) ||
                      (diff === size && cellsArr[pos].s) || (diff === -size && cellsArr[pos].n);
        if (blocked) { global.Audio.play('error'); global.Feedback.toast('Hay un muro ahí.'); return; }
        pos = idx;
        global.Audio.play('drop');
        lbl.textContent = 'Posición ' + (pos + 1);
        paintGrid();
        if (pos === size * size - 1) win(stage, '¡Saliste del laberinto!');
      }

      body.appendChild(msg);
      body.appendChild(grid);
      stageBox.appendChild(body);
      stage.appendChild(stageBox);
      stage.appendChild(info);
      paintGrid();
    }

    function renderDifferences(stage) {
      var base = ['sol', 'pez', 'casa', 'arbol'];
      var items = base.slice();
      var diffIdx = Math.floor(Math.random() * items.length);
      var options = ['sol', 'pez', 'casa', 'arbol', 'luna', 'barco'];
      var answer = options[Math.floor(Math.random() * options.length)];
      // Cambia un elemento del segundo grupo
      var second = items.slice();
      second[diffIdx] = answer;

      var body = h('div', 'act-body');
      body.innerHTML = '<p class="act-question">¿Qué cambia en el segundo grupo?</p>';
      function row(list) {
        var r = h('div', 'object-row');
        list.forEach(function (n) {
          var o = h('div', 'obj');
          o.style.width = '70px';
          o.style.height = '70px';
          o.innerHTML = Icons.art({ sol: 'sun', pez: 'fish', casa: 'house', arbol: 'tree', luna: 'planet', barco: 'bus' }[n] || 'sun');
          r.appendChild(o);
        });
        return r;
      }
      body.appendChild(h('div', 'muted', 'Grupo A'));
      body.appendChild(row(items));
      body.appendChild(h('div', 'muted', 'Grupo B'));
      body.appendChild(row(second));

      var ch = h('div', 'choices');
      ['sol', 'pez', 'casa', 'arbol'].forEach(function (n) {
        var b = h('button', 'choice', '<span class="ch-key">' + n.charAt(0).toUpperCase() + '</span><span>' + n + '</span>');
        b.onclick = function () {
          if (n === base[diffIdx]) win(stage, '¡Encontraste la diferencia!');
          else { global.Audio.play('wrong'); global.Feedback.toast('No es ese. Compara otra vez.'); b.classList.add('wrong'); }
        };
        ch.appendChild(b);
      });
      body.appendChild(ch);
      stage.appendChild(body);
    }

    function renderTangram(stage) {
      var targets = [
        { name: 'Cuadrado', svg: '<rect x="120" y="80" width="140" height="140" fill="#dbeafe" stroke="#38bdf8" stroke-width="4"/>' },
        { name: 'Rectángulo', svg: '<rect x="90" y="110" width="210" height="90" fill="#dcfce7" stroke="#22c55e" stroke-width="4"/>' },
        { name: 'Casa', svg: '<rect x="130" y="130" width="120" height="90" fill="#fee2e2" stroke="#f43f5e" stroke-width="4"/><path d="M120 130l70-55 70 55z" fill="#fecaca" stroke="#f43f5e" stroke-width="4"/>' }
      ];
      var t = targets[Math.floor(Math.random() * targets.length)];
      var body = h('div', 'act-body');
      body.innerHTML = '<p class="act-question">Forma: ' + t.name + '</p>' +
        '<div style="text-align:center"><svg viewBox="0 0 400 260" class="diff-stage">' + t.svg + '</svg></div>';

      var shapes = [
        { id: 'sq', label: 'Cuadrado', svg: '<rect x="0" y="0" width="70" height="70" fill="#38bdf8"/>' },
        { id: 'tr1', label: 'Triángulo grande', svg: '<path d="M0 80L40 0l40 80z" fill="#f59e0b"/>' },
        { id: 'tr2', label: 'Triángulo pequeño', svg: '<path d="M0 55L27 0l27 55z" fill="#22c55e"/>' },
        { id: 'rect', label: 'Rectángulo', svg: '<rect x="0" y="0" width="90" height="45" fill="#a855f7"/>' }
      ];

      var ch = h('div', 'choices');
      shapes.forEach(function (s) {
        var b = h('button', 'choice');
        b.innerHTML = '<svg viewBox="0 0 90 80" style="width:44px">' + s.svg + '</svg><span>' + s.label + '</span>';
        b.onclick = function () {
          if (t.name.toLowerCase().indexOf(s.label.toLowerCase().split(' ')[0]) === 0) {
            win(stage, '¡Formaste la figura!');
          } else {
            global.Audio.play('wrong');
            global.Feedback.toast('Observa bien la figura objetivo.');
            b.classList.add('wrong');
          }
        };
        ch.appendChild(b);
      });
      body.appendChild(ch);
      body.appendChild(h('div', 'muted', 'Toca la pieza que corresponde a la figura.'));
      stage.appendChild(body);
    }

    function win(stage, msg) {
      global.Feedback.celebrate();
      global.Feedback.modal({
        art: Icons.svg('trophy'), title: msg,
        text: '¿Quieres jugar otra vez?',
        buttons: [
          { label: 'Otra vez', style: 'btn-primary', onClick: render },
          { label: 'Volver', style: 'btn-ghost' }
        ]
      });
      global.State.logActivity({ id: 'puzzle_' + mode, area: 'logica', skill: 'logica', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
    }

    function shuffle(a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

    return { init: init, render: render };
  })();

  /* =======================================================
     GUARDAR PROYECTOS (usado por muchos módulos)
  ======================================================= */
  function saveProject(data) {
    data = data || {};
    data.id = 'p_' + Date.now() + '_' + Math.floor(Math.random() * 999);
    data.ts = Date.now();
    global.Storage.putBlob({ id: data.id, kind: 'project', data: data });
    global.State.bumpCounter('projectCount');
    global.State.save(true);
    if (global.Missions) global.Missions.refresh();
    return data;
  }

  /* =======================================================
     INIT
  ======================================================= */
  function init() {
    initDraw();
    initNotebook();
    initColoring();
    Trace.init();
    Build.init();
    Puzzles.init();
  }

  global.Creative = {
    init: init,
    openForActivity: openForActivity,
    saveProject: saveProject,
    getDrawCanvas: function () { return drawCnv; },
    Build: Build,
    Trace: Trace,
    Puzzles: Puzzles
  };
})(window);
