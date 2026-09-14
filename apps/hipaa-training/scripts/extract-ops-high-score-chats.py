#!/usr/bin/env python3
"""Extract high-score chat-sim sessions from a saved /api/ops/dashboard dump."""
from __future__ import annotations

import json
import re
from pathlib import Path

DASH = Path("/tmp/ops_dashboard.json")
OUT = Path("/tmp/chat_sim_high_sessions.json")
REPORT = Path("/tmp/high_score_audit_report.md")


def is_qa(email: str | None, name: str | None = "") -> bool:
    e = (email or "").lower()
    n = (name or "").lower()
    return (
        any(x in e for x in ["qa-test", "+qa", "qa-feedback", "@test"])
        or e.startswith("qa-")
        or "qa test" in n
        or "do not use" in n
    )


def looks_broken_english(text: str) -> list[str]:
    """Heuristic flags for human review — not the production scorer."""
    flags: list[str] = []
    t = text.strip()
    if not t:
        return ["empty"]
    lower = t.lower()
    # Very broken patterns a lenient scorer might miss
    if re.search(r"\bi\s+is\b|\byou\s+is\b|\bhe\s+are\b|\bshe\s+are\b|\bthey\s+is\b", lower):
        flags.append("clear_sva_error")
    if re.search(r"\b(informations|advices|stuffs)\b", lower):
        flags.append("noncount_plural")
    if re.search(r"\b(pls|plz|u\b|ur\b|dont|cant|wont)\b", lower) and len(t.split()) <= 8:
        flags.append("heavy_text_speak_short")
    words = re.findall(r"[A-Za-z']+", t)
    if words and sum(1 for w in words if len(w) >= 4 and not re.search(r"[aeiou]", w, re.I)) >= 2:
        flags.append("multiple_consonant_only_tokens")
    # Word salad-ish: few function words in a long reply
    function = {"the", "a", "an", "to", "for", "of", "and", "is", "are", "you", "i", "we", "can", "will", "please"}
    if len(words) >= 12:
        func_ratio = sum(1 for w in words if w.lower() in function) / len(words)
        if func_ratio < 0.08:
            flags.append("low_function_word_ratio")
    if re.search(r"\b(appointment|schedule|insurance|doctor|clinic)\b", lower) is None and len(words) >= 20:
        # not necessarily bad — just mark long off-domain-ish for chat-sim context
        pass
    return flags


def main() -> None:
    data = json.loads(DASH.read_text())
    engagement = data.get("engagement") or []
    sessions = []
    for row in engagement:
        if is_qa(row.get("email"), row.get("name")):
            continue
        for e in row.get("dayLedger") or []:
            if not isinstance(e, dict) or e.get("drill") != "patientChat":
                continue
            cs = e.get("chatSim") or {}
            if not isinstance(cs, dict):
                continue
            g, r, p = cs.get("grammarScore"), cs.get("relevanceScore"), cs.get("politenessScore")
            scores = [x for x in (g, r, p) if isinstance(x, (int, float))]
            mean = round(sum(scores) / len(scores)) if scores else None
            you_texts = []
            for t in cs.get("transcript") or []:
                if isinstance(t, dict) and t.get("who") == "you" and (t.get("text") or "").strip():
                    text = (t.get("text") or "").strip()
                    you_texts.append(
                        {
                            "text": text,
                            "modality": t.get("inputModality"),
                            "sttRaw": t.get("sttRaw"),
                            "heuristic_flags": looks_broken_english(text),
                        }
                    )
            sessions.append(
                {
                    "email": row.get("email"),
                    "name": row.get("name"),
                    "date": e.get("date"),
                    "at": e.get("at"),
                    "persona": cs.get("personaName") or cs.get("personaId"),
                    "grammar": g,
                    "relevance": r,
                    "politeness": p,
                    "mean": mean,
                    "spokenSession": cs.get("spokenSession"),
                    "outcome": cs.get("outcome"),
                    "redFlagged": cs.get("redFlagged"),
                    "you_texts": you_texts,
                    "turn_count": len(cs.get("transcript") or []),
                }
            )

    review = [s for s in sessions if isinstance(s["grammar"], (int, float)) and s["grammar"] >= 85]
    OUT.write_text(json.dumps(review, indent=2, default=str))

    lines: list[str] = []
    lines.append("# High-score chat-sim audit (practice day-ledger via /api/ops/dashboard)")
    lines.append("")
    lines.append(f"- Non-QA patientChat sessions: **{len(sessions)}**")
    lines.append(f"- Grammar ≥85 with persisted transcript: **{len(review)}**")
    g100 = [s for s in review if s["grammar"] == 100]
    lines.append(f"- Grammar = 100: **{len(g100)}**")
    lines.append("")
    lines.append("## Note on exam sittings")
    lines.append("")
    lines.append(
        "Competency-exam chat-sim `trail_json` currently stores only "
        "`{grammar, politeness, relevance}` — **not the spoken/typed turns**. "
        "So Alpana’s September sitting spoken **100** cannot be text-audited from sitting trails. "
        "Practice ledger transcripts are the best available evidence for scoring leniency."
    )
    lines.append("")
    lines.append("## Grammar ≥95 — quoted staff replies")
    lines.append("")

    suspicious = 0
    for s in sorted(review, key=lambda x: (-(x["grammar"] or 0), x["email"] or "")):
        if (s["grammar"] or 0) < 95:
            continue
        flagged_turns = [t for t in s["you_texts"] if t["heuristic_flags"]]
        if flagged_turns:
            suspicious += 1
        lines.append(
            f"### {s['name']} (`{s['email']}`) · {s['persona']} · {s['date']} · "
            f"G{s['grammar']} R{s['relevance']} P{s['politeness']} mean={s['mean']} · "
            f"spoken={s['spokenSession']}"
        )
        lines.append("")
        if not s["you_texts"]:
            lines.append("_No `you` turns in transcript (legacy summary-only)._")
            lines.append("")
            continue
        for i, t in enumerate(s["you_texts"], 1):
            flag = f" ⚠️ {', '.join(t['heuristic_flags'])}" if t["heuristic_flags"] else ""
            lines.append(f"{i}. ({t.get('modality') or 'typed'}){flag}")
            lines.append("")
            lines.append(f"> {t['text']}")
            lines.append("")
            if t.get("sttRaw") and t["sttRaw"] != t["text"]:
                lines.append(f"> sttRaw: {t['sttRaw']}")
                lines.append("")

    lines.append("## Heuristic suspicion count")
    lines.append("")
    lines.append(
        f"Sessions with grammar≥95 that also have ≥1 heuristically-flagged staff turn: **{suspicious}** "
        "(clear SVA / text-speak / low function-word density — independent of production scorer)."
    )
    lines.append("")
    lines.append("## Sitting high scores (admin sittings API, non-QA)")
    lines.append("")
    sit = json.loads(Path("/tmp/sitting_high_scores.json").read_text())
    for r in sorted(sit["rows"], key=lambda x: -x["averageScore"]):
        if r["averageScore"] < 85:
            continue
        lines.append(
            f"- **{r['averageScore']}** `{r['section']}` · {r['email']} · {r['lastAttemptAt']} · attempts={r['attemptCount']}"
        )

    REPORT.write_text("\n".join(lines))
    print("sessions", len(sessions), "review", len(review), "g100", len(g100), "suspicious", suspicious)
    print("WROTE", OUT)
    print("WROTE", REPORT)


if __name__ == "__main__":
    main()
