/**
 * Provider careers inquiry form handler.
 */
(function () {
  'use strict';

  var form = document.getElementById('careers-inquiry-form');
  if (!form) return;

  var errEl = document.getElementById('careers-inquiry-error');
  var okEl = document.getElementById('careers-inquiry-success');
  var submitBtn = form.querySelector('button[type="submit"]');

  if (typeof gtag === 'function' && /\/join-our-team\/?$/.test(location.pathname)) {
    gtag('event', 'provider_careers_page_view', { page_path: location.pathname });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    if (!form.checkValidity()) {
      if (errEl) {
        errEl.textContent = 'Please complete the required fields.';
        errEl.hidden = false;
      }
      form.reportValidity();
      return;
    }

    var fd = new FormData(form);
    var payload = {
      fullName: String(fd.get('fullName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      credential: String(fd.get('credential') || '').trim(),
      licensedStates: String(fd.get('licensedStates') || '').trim(),
      message: String(fd.get('message') || '').trim(),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') || '').trim(),
      sourceUrl: window.location.href,
    };

    if (submitBtn) submitBtn.disabled = true;

    fetch('/api/provider-careers-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res
          .json()
          .catch(function () {
            return {};
          })
          .then(function (body) {
            return { ok: res.ok, body: body };
          });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error((result.body && result.body.error) || 'Unable to submit inquiry.');
        }
        form.hidden = true;
        if (okEl) okEl.hidden = false;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'provider_careers_inquiry_submit', page_path: location.pathname });
        if (typeof gtag === 'function') {
          gtag('event', 'provider_careers_inquiry_submit', { page_path: location.pathname });
        }
      })
      .catch(function (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Something went wrong. Please try again.';
          errEl.hidden = false;
        }
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
