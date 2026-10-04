# Siya Health Pitch Deck Audit — 2026-10

**Audit date:** 2026-10-03  
**Branch audited:** `employer-demo-journey-prod` @ `db1e1344`  
**Scope:** Read-only. No decks, pages, or code were edited.  
**Rule:** Unverified items marked **NOT FOUND** — no invented numbers, dates, or feedback.

---

## Executive summary

1. **In the git repo,** only **V8** (and V8 OpenVC variants) exist as binary decks under `apps/siya-health/brand/investor/Investor Deck/`, plus `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`. They were tracked in a single commit dated **2026-09-01**.
2. **V1** as a labeled deck file: **NOT FOUND** in repo or WorkDrive Seed Round tree.
3. **V3–V7** narratives and PPTX exist primarily under **WorkDrive** `Common Folder/Seed Round/` (not fully mirrored as versioned git history for each version).
4. **Current deck for diligence:** `Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01` (**16 slides**, ask **$500,000**). Positioning: physician-led telehealth + concierge follow-through; ADHD anecdote on title; controlled-substance compliance quote on founders slide.
5. **Revenue conflict:** V8 LOCKED chart uses Jan–Jul **$23k–$60k**; WorkDrive `Notes/FINANCIALS-SNAPSHOT.md` (2026-08-01) and V8 placeholder chart use founder-confirmed **$33k–$92k**. All revenue figures need re-verification after any payment reconciliation.
6. **External investor feedback files** (OpenVC/YC written reviews): **NOT FOUND**. Internal founder-review notes exist (V4 Version B change log; V3.2 “learn from meetings”).
7. **Last ~60 days:** major employer/demo/guides/homepage repositioning to “busy professionals”; California pilot page **removed**; `/employers/demo` **noindex**; no new investor deck version after 2026-09-01 LOCKED.
8. **Employer pages do not claim** a signed pilot, LOI, or Siya outcomes — research cites are third-party; demo outcomes slide says “coming soon.”
9. **Deck vs site today:** deck still ADHD-anecdote / controlled-substance / SiyaOS-era language residue in older versions; live site leads with integrated care for busy professionals and five guides.
10. **No V9** deck file found.

---

## PART 1 — Deck version history

### 1.1 Inventory of paths

#### A) In git repo (tracked)

| Path | Notes |
|------|--------|
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pdf` | Current locked PDF (16 slides) |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pptx` | Matching PPTX |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC.pdf` / `.pptx` | Same lineage |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — TITLE 2026-09-01.pdf` / `.pptx` | Title variant |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — ANECDOTE 2026-08-19.pdf` / `.pptx` | Intermediate |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — FLOWCHART 2026-08-02.pdf` / `.pptx` | Intermediate |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — PRODUCT-REFRAME 2026-08-02.pdf` / `.pptx` | Intermediate |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — locked 2026-08-02.pdf` / `.pptx` | Earlier lock |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — Version V8 (placeholder).pptx` | 9-slide informal V8 |
| `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck.pptx` | Copy of placeholder (same size) |
| `apps/siya-health/brand/investor/Investor Deck/V8-OpenVC-slide-02-ANECDOTE-proof.png` | Proof asset |
| `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md` | Markdown outline of 9-slide V8 |

**Git history for investor folder:** one relevant commit found:

| Hash | Date | Message |
|------|------|---------|
| `c1d3f5a3` | 2026-09-01 | Track deployed website, lead APIs, Guide callback, and staff portal work. |

Per-version `git blame` across V3–V7 binaries: **NOT FOUND** in repo (those files are not in git).

**Deck-related routes in site app:** **NOT FOUND** (no `/pitch` or `/investor` HTML route under `apps/siya-health`).

#### B) WorkDrive (accessible on this machine; not git-versioned as a full V1→V8 series)

Base:  
`~/Library/CloudStorage/ZohoWorkDriveTrueSync-AmcareMedicalConsultancyIndiaPvtLtd/Common Folder/Seed Round/`

| Path | Role |
|------|------|
| `Narrative/SEED-DECK-OUTLINE.md` | Outline (2026-07-24) |
| `Narrative/SEED-DECK-NARRATIVE.md` | Early narrative |
| `Narrative/SEED-DECK-V3-NARRATIVE.md` | V3 |
| `Narrative/SEED-DECK-V3.1-NARRATIVE.md` | V3.1 |
| `Narrative/SEED-DECK-V3.2-FROZEN.md` | V3.2 frozen |
| `Narrative/SEED-DECK-V5-ADHD-FIRST-YC-DRAFT.md` | V5 (superseded) |
| `Narrative/SEED-DECK-V6-SIYAOS.md` | V6 narrative |
| `Narrative/SEED-DECK-V7.md` | V7 narrative |
| `Narrative/FINANCIALS-SNAPSHOT.md` | Narrative financials |
| `Notes/FINANCIALS-SNAPSHOT.md` | Founder-confirmed monthly table (2026-08-01) |
| `Notes/SEED-DECK-V4-VERSION-B.md` | V4 Version B change log |
| `Notes/VERSION-A-SPEAKER-NOTES.md` / `VERSION-B-SPEAKER-NOTES.md` | Speaker notes |
| `Deck/Siya Health Seed Deck — Version A.pptx` / `.pdf` | 17 slides |
| `Deck/Siya Health Seed Deck — Version B.pptx` / `.pdf` | 17 slides |
| `Deck/Siya Health Seed Deck — Version V6.pptx` | 13 slides |
| `Deck/Siya Health Seed Deck — Version V7.pptx` | 14 slides |
| `Deck/Siya Health Seed Deck — Version V8 (placeholder).pptx` | 9 slides |
| `Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pdf` / `.pptx` | Same as repo current |
| `Deck/build_deck.py`, `build_deck_v6.py`, `build_deck_v7.py`, `build_deck_v8.py`, `build_deck_v8_openvc.py` | Generators |
| `Deck/README.md` | Early 19-slide outline |

**V1 / V2 labeled files:** **NOT FOUND**.

---

### 1.2 Version-by-version reports

#### V1 / V2

**NOT FOUND** (no files titled V1 or V2).

---

#### Outline / pre-V3 (`SEED-DECK-OUTLINE.md`) — WorkDrive

| Field | Value |
|-------|--------|
| Date (file mtime / header) | Header: 2026-07-24 |
| Path | WorkDrive `Seed Round/Narrative/SEED-DECK-OUTLINE.md` |
| Git date | NOT FOUND (not in git) |
| Slides | Outline for ~15+ main narrative + appendices (not a frozen PPTX count) |
| Narrative | “From Medical Practice to Software Company”; ADHD care → learning → protocols → software |
| Ask | $500,000 Seed |
| Numbers in outline | Ask $500k; other metrics deferred to appendix / later |
| Use of funds | Outcomes table direction (not fully locked in this file) |
| Δ from previous | States gaps vs “prior builds” (weak investment story, pie-chart funds, etc.) |

---

#### V3 / V3.1 / V3.2 — WorkDrive narratives

| Version | Path | Status in file | Ask | Narrative |
|---------|------|----------------|-----|-----------|
| V3 | `SEED-DECK-V3-NARRATIVE.md` | Locked for review | $500,000 | Physician-built; learned ADHD care before software |
| V3.1 | `SEED-DECK-V3.1-NARRATIVE.md` | Superseded by V3.2 | NOT re-read fully for every slide here | Same lineage |
| V3.2 | `SEED-DECK-V3.2-FROZEN.md` | **FROZEN** for fundraising | $500,000 | Same one-sentence; A/B/C meeting discipline |

**V3.2 language lock (used later by V8 placeholder):** prefer practice/workflow/protocol; avoid operating system / infrastructure / care engine / “platform theater.”

**Slide-by-slide for V3.2 PPTX:** Version A/B PPTX (below) implement the frozen narrative; V3.2 md itself is narrative + process, not a full 16-slide dump.

---

#### Version A / Version B (V4 era PPTX) — WorkDrive `Deck/`

| Field | Version A | Version B |
|-------|-----------|-----------|
| Path | `…/Deck/Siya Health Seed Deck — Version A.pptx` (+ PDF) | `…/Version B.pptx` (+ PDF) |
| Disk date | 2026-07-25 (file mtime) | 2026-07-25 |
| Git | NOT FOUND | NOT FOUND |
| Slide count | **17** | **17** |
| Title framing | “From Medical Practice to Software Company” / “We started with patients. Not software.” | “Scaling the way we practice medicine” |
| Narrative | ADHD care across four states; software after practice learning | Same arc; **explicitly not** “building a software company” (per Notes) |
| Ask / funds | Exact ask on every slide: extract incomplete for full 17; Notes say revenue **$350k+ last 6 months** | Same Notes guidance |
| Δ A→B | Documented in `Notes/SEED-DECK-V4-VERSION-B.md` (kicker, builder language, no-show call-back, capacity wording, founder quote, MSO footer, timeline 6–12 mo employer pilot, close language) |

**Numbers (from Notes tied to Version B, 2026-07-25 / updated 2026-08-01):**  
$350k+ gross last 6 months; 2,000+ patients; 1,000+ ADHD evaluations; 150+ recurring; ~100 new patients/month; 600+ reviews 4.8★; 4 states; cash-flow positive.  
**⚠ Notes later corrected** “$350k+ last 6 months” as unsupported vs books ($345.4k Feb–Jul).

---

#### V5 — WorkDrive narrative only

| Field | Value |
|-------|--------|
| Path | `Narrative/SEED-DECK-V5-ADHD-FIRST-YC-DRAFT.md` |
| Status | **SUPERSEDED by V6 (2026-07-27)** |
| PPTX labeled V5 | **NOT FOUND** |
| Narrative | Pivot to “clinical intelligence layer for ADHD”; “operating system for ADHD”; YC partner one-liner |
| Ask | NOT stated as a single locked ask in the header block reviewed |
| Why superseded | File states superseded by V6; bans “intelligence layer” naming going forward |

---

#### V6 — SiyaOS (WorkDrive PPTX + narrative)

| Field | Value |
|-------|--------|
| Paths | `Narrative/SEED-DECK-V6-SIYAOS.md`; `Deck/Siya Health Seed Deck — Version V6.pptx` |
| Dates | Narrative status 2026-07-27; PPTX disk mtime ~2026-07-27 |
| Git | NOT FOUND for PPTX |
| Slides | **13** |
| Narrative | **SiyaOS — clinical operating system for longitudinal ADHD care.** Practice → workflows → software |
| Ask | **$500,000** Seed (slide 13) |
| Use of funds (slide 13) | Deepen SiyaOS; Prove leverage (clinician capacity); Design partners; Product execution / technical hire track |
| Numbers (slide 1/5) | 2,000+ patients; 1,000+ ADHD evaluations; **$350k+** gross last 6 months; 150+ recurring; 600+ 4.8★; 4 states CA·TX·PA·FL; cash-flow+ |
| Market | ~$2.9B SAM care; ~$0.2B software; not summed |
| Δ from V5 | Replaces “intelligence layer” with SiyaOS / clinical OS; ADHD remains product wedge |

Also referenced in-repo: `docs/siyaos-knowledge-base/SIYA-EXECUTIVE-STATE-2026-08.md` (V6 13 slides filed to WorkDrive + Desktop).

---

#### V7 — Platform rewrite (WorkDrive)

| Field | Value |
|-------|--------|
| Paths | `Narrative/SEED-DECK-V7.md`; `Deck/Siya Health Seed Deck — Version V7.pptx` |
| Dates | Narrative DRAFT 2026-07-30; status SUPERSEDED by V8 placeholder 2026-08-01; PPTX disk ~2026-07-30 |
| Slides | **14** |
| Narrative | **“Next generation of clinician-led healthcare companies”**; ADHD = beachhead not identity; **platform** layers (care + ops + longitudinal + SiyaOS + commercial) |
| Ask | **$1,000,000** Seed |
| Use of funds (slide 12) | Three engines: Product & Engineering; Commercial Growth (employer/B2B); Clinical Scale |
| Numbers | Same traction strip as V6 pattern: 2,000+; 1,000+ ADHD evals; **$350k+** last 6 months; ~100 new/mo; 150+; 600+ 4.8★; 4 states |
| Δ from V6 | Ask $500k → **$1M**; broader platform thesis; employer/B2B in funds; language uses **platform / operating systems / infrastructure** |

---

#### V8 Placeholder (9 slides) — in repo + WorkDrive

| Field | Value |
|-------|--------|
| Paths | `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`; `…/Version V8 (placeholder).pptx` (repo + WorkDrive) |
| Dates | Placeholder status **2026-08-01**; git track **2026-09-01** |
| Slides | **9** |
| Narrative | Honest practice story; **rejects** OS/platform theater (V3.2 locks); ADHD + primary care telehealth |
| Ask | **$500,000** |
| Use of funds | (1) Clinical capacity & redundancy (2) Scale proven acquisition (TX→CA) (3) Working capital — **excludes** tech platform & B2B (undecided per executive state) |
| Numbers (slide 4 / md) | 2,000+ patients; 1,000+ ADHD evals; 150+ members; 600+ 4.8★; 4 states; cash-flow+; monthly chart **Jan $33k … Jul $92k** (founder-confirmed 2026-08-01 per md) |
| Δ from V7 | Ask back to $500k; drop platform/$1M thesis; exclude tech/B2B from funds; restore practice-first language |

---

#### V8 OpenVC LOCKED 2026-09-01 — **CURRENT** (in repo)

| Field | Value |
|-------|--------|
| Path | `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pdf` (+ `.pptx`) |
| Git date | 2026-09-01 (`c1d3f5a3`) |
| Builder | WorkDrive `Deck/build_deck_v8_openvc.py` (“locked 16-slide outline, 2026-09-01”) |
| Slides | **16** |

**Slide-by-slide outline**

| # | Title / focus | One-line summary |
|---|---------------|------------------|
| 1 | Title / anecdote | Medical-school ADHD friend story; physician-led telehealth; care before/after visit |
| 2 | The problem | Care plan fails in follow-through across pre / at / post visit |
| 3 | Pre-visit | Eligibility + reminders; concierge fix |
| 4 | At the visit | Admin burden; intake + live scribe |
| 5 | Post-visit | Pharmacy + follow-up; people/protocols first, then encode tech |
| 6 | Traction | Patients, evals, states, cash-flow+, revenue chart, reviews, no-shows note, retention placeholder |
| 7 | Where we are, honestly | Proof / risk / fix — fractional COO Sept 2026; capacity this round |
| 8 | Business model | $149 eval; $79 / $149 mo; 150+ members; MSO structure |
| 9 | Market — bottom-up | 21.7M SAM people; TAM ~$18B; SOM ~$3.8–4.8M |
| 10 | Competition | vs employer MH platforms, EAPs, DTC apps |
| 11 | Go-to-market | Channels + ~$80 CAC estimate; COO; capacity; vendor CAC ~6 mo |
| 12 | Why now | Working professionals; longitudinal screening thesis |
| 13 | Use of funds | $500k → ~$300k / ~$100k / ~$100k |
| 14 | Founders | Sneh + Swati; controlled-substance compliance quote |
| 15 | Close | Seed $500,000 |
| 16 | Contact | chiefservant@siya.health · siya.health |

**Core narrative:** Concierge follow-through practice (not “SiyaOS product deck”). ADHD appears in title anecdote and market (ADHD + insomnia); controlled-substance discipline on founders slide.

**Numbers (with slide)**

| Number | Slide |
|--------|-------|
| 2,700+ patients treated | 6, 7, 14 |
| 1,200+ neurocognitive evaluations | 6 |
| 4 states | 6 |
| Cash-flow positive / Cash-flow+ | 6, 14 |
| Monthly gross revenue chart: Jan **23**, Feb **21**, Mar **30**, Apr **27**, May **35**, Jun **51**, Jul **60** (labeled “Monthly gross revenue — 2026”; values in builder as 23_000…60_000) | 6 |
| Google 4.9★ (100+ reviews); 4.75★ avg across 600+ third-party provider reviews | 6 |
| No-shows: declining Q4 2025–Q1/Q2 2026, now plateaued | 6 |
| Retention: **placeholder** (“pending final team calculation”) | 6 |
| $149 / $79/mo / $149/mo | 8 |
| 150+ recurring members | 8 |
| 21.7M working adults (SAM people); TAM ~$18B; SOM ~$3.8M–4.8M; 163M employed; 15.5M ADHD; 8 providers IC network | 9 |
| ~$80 CAC estimate (not mature/audited) | 11 |
| Fractional COO since Sept 2026 | 7, 11, 13 |
| 10,000+ patient encounters (Dr. Sneh) | 14 |
| Seed **$500,000** | 13, 15 |
| Use of funds ~$300k clinical / ~$100k leadership / ~$100k marketing | 13 |
| 18–24 month runway (COO retainer) | 13 |

**Ask / use of funds:** $500k — clinical capacity & retention ~$300k; leadership ~$100k; professional marketing ~$100k.

**Δ from V8 placeholder / V7:** Expanded to 16-slide OpenVC structure; traction patients 2,000→**2,700+**, evals 1,000→**1,200+** neurocognitive; revenue chart values **differ** from Aug-01 founder-confirmed table; funds include COO + marketing partner (vs placeholder’s TX→CA acquisition + working capital); employer/B2B appears as pipeline via COO (not excluded).

**Intermediate V8 OpenVC filenames (ANECDOTE / FLOWCHART / PRODUCT-REFRAME / TITLE / PUSH):** present in repo; treated as iterative builds toward LOCKED 2026-09-01. Full slide-diff matrix across every intermediate: **NOT FOUND** as a written changelog (only filenames + builder header).

---

### 1.3 Feedback inventory

| Feedback source | What it says | Addressed later? |
|-----------------|--------------|------------------|
| `Notes/SEED-DECK-V4-VERSION-B.md` | Founder review 2026-07-25: list of A→B slide changes (arrogant quote, capacity clarity, etc.) | **Yes** — Version B PPTX |
| `SEED-DECK-V3.2-FROZEN.md` | Stop polishing; learn from investor conversations; A/B/C discipline | Process note — not a specific external letter |
| `SEED-DECK-V5-…md` | Self-critique of V4 “not a software company” | **Yes** — V6 SiyaOS rewrite (then V7/V8 moved again) |
| `SEED-DECK-V7.md` status | Superseded by V8 placeholder 2026-08-01 | **Yes** — V8 |
| `SEED-DECK-V8-PLACEHOLDER.md` checklist | Spot-check stats; confirm $500k ask | Checklist items not marked done for spot-check |
| `Notes/FINANCIALS-SNAPSHOT.md` | Corrects “$350k+ last 6 months” | Partially — V8 placeholder uses $378k YTD / monthly table; **LOCKED V8 chart uses different monthly series** |
| Written OpenVC / YC partner feedback file | — | **NOT FOUND** |
| Email/export of investor comments in repo | — | **NOT FOUND** |

**Never addressed (from available docs):** External written feedback — **NOT FOUND**, so cannot mark “never addressed.”  
**Open tension:** Aug-01 founder-confirmed monthly revenue vs Sep-01 LOCKED chart values — not reconciled in a found doc.

---

## PART 2 — Recent changes (~last 60 days: since 2026-08-04)

Focus: company story surfaces. Dates = file mtime on this branch unless noted from `git log`.

| Item | Path / route | Last modified (file / git) | Content summary | Live status |
|------|--------------|----------------------------|-----------------|-------------|
| Employers page | `apps/siya-health/employers.html` → `/employers` | 2026-10-03; in sitemap lastmod 2026-09-27 | “Care for busy professionals”; 2,700+ patients; 4 states; research cards (third-party); inquiry CTA; **no published rates** | **Live + indexed** (`index,follow`; in `sitemap.xml`) |
| `/employers/california-pilot` | HTML **removed**; `docs/EMPLOYER-CA-PILOT.md`; redirect in `vercel.json` / `data/redirect-map.mjs` | Doc states removed 2026-09-30 | Was pilot pitch with rates; rates withdrawn | **Redirect → `/employers`** (not a live pilot page) |
| Employer demo | `employers/demo.html` → `/employers/demo` | 2026-10-03; heavy git activity Sep 29–Oct 3 | Slideshow tour for employers; outcomes “coming soon” | **Live, unlisted/noindex** (`noindex,nofollow`; vercel rewrite; handoff: unlinked) |
| Employer demo prototype | `internal/employer-demo-prototype.html` | 2026-10-03 | Design SoT for demo | **Draft / internal** (not a public product route) |
| Demo handoff | `internal/EMPLOYER_DEMO_HANDOFF.md` | 2026-10-03 | Eng process; no HeyGen as product body | Doc only |
| University pilot draft | `internal/university-pilot-draft.html` → `/internal/university-pilot-draft` | 2026-10-03 | University/college partnership concept | **Draft only** (`noindex`; not in sitemap) |
| Homepage repositioning | `index.html` | 2026-10-03; identity commit 2026-09-27 `01cf239a` | “Integrated Care for Busy Professionals”; CA/TX/PA/FL | **Live + indexed** |
| About | `about.html` | 2026-10-03 | Busy-professionals narrative | **Live + indexed** |
| Five guides | `guides/{exhausted,sleep,weight,hormonal-health,mental-health-and-adhd}.html` | 2026-10-03; published commit 2026-09-27 `53648e2a` | Pillar pages | **Live + indexed** (in sitemap) |
| Providers | `providers/index.html` + profile pages | 2026-10-03; sitemap lastmod 2026-09-27 | Roster; ADHD among services; NY **NOT** listed as licensed state on page text reviewed | **Live + indexed** |
| NY expansion materials | — | — | **NOT FOUND** as dedicated NY expansion deck/page in this audit window |
| HeyGen renders for employer demo | — | — | **NOT FOUND** as employer-demo HeyGen assets; handoff says design outside repo; brand has older ADHD HeyGen archive unrelated |
| Investor deck updates post-LOCKED | — | Last git track 2026-09-01 | No newer locked deck version found | Current deck still V8 OpenVC LOCKED 2026-09-01 |
| Pricing/capacity employer rates | Retired with CA pilot | 2026-09-30 `b36b9d32` “Retire the employer pilot rates…” | No published PEPM on site | N/A |

**Other story-relevant git themes (Sep–Oct):** homepage2 visual migration; provider roster refresh; employer research cards replacing sample charts; demo music/tour/phone QA; merge activity on `employer-demo-journey-prod`.

---

## PART 3 — Claims audit

### 3.1 CURRENT deck (V8 OpenVC LOCKED 2026-09-01)

| Claim | Where | Source in repo / WorkDrive | Status |
|-------|-------|----------------------------|--------|
| 2,700+ patients treated | Slides 6,7,14 | Stated in deck; no primary data extract in repo | **UNVERIFIED** |
| 1,200+ neurocognitive evaluations | Slide 6 | Stated in deck | **UNVERIFIED** |
| 4 states / multi-state ops | Slides 1,6 | Consistent with site (CA/TX/PA/FL) | **UNVERIFIED** as count from clinical DB; **aligned** with site copy |
| Cash-flow positive | Slides 6,14 | Qualitative in FINANCIALS notes | **UNVERIFIED** (notes say prove in data room) |
| Monthly gross revenue Jan–Jul = 23/21/30/27/35/51/60 ($k) | Slide 6; `build_deck_v8_openvc.py` REVENUE dict | Conflicts with `Notes/FINANCIALS-SNAPSHOT.md` founder-confirmed 33/30/44/46.7/57/75.7/92 | **UNVERIFIED — NEEDS RE-VERIFICATION** (all monthly/YTD) |
| Google 4.9★ (100+); 4.75★ / 600+ third-party | Slide 6 | NOT FOUND primary export in repo | **UNVERIFIED** |
| No-show declining then plateaued | Slide 6 | Qualitative | **UNVERIFIED** |
| Retention 3-month cohort | Slide 6 | Explicit placeholder text | **PLACEHOLDER** |
| $149 / $79 / $149 membership | Slide 8 | Matches executive state pricing | **UNVERIFIED** vs live billing system; **aligned** with `SIYA-EXECUTIVE-STATE-2026-08.md` |
| 150+ recurring members | Slide 8 | Stated | **UNVERIFIED** |
| MSO + PC structure “legally reviewed” | Slide 8 | Stated | **UNVERIFIED** |
| B2B/employer pricing being finalized | Slide 8 | Stated; site says no published rate | **UNVERIFIED** (no signed terms found) |
| Market TAM ~$18B; SAM ~21.7M people; SOM ~$3.8–4.8M | Slide 9 | Methodology claimed in diligence; ADHD-MARKET-SIZING note on WorkDrive | **UNVERIFIED** in this audit (not recomputed) |
| ~$80 CAC estimate | Slide 11 | Deck says not mature/audited | **UNVERIFIED** / self-flagged |
| Fractional COO since Sept 2026 | Slides 7,11,13 | Stated | **UNVERIFIED** (no HR/contract file found in repo) |
| Raising $500k; ~$300k/~$100k/~$100k | Slides 13,15 | Deck | Ask is a fundraising statement — not a “data” claim |
| 10,000+ encounters (Dr. Sneh) | Slide 14 | Stated | **UNVERIFIED** |
| Controlled-substance compliance practices (pill counts, screens) | Slide 14 | Founder quote on slide | Narrative/policy claim — **UNVERIFIED** against SOP files in this pass |
| Signed pilot / LOI / employer customer | — | **NOT FOUND** on deck | N/A |
| “Platform” / “OS” / “tech company” as company identity | Mild: “technology we build ourselves” (slide 5); competition names “platforms” | Not primary thesis on LOCKED V8 | Soft flag — not SiyaOS headline |
| ADHD-first identity | Title ADHD anecdote; market ADHD+insomnia; founder controlled-substance quote | Present | **Flag:** conflicts with site “busy professionals / integrated care” lead |

### 3.2 Employer surfaces (`/employers`, `/employers/demo`)

| Claim | Where | Source | Status |
|-------|-------|--------|--------|
| 2,700+ patients treated | `/employers` hero/microcopy | Same as deck strip | **UNVERIFIED** |
| Licensed CA, TX, PA, FL | `/employers` | Site-wide | **UNVERIFIED** vs license docs; consistent |
| Research: 35 lost workdays; $4,336/worker; $90–118B; 44% vs 13% productivity | `/employers` research cards | PubMed/journal citations on page | **VERIFIED** as third-party cites (not Siya outcomes) |
| “None of them is Siya’s patient data” | `/employers` | Explicit disclaimer | Clarifies non-claim |
| No published employer rate | `/employers` + `EMPLOYER-CA-PILOT.md` | Docs | Process claim |
| Signed employer / LOI | — | **NOT FOUND** | Do not imply |
| Outcomes reported to employers | `/employers/demo` outcomes slide | “Clinical outcomes … coming soon” | **PLACEHOLDER** |
| ADHD and cognitive care as service tile | Demo | Marketing | Descriptive |
| Platform / software / OS framing on employers page | — | Page frames clinician care, not wellness app | Mostly avoided |
| California pilot live page | — | Removed; redirect | Do not claim live CA pilot page |

**All monthly/YTD revenue figures (deck + FINANCIALS notes):** flag for **re-verification** after any reconciliation that removed failed/refunded payments. Two incompatible monthly series already exist (Aug-01 notes vs Sep-01 LOCKED chart).

---

## PART 4 — Gap analysis: “What the current deck says vs. what is true in the repo today”

**Contradictions / tensions**

1. **Revenue chart (LOCKED V8)** vs **FINANCIALS-SNAPSHOT founder-confirmed (2026-08-01)** — different Jan–Jul series; both cannot be presented as current without reconciliation.
2. **Patients/evals:** V8 placeholder & V6/V7 used 2,000+ / 1,000+ ADHD evals; LOCKED V8 uses **2,700+** / **1,200+ neurocognitive** — no found data export explaining the step-up.
3. **Positioning:** LOCKED deck opens on **ADHD personal anecdote** + controlled-substance quote; live site (homepage, about, employers, guides) leads with **busy professionals / integrated care**. Older V6/V7 **SiyaOS / platform / OS** language is superseded in V8 LOCKED but still present in WorkDrive archives and executive-state docs.
4. **Use of funds:** V8 placeholder excluded B2B/tech; LOCKED V8 funds **COO + marketing vendor** and mentions employer/B2B pipeline — while site retired published employer pilot rates.
5. **Ask history:** V6 $500k → V7 **$1M** → V8 **$500k** — current is $500k; $1M deck is superseded but still on WorkDrive.

**Outdated slides / artifacts still around**

- V6/V7 PPTX and “platform / OS” narratives on WorkDrive (marked superseded).
- V8 placeholder 9-slide (older traction 2,000+ / $33–92k chart) still in repo beside LOCKED.
- California pilot page content retired; some older inventory docs still list the URL.

**New material not in any deck**

- Live `/employers` employer narrative + third-party research cards.
- `/employers/demo` interactive tour (noindex).
- Five `/guides/*` pillars and homepage2 “busy professionals” identity.
- University pilot **draft** (internal only).
- Fractional COO / employer pipeline story is on the deck; **demo and employers pages** are not reflected as a “product” in the LOCKED deck.
- Staff portal / Siya Assist maturity (executive state) — not in LOCKED V8 OpenVC narrative.

**No new deck structure or slide copy proposed** (per scope).

---

## Files read (complete list)

### Git repo
- `docs/siyaos-knowledge-base/SEED-DECK-V8-PLACEHOLDER.md`
- `docs/siyaos-knowledge-base/SIYA-EXECUTIVE-STATE-2026-08.md`
- `docs/COMPANY-PRODUCT-KNOWLEDGE-BRIEFING-2026-08-06.md` (grep/ref only)
- `docs/siyaos-knowledge-base/SIYA-ASSIST-STAFF-HANDOFF.md` (grep/ref)
- `docs/siyaos-knowledge-base/build-out-program/GAP-AUDIT.md` (grep/ref)
- `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pdf`
- `apps/siya-health/brand/investor/Investor Deck/Siya Health Seed Deck — V8 OpenVC — LOCKED 2026-09-01.pptx`
- `apps/siya-health/employers.html`
- `apps/siya-health/employers/demo.html` (claims/outcomes sections)
- `apps/siya-health/docs/EMPLOYER-CA-PILOT.md`
- `apps/siya-health/internal/EMPLOYER_DEMO_HANDOFF.md`
- `apps/siya-health/internal/university-pilot-draft.html` (header/robots)
- `apps/siya-health/internal/employer-demo-prototype.html` (title)
- `apps/siya-health/index.html` (busy professionals strings)
- `apps/siya-health/about.html` (title/h1)
- `apps/siya-health/guides/exhausted.html`, `sleep.html`, `weight.html`, `hormonal-health.html`, `mental-health-and-adhd.html` (titles/robots)
- `apps/siya-health/providers/index.html` (robots/ADHD tags)
- `apps/siya-health/sitemap.xml` (selected URLs)
- `apps/siya-health/vercel.json` (demo + california-pilot redirects)
- `apps/siya-health/data/redirect-map.mjs` (california-pilot)

### WorkDrive Seed Round (local TrueSync)
- `…/Seed Round/Deck/README.md`
- `…/Seed Round/Deck/build_deck_v8_openvc.py`
- `…/Seed Round/Deck/Siya Health Seed Deck — Version A.pptx` (text extract)
- `…/Seed Round/Deck/Siya Health Seed Deck — Version B.pptx` (text extract)
- `…/Seed Round/Deck/Siya Health Seed Deck — Version V6.pptx` (text extract)
- `…/Seed Round/Deck/Siya Health Seed Deck — Version V7.pptx` (text extract)
- `…/Seed Round/Deck/Siya Health Seed Deck — Version V8 (placeholder).pptx` (text extract)
- `…/Seed Round/Narrative/SEED-DECK-OUTLINE.md`
- `…/Seed Round/Narrative/SEED-DECK-V3-NARRATIVE.md` (header)
- `…/Seed Round/Narrative/SEED-DECK-V3.2-FROZEN.md` (header)
- `…/Seed Round/Narrative/SEED-DECK-V5-ADHD-FIRST-YC-DRAFT.md` (header)
- `…/Seed Round/Narrative/SEED-DECK-V6-SIYAOS.md`
- `…/Seed Round/Narrative/SEED-DECK-V7.md`
- `…/Seed Round/Narrative/FINANCIALS-SNAPSHOT.md`
- `…/Seed Round/Notes/FINANCIALS-SNAPSHOT.md`
- `…/Seed Round/Notes/SEED-DECK-V4-VERSION-B.md`

### Tools / git
- `git log` / `git ls-files` on `apps/siya-health/brand/investor/**`
- `git log --since=2026-08-04` on employers/guides/index/providers/investor paths
