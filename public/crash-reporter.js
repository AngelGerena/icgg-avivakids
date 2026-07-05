/* Shows the real error on screen instead of a blank page. Loads before the app
   bundle so it also catches load/parse errors (helps diagnose device-specific crashes). */
(function () {
  function show(msg) {
    try {
      var el = document.getElementById('__crash');
      if (!el) {
        el = document.createElement('div');
        el.id = '__crash';
        el.style.cssText =
          'position:fixed;left:0;top:0;right:0;bottom:0;background:#fff;color:#b00020;' +
          'font:13px/1.5 -apple-system,system-ui,sans-serif;padding:18px;z-index:2147483647;' +
          'white-space:pre-wrap;word-break:break-word;overflow:auto';
        (document.body || document.documentElement).appendChild(el);
      }
      el.textContent = 'Aviva Kids - error (toma una captura y compartela):\n\n' + msg;
    } catch (e) {}
  }
  window.addEventListener('error', function (e) {
    var m = (e && (e.message || (e.error && (e.error.stack || e.error.message)))) || 'error';
    if (e && e.filename) m += '\n@ ' + e.filename + ':' + e.lineno + ':' + e.colno;
    show(String(m));
  });
  window.addEventListener('unhandledrejection', function (e) {
    show('promise: ' + ((e.reason && (e.reason.stack || e.reason.message)) || e.reason));
  });
})();
