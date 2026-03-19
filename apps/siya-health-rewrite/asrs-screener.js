/**
 * ASRS v1.1 6-Question ADHD Screener
 * Step-by-step flow with instant results and CTA to book discovery call.
 */
(function () {
  'use strict';

  var STEP_INTRO = 0;
  var STEP_RESULTS = 7;
  var THRESHOLD = 4; // 4+ Often/Very Often = positive screen

  var container = document.getElementById('asrs-screener');
  if (!container) return;

  var steps = container.querySelectorAll('.asrs-step');
  var currentStep = 0;
  var answers = [null, null, null, null, null, null];

  function showStep(stepIndex) {
    currentStep = stepIndex;
    steps.forEach(function (step, i) {
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
        messageEl.innerHTML = '<p><strong>Your responses don\'t strongly suggest ADHD,</strong> but if you still have concerns about focus, organization, or other symptoms, a discovery call can help. A licensed provider can answer your questions.</p>';
      }
    }
  }

  function goNext() {
    if (currentStep >= 0 && currentStep < 6) {
      var val = getSelectedValue(currentStep);
      if (val === null && currentStep > 0) return; // require answer except on intro
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
    }
  }

  function bindEvents() {
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

    // Allow Enter to advance when a radio is selected
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
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
