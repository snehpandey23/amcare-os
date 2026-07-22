/**
 * Intercept Rupa lab storefront clicks → lightweight "Leaving Siya" modal.
 * Continue opens storefront in a new tab and fires lab_storefront_click.
 */
(function () {
  window.__siyaLabLeaveModal = true;
  var STORE_HOST = 'labs.rupahealth.com';
  var pendingHref = '';
  var overlay = null;

  function pushEvent(name, params) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: name }, params || {}));
    } catch (e) {}
  }

  function ensureModal() {
    if (overlay) return overlay;
    overlay = document.createElement('div');
    overlay.id = 'siya-lab-leave-modal';
    overlay.className = 'siya-lab-leave-modal';
    overlay.hidden = true;
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-labelledby', 'siya-lab-leave-title');
    overlay.innerHTML =
      '<div class="siya-lab-leave-modal__backdrop" data-siya-lab-leave-dismiss></div>' +
      '<div class="siya-lab-leave-modal__panel">' +
      '<h2 id="siya-lab-leave-title">Leaving Siya Health</h2>' +
      '<p>You&rsquo;re opening <strong>Siya&rsquo;s laboratory storefront</strong>.</p>' +
      '<p class="siya-lab-leave-modal__muted">Powered by Rupa Health. Prices and availability are shown there and may change.</p>' +
      '<p>You can always return to Siya for interpretation and ongoing care.</p>' +
      '<div class="siya-lab-leave-modal__actions">' +
      '<button type="button" class="button ds-button ds-button--secondary secondary" data-siya-lab-leave-dismiss>Stay on Siya</button>' +
      '<button type="button" class="button ds-button ds-button--primary" data-siya-lab-leave-continue>Continue to lab storefront</button>' +
      '</div>' +
      '</div>';
    document.body.appendChild(overlay);

    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-siya-lab-leave-dismiss]')) {
        closeModal();
        return;
      }
      if (e.target.closest('[data-siya-lab-leave-continue]')) {
        continueToStore();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay && !overlay.hidden) closeModal();
    });

    return overlay;
  }

  function openModal(href, location) {
    pendingHref = href;
    ensureModal().hidden = false;
    document.body.classList.add('siya-lab-leave-open');
    pushEvent('lab_storefront_modal_open', {
      destination_url: href.split('?')[0],
      link_location: location || '',
      source_page: location && location.pathname ? undefined : undefined,
    });
    var btn = overlay.querySelector('[data-siya-lab-leave-continue]');
    if (btn) btn.focus();
  }

  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('siya-lab-leave-open');
    pendingHref = '';
  }

  function continueToStore() {
    var href = pendingHref;
    if (!href) return;
    pushEvent('lab_storefront_click', {
      destination_url: href.split('?')[0],
      handoff: 'modal',
    });
    closeModal();
    window.open(href, '_blank', 'noopener,noreferrer');
  }

  function isStorefrontLink(a) {
    if (!a || !a.getAttribute) return false;
    var href = a.href || a.getAttribute('href') || '';
    if (href.indexOf(STORE_HOST) !== -1) return true;
    return (a.getAttribute('data-siya-track') || '') === 'lab_storefront_click';
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target.closest && e.target.closest('a');
      if (!isStorefrontLink(a)) return;
      e.preventDefault();
      e.stopPropagation();
      var loc = a.getAttribute('data-siya-location') || '';
      openModal(a.href || a.getAttribute('href'), loc);
    },
    true,
  );
})();
