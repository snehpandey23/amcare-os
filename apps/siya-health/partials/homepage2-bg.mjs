/**
 * Sitewide homepage2 surface. The only definition of the motion background.
 * Generators and seo-build call applyHomepage2Surface(). Do not paste this SVG into a template.
 */
export const H2_SURFACE_CLASS = 'siya-h2-surface';

export const H2_SURFACE_STYLESHEET =
  '<link rel="stylesheet" href="/design-system/h2-surface.css" />';

/** Exact homepage2 motion layer. */
export const HOMEPAGE2_PAGE_BG = `
    <div class="siya-h2-page-bg" aria-hidden="true">
          <svg class="siya-h2-page-bg__svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
            <defs>
              <linearGradient id="siyaHeroCream" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#F4EFE7"/>
                <stop offset="55%" stop-color="#E8EEF8"/>
                <stop offset="100%" stop-color="#F7F2EC"/>
              </linearGradient>
              <radialGradient id="siyaHeroGlowA" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#D81088" stop-opacity="0.50"/>
                <stop offset="45%" stop-color="#D81088" stop-opacity="0.22"/>
                <stop offset="100%" stop-color="#D81088" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="siyaHeroGlowB" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#001878" stop-opacity="0.42"/>
                <stop offset="50%" stop-color="#0A246B" stop-opacity="0.18"/>
                <stop offset="100%" stop-color="#001878" stop-opacity="0"/>
              </radialGradient>
              <radialGradient id="siyaHeroGlowC" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#7B2D8E" stop-opacity="0.38"/>
                <stop offset="55%" stop-color="#0A246B" stop-opacity="0.14"/>
                <stop offset="100%" stop-color="#0A246B" stop-opacity="0"/>
              </radialGradient>
            </defs>
            <rect width="1200" height="800" fill="url(#siyaHeroCream)"/>
            <g class="siya-hero-drift siya-hero-drift--a">
              <circle cx="240" cy="220" r="190" fill="url(#siyaHeroGlowA)"/>
              <circle class="siya-h2-ring" cx="240" cy="220" r="88" fill="none" stroke="#D81088" stroke-width="2.75"/>
              <circle class="siya-h2-ring siya-h2-ring--outer" cx="240" cy="220" r="132" fill="none" stroke="#D81088" stroke-width="1.6"/>
            </g>
            <g class="siya-hero-drift siya-hero-drift--b">
              <circle cx="940" cy="500" r="230" fill="url(#siyaHeroGlowB)"/>
              <circle class="siya-h2-ring" cx="940" cy="500" r="108" fill="none" stroke="#001878" stroke-width="2.75"/>
              <circle class="siya-h2-ring siya-h2-ring--outer" cx="940" cy="500" r="156" fill="none" stroke="#0A246B" stroke-width="1.6"/>
            </g>
            <g class="siya-hero-drift siya-hero-drift--c">
              <circle cx="700" cy="150" r="160" fill="url(#siyaHeroGlowC)"/>
              <circle class="siya-h2-ring" cx="700" cy="150" r="72" fill="none" stroke="#7B2D8E" stroke-width="2.5"/>
              <circle class="siya-h2-ring siya-h2-ring--outer" cx="700" cy="150" r="112" fill="none" stroke="#D81088" stroke-width="1.5"/>
            </g>
            <g class="siya-hero-drift siya-hero-drift--d">
              <circle cx="130" cy="680" r="150" fill="url(#siyaHeroGlowB)"/>
              <circle class="siya-h2-ring" cx="130" cy="680" r="70" fill="none" stroke="#001878" stroke-width="2.25"/>
              <circle cx="1080" cy="110" r="120" fill="url(#siyaHeroGlowA)"/>
              <circle class="siya-h2-ring" cx="1080" cy="110" r="58" fill="none" stroke="#D81088" stroke-width="2.25"/>
            </g>
            <g class="siya-hero-drift siya-hero-drift--wave">
              <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="#D81088" stroke-width="2.75" stroke-linecap="round"/>
              <path d="M20 300 C 200 380, 360 180, 540 280 S 840 360, 1160 200" fill="none" stroke="#001878" stroke-width="2.5" stroke-linecap="round"/>
              <path d="M60 740 C 300 660, 480 780, 700 680 S 980 620, 1180 540" fill="none" stroke="#C4A574" stroke-width="2.25" stroke-linecap="round"/>
            </g>
          </svg>
    </div>
`;

/**
 * Add the surface class, the stylesheet, and the motion markup.
 * Idempotent: a page that already contains the background div is not given a second copy.
 */
export function applyHomepage2Surface(html) {
  if (!html || !/<body\b/i.test(html)) return html;
  let out = html;

  if (!out.includes('h2-surface.css') && /<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `    ${H2_SURFACE_STYLESHEET}\n  </head>`);
  }

  out = out.replace(/<body\b([^>]*)>/i, (full, attrs) => {
    if (/\bsiya-h2-surface\b/.test(attrs)) return full;
    if (/\bclass="/i.test(attrs)) {
      return `<body${attrs.replace(/\bclass="/i, 'class="siya-h2-surface ')}>`;
    }
    if (/\bclass='/i.test(attrs)) {
      return `<body${attrs.replace(/\bclass='/i, "class='siya-h2-surface ")}>`;
    }
    return `<body class="siya-h2-surface"${attrs}>`;
  });

  if (!out.includes('class="siya-h2-page-bg"') && !out.includes("class='siya-h2-page-bg'")) {
    out = out.replace(/<body\b[^>]*>/i, (open) => `${open}\n${HOMEPAGE2_PAGE_BG}\n`);
  }
  return out;
}
