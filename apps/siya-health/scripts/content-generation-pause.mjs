/**
 * Hard pause gate for educational HTML generators (answers / blog / guides / entity pages).
 * See data/CONTENT-GENERATION-PAUSE.json.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FLAG_PATH = path.join(__dirname, '..', 'data', 'CONTENT-GENERATION-PAUSE.json');

export function contentGenerationIsPaused() {
  if (process.env.SIYA_ALLOW_CONTENT_GENERATION === '1') return false;
  try {
    const flag = JSON.parse(fs.readFileSync(FLAG_PATH, 'utf8'));
    return flag.paused === true;
  } catch {
    return false;
  }
}

/** Exit 0 when paused so npm/Vercel build chains do not fail. No HTML is written. */
export function exitIfContentGenerationPaused(scriptName = 'generator') {
  if (!contentGenerationIsPaused()) return;
  console.error(
    `[PAUSED] ${scriptName}: educational content generation is paused ` +
      `(data/CONTENT-GENERATION-PAUSE.json). No HTML written. ` +
      `Override for one run: SIYA_ALLOW_CONTENT_GENERATION=1`,
  );
  process.exit(0);
}
