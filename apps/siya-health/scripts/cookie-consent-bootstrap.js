/**
 * Cookie consent bootstrap — must load synchronously before GTM/gtag.
 * Sets Google Consent Mode defaults; restores prior choice from localStorage.
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
    },
    rejectNonEssential: function () {
      try {
        localStorage.setItem(STORAGE_KEY, 'essential');
        localStorage.removeItem(LEGACY_KEY);
      } catch (e) {
        /* ignore */
      }
      applyConsent('essential');
    },
  };
})();
