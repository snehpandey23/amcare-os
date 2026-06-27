/**
 * Transparent site header: solid background + compact logo after scroll.
 */
(function () {
  var header = document.getElementById('site-header');
  if (!header) return;
  var threshold = 48;
  function onScroll() {
    header.classList.toggle('site-header-scrolled', window.scrollY > threshold);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();
