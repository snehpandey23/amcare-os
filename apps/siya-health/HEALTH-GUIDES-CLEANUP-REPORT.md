# Health Guides Naming Cleanup Report

Generated: 2026-06-04T01:04:04.949Z

## Replacements applied

| Legacy | New |
|--------|-----|
| Clinical Answers Hub | Health Guides Hub |
| Clinical Answers / clinical answers | Health Guides / health guides |
| Browse clinical answers | Browse Health Guides |
| Health guides (H1) | Health Guides |

## Sources updated

- `scripts/generate-answer-pages.mjs` — next steps, meta, hub
- `scripts/site-chrome.mjs` — sitewide normalize
- `scripts/generate-ai-indexes.mjs` — `health-guide` topic tag, llms.txt hub line
- `scripts/internal-link-audit.mjs` — link label

## Post-build scan

| Pattern | Remaining files |
|---------|----------------:|
| Clinical Answers / clinical answers / Browse clinical answers | **0** |

_None in production HTML._

## AI indexes

| File | Health Guides hub |
|------|-------------------|
| llms.txt | ✓ |
| llms-full.txt | ✓ |

## Hub UX

| Check | Status |
|-------|--------|
| H1 "Health Guides" | ✓ |
| Category card grid | ✓ |
| Five categories present | ✓ |
| Nav label "Health Guides" | ✓ |
