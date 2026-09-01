/**
 * Phone-first core set — money / trust / funnel URLs that must pass mobile bar.
 * Full policy: docs/PHONE-FIRST.md
 *
 * Not the full sitemap (~181). Ads LPs also have a stricter live gate:
 * npm run smoke:ads-landing-live
 */
export const PHONE_VIEWPORT = { width: 390, height: 844, device: 'iPhone 13' };

/** Soft Lighthouse mobile Performance floor for core-set audits (not ads hard gate). */
export const CORE_LH_PERF_FLOOR = 55;

/** Hard LCP ceiling (seconds) when promoting a page into an automated gate. */
export const CORE_LCP_MAX_SEC = 12;

/**
 * @typedef {{ id: string, path: string, role: string, symptoms?: string | null, gate?: 'ads' | 'core' }} PhoneFirstPage
 */

/** @type {PhoneFirstPage[]} */
export const CORE_PAGES = [
  { id: 'home', path: '/', role: 'brand / entry', symptoms: null, gate: 'core' },
  { id: 'adhd-care', path: '/adhd-care', role: 'ADHD hub', symptoms: '#symptoms', gate: 'core' },
  { id: 'pricing', path: '/pricing', role: 'pricing / conversion', symptoms: null, gate: 'core' },
  { id: 'adhd-screening', path: '/adhd-screening', role: 'screener funnel', symptoms: null, gate: 'core' },
  {
    id: 'adhd-evaluation-texas',
    path: '/adhd-evaluation-texas',
    role: 'Ads LP (TX)',
    symptoms: null,
    gate: 'ads',
  },
  {
    id: 'adhd-evaluation-california',
    path: '/adhd-evaluation-california',
    role: 'Ads LP (CA)',
    symptoms: null,
    gate: 'ads',
  },
  {
    id: 'adult-adhd-california',
    path: '/adult-adhd-california',
    role: 'CA SEO hub',
    symptoms: null,
    gate: 'core',
  },
  {
    id: 'weight-loss',
    path: '/weight-loss-metabolic-health',
    role: 'service hub',
    symptoms: '#weight-recognition',
    gate: 'core',
  },
  {
    id: 'telehealth',
    path: '/telehealth',
    role: 'service hub',
    symptoms: '#tele-recognition',
    gate: 'core',
  },
  {
    id: 'mens-health',
    path: '/mens-health-longevity',
    role: 'service hub',
    symptoms: '#mens-recognition',
    gate: 'core',
  },
  { id: 'labs', path: '/labs', role: 'labs hub', symptoms: '#why-labs', gate: 'core' },
  { id: 'intake', path: '/intake', role: 'booking / intake', symptoms: null, gate: 'core' },
];
