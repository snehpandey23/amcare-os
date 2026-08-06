/**
 * Sitewide analytics IDs — GTM is the only tag installed in HTML.
 * Configure GA4 (G-*) and Google Ads (AW-*) tags inside the GTM container.
 */
export const TRACKING = {
  GTM_CONTAINER_ID: 'GTM-PLBD4TTQ',
  /** Reference only — managed inside GTM, not installed as raw gtag on pages */
  GA4_MEASUREMENT_ID: 'G-9WTQWHCTFT',
  /** Reference only — managed inside GTM, not installed as raw gtag on pages */
  GOOGLE_ADS_ID: 'AW-17553537456',
};

/**
 * Inline JS (minified) — skip GTM load on local/dev hosts so lab traffic
 * does not pollute production GA4 (G-9WTQWHCTFT).
 */
export const GTM_DEV_HOST_GUARD =
  "var h=(w.location&&w.location.hostname)||'';if(h==='localhost'||h==='127.0.0.1'||h==='[::1]'||/\\.local$/.test(h))return;";
