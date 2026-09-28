/* =========================================================
   storage.js - Almacenamiento local
   - localStorage para estado pequeño y rápido
   - IndexedDB para proyectos, dibujos y páginas (blobs/dataURL)
   Nunca lanza excepciones: si algo falla, la app sigue.
   ========================================================= */
(function (global) {
  'use strict';

  var NS = 'mundo_crece_';
  var memoryFallback = {};   // usado si localStorage no existe
  var lsOK = (function () {
    try {
      var k = NS + '__t';
      global.localStorage.setItem(k, '1');
      global.localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function lsGet(key, def) {
    try {
      var raw = lsOK ? global.localStorage.getItem(NS + key) : memoryFallback[key];
      if (raw == null) return def;
      return JSON.parse(raw);
    } catch (e) { return def; }
  }

  function lsSet(key, value) {
    try {
      var raw = JSON.stringify(value);
      if (lsOK) global.localStorage.setItem(NS + key, raw);
      else memoryFallback[key] = raw;
      return true;
    } catch (e) { return false; }
  }

  function lsRemove(key) {
    try {
      if (lsOK) global.localStorage.removeItem(NS + key);
      delete memoryFallback[key];
    } catch (e) { /* ignorar */ }
  }

  function lsClearAll() {
    try {
      if (!lsOK) { memoryFallback = {}; return; }
      var kill = [];
      for (var i = 0; i < global.localStorage.length; i++) {
        var k = global.localStorage.key(i);
        if (k && k.indexOf(NS) === 0) kill.push(k);
      }
      kill.forEach(function (k) { global.localStorage.removeItem(k); });
    } catch (e) { /* ignorar */ }
  }

  /* ---------------- IndexedDB ---------------- */
  var DB_NAME = 'mundo_crece_db';
  var DB_VER = 1;
  var STORE = 'blobs';
  var dbPromise = null;

  function openDB() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!global.indexedDB) { reject(new Error('IndexedDB no disponible')); return; }
      var req = global.indexedDB.open(DB_NAME, DB_VER);
      req.onupgradeneeded = function (ev) {
        var db = ev.target.result;
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE, { keyPath: 'id' });
        }
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('No se pudo abrir IndexedDB')); };
    });
    // evita error no capturado en navegadores estrictos
    dbPromise.catch(function () { dbPromise = null; });
    return dbPromise;
  }

  function idbPut(record) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(record);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { reject(tx.error); };
      });
    }).catch(function () {
      // Respaldo en localStorage si IndexedDB falla
      var all = lsGet('__idb_fallback', {});
      all[record.id] = record;
      lsSet('__idb_fallback', all);
      return false;
    });
  }

  function idbGet(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).get(id);
        req.onsuccess = function () { resolve(req.result || null); };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () {
      var all = lsGet('__idb_fallback', {});
      return all[id] || null;
    });
  }

  function idbAll(prefix) {
    return openDB().then(function (db) {
      return new Promise(function (resolve, reject) {
        var tx = db.transaction(STORE, 'readonly');
        var req = tx.objectStore(STORE).getAll();
        req.onsuccess = function () {
          var rows = req.result || [];
          if (prefix) rows = rows.filter(function (r) { return String(r.id).indexOf(prefix) === 0; });
          resolve(rows);
        };
        req.onerror = function () { reject(req.error); };
      });
    }).catch(function () {
      var all = lsGet('__idb_fallback', {});
      var rows = Object.keys(all).map(function (k) { return all[k]; });
      if (prefix) rows = rows.filter(function (r) { return String(r.id).indexOf(prefix) === 0; });
      return rows;
    });
  }

  function idbDelete(id) {
    return openDB().then(function (db) {
      return new Promise(function (resolve) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).delete(id);
        tx.oncomplete = function () { resolve(true); };
        tx.onerror = function () { resolve(false); };
      });
    }).catch(function () {
      var all = lsGet('__idb_fallback', {});
      delete all[id];
      lsSet('__idb_fallback', all);
      return false;
    });
  }

  function storageInfo() {
    var bytes = 0;
    try {
      if (lsOK) {
        for (var i = 0; i < global.localStorage.length; i++) {
          var k = global.localStorage.key(i);
          if (k && k.indexOf(NS) === 0) bytes += (k.length + (global.localStorage.getItem(k) || '').length);
        }
      }
    } catch (e) { /* ignorar */ }
    return { local: lsOK, idb: !!global.indexedDB, bytes: bytes, kb: Math.round(bytes / 102.4) / 10 };
  }

  global.Storage = {
    get: lsGet,
    set: lsSet,
    remove: lsRemove,
    clear: lsClearAll,
    putBlob: idbPut,
    getBlob: idbGet,
    allBlobs: idbAll,
    deleteBlob: idbDelete,
    info: storageInfo
  };
})(window);
