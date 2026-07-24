/**
 * California city SEO hallway: durable SIYA:CA-* markers linking statewide CA
 * ADHD content ↔ LA / SD / SF / SJ / Sacramento / Oakland / Orange County treatment pages.
 *
 * Run: node scripts/apply-california-city-linking.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const CITIES = [
  { slug: 'adhd-treatment-los-angeles-ca', name: 'Los Angeles', short: 'LA', label: 'Los Angeles ADHD treatment' },
  { slug: 'adhd-treatment-san-diego-ca', name: 'San Diego', short: 'San Diego', label: 'San Diego ADHD treatment' },
  { slug: 'adhd-treatment-san-francisco-ca', name: 'San Francisco', short: 'SF', label: 'San Francisco ADHD treatment' },
  { slug: 'adhd-treatment-san-jose-ca', name: 'San Jose', short: 'San Jose', label: 'San Jose ADHD treatment' },
  { slug: 'adhd-treatment-sacramento-ca', name: 'Sacramento', short: 'Sacramento', label: 'Sacramento ADHD treatment' },
  { slug: 'adhd-treatment-oakland-ca', name: 'Oakland', short: 'Oakland', label: 'Oakland ADHD treatment' },
  { slug: 'adhd-treatment-orange-county-ca', name: 'Orange County', short: 'OC', label: 'Orange County ADHD treatment' },
];

const STATE_HUBS = [
  { href: '/blog/online-adhd-diagnosis-california', label: 'online ADHD diagnosis in California' },
  { href: '/blog/adhd-telehealth-california', label: 'ADHD telehealth in California' },
  { href: '/blog/adult-adhd-treatment-california-2026', label: 'adult ADHD treatment in California' },
  { href: '/blog/how-to-choose-adhd-provider-california', label: 'choosing an ADHD provider in California' },
  { href: '/blog/adhd-medication-options-california', label: 'ADHD medication options in California' },
  { href: '/blog/adhd-medication-online-california', label: 'ADHD medication online in California' },
  { href: '/adult-adhd-screening-california', label: 'California ADHD screening' },
  { href: '/adhd-care', label: 'ADHD evaluation & care' },
];

/** Statewide CA blogs that should carry the city cluster + geo paragraph */
const CA_STATE_BLOGS = [
  'blog/online-adhd-diagnosis-california.html',
  'blog/adhd-telehealth-california.html',
  'blog/adult-adhd-treatment-california-2026.html',
  'blog/how-to-choose-adhd-provider-california.html',
  'blog/adhd-medication-options-california.html',
  'blog/adhd-medication-online-california.html',
  'blog/adhd-evaluation-california-online-vs-in-person.html',
  'blog/adhd-testing-online-california-screening-vs-evaluation.html',
  'blog/adult-adhd-symptoms-california.html',
];

const CA_CITY_PAGES = CITIES.map((c) => `blog/${c.slug}.html`);

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}
function write(rel, html) {
  fs.writeFileSync(path.join(ROOT, rel), html);
}
function exists(rel) {
  return fs.existsSync(path.join(ROOT, rel));
}

function softStrip(html, marker) {
  const start = `<!-- SIYA:${marker} -->`;
  const end = `<!-- /SIYA:${marker} -->`;
  if (!html.includes(start)) return html;
  return html.replace(new RegExp(`${start}[\\s\\S]*?${end}\\s*`), '');
}

function upsertMarkerBlock(html, marker, block) {
  const start = `<!-- SIYA:${marker} -->`;
  const end = `<!-- /SIYA:${marker} -->`;
  const wrapped = `${start}\n${block}\n${end}`;
  html = softStrip(html, marker);
  if (html.includes('<!-- FINAL CTA -->')) {
    return html.replace('<!-- FINAL CTA -->', `${wrapped}\n      <!-- FINAL CTA -->`);
  }
  if (html.includes('<section class="related-articles"')) {
    return html.replace('<section class="related-articles"', `${wrapped}\n            <section class="related-articles"`);
  }
  if (html.includes('</div>\n        </div>\n      </section>\n    </main>') || html.includes('</main>')) {
    return html.replace('</main>', `      ${wrapped}\n    </main>`);
  }
  return html + '\n' + wrapped;
}

function cityLinksHtml(sep = ', ') {
  return CITIES.map((c) => `<a href="/blog/${c.slug}">${c.name}</a>`).join(sep);
}

function cityClusterBlock({ heading = true } = {}) {
  const h = heading
    ? `<p><strong>California city ADHD treatment guides</strong></p>`
    : '';
  return `            <aside class="blog-internal-links ca-cluster-links" aria-label="California city ADHD treatment">
${h}              <p>Physician-led virtual ADHD care for adults across California metros: ${cityLinksHtml()}.</p>
              <p>Statewide: <a href="/blog/online-adhd-diagnosis-california">online ADHD diagnosis in California</a> · <a href="/blog/adhd-telehealth-california">ADHD telehealth in California</a> · <a href="/blog/adult-adhd-treatment-california-2026">adult ADHD treatment in California</a> · <a href="/adhd-care">start an ADHD evaluation</a>.</p>
            </aside>`;
}

function geoParagraphBlock() {
  return `            <section class="section-tinted" style="padding:1.25rem 0;" aria-label="California metros">
              <div class="container" style="max-width:720px;margin:0 auto;padding:0 1rem;">
                <p class="lead" style="margin:0;">Californians searching for care often live in different metros with different schedules—creative and entertainment work in <a href="/blog/adhd-treatment-los-angeles-ca">Los Angeles</a>, biotech and military-adjacent life in <a href="/blog/adhd-treatment-san-diego-ca">San Diego</a>, dense tech and hybrid work in <a href="/blog/adhd-treatment-san-francisco-ca">San Francisco</a>, South Bay engineering careers in <a href="/blog/adhd-treatment-san-jose-ca">San Jose</a>, capital and Central Valley schedules in <a href="/blog/adhd-treatment-sacramento-ca">Sacramento</a>, East Bay creative–tech life in <a href="/blog/adhd-treatment-oakland-ca">Oakland</a>, and Irvine/OC corporate corridors in <a href="/blog/adhd-treatment-orange-county-ca">Orange County</a>. City guides go deeper on local context; statewide standards stay the same.</p>
              </div>
            </section>`;
}

function cityPageSiblingBlock(currentSlug) {
  const others = CITIES.filter((c) => c.slug !== currentSlug)
    .map((c) => `<a href="/blog/${c.slug}">${c.label}</a>`)
    .join(', ');
  return `            <aside class="blog-internal-links ca-cluster-links" aria-label="Related California ADHD resources">
              <p>For statewide California context, read <a href="/blog/online-adhd-diagnosis-california">online ADHD diagnosis in California</a>, <a href="/blog/adhd-telehealth-california">ADHD telehealth in California</a>, and <a href="/blog/adult-adhd-treatment-california-2026">adult ADHD treatment options</a>. Nearby metro guides: ${others}.</p>
              <p>Also: <a href="/blog/how-to-choose-adhd-provider-california">how to choose an ADHD provider in California</a> · <a href="/adult-adhd-screening-california">California ADHD screening</a> · <a href="/adhd-care">ADHD evaluation &amp; care</a> · <a href="/pricing">pricing</a>.</p>
            </aside>`;
}

/** Link bare city names in prose when not already inside an <a> */
function linkBareCityNames(html) {
  // Only operate inside blog-content / main to avoid nav/footer churn
  const parts = html.split(/(<div class="blog-content">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>)/);
  if (parts.length < 2) {
    // fallback: whole file cautious replace for unlinked city phrases
    return linkCitiesInChunk(html);
  }
  for (let i = 1; i < parts.length; i += 2) {
    parts[i] = linkCitiesInChunk(parts[i]);
  }
  return parts.join('');
}

function linkCitiesInChunk(chunk) {
  const pairs = [
    ['Los Angeles', '/blog/adhd-treatment-los-angeles-ca'],
    ['San Francisco', '/blog/adhd-treatment-san-francisco-ca'],
    ['San Diego', '/blog/adhd-treatment-san-diego-ca'],
    ['San Jose', '/blog/adhd-treatment-san-jose-ca'],
    ['Orange County', '/blog/adhd-treatment-orange-county-ca'],
    ['Sacramento', '/blog/adhd-treatment-sacramento-ca'],
    ['Oakland', '/blog/adhd-treatment-oakland-ca'],
  ];
  let out = '';
  let i = 0;
  while (i < chunk.length) {
    if (chunk.startsWith('<a ', i) || chunk.startsWith('<a\n', i) || chunk.startsWith('<a\t', i)) {
      const end = chunk.indexOf('</a>', i);
      if (end === -1) {
        out += chunk.slice(i);
        break;
      }
      out += chunk.slice(i, end + 4);
      i = end + 4;
      continue;
    }
    // Skip script/style blocks
    if (chunk.startsWith('<script', i) || chunk.startsWith('<style', i)) {
      const tag = chunk.startsWith('<script', i) ? 'script' : 'style';
      const end = chunk.indexOf(`</${tag}>`, i);
      if (end === -1) {
        out += chunk.slice(i);
        break;
      }
      out += chunk.slice(i, end + tag.length + 3);
      i = end + tag.length + 3;
      continue;
    }
    let matched = false;
    for (const [name, href] of pairs) {
      if (chunk.startsWith(name, i)) {
        out += `<a href="${href}">${name}</a>`;
        i += name.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      out += chunk[i];
      i += 1;
    }
  }
  return out;
}

let n = 0;

// 1) State blogs: geo paragraph + city cluster
for (const rel of CA_STATE_BLOGS) {
  if (!exists(rel)) {
    console.warn('SKIP missing', rel);
    continue;
  }
  let html = read(rel);
  html = softStrip(html, 'CA-CITY-CLUSTER');
  html = softStrip(html, 'CA-GEO-PARAGRAPH');
  // Strip prior non-marker cluster asides that only list cities (keep content unique)
  html = upsertMarkerBlock(html, 'CA-GEO-PARAGRAPH', geoParagraphBlock());
  html = upsertMarkerBlock(html, 'CA-CITY-CLUSTER', cityClusterBlock());
  // Link bare city names in body (after markers so marker links stay intact)
  html = linkBareCityNames(html);
  write(rel, html);
  console.log('OK state', rel);
  n += 1;
}

// 2) City pages: sibling + state hallway
for (const city of CITIES) {
  const rel = `blog/${city.slug}.html`;
  if (!exists(rel)) {
    console.warn('SKIP missing', rel);
    continue;
  }
  let html = read(rel);
  html = softStrip(html, 'CA-CITY-SIBLINGS');
  html = upsertMarkerBlock(html, 'CA-CITY-SIBLINGS', cityPageSiblingBlock(city.slug));
  write(rel, html);
  console.log('OK city', rel);
  n += 1;
}

// 3) California screening landing
{
  const rel = 'adult-adhd-screening-california.html';
  if (exists(rel)) {
    let html = read(rel);
    html = softStrip(html, 'CA-CITY-CLUSTER');
    html = softStrip(html, 'CA-GEO-PARAGRAPH');
    html = upsertMarkerBlock(html, 'CA-GEO-PARAGRAPH', geoParagraphBlock());
    html = upsertMarkerBlock(html, 'CA-CITY-CLUSTER', cityClusterBlock());
    write(rel, html);
    console.log('OK screening', rel);
    n += 1;
  }
}

// 4) ADHD care service page — CA metro strip REMOVED (2026-07-24)
// City SEO stays on /blog/adhd and state hubs; general care page stays clean.
{
  const rel = 'adhd-care.html';
  if (exists(rel)) {
    let html = read(rel);
    const marker = 'CA-METRO-STRIP';
    if (html.includes(`SIYA:${marker}`)) {
      html = softStrip(html, marker);
      write(rel, html);
      console.log('OK adhd-care (removed CA metro strip)');
      n += 1;
    } else {
      console.log('SKIP adhd-care (no CA metro strip)');
    }
  }
}

// 5) Blog ADHD hub — California metro cards + metro line
{
  const rel = 'blog/adhd.html';
  if (exists(rel)) {
    let html = read(rel);
    const marker = 'CA-CITY-HUB-CARDS';
    const cards = `            <!-- SIYA:${marker} -->
            <div class="section-header" style="margin-top:2rem;">
              <h2>California city ADHD treatment</h2>
              <p class="lead">Local context for California&rsquo;s largest metros—same physician-led standards statewide.</p>
            </div>
            <div class="blog-card-grid">
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-los-angeles-ca">ADHD Treatment in Los Angeles</a></h3><p>Creative schedules, long drives, gig + corporate life.</p><a class="blog-card-link" href="/blog/adhd-treatment-los-angeles-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-san-diego-ca">ADHD Treatment in San Diego</a></h3><p>Biotech, military-adjacent, coastal commute patterns.</p><a class="blog-card-link" href="/blog/adhd-treatment-san-diego-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-san-francisco-ca">ADHD Treatment in San Francisco</a></h3><p>Tech, startups, dense transit, hybrid remote stress.</p><a class="blog-card-link" href="/blog/adhd-treatment-san-francisco-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-san-jose-ca">ADHD Treatment in San Jose</a></h3><p>Silicon Valley engineering and South Bay dual careers.</p><a class="blog-card-link" href="/blog/adhd-treatment-san-jose-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-sacramento-ca">ADHD Treatment in Sacramento</a></h3><p>Capital policy work, Central Valley access, UC Davis orbit.</p><a class="blog-card-link" href="/blog/adhd-treatment-sacramento-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-oakland-ca">ADHD Treatment in Oakland</a></h3><p>East Bay diversity, BART commute, creative + tech spillover.</p><a class="blog-card-link" href="/blog/adhd-treatment-oakland-ca">Read more →</a></article>
              <article class="blog-card"><span class="blog-card-tag">California</span><h3><a href="/blog/adhd-treatment-orange-county-ca">ADHD Treatment in Orange County</a></h3><p>Irvine corporate corridor, family suburbs, 405/55 traffic.</p><a class="blog-card-link" href="/blog/adhd-treatment-orange-county-ca">Read more →</a></article>
            </div>
            <!-- /SIYA:${marker} -->`;
    html = softStrip(html, marker);
    if (html.includes('Texas hub</span>')) {
      // Insert CA city section before Texas hub card block heading if possible
      html = html.replace(
        /(<article class="blog-card"><span class="blog-card-tag">Texas hub<\/span>)/,
        `${cards}\n              $1`,
      );
    } else if (html.includes('</main>')) {
      html = html.replace('</main>', `      ${cards}\n    </main>`);
    }
    // Strengthen metro guides line to include CA cities
    const metroLine = `State-specific evaluation: <a href="/blog/online-adhd-diagnosis-california">California ADHD diagnosis</a>, <a href="/adhd-diagnosis-texas">Texas ADHD diagnosis</a>, <a href="/adhd-diagnosis-florida">Florida ADHD diagnosis</a>, <a href="/adhd-diagnosis-pennsylvania">Pennsylvania ADHD diagnosis</a>. California metros: <a href="/blog/adhd-treatment-los-angeles-ca">Los Angeles</a>, <a href="/blog/adhd-treatment-san-diego-ca">San Diego</a>, <a href="/blog/adhd-treatment-san-francisco-ca">San Francisco</a>, <a href="/blog/adhd-treatment-san-jose-ca">San Jose</a>, <a href="/blog/adhd-treatment-sacramento-ca">Sacramento</a>, <a href="/blog/adhd-treatment-oakland-ca">Oakland</a>, <a href="/blog/adhd-treatment-orange-county-ca">Orange County</a>. Other metros: <a href="/adhd-diagnosis-austin">Austin</a>, <a href="/adhd-diagnosis-houston">Houston</a>, <a href="/adhd-diagnosis-philadelphia">Philadelphia</a>.`;
    if (html.includes('State-specific evaluation:')) {
      html = html.replace(/State-specific evaluation:[\s\S]*?<\/p>/, `${metroLine}</p>`);
    }
    write(rel, html);
    console.log('OK blog/adhd hub');
    n += 1;
  }
}

// 6) Blog hub — California metro strip removed (category hubs + footer are enough)
{
  const rel = 'blog/index.html';
  if (exists(rel)) {
    let html = read(rel);
    const before = html;
    html = html.replace(
      /\s*<p class="blog-hub-see-all"><!-- SIYA:CA-CITY-INDEX -->[\s\S]*?<!-- \/SIYA:CA-CITY-INDEX --><\/p>/g,
      '',
    );
    if (html !== before) {
      write(rel, html);
      console.log('OK blog index (removed CA city index strip)');
      n += 1;
    }
  }
}

// 7) Key answers that mention California
const ANSWER_TARGETS = [
  'answers/can-adhd-be-diagnosed-online.html',
  'answers/is-online-adhd-diagnosis-legitimate.html',
  'answers/screening-vs-adhd-evaluation.html',
  'answers/how-long-adhd-evaluation.html',
  'answers/what-included-199-adhd-evaluation.html',
  'answers/telehealth-adhd-texas.html', // add CA contrast link only if file exists - skip texas-named
];
for (const rel of [
  'answers/can-adhd-be-diagnosed-online.html',
  'answers/is-online-adhd-diagnosis-legitimate.html',
  'answers/screening-vs-adhd-evaluation.html',
  'answers/how-long-adhd-evaluation.html',
  'answers/what-included-199-adhd-evaluation.html',
  'answers/late-adhd-diagnosis-adults.html',
  'answers/signs-of-adult-adhd.html',
  'answers/adhd-in-women.html',
]) {
  if (!exists(rel)) continue;
  let html = read(rel);
  const marker = 'CA-CITY-ANSWER';
  const block = `      <section class="section section-tinted" aria-label="California ADHD care">
        <div class="container">
          <p class="lead" style="margin:0;">In California, adults often start with <a href="/blog/online-adhd-diagnosis-california">online ADHD diagnosis in California</a> or metro guides for <a href="/blog/adhd-treatment-los-angeles-ca">Los Angeles</a>, <a href="/blog/adhd-treatment-san-diego-ca">San Diego</a>, <a href="/blog/adhd-treatment-san-francisco-ca">San Francisco</a>, <a href="/blog/adhd-treatment-san-jose-ca">San Jose</a>, <a href="/blog/adhd-treatment-sacramento-ca">Sacramento</a>, <a href="/blog/adhd-treatment-oakland-ca">Oakland</a>, and <a href="/blog/adhd-treatment-orange-county-ca">Orange County</a>—then book care via <a href="/adhd-care">ADHD evaluation</a>.</p>
        </div>
      </section>`;
  html = softStrip(html, marker);
  html = upsertMarkerBlock(html, marker, block);
  write(rel, html);
  console.log('OK answer', rel);
  n += 1;
}

console.log(`California city linking applied: ${n} files`);
