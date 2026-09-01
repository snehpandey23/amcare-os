/**
 * Google Ads ADHD landing page — scroll depth + CTA click tracking via gtag.
 */
(function () {
  'use strict';

  var host = String((window.location && window.location.hostname) || '').toLowerCase();
  if (!(host === 'siya.health' || /\.siya\.health$/.test(host))) {
    return;
  }

  var LANDING_PATHS = {
    '/adhd-evaluation-texas': true,
    '/adhd-evaluation-california': true,
  };
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var isLanding =
    LANDING_PATHS[path] ||
    path.endsWith('/adhd-evaluation-texas.html') ||
    path.endsWith('/adhd-evaluation-california.html') ||
    document.body.classList.contains('siya-landing-page');

  if (!isLanding) return;

  function gtagEvent(eventName, params) {
    if (typeof gtag !== 'function') return;
    var payload = { page_path: path, landing: 'google-ads' };
    if (params) {
      Object.keys(params).forEach(function (key) {
        payload[key] = params[key];
      });
    }
    gtag('event', eventName, payload);
  }

  function initScrollTracking() {
    var fired = { 50: false, 90: false };
    function onScroll() {
      var doc = document.documentElement;
      var scrollTop = window.scrollY || doc.scrollTop;
      var height = doc.scrollHeight - doc.clientHeight;
      if (height <= 0) return;
      var pct = (scrollTop / height) * 100;
      if (!fired[50] && pct >= 50) {
        fired[50] = true;
        gtagEvent('scroll_50');
      }
      if (!fired[90] && pct >= 90) {
        fired[90] = true;
        gtagEvent('scroll_90');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var CTA_EVENT_MAP = {
    'start-screening': 'click_start_screening',
    'book-walkthrough': 'click_book_walkthrough',
    'start-199-evaluation': 'click_start_199_evaluation',
    'secure-chat': 'click_secure_chat',
    'learn-more': 'click_learn_more',
  };

  function initClickTracking() {
    document.addEventListener(
      'click',
      function (e) {
        var el = e.target.closest('[data-cta], [data-siya-track]');
        if (!el) return;
        var cta = el.getAttribute('data-cta');
        var track = el.getAttribute('data-siya-track') || (cta && CTA_EVENT_MAP[cta]);
        var location = el.getAttribute('data-siya-location') || cta || 'unknown';
        var href = el.getAttribute('href') || '';

        if (track) {
          gtagEvent(track, {
            cta_location: location,
            link_url: href,
            data_cta: cta || undefined,
          });
        }
      },
      false
    );
  }

  function init() {
    initScrollTracking();
    initClickTracking();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
