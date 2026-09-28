/* =========================================================
   speech.js - Web Speech API
   - speak(): sintesis de voz (texto a voz)
   - listen(): reconocimiento de voz (voz a texto)
   Si el navegador no lo soporta, ofrece alternativas.
   ========================================================= */
(function (global) {
  'use strict';

  var synth = global.speechSynthesis || null;
  var Rec = global.SpeechRecognition || global.webkitSpeechRecognition || null;

  var voiceEnabled = true;
  var currentVoice = null;
  var listening = false;

  function speakSupported() { return !!synth; }
  function listenSupported() { return !!Rec; }

  function pickVoice() {
    if (!synth) return null;
    var voices = [];
    try { voices = synth.getVoices() || []; } catch (e) { voices = []; }
    if (!voices.length) return null;
    var pref = ['es', 'es-', 'es_'];
    for (var i = 0; i < voices.length; i++) {
      var v = voices[i];
      var lang = (v.lang || '').toLowerCase();
      if (pref.some(function (p) { return lang.indexOf(p) === 0; })) { currentVoice = v; return v; }
    }
    currentVoice = voices[0];
    return currentVoice;
  }

  if (synth) {
    pickVoice();
    try { synth.onvoiceschanged = pickVoice; } catch (e) { /* ignorar */ }
  }

  function speak(text, opts) {
    opts = opts || {};
    if (!synth) {
      if (opts.onEnd) setTimeout(opts.onEnd, 10);
      return false;
    }
    if (!voiceEnabled && !opts.force) {
      if (opts.onEnd) setTimeout(opts.onEnd, 10);
      return false;
    }
    try {
      synth.cancel();
      var u = new SpeechSynthesisUtterance(String(text));
      var v = currentVoice || pickVoice();
      if (v) u.voice = v;
      u.lang = (v && v.lang) || 'es-ES';
      var st = global.State ? global.State.get() : null;
      u.rate = opts.rate || (st ? st.settings.rate : 0.95);
      u.pitch = opts.pitch || 1.05;
      u.volume = 1;
      if (opts.onEnd) u.onend = opts.onEnd;
      if (opts.onError) u.onerror = opts.onError;
      synth.speak(u);
      return true;
    } catch (e) {
      if (opts.onEnd) setTimeout(opts.onEnd, 10);
      return false;
    }
  }

  function stopSpeaking() {
    try { if (synth) synth.cancel(); } catch (e) { /* ignorar */ }
  }

  /**
   * listen({ onResult(text, isFinal), onEnd(err), lang })
   * Devuelve un objeto con .stop()
   */
  function listen(opts) {
    opts = opts || {};
    if (!Rec) {
      if (opts.onError) opts.onError('unsupported');
      return { stop: function () {}, supported: false };
    }
    var rec = new Rec();
    rec.lang = opts.lang || 'es-ES';
    rec.interimResults = opts.interim !== false;
    rec.maxAlternatives = 1;
    rec.continuous = false;

    var done = false;
    rec.onstart = function () { listening = true; if (opts.onStart) opts.onStart(); };
    rec.onresult = function (ev) {
      var txt = '';
      var final = false;
      for (var i = ev.resultIndex; i < ev.results.length; i++) {
        txt += ev.results[i][0].transcript;
        if (ev.results[i].isFinal) final = true;
      }
      if (opts.onResult) opts.onResult(txt.trim(), final);
    };
    rec.onerror = function (ev) {
      done = true; listening = false;
      if (opts.onError) opts.onError(ev && ev.error ? ev.error : 'error');
    };
    rec.onend = function () {
      listening = false;
      if (!done && opts.onEnd) opts.onEnd(null);
      done = true;
    };

    try { rec.start(); }
    catch (e) { if (opts.onError) opts.onError('busy'); }

    return {
      supported: true,
      stop: function () { try { rec.stop(); } catch (e) { /* ignorar */ } }
    };
  }

  function isListening() { return listening; }

  /**
   * listenOnce(): promesa con el primer resultado final.
   */
  function listenOnce(timeoutMs) {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var h = setTimeout(function () {
        if (!settled) { settled = true; resolve({ text: '', timeout: true }); }
      }, timeoutMs || 8000);
      listen({
        onResult: function (text, isFinal) {
          if (isFinal && !settled) { settled = true; clearTimeout(h); resolve({ text: text }); }
        },
        onError: function (err) {
          if (!settled) { settled = true; clearTimeout(h); reject(new Error(err)); }
        },
        onEnd: function () {
          if (!settled) { settled = true; clearTimeout(h); resolve({ text: '' }); }
        }
      });
    });
  }

  /**
   * Compara lo dicho con la palabra esperada de forma orientativa.
   * Devuelve {score 0..1, ok, heard}
   */
  function compareWord(heard, expected) {
    function norm(s) {
      return String(s || '').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
    }
    var a = norm(heard), b = norm(expected);
    if (!b) return { score: 0, ok: false, heard: heard };
    if (!a) return { score: 0, ok: false, heard: heard };
    if (a === b) return { score: 1, ok: true, heard: heard };
    if (a.indexOf(b) >= 0 || b.indexOf(a) >= 0) return { score: 0.85, ok: true, heard: heard };

    // Similitud de Jaccard por caracteres de 2 (bigramas)
    function bigrams(s) {
      var set = {};
      for (var i = 0; i < s.length - 1; i++) { set[s.substr(i, 2)] = 1; }
      return set;
    }
    var A = bigrams(a), B = bigrams(b);
    var keysA = Object.keys(A), keysB = Object.keys(B);
    var inter = 0;
    keysA.forEach(function (k) { if (B[k]) inter++; });
    var union = keysA.length + keysB.length - inter;
    var score = union ? inter / union : 0;
    return { score: score, ok: score >= 0.5, heard: heard };
  }

  function setVoiceEnabled(v) {
    voiceEnabled = !!v;
    if (!voiceEnabled) stopSpeaking();
    if (global.State) {
      var s = global.State.get();
      s.settings.voice = voiceEnabled;
      global.State.save(true);
    }
  }
  function isVoiceEnabled() { return voiceEnabled; }

  function capability() {
    return {
      tts: speakSupported(),
      asr: listenSupported(),
      lang: 'es-ES'
    };
  }

  global.Speech = {
    speak: speak,
    stop: stopSpeaking,
    listen: listen,
    listenOnce: listenOnce,
    compareWord: compareWord,
    isListening: isListening,
    setVoiceEnabled: setVoiceEnabled,
    isVoiceEnabled: isVoiceEnabled,
    speakSupported: speakSupported,
    listenSupported: listenSupported,
    capability: capability
  };
})(window);
