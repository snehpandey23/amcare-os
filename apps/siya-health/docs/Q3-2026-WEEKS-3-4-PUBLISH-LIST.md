# Weeks 3–4 publish / hub / FAQ list (locked)

**Board:** `Q3-2026-CA-KNOWLEDGE-AUTHORITY-BOARD.md`  
**Cluster map:** `Q3-2026-CLUSTER-MAP.csv`  
**Rule:** Fatigue gets article volume; Primary Care + Women’s get hub/FAQ depth; ADHD gets CA hub structure.

---

## ADHD CA — one cornerstone (not two)

| # | Deliverable | Type |
|---|-------------|------|
| 1 | Build `/adult-adhd-california` with sections: symptoms, diagnosis, evaluation, treatment, medication, telehealth, cost, FAQs, CA licensing, cities, screening | Hub |
| 2 | Optional redirect: `/adhd-care-california` → `/adult-adhd-california` | Redirect |
| 3 | Re-link 7 city blogs + CA spokes **up** to this hub | Linking |
| 4 | Do **not** create separate diagnosis + treatment flagships | Decision locked |

**Do not publish new CA city pages until the cornerstone exists and links are fixed.**

---

## A · Fatigue — publish volume

| # | Working title | Path idea | Type |
|---|---------------|-----------|------|
| F1 | Why am I always tired? (Fatigue pillar) | `/fatigue` or elevated guide | Pillar |
| F2 | Could iron deficiency explain my fatigue / brain fog? | `/answers/…` | Decision guide |
| F3 | Should I get my thyroid checked? | `/answers/…` | Decision guide |
| F4 | Sleep apnea vs “just tired” — when to ask | Expand existing answer + links | Spoke |
| F5 | Burnout, depression, or ADHD? How to think about overlap | Editorial explorer (tool later) | Spoke |

Link each to: `/labs/fatigue-brain-fog`, `/primary-urgent-care`, `/adhd-care` where relevant. CA angle in intro/FAQ where honest (telehealth availability), not fake localization.

---

## B · Primary Care CA — hub + FAQs

| # | Deliverable | Path | Type |
|---|-------------|------|------|
| P1 | 15–25 FAQs + FAQPage on `/primary-urgent-care` | existing | FAQ/schema |
| P2 | Primary Care California hub | `/primary-care-california` | Hub |
| P3 | What can telehealth primary care treat? | blog or answer | Spoke |
| P4 | Can an online primary care visit order labs? | answer/FAQ | Spoke |

**City pages:** blocked until hub is useful.

Suggested FAQ themes for P1: online PCP, what telehealth treats, labs, refills, controlled substances limits, when to ER, CA licensing, membership vs visit, ADHD vs primary care handoff.

---

## C · Women’s Midlife — deepen

| # | Deliverable | Path idea | Type |
|---|-------------|-----------|------|
| W1 | Expand `/womens-midlife-health` FAQs to 15–25 | existing | FAQ |
| W2 | Perimenopause and ADHD (entity spoke) | `/answers/…` or blog | **Must ship** |
| W3 | Is this menopause or something else? | answer | FAQ |
| W4 | Why am I suddenly anxious in my 40s? | answer | FAQ |
| W5 | Why is my ADHD worse before my period? | answer | FAQ |

---

## Tech P0 (same window)

| Page | Action |
|------|--------|
| `adhd-care.html` | Add FAQPage JSON-LD from existing FAQ UI |
| `telehealth.html` | Same |
| `womens-health.html` | Same |
| `weight-loss-metabolic-health.html` | Same |
| `pricing.html` | Same |
| `primary-urgent-care.html` | Add FAQ UI **and** FAQPage |
| `mens-health-longevity.html` | Add FAQ UI **and** FAQPage |

---

## Gate (every URL)

Per `ADHD-CONTENT-ENGINE.md` / general quality bar:
1. Becomes definitive for a topic Siya must own, **or** strengthens a pillar/cluster  
2. Brief → outline → link map → medical checklist → draft  
3. Linking: 1 pillar · 2 blogs · 1 FAQ · 1 service · 1 local if live  
4. CTA by funnel (awareness → screening; trust → Meet & Greet; eval → `/adhd-care`)  
5. Tools/decision guides: **not a diagnosis** disclaimer  
