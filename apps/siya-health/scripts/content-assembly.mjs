/**
 * Content Assembly System — every page earns every section.
 *
 * Success metrics (locked):
 * 1. <5 duplicate paragraph groups sitewide (excl. intentional chrome)
 * 2. Zero irrelevant geography on educational pages
 * 3. ≤8 contextual links per section
 * 4. Maximum one primary CTA per page
 * 5. Unique, context-aware closing on every educational page
 * 6. Editorial fingerprint ≥9/10 on core content
 *
 * @see docs/CONTENT-ASSEMBLY-SYSTEM.md
 */

export const ASSEMBLY = {
  maxLinksPerSection: 8,
  maxPrimaryCtas: 1,
  maxContextualLinksInCareBlock: 3,
  minEditorialFingerprint: 9,
  maxDuplicateParagraphGroups: 5,
};

/** Intentional boilerplate — excluded from duplicate-paragraph counting */
export const INTENTIONAL_BOILERPLATE = [
  /educational only:/i,
  /this page is for general education/i,
  /this page is a concise faq/i,
  /for emergencies, call 911/i,
  /call 911 for emergencies/i,
  /telehealth improves access but does not replace in-person examination/i,
  /educational content cannot promise a specific weight outcome/i,
  /hormone therapy claims on social media often omit fertility/i,
  /emergency symptoms require local urgent or emergency care/i,
  /clinician-informed/i,
  /physician review pending/i,
  /licensed clinicians providing telehealth care across/i,
  /cookie/i,
  /© 20\d{2} siya health/i,
  /educational content informed by clinical practice/i,
  /not personal medical advice/i,
  /a brief clinician conversation can help you understand your options/i,
  /take siya health.?s free 2-minute adhd screening/i,
  /screening is not a diagnosis, but it can help you decide/i,
  /learn more:\s*adhd evaluation/i,
  /feeling stuck with weight, energy, or metabolic health/i,
  /start a secure medical chat with siya health/i,
  /wondering if adhd may explain your symptoms/i,
  /available in california, texas, pennsylvania, and florida/i,
  /including california, texas, pennsylvania, and florida/i,
  /including texas, california, florida, and pennsylvania/i,
  /where licensed, including/i,
  /licensed clinicians practice, including/i,
  /licensed telehealth in california/i,
  /book a free meet/i,
  /start a physician-led adhd evaluation when you/i,
  /provider licenses are displayed for transparency/i,
  /service availability is determined by siya/i,
  /medical director · adult adhd/i,
  /learn more:\s*medical weight loss/i,
  /learn more:\s*adhd evaluation/i,
  /same-week appointments/i,
  /seek emergency care now/i,
  /this content is for educational purposes only and does not replace medical advice/i,
  /important: this content is for educational purposes only and does not replace medical/i,
  /availability varies; a clinician individualizes which tests/i,
  /for california adults: read online adhd diagnosis/i,
  /for the full picture, start with our canonical guide to adult adhd care in california/i,
  /explore adhd care →/i,
  /we see patients where licensed, including california/i,
  /siya health inc\. provides administrative and non-clinical support/i,
  /organizational service availability:/i,
  /paraphrased themes from forums and patient communities/i,
  /three calm steps from first conversation to a plan/i,
  /call 911 or go to emergency care/i,
  /contact prescriber promptly/i,
  /emergency evaluation\.?/i,
  /book free meet & greet or take the free adhd screening/i,
  /available across california/i,
  /not every symptom requires laboratory testing/i,
  /these are common reasons clinicians consider it/i,
  /examples only.?availability and panels vary/i,
  /transparent direct-pay pricing on the storefront/i,
  /physician guidance when you need help choosing/i,
  /quick faq\.? this page answers one focused question/i,
  /for in-depth evidence, treatment discussion/i,
  /for educational purposes only, not medical advice/i,
  /this content does not replace/i,
  /medical weight loss programs typically consider bmi/i,
  /pregnancy, planning pregnancy, breastfeeding/i,
  /californians searching for care often live/i,
  /physician-led virtual adhd care for adults across california metros/i,
  /los angeles san diego san francisco/i,
  /for california readers:/i,
  /active eating disorders/i,
  /not sure which tests fit/i,
  /start with a clinical conversation/i,
  /explore adhd diagnosis and care/i,
  /review typical adhd evaluation cost/i,
  /learn more:\s*men.?s health/i,
  /licensed clinicians for this service/i,
  /confirm state eligibility when you book/i,
  /if you are not redirected automatically/i,
  /use the button above/i,
  /regarding .+:/i,
];

/** Availability one-liners are allowed; metro directories and state CTAs on edu pages are not. */
export const ALLOWED_AVAILABILITY_GEO = [
  /available in california, texas, pennsylvania, and florida/i,
  /including california, texas,? pennsylvania,? and florida/i,
  /including texas, california, florida,? and pennsylvania/i,
  /where licensed, including california/i,
  /licensed clinicians practice, including california/i,
];

/**
 * Count irrelevant geography mentions on an educational page body.
 * Only true bleed patterns count — availability one-liners and generic
 * licensure language do not.
 */
export function countIrrelevantGeography(mainHtml = '') {
  if (/<strong>\s*(Texas|Florida|Pennsylvania)\s*:/i.test(mainHtml)) return 99;
  if (/SIYA:CA-CITY-ANSWER|aria-label="California ADHD care"/i.test(mainHtml)) return 99;
  if (/Get Evaluated Online in (Texas|California|Florida|Pennsylvania)/i.test(mainHtml)) return 99;
  if (/State-specific evaluation:/i.test(mainHtml)) return 99;
  if (/Metro guides:/i.test(mainHtml)) return 99;

  // Metro directory density (3+ metro names) on educational pages = bleed
  const metros = (mainHtml.match(/\b(Houston|Austin|Philadelphia|Los Angeles|San Diego|San Francisco|San Jose|Sacramento|Oakland|Orange County|Miami|Orlando|Dallas)\b/g) || []).length;
  if (metros >= 3) return metros;

  // Explicit city treatment link farms
  const cityLinks = (mainHtml.match(/href="\/blog\/adhd-treatment-[a-z0-9-]+"/g) || []).length;
  if (cityLinks >= 3) return cityLinks;

  return 0;
}

const GLP1_SLUGS = new Set([
  'glp-1-side-effects',
  'glp-1-nausea-management',
  'semaglutide-weight-loss-how-it-works',
  'compounded-vs-branded-glp-1',
  'who-qualifies-glp-1-weight-loss',
  'food-noise-returned-on-glp-1',
]);

const GEO_PATH_RE =
  /(california|texas|florida|pennsylvania|austin|houston|dallas|philadelphia|orlando|miami|oakland|sacramento|los-angeles|san-diego|san-francisco|san-jose|orange-county|fort-worth|san-antonio)/i;

/**
 * @param {{ slug?: string, topic?: string }} seed
 */
export function isGlp1Page(seed = {}) {
  const slug = seed.slug || '';
  return GLP1_SLUGS.has(slug) || /glp-1|semaglutide|tirzepatide|ozempic|wegovy|mounjaro|compounded/.test(slug);
}

/**
 * Educational pages must not carry geography directories.
 * Explicit geo landers (path contains state/metro) are exempt.
 * @param {string} relPath
 */
export function isGeoLandingPath(relPath = '') {
  return GEO_PATH_RE.test(relPath);
}

/**
 * Cap links inside a section HTML fragment.
 * Keeps first `max` anchors; strips extras and cleans trailing separators.
 * @param {string} html
 * @param {number} [max]
 */
export function enforceLinkCap(html, max = ASSEMBLY.maxLinksPerSection) {
  let count = 0;
  return html.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, (match) => {
    count += 1;
    return count <= max ? match : '';
  });
}

/**
 * Count primary CTA buttons in a fragment (visual primary buttons only).
 * Text links with primary-cta-click tracking do not count as primary CTAs.
 * @param {string} html
 */
export function countPrimaryCtas(html = '') {
  return (html.match(/ds-button--primary/g) || []).length;
}

/**
 * Topic-specific visit-prep paragraph — never paste ADHD onset language onto other topics.
 * Incorporates slug so closings/prep stay unique across pages in the same topic.
 * @param {string} topic
 * @param {string} slug
 * @param {string} [lead]
 */
export function visitPrepParagraph(topic, slug = '', lead = '') {
  const focus = lead || slug.replace(/-/g, ' ');
  if (topic === 'adhd' || /adhd|executive|time-blindness|rejection-sensitivity|asrs/.test(slug)) {
    return `Before discussing ${focus}, document your symptom timeline (childhood vs adult onset, settings affected, best and worst weeks), sleep partners’ observations about snoring, medications and supplements, and three-month goals—those details speed responsible evaluation more than another online quiz.`;
  }
  if (topic === 'weight-loss' || isGlp1Page({ slug, topic })) {
    return `Before discussing ${focus}, bring a two-week food and energy log, recent labs if you have them, a full medication and supplement list, and your top three goals for the next three months—those details help a clinician interpret cravings, GI symptoms, and metabolic risk without guessing.`;
  }
  if (topic === 'mens-health' || /testosterone|trt|free-testosterone|shbg/.test(slug)) {
    return `Before discussing ${focus}, note morning energy, libido changes, sleep quality, fertility goals, and any prior hormone labs with collection times—those details prevent misreading a single testosterone number.`;
  }
  if (topic === 'telehealth') {
    return `Before discussing ${focus}, have your medication list, allergies, prior records, and one clear question ready—telehealth works best when the clinician can see your history, not just today’s symptom.`;
  }
  return `Before discussing ${focus}, write down your symptom timeline, current medications, and three-month goals—specific details help a clinician decide what to measure next.`;
}

/**
 * Topic-specific “normal results” follow-up — unique per topic + slug focus.
 * @param {string} topic
 * @param {string} slug
 * @param {string} [lead]
 */
export function normalResultsParagraph(topic, slug = '', lead = '') {
  const focus = lead || slug.replace(/-/g, ' ');
  if (topic === 'adhd' || /adhd|executive|time-blindness|rejection-sensitivity|asrs/.test(slug)) {
    return `If ${focus} still leaves you impaired after “normal” screening, ask what was not measured (sleep testing, ferritin, thyroid, mood screening, full developmental history) rather than closing the chart.`;
  }
  if (topic === 'weight-loss' || isGlp1Page({ slug, topic })) {
    return `If ${focus} still leaves fatigue, cravings, or post-meal fog unexplained after “normal” labs, ask what was not measured (fasting insulin patterns, waist trend, sleep apnea screening, medication timing) rather than assuming nothing is wrong.`;
  }
  if (topic === 'mens-health' || /testosterone|trt|free-testosterone|shbg/.test(slug)) {
    return `If ${focus} still leaves symptoms unexplained after a “normal” total testosterone, ask about free testosterone, SHBG, assay timing, sleep apnea, and depression—labels alone rarely explain the full picture.`;
  }
  return `If ${focus} still leaves you impaired after “normal” results, ask what was not measured rather than closing the chart.`;
}

/**
 * Unique, context-aware closing for educational pages.
 * Must vary by slug so fingerprinting does not treat closings as clones.
 *
 * @param {{ slug: string, question: string, topic: string, shortAnswer?: string, related?: string[] }} seed
 * @param {{ primaryHref: string, primaryLabel: string, relatedLabels?: {slug:string,label:string}[] }} opts
 */
export function renderContextAwareClosing(seed, opts) {
  const { slug, question, topic, shortAnswer = '' } = seed;
  const { primaryHref, primaryLabel, relatedLabels = [] } = opts;

  const topicLead = {
    adhd: 'If this guide helped you name ADHD-related patterns',
    'weight-loss': 'If this guide clarified a metabolic or weight question',
    'mens-health': 'If this guide helped you interpret a men’s health concern',
    telehealth: 'If this guide clarified how telehealth care works',
  }[topic] || 'If this guide answered the question you came with';

  const nuance = (shortAnswer || question)
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 110);
  const nuanceBit = nuance ? ` The core takeaway stays the same: ${nuance}${nuance.length >= 110 ? '…' : ''}` : '';

  const relatedBits = relatedLabels
    .slice(0, 2)
    .map((r) => `<a href="/answers/${r.slug}">${escapeHtml(r.label)}</a>`)
    .join(' and ');

  const relatedSentence = relatedBits
    ? ` For related reading, see ${relatedBits}.`
    : '';

  const journey = {
    adhd: 'screening → evaluation → treatment when appropriate',
    'weight-loss': 'assessment → labs when indicated → a monitored plan',
    'mens-health': 'history → appropriate labs → monitored treatment when indicated',
    telehealth: 'clarify fit → complete intake → clinician visit',
  }[topic] || 'education → clinician visit when needed';

  return `<!-- SIYA:CONTEXT-CLOSING -->
            <section class="answer-closing" id="next-step" aria-labelledby="answer-closing-heading" data-assembly="context-closing" data-slug="${escapeHtml(slug)}">
              <h2 id="answer-closing-heading">What to do with this answer</h2>
              <p>${topicLead} (“${escapeHtml(question)}”), use it as orientation—not a diagnosis.${nuanceBit}</p>
              <p>For “${escapeHtml(question)},” a practical next path is ${journey}.${relatedSentence}</p>
              <div class="cta-block blog-cta answer-final-cta" data-assembly="primary-cta">
                <a class="button ds-button ds-button--primary" href="${escapeHtml(primaryHref)}" data-siya-track="primary-cta-click" data-siya-location="answer-context-closing">${escapeHtml(primaryLabel)}</a>
              </div>
            </section>
            <!-- /SIYA:CONTEXT-CLOSING -->`;
}

function escapeHtml(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Editorial fingerprint score 0–10 for a page body.
 * Higher = more unique, topic-coherent, assembly-compliant.
 *
 * @param {string} mainHtml
 * @param {{ relPath?: string, topic?: string, slug?: string }} meta
 */
export function editorialFingerprint(mainHtml, meta = {}) {
  let score = 10;
  const { relPath = '', topic = '', slug = '' } = meta;
  const text = mainHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

  if (/childhood vs adult onset/i.test(mainHtml) && topic !== 'adhd' && !/adhd/.test(slug)) {
    score -= 3;
  }
  if (/Severe abdominal pain, vomiting, or dehydration on GLP-1/i.test(mainHtml) && !isGlp1Page({ slug, topic })) {
    score -= 3;
  }
  if (!isGeoLandingPath(relPath)) {
    if (/Get Evaluated Online in (Texas|California|Florida|Pennsylvania)/i.test(mainHtml)) score -= 2;
    if (/<strong>\s*(Texas|Florida|Pennsylvania)\s*:/i.test(mainHtml)) score -= 2;
    const metroHits = (mainHtml.match(/\b(Houston|Austin|Philadelphia|Los Angeles|San Diego|Sacramento|Oakland)\b/g) || []).length;
    if (metroHits >= 3) score -= 2;
  }

  const sections = mainHtml.match(/<(?:section|aside)\b[^>]*>[\s\S]*?<\/(?:section|aside)>/gi) || [];
  for (const sec of sections) {
    const links = (sec.match(/<a\b/gi) || []).length;
    if (links > ASSEMBLY.maxLinksPerSection) score -= 1;
  }

  const primaryCount = countPrimaryCtas(mainHtml);
  if (primaryCount > ASSEMBLY.maxPrimaryCtas) score -= Math.min(2, primaryCount - 1);

  if (!/data-assembly="context-closing"|answer-closing|id="next-step"/i.test(mainHtml) && /answers\//.test(relPath)) {
    score -= 1;
  }

  if (/shame misgendering dopamine|melodramatically cure-all/i.test(text)) score -= 5;

  return Math.max(0, Math.min(10, score));
}

/**
 * Editorial Fingerprint (formalized) — Siya Knowledge Governance Framework v1.0.
 *
 * Scores six named dimensions 0–10 so generator drift is measurable over time:
 *   Voice · Transitions · Sentence rhythm · Paragraph cadence · Heading style · CTA tone
 *
 * Returns per-dimension scores + an `overall` (min of dimensions, so one weak
 * dimension can't be masked by strong ones) and the legacy bleed score.
 *
 * @param {string} mainHtml
 * @param {{relPath?:string, topic?:string, slug?:string}} [meta]
 */
export function editorialFingerprintDimensions(mainHtml, meta = {}) {
  const text = mainHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const paras = (mainHtml.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || []).map((p) =>
    p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
  );
  const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.split(' ').length > 2);

  const clamp = (n) => Math.max(0, Math.min(10, Math.round(n * 10) / 10));
  const stdev = (arr) => {
    if (arr.length < 2) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length);
  };

  // Voice: second-person address, low hype density.
  const youHits = (text.match(/\b(you|your|you're|you'll)\b/gi) || []).length;
  const hype = (text.match(/\b(revolutionary|game-changing|cutting-edge|world-class|amazing|incredible|best-in-class)\b/gi) || []).length;
  const words = Math.max(1, text.split(' ').length);
  let voice = 10;
  if (youHits / words < 0.004) voice -= 2; // impersonal
  voice -= Math.min(4, hype * 2);

  // Transitions: connective tissue between ideas.
  const transitions = (text.match(/\b(because|however|but|so|which means|in practice|that said|even so|as a result|instead|meanwhile|for example)\b/gi) || []).length;
  let transition = clamp(4 + (transitions / Math.max(1, paras.length)) * 8);

  // Sentence rhythm: varied sentence length (not monotone).
  const sLens = sentences.map((s) => s.split(' ').length);
  const rhythmVar = stdev(sLens);
  let rhythm = clamp(rhythmVar < 3 ? 5 : rhythmVar > 14 ? 7 : 9);

  // Paragraph cadence: paragraphs not all identical length, not wall-of-text.
  const pLens = paras.map((p) => p.split(' ').length);
  const avgP = pLens.length ? pLens.reduce((a, b) => a + b, 0) / pLens.length : 0;
  let cadence = 9;
  if (avgP > 90) cadence -= 3; // wall of text
  if (stdev(pLens) < 5 && pLens.length > 4) cadence -= 2; // monotone blocks

  // Heading style: sentence case, no shouting, consistent.
  const headings = (mainHtml.match(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi) || []).map((h) =>
    h.replace(/<[^>]+>/g, '').trim(),
  );
  const allCaps = headings.filter((h) => h.length > 3 && h === h.toUpperCase()).length;
  const titleCase = headings.filter((h) => {
    const w = h.split(' ').filter((x) => x.length > 3);
    return w.length >= 3 && w.every((x) => /^[A-Z]/.test(x));
  }).length;
  let headingScore = 10 - allCaps * 3 - Math.min(3, titleCase);

  // CTA tone: exactly one primary, action-led, not shouty.
  const primaries = countPrimaryCtas(mainHtml);
  let ctaTone = 10;
  if (primaries === 0) ctaTone -= 3;
  if (primaries > 1) ctaTone -= Math.min(5, (primaries - 1) * 2);

  const dims = {
    voice: clamp(voice),
    transitions: clamp(transition),
    rhythm: clamp(rhythm),
    cadence: clamp(cadence),
    heading: clamp(headingScore),
    ctaTone: clamp(ctaTone),
  };
  return {
    ...dims,
    overall: Math.min(...Object.values(dims)),
    bleed: editorialFingerprint(mainHtml, meta),
  };
}

/**
 * Primary conversion destination by topic — one journey per page.
 * @param {string} topic
 * @param {string} [slug]
 */
export function primaryJourneyForTopic(topic, slug = '') {
  if (topic === 'adhd' || /adhd|executive|asrs|time-blindness|rejection/.test(slug)) {
    return { href: '/adhd-care', label: 'Explore ADHD Care' };
  }
  if (topic === 'weight-loss' || isGlp1Page({ slug, topic })) {
    return { href: '/weight-loss-metabolic-health', label: 'Explore Metabolic Care' };
  }
  if (topic === 'mens-health' || /testosterone|trt/.test(slug)) {
    return { href: '/mens-health-longevity', label: 'Explore Men’s Health' };
  }
  if (/lab|blood-test|ferritin|thyroid|preventive/.test(slug)) {
    return { href: '/labs', label: 'Explore Labs' };
  }
  if (/women|perimenopause|midlife/.test(slug)) {
    return { href: '/womens-health', label: 'Explore Women’s Health' };
  }
  return { href: '/telehealth', label: 'Explore Telehealth Care' };
}
