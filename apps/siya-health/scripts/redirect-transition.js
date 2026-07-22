/**
 * Conversion redirect transition — preserves UTMs, fires analytics synchronously, then redirects.
 * Redirect view events MUST fire here (not deferred) so GTM has time before navigation.
 */
(function () {
  'use strict';

  var config = window.SIYA_REDIRECT_CONFIG;
  if (!config || !config.destination) return;

  var REDIRECT_VIEW_EVENTS = {
    secure_chat: 'secure_chat_redirect_view',
    adhd_walkthrough: 'adhd_walkthrough_redirect_view',
    adhd_evaluation: 'adhd_evaluation_redirect_view',
  };

  var DEBUG = window.location.search.indexOf('debug_tracking=1') !== -1;

  function pushDataLayerEvent(eventName, params) {
    if (!eventName) return;
    window.dataLayer = window.dataLayer || [];
    var payload = { event: eventName };
    if (params) {
      for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          payload[key] = params[key];
        }
      }
    }
    window.dataLayer.push(payload);
    if (DEBUG) {
      console.log('[Siya Redirect]', eventName, payload);
    }
  }

  var baseParams = {
    redirect_type: config.type,
    redirect_destination: config.destination,
    page_path: window.location.pathname,
    page_location: window.location.href,
    funnel: 'adhd_california',
    conversion_type: (config.type || 'redirect') + '_redirect',
  };

  /* Standardized conversion event (GTM Preview / new triggers) */
  var standardEvent = REDIRECT_VIEW_EVENTS[config.type];
  if (standardEvent) {
    pushDataLayerEvent(standardEvent, baseParams);
  }

  /* Legacy event name from SIYA_REDIRECT_CONFIG (existing GTM triggers) */
  if (config.analyticsEvent && config.analyticsEvent !== standardEvent) {
    pushDataLayerEvent(config.analyticsEvent, baseParams);
  }

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

  var link = document.getElementById('siya-redirect-fallback');
  if (link) link.href = dest.toString();

  /* 2000ms gives async GTM + consent tags time to fire before leaving for Spruce/CarePatron */
  var delay = typeof config.delayMs === 'number' ? config.delayMs : 2000;
  window.setTimeout(function () {
    window.location.replace(dest.toString());
  }, delay);
})();
