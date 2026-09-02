/**
 * Blog internal linking — registry, related-article picks, landing pages.
 */
import fs from 'fs';
import path from 'path';

export const BLOG_HUB_FILES = new Set([
  'index.html',
  'all.html',
  'adhd.html',
  'weight-loss.html',
  'telehealth.html',
]);

export const BLOG_CATEGORIES = {
  adhd: 'ADHD',
  metabolic: 'Weight loss',
  hormone: "Men's health",
  energy: 'Sleep & energy',
  telehealth: 'Telehealth',
  employer: 'Employers & workplace',
};

export const LANDING_BY_TOPIC = {
  adhd: { href: '/adhd-care', label: 'ADHD evaluation & telehealth care' },
  metabolic: { href: '/weight-loss-metabolic-health', label: 'Medical weight loss programs' },
  hormone: { href: '/mens-health-longevity', label: "Men's health & longevity care" },
  energy: { href: '/telehealth', label: 'Telehealth fatigue & sleep care' },
  telehealth: { href: '/telehealth', label: 'Telehealth services' },
  employer: { href: '/employers', label: 'Employer cognitive health programs' },
};

const CROSS_TOPIC_BRIDGE = {
  energy: [
    'insulin-resistance-and-weight-loss-clinician-overview',
    'free-testosterone-vs-total-testosterone-what-patients-should-know',
    'how-mental-health-affects-weight-loss-outcomes',
    'brain-fog-at-work',
    'sleep-and-focus-at-work',
    'chronic-fatigue-and-work-performance',
  ],
  adhd: [
    'brain-fog-at-work',
    'executive-dysfunction-adhd',
    'sleep-and-focus-at-work',
  ],
  hormone: [
    'perimenopause-brain-fog',
    'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
    'insulin-resistance-and-weight-loss-clinician-overview',
  ],
  telehealth: [
    'how-to-safely-get-prescriptions-online',
    'is-online-adhd-diagnosis-legit',
    'how-adhd-medication-is-prescribed-online',
  ],
  employer: [
    'cognitive-health-benefits-for-employers',
    'adhd-accommodations-hr-primer',
    'focus-fatigue-workforce-issue',
    'sleep-and-focus-at-work',
    'brain-fog-at-work',
  ],
};

const TOPIC_FALLBACKS = {
  adhd: [
    'how-to-know-if-you-have-adhd-adult',
    'is-online-adhd-diagnosis-legit',
    'adhd-symptoms-overlooked',
    'youre-not-lazy-signs-undiagnosed-adult-adhd',
    'adhd-medication-options-for-adults',
  ],
  metabolic: [
    'food-noise-and-glp-1-what-it-means-and-what-helps',
    'insulin-resistance-and-weight-loss-clinician-overview',
    'glp1-side-effects-and-how-to-manage-them',
    'semaglutide-for-weight-loss-how-it-works',
    'medical-weight-loss-vs-dieting-what-actually-works',
  ],
  hormone: [
    'free-testosterone-vs-total-testosterone-what-patients-should-know',
    'when-is-testosterone-therapy-appropriate',
    'minoxidil-for-hair-loss-does-it-work',
    'sildenafil-for-erectile-dysfunction-what-to-expect',
  ],
  energy: [
    'iron-deficiency-brain-fog-adhd',
    'sleep-apnea-fatigue-metabolic-risk-when-snoring-is-not-benign',
    'insomnia-treatment-options-beyond-medication',
    'brain-fog-at-work',
    'sleep-and-focus-at-work',
    'chronic-fatigue-and-work-performance',
  ],
  telehealth: [
    'telehealth-prescriptions-how-online-treatment-works',
    'how-to-safely-get-prescriptions-online',
    'is-online-adhd-diagnosis-legit',
    'how-adhd-medication-is-prescribed-online',
  ],
  employer: [
    'cognitive-health-benefits-for-employers',
    'adhd-accommodations-hr-primer',
    'focus-fatigue-workforce-issue',
    'chronic-fatigue-and-work-performance',
    'executive-dysfunction-adhd',
  ],
};

export function topicFromBlog(slug, title = '') {
  const t = `${slug} ${title}`.toLowerCase();
  if (
    /cognitive-health-benefits-for-employers|adhd-accommodations-hr-primer|focus-fatigue-workforce|for employers|hr primer|workforce issue/.test(
      t,
    )
  ) {
    return 'employer';
  }
  if (/brain-fog-at-work|sleep-and-focus-at-work|chronic-fatigue-and-work|workplace|at work|work performance/.test(t)) {
    return 'energy';
  }
  if (/testosterone|trt|sildenafil|erectile|minoxidil|libido|peptide/.test(t)) return 'hormone';
  if (/sleep-apnea|apnea|insomnia|always-tired|fatigue|modafinil/.test(t)) return 'energy';
  if (/glp|semaglutide|tirzepatide|phentermine|weight|food-noise|insulin|metabolic|dieting|obesity/.test(t)) {
    return 'metabolic';
  }
  if (/adhd|adderall|vyvanse|stimulant|asrs|creyos|executive|lazy/.test(t)) return 'adhd';
  if (/telehealth|prescription online|online treatment/.test(t)) return 'telehealth';
  return 'telehealth';
}

export function extractBlogTitle(html) {
  const h1 = html.match(/<h1[^>]*>([^<]+)</i);
  if (h1) return h1[1].replace(/\s+/g, ' ').trim();
  const title = html.match(/<title>([^<|]+)/i);
  return title ? title[1].replace(/\s+/g, ' ').trim() : '';
}

export function loadBlogRegistry(blogDir) {
  const entries = [];
  for (const file of fs.readdirSync(blogDir)) {
    if (!file.endsWith('.html') || BLOG_HUB_FILES.has(file)) continue;
    const slug = file.replace(/\.html$/, '');
    const html = fs.readFileSync(path.join(blogDir, file), 'utf8');
    // Never surface retired / noindex stubs (e.g. EG-P0-01) as related articles.
    if (/<meta\s+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) continue;
    const title = extractBlogTitle(html);
    const topic = topicFromBlog(slug, title);
    entries.push({ slug, title, topic, path: `/blog/${slug}` });
  }
  entries.sort((a, b) => a.title.localeCompare(b.title));
  return entries;
}

function tokenOverlap(a, b) {
  const aw = new Set(`${a}`.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length > 4));
  let score = 0;
  for (const w of `${b}`.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length > 4 && aw.has(w)) score += 1;
  }
  return score;
}

export function scoreBlogRelatedness(src, cand) {
  if (src.slug === cand.slug) return -1;
  let score = 0;
  if (src.topic === cand.topic) score += 6;
  score += tokenOverlap(`${src.slug} ${src.title}`, `${cand.slug} ${cand.title}`) * 2;
  if (/california/.test(src.slug) && /california/.test(cand.slug)) score += 3;
  if (/texas/.test(src.slug) && /texas/.test(cand.slug)) score += 3;
  if (/medication/.test(src.slug) && /medication/.test(cand.slug)) score += 2;
  if (/evaluation|diagnosis/.test(src.slug) && /evaluation|diagnosis/.test(cand.slug)) score += 2;
  return score;
}

export function pickRelatedArticles(slug, registry, min = 3) {
  const src = registry.find((e) => e.slug === slug);
  if (!src) return [];

  const sameTopic = registry
    .filter((c) => c.slug !== slug && c.topic === src.topic)
    .map((c) => ({ ...c, score: scoreBlogRelatedness(src, c) }))
    .sort((a, b) => b.score - a.score);

  const crossTopic = registry
    .filter((c) => c.slug !== slug && c.topic !== src.topic)
    .map((c) => ({ ...c, score: scoreBlogRelatedness(src, c) }))
    .sort((a, b) => b.score - a.score);

  const picks = [];
  for (const c of sameTopic) {
    if (picks.length >= min) break;
    if (!picks.some((p) => p.slug === c.slug)) picks.push(c);
  }

  const minCrossScore = picks.length < min ? 2 : 4;
  for (const c of crossTopic) {
    if (picks.length >= min) break;
    if (c.score < minCrossScore) continue;
    if (!picks.some((p) => p.slug === c.slug)) picks.push(c);
  }

  const fallbacks = TOPIC_FALLBACKS[src.topic] || TOPIC_FALLBACKS.telehealth;
  for (const fb of fallbacks) {
    if (picks.length >= min) break;
    if (fb === slug || picks.some((p) => p.slug === fb)) continue;
    const entry = registry.find((e) => e.slug === fb);
    if (entry) picks.push(entry);
  }

  const bridge = CROSS_TOPIC_BRIDGE[src.topic] || [];
  for (const fb of bridge) {
    if (picks.length >= min) break;
    if (fb === slug || picks.some((p) => p.slug === fb)) continue;
    const entry = registry.find((e) => e.slug === fb);
    if (entry) picks.push(entry);
  }

  for (const c of crossTopic) {
    if (picks.length >= min) break;
    if (!picks.some((p) => p.slug === c.slug)) picks.push(c);
  }

  return picks.slice(0, Math.max(min, 3));
}

export function landingForTopic(topic) {
  return LANDING_BY_TOPIC[topic] || LANDING_BY_TOPIC.telehealth;
}

export function renderRelatedArticlesSection({ articles, landing }) {
  const articleLis = articles
    .slice(0, 3)
    .map((a) => `                <li><a href="${a.path}">${a.title}</a></li>`)
    .join('\n');

  return `            <section class="related-articles" aria-labelledby="related-articles-heading">
              <h2 id="related-articles-heading">Related Articles</h2>
              <ul>
${articleLis}
              </ul>
              <p class="related-articles-care"><a href="${landing.href}">${landing.label} →</a></p>
            </section>`;
}

export function renderMasterIndexHtml(registry) {
  const byCategory = {};
  for (const entry of registry) {
    if (!byCategory[entry.topic]) byCategory[entry.topic] = [];
    byCategory[entry.topic].push(entry);
  }

  const order = ['adhd', 'metabolic', 'energy', 'employer', 'hormone', 'telehealth'];
  const sections = order
    .filter((t) => byCategory[t]?.length)
    .map((topic) => {
      const label = BLOG_CATEGORIES[topic] || topic;
      const items = byCategory[topic]
        .map((e) => `              <li><a href="${e.path}">${e.title}</a></li>`)
        .join('\n');
      return `          <div class="blog-master-index-group">
            <h3>${label} <span class="blog-master-index-count">(${byCategory[topic].length})</span></h3>
            <ul class="blog-master-index-list">
${items}
            </ul>
          </div>`;
    })
    .join('\n');

  return `<!-- SIYA:BLOG-MASTER-INDEX -->
      <section class="section blog-index blog-master-index" id="all-articles">
        <div class="container">
          <div class="section-header">
            <h2>All articles (${registry.length})</h2>
            <p class="lead">Every published article—grouped by topic for quick discovery and crawl paths.</p>
          </div>
          <div class="blog-master-index-grid">
${sections}
          </div>
          <p class="blog-hub-see-all"><a href="/blog/adhd">ADHD hub</a> · <a href="/blog/weight-loss">Weight loss hub</a> · <a href="/blog/telehealth">Telehealth hub</a></p>
        </div>
      </section>
      <!-- /SIYA:BLOG-MASTER-INDEX -->`;
}
