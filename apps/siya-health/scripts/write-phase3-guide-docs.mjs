/**
 * Writes Phase 3 guide collateral (research briefs, link plans, social, video).
 * Run: node scripts/write-phase3-guide-docs.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PHASE3_ANSWER_SEEDS } from '../data/phase3-answer-seeds.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GUIDES = path.join(__dirname, '..', 'docs', 'guides');

const META = {
  'why-normal-labs-dont-mean-healthy': {
    title: "Why Normal Labs Don't Mean You're Healthy",
    tier: 1,
    primary: 'normal labs but feel terrible',
    secondary: ['why are my labs normal but i feel sick', 'normal blood work unhealthy', 'normal a1c still unhealthy', 'metabolic health normal labs'],
    faqKw: ['Can you be unhealthy with normal blood tests?', 'What diseases do not show up in blood tests?', 'Can you have insulin resistance with normal A1C?'],
    cornerstoneGap: 'Extends normal-a1c-insulin-resistance; does not duplicate insulin cornerstone blog mechanism depth.',
    inbound: ['normal-a1c-insulin-resistance', 'what-is-insulin-resistance', 'brain-fog-after-eating', 'blog/insulin-resistance-and-weight-loss-clinician-overview'],
  },
  'food-noise-returned-on-glp-1': {
    title: 'Food Noise Returned on GLP-1',
    tier: 1,
    primary: 'food noise came back on glp-1',
    secondary: ['food noise returned ozempic', 'wegovy stopped working cravings', 'semaglutide food noise again', 'glp-1 not working anymore'],
    faqKw: ['Why did food noise come back on GLP-1?', 'Does semaglutide stop working?', 'Can stress bring back food noise?'],
    cornerstoneGap: 'Return-of-symptoms intent; cornerstone covers baseline food noise + GLP-1 science.',
    inbound: ['what-is-food-noise', 'glp-1-side-effects', 'blog/food-noise-and-glp-1-what-it-means-and-what-helps'],
  },
  'weight-gain-after-stopping-ozempic': {
    title: 'Weight Gain After Stopping Ozempic',
    tier: 1,
    primary: 'weight gain after stopping ozempic',
    secondary: ['ozempic rebound weight gain', 'regain after wegovy', 'semaglutide withdrawal weight', 'maintain weight after glp-1'],
    faqKw: ['Why am I gaining weight after stopping Ozempic?', 'How fast do you regain after semaglutide?', 'Ozempic rebound'],
    cornerstoneGap: 'Stop/regain intent; semaglutide mechanism guide stays separate.',
    inbound: ['semaglutide-weight-loss-how-it-works', 'food-noise-returned-on-glp-1', 'blog/food-noise-and-glp-1-what-it-means-and-what-helps'],
  },
  'afternoon-energy-crash-after-lunch': {
    title: 'Afternoon Energy Crash After Lunch',
    tier: 1,
    primary: 'afternoon energy crash after lunch',
    secondary: ['why am i so tired after lunch', 'afternoon fatigue after eating', 'post lunch slump', '2pm energy crash'],
    faqKw: ['Why do I crash every afternoon after lunch?', 'Is afternoon fatigue diabetes?', 'Post lunch coma'],
    cornerstoneGap: 'Timing/work-impairment angle; brain-fog-after-eating covers post-meal cognition breadth.',
    inbound: ['brain-fog-after-eating', 'why-am-i-tired-even-after-sleeping', 'blog/why-am-i-always-tired-causes-when-to-see-doctor'],
  },
  'high-shbg-low-free-testosterone': {
    title: 'High SHBG and Low Free Testosterone',
    tier: 1,
    primary: 'high shbg low free testosterone',
    secondary: ['high shbg symptoms men', 'normal total testosterone low free t', 'high sex hormone binding globulin', 'low free t high shbg'],
    faqKw: ['What does high SHBG mean?', 'Can you have low free testosterone with normal total?', 'Do I need TRT if free T is low?'],
    cornerstoneGap: 'High-SHBG-specific; cornerstone blog covers free vs total overview.',
    inbound: ['what-is-free-testosterone', 'blog/free-testosterone-vs-total-testosterone-what-patients-should-know', 'mens-health-longevity'],
  },
};

function wordCount(seed) {
  return [seed.shortAnswer, ...(seed.sections || []).flatMap((s) => [...(s.paragraphs || []), ...(s.listItems || [])])]
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

for (const seed of PHASE3_ANSWER_SEEDS) {
  const m = META[seed.slug];
  const url = `/answers/${seed.slug}`;
  const wc = wordCount(seed);

  const research = `# Research brief: ${m.title}

**Tier-1 Health Guide** · \`${url}\`  
**Status:** Educational draft — pending physician review

---

## Keyword audit (pre-write)

| Type | Terms |
|------|--------|
| **Primary** | ${m.primary} |
| **Secondary** | ${m.secondary.join(', ')} |
| **FAQ / PAA** | ${m.faqKw.join('; ')} |

**Cornerstone dedupe:** ${m.cornerstoneGap}

---

## Clinical thesis

${seed.shortAnswer.slice(0, 400)}…

---

## PubMed / guideline sources

${(seed.evidence || []).map((e) => `- ${e}`).join('\n')}

---

## Reddit themes (paraphrased)

See on-page **PubMed, forums, and PAA themes** section.

---

## Quora themes (paraphrased)

Aligned with FAQ cluster in seed — return/adherence/symptom validation narratives.

---

## Google PAA mapping

${m.faqKw.map((q, i) => `${i + 1}. ${q}`).join('\n')}

---

## Internal link targets

**Related Health Guides:** ${(seed.related || []).map((s) => `\`${s}\``).join(', ')}

**Learn more / cornerstones:** ${(seed.learnMore || []).map((l) => l.href).join(', ')}

---

## Content guardrails

- No blog article (Health Guide only)
- ~800–1200 words (generated: **${wc}** words)
- Meet & Greet CTA via generator \`nextSteps\` + \`cta-block\`
- Sections: vignette + decision support included

`;

  const links = `# Internal link plan: ${m.title}

**URL:** \`${url}\`

## Outbound (on-page)

| URL | Label |
|-----|--------|
${(seed.learnMore || []).map((l) => `| \`${l.href}\` | ${l.label} |`).join('\n')}

## Related Health Guides

${(seed.related || []).map((s) => `- \`${s}\``).join('\n')}

## Recommended inbound

${m.inbound.map((p) => `- \`${p.startsWith('/') ? p : `/answers/${p}`}\``).join('\n')}

## Hub placement

${(seed.hubCategories || []).map((c) => `- **${c}** category featured/listing`).join('\n') || '- Primary topic hub'}
`;

  const social = `# Social hooks: ${m.title}

Link: \`${url}\`

## Hook 1
**Headline:** ${m.primary} — you're not alone.  
**Body:** Clinician-reviewed Health Guide (no blog fluff).  
**CTA:** Read the guide · Book a Meet & Greet

## Hook 2 — Myth bust
**Headline:** Normal labs ≠ feeling well.  
**CTA:** 3-minute Health Guide

## Carousel (5 slides)
1. Question as headline  
2. Common example vignette  
3. Decision support steps  
4. Related guides in cluster  
5. Book a Meet & Greet

## Hashtags
\`#MetabolicHealth #Telehealth #GLP1 #Testosterone #SleepHealth #ADHD\` (pick relevant subset)
`;

  const video = `# Video hooks: ${m.title}

**URL:** \`${url}\` · 30–60s scripts

## Script A
**Open:** "${seed.question}"  
**Beat:** One symptom cluster + one clinician next step  
**Close:** Full Health Guide — link in bio · Meet & Greet

## Script B — Patient vignette
**Open:** "A common example from our guide…"  
**Close:** Educational only — not personal medical advice

## B-roll
- Telehealth consult  
- Meal / sleep / lab visuals (stock)  
- On-screen: Related Health Guides list
`;

  fs.writeFileSync(path.join(GUIDES, `${seed.slug}-RESEARCH-BRIEF.md`), research);
  fs.writeFileSync(path.join(GUIDES, `${seed.slug}-INTERNAL-LINK-PLAN.md`), links);
  fs.writeFileSync(path.join(GUIDES, `${seed.slug}-SOCIAL-HOOKS.md`), social);
  fs.writeFileSync(path.join(GUIDES, `${seed.slug}-VIDEO-HOOKS.md`), video);
  console.log(seed.slug, wc, 'words — docs written');
}

console.log('Done.');
