# Content mining + existing-content audit (review only)

```text
Status: MINING / AUDIT ONLY — no scripts, captions, or live page edits in this pass
Topic: Signs and symptoms of adult ADHD
Primary SERP / site hubs:
  - https://www.siya.health/answers/signs-of-adult-adhd
  - https://www.siya.health/blog/how-to-know-if-you-have-adhd-adult
Clinical anchors reviewed this pass:
  - PMC2957278 / PMID 20963192 (Gentile et al., Psychiatry Edgmont 2006)
  - NIMH: ADHD in Adults — 4 Things to Know (NIH Pub. No. 24-MH-3573, 2024)
Audience brief (given): ages 20–45 · all genders · overwhelm, missed deadlines,
  poor emotional control, severe procrastination
Business goal: awareness + consideration
SOP stage: research → review → (later) script → claim-check → produce
Reviewed against: apps/siya-health/blog/* + apps/siya-health/answers/*
Note: brand/EDITORIAL-OS.md missing from this clone — used VIDEO-CONTENT-RESEARCH-SOP
  pattern + prior ED mining audit (2026-08-12) as format lock.
```

**Hard rule this pass:** Do not treat HIGH claim-risk items as usable. Do not invent citations. Do not touch live blog/answers HTML.

---

## Brief answers (Step 0 — Topic Scoping)

| Question | Answer |
|----------|--------|
| Why research now? | People seek explanations for forgetfulness, time blindness, and “why can’t I adult” habits — high recognition intent. |
| Target audience | 20–45; all genders; pain: constant overwhelm, missed deadlines, poor emotional control, severe procrastination. |
| Business goal | Awareness → consideration (screener / Meet & Greet / evaluation path). |
| Format recommendation (end) | **Priority 1:** carousel (symptom-as-feeling scenes) + **reel** (AV symptom list with soft “not a diagnosis” close). **Priority 2:** enrich existing answers/blog with lived phrasing — not a net-new blog unless review finds a unique spoke. |

Step 0 Google SERP note (founder): content already exists across ~3 pages for this intent — prefer **enrich + social recognition packs** over duplicate SEO posts.

---

## Step 1 — Reddit research

**Access note:** Reddit HTML/API blocked from this cloud environment (403 / network policy). Observations below are from the **founder research session notes** on the listed threads. Engagement counts not re-verified live — mark **engagement: session-noted / unverified** unless filled later.

### Search query variations (≥6 across ≥3 categories)

| # | Category | Query variation |
|---|----------|-----------------|
| Q1 | Informational | How to know if you have ADHD as an adult |
| Q2 | Informational | What are the signs of adult ADHD? |
| Q3 | Symptom / problem-based | Always late for everything ADHD adult |
| Q4 | Symptom / problem-based | Executive dysfunction can’t start tasks ADHD |
| Q5 | Symptom / problem-based | Women silent ADHD symptoms before diagnosis |
| Q6 | Myth / misconception | Am I just lazy or do I have ADHD |
| Q7 | Audience / provider | Should I get tested for ADHD as an adult |
| Q8 | Comparison | ADHD vs anxiety adults concentration |
| Q9 | Comparison | ADHD vs burnout signs adults |

Categories **1–2** have session-logged Reddit links. Categories **3–5** have query coverage + competitive/clinical SERP signals; **live Reddit link harvest for myth / should-I-test / comparison still needed** in a logged-in pass (flagged below).

---

### Category 1 — Informational

#### Link A
https://www.reddit.com/r/AskReddit/comments/n4his3/redditors_who_were_diagnosed_with_adhd_as/

| Field | Notes (immediate observation) |
|-------|-------------------------------|
| Observation | Late-diagnosed adults narrate *pre-insight* signs: chronic lateness (including getting means/errands), talking fast/loud, internalizing struggles, feeling inefficient at work. Coping ideas appear (deadlines for self, mood-cycle recording, meditation, panic/PTSD co-travel). |
| Engagement | Session-noted / unverified (AskReddit volume historically high). |
| Questions asked | What tipped you off? What were the signs before you knew it was ADHD? |
| Pain points | Always late; speech volume/speed; work inefficiency; delayed recognition. |
| Misconceptions | Symptoms attributed to personality / “just how I am” for years. |
| Emotional language | Relief after naming; frustration at late discovery. |
| Content opportunities | Carousel: “Signs I had *before* I had a name.” Reel: lateness + talking-over + unfinished work as adult presentation (not classroom hyperactivity). |

#### Link B
https://www.reddit.com/r/ADHD/comments/1t8sxr0/people_diagnosed_with_adhd_as_adults_what_were/

| Field | Notes |
|-------|-------|
| Observation | Core struggle = **executive dysfunction**: holding phone for hours wanting to act but can’t; “physically hit” by freeze; hyperfocus framed as boom that you can’t *aim*; daily frustration; many thought depression; overwhelm across parenting/relationships/stress; next-day collapse after handling everything. |
| Engagement | Session-noted / unverified. |
| Questions asked | What were your struggles before / after adult diagnosis? |
| Pain points | Freeze, misdirected hyperfocus, depression mislabel, multi-role overwhelm. |
| Misconceptions | “It’s depression” / “I just need to try harder”; hyperfocus = always a gift. |
| Emotional language | Frustration as normal daily weather; begging yourself to start. |
| Content opportunities | Reel/carousel: “Wanting to do it · body won’t move.” Separate slide: hyperfocus without a steering wheel. Soft close: lifelong pattern + impairment → screener (not TikTok checklist). |

#### Link C
https://www.reddit.com/r/ADHD/comments/1dtvtcd/women_who_werent_diagnosed_until_you_were_adults/

| Field | Notes |
|-------|-------|
| Observation | **Silent / internal** symptoms: never relax; head always on next step; life as endless to-do list; constant stress; kitchen cleaning spiral (start small → hours → unfinished elsewhere); energy for a task then brain redirects → neither finished; “closing doors” / same unfinished loop. |
| Engagement | Session-noted / unverified. |
| Questions asked | What did it feel like before diagnosis (women / late diagnosis)? |
| Pain points | Constant mental forward-planning; messy home despite effort; task-switching waste. |
| Misconceptions | “I’m just a stressed woman / bad at housekeeping.” |
| Emotional language | Never-relax; constant stress; self-blame for unfinished rooms/tasks. |
| Content opportunities | Women-focused carousel: “My brain never clocks out.” Scene: cleaning spiral. Scene: start Task A → brain opens Task B. Link `/blog/adhd-in-women` + `/answers/adhd-in-women`. |

---

### Category 2 — Symptom / problem-based

#### Link D
https://www.reddit.com/r/adhdwomen/comments/1tvvax7/so_another_one_of_my_struggles_just_turned_out_to/

| Field | Notes |
|-------|-------|
| Observation | What felt “normal” pre-diagnosis: chronic fatigue when doing things you’re not “good at”; “just bad at life”; living with a **handbrake on**; embarrassing clumsiness / dropping / juggling things; odd ninja-reflex vs drop-things split; sensory overload themes. Fatigue later reframed by community as dopamine / ADHD-related energy — **mechanism claims → PART 3**. |
| Engagement | Session-noted / unverified. |
| Questions asked | What struggle turned out to be ADHD? |
| Pain points | Fatigue, shame (“bad at life”), handbrake feeling, motor/sensory quirks. |
| Misconceptions | Chronic fatigue syndrome as the only frame; character flaw as the only frame. |
| Emotional language | Handbrake; bad at life; embarrassing. |
| Content opportunities | Strong recognition hook: “Living with the handbrake on.” Myth pack: laziness vs wanting-to-but-can’t. Physical/clumsy angle → cross-check AD-P-01 physical-signs research (do not invent neurology). |

---

### Category 3 — Myth / misconception (queries logged; live Reddit links TBD)

| Query | Competitive / community signal | Content opportunity |
|-------|--------------------------------|---------------------|
| Am I just lazy or do I have ADHD | Heavy SERP + Siya already owns `/blog/youre-not-lazy-signs-undiagnosed-adult-adhd` + AD-S-01 | Reuse myth; refresh with *handbrake* / *frozen wanting* language from this pass |
| ADHD is only for hyper kids | Appears in NIMH + Reddit late-dx stories | Already on `/answers/signs-of-adult-adhd` myths — add lived “inner restlessness” scene |

**TODO (human Reddit pass):** paste 1–2 myth-thread URLs with engagement + observations into companion sheet.

---

### Category 4 — Audience questions (provider-direct)

| Query | Signal | Content opportunity |
|-------|--------|---------------------|
| Should I get tested for ADHD as an adult | High consideration intent; Siya has screening/eval spokes | Soft CTA pack: screener ≠ diagnosis; when impairment + lifelong pattern → evaluation |
| Do I have ADHD quiz / test | Google suggest strong | Guardrail content: quiz → clinician (already in hubs) |

**TODO:** harvest Reddit “should I get tested” threads with observations.

---

### Category 5 — Comparison (named pairs)

| Query | Existing Siya page | Gap vs this research |
|-------|--------------------|----------------------|
| ADHD vs anxiety (adults) | `/answers/adhd-vs-anxiety`, `/answers/can-adhd-cause-anxiety` | Missing micro-scene: anxious *while* frozen on tasks (from Link B) |
| ADHD vs burnout | `/answers/adhd-vs-burnout` | Strong clinically; missing “handled everything → can’t function next day” collapse scene |
| ADHD vs laziness | `/blog/youre-not-lazy-…` | Missing handbrake / bad-at-life phrasing |

---

## Step 2 — Cross-platform research

### YouTube Shorts (founder-logged)

| Field | Short 1 | Short 2 |
|-------|---------|---------|
| Link | https://www.youtube.com/shorts/vlt7Ktz80-U | https://www.youtube.com/shorts/e0euSx036_8 |
| Creator type | Doctor-influencer | Doctor-influencer |
| Observation | Symptoms paired with relatable images; comments from younger *and* older viewers relating | Session notes mirror Short 1 (possible duplicate paste — re-verify title/hook before treating as second unique comps) |
| Engagement | ~2.2k / ~58 comments (session-noted) | Same figures in brief — **re-verify**; do not double-count |
| Emotional language | Educational / checklist | Educational |
| Audience questions (comment signal) | “Do I have ADHD? I have most of these… active at night / poor sleep — what should I do?” | Same |
| Content opportunity | Reel: AV symptom beats + **sleep differential soft close** → link `/answers/poor-sleep-feels-like-adhd` (do not diagnose from night-owl alone) |
| Siya-safe? | Y if we keep “possible signs / talk to clinician” and avoid self-diagnose guarantee | Same |

**Transcript / on-screen themes captured from Short 1 fetch:** acting quickly without thinking; disorganization/prioritizing; poor time management; focus problems; multitasking trouble; restlessness; poor planning; easily upset at minor challenges; mood swings; unfinished tasks; quick temper / coping strain.

**Format that performs in niche (cross-platform signal):**
- Short list + relatable visual per symptom (YT Shorts / Reels / TikTok)
- Lived-language recognition > textbook DSM lists
- Comment culture drives “is this me?” + sleep/anxiety mimics → **Siya differentiator = recognition + differential + practical next step**

**TikTok / IG caution (clinical literature, not a script):** popular ADHD short-form often over-attributes nonspecific symptoms; Siya packs must include impairment + lifelong pattern + “not a diagnosis” + screener/eval path (see PART 3 H-social).

### SEO keywords (captions / on-image sparingly)

Semrush / Ahrefs / Keyword Planner **not available** in this environment. Used **Google Suggest** (2026-08-14) as proxy — caption candidates, not volume claims:

| Seed | Suggest expansions (include in captions where natural) |
|------|--------------------------------------------------------|
| signs of adult adhd | …in women · …men · …at work · …inattentive · …test/quiz · reddit |
| signs of adhd in females | symptoms … adults · female adults · teens · women |
| what are the symptoms of adhd | …in adults · …in women · …in adult women/men |
| how to know if you have adhd | …as an adult · …as an adult woman · …or autism · reddit |

**Caption keyword bank (safe):** signs of adult ADHD · symptoms of ADHD · signs of ADHD · signs of ADHD in females / women · how to know if you have ADHD as an adult · adult ADHD signs at work.

**Do not invent monthly search volumes** until Semrush/Ahrefs pass.

---

## Step 3 — Clinical research documentation

### Source A — Peer-reviewed (PubMed/PMC direct)

| Field | Detail |
|-------|--------|
| Citation | Gentile JP, Atiq R, Gillig PM. Adult ADHD: Diagnosis, Differential Diagnosis, and Medication Management. *Psychiatry (Edgmont).* 2006;3(8):25–30. |
| PMC / PMID | PMC2957278 / 20963192 |
| URL | https://pmc.ncbi.nlm.nih.gov/articles/PMC2957278/ |
| Plain-language take | Adult ADHD is continuous with childhood patterns; hyperactivity often quieter; common complaints = starting tasks, variable attention, organization/prioritization, sustained effort, impulsivity/low frustration tolerance; high comorbidity; differential vs mood/anxiety/substance/personality/medical mimics; meds + psychotherapy discussed. |
| Adult signs listed in paper | Difficulty getting started; variable attention to details; self-organization/prioritization trouble; poor persistence for sustained mental effort; impulsivity / low frustration tolerance; hyperactivity less salient; chaotic lifestyles; disorganization; comorbidities / substance use in some. |
| Claim-risk stats in paper | Persistence 10–60%; ~4.5% adults; ~⅓–½ of self-believers meet criteria; ~½ of ADHD parents have an ADHD child — **all → PART 3** (old paper; verify before any “research shows” slide). |

### Source B — Patient education (NIMH)

| Field | Detail |
|-------|--------|
| Source | NIMH — ADHD in Adults: 4 Things to Know (NIH Publication No. 24-MH-3573, 2024) |
| URL | https://www.nimh.nih.gov/health/publications/adhd-what-you-need-to-know |
| Usable educational points (low dramatization) | Adults can have ADHD; symptoms impair ≥2 life areas; inattention / hyperactivity / impulsivity presentations; diagnosis needs childhood-onset evidence; adults need ≥5 symptoms (DSM framing); girls/women often missed earlier; treatment = meds + psychotherapy ± coaching/lifestyle; sleep problems common. |
| HIGH until carefully cited | “Sleep problems… affecting up to 70% of adults with ADHD” → PART 3 |

### Clinical ↔ Reddit crosswalk (for later scripts)

| Lived language (research) | Clinical home |
|---------------------------|---------------|
| Frozen / handbrake / begging yourself | Task initiation / executive dysfunction (Gentile “difficulty getting started”) |
| Never relax / endless to-do head | Hyperactivity → adult **inner restlessness** (NIMH) |
| Cleaning spiral / task switch waste | Organization + sustained effort + impulsivity of attention |
| Thought it was depression / CFS | Differential + comorbidity (Gentile; NIMH) |
| Night active / poor sleep comment | Sleep mimic / co-travel → poor-sleep spoke |

---

## PART 1 — New content ideas

| ID | Angle | Format | Claim risk | Source line / quote it came from |
|----|-------|--------|------------|----------------------------------|
| SS-R01 | Pre-diagnosis sign bank: chronically late for *everything* (including basic adult errands) | carousel / video | LOW | AskReddit late-dx: late for everything including getting their means |
| SS-R02 | Speech tell: talking fast / loud as adult ADHD texture (not classroom running) | carousel / video | LOW–MEDIUM | AskReddit: talk super fast / loudly — MEDIUM only if framed as diagnostic criterion rather than lived observation |
| SS-R03 | “I felt inefficient at work for years before the name” | carousel / LinkedIn company | LOW | AskReddit: inefficient at work; delayed recognition |
| SS-R04 | Executive freeze: holding phone hours · want to act · can’t | carousel / **reel gold** | LOW | r/ADHD adult-dx: holding phone… begging yourself |
| SS-R05 | Freeze feels *physical* (“hits you”) | video / carousel | LOW | r/ADHD: executive dysfunction physically hitting you |
| SS-R06 | Hyperfocus boom without a steering wheel (gift + trap) | carousel / video | LOW–MEDIUM | r/ADHD: boom for hyperfocus but can’t direct where it goes — MEDIUM if claiming universal ADHD feature |
| SS-R07 | Daily frustration weather; “I thought it was depression” | carousel / blog FAQ | MEDIUM | r/ADHD: frustration normal daily; upset thinking depression |
| SS-R08 | Multi-role collapse: parenting + relationships + stress → next-day can’t function | carousel / blog section | MEDIUM | r/ADHD: overwhelmed handling everything; not able to function the other day |
| SS-R09 | Women’s silent symptom: brain never clocks out / always next step | carousel / video / women hub | LOW | Women late-dx: could never relax; head always next step; lived as to-do list |
| SS-R10 | Constant stress-state as background noise (not a single crisis) | carousel / video | LOW–MEDIUM | Women late-dx: constant state of stress |
| SS-R11 | Kitchen / cleaning spiral: start small → hours → rest unfinished | **reel** / carousel | LOW | Women late-dx: kitchen dirty; start small place → hours cleaning |
| SS-R12 | Task hijack: energy for A → brain opens B → waste both | carousel / video | LOW | Women late-dx: energy on task then brain says do something else |
| SS-R13 | “Just bad at life” identity before diagnosis | video / carousel | LOW | adhdwomen: thought they were just bad at life |
| SS-R14 | Living with the **handbrake on** | **reel hook / carousel S1** | LOW | adhdwomen: living life with a handbrake on |
| SS-R15 | Fatigue when doing things you’re “not good at” (lived energy story) | carousel / blog | MEDIUM as pattern; **HIGH if dopamine mechanism** | adhdwomen: chronic fatigue… turned out dopamine — mechanism = PART 3 |
| SS-R16 | Clumsy / drop-things vs “ninja reflexes” oddity (recognition humor) | video / carousel | LOW as lived quirks; HIGH if claimed as clinical ADHD sign | adhdwomen: juggling/dropping; ninja superpowers / reflexes |
| SS-R17 | Sensory overload as co-travel in women’s stories | carousel (careful) / blog | MEDIUM | adhdwomen: sensory stimulations — don’t overclaim as ADHD-only |
| SS-R18 | YT checklist format: one symptom + one relatable visual beat | **reel** | LOW if educational framing | YT Shorts structure + comment relating |
| SS-R19 | Comment bridge: “I match most symptoms + night owl / poor sleep — what now?” | reel end card / answers FAQ | LOW as question; HIGH if answering “you have ADHD” | YT comment: active night time / poor sleep — what supposed to do? |
| SS-R20 | Siya differentiator vs TikTok lists: recognition → differential → practical next step | series strategy / carousel close | LOW (process claim) | Cross-platform misinformation signal + Siya Editorial Test |

### Explicitly NOT ready ideas
- Dopamine deficiency as the explanation for fatigue → **PART 3**
- Any prevalence / “1 in X women misdiagnosed” slide without claims-register source → **PART 3**
- “Up to 70% sleep problems” as hook number → **PART 3**
- Gentile 10–60% / 4.5% / ⅓–½ self-believers stats → **PART 3**
- Diagnosing from Shorts checklists or clumsiness alone

---

## PART 2 — Existing content audit

| Existing page | Gap found vs Part 1 angles | Suggested addition (one line) | Priority |
|---------------|----------------------------|-------------------------------|----------|
| `/answers/signs-of-adult-adhd` | Strong clinical list + myths; **thin** on lived scenes (handbrake, phone-freeze, cleaning spiral, never-clock-out) | Add “How people describe it” callout with 3–4 paraphrased scenes → keep clinician evaluation close | **do now** |
| `/blog/how-to-know-if-you-have-adhd-adult` | Classic sign list; missing freeze-physical, handbrake, women’s never-relax, sleep-comment bridge | One vignette block + sleep differential sentence linking poor-sleep answer | **do now** |
| `/blog/youre-not-lazy-signs-undiagnosed-adult-adhd` | Owns laziness myth; weaker **handbrake / bad-at-life / wanting-but-can’t** phrasing | Add one paragraph paraphrasing SS-R13/R14; link signs answer | **do now** |
| `/blog/adhd-symptoms-overlooked` | Has hyperfocus + procrastination; missing steering-wheel metaphor and cleaning spiral | Add SS-R06 / SS-R11 as examples under hyperfocus / transitions | **queue** |
| `/answers/executive-dysfunction-adhd` + `/blog/executive-dysfunction-adhd` | ED packs already mining freeze/tomorrow language; this pass adds **handbrake** + **physical hit** + phone-freeze | Cross-link from signs hub; reuse ED language rather than duplicate ED blog | **do now** (cross-link only) |
| `/answers/adhd-in-women` + `/blog/adhd-in-women` | Clinical women hub; missing never-clock-out / cleaning spiral / task hijack scenes | Add short “language before diagnosis” examples (SS-R09–R12) | **do now** |
| `/answers/late-adhd-diagnosis-adults` | Explains why late dx; thin on “thought it was depression / CFS / bad at life” | One sentence on common mislabels → link signs + women | **queue** |
| `/answers/adhd-vs-anxiety` + `/answers/can-adhd-cause-anxiety` | Clinical overlap; missing anxious-while-frozen micro-scene | Add example: anxiety climbs as the list sits untouched | **queue** |
| `/answers/adhd-vs-burnout` | Strong differential; missing next-day collapse after “handling everything” | Add SS-R08 as patient-language example of compensation crash | **queue** |
| `/answers/poor-sleep-feels-like-adhd` | Owns sleep mimic; not linked from social “I match all symptoms + poor sleep” | FAQ line answering YT comment pattern → evaluation may include sleep history | **do now** |
| `/answers/time-blindness-adhd` | Owns time sense; not the “late for everything including errands” adult texture | One lived lateness example (SS-R01) | **queue** |
| `/answers/high-functioning-adhd` | Compensation framed; missing silent women never-relax | Optional cross-link to women silent-symptoms when written | **queue** |
| `/answers/screening-vs-adhd-evaluation` | Process clear; weak “I related to a Short — what now?” | Soft line: relating to a video ≠ diagnosis; screener → clinician | **do now** |
| AD-S-01 / ADHD-2026-07-21-not-lazy packs | Laziness myth shipped; can refresh hooks with handbrake language | Queue caption/hook refresh after review — no new pack until angles approved | **queue** |
| AD-P-01 (physical signs; other branch) | Adjacent to SS-R16 clumsiness/reflex | Do not merge; coordinate so physical pack doesn’t overclaim motor signs | **queue** |
| *No dedicated page* | Cleaning-spiral / never-clock-out as standalone spoke | Prefer sections on women + signs hubs over new URL | **queue** (no new page) |

**Audit note:** Primary homes for this topic are already `/answers/signs-of-adult-adhd` + `/blog/how-to-know-if-you-have-adhd-adult`. Prefer **enrichment + social packs** over a third overlapping blog.

---

## PART 3 — High-claim-risk items needing verification

| # | Claim / dramatic fact | Where it appeared | Status | Do not use until |
|---|----------------------|-------------------|--------|------------------|
| H1 | Fatigue / “not good at it” energy explained as **lack of dopamine** | adhdwomen thread notes | **Not verified** as mechanism for that lived story | Peer-reviewed wording on dopamine + ADHD that Medical can approve; prefer lived “energy disappears on hard-start tasks” without mechanism |
| H2 | ADHD persists into adulthood in **~10–60%** of childhood cases | Gentile et al. 2006 | **Not verified for 2026 creative** (old range; cite carefully) | Update against current guideline/review; exact population defined |
| H3 | Adult prevalence **~4.5%** | Gentile et al. 2006 | **Not verified for creative** | Current CDC/NIMH-facing prevalence with year |
| H4 | Only **⅓–½** of adults who believe they have ADHD meet DSM criteria | Gentile et al. 2006 | **Not verified for creative** | Modern citation or drop the punchy fraction |
| H5 | **~½** of ADHD parents have a child with ADHD | Gentile et al. 2006 | **Not verified for creative** | Genetics review / CHADD-approved figure |
| H6 | Sleep problems affect **up to 70%** of adults with ADHD | NIMH adult ADHD page | **Not yet claim-checked for scripts** | Confirm primary study NIMH relies on; use soft “sleep problems are common” until then |
| H7 | Hyperfocus as universal ADHD “boom” / superpower | Reddit + overlooked blog tone | Pattern observation OK; **stats/mechanism HIGH** | No prevalence; keep as some-people observation |
| H8 | Sensory issues / “ninja reflexes” as ADHD signs | adhdwomen notes | **Not verified** as ADHD-specific signs | Do not list as diagnostic; lived quirk only or drop |
| H9 | Short-form social = accurate self-diagnosis | TikTok quality literature (context) | **Counter-claim — do not reverse** | Siya stance: recognition ≠ diagnosis (already) |
| H10 | “1 in 3 women misdiagnosed” style stats (if reused from other sessions) | Not in this topic’s primary links; watch for bleed | **Not verified** | Claims register only |

---

## Format decision (end of research)

| Priority | Format | Insight working ID | Why |
|----------|--------|--------------------|-----|
| 1 | **Carousel** | `AD-SS-01` — Living with the handbrake on (adult signs as feelings) | Recognition for 20–45 overwhelm/procrastination audience; feeds awareness |
| 2 | **Reel** | `AD-SS-02` — Phone in hand / body won’t move + soft sleep differential close | Matches YT-performing AV checklist without self-diagnose ending |
| 3 | **Blog/answers enrich** | Signs answer + how-to-know blog + women hub snippets | Consideration path; no new duplicate blog |
| Hold | Net-new SEO blog | — | SERP already covered by existing Siya pages |

**Practical change (required for company posts):** Track 3 lifelong examples across work/home for 7 days → validated screener → clinician if impairing (not “you have ADHD because a reel said so”).

**Soft CTA mix:** `/answers/signs-of-adult-adhd` · `/adhd-screening` · Meet & Greet.

---

## Decision for Itika (review)

1. Approve mining angles SS-R01–R20 priority order: **handbrake (R14) → phone-freeze (R04) → never-clock-out women (R09) → cleaning spiral (R11) → YT AV reel (R18) + sleep bridge (R19)**?
2. Enrich existing signs/how-to-know pages this cycle vs wait for carousel feedback?
3. Any hard ban on humor clumsiness (R16) or cleaning-spiral domestic scenes for company brand?
4. Assign Semrush volumes for caption keyword bank before script stage?

---

## SOP note

This file is **mining/audit only**. Next stages (after approval): ANGLE lock → `medical-flags.md` → script/caption → claim-check PART 3 clears → produce via Visual OS compositors. Load companion Reddit sheet: `../REDDIT-adult-adhd-signs-symptoms.md`.
