/**
 * Conversion redirect transition — preserves UTMs, fires analytics, redirects to external booking.
 */
(function () {
  'use strict';

  var config = window.SIYA_REDIRECT_CONFIG;
  if (!config || !config.destination) return;

  var params = new URLSearchParams(window.location.search);
  var dest;
  try {
    dest = new URL(config.destination);
  } catch (e) {
    return;
  }

  params.forEach(function (value, key) {
    if (!dest.searchParams.has(key)) dest.searchParams.set(key, value);
  });

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: config.analyticsEvent || 'siya_redirect_transition',
    redirect_type: config.type,
    redirect_destination: config.destination,
    page_path: window.location.pathname,
  });

  var link = document.getElementById('siya-redirect-fallback');
  if (link) link.href = dest.toString();

  var delay = typeof config.delayMs === 'number' ? config.delayMs : 1500;
  window.setTimeout(function () {
    window.location.replace(dest.toString());
  }, delay);
})();
