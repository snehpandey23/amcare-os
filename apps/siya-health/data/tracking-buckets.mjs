/**
 * Tracking buckets for siya.health. injectGtmAndTracking and the build audit
 * both use this. A new /answers, /blog, /guides, or /labs article is bucket A
 * without a per-file edit.
 *
 * A — condition or treatment content. No Meta, GTM, or siya-tracking.
 * B — care-start or employer inquiry. Tracking stays until legal says otherwise.
 * C — general pages. Existing consent-mode rules still apply.
 *
 * Hold: clinician profiles, /providers, /telehealth, /social, and /siya-circle
 * stay bucket C, but tags stay off until the same legal review as bucket B.
 * The build must not add tags there just because chrome runs on those pages.
 */

function norm(relPath) {
  return String(relPath || '').replace(/^\.\//, '').replace(/\\/g, '/');
}

/** Same surfaces as 96c11388: intake, booking, redirects, screening. */
export function isPatientCareFlowPage(relPath) {
  const p = norm(relPath);
  return (
    /^intake(\/|$)/i.test(p) ||
    /^book-appointment\.html$/i.test(p) ||
    /^redirect\//i.test(p) ||
    /^adhd-screening\.html$/i.test(p) ||
    /^adhd-screening-results\.html$/i.test(p) ||
    /^online-adhd-test\.html$/i.test(p)
  );
}

const BUCKET_B = new Set([
  'employers.html',
  'primary-urgent-care.html',
  'answers/meet-and-greet-telehealth-expectations.html',
]);

/** Under answers/ or blog/ but not condition content. */
const BUCKET_C_EXCEPTIONS = new Set([
  'answers/index.html',
  'answers/is-telehealth-legitimate.html',
  'blog/index.html',
]);

const BUCKET_A_FILES = new Set([
  'adhd-care.html',
  'adhd-diagnosis-texas.html',
  'adhd-evaluation-california.html',
  'adhd-evaluation-cost.html',
  'adhd-evaluation-texas.html',
  'adult-adhd-california.html',
  'brain-fog.html',
  'creyos-adhd-testing.html',
  'fatigue.html',
  'mens-health-longevity.html',
  'prescriptions.html',
  'preventive-care.html',
  'primary-care.html',
  'weight-loss-metabolic-health.html',
  'womens-health.html',
  'womens-midlife-health.html',
]);

/** Tag-free until legal reviews them. Not bucket A. */
export function isTrackingHoldPage(relPath) {
  const p = norm(relPath);
  return (
    p === 'telehealth.html' ||
    p === 'social.html' ||
    p === 'siya-circle.html' ||
    p.startsWith('providers/')
  );
}

export function trackingBucket(relPath) {
  const p = norm(relPath);
  if (BUCKET_B.has(p)) return 'B';
  if (BUCKET_C_EXCEPTIONS.has(p)) return 'C';
  if (p.startsWith('answers/') || p.startsWith('blog/') || p.startsWith('guides/')) return 'A';
  if (p.startsWith('labs/') && p !== 'labs.html') return 'A';
  if (p.startsWith('adhd-care/')) return 'A';
  if (BUCKET_A_FILES.has(p)) return 'A';
  return 'C';
}

/** Meta, GTM, and siya-tracking must not be present. B stays tracked. */
export function marketingTrackingForbidden(relPath) {
  const p = norm(relPath);
  if (p === 'employers/demo.html') return true;
  if (p.startsWith('internal/')) return true;
  if (isPatientCareFlowPage(p)) return true;
  if (isTrackingHoldPage(p)) return true;
  return trackingBucket(p) === 'A';
}
