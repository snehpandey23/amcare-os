/**
 * Siya Health sitewide dataLayer tracking — works with GTM (GTM-PLBD4TTQ).
 * Fires funnel conversion events for ADHD landing, redirect, and screening flows.
 */
(function () {
  'use strict';

  window.dataLayer = window.dataLayer || [];

  var DEBUG = window.location.search.indexOf('debug_tracking=1') !== -1;

  function pushEvent(name, params) {
    if (!name) return;
    var payload = { event: name };
    if (params) {
      for (var key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
          payload[key] = params[key];
        }
      }
    }
    window.dataLayer.push(payload);
    if (DEBUG) {
      console.log('[Siya Tracking]', name, params || {});
    }
  }

  window.siyaTrack = function (eventName, eventParams) {
    pushEvent(eventName, eventParams);
  };

  /* Redirect page view conversions fire synchronously in redirect-transition.js
     (must not be deferred — GTM needs time before external redirect). */

  /* Dedicated post-screening results pageview */
  if (window.location.pathname.indexOf('/adhd-screening-results') !== -1) {
    pushEvent('adhd_screening_results_view', {
      page_path: window.location.pathname,
      page_location: window.location.href,
      funnel: 'adhd_california',
      query_string: window.location.search || '',
    });
  }

  /* ---- Global CTA click tracking (Task 5) ---- */
  document.addEventListener(
    'click',
    function (e) {
      var link = e.target.closest && e.target.closest('a');
      if (!link) return;

      var linkHref = link.getAttribute('href') || '';
      var text = (link.innerText || link.textContent || '').trim();
      if (!linkHref) return;

      var baseParams = {
        link_url: linkHref,
        link_text: text,
        page_path: window.location.pathname,
        page_location: window.location.href,
        funnel: 'adhd_california',
      };

      var isScreeningToolLink =
        /\/adhd-screening(?:\?|#|$)/.test(linkHref) &&
        linkHref.indexOf('/adhd-screening-results') === -1;

      if (isScreeningToolLink) {
        pushEvent('free_screening_click', baseParams);
        pushEvent('adhd_screening_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/adhd-evaluation') !== -1) {
        pushEvent('paid_eval_click', baseParams);
        pushEvent('adhd_evaluation_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/meet-greet') !== -1) {
        pushEvent('meet_greet_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/adhd-walkthrough') !== -1) {
        pushEvent('adhd_walkthrough_click', baseParams);
        pushEvent('adhd_intro_call_click', baseParams);
        pushEvent('meet_greet_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/chat') !== -1 || linkHref.indexOf('spruce.care/siyahealth') !== -1) {
        pushEvent('secure_chat_click', baseParams);
      }

      if (linkHref.indexOf('/book-appointment') !== -1) {
        pushEvent('book_appointment_click', baseParams);
      }

      if (linkHref.indexOf('/telehealth') !== -1) {
        pushEvent('telehealth_guide_click', baseParams);
      }

      if (linkHref === '/answers' || linkHref.indexOf('/answers/') === 0 || linkHref.indexOf('/answers#') === 0) {
        pushEvent('health_guides_click', baseParams);
      }

      if ((link.getAttribute('data-siya-location') || '').indexOf('blog-final-cta') !== -1) {
        pushEvent('blog_internal_cta_click', baseParams);
      }

      if ((link.getAttribute('data-siya-track') || '') === 'explore-care-click' ||
          (text.toLowerCase().indexOf('learn more') !== -1 && linkHref.charAt(0) === '/')) {
        pushEvent('service_learn_more_click', baseParams);
      }

      if (linkHref.indexOf('zocdoc.com/booking-link/practice/siya-healthcare-182234') !== -1) {
        pushEvent('zocdoc_booking_click', baseParams);
      }

      // Lab storefront handoff is owned by lab-storefront-modal.js (fires on Continue).
      if ((linkHref.indexOf('labs.rupahealth.com') !== -1 ||
          (link.getAttribute('data-siya-track') || '') === 'lab_storefront_click') &&
          !window.__siyaLabLeaveModal) {
        pushEvent('lab_storefront_click', Object.assign({}, baseParams, {
          destination_url: linkHref.indexOf('http') === 0 ? linkHref.split('?')[0] : undefined,
        }));
      }

      if (linkHref.indexOf('tel:') === 0) {
        pushEvent('phone_click', baseParams);
      }

      if (linkHref.indexOf('mailto:') === 0) {
        pushEvent('email_click', baseParams);
      }
    },
    true,
  );
})();
