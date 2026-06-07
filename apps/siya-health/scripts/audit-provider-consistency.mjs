/**
 * Provider consistency audit — scans sitewide mentions vs canonical data.
 * Run: node scripts/audit-provider-consistency.mjs
 * Outputs: data/provider-consistency-audit.json
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getAllProviders, providerServiceStates } from '../data/providers.mjs';
import { PROVIDER_HUB_PRESENTATION } from '../data/provider-hub-presentation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = path.join(__dirname, '..');
const OUT_JSON = path.join(SITE_ROOT, 'data/provider-consistency-audit.json');

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  'docs/visual-audit-screenshots',
  'docs/about-sprint-screenshots',
  'docs/mvp-polish-screenshots',
  'docs/weight-loss-sprint1-screenshots',
  'docs/weight-loss-sprint3-screenshots',
  'docs/adhd-sprint3-screenshots',
]);

const SCAN_EXT = new Set(['.html', '.mjs', '.json', '.txt', '.md', '.csv']);

const PROVIDER_SEARCH = [
  { slug: 'dr-sneh-pandey', patterns: [/Sneh Pandey/i, /dr-sneh-pandey/i] },
  { slug: 'dr-vanessa-urbina', patterns: [/Vanessa Urbina/i, /dr-vanessa-urbina/i] },
  { slug: 'dr-natasha-desai', patterns: [/Natasha Desai/i, /dr-natasha-desai/i] },
  { slug: 'dr-swati-pandey', patterns: [/Swati Pandey/i, /dr-swati-pandey/i] },
  { slug: 'megan-wunderlich', patterns: [/Megan Wunderlich/i, /megan-wunderlich/i] },
  { slug: 'derek-timbs', patterns: [/Derek Timbs/i, /derek-timbs/i] },
  { slug: 'wendy-delgado', patterns: [/Wendy Delgado/i, /wendy-delgado/i] },
];

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(SITE_ROOT, full);
    if (ent.isDirectory()) {
      if (SKIP_DIRS.has(ent.name) || SKIP_DIRS.has(rel)) continue;
      walk(full, files);
    } else if (SCAN_EXT.has(path.extname(ent.name))) {
      files.push(full);
    }
  }
  return files;
}

function stripHtml(s) {
  return s.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractField(html, regex) {
  const m = html.match(regex);
  return m ? stripHtml(m[1]) : null;
}

function statesFromText(text) {
  const found = new Set();
  const abbrMap = { CA: 'California', TX: 'Texas', PA: 'Pennsylvania', FL: 'Florida', OH: 'Ohio' };
  for (const [abbr, full] of Object.entries(abbrMap)) {
    if (new RegExp(`\\b${abbr}\\b`).test(text)) found.add(abbr);
    if (new RegExp(`\\b${full}\\b`, 'i').test(text)) found.add(abbr);
  }
  return [...found].sort();
}

function scanFile(relPath, content, provider) {
  const occurrences = [];
  const slug = provider.slug;

  if (!PROVIDER_SEARCH.find((p) => p.slug === slug).patterns.some((re) => re.test(content))) {
    return occurrences;
  }

  const lineCount = content.split('\n').filter((line) =>
    PROVIDER_SEARCH.find((p) => p.slug === slug).patterns.some((re) => re.test(line)),
  ).length;

  occurrences.push({
    file: relPath,
    field: 'mention_count',
    current: String(lineCount),
    issue: lineCount > 0 ? null : 'no mention',
  });

  // Role extractions
  const rolePatterns = [
    { field: 'provider-lp-role-line', re: new RegExp(`provider-lp-role-line[^>]*>[\\s\\S]*?<strong>([^<]+)</strong>`, 'i') },
    { field: 'provider-index-role', re: new RegExp(`${slug}[^\\n]*\\n[\\s\\S]{0,400}?provider-index-role">([^<]+)`, 'i') },
    { field: 'about-team-role', re: new RegExp(`${provider.givenName}[\\s\\S]{0,300}?about-team-role">([^<]+)`, 'i') },
    { field: 'schema-jobTitle', re: new RegExp(`"jobTitle":"([^"]+)"[\\s\\S]{0,200}?${slug}`, 'i') },
    { field: 'schema-jobTitle-alt', re: new RegExp(`${slug}[\\s\\S]{0,400}?"jobTitle":"([^"]+)"`, 'i') },
    { field: 'llms-role', re: new RegExp(`${provider.familyName}[^\\n]*—\\s*([^(:]+)`, 'i') },
  ];

  for (const { field, re } of rolePatterns) {
    const val = extractField(content, re);
    if (val) {
      occurrences.push({ file: relPath, field, current: val, issue: null });
    }
  }

  // States from data-states attribute near provider
  const dataStatesRe = new RegExp(
    `about-team-card[^>]*data-states="([^"]+)"[\\s\\S]{0,500}?${provider.givenName}|${provider.givenName}[\\s\\S]{0,500}?data-states="([^"]+)"`,
    'i',
  );
  const dsMatch = content.match(dataStatesRe);
  if (dsMatch) {
    const raw = dsMatch[1] || dsMatch[2];
    occurrences.push({
      file: relPath,
      field: 'data-states',
      current: raw,
      issue: null,
    });
  }

  const licensedRe = new RegExp(
    `${provider.givenName}[\\s\\S]{0,400}?about-team-states">Licensed in ([^<]+)|provider-index-states">Licensed in: ([^<]+)`,
    'i',
  );
  const licMatch = content.match(licensedRe);
  if (licMatch) {
    occurrences.push({
      file: relPath,
      field: 'licensed-in-text',
      current: stripHtml(licMatch[1] || licMatch[2]),
      issue: null,
    });
  }

  // Bio / tagline
  const bioRe = new RegExp(
    `${provider.givenName}[\\s\\S]{0,400}?about-team-bio">([^<]+)|about-team-tagline">([^<]+)|provider-index-teaser">([^<]+)`,
    'i',
  );
  const bioMatch = content.match(bioRe);
  if (bioMatch) {
    occurrences.push({
      file: relPath,
      field: 'bio/tagline',
      current: stripHtml(bioMatch[1] || bioMatch[2] || bioMatch[3]),
      issue: null,
    });
  }

  // ADHD-CCSP formatting
  if (/ADHD-CCSP|ADHD Clinical Services Provider/i.test(content) && new RegExp(provider.familyName, 'i').test(content)) {
    const ccspMatches = [...content.matchAll(/ADHD-CCSP(?:\s*\([^)]+\))?|ADHD Clinical Services Provider Program/gi)].map((m) => m[0]);
    if (ccspMatches.length) {
      occurrences.push({
        file: relPath,
        field: 'ADHD-CCSP-format',
        current: [...new Set(ccspMatches)].join(' | '),
        issue: ccspMatches.length > 1 ? 'multiple ADHD-CCSP spellings on same page' : null,
      });
    }
  }

  return occurrences;
}

function buildCanonicalTruth(provider) {
  const hub = PROVIDER_HUB_PRESENTATION[provider.slug] || {};
  return {
    slug: provider.slug,
    name: provider.name,
    credentials: provider.credentials,
    honorificSuffix: provider.honorificSuffix,
    roleProfile: provider.role,
    roleHub: hub.role || null,
    roleHomepage: provider.homepageRole || null,
    roleSchema: provider.schema?.jobTitle || null,
    boardCertifications: provider.boardCertifications,
    hubCredentials: hub.credentials || null,
    statesLicensed: provider.statesLicensed,
    stateAbbreviations: provider.stateAbbreviations,
    serviceStates: providerServiceStates(provider),
    clinicalFocus: provider.clinicalFocus?.map(stripHtml) || [],
    hubFocus: hub.focus || [],
    shortBio: provider.shortBio,
    homepageBio: provider.homepageBio || null,
    hubDescription: hub.description || null,
    servicePageTagline: provider.servicePageTagline,
    conditionsTreated: provider.conditionsTreated,
  };
}

function detectIssues(provider, truth, allOccurrences) {
  const issues = [];
  const slugOccs = allOccurrences.filter((o) => o.slug === provider.slug);

  // Role mismatches
  const roles = new Set();
  if (truth.roleProfile) roles.add(truth.roleProfile);
  if (truth.roleHub) roles.add(truth.roleHub);
  if (truth.roleHomepage) roles.add(truth.roleHomepage);
  if (truth.roleSchema) roles.add(truth.roleSchema);

  const roleOccs = slugOccs.filter((o) =>
    ['provider-lp-role-line', 'provider-index-role', 'about-team-role', 'schema-jobTitle', 'schema-jobTitle-alt', 'llms-role'].includes(o.field),
  );
  for (const occ of roleOccs) {
    const normalized = occ.current.replace(/\s*·.*$/, '').replace(/Accepting.*$/i, '').trim();
    const hubRole = truth.roleHub?.split('·')[0]?.trim();
    const profileRole = truth.roleProfile;
    const homepageRole = truth.roleHomepage;

    const matchesCanonical =
      normalized === profileRole ||
      normalized === hubRole ||
      normalized === homepageRole ||
      normalized === truth.roleSchema ||
      (truth.roleHub && truth.roleHub.includes(normalized)) ||
      (profileRole && profileRole.includes(normalized));

    if (!matchesCanonical && occ.current) {
      issues.push({
        type: 'role',
        severity: 'medium',
        file: occ.file,
        field: occ.field,
        current: occ.current,
        expected: truth.roleHub || truth.roleProfile,
        message: `Role "${occ.current}" differs from canonical hub/profile role`,
      });
    }
  }

  // Wendy PA title
  if (provider.slug === 'wendy-delgado') {
    const paIssues = slugOccs.filter(
      (o) => o.field === 'about-team-role' && /Physician Assistant/i.test(o.current),
    );
    for (const o of paIssues) {
      issues.push({
        type: 'credentials',
        severity: 'medium',
        file: o.file,
        field: o.field,
        current: o.current,
        expected: 'Physician Associate',
        message: 'Profile uses "Physician Associate" (NCCPA/modern PA title); surface uses "Physician Assistant"',
      });
    }
  }

  // Swati role hub vs profile
  if (provider.slug === 'dr-swati-pandey') {
    if (truth.roleProfile !== truth.roleHub && truth.roleHub) {
      issues.push({
        type: 'role',
        severity: 'high',
        file: 'data/providers.mjs vs data/provider-hub-presentation.mjs',
        field: 'role',
        current: `Profile: "${truth.roleProfile}" | Hub: "${truth.roleHub}"`,
        expected: truth.roleHub,
        message: 'Founder-approved hub says Internal Medicine Physician; profile page says Licensed Medical Provider',
      });
    }
  }

  // Natasha role
  if (provider.slug === 'dr-natasha-desai') {
    if (truth.roleProfile !== truth.roleHub) {
      issues.push({
        type: 'role',
        severity: 'medium',
        file: 'data/providers.mjs vs data/provider-hub-presentation.mjs',
        field: 'role',
        current: `Profile: "${truth.roleProfile}" | Hub: "${truth.roleHub}"`,
        expected: truth.roleHub,
        message: 'Profile role includes Behavioral Medicine; hub uses Family Medicine Physician',
      });
    }
  }

  // Wendy bio ADHD vs weight focus
  if (provider.slug === 'wendy-delgado' && truth.homepageBio?.match(/ADHD/i)) {
    issues.push({
      type: 'positioning',
      severity: 'high',
      file: 'data/providers-additional.mjs',
      field: 'homepageBio',
      current: truth.homepageBio,
      expected: 'Weight-loss / GLP-1 telehealth focus (hub: Medical weight loss, not primary ADHD)',
      message: 'homepageBio and hub presentation claim ADHD/primary care; profile clinical focus is weight loss only',
    });
  }

  // State mismatches on cards
  const canonicalStates = truth.stateAbbreviations.sort().join(',');
  for (const occ of slugOccs.filter((o) => o.field === 'data-states')) {
    const occStates = occ.current
      .split(',')
      .map((s) => s.trim())
      .sort()
      .join(',');
    if (occStates !== canonicalStates) {
      issues.push({
        type: 'states',
        severity: occ.current.includes('OH') && !truth.serviceStates.some((s) => s === 'Ohio') ? 'low' : 'medium',
        file: occ.file,
        field: 'data-states',
        current: occ.current,
        expected: canonicalStates,
        message:
          occStates === canonicalStates
            ? null
            : `State chip list ${occ.current} vs license list ${canonicalStates}`,
      });
    }
  }

  // Board cert naming
  if (provider.slug === 'dr-natasha-desai') {
    const hasFamilyOnly = slugOccs.some((o) => /Family Medicine Physician/i.test(o.current || ''));
    const profileCert = truth.boardCertifications?.[0];
    if (profileCert?.includes('Behavioral') && hasFamilyOnly) {
      issues.push({
        type: 'credentials',
        severity: 'low',
        file: 'cross-cutting',
        field: 'boardCertifications',
        current: profileCert,
        expected: 'Family & Behavioral Medicine (profile) vs Family Medicine (hub cards)',
        message: 'Board certification label varies between surfaces',
      });
    }
  }

  // About page incomplete roster
  if (provider.slug === 'dr-vanessa-urbina') {
    const aboutOccs = slugOccs.filter((o) => o.file === 'about.html');
    if (aboutOccs.length === 0 || aboutOccs.every((o) => o.field === 'mention_count' && o.current === '0')) {
      issues.push({
        type: 'positioning',
        severity: 'high',
        file: 'about.html',
        field: 'care-team section',
        current: 'Not listed (only 3 of 7 providers on About page)',
        expected: 'All 7 providers or explicit link to /providers',
        message: 'About care team section omits 4 contracted clinicians including Dr. Urbina',
      });
    }
  }

  return issues;
}

// Main
const providers = getAllProviders();
const files = walk(SITE_ROOT);
const allOccurrences = [];
const mentionCounts = { total: 0, byProvider: {} };

for (const p of PROVIDER_SEARCH) {
  mentionCounts.byProvider[p.slug] = 0;
}

for (const file of files) {
  const rel = path.relative(SITE_ROOT, file);
  if (rel.startsWith('data/provider-consistency-audit.json')) continue;
  const content = fs.readFileSync(file, 'utf8');

  for (const search of PROVIDER_SEARCH) {
    const provider = providers.find((p) => p.slug === search.slug);
    if (!provider) continue;
    const matched = search.patterns.some((re) => re.test(content));
    if (!matched) continue;

    const lines = content.split('\n').filter((line) => search.patterns.some((re) => re.test(line))).length;
    mentionCounts.byProvider[search.slug] += lines;
    mentionCounts.total += lines;

    const occs = scanFile(rel, content, provider);
    for (const occ of occs) {
      allOccurrences.push({ slug: search.slug, ...occ });
    }
  }
}

const truths = {};
const allIssues = [];
const issuesByType = { credentials: 0, role: 0, states: 0, bio: 0, positioning: 0, adhd_ccsp: 0 };

for (const provider of providers) {
  truths[provider.slug] = buildCanonicalTruth(provider);
  const issues = detectIssues(provider, truths[provider.slug], allOccurrences);
  allIssues.push(...issues.map((i) => ({ slug: provider.slug, ...i })));
}

for (const issue of allIssues) {
  issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
}

// Manual high-confidence cross-cutting issues
const crossCutting = [
  {
    id: 'CC-01',
    type: 'states',
    severity: 'medium',
    message: 'Homepage/service cards use state abbreviations (FL, TX) while profile pages and hub use full names (Florida, Texas)',
    surfaces: ['index.html', 'providers/index.html', 'providers/*.html'],
    fix: 'Standardize patient-facing state display: full names on profiles/hub; abbreviations OK on compact cards with title tooltips',
  },
  {
    id: 'CC-02',
    type: 'adhd_ccsp',
    severity: 'low',
    message: 'ADHD-CCSP appears as "ADHD-CCSP", "ADHD-CCSP (ADHD Clinical Services Provider Program)", and "ADHD Clinical Services Provider Program (ADHD-CCSP)"',
    surfaces: ['providers/dr-sneh-pandey.html', 'providers/dr-natasha-desai.html', 'providers/dr-swati-pandey.html', 'adhd-care.html'],
    fix: 'First mention: "ADHD-CCSP (ADHD Clinical Services Provider Program)"; subsequent: "ADHD-CCSP"',
  },
  {
    id: 'CC-03',
    type: 'positioning',
    severity: 'high',
    message: 'about.html care team lists only 3 physicians; omits Urbina, Megan, Derek, Wendy despite "View full care team (7 providers)" link',
    surfaces: ['about.html'],
    fix: 'Regenerate About care team from getAllProviders() or match homepage 7-card grid',
  },
  {
    id: 'CC-04',
    type: 'positioning',
    severity: 'medium',
    message: 'State landing pages say "Board-certified, ADHD-CCSP trained providers" but NPs/PAs on roster are not board-certified physicians',
    surfaces: ['adhd-diagnosis-*.html', 'adult-adhd-diagnosis.html', 'adhd-treatment-online.html'],
    fix: 'Use "Licensed, ADHD-CCSP–trained clinicians" on pages listing mixed roster',
  },
  {
    id: 'CC-05',
    type: 'bio',
    severity: 'medium',
    message: 'homepageBio fields in providers.mjs diverge from hub presentation descriptions for several providers',
    surfaces: ['data/providers.mjs', 'data/provider-hub-presentation.mjs', 'index.html', 'providers/index.html'],
    fix: 'Align homepageBio to hub.description or regenerate homepage cards from hub overlay',
  },
  {
    id: 'CC-06',
    type: 'states',
    severity: 'low',
    message: 'Derek Timbs OH license shown on cards (TX, OH) but Siya service footprint is TX only; profile explains this but compact cards do not',
    surfaces: ['index.html', 'telehealth.html', 'weight-loss-metabolic-health.html', 'mens-health-longevity.html'],
    fix: 'Add license-only styling (site-chrome already has provider-state-chip--license-only on profiles); extend to homepage cards',
  },
  {
    id: 'CC-07',
    type: 'credentials',
    severity: 'medium',
    message: 'Wendy Delgado: role "Physician Associate" on profile vs "Physician Assistant" on homepage, hub, and index',
    surfaces: ['index.html', 'providers/index.html', 'data/provider-hub-presentation.mjs', 'data/providers-additional.mjs homepageRole'],
    fix: 'Use "Physician Associate" sitewide (California PA modern title) unless legal prefers PA',
  },
  {
    id: 'CC-08',
    type: 'bio',
    severity: 'high',
    message: 'Wendy Delgado hub/homepage claim ADHD support and primary care; profile and clinicalFocus are weight-loss/GLP-1 only',
    surfaces: ['data/provider-hub-presentation.mjs', 'data/providers-additional.mjs', 'index.html', 'providers/index.html'],
    fix: 'Remove ADHD from Wendy hub focus unless clinically confirmed; align to weight loss telehealth',
  },
];

const output = {
  generatedAt: new Date().toISOString().slice(0, 10),
  mentionCounts,
  issuesByType,
  totalIssues: allIssues.length + crossCutting.length,
  canonicalTruth: truths,
  occurrences: allOccurrences,
  issues: allIssues,
  crossCutting,
};

fs.writeFileSync(OUT_JSON, JSON.stringify(output, null, 2));
console.log(`Wrote ${OUT_JSON}`);
console.log(`Total mention lines: ${mentionCounts.total}`);
console.log(`Issues detected: ${output.totalIssues}`);
