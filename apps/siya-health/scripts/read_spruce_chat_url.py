"""Read SPRUCE_CHAT_URL from data/providers-core.mjs. Do not hardcode the invite."""
from __future__ import annotations

import os
import re

_CORE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "providers-core.mjs")


def spruce_chat_url() -> str:
    text = open(_CORE, encoding="utf-8").read()
    match = re.search(r"export const SPRUCE_CHAT_URL = '([^']+)'", text)
    if not match:
        raise SystemExit(f"SPRUCE_CHAT_URL not found in {_CORE}")
    return match.group(1)
