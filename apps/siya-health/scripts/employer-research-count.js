/**
 * Count the Asfaw range into view. Only the two numbers move.
 * "billion" stays a highlighted word. Reduced-motion leaves the HTML as written.
 */
(function () {
  var el = document.querySelector('.employer-research-feature__value[data-count-low]');
  if (!el) return;
  var low = Number(el.getAttribute('data-count-low'));
  var high = Number(el.getAttribute('data-count-high'));
  var lowEl = el.querySelector('.employer-count');
  var highEl = el.querySelector('.employer-count--high');
  if (!low || !high || !lowEl || !highEl) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var DURATION = 1800;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function paint(a, b) {
    lowEl.textContent = String(a);
    highEl.textContent = String(b);
  }

  function run() {
    var start = null;
    function frame(now) {
      if (!start) start = now;
      var t = Math.min((now - start) / DURATION, 1);
      var eased = ease(t);
      paint(Math.round(low * eased), Math.round(high * eased));
      if (t < 1) requestAnimationFrame(frame);
      else paint(low, high);
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
      paint(0, 0);
      run();
    });
  }, { threshold: 0.35 });
  observer.observe(el);
})();
