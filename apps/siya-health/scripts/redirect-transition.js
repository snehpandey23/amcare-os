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

  /* Page-view conversion events are fired by siya-tracking.js (adhd_walkthrough_redirect_view, etc.) */

  var link = document.getElementById('siya-redirect-fallback');
  if (link) link.href = dest.toString();

  var delay = typeof config.delayMs === 'number' ? config.delayMs : 1500;
  window.setTimeout(function () {
    window.location.replace(dest.toString());
  }, delay);
})();
