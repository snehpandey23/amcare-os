/**
 * Employer inquiry form — POST to same-origin /api/employer-inquiry (proxied to auth API).
 */
(function () {
  'use strict';

  var form = document.getElementById('employer-inquiry-form');
  if (!form) return;

  var errEl = document.getElementById('employer-inquiry-error');
  var okEl = document.getElementById('employer-inquiry-success');
  var submitBtn = form.querySelector('button[type="submit"]');

  function pushEvent(name, params) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, params || {}));
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, params || {});
    }
  }

  function selectedStates() {
    var boxes = form.querySelectorAll('input[name="state"]:checked');
    var out = [];
    for (var i = 0; i < boxes.length; i++) out.push(boxes[i].value);
    return out.join(', ');
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
      companyName: String(fd.get('companyName') || '').trim(),
      contactName: String(fd.get('contactName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      phone: String(fd.get('phone') || '').trim(),
      employeeCount: String(fd.get('employeeCount') || '').trim(),
      states: selectedStates(),
      message: String(fd.get('message') || '').trim(),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') || '').trim(),
      sourceUrl: window.location.href,
    };

    if (submitBtn) submitBtn.disabled = true;

    fetch('/api/employer-inquiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().catch(function () {
          return {};
        }).then(function (body) {
          return { ok: res.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok) {
          throw new Error((result.body && result.body.error) || 'Unable to submit inquiry.');
        }
        form.hidden = true;
        if (okEl) okEl.hidden = false;
        if (result.body && result.body.emailSent === false && okEl) {
          okEl.innerHTML =
            'Thank you — we received your inquiry and saved it securely. ' +
            'Email confirmation may be delayed; our team will follow up. ' +
            'For individual clinical care, use <a href="/redirect/meet-greet" data-siya-track="meet_greet_click">Book Free Meet &amp; Greet</a>.';
        }
        pushEvent('employer_inquiry_submit', {
          page_path: window.location.pathname,
          page_location: window.location.href,
          funnel: 'employer_b2b',
          audience: 'employer',
          inquiry_id: result.body && result.body.id,
        });
        pushEvent('employer_inquiry_click', {
          page_path: window.location.pathname,
          page_location: window.location.href,
          funnel: 'employer_b2b',
          audience: 'employer',
          cta_track: 'employer_inquiry_submit',
        });
      })
      .catch(function (err) {
        if (errEl) {
          errEl.textContent = err.message || 'Unable to submit inquiry. Please email care@siya.health.';
          errEl.hidden = false;
        }
        if (submitBtn) submitBtn.disabled = false;
      });
  });
})();
