# Hinglish support — Talk Mode & Ask (design)

**Status:** Phase 0 shipping — glossary + aliases + confirm confidence gate. Talk **default mic stays browser STT**. A Sarvam-first cloud-listen button is a prototype only (transcript on screen, explicit send; Deepgram only for documented mic/OS mishears). **No speech vendor is locked.** AssemblyAI is excluded from the prototype.  
**Date:** 2026-09-07 (Phase 0 locked)  
**Surfaces:** Staff Ask + Founder Talk (one engine); Talk Mode STT/TTS chrome  
**Prior evidence:** Browser STT probe (Talk Mode `recognition.lang = navigator.language`) on Hindi audio → confident English gibberish (`"india.com is my basic email ID"`). Intent/meta catalog: zero Devanagari / Hindi patterns (pre–Phase 0).

---

## Sequencing (locked)

| Phase | Scope | Status |
|-------|--------|--------|
| **0** | Confirm-gate hardening + STT confidence on confirm · glossary normalize · small alias table · Talk default mic = browser STT | **Build / ship** |
| **Later** | Cloud STT bake-off (Sarvam / Deepgram / AssemblyAI) | **Deferred** until Phase 0 proves approach |

---

## Executive answer

| Question | Answer |
|----------|--------|
| Can browser Web Speech do Hinglish well via `lang`? | **No.** One language assumption per recognition session; code-mixing is a known failure mode. |
| Need a different STT? | **Yes for full voice Hinglish** — deferred past Phase 0. |
| Intent approach? | **Hybrid:** normalize Romanized Hinglish → English + small alias table. |
| Effort Phase 0? | **Medium** |
| Garbled `ok`/`sure` silent execute? | **Mitigated in Phase 0** via `evaluateConfirmUtterance` (exact phrases; drop ok/sure; confidence floor). |

---

## 1. STT language configuration

### 1.1 Current Talk Mode behavior (code fact)

Talk Mode uses `useSpeechCapture` → Web Speech API:

- `recognition.lang = navigator.language || "en-US"`
- **No** language parameter from UI / profile / utterance
- **No** confidence read from `SpeechRecognitionAlternative.confidence` (type surface today only exposes transcript text)
- Ask Mic (`VoiceInputButton`) uses the same lang rule

### 1.2 Can browser Web Speech handle Hinglish via `lang`?

**Reliable Hinglish (intra-utterance Hindi↔English): no.**

Evidence / industry consensus (aligned with our probe):

1. **Single-language session model.** `SpeechRecognition.lang` selects one BCP-47 tag. Engines optimize acoustic + language model for that tag; mid-sentence code-switch is not a first-class Web Speech feature.
2. **Alternate languages ≠ code-switching.** Google *Cloud* STT docs for “multiple languages” allow up to **three** language codes and pick a **best-fit language for the utterance/segment** — they explicitly note fewer languages / single language perform better. That is **utterance-level LID**, not token-level Hinglish.
3. **`hi-IN` vs `en-*` tradeoff.** Forcing `hi-IN` often pushes Devanagari / Hindi LM onto English loans; forcing `en-GB`/`en-US` (our probe) produced **confident wrong English**. Neither is “Hinglish mode.”
4. **Our probe.** Same audio (`नमस्ते मुझे सोनु के प्रदर्शन…` via macOS Lekha):
   - Talk Mode default (`en-GB`): finals = `"india.com is my basic email ID"` (**garbled-but-confident**)
   - Forced `hi-IN`: Devanagari gibberish, still not the source phrase

**Conclusion:** Tuning `lang` alone will not make Talk Mode Hinglish-safe. At best it changes the *flavor* of failure.

### 1.3 If not browser STT — real provider options

Options that **document** code-mix / mid-sentence switching (must still be **eval’d on our clinic Hinglish + names** before commit):

| Option | Hinglish / code-mix claim | Latency (order) | Cost (order, public list) | Tradeoffs for Siya staff portal |
|--------|---------------------------|-----------------|---------------------------|----------------------------------|
| **Stay on Web Speech** | None for code-mix | ~instant, on-device/browser | **$0** | Current path. Fails open with garbled text. Safari/iOS already gated off. |
| **Sarvam AI (Saaras)** | Explicit **codemix** / Hinglish; 22 Indian langs; India-hosted positioning | Streaming claimed **&lt;150–250 ms** TTFT | **₹30/hr** audio (~₹0.50/min); diarization ₹45/hr | Strong India fit; BAA / DPA / PHI-in-audio policy needed; new vendor + WebSocket capture path. |
| **Deepgram (`language=multi` / Nova multilingual)** | Vendor content claims multilingual code-switching incl. Hindi–English; keyterm prompting for roster names | Real-time **&lt;~500 ms** class | Custom / usage (typically cents per minute class — confirm quote) | Mature voice-agent stack; US cloud; HIPAA BAA often available on enterprise — verify. |
| **AssemblyAI Universal-3.5 Pro Streaming** | Docs: **native mid-sentence** code-switch across 18 langs incl. **Hindi**; optional `language_codes: ["en","hi"]` | Configurable min_latency / balanced | Public compare ~**$0.45/hr** streaming class | Strong docs; US cloud; same BAA/audio-egress review. |
| **Google Cloud Speech (Chirp / v2)** | Broad `en-IN` + `hi-IN`; multi-lang = **up to 3 alts, pick one** | Sync often **1–3 s** class | ~**$0.024/min** ballpark (legacy STT pricing pages) | Already familiar GCP; **weak** as true code-mix; better as fallback LID than Hinglish primary. |
| **Azure Speech** | `en-IN` / `hi-IN`; custom models | Similar cloud RT | Usage-based | Enterprise IAM; code-mix still weaker than India-specialized / multi models. |
| **OpenAI Whisper / Hinglish fine-tunes** (e.g. HF Whisper-Hinglish, equal-ai transliterate) | Good batch Hinglish in community evals | Batch / self-host: **high** unless Groq-class host | Infra or host $/min | Poor fit for Talk Mode **turn-taking** unless streaming wrapper; ops burden. |

**Recommendation (STT):**

1. **Do not** promise Hinglish Talk Mode on browser Web Speech.
2. **Phase A (no new vendor):** keep Web Speech + **safety net** (§1.4) so garbled text doesn’t drive the product.
3. **Phase B (if voice Hinglish is required):** short bake-off on **10–20 real staff utterances** (Romanized Hinglish + Devanagari + mixed + names like Sonu): **Sarvam codemix** vs **Deepgram multi** vs **AssemblyAI en+hi**. Pick one; wrap behind `/api/talk/stt` so the client never holds the provider key.
4. Prefer providers that return **per-word or utterance confidence** (browser confidence is unreliable — Chrome often returns `0` in continuous mode).

### 1.4 Safety net for garbled-but-confident transcripts

**Problem:** Talk Mode today submits **any non-empty `finalText`** with no confidence check (`TalkModeView` → `onUtterance(text)`).

**Proposed net (ship even before cloud STT):**

| Layer | Behavior |
|-------|----------|
| **A. Confidence / quality gate** | If provider confidence &lt; threshold **or** (Web Speech) heuristic fail → speak/show: *“I didn’t catch that clearly — try again, or type it.”* Do **not** call Ask / voice-actions. |
| **B. Always show transcript** | Before send (or immediately after), show what was heard; optional **Edit / Send / Discard** for Talk Mode. |
| **C. Heuristics when confidence missing** | Reject / re-ask if: empty after strip; extreme length vs listen duration; high non-letter ratio; script unexpected for profile (e.g. pure Latin garbage when user opted Hindi); optional small LM “does this look like staff Ask” check. |
| **D. Action path stricter** | If `looksLikeVoiceAction` but confidence low → clarify, never `pending_confirm`. |
| **E. Confirm path stricter** | Auto-submit yes/no only if confidence high **and** phrase is exact short confirm; else require **Yes/No buttons** (already on UI). |

Web Speech note: `result[0].confidence` exists in the API but is often **useless (0)** in Chrome continuous mode — so **A** alone is insufficient without **B+C** until cloud STT lands.

---

## 2. Ask intent matching for Hinglish

### 2.1 Audit: how English-shaped is today’s matching?

| Surface | Scale | Hinglish today |
|---------|-------|----------------|
| Meta catalog (`meta-conversation.ts`) | **~42** cases, English regexes | **None** (no Devanagari; no `namaste` / `kaise` / etc.) |
| `siya-os` + `voice-actions` | **~360** regex-ish matchers across ~40 files | English-only |
| Voice actions | 3 commands + English yes/no | `haan` / `theek hai` / `bilkul` → **not** confirm |
| Ops / tasks / practice | Phrase detectors (`isOpsEngagementAsk`, `isPersonalTasksAsk`, …) | English keywords |

**What extends cheaply:** high-frequency **Romanized** Hinglish that maps 1:1 to existing intents, e.g.

| Hinglish (typed or STT Latin) | English intent already covered |
|-------------------------------|--------------------------------|
| `aaj mera kya kaam hai` / `mere tasks` | personal tasks / plan day |
| `shift start karo` / `mera shift shuru` | start shift (voice action) |
| `Sonu ka performance` | named ops performance (after recent Eng fix) |
| `drills kisi ne try kiye` | ops practice |
| `clear chat kaise kare` | meta mic/chrome help |

**What does *not* scale via aliases alone:**

- Full Devanagari utterances without STT/normalize
- Open-ended SOP / KB retrieval (needs retrieval language strategy, not just regex)
- Entire meta catalog × N variants (combinatorial explosion)
- Synonym drift (`kaam` / `kaamkaaj` / `duty` / `tasks`) without a normalizer

**Rough split:** ~**20–40** head intents cover most Talk/Ask daily voice; ~**80%+** of regex surface area is long-tail English that should **not** be hand-duplicated into Hinglish.

### 2.2 Options

| Approach | Pros | Cons |
|----------|------|------|
| **(a) Hinglish pattern variants beside English** | Deterministic; no new model; good for top 20 | Doesn’t scale; misses paraphrases; Devanagari separate |
| **(b) Translate / normalize → English, then existing matchers** | One matcher set; typed + spoken share path | Bad STT in → bad translate; need romanization + glossary (Sonu, Ops, My day); latency/cost if LLM |
| **(c) Multilingual embeddings / LLM router** | Flexible | Softens “approved KB / deterministic ops” culture; harder to dual-smoke; overkill for v1 |

### 2.3 Recommendation

**Hybrid: (b) light normalize + (a) small alias table — not full (a), not heavy (c).**

1. **`normalizeStaffUtterance(text)`** (deterministic first):
   - Unicode NFKC; optional Devanagari→Latin transliteration table for common particles **or** pass-through if already Latin
   - Glossary replace: `kaam`→`tasks`, `aaj`→`today`, `kal`→`tomorrow`, `dikhao`→`show`, `batao`→`tell`, `performance` unchanged, roster first names unchanged
   - Then run **existing** `detectAdminOpsIntent` / meta / voice-actions on normalized English-ish text
2. **Alias table** only for phrases glossary can’t fix (`shift start kar do`, `mark kar do done`) — cap ~30–50 rows, dual-surface smoked
3. **Do not** LLM-translate every Ask turn in v1 — reserve LLM normalize for medium-confidence misses behind a flag
4. **Answers** stay English unless product later asks for Hindi TTS/replies (separate scope; TTS voice picker ≠ Hindi NLU)

Typed Hinglish can ship **before** cloud STT and still help Mic users whose browser luckily emits Romanized English-ish text.

---

## 3. Scope, effort, and action safety

### 3.1 Effort estimate

| Scope slice | Size | Notes |
|-------------|------|-------|
| Confidence / transcript confirm net (browser STT) | **Small–Medium** | Hook + Talk UI; heuristics; dual smoke |
| Top ~30 Hinglish aliases + glossary normalize | **Medium** | Dual-surface smokes; no vendor |
| Cloud STT bake-off + `/api/talk/stt` + audio egress/BAA | **Large** | Privacy review, streaming, fallback to Web Speech |
| Full bilingual Ask (Hindi answers, full KB, all intents) | **XL** | Out of Assist v1 spirit unless explicitly funded |

**Honest overall for “Hinglish Talk + Ask that staff can trust”:** **Large**.  
**Honest MVP that reduces harm without claiming Hinglish STT:** **Medium** (safety net + normalize/aliases).

### 3.2 Safety: can garbled Hinglish silently trigger a real action?

**Silent execute: no.** Code path (`SiyaChat.handleUtterance` + `voice-actions.ts`):

1. Voice actions only on Talk Mode.
2. Match → **`pending_confirm`** with spoken/shown readback — **does not** call shift/task APIs yet.
3. Execute only if a later utterance matches **`isConfirmYes`** (`yes|yeah|yep|yup|confirm|do it|go ahead|correct|that's right|sure|ok|okay`).
4. UI also has explicit Yes/No buttons.

**Confirmed with garbled probe strings:**  
`"india.com is my basic email ID"` → `looksLikeVoiceAction: false`, `resolve: not_action`.  
Hinglish confirms `haan` / `bilkul` / `theek hai` → **not** yes (stuck waiting — safer than execute).

**Residual risks if Hinglish/STT ships imperfectly:**

| Risk | Silent execute? | Severity |
|------|-----------------|----------|
| Garbled text becomes wrong Ask answer / soft-stop | N/A (not an action) | Medium UX / trust |
| Garbled text accidentally matches English action grammar → **wrong pending readback** | No (still needs confirm) | Medium — user may tap Yes without reading |
| Confirm listen STT invents **`ok` / `sure` / `yes`** → **auto-submit yes** (`TalkModeView` auto-stops on confirm yes) | **Yes — this can execute** | **High** — confirm gate does **not** protect against false-positive **yes** transcription |
| User says `haan` intending yes | No execute | Low (friction) |

**Explicit confirmation for the deliverable:**

- **Garbled command text alone cannot silently mutate shift/tasks** — confirm-before-execute still holds.
- **Garbled / invented confirm (“ok”, “sure”, “yes”) can execute** an *already pending* action under today’s auto-listen + English yes matcher.
- Therefore Hinglish STT work **must** include: stricter confirm gate (buttons preferred or high-confidence short yes only) **before** widening STT language surface.

---

## 4. Proposed phased plan (when build is approved)

1. **Phase 0 — Safety (required):** transcript visibility; reject/re-ask heuristics; disable low-quality auto-yes on confirm (prefer buttons).  
2. **Phase 1 — Typed + lucky Mic Hinglish:** glossary normalize + ~30 aliases; dual-surface smokes.  
3. **Phase 2 — STT bake-off:** Sarvam vs Deepgram vs AssemblyAI on real clips; BAA/audio policy; feature-flag Talk Mode cloud STT.  
4. **Phase 3 — Optional:** Hindi/Hinglish spoken answers (TTS), Devanagari-first UX — only if Phase 2 accuracy clears a founder bar.

---

## 5. Non-goals (v1)

- Full Hindi KB authoring / dual-language SOPs  
- Replacing Assist with a multilingual LLM helpdesk  
- Claiming browser `lang=hi-IN` as “Hinglish support”  
- Zoho / marketing creative scope (unrelated)

---

## 6. Decision asks for founder / eng lead

1. Is **voice** Hinglish required, or is **typed** Hinglish + safer Talk English enough for now?  
2. Approve **India-hosted (Sarvam)** vs **US cloud with BAA (Deepgram/AssemblyAI)** for mic audio?  
3. For actions: require **button confirm only** (strictest), or keep voice yes with confidence threshold?

---

## References (in-repo)

- `src/lib/use-speech-capture.ts` — Talk STT lang  
- `src/lib/voice-actions.ts` — confirm-before-execute  
- `src/components/siya/TalkModeView.tsx` — submit finals; auto yes/no  
- `src/components/siya/SiyaChat.tsx` — Talk utterance pipeline  
- Prior chat evidence: Hindi Web Speech probe 2026-09-07  
