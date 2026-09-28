/* =========================================================
   audio.js - Sonidos con Web Audio API
   No necesita archivos externos: todo se sintetiza.
   ========================================================= */
(function (global) {
  'use strict';

  var ctx = null;
  var enabled = true;

  function ensure() {
    if (ctx) return ctx;
    try {
      var AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    } catch (e) { ctx = null; }
    return ctx;
  }

  function unlock() {
    var c = ensure();
    if (c && c.state === 'suspended') c.resume().catch(function () {});
  }
  ['pointerdown', 'keydown', 'touchstart'].forEach(function (ev) {
    document.addEventListener(ev, unlock, { once: true, passive: true });
  });

  function tone(freq, start, dur, type, vol) {
    var c = ensure();
    if (!c) return;
    try {
      var t0 = c.currentTime + (start || 0);
      var osc = c.createOscillator();
      var g = c.createGain();
      osc.type = type || 'sine';
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(vol || 0.16, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(c.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    } catch (e) { /* silenciar */ }
  }

  var SOUNDS = {
    correct: function () { tone(523.25, 0, .14, 'triangle', .18); tone(659.25, .1, .16, 'triangle', .18); tone(783.99, .2, .3, 'triangle', .18); },
    wrong: function () { tone(311.13, 0, .18, 'sawtooth', .10); tone(261.63, .13, .3, 'sawtooth', .10); },
    click: function () { tone(880, 0, .05, 'square', .07); },
    complete: function () { [523.25, 659.25, 783.99, 1046.5].forEach(function (f, i) { tone(f, i * .1, .25, 'triangle', .16); }); },
    achievement: function () { [659.25, 783.99, 987.77, 1318.5, 1567.98].forEach(function (f, i) { tone(f, i * .08, .3, 'sine', .15); }); },
    pop: function () { tone(660, 0, .07, 'sine', .12); tone(990, .05, .08, 'sine', .10); },
    error: function () { tone(200, 0, .25, 'square', .08); },
    hint: function () { tone(1046.5, 0, .12, 'sine', .12); tone(1318.5, .1, .2, 'sine', .12); },
    note: function (freq) { tone(freq, 0, .5, 'triangle', .18); },
    drop: function () { tone(440, 0, .08, 'square', .08); tone(587, .06, .1, 'square', .08); },
    start: function () { tone(392, 0, .12, 'triangle', .14); tone(523.25, .1, .25, 'triangle', .14); }
  };

  function play(name) {
    if (!enabled) return;
    var fn = SOUNDS[name];
    if (fn) { try { fn(); } catch (e) { /* ignorar */ } }
  }

  function setEnabled(v) {
    enabled = !!v;
    if (global.State) {
      var s = global.State.get();
      s.settings.sound = enabled;
      global.State.save(true);
    }
  }

  function isEnabled() { return enabled; }

  /* Notas musicales para el piano */
  var NOTES = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00,
    'A4': 440.00, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33, 'E5': 659.25
  };

  function playNote(name) {
    if (!enabled) return;
    var f = NOTES[name];
    if (f) tone(f, 0, .55, 'triangle', .18);
  }

  global.Audio = {
    play: play,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    playNote: playNote,
    NOTES: NOTES,
    unlock: unlock
  };
})(window);
