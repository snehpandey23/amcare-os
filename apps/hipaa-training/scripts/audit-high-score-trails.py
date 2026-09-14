#!/usr/bin/env python3
"""Pull high-score competency section trails (non-QA) for integrity audit.

Usage (from repo root, with DATABASE_URL set):
  set -a && source integrations/hipaa-training-api/.env.audit.prod && set +a
  python3 apps/hipaa-training/scripts/audit-high-score-trails.py
"""
from __future__ import annotations

import json
import os
import re
from collections import Counter
from pathlib import Path

import psycopg2
from psycopg2.extras import RealDictCursor

OUT = Path("/tmp/high_score_attempts.json")
EXTRACT = Path("/tmp/high_score_extract.json")


def is_qa(email: str | None, name: str | None = "") -> bool:
    e = (email or "").lower()
    n = (name or "").lower()
    return (
        any(x in e for x in ["qa-test", "+qa", "@test", "qa-feedback", "automated"])
        or "qa test" in n
        or e.startswith("qa-")
        or "do not use" in n
    )


def extract_texts(section: str, trail: dict) -> dict:
    """Pull human-visible submitted text from trail shapes used by exam lanes."""
    if not isinstance(trail, dict):
        return {"raw_keys": [], "messages": [], "transcripts": [], "notes": []}

    messages: list[str] = []
    transcripts: list[str] = []
    notes: list[str] = []
    scores: dict = {}

    # Common shapes
    for key in ("messages", "turns", "lines", "chatTurns", "replyTrail"):
        rows = trail.get(key)
        if isinstance(rows, list):
            for row in rows:
                if isinstance(row, str) and row.strip():
                    messages.append(row.strip())
                elif isinstance(row, dict):
                    who = (row.get("who") or row.get("role") or row.get("speaker") or "").lower()
                    text = row.get("text") or row.get("content") or row.get("reply") or row.get("transcript")
                    if isinstance(text, str) and text.strip():
                        if who in ("patient", "persona", "assistant", "system"):
                            continue
                        if who in ("staff", "user", "trainee", "ma", "learner") or not who:
                            messages.append(text.strip())

    for key in ("transcripts", "spokenTurns", "sttTurns", "rawTranscripts"):
        rows = trail.get(key)
        if isinstance(rows, list):
            for row in rows:
                if isinstance(row, str) and row.strip():
                    transcripts.append(row.strip())
                elif isinstance(row, dict):
                    text = row.get("transcript") or row.get("text") or row.get("raw") or row.get("content")
                    if isinstance(text, str) and text.strip():
                        transcripts.append(text.strip())

    for key in ("listeningText", "providerMessage", "listeningReply", "note", "writingText", "essay"):
        val = trail.get(key)
        if isinstance(val, str) and val.strip():
            notes.append(val.strip())

    feedback = trail.get("feedback") or trail.get("scores") or trail.get("result") or {}
    if isinstance(feedback, dict):
        for k in (
            "grammarScore",
            "relevanceScore",
            "politenessScore",
            "overallScore",
            "sectionScore",
            "grammarNote",
            "relevanceNote",
        ):
            if k in feedback:
                scores[k] = feedback[k]

    # Nested evaluation blobs
    for nest_key in ("evaluation", "evaluateResult", "scoring", "sessionScore"):
        nest = trail.get(nest_key)
        if isinstance(nest, dict):
            for k, v in nest.items():
                if "score" in k.lower() or "note" in k.lower():
                    scores[k] = v
            for mk in ("staffMessages", "userMessages", "replies"):
                rows = nest.get(mk)
                if isinstance(rows, list):
                    for row in rows:
                        if isinstance(row, str) and row.strip():
                            messages.append(row.strip())
                        elif isinstance(row, dict):
                            text = row.get("text") or row.get("content")
                            if isinstance(text, str) and text.strip():
                                messages.append(text.strip())

    # Listening estimate / free text
    if section in ("listening", "listening_estimate"):
        for key, val in trail.items():
            if isinstance(val, str) and len(val) > 40 and key.lower() not in ("content_fingerprint",):
                if key not in notes:
                    notes.append(val.strip())

    return {
        "raw_keys": sorted(trail.keys()),
        "messages": messages[:40],
        "transcripts": transcripts[:40],
        "notes": notes[:20],
        "score_fields": scores,
    }


def main() -> None:
    url = os.environ.get("DATABASE_URL")
    if not url or "postgres" not in url.lower():
        raise SystemExit("DATABASE_URL missing")

    conn = psycopg2.connect(url)
    cur = conn.cursor(cursor_factory=RealDictCursor)

    cur.execute(
        """
        SELECT a.id, a.user_id, u.email, u.name, a.sitting_id, a.section, a.section_score,
               a.submitted_at, a.active_sec, a.trail_json, a.safety_red_flagged, a.safety_json
        FROM siya_competency_section_attempts a
        JOIN hipaa_training_users u ON u.id = a.user_id
        WHERE a.submitted_at >= NOW() - INTERVAL '60 days'
          AND a.section_score IS NOT NULL
          AND a.section_score >= 85
        ORDER BY a.section_score DESC, a.submitted_at DESC
        LIMIT 150
        """
    )
    rows = cur.fetchall()
    out = []
    for r in rows:
        if is_qa(r["email"], r["name"]):
            continue
        trail = r["trail_json"] or {}
        if isinstance(trail, str):
            try:
                trail = json.loads(trail)
            except Exception:
                trail = {}
        out.append(
            {
                "id": r["id"],
                "email": r["email"],
                "name": r["name"],
                "section": r["section"],
                "score": float(r["section_score"]),
                "submitted_at": r["submitted_at"].isoformat() if r["submitted_at"] else None,
                "active_sec": float(r["active_sec"]) if r["active_sec"] is not None else None,
                "red_flag": bool(r["safety_red_flagged"]),
                "trail_keys": list(trail.keys()) if isinstance(trail, dict) else type(trail).__name__,
                "trail": trail,
                "extracted": extract_texts(r["section"], trail if isinstance(trail, dict) else {}),
                "safety": r["safety_json"],
            }
        )

    OUT.write_text(json.dumps(out, indent=2, default=str))
    print("high_score_non_qa", len(out), "of_raw", len(rows))
    print("by_section", dict(Counter(o["section"] for o in out)))

    perfect = [o for o in out if o["score"] >= 99.5]
    print("near_perfect_count", len(perfect))
    for o in perfect[:40]:
        print(f"{o['score']:5.1f} {o['section']:16} {o['email']:32} {o['submitted_at']}")

    # Compact extract for human review (chat/listening/spoken/writing with text)
    focus_sections = {
        "typed_chat",
        "chat",
        "spoken_chat",
        "spoken",
        "listening",
        "listening_estimate",
        "writing",
        "typed",
    }
    extract = []
    for o in out:
        if o["section"] not in focus_sections and not any(
            x in o["section"] for x in ("chat", "spoken", "listen", "writ")
        ):
            # still include 100% of any section for overview
            if o["score"] < 99.5:
                continue
        ex = o["extracted"]
        texts = ex["messages"] + ex["transcripts"] + ex["notes"]
        if not texts and o["score"] < 99.5:
            continue
        extract.append(
            {
                "id": o["id"],
                "email": o["email"],
                "name": o["name"],
                "section": o["section"],
                "score": o["score"],
                "submitted_at": o["submitted_at"],
                "trail_keys": o["trail_keys"],
                "score_fields": ex["score_fields"],
                "staff_texts": texts[:20],
                "red_flag": o["red_flag"],
            }
        )

    EXTRACT.write_text(json.dumps(extract, indent=2, default=str))
    print("extract_rows", len(extract), "->", EXTRACT)

    cur.execute(
        """
        SELECT a.section, COUNT(*) n,
               ROUND(AVG(a.section_score)::numeric,1) avg,
               COUNT(*) FILTER (WHERE a.section_score >= 90) high90,
               COUNT(*) FILTER (WHERE a.section_score >= 100) perfect,
               ROUND(MIN(a.section_score)::numeric,1) min_s,
               ROUND(MAX(a.section_score)::numeric,1) max_s
        FROM siya_competency_section_attempts a
        JOIN hipaa_training_users u ON u.id = a.user_id
        WHERE a.submitted_at >= NOW() - INTERVAL '14 days'
          AND a.section_score IS NOT NULL
          AND LOWER(u.email) NOT LIKE '%qa%'
          AND LOWER(COALESCE(u.name,'')) NOT LIKE '%qa test%'
        GROUP BY a.section
        ORDER BY a.section
        """
    )
    print("\n=== 14d attempt stats non-QA ===")
    for r in cur.fetchall():
        print(dict(r))

    cur.execute(
        """
        SELECT email, name, role, last_login_at
        FROM hipaa_training_users
        WHERE deactivated_at IS NULL
          AND last_login_at >= NOW() - INTERVAL '14 days'
        ORDER BY last_login_at DESC NULLS LAST
        """
    )
    print("\n=== logins 14d non-QA ===")
    n = 0
    for r in cur.fetchall():
        if is_qa(r["email"], r["name"]):
            continue
        print(r["last_login_at"], r["email"], r["role"])
        n += 1
    print("login_count", n)

    # Sample trail key shapes for chat-like 100%s
    print("\n=== sample trail keys for chat/spoken/listening >=95 ===")
    for o in out:
        if o["score"] < 95:
            continue
        if not any(x in o["section"] for x in ("chat", "spoken", "listen", "writ", "typ")):
            continue
        print(o["section"], o["score"], o["email"], o["trail_keys"][:20])
        texts = o["extracted"]["messages"] + o["extracted"]["transcripts"] + o["extracted"]["notes"]
        for t in texts[:6]:
            preview = re.sub(r"\s+", " ", t)[:180]
            print("  TEXT:", preview)
        print("  SCORES:", o["extracted"]["score_fields"])

    conn.close()
    print("WROTE", OUT)


if __name__ == "__main__":
    main()
