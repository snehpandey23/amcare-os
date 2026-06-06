/**
 * Sprint A (P1-10): Homepage conversion instrumentation for GTM.
 * Events push to dataLayer — configure triggers in GTM-PLBD4TTQ.
 */
(function () {
  'use strict';

  function pushEvent(eventName, detail) {
    window.dataLayer = window.dataLayer || [];
    var payload = {
      event: eventName,
      page_path: window.location.pathname,
      sprint: 'A',
    };
    if (detail) {
      Object.keys(detail).forEach(function (key) {
        payload[key] = detail[key];
      });
    }
    window.dataLayer.push(payload);
  }

  function initHomepageTracking() {
    if (window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) {
      return;
    }

    document.addEventListener('click', function (e) {
      var el = e.target.closest('[data-siya-track]');
      if (!el) {
        var navBtn = e.target.closest('.nav-cta a.button, .nav-mobile a.button');
        if (navBtn && /carepatron/i.test(navBtn.href || '')) {
          pushEvent('nav_cta_primary_click', {
            cta_location: navBtn.closest('.nav-mobile') ? 'mobile-nav' : 'header-nav',
            link_url: navBtn.getAttribute('href') || '',
          });
        }
        return;
      }

      var track = el.getAttribute('data-siya-track');
      var location = el.getAttribute('data-siya-location') || 'unknown';
      var href = el.getAttribute('href') || '';

      if (track === 'screening-cta-click') {
        pushEvent('screening_cta_click', {
          cta_location: location,
          link_url: href,
        });
        return;
      }

      if (track === 'hero-cta-primary') {
        pushEvent('hero_cta_primary_click', { cta_location: location, link_url: href });
        return;
      }

      if (track === 'final-cta-primary') {
        pushEvent('final_cta_primary_click', { cta_location: location, link_url: href });
        return;
      }

      if (track === 'nav-cta-primary') {
        pushEvent('nav_cta_primary_click', { cta_location: location, link_url: href });
        return;
      }

      if (track === 'booking-cta') {
        pushEvent('homepage_booking_click', {
          cta_location: location,
          link_url: href,
        });
        return;
      }

      if (track === 'reviews-link') {
        pushEvent('reviews_link_click', {
          cta_location: location,
          link_url: href,
        });
      }
    }, false);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHomepageTracking);
  } else {
    initHomepageTracking();
  }
})();
