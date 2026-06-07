/**
 * Trust metrics - rolling number animation on scroll into view.
 * Final values are rendered immediately so metrics never show as zero.
 */
(function () {
  'use strict';

  var DURATION = 1800;
  var EASING = function (t) { return 1 - Math.pow(1 - t, 3); };

  function formatMetricValue(target, suffix) {
    var isDecimal = target % 1 !== 0;
    if (isDecimal) return target.toFixed(1) + (suffix || '');
    return Math.round(target).toLocaleString('en-US') + (suffix || '');
  }

  function setFinalMetricValues(container) {
    container.querySelectorAll('.trust-metric-value').forEach(function (el) {
      var target = parseFloat(el.getAttribute('data-target'));
      if (isNaN(target)) return;
      el.textContent = formatMetricValue(target, el.getAttribute('data-suffix') || '');
    });
  }

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
        el.textContent = formatMetricValue(target, suffix);
      }
    }

    requestAnimationFrame(step);
  }

  function init() {
    var sections = document.querySelectorAll('.trust-metrics');
    if (!sections.length) return;

    sections.forEach(function (section) {
      setFinalMetricValues(section);

      var values = section.querySelectorAll('.trust-metric-value');
      if (!values.length) return;

      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        section.classList.add('trust-metrics-animated');
        return;
      }

      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var container = entry.target;
            if (container.classList.contains('trust-metrics-animated')) return;
            container.classList.add('trust-metrics-animated');
            container.querySelectorAll('.trust-metric-value').forEach(function (el) {
              el.textContent = '0' + (el.getAttribute('data-suffix') || '');
              animateValue(el);
            });
            observer.unobserve(container);
          });
        },
        { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
      );

      observer.observe(section);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
