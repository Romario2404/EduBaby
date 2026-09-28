/* =========================================================
   math.js - Laboratorio matemático visual
   No enseña solo con operaciones: usa objetos visuales,
   construcción de torres y dinero real.
   ========================================================= */
(function (global) {
  'use strict';

  function el(id) { return document.getElementById(id); }
  function h(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  function rand(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

  var OBJECT_ART = { apple: 'apple', star: 'star', sun: 'sun', fish: 'fish', ball: 'sun', cloud: 'cloud' };

  function objects(kind, n) {
    var art = Icons.art(OBJECT_ART[kind] || 'apple');
    var out = '<div class="object-row" style="justify-content:center">';
    for (var i = 0; i < n; i++) out += '<div class="obj">' + art + '</div>';
    return out + '</div>';
  }

  /* -------------------------------------------------------
     Suma visual con objetos
  ------------------------------------------------------- */
  function renderVisualAddition(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Suma con objetos</h3><div id="va-body"></div>';
    host.appendChild(card);

    var a, b, kind, answer, attempts = 0;

    function newRound() {
      var lvl = global.State.get().level;
      var max = lvl <= 2 ? 5 : lvl <= 3 ? 9 : 15;
      a = rand(1, max);
      b = rand(1, Math.max(2, Math.floor(max / 2)));
      kind = ['apple', 'star', 'sun'][rand(0, 2)];
      answer = a + b;
      attempts = 0;
      paint();
    }

    function paint() {
      var body = el('va-body');
      body.innerHTML =
        '<p class="act-question">' + a + ' + ' + b + ' = ?</p>' +
        objects(kind, a) +
        '<p class="muted" style="text-align:center">más</p>' +
        objects(kind, b) +
        '<div class="act-audio-row" style="justify-content:center">' +
          '<button class="btn btn-soft" id="va-listen">Escuchar</button>' +
          '<button class="btn btn-ghost" id="va-hint">Pista</button>' +
        '</div>' +
        '<input type="number" id="va-input" class="pin-input" style="max-width:180px" aria-label="Resultado">' +
        '<div class="actions" style="justify-content:center"><button class="btn btn-primary" id="va-ok">Comprobar</button>' +
        '<button class="btn btn-ghost" id="va-next">Otra</button></div>' +
        '<p class="feedback-line" id="va-fb"></p>';

      el('va-listen').onclick = function () { global.Speech.speak(a + ' más ' + b + ' son cuántos?'); };
      el('va-hint').onclick = function () {
        el('va-fb').className = 'feedback-line soft';
        el('va-fb').textContent = 'Cuenta todos los objetos juntos: empieza por el primer grupo.';
        global.Audio.play('hint');
      };
      el('va-next').onclick = newRound;
      el('va-ok').onclick = check;
      el('va-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
      setTimeout(function () { var i = el('va-input'); if (i) i.focus(); }, 100);
    }

    function check() {
      var v = parseInt(el('va-input').value, 10);
      var fb = el('va-fb');
      if (isNaN(v)) { fb.className = 'feedback-line soft'; fb.textContent = 'Escribe un número.'; return; }
      attempts++;
      if (v === answer) {
        fb.className = 'feedback-line ok';
        fb.textContent = global.Feedback.praise() + ' ' + a + ' + ' + b + ' = ' + answer;
        global.Audio.play('correct');
        global.Feedback.confetti(24);
        global.State.logActivity({ id: 'vis_add', area: 'matematica', skill: 'suma', difficulty: global.State.get().level, correct: true, attempts: attempts, seconds: 0 });
        setTimeout(newRound, 1500);
      } else {
        fb.className = 'feedback-line retry';
        fb.textContent = attempts === 1
          ? 'Cerca. Vuelve a contar los dos grupos.'
          : 'La respuesta era ' + answer + '. Observa cómo se agrupan.';
        global.Audio.play('wrong');
        global.State.logActivity({ id: 'vis_add', area: 'matematica', skill: 'suma', difficulty: global.State.get().level, correct: false, attempts: attempts, seconds: 0 });
        if (attempts >= 2) setTimeout(newRound, 2600);
      }
      global.State.save();
    }

    newRound();
  }

  /* -------------------------------------------------------
     Resta con construcción de torre
  ------------------------------------------------------- */
  function renderTowerMath(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Matemática con bloques</h3>' +
      '<p class="muted">Construye la torre y luego retira bloques.</p>' +
      '<div class="seq-row" id="tm-tower"></div>' +
      '<p class="act-question" id="tm-text"></p>' +
      '<div class="actions" style="justify-content:center">' +
      '<button class="btn btn-primary" id="tm-add">Más bloques</button>' +
      '<button class="btn btn-soft" id="tm-remove">Quitar bloques</button>' +
      '<button class="btn btn-ghost" id="tm-ask">Pregunta</button>' +
      '</div><p class="feedback-line" id="tm-fb"></p>';
    host.appendChild(card);

    var tower = 5, removed = 0, asked = false;

    function paint() {
      var t = el('tm-tower');
      t.innerHTML = '';
      for (var i = 0; i < tower; i++) {
        var b = h('div', 'seq-cell');
        b.style.cssText = 'width:52px;height:52px;background:#38bdf8;color:#fff;border-color:#0284c7';
        t.appendChild(b);
      }
      el('tm-text').textContent = 'Bloques en la torre: ' + tower;
    }

    el('tm-add').onclick = function () { tower++; removed = 0; asked = false; el('tm-fb').textContent = ''; paint(); global.Audio.play('drop'); };
    el('tm-remove').onclick = function () {
      if (tower > 0) { tower--; removed++; el('tm-fb').textContent = ''; paint(); global.Audio.play('pop'); }
    };
    el('tm-ask').onclick = function () {
      var fb = el('tm-fb');
      if (!asked) {
        asked = true;
        fb.className = 'feedback-line soft';
        fb.textContent = '¿Cuántos bloques quedan? Escribe el número.';
        var inp = h('input');
        inp.type = 'number';
        inp.className = 'pin-input';
        inp.style.maxWidth = '160px';
        inp.id = 'tm-answer';
        fb.appendChild(document.createElement('br'));
        fb.appendChild(inp);
        var ok = h('button', 'btn btn-primary', 'Ok');
        ok.onclick = function () {
          var v = parseInt(inp.value, 10);
          if (v === tower) {
            fb.className = 'feedback-line ok';
            fb.textContent = '¡Correcto! Quedan ' + tower + ' bloques.';
            global.Audio.play('correct');
            global.Feedback.confetti(20);
            global.State.logActivity({ id: 'tower_math', area: 'matematica', skill: 'resta', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
            setTimeout(paint, 1500);
          } else {
            fb.className = 'feedback-line retry';
            fb.textContent = 'Cuenta los bloques que quedan en la torre.';
            global.Audio.play('wrong');
          }
          global.State.save();
        };
        fb.appendChild(ok);
        setTimeout(function () { if (inp) inp.focus(); }, 80);
      }
    };

    paint();
  }

  /* -------------------------------------------------------
     Dinero real
  ------------------------------------------------------- */
  function renderMoney(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Dinero y compras</h3><div id="money-body"></div>';
    host.appendChild(card);

    var ITEMS = [
      { n: 'Lápiz', p: 3 }, { n: 'Cuaderno', p: 8 }, { n: 'Goma', p: 2 },
      { n: 'Árbol', p: 12 }, { n: 'Pelota', p: 15 }
    ];
    var budget = 0, item = null;

    function newRound() {
      var lvl = global.State.get().level;
      budget = [20, 30, 50, 100][rand(0, lvl >= 4 ? 3 : 2)];
      item = ITEMS[rand(0, ITEMS.length - 1)];
      paint();
    }

    function paint() {
      var body = el('money-body');
      body.innerHTML =
        '<p class="act-question">Tienes S/ ' + budget + '.</p>' +
        '<p class="muted">Compras un ' + item.n + ' de S/ ' + item.p + '.</p>' +
        '<p class="act-question">¿Cuánto dinero queda?</p>' +
        '<div class="actions" style="justify-content:center">' +
        '<button class="btn btn-soft" id="money-hint">Pista</button>' +
        '<button class="btn btn-ghost" id="money-next">Otra</button>' +
        '</div>' +
        '<input type="number" id="money-input" class="pin-input" style="max-width:180px" aria-label="Cuánto queda">' +
        '<div class="actions" style="justify-content:center"><button class="btn btn-primary" id="money-ok">Comprobar</button></div>' +
        '<p class="feedback-line" id="money-fb"></p>';
      el('money-hint').onclick = function () {
        el('money-fb').className = 'feedback-line soft';
        el('money-fb').textContent = 'Resta: total - precio.';
        global.Audio.play('hint');
      };
      el('money-next').onclick = newRound;
      el('money-ok').onclick = check;
      el('money-input').addEventListener('keydown', function (e) { if (e.key === 'Enter') check(); });
    }

    function check() {
      var v = parseInt(el('money-input').value, 10);
      var fb = el('money-fb');
      if (isNaN(v)) { fb.className = 'feedback-line soft'; fb.textContent = 'Escribe cuánto queda.'; return; }
      if (v === budget - item.p) {
        fb.className = 'feedback-line ok';
        fb.textContent = '¡Excelente! Quedan S/ ' + (budget - item.p);
        global.Audio.play('correct');
        global.Feedback.confetti(24);
        global.State.logActivity({ id: 'money', area: 'matematica', skill: 'dinero', difficulty: 4, correct: true, attempts: 1, seconds: 0 });
        setTimeout(newRound, 1500);
      } else {
        fb.className = 'feedback-line retry';
        fb.textContent = budget + ' - ' + item.p + ' = ' + (budget - item.p);
        global.Audio.play('wrong');
        global.State.logActivity({ id: 'money', area: 'matematica', skill: 'dinero', difficulty: 4, correct: false, attempts: 1, seconds: 0 });
      }
      global.State.save();
    }

    newRound();
  }

  /* -------------------------------------------------------
     Widget principal para el área de matemática
  ------------------------------------------------------- */
  function renderAreaExtras(host, area) {
    if (area === 'matematica') {
      renderVisualAddition(host);
      renderTowerMath(host);
      renderMoney(host);
    }
    if (area === 'logica') renderPatternWidget(host);
    if (area === 'memoria') renderMemoryWidget(host);
    if (area === 'atencion') renderAttentionWidget(host);
  }

  function renderPatternWidget(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Completa el patrón</h3><div id="pw-body"></div>';
    host.appendChild(card);
    var seqs = [
      ['●', '▲', '●', '▲', '●', null, '●', '▲'],
      ['■', '■', '▲', '■', '■', '▲', null, '■'],
      ['1', '2', '3', '1', '2', '3', null, '1'],
      ['●', '●', '▲', '●', '●', '▲', '●', null]
    ];
    var idx = 0, answer = '';

    function paint() {
      var s = seqs[idx % seqs.length];
      answer = s.filter(function (x) { return x == null; });
      var correct = idx % 2 === 0 ? (s.indexOf(null) === 5 ? '●' : '●') : s[s.indexOf(null) - 1];
      correct = (function () {
        var p = s.indexOf(null);
        if (s[p - 3] === s[p]) return s[p - 3];
        if (s[p - 2] && s[p - 1]) return s[p - 2];
        return s[p - 1] || s[0];
      })();
      answer = correct;

      var body = el('pw-body');
      var cells = s.map(function (x) {
        return '<div class="seq-cell">' + (x == null ? '?' : x) + '</div>';
      }).join('');
      body.innerHTML = '<div class="seq-row">' + cells + '</div>';
      var ch = h('div', 'choices');
      ['●', '▲', '■', '★'].forEach(function (o) {
        var b = h('button', 'choice', '<span class="ch-key">' + o + '</span><span>' + o + '</span>');
        b.onclick = function () {
          if (o === answer) {
            b.classList.add('correct');
            global.Audio.play('correct');
            global.Feedback.confetti(16);
            global.State.logActivity({ id: 'pattern', area: 'logica', skill: 'patrones', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
            idx++;
            setTimeout(paint, 1200);
          } else {
            b.classList.add('wrong');
            global.Audio.play('wrong');
          }
          global.State.save();
        };
        ch.appendChild(b);
      });
      body.appendChild(ch);
      var nb = h('button', 'btn btn-ghost', 'Otro patrón');
      nb.onclick = function () { idx++; paint(); global.Audio.play('click'); };
      body.appendChild(nb);
    }
    paint();
  }

  function renderMemoryWidget(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Memoriza los objetos</h3><div id="mw-body"></div>';
    host.appendChild(card);
    var ITEMS = ['sun', 'fish', 'house', 'tree', 'planet', 'apple', 'bus', 'butterfly'];
    var round = 3;

    function paint() {
      var chosen = ITEMS.slice().sort(function () { return Math.random() - 0.5; }).slice(0, round);
      var body = el('mw-body');
      body.innerHTML = '<div class="object-row" id="mw-show" style="justify-content:center"></div>' +
        '<div class="actions" style="justify-content:center"><button class="btn btn-primary" id="mw-go">Ya la memoricé</button></div>' +
        '<div id="mw-ask"></div>';
      var show = el('mw-show');
      chosen.forEach(function (c) {
        var o = h('div', 'obj');
        o.style.width = '74px';
        o.style.height = '74px';
        o.innerHTML = Icons.art(c);
        show.appendChild(o);
      });
      el('mw-go').onclick = function () {
        show.innerHTML = '<p class="muted">¿Cuál de estos NO estaba?</p>';
        el('mw-go').remove();
        ask(chosen);
      };
      setTimeout(function () { if (el('mw-go')) el('mw-go').click(); }, 9000 + round * 1500);
    }

    function ask(chosen) {
      var missing = ITEMS.filter(function (i) { return chosen.indexOf(i) < 0; })[0] || 'cloud';
      var opts = [missing].concat(chosen.slice(0, 3)).sort(function () { return Math.random() - 0.5; }).slice(0, 4);
      if (opts.indexOf(missing) < 0) opts[0] = missing;
      var box = el('mw-ask');
      var ch = h('div', 'choices');
      opts.forEach(function (o) {
        var b = h('button', 'choice');
        b.innerHTML = '<span class="ch-img">' + Icons.art(o) + '</span>';
        b.onclick = function () {
          if (o === missing) {
            b.classList.add('correct');
            global.Audio.play('correct');
            global.Feedback.confetti(20);
            round = Math.min(6, round + 1);
            global.State.logActivity({ id: 'mem_widget', area: 'memoria', skill: 'memoriaVisual', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
            setTimeout(paint, 1400);
          } else {
            b.classList.add('wrong');
            global.Audio.play('wrong');
            global.State.logActivity({ id: 'mem_widget', area: 'memoria', skill: 'memoriaVisual', difficulty: 2, correct: false, attempts: 1, seconds: 0 });
          }
          global.State.save();
        };
        ch.appendChild(b);
      });
      box.appendChild(ch);
    }

    paint();
  }

  function renderAttentionWidget(host) {
    var card = h('div', 'card');
    card.innerHTML = '<h3 class="h3">Encuentra el objeto</h3><div id="atw-body"></div>';
    host.appendChild(card);

    function paint() {
      var target = ['sol', 'pez', 'casa', 'tree'][rand(0, 3)];
      var decoys = ITEMS_POOL().filter(function (x) { return x !== target; });
      var list = [target].concat(shuffle(decoys).slice(0, 5));
      var body = el('atw-body');
      body.innerHTML = '<p class="act-question">Toca el ' + nameOf(target) + '</p>';
      var row = h('div', 'object-row');
      row.style.justifyContent = 'center';
      shuffle(list).forEach(function (it) {
        var b = h('button', 'obj');
        b.style.width = '76px';
        b.style.height = '76px';
        b.innerHTML = Icons.art(it);
        b.setAttribute('aria-label', nameOf(it));
        b.onclick = function () {
          if (it === target) {
            global.Audio.play('correct');
            global.Feedback.confetti(16);
            global.State.logActivity({ id: 'attention', area: 'atencion', skill: 'atencion', difficulty: 2, correct: true, attempts: 1, seconds: 0 });
            setTimeout(paint, 1200);
          } else {
            global.Audio.play('wrong');
            b.classList.add('wrong');
          }
          global.State.save();
        };
        row.appendChild(b);
      });
      body.appendChild(row);
    }

    function ITEMS_POOL() { return ['sun', 'fish', 'house', 'tree', 'planet', 'apple', 'bus', 'butterfly']; }
    function nameOf(k) { return ({ sun: 'sol', fish: 'pez', house: 'casa', tree: 'árbol', planet: 'planeta', apple: 'manzana', bus: 'camión', butterfly: 'mariposa' })[k] || k; }
    function shuffle(a) { return a.slice().sort(function () { return Math.random() - 0.5; }); }

    paint();
  }

  global.MathLab = { renderAreaExtras: renderAreaExtras };
})(window);
