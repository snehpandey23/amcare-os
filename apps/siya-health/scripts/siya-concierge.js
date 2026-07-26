/**
 * Siya AI Concierge — sitewide embed loader (iframe → siya-guide.vercel.app/embed)
 */
(function () {
  if (window.__siyaConciergeLoaded) return;
  window.__siyaConciergeLoaded = true;

  var ORIGIN = 'https://siya-guide.vercel.app';
  var iframe = document.createElement('iframe');
  iframe.src = ORIGIN + '/embed';
  iframe.title = 'Siya AI Concierge';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.cssText =
    'position:fixed;right:0;bottom:0;width:360px;height:88px;border:0;z-index:2147483000;background:transparent;color-scheme:light;';

  function resize(open) {
    if (open) {
      iframe.style.width = Math.min(440, window.innerWidth) + 'px';
      iframe.style.height = Math.min(720, window.innerHeight - 12) + 'px';
    } else {
      iframe.style.width = Math.min(360, window.innerWidth) + 'px';
      iframe.style.height = '88px';
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data || {};
    if (data.source !== 'siya-concierge') return;
    resize(!!data.open);
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(iframe);
  });
  if (document.readyState !== 'loading') {
    document.body.appendChild(iframe);
  }
})();
