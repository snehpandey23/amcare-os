/**
 * Siya Circle — first-party signup form handler.
 */
(function () {
  'use strict';

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

  var form = document.getElementById('siya-circle-signup-form');
  if (!form) return;

  var errEl = document.getElementById('siya-circle-signup-error');
  var okEl = document.getElementById('siya-circle-signup-success');
  var submitBtn = form.querySelector('button[type="submit"]');

  function selectedTopics() {
    var boxes = form.querySelectorAll('input[name="topic"]:checked');
    var out = [];
    for (var i = 0; i < boxes.length; i++) out.push(boxes[i].value);
    return out;
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
      firstName: String(fd.get('firstName') || '').trim(),
      email: String(fd.get('email') || '').trim(),
      topics: selectedTopics(),
      consent: fd.get('consent') === 'on',
      website: String(fd.get('website') || '').trim(),
      sourceUrl: window.location.href,
    };

    if (submitBtn) submitBtn.disabled = true;

    fetch('/api/siya-circle-signup', {
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
          throw new Error((result.body && result.body.error) || 'Unable to submit signup.');
        }
        form.hidden = true;
        if (okEl) okEl.hidden = false;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'siya_circle_signup_submit', page_path: location.pathname });
        if (typeof gtag === 'function') {
          gtag('event', 'siya_circle_signup_submit', { page_path: location.pathname });
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

  if (location.hash === '#siya-circle-signup') {
    var target = document.getElementById('siya-circle-signup');
    if (target && target.scrollIntoView) {
      setTimeout(function () {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }
})();
