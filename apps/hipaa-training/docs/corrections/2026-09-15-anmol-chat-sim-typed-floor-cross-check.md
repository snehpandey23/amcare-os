# Correction — Anmol chat-sim-typed Grammar (floor cross-check)

| | |
|--|--|
| **Authorizer** | Founder (Sneh) — explicit chat confirmation 2026-09-15 IST (“go ahead and write it: Grammar 100, section score 82, per the field list above”) |
| **Corrected at (UTC)** | 2026-09-15T07:19:10.788Z (attempt write); aggregates restored to canonical shape immediately after |
| **Operator** | Cursor agent (this session), production Neon `siya-staff-portal` |
| **Trainee** | `anmol@siya.health` |
| **Sitting** | `2026-09` (status `open`; `composite_summary` null — not locked) |
| **Attempt id** | `sit-chat-typed-1789437761277` |
| **Section** | `chat-sim-typed` |
| **Submitted at** | 2026-09-15T02:06:55.383Z |

## Reason

Live scoring briefly included `relevance_floor_cross_check` (from `5ff27e77`): when turn Relevance was near-floor, Grammar was injected as failed even with no native grammar issues.

On this attempt, turn 2 (`Sure! It went through yesterday.`) received only that inject → stored Grammar **67** with a single `grammarIssues` entry of kind `relevance_floor_cross_check`. No ESL/native grammar flags on any turn.

The floor cross-check was surgically undeployed from production on 2026-09-15 (see `docs/PRODUCTION_STATE.md`). This record is a **one-off historical correction** so the stored grade matches scoring without that amplifier. **Relevance was not rewritten** (underlying R heuristics remain a separate issue).

Related: undeploy branch commit `f5c9dc4f`; prod staff app `dpl_7q7hWysjmnnjm4KTcZfsLxgSuhxf`.

## Before → after

| Field | Before | After |
|-------|--------|-------|
| `siya_competency_section_attempts.section_score` | 71 | **82** |
| `trail_json.grammar` | 67 | **100** |
| `trail_json.politeness` | 100 | 100 (unchanged) |
| `trail_json.relevance` | 45 | 45 (unchanged) |
| `trail_json.grammarIssues` | `[{ kinds: ["relevance_floor_cross_check"], messageIndex: 1, excerpt: "Sure! It went through yesterday." }]` | **`[]`** |
| `section_aggregates["chat-sim-typed"].averageScore` | 71 | **82** |

Section formula: `round((G + P + R) / 3)` → `round((100 + 100 + 45) / 3) = 82`.

## Scope

- **This attempt only.** No other trainees / attempts batch-corrected.
- Transcript, safety, R/P, and other sections untouched.
- Sitting left `open`; composite not locked.

## Trainee notification

**Open decision:** whether Anmol is told his score was corrected and why. Not decided in the authorizing message — resolve before it surfaces if he notices a changed number in history.
