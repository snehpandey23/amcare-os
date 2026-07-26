#!/usr/bin/env node
/**
 * Render hipaa-compliant.svg → PNG and copy to all monorepo consumers.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  HIPAA_BADGE_RASTER_PX,
  HIPAA_BADGE_SYNC_TARGETS,
} from '../design-system/hipaa-badge.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const svgPath = path.join(appRoot, 'assets/images/hipaa-compliant.svg');

if (!fs.existsSync(svgPath)) {
  console.error('Missing SVG:', svgPath);
  process.exit(1);
}

const pngBuffer = await sharp(svgPath)
  .resize(HIPAA_BADGE_RASTER_PX, HIPAA_BADGE_RASTER_PX)
  .png()
  .toBuffer();

for (const rel of HIPAA_BADGE_SYNC_TARGETS) {
  const dest = path.resolve(appRoot, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, pngBuffer);
  console.log('Wrote', dest);
}

console.log(`Done — ${HIPAA_BADGE_RASTER_PX}px PNG from ${svgPath}`);
