# Future: site-wide Lighthouse Performance & Best Practices

**Status:** Deferred — not blocking California employer pilot outreach  
**Logged:** 2026-09-17  
**Trigger context:** CA pilot page prod Lighthouse (Performance ~63, Best Practices ~78). Accessibility/SEO were fine; issues are site chrome, not page copy.

## Not in scope for CA pilot

Prospect send of `/employers/california-pilot` does **not** depend on fixing these scores.

## Likely work (when prioritized)

- LCP / FCP: render-blocking CSS & fonts, image weight / CDN pipeline
- Best Practices: third-party cookies / inspector issues from GTM + Meta pixel and related tracking
- Broader unused-CSS / script-loading audit across `siya.health`

## Gate

Treat as a dedicated site-performance initiative. Do not fold into employer pitch iterations.
