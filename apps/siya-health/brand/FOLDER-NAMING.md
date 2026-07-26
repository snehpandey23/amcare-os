# Editorial folder naming (locked 2026-07-22)

## Format

```text
CONDITION-YYYY-MM-DD-slug
```

| Part | Rule | Examples |
|------|------|----------|
| **CONDITION** | Uppercase clinical bucket | `ADHD` `FEMALE` `MALE` `OBESITY` `PCP` `DERM` `ENDO` `SLEEP` `DEPRESSION` `LONGEVITY` `BRAND` |
| **YYYY-MM-DD** | Date pack was created | `2026-07-21` |
| **slug** | Short lowercase topic (hyphens) | `iron-fog` `semaglutide` `midlife-coping` |

**Examples**

- `ADHD-2026-07-21-iron-fog`
- `FEMALE-2026-07-20-midlife-coping`
- `MALE-2026-07-21-trt-habits`
- `OBESITY-2026-07-21-semaglutide`
- `PCP-2026-07-21-telehealth-rx`

Do **not** use opaque codes (`AD-I-01`, `WH-R-02`) for new packs.

## Condition buckets

| CONDITION | Use for |
|-----------|---------|
| ADHD | Adult ADHD, screening, stimulants/non-stimulants, women ADHD |
| FEMALE | Midlife, perimenopause, women’s hormones (non-ADHD primary) |
| MALE | TRT, ED, men’s longevity |
| OBESITY | GLP-1, metabolic weight loss, food noise |
| PCP | Telehealth access, safe online Rx, primary/urgent |
| DERM | Hair / skin (minoxidil, etc.) |
| ENDO | Endocrine topics not covered by MALE/FEMALE |
| SLEEP | Insomnia, Ambien, sleep apnea education packs |
| DEPRESSION | Mood / depression primary |
| LONGEVITY | Peptides, glutathione, anti-aging literacy |
| BRAND | Banners, founder LI visuals, non-clinical brand |

## Paths

| Surface | Path |
|---------|------|
| Git (source) | `apps/siya-health/brand/editorial-packs/[NAME]/` |
| Git statics | `apps/siya-health/brand/06-Statics/[NAME]/` |
| WorkDrive carousels | `05-Carousels/[NAME]/` |
| WorkDrive statics | `06-Statics/[NAME]/` |

Tracker **Insight ID** column = folder name (same string).

## Legacy map (old → new)

See `FOLDER-MAP.csv`.
