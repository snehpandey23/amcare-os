/**
 * Sitewide FAQ accordion — single behavior + accessibility implementation.
 * Targets [data-faq-item] / [data-faq-trigger] inside [data-faq-accordion] or #faq.
 */
(function () {
  'use strict';

  function initAccordion(root) {
    var cards = root.querySelectorAll('[data-faq-item]');
    if (!cards.length) return;

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

    root.querySelectorAll('[data-faq-trigger]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var card = this.closest('[data-faq-item]');
        if (!card) return;
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
    var roots = document.querySelectorAll('[data-faq-accordion], #faq');
    roots.forEach(initAccordion);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
