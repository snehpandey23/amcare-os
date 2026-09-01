/**
 * Siya AI Concierge — sitewide embed loader (iframe → siya-guide.vercel.app/embed)
 *
 * Closed launcher must stay ~360×96 so the embed pill ("Need help? Talk to…")
 * is not clipped. Do NOT shrink to a square — that crops the chip and looks broken.
 * Tap-theft on ASRS questions is handled by hiding the iframe while
 * body.asrs-questionnaire-active is set.
 */
(function () {
  if (window.__siyaConciergeLoaded) return;
  window.__siyaConciergeLoaded = true;

  var ORIGIN = 'https://siya-guide.vercel.app';
  var CLOSED_H = 96;
  var CLOSED_W = 360;
  var iframe = document.createElement('iframe');
  iframe.src = ORIGIN + '/embed';
  iframe.title = 'Siya AI Concierge';
  iframe.setAttribute('allow', 'clipboard-write');
  iframe.style.cssText =
    'position:fixed;right:12px;bottom:12px;width:' +
    CLOSED_W +
    'px;height:' +
    CLOSED_H +
    'px;border:0;z-index:2147483000;background:transparent;color-scheme:light;overflow:hidden;pointer-events:auto;';

  function isMobile() {
    try {
      return window.matchMedia('(max-width: 899px)').matches;
    } catch (e) {
      return false;
    }
  }

  function bottomOffset() {
    var lift = 12;
    try {
      if (document.body && document.body.classList.contains('cookie-notice-visible')) {
        var cookieH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--cookie-notice-height'),
          10
        );
        lift = Math.max(lift, (isFinite(cookieH) ? cookieH : 96) + 12);
      }
      if (
        isMobile() &&
        document.querySelector(
          '.mobile-sticky-cta.is-revealed, .lp-mobile-sticky-cta.is-revealed, .mobile-sticky-cta:not([hidden])'
        )
      ) {
        lift = Math.max(lift, 88);
      }
      // Keep launcher clear of stacked CTAs on screening results (mobile)
      if (isMobile() && document.querySelector('.screening-results-hero-cta')) {
        lift = Math.max(lift, 20);
      }
    } catch (e) {}
    return lift;
  }

  function closedWidth() {
    return Math.min(CLOSED_W, Math.max(280, window.innerWidth - 24));
  }

  function isOpen() {
    return parseInt(iframe.style.height, 10) > CLOSED_H + 24;
  }

  function resize(open) {
    var cookieVisible = false;
    var questionnaireActive = false;
    try {
      cookieVisible = !!(document.body && document.body.classList.contains('cookie-notice-visible'));
      questionnaireActive = !!(document.body && document.body.classList.contains('asrs-questionnaire-active'));
    } catch (e) {}

    // Hide during ASRS questions — wide iframe hitbox can steal Next/option taps
    if (questionnaireActive) {
      iframe.style.visibility = 'hidden';
      iframe.style.pointerEvents = 'none';
      return;
    }
    // Hide on mobile while cookie bar is up so Ads/hero CTAs stay clickable
    if (cookieVisible && isMobile()) {
      iframe.style.visibility = 'hidden';
      iframe.style.pointerEvents = 'none';
      return;
    }

    iframe.style.visibility = 'visible';
    iframe.style.pointerEvents = 'auto';
    var lift = bottomOffset();
    iframe.style.bottom = lift + 'px';
    iframe.style.right = '12px';
    if (open) {
      iframe.style.width = Math.min(440, window.innerWidth - 24) + 'px';
      iframe.style.height = Math.min(720, window.innerHeight - lift - 12) + 'px';
    } else {
      // Match embed closed size (pill launcher). Never crop to a square.
      iframe.style.width = closedWidth() + 'px';
      iframe.style.height = CLOSED_H + 'px';
    }
  }

  window.addEventListener('message', function (event) {
    if (event.origin !== ORIGIN) return;
    var data = event.data || {};
    if (data.source !== 'siya-concierge') return;
    resize(!!data.open);
  });

  window.addEventListener('resize', function () {
    resize(isOpen());
  });

  var obs = new MutationObserver(function () {
    resize(isOpen());
  });

  function mount() {
    if (!document.body || iframe.parentNode) return;
    document.body.appendChild(iframe);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
      subtree: true,
      childList: true,
    });
    resize(false);
  }

  function isAdsLanding() {
    try {
      var b = document.body;
      if (!b) return false;
      if (b.getAttribute('data-siya-landing')) return true;
      return !!(b.className && String(b.className).indexOf('siya-landing-page') !== -1);
    } catch (e) {
      return false;
    }
  }

  /** Defer embed network until idle so LCP/hero paint is not competing with Guide chunks. */
  function scheduleMount() {
    var run = function () {
      mount();
    };
    var ads = isAdsLanding();
    // Prefer idle; ads LPs get a longer ceiling so GTM/Clarity also win bandwidth first.
    var idleTimeout = ads ? 6000 : 4000;
    var fallbackMs = ads ? 4500 : 3000;
    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(run, { timeout: idleTimeout });
    } else {
      setTimeout(run, fallbackMs);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleMount);
  } else {
    scheduleMount();
  }
})();
