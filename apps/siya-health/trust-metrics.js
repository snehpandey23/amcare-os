/**
 * Trust metrics - rolling number animation on scroll into view
 */
(function () {
  'use strict';

  var DURATION = 1800; // ms
  var EASING = function (t) { return 1 - Math.pow(1 - t, 3); }; // ease-out cubic

  function animateValue(el) {
    var target = parseFloat(el.getAttribute('data-target')) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = 0;
    var startTime = null;
    var isDecimal = target % 1 !== 0;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / DURATION, 1);
      var eased = EASING(progress);
      var current = start + (target - start) * eased;

      if (isDecimal) {
        el.textContent = current.toFixed(1) + suffix;
      } else {
        el.textContent = Math.round(current) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = (isDecimal ? target.toFixed(1) : Math.round(target)) + suffix;
      }
    }

    requestAnimationFrame(step);
  }

  function init() {
    var section = document.querySelector('.trust-metrics');
    if (!section) return;

    var values = section.querySelectorAll('.trust-metric-value');
    if (!values.length) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var container = entry.target;
          if (container.classList.contains('trust-metrics-animated')) return;
          container.classList.add('trust-metrics-animated');
          container.querySelectorAll('.trust-metric-value').forEach(animateValue);
          observer.unobserve(container);
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    );

    observer.observe(section);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
