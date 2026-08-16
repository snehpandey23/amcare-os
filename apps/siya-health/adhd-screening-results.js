/**
 * ADHD screening results — read ASRS score from query and show positive/negative outcome.
 * Threshold: 4+ of 6 "Often/Very Often" responses = positive screen (not a diagnosis).
 *
 * Negative copy (Option A, 2026-08-11): short lead above CTA; fuller ASRS limits note
 * below the primary button so Meet & Greet stays near the fold on mobile.
 */
(function () {
  'use strict';

  var THRESHOLD = 4;

  var titleEl = document.getElementById('screening-outcome-title');
  var leadEl = document.getElementById('screening-outcome-lead');
  var scoreEl = document.getElementById('screening-outcome-score');
  var badgeEl = document.getElementById('screening-outcome-badge');
  var detailEl = document.getElementById('screening-outcome-detail');
  if (!titleEl || !leadEl) return;

  var params = new URLSearchParams(window.location.search);
  var scoreRaw = params.get('score');
  var score = scoreRaw != null && scoreRaw !== '' ? parseInt(scoreRaw, 10) : NaN;
  var hasScore = !isNaN(score) && score >= 0 && score <= 6;

  var outcome = 'unknown';
  if (hasScore) {
    outcome = score >= THRESHOLD ? 'positive' : 'negative';
  }

  if (detailEl) {
    detailEl.hidden = true;
    detailEl.textContent = '';
  }

  if (outcome === 'positive') {
    if (badgeEl) {
      badgeEl.hidden = false;
      badgeEl.textContent = 'Positive screen';
      badgeEl.classList.add('screening-outcome-badge--positive');
    }
    titleEl.textContent = 'Your ADHD screening result is positive';
    leadEl.textContent =
      'Your responses suggest ADHD symptoms may be worth exploring with a licensed provider. A positive screen is not a diagnosis — book a free Meet & Greet to talk through next steps.';
  } else if (outcome === 'negative') {
    if (badgeEl) {
      badgeEl.hidden = false;
      badgeEl.textContent = 'Negative screen';
      badgeEl.classList.add('screening-outcome-badge--negative');
    }
    titleEl.textContent = 'Your ADHD screening result is negative';
    leadEl.textContent =
      "Your responses do not meet the threshold for a positive ASRS screen. That doesn't rule ADHD out, and it doesn't confirm it either — a short screener is not a diagnosis.";
    if (detailEl) {
      detailEl.hidden = false;
      detailEl.innerHTML =
        'ASRS accuracy varies by study and population. In the WHO validation work that helped establish this 6-question screener, sensitivity was about 69% — meaning roughly <strong>1 in 3</strong> people with clinician-rated adult ADHD still screened negative (Kessler et al., 2005). Symptoms can also show up atypically or get masked by long-used coping strategies, and screens are less reliable when depression, anxiety, or other conditions are also in the mix. If this result does not match how daily life actually feels for you, a free Meet &amp; Greet is a low-pressure way to talk it through — not a diagnosis visit, and not a hard sell.';
    }
  } else {
    titleEl.textContent = 'Your ADHD screening is complete';
    leadEl.textContent =
      'This screening is not a diagnosis. Book a free Meet & Greet to talk through what your screen means and what to do next.';
  }

  if (scoreEl && hasScore) {
    scoreEl.hidden = false;
    scoreEl.textContent =
      'You marked "Often" or "Very Often" on ' +
      score +
      ' of 6 questions. A score of ' +
      THRESHOLD +
      ' or higher is considered a positive ASRS screen.';
  }

  document.body.setAttribute('data-screening-outcome', outcome);
  if (hasScore) {
    document.body.setAttribute('data-asrs-score', String(score));
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'adhd_screening_results_view',
    page_path: window.location.pathname,
    asrs_score: hasScore ? score : null,
    screening_outcome: outcome,
    entry_source: params.get('entry') || '',
  });
})();
