/**
 * Siya Circle — page-view and join-click analytics (signup on GHL).
 */
(function () {
  if (typeof gtag === 'function' && /\/siya-circle\/?$/.test(location.pathname)) {
    gtag('event', 'siya_circle_signup_view', { page_path: location.pathname });
  }

  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-siya-track="siya-circle-join-click"]');
    if (!el || typeof gtag !== 'function') return;
    gtag('event', 'siya_circle_join_click', {
      link_url: el.href || '',
      page_path: location.pathname,
    });
  });
})();
