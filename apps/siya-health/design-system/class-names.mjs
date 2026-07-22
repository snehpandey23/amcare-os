/**
 * Dual-class migration helpers — legacy + ds-* coexist until cutover.
 * Example: dualClass('hero', 'hero--large', 'ds-hero') → "hero hero--large ds-hero"
 */

/**
 * @param {...(string|false|null|undefined)} parts
 * @returns {string}
 */
export function dualClass(...parts) {
  const tokens = new Set();
  for (const part of parts) {
    if (!part) continue;
    for (const token of String(part).trim().split(/\s+/)) {
      if (token) tokens.add(token);
    }
  }
  return [...tokens].join(' ');
}

/**
 * Attach ds-* prefix to a legacy block name.
 * @param {string} legacy — e.g. 'hero-merged'
 * @param {string} [dsBlock] — defaults to legacy with ds- prefix on first segment
 */
export function legacyWithDs(legacy, dsBlock) {
  const ds = dsBlock ?? `ds-${legacy.split(/\s+/)[0]}`;
  return dualClass(legacy, ds);
}
