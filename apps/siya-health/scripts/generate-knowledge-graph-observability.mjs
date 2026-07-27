/**
 * Knowledge Graph observability — Platform v1 operating metric.
 *
 * Measures the graph, not page count:
 *   inventory · relationship health · reachability · nav depth · coverage score
 *
 * Run: node scripts/generate-knowledge-graph-observability.mjs
 * Out:  docs/KNOWLEDGE-GRAPH-OBSERVABILITY.json|.md
 *
 * Exit: non-zero if Root Service reachability < 100% (Platform v1 rule).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const REGISTRY = path.resolve(
  ROOT,
  '../siya-assistant/data/knowledge-entities.json',
);
const ASSEMBLY = path.join(ROOT, 'docs/CONTENT-ASSEMBLY-VALIDATION.json');
const OUT_JSON = path.join(ROOT, 'docs/KNOWLEDGE-GRAPH-OBSERVABILITY.json');
const OUT_MD = path.join(ROOT, 'docs/KNOWLEDGE-GRAPH-OBSERVABILITY.md');

/** Taxonomy v1 — Canonical Entity pages only */
const FAMILY_PATHS = {
  root_service: ['/primary-care'],
  service: ['/preventive-care'],
  condition: ['/adult-adhd-california'],
  symptom: ['/fatigue', '/brain-fog'],
  lab: [
    '/labs/cbc',
    '/labs/cmp',
    '/labs/lipid-panel',
    '/labs/a1c-blood-sugar',
    '/labs/thyroid',
    '/labs/iron-ferritin',
    '/labs/vitamin-b12',
    '/labs/vitamin-d',
  ],
};

const CANONICAL_PATHS = Object.values(FAMILY_PATHS).flat();

/** Care-process bridges — allowed as intermediate hops for Root reachability */
const BRIDGE_PATHS = [
  '/adhd-care',
  '/adhd-screening',
  '/pricing',
  '/primary-urgent-care',
  '/telehealth',
  '/labs',
  '/labs/preventive',
  '/labs/fatigue-brain-fog',
];

const REACHABILITY_NODES = [...new Set([...CANONICAL_PATHS, ...BRIDGE_PATHS])];

function pathToFile(p) {
  if (p.startsWith('/labs/') || p === '/labs') {
    if (p === '/labs') return path.join(ROOT, 'labs.html');
    return path.join(ROOT, p.slice(1) + '.html');
  }
  return path.join(ROOT, p.slice(1) + '.html');
}

function extractMain(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  return m ? m[0] : html;
}

function outboundAmong(html, selfPath, allowed) {
  const main = extractMain(html);
  const hrefs = [...main.matchAll(/href="(\/[^"#?]+)"/g)].map((m) => m[1]);
  const set = new Set();
  const allow = new Set(allowed);
  for (const h of hrefs) {
    const norm = h.replace(/\/$/, '') || '/';
    if (allow.has(norm) && norm !== selfPath) set.add(norm);
  }
  return [...set];
}

function countFaqs(html) {
  return (html.match(/data-faq-item/g) || []).length;
}

function countRelatedGuideLinks(html) {
  const main = extractMain(html);
  const related =
    main.match(/id="related[\w-]*"[\s\S]*?<\/section>/i) ||
    main.match(/Related (?:Health )?Guides[\s\S]*?<\/section>/i);
  if (!related) return 0;
  return (related[0].match(/href="\/[^"]+"/g) || []).length;
}

function loadRegistry() {
  const data = JSON.parse(fs.readFileSync(REGISTRY, 'utf8'));
  return data.entities || {};
}

function familyOf(entity) {
  return entity.entity_family || entity.intent || 'unknown';
}

function avg(arr) {
  return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function bfsDepth(root, adjacency, targets) {
  const depth = { [root]: 0 };
  const q = [root];
  while (q.length) {
    const cur = q.shift();
    for (const nxt of adjacency[cur] || []) {
      if (depth[nxt] === undefined) {
        depth[nxt] = depth[cur] + 1;
        q.push(nxt);
      }
    }
  }
  return {
    depth,
    reachableTargets: targets.filter((t) => depth[t] !== undefined),
    unreachableTargets: targets.filter((t) => depth[t] === undefined),
  };
}

function main() {
  const entities = loadRegistry();
  const entityList = Object.values(entities);

  const registryByFamily = {
    root_service: 0,
    service: 0,
    condition: 0,
    symptom: 0,
    lab: 0,
    other: 0,
  };
  for (const e of entityList) {
    const f = familyOf(e);
    if (f in registryByFamily) registryByFamily[f] += 1;
    else registryByFamily.other += 1;
  }

  const taxonomyCounts = {
    rootServices: FAMILY_PATHS.root_service.length,
    services: FAMILY_PATHS.service.length,
    conditions: FAMILY_PATHS.condition.length,
    symptoms: FAMILY_PATHS.symptom.length,
    laboratories: FAMILY_PATHS.lab.length,
    total: CANONICAL_PATHS.length,
  };

  /** @type {Record<string, any>} */
  const pages = {};
  for (const p of REACHABILITY_NODES) {
    const file = pathToFile(p);
    if (!fs.existsSync(file)) {
      pages[p] = {
        taxonomyOutbound: [],
        graphOutbound: [],
        inbound: [],
        faqs: 0,
        relatedGuides: 0,
        missing: true,
      };
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    pages[p] = {
      taxonomyOutbound: outboundAmong(html, p, CANONICAL_PATHS),
      graphOutbound: outboundAmong(html, p, REACHABILITY_NODES),
      inbound: [],
      faqs: CANONICAL_PATHS.includes(p) ? countFaqs(html) : 0,
      relatedGuides: CANONICAL_PATHS.includes(p) ? countRelatedGuideLinks(html) : 0,
      missing: false,
    };
  }

  // Taxonomy inbound among canonical only
  for (const p of CANONICAL_PATHS) {
    for (const t of pages[p].taxonomyOutbound) {
      if (pages[t]) pages[t].inbound.push(p);
    }
  }

  const n = CANONICAL_PATHS.length;
  const outboundCounts = CANONICAL_PATHS.map((p) => pages[p].taxonomyOutbound.length);
  const inboundCounts = CANONICAL_PATHS.map((p) => pages[p].inbound.length);

  const directedEdges = CANONICAL_PATHS.reduce(
    (s, p) => s + pages[p].taxonomyOutbound.length,
    0,
  );
  const undirected = new Set();
  for (const p of CANONICAL_PATHS) {
    for (const t of pages[p].taxonomyOutbound) {
      undirected.add([p, t].sort().join('→'));
    }
  }
  const maxUndirected = (n * (n - 1)) / 2;
  const density = maxUndirected ? undirected.size / maxUndirected : 0;

  const orphans = CANONICAL_PATHS.filter((p) => pages[p].inbound.length === 0);
  const deadEnds = CANONICAL_PATHS.filter(
    (p) => pages[p].taxonomyOutbound.length === 0,
  );

  const adjacency = {};
  for (const p of REACHABILITY_NODES) {
    adjacency[p] = pages[p]?.graphOutbound || [];
  }

  const root = '/primary-care';
  const { depth, reachableTargets, unreachableTargets } = bfsDepth(
    root,
    adjacency,
    CANONICAL_PATHS,
  );

  const reachabilityPct = n
    ? Math.round((1000 * reachableTargets.length) / n) / 10
    : 0;
  const reachabilityPass = unreachableTargets.length === 0;

  const navigationDepth = CANONICAL_PATHS.map((p) => ({
    entity: p,
    clicksFromRoot: depth[p] ?? null,
  })).sort((a, b) => {
    if (a.clicksFromRoot === null) return 1;
    if (b.clicksFromRoot === null) return -1;
    return a.clicksFromRoot - b.clicksFromRoot || a.entity.localeCompare(b.entity);
  });

  const depths = reachableTargets.map((p) => depth[p]);
  const avgDepth = avg(depths);
  const maxDepth = depths.length ? Math.max(...depths) : null;

  const reachShare = n ? reachableTargets.length / n : 0;
  const orphanRate = n ? orphans.length / n : 1;
  const connectivityScore = Math.round(
    100 * (0.7 * reachShare + 0.3 * (1 - orphanRate)),
  );

  let withRel = 0;
  for (const e of entityList) {
    const parents = e.parents || [];
    const related = e.related_entities || [];
    if (parents.length + related.length > 0) withRel += 1;
  }
  const relCompleteness = entityList.length ? withRel / entityList.length : 0;

  // Coverage score — FROZEN rubric (KNOWLEDGE-COVERAGE-SCORE.md). Do not redefine.
  const entityCompletenessPts = (() => {
    let pts = 0;
    pts += registryByFamily.root_service >= 1 ? 4 : 0;
    pts += registryByFamily.service >= 1 ? 4 : 0;
    pts += registryByFamily.condition >= 1 ? 4 : 0;
    pts += Math.min(4, (registryByFamily.symptom / 2) * 4);
    pts += Math.min(4, (registryByFamily.lab / 8) * 4);
    return pts;
  })();
  const relationshipPts = Math.min(20, (relCompleteness * 20) / 0.9);
  const densityPts = Math.min(20, (density / 0.25) * 20);

  const rootHtml = fs.existsSync(pathToFile(root))
    ? fs.readFileSync(pathToFile(root), 'utf8')
    : '';
  const rootMain = extractMain(rootHtml);
  const serviceLanes = [
    '/preventive-care',
    '/adhd-care',
    '/weight-loss-metabolic-health',
    '/womens-midlife-health',
    '/mens-health-longevity',
    '/telehealth',
    '/primary-urgent-care',
  ].filter((p) => rootMain.includes(`href="${p}"`));
  const hasPreventive = serviceLanes.includes('/preventive-care');
  const specialtyCount = serviceLanes.filter((p) => p !== '/preventive-care').length;
  const serviceCoveragePts =
    (hasPreventive ? 10 : 0) + Math.min(10, (specialtyCount / 3) * 10);

  const labPaths = new Set(FAMILY_PATHS.lab);
  let symptomLabOk = 0;
  for (const sp of FAMILY_PATHS.symptom) {
    const labsLinked = (pages[sp]?.taxonomyOutbound || []).filter((x) =>
      labPaths.has(x),
    );
    if (labsLinked.length >= 3) symptomLabOk += 1;
  }
  const symptomLabPts =
    FAMILY_PATHS.symptom.length === 0
      ? 0
      : (symptomLabOk / FAMILY_PATHS.symptom.length) * 20;

  const coverageScore = Math.round(
    entityCompletenessPts +
      relationshipPts +
      densityPts +
      serviceCoveragePts +
      symptomLabPts,
  );

  let assembly = null;
  if (fs.existsSync(ASSEMBLY)) {
    assembly = JSON.parse(fs.readFileSync(ASSEMBLY, 'utf8'));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    platform: 'v1',
    sprint: 'graph-densification-1',
    inventory: {
      canonicalEntities: taxonomyCounts.total,
      registryEntities: entityList.length,
      canonical: taxonomyCounts,
      registryByFamily,
      note: 'Canonical = Taxonomy v1 pages. Registry = all Public Knowledge API entities (includes care-process / implementation surfaces). Do not expect these totals to match.',
    },
    relationshipHealth: {
      averageInbound: Number(avg(inboundCounts).toFixed(2)),
      averageOutbound: Number(avg(outboundCounts).toFixed(2)),
      directedEdges,
      undirectedEdges: undirected.size,
      graphDensity: Number(density.toFixed(3)),
      orphanEntities: orphans,
      deadEndEntities: deadEnds,
      entityConnectivityScore: connectivityScore,
    },
    reachability: {
      from: root,
      reachable: reachableTargets.length,
      total: n,
      percent: reachabilityPct,
      pass: reachabilityPass,
      unreachable: unreachableTargets,
      rule: 'Every Canonical Entity must be reachable from /primary-care (bridges allowed).',
    },
    navigationDepth: {
      averageClicksFromRoot: Number(avgDepth.toFixed(2)),
      maxClicksFromRoot: maxDepth,
      table: navigationDepth,
      smellThreshold: 4,
      deepEntities: navigationDepth.filter(
        (r) => r.clicksFromRoot !== null && r.clicksFromRoot >= 4,
      ),
    },
    governanceHealth: {
      assemblyPass: assembly?.pass ?? null,
      fingerprintAvg: assembly?.metrics?.editorialFingerprintAvg ?? null,
      fingerprintMin: assembly?.metrics?.editorialFingerprintMin ?? null,
      fingerprintFloor: assembly?.metrics?.fingerprintFloor ?? null,
      duplicateParagraphGroups: assembly?.metrics?.duplicateParagraphGroups ?? null,
      pagesWithMultiplePrimaryCtas:
        assembly?.metrics?.pagesWithMultiplePrimaryCtas ?? null,
      note: 'Run npm run governance for full Assembly / Blocks / Hygiene PASS.',
    },
    coverage: {
      knowledgeCoverageScore: coverageScore,
      rubricFrozen: true,
      rubricDoc: 'KNOWLEDGE-COVERAGE-SCORE.md',
      components: {
        entityCompleteness: Number(entityCompletenessPts.toFixed(1)),
        relationshipCompleteness: Number(relationshipPts.toFixed(1)),
        graphDensity: Number(densityPts.toFixed(1)),
        serviceCoverage: Number(serviceCoveragePts.toFixed(1)),
        symptomLabCoverage: Number(symptomLabPts.toFixed(1)),
      },
      faqsTotal: CANONICAL_PATHS.reduce((s, p) => s + (pages[p].faqs || 0), 0),
      relatedGuidesTotal: CANONICAL_PATHS.reduce(
        (s, p) => s + (pages[p].relatedGuides || 0),
        0,
      ),
      rootServiceLanesLinked: serviceLanes,
    },
    entities: CANONICAL_PATHS.map((p) => ({
      path: p,
      inbound: pages[p].inbound.length,
      outbound: pages[p].taxonomyOutbound.length,
      faqs: pages[p].faqs,
      relatedGuides: pages[p].relatedGuides,
      clicksFromRoot: depth[p] ?? null,
      missing: !!pages[p].missing,
    })),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n');

  const depthRows = navigationDepth
    .map(
      (r) =>
        `| \`${r.entity}\` | ${r.clicksFromRoot === null ? 'unreachable' : r.clicksFromRoot} |`,
    )
    .join('\n');

  const md = `# Knowledge Graph Observability

Generated: ${report.generatedAt}  
Platform: **v1** (frozen) · Sprint: **graph-densification-1**

## Inventory (two numbers — do not conflate)

| Scope | Count |
| --- | ---: |
| **Canonical entities** (Taxonomy v1) | **${report.inventory.canonicalEntities}** |
| **Registry entities** (PK API) | **${report.inventory.registryEntities}** |

Canonical breakdown: Root ${taxonomyCounts.rootServices} · Service ${taxonomyCounts.services} · Condition ${taxonomyCounts.conditions} · Symptom ${taxonomyCounts.symptoms} · Laboratory ${taxonomyCounts.laboratories}

${report.inventory.note}

## Reachability (from Root Service)

| Metric | Value |
| --- | --- |
| Reachable from \`/primary-care\` | **${reachableTargets.length} / ${n}** (${reachabilityPct}%) |
| Pass (100% required) | **${reachabilityPass ? 'PASS' : 'FAIL'}** |
| Unreachable | ${unreachableTargets.join(', ') || 'none'} |

## Navigation depth

Avg clicks from root: **${report.navigationDepth.averageClicksFromRoot}** · Max: **${report.navigationDepth.maxClicksFromRoot}**  
Smell threshold: ≥ ${report.navigationDepth.smellThreshold} clicks

| Entity | Clicks from Root |
| --- | ---: |
${depthRows}

## Relationship health

| Metric | Value |
| --- | --- |
| Avg inbound | ${report.relationshipHealth.averageInbound} |
| Avg outbound | ${report.relationshipHealth.averageOutbound} |
| Graph density | ${report.relationshipHealth.graphDensity} |
| Connectivity score | ${report.relationshipHealth.entityConnectivityScore} |
| Orphans | ${orphans.join(', ') || 'none'} |
| Dead-ends | ${deadEnds.join(', ') || 'none'} |

## Knowledge Coverage Score (rubric frozen)

**${coverageScore} / 100** — see \`KNOWLEDGE-COVERAGE-SCORE.md\` (do not redefine monthly).

## Governance health

Assembly PASS: ${report.governanceHealth.assemblyPass} · Fingerprint avg/min: ${report.governanceHealth.fingerprintAvg} / ${report.governanceHealth.fingerprintMin}
`;

  fs.writeFileSync(OUT_MD, md);
  console.log('Wrote', path.relative(ROOT, OUT_JSON));
  console.log('Wrote', path.relative(ROOT, OUT_MD));
  console.log(
    `Reachability ${reachableTargets.length}/${n} (${reachabilityPct}%) · density ${density.toFixed(3)} · coverage ${coverageScore} · connectivity ${connectivityScore}`,
  );

  if (!reachabilityPass) {
    console.error(
      'FAIL — Root Service reachability < 100%:',
      unreachableTargets.join(', '),
    );
    process.exitCode = 1;
  }
}

main();
