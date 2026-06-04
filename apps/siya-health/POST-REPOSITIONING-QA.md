# Post-Repositioning QA

Generated: 2026-06-04T01:04:04.950Z

## Overall: **PASS** (automated checks)

| Check | Status |
|-------|--------|
| California in footer (California, Texas, Florida, and Pennsylvania) | ✓ |
| Health Guides terminology | ✓ |
| No Book Free Consultation | ✓ |
| No stale Medically reviewed | ✓ |
| Pending review on educational pages | ✓ |
| Health Guides hub UX | ✓ |

## Educational content review blocks

- Pages with pending review block: **110**
- Missing review block: **0**



## Related reports

- [STATE-STANDARDIZATION-REPORT.md](./STATE-STANDARDIZATION-REPORT.md)
- [HEALTH-GUIDES-CLEANUP-REPORT.md](./HEALTH-GUIDES-CLEANUP-REPORT.md)
- [CTA-CLEANUP-REPORT.md](./CTA-CLEANUP-REPORT.md)
- [HEALTH-GUIDES-UX-REPORT.md](./HEALTH-GUIDES-UX-REPORT.md)
- [PRODUCTION-READINESS-AUDIT.md](./PRODUCTION-READINESS-AUDIT.md)

## Build command

```bash
cd apps/siya-health
node scripts/generate-answer-pages.mjs
node scripts/internal-link-audit.mjs
node scripts/seo-build.mjs
node scripts/generate-ai-indexes.mjs
node scripts/generate-post-repositioning-reports.mjs
```
