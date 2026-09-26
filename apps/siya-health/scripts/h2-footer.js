/**
 * Shared five-link footer for the new surface. Do not paste a second copy.
 * Lives under /scripts because /design-system only serves .css (other paths redirect home).
 */
(function () {
  var host = document.getElementById("siya-h2-footer");
  if (!host) return;
  host.innerHTML =
    '<div class="container container--footer-wide siya-h2-footer-line" data-siya-footer="compact-v2">' +
    '<a href="/about">About</a>' +
    '<span class="siya-h2-footer-sep" aria-hidden="true">·</span>' +
    '<a href="/pricing2">Pricing</a>' +
    '<span class="siya-h2-footer-sep" aria-hidden="true">·</span>' +
    '<a href="/social">Social</a>' +
    '<span class="siya-h2-footer-sep" aria-hidden="true">·</span>' +
    '<a href="/legal">Legal</a>' +
    '<span class="siya-h2-footer-sep" aria-hidden="true">·</span>' +
    '<a href="tel:+12154451244">(215)&nbsp;445-1244</a>' +
    '<span class="siya-h2-footer-sep" aria-hidden="true">·</span>' +
    '<span class="siya-h2-footer-copy">© 2026 Siya Health Inc. All rights reserved.</span>' +
    "</div>";
})();
