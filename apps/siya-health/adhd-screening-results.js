/**
 * ADHD screening results — read ASRS score from query and show outcome.
 * Threshold: 4+ of 6 "Often/Very Often" responses = positive screen (not a diagnosis).
 *
 * Tiers:
 *   score === 0     → negative
 *   1 <= score < 4  → borderline (DRAFT copy — clinical lead sign-off required)
 *   score >= 4      → positive
 *
 * Borderline publish gate (do not flip without clinical sign-off):
 *   BORDERLINE_TIER_PUBLISHED = false → scores 1–3 keep legacy negative UX publicly
 *   ?borderline_draft=1 → preview draft borderline copy for review / verification
 */
(function () {
  'use strict';

  var THRESHOLD = 4;
  /** @type {boolean} Set true only after clinical lead sign-off on borderline copy. */
  var BORDERLINE_TIER_PUBLISHED = false;

  var ASRS_DETAIL_HTML =
    'ASRS accuracy varies by study and population. In the WHO validation work that helped establish this 6-question screener, sensitivity was about 69% — meaning roughly <strong>1 in 3</strong> people with clinician-rated adult ADHD still screened negative (Kessler et al., 2005). Symptoms can also show up atypically or get masked by long-used coping strategies, and screens are less reliable when depression, anxiety, or other conditions are also in the mix. If this result does not match how daily life actually feels for you, a free Meet &amp; Greet is a low-pressure way to talk it through — not a diagnosis visit, and not a hard sell.';

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
  var borderlineDraftPreview = params.get('borderline_draft') === '1';
  var borderlineAllowed = BORDERLINE_TIER_PUBLISHED || borderlineDraftPreview;

  var outcome = 'unknown';
  if (hasScore) {
    if (score >= THRESHOLD) {
      outcome = 'positive';
    } else if (score >= 1 && borderlineAllowed) {
      outcome = 'borderline';
    } else {
      /* score === 0, or 1–3 while borderline draft is gated off */
      outcome = 'negative';
    }
  }

  if (detailEl) {
    detailEl.hidden = true;
    detailEl.textContent = '';
  }

  if (badgeEl) {
    badgeEl.classList.remove(
      'screening-outcome-badge--positive',
      'screening-outcome-badge--negative',
      'screening-outcome-badge--borderline',
    );
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
  } else if (outcome === 'borderline') {
    /* DRAFT COPY — NOT FINAL. Pending clinical lead review before BORDERLINE_TIER_PUBLISHED=true. */
    if (badgeEl) {
      badgeEl.hidden = false;
      badgeEl.textContent = 'Some symptoms noted';
      badgeEl.classList.add('screening-outcome-badge--borderline');
      badgeEl.setAttribute('data-copy-status', 'draft-pending-clinical-review');
    }
    titleEl.textContent = 'Your results show some ADHD-related symptoms';
    titleEl.setAttribute('data-copy-status', 'draft-pending-clinical-review');
    leadEl.textContent =
      'You marked ' +
      score +
      ' of 6 symptoms as often/very often — below the typical screening threshold, but this screening tool isn\'t perfectly sensitive. Some people with real ADHD score below this line. This result doesn\'t confirm or rule out ADHD.';
    leadEl.setAttribute('data-copy-status', 'draft-pending-clinical-review');
    if (detailEl) {
      detailEl.hidden = false;
      detailEl.innerHTML = ASRS_DETAIL_HTML;
    }
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
      detailEl.innerHTML = ASRS_DETAIL_HTML;
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
  if (outcome === 'borderline') {
    document.body.setAttribute('data-borderline-copy', 'draft-pending-clinical-review');
  } else {
    document.body.removeAttribute('data-borderline-copy');
  }

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'adhd_screening_results_view',
    page_path: window.location.pathname,
    asrs_score: hasScore ? score : null,
    screening_outcome: outcome,
    entry_source: params.get('entry') || '',
    borderline_draft: outcome === 'borderline' && !BORDERLINE_TIER_PUBLISHED,
  });
})();
