/**
 * Private employer pilot deck.
 * Run: node scripts/generate-employer-pilot-deck.mjs
 *
 * Refuses to write employers/pilot-deck/index.html while PLACEHOLDERS are unset.
 * Reads demo tokens from internal/employer-demo-prototype.html. Does not edit that file.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { TRACKING } from '../data/tracking-config.mjs';
import {
  PLACEHOLDERS,
  DECK_META,
  deckSlides,
  assertPlaceholders,
} from '../data/employer-pilot-deck.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SITE = path.join(__dirname, '..');
const PROTO = path.join(SITE, 'internal/employer-demo-prototype.html');
const OUT = path.join(SITE, 'employers/pilot-deck/index.html');

const ICONS = {
  clipboard:
    '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  headset:
    '<path d="M3 11a9 9 0 0 1 18 0"/><path d="M21 16v-2a2 2 0 0 0-2-2h-1"/><path d="M3 16v-2a2 2 0 0 1 2-2h1"/><path d="M21 16v2a4 4 0 0 1-4 4h-2"/><rect x="2" y="11" width="4" height="7" rx="1"/><rect x="18" y="11" width="4" height="7" rx="1"/>',
  layers:
    '<path d="m12.83 2.18 8.5 4.25a1 1 0 0 1 0 1.79l-8.5 4.25a2 2 0 0 1-1.66 0l-8.5-4.25a1 1 0 0 1 0-1.79l8.5-4.25a2 2 0 0 1 1.66 0Z"/><path d="m22 12.5-9.17 4.58a2 2 0 0 1-1.66 0L2 12.5"/><path d="m22 17.5-9.17 4.58a2 2 0 0 1-1.66 0L2 17.5"/>',
  clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
};

function icon(name) {
  return `<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;
}

function esc(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function rootBlock() {
  const proto = fs.readFileSync(PROTO, 'utf8');
  const root = proto.match(/:root\{[\s\S]*?\}/);
  if (!root) throw new Error('Demo prototype is missing :root tokens');
  if (!proto.includes('#fff')) throw new Error('Demo prototype has no white card fill to reuse');
  return root[0].replace('color-scheme:dark;', 'color-scheme:light;');
}

function loadQr() {
  try {
    return createRequire(import.meta.url)('qrcode');
  } catch {
    return createRequire('/tmp/siya-qr/package.json')('qrcode');
  }
}

function foot(n, source) {
  return `<footer class="slide-foot" data-foot>
    ${source ? `<p class="source" data-role="foot">${esc(source)}</p>` : ''}
    <div class="brand-row">
      <img class="brand-mark" src="/assets/images/siya-health-mark.png" alt="" width="28" height="28" />
      <span class="brand-word" data-role="foot">${esc(DECK_META.footerBrand)}</span>
      <span class="pageno" data-role="foot">${n} / ${DECK_META.slideCount}</span>
    </div>
  </footer>`;
}

function head(slide) {
  return `<header class="slide-top">
    <p class="eyebrow" data-role="eyebrow">${esc(slide.eyebrow)}</p>
    <h2 class="headline" data-role="headline">${esc(slide.headline)}</h2>
    ${slide.sub ? `<p class="sub" data-role="body">${esc(slide.sub)}</p>` : ''}
  </header>`;
}

function shell(slide, inner) {
  return `<article class="slide slide-${slide.kind}" id="slide-${slide.n}" data-n="${slide.n}" data-piece-root>
    ${inner}
  </article>`;
}

function coverArt() {
  return `<svg class="cover-art" viewBox="420 120 780 640" aria-hidden="true">
    <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="var(--cream)" stroke-width="3" stroke-linecap="round"/>
    <path d="M20 300 C 200 380, 360 180, 540 280 S 840 360, 1160 200" fill="none" stroke="var(--magenta)" stroke-width="3" stroke-linecap="round"/>
    <path d="M80 480 C 260 400, 420 560, 640 460 S 980 400, 1180 320" fill="none" stroke="var(--navy)" stroke-width="3" stroke-linecap="round"/>
    <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="var(--violet)" stroke-width="1.5" stroke-linecap="round" transform="translate(0 36)"/>
  </svg>`;
}

function lockup(extra) {
  return `<div class="lockup ${extra || ''}">
    <img class="brand-mark brand-mark-lg" src="/assets/images/siya-health-mark.png" alt="" width="48" height="48" />
    <span class="wordmark">Siya Health<sup class="reg">®</sup></span>
  </div>`;
}

function renderCover(slide) {
  return shell(
    slide,
    `${lockup('lockup-light')}
    <div class="cover-copy">
      <p class="eyebrow eyebrow-chip" data-role="eyebrow">${esc(slide.eyebrow)}</p>
      <h1 class="headline headline-cover" data-role="headline">${esc(slide.headline)}</h1>
      <p class="sub sub-cover" data-role="body">${esc(slide.sub)}</p>
    </div>
    ${coverArt()}
    <p class="cover-foot" data-role="foot" data-foot>${esc(slide.footer)}</p>`,
  );
}

function renderNeed(slide) {
  const cards = slide.stats
    .map(
      ([n, label]) => `<article class="card stat" data-piece>
        <p class="stat-n" data-role="headline">${esc(n)}</p>
        <p class="stat-l" data-role="card">${esc(label)}</p>
      </article>`,
    )
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="grid-3">${cards}</div>
      <p class="kicker" data-piece data-role="body">${esc(slide.kicker)}</p>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderDeliver(slide) {
  const areas = ['top', 'right', 'bottom', 'left'];
  const pills = slide.nodes
    .map(
      (label, i) =>
        `<p class="hub-pill" style="grid-area:${areas[i]}" data-role="card">${esc(label)}</p>`,
    )
    .join('');
  const cards = slide.cards
    .map(
      ([title, body]) => `<article class="card" data-piece>
        <h3 class="card-title" data-role="card">${esc(title)}</h3>
        <p class="card-body" data-role="card">${esc(body)}</p>
      </article>`,
    )
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="split">
        <div class="hub-html" data-piece>
          <svg class="hub-wires" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1="50" y1="8" x2="50" y2="38" />
            <line x1="72" y1="50" x2="62" y2="50" />
            <line x1="50" y1="92" x2="50" y2="62" />
            <line x1="28" y1="50" x2="38" y2="50" />
          </svg>
          ${pills}
          <p class="hub-core" data-role="card">${esc(slide.hub)}</p>
        </div>
        <div class="stack">${cards}</div>
      </div>
      <p class="band" data-piece data-role="card">${esc(slide.band)}</p>
    </div>
    ${foot(slide.n, slide.note)}`,
  );
}

function renderWays(slide) {
  const bullets = slide.bullets.map((b) => `<li data-role="body">${esc(b)}</li>`).join('');
  const slots = slide.slots
    .map((s, i) => `<span class="slot-chip${i === 1 ? ' slot-on' : ''}" data-role="card">${esc(s)}</span>`)
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main ways">
      <ul class="bullets" data-piece>${bullets}</ul>
      <div class="ways-visual">
        <div class="ways-card" data-piece>
          <h3 class="card-title" data-role="card">${esc(slide.appTitle)}</h3>
          <div class="mini-phone"><div class="screen">
            <div class="ph-head"><i class="siya-dot" aria-hidden="true"></i><div><b>Siya Health</b><small>Care team</small></div></div>
            <div class="thread">
              <div class="bub bub-me" data-role="card">${esc(slide.appMe)}</div>
              <div class="bub bub-them" data-role="card">${esc(slide.appThem)}</div>
            </div>
          </div></div>
        </div>
        <div class="ways-card" data-piece>
          <h3 class="card-title" data-role="card">${esc(slide.webTitle)}</h3>
          <div class="book-ui">
            <p class="book-brand" data-role="card">${esc(slide.webBrand)}</p>
            <p class="card-body" data-role="card">${esc(slide.webNote)}</p>
            <div class="slots">${slots}</div>
            <p class="booked" data-role="card">${esc(slide.booked)}</p>
          </div>
        </div>
      </div>
    </div>
    ${foot(slide.n)}`,
  );
}

function renderStrengths(slide) {
  const rows = slide.rows
    .map(
      ([title, body, name]) => `<article class="strength" data-piece>
        ${icon(name)}
        <div>
          <h3 class="card-title" data-role="card">${esc(title)}</h3>
          <p class="card-body" data-role="card">${esc(body)}</p>
        </div>
      </article>`,
    )
    .join('');
  return shell(slide, `${head(slide)}<div class="slide-main stack">${rows}</div>${foot(slide.n)}`);
}

function renderDiffer(slide) {
  const headRow = slide.columns.map((c) => `<div class="cell th" data-role="table">${esc(c)}</div>`).join('');
  const rows = slide.rows
    .map(
      (row) =>
        `<div class="sheet-row" data-piece>${row
          .map((cell) => `<div class="cell" data-role="table">${esc(cell)}</div>`)
          .join('')}</div>`,
    )
    .join('');
  const [a, b, label, c] = slide.highlight;
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="sheet" role="table">
        <div class="sheet-row sheet-head" role="row">${headRow}</div>
        ${rows}
      </div>
      <div class="sheet-row band-row" data-piece>
        <div class="cell hi" data-role="table">${esc(a)}</div>
        <div class="cell hi" data-role="table">${esc(b)}</div>
        <div class="cell hi" data-role="table"><span class="hi-label">${esc(label)}</span> ${esc(c)}</div>
      </div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderLeadership(slide) {
  const slots = slide.slots
    .map((s, i) => `<span class="slot-chip${i === 1 ? ' slot-on' : ''}" data-role="card">${esc(s)}</span>`)
    .join('');
  const bullets = slide.bullets.map((b) => `<li data-role="card">${esc(b)}</li>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main split">
      <div class="book-ui card" data-piece>
        <div class="prov-card">
          <img src="/assets/images/dr-sneh-pandey.png" width="72" height="72" alt="${esc(slide.name)}" />
          <div>
            <b data-role="card">${esc(slide.name)}</b>
            <small data-role="card">${esc(slide.titleCard)}</small>
          </div>
        </div>
        <div class="slots">${slots}</div>
      </div>
      <div class="stack">
        <div data-piece>
          <h3 class="card-title" data-role="card">${esc(slide.name)}</h3>
          <p class="card-body" data-role="body">${esc(slide.title)}</p>
          <ul class="bullets tight">${bullets}</ul>
        </div>
        <p class="band" data-piece data-role="card">${esc(slide.proof)}</p>
      </div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderRigor(slide) {
  const steps = slide.steps
    .map(
      ([title, body], i) => `<article class="step card" data-piece>
        <p class="step-n" data-role="headline">${i + 1}</p>
        <h3 class="card-title" data-role="card">${esc(title)}</h3>
        <p class="card-body" data-role="card">${esc(body)}</p>
      </article>`,
    )
    .join('');
  const band = slide.band.map((line) => `<span>${esc(line)}</span>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="grid-5">${steps}</div>
      <p class="band band-split" data-piece data-role="card">${band}</p>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderRecord(slide) {
  const tiles = slide.tiles
    .map(
      ([n, label, hi]) => `<article class="card stat${hi ? ' hi-card' : ''}" data-piece>
        <p class="stat-n${String(n).length > 12 ? ' stat-n-wrap' : ''}" data-role="headline">${esc(n)}</p>
        <p class="stat-l" data-role="card">${esc(label)}</p>
      </article>`,
    )
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main"><div class="grid-3 tiles-6">${tiles}</div></div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderOutcomes(slide) {
  const headRow = slide.columns.map((c) => `<div class="cell th" data-role="table">${esc(c)}</div>`).join('');
  const rows = slide.rows
    .map(
      (row) =>
        `<div class="sheet-row grow" data-piece>${row
          .map((cell) => `<div class="cell" data-role="table">${esc(cell)}</div>`)
          .join('')}</div>`,
    )
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="sheet sheet-fill" role="table">
        <div class="sheet-row sheet-head">${headRow}</div>
        ${rows}
      </div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function chart(title, series) {
  const [a, b] = series;
  return `<div class="chart-block">
    <p class="chart-tag" data-role="card">SAMPLE DATA</p>
    <p class="chart-title" data-role="card">${esc(title)}</p>
    <svg class="chart" viewBox="0 0 560 180" aria-hidden="true">
      <line x1="8" y1="8" x2="8" y2="150" class="axis"/>
      <line x1="8" y1="150" x2="540" y2="150" class="axis"/>
      <polyline points="16,28 160,70 320,108 530,136" class="line-stress"/>
      <polyline points="16,136 160,100 320,58 530,24" class="line-focus"/>
    </svg>
    <p class="chart-axis" data-role="card">Start → Time</p>
    <p class="chart-key" data-role="card"><span class="key-stress">${esc(a)}</span><span class="key-focus">${esc(b)}</span></p>
  </div>`;
}

function renderProgress(slide) {
  const body = slide.body.map((p) => `<p class="sub" data-role="body">${esc(p)}</p>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="progress-copy" data-piece>${body}</div>
      <div class="grid-2 charts">
        <div class="card chart-card" data-piece>${chart(slide.leftTitle, slide.leftSeries)}</div>
        <div class="card chart-card" data-piece>${chart(slide.rightTitle, slide.rightSeries)}</div>
      </div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function eqBits(items) {
  return items
    .map((item, i) => {
      const hi = item[2] ? ' hi-card' : '';
      const op = i === items.length - 1 ? '<span class="eq-op" data-role="body">=</span>' : i ? '<span class="eq-op" data-role="body">×</span>' : '';
      return `${i === items.length - 1 ? '<span class="eq-op" data-role="body">=</span>' : op}
        <article class="card stat eq-bit${hi}" data-piece>
          <p class="stat-n" data-role="headline">${esc(item[0])}</p>
          <p class="stat-l" data-role="card">${esc(item[1])}</p>
        </article>`;
    })
    .join('');
}

function renderCapacity(slide) {
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="eq">${eqBits(slide.equation)}</div>
      <div class="eq eq-3">${slide.month
        .map(
          (item) => `<article class="card stat${item[2] ? ' hi-card' : ''}" data-piece>
            <p class="stat-n" data-role="headline">${esc(item[0])}</p>
            <p class="stat-l" data-role="card">${esc(item[1])}</p>
          </article>`,
        )
        .join('')}</div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderSupports(slide) {
  const headRow = slide.columns.map((c) => `<div class="cell th" data-role="table">${esc(c)}</div>`).join('');
  const rows = slide.rows
    .map(
      (row) =>
        `<div class="sheet-row cols-5" data-piece>${row
          .map((cell) => `<div class="cell" data-role="table">${esc(cell)}</div>`)
          .join('')}</div>`,
    )
    .join('');
  const cards = slide.cards
    .map((c) => `<article class="card" data-piece><p class="card-body" data-role="card">${esc(c)}</p></article>`)
    .join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="sheet" role="table">
        <div class="sheet-row sheet-head cols-5">${headRow}</div>
        ${rows}
      </div>
      <div class="grid-3 support-cards">${cards}</div>
    </div>
    ${foot(slide.n)}`,
  );
}

function renderPilot(slide) {
  const tiles = slide.tiles
    .map(
      ([n, label]) => `<article class="card stat" data-piece>
        <p class="stat-n stat-n-sm" data-role="headline">${esc(n)}</p>
        <p class="stat-l" data-role="card">${esc(label)}</p>
      </article>`,
    )
    .join('');
  const inc = slide.included.map((b) => `<li data-role="card">${esc(b)}</li>`).join('');
  const bill = slide.billed.map((b) => `<li data-role="card">${esc(b)}</li>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="grid-4">${tiles}</div>
      <div class="grid-2">
        <article class="card" data-piece>
          <h3 class="card-title" data-role="card">${esc(slide.includedTitle)}</h3>
          <ul class="bullets tight">${inc}</ul>
        </article>
        <article class="card" data-piece>
          <h3 class="card-title" data-role="card">${esc(slide.billedTitle)}</h3>
          <ul class="bullets tight">${bill}</ul>
        </article>
      </div>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderPrivacy(slide) {
  const cards = slide.cards
    .map(
      ([title, body]) => `<article class="card" data-piece>
        <h3 class="card-title" data-role="card">${esc(title)}</h3>
        <p class="card-body" data-role="card">${esc(body)}</p>
      </article>`,
    )
    .join('');
  const badges = [`<span class="badge" data-piece data-role="card">${esc(slide.badge)}</span>`];
  if (slide.baa) badges.push(`<span class="badge" data-piece data-role="card">${esc(slide.baa)}</span>`);
  const band = slide.band.map((line) => `<span>${esc(line)}</span>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="grid-3">${cards}</div>
      <div class="badge-row">${badges.join('')}</div>
      <p class="band band-split" data-piece data-role="card">${band}</p>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderStart(slide) {
  const steps = slide.timeline
    .map(
      ([when, body]) => `<article class="card tl" data-piece>
        <p class="step-n" data-role="card">${esc(when)}</p>
        <p class="card-body" data-role="card">${esc(body)}</p>
      </article>`,
    )
    .join('');
  const next = slide.next.map((item, i) => `<li data-role="card"><span class="step-n">${i + 1}</span> ${esc(item)}</li>`).join('');
  return shell(
    slide,
    `${head(slide)}
    <div class="slide-main">
      <div class="timeline-wrap" data-piece>
        <div class="tl-line" aria-hidden="true"></div>
        <div class="grid-4">${steps}</div>
      </div>
      <article class="card" data-piece>
        <h3 class="card-title" data-role="card">${esc(slide.nextTitle)}</h3>
        <ol class="next">${next}</ol>
      </article>
    </div>
    ${foot(slide.n, slide.source)}`,
  );
}

function renderClose(slide, qrSvg) {
  return shell(
    slide,
    `${lockup('lockup-light')}
    <div class="cover-copy close-copy">
      <p class="eyebrow eyebrow-chip" data-role="eyebrow">${esc(slide.eyebrow)}</p>
      <h1 class="headline headline-cover" data-role="headline">${esc(slide.headline)}</h1>
      <p class="sub sub-cover" data-role="body">${esc(slide.sub)}</p>
      <div class="contact" data-piece>
        <p data-role="body">${esc(slide.name)}</p>
        <p data-role="body">${esc(slide.email)} · ${esc(slide.phone)}</p>
        <p data-role="body">${esc(slide.site)}</p>
      </div>
    </div>
    <div class="demo-block" data-piece>
      <p class="demo-label" data-role="card">${esc(slide.demoLabel)}</p>
      <a class="demo-url" data-role="card" href="/employers/demo">${esc(slide.demoUrl)}</a>
      <div class="qr">${qrSvg}</div>
    </div>
    ${coverArt()}
    <p class="cover-foot" data-role="foot" data-foot>${esc(slide.footer)}</p>`,
  );
}

const RENDER = {
  cover: renderCover,
  need: renderNeed,
  deliver: renderDeliver,
  ways: renderWays,
  strengths: renderStrengths,
  differ: renderDiffer,
  leadership: renderLeadership,
  rigor: renderRigor,
  record: renderRecord,
  outcomes: renderOutcomes,
  progress: renderProgress,
  capacity: renderCapacity,
  supports: renderSupports,
  pilot: renderPilot,
  privacy: renderPrivacy,
  start: renderStart,
};

export async function buildPage(placeholders = PLACEHOLDERS) {
  assertPlaceholders(placeholders);
  const slides = deckSlides(placeholders);
  const QRCode = loadQr();
  const close = slides.find((s) => s.kind === 'close');
  const qrSvg = await QRCode.toString(close.demoHref, {
    type: 'svg',
    margin: 4,
    errorCorrectionLevel: 'M',
    color: { dark: '#FFFFFF', light: '#001878' },
  });
  const qr = qrSvg.replace('<svg ', '<svg class="qr-svg" ');
  const articles = slides
    .map((slide) => (slide.kind === 'close' ? renderClose(slide, qr) : RENDER[slide.kind](slide)))
    .join('\n');
  const notes = JSON.stringify(slides.map((s) => ({ n: s.n, notes: s.notes })));
  const html = pageHtml(articles, notes);
  if (html.includes('{{')) throw new Error('Refusing to generate: "{{" remains in the page');
  const banned = ['guarantee', 'SOC 2', '$', 'Klarity', '[Contact', 'Creyos', 'Spruce', 'CarePatron', '1 hr'];
  for (const word of banned) {
    if (html.includes(word)) {
      const at = html.indexOf(word);
      throw new Error(`Refusing to generate: banned string “${word}” near ${JSON.stringify(html.slice(Math.max(0, at - 80), at + 80))}`);
    }
  }
  return html;
}

function pageHtml(articles, notes) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex,nofollow" />
  <title>${esc(DECK_META.title)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&amp;family=Inter:wght@400;500;600&amp;display=swap" rel="stylesheet" />
  <style>
    ${rootBlock()}
    html, body { margin: 0; height: 100%; background: var(--cream); color: var(--ink); font-family: var(--font-body); }
    button, a { font-family: inherit; }
    .deck-page { min-height: 100%; display: flex; flex-direction: column; align-items: center; padding: 12px 12px 20px; box-sizing: border-box; }
    .deck-sizer { position: relative; width: calc(1280px * var(--desk-scale, 1)); height: calc(720px * var(--desk-scale, 1)); }
    .deck-stage { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; transform: scale(var(--desk-scale, 1)); transform-origin: top left; overflow: hidden; border-radius: 18px; box-shadow: 0 10px 26px rgba(10, 36, 107, .1); background: var(--cream); }
    .slide { display: none; position: absolute; inset: 0; box-sizing: border-box; padding: 26px 36px 14px; flex-direction: column; background: var(--cream); color: var(--ink); }
    .slide.is-on { display: flex; }
    .slide-cover, .slide-close { background: var(--grad-brand); color: var(--cream); padding: 32px 40px 22px; }
    .slide-top { flex: 0 0 auto; }
    .slide-main { flex: 1 1 auto; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; min-height: 0; }
    .eyebrow { margin: 0 0 8px; font: 600 14px/1.2 var(--font-display); letter-spacing: .14em; text-transform: uppercase; color: var(--magenta); }
    .eyebrow-chip { display: inline-block; color: var(--magenta); background: var(--cream); padding: 6px 10px; border-radius: 999px; }
    .headline { margin: 0; font: 700 40px/1.12 var(--font-display); color: var(--navy); }
    .headline-cover { color: var(--cream); font-size: 46px; max-width: 760px; }
    .sub, .card-body, .bullets, .stat-l { margin: 8px 0 0; font: 400 18px/1.35 var(--font-body); color: var(--ink); }
    .sub-cover { color: var(--cream); max-width: 720px; font-size: 20px; }
    .kicker { margin: 0; font: 700 18px/1.35 var(--font-body); color: var(--magenta); }
    .card, .stat, .strength, .ways-card, .book-ui { background: #fff; border-radius: 16px; box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .card, .ways-card, .book-ui { padding: 14px 16px; }
    .card-title { margin: 0; font: 600 18px/1.25 var(--font-display); color: var(--navy); }
    .card-body { font-size: 16px; line-height: 1.35; }
    .stat { padding: 16px 18px; display: flex; flex-direction: column; justify-content: center; }
    .stat-n { margin: 0; font: 700 40px/1.05 var(--font-display); color: var(--magenta); }
    .stat-n-wrap { line-height: 1.1; }
    .stat-l { font-size: 16px; }
    .hi-card { background: var(--navy); }
    .hi-card .stat-n, .hi-card .stat-l { color: #fff; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; min-height: 0; }
    .slide-pilot .slide-main > .grid-2 { flex: 1; }
    .slide-pilot .grid-2 .card { height: 100%; box-sizing: border-box; }
    .grid-3 { flex: 1; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; min-height: 0; }
    .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
    .grid-5 { flex: 1; display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; min-height: 0; }
    .tiles-6 { grid-template-columns: 0.85fr 0.85fr 1.3fr; grid-template-rows: 1fr 1fr; }
    .stack { flex: 1; display: flex; flex-direction: column; gap: 12px; min-height: 0; }
    .stack > .card, .stack > .strength { flex: 1; }
    .split { flex: 1; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; min-height: 0; }
    .band, .band-row .cell { background: var(--navy); color: #fff; border-radius: 16px; }
    .band { margin: 0; padding: 14px 18px; font: 600 16px/1.35 var(--font-body); }
    .band-split { display: flex; justify-content: space-between; gap: 18px; }
    .hub-html { position: relative; height: 100%; display: grid; grid-template-columns: 1fr 1.25fr 1fr; grid-template-rows: 1fr 1.15fr 1fr; grid-template-areas: ". top ." "left core right" ". bottom ."; align-items: center; justify-items: center; }
    .hub-wires { position: absolute; inset: 10% 8%; width: 84%; height: 80%; }
    .hub-wires line { stroke: var(--magenta); stroke-width: 2; vector-effect: non-scaling-stroke; }
    .hub-pill, .hub-core { position: relative; z-index: 1; margin: 0; text-align: center; font: 600 16px/1.3 var(--font-body); border-radius: 16px; padding: 12px 14px; box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .hub-pill { background: #fff; color: var(--navy); }
    .hub-core { background: var(--navy); color: #fff; grid-area: core; }
    .ways { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 16px; align-items: stretch; }
    .bullets { margin: 0; padding-left: 22px; display: flex; flex-direction: column; justify-content: center; gap: 14px; }
    .bullets.tight { gap: 8px; justify-content: flex-start; font-size: 16px; }
    .bullets li { font: 400 18px/1.35 var(--font-body); }
    .bullets.tight li { font-size: 16px; }
    .ways-visual { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-height: 0; }
    .ways-card { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
    .mini-phone { background: var(--navy); border-radius: 22px; padding: 8px; flex: 1; min-height: 0; }
    .screen { background: var(--cream-2); border-radius: 16px; height: 100%; display: flex; flex-direction: column; overflow: hidden; }
    .ph-head { display: flex; gap: 8px; align-items: center; padding: 10px 12px; background: var(--cream); color: var(--navy); font: 600 16px/1.2 var(--font-display); }
    .ph-head small { display: block; font: 500 16px/1.2 var(--font-body); color: var(--ink-soft); }
    .siya-dot { width: 18px; height: 18px; border-radius: 50%; background: var(--magenta); display: block; }
    .thread { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
    .bub { max-width: 92%; padding: 10px 12px; border-radius: 16px; font: 400 16px/1.35 var(--font-body); }
    .bub-me { align-self: flex-end; background: var(--navy); color: #fff; }
    .bub-them { align-self: flex-start; background: #fff; color: var(--ink); border: 1px solid var(--line); }
    .book-ui { display: flex; flex-direction: column; gap: 8px; height: 100%; box-sizing: border-box; }
    .book-brand { margin: 0; font: 600 16px/1.3 var(--font-display); color: var(--navy); }
    .slots { display: flex; flex-wrap: wrap; gap: 8px; }
    .slot-chip { padding: 8px 10px; border-radius: 10px; border: 1.5px solid var(--line); background: #fff; font: 600 16px/1 var(--font-display); color: var(--ink); }
    .slot-on { background: var(--grad-btn); color: #fff; border-color: transparent; }
    .booked { margin: 0; font: 700 16px/1.3 var(--font-display); color: var(--magenta); }
    .prov-card { display: grid; grid-template-columns: 72px 1fr; gap: 12px; align-items: center; }
    .prov-card img { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; }
    .prov-card b { display: block; font: 700 16px/1.2 var(--font-display); color: var(--navy); }
    .prov-card small { display: block; font: 500 16px/1.3 var(--font-body); color: var(--ink-soft); }
    .strength { display: grid; grid-template-columns: 36px 1fr; gap: 12px; align-items: center; padding: 10px 14px; border-left: 4px solid var(--magenta); }
    .ic { width: 28px; height: 28px; color: var(--magenta); }
    .sheet { display: flex; flex-direction: column; gap: 8px; }
    .slide-differ .sheet { flex: 1; }
    .slide-differ .sheet-row { flex: 1; }
    .slide-start .slide-main > .card { flex: 1; }
    .sheet-fill { flex: 1; }
    .sheet-row { display: grid; grid-template-columns: 1.1fr 1.3fr 1.6fr; gap: 8px; align-items: stretch; }
    .sheet-row.grow { flex: 1; }
    .cols-5 { grid-template-columns: 0.8fr 1fr 1.2fr 1fr 1.1fr; }
    .cell { background: #fff; border-radius: 12px; padding: 8px 10px; font: 400 16px/1.3 var(--font-body); color: var(--ink); box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .cell.th { background: transparent; box-shadow: none; font: 600 16px/1.2 var(--font-display); color: var(--magenta); padding-bottom: 0; }
    .cell.hi { background: var(--navy); color: #fff; box-shadow: none; }
    .hi-label { display: block; font: 700 16px/1.2 var(--font-display); color: var(--cream); }
    .step { display: flex; flex-direction: column; }
    .step-n { margin: 0; font: 700 40px/1 var(--font-display); color: var(--magenta); }
    .tl .step-n, .next .step-n { font-size: 22px; }
    .chart { width: 100%; height: 150px; display: block; }
    .chart-block { display: flex; flex-direction: column; height: 100%; }
    .chart-tag, .chart-title, .chart-axis, .chart-key { margin: 0; font: 600 16px/1.3 var(--font-body); color: var(--navy); }
    .chart-tag { color: var(--magenta); letter-spacing: .08em; }
    .chart-key { display: flex; gap: 16px; }
    .key-stress { color: var(--magenta); }
    .key-focus { color: var(--navy); }
    .axis { stroke: var(--line); stroke-width: 1.5; }
    .line-stress { fill: none; stroke: var(--magenta); stroke-width: 3; stroke-linecap: round; }
    .line-focus { fill: none; stroke: var(--navy); stroke-width: 3; stroke-linecap: round; }
    .swatch-stress { fill: var(--magenta); }
    .swatch-focus { fill: var(--navy); }
    .eq { flex: 1; display: flex; align-items: stretch; gap: 8px; min-height: 0; }
    .eq-bit { flex: 1; }
    .eq-op { align-self: center; font: 700 28px/1 var(--font-display); color: var(--navy); }
    .eq-3 { display: grid; grid-template-columns: 1fr 1.4fr 1.3fr; }
    .support-cards { align-items: stretch; }
    .support-cards .card { display: flex; align-items: center; }
    .badge-row { display: flex; gap: 12px; }
    .badge { display: inline-flex; align-items: center; padding: 10px 14px; border-radius: 999px; background: #fff; color: var(--navy); font: 600 16px/1.2 var(--font-display); box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .timeline-wrap { position: relative; }
    .tl-line { position: absolute; left: 12%; right: 12%; top: 28px; height: 2px; background: var(--magenta); }
    .tl { position: relative; min-height: 120px; }
    .next { margin: 8px 0 0; padding: 0; list-style: none; display: grid; grid-template-columns: 1fr 1fr; gap: 8px 18px; }
    .next li { font: 400 16px/1.35 var(--font-body); color: var(--ink); display: flex; gap: 8px; align-items: baseline; }
    .lockup { display: flex; align-items: center; gap: 10px; }
    .lockup-light .wordmark { color: #fff; }
    .wordmark { font: 600 22px/1 var(--font-display); color: var(--navy); }
    .reg { font-size: .55em; }
    .brand-mark-lg { width: 48px; height: 48px; }
    .cover-copy { position: relative; z-index: 1; max-width: 640px; margin-top: 36px; display: flex; flex-direction: column; gap: 14px; flex: 1; }
    .close-copy { max-width: 680px; }
    .cover-art { position: absolute; right: 0; top: 40px; width: 46%; height: 78%; }
    .cover-foot { position: relative; z-index: 1; margin: 0; font: 500 13px/1.35 var(--font-body); color: var(--cream); max-width: 920px; }
    .contact p { margin: 0; color: var(--cream); font-size: 20px; }
    .demo-block { position: absolute; right: 48px; bottom: 72px; z-index: 1; background: var(--navy); color: #fff; border-radius: 16px; padding: 12px 14px; width: 220px; box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .demo-label { margin: 0 0 4px; font: 600 16px/1.3 var(--font-display); color: #fff; }
    .demo-url { color: var(--cream); font: 500 16px/1.3 var(--font-body); }
    .qr { margin-top: 8px; background: var(--navy); }
    .cover-art, .hub-wires, .chart, .qr-svg, .ic { fill: none; }
    .qr-svg { width: 132px; height: 132px; display: block; }
    .qr-svg path[stroke], .chart line, .chart polyline, .hub-wires line, .cover-art path { fill: none; }
    .chart-card { display: flex; min-height: 0; }
    .charts { flex: 1; align-items: stretch; }
    .progress-copy { display: flex; flex-direction: column; gap: 4px; }
    .sheet-head { flex: 0 0 auto; }
    .stat-n-sm { font-size: 40px; }
    .slide-need, .slide-deliver, .slide-ways, .slide-strengths, .slide-leadership, .slide-rigor, .slide-record, .slide-outcomes, .slide-progress, .slide-capacity, .slide-supports, .slide-privacy { background: var(--cream); }
    .slide-foot { flex: 0 0 auto; margin-top: 8px; }
    .source { margin: 0 0 6px; font: 500 13px/1.35 var(--font-body); color: var(--ink-soft); }
    .brand-row { display: flex; align-items: center; gap: 8px; }
    .brand-mark { width: 28px; height: 28px; }
    .brand-word { font: 500 13px/1.2 var(--font-body); color: var(--ink); }
    .pageno { margin-left: auto; font: 600 13px/1 var(--font-display); color: var(--navy); }
    .deck-chrome { width: min(960px, 100%); display: flex; align-items: center; gap: 10px; margin-top: 10px; }
    .counter { font: 600 14px/1 var(--font-display); letter-spacing: .08em; color: var(--navy); }
    .chrome-btn { border: 1px solid var(--line); background: #fff; color: var(--navy); border-radius: 999px; padding: 8px 12px; font: 600 13px/1 var(--font-display); cursor: pointer; }
    .notes-panel { display: none; width: min(960px, 100%); margin-top: 8px; background: var(--cream-2); color: var(--ink); border-radius: 16px; padding: 12px 14px; font: 400 16px/1.4 var(--font-body); box-shadow: 0 10px 26px rgba(10, 36, 107, .1); }
    .notes-panel.is-open { display: block; }
    .rotate-hint { display: none; margin: 8px 0 0; font: 500 13px/1.3 var(--font-body); color: var(--ink-soft); }
    @media (orientation: portrait) and (max-width: 800px) {
      .rotate-hint { display: block; }
    }
  </style>
</head>
<body>
  <div class="deck-page">
    <div class="deck-sizer">
      <div class="deck-stage" id="stage">
        ${articles}
      </div>
    </div>
    <p class="rotate-hint" id="rotate-hint">Rotate for the best view</p>
    <div class="deck-chrome">
      <button class="chrome-btn" type="button" id="notes-btn">Notes</button>
      <span class="counter" id="counter">1 / ${DECK_META.slideCount}</span>
      <button class="chrome-btn" type="button" id="fs-btn">Fullscreen</button>
    </div>
    <div class="notes-panel" id="notes-panel"></div>
  </div>
  <script type="application/json" id="deck-notes">${notes}</script>
  <script>
    (function () {
      var notes = JSON.parse(document.getElementById('deck-notes').textContent);
      var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
      var total = slides.length;
      var current = 1;
      var notesOpen = false;
      function fit() {
        var W = 1280, H = 720, pad = 24;
        var portrait = window.matchMedia('(orientation: portrait) and (max-width: 800px)').matches;
        var notesEl = document.getElementById('notes-panel');
        var extra = 56 + (notesOpen && notesEl ? notesEl.offsetHeight + 8 : 0);
        var sw = Math.max(320, window.innerWidth - (portrait ? 16 : pad * 2)) / W;
        var sh = portrait ? sw : Math.max(280, window.innerHeight - pad * 2 - extra) / H;
        var z = Math.min(1, sw, sh);
        document.documentElement.style.setProperty('--desk-scale', String(z));
      }
      function show(n, fromHash) {
        current = Math.max(1, Math.min(total, n));
        slides.forEach(function (slide) {
          slide.classList.toggle('is-on', Number(slide.getAttribute('data-n')) === current);
        });
        document.getElementById('counter').textContent = current + ' / ' + total;
        var note = notes.filter(function (item) { return item.n === current; })[0];
        document.getElementById('notes-panel').textContent = note ? note.notes : '';
        if (!fromHash) {
          if (location.hash !== '#' + current) history.replaceState(null, '', '#' + current);
        }
      }
      function next() { show(current + 1); }
      function prev() { show(current - 1); }
      function toggleNotes() {
        notesOpen = !notesOpen;
        document.getElementById('notes-panel').classList.toggle('is-open', notesOpen);
        document.getElementById('notes-btn').setAttribute('aria-pressed', notesOpen ? 'true' : 'false');
        fit();
      }
      document.getElementById('notes-btn').addEventListener('click', toggleNotes);
      document.getElementById('fs-btn').addEventListener('click', function () {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen();
        else document.exitFullscreen();
      });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); next(); }
        else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
        else if (e.key === 'n' || e.key === 'N') { e.preventDefault(); toggleNotes(); }
      });
      var stage = document.getElementById('stage');
      stage.addEventListener('click', function (e) {
        if (e.target.closest('a, button')) return;
        var rect = stage.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width;
        if (x < 0.34) prev();
        else if (x > 0.66) next();
      });
      var touchX = 0;
      stage.addEventListener('touchstart', function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
      stage.addEventListener('touchend', function (e) {
        var dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) < 40) return;
        if (dx < 0) next(); else prev();
      }, { passive: true });
      window.addEventListener('hashchange', function () {
        var n = parseInt(String(location.hash).replace('#', ''), 10);
        if (n) show(n, true);
      });
      window.addEventListener('resize', fit);
      var start = parseInt(String(location.hash).replace('#', ''), 10);
      show(start || 1, true);
      if (!location.hash) history.replaceState(null, '', '#1');
      fit();
      document.documentElement.dataset.siyaReady = '1';
      window.__pilotDeck = { show: show, fit: fit };
    })();
  </script>
  <script>
  (function () {
    function boot() {
      if (!document.body) return;
      var q = new URLSearchParams(location.search || '');
      if (q.get('review') === '1') {
        var secure = location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = 'siya_demo_review=1; Path=/employers; Max-Age=31536000; SameSite=Lax' + secure;
      }
      var bits = document.cookie ? document.cookie.split(';') : [];
      for (var i = 0; i < bits.length; i++) {
        if (bits[i].trim() === 'siya_demo_review=1') return;
      }
      var h = String((location && location.hostname) || '').toLowerCase();
      if (h.indexOf('vercel.app') !== -1 || h === 'localhost' || h === '127.0.0.1') return;
      var tail = '.siya.health';
      var onSiya = h === 'siya.health' || (h.length > tail.length && h.lastIndexOf(tail) === h.length - tail.length);
      if (!onSiya) return;
      var w = window;
      var d = document;
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var j = d.createElement('script');
      j.async = true;
      j.src = 'https://www.googletagmanager.com/gtm.js?id=${TRACKING.GTM_CONTAINER_ID}';
      d.head.appendChild(j);
      var t = d.createElement('script');
      t.src = '/scripts/siya-tracking.js';
      t.defer = true;
      d.body.appendChild(t);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
    else boot();
  })();
  </script>
</body>
</html>
`;
}

const isDirect = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isDirect) {
  const html = await buildPage(PLACEHOLDERS);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, html);
  console.log('Wrote', OUT);
}
