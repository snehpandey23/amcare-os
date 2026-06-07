# Provider Consistency Audit

**Generated:** 2026-06-07  
**Scope:** `apps/siya-health/` — all 7 contracted clinicians  
**Regenerate:** `node scripts/audit-provider-consistency.mjs` → `data/provider-consistency-audit.json`

### Canonical source hierarchy

| Priority | File | Use for |
|----------|------|---------|
| 1 | `data/internal-provider-records.mjs` | License states, NPI, board cert objects, credential status |
| 2 | `data/providers.mjs` (+ `providers-additional.mjs`) | Profile pages, schema, service rosters, homepage fields |
| 3 | `data/provider-hub-presentation.mjs` | **Founder-approved** hub cards, patient-facing role/focus/teaser |
| 4 | `scripts/generate-provider-pages.mjs` | Profile HTML output (must re-run after data fixes) |
| 5 | `scripts/site-chrome.mjs` | Homepage care team, service-page provider cards, ADHD tagline overrides |

When hub presentation and profile data conflict on **patient-facing copy**, prefer hub presentation unless clinically inaccurate.

---

## Executive summary

| Metric | Count |
|--------|------:|
| **Total provider mention lines** (sitewide grep) | **2,241** |
| **Unique files mentioning providers** | 53+ (HTML, data, docs, indexes) |
| **Automated inconsistency flags** | 173 |
| **Cross-cutting issues** | 8 |
| **Total tracked issues** | **181** |

### Mention lines by provider

| Provider | Lines |
|----------|------:|
| Dr. Sneh Pandey, MD | 584 |
| Dr. Natasha Desai, MD | 380 |
| Dr. Swati Pandey, MD | 289 |
| Derek Timbs, FNP-BC | 272 |
| Megan Wunderlich, FNP-C | 246 |
| Dr. Vanessa Urbina, MD | 236 |
| Wendy Delgado, PA-C | 234 |

### Inconsistency counts by type

| Type | Count | Severity mix |
|------|------:|--------------|
| **Role / title positioning** | 159 | 1 high (Swati), rest medium |
| **Licensed states display** | 10 | Mostly low (OH license-only); 3 Wendy state-card noise |
| **Credentials / titles** | 2 | Medium (Wendy PA title) |
| **Service positioning / roster** | 2 | **High** (About incomplete roster; Wendy ADHD scope) |
| **Bio / description drift** | 8 cross-cutting | Medium–high |
| **ADHD-CCSP formatting** | 1 cross-cutting | Low |

### Priority fixes (top 5)

1. **Remove or clinically confirm Wendy Delgado on ADHD care roster** — `SERVICE_PROVIDER_SLUGS['adhd-care']` and `ADHD_CARE_PROVIDER_TAGLINES` list her as “Adult ADHD & telehealth care” but her profile, clinical focus, and services are **weight-loss/GLP-1 only**. *Trust/legal risk if patients book ADHD expecting a weight-loss PA.*

2. **Align Wendy Delgado hub/homepage copy to weight-loss scope** — Hub presentation, homepage bio, and `/providers` index claim primary care + ADHD; profile says Physician Associate / medical weight loss only. Pick one clinical scope and propagate.

3. **Resolve Dr. Swati Pandey role split** — Profile: “Licensed Medical Provider — ADHD & Mental Health Care”; founder hub: “Internal Medicine Physician”. Hub card and homepage already use IM; profile page does not.

4. **Complete About page care team (3 of 7)** — `about.html` lists Sneh, Natasha, Swati only; omits Urbina, Megan, Derek, Wendy despite sitewide “7 providers” messaging.

5. **Standardize Wendy title: Physician Associate vs Physician Assistant** — Profile and NCCPA use “Physician Associate”; homepage, hub index, and `homepageRole` use “Physician Assistant”.

---

## Cross-cutting issues

### CC-01 · State name format (abbrev vs full)

| Surface | Format | Example |
|---------|--------|---------|
| Profile pages, `/providers` hub | Full names | California · Texas |
| Homepage, service cards | Abbreviations | CA, TX, PA, FL |
| `llms.txt` | Abbrev in parens | `(CA, TX, PA, FL)` |

**Fix:** Keep abbreviations on compact cards; use full names on profiles and hub. Add `title` tooltips on abbrev chips where missing.

---

### CC-02 · ADHD-CCSP credential formatting

Three variants appear sitewide:

- `ADHD-CCSP`
- `ADHD-CCSP (ADHD Clinical Services Provider Program)`
- `ADHD Clinical Services Provider Program (ADHD-CCSP)`

**Surfaces:** `providers/dr-sneh-pandey.html`, `providers/dr-natasha-desai.html`, `providers/dr-swati-pandey.html`, `adhd-care.html`, state ADHD landing pages.

**Canonical rule:** First mention per page → `ADHD-CCSP (ADHD Clinical Services Provider Program)`; subsequent → `ADHD-CCSP`.

**Replacement (sitewide template in `data/site-standards.mjs` if desired):**

```
find:  ADHD Clinical Services Provider Program (ADHD-CCSP)
replace: ADHD-CCSP (ADHD Clinical Services Provider Program)
```

---

### CC-03 · About page incomplete roster

| File | Current | Issue |
|------|---------|-------|
| `about.html` `#care-team` | 3 cards (Sneh, Natasha, Swati) | Missing Urbina, Megan, Derek, Wendy |
| `about.html` | Link: “View full care team (7 providers)” | Promises 7; section shows 3 |

**Fix:** Regenerate About care team from `getAllProviders()` (mirror homepage 7-card grid) or inject via `site-chrome.mjs`.

---

### CC-04 · “Board-certified” on mixed-clinician ADHD pages

State/geo ADHD landing pages (`adhd-diagnosis-*.html`, `adult-adhd-diagnosis.html`, etc.) use:

> “Board-certified, ADHD-CCSP trained providers…”

Rosters include **FNP-C** (Megan) and **PA-C** (Wendy on adhd-care). NPs/PAs are not board-certified physicians.

**Fix:**

```
find:  Board-certified, ADHD-CCSP trained providers
replace: Licensed, ADHD-CCSP–trained clinicians
```

Apply in shared copy block or `site-chrome.mjs` template for geo pages.

---

### CC-05 · Derek Timbs Ohio license on compact cards

| Surface | States shown | Service footprint |
|---------|--------------|-------------------|
| Profile `derek-timbs.html` | Texas + Ohio (OH marked license-only) | TX only |
| Homepage, telehealth, weight-loss, men's health cards | `data-states="TX,OH"` | TX only |

Profile explains OH is transparency-only; compact cards do not.

**Fix:** Apply `provider-state-chip--license-only` styling to OH on homepage/service cards (pattern exists in `generate-provider-pages.mjs`).

---

### CC-06 · homepageBio vs hub description drift

Several `homepageBio` fields in `providers.mjs` / `providers-additional.mjs` were written before hub presentation overlay. Homepage cards use `homepageBio`; `/providers` index uses hub `description`. They diverge for most providers.

**Fix:** Set `homepageBio = hub.description` for each slug, or generate homepage from hub overlay in `buildHomepageCareTeam()`.

---

### CC-07 · Physician Associate vs Physician Assistant (Wendy)

| Surface | Title |
|---------|-------|
| Profile, schema, internal records | Physician Associate |
| Homepage, hub index, `homepageRole`, `provider-hub-presentation.mjs` | Physician Assistant |

**Fix:** Use **Physician Associate** sitewide (NCCPA/modern PA terminology) unless legal counsel prefers legacy “Assistant.”

---

### CC-08 · Service-page ADHD tagline override includes Wendy

`scripts/site-chrome.mjs` → `ADHD_CARE_PROVIDER_TAGLINES`:

```javascript
'wendy-delgado': 'Adult ADHD & telehealth care',
```

Wendy is also in `SERVICE_PROVIDER_SLUGS['adhd-care']`. Profile scope is weight loss only.

**Fix (if Wendy does not provide ADHD care):**

```
file: data/providers.mjs
find:  'adhd-care': ['dr-sneh-pandey', 'dr-vanessa-urbina', 'dr-natasha-desai', 'dr-swati-pandey', 'megan-wunderlich', 'wendy-delgado'],
replace: 'adhd-care': ['dr-sneh-pandey', 'dr-vanessa-urbina', 'dr-natasha-desai', 'dr-swati-pandey', 'megan-wunderlich'],

file: scripts/site-chrome.mjs
find:  'wendy-delgado': 'Adult ADHD & telehealth care',
replace: (delete line)
```

Then re-run `node scripts/generate-provider-pages.mjs` and seo-build for service pages.

---

## Per-provider sections

---

### Dr. Sneh Pandey, MD

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Dr. Sneh Pandey, MD |
| **Role (hub / patient-facing)** | Medical Director · Internal Medicine Physician |
| **Role (profile / schema jobTitle)** | Medical Director |
| **Credentials** | MD; Board Certified Internal Medicine; Diplomate, American Board of Obesity Medicine; ADHD-CCSP |
| **Licensed states** | California, Texas, Pennsylvania, Florida (CA, TX, PA, FL) |
| **Focus areas** | Adult ADHD evaluations; obesity medicine & metabolic health; executive dysfunction; ADHD–weight overlap |
| **Hub description** | Dr. Pandey focuses on structured evaluations, personalized care plans, and helping patients understand how focus, weight, energy, and long-term health connect. |
| **Short bio (profile)** | I’m Dr. Sneh Pandey. I built Siya Health for adults who suspect ADHD… |

#### Key inconsistencies

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `data/providers.mjs` | `role` vs hub | `Medical Director` vs `Medical Director · Internal Medicine Physician` | Profile hero shows role only; hub adds IM |
| `about.html` | care-team h3 | `Dr. Sneh Pandey` (no MD) | Missing credential suffix |
| `adhd-care.html` | founder image | `dr-sneh-pandey-founder.png` | Different asset than profile/headshot |
| `index.html` / hub | `homepageBio` | Metabolic/weight/hormone/ADHD list | Differs from hub description tone |
| 12+ ADHD geo pages | boilerplate | “Board-certified, ADHD-CCSP trained providers” | OK for Sneh; misleading when page lists NPs |

#### Exact replacements

```
file: about.html
find:  <h3>Dr. Sneh Pandey</h3>
replace: <h3>Dr. Sneh Pandey, MD</h3>

file: data/providers.mjs
find:  role: 'Medical Director',
replace: role: 'Medical Director · Internal Medicine Physician',
(note: then regenerate profiles OR accept hub-only composite role)

file: adhd-care.html (optional visual consistency)
find:  dr-sneh-pandey-founder.png
replace: dr-sneh-pandey.png
(only if founder crop is not intentional)
```

---

### Dr. Vanessa Urbina, MD

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Dr. Vanessa Urbina, MD |
| **Role** | Family Medicine Physician |
| **Credentials** | MD; Family Medicine (ABFM); University of Miami MD 2007 |
| **Licensed states** | Florida (FL) |
| **Focus areas** | Primary care; family medicine; adult ADHD; medical weight loss & lifestyle medicine |
| **Hub description** | Dr. Urbina brings family medicine experience and runs her own comprehensive local practice. She supports patients through primary care, ADHD care, mental health concerns, and weight-management needs. |

#### Key inconsistencies

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `about.html` | care-team | **Not listed** | Omitted from About; present on homepage, hub, telehealth, weight-loss |
| `index.html` | `about-team-states` | `Licensed in FL` | Abbrev vs hub “Florida” — acceptable on cards |
| `data/providers-additional.mjs` | `homepageBio` | Primary care / ADHD / preventive | Shorter than hub description |
| Service cards | tagline | `Family medicine & ADHD (FL)` vs hub tags | Minor wording drift |

#### Exact replacements

```
file: about.html
action: Add care-team cards for Urbina, Megan, Derek, Wendy (or replace section with generated 7-card grid from site-chrome)

file: data/providers-additional.mjs
find:  homepageBio:
      'Experienced in primary care, preventive health, ADHD evaluation and treatment, and caring for patients across a wide range of everyday health concerns.',
replace: homepageBio:
      'Dr. Urbina brings family medicine experience and runs her own comprehensive local practice. She supports patients through primary care, ADHD care, mental health concerns, and weight-management needs.',
```

---

### Dr. Natasha Desai, MD

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Dr. Natasha Desai, MD |
| **Role (hub / patient-facing)** | Family Medicine Physician |
| **Role (profile / schema)** | Family & Behavioral Medicine Physician |
| **Credentials** | MD; Family & Behavioral Medicine; ADHD-CCSP |
| **Licensed states** | Texas, Florida (TX, FL) |
| **Focus areas** | Adult ADHD; behavioral health; anxiety & emotional regulation; family medicine |
| **Hub description** | Dr. Desai brings family medicine experience and ADHD-focused training, with a supportive approach for adults whose attention symptoms overlap with anxiety, stress, sleep, or emotional overwhelm. |

#### Key inconsistencies

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `data/providers.mjs` vs hub | `role` | `Family & Behavioral Medicine Physician` vs `Family Medicine Physician` | Profile more specific; hub simplified |
| `providers/index.html` | hub role | Family Medicine Physician | Matches hub, not profile hero |
| `about.html` | tagline | mentions **depression** | Not in hub focus list (anxiety yes) |
| `llms.txt` | one-liner | `Behavioral / ADHD (TX, FL)` | Abbrev role label |

#### Exact replacements

```
file: data/provider-hub-presentation.mjs  (if profile should match hub on cards)
find:  role: 'Family Medicine Physician',
replace: role: 'Family & Behavioral Medicine Physician',
(for dr-natasha-desai entry only — OR keep hub simple and change profile to match hub)

file: about.html
find:  Family medicine, adult ADHD, behavioral health, anxiety, depression, and supportive primary care.
replace: Family medicine, adult ADHD, behavioral health, anxiety, emotional regulation, and supportive primary care.
(align with hub focus; remove depression unless clinically confirmed for marketing)
```

---

### Dr. Swati Pandey, MD

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Dr. Swati Pandey, MD |
| **Role (hub / homepage — founder-approved)** | **Internal Medicine Physician** |
| **Role (profile today)** | Licensed Medical Provider — ADHD & Mental Health Care |
| **Credentials** | MD; ADHD-CCSP (ADHD Clinical Services Provider Program) |
| **Licensed states** | Pennsylvania (PA) |
| **Focus areas (hub)** | Primary care; women's health; mental health; adult ADHD & complex medication histories |
| **Hub description** | Dr. Swati Pandey supports adults seeking thoughtful primary care, with particular sensitivity to women's health, mood, focus, PCOS-related concerns, and long-term wellness. |

#### Key inconsistencies — **HIGH**

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `providers/dr-swati-pandey.html` | `provider-lp-role-line` | Licensed Medical Provider — ADHD & Mental Health Care | **Conflicts with hub IM Physician** |
| `data/internal-provider-records.mjs` | `role` override | Licensed Medical Provider — ADHD & Mental Health Care | Drives profile via merge |
| `index.html`, `providers/index.html` | `about-team-role` | Internal Medicine Physician | Matches hub ✓ |
| `data/providers.mjs` | `homepageRole` | Internal Medicine Physician | Matches hub ✓ |
| `data/providers.mjs` | `schema.jobTitle` | Licensed Medical Provider — ADHD & Mental Health Care | Schema matches profile, not hub |
| `llms.txt` | one-liner | `ADHD evaluation (PA)` | Omits IM / women's health positioning |

#### Exact replacements

```
file: data/internal-provider-records.mjs
find:  role: 'Licensed Medical Provider — ADHD & Mental Health Care',
replace: role: 'Internal Medicine Physician',

file: data/providers.mjs (dr-swati-pandey block)
find:  role: 'Licensed Medical Provider — ADHD & Mental Health Care',
replace: role: 'Internal Medicine Physician',

file: data/providers.mjs
find:  jobTitle: 'Licensed Medical Provider — ADHD & Mental Health Care',
replace: jobTitle: 'Internal Medicine Physician',

file: data/providers.mjs
find:  credentialChips: ['Licensed Medical Provider', 'ADHD-CCSP', 'Mental Health Care'],
replace: credentialChips: ['Internal Medicine', 'ADHD-CCSP', 'Mental Health Care'],
```

Then: `node scripts/generate-provider-pages.mjs`

---

### Megan Wunderlich, FNP-C

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Megan Wunderlich, FNP-C |
| **Role** | Family Nurse Practitioner |
| **Credentials** | MSN, APRN, FNP-C; AANP; Duquesne / Chatham / Carlow training |
| **Licensed states** | Pennsylvania (PA) |
| **Focus areas** | Primary care; telehealth; mental health; adult ADHD support |
| **Hub description** | Megan supports patients through telehealth visits for primary care, mental health concerns, and ADHD-related needs, working within Siya Health's physician-led care model. |
| **Supervision** | Practice under collaborative physician agreements per Pennsylvania law. |

#### Key inconsistencies

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `about.html` | care-team | **Not listed** | Same About gap as other non-featured three |
| `adhd-care.html` | tagline | `Adult ADHD & mental health · PA` | Consistent ✓ |
| Megan vs Swati on adhd-care | tagline | Both “Adult ADHD & mental health · PA” | Duplicate taglines; hard to differentiate |
| `data/providers-additional.mjs` | `homepageBio` | Primary care / telehealth / ADHD | Close to hub; minor wording drift |

#### Exact replacements

```
file: scripts/site-chrome.mjs
find:  'megan-wunderlich': 'Adult ADHD & mental health',
replace: 'megan-wunderlich': 'NP-led ADHD & mental health telehealth',

file: about.html
action: Include Megan in care-team grid (see CC-03)
```

---

### Derek Timbs, FNP-BC

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Derek Timbs, FNP-BC |
| **Role** | Family Nurse Practitioner |
| **Credentials** | MSN, FNP-BC |
| **Licensed states** | Texas, Ohio — **Siya telehealth service: Texas only** |
| **Focus areas** | Medical weight loss (GLP-1); men's health & hormone support; metabolic telehealth |
| **Hub description** | Derek brings experience in weight management, men's health, metabolic care, and lifestyle-focused wellness, with a practical approach to improving energy, body composition, and long-term health. |

#### Key inconsistencies

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `index.html` | `data-states` | TX,OH | OH not a Siya service state; no license-only badge |
| `telehealth.html`, `weight-loss-metabolic-health.html`, `mens-health-longevity.html` | cards | TX,OH | Same |
| `providers/derek-timbs.html` | trust card | Explains OH transparency | Profile correct ✓ |
| `llms.txt` | one-liner | `(TX)` only | Correctly omits OH ✓ |
| `about.html` | care-team | **Not listed** | About gap |

#### Exact replacements

```
file: scripts/site-chrome.mjs (buildHomepageCareTeam / service cards)
action: For states not in AVAILABLE_SERVICE_STATES, render with provider-state-chip--license-only class and title attribute (mirror generate-provider-pages.mjs)

file: about.html
action: Include Derek in care-team grid (see CC-03)
```

---

### Wendy Delgado, PA-C

#### Single source of truth

| Field | Canonical value |
|-------|-----------------|
| **Name** | Wendy Delgado, PA-C |
| **Role (profile / NCCPA)** | **Physician Associate** |
| **Role (hub/homepage today)** | Physician Assistant ← inconsistent |
| **Credentials** | PA-C; NCCPA Certified PA; Western University PA Program 2007–2009 |
| **Licensed states** | California (CA) |
| **Focus areas (profile — clinical truth)** | Medical weight loss; GLP-1 therapy; metabolic & lifestyle counseling |
| **Hub focus (today — overstated)** | Primary care; telehealth; **ADHD support**; medical weight loss |
| **Hub description (today)** | …primary care, **ADHD-related concerns**, and weight-management care… |

#### Key inconsistencies — **HIGH**

| File | Field | Current | Issue |
|------|-------|---------|-------|
| `data/providers.mjs` | `SERVICE_PROVIDER_SLUGS['adhd-care']` | includes `wendy-delgado` | ADHD service roster vs weight-only profile |
| `scripts/site-chrome.mjs` | ADHD tagline | Adult ADHD & telehealth care | Wrong specialty |
| `adhd-care.html` | provider card | Wendy listed with ADHD tagline | Misleading |
| `providers/index.html` | hub tags | Primary care, ADHD support | Overstates scope |
| `data/provider-hub-presentation.mjs` | focus + description | ADHD support | Conflicts with profile |
| `data/providers-additional.mjs` | `homepageBio` | ADHD care, preventive medicine | Conflicts with profile |
| `index.html` | `about-team-role` | Physician Assistant | Should be Physician Associate |
| `providers/wendy-delgado.html` | role | Physician Associate | Correct ✓ |

#### Exact replacements

```
file: data/provider-hub-presentation.mjs (wendy-delgado)
find:  role: 'Physician Assistant',
replace: role: 'Physician Associate',

find:  focus: ['Primary care', 'Telehealth', 'ADHD support', 'Medical weight loss'],
replace: focus: ['Medical weight loss', 'GLP-1 therapy', 'Metabolic telehealth', 'Telehealth'],

find:  description:
      "Wendy supports patients through telehealth visits for primary care, ADHD-related concerns, and weight-management care within Siya Health's physician-led model.",
replace: description:
      "Wendy supports California adults through telehealth medical weight-loss visits—with GLP-1 education, metabolic monitoring, and collaborative patient support under physician supervision.",

file: data/providers-additional.mjs
find:  homepageRole: 'Physician Assistant',
replace: homepageRole: 'Physician Associate',

find:  homepageBio:
      'Primary care and telehealth provider experienced in ADHD care, preventive medicine, and helping patients navigate both acute and ongoing health concerns.',
replace: homepageBio:
      'Wendy supports California adults through telehealth medical weight-loss visits—with GLP-1 education, metabolic monitoring, and collaborative patient support.',

file: data/providers.mjs
find:  'adhd-care': ['dr-sneh-pandey', 'dr-vanessa-urbina', 'dr-natasha-desai', 'dr-swati-pandey', 'megan-wunderlich', 'wendy-delgado'],
replace: 'adhd-care': ['dr-sneh-pandey', 'dr-vanessa-urbina', 'dr-natasha-desai', 'dr-swati-pandey', 'megan-wunderlich'],

file: scripts/site-chrome.mjs
find:  'wendy-delgado': 'Adult ADHD & telehealth care',
replace: (delete entire line from ADHD_CARE_PROVIDER_TAGLINES)
```

Then: regenerate provider index, adhd-care service block, homepage care team.

---

## All occurrences by surface (summary matrix)

| Surface | Files | Providers covered | Primary fields audited |
|---------|-------|-------------------|------------------------|
| **Data — canonical** | `providers.mjs`, `providers-additional.mjs`, `internal-provider-records.mjs`, `provider-hub-presentation.mjs` | All 7 | role, states, certs, bios, service rosters |
| **Profile pages** | `providers/*.html` (7) | Each own | role line, badges, states, bios, schema JSON-LD |
| **Provider hub** | `providers/index.html` | All 7 | hub presentation overlay |
| **Homepage care team** | `index.html` | All 7 | homepageRole, homepageBio, state chips |
| **About care team** | `about.html` | **3 only** | taglines (manual, no credentials on h3) |
| **ADHD care** | `adhd-care.html` | 6 (+ Wendy ⚠) | ADHD taglines, founder message (Sneh only) |
| **Telehealth** | `telehealth.html` | All 7 | servicePageTagline cards |
| **Weight loss** | `weight-loss-metabolic-health.html` | Sneh, Urbina, Derek, Wendy | servicePageTagline |
| **Men's health** | `mens-health-longevity.html` | Sneh, Derek | servicePageTagline |
| **Primary care** | `primary-urgent-care.html` | Urbina, Natasha, Sneh | servicePageTagline |
| **State ADHD landings** | `adhd-diagnosis-*.html`, `adult-adhd-diagnosis.html`, etc. | State-filtered subsets | boilerplate + provider cards |
| **Blog geo pages** | `blog/online-adhd-diagnosis-*.html` | CA, TX subsets | provider cards |
| **AI indexes** | `llms.txt`, `llms-full.txt`, `provider-index.json`, `entity-graph.json` | All 7 | one-line positioning |
| **Answers** | `answers/telehealth-adhd-california.html` | Sneh (+ mention) | inline attribution |
| **Generator / chrome** | `generate-provider-pages.mjs`, `site-chrome.mjs` | All 7 | templates driving dozens of pages |

Full line-level occurrence export: `data/provider-consistency-audit.json` → `occurrences` array (2,241 mention lines indexed).

---

## Implementation sequence (recommended)

1. **Data fixes** — `internal-provider-records.mjs`, `providers.mjs`, `providers-additional.mjs`, `provider-hub-presentation.mjs` (Swati role, Wendy scope, homepageBio alignment).
2. **Roster fixes** — Remove Wendy from `adhd-care` slug list; update `ADHD_CARE_PROVIDER_TAGLINES`.
3. **Regenerate** — `node scripts/generate-provider-pages.mjs` + seo-build / site-chrome injection for homepage, about, service pages.
4. **Copy sweep** — ADHD geo boilerplate “Board-certified” → “Licensed”; ADHD-CCSP first-mention standard.
5. **Re-audit** — `node scripts/audit-provider-consistency.mjs` and diff JSON.

---

## Related artifacts

| Artifact | Path |
|----------|------|
| This audit | `docs/PROVIDER-CONSISTENCY-AUDIT.md` |
| Machine-readable findings | `data/provider-consistency-audit.json` |
| Regeneration script | `scripts/audit-provider-consistency.mjs` |
| Prior partial audit (2026-06-05, 3 providers) | superseded by this document |

---

*Audit-only — no provider pages were modified. Run generator after applying replacements.*
