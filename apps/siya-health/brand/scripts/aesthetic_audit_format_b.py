#!/usr/bin/env python3
"""
Aesthetic audit for Format B statics — Visual OS v1.4.9+

Run after every compose:
  python3 brand/scripts/aesthetic_audit_format_b.py --image path/to/4x5.png

Scores /50 (ship gate ≥40). Prints PASS / WARN / FAIL with reasons.
This is the mechanical half of the audit; agents also do a 3-second glance read.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path

from PIL import Image, ImageFilter, ImageStat

CREAM = (0xF4, 0xEF, 0xE7)
INK = (0x21, 0x18, 0x13)
PLUM = (0x8D, 0x3A, 0x78)
MIN_CONTRAST = 4.5


@dataclass
class Score:
    name: str
    points: float
    max_points: float
    note: str


def rel_lum(rgb: tuple[int, int, int]) -> float:
    def chan(c: int) -> float:
        x = c / 255.0
        return x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4

    r, g, b = rgb
    return 0.2126 * chan(r) + 0.7152 * chan(g) + 0.0722 * chan(b)


def contrast_ratio(a: tuple[int, int, int], b: tuple[int, int, int]) -> float:
    l1, l2 = rel_lum(a), rel_lum(b)
    lighter, darker = max(l1, l2), min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)


def sample_avg(im: Image.Image, box: tuple[int, int, int, int], step: int = 8) -> tuple[int, int, int]:
    x0, y0, x1, y1 = [int(v) for v in box]
    x0, y0 = max(0, x0), max(0, y0)
    x1, y1 = min(im.width, x1), min(im.height, y1)
    px = im.convert("RGB").load()
    rs = gs = bs = n = 0
    for y in range(y0, y1, step):
        for x in range(x0, x1, step):
            r, g, b = px[x, y]
            rs += r
            gs += g
            bs += b
            n += 1
    if not n:
        return CREAM
    return (rs // n, gs // n, bs // n)


def find_dark_type_samples(im: Image.Image, top_frac: float = 0.55) -> list[tuple[int, int, int]]:
    """Collect navy-ish type pixels in the headline band (B-forward, not brown)."""
    w, h = im.size
    px = im.convert("RGB").load()
    darks: list[tuple[int, int, int]] = []
    for y in range(0, int(h * top_frac), 3):
        for x in range(40, min(w - 40, int(w * 0.7)), 3):
            r, g, b = px[x, y]
            # Navy headline: blue channel leads, not too bright
            if b > 60 and b >= r + 20 and b > g + 15 and max(r, g, b) < 160:
                darks.append((r, g, b))
            # Magenta accent samples
            elif r > 140 and b > 80 and g < 80 and r > g + 40:
                darks.append((r, g, b))
    return darks


def avg_rgb(samples: list[tuple[int, int, int]]) -> tuple[int, int, int]:
    if not samples:
        return INK
    n = len(samples)
    return (
        sum(s[0] for s in samples) // n,
        sum(s[1] for s in samples) // n,
        sum(s[2] for s in samples) // n,
    )


def seam_score(im: Image.Image) -> float:
    """
    Detect hard vertical L-cut: strong edge band in mid-left column.
    Lower edge energy = more full-bleed emotional (better).
    """
    w, h = im.size
    band = im.crop((int(w * 0.45), int(h * 0.08), int(w * 0.62), int(h * 0.72))).convert("L")
    edges = band.filter(ImageFilter.FIND_EDGES)
    return float(ImageStat.Stat(edges).mean[0])


def photo_visibility(im: Image.Image) -> tuple[float, str]:
    """
    Right/lower regions should still look photographic (variance + not flat cream).
    """
    w, h = im.size
    zone = im.crop((int(w * 0.55), int(h * 0.35), w - 20, h - 80)).convert("RGB")
    st = ImageStat.Stat(zone)
    mean = sum(st.mean) / 3
    var = sum(st.var) / 3
    # Flat cream card ≈ high mean, low var
    if var < 180 and mean > 230:
        return 2.0, f"zone looks like cream card (mean={mean:.0f} var={var:.0f})"
    if var < 400:
        return 6.0, f"low photo detail (var={var:.0f})"
    return 10.0, f"photo detail present (var={var:.0f})"


def fade_presence(im: Image.Image) -> tuple[float, str]:
    """Rough check: overall lift toward cream vs raw harsh photo."""
    w, h = im.size
    avg = sample_avg(im, (0, 0, w, h), step=12)
    # Distance from cream — faded frames sit closer to cream than raw
    dist = sum(abs(a - c) for a, c in zip(avg, CREAM)) / 3
    if dist < 28:
        return 4.0, f"possibly over-faded (dist_cream={dist:.0f})"
    if dist > 90:
        return 5.0, f"little fade lift (dist_cream={dist:.0f}) — consider ~20% cream fade"
    return 8.0, f"soft fade band OK (dist_cream={dist:.0f})"


def color_harmony(im: Image.Image) -> tuple[float, str]:
    """Type should be Deep Siya Navy family — not brown, not pure black, not gray."""
    samples = find_dark_type_samples(im)
    ink = avg_rgb(samples)
    r, g, b = ink
    # Navy: B dominant or B≈R with low G warmth; not brown (R≥G≥B)
    is_navy = b >= r - 10 and b > g + 5
    is_brown = r >= g >= b - 2 and r > b + 15
    not_pure_black = (r + g + b) > 30
    pts = 0.0
    notes = []
    if is_navy and not is_brown:
        pts += 5
        notes.append("navy-family type")
    elif is_brown:
        pts += 1
        notes.append("FAIL brown type — use Deep Siya Navy")
    else:
        pts += 2
        notes.append("type not clearly navy")
    if not_pure_black:
        pts += 3
        notes.append("not pure black")
    else:
        notes.append("near pure black")
    return pts, f"ink≈{ink} · " + "; ".join(notes)


def contrast_gate(im: Image.Image) -> tuple[float, str]:
    samples = find_dark_type_samples(im)
    ink = avg_rgb(samples)
    # Sample backdrop under upper-left type zone
    backdrop = sample_avg(im, (50, 120, 520, 520), step=6)
    ratio = contrast_ratio(ink, backdrop)
    plum_ratio = contrast_ratio(PLUM, backdrop)
    if ratio >= MIN_CONTRAST:
        return 10.0, f"ink contrast {ratio:.2f} (≥{MIN_CONTRAST}); plum {plum_ratio:.2f}"
    if ratio >= 3.5:
        return 5.0, f"ink contrast {ratio:.2f} weak — deepen scrim or darken type"
    return 0.0, f"ink contrast {ratio:.2f} FAIL (<{MIN_CONTRAST})"


def hierarchy_hint(im: Image.Image) -> tuple[float, str]:
    """Proxy: dark mass in top 45% suggests large headline block."""
    w, h = im.size
    top = im.crop((40, 100, int(w * 0.75), int(h * 0.48))).convert("L")
    dark = sum(1 for p in top.getdata() if p < 80)
    frac = dark / (top.width * top.height)
    if 0.04 <= frac <= 0.28:
        return 7.0, f"headline mass frac={frac:.2%} in hero band"
    if frac < 0.04:
        return 3.0, f"headline may be too light/small (frac={frac:.2%})"
    return 4.0, f"headline may over-cover emotion (frac={frac:.2%})"


def audit(path: Path) -> dict:
    im = Image.open(path).convert("RGB")
    scores: list[Score] = []

    edge = seam_score(im)
    if edge < 12:
        scores.append(Score("full_bleed_emotion", 10, 10, f"no hard L seam (edge={edge:.1f})"))
    elif edge < 22:
        scores.append(Score("full_bleed_emotion", 6, 10, f"mild seam risk (edge={edge:.1f})"))
    else:
        scores.append(Score("full_bleed_emotion", 2, 10, f"hard vertical cut likely (edge={edge:.1f})"))

    pts, note = photo_visibility(im)
    scores.append(Score("photo_visibility", pts, 10, note))

    pts, note = fade_presence(im)
    scores.append(Score("fade_20", pts, 8, note))

    pts, note = contrast_gate(im)
    scores.append(Score("contrast", pts, 10, note))

    pts, note = color_harmony(im)
    scores.append(Score("color_harmony", pts, 8, note))

    pts, note = hierarchy_hint(im)
    scores.append(Score("hierarchy", pts, 7, note))

    total = sum(s.points for s in scores)
    max_total = sum(s.max_points for s in scores)
    # Normalize to /50
    scaled = round(50 * total / max_total, 1)

    if scaled >= 40 and all(s.points > 0 for s in scores if s.name == "contrast"):
        verdict = "PASS"
    elif scaled >= 32:
        verdict = "WARN"
    else:
        verdict = "FAIL"

    return {
        "image": str(path),
        "verdict": verdict,
        "score": scaled,
        "max": 50,
        "gate": 40,
        "scores": [asdict(s) for s in scores],
        "glance_checklist": [
            "3-second blur: can you still read the hook?",
            "Is the person's emotion visible across the frame (not half-cut)?",
        "Does type read as Deep Siya Navy + Magenta (not brown/black with drop shadows)?",
        "Any Canva card / L seam / milky slab / dark vignette?",
        "Would you ship this next to a Kinfolk/Apple still?",
        ],
    }


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True)
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()
    result = audit(Path(args.image))
    if args.json:
        print(json.dumps(result, indent=2))
        return
    print(f"AESTHETIC AUDIT — {result['verdict']}  {result['score']}/{result['max']} (gate ≥{result['gate']})")
    print(f"image: {result['image']}")
    for s in result["scores"]:
        print(f"  • {s['name']}: {s['points']}/{s['max_points']} — {s['note']}")
    print("\nGlance checklist (human / agent):")
    for q in result["glance_checklist"]:
        print(f"  □ {q}")
    if result["verdict"] == "FAIL":
        raise SystemExit(2)
    if result["verdict"] == "WARN":
        raise SystemExit(1)


if __name__ == "__main__":
    main()
