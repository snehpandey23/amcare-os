/**
 * Sitewide GHL intake legal gate — intercepts booking/form links, requires clickwrap acceptance,
 * appends hidden-field query params for GHL contact record capture.
 */
(function () {
  'use strict';

  var FALLBACK = {
    hostPattern: 'link.yourmarketingai.com/widget/form/',
    fields: {
      timestamp: 'legal_acceptance_timestamp',
      source: 'legal_acceptance_source',
      version: 'legal_document_version',
      terms: 'legal_acceptance_terms',
      privacy: 'legal_acceptance_privacy',
      npp: 'legal_acceptance_npp',
    },
    legalLinks: {
      terms: '/legal/terms-of-use',
      privacy: '/legal/privacy-policy',
      npp: '/legal/notice-of-privacy-practices',
    },
    legalDocumentVersion: 'terms:1.0.0-counsel;privacy:1.0.0-counsel;npp:1.0.0-counsel;effective:2025-10-31',
    copy: {
      checkboxTerms: 'I agree to the Terms of Use',
      checkboxPrivacy: 'I acknowledge the Privacy Policy',
      checkboxNpp: 'I acknowledge the Notice of Privacy Practices',
      submitConfirmation:
        'By submitting this form, I confirm that I have read and agree to the Terms of Use, Privacy Policy, and Notice of Privacy Practices. I understand that submitting this form does not establish a physician-patient relationship, does not guarantee treatment or medication, and does not constitute emergency medical care.',
      adhdDisclaimer:
        'I understand that ADHD screening tools are not diagnostic. Any diagnosis, treatment recommendation, or medication decision requires a clinical evaluation by a licensed clinician. Medication, including stimulant medication, is never guaranteed and is prescribed only when clinically appropriate and permitted by applicable law.',
      modalTitle: 'Before you continue',
      modalSubmit: 'Continue to booking',
      modalCancel: 'Cancel',
    },
  };

  function cfg() {
    return window.SIYA_GHL_INTAKE || FALLBACK;
  }

  function hostPattern() {
    return cfg().hostPattern || FALLBACK.hostPattern;
  }

  function isGhlIntakeHref(href) {
    if (!href || href.indexOf('javascript:') === 0) return false;
    try {
      var u = new URL(href, window.location.origin);
      return u.href.indexOf(hostPattern()) !== -1;
    } catch (e) {
      return href.indexOf(hostPattern()) !== -1;
    }
  }

  function isAdhdContext(anchor) {
    if (document.body && document.body.dataset && document.body.dataset.siyaFunnel === 'adhd') return true;
    if (anchor && anchor.dataset && anchor.dataset.ghlAdhd === 'true') return true;
    if (anchor && anchor.closest && anchor.closest('[data-ghl-adhd]')) return true;
    if (/adhd|asrs|screening|evaluation-cost|creyos-adhd|online-adhd-test|adult-adhd-diagnosis|adhd-treatment-online/i.test(window.location.pathname)) {
      return true;
    }
    var text = (anchor && anchor.textContent ? anchor.textContent : '').toLowerCase();
    return /adhd|screening|assessment|evaluation/.test(text);
  }

  function buildAcceptanceUrl(baseHref, sourcePath) {
    var c = cfg();
    var f = c.fields || FALLBACK.fields;
    var ts = new Date().toISOString();
    var url = new URL(baseHref, window.location.origin);
    url.searchParams.set(f.timestamp, ts);
    url.searchParams.set(f.source, sourcePath || window.location.pathname + window.location.search);
    url.searchParams.set(f.version, c.legalDocumentVersion || FALLBACK.legalDocumentVersion);
    url.searchParams.set(f.terms, 'true');
    url.searchParams.set(f.privacy, 'true');
    url.searchParams.set(f.npp, 'true');
    return url.toString();
  }

  var modalEl = null;
  var pendingHref = null;

  function ensureModal() {
    if (modalEl) return modalEl;
    var c = cfg();
    var copy = c.copy || FALLBACK.copy;
    var links = c.legalLinks || FALLBACK.legalLinks;

    modalEl = document.createElement('div');
    modalEl.className = 'ghl-legal-gate';
    modalEl.id = 'siya-ghl-legal-gate';
    modalEl.setAttribute('role', 'dialog');
    modalEl.setAttribute('aria-modal', 'true');
    modalEl.setAttribute('aria-labelledby', 'siya-ghl-legal-gate-title');
    modalEl.hidden = true;

    modalEl.innerHTML =
      '<div class="ghl-legal-gate__backdrop" data-ghl-gate-dismiss></div>' +
      '<div class="ghl-legal-gate__panel">' +
      '<h2 id="siya-ghl-legal-gate-title" class="ghl-legal-gate__title">' +
      escapeHtml(copy.modalTitle) +
      '</h2>' +
      '<form class="ghl-legal-gate__form" id="siya-ghl-legal-gate-form">' +
      '<fieldset class="ghl-legal-gate__checks">' +
      '<legend class="visually-hidden">Legal acceptance</legend>' +
      checkboxRow('siya-legal-terms', 'I agree to the', 'Terms of Use', links.terms) +
      checkboxRow('siya-legal-privacy', 'I acknowledge the', 'Privacy Policy', links.privacy) +
      checkboxRow('siya-legal-npp', 'I acknowledge the', 'Notice of Privacy Practices', links.npp) +
      '</fieldset>' +
      '<p class="ghl-legal-gate__adhd" id="siya-ghl-adhd-disclaimer" hidden>' +
      escapeHtml(copy.adhdDisclaimer) +
      '</p>' +
      '<p class="ghl-legal-gate__confirm">' +
      escapeHtml(copy.submitConfirmation) +
      '</p>' +
      '<p class="ghl-legal-gate__links">' +
      '<a href="' +
      links.terms +
      '" target="_blank" rel="noopener">Terms of Use</a>' +
      ' <span aria-hidden="true">|</span> ' +
      '<a href="' +
      links.privacy +
      '" target="_blank" rel="noopener">Privacy Policy</a>' +
      ' <span aria-hidden="true">|</span> ' +
      '<a href="' +
      links.npp +
      '" target="_blank" rel="noopener">Notice of Privacy Practices</a>' +
      '</p>' +
      '<p class="ghl-legal-gate__error" id="siya-ghl-legal-gate-error" role="alert" hidden>Please accept all three policies to continue.</p>' +
      '<div class="ghl-legal-gate__actions">' +
      '<button type="button" class="button secondary" data-ghl-gate-dismiss>' +
      escapeHtml(copy.modalCancel) +
      '</button>' +
      '<button type="submit" class="button">' +
      escapeHtml(copy.modalSubmit) +
      '</button>' +
      '</div>' +
      '</form>' +
      '</div>';

    document.body.appendChild(modalEl);

    modalEl.addEventListener('click', function (e) {
      if (e.target.closest('[data-ghl-gate-dismiss]')) closeModal();
    });

    var form = modalEl.querySelector('#siya-ghl-legal-gate-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var terms = modalEl.querySelector('#siya-legal-terms');
      var privacy = modalEl.querySelector('#siya-legal-privacy');
      var npp = modalEl.querySelector('#siya-legal-npp');
      var err = modalEl.querySelector('#siya-ghl-legal-gate-error');
      if (!terms.checked || !privacy.checked || !npp.checked) {
        err.hidden = false;
        return;
      }
      err.hidden = true;
      if (!pendingHref) return closeModal();
      var dest = buildAcceptanceUrl(pendingHref, window.location.pathname + window.location.search);
      closeModal();
      window.open(dest, '_blank', 'noopener,noreferrer');
    });

    return modalEl;
  }

  function checkboxRow(id, prefix, linkLabel, linkPath) {
    return (
      '<label class="ghl-legal-gate__check">' +
      '<input type="checkbox" id="' +
      id +
      '" name="' +
      id +
      '" required />' +
      '<span>' +
      escapeHtml(prefix) +
      ' <a href="' +
      linkPath +
      '" target="_blank" rel="noopener">' +
      escapeHtml(linkLabel) +
      '</a></span>' +
      '</label>'
    );
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function openModal(href, anchor) {
    pendingHref = href;
    var m = ensureModal();
    var adhd = modalEl.querySelector('#siya-ghl-adhd-disclaimer');
    adhd.hidden = !isAdhdContext(anchor);
    ['siya-legal-terms', 'siya-legal-privacy', 'siya-legal-npp'].forEach(function (id) {
      var el = modalEl.querySelector('#' + id);
      if (el) el.checked = false;
    });
    var err = modalEl.querySelector('#siya-ghl-legal-gate-error');
    if (err) err.hidden = true;
    m.hidden = false;
    document.body.classList.add('ghl-legal-gate-open');
    var first = modalEl.querySelector('input[type="checkbox"]');
    if (first) first.focus();
  }

  function closeModal() {
    if (!modalEl) return;
    modalEl.hidden = true;
    document.body.classList.remove('ghl-legal-gate-open');
    pendingHref = null;
  }

  document.addEventListener(
    'click',
    function (e) {
      var a = e.target.closest('a[href]');
      if (!a || a.dataset.ghlBypass === 'true') return;
      if (!isGhlIntakeHref(a.getAttribute('href'))) return;
      e.preventDefault();
      e.stopPropagation();
      openModal(a.href, a);
    },
    true,
  );

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalEl && !modalEl.hidden) closeModal();
  });

  window.SiyaGhlLegalGate = {
    buildAcceptanceUrl: buildAcceptanceUrl,
    isGhlIntakeHref: isGhlIntakeHref,
    openModal: openModal,
    closeModal: closeModal,
  };
})();
