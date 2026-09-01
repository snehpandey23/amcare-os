/**
 * Sitewide analytics IDs — GTM + Meta Pixel (consent-gated) in HTML.
 * Configure GA4 (G-*) and Google Ads (AW-*) tags inside the GTM container.
 */
export const TRACKING = {
  GTM_CONTAINER_ID: 'GTM-PLBD4TTQ',
  /** Reference only — managed inside GTM, not installed as raw gtag on pages */
  GA4_MEASUREMENT_ID: 'G-9WTQWHCTFT',
  /** Reference only — managed inside GTM, not installed as raw gtag on pages */
  GOOGLE_ADS_ID: 'AW-17553537456',
  /** Meta / Facebook Pixel — standard PageView install via scripts/meta-pixel.js */
  META_PIXEL_ID: '2150753979117600',
};

/**
 * Production marketing hosts only — fail closed for Vercel previews,
 * *.vercel.app aliases, localhost, and any non-siya.health host so staging
 * traffic cannot pollute GA4 (G-9WTQWHCTFT) / Ads / Meta.
 *
 * Allow: siya.health and *.siya.health (www, adhd, assist, getfit, …)
 */
export const isProductionAnalyticsHostJs = `
function __siyaIsProdAnalyticsHost(h) {
  h = String(h || '').toLowerCase();
  return h === 'siya.health' || /\\.siya\\.health$/.test(h);
}
`.trim();

/**
 * Inline JS for the GTM bootstrap IIFE — early return unless production host.
 * Uses `w` (window) from the GTM snippet signature.
 */
export const GTM_PRODUCTION_HOST_GUARD =
  "var h=(w.location&&w.location.hostname)||'';if(!(h==='siya.health'||/\\.siya\\.health$/i.test(h)))return;";

/** @deprecated Use GTM_PRODUCTION_HOST_GUARD (allowlist). Kept for import compatibility. */
export const GTM_DEV_HOST_GUARD = GTM_PRODUCTION_HOST_GUARD;
