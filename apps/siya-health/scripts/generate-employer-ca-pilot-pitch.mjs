/**
 * Retired 2026-09-30. /employers/california-pilot redirects to /employers.
 * The per-employee rates this script used to write were illustrative and must not be republished.
 * Kept as a no-op so the existing build command cannot recreate the page.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'employers', 'california-pilot.html');
if (fs.existsSync(OUT)) fs.unlinkSync(OUT);
console.log('Skipped /employers/california-pilot (retired; redirects to /employers).');
