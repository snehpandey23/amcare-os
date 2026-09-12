# Cloud STT bake-off — Hinglish Talk Mode (status)

**Date:** 2026-09-09  
**Status:** **Sarvam + Deepgram scored.** Assembly still skipped (no key). No provider winner yet.  
**Corpus:** `/tmp/stt-bakeoff-2026-09-07` (15 WAVs + `phrases.tsv`)  
**Compared run:** `/tmp/stt-bakeoff-2026-09-07/results/run-2026-09-09T00-33-06-610Z.json` (Deepgram 401) and the 40-char-key rerun pasted 2026-09-09.  
**Runner:** `apps/hipaa-training/scripts/stt-bakeoff-run.ts`

---

## What was attempted

1. Searched repo `.env*` for `SARVAM_API_KEY` / `DEEPGRAM_API_KEY` / `ASSEMBLYAI_API_KEY` → **none present**.
2. Built a **15-phrase Hinglish corpus** (tasks, feedback, shift, schedule, performance, drills, mic, code-switch) as 16 kHz mono WAV via macOS `say` (Lekha / Rishi).
3. Wrote a runner that calls all three providers on the **same files** and records transcript + latency.

**Without keys, inventing transcripts would violate the ask.** Re-run:

```bash
export SARVAM_API_KEY=…
export DEEPGRAM_API_KEY=…
export ASSEMBLYAI_API_KEY=…
cd apps/hipaa-training && npx tsx scripts/stt-bakeoff-run.ts
```

Results land in `/tmp/stt-bakeoff-2026-09-07/results/run-*.json`.

---

## Test set (same for every provider)

| ID | Intent | Spoken (script) | Expected gloss |
|----|--------|-----------------|----------------|
| 01 | tasks | आज मेरा क्या काम है | what are my tasks today |
| 02 | tasks | मेरे टास्क दिखाओ | show my tasks |
| 03 | tasks | आज मेरे urgent tasks क्या हैं | urgent tasks today |
| 04 | shift | मेरा शिफ्ट स्टार्ट करो | start my shift |
| 05 | feedback | फीडबैक कैसे देते हैं | how do I give feedback |
| 06 | feedback | मैं feedback कैसे submit करूँ | how do I submit feedback |
| 07 | feedback | feedback का पेज कहाँ है | where is feedback page |
| 08 | schedule | कल मेरी शिफ्ट कब है | when is my shift tomorrow |
| 09 | performance | सोनू का performance कैसा है | Sonu performance |
| 10 | drills | किसी ने drills try किए | has anyone tried drills |
| 11 | mic | mic कैसे use करें | how do I use the mic |
| 12 | codeswitch | I want to know about Sonu ka performance | Sonu performance |
| 13 | codeswitch | clear chat kaise kare | how do I use clear chat |
| 14 | casual | bas yeh batao aaj kya karna hai | what should I do today |
| 15 | ops | staff log OS use kar rahe hain kya | are staff using the OS |

**Caveat:** TTS (`say`) ≠ staff mic audio. Final bake-off should re-score with **3–5 live staff recordings** after the API run.

---

## Cost / latency / integration (public docs only — not bake-off scores)

| | **Sarvam Saaras** | **Deepgram Nova-3 multi** | **AssemblyAI Universal** |
|--|-------------------|---------------------------|---------------------------|
| **Hinglish claim** | Explicit `mode=codemix`; India-trained | `language=multi` code-switch | Mid-sentence code-switch (en+hi in 18-lang set) |
| **List price (approx)** | **₹30/hr** STT (~₹0.50/min) | Nova-3 multilingual stream ~**$0.0058/min** (~$0.35/hr); batch similar | Stream Universal-3.5 Pro ~**$0.45/hr**; cheaper stream tier **$0.15/hr**; async Pro **$0.21/hr** |
| **₹-ish / hr (rough)** | ₹30 | ~₹30 (at ~₹86/$ — verify FX) | ~₹13–₹39 depending on tier |
| **Latency class** | REST &lt;30s clips; streaming claimed &lt;150–250 ms TTFT | Real-time &lt;~500 ms class | Async poll (our runner) slower; realtime WS separate |
| **Integration for Talk** | Multipart REST easy; WS for live | Streaming WS mature for voice agents | Upload+poll easy for bake-off; Talk needs WS/realtime |
| **Data residency** | Markets India hosting | US cloud (confirm BAA) | US + EU options; BAA available |
| **Fit for Siya staff mic** | Strongest *product* fit for Hinglish + India ops | Strong eng voice-agent stack | Strong code-switch docs; more US contact-center DNA |

---

## Sarvam vs Deepgram (2026-09-09)

Same 15 TTS clips. First Deepgram attempt was HTTP 401 (`Invalid credentials`, key length 41). Rerun with a 40-character key returned transcripts. Assembly: `SKIP`.

| ID | Sarvam | Deepgram | Notes |
|----|--------|----------|--------|
| 01 | आज मेरा क्या काम है? | same | both usable |
| 02 | मेरे task दिखाओ। | मेरी task दिखाओ. | both usable; Deepgram gender slip मेरे→मेरी |
| 03–10 | usable | usable | loanwords → English on both |
| 11 mic | **Mick** | Mic | Deepgram only |
| 12 | Sonu Ka performance | same | both usable |
| 13 | clear chat कैसे करें? | ClearChat कैसे करें? | Sarvam keeps the space |
| 14 | बैठे हो … क्या काम है? | बैठे हो … क्या कान है? | both miss “bas yeh batao”; Deepgram also काम→कान |
| 15 | Staff log OS use … | **Staff logos** use … | Sarvam only keeps OS |

**Intent-usable:** Sarvam **13/15** (misses mic, phrase 14). Deepgram **12/15** (misses phrase 14, and OS→logos; ClearChat is usable only if the matcher ignores the missing space).

Latency on this REST batch: Sarvam mostly 170–450 ms. Deepgram first clip 1436 ms, then mostly 290–680 ms.

Caveat unchanged: macOS `say`, not staff mics.

## Sarvam-only result (earlier same day, `saaras:v4` + `mode=codemix`)

Same 15 TTS clips. Deepgram and Assembly: `SKIP no API key`. Latency 193–554 ms (REST, not live mic).

| ID | Sarvam | Intent-usable? |
|----|--------|----------------|
| 01 | आज मेरा क्या काम है? | yes |
| 02 | मेरे task दिखाओ। | yes (टास्क → task) |
| 03 | आज मेरे urgent tasks क्या हैं? | yes |
| 04 | मेरा shift start करो। | yes (शिफ्ट/स्टार्ट → English) |
| 05 | feedback कैसे देते हैं? | yes as text (फीडबैक → feedback). Ask still has no feedback alias. |
| 06 | मैं feedback कैसे submit करूं? | yes |
| 07 | feedback का page कहाँ है? | yes (पेज → page) |
| 08 | कल मेरी shift कब है? | yes |
| 09 | सोनू का performance कैसा है? | yes |
| 10 | किसी ने drills try किए। | yes |
| 11 | Mick कैसे use करें? | **no** — mic heard as Mick |
| 12 | I want to know about Sonu Ka performance. | yes |
| 13 | Clear Chat कैसे करें? | yes |
| 14 | बस ये बैठे हो आज क्या काम है? | **no** — “bas yeh batao” → “बैठे हो” |
| 15 | Staff log OS use कर रहे हैं क्या? | yes |

**Intent-usable: 13/15.** Systematic behavior: Hindi loanwords come back in English (`task`, `shift`, `feedback`, `page`). That helps Ask more than it hurts, except **mic → Mick**.

Caveat unchanged: these clips are macOS `say`, not staff mics.

## Recommendation (honest)

### Cannot pick a winner yet

Only Sarvam has transcripts. Do not drop Deepgram or Assembly on this run.

### Provisional *product* preference (not bake-off winner)

**Trial order when keys arrive:**

1. **Sarvam (`saaras:v4`, `mode=codemix`)** — first candidate for Siya: explicit Hinglish mode, India positioning, simple REST for Talk batch turns, cost in ₹ clear. Must prove accuracy on phrases 05–07 (feedback) and 12–15 (code-switch).
2. **Deepgram Nova-3 `language=multi`** — second: if Sarvam WER is weak on English clinic names / “Sonu”, Deepgram’s multi + keyterms may win; strong streaming path for Talk.
3. **AssemblyAI** — third for this use case unless realtime WS is already preferred stack; good docs, but bake-off runner path is async-heavy and US-centric for a Hindi-first clinic staff tool.

**Decision rule after the run:** pick the provider with highest **intent-usable** transcript rate on the 15 clips (not raw WER alone) — i.e. can Phase-0 normalize + Ask intent fire? Then confirm streaming latency &lt; ~800 ms p50 on a live mic prototype.

---

## Phase 0 Hinglish coverage (current code — related honesty)

**`feedback kaise dete hain` / `feedback kaise doon` / `main feedback kaise submit karu`:**  
**FAIL — outside Phase 0 scope.** Live normalize → soft-stop territory (`feedback how dete are`, etc.). No feedback aliases wired.

Covered intent *families* (aliases → English; 21 patterns, many duplicate intents):

| # | Maps to English intent |
|---|------------------------|
| 1–9 | what are my tasks today (incl. STT scramble / jaane koshish) |
| 10 | urgent tasks for me |
| 11–13 | start my shift |
| 14–15 | has anyone tried any drills |
| 16 | staff performance |
| 17–18 | `{Name}'s performance` |
| 19 | how do I use clear chat |
| 20 | how do I use the mic |
| 21 | how do I use Talk Mode |

Plus word glossary (`aaj`, `mera`, `kya`, `kaam`/`kam`, …) — **not** a full Hinglish NLU.

---

## Next action

Sarvam key is already set. When Deepgram and Assembly keys are ready, export them in the same terminal and re-run the same script. Missing keys skip; Sarvam will re-score alongside them.

```bash
export DEEPGRAM_API_KEY=…
export ASSEMBLYAI_API_KEY=…
cd /Users/sp/amcare-os/apps/hipaa-training && npx tsx scripts/stt-bakeoff-run.ts
```
