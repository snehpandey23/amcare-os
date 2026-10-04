"""Hard pause gate for Python educational HTML generators."""
from __future__ import annotations

import json
import os
import sys

_FLAG = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "CONTENT-GENERATION-PAUSE.json")


def content_generation_is_paused() -> bool:
    if os.environ.get("SIYA_ALLOW_CONTENT_GENERATION") == "1":
        return False
    try:
        with open(_FLAG, encoding="utf-8") as f:
            return json.load(f).get("paused") is True
    except (OSError, json.JSONDecodeError):
        return False


def exit_if_content_generation_paused(script_name: str = "generator") -> None:
    if not content_generation_is_paused():
        return
    print(
        f"[PAUSED] {script_name}: educational content generation is paused "
        f"(data/CONTENT-GENERATION-PAUSE.json). No HTML written. "
        f"Override for one run: SIYA_ALLOW_CONTENT_GENERATION=1",
        file=sys.stderr,
    )
    sys.exit(0)
