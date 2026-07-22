/**
 * Load LeadConnector chat after first scroll or timeout — reduces overlap with hero CTAs.
 */
(function () {
  var SRC = 'https://widgets.leadconnectorhq.com/loader.js';
  var RES = 'https://widgets.leadconnectorhq.com/chat-widget/loader.js';
  var WIDGET_ID = '69be9ab3db1480f6799cdd18';

  function loadChat() {
    if (window.__siyaChatLoaded) return;
    window.__siyaChatLoaded = true;
    var s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    s.setAttribute('data-resources-url', RES);
    s.setAttribute('data-widget-id', WIDGET_ID);
    document.body.appendChild(s);
  }

  var triggered = false;
  function trigger() {
    if (triggered) return;
    triggered = true;
    loadChat();
    window.removeEventListener('scroll', onScroll);
  }

  function onScroll() {
    if (window.scrollY > 100) trigger();
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.setTimeout(trigger, 10000);
})();
