/** Shared cursor glow used by homepage2 and /about. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia("(hover: none)").matches) return;
  var root = document.documentElement;
  var glow = document.querySelector(".siya-h2-cursor-glow");
  if (!glow) return;
  var mx = window.innerWidth * 0.5, my = window.innerHeight * 0.35, raf = 0;
  function paint() {
    raf = 0;
    root.style.setProperty("--siya-mx", mx + "px");
    root.style.setProperty("--siya-my", my + "px");
  }
  window.addEventListener("pointermove", function (e) {
    mx = e.clientX;
    my = e.clientY;
    if (!raf) raf = requestAnimationFrame(paint);
  }, { passive: true });
  paint();
})();
