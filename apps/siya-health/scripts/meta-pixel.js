/**
 * Meta Pixel — standard Facebook install (init + PageView on every page load).
 * Pixel ID from window.__SIYA_META_PIXEL_ID (set by site-chrome) or fallback.
 */
(function () {
  'use strict';

  var PIXEL_ID = window.__SIYA_META_PIXEL_ID || '2150753979117600';
  var h = (window.location && window.location.hostname) || '';
  if (
    h === 'localhost' ||
    h === '127.0.0.1' ||
    h === '[::1]' ||
    /\.local$/.test(h)
  ) {
    return;
  }

  if (window.__siyaMetaPixelReady) return;
  window.__siyaMetaPixelReady = true;

  !(function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
  window.fbq('track', 'PageView');
})();
