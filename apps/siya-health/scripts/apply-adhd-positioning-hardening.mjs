/**
 * ADHD positioning & clinical tool compliance hardening.
 * Applies counsel-aligned copy replacements across ADHD surfaces.
 * Skips legal/* and providers/* (credentials unchanged).
 *
 * Run: node scripts/apply-adhd-positioning-hardening.mjs
 * Writes: data/adhd-hardening-changelog.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ADHD_POSITIONING } from '../data/site-standards.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');

/** @type {{ file: string, before: string, after: string, rationale: string, risk: string }[]} */
const changelog = [];

const REPLACEMENTS = [
  {
    from: /Primary care–led adult ADHD evaluation online — DSM-based assessment \(\$149\)\. Licensed medical providers\. ASRS, DIVA, Wender Utah, SWAN, optional Creyos\. CA, TX, PA, FL\./g,
    to: ADHD_POSITIONING.metaDescription,
    rationale: 'Meta/schema: tool inventory implies uniform battery',
    risk: 'high',
  },
  {
    from: /Structured tools as clinically appropriate \(ASRS, DIVA, Wender Utah, SWAN, optional Creyos\)/g,
    to: 'Validated assessment tools selected by your clinician as clinically appropriate',
    rationale: 'Hero bullet: individualized tool selection',
    risk: 'high',
  },
  {
    from: /validated tools \(ASRS, DIVA, Wender Utah, SWAN\) and optional Creyos cognitive assessment when clinically useful/g,
    to: 'one or more validated assessment tools as clinically appropriate—including ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos, and other methods your clinician selects based on clinical judgment',
    rationale: 'Step 2: avoid fixed tool bundle',
    risk: 'high',
  },
  {
    from: /ASRS, DIVA, Wender Utah, and SWAN may be used to map symptoms and severity; Creyos or similar objective cognitive testing when clinically useful\./g,
    to: `${ADHD_POSITIONING.toolsEvaluationShort} Tools may include ASRS, DIVA, Wender Utah Rating Scale, SWAN, Creyos, and other methods. ${ADHD_POSITIONING.toolsSupportDisclaimer}`,
    rationale: 'Evaluation model card: tool ≠ diagnosis',
    risk: 'high',
  },
  {
    from: /Validated tools as appropriate \(ASRS, DIVA, Wender Utah, SWAN, optional Creyos\)/g,
    to: 'Validated assessment tools as clinically appropriate (your clinician selects from options such as ASRS, DIVA, Wender Utah, SWAN, or Creyos)',
    rationale: 'Pricing: individualized tools',
    risk: 'medium',
  },
  {
    from: /validated tools \(ASRS, Creyos\)/g,
    to: 'validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos)',
    rationale: 'Geo/funnel pages: ASRS+Creyos-only bundle',
    risk: 'high',
  },
  {
    from: /ASRS, Creyos—plus anxiety/g,
    to: 'Validated assessment tools as clinically appropriate—plus anxiety',
    rationale: 'Why-choose card: fixed two-tool list',
    risk: 'medium',
  },
  {
    from: /validated tools \(ASRS, Creyos\), and screening/g,
    to: 'validated assessment tools as clinically appropriate, and screening',
    rationale: 'FAQ: fixed tool pair in evaluation description',
    risk: 'high',
  },
  {
    from: /ASRS &amp; Creyos/g,
    to: 'individualized clinical assessment',
    rationale: 'Meta: ASRS & Creyos shorthand',
    risk: 'medium',
  },
  {
    from: /ASRS & Creyos/g,
    to: 'individualized clinical assessment',
    rationale: 'Meta: ASRS & Creyos shorthand',
    risk: 'medium',
  },
  {
    from: /ASRS \+ Creyos \+ clinical interview/g,
    to: 'clinical interview plus validated tools as clinically appropriate',
    rationale: 'Creyos page meta: fixed trio',
    risk: 'medium',
  },
  {
    from: /ASRS \+ Creyos/g,
    to: 'validated tools as clinically appropriate',
    rationale: 'Evaluation copy: fixed duo',
    risk: 'medium',
  },
  {
    from: /ASRS and Creyos testing/g,
    to: 'validated assessment tools as clinically appropriate',
    rationale: 'Evaluation includes fixed tools',
    risk: 'high',
  },
  {
    from: /ASRS and Creyos,/g,
    to: 'validated tools as clinically appropriate,',
    rationale: 'List implies required battery',
    risk: 'high',
  },
  {
    from: /Clear recommendations\. Medication when appropriate\. You leave with a path forward\./g,
    to: 'Clear recommendations based on clinical judgment. Medication may be discussed when appropriate—never guaranteed, including stimulants. You leave with a documented plan.',
    rationale: 'Step 3: medication non-guarantee',
    risk: 'critical',
  },
  {
    from: /Yes, when appropriate\. We offer both non-stimulant and stimulant treatment options with proper monitoring and follow-up\./g,
    to: 'Medication may be discussed when clinically appropriate after evaluation—diagnosis and evaluation do not guarantee medication, and stimulant prescribing is never guaranteed. When medication is appropriate, we offer non-stimulant and stimulant options with proper monitoring and follow-up.',
    rationale: 'FAQ: medication guarantee risk',
    risk: 'critical',
  },
  {
    from: /Psychiatric depth for ADHD alongside depression, anxiety, or complex medication histories\./g,
    to: 'Structured ADHD evaluation depth for adults alongside depression, anxiety, or complex medication histories.',
    rationale: 'About page: psychiatry practice implication',
    risk: 'high',
  },
  {
    from: /ADHD telepsychiatry California/g,
    to: 'ADHD telehealth California',
    rationale: 'Blog: telepsychiatry practice positioning',
    risk: 'high',
  },
  {
    from: /thoughtful telepsychiatry when legally\/clinically appropriate/g,
    to: 'thoughtful primary care–led telehealth ADHD care when legally/clinically appropriate',
    rationale: 'Blog: telepsychiatry framing',
    risk: 'high',
  },
  {
    from: /Psychiatry \/ ADHD \(PA\)/g,
    to: 'ADHD evaluation (PA)',
    rationale: 'llms.txt: psychiatry practice index line',
    risk: 'high',
  },
  {
    from: /standardized tools \(such as ASRS and Creyos when indicated\)/g,
    to: 'validated assessment tools as clinically appropriate (such as ASRS, DIVA, Wender Utah, SWAN, or Creyos when indicated)',
    rationale: 'Answer seed: two-tool default',
    risk: 'high',
  },
  {
    from: /required for formal diagnosis and prescribing when appropriate\./g,
    to: 'required for formal diagnosis. Prescribing when clinically appropriate is never guaranteed—including stimulants.',
    rationale: 'Screening vs evaluation: prescription expectation',
    risk: 'medium',
  },
];

const SKIP_DIRS = new Set(['legal', 'node_modules', 'scripts', 'data', 'docs', 'public']);
const SKIP_FILES = /^providers\//;

function isAdhdTarget(rel) {
  if (SKIP_FILES.test(rel)) return false;
  if (rel.startsWith('legal/')) return false;
  const lower = rel.toLowerCase();
  if (/adhd|asrs|creyos|adderall|vyvanse|focalin|stimulant|executive-dysfunction|time-blindness|rejection-sensitivity/.test(lower)) return true;
  if (rel === 'about.html') return true;
  if (rel === 'llms.txt' || rel === 'llms-full.txt') return true;
  return false;
}

function walkFiles(dir, baseRel = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name) && baseRel === '') continue;
    const rel = path.join(baseRel, e.name).replace(/\\/g, '/');
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      out.push(...walkFiles(full, rel));
    } else if (/\.(html|mjs|txt|py|json)$/i.test(e.name) && isAdhdTarget(rel)) {
      out.push(rel);
    }
  }
  return out;
}

function applyToFile(rel) {
  const full = path.join(SITE_ROOT, rel);
  if (!fs.existsSync(full)) return 0;
  let content = fs.readFileSync(full, 'utf8');
  let count = 0;
  for (const { from, to, rationale, risk } of REPLACEMENTS) {
    const matches = content.match(from);
    if (!matches) continue;
    for (const m of matches) {
      changelog.push({ file: rel, before: m.slice(0, 200), after: to.slice(0, 200), rationale, risk });
    }
    content = content.replace(from, to);
    count += matches.length;
  }
  if (count > 0) fs.writeFileSync(full, content, 'utf8');
  return count;
}

function main() {
  const extraSources = [
    'data/answer-seeds.mjs',
    'data/phase5-thin-expansions.mjs',
    'scripts/california-adhd-blog-rest.mjs',
    'scripts/california-adhd-blog-data.mjs',
    'scripts/generate-ai-indexes.mjs',
    'scripts/generate_seo_shadow_pages.py',
  ];
  const walked = walkFiles(SITE_ROOT);
  const files = [...new Set([...walked, ...extraSources])].filter((f) => {
    if (f.startsWith('legal/')) return false;
    if (f.startsWith('providers/')) return false;
    return fs.existsSync(path.join(SITE_ROOT, f));
  });

  let total = 0;
  for (const rel of files.sort()) {
    total += applyToFile(rel);
  }

  const outPath = path.join(SITE_ROOT, 'data/adhd-hardening-changelog.json');
  const prior = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath, 'utf8')) : null;
  const mergedChanges =
    total > 0 ? changelog : prior?.changes?.length ? prior.changes : changelog;
  const mergedTotal = total > 0 ? total : prior?.replacements ?? total;
  fs.writeFileSync(
    outPath,
    JSON.stringify(
      {
        generated: new Date().toISOString(),
        filesTouched: files.length,
        replacements: mergedTotal,
        changes: mergedChanges,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`ADHD hardening: ${files.length} files scanned, ${total} replacements, ${changelog.length} changelog entries`);
}

main();
