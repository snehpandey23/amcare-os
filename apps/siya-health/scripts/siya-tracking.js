/**
 * Siya Health sitewide dataLayer tracking — works with GTM (GTM-PLBD4TTQ).
 * Fires funnel conversion events + Entity Utilization events for Canonical pages.
 */
(function () {
  'use strict';

  var host = (window.location && window.location.hostname) || '';
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '[::1]' ||
    /\.local$/.test(host)
  ) {
    return;
  }

  window.dataLayer = window.dataLayer || [];

  var DEBUG = window.location.search.indexOf('debug_tracking=1') !== -1;
  var ASSIST_KEY = 'siya_entity_assist_path';
  var ASSIST_MAX = 8;
  var ATTR_KEY = 'siya_marketing_params';
  var ATTR_KEYS = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'utm_id',
    '_gl',
    'fbclid',
    'msclkid',
    'ttclid',
  ];

  function readStoredAttribution() {
    try {
      var raw = sessionStorage.getItem(ATTR_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      return {};
    }
  }

  function writeStoredAttribution(map) {
    try {
      sessionStorage.setItem(ATTR_KEY, JSON.stringify(map));
    } catch (err) {
      /* private mode */
    }
  }

  /** Persist gclid / UTMs from the current URL for the rest of the session. */
  function captureMarketingParams() {
    var params = new URLSearchParams(window.location.search || '');
    var stored = readStoredAttribution();
    var changed = false;
    ATTR_KEYS.forEach(function (key) {
      if (params.has(key)) {
        stored[key] = params.get(key);
        changed = true;
      }
    });
    if (changed) writeStoredAttribution(stored);
    return stored;
  }

  /**
   * Append stored + current-page attribution params onto same-origin /redirect/ links
   * so the redirect hop does not drop Ads click IDs when CTAs are bare paths.
   */
  function withAttribution(href) {
    if (!href || href.charAt(0) === '#' || /^(mailto:|tel:|javascript:)/i.test(href)) {
      return href;
    }
    var isRedirect =
      href.indexOf('/redirect/') === 0 ||
      /^(?:https?:)?\/\/(?:www\.)?siya\.health\/redirect\//i.test(href);
    if (!isRedirect) return href;

    try {
      var url = new URL(href, window.location.origin);
      if (url.origin !== window.location.origin) return href;
      if (url.pathname.indexOf('/redirect/') !== 0) return href;

      var stored = readStoredAttribution();
      var pageParams = new URLSearchParams(window.location.search || '');
      ATTR_KEYS.forEach(function (key) {
        if (url.searchParams.has(key)) return;
        if (pageParams.has(key)) {
          url.searchParams.set(key, pageParams.get(key));
          return;
        }
        if (stored[key]) url.searchParams.set(key, stored[key]);
      });
      return url.pathname + url.search + url.hash;
    } catch (err) {
      return href;
    }
  }

  function decorateRedirectLinks(root) {
    var scope = root && root.querySelectorAll ? root : document;
    var links = scope.querySelectorAll('a[href*="/redirect/"]');
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      var raw = el.getAttribute('href');
      if (!raw) continue;
      var next = withAttribution(raw);
      if (next && next !== raw) el.setAttribute('href', next);
    }
  }

  captureMarketingParams();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      decorateRedirectLinks(document);
    });
  } else {
    decorateRedirectLinks(document);
  }

  var CANONICAL = {
    '/primary-care': { entity: 'primary_care', entity_family: 'root_service', care_pathway: 'primary_care' },
    '/preventive-care': { entity: 'preventive_care', entity_family: 'service', care_pathway: 'primary_care' },
    '/adult-adhd-california': { entity: 'adult_adhd_california', entity_family: 'condition', care_pathway: 'adhd', state: 'CA' },
    '/fatigue': { entity: 'fatigue', entity_family: 'symptom', care_pathway: 'primary_care' },
    '/brain-fog': { entity: 'brain_fog', entity_family: 'symptom', care_pathway: 'primary_care' },
    '/labs/cbc': { entity: 'lab_cbc', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/cmp': { entity: 'lab_cmp', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/lipid-panel': { entity: 'lab_lipid_panel', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/a1c-blood-sugar': { entity: 'lab_a1c', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/thyroid': { entity: 'lab_thyroid', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/iron-ferritin': { entity: 'lab_ferritin', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/vitamin-b12': { entity: 'lab_vitamin_b12', entity_family: 'laboratory', care_pathway: 'primary_care' },
    '/labs/vitamin-d': { entity: 'lab_vitamin_d', entity_family: 'laboratory', care_pathway: 'primary_care' },
  };

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

  function normalizePath(pathname) {
    if (!pathname) return '/';
    var bare = pathname.split('?')[0].split('#')[0].replace(/\/+$/, '');
    return bare || '/';
  }

  function pathFromHref(href) {
    if (!href) return '';
    if (href.charAt(0) === '/') return normalizePath(href);
    try {
      var u = new URL(href, window.location.origin);
      if (u.origin !== window.location.origin) return '';
      return normalizePath(u.pathname);
    } catch (err) {
      return '';
    }
  }

  function readBodyEntity() {
    var body = document.body;
    if (!body) return null;
    var entity = body.getAttribute('data-siya-entity');
    if (!entity) return null;
    return {
      entity: entity,
      entity_family: body.getAttribute('data-siya-entity-family') || '',
      care_pathway: body.getAttribute('data-siya-care-pathway') || '',
      state: body.getAttribute('data-siya-state') || undefined,
    };
  }

  function resolveEntity(pathname) {
    var fromBody = readBodyEntity();
    if (fromBody && normalizePath(window.location.pathname) === normalizePath(pathname || window.location.pathname)) {
      return fromBody;
    }
    return CANONICAL[normalizePath(pathname || window.location.pathname)] || null;
  }

  function inferTrafficSource() {
    try {
      var params = new URLSearchParams(window.location.search || '');
      var utm = (params.get('utm_medium') || '').toLowerCase();
      var source = (params.get('utm_source') || '').toLowerCase();
      if (utm === 'cpc' || utm === 'ppc' || utm === 'paid' || source.indexOf('googleads') !== -1) return 'paid';
      if (utm === 'email') return 'email';
      if (utm === 'social') return 'social';
      if (document.referrer) {
        var host = '';
        try { host = new URL(document.referrer).hostname; } catch (e) { host = ''; }
        if (host && host.indexOf(window.location.hostname) === -1) {
          if (/google\.|bing\.|duckduckgo\.|yahoo\./i.test(host)) return 'organic';
          return 'referral';
        }
      }
      if (!document.referrer) return 'direct';
      return 'organic';
    } catch (err) {
      return 'unknown';
    }
  }

  function entityBaseParams(meta) {
    var params = {
      entity: meta.entity,
      entity_family: meta.entity_family,
      care_pathway: meta.care_pathway,
      traffic_source: inferTrafficSource(),
      page_path: window.location.pathname,
      page_location: window.location.href,
    };
    if (meta.state) params.state = meta.state;
    return params;
  }

  function readAssistPath() {
    try {
      var raw = sessionStorage.getItem(ASSIST_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      return [];
    }
  }

  function pushAssist(entityId) {
    if (!entityId) return;
    var list = readAssistPath().filter(function (id) { return id !== entityId; });
    list.push(entityId);
    if (list.length > ASSIST_MAX) list = list.slice(list.length - ASSIST_MAX);
    try {
      sessionStorage.setItem(ASSIST_KEY, JSON.stringify(list));
    } catch (err) { /* private mode */ }
  }

  function assistPayload() {
    var list = readAssistPath();
    // GA4 event params must be strings/numbers — not arrays.
    return {
      assisted_entities: list.slice(0, -1).join(','),
      assist_path: list.join(','),
    };
  }

  function isPrimaryCta(href, track) {
    return (
      /\/redirect\/(adhd-evaluation|meet-greet|adhd-walkthrough)|\/book-appointment|\/adhd-screening/i.test(href) ||
      /adhd_evaluation_click|meet_greet_click|book_appointment_click|adhd_screening_click|screening-cta-click|paid_eval_click/.test(track || '')
    );
  }

  function isSecondaryCta(href, track) {
    return (
      /\/redirect\/chat|spruce\.care|tel:|mailto:/i.test(href) ||
      /secure_chat_click|phone_click|email_click|explore-care-click/.test(track || '')
    );
  }

  /* ---- Entity Utilization: view + exit ---- */
  var pageEntity = resolveEntity(window.location.pathname);
  var viewStarted = Date.now();
  if (pageEntity) {
    pushAssist(pageEntity.entity);
    pushEvent('entity_view', entityBaseParams(pageEntity));
  }

  function fireEntityExit() {
    if (!pageEntity || window.__siyaEntityExitSent) return;
    window.__siyaEntityExitSent = true;
    pushEvent(
      'entity_exit',
      Object.assign({}, entityBaseParams(pageEntity), {
        time_on_page_ms: Math.max(0, Date.now() - viewStarted),
      }),
    );
  }
  window.addEventListener('pagehide', fireEntityExit);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') fireEntityExit();
  });

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

  /* ---- Global CTA click tracking (Task 5) + Entity Utilization ---- */
  document.addEventListener(
    'click',
    function (e) {
      var link = e.target.closest && e.target.closest('a');
      if (!link) return;

      var rawHref = link.getAttribute('href') || '';
      if (!rawHref) return;

      /* Re-apply attribution at click time (covers late-injected CTAs). */
      var decorated = withAttribution(rawHref);
      if (decorated && decorated !== rawHref) {
        link.setAttribute('href', decorated);
      }

      var linkHref = link.getAttribute('href') || decorated || rawHref;
      var text = (link.innerText || link.textContent || '').trim();
      var track = link.getAttribute('data-siya-track') || '';

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

      if (track === 'explore-care-click' ||
          (text.toLowerCase().indexOf('learn more') !== -1 && linkHref.charAt(0) === '/')) {
        pushEvent('service_learn_more_click', baseParams);
      }

      if (linkHref.indexOf('zocdoc.com/booking-link/practice/siya-healthcare-182234') !== -1) {
        pushEvent('zocdoc_booking_click', baseParams);
      }

      // Lab storefront handoff is owned by lab-storefront-modal.js (fires on Continue).
      if ((linkHref.indexOf('labs.rupahealth.com') !== -1 ||
          track === 'lab_storefront_click') &&
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

      /* Entity Utilization click taxonomy */
      var current = pageEntity || resolveEntity(window.location.pathname);
      if (current) {
        var targetPath = pathFromHref(linkHref);
        var targetEntity = targetPath ? CANONICAL[targetPath] : null;
        if (targetEntity && targetEntity.entity !== current.entity) {
          pushEvent(
            'entity_related_click',
            Object.assign({}, entityBaseParams(current), {
              related_entity: targetEntity.entity,
              related_entity_family: targetEntity.entity_family,
              link_url: linkHref,
              link_text: text,
            }),
          );
        }

        if (isPrimaryCta(linkHref, track)) {
          pushEvent(
            'entity_primary_cta_click',
            Object.assign({}, entityBaseParams(current), {
              link_url: linkHref,
              link_text: text,
              cta_track: track || undefined,
            }),
          );
          pushEvent(
            'entity_conversion',
            Object.assign({}, entityBaseParams(current), assistPayload(), {
              conversion_type: 'primary_cta',
              link_url: linkHref,
              link_text: text,
            }),
          );
        } else if (isSecondaryCta(linkHref, track)) {
          pushEvent(
            'entity_secondary_cta_click',
            Object.assign({}, entityBaseParams(current), {
              link_url: linkHref,
              link_text: text,
              cta_track: track || undefined,
            }),
          );
        }
      }
    },
    true,
  );
})();
