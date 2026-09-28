/**
 * Count the Asfaw workforce-cost range into view.
 * The final figure stays in the HTML. Reduced-motion keeps that static text.
 */
(function () {
  var el = document.querySelector('.employer-research-feature__value');
  if (!el) return;
  var low = Number(el.getAttribute('data-count-low'));
  var high = Number(el.getAttribute('data-count-high'));
  if (!low || !high) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var DURATION = 1800;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function label(a, b) { return '$' + a + '–' + b + ' billion a year'; }

  function run() {
    var start = null;
    function frame(now) {
      if (!start) start = now;
      var t = Math.min((now - start) / DURATION, 1);
      var eased = ease(t);
      el.textContent = label(Math.round(low * eased), Math.round(high * eased));
      if (t < 1) requestAnimationFrame(frame);
      else el.textContent = label(low, high);
    }
    requestAnimationFrame(frame);
  }

  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }
  var seen = false;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting || seen) return;
      seen = true;
      observer.disconnect();
      el.textContent = label(0, 0);
      run();
    });
  }, { threshold: 0.35 });
  observer.observe(el);
})();
