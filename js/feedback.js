/* =========================================================
   feedback.js - Motor de retroalimentación
   evaluateAnswer / showFeedback / giveHint / toast /
   confeti / mascota con expresiones.
   Nunca se limita a "correcto" o "incorrecto".
   ========================================================= */
(function (global) {
  'use strict';

  var PRAISE = [
    '¡Excelente descubrimiento!',
    '¡Muy bien! Lo lograste.',
    '¡Genial! Sigue así.',
    '¡Impresionante! Encontraste la respuesta.',
    '¡Lo conseguiste! Qué buen trabajo.',
    '¡Brillante! Eso estaba perfecto.'
  ];
  var SOFT = [
    'Vas muy bien. Revisa ese paso otra vez.',
    'Casi lo tienes. Observa con calma.',
    'Muy cerca. Prueba de otra manera.',
    'Buen intento. Lee la pregunta una vez más.'
  ];
  var RETRY = [
    'Todavía no. Observa nuevamente.',
    'No pasa nada. Intentémoslo otra vez.',
    'Aún no. Esta vez te doy una pista.',
    '¡Vamos otra vez! Cada intento enseña algo.'
  ];
  var HINTS = [
    'Piensa en la cantidad de objetos que ves.',
    'Elimina las opciones que claramente no son.',
    'Lee la instrucción en voz alta y presta atención a la última palabra.',
    'Recuerda lo que hicimos antes, se parece a eso.',
    'Mira el patrón: ¿qué cambia de una pieza a la otra?'
  ];

  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function evaluateAnswer(userAnswer, correctAnswer, opts) {
    opts = opts || {};
    var norm = function (v) {
      return String(v == null ? '' : v).toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    };
    if (opts.type === 'free') {
      return { correct: true, level: 'open', reason: 'open' };
    }
    if (opts.type === 'number') {
      var a = parseFloat(userAnswer), b = parseFloat(correctAnswer);
      var ok = !isNaN(a) && !isNaN(b) && Math.abs(a - b) < 0.0001;
      return { correct: ok, level: ok ? 'correct' : 'incorrect' };
    }
    if (opts.type === 'contains') {
      var ok2 = norm(userAnswer).indexOf(norm(correctAnswer)) >= 0 && norm(userAnswer).length > 0;
      return { correct: ok2, level: ok2 ? 'correct' : 'incorrect' };
    }
    var ok = norm(userAnswer) === norm(correctAnswer);
    return { correct: ok, level: ok ? 'correct' : 'incorrect' };
  }

  function messageFor(result, attempt) {
    if (result.correct) return pick(PRAISE);
    if (attempt === 1) return pick(SOFT);
    if (attempt === 2) return pick(RETRY);
    return pick(RETRY);
  }

  function hint() { return pick(HINTS); }

  /* ---------------- Toast ---------------- */
  var toastTimer = null;
  function toast(msg, ms) {
    var el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('show'); }, ms || 2600);
  }

  /* ---------------- Confeti ---------------- */
  function confetti(count) {
    if (global.State && global.State.get().settings.reduceMotion) return;
    var layer = document.getElementById('confetti-layer');
    if (!layer) return;
    var colors = ['#38bdf8', '#a855f7', '#fbbf24', '#fb7185', '#34d399', '#a3e635'];
    var n = count || 46;
    for (var i = 0; i < n; i++) {
      (function () {
        var d = document.createElement('span');
        d.className = 'confetti';
        d.style.left = Math.random() * 100 + 'vw';
        d.style.background = colors[Math.floor(Math.random() * colors.length)];
        d.style.animationDuration = (1.6 + Math.random() * 1.6) + 's';
        d.style.animationDelay = (Math.random() * .4) + 's';
        d.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
        layer.appendChild(d);
        setTimeout(function () { d.remove(); }, 4000);
      })();
    }
  }

  function starsBurst(x, y, n) {
    if (global.State && global.State.get().settings.reduceMotion) return;
    var layer = document.getElementById('confetti-layer');
    if (!layer) return;
    for (var i = 0; i < (n || 6); i++) {
      var s = document.createElement('span');
      s.className = 'stars-pop';
      s.textContent = '+1';
      s.style.left = (x + (Math.random() * 80 - 40)) + 'px';
      s.style.top = (y + (Math.random() * 40 - 20)) + 'px';
      s.style.animationDelay = (i * .07) + 's';
      layer.appendChild(s);
      setTimeout(function (el) { return function () { el.remove(); }; }(s), 1600);
    }
  }

  /* ---------------- Modal ---------------- */
  function modal(opts) {
    opts = opts || {};
    var root = document.getElementById('modal-root');
    if (!root) return null;
    root.innerHTML = '';
    var back = document.createElement('div');
    back.className = 'modal-backdrop';
    var box = document.createElement('div');
    box.className = 'modal';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');

    var html = '';
    if (opts.art) html += '<div class="modal-art">' + opts.art + '</div>';
    if (opts.title) html += '<h3>' + opts.title + '</h3>';
    if (opts.text) html += '<p class="muted">' + opts.text + '</p>';
    if (opts.html) html += opts.html;
    html += '<div class="actions center" id="modal-actions"></div>';
    box.innerHTML = html;
    back.appendChild(box);
    root.appendChild(back);

    var actions = box.querySelector('#modal-actions');
    (opts.buttons || [{ label: 'Cerrar', style: 'btn-primary' }]).forEach(function (b) {
      var btn = document.createElement('button');
      btn.className = 'btn ' + (b.style || 'btn-primary');
      btn.textContent = b.label;
      btn.addEventListener('click', function () {
        global.Audio && global.Audio.play('click');
        if (b.onClick) b.onClick();
        if (!b.keepOpen) close();
      });
      actions.appendChild(btn);
    });

    function close() { root.innerHTML = ''; document.removeEventListener('keydown', onKey); }
    function onKey(e) { if (e.key === 'Escape' && opts.dismissible !== false) close(); }
    document.addEventListener('keydown', onKey);

    var f = box.querySelector('button');
    if (f) f.focus();
    return { close: close, box: box };
  }

  function confirmBox(title, text, onYes, yesLabel, noLabel) {
    modal({
      title: title, text: text,
      buttons: [
        { label: noLabel || 'Cancelar', style: 'btn-ghost' },
        { label: yesLabel || 'Aceptar', style: 'btn-primary', onClick: onYes }
      ]
    });
  }

  /* ---------------- Mascota ---------------- */
  function mascotHTML(mood, text) {
    var face = {
      happy: '<path class="mouth" d="M48 82c6 7 18 7 24 0" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>',
      think: '<path class="mouth" d="M50 84h20" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>',
      wow: '<ellipse class="mouth" cx="60" cy="84" rx="9" ry="11" fill="#0f172a"/>',
      sad: '<path class="mouth" d="M48 88c6-8 18-8 24 0" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/>'
    };
    var base = Icons.art('mascot');
    var art = base.replace(/<path class="mouth"[^>]*\/>/, face[mood] || face.happy);
    return '<div class="mascot" id="live-mascot">' + art +
      '<div class="mascot-text">' + (text || '') + '</div></div>';
  }

  function say(text, mood, speakIt) {
    var host = document.getElementById('mascot-live');
    if (host) {
      host.innerHTML = mascotHTML(mood, text);
      var m = host.querySelector('.mascot');
      if (m) {
        m.classList.add('bounce');
        setTimeout(function () { m.classList.remove('bounce'); }, 700);
      }
    }
    if (speakIt !== false && global.Speech) global.Speech.speak(text);
    return text;
  }

  function celebrate(x, y) {
    confetti();
    if (typeof x === 'number') starsBurst(x, y, 6);
    global.Audio && global.Audio.play('complete');
  }

  global.Feedback = {
    evaluateAnswer: evaluateAnswer,
    messageFor: messageFor,
    hint: hint,
    praise: function () { return pick(PRAISE); },
    toast: toast,
    confetti: confetti,
    starsBurst: starsBurst,
    modal: modal,
    confirm: confirmBox,
    mascotHTML: mascotHTML,
    say: say,
    celebrate: celebrate
  };
})(window);
