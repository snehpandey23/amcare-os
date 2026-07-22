/**
 * Cookie consent banner — Accept All / Reject Non-Essential.
 * Relies on cookie-consent-bootstrap.js (Consent Mode + localStorage).
 */
(function () {
  'use strict';

  var COOKIE_POLICY_PATH = '/legal/cookie-policy';
  var consent = window.SiyaCookieConsent;

  if (!consent || consent.get()) {
    return;
  }

  var bar = document.createElement('div');
  bar.className = 'cookie-notice';
  bar.setAttribute('role', 'dialog');
  bar.setAttribute('aria-label', 'Cookie preferences');
  bar.setAttribute('aria-live', 'polite');
  bar.innerHTML =
    '<div class="cookie-notice__inner">' +
    '<p class="cookie-notice__text">We use cookies and similar technologies for site functionality, analytics, and advertising. Choose whether to accept all cookies or only those required for the site to work.</p>' +
    '<div class="cookie-notice__controls">' +
    '<div class="cookie-notice__actions">' +
    '<button type="button" class="cookie-notice__btn cookie-notice__btn--accept">Accept All</button>' +
    '<button type="button" class="cookie-notice__btn cookie-notice__btn--reject">Reject Non-Essential</button>' +
    '</div>' +
    '<a class="cookie-notice__policy" href="' +
    COOKIE_POLICY_PATH +
    '">Cookie Policy</a>' +
    '</div></div>';

  function dismiss() {
    bar.remove();
    document.body.classList.remove('cookie-notice-visible');
    document.documentElement.style.removeProperty('--cookie-notice-height');
  }

  function setBodyOffset() {
    document.body.classList.add('cookie-notice-visible');
    var height = bar.offsetHeight;
    document.documentElement.style.setProperty('--cookie-notice-height', height + 'px');
  }

  bar.querySelector('.cookie-notice__btn--accept').addEventListener('click', function () {
    consent.acceptAll();
    dismiss();
  });

  bar.querySelector('.cookie-notice__btn--reject').addEventListener('click', function () {
    consent.rejectNonEssential();
    dismiss();
  });

  function mount() {
    document.body.appendChild(bar);
    setBodyOffset();
    window.addEventListener('resize', setBodyOffset, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
