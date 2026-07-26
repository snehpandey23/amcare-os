#!/usr/bin/env node
/**
 * Raster app icons from Siya mark + brand tokens (cream pad, navy ring).
 * Run: npm run assets:icons -w @amcare/hipaa-training
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.resolve(__dirname, '..');
const markPath = path.resolve(appRoot, '../siya-health/assets/images/siya-health-mark.png');
const appDir = path.join(appRoot, 'src/app');

if (!fs.existsSync(markPath)) {
  console.error('Missing mark:', markPath);
  process.exit(1);
}

async function iconWithPad(size, padRatio = 0.12) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const mark = await sharp(markPath).resize(inner, inner, { fit: 'contain' }).png().toBuffer();
  const ring = Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${Math.round(size * 0.22)}" fill="#fffdf6"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${inner / 2 + 1}" fill="none" stroke="#1e3a8a" stroke-width="${Math.max(1, size / 32)}"/>
    </svg>`
  );
  return sharp(ring)
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}

const icon32 = await iconWithPad(32);
const apple180 = await iconWithPad(180);

fs.writeFileSync(path.join(appDir, 'icon.png'), icon32);
fs.writeFileSync(path.join(appDir, 'apple-icon.png'), apple180);
console.log('Wrote icon.png, apple-icon.png');

const faviconPath = path.join(appDir, 'favicon.ico');
try {
  const ico = execFileSync('npx', ['--yes', 'png-to-ico', path.join(appDir, 'icon.png')], {
    encoding: 'buffer',
    cwd: appRoot,
    maxBuffer: 2 * 1024 * 1024,
  });
  fs.writeFileSync(faviconPath, ico);
  console.log('Wrote favicon.ico');
} catch (e) {
  fs.writeFileSync(faviconPath, icon32);
  console.warn('png-to-ico failed — wrote 32px PNG as favicon.ico');
}
