/**
 * HIPAA compliant circle badge — source of truth for raster + display sizing.
 * SVG: assets/images/hipaa-compliant.svg
 * Regenerate PNG copies: npm run assets:hipaa-badge -w @amcare/siya-health
 */

/** Inner/outer circle radius in SVG user units (2026-07: +10% from 114 / 124). */
export const HIPAA_BADGE_CIRCLE = {
  center: 140.5,
  outerRadius: 136.4,
  innerRadius: 125.4,
  viewBox: 281,
  strokeWidth: 8,
};

export const HIPAA_BADGE_RASTER_PX = 512;

/** Footer / trust strip display (CSS mirrors these in styles.css). */
export const HIPAA_BADGE_DISPLAY_PX = 72;

export const HIPAA_BADGE_PATH = '/assets/images/hipaa-compliant.png';

/** Monorepo paths synced by export-hipaa-badge.mjs */
export const HIPAA_BADGE_SYNC_TARGETS = [
  'assets/images/hipaa-compliant.png',
  '../siya-health-rewrite/assets/images/hipaa-compliant.png',
  '../siya-health-rewrite/public/assets/images/hipaa-compliant.png',
  '../hipaa-training/public/assets/images/hipaa-compliant.png',
];
