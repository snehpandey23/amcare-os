#!/usr/bin/env python3
"""Put remaining siya-health HTML on the homepage2 surface. Copy inside <main> stays."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]

HEADER = """    <header class="site-header site-header-transparent" id="site-header">
      <div class="container">
        <a class="header-logo brand-lockup" href="/" aria-label="Siya Health home">
          <img class="brand-lockup__mark" src="/assets/images/siya-health-mark.png" alt="" width="44" height="44" decoding="async" aria-hidden="true" />
          <span class="brand-lockup__wordmark">Siya Health<sup class="brand-lockup__reg" aria-hidden="true">®</sup></span>
        </a>
        <div class="nav-cta">
          <a href="/redirect/meet-greet" class="button ds-button ds-button--primary" data-siya-location="nav">Book Free Meet &amp; Greet</a>
        </div>
        <input type="checkbox" id="nav-toggle" class="nav-toggle" aria-label="Toggle menu" />
        <label for="nav-toggle" class="nav-toggle-label" aria-hidden="true"></label>
        <div class="nav-mobile">
          <a href="/about">About Us</a>
          <a href="/providers">Care Team</a>
          <a href="/labs">Labs</a>
          <a href="/pricing">Pricing</a>
        </div>
      </div>
    </header>"""

BG = """    <div class="siya-h2-cursor-glow" aria-hidden="true"></div>
    <div class="siya-h2-page-bg" aria-hidden="true">
      <svg class="siya-h2-page-bg__svg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" role="presentation">
        <defs>
          <linearGradient id="siyaHeroCream" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#F4EFE7"/><stop offset="55%" stop-color="#E8EEF8"/><stop offset="100%" stop-color="#F7F2EC"/>
          </linearGradient>
          <radialGradient id="siyaHeroGlowA" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#D81088" stop-opacity="0.5"/><stop offset="100%" stop-color="#D81088" stop-opacity="0"/>
          </radialGradient>
          <radialGradient id="siyaHeroGlowB" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#001878" stop-opacity="0.42"/><stop offset="100%" stop-color="#001878" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <rect width="1200" height="800" fill="url(#siyaHeroCream)"/>
        <g class="siya-hero-drift siya-hero-drift--a"><circle cx="240" cy="220" r="190" fill="url(#siyaHeroGlowA)"/>
          <circle class="siya-h2-ring" cx="240" cy="220" r="88" fill="none" stroke="#D81088" stroke-width="2.75"/>
          <circle class="siya-h2-ring siya-h2-ring--outer" cx="240" cy="220" r="132" fill="none" stroke="#D81088" stroke-width="1.6"/></g>
        <g class="siya-hero-drift siya-hero-drift--b"><circle cx="940" cy="500" r="230" fill="url(#siyaHeroGlowB)"/>
          <circle class="siya-h2-ring" cx="940" cy="500" r="108" fill="none" stroke="#001878" stroke-width="2.75"/>
          <circle class="siya-h2-ring siya-h2-ring--outer" cx="940" cy="500" r="156" fill="none" stroke="#0A246B" stroke-width="1.6"/></g>
        <g class="siya-hero-drift siya-hero-drift--wave">
          <path d="M40 620 C 220 500, 380 700, 560 560 S 900 480, 1180 380" fill="none" stroke="#D81088" stroke-width="2.75" stroke-linecap="round"/>
          <path d="M20 300 C 200 380, 360 180, 540 280 S 840 360, 1160 200" fill="none" stroke="#001878" stroke-width="2.5" stroke-linecap="round"/>
        </g>
      </svg>
    </div>"""

FOOTER = """    <footer class="footer siya-h2-footer-compact" id="siya-h2-footer"></footer>
    <script src="/scripts/h2-footer.js"></script>
    <script src="/scripts/h2-motion.js" defer></script>
    <script src="/scripts/header-scroll.js" defer></script>"""

exceptions = []
migrated = []

def files():
    for p in ROOT.rglob("*.html"):
        if any(part in {".vercel", "node_modules"} for part in p.parts):
            continue
        yield p

for path in files():
    rel = str(path.relative_to(ROOT))
    html = path.read_text(encoding="utf-8", errors="replace")
    if "siya-h2-surface" in html:
        continue
    if "redirect-transition" in html or 'http-equiv="refresh"' in html or "http-equiv='refresh'" in html:
        exceptions.append(rel + " — redirect/transition page, chrome left as-is")
        continue
    original = html
    if 'href="/design-system/h2-surface.css"' not in html:
        if re.search(r'href="/styles\.css[^"]*"', html):
            html = re.sub(
                r'(href="/styles\.css[^"]*")',
                r'\1',
                html,
                count=1,
            )
            html = re.sub(
                r'(<link rel="stylesheet" href="/styles\.css[^"]*"\s*/?>)',
                r'\1\n    <link rel="stylesheet" href="/design-system/h2-surface.css" />',
                html,
                count=1,
            )
        else:
            html = html.replace("</head>", '    <link rel="stylesheet" href="/design-system/h2-surface.css" />\n  </head>', 1)
    if "family=Poppins" not in html and "family=Inter" not in html:
        html = html.replace(
            "</head>",
            '    <link rel="preconnect" href="https://fonts.googleapis.com" />\n    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />\n  </head>',
            1,
        )
    def add_body(m):
        tag = m.group(0)
        if "siya-h2-surface" in tag:
            return tag
        if "class=" in tag:
            return re.sub(r'class="', 'class="siya-h2-surface ', tag, count=1)
        return tag[:-1] + ' class="siya-h2-surface">'
    html2, n = re.subn(r"<body\b[^>]*>", add_body, html, count=1)
    if n != 1:
        exceptions.append(rel + " — no body tag")
        continue
    html = html2
    if "siya-h2-page-bg" not in html:
        html = re.sub(r"(<body\b[^>]*>)", r"\1\n" + BG, html, count=1)
    if 'id="site-header"' not in html and "<header" in html:
        html, n = re.subn(
            r"<header\b[^>]*class=\"[^\"]*site-header[^\"]*\"[^>]*>[\s\S]*?</header>",
            HEADER,
            html,
            count=1,
        )
        if n != 1:
            exceptions.append(rel + " — header not swapped")
    elif 'id="site-header"' not in html and "<main" in html:
        html = html.replace("<main", HEADER + "\n    <main", 1)
    if 'id="siya-h2-footer"' not in html:
        html, n = re.subn(
            r"<footer\b[^>]*class=\"footer\"[^>]*>[\s\S]*?</footer>",
            FOOTER,
            html,
            count=1,
        )
        if n != 1:
            if "</body>" in html:
                html = html.replace("</body>", FOOTER + "\n  </body>", 1)
                exceptions.append(rel + " — no site footer; compact footer inserted before </body>")
            else:
                exceptions.append(rel + " — no footer and no </body>")
                continue
    html = re.sub(
        r'(<section\b[^>]*class="[^"]*\bhero-merged\b[^"]*")([^>]*?)\sstyle="[^"]*background-image:[^"]*"',
        r"\1\2",
        html,
    )
    html = re.sub(
        r'(<section\b[^>]*class=")([^"]*\bhero-merged\b(?![^"]*hero-merged--abstract)[^"]*)"',
        r'\1\2 hero-merged--abstract"',
        html,
    )
    if html != original:
        path.write_text(html, encoding="utf-8")
        migrated.append(rel)

print(f"migrated {len(migrated)}")
print(f"exceptions {len(exceptions)}")
for line in exceptions:
    print(" !", line)
Path("/tmp/h2-migrated.txt").write_text("\n".join(migrated), encoding="utf-8")
Path("/tmp/h2-exceptions.txt").write_text("\n".join(exceptions), encoding="utf-8")
