#!/usr/bin/env python3
"""Refresh ## Deploy count by day in apps/siya-health/internal/demo-qa/deploy-log.md."""
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path


def main(log_path: Path) -> None:
    text = log_path.read_text() if log_path.exists() else ""

    started: dict[str, dict[str, int]] = defaultdict(lambda: {"prod": 0, "preview": 0})
    ok: dict[str, dict[str, int]] = defaultdict(lambda: {"prod": 0, "preview": 0})
    refused_quota: dict[str, int] = defaultdict(int)

    for line in text.splitlines():
        if not line.startswith("| 20"):
            continue
        parts = [p.strip() for p in line.strip("|").split("|")]
        if len(parts) < 7:
            continue
        day = parts[0][:10]
        target = parts[3].lower()
        result = parts[5].upper()
        note = parts[6].lower()
        if "api-deployments-free-per-day" in note or "quota" in note:
            refused_quota[day] += 1
        if result == "STARTED":
            if "preview" in target:
                started[day]["preview"] += 1
            elif "production" in target:
                started[day]["prod"] += 1
        if result == "OK":
            if "preview" in target:
                ok[day]["preview"] += 1
            elif "production" in target:
                ok[day]["prod"] += 1

    days = sorted(set(started) | set(ok) | set(refused_quota), reverse=True)[:14]
    block_lines = [
        "## Deploy count by day (IST)",
        "",
        "Hygiene: intermediate checks = **local** generate + contact sheets + QA gates.",
        "Preview only for an explicit review link or immediately before prod promote.",
        "Log `STARTED` ≈ CLI attempts from this script (Git/Vercel auto-builds also burn quota).",
        "",
        "| Day (IST) | Prod STARTED | Prod OK | Preview STARTED | Preview OK | Quota REFUSED |",
        "|---|---:|---:|---:|---:|---:|",
    ]
    if not days:
        block_lines.append("| _(none yet)_ | 0 | 0 | 0 | 0 | 0 |")
    else:
        for d in days:
            block_lines.append(
                "| {d} | {sp} | {op} | {sv} | {ov} | {q} |".format(
                    d=d,
                    sp=started[d]["prod"],
                    op=ok[d]["prod"],
                    sv=started[d]["preview"],
                    ov=ok[d]["preview"],
                    q=refused_quota[d],
                )
            )
    block = "\n".join(block_lines) + "\n"

    hygiene = """# siya-health deploy log

## Hygiene (2026-10-07)

- Intermediate checks: local `node scripts/generate-employer-demo.mjs` + `internal/demo-qa/contact-sheet.mjs` + release gates.
- **Do not** run `npx vercel deploy` for polish iterations.
- Preview: `bash scripts/deploy-siya-health.sh --preview` with `PREVIEW_REASON=review-link` or `pre-prod` only.
- Production: `--prod` + `SIYA_HEALTH_RELEASE_BRANCH` + `PROMOTE_APPROVED`.

"""

    if not log_path.exists() or not text.strip():
        log_path.parent.mkdir(parents=True, exist_ok=True)
        log_path.write_text(
            hygiene
            + block
            + "\n| Time (IST) | Branch | Hash | Target | Who | Result | Note |\n|---|---|---|---|---|---|---|\n"
        )
        print(block)
        return

    if "## Hygiene" not in text:
        text = text.replace("# siya-health deploy log\n", hygiene, 1)
        if "## Hygiene" not in text:
            text = hygiene + text

    if "## Deploy count by day" in text:
        text = re.sub(
            r"## Deploy count by day \(IST\)[\s\S]*?(?=\n\| Time \(IST\)|\n## [^\n]+\n|\Z)",
            block + "\n",
            text,
            count=1,
        )
    else:
        text = re.sub(
            r"\n\| Time \(IST\) \|",
            "\n" + block + "\n| Time (IST) |",
            text,
            count=1,
        )

    log_path.write_text(text)
    print(block)


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    path = Path(sys.argv[1]) if len(sys.argv) > 1 else root / "apps/siya-health/internal/demo-qa/deploy-log.md"
    main(path)
