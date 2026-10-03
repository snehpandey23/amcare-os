/**
 * Invitation-only employer demo: /employers/demo
 * Visual source: internal/employer-demo-prototype.html
 * noindex · not in site nav · no pricing · facts from employer-pilot-facts.mjs
 *
 * EXCEPTION: this page loads GTM + siya-tracking.js and never the Meta pixel.
 * Do not copy that tracking setup onto other pages. seo-build chrome-lock
 * skips site-chrome injection, so the tags are written here.
 *
 * Run: node scripts/generate-employer-demo.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { TRACKING } from '../data/tracking-config.mjs';
import { EMPLOYER_PILOT_FACTS as FACTS } from '../data/employer-pilot-facts.mjs';

/** Swap for a scheduling URL later. Both close-slide buttons use this. */
const DEMO_BOOK_CALL_HREF = '/employers#employer-inquiry-form';

const SLIDE_IDS = [
  'statement',
  'p-time',
  'p-response',
  'p-whole',
  'p-coord',
  'question',
  'turn',
  'f-time',
  'f-hours',
  'f-response',
  'f-urgent',
  'f-whole',
  'employer',
  'employer-a',
  'employer-b',
  'journey',
  'baseline',
  'outcomes',
  'clinicians',
  'cost',
  'cost-usual',
  'cost-siya',
  'privacy',
  'privacy-emp',
  'privacy-you',
  'proof',
  'proof-nums',
  'proof-revs',
  'founder',
  'close',
];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PROTO = path.join(ROOT, 'internal', 'employer-demo-prototype.html');
const OUT = path.join(ROOT, 'employers', 'demo.html');

function countParts(label) {
  const raw = String(label).trim().replace(/,/g, '');
  const match = raw.match(/[0-9]+(?:\.[0-9]+)?/);
  const num = match ? match[0] : '0';
  return {
    n: num,
    suf: raw.includes('+') ? '+' : '',
    dec: (num.split('.')[1] || '').length,
  };
}

const patients = countParts(FACTS.patientsTreated);
const evaluations = countParts(FACTS.evaluationsCompleted);
const google = countParts(FACTS.googleScore.split('/')[0]);
const stateList = FACTS.practiceStatesShort.split(',').map((part) => part.trim()).filter(Boolean);

let body = fs.readFileSync(PROTO, 'utf8').replace(/^\uFEFF/, '');

body = body.replace(/^<title>[\s\S]*?<\/title>\s*/i, '');
body = body.replace(/<link rel="preconnect"[\s\S]*?family=Inter[\s\S]*?>\s*/i, '');

body = body.replace(
  '<button class="link" id="replayIntro1" type="button">Replay intro</button>',
  '',
);
body = body.replace(
  '<button class="link" id="replayIntro2" type="button">Replay intro</button>',
  '',
);

let slideN = 0;
body = body.replace(/<article class="slide( parked)?"/g, (match, parked) => {
  const id = SLIDE_IDS[slideN];
  slideN += 1;
  if (!id) throw new Error('Prototype has more slides than the handoff list');
  return `<article class="slide${parked || ''}" id="${id}" data-slide-id="${id}"`;
});
if (slideN !== SLIDE_IDS.length) {
  throw new Error(`Expected ${SLIDE_IDS.length} slides, found ${slideN}`);
}

body = body.replaceAll(
  '<b data-count="2700" data-at="2600" data-suf="+">0</b><span>Patients treated at Siya Health</span>',
  `<b data-count="${patients.n}" data-at="2600"${patients.suf ? ` data-suf="${patients.suf}"` : ''}>0</b><span>Patients treated at Siya Health</span>`,
);
body = body.replace(
  '<b data-count="1200" data-at="2800" data-suf="+">0</b><span>Clinical evaluations completed</span>',
  `<b data-count="${evaluations.n}" data-at="2800"${evaluations.suf ? ` data-suf="${evaluations.suf}"` : ''}>0</b><span>Clinical evaluations completed</span>`,
);
body = body.replaceAll(
  `<b data-count="4.9" data-dec="1" data-at="3000">0</b><span>Google rating (88 reviews)</span>`,
  `<b data-count="${google.n}" data-dec="${google.dec}" data-at="3000">0</b><span>Google rating (${FACTS.googleReviewCount} reviews)</span>`,
);
body = body.replaceAll(
  '<b data-count="4" data-at="3200">0</b><span>States: CA, TX, PA, FL</span>',
  `<b data-count="${stateList.length}" data-at="3200">0</b><span>States: ${FACTS.practiceStatesShort}</span>`,
);

body = body.replaceAll('__INQUIRY_HREF__', DEMO_BOOK_CALL_HREF);
body = body.replaceAll('__FACTS_RESPONSE__', FACTS.responseWithin);
body = body.replaceAll('__FACTS_HOURS__', FACTS.scheduledCare);
const klarity = countParts(FACTS.klarityScore.split('/')[0]);
body = body.replaceAll(
  '<!--KLARITY_STAT-->',
  `<div class="stat b" data-at="3400"><b data-count="${klarity.n}" data-dec="${klarity.dec}" data-at="3400">0</b><span>Third-party marketplace (${FACTS.klarityReviewCount} reviews)</span></div>`,
);

body = body.replace(
  'a.start, a.ghost {',
  'a.start, a.ghost {',
);
if (!body.includes('a.start,a.ghost{text-decoration:none')) {
  body = body.replace(
    '</style>',
    'a.start,a.ghost{text-decoration:none;display:inline-flex;align-items:center;justify-content:center}\n</style>',
  );
}

const trackHelper = `
const seenSlides=Object.create(null);
function track(name, extra){
  var payload={event:name};
  if(extra){Object.keys(extra).forEach(function(k){payload[k]=extra[k];});}
  if(typeof window.siyaTrack==='function') window.siyaTrack(name, extra||{});
  window.dataLayer=window.dataLayer||[];
  window.dataLayer.push(payload);
}
`;

if (!body.includes('function track(name, extra)')) {
  body = body.replace(
    'const reduce=matchMedia(\'(prefers-reduced-motion: reduce)\').matches;',
    `const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;${trackHelper}`,
  );
}

body = body.replace(
  "if(phase!=='idle')return;phase='play';t0=performance.now();",
  "if(phase!=='idle')return;phase='play';t0=performance.now();track('employer_demo_intro_start');",
);

body = body.replace(
  /\$\('skip'\)\.addEventListener\('click',e=>\{e\.stopPropagation\(\);(?:unlockAudio\(\);)?if\(phase==='idle'\)phase='play';finishIntro\(\);\}\);/,
  "$('skip').addEventListener('click',e=>{e.stopPropagation();unlockAudio();track('employer_demo_intro_skip');if(phase==='idle')phase='play';finishIntro();});",
);

body = body.replace(
  /function startTour\(\)\{\n  collectSlides\(\);\n  try\{ensureMusic\(\);\}catch\(e\)\{\} \/\* every entry into the tour after a click \*\/\n  welcome\.classList\.remove\('on'\);/,
  "function startTour(){\n  track('employer_demo_tour_start');\n  collectSlides();\n  try{ensureMusic();}catch(e){} /* every entry into the tour after a click */\n  welcome.classList.remove('on');",
);

body = body.replace(
  'const s=slides[i];s.querySelectorAll',
  `const s=slides[i];
  var sid=s.getAttribute('data-slide-id')||s.id||String(i+1);
  if(!seenSlides[sid]){seenSlides[sid]=1;track('employer_demo_slide_view',{slide:i+1,slide_id:sid});}
  s.querySelectorAll`,
);

body = body.replace(
  "function togglePause(){paused=!paused;$('pause').textContent=paused?'Play':'Pause';$('pause').setAttribute('aria-pressed',String(paused));}",
  "function togglePause(){paused=!paused;$('pause').textContent=paused?'Play':'Pause';$('pause').setAttribute('aria-pressed',String(paused));if(paused)track('employer_demo_pause');}",
);

body = body.replace(
  /welcome\.addEventListener\('click',e=>\{if\(e\.target\.closest\('#replayIntro1'\)\)return;(?:unlockAudio\(\);)?startTour\(\);\}\);\n\$\('replayIntro1'\)\.addEventListener\('click',e=>\{e\.stopPropagation\(\);resetIntro\(\);\}\);\n/,
  "welcome.addEventListener('click',()=>{unlockAudio();startTour();});\n",
);

body = body.replace("$('replayIntro2').addEventListener('click',resetIntro);\n", '');

body = body.replace(
  "if(e.target.closest('.bar,button'))return;",
  "if(e.target.closest('.bar,button,a'))return;",
);

if (body.includes('replayIntro1') || body.includes('Replay intro')) {
  throw new Error('Replay intro is still in the generated page');
}
if (!body.includes(DEMO_BOOK_CALL_HREF) || !body.includes('data-count="' + patients.n + '"')) {
  throw new Error('Facts or inquiry link did not land in the page');
}

const analyticsBootstrap = `<script>
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
  if (!(h === 'siya.health' || /\\.siya\\.health$/.test(h))) return;
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
</script>`;

const page = `<!DOCTYPE html>
<html lang="en">
  <head>
    <script src="/scripts/cookie-consent-bootstrap.js"></script>
    <!-- EXCEPTION: analytics for /employers/demo only, and only on siya.health. No Meta pixel. Do not copy. -->
    ${analyticsBootstrap}
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>Employer demo | Siya Health</title>
    <meta name="description" content="A short, self-paced walkthrough of Siya Health for HR and benefits leaders." />
    <link rel="canonical" href="https://siya.health/employers/demo" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet" />
  </head>
  <body>
${body.trim()}
  </body>
</html>
`;

fs.writeFileSync(OUT, page, 'utf8');
console.log('Wrote', OUT);
