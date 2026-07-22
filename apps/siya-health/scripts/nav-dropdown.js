/**
 * About dropdown: stay open while hovering the whole control (toggle + menu).
 * Click/tap toggles .is-open for touch devices.
 */
(function () {
  function setOpen(drop, open) {
    if (!drop) return;
    drop.classList.toggle('is-open', open);
    var btn = drop.querySelector('.nav-dropdown__toggle');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  function closeAll(except) {
    document.querySelectorAll('.nav-dropdown.is-open').forEach(function (el) {
      if (el === except) return;
      setOpen(el, false);
    });
  }

  function bindHover(drop) {
    if (drop.__siyaHoverBound) return;
    drop.__siyaHoverBound = true;
    drop.addEventListener('mouseenter', function () {
      setOpen(drop, true);
    });
    drop.addEventListener('mouseleave', function () {
      setOpen(drop, false);
    });
  }

  function init() {
    document.querySelectorAll('.nav-dropdown').forEach(bindHover);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('.nav-dropdown__toggle');
    if (toggle) {
      e.preventDefault();
      e.stopPropagation();
      var drop = toggle.closest('.nav-dropdown');
      bindHover(drop);
      var willOpen = !drop.classList.contains('is-open');
      closeAll(drop);
      setOpen(drop, willOpen);
      return;
    }
    if (!e.target.closest('.nav-dropdown')) closeAll();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll();
  });
})();
