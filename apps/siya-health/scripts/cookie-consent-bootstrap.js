/**
 * Cookie consent bootstrap — must load synchronously before GTM/gtag.
 * Sets Google Consent Mode defaults; restores prior choice from localStorage.
 * Also hardens GA4 privacy flags sitewide on pages that load this file
 * (care-flow pages strip this script — no GA4/GTM there).
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'siya_cookie_consent';
  var LEGACY_KEY = 'siya_cookie_notice_accepted';

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = window.gtag || gtag;

  /**
   * Privacy-harden GA4 (and linked Google tags) regardless of consent choice.
   * Signals + ads personalization off; measurement can still run when
   * analytics_storage is granted. Requires matching GTM GA4 Config fields
   * and GA4 Admin toggles for full effect — see docs/GA4-PRIVACY-HARDENING.md.
   */
  function applyGa4PrivacyHardening() {
    try {
      gtag('set', {
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
      });
      window.dataLayer.push({
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        siya_ga4_privacy: 'hardened',
      });
    } catch (e) {
      /* ignore */
    }
  }

  function readConsent() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      if (value === 'all' || value === 'essential') return value;
      if (localStorage.getItem(LEGACY_KEY) === 'true') return 'all';
    } catch (e) {
      /* private browsing */
    }
    return null;
  }

  function consentFlags(granted) {
    return {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    };
  }

  function applyConsent(level) {
    gtag('consent', 'update', consentFlags(level === 'all'));
    // Re-assert GA4 privacy after consent updates (GTM may re-config tags).
    applyGa4PrivacyHardening();
    window.dataLayer.push({ event: 'cookie_consent_update', consent_level: level });
  }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500,
  });

  // Before GTM loads GA4 Config — suppress Signals / ads personalization joins.
  applyGa4PrivacyHardening();

  var stored = readConsent();
  if (stored === 'all') {
    applyConsent('all');
  }

  window.SiyaCookieConsent = {
    storageKey: STORAGE_KEY,
    get: readConsent,
    acceptAll: function () {
      try {
        localStorage.setItem(STORAGE_KEY, 'all');
        localStorage.removeItem(LEGACY_KEY);
      } catch (e) {
        /* ignore */
      }
      applyConsent('all');
      try {
        window.dispatchEvent(
          new CustomEvent('siya:cookie-consent', { detail: { level: 'all' } })
        );
      } catch (e) {
        /* ignore */
      }
    },
    rejectNonEssential: function () {
      try {
        localStorage.setItem(STORAGE_KEY, 'essential');
        localStorage.removeItem(LEGACY_KEY);
      } catch (e) {
        /* ignore */
      }
      applyConsent('essential');
      try {
        window.dispatchEvent(
          new CustomEvent('siya:cookie-consent', {
            detail: { level: 'essential' },
          })
        );
      } catch (e) {
        /* ignore */
      }
    },
  };
})();
