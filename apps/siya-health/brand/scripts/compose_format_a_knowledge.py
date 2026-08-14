#!/usr/bin/env python3
"""
Knowledge System compositor — Visual OS v2.2+

Templates:
  A-02 — cream text ladder (no photo)
  A-03 — cream blend panel + photo (Knowledge carousel default)

A-03 lean lock (2026-08-06 — all future Knowledge carousels):
  - DEFAULT on-frame: headline + one sub-headline only (HIMSS-style sparse/prominent)
  - Sub-headline IS the whole message — not a teaser for body copy
  - Body / bullets / takeaway cards OFF unless --dense (explicit opt-in)
  - Headline ~10–12% H · sub-headline large navy (high contrast on cream)
  - Text in LEFT cream zone · soft cream→photo dissolve · faces clear on right
  - Deep Navy + Magenta · NO text drop shadows · NO dark vignette
"""

from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZES = {"4:5": (1080, 1350), "1:1": (1080, 1080)}
CREAM = (0xF4, 0xEF, 0xE7)
NAVY = (0x00, 0x18, 0x78)
NAVY_SUPPORT = (0x0A, 0x24, 0x6B)
MAGENTA = (0xD8, 0x10, 0x88)
MARGIN = 56
LOGO_XY = (56, 48)
LOGO_H = 92  # +~10% vs prior 84 — human review: logo must read clearly

# Soft blend — text cream left, short natural feather (wide feathers bisect people)
PANEL_SOLID_RATIO = 0.46  # wide enough for blur-test Georgia on condition names
PANEL_BLEND_RATIO = 0.14
FACE_PAD = 0.22
FACE_CLEAR_ALPHA = 40  # face fully past nearly-clear cream
SCRIPT_DIR = Path(__file__).resolve().parent


def font_display(size: int) -> ImageFont.FreeTypeFont:
    for p in (
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def font_body(size: int, bold: bool = True) -> ImageFont.FreeTypeFont:
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    for p in (f"/System/Library/Fonts/Supplemental/{name}", f"/Library/Fonts/{name}"):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def knock_white(im: Image.Image, thresh: int = 248) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r >= thresh and g >= thresh and b >= thresh:
                px[x, y] = (r, g, b, 0)
    return im


def tw(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def th(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[3] - b[1]


def wrap(draw, text: str, font, max_w: int) -> list[str]:
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if tw(draw, trial, font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def split_bullets(text: str) -> list[str]:
    """Turn a short paragraph / multi-line block into ≤15-word bullet items.

    Prefer explicit newlines or · separators; otherwise split on sentence boundaries.
    Single short lines stay as one item (caller may still render as lead prose).
    """
    import re

    raw = text.replace("\\n", "\n").strip()
    if not raw:
        return []
    if "\n" in raw or " · " in raw or raw.lstrip().startswith(("•", "-", "–", "—")):
        parts = []
        for chunk in raw.replace(" · ", "\n").split("\n"):
            chunk = chunk.strip().lstrip("•*-–— ").strip()
            if chunk:
                parts.append(chunk)
        return parts
    parts = [p.strip() for p in re.split(r"(?<=[.!?])\s+", raw) if p.strip()]
    return parts if parts else [raw]


def draw_bullets(draw, items: list[str], font, max_w: int, x: int, y: int, fill=NAVY_SUPPORT, gap: int = 18) -> int:
    """Render small magenta-dot bullets. Returns next y. Uniform gap between items."""
    if not items:
        return y
    bullet_r = 5
    text_x = x + 22
    text_w = max(120, max_w - 22)
    for item in items:
        lines = wrap(draw, item, font, text_w)
        lh = th(draw, lines[0], font)
        cy = y + lh // 2
        draw.ellipse(
            [x, cy - bullet_r, x + bullet_r * 2, cy + bullet_r],
            fill=MAGENTA,
        )
        for ln in lines:
            draw.text((text_x, y), ln, font=font, fill=fill)
            y += th(draw, ln, font) + 4
        y += gap
    return y


def detect_faces(photo: Path) -> list[tuple[float, float, float, float]]:
    """Face boxes (x0,y0,x1,y1) in source pixels via macOS Vision helper."""
    bin_path = SCRIPT_DIR / "siya_faces"
    if not bin_path.exists():
        return []
    try:
        out = subprocess.check_output(
            [str(bin_path), str(photo)], text=True, stderr=subprocess.DEVNULL
        ).strip()
    except Exception:
        return []
    if not out:
        return []
    faces = []
    for part in out.split(";"):
        nums = [float(x) for x in part.split(",") if x.strip()]
        if len(nums) == 4:
            faces.append((nums[0], nums[1], nums[2], nums[3]))
    return faces


def pad_face(box, sw: int, sh: int, pad: float = FACE_PAD):
    x0, y0, x1, y1 = box
    bw, bh = x1 - x0, y1 - y0
    x0 = max(0, x0 - bw * pad)
    y0 = max(0, y0 - bh * pad * 1.2)  # forehead / hair
    x1 = min(sw, x1 + bw * pad)
    y1 = min(sh, y1 + bh * pad * 0.6)
    return x0, y0, x1, y1


def cream_alpha_at(x: int, solid: int, blend: int) -> int:
    """Smooth S-curve feather — optical dissolve, not a hard half-cut."""
    if x <= solid:
        return 248
    if x >= solid + blend:
        return 0
    t = (x - solid) / max(1, blend)
    s = t * t * (3 - 2 * t)  # smoothstep
    return int(248 * (1 - s) ** 1.15)


def face_clear_x(solid: int, blend: int) -> int:
    """X where cream is gone enough that a person reads cleanly (end of feather)."""
    # Past ~90% of the feather — avoids soft “ghost cut” through shoulders
    return solid + int(blend * 0.92)


def cover_crop_face_safe(
    im: Image.Image,
    tw_: int,
    th_: int,
    faces: list[tuple[float, float, float, float]],
    clear_x: int,
) -> tuple[Image.Image, int]:
    """
    Crop so EVERY face sits fully in the clear photo zone (x ≥ clear_x).
    Zooms + pans as needed. Returns (crop, effective_clear_x) — clear_x may
    be reduced if faces are too wide for the requested cream layout.
    """
    im = im.convert("RGB")
    sw, sh = im.size
    cover = max(tw_ / sw, th_ / sh)

    if not faces:
        scale = cover
        nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
        resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
        left = max(0, min(int((nw - tw_) * 0.72), nw - tw_))
        top = max(0, min(int((nh - th_) * 0.42), nh - th_))
        return resized.crop((left, top, left + tw_, top + th_)), clear_x

    padded = [pad_face(f, sw, sh) for f in faces]
    face_left = min(p[0] for p in padded)
    face_right = max(p[2] for p in padded)
    face_top = min(p[1] for p in padded)
    face_bot = max(p[3] for p in padded)
    # Include near shoulder so the fade doesn’t bisect the torso
    shoulder_left = max(0.0, face_left - (face_right - face_left) * 0.45)
    face_span = max(1.0, face_right - shoulder_left)

    # Max clear_x that still lets shoulder→face sit in the clear zone
    max_clear = int((tw_ - 36) * shoulder_left / max(face_right, 1.0))
    eff_clear = min(clear_x, max_clear)
    if eff_clear < clear_x:
        print(f"A-03 softens cream for faces: clear {clear_x}→{eff_clear}")

    # Scale so shoulder can sit at eff_clear
    scale_pan = (eff_clear + 4) / max(shoulder_left, 1.0)
    # If source subject is already right-weighted, don't over-zoom (clips head)
    right_weighted = face_left > sw * 0.52
    scale = max(cover, scale_pan)
    max_zoom = cover * (1.22 if right_weighted else 1.65)
    if scale > max_zoom:
        scale = max_zoom
        eff_clear = min(eff_clear, int(shoulder_left * scale))
    face_h = max(face_bot - face_top, 1.0)
    if face_h * scale > th_ - 48:
        scale = min(scale, (th_ - 48) / face_h)
        eff_clear = min(eff_clear, int(shoulder_left * scale))

    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    if nw < tw_:
        scale = tw_ / sw * 1.08
        nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)

    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    rf = [(a * scale, b * scale, c * scale, d * scale) for a, b, c, d in padded]
    rs_left = [t[0] - (t[2] - t[0]) * 0.45 for t in rf]

    leftmost = min(rs_left)  # shoulder
    facestart = min(t[0] for t in rf)
    rightmost = max(t[2] for t in rf)
    topmost = min(t[1] for t in rf)
    bottommost = max(t[3] for t in rf)

    prefer_x = max(eff_clear, int(tw_ * 0.55))
    # Never clip the right edge of any face to chase a rightward prefer
    face_span_r = rightmost - leftmost
    max_prefer = tw_ - 20 - face_span_r
    if max_prefer >= eff_clear:
        prefer_x = min(prefer_x, max_prefer)
    else:
        prefer_x = eff_clear
    left = int(round(leftmost - prefer_x))
    if rightmost - left > tw_ - 12:
        left = int(round(rightmost - (tw_ - 12)))
    if leftmost - left < eff_clear:
        left = int(round(leftmost - eff_clear))
    left = max(0, min(nw - tw_, left))

    top = int(round(topmost - th_ * 0.16))
    if bottommost - top > th_ - 24:
        top = int(round(bottommost - th_ + 24))
    if topmost - top < 20:
        top = int(round(topmost - 20))
    top = max(0, min(nh - th_, top))

    for fx0, fy0, fx1, fy1 in rf:
        if fx0 - left < eff_clear - 8:
            print(f"A-03 WARN face under cream: x0={fx0-left:.0f} clear={eff_clear}")
        if fx1 - left > tw_ - 4:
            print(f"A-03 WARN face clips right")

    print(
        f"A-03 crop scale={scale:.3f} left={left} clear={eff_clear} "
        f"shoulder→{[int(s-left) for s in rs_left]} face→{[int(t[0]-left) for t in rf]}–{[int(t[2]-left) for t in rf]}"
    )
    return resized.crop((left, top, left + tw_, top + th_)), eff_clear


def cream_blend_base(photo: Path, w: int, h: int) -> tuple[Image.Image, int]:
    """
    Soft left cream dissolve + face-safe photo crop.
    Cream solid width adapts so ALL faces stay fully visible.
    """
    faces = detect_faces(photo)
    blend = int(w * PANEL_BLEND_RATIO)
    solid = int(w * PANEL_SOLID_RATIO)
    clear_x = face_clear_x(solid, blend)

    base, eff_clear = cover_crop_face_safe(Image.open(photo), w, h, faces, clear_x)

    # SHIP GATE: A-03 needs the person in the right ~60% — if the subject intrudes
    # into the text column, refuse to compose instead of shrinking cream over copy.
    min_clear = int(w * 0.40)
    if faces and eff_clear < min_clear:
        raise SystemExit(
            f"SHIP GATE: person zone starts at {eff_clear}px < required {min_clear}px "
            f"({photo.name}) — photo is not right-weighted enough for A-03. "
            "Regenerate with the subject fully in the right third."
        )

    # Cream must finish at or before the protected edge (shoulder/face)
    blend = int(w * PANEL_BLEND_RATIO)
    max_solid = max(160, eff_clear - 48)
    # Prefer PANEL ratio; expand toward clear zone when subject is far right
    # so long condition names (e.g. "ADHD in women") can hit blur-test size.
    solid = min(max(int(w * PANEL_SOLID_RATIO), min(max_solid, int(w * 0.52))), max_solid)
    while face_clear_x(solid, blend) > eff_clear and blend > 72:
        blend -= 8
    while face_clear_x(solid, blend) > eff_clear and solid > 140:
        solid -= 6
    # Hard fail-safe: never let opaque cream cover the person zone
    if face_clear_x(solid, blend) > eff_clear:
        solid = max(120, eff_clear - 56)
        blend = max(64, min(blend, max(48, eff_clear - solid)))
    clear_x = face_clear_x(solid, blend)
    print(f"A-03 faces={len(faces)} solid={solid} blend={blend} clear_x={clear_x} person_at≥{eff_clear}")

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = overlay.load()
    for x in range(min(w, solid + blend + 1)):
        a = cream_alpha_at(x, solid, blend)
        if a:
            for y in range(h):
                px[x, y] = (*CREAM, a)
    canvas = Image.alpha_composite(base.convert("RGBA"), overlay)
    text_col_w = max(220, solid - MARGIN - 16)
    return canvas, text_col_w


def draw_accent_line(draw, line: str, accent: set[str], x: int, y: int, font):
    cx = x
    parts = line.split(" ")
    for i, part in enumerate(parts):
        key = part.strip(".,!?;:\"'").lower()
        color = MAGENTA if key in accent else NAVY
        draw.text((cx, y), part, font=font, fill=color)  # crisp — no shadow
        cx += tw(draw, part, font)
        if i < len(parts) - 1:
            cx += tw(draw, " ", font)
    return y + th(draw, "Ag", font)


def fit_subheadline(draw, text: str, max_w: int, h: int, *, target=0.042, lo=0.036, hi=0.055, floor=32, max_lines=4):
    """Large, high-contrast sub-headline — the whole message in one sparse block."""
    plain = " ".join(ln.strip() for ln in text.replace("\\n", "\n").split("\n") if ln.strip())
    if not plain:
        return [], font_body(floor, bold=True), floor
    target_px = int(round(h * target))
    lo_px = int(round(h * lo))
    hi_px = int(round(h * hi))
    forced = None
    if "\n" in text.replace("\\n", "\n"):
        forced = [ln.strip() for ln in text.replace("\\n", "\n").split("\n") if ln.strip()]

    def try_size(size: int):
        font = font_body(size, bold=True)
        lines = forced if forced else wrap(draw, plain, font, max_w)
        if len(lines) > max_lines:
            return None
        if not all(tw(draw, ln, font) <= max_w for ln in lines):
            return None
        return lines, font, size

    in_band = []
    below = []
    for size in range(hi_px, floor - 1, -1):
        hit = try_size(size)
        if not hit:
            continue
        lines, font, sz = hit
        entry = (len(lines), sz, lines, font)
        if sz >= lo_px:
            in_band.append(entry)
        else:
            below.append(entry)
    if in_band:
        n, size, lines, font = sorted(in_band, key=lambda t: (t[0], abs(t[1] - target_px), -t[1]))[0]
        return lines, font, size
    if below:
        n, size, lines, font = sorted(below, key=lambda t: (-t[1], t[0]))[0]
        return lines, font, size
    font = font_body(floor, bold=True)
    lines = forced if forced else wrap(draw, plain, font, max_w)
    if len(lines) > max_lines or any(tw(draw, ln, font) > max_w for ln in lines):
        raise SystemExit(
            f"SHIP GATE: sub-headline {plain!r} cannot fit at {floor}px "
            f"(max_w={max_w}px, needs {len(lines)} lines, max {max_lines}) — shorten the copy."
        )
    return lines, font, floor


def draw_lean_subheadline(
    draw, text: str, max_w: int, h: int, x: int, y: int, accent: set[str] | None = None
) -> int:
    """Magenta rule + large navy sub-headline (whole message). Optional word accents."""
    if not text.strip():
        return y
    y += 28
    draw.rectangle([x, y, x + 72, y + 5], fill=MAGENTA)
    y += 32
    lines, font, sz = fit_subheadline(draw, text, max_w, h)
    print(f"A-03 subhead={sz}px ({sz / h:.1%} H) lines={len(lines)}")
    accent = accent or set()
    for wl in lines:
        if accent:
            draw_accent_line(draw, wl, accent, x, y, font)
        else:
            draw.text((x, y), wl, font=font, fill=NAVY)  # full navy — high contrast
        y += th(draw, wl, font) + 10
    return y


def fit_headline(draw, text: str, max_w: int, h: int, *, target=0.09, lo=0.075, hi=0.10, floor=56, max_lines=4):
    """Blur-test lock: prefer ~10–12% canvas height (lean A-03), then fewer lines.
    If the caller forced line breaks (\\n), honor those — don't re-wrap longer.
    """
    target_px = int(round(h * target))
    lo_px = int(round(h * lo))
    hi_px = int(round(h * hi))
    plain = " ".join(ln.strip() for ln in text.replace("\\n", "\n").split("\n") if ln.strip())
    forced = None
    if "\n" in text.replace("\\n", "\n"):
        forced = [ln.strip() for ln in text.replace("\\n", "\n").split("\n") if ln.strip()]

    # Forced breaks: largest size that fits (blur first)
    if forced:
        for size in range(hi_px, floor - 1, -1):
            font = font_display(size)
            if all(tw(draw, ln, font) <= max_w for ln in forced):
                return forced, font, size
        font = font_display(floor)
        bad = [ln for ln in forced if tw(draw, ln, font) > max_w]
        raise SystemExit(
            f"SHIP GATE: headline lines overflow the text column even at {floor}px "
            f"(max_w={max_w}px): {bad!r} — shorten the copy or re-break the lines."
        )

    in_band = []
    below = []
    for size in range(hi_px, floor - 1, -1):
        font = font_display(size)
        auto = wrap(draw, plain, font, max_w)
        if not (all(tw(draw, ln, font) <= max_w for ln in auto) and len(auto) <= max_lines):
            continue
        entry = (len(auto), size, auto, font)
        if size >= lo_px:
            in_band.append(entry)
        else:
            below.append(entry)

    if in_band:
        n, size, lines, font = sorted(in_band, key=lambda t: (t[0], abs(t[1] - target_px), -t[1]))[0]
        return lines, font, size
    if below:
        n, size, lines, font = sorted(below, key=lambda t: (-t[1], t[0]))[0]
        return lines, font, size
    font = font_display(floor)
    lines = wrap(draw, plain, font, max_w)
    if len(lines) > max_lines or any(tw(draw, ln, font) > max_w for ln in lines):
        raise SystemExit(
            f"SHIP GATE: headline {plain!r} cannot fit the text column at {floor}px "
            f"(max_w={max_w}px, needs {len(lines)} lines, max {max_lines}) — shorten the copy."
        )
    return lines, font, floor


def compose_slide(
    *,
    logo_path: Path,
    out_path: Path,
    size: str,
    mode: str,
    headline: str,
    accent: str = "",
    recognition: str = "",
    explanation: str = "",
    takeaway: str = "",
    cta: str = "",
    body: str = "",
    slide_num: str = "",
    photo: Path | None = None,
    footer: bool = True,
    carousel_arrow: bool = False,
    dense: bool = False,
) -> None:
    W, H = SIZES[size]
    if photo and photo.exists():
        canvas, max_w = cream_blend_base(photo, W, H)
        layout = "a03-blend"
    else:
        canvas = Image.new("RGBA", (W, H), (*CREAM, 255))
        max_w = W - MARGIN * 2
        layout = "a02-cream"

    draw = ImageDraw.Draw(canvas)
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split() if w.strip()}

    logo = knock_white(Image.open(logo_path))
    lw = int(logo.width * (LOGO_H / logo.height))
    logo_r = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo_r, LOGO_XY)
    draw = ImageDraw.Draw(canvas)

    y = LOGO_XY[1] + LOGO_H + 48
    f_foot = font_body(18, bold=True)

    if mode == "hook":
        # Lean lock: larger headline (~10–12% H) + one sub-headline as whole message
        h_lines, f_h, hsz = fit_headline(draw, headline, max_w, H, target=0.11, lo=0.09, hi=0.13)
        print(f"A-03 hook head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)} layout={layout} dense={dense}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 10
        if recognition:
            y = draw_lean_subheadline(draw, recognition, max_w, H, MARGIN, y, accent_set)

    elif mode == "symptom":
        if slide_num and dense:
            # Number pill only in dense legacy layouts — lean slides stay quieter
            f_n = font_body(22, bold=True)
            label = slide_num
            nw = tw(draw, label, f_n) + 32
            nh = 44
            pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(pill).rounded_rectangle(
                [MARGIN, y, MARGIN + nw, y + nh],
                radius=22,
                fill=(*CREAM, 230),
                outline=(*MAGENTA, 230),
                width=2,
            )
            canvas = Image.alpha_composite(canvas, pill)
            draw = ImageDraw.Draw(canvas)
            draw.text((MARGIN + 16, y + 10), label, font=f_n, fill=MAGENTA)
            y += nh + 28

        h_lines, f_h, hsz = fit_headline(
            draw, headline, max_w, H, target=0.11, lo=0.09, hi=0.13, floor=56
        )
        print(f"A-03 symptom head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)} layout={layout} dense={dense}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 8

        if recognition:
            if dense:
                y += 24
                f_r = font_body(32 if size == "4:5" else 28, bold=True)
                rec_items = split_bullets(recognition)
                if len(rec_items) >= 2:
                    y = draw_bullets(draw, rec_items, f_r, max_w, MARGIN, y, fill=NAVY)
                else:
                    for wl in wrap(draw, recognition, f_r, max_w):
                        draw.text((MARGIN, y), wl, font=f_r, fill=NAVY)
                        y += th(draw, wl, f_r) + 6
                y += 18
            else:
                # Default: recognition = sub-headline (whole message)
                y = draw_lean_subheadline(draw, recognition, max_w, H, MARGIN, y, accent_set)

        if dense and explanation:
            f_e = font_body(26 if size == "4:5" else 24, bold=False)
            exp_items = split_bullets(explanation)
            if len(exp_items) >= 2 or len(explanation) > 90:
                if len(exp_items) == 1:
                    exp_items = split_bullets(explanation.replace(". ", ".\n"))
                y = draw_bullets(draw, exp_items, f_e, max_w, MARGIN, y, fill=NAVY_SUPPORT)
            else:
                for wl in wrap(draw, explanation, f_e, max_w):
                    draw.text((MARGIN, y), wl, font=f_e, fill=NAVY_SUPPORT)
                    y += th(draw, wl, f_e) + 6
            y += 16

        if dense and takeaway:
            f_t = font_body(24 if size == "4:5" else 22, bold=True)
            lines = wrap(draw, takeaway, f_t, max_w - 36)
            block_h = sum(th(draw, ln, f_t) + 6 for ln in lines) + 36
            card_w = min(max_w + 8, max_w)
            card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(card).rounded_rectangle(
                [MARGIN, y, MARGIN + card_w, y + block_h],
                radius=18,
                fill=(*CREAM, 235),
                outline=(*NAVY, 40),
                width=1,
            )
            canvas = Image.alpha_composite(canvas, card)
            draw = ImageDraw.Draw(canvas)
            yy = y + 18
            for ln in lines:
                draw.text((MARGIN + 18, yy), ln, font=f_t, fill=NAVY)
                yy += th(draw, ln, f_t) + 6
        elif not dense and (explanation or takeaway):
            print(
                "A-03 lean lock: ignoring --explanation/--takeaway "
                "(pass --dense to render body blocks)"
            )

    elif mode == "close":
        h_lines, f_h, hsz = fit_headline(draw, headline, max_w, H, target=0.11, lo=0.09, hi=0.13)
        print(f"A-03 close head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)} layout={layout} dense={dense}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 8
        # Lean close: optional sub-headline via --recognition, then CTA
        if recognition and not dense:
            y = draw_lean_subheadline(draw, recognition, max_w, H, MARGIN, y, accent_set)
        elif dense and body:
            y += 28
            f_b = font_body(28 if size == "4:5" else 26, bold=False)
            body_items = split_bullets(body)
            if len(body_items) >= 2 or len(body) > 90:
                y = draw_bullets(draw, body_items, f_b, max_w, MARGIN, y, fill=NAVY_SUPPORT)
            else:
                for para in body.split("\n"):
                    for wl in wrap(draw, para, f_b, max_w):
                        draw.text((MARGIN, y), wl, font=f_b, fill=NAVY_SUPPORT)
                        y += th(draw, wl, f_b) + 6
                    y += 14
            y += 8
        elif not dense and body:
            print("A-03 lean lock: ignoring --body on close (pass --dense, or use --recognition as sub-headline)")
        if cta:
            y += 24
            pad_x, pad_y = 28, 16
            max_btn_w = max_w + MARGIN - 8  # button may span cream column
            # Shrink type until text + padding fits the max button width
            cta_size = 26
            f_c = font_body(cta_size, bold=True)
            while tw(draw, cta, f_c) + pad_x * 2 > max_btn_w and cta_size > 16:
                cta_size -= 1
                f_c = font_body(cta_size, bold=True)
            text_w = tw(draw, cta, f_c)
            if text_w + pad_x * 2 > max_btn_w:
                raise SystemExit(
                    f"SHIP GATE: CTA {cta!r} cannot fit button "
                    f"(text={text_w}px + pad > max={max_btn_w}px even at {cta_size}px). "
                    "Shorten the CTA copy."
                )
            cw = text_w + pad_x * 2
            ch = th(draw, "Ag", f_c) + pad_y * 2
            btn_box = (MARGIN, y, MARGIN + cw, y + ch)
            btn = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(btn).rounded_rectangle(
                list(btn_box),
                radius=ch // 2,
                fill=(*CREAM, 240),
                outline=(*MAGENTA, 255),
                width=3,
            )
            canvas = Image.alpha_composite(canvas, btn)
            draw = ImageDraw.Draw(canvas)
            tx, ty = MARGIN + pad_x, y + pad_y - 1
            draw.text((tx, ty), cta, font=f_c, fill=NAVY)
            # Fail-closed audit: CTA ink must sit fully inside the button
            ink = draw.textbbox((tx, ty), cta, font=f_c)
            inset = 4
            if not (
                ink[0] >= btn_box[0] + inset
                and ink[1] >= btn_box[1] + inset
                and ink[2] <= btn_box[2] - inset
                and ink[3] <= btn_box[3] - inset
            ):
                raise SystemExit(
                    f"SHIP GATE: CTA ink {ink} outside button {btn_box} — refusing to ship."
                )
            print(f"A-03 CTA OK size={cta_size}px ink={ink} button={btn_box}")

    if carousel_arrow:
        # Continue cue — bottom RIGHT (human review lock 2026-08-07)
        r = 36
        cx = W - MARGIN - r
        cy = H - 110
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(*MAGENTA, 255), width=4)
        rd.line([(cx - 8, cy - 12), (cx + 10, cy), (cx - 8, cy + 12)], fill=(*MAGENTA, 255), width=4)
        canvas = Image.alpha_composite(canvas, ring)
        draw = ImageDraw.Draw(canvas)

    if footer:
        foot = "siya.health  ·  Educational only"
        fw = tw(draw, foot, f_foot)
        # Footer sits in cream zone on blend layouts
        if layout == "a03-blend":
            fx = MARGIN
        else:
            fx = (W - fw) // 2
        fy = H - 56
        chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(chip).rounded_rectangle(
            [fx - 12, fy - 8, fx + fw + 12, fy + 26],
            radius=12,
            fill=(*CREAM, 220),
        )
        canvas = Image.alpha_composite(canvas, chip)
        draw = ImageDraw.Draw(canvas)
        draw.text((fx, fy), foot, font=f_foot, fill=NAVY_SUPPORT)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--logo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--mode", required=True, choices=["hook", "symptom", "close"])
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", default="")
    ap.add_argument("--recognition", default="")
    ap.add_argument("--explanation", default="")
    ap.add_argument("--takeaway", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--body", default="")
    ap.add_argument("--slide-num", default="")
    ap.add_argument("--photo", default="")
    ap.add_argument("--size", default="4:5", choices=["4:5", "1:1"])
    ap.add_argument("--no-footer", action="store_true")
    ap.add_argument("--carousel-arrow", action="store_true")
    ap.add_argument(
        "--dense",
        action="store_true",
        help="Opt-in legacy body: bullets / explanation / takeaway card. Default is lean (headline + sub only).",
    )
    args = ap.parse_args()
    compose_slide(
        logo_path=Path(args.logo),
        out_path=Path(args.out),
        size=args.size,
        mode=args.mode,
        headline=args.headline,
        accent=args.accent,
        recognition=args.recognition,
        explanation=args.explanation,
        takeaway=args.takeaway,
        cta=args.cta,
        body=args.body.replace("\\n", "\n"),
        slide_num=args.slide_num,
        photo=Path(args.photo) if args.photo else None,
        footer=not args.no_footer,
        carousel_arrow=args.carousel_arrow,
        dense=args.dense,
    )


if __name__ == "__main__":
    main()
