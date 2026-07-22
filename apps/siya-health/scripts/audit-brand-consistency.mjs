/**
 * Brand consistency audit — scores all indexable pages against current Siya positioning.
 * Run: node scripts/audit-brand-consistency.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { HIGH_OVERLAP_PAIRS } from '../data/cannibalization-phase1.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const INVENTORY = path.join(SITE_ROOT, 'data', 'website-inventory.json');
const CTA_AUDIT = path.join(SITE_ROOT, 'data', 'cta-audit.json');
const PRUNING = path.join(SITE_ROOT, 'data', 'site-pruning-audit.json');
const OUT_JSON = path.join(SITE_ROOT, 'data', 'brand-consistency-audit.json');
const OUT_MD = path.join(SITE_ROOT, 'docs', 'BRAND-CONSISTENCY-AUDIT.md');

const BRAND_PILLARS = {
  physicianLed: /\b(physician-?led|board-?certified|licensed clinician|licensed physician|MD\b|NP-?C|PA-?C|internal medicine|family medicine)\b/i,
  adhd: /\b(adhd|attention deficit|executive function)\b/i,
  weightLoss: /\b(weight loss|glp-?1|semaglutide|tirzepatide|medical weight loss|obesity)\b/i,
  metabolic: /\b(metabolic|insulin resistance|a1c|food noise)\b/i,
  primaryCare: /\b(primary care|family medicine|urgent care|telehealth visit|whole-?person)\b/i,
  transparentPricing: /\b(transparent pricing|membership|pricing|\$149|\$79|\$149|cash pay|fsa|hsa)\b/i,
  longTerm: /\b(ongoing|follow-?up|long-?term|relationship|monitoring)\b/i,
  evidenceBased: /\b(evidence-?based|structured evaluation|validated|clinical judgment|clinically reviewed|medically reviewed)\b/i,
  wholePerson: /\b(whole-?person|comprehensive|full picture|focus, energy, weight|fatigue|mood|hormones)\b/i,
};

const FLAG_PATTERNS = {
  adhdOnlyPositioning: {
    test: (ctx) => {
      if (ctx.path === '/adhd-care' || ctx.path === '/adhd-screening' || ctx.path.startsWith('/adhd-diagnosis') || ctx.path.includes('adhd')) {
        if (ctx.isServiceOrGeo) {
          return /\b(adhd clinic|adhd only|only adhd|specializes exclusively in adhd|adhd specialist only)\b/i.test(ctx.sample);
        }
      }
      if (!ctx.isAdhdTopic && ctx.adhdDensity > 0.55 && !ctx.hasWholePerson) return true;
      if (/\b(guessing about adhd|done guessing about adhd|adhd telehealth practice only)\b/i.test(ctx.sample)) return true;
      if (ctx.path === '/' || ctx.path === '/about' || ctx.path === '/telehealth' || ctx.path === '/providers') {
        return /\b(adhd clinic|only treat adhd|adhd-only)\b/i.test(ctx.sample);
      }
      return false;
    },
    label: 'ADHD-only positioning',
  },
  medicationFirst: {
    test: (ctx) => {
      const medTitle = /\b(vs\.|versus|comparison|side effects|how it works|ir vs xr|dosage|dose|mg\b|adderall|vyvanse|semaglutide|tirzepatide|minoxidil|sildenafil|phentermine|modafinil|ambien)\b/i.test(ctx.title + ctx.h1);
      const clinician = BRAND_PILLARS.physicianLed.test(ctx.sample) || BRAND_PILLARS.evidenceBased.test(ctx.sample) || /evaluation|prescriber|monitoring/i.test(ctx.sample);
      return medTitle && !clinician && (ctx.pageType.includes('Blog') || ctx.pageType.includes('Health Guide'));
    },
    label: 'Medication-first positioning',
  },
  contradictoryMessaging: {
    test: (ctx) =>
      /\b(psychiatry practice|telepsychiatry|psychiatric practice|we are psychiatrists)\b/i.test(ctx.sample) &&
      !/\b(not psychiatry|not a psychiatry|primary care-?led|internal medicine|family medicine)\b/i.test(ctx.sample),
    label: 'Contradictory messaging',
  },
  legacyMarketplace: {
    test: (ctx) =>
      /\b(contractor|marketplace|bronze|silver|gold tier|join the waitlist|concierge membership|subscription plan|monthly subscription)\b/i.test(ctx.sample) ||
      (ctx.path === '/membership-pricing' && /\b(bronze|silver|gold|waitlist)\b/i.test(ctx.html)),
    label: 'Legacy marketplace messaging',
  },
  excessiveCTAs: {
    test: (ctx) => ctx.mainCtaCount > 3,
    label: 'Excessive CTAs',
  },
  outdatedLanguage: {
    test: (ctx) =>
      /\b(try harder|you'?re not lazy|not a full bio|three physicians\. one standard|contracted physicians|prescription menu|chatbot medicine only)\b/i.test(ctx.sample) ||
      (ctx.path === '/about' && /guessing about adhd/i.test(ctx.sample)),
    label: 'Outdated language',
  },
  duplicateMessaging: {
    test: (ctx) => !!ctx.duplicateOf || ctx.isCannibalDuplicate,
    label: 'Duplicate messaging',
  },
};

const RECENTLY_ALIGNED = new Set(['/about', '/providers', '/telehealth']);

const DELETE_PATHS = new Set([
  '/terms',
  '/privacy-policy',
  '/blog/all',
  '/adhd-diagnosis-florida',
  '/siya-circle',
  '/blog/ambien-and-sleep-medications-risks-and-benefits',
  '/blog/glutathione-and-peptides-what-do-they-actually-do',
  '/blog/modafinil-for-focus-and-fatigue-is-it-safe',
]);

function pathToFile(p) {
  if (p === '/') return path.join(SITE_ROOT, 'index.html');
  if (p === '/answers') return path.join(SITE_ROOT, 'answers/index.html');
  if (p.startsWith('/answers/')) return path.join(SITE_ROOT, 'answers', p.slice(9) + '.html');
  if (p === '/blog') return path.join(SITE_ROOT, 'blog/index.html');
  if (p.startsWith('/blog/')) return path.join(SITE_ROOT, 'blog', p.slice(6) + '.html');
  if (p === '/providers') return path.join(SITE_ROOT, 'providers/index.html');
  if (p.startsWith('/providers/')) return path.join(SITE_ROOT, 'providers', p.slice(11) + '.html');
  if (p.startsWith('/legal/')) return path.join(SITE_ROOT, 'legal', p.slice(7), 'index.html');
  return path.join(SITE_ROOT, p.slice(1) + '.html');
}

function extractSample(html) {
  const title = (html.match(/<title>([^<]+)<\/title>/i) || ['', ''])[1];
  const desc = (html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i) || ['', ''])[1];
  const main = (html.match(/<main[^>]*>([\s\S]*?)<\/main>/i) || ['', html])[1];
  const h1 = (main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || ['', ''])[1].replace(/<[^>]+>/g, ' ');
  const text = main.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return { title, desc, h1, text, sample: `${title} ${desc} ${h1} ${text.slice(0, 2500)}`, wordCount: text.split(/\s+/).filter(Boolean).length };
}

function countPillars(sample) {
  const hits = {};
  for (const [k, re] of Object.entries(BRAND_PILLARS)) hits[k] = re.test(sample) ? 1 : 0;
  return { hits, count: Object.values(hits).reduce((a, b) => a + b, 0) };
}

function scoreMission(page, flags, pillars, ctx) {
  let s = 5;
  const t = page.pageType;
  if (['Homepage', 'Service Page', 'About', 'Provider Hub', 'Provider Profile'].includes(t)) s += 2;
  if (page.path.startsWith('/legal')) s += 1;
  if (page.path.startsWith('/answers') || page.path.startsWith('/blog/')) s += ctx.hasConversion ? 1.5 : 0.5;
  if (pillars.count >= 4) s += 1.5;
  if (pillars.count >= 6) s += 0.5;
  if (RECENTLY_ALIGNED.has(page.path)) s += 1;
  if (flags.some((f) => f === 'ADHD-only positioning' || f === 'Legacy marketplace messaging')) s -= 2;
  if (flags.includes('Duplicate messaging')) s -= 1;
  if (DELETE_PATHS.has(page.path)) s -= 3;
  return Math.max(1, Math.min(10, Math.round(s)));
}

function scoreBrand(page, flags, pillars, ctx) {
  let s = 4 + pillars.count * 0.65;
  if (RECENTLY_ALIGNED.has(page.path)) s += 1.5;
  if (page.path === '/') s += 1;
  if (flags.includes('ADHD-only positioning')) s -= 2.5;
  if (flags.includes('Medication-first positioning')) s -= 1.5;
  if (flags.includes('Legacy marketplace messaging')) s -= 3;
  if (flags.includes('Contradictory messaging')) s -= 2;
  if (flags.includes('Outdated language')) s -= 2;
  if (flags.includes('Excessive CTAs')) s -= 1;
  if (flags.includes('Duplicate messaging')) s -= 1;
  if (ctx.path === '/membership-pricing') s -= 2;
  if (page.path.startsWith('/legal')) s += 1;
  return Math.max(1, Math.min(10, Math.round(s)));
}

function classify(page, flags, mission, brand, duplicateOf, pruningClass) {
  if (DELETE_PATHS.has(page.path) || pruningClass === 'DELETE') return 'DELETE';
  if (duplicateOf || flags.includes('Duplicate messaging')) {
    if (page.path.startsWith('/answers/')) return 'MERGE';
  }
  if (pruningClass === 'REDIRECT' || pruningClass === 'MERGE') return 'MERGE';
  if (mission <= 5 || brand <= 5 || flags.length >= 2) return 'REWRITE';
  if (brand <= 6 && page.pageType === 'Service Page') return 'REWRITE';
  if (page.path === '/membership-pricing') return 'REWRITE';
  if (flags.includes('Legacy marketplace messaging')) return 'REWRITE';
  if (flags.includes('Outdated language')) return 'REWRITE';
  if (flags.includes('ADHD-only positioning') && !page.path.includes('adhd')) return 'REWRITE';
  return 'KEEP';
}

function loadJson(p, fallback = null) {
  if (!fs.existsSync(p)) return fallback;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function main() {
  const inventory = loadJson(INVENTORY);
  const cta = loadJson(CTA_AUDIT, { pageResults: [] });
  const pruning = loadJson(PRUNING, { pages: [] });
  const ctaByPath = new Map((cta.pageResults || []).map((r) => [r.path, r]));
  const pruningByPath = new Map((pruning.pages || []).map((r) => [r.path, r.classification]));

  const cannibalGuides = new Set(HIGH_OVERLAP_PAIRS.filter((p) => p.classification === 'Duplicate').map((p) => p.guide));

  const results = [];
  for (const page of inventory.pages.filter((p) => p.indexable)) {
    const file = pathToFile(page.path);
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const { title, h1, sample, wordCount } = extractSample(html);
    const pillars = countPillars(sample);
    const adhdWords = (sample.match(/\badhd\b/gi) || []).length;
    const totalWords = Math.max(wordCount, 1);
    const adhdDensity = adhdWords / totalWords;
    const mainCtaCount = ctaByPath.get(page.path)?.mainCtaCount ?? 0;
    const hasConversion = /book\.carepatron|\/adhd-care|\/weight-loss-metabolic-health|\/telehealth|\/membership-pricing/i.test(html);
    const isServiceOrGeo = page.pageType === 'Service Page' || page.pageType === 'Geo SEO Landing';
    const isAdhdTopic = /adhd/i.test(page.path + title + h1);

    const ctx = {
      path: page.path,
      pageType: page.pageType,
      title,
      h1,
      sample,
      html,
      mainCtaCount,
      duplicateOf: page.duplicateOf,
      isCannibalDuplicate: cannibalGuides.has(page.path),
      adhdDensity,
      isServiceOrGeo,
      isAdhdTopic,
      hasWholePerson: BRAND_PILLARS.wholePerson.test(sample),
      hasConversion,
    };

    const flags = [];
    for (const { test, label } of Object.values(FLAG_PATTERNS)) {
      if (test(ctx)) flags.push(label);
    }

    const mission = scoreMission(page, flags, pillars, ctx);
    const brand = scoreBrand(page, flags, pillars, ctx);
    const recommendation = classify(page, flags, mission, brand, page.duplicateOf, pruningByPath.get(page.path));

    results.push({
      path: page.path,
      pageType: page.pageType,
      title: page.title || title,
      h1: page.h1 || h1,
      missionAlignment: mission,
      brandAlignment: brand,
      composite: Math.round((mission + brand) / 2 * 10) / 10,
      flags,
      pillarsHit: Object.entries(pillars.hits).filter(([, v]) => v).map(([k]) => k),
      recommendation,
      duplicateOf: page.duplicateOf,
      mainCtaCount,
    });
  }

  results.sort((a, b) => a.composite - b.composite);

  const byRec = {};
  for (const r of results) byRec[r.recommendation] = (byRec[r.recommendation] || 0) + 1;

  const flagCounts = {};
  for (const r of results) for (const f of r.flags) flagCounts[f] = (flagCounts[f] || 0) + 1;

  const json = {
    generated: new Date().toISOString(),
    brandPillars: Object.keys(BRAND_PILLARS),
    summary: {
      pagesAudited: results.length,
      avgMission: Math.round((results.reduce((s, r) => s + r.missionAlignment, 0) / results.length) * 10) / 10,
      avgBrand: Math.round((results.reduce((s, r) => s + r.brandAlignment, 0) / results.length) * 10) / 10,
      byRecommendation: byRec,
      flagCounts,
    },
    pages: results.sort((a, b) => a.path.localeCompare(b.path)),
    lowestBrand: [...results].sort((a, b) => a.brandAlignment - b.brandAlignment).slice(0, 20),
    highestBrand: [...results].sort((a, b) => b.brandAlignment - a.brandAlignment).slice(0, 20),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(json, null, 2) + '\n');

  let md = `# Brand Consistency Audit — Siya Health\n\n`;
  md += `Generated: ${json.generated.split('T')[0]}\n\n`;
  md += `> Audit-only. Scores every **${results.length}** indexable pages against current brand positioning.\n\n`;
  md += `## Current brand pillars\n\n`;
  md += `- Physician-led telehealth\n- ADHD (as a service line, not sole identity)\n- Weight loss\n- Metabolic health\n- Primary care\n- Transparent pricing\n- Long-term relationships\n- Evidence-based care\n- Whole-person care\n\n`;

  md += `## Executive summary\n\n`;
  md += `| Metric | Value |\n|--------|------:|\n`;
  md += `| Pages audited | ${results.length} |\n`;
  md += `| Avg Mission Alignment | ${json.summary.avgMission}/10 |\n`;
  md += `| Avg Brand Alignment | ${json.summary.avgBrand}/10 |\n\n`;

  md += `### Recommendations\n\n| Action | Count |\n|--------|------:|\n`;
  for (const [k, v] of Object.entries(byRec).sort()) md += `| ${k} | ${v} |\n`;

  md += `\n### Flag frequency\n\n| Flag | Pages |\n|------|------:|\n`;
  for (const [k, v] of Object.entries(flagCounts).sort((a, b) => b[1] - a[1])) md += `| ${k} | ${v} |\n`;

  md += `\n---\n\n## Top 20 — highest brand alignment\n\n`;
  md += `| Page | Mission | Brand | Action | Flags |\n|------|--------:|------:|--------|-------|\n`;
  for (const r of json.highestBrand) {
    md += `| \`${r.path}\` | ${r.missionAlignment} | ${r.brandAlignment} | ${r.recommendation} | ${r.flags.join(', ') || '—'} |\n`;
  }

  md += `\n## Top 20 — lowest brand alignment\n\n`;
  md += `| Page | Mission | Brand | Action | Flags |\n|------|--------:|------:|--------|-------|\n`;
  for (const r of json.lowestBrand) {
    md += `| \`${r.path}\` | ${r.missionAlignment} | ${r.brandAlignment} | ${r.recommendation} | ${r.flags.join(', ') || '—'} |\n`;
  }

  for (const rec of ['DELETE', 'MERGE', 'REWRITE', 'KEEP']) {
    const items = results.filter((r) => r.recommendation === rec);
    if (!items.length) continue;
    md += `\n---\n\n## ${rec} (${items.length})\n\n`;
    md += `| Page | Type | Mission | Brand | Flags |\n|------|------|--------:|------:|-------|\n`;
    for (const r of items.sort((a, b) => a.brandAlignment - b.brandAlignment)) {
      md += `| \`${r.path}\` | ${r.pageType} | ${r.missionAlignment} | ${r.brandAlignment} | ${r.flags.join('; ') || '—'} |\n`;
    }
  }

  md += `\n---\n\n## Full per-page audit\n\n`;
  for (const r of json.pages) {
    md += `### ${r.path}\n\n`;
    md += `- **Type:** ${r.pageType}\n`;
    md += `- **Title:** ${r.title}\n`;
    md += `- **Mission Alignment:** ${r.missionAlignment}/10\n`;
    md += `- **Brand Alignment:** ${r.brandAlignment}/10\n`;
    md += `- **Recommendation:** **${r.recommendation}**\n`;
    md += `- **Flags:** ${r.flags.length ? r.flags.join(', ') : 'None'}\n`;
    md += `- **Pillars present:** ${r.pillarsHit.length ? r.pillarsHit.join(', ') : 'None detected'}\n`;
    if (r.duplicateOf) md += `- **Duplicate of:** ${r.duplicateOf}\n`;
    if (r.mainCtaCount > 3) md += `- **Main CTAs:** ${r.mainCtaCount} (excessive)\n`;
    md += `\n`;
  }

  md += `\n---\n\n## Implementation priorities\n\n`;
  md += `### P0 — Brand-breaking\n`;
  md += `- **REWRITE** \`/membership-pricing\` — legacy Bronze/Silver/Gold conflicts with $149/$79/$149 care-delivery model\n`;
  md += `- **DELETE** legacy legal stubs and off-brand articles (see DELETE list)\n`;
  md += `- **MERGE** 17 cannibalizing guide→blog duplicate pairs\n\n`;
  md += `### P1 — Positioning drift\n`;
  md += `- **REWRITE** geo ADHD landings to reference whole-person care + unified pricing\n`;
  md += `- **REWRITE** pages with excessive CTAs (homepage, adhd-screening, provider hub)\n`;
  md += `- Align provider bios sitewide per PROVIDER-CONSISTENCY-AUDIT.md\n\n`;
  md += `### P2 — Polish\n`;
  md += `- Medication comparison blogs/guides: add clinician-context framing\n`;
  md += `- Consolidate ADHD funnel URLs per SITE-PRUNING-AUDIT.md\n\n`;
  md += `Regenerate: \`node scripts/audit-brand-consistency.mjs\`\n`;

  fs.writeFileSync(OUT_MD, md);

  console.log('Wrote', OUT_MD);
  console.log('Wrote', OUT_JSON);
  console.log('Pages:', results.length);
  console.log('Recommendations:', byRec);
  console.log('Avg mission/brand:', json.summary.avgMission, json.summary.avgBrand);
}

main();
