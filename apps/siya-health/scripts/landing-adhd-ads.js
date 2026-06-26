/**
 * Google Ads ADHD landing page — scroll depth + CTA click tracking via gtag.
 */
(function () {
  'use strict';

  var LANDING_PATH = '/adult-adhd-screening-california';
  var path = window.location.pathname.replace(/\/$/, '') || '/';
  var isLanding =
    path === LANDING_PATH ||
    path.endsWith('/adult-adhd-screening-california.html') ||
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

  function initFaqAccordion() {
    var container = document.getElementById('faq');
    if (!container) return;
    var triggers = container.querySelectorAll('[data-faq-trigger]');
    var cards = container.querySelectorAll('[data-faq-item]');

    function openCard(card) {
      var btn = card.querySelector('[data-faq-trigger]');
      var content = card.querySelector('[data-faq-content]');
      if (!btn || !content) return;
      card.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
      content.style.maxHeight = content.scrollHeight + 'px';
    }

    function closeCard(card) {
      var btn = card.querySelector('[data-faq-trigger]');
      var content = card.querySelector('[data-faq-content]');
      if (!btn || !content) return;
      card.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
      content.style.maxHeight = '';
    }

    function closeAll() {
      cards.forEach(closeCard);
    }

    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = this.closest('[data-faq-item]');
        if (card.classList.contains('is-open')) {
          closeCard(card);
          return;
        }
        closeAll();
        openCard(card);
      });
    });
  }

  function init() {
    initScrollTracking();
    initClickTracking();
    initFaqAccordion();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
