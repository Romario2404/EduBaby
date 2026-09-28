/* =========================================================
   canvas.js - Funciones reutilizables de Canvas
   initCanvas / clearCanvas / undoCanvas / redoCanvas /
   saveCanvas / loadCanvas / setBrush / setColor / setBrushSize
   Ajuste de resolución de pantalla (devicePixelRatio),
   entrada táctil y de ratón, histórico de deshacer.
   ========================================================= */
(function (global) {
  'use strict';

  var instances = {};

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function resolveEl(idOrEl) {
    if (!idOrEl) return null;
    if (typeof idOrEl === 'string') return document.getElementById(idOrEl);
    return idOrEl;
  }

  function createCanvas(idOrEl, options) {
    options = options || {};
    var canvasEl = resolveEl(idOrEl);
    if (!canvasEl) return null;
    if (typeof canvasEl.getContext !== 'function') return null;
    if (instances[canvasEl.id]) return instances[canvasEl.id];

    var cnv = {
      el: canvasEl,
      ctx: canvasEl.getContext('2d'),
      tool: options.tool || 'pencil',
      color: options.color || '#0f172a',
      size: options.size || 5,
      background: options.background || '#ffffff',
      undoStack: [],
      redoStack: [],
      maxHistory: 25,
      drawing: false,
      dirty: false,
      listeners: [],
      onChange: options.onChange || null
    };

    /* ---------- tamaño ---------- */
    function resize() {
      var rect = canvasEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      var dpr = clamp(global.devicePixelRatio || 1, 1, 3);
      var w = Math.round(rect.width * dpr);
      var h = Math.round(rect.height * dpr);
      if (canvasEl.width === w && canvasEl.height === h) return;

      // Conserva el contenido anterior
      var snapshot = null;
      try { snapshot = cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height); } catch (e) { snapshot = null; }
      var oldW = canvasEl.width, oldH = canvasEl.height;

      canvasEl.width = w;
      canvasEl.height = h;
      cnv.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fillBackground();

      if (snapshot && oldW && oldH) {
        try {
          var tmp = document.createElement('canvas');
          tmp.width = oldW; tmp.height = oldH;
          tmp.getContext('2d').putImageData(snapshot, 0, 0);
          cnv.ctx.drawImage(tmp, 0, 0, rect.width, rect.height);
        } catch (e) { /* ignorar */ }
      }
      paintOverlay();
    }

    function fillBackground() {
      var r = canvasEl.getBoundingClientRect();
      cnv.ctx.save();
      cnv.ctx.setTransform(1, 0, 0, 1, 0, 0);
      cnv.ctx.fillStyle = cnv.background;
      cnv.ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
      cnv.ctx.restore();
      paintOverlay();
    }

    var overlayData = null;
    function setOverlay(drawFn) { overlayData = drawFn; paintOverlay(); }
    function paintOverlay() {
      if (!overlayData) return;
      try { overlayData(cnv.ctx, canvasEl.getBoundingClientRect()); } catch (e) { /* ignorar */ }
    }

    function pos(ev) {
      var rect = canvasEl.getBoundingClientRect();
      var p = (ev.touches && ev.touches[0]) || ev;
      return { x: p.clientX - rect.left, y: p.clientY - rect.top };
    }

    /* ---------- herramientas ---------- */
    function applyStyle() {
      var c = cnv.ctx;
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.strokeStyle = cnv.tool === 'eraser' ? cnv.background : cnv.color;
      c.fillStyle = cnv.color;

      if (cnv.tool === 'pencil') { c.globalAlpha = 1; c.lineWidth = cnv.size; }
      else if (cnv.tool === 'marker') { c.globalAlpha = 0.45; c.lineWidth = cnv.size * 2.6; }
      else if (cnv.tool === 'brush') { c.globalAlpha = 0.9; c.lineWidth = cnv.size * 1.8; }
      else if (cnv.tool === 'eraser') { c.globalAlpha = 1; c.lineWidth = cnv.size * 3.4; }
      else { c.globalAlpha = 1; c.lineWidth = cnv.size; }
      if (cnv.tool === 'eraser') c.strokeStyle = '#ffffff';
    }

    var last = null;
    var shapeStart = null;

    function start(ev) {
      ev.preventDefault();
      if (cnv.historyLock) return;
      pushHistory();
      cnv.drawing = true;
      var p = pos(ev);
      last = p;
      applyStyle();
      if (cnv.tool === 'line' || cnv.tool === 'rect' || cnv.tool === 'circle') {
        shapeStart = p;
        cnv.snapshotShape = cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height);
        return;
      }
      cnv.ctx.beginPath();
      cnv.ctx.moveTo(p.x, p.y);
      cnv.ctx.lineTo(p.x + 0.01, p.y + 0.01);
      cnv.ctx.stroke();
      cnv.dirty = true;
    }

    function move(ev) {
      if (!cnv.drawing) return;
      ev.preventDefault();
      var p = pos(ev);
      if (cnv.tool === 'line' || cnv.tool === 'rect' || cnv.tool === 'circle') {
        drawShapePreview(p);
        return;
      }
      applyStyle();
      cnv.ctx.beginPath();
      cnv.ctx.moveTo(last.x, last.y);
      cnv.ctx.lineTo(p.x, p.y);
      cnv.ctx.stroke();
      last = p;
      cnv.dirty = true;
    }

    function drawShapePreview(p) {
      var c = cnv.ctx;
      try { c.putImageData(cnv.snapshotShape, 0, 0); } catch (e) { /* ignorar */ }
      applyStyle();
      c.beginPath();
      if (cnv.tool === 'line') { c.moveTo(shapeStart.x, shapeStart.y); c.lineTo(p.x, p.y); c.stroke(); }
      else if (cnv.tool === 'rect') { c.rect(shapeStart.x, shapeStart.y, p.x - shapeStart.x, p.y - shapeStart.y); c.stroke(); }
      else if (cnv.tool === 'circle') {
        var rx = Math.abs(p.x - shapeStart.x), ry = Math.abs(p.y - shapeStart.y);
        c.ellipse((shapeStart.x + p.x) / 2, (shapeStart.y + p.y) / 2, rx, ry, 0, 0, Math.PI * 2);
        c.stroke();
      }
      cnv.dirty = true;
    }

    function end(ev) {
      if (!cnv.drawing) return;
      cnv.drawing = false;
      if (cnv.tool === 'line' || cnv.tool === 'rect' || cnv.tool === 'circle') {
        if (ev && ev.changedTouches) {
          var t = ev.changedTouches[0];
          var rect = canvasEl.getBoundingClientRect();
          drawShapePreview({ x: t.clientX - rect.left, y: t.clientY - rect.top });
        }
        cnv.snapshotShape = null;
      }
      cnv.redoStack.length = 0;
      notify();
    }

    function notify() { if (cnv.onChange) try { cnv.onChange(cnv); } catch (e) { /* ignorar */ } }

    /* ---------- historia ---------- */
    function pushHistory() {
      try {
        cnv.undoStack.push(cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height));
        if (cnv.undoStack.length > cnv.maxHistory) cnv.undoStack.shift();
      } catch (e) { /* ignorar */ }
    }

    cnv.undo = function () {
      if (!cnv.undoStack.length) return false;
      try {
        cnv.redoStack.push(cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height));
        var img = cnv.undoStack.pop();
        cnv.ctx.putImageData(img, 0, 0);
        notify();
        return true;
      } catch (e) { return false; }
    };
    cnv.redo = function () {
      if (!cnv.redoStack.length) return false;
      try {
        cnv.undoStack.push(cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height));
        cnv.ctx.putImageData(cnv.redoStack.pop(), 0, 0);
        notify();
        return true;
      } catch (e) { return false; }
    };
    cnv.clear = function () {
      pushHistory();
      fillBackground();
      cnv.dirty = false;
      notify();
    };
    cnv.save = function (type, quality) {
      try { return canvasEl.toDataURL(type || 'image/png', quality); }
      catch (e) { return null; }
    };
    cnv.load = function (dataUrl, keepAspect) {
      return new Promise(function (resolve) {
        if (!dataUrl) { resolve(false); return; }
        var img = new Image();
        img.onload = function () {
          pushHistory();
          fillBackground();
          var rect = canvasEl.getBoundingClientRect();
          if (keepAspect) {
            var s = Math.min(rect.width / img.width, rect.height / img.height);
            var w = img.width * s, h = img.height * s;
            cnv.ctx.drawImage(img, (rect.width - w) / 2, (rect.height - h) / 2, w, h);
          } else {
            cnv.ctx.drawImage(img, 0, 0, rect.width, rect.height);
          }
          cnv.dirty = true;
          notify();
          resolve(true);
        };
        img.onerror = function () { resolve(false); };
        img.src = dataUrl;
      });
    };
    cnv.setBrush = function (tool) { cnv.tool = tool || 'pencil'; notify(); };
    cnv.setColor = function (color) { cnv.color = color; notify(); };
    cnv.setBrushSize = function (n) { cnv.size = clamp(parseFloat(n) || 5, 1, 60); notify(); };
    cnv.getBrush = function () { return { tool: cnv.tool, color: cnv.color, size: cnv.size }; };
    cnv.isBlank = function () {
      // Detecta si el lienzo está vacío (todo del color de fondo)
      try {
        var d = cnv.ctx.getImageData(0, 0, canvasEl.width, canvasEl.height).data;
        var step = 4 * 40;
        for (var i = 0; i < d.length; i += step) {
          if (d[i] !== 255 || d[i + 1] !== 255 || d[i + 2] !== 255) return false;
        }
      } catch (e) { return false; }
      return true;
    };
    cnv.setOverlay = setOverlay;
    cnv.resize = resize;

    /* ---------- eventos ---------- */
    var opts = { passive: false };
    canvasEl.addEventListener('pointerdown', start, opts);
    canvasEl.addEventListener('pointermove', move, opts);
    global.addEventListener('pointerup', end, opts);
    global.addEventListener('pointercancel', end, opts);
    canvasEl.addEventListener('touchstart', function (e) { e.preventDefault(); }, opts);
    canvasEl.addEventListener('touchmove', function (e) { e.preventDefault(); }, opts);

    if (global.ResizeObserver) {
      var ro = new ResizeObserver(function () { resize(); });
      ro.observe(canvasEl);
    } else {
      global.addEventListener('resize', resize);
    }

    resize();
    fillBackground();
    instances[canvasEl.id] = cnv;
    return cnv;
  }

  function get(idOrEl) {
    var el = resolveEl(idOrEl);
    if (!el) return null;
    if (instances[el.id]) return instances[el.id];
    return createCanvas(el);
  }

  function reset(idOrEl) {
    var c = get(idOrEl);
    if (c) { c.undoStack.length = 0; c.redoStack.length = 0; c.clear(); }
    return c;
  }

  /* -------- Utilidades para trazado -------- */
  /**
   * Compara los trazos del niño con la trayectoria esperada.
   * expected: array de {x,y} en 0..1
   * Devuelve {coverage 0..1, directionOk, startOk}
   */
  function evaluateTrace(userPoints, expectedPoints, w, h) {
    if (!userPoints || userPoints.length < 5) {
      return { coverage: 0, directionOk: false, startOk: false, ok: false };
    }
    var toPx = function (p) { return { x: p.x * w, y: p.y * h }; };
    var exp = expectedPoints.map(toPx);

    // 1) ¿Comenzó cerca del inicio esperado?
    var first = userPoints[0];
    var e0 = exp[0];
    var startDist = Math.hypot(first.x - e0.x, first.y - e0.y);
    var startOk = startDist < Math.max(w, h) * 0.18;

    // 2) Cobertura: qué fracción de la trayectoria esperada fue "cubierta"
    var covered = 0;
    for (var i = 0; i < exp.length; i++) {
      var min = Infinity;
      for (var j = 0; j < userPoints.length; j++) {
        var d = Math.hypot(userPoints[j].x - exp[i].x, userPoints[j].y - exp[i].y);
        if (d < min) min = d;
      }
      if (min < Math.max(w, h) * 0.09) covered++;
    }
    var coverage = exp.length ? covered / exp.length : 0;

    // 3) Dirección: progreso acumulado del niño vs lo esperado
    var lastUser = userPoints[userPoints.length - 1];
    var eLast = exp[exp.length - 1];
    var endDist = Math.hypot(lastUser.x - eLast.x, lastUser.y - eLast.y);
    var directionOk = endDist < Math.max(w, h) * 0.22;

    return {
      coverage: Math.round(coverage * 100) / 100,
      startOk: startOk,
      directionOk: directionOk,
      ok: coverage >= 0.6 && startOk
    };
  }

  /** Genera puntos de una línea recta guía */
  function linePath(x1, y1, x2, y2, n) {
    var pts = [];
    n = n || 24;
    for (var i = 0; i <= n; i++) {
      pts.push({ x: x1 + (x2 - x1) * i / n, y: y1 + (y2 - y1) * i / n });
    }
    return pts;
  }

  global.CanvasKit = {
    create: createCanvas,
    get: get,
    reset: reset,
    evaluateTrace: evaluateTrace,
    linePath: linePath
  };
})(window);
