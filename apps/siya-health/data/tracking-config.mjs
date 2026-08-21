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
 * Inline JS (minified) — skip GTM load on local/dev hosts so lab traffic
 * does not pollute production GA4 (G-9WTQWHCTFT).
 */
export const GTM_DEV_HOST_GUARD =
  "var h=(w.location&&w.location.hostname)||'';if(h==='localhost'||h==='127.0.0.1'||h==='[::1]'||/\\.local$/.test(h))return;";
