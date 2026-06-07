/**
 * Health Guide Portfolio Audit — business-asset evaluation of /answers/* and /blog/*
 * Run: node scripts/audit-health-guide-portfolio.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HIGH_OVERLAP_PAIRS, CORNERSTONE_SYSTEMS, CANONICAL_WINNING_BLOGS } from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const INVENTORY_PATH = path.join(SITE_ROOT, 'data', 'website-inventory.json');
const OUT_JSON = path.join(SITE_ROOT, 'data', 'health-guide-portfolio-audit.json');
const OUT_MD = path.join(SITE_ROOT, 'docs', 'HEALTH-GUIDE-PORTFOLIO-AUDIT.md');

const HUB_PATHS = new Set(['/answers', '/blog', '/blog/adhd', '/blog/weight-loss', '/blog/telehealth', '/blog/all']);

const PILLARS = [
  'ADHD',
  'Weight & Metabolic Health',
  'Fatigue & Sleep',
  "Telehealth & Primary Care",
  "Men's Health",
  'Off-pillar / Review',
];

/** @typedef {'KEEP'|'REWRITE'|'MERGE'|'REDIRECT'|'DELETE'} Classification */

const TOPIC_PATTERNS = {
  adhd: /\b(adhd|add\b|attention deficit|vyvanse|adderall|stimulant|executive dysfunction|asrs|creyos|time blindness|rejection sensitivity|inattentive|hyperactive)\b/i,
  weight: /\b(weight loss|glp-?1|semaglutide|tirzepatide|ozempic|wegovy|mounjaro|phentermine|metabolic|insulin resistance|food noise|obesity|bariatric|a1c|diabetes)\b/i,
  fatigue: /\b(fatigue|tired|sleep apnea|insomnia|brain fog|energy crash|sleep|snoring|modafinil|ambien)\b/i,
  mens: /\b(testosterone|trt|minoxidil|sildenafil|erectile|ed\b|hair loss|peptide|glutathione|low t\b|shbg)\b/i,
  telehealth: /\b(telehealth|online diagnosis|online prescription|meet.?and.?greet|fsa|hsa|legitimate|carepatron|how online)\b/i,
};

const MEDICATION_FIRST = /\b(dosage|dose|mg\b|side effects|how it works|vs\.|versus|comparison|which is better|ir vs xr|focalin|modafinil|ambien|adderall|vyvanse|semaglutide|tirzepatide|minoxidil|sildenafil|phentermine)\b/i;
const MEDICATION_TITLE = /\b(vs\.|versus|comparison|side effects|how it works|medication options|ir vs xr|for adhd how|for weight loss|for hair loss|for erectile)\b/i;
const CLINICIAN_CONTEXT = /\b(clinician|physician|evaluation|diagnosis|prescriber|licensed|telehealth visit|medical history|monitoring|whole.?person|meet.?and.?greet|medically reviewed|clinically reviewed)\b/i;
const ADHD_ONLY_MISFRAME = /\b(adhd only|only adhd|adhd specialist only|just adhd)\b/i;
const ADHD_ONLY_PATH = /^\/blog\/(adderall|vyvanse|focalin|adhd-medication)/;
const PRICING_SIGNAL = /\$199|\$|\bpricing\b|transparent|cost|fsa|hsa/i;
const CONVERSION_PATHS = [
  { re: /\/adhd-care/, label: 'adhd-care' },
  { re: /\/weight-loss-metabolic-health/, label: 'weight-loss' },
  { re: /\/telehealth/, label: 'telehealth' },
  { re: /\/mens-health-longevity/, label: 'mens-health' },
  { re: /book\.carepatron\.com|Book (a )?(Meet|ADHD|Evaluation)/i, label: 'booking' },
  { re: /\/adhd-screening/, label: 'adhd-screening' },
  { re: /\/membership-pricing/, label: 'pricing' },
];

const OFF_BRAND_TOPICS = /\b(glutathione|peptide stack|biohacking|nootropic only)\b/i;

const GEO_BLOG_CLUSTERS = {
  california: [
    '/blog/adhd-evaluation-california-online-vs-in-person',
    '/blog/adhd-testing-online-california-screening-vs-evaluation',
    '/blog/adult-adhd-treatment-california-2026',
    '/blog/adult-adhd-symptoms-california',
    '/blog/adhd-evaluation-cost-california',
    '/blog/adhd-medication-online-california',
    '/blog/adhd-medication-options-california',
    '/blog/how-to-choose-adhd-provider-california',
    '/blog/online-adhd-diagnosis-california',
    '/blog/adhd-telehealth-california',
  ],
  texas: [
    '/blog/online-adhd-diagnosis-texas',
    '/blog/adhd-evaluation-cost-texas',
    '/blog/adhd-medication-online-texas-telehealth',
    '/blog/adhd-treatment-houston-online',
  ],
};

const MED_COMPARE_CLUSTER = [
  '/blog/adderall-for-adhd-how-it-works',
  '/blog/adderall-ir-vs-xr-adults',
  '/blog/focalin-vs-adderall-comparison',
  '/blog/vyvanse-vs-adderall-differences',
  '/answers/adderall-vs-vyvanse-adults',
];

function loadInventory() {
  return JSON.parse(fs.readFileSync(INVENTORY_PATH, 'utf8'));
}

function pathToFile(relPath) {
  if (relPath === '/answers') return path.join(SITE_ROOT, 'answers', 'index.html');
  if (relPath.startsWith('/answers/')) return path.join(SITE_ROOT, 'answers', relPath.slice('/answers/'.length) + '.html');
  if (relPath === '/blog') return path.join(SITE_ROOT, 'blog', 'index.html');
  return path.join(SITE_ROOT, 'blog', relPath.slice('/blog/'.length) + '.html');
}

function extractMainText(html) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const block = mainMatch ? mainMatch[1] : html;
  return block
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function classifyPillar(pathStr, title, h1, text, inventoryGroups) {
  const blob = `${pathStr} ${title} ${h1} ${text}`.toLowerCase();
  const scores = {
    ADHD: 0,
    'Weight & Metabolic Health': 0,
    'Fatigue & Sleep': 0,
    "Telehealth & Primary Care": 0,
    "Men's Health": 0,
  };

  if (TOPIC_PATTERNS.adhd.test(blob)) scores.ADHD += 2;
  if (TOPIC_PATTERNS.weight.test(blob)) scores['Weight & Metabolic Health'] += 2;
  if (TOPIC_PATTERNS.fatigue.test(blob)) scores['Fatigue & Sleep'] += 2;
  if (TOPIC_PATTERNS.mens.test(blob)) scores["Men's Health"] += 2;
  if (TOPIC_PATTERNS.telehealth.test(blob)) scores['Telehealth & Primary Care'] += 2;

  if (pathStr.includes('adhd')) scores.ADHD += 3;
  if (pathStr.includes('weight') || pathStr.includes('glp') || pathStr.includes('semaglutide') || pathStr.includes('insulin') || pathStr.includes('food-noise')) {
    scores['Weight & Metabolic Health'] += 3;
  }
  if (pathStr.includes('sleep') || pathStr.includes('fatigue') || pathStr.includes('tired') || pathStr.includes('brain-fog') || pathStr.includes('insomnia') || pathStr.includes('ambien')) {
    scores['Fatigue & Sleep'] += 3;
  }
  if (pathStr.includes('testosterone') || pathStr.includes('minoxidil') || pathStr.includes('sildenafil') || pathStr.includes('erectile') || pathStr.includes('hair-loss')) {
    scores["Men's Health"] += 3;
  }
  if (pathStr.includes('telehealth') || pathStr.includes('online-prescription') || pathStr.includes('meet-and-greet') || pathStr.includes('legitimate')) {
    scores['Telehealth & Primary Care'] += 3;
  }

  const max = Math.max(...Object.values(scores));
  if (max === 0) return 'Off-pillar / Review';
  const winners = Object.entries(scores).filter(([, v]) => v === max).map(([k]) => k);
  if (winners.length > 1 && max <= 3) return 'Off-pillar / Review';
  return winners[0];
}

function buildCannibalizationMaps() {
  const guideToBlog = new Map();
  const blogToGuide = new Map();
  const duplicateGuides = new Set();
  const supportingGuides = new Set();

  for (const pair of HIGH_OVERLAP_PAIRS) {
    guideToBlog.set(pair.guide, pair);
    blogToGuide.set(pair.blog, pair);
    if (pair.classification === 'Duplicate') duplicateGuides.add(pair.guide);
    else supportingGuides.add(pair.guide);
  }
  return { guideToBlog, blogToGuide, duplicateGuides, supportingGuides };
}

function getCornerstoneRole(pathStr) {
  for (const sys of CORNERSTONE_SYSTEMS) {
    if (sys.blog === pathStr) return { role: 'cornerstone-blog', system: sys.name };
    if (sys.guides.includes(pathStr)) return { role: 'supporting-guide', system: sys.name };
  }
  if (CANONICAL_WINNING_BLOGS.includes(pathStr)) return { role: 'cornerstone-blog', system: null };
  return { role: null, system: null };
}

function scorePage(ctx) {
  const {
    inv,
    mainWords,
    html,
    text,
    pillar,
    flags,
    cannibal,
    cornerstone,
    isGuide,
    isHub,
  } = ctx;

  if (isHub) {
    return {
      searchValue: 6,
      conversionValue: 7,
      brandValue: 8,
      uniqueness: 7,
      strategicImportance: 8,
      composite: 7.2,
    };
  }

  let searchValue = 5;
  let conversionValue = 5;
  let brandValue = 6;
  let uniqueness = 6;
  let strategicImportance = 5;

  const intent = inv?.trafficIntent || '';
  if (/Commercial|Transactional|Local SEO/.test(intent)) searchValue += 2;
  if (/Informational/.test(intent)) searchValue += 1;
  if (mainWords >= 800) searchValue += 2;
  else if (mainWords >= 500) searchValue += 1;
  else if (mainWords < 400) searchValue -= 2;

  if (/cost|how to|diagnosis|symptoms|legit|qualify|signs of/i.test(`${inv?.title} ${inv?.h1}`)) searchValue += 1;
  if (inv?.path?.includes('california') || inv?.path?.includes('texas') || inv?.path?.includes('houston')) searchValue += 1;

  for (const { re } of CONVERSION_PATHS) {
    if (re.test(html)) conversionValue += 0.8;
  }
  if (/Commercial|Transactional/.test(intent)) conversionValue += 2;
  if (pillar === 'ADHD' && /\/adhd-care|adhd-screening/.test(html)) conversionValue += 1.5;
  if (pillar === 'Weight & Metabolic Health' && /weight-loss-metabolic-health/.test(html)) conversionValue += 1.5;
  if (PRICING_SIGNAL.test(text)) conversionValue += 1;

  if (CLINICIAN_CONTEXT.test(text)) brandValue += 2;
  if (flags.medicationFirst && !flags.hasClinicianContext) brandValue -= 2;
  if (flags.adhdOverfocused) brandValue -= 2;
  if (flags.offBrand) brandValue -= 3;
  if (/physician.?led|whole.?person|long.?term|relationship|transparent/i.test(text)) brandValue += 1;
  if (inv?.groups?.includes('Duplicate Pages')) brandValue -= 1;

  if (inv?.duplicateOf) uniqueness -= 2;
  if (cannibal?.classification === 'Duplicate' && isGuide) uniqueness -= 2;
  if (cornerstone.role === 'cornerstone-blog') uniqueness += 2;
  if (flags.thin) uniqueness -= 1;
  if (flags.nearDuplicate) uniqueness -= 2;

  const pillarBoost = {
    ADHD: 0,
    'Weight & Metabolic Health': 1,
    'Fatigue & Sleep': 2,
    "Telehealth & Primary Care": 1,
    "Men's Health": 1,
    'Off-pillar / Review': -2,
  };
  strategicImportance += pillarBoost[pillar] ?? 0;
  if (cornerstone.role === 'cornerstone-blog') strategicImportance += 3;
  if (cornerstone.role === 'supporting-guide') strategicImportance += 1;
  if (pillar === 'Fatigue & Sleep') strategicImportance += 1;
  if (flags.offBrand) strategicImportance -= 3;
  if (isGuide && cannibal?.classification === 'Supporting') strategicImportance += 1;

  const clamp = (n) => Math.max(1, Math.min(10, Math.round(n * 10) / 10));
  const scores = {
    searchValue: clamp(searchValue),
    conversionValue: clamp(conversionValue),
    brandValue: clamp(brandValue),
    uniqueness: clamp(uniqueness),
    strategicImportance: clamp(strategicImportance),
  };
  scores.composite = clamp(
    (scores.searchValue + scores.conversionValue + scores.brandValue + scores.uniqueness + scores.strategicImportance) / 5,
  );
  return scores;
}

function classifyPage(ctx) {
  const { inv, pathStr, flags, cannibal, cornerstone, scores, isGuide, isHub, pillar } = ctx;

  if (isHub) return { classification: 'KEEP', rationale: 'Navigation hub — retain and restructure under pillar hubs.' };

  if (flags.offBrand && scores.composite < 5) {
    return {
      classification: 'DELETE',
      rationale: 'Off-brand wellness/peptide content misaligned with physician-led whole-person positioning.',
      redirectTo: pillar === "Men's Health" ? '/mens-health-longevity' : '/',
    };
  }

  if (pathStr === '/blog/glutathione-and-peptides-what-do-they-actually-do') {
    return {
      classification: 'DELETE',
      rationale: 'Peptide/glutathione content is off-brand and medication-supplement focused without clinical care framing.',
      redirectTo: '/mens-health-longevity',
    };
  }

  if (pathStr === '/blog/modafinil-for-focus-and-fatigue-is-it-safe') {
    return {
      classification: 'REWRITE',
      rationale: 'Medication-first modafinil piece needs clinician evaluation framing and fatigue-pillar integration.',
    };
  }

  const geoMergeTargets = {
    '/blog/adhd-testing-online-california-screening-vs-evaluation': '/blog/adhd-evaluation-california-online-vs-in-person',
    '/blog/adult-adhd-symptoms-california': '/blog/how-to-know-if-you-have-adhd-adult',
    '/blog/adhd-medication-options-california': '/blog/adhd-medication-options-for-adults',
    '/blog/adhd-treatment-houston-online': '/blog/online-adhd-diagnosis-texas',
    '/blog/focalin-vs-adderall-comparison': '/blog/vyvanse-vs-adderall-differences',
    '/blog/adderall-ir-vs-xr-adults': '/blog/vyvanse-vs-adderall-differences',
    '/blog/adderall-for-adhd-how-it-works': '/blog/adhd-medication-options-for-adults',
  };

  if (geoMergeTargets[pathStr]) {
    return {
      classification: 'MERGE',
      rationale: 'Near-duplicate or subset topic — consolidate link equity into stronger canonical article.',
      redirectTo: geoMergeTargets[pathStr],
    };
  }

  if (isGuide && inv?.duplicateOf && cannibal?.classification === 'Duplicate') {
    if (flags.thin && mainWordsBelow(ctx, 420)) {
      return {
        classification: 'REDIRECT',
        rationale: 'Thin FAQ guide duplicates blog cornerstone; redirect preserves UX while blog owns depth.',
        redirectTo: inv.duplicateOf.replace('https://siya.health', ''),
      };
    }
    if (flags.thin) {
      return {
        classification: 'REWRITE',
        rationale: 'Cannibalization FAQ guide is thin — expand narrowed PAA intent or redirect to blog cornerstone.',
        contentRole: 'supporting-faq',
      };
    }
    return {
      classification: 'KEEP',
      rationale: 'Cannibalization plan: retain narrowed PAA FAQ; canonical pointer to blog cornerstone.',
      contentRole: 'supporting-faq',
    };
  }

  if (flags.medicationFirst && !flags.hasClinicianContext && !cornerstone.role) {
    return {
      classification: 'REWRITE',
      rationale: 'Medication-first content lacks evaluation/clinician context required for physician-led positioning.',
    };
  }

  if (flags.thin && isGuide && !cannibal) {
    return {
      classification: 'REWRITE',
      rationale: `Thin guide (${ctx.mainWords} words) under 400-word threshold — expand with clinician context, cross-pillar links, and conversion paths.`,
      contentRole: 'supporting',
    };
  }

  if (flags.thin && !isGuide && scores.composite < 7) {
    return {
      classification: 'REWRITE',
      rationale: `Thin blog article (${ctx.mainWords} words) — expand depth or merge into pillar cornerstone.`,
    };
  }

  if (flags.adhdOverfocused) {
    return {
      classification: 'REWRITE',
      rationale: 'ADHD-overfocused or symptom-only framing risks mispositioning Siya as ADHD-only; add whole-person and evaluation context.',
    };
  }

  if (cornerstone.role === 'cornerstone-blog') {
    return { classification: 'KEEP', rationale: 'Designated cornerstone blog — anchor for pillar cluster.', contentRole: 'cornerstone' };
  }

  if (cornerstone.role === 'supporting-guide') {
    return { classification: 'KEEP', rationale: 'Supporting FAQ guide in cornerstone system.', contentRole: 'supporting' };
  }

  if (scores.composite >= 7) {
    return { classification: 'KEEP', rationale: 'Strong business asset aligned to positioning.', contentRole: scores.composite >= 7.5 ? 'cornerstone-candidate' : 'supporting' };
  }

  if (scores.composite >= 5.5) {
    return { classification: 'KEEP', rationale: 'Adequate supporting content; monitor for expansion opportunities.', contentRole: 'supporting' };
  }

  return { classification: 'REWRITE', rationale: 'Below portfolio quality bar — improve depth, brand framing, or conversion paths.' };
}

function mainWordsBelow(ctx, n) {
  return ctx.mainWords < n;
}

function detectNearDuplicates(pages) {
  const byPillar = {};
  for (const p of pages) {
    if (HUB_PATHS.has(p.path)) continue;
    (byPillar[p.pillar] ||= []).push(p);
  }
  const nearDup = new Set();
  for (const [slug, cluster] of Object.entries(GEO_BLOG_CLUSTERS)) {
    if (cluster.length > 6) {
      for (const p of cluster.slice(3)) nearDup.add(p);
    }
  }
  for (const p of MED_COMPARE_CLUSTER.slice(3)) nearDup.add(p);
  return nearDup;
}

function analyzeHtml(html, inv, pathStr) {
  const text = extractMainText(html);
  const mainWords = countWords(text);
  const invWords = inv?.wordCount ?? mainWords;
  const words = invWords || mainWords;

  const medMatches = (text.match(MEDICATION_FIRST) || []).length;
  const clinicianMatches = (text.match(CLINICIAN_CONTEXT) || []).length;
  const adhdMatches = (text.match(TOPIC_PATTERNS.adhd) || []).length;
  const otherTopicMatches =
    (text.match(TOPIC_PATTERNS.weight) || []).length +
    (text.match(TOPIC_PATTERNS.fatigue) || []).length +
    (text.match(TOPIC_PATTERNS.mens) || []).length +
    (text.match(TOPIC_PATTERNS.telehealth) || []).length;

  const titleBlob = `${inv?.title || ''} ${inv?.h1 || ''} ${pathStr}`;
  const medicationFirst =
    (medMatches >= 3 && clinicianMatches < 3) ||
    (MEDICATION_TITLE.test(titleBlob) && clinicianMatches < 2);
  const adhdOverfocused =
    ADHD_ONLY_MISFRAME.test(text) ||
    (adhdMatches >= 5 && otherTopicMatches <= 1 && pathStr.includes('adhd') && !/evaluation|diagnosis|legit|telehealth|screening/.test(pathStr));

  const conversionPaths = CONVERSION_PATHS.filter(({ re }) => re.test(html)).map((c) => c.label);

  return {
    text,
    mainWords,
    wordCount: words,
    flags: {
      thin: words < 400,
      medicationFirst,
      hasClinicianContext: clinicianMatches >= 2,
      adhdOverfocused,
      offBrand: OFF_BRAND_TOPICS.test(text) || OFF_BRAND_TOPICS.test(pathStr),
      nearDuplicate: false,
      lowTrafficPotential: words < 350 && !/texas|california|cost|legit|signs of|why am i|food noise|insulin/.test(pathStr),
    },
    conversionPaths,
  };
}

function generateMarkdown(audit) {
  const lines = [];
  const d = audit.generated;
  lines.push('# Health Guide Portfolio Audit');
  lines.push('');
  lines.push(`Generated: ${d}`);
  lines.push('');
  lines.push('## Executive summary');
  lines.push('');
  lines.push('Business-asset audit of Siya Health educational content (`/answers/*` health guides + `/blog/*` articles), evaluated against physician-led telehealth positioning across ADHD, weight & metabolic health, fatigue & sleep, telehealth/primary care, and men\'s health.');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|------:|');
  lines.push(`| Current guides + articles (excl. hubs) | **${audit.counts.current}** |`);
  lines.push(`| Recommended count after consolidation | **${audit.counts.recommended}** |`);
  lines.push(`| Health guide hub + blog hubs (not scored) | ${audit.counts.hubs} |`);
  lines.push('');
  lines.push('### Classification summary');
  lines.push('');
  lines.push('| Classification | Count |');
  lines.push('|----------------|------:|');
  for (const [k, v] of Object.entries(audit.classificationCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push('');
  lines.push('### Flag summary');
  lines.push('');
  lines.push('| Flag | Count |');
  lines.push('|------|------:|');
  for (const [k, v] of Object.entries(audit.flagCounts).sort((a, b) => b[1] - a[1])) {
    lines.push(`| ${k} | ${v} |`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Pillar portfolio overview');
  lines.push('');
  lines.push('| Pillar | Current | Recommended | Delta |');
  lines.push('|--------|--------:|------------:|------:|');
  for (const pillar of PILLARS) {
    const cur = audit.pillarCurrent[pillar] ?? 0;
    const rec = audit.pillarRecommended[pillar] ?? 0;
    lines.push(`| ${pillar} | ${cur} | ${rec} | ${rec - cur >= 0 ? '+' : ''}${rec - cur} |`);
  }
  lines.push('');
  lines.push('**Portfolio gaps:** Fatigue & Sleep remains under-weighted vs ADHD. Post-consolidation, invest new cornerstone content in fatigue/sleep and cross-pillar metabolic-fatigue bridges.');
  lines.push('');
  lines.push('**Top 5 cornerstones by composite score:**');
  audit.top20.slice(0, 5).forEach((p, i) => {
    lines.push(`${i + 1}. \`${p.path}\` (${p.scores.composite}) — ${p.pillar}`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Pillar mapping (all pages)');
  lines.push('');
  for (const pillar of PILLARS) {
    const mapped = audit.pages.filter((p) => p.pillar === pillar && !HUB_PATHS.has(p.path));
    if (mapped.length === 0) continue;
    lines.push(`### ${pillar} (${mapped.length})`);
    lines.push('');
    lines.push(mapped.map((p) => `\`${p.path}\` (${p.classification})`).join(' · '));
    lines.push('');
  }
  lines.push('');
  lines.push('## Top 20 most valuable guides & articles');
  lines.push('');
  lines.push('| Rank | Path | Type | Composite | Pillar | Classification |');
  lines.push('|-----:|------|------|----------:|--------|----------------|');
  audit.top20.forEach((p, i) => {
    lines.push(`| ${i + 1} | \`${p.path}\` | ${p.type} | ${p.scores.composite} | ${p.pillar} | ${p.classification} |`);
  });
  lines.push('');
  lines.push('## Bottom 20 weakest guides & articles');
  lines.push('');
  lines.push('| Rank | Path | Type | Composite | Pillar | Classification | Flags |');
  lines.push('|-----:|------|------|----------:|--------|----------------|-------|');
  audit.bottom20.forEach((p, i) => {
    lines.push(`| ${i + 1} | \`${p.path}\` | ${p.type} | ${p.scores.composite} | ${p.pillar} | ${p.classification} | ${p.flagsList} |`);
  });
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Cornerstone recommendations');
  lines.push('');
  lines.push('### Designated cornerstones (retain & promote)');
  lines.push('');
  for (const c of audit.cornerstones) {
    lines.push(`- \`${c.path}\` — ${c.title || c.path} (${c.pillar})`);
  }
  lines.push('');
  lines.push('### Supporting articles & FAQ guides');
  lines.push('');
  lines.push(`${audit.supporting.length} pages classified as supporting content. Key clusters:`);
  lines.push('');
  const supportingByPillar = {};
  for (const p of audit.supporting) {
    (supportingByPillar[p.pillar] ||= []).push(p.path);
  }
  for (const [pillar, paths] of Object.entries(supportingByPillar)) {
    lines.push(`- **${pillar}** (${paths.length}): ${paths.slice(0, 5).map((x) => `\`${x}\``).join(', ')}${paths.length > 5 ? ` + ${paths.length - 5} more` : ''}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Full per-page audit');
  lines.push('');
  lines.push('| Path | Type | Words | Search | Conv | Brand | Unique | Strategic | Composite | Class | Pillar | Role | Flags | Redirect |');
  lines.push('|------|------|------:|-------:|-----:|------:|-------:|----------:|----------:|-------|--------|------|-------|----------|');
  for (const p of audit.pages) {
    if (HUB_PATHS.has(p.path)) continue;
    const sc = p.scores;
    lines.push(
      `| \`${p.path}\` | ${p.type} | ${p.wordCount} | ${sc.searchValue} | ${sc.conversionValue} | ${sc.brandValue} | ${sc.uniqueness} | ${sc.strategicImportance} | ${sc.composite} | ${p.classification} | ${p.pillar} | ${p.contentRole || '—'} | ${p.flagsList || '—'} | ${p.redirectTo || '—'} |`,
    );
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Redirect appendix');
  lines.push('');
  lines.push('| Source | Target | Classification | Rationale |');
  lines.push('|--------|--------|----------------|-----------|');
  for (const r of audit.redirects) {
    lines.push(`| \`${r.source}\` | \`${r.target}\` | ${r.classification} | ${r.rationale} |`);
  }
  if (audit.redirects.length === 0) lines.push('| — | — | — | No redirects recommended |');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Future hub structure recommendation');
  lines.push('');
  lines.push('Replace single `/answers` hub + topic-siloed blog hubs with **five pillar hubs**:');
  lines.push('');
  lines.push('1. **ADHD** — `/answers/adhd` or `/guides/adhd` + `/blog/adhd` (cornerstone: evaluation, legitimacy, medication options)');
  lines.push('2. **Weight & Metabolic Health** — metabolic cornerstones (insulin resistance, food noise, GLP-1 clinician overview)');
  lines.push('3. **Fatigue & Sleep** — expand from 3 guides to cluster around `why-am-i-always-tired`, sleep apnea, brain fog');
  lines.push('4. **Telehealth & Primary Care** — legitimacy, prescriptions, meet-and-greet, FSA/HSA, state-specific care pages');
  lines.push('5. **Men\'s Health** — testosterone hub, ED, hair loss; consolidate medication comparisons under clinician oversight narrative');
  lines.push('');
  lines.push('Each pillar hub should surface: 2–3 cornerstone guides, supporting FAQ grid, primary service CTA (`/adhd-care`, `/weight-loss-metabolic-health`, `/telehealth`, `/mens-health-longevity`), and transparent pricing link.');
  lines.push('');
  lines.push('### California / Texas geo consolidation');
  lines.push('');
  lines.push('- **California:** Merge 10 articles → 4 cornerstones (`online-adhd-diagnosis-california`, `adhd-telehealth-california`, `adhd-evaluation-california-online-vs-in-person`, `how-to-choose-adhd-provider-california`)');
  lines.push('- **Texas:** Merge 4 articles → 2 cornerstones (`online-adhd-diagnosis-texas`, `medical-weight-loss-glp1-semaglutide-texas`)');
  lines.push('');
  lines.push('### Cannibalization pairs (from `cannibalization-phase1.mjs`)');
  lines.push('');
  lines.push(`${HIGH_OVERLAP_PAIRS.length} guide↔blog pairs tracked. Duplicate-class pairs: blog owns depth; guide retains narrowed FAQ unless thin enough to redirect.`);
  lines.push('');
  return lines.join('\n');
}

function main() {
  const inventory = loadInventory();
  const { guideToBlog, duplicateGuides, supportingGuides } = buildCannibalizationMaps();
  const nearDupSet = new Set();

  const contentPages = inventory.pages.filter(
    (p) => (p.path.startsWith('/answers') || p.path.startsWith('/blog')) && !HUB_PATHS.has(p.path),
  );

  const pages = [];
  for (const inv of contentPages) {
    const file = pathToFile(inv.path);
    let html = '';
    try {
      html = fs.readFileSync(file, 'utf8');
    } catch {
      html = '';
    }
    const isGuide = inv.path.startsWith('/answers/');
    const analysis = analyzeHtml(html, inv, inv.path);
    const pillar = classifyPillar(inv.path, inv.title || '', inv.h1 || '', analysis.text, inv.groups);
    const cannibal = guideToBlog.get(inv.path) || null;
    const cornerstone = getCornerstoneRole(inv.path);

    if (GEO_BLOG_CLUSTERS.california.includes(inv.path) && !CORNERSTONE_SYSTEMS.some((s) => s.blog === inv.path)) {
      const idx = GEO_BLOG_CLUSTERS.california.indexOf(inv.path);
      if (idx >= 4) analysis.flags.nearDuplicate = true;
    }

    const ctx = {
      inv,
      pathStr: inv.path,
      mainWords: analysis.mainWords,
      html,
      text: analysis.text,
      pillar,
      flags: analysis.flags,
      cannibal,
      cornerstone,
      isGuide,
      isHub: false,
    };

    const scores = scorePage(ctx);
    const classResult = classifyPage({ ...ctx, scores });

    const flagsList = [
      analysis.flags.thin && 'thin',
      analysis.flags.medicationFirst && 'medication-first',
      analysis.flags.adhdOverfocused && 'adhd-overfocused',
      analysis.flags.offBrand && 'off-brand',
      analysis.flags.nearDuplicate && 'near-duplicate',
      analysis.flags.lowTrafficPotential && 'low-traffic',
      inv.duplicateOf && 'inventory-duplicate',
      cannibal && `cannibal-${cannibal.classification.toLowerCase()}`,
    ]
      .filter(Boolean)
      .join(', ');

    pages.push({
      path: inv.path,
      type: isGuide ? 'guide' : 'blog',
      title: inv.title,
      h1: inv.h1,
      wordCount: analysis.wordCount,
      mainWords: analysis.mainWords,
      pillar,
      scores,
      classification: classResult.classification,
      classificationRationale: classResult.rationale,
      contentRole: classResult.contentRole || null,
      redirectTo: classResult.redirectTo || null,
      flags: analysis.flags,
      flagsList,
      conversionPaths: analysis.conversionPaths,
      duplicateOf: inv.duplicateOf,
      cannibalization: cannibal,
      trafficIntent: inv.trafficIntent,
    });
  }

  // Hub pages (scored lightly)
  for (const hubPath of HUB_PATHS) {
    const inv = inventory.pages.find((p) => p.path === hubPath);
    if (!inv) continue;
    const file = pathToFile(hubPath);
    const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    const analysis = analyzeHtml(html, inv, hubPath);
    const pillar = 'Off-pillar / Review';
    const ctx = { inv, pathStr: hubPath, mainWords: analysis.mainWords, html, text: analysis.text, pillar, flags: analysis.flags, cannibal: null, cornerstone: { role: null }, isGuide: hubPath.startsWith('/answers'), isHub: true };
    const scores = scorePage(ctx);
    pages.push({
      path: hubPath,
      type: 'hub',
      title: inv.title,
      wordCount: analysis.wordCount,
      pillar,
      scores,
      classification: 'KEEP',
      classificationRationale: 'Hub page',
      contentRole: 'hub',
      redirectTo: null,
      flags: analysis.flags,
      flagsList: '',
      conversionPaths: analysis.conversionPaths,
    });
  }

  pages.sort((a, b) => a.path.localeCompare(b.path));

  const scoredContent = pages.filter((p) => !HUB_PATHS.has(p.path));
  const top20 = [...scoredContent].sort((a, b) => b.scores.composite - a.scores.composite).slice(0, 20);
  const bottom20 = [...scoredContent].sort((a, b) => a.scores.composite - b.scores.composite).slice(0, 20);

  const classificationCounts = {};
  const flagCounts = { thin: 0, 'medication-first': 0, 'adhd-overfocused': 0, 'off-brand': 0, 'near-duplicate': 0, 'low-traffic-potential': 0, cannibalization: 0 };
  const pillarCurrent = {};
  const pillarRecommended = {};

  for (const p of scoredContent) {
    classificationCounts[p.classification] = (classificationCounts[p.classification] || 0) + 1;
    if (p.flags.thin) flagCounts.thin++;
    if (p.flags.medicationFirst) flagCounts['medication-first']++;
    if (p.flags.adhdOverfocused) flagCounts['adhd-overfocused']++;
    if (p.flags.offBrand) flagCounts['off-brand']++;
    if (p.flags.nearDuplicate) flagCounts['near-duplicate']++;
    if (p.flags.lowTrafficPotential) flagCounts['low-traffic-potential']++;
    if (p.cannibalization) flagCounts.cannibalization++;
    pillarCurrent[p.pillar] = (pillarCurrent[p.pillar] || 0) + 1;
    if (!['MERGE', 'REDIRECT', 'DELETE'].includes(p.classification)) {
      pillarRecommended[p.pillar] = (pillarRecommended[p.pillar] || 0) + 1;
    }
  }

  const redirects = scoredContent
    .filter((p) => p.redirectTo && ['MERGE', 'REDIRECT', 'DELETE'].includes(p.classification))
    .map((p) => ({
      source: p.path,
      target: p.redirectTo,
      classification: p.classification,
      rationale: p.classificationRationale,
    }));

  const cornerstones = scoredContent.filter(
    (p) =>
      p.contentRole === 'cornerstone' ||
      p.contentRole === 'cornerstone-candidate' ||
      p.contentRole === 'cornerstone-blog' ||
      CANONICAL_WINNING_BLOGS.includes(p.path) ||
      CORNERSTONE_SYSTEMS.some((s) => s.blog === p.path),
  );

  const supporting = scoredContent.filter((p) => p.contentRole === 'supporting' || p.contentRole === 'supporting-faq' || p.contentRole === 'supporting-guide');

  const mergeDeleteCount = (classificationCounts.MERGE || 0) + (classificationCounts.REDIRECT || 0) + (classificationCounts.DELETE || 0);
  const currentCount = scoredContent.length;
  const recommendedCount = currentCount - mergeDeleteCount;

  const audit = {
    generated: new Date().toISOString(),
    positioning: [
      'Physician-led telehealth',
      'Adult ADHD',
      'Weight loss & metabolic health',
      'Fatigue & sleep',
      "Men's health",
      'Primary care / telehealth',
      'Transparent pricing',
      'Long-term relationships',
      'Whole-person care',
    ],
    counts: {
      current: currentCount,
      recommended: recommendedCount,
      hubs: HUB_PATHS.size,
      guides: scoredContent.filter((p) => p.type === 'guide').length,
      blogArticles: scoredContent.filter((p) => p.type === 'blog').length,
    },
    classificationCounts,
    flagCounts,
    pillarCurrent,
    pillarRecommended,
    top20,
    bottom20,
    cornerstones: cornerstones.sort((a, b) => b.scores.composite - a.scores.composite),
    supporting: supporting.sort((a, b) => b.scores.composite - a.scores.composite),
    redirects,
    cannibalizationPairs: HIGH_OVERLAP_PAIRS.length,
    pages,
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(audit, null, 2) + '\n');
  fs.writeFileSync(OUT_MD, generateMarkdown(audit) + '\n');

  console.log('Health Guide Portfolio Audit complete');
  console.log(`  Current count: ${currentCount} (guides: ${audit.counts.guides}, blog: ${audit.counts.blogArticles})`);
  console.log(`  Recommended count: ${recommendedCount}`);
  console.log(`  Classifications:`, classificationCounts);
  console.log(`  Wrote ${OUT_JSON}`);
  console.log(`  Wrote ${OUT_MD}`);
  console.log(`  Top 5 cornerstones:`);
  cornerstones.slice(0, 5).forEach((c) => console.log(`    ${c.path} (${c.scores.composite})`));
}

main();
