# Siya Entity Registry (practice-wide)

```text
Status: Seeded 2026-07-26 · expands ADHD-ENTITY-REGISTRY.md
Rule: One important concept → one canonical definition and owner
ADHD-specific detail remains in docs/ADHD-ENTITY-REGISTRY.md
```

## Page classes

| Class | Role |
|-------|------|
| Pillar | Broad entity owner |
| Hub | Index / routing (geo or topic family) |
| Supporting Answer / FAQ | Concise; defers upward |
| Tool | Recognition → education → consult (not diagnosis) |
| Labs spoke | Educational marker page |
| Service | Conversion destination |

Every new URL declares: **entity owned · parent · children · inbound · outbound · commercial target**.

---

## Registry (seed)

| Entity | Canonical Owner | Status | Parent | Children / Related | Service | Labs | Tool |
|--------|-----------------|--------|--------|--------------------|---------|------|------|
| Virtual primary care | `/primary-urgent-care` (national) · `/primary-care-california` (CA hub — planned) | Build | — | Fatigue, ADHD, Preventive, Labs | `/primary-urgent-care` | `/labs` | — |
| Adult ADHD | `/blog/how-to-know-if-you-have-adhd-adult` | Complete | VPC | Women, ED, vs anxiety/burnout | `/adhd-care` | `/labs/adhd-support` | `/adhd-screening` |
| Adult ADHD California | `/adult-adhd-california` (planned) | Build | Adult ADHD | CA cities, telehealth CA, meds CA | `/adhd-care` | — | `/adult-adhd-screening-california` |
| Executive dysfunction | `/blog/executive-dysfunction-adhd` | Complete | Adult ADHD | Time blindness, WM*, decision fatigue* | `/adhd-care` | — | Checklist (planned) |
| Fatigue | Planned `/fatigue` or elevated guide | Build | VPC | Brain fog, iron, thyroid, sleep apnea | `/primary-urgent-care` | `/labs/fatigue-brain-fog` | Fatigue assessment (M2) |
| Brain fog | Under Fatigue | Build | Fatigue | Iron, thyroid, ADHD, peri | PC / ADHD | Partial | — |
| Iron deficiency | `/labs/iron-ferritin` + Fatigue spoke | Improve | Fatigue | Ferritin vs Hb | PC | `/labs/iron-ferritin` | — |
| Thyroid | `/labs/thyroid` + decision guide | Improve | Fatigue / PC | TSH, Free T4 | PC | `/labs/thyroid` | — |
| Perimenopause / midlife | `/womens-midlife-health` | Improve | VPC / Women’s | Peri fog, anxiety, ADHD+peri | `/womens-health` | `/labs/womens-midlife` | Peri tracker (M2) |
| ADHD + Perimenopause | Planned spoke | Build | Women ADHD + Midlife | — | `/adhd-care` | Partial | — |
| Testosterone / men’s | `/mens-health-longevity` | Improve | VPC | TRT FAQs | same | `/labs/mens-health` | — |
| Preventive care | `/preventive-care` (planned) · `/labs/preventive` interim | Greenfield | VPC | By age, women, men | PC | `/labs/preventive` | Checklist (M3) |
| Metabolic / GLP-1 | `/weight-loss-metabolic-health` | Complete | VPC | Food noise, insulin | same | A1c labs | — |
| Labs (education) | `/labs` | Improve | VPC | Marker spokes | PC | Hub | — |
| Health Guides | `/answers` | Improve | — | All FAQ entities | Multiple | — | Search |
| Health Tools | `/health-tools` (planned) | Greenfield | — | ASRS, fatigue, peri, ED, preventive | Multiple | — | Hub |
| Virtual care / telehealth | `/telehealth` | Complete | VPC | What telehealth treats | same | — | — |

\* = missing spokes still listed in ADHD registry.

## Related docs
- `docs/ADHD-ENTITY-REGISTRY.md` — ADHD graph detail  
- `docs/KNOWLEDGE-GRAPH-AUDIT.csv` — completeness scoreboard  
- `docs/Q3-2026-CA-KNOWLEDGE-AUTHORITY-BOARD.md` — Q3 sequencing  
