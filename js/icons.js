/* =========================================================
   icons.js - Biblioteca de iconos SVG en línea
   Se usan en lugar de imágenes externas para que la
   aplicación funcione sin conexión.
   ========================================================= */
(function (global) {
  'use strict';

  var P = {
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    create: '<path d="M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5z"/>',
    write: '<path d="M4 20h4l10-10a2.8 2.8 0 10-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    read: '<path d="M4 5h7v15H4z"/><path d="M13 5h7v15h-7z"/><path d="M11 5v15"/>',
    math: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 15h8M12 7v4M10 13v4M14 13v4"/>',
    think: '<path d="M12 3a6 6 0 00-4 10.5V17h8v-3.5A6 6 0 0012 3z"/><path d="M9.5 20h5"/><path d="M10 10l1.5 1.5L14 9"/>',
    science: '<path d="M10 3h4"/><path d="M11 3v6L5.5 18A2 2 0 007.2 21h9.6a2 2 0 001.7-3L13 9V3"/><path d="M8 15h8"/>',
    music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
    games: '<rect x="3" y="7" width="18" height="10" rx="5"/><path d="M8 12h2M9 11v2"/><circle cx="15.5" cy="11.5" r="1"/><circle cx="17.5" cy="13.5" r="1"/>',
    build: '<rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><rect x="8" y="3" width="8" height="8" rx="1.5"/>',
    code: '<path d="M9 7l-5 5 5 5"/><path d="M15 7l5 5-5 5"/><path d="M13 4l-2 16"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.5A3.9 3.9 0 0112 7a3.9 3.9 0 017 3.5C19 15.6 12 20 12 20z"/>',
    missions: '<path d="M5 21V4"/><path d="M5 4h11l-2 4 2 4H5"/><circle cx="5" cy="3" r="1.6"/>',
    trophy: '<path d="M7 4h10v5a5 5 0 01-10 0z"/><path d="M7 6H4v2a3 3 0 003 3"/><path d="M17 6h3v2a3 3 0 01-3 3"/><path d="M10 14h4l.5 5h-5z"/><path d="M8 21h8"/>',
    folder: '<path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>',
    parent: '<circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0112 0"/><circle cx="17.5" cy="11" r="2.5"/><path d="M14 20a4.5 4.5 0 017 0"/>',
    teacher: '<path d="M3 8l9-4 9 4-9 4z"/><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9L7 7M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1"/>',
    pencil: '<path d="M4 20h4l10-10a2.8 2.8 0 10-4-4L4 16z"/>',
    marker: '<path d="M5 19h14"/><path d="M7 15l8-8 3 3-8 8H7z"/><path d="M14 5l3 3"/>',
    eraser: '<path d="M8 19h11"/><path d="M15.5 4.5l4 4-8 8h-5l-2.5-2.5z"/><path d="M9 8l5 5"/>',
    undo: '<path d="M4 10h9a5 5 0 010 10h-3"/><path d="M8 6l-4 4 4 4"/>',
    redo: '<path d="M20 10h-9a5 5 0 000 10h3"/><path d="M16 6l4 4-4 4"/>',
    trash: '<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/>',
    save: '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4"/><path d="M8 20v-6h8v6"/>',
    play: '<path d="M7 4l12 8-12 8z"/>',
    speaker: '<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 8a5 5 0 010 8"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><path d="M12 18v3"/>',
    repeat: '<path d="M4 10h11a4 4 0 010 8h-2"/><path d="M8 6l-4 4 4 4"/><path d="M20 14H9a4 4 0 010-8h2"/><path d="M16 18l4-4-4-4"/>',
    camera: '<rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="12" cy="13.5" r="3.5"/><path d="M8 7l1.5-3h5L16 7"/>',
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    back: '<path d="M15 18l-6-6 6-6"/>',
    lightbulb: '<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 00-3.5 10.8V16h7v-2.2A6 6 0 0012 3z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    shapes: '<circle cx="8" cy="8" r="4.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><path d="M8 14l4 7H4z"/>',
    puzzle: '<path d="M10 4h4v2.5a2 2 0 100 3.5V12h2.5a2 2 0 103.5 0H22v4h-2.5a2 2 0 100 3.5V22h-6v-2.5a2 2 0 10-3.5 0V22H4v-6h2.5a2 2 0 100-3.5H9V6a2 2 0 110-2z"/>',
    robot: '<rect x="5" y="8" width="14" height="11" rx="3"/><circle cx="9.5" cy="13" r="1.6"/><circle cx="14.5" cy="13" r="1.6"/><path d="M12 8V5"/><circle cx="12" cy="4" r="1.5"/><path d="M3 12v3M21 12v3"/>',
    paint: '<rect x="4" y="4" width="16" height="16" rx="3"/><circle cx="9" cy="9" r="1.5"/><circle cx="15" cy="9" r="1.5"/><circle cx="9" cy="15" r="1.5"/>',
    book: '<path d="M4 5a2 2 0 012-2h13v18H6a2 2 0 01-2-2z"/><path d="M8 3v18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    lock: '<rect x="5" y="10" width="14" height="10" rx="2.5"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    refresh: '<path d="M20 11a8 8 0 10-2 6"/><path d="M20 4v7h-7"/>'
  };

  function svg(name, cls) {
    var body = P[name] || P.grid;
    return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + body + '</svg>';
  }

  /* --- Ilustraciones vectoriales --- */
  var ART = {
    butterfly: '<svg viewBox="0 0 120 100" aria-hidden="true"><g fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round"><path d="M60 30v42"/><path d="M60 30l-6-12M60 30l6-12"/><circle cx="60" cy="24" r="5" fill="#0f172a"/><path d="M60 34c-8-16-30-24-40-14s2 32 20 34 22-14 20-20z" fill="#a855f7"/><path d="M60 34c8-16 30-24 40-14s-2 32-20 34-22-14-20-20z" fill="#38bdf8"/><path d="M60 56c-7 12-24 18-32 10s0-24 15-25 18 9 17 15z" fill="#fb7185"/><path d="M60 56c7 12 24 18 32 10s0-24-15-25-18 9-17 15z" fill="#fbbf24"/></g></svg>',
    mascot: '<svg viewBox="0 0 120 120" aria-hidden="true"><g><ellipse cx="60" cy="66" rx="40" ry="38" fill="#38bdf8"/><ellipse cx="60" cy="74" rx="26" ry="24" fill="#e0f2fe"/><circle cx="46" cy="58" r="9" fill="#fff"/><circle cx="74" cy="58" r="9" fill="#fff"/><circle class="pupil" cx="46" cy="59" r="4.5" fill="#0f172a"/><circle class="pupil" cx="74" cy="59" r="4.5" fill="#0f172a"/><path d="M34 30c4-10 14-14 20-8" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M86 30c-4-10-14-14-20-8" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/><path class="mouth" d="M48 82c6 7 18 7 24 0" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/><circle cx="34" cy="74" r="6" fill="#fb7185" opacity=".7"/><circle cx="86" cy="74" r="6" fill="#fb7185" opacity=".7"/></g></svg>',
    logo: '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="#e0f2fe" stroke="#38bdf8" stroke-width="5"/><path d="M60 84V46" stroke="#059669" stroke-width="7" stroke-linecap="round"/><path d="M60 54c-14-2-22-12-24-24 14 0 24 8 26 20z" fill="#34d399"/><path d="M60 62c14-2 22-12 24-24-14 0-24 8-26 20z" fill="#a3e635"/><circle cx="43" cy="88" r="9" fill="#fbbf24"/><circle cx="77" cy="88" r="9" fill="#a855f7"/><circle cx="60" cy="96" r="7" fill="#fb7185"/></svg>',
    rest: '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="46" fill="#fef3c7"/><circle cx="60" cy="60" r="26" fill="#fbbf24"/><g stroke="#f59e0b" stroke-width="5" stroke-linecap="round"><path d="M60 8v10M60 102v10M8 60h10M102 60h10M23 23l7 7M90 90l7 7M97 23l-7 7M30 90l-7 7"/></g></svg>',
    home: '<svg viewBox="0 0 120 120"><path d="M20 58L60 24l40 34" stroke="#0284c7" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M30 56v40h60V56" fill="#e0f2fe" stroke="#0284c7" stroke-width="7" stroke-linejoin="round"/><rect x="52" y="72" width="18" height="24" fill="#fbbf24"/></svg>',
    city: '<svg viewBox="0 0 160 120"><rect x="10" y="60" width="34" height="50" fill="#38bdf8"/><rect x="50" y="40" width="30" height="70" fill="#a855f7"/><rect x="86" y="55" width="34" height="55" fill="#fb7185"/><rect x="126" y="70" width="26" height="40" fill="#34d399"/><g fill="#fff"><rect x="18" y="70" width="8" height="8"/><rect x="30" y="70" width="8" height="8"/><rect x="58" y="50" width="8" height="8"/><rect x="70" y="50" width="8" height="8"/><rect x="94" y="65" width="8" height="8"/><rect x="106" y="65" width="8" height="8"/></g></svg>',
    robot: '<svg viewBox="0 0 120 120"><rect x="26" y="38" width="68" height="54" rx="14" fill="#94a3b8"/><rect x="40" y="52" width="40" height="20" rx="8" fill="#0f172a"/><circle cx="52" cy="62" r="6" fill="#38bdf8"/><circle cx="70" cy="62" r="6" fill="#38bdf8"/><path d="M60 38V24" stroke="#64748b" stroke-width="5"/><circle cx="60" cy="20" r="7" fill="#fb7185"/><rect x="12" y="54" width="14" height="26" rx="6" fill="#64748b"/><rect x="94" y="54" width="14" height="26" rx="6" fill="#64748b"/></svg>',
    book: '<svg viewBox="0 0 120 120"><path d="M14 26h40v70H14z" fill="#38bdf8"/><path d="M66 26h40v70H66z" fill="#a855f7"/><path d="M54 26h12v70H54z" fill="#e2e8f0"/><g stroke="#fff" stroke-width="5" stroke-linecap="round"><path d="M22 44h24M22 58h24M22 72h24M74 44h24M74 58h24M74 72h24"/></g></svg>',
    planet: '<svg viewBox="0 0 140 120"><circle cx="70" cy="58" r="34" fill="#f472b6"/><ellipse cx="70" cy="60" rx="56" ry="16" fill="none" stroke="#fbbf24" stroke-width="7" transform="rotate(-18 70 60)"/><circle cx="58" cy="50" r="7" fill="#db2777"/><circle cx="82" cy="66" r="5" fill="#db2777"/></svg>',
    tree: '<svg viewBox="0 0 100 120"><rect x="42" y="70" width="16" height="42" fill="#a16207"/><circle cx="50" cy="48" r="34" fill="#22c55e"/><circle cx="30" cy="60" r="20" fill="#16a34a"/><circle cx="70" cy="60" r="20" fill="#16a34a"/><circle cx="34" cy="42" r="7" fill="#ef4444"/><circle cx="66" cy="38" r="7" fill="#ef4444"/></svg>',
    house: '<svg viewBox="0 0 120 120"><path d="M14 58L60 20l46 38" fill="#fb7185"/><rect x="26" y="56" width="68" height="48" fill="#fde68a"/><rect x="50" y="74" width="22" height="30" fill="#0284c7"/><rect x="32" y="66" width="16" height="16" fill="#38bdf8"/><rect x="76" y="66" width="16" height="16" fill="#38bdf8"/></svg>',
    bus: '<svg viewBox="0 0 140 100"><rect x="10" y="20" width="120" height="54" rx="12" fill="#fbbf24"/><rect x="20" y="30" width="24" height="20" rx="4" fill="#e0f2fe"/><rect x="52" y="30" width="24" height="20" rx="4" fill="#e0f2fe"/><rect x="84" y="30" width="24" height="20" rx="4" fill="#e0f2fe"/><circle cx="38" cy="78" r="12" fill="#334155"/><circle cx="104" cy="78" r="12" fill="#334155"/><circle cx="38" cy="78" r="5" fill="#94a3b8"/><circle cx="104" cy="78" r="5" fill="#94a3b8"/></svg>',
    apple: '<svg viewBox="0 0 100 100"><path d="M50 30c-16-10-34 0-34 22 0 20 14 38 22 38 6 0 8-4 12-4s6 4 12 4c8 0 22-18 22-38 0-22-18-32-34-22z" fill="#ef4444"/><path d="M50 30c0-10 6-16 14-18" stroke="#65a30d" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M52 24c8-4 16-2 18 4-8 4-16 2-18-4z" fill="#22c55e"/></svg>',
    fish: '<svg viewBox="0 0 140 100"><ellipse cx="66" cy="50" rx="44" ry="30" fill="#38bdf8"/><path d="M110 50l24-18v36z" fill="#0284c7"/><circle cx="46" cy="42" r="7" fill="#fff"/><circle cx="46" cy="42" r="3.5" fill="#0f172a"/><path d="M70 34c8 6 8 26 0 32" stroke="#0284c7" stroke-width="5" fill="none"/></svg>',
    sun: '<svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="26" fill="#fbbf24"/><g stroke="#f59e0b" stroke-width="6" stroke-linecap="round"><path d="M60 10v14M60 96v14M10 60h14M96 60h14M24 24l10 10M86 86l10 10M96 24L86 34M34 86l-10 10"/></g></svg>',
    cloud: '<svg viewBox="0 0 140 100"><path d="M40 78a24 24 0 010-48 30 30 0 0158-8 22 22 0 016 56z" fill="#e2e8f0"/><g stroke="#60a5fa" stroke-width="6" stroke-linecap="round"><path d="M45 86l-6 12M70 86l-6 12M95 86l-6 12"/></g></svg>'
  };

  function art(name) { return ART[name] || ART.logo; }

  /* --- Caras de emociones --- */
  function face(emotion) {
    var mouth = {
      feliz: '<path d="M38 62c6 10 22 10 28 0" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>',
      triste: '<path d="M38 72c6-10 22-10 28 0" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>',
      enojado: '<path d="M38 70c6-8 22-8 28 0" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>',
      asustado: '<ellipse cx="52" cy="68" rx="9" ry="12" fill="#0f172a"/>',
      sorprendido: '<circle cx="52" cy="68" r="9" fill="#0f172a"/>',
      preocupado: '<path d="M38 70c6-6 22-6 28 0" stroke="#0f172a" stroke-width="5" fill="none" stroke-linecap="round"/>'
    };
    var brows = {
      enojado: '<path d="M34 36l16 8M70 36l-16 8" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>',
      triste: '<path d="M34 44l16-6M70 44l-16-6" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>',
      preocupado: '<path d="M34 42l16-4M70 42l-16-4" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>',
      asustado: '<path d="M32 34l18 6M72 34l-18 6" stroke="#0f172a" stroke-width="5" stroke-linecap="round"/>'
    };
    return '<svg viewBox="0 0 104 100" aria-hidden="true"><circle cx="52" cy="52" r="44" fill="#fde68a"/>' +
      (brows[emotion] || '') +
      '<circle cx="38" cy="50" r="6" fill="#0f172a"/><circle cx="66" cy="50" r="6" fill="#0f172a"/>' +
      (mouth[emotion] || mouth.feliz) + '</svg>';
  }

  function charAvatar(kind) {
    var colors = { lobo: '#94a3b8', gato: '#f59e0b', rana: '#34d399', pajaro: '#38bdf8', conejo: '#f9a8d4', robot: '#a78bfa' };
    var c = colors[kind] || '#38bdf8';
    var ears = {
      lobo: '<path d="M22 30l10 16 6-18z" fill="' + c + '"/><path d="M82 30L72 46l-6-18z" fill="' + c + '"/>',
      gato: '<path d="M24 34l8-18 12 14z" fill="' + c + '"/><path d="M80 34l-8-18-12 14z" fill="' + c + '"/>',
      rana: '<circle cx="30" cy="26" r="13" fill="' + c + '"/><circle cx="74" cy="26" r="13" fill="' + c + '"/>',
      pajaro: '<path d="M52 26c-6-12-20-16-28-8 8 2 14 8 16 16z" fill="' + c + '"/>',
      conejo: '<ellipse cx="36" cy="20" rx="8" ry="20" fill="' + c + '"/><ellipse cx="68" cy="20" rx="8" ry="20" fill="' + c + '"/>',
      robot: '<rect x="44" y="10" width="16" height="16" rx="4" fill="' + c + '"/>'
    };
    return '<svg viewBox="0 0 104 100" aria-hidden="true">' + (ears[kind] || ears.gato) +
      '<circle cx="52" cy="58" r="36" fill="' + c + '"/>' +
      '<circle cx="40" cy="54" r="6" fill="#0f172a"/><circle cx="64" cy="54" r="6" fill="#0f172a"/>' +
      '<path d="M44 70c4 5 12 5 16 0" stroke="#0f172a" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
  }

  global.Icons = { svg: svg, art: art, face: face, avatar: charAvatar, has: function (n) { return !!P[n]; } };
})(window);
