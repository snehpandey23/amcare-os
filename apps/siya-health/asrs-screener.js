/**
 * Siya screening flow: topic chooser, then ASRS v1.1 6-Question ADHD Screener
 * Deep link: /adhd-screening?start=asrs (Sprint A), ?adhd=1, ?path=adhd, or #adhd → skip chooser
 *
 * Mobile UX (2026-08-11): auto-advance on answer select; visible nudge if Next
 * with no answer; body class hides concierge launcher during questionnaire.
 */
(function () {
  'use strict';

  var STEP_CHOOSE = -1;
  var STEP_INTRO = 0;
  var STEP_RESULTS = 7;
  var RESULTS_PAGE = '/adhd-screening-results';
  var REDIRECT_DELAY_MS = 250;
  var AUTO_ADVANCE_MS = 180;
  var POSITIVE_THRESHOLD = 4; // 4+ Often/Very Often = positive screen (not a diagnosis)
  var SELECT_NUDGE = 'Please select an answer to continue.';

  var container = document.getElementById('asrs-screener');
  if (!container) return;

  var steps = container.querySelectorAll('.asrs-step');
  var currentStep = STEP_CHOOSE;
  var answers = [null, null, null, null, null, null];
  var asrsEntrySource = 'organic_chooser';
  var completionRedirectScheduled = false;
  var autoAdvanceTimer = null;

  function pushSiyaEvent(eventName, detail) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: eventName, page_path: window.location.pathname };
    if (detail) {
      Object.keys(detail).forEach(function (key) {
        payload[key] = detail[key];
      });
    }
    window.dataLayer.push(payload);
  }

  function shouldSkipChooser() {
    var params = new URLSearchParams(window.location.search);
    if (params.get('start') === 'asrs') return true;
    if (params.get('adhd') === '1' || params.get('path') === 'adhd') return true;
    if (window.location.hash === '#adhd') return true;
    return false;
  }

  function setQuestionnaireActive(active) {
    document.body.classList.toggle('asrs-questionnaire-active', !!active);
  }

  function clearAutoAdvance() {
    if (autoAdvanceTimer) {
      window.clearTimeout(autoAdvanceTimer);
      autoAdvanceTimer = null;
    }
  }

  function ensureNudgeEl(stepEl) {
    if (!stepEl) return null;
    var existing = stepEl.querySelector('.asrs-answer-nudge');
    if (existing) return existing;
    var nudge = document.createElement('p');
    nudge.className = 'asrs-answer-nudge';
    nudge.setAttribute('role', 'status');
    nudge.setAttribute('aria-live', 'polite');
    nudge.hidden = true;
    var nav = stepEl.querySelector('.asrs-nav');
    if (nav) {
      stepEl.insertBefore(nudge, nav);
    } else {
      stepEl.appendChild(nudge);
    }
    return nudge;
  }

  function clearNudge(stepIndex) {
    var stepEl = container.querySelector('.asrs-step[data-step="' + stepIndex + '"]');
    var nudge = stepEl && stepEl.querySelector('.asrs-answer-nudge');
    if (nudge) {
      nudge.hidden = true;
      nudge.textContent = '';
    }
    if (stepEl) stepEl.classList.remove('asrs-step--needs-answer');
  }

  function showNudge(stepIndex) {
    var stepEl = container.querySelector('.asrs-step[data-step="' + stepIndex + '"]');
    if (!stepEl) return;
    var nudge = ensureNudgeEl(stepEl);
    nudge.textContent = SELECT_NUDGE;
    nudge.hidden = false;
    stepEl.classList.add('asrs-step--needs-answer');
    try {
      nudge.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } catch (e) {}
  }

  function showStep(stepIndex) {
    clearAutoAdvance();
    currentStep = stepIndex;
    setQuestionnaireActive(stepIndex >= 1 && stepIndex <= 6);

    steps.forEach(function (step) {
      var stepNum = parseInt(step.getAttribute('data-step'), 10);
      if (stepNum === stepIndex) {
        step.classList.add('asrs-step-active');
        step.removeAttribute('hidden');
        step.setAttribute('aria-hidden', 'false');
      } else {
        step.classList.remove('asrs-step-active');
        step.setAttribute('hidden', '');
        step.setAttribute('aria-hidden', 'true');
      }
    });

    if (stepIndex >= 1 && stepIndex <= 6) {
      clearNudge(stepIndex);
      try {
        var active = container.querySelector('.asrs-step-active');
        if (active) active.scrollIntoView({ block: 'start', behavior: 'smooth' });
      } catch (e) {}
    }

    if (stepIndex === STEP_RESULTS) {
      setQuestionnaireActive(false);
      completeScreeningAndRedirect();
    }

    if (stepIndex === STEP_INTRO) {
      pushSiyaEvent('asrs_intro_view', {
        entry_source: asrsEntrySource,
        query_string: window.location.search || '',
      });
    }

    if (stepIndex === STEP_CHOOSE || stepIndex === STEP_INTRO) {
      setQuestionnaireActive(false);
    }
  }

  function getSelectedValue(questionNum) {
    var radio = container.querySelector('input[name="q' + questionNum + '"]:checked');
    return radio ? parseInt(radio.value, 10) : null;
  }

  function calculateScore() {
    var score = 0;
    for (var i = 1; i <= 6; i++) {
      var val = getSelectedValue(i);
      if (val === 1) score++;
    }
    return score;
  }

  function resultsPageUrl(score) {
    var params = new URLSearchParams();
    params.set('from', 'asrs');
    params.set('score', String(score));
    params.set('entry', asrsEntrySource);
    return RESULTS_PAGE + '?' + params.toString();
  }

  /** Fire completion events, show brief handoff UI, then redirect to dedicated results page. */
  function completeScreeningAndRedirect() {
    var score = calculateScore();
    var scoreEl = document.getElementById('asrs-score-para');
    var messageEl = document.getElementById('asrs-results-message');
    var ctaBlock = container.querySelector('.asrs-cta-completion');
    var destination = resultsPageUrl(score);

    var isPositive = score >= POSITIVE_THRESHOLD;
    if (scoreEl) {
      scoreEl.textContent =
        'Result: ' +
        (isPositive ? 'positive' : 'negative') +
        ' screen (' +
        score +
        ' of 6 in the "Often" or "Very Often" range).';
    }

    if (messageEl) {
      messageEl.innerHTML =
        '<p><strong>Your screening result is ' +
        (isPositive ? 'positive' : 'negative') +
        '.</strong> This screening is not a diagnosis. Taking you to next-step options…</p>' +
        '<p class="cta-microcopy">If you are not redirected, <a href="' +
        destination +
        '">continue to your ADHD screening results</a>.</p>';
    }

    if (ctaBlock) {
      ctaBlock.innerHTML =
        '<a class="button ds-button ds-button--primary" href="' +
        destination +
        '" data-siya-track="screening-results-continue" data-siya-location="screening-results-handoff">Continue to next steps</a>';
    }

    var detail = {
      funnel: 'adhd_california',
      page_path: window.location.pathname,
      page_location: window.location.href,
      conversion_type: 'screening_complete',
      asrs_score: score,
      screening_outcome: isPositive ? 'positive' : 'negative',
      entry_source: asrsEntrySource,
      next_page: RESULTS_PAGE,
    };

    pushSiyaEvent('adhd_screening_complete', detail);
    pushSiyaEvent('asrs_results_view', {
      entry_source: asrsEntrySource,
      score: score,
      screening_outcome: isPositive ? 'positive' : 'negative',
      next_page: RESULTS_PAGE,
    });
    /* Legacy alias preserved for existing GTM tags */
    pushSiyaEvent('screening_complete', detail);
    if (window.siyaTrack) {
      window.siyaTrack('adhd_screening_complete', detail);
      window.siyaTrack('screening_complete', detail);
    }

    if (completionRedirectScheduled) return;
    completionRedirectScheduled = true;
    window.setTimeout(function () {
      window.location.assign(destination);
    }, REDIRECT_DELAY_MS);
  }

  function goNext(opts) {
    opts = opts || {};
    var fromAuto = !!opts.fromAutoAdvance;

    if (currentStep >= 1 && currentStep <= 6) {
      var val = getSelectedValue(currentStep);
      if (val === null) {
        if (!fromAuto) showNudge(currentStep);
        return;
      }
      clearNudge(currentStep);
      answers[currentStep - 1] = val;
      if (currentStep < 6) {
        showStep(currentStep + 1);
      } else {
        showStep(STEP_RESULTS);
      }
      return;
    }

    if (currentStep === 0) {
      showStep(1);
    }
  }

  function goBack() {
    clearAutoAdvance();
    if (currentStep > 1) {
      showStep(currentStep - 1);
    } else if (currentStep === 1) {
      showStep(STEP_INTRO);
    }
  }

  function scheduleAutoAdvance() {
    clearAutoAdvance();
    var stepAtSchedule = currentStep;
    autoAdvanceTimer = window.setTimeout(function () {
      autoAdvanceTimer = null;
      if (currentStep !== stepAtSchedule) return;
      goNext({ fromAutoAdvance: true });
    }, AUTO_ADVANCE_MS);
  }

  function applyInitialStep() {
    if (shouldSkipChooser()) {
      asrsEntrySource = 'deep_link';
      showStep(STEP_INTRO);
    } else {
      showStep(STEP_CHOOSE);
    }
  }

  function bindEvents() {
    var chooseAdhd = document.getElementById('asrs-choose-adhd');
    if (chooseAdhd) {
      chooseAdhd.addEventListener('click', function () {
        asrsEntrySource = 'chooser';
        showStep(STEP_INTRO);
      });
    }

    var backToChoose = document.getElementById('asrs-back-to-choose');
    if (backToChoose) {
      backToChoose.addEventListener('click', function () {
        showStep(STEP_CHOOSE);
      });
    }

    var startBtn = document.getElementById('asrs-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', function () {
        showStep(1);
      });
    }

    for (var i = 1; i <= 6; i++) {
      (function (q) {
        var nextBtn = document.getElementById('asrs-next-' + q);
        var backBtn = document.getElementById('asrs-back-' + q);
        if (nextBtn) {
          nextBtn.addEventListener('click', function () {
            goNext({ fromAutoAdvance: false });
          });
        }
        if (backBtn) backBtn.addEventListener('click', goBack);
        ensureNudgeEl(container.querySelector('.asrs-step[data-step="' + q + '"]'));
      })(i);
    }

    container.querySelectorAll('.asrs-options input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (currentStep < 1 || currentStep > 6) return;
        clearNudge(currentStep);
        var nextBtn = document.getElementById('asrs-next-' + currentStep);
        if (nextBtn) nextBtn.classList.add('asrs-next--ready');
        scheduleAutoAdvance();
      });
    });
  }

  function init() {
    applyInitialStep();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
