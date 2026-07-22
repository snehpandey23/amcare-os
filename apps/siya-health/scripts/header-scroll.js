/**
 * Transparent site header: solid background after scroll.
 * Mobile sticky CTA: reveal only after hero CTAs leave the viewport
 * (avoids duplicate Meet & Greet + clipping the secondary hero button).
 */
(function () {
  var header = document.getElementById('site-header');
  if (header) {
    var threshold = 48;
    function onScroll() {
      header.classList.toggle('site-header-scrolled', window.scrollY > threshold);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var sticky = document.querySelector('.mobile-sticky-cta');
  if (!sticky) return;

  var heroCtas = document.querySelector(
    '.hero-merged .hero-ctas, .lp-hero-conversion, .hero-merged-content .hero-ctas-row'
  );
  if (!heroCtas || typeof IntersectionObserver === 'undefined') {
    sticky.classList.add('is-revealed');
    sticky.setAttribute('aria-hidden', 'false');
    return;
  }

  sticky.setAttribute('aria-hidden', 'true');
  var io = new IntersectionObserver(
    function (entries) {
      var show = !entries[0].isIntersecting;
      sticky.classList.toggle('is-revealed', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    },
    { threshold: 0, rootMargin: '0px 0px -12% 0px' }
  );
  io.observe(heroCtas);
})();
