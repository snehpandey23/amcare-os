/**
 * Knowledge Graph observability — Platform v1 operating metric.
 *
 * Measures the graph, not page count:
 *   entity inventory · relationship health · governance gates · coverage score
 *
 * Run: node scripts/generate-knowledge-graph-observability.mjs
 * Out:  docs/KNOWLEDGE-GRAPH-OBSERVABILITY.json
 *       docs/KNOWLEDGE-GRAPH-OBSERVABILITY.md
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

/** Taxonomy v1 families → canonical paths */
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

const ALL_ENTITY_PATHS = Object.values(FAMILY_PATHS).flat();

function pathToFile(p) {
  if (p.startsWith('/labs/')) return path.join(ROOT, p.slice(1) + '.html');
  return path.join(ROOT, p.slice(1) + '.html');
}

function extractMain(html) {
  const m = html.match(/<main[\s\S]*?<\/main>/i);
  return m ? m[0] : html;
}

function outboundEntityLinks(html, selfPath) {
  const main = extractMain(html);
  const hrefs = [...main.matchAll(/href="(\/[^"#?]+)"/g)].map((m) => m[1]);
  const set = new Set();
  for (const h of hrefs) {
    const norm = h.replace(/\/$/, '') || '/';
    if (ALL_ENTITY_PATHS.includes(norm) && norm !== selfPath) set.add(norm);
  }
  return [...set];
}

function countFaqs(html) {
  return (html.match(/data-faq-item/g) || []).length;
}

function countRelatedGuideLinks(html) {
  const main = extractMain(html);
  const related =
    main.match(/id="related"[\s\S]*?<\/section>/i) ||
    main.match(/Related guides[\s\S]*?<\/section>/i);
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

function main() {
  const entities = loadRegistry();
  const entityList = Object.values(entities);

  const byFamily = {
    root_service: 0,
    service: 0,
    condition: 0,
    symptom: 0,
    lab: 0,
    other: 0,
  };
  for (const e of entityList) {
    const f = familyOf(e);
    if (f in byFamily) byFamily[f] += 1;
    else byFamily.other += 1;
  }

  /** @type {Record<string, { outbound: string[], inbound: string[], faqs: number, relatedGuides: number }>} */
  const pages = {};
  for (const p of ALL_ENTITY_PATHS) {
    const file = pathToFile(p);
    if (!fs.existsSync(file)) {
      pages[p] = { outbound: [], inbound: [], faqs: 0, relatedGuides: 0, missing: true };
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    pages[p] = {
      outbound: outboundEntityLinks(html, p),
      inbound: [],
      faqs: countFaqs(html),
      relatedGuides: countRelatedGuideLinks(html),
      missing: false,
    };
  }
  for (const [p, meta] of Object.entries(pages)) {
    for (const t of meta.outbound) {
      if (pages[t]) pages[t].inbound.push(p);
    }
  }

  const n = ALL_ENTITY_PATHS.length;
  const outboundCounts = ALL_ENTITY_PATHS.map((p) => pages[p].outbound.length);
  const inboundCounts = ALL_ENTITY_PATHS.map((p) => pages[p].inbound.length);
  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);

  const directedEdges = ALL_ENTITY_PATHS.reduce(
    (s, p) => s + pages[p].outbound.length,
    0,
  );
  const undirected = new Set();
  for (const p of ALL_ENTITY_PATHS) {
    for (const t of pages[p].outbound) {
      undirected.add([p, t].sort().join('→'));
    }
  }
  const maxUndirected = (n * (n - 1)) / 2;
  const density = maxUndirected ? undirected.size / maxUndirected : 0;

  const orphans = ALL_ENTITY_PATHS.filter((p) => pages[p].inbound.length === 0);
  const deadEnds = ALL_ENTITY_PATHS.filter((p) => pages[p].outbound.length === 0);

  // BFS depth from root
  const root = '/primary-care';
  const depth = { [root]: 0 };
  const q = [root];
  while (q.length) {
    const cur = q.shift();
    for (const nxt of pages[cur]?.outbound || []) {
      if (depth[nxt] === undefined) {
        depth[nxt] = depth[cur] + 1;
        q.push(nxt);
      }
    }
  }
  const reachable = Object.keys(depth).length;
  const depths = Object.values(depth);
  const avgDepth = avg(depths);
  const unreachableFromRoot = ALL_ENTITY_PATHS.filter((p) => depth[p] === undefined);

  // Connectivity: share of nodes reachable from root + reciprocal of orphan rate
  const reachShare = n ? reachable / n : 0;
  const orphanRate = n ? orphans.length / n : 1;
  const connectivityScore = Math.round(
    100 * (0.7 * reachShare + 0.3 * (1 - orphanRate)),
  );

  // Registry relationship completeness
  let withRel = 0;
  for (const e of entityList) {
    const parents = e.parents || [];
    const related = e.related_entities || [];
    if (parents.length + related.length > 0) withRel += 1;
  }
  const relCompleteness = entityList.length ? withRel / entityList.length : 0;

  // Coverage score components (see KNOWLEDGE-COVERAGE-SCORE.md)
  const entityCompletenessPts = (() => {
    let pts = 0;
    pts += byFamily.root_service >= 1 ? 4 : 0;
    pts += byFamily.service >= 1 ? 4 : 0;
    pts += byFamily.condition >= 1 ? 4 : 0;
    pts += Math.min(4, (byFamily.symptom / 2) * 4);
    pts += Math.min(4, (byFamily.lab / 8) * 4);
    return pts;
  })();

  const relationshipPts = Math.min(20, relCompleteness * 20 / 0.9);

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

  const symptomPaths = FAMILY_PATHS.symptom;
  const labPaths = new Set(FAMILY_PATHS.lab);
  let symptomLabOk = 0;
  for (const sp of symptomPaths) {
    const labsLinked = (pages[sp]?.outbound || []).filter((x) => labPaths.has(x));
    if (labsLinked.length >= 3) symptomLabOk += 1;
  }
  const symptomLabPts =
    symptomPaths.length === 0
      ? 0
      : (symptomLabOk / symptomPaths.length) * 20;

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
    inventory: {
      rootServices: byFamily.root_service,
      services: byFamily.service,
      conditions: byFamily.condition,
      symptoms: byFamily.symptom,
      laboratories: byFamily.lab,
      otherRegistryEntities: byFamily.other,
      totalTaxonomyPages: n,
      totalRegistryEntities: entityList.length,
    },
    relationshipHealth: {
      averageInbound: Number(avg(inboundCounts).toFixed(2)),
      averageOutbound: Number(avg(outboundCounts).toFixed(2)),
      directedEdges,
      undirectedEdges: undirected.size,
      graphDensity: Number(density.toFixed(3)),
      orphanEntities: orphans,
      deadEndEntities: deadEnds,
      averageGraphDepthFromRoot: Number(avgDepth.toFixed(2)),
      unreachableFromRoot,
      entityConnectivityScore: connectivityScore,
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
      components: {
        entityCompleteness: Number(entityCompletenessPts.toFixed(1)),
        relationshipCompleteness: Number(relationshipPts.toFixed(1)),
        graphDensity: Number(densityPts.toFixed(1)),
        serviceCoverage: Number(serviceCoveragePts.toFixed(1)),
        symptomLabCoverage: Number(symptomLabPts.toFixed(1)),
      },
      faqsTotal: ALL_ENTITY_PATHS.reduce((s, p) => s + (pages[p].faqs || 0), 0),
      relatedGuidesTotal: ALL_ENTITY_PATHS.reduce(
        (s, p) => s + (pages[p].relatedGuides || 0),
        0,
      ),
      rootServiceLanesLinked: serviceLanes,
    },
    entities: ALL_ENTITY_PATHS.map((p) => ({
      path: p,
      inbound: pages[p].inbound.length,
      outbound: pages[p].outbound.length,
      faqs: pages[p].faqs,
      relatedGuides: pages[p].relatedGuides,
      depthFromRoot: depth[p] ?? null,
      missing: !!pages[p].missing,
    })),
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2) + '\n');

  const md = `# Knowledge Graph Observability

Generated: ${report.generatedAt}  
Platform: **v1** (frozen)

## Inventory

| Class | Count |
| --- | ---: |
| Root Services | ${report.inventory.rootServices} |
| Services | ${report.inventory.services} |
| Conditions | ${report.inventory.conditions} |
| Symptoms | ${report.inventory.symptoms} |
| Laboratories | ${report.inventory.laboratories} |
| **Taxonomy pages** | **${report.inventory.totalTaxonomyPages}** |
| Registry entities (all) | ${report.inventory.totalRegistryEntities} |

## Relationship health

| Metric | Value |
| --- | --- |
| Avg inbound (entity→entity) | ${report.relationshipHealth.averageInbound} |
| Avg outbound | ${report.relationshipHealth.averageOutbound} |
| Graph density (undirected) | ${report.relationshipHealth.graphDensity} |
| Connectivity score | ${report.relationshipHealth.entityConnectivityScore} |
| Avg depth from Root Service | ${report.relationshipHealth.averageGraphDepthFromRoot} |
| Orphans | ${report.relationshipHealth.orphanEntities.join(', ') || 'none'} |
| Dead-ends | ${report.relationshipHealth.deadEndEntities.join(', ') || 'none'} |

## Governance health

| Gate | Status |
| --- | --- |
| Assembly PASS | ${report.governanceHealth.assemblyPass} |
| Fingerprint avg / min | ${report.governanceHealth.fingerprintAvg} / ${report.governanceHealth.fingerprintMin} (floor ${report.governanceHealth.fingerprintFloor}) |

## Knowledge Coverage Score

**${report.coverage.knowledgeCoverageScore} / 100**

| Component | Points (max 20) |
| --- | ---: |
| Entity completeness | ${report.coverage.components.entityCompleteness} |
| Relationship completeness | ${report.coverage.components.relationshipCompleteness} |
| Graph density | ${report.coverage.components.graphDensity} |
| Service coverage | ${report.coverage.components.serviceCoverage} |
| Symptom ↔ Lab coverage | ${report.coverage.components.symptomLabCoverage} |

FAQs on taxonomy pages: ${report.coverage.faqsTotal}  
Related-guide links: ${report.coverage.relatedGuidesTotal}

See \`KNOWLEDGE-COVERAGE-SCORE.md\` · \`PLATFORM-v1.md\`.
`;

  fs.writeFileSync(OUT_MD, md);
  console.log('Wrote', path.relative(ROOT, OUT_JSON));
  console.log('Wrote', path.relative(ROOT, OUT_MD));
  console.log(
    `Coverage ${coverageScore}/100 · density ${density.toFixed(3)} · connectivity ${connectivityScore}`,
  );
}

main();
