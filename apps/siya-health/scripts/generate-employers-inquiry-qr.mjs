/**
 * Static QR for the employers one-pager CTA.
 * Encodes https://siya.health/employers#employer-inquiry → print/employers-inquiry-qr.svg
 *
 *   node apps/siya-health/scripts/generate-employers-inquiry-qr.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'print', 'employers-inquiry-qr.svg');
const URL = 'https://siya.health/employers#employer-inquiry';

let QRCode;
try {
  QRCode = require('qrcode');
} catch {
  QRCode = require('/tmp/siya-qr/node_modules/qrcode');
}

QRCode.toString(
  URL,
  {
    type: 'svg',
    margin: 1,
    width: 144,
    color: { dark: '#0A246B', light: '#00000000' },
  },
  (err, svg) => {
    if (err) throw err;
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, svg);
    console.log('Wrote', OUT);
  },
);
