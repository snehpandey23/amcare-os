/**
 * Siya screening flow: topic chooser, then ASRS v1.1 6-Question ADHD Screener
 * Deep link: /adhd-screening?start=asrs (Sprint A), ?adhd=1, ?path=adhd, or #adhd → skip chooser
 */
(function () {
  'use strict';

  var STEP_CHOOSE = -1;
  var STEP_INTRO = 0;
  var STEP_RESULTS = 7;
  var THRESHOLD = 4; // 4+ Often/Very Often = positive screen

  var container = document.getElementById('asrs-screener');
  if (!container) return;

  var steps = container.querySelectorAll('.asrs-step');
  var currentStep = STEP_CHOOSE;
  var answers = [null, null, null, null, null, null];
  var asrsEntrySource = 'organic_chooser';

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

  function showStep(stepIndex) {
    currentStep = stepIndex;
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

    if (stepIndex === STEP_RESULTS) {
      showResults();
      pushSiyaEvent('asrs_results_view', {
        entry_source: asrsEntrySource,
        score: calculateScore(),
      });
    }

    if (stepIndex === STEP_INTRO) {
      pushSiyaEvent('asrs_intro_view', {
        entry_source: asrsEntrySource,
        query_string: window.location.search || '',
      });
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

  function showResults() {
    var score = calculateScore();
    var scoreEl = document.getElementById('asrs-score-para');
    var messageEl = document.getElementById('asrs-results-message');

    if (scoreEl) {
      scoreEl.textContent = 'You had ' + score + ' response(s) in the "Often" or "Very Often" range.';
    }

    if (messageEl) {
      if (score >= THRESHOLD) {
        messageEl.innerHTML = '<p><strong>Your responses suggest ADHD may be worth exploring.</strong> A licensed provider can help you understand next steps and whether a full evaluation makes sense for you.</p>';
      } else {
        messageEl.innerHTML = '<p><strong>Your responses don\'t strongly suggest ADHD,</strong> but if you still have concerns about focus, organization, or other symptoms, a free ADHD screening or secure medical chat can help. A licensed provider can answer your questions.</p>';
      }
    }
  }

  function goNext() {
    if (currentStep >= 0 && currentStep < 6) {
      var val = getSelectedValue(currentStep);
      if (val === null && currentStep > 0) return;
      if (currentStep > 0) answers[currentStep - 1] = val;
      showStep(currentStep + 1);
    } else if (currentStep === 6) {
      var lastVal = getSelectedValue(6);
      if (lastVal === null) return;
      answers[5] = lastVal;
      showStep(STEP_RESULTS);
    }
  }

  function goBack() {
    if (currentStep > 1) {
      showStep(currentStep - 1);
    } else if (currentStep === 1) {
      showStep(STEP_INTRO);
    }
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
    if (startBtn) startBtn.addEventListener('click', function () { showStep(1); });

    for (var i = 1; i <= 6; i++) {
      (function (q) {
        var nextBtn = document.getElementById('asrs-next-' + q);
        var backBtn = document.getElementById('asrs-back-' + q);
        if (nextBtn) nextBtn.addEventListener('click', goNext);
        if (backBtn) backBtn.addEventListener('click', goBack);
      })(i);
    }

    container.querySelectorAll('.asrs-options input[type="radio"]').forEach(function (radio) {
      radio.addEventListener('change', function () {
        if (currentStep >= 1 && currentStep <= 6) {
          var nextBtn = document.getElementById('asrs-next-' + currentStep);
          if (nextBtn) nextBtn.focus();
        }
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
