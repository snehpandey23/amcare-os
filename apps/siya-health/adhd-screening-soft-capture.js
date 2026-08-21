/**
 * ADHD screening results — optional Siya Circle soft capture.
 * Mounts outside the primary CTA cluster. Trigger C: dwell ~45s OR scroll past CTAs.
 * Held-out A/A: 50% control never sees the prompt (sticky session bucket).
 */
(function () {
  'use strict';

  var SOURCE = 'adhd-screening-results-soft-capture';
  var OPT_IN_COPY =
    'Yes, send me occasional ADHD care info and updates from Siya Health. I can unsubscribe anytime.';
  var DWELL_MS = 45000;
  var AA_HOLD_PCT = 0.5;
  var STORAGE_BUCKET = 'siya_soft_capture_bucket';
  var STORAGE_SUPPRESS = 'siya_soft_capture_suppress';
  var STORAGE_CONSENT_LOG = 'siya_email_consent_log';
  /* Canonical Siya Circle join (GHL) — matches live /siya-circle + homepage footer.
     CarePatron form XRMFIPAWuXhTlncGx now 403s / auth-errors (verified 2026-08-21). */
  var SIYA_CIRCLE_FORM =
    'https://link.yourmarketingai.com/widget/form/HmvqrDVq3tq3qv6rkCjl';

  var mount = document.getElementById('screening-soft-capture');
  if (!mount) return;

  var ctaBlock = document.querySelector('.screening-results-hero-cta');
  var meetClicked = false;
  var shown = false;
  var dismissed = false;
  var dwellTimer = null;
  var scrollObs = null;

  function pushDl(payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
    if (typeof window.gtag === 'function') {
      var name = payload.event;
      if (!name) return;
      var params = {};
      Object.keys(payload).forEach(function (k) {
        if (k !== 'event') params[k] = payload[k];
      });
      window.gtag('event', name, params);
    }
  }

  function outcomeMeta() {
    var outcome = document.body.getAttribute('data-screening-outcome') || 'unknown';
    var score = document.body.getAttribute('data-asrs-score') || '';
    return { outcome: outcome, asrs_score: score };
  }

  function getBucket() {
    try {
      var existing = sessionStorage.getItem(STORAGE_BUCKET);
      if (existing === 'control' || existing === 'treatment') return existing;
      var bucket = Math.random() < AA_HOLD_PCT ? 'control' : 'treatment';
      sessionStorage.setItem(STORAGE_BUCKET, bucket);
      return bucket;
    } catch (e) {
      return 'treatment';
    }
  }

  function isSuppressed() {
    try {
      return (
        sessionStorage.getItem(STORAGE_SUPPRESS) === '1' ||
        localStorage.getItem(STORAGE_SUPPRESS) === '1'
      );
    } catch (e) {
      return false;
    }
  }

  function suppress(permanent) {
    try {
      sessionStorage.setItem(STORAGE_SUPPRESS, '1');
      if (permanent) localStorage.setItem(STORAGE_SUPPRESS, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function circleJoinUrl(meta, email) {
    var u = new URL(SIYA_CIRCLE_FORM);
    u.searchParams.set('utm_source', 'siya_health');
    u.searchParams.set('utm_medium', 'soft_capture');
    u.searchParams.set('utm_campaign', SOURCE);
    u.searchParams.set(
      'utm_content',
      [meta.outcome || 'unknown', meta.asrs_score || 'na'].join('_')
    );
    u.searchParams.set('siya_source', SOURCE);
    u.searchParams.set('siya_outcome', meta.outcome || 'unknown');
    if (meta.asrs_score) u.searchParams.set('siya_asrs_score', meta.asrs_score);
    /* Best-effort prefill — CarePatron may ignore unknown query keys */
    if (email) {
      u.searchParams.set('email', email);
      u.searchParams.set('Email', email);
    }
    return u.toString();
  }

  function saveConsentRecord(record) {
    try {
      var raw = localStorage.getItem(STORAGE_CONSENT_LOG);
      var list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) list = [];
      list.push(record);
      localStorage.setItem(STORAGE_CONSENT_LOG, JSON.stringify(list.slice(-50)));
    } catch (e) {
      /* ignore */
    }
  }

  function tearDownTriggers() {
    if (dwellTimer) {
      clearTimeout(dwellTimer);
      dwellTimer = null;
    }
    if (scrollObs) {
      scrollObs.disconnect();
      scrollObs = null;
    }
  }

  function buildMarkup() {
    var unsubscribeHref = SIYA_CIRCLE_FORM;
    mount.hidden = false;
    mount.innerHTML =
      '<aside class="screening-soft-capture" aria-labelledby="soft-capture-heading">' +
      '<div class="screening-soft-capture__inner">' +
      '<button type="button" class="screening-soft-capture__dismiss" data-soft-dismiss aria-label="Dismiss">' +
      '&times;</button>' +
      '<p class="screening-soft-capture__eyebrow">Optional</p>' +
      '<h2 id="soft-capture-heading" class="screening-soft-capture__title">Not ready yet?</h2>' +
      '<p class="screening-soft-capture__lead">Get occasional ADHD care info and updates.</p>' +
      '<form class="screening-soft-capture__form" novalidate>' +
      '<label class="screening-soft-capture__label" for="soft-capture-email">Email</label>' +
      '<input id="soft-capture-email" class="screening-soft-capture__input" type="email" ' +
      'name="email" autocomplete="email" required placeholder="you@example.com" />' +
      '<label class="screening-soft-capture__check">' +
      '<input type="checkbox" name="opt_in" value="1" />' +
      '<span>' +
      OPT_IN_COPY +
      '</span></label>' +
      '<p class="screening-soft-capture__legal">' +
      '<a href="/legal/privacy-policy">Privacy Policy</a>' +
      ' · <a href="' +
      unsubscribeHref +
      '" target="_blank" rel="noopener noreferrer">Unsubscribe / manage</a>' +
      '</p>' +
      '<div class="screening-soft-capture__actions">' +
      '<button type="submit" class="screening-soft-capture__submit" disabled>Send updates</button>' +
      '<button type="button" class="screening-soft-capture__no" data-soft-dismiss>No thanks</button>' +
      '</div>' +
      '<p class="screening-soft-capture__note">A few times a month max. Not medical advice. Not a diagnosis. ' +
      'Joins <a href="/siya-circle">Siya Circle</a> — every email includes unsubscribe.</p>' +
      '</form>' +
      '<p class="screening-soft-capture__status" hidden></p>' +
      '</div></aside>';
  }

  function wireForm() {
    var form = mount.querySelector('form');
    var email = mount.querySelector('#soft-capture-email');
    var check = mount.querySelector('input[name="opt_in"]');
    var submit = mount.querySelector('.screening-soft-capture__submit');
    var status = mount.querySelector('.screening-soft-capture__status');
    if (!form || !email || !check || !submit) return;

    function syncSubmit() {
      var ok =
        check.checked &&
        email.value.trim().length > 3 &&
        email.checkValidity();
      submit.disabled = !ok;
    }

    email.addEventListener('input', syncSubmit);
    check.addEventListener('change', syncSubmit);

    mount.querySelectorAll('[data-soft-dismiss]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        dismissed = true;
        suppress(false);
        mount.hidden = true;
        mount.innerHTML = '';
        tearDownTriggers();
        var meta = outcomeMeta();
        pushDl({
          event: 'screening_email_prompt_dismissed',
          soft_capture_bucket: getBucket(),
          soft_capture_source: SOURCE,
          screening_outcome: meta.outcome,
          asrs_score: meta.asrs_score || undefined,
        });
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      syncSubmit();
      if (submit.disabled) return;

      var meta = outcomeMeta();
      var consentedAt = new Date().toISOString();
      var emailVal = email.value.trim().toLowerCase();
      var record = {
        email: emailVal,
        source: SOURCE,
        screening_outcome: meta.outcome,
        asrs_score: meta.asrs_score || null,
        opt_in_copy: OPT_IN_COPY,
        consented_at: consentedAt,
        page_url: location.href.split('#')[0],
        consent_method: 'explicit_checkbox',
        destination: 'siya_circle_ghl',
      };
      saveConsentRecord(record);
      suppress(true);

      pushDl({
        event: 'screening_email_opt_in_submitted',
        soft_capture_bucket: getBucket(),
        soft_capture_source: SOURCE,
        screening_outcome: meta.outcome,
        asrs_score: meta.asrs_score || undefined,
        consent_method: 'explicit_checkbox',
        /* email intentionally omitted */
      });

      var joinUrl = circleJoinUrl(meta, emailVal);
      try {
        window.open(joinUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        /* ignore */
      }

      form.hidden = true;
      if (status) {
        status.hidden = false;
        status.innerHTML =
          'Thanks — finish joining <strong>Siya Circle</strong> in the tab that opened ' +
          '(unsubscribe is available there and in every email). ' +
          'You can still <a href="/redirect/meet-greet" data-siya-track="meet_greet_click" ' +
          'data-siya-location="soft-capture-success" data-conversion-goal="meetGreet">book a free Meet &amp; Greet</a> anytime.';
      }
    });
  }

  function showPrompt(reason) {
    if (shown || dismissed || meetClicked || isSuppressed()) return;
    if (getBucket() !== 'treatment') return;
    shown = true;
    tearDownTriggers();
    buildMarkup();
    wireForm();
    var meta = outcomeMeta();
    pushDl({
      event: 'screening_email_prompt_shown',
      soft_capture_bucket: 'treatment',
      soft_capture_source: SOURCE,
      soft_capture_trigger: reason,
      screening_outcome: meta.outcome,
      asrs_score: meta.asrs_score || undefined,
    });
  }

  function armTriggers() {
    if (getBucket() === 'control') {
      var meta = outcomeMeta();
      pushDl({
        event: 'screening_email_prompt_holdout',
        soft_capture_bucket: 'control',
        soft_capture_source: SOURCE,
        screening_outcome: meta.outcome,
        asrs_score: meta.asrs_score || undefined,
      });
      return;
    }
    if (isSuppressed() || meetClicked) return;

    dwellTimer = setTimeout(function () {
      showPrompt('dwell_45s');
    }, DWELL_MS);

    if (ctaBlock && 'IntersectionObserver' in window) {
      scrollObs = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) return;
            if (entry.boundingClientRect.bottom < 0) {
              showPrompt('scroll_past_ctas');
            }
          });
        },
        { threshold: 0, rootMargin: '0px' }
      );
      scrollObs.observe(ctaBlock);
    }

    function checkScrollPast() {
      if (!ctaBlock || shown || dismissed || meetClicked) return;
      if (ctaBlock.getBoundingClientRect().bottom < 0) {
        showPrompt('scroll_past_ctas');
      }
    }
    window.addEventListener('scroll', checkScrollPast, { passive: true });
    requestAnimationFrame(checkScrollPast);
  }

  function onMeetGreetClick(e) {
    var el = e.target && e.target.closest
      ? e.target.closest('[data-siya-track="meet_greet_click"], [data-conversion-goal="meetGreet"]')
      : null;
    if (!el) return;
    meetClicked = true;
    tearDownTriggers();
    if (shown && !mount.hidden) {
      mount.hidden = true;
      mount.innerHTML = '';
    }
    suppress(false);
  }

  /* Tag meet_greet clicks with bucket for A/A analysis */
  document.addEventListener(
    'click',
    function (e) {
      var el = e.target && e.target.closest
        ? e.target.closest('[data-siya-track="meet_greet_click"]')
        : null;
      if (!el) return;
      pushDl({
        event: 'soft_capture_meet_greet_context',
        soft_capture_bucket: getBucket(),
        soft_capture_prompt_shown: shown ? '1' : '0',
        soft_capture_source: SOURCE,
      });
      onMeetGreetClick(e);
    },
    true
  );

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', armTriggers);
  } else {
    armTriggers();
  }
})();
