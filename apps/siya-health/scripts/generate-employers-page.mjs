/**
 * Retired. Do not restore a template that writes employers.html.
 *
 * /employers is hand-maintained on the cream design. The old generator
 * used to emit the cognitive-only / "we are building pilots" page.
 * package.json still calls this file so the build step does not vanish,
 * but this file must not write HTML.
 *
 * If you delete the early return and paste a template back in, the next
 * production build will wipe the live employers page the same way the
 * Circle generator wiped a hand edit. Edit employers.html instead.
 */
console.log(
  'Skip employers.html — hand-maintained. This script must not write that file. Edit apps/siya-health/employers.html.',
);
