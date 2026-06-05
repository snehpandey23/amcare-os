/**
 * Minimal non-blocking cookie notice — stores acceptance in localStorage.
 * Not a consent-management platform; informational only.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'siya_cookie_notice_accepted';
  var COOKIE_POLICY_PATH = '/legal/cookie-policy';

  if (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY) === 'true') {
    return;
  }

  var bar = document.createElement('div');
  bar.className = 'cookie-notice';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Cookie notice');
  bar.innerHTML =
    '<div class="cookie-notice__inner">' +
    '<p class="cookie-notice__text">We use cookies and similar technologies for site functionality, analytics, and advertising. See our <a href="' +
    COOKIE_POLICY_PATH +
    '">Cookie Policy</a>.</p>' +
    '<div class="cookie-notice__actions">' +
    '<button type="button" class="button cookie-notice__accept">Accept</button>' +
    '<a class="button secondary cookie-notice__policy" href="' +
    COOKIE_POLICY_PATH +
    '">Cookie Policy</a>' +
    '</div></div>';

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (e) {
      /* ignore quota errors */
    }
    bar.remove();
  }

  bar.querySelector('.cookie-notice__accept').addEventListener('click', dismiss);

  function mount() {
    document.body.appendChild(bar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
