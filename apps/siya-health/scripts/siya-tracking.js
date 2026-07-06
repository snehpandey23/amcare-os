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

  /* ---- Redirect page view conversions (Task 4) ---- */
  var path = window.location.pathname || '';
  var href = window.location.href || '';

  if (path.indexOf('/redirect/adhd-walkthrough') !== -1) {
    pushEvent('adhd_walkthrough_redirect_view', {
      page_path: path,
      page_location: href,
      funnel: 'adhd_california',
      conversion_type: 'walkthrough_redirect',
    });
  }

  if (path.indexOf('/redirect/adhd-evaluation') !== -1) {
    pushEvent('adhd_evaluation_redirect_view', {
      page_path: path,
      page_location: href,
      funnel: 'adhd_california',
      conversion_type: 'evaluation_redirect',
    });
  }

  if (path.indexOf('/redirect/chat') !== -1) {
    pushEvent('secure_chat_redirect_view', {
      page_path: path,
      page_location: href,
      funnel: 'adhd_california',
      conversion_type: 'secure_chat_redirect',
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

      if (linkHref.indexOf('/adhd-screening') !== -1) {
        pushEvent('free_screening_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/adhd-evaluation') !== -1) {
        pushEvent('paid_eval_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/adhd-walkthrough') !== -1) {
        pushEvent('adhd_walkthrough_click', baseParams);
      }

      if (linkHref.indexOf('/redirect/chat') !== -1) {
        pushEvent('secure_chat_click', baseParams);
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
