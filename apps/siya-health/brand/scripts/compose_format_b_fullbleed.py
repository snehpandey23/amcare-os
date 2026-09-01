#!/usr/bin/env python3
"""
Recognition System compositor (Visual OS v2.1) — TEXT-FIRST soft scrim

Templates: B-01 lean · B-02 lean+twist · B-03 carousel arrow
  - Lean only: NO checklist, NO clinical CTA on frame (teaching → caption)
  - Soft translucent cream scrim + ~18% cream fade · NO text shadows — NO hard L-cut / opaque card
  - Never shrink headline to accommodate a busy photo
  - Pre-ship contrast + layout gate (hard fail)
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageStat

SIZES = {"4:5": (1080, 1350), "1:1": (1080, 1080)}
CREAM = (0xF4, 0xEF, 0xE7)
# Visual OS v2.1 — logo-sampled type (never brown / pure black / gray)
NAVY = (0x00, 0x18, 0x78)  # Deep Siya Navy — primary headline + body
NAVY_SUPPORT = (0x0A, 0x24, 0x6B)  # Dark navy — supporting / sub
MAGENTA = (0xD8, 0x10, 0x88)  # Siya Magenta — accent ≤3 words
INK = NAVY  # alias
PLUM = MAGENTA  # accent alias (legacy name in code paths)

# Uniform cream fade over photo before scrim (lightens — never a dark vignette)
PHOTO_FADE = 0.22

RELATED = 40
GROUP = 64
HEAD_SUB_GAP = GROUP
HEAD_BLOCK_MIN = 0.35
HEAD_BLOCK_MAX = 0.45
MARGIN = 56
LOGO_XY = (56, 48)
LOGO_H = 84

# Soft emotional scrim — light cream wash only (optimistic morning, not gloomy vignette)
SCRIM_EMOTIONAL = [
    (0, 0.38),
    (260, 0.28),
    (480, 0.16),
    (720, 0.06),
    (980, 0.0),
    (1200, 0.0),
]

SCRIM_DEEPER = [
    (0, 0.48),
    (280, 0.34),
    (520, 0.20),
    (760, 0.08),
    (1000, 0.0),
    (1280, 0.0),
]

SCRIM_STRONGEST = [
    (0, 0.58),
    (300, 0.42),
    (540, 0.26),
    (780, 0.12),
    (1020, 0.02),
    (1300, 0.0),
]

# Minimum contrast ratio (WCAG-ish) for ink on sampled backdrop
MIN_CONTRAST = 4.5


@dataclass
class Box:
    name: str
    x0: int
    y0: int
    x1: int
    y1: int

    def overlaps(self, other: "Box") -> bool:
        return not (
            self.x1 <= other.x0
            or other.x1 <= self.x0
            or self.y1 <= other.y0
            or other.y1 <= self.y0
        )


def font_display(size: int) -> ImageFont.FreeTypeFont:
    for p in (
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/System/Library/Fonts/Times.ttc",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size, index=0)
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


def cover_crop(im: Image.Image, tw: int, th: int, bias_x: float = 0.5, bias_y: float = 0.45) -> Image.Image:
    im = im.convert("RGB")
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, min(int((nw - tw) * bias_x), nw - tw))
    top = max(0, min(int((nh - th) * bias_y), nh - th))
    out = resized.crop((left, top, left + tw, top + th))
    assert out.size == (tw, th)
    return out


def lerp_alpha(y: float, stops: list[tuple[int, float]]) -> float:
    if y <= stops[0][0]:
        return stops[0][1]
    if y >= stops[-1][0]:
        return stops[-1][1]
    for i in range(len(stops) - 1):
        y0, a0 = stops[i]
        y1, a1 = stops[i + 1]
        if y0 <= y <= y1:
            t = (y - y0) / (y1 - y0)
            return a0 + (a1 - a0) * t
    return stops[-1][1]


def apply_scrim(base_rgb: Image.Image, stops: list[tuple[int, float]]) -> Image.Image:
    w, h = base_rgb.size
    out = base_rgb.convert("RGBA")
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    px = overlay.load()
    for yy in range(h):
        a = lerp_alpha(yy, stops)
        alpha = int(255 * a)
        if alpha:
            row = (*CREAM, alpha)
            for xx in range(w):
                px[xx, yy] = row
    return Image.alpha_composite(out, overlay)


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


def region_busy_score(rgb: Image.Image, box: tuple[int, int, int, int]) -> float:
    """Higher = more edge/detail competition with type."""
    x0, y0, x1, y1 = box
    crop = rgb.crop((x0, y0, x1, y1)).convert("L")
    edges = crop.filter(ImageFilter.FIND_EDGES)
    return float(ImageStat.Stat(edges).mean[0])


def sample_avg_rgb(im: Image.Image, box: tuple[int, int, int, int], step: int = 8) -> tuple[int, int, int]:
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


def text_bbox(draw, xy, text, font):
    return draw.textbbox(xy, text, font=font)


def text_w(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def text_h(draw, text, font):
    b = draw.textbbox((0, 0), text, font=font)
    return b[3] - b[1]


def wrap_words(draw, text: str, font, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_w(draw, trial, font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def lines_fit(draw, lines, font, max_w) -> bool:
    return all(text_w(draw, ln, font) <= max_w for ln in lines)


def block_height(draw, lines, font, line_gap: int) -> int:
    if not lines:
        return 0
    h = sum(text_h(draw, ln, font) for ln in lines)
    h += line_gap * max(0, len(lines) - 1)
    return h


def fit_headline_block(
    draw,
    headline: str,
    *,
    max_w: int,
    canvas_h: int,
) -> tuple[list[str], ImageFont.ImageFont, int, int]:
    """Headline block ~35–45%H — never reduced later for photo convenience."""
    target_lo = int(canvas_h * HEAD_BLOCK_MIN)
    target_hi = int(canvas_h * HEAD_BLOCK_MAX)
    target_mid = (target_lo + target_hi) // 2
    plain = " ".join(ln.strip() for ln in headline.split("\n") if ln.strip())
    forced = [ln.strip() for ln in headline.split("\n") if ln.strip()] if "\n" in headline else None
    line_gap_base = 10
    word_count = len(plain.split())

    in_band: list[tuple] = []
    near: list[tuple] = []

    for size in range(220, 55, -2):
        font = font_display(size)
        line_gap = max(line_gap_base, size // 14)
        cands: list[list[str]] = []
        if forced and lines_fit(draw, forced, font, max_w):
            cands.append(list(forced))
        auto = wrap_words(draw, plain, font, max_w)
        if lines_fit(draw, auto, font, max_w):
            cands.append(auto)
        for frac in (0.85, 0.70, 0.55):
            alt = wrap_words(draw, plain, font, int(max_w * frac))
            if lines_fit(draw, alt, font, max_w) and 2 <= len(alt) <= 4:
                cands.append(alt)

        seen = set()
        for lines in cands:
            key = tuple(lines)
            if key in seen or not lines or len(lines) > 4:
                continue
            seen.add(key)
            if len(lines) == 1 and word_count >= 4:
                continue
            bh = block_height(draw, lines, font, line_gap)
            entry = (lines, font, size, bh, line_gap)
            if target_lo <= bh <= target_hi:
                in_band.append(entry)
            elif target_lo * 0.75 <= bh <= target_hi * 1.15:
                near.append(entry)

    def rank(entry):
        lines, font, size, bh, line_gap = entry
        in_b = 0 if target_lo <= bh <= target_hi else 1
        return (in_b, abs(bh - target_mid), len(lines), -size)

    pool = in_band or near
    if not pool:
        raise SystemExit(
            f"LAYOUT FAIL: cannot reach headline block {HEAD_BLOCK_MIN:.0%}-{HEAD_BLOCK_MAX:.0%} "
            f"within max_w={max_w} for {plain!r}"
        )
    lines, font, size, bh, line_gap = sorted(pool, key=rank)[0]
    while bh < target_lo and line_gap < int(size * 0.55):
        line_gap += 4
        bh = block_height(draw, lines, font, line_gap)
    if bh > target_hi:
        while bh > target_hi and line_gap > 8:
            line_gap -= 2
            bh = block_height(draw, lines, font, line_gap)
    print(
        f"HEAD-BLOCK head={size}px lines={len(lines)} block_h={bh} "
        f"({bh / canvas_h:.0%} canvas) {lines}"
    )
    return lines, font, size, line_gap


def draw_accent_line(draw, line, accent, x, y, font, ink=NAVY):
    cx = x
    x0 = y0 = 10**9
    x1 = y1 = -10**9
    parts = line.split(" ")
    for i, part in enumerate(parts):
        key = part.strip(".,!?;:\"'").lower()
        color = MAGENTA if key in accent else ink
        draw_text_crisp(draw, (cx, y), part, font, color)
        b = text_bbox(draw, (cx, y), part, font)
        x0, y0 = min(x0, b[0]), min(y0, b[1])
        x1, y1 = max(x1, b[2]), max(y1, b[3])
        cx = b[2]
        if i < len(parts) - 1:
            cx += text_w(draw, " ", font)
    return x0, y0, x1, y1


def draw_circular_arrow(draw, cx, cy, r=36):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=PLUM, width=3)
    ax, ay = cx - r // 4, cy
    draw.line([(ax, ay - 12), (ax + 18, ay), (ax, ay + 12)], fill=INK, width=4)
    draw.line([(ax - 8, ay), (ax + 18, ay)], fill=INK, width=4)
    return cx - r, cy - r, cx + r, cy + r


def knock_white(im: Image.Image, thresh: int = 248) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r >= thresh and g >= thresh and b >= thresh:
                px[x, y] = (r, g, b, 0)
    return im


def apply_photo_fade(base_rgb: Image.Image, amount: float = PHOTO_FADE) -> Image.Image:
    """Uniform cream fade so the scene softens without a hard panel."""
    if amount <= 0:
        return base_rgb
    overlay = Image.new("RGBA", base_rgb.size, (*CREAM, int(round(255 * amount))))
    return Image.alpha_composite(base_rgb.convert("RGBA"), overlay).convert("RGB")


def derive_scene_ink(photo_rgb: Image.Image, sample_box: tuple[int, int, int, int]) -> tuple[int, int, int]:
    """Type ink is locked Deep Siya Navy — never scene-brown / black / gray."""
    del photo_rgb, sample_box
    return NAVY


def build_photo_support(
    photo_path: Path,
    *,
    w: int,
    h: int,
    level: int,
    text_zone: tuple[int, int, int, int],
) -> tuple[Image.Image, str]:
    """
    Escalate soft treatment until type can win. Never touches type size.
    Full-bleed emotional photo + 20% cream fade + translucent cream gradient.
    No hard L-cut. No left Canva cream card. No vertical seam.
    level 0..4
    """
    del text_zone  # retained for call-site compatibility; wash is full-width now
    biases = [
        (0.45, 0.58),
        (0.48, 0.55),
        (0.50, 0.52),
        (0.52, 0.50),
        (0.55, 0.48),
    ]
    bias = biases[min(level, len(biases) - 1)]
    base = cover_crop(Image.open(photo_path), w, h, *bias)
    base = apply_photo_fade(base, PHOTO_FADE)

    blur_radii = [0, 0, 2, 4, 7]
    br = blur_radii[min(level, len(blur_radii) - 1)]
    if br:
        base = base.filter(ImageFilter.GaussianBlur(radius=br))

    if level >= 3:
        base = ImageEnhance.Color(base).enhance(0.94)
        base = ImageEnhance.Brightness(base).enhance(1.04)

    scrims = [SCRIM_EMOTIONAL, SCRIM_DEEPER, SCRIM_DEEPER, SCRIM_STRONGEST, SCRIM_STRONGEST]
    stops = scrims[min(level, len(scrims) - 1)]
    canvas = apply_scrim(base, stops)

    label = (
        f"TEXT-FIRST level={level} fade={PHOTO_FADE:.0%} blur={br} "
        f"bias={bias} full-bleed-soft-scrim"
    )
    return canvas, label


def draw_text_crisp(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
) -> None:
    """Crisp type only — NO drop shadow, NO cream halo, NO glyph glow (Visual OS v2.1)."""
    draw.text(xy, text, font=font, fill=fill)


def paint_headline(
    canvas: Image.Image,
    *,
    lines: list[str],
    accent: set[str],
    font: ImageFont.ImageFont,
    x: int,
    y0: int,
    line_gap: int,
    ink: tuple[int, int, int] = NAVY,
) -> tuple[Image.Image, list[Box], int]:
    """Crisp headline — separation via weight, color, and scrim contrast only."""
    draw = ImageDraw.Draw(canvas)
    boxes: list[Box] = []
    y = y0
    for i, line in enumerate(lines):
        x0, ya, x1, yb = draw_accent_line(draw, line, accent, x, y, font, ink=ink)
        boxes.append(Box(f"headline_L{i}", x0, ya, x1, yb))
        y = yb + (line_gap if i < len(lines) - 1 else 0)
    return canvas, boxes, y


def audit_contrast(
    rgb: Image.Image,
    head_boxes: list[Box],
    ink: tuple[int, int, int] = INK,
) -> float:
    """Hard gate on navy contrast; magenta accent logged."""
    if not head_boxes:
        return 99.0
    x0 = min(b.x0 for b in head_boxes)
    y0 = min(b.y0 for b in head_boxes)
    x1 = max(b.x1 for b in head_boxes)
    y1 = max(b.y1 for b in head_boxes)
    avg = sample_avg_rgb(rgb, (x0, y0, x1, y1))
    ratio = contrast_ratio(ink, avg)
    mag_ratio = contrast_ratio(MAGENTA, avg)
    print(
        f"CONTRAST navy={ratio:.2f} magenta={mag_ratio:.2f} "
        f"ink_rgb={ink} vs backdrop {avg}"
    )
    return ratio


def audit_layout(boxes: list[Box], *, w: int, h: int) -> None:
    errors = []
    for b in boxes:
        if b.x0 < 0 or b.y0 < 0 or b.x1 > w or b.y1 > h:
            errors.append(f"{b.name} outside canvas: {b}")
    texts = [b for b in boxes if b.name != "footer"]
    for i, a in enumerate(texts):
        for c in texts[i + 1 :]:
            if a.overlaps(c):
                errors.append(f"OVERLAP {a.name} ∩ {c.name}")
    heads = [b for b in boxes if b.name.startswith("headline")]
    subs = [b for b in boxes if b.name.startswith("sub") or b.name.startswith("twist")]
    if heads and subs:
        gap = min(b.y0 for b in subs) - max(b.y1 for b in heads)
        if gap < HEAD_SUB_GAP:
            errors.append(f"HEAD_SUB_GAP fail: {gap} < {HEAD_SUB_GAP}")
    if errors:
        print("LAYOUT FAIL:\n  - " + "\n  - ".join(errors), file=sys.stderr)
        raise SystemExit(1)


def compose(
    *,
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline: str,
    accent: str,
    subhead: str | None,
    twist: str | None,
    checklist: list[str] | None,
    cta: str | None,
    cta_arrow: bool,
    size: str = "4:5",
    no_footer: bool = False,
) -> None:
    modes = sum(bool(x) for x in (checklist, cta, cta_arrow))
    # Recognition System (v2.0): lean only — checklist/clinical CTA belong to Knowledge/Conversion
    if checklist:
        raise SystemExit(
            "Recognition System is lean only — no checklist on frame. "
            "Use Knowledge (A-*) for bullets, or put teaching in the caption."
        )
    if cta:
        raise SystemExit(
            "Recognition System is lean only — no clinical CTA on frame. "
            "Use Conversion (C-01) for Talk to a Clinician, or put the path in the caption."
        )
    if twist and subhead:
        raise SystemExit("Use twist OR subhead — not both (B-01 vs B-02)")
    # Allowed: B-01 (optional subhead) · B-02 (twist) · B-03 (cta_arrow)
    del modes  # cta_arrow optional; zero action modes is valid for B-01/B-02

    W, H = SIZES[size]
    max_w = W - MARGIN * 2
    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))

    # 1) Lock type first — photo may never force a smaller headline
    h_lines, f_head, head_size, line_gap = fit_headline_block(
        probe, headline, max_w=max_w, canvas_h=H
    )
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split()}
    f_sub = font_body(32 if size == "4:5" else 28, bold=True)
    f_twist = font_body(28 if size == "4:5" else 24, bold=True)
    f_check = font_body(22 if size == "4:5" else 20, bold=True)
    f_cta = font_body(24, bold=True)
    f_footer = font_body(16, bold=True)
    tag_pad_x, tag_pad_y = 14, 12
    tag_h = tag_pad_y * 2 + text_h(probe, "Ag", f_check)

    # Estimate text stack bounds for panel + busy probe
    y0 = LOGO_XY[1] + LOGO_H + GROUP
    y = y0
    max_line_w = max(text_w(probe, ln, f_head) for ln in h_lines)
    for i, ln in enumerate(h_lines):
        y += text_h(probe, ln, f_head) + (line_gap if i < len(h_lines) - 1 else 0)
    head_bottom = y
    y = head_bottom + HEAD_SUB_GAP
    if twist:
        y += text_h(probe, twist, f_twist)
    elif subhead:
        for ln in wrap_words(probe, subhead, f_sub, max_w):
            y += text_h(probe, ln, f_sub) + 4
    if checklist:
        y += GROUP + len(checklist) * tag_h + RELATED * max(0, len(checklist) - 1)
    if cta:
        y += GROUP + 56
    if cta_arrow:
        y += GROUP + 72
    # Soft wash zone — tight to type stack (not a half-canvas Canva card)
    text_zone = (
        MARGIN - 8,
        LOGO_XY[1] - 8,
        min(W - MARGIN, MARGIN + max_line_w + 56),
        min(H - 70, y + 36),
    )

    # Probe busy-ness; prefer softest treatment that still passes contrast
    probe_photo = apply_photo_fade(cover_crop(Image.open(photo_path), W, H, 0.48, 0.55), PHOTO_FADE)
    busy = region_busy_score(probe_photo, text_zone)
    start_level = 0 if busy < 18 else 1 if busy < 28 else 2
    print(f"TEXT-FIRST busy_score={busy:.1f} start_level={start_level}")

    # Scene-matched warm brown type (still contrast-gated)
    scene_ink = derive_scene_ink(probe_photo, text_zone)
    print(
        f"TYPE-INK navy #{scene_ink[0]:02X}{scene_ink[1]:02X}{scene_ink[2]:02X} "
        f"magenta #{MAGENTA[0]:02X}{MAGENTA[1]:02X}{MAGENTA[2]:02X}"
    )

    logo = knock_white(Image.open(logo_path))
    lw = int(logo.width * (LOGO_H / logo.height))
    logo_r = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)

    last_err = ""
    for level in range(start_level, 5):
        canvas, support_label = build_photo_support(
            photo_path, w=W, h=H, level=level, text_zone=text_zone
        )
        print(support_label)
        rgb_support = canvas.convert("RGB")
        est_boxes = []
        yy = y0
        for i, line in enumerate(h_lines):
            twl = text_w(probe, line, f_head)
            thl = text_h(probe, line, f_head)
            est_boxes.append(Box(f"headline_L{i}", MARGIN, yy, MARGIN + twl, yy + thl))
            yy += thl + (line_gap if i < len(h_lines) - 1 else 0)
        ratio = audit_contrast(rgb_support, est_boxes, ink=scene_ink)
        if ratio < MIN_CONTRAST:
            last_err = f"contrast {ratio:.2f} < {MIN_CONTRAST}"
            print(f"TEXT-FIRST escalate — {last_err}")
            continue

        draw = ImageDraw.Draw(canvas)
        canvas.alpha_composite(logo_r, LOGO_XY)

        canvas, boxes, y = paint_headline(
            canvas,
            lines=h_lines,
            accent=accent_set,
            font=f_head,
            x=MARGIN,
            y0=y0,
            line_gap=line_gap,
            ink=scene_ink,
        )
        draw = ImageDraw.Draw(canvas)

        head_boxes = [b for b in boxes if b.name.startswith("headline")]
        y = max(b.y1 for b in head_boxes) + HEAD_SUB_GAP

        if twist:
            line = twist if twist.startswith("(") else f"({twist})"
            draw_text_crisp(draw, (MARGIN, y), line, f_twist, NAVY_SUPPORT)
            boxes.append(Box("twist", *text_bbox(draw, (MARGIN, y), line, f_twist)))
            y = boxes[-1].y1
        elif subhead:
            for i, line in enumerate(wrap_words(probe, subhead, f_sub, max_w)):
                draw_text_crisp(draw, (MARGIN, y), line, f_sub, NAVY_SUPPORT)
                b = text_bbox(draw, (MARGIN, y), line, f_sub)
                boxes.append(Box(f"sub_L{i}", *b))
                y = b[3] + 4

        if checklist:
            y += GROUP
            for i, item in enumerate(checklist):
                label = f"{i + 1}. {item}"
                tw = min(text_w(draw, label, f_check) + tag_pad_x * 2, max_w)
                pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                ImageDraw.Draw(pill).rounded_rectangle(
                    [MARGIN, y, MARGIN + tw, y + tag_h],
                    radius=18,
                    outline=(*PLUM, 255),
                    width=3,
                    fill=(*CREAM, 150),
                )
                canvas = Image.alpha_composite(canvas, pill)
                draw = ImageDraw.Draw(canvas)
                th = text_h(draw, label, f_check)
                draw_text_crisp(
                    draw,
                    (MARGIN + tag_pad_x, y + (tag_h - th) // 2 - 1),
                    label,
                    f_check,
                    NAVY_SUPPORT,
                )
                boxes.append(Box(f"check_{i}", MARGIN, y, MARGIN + tw, y + tag_h))
                y += tag_h + (RELATED if i < len(checklist) - 1 else 0)

        if cta:
            y += GROUP
            pad_x, pad_y = 22, 14
            lw_ = text_w(draw, cta, f_cta)
            lh_ = text_h(draw, "Ag", f_cta)
            bw, bh_ = lw_ + pad_x * 2, lh_ + pad_y * 2
            pill = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(pill).rounded_rectangle(
                [MARGIN, y, MARGIN + bw, y + bh_],
                radius=28,
                outline=(*PLUM, 255),
                width=3,
                fill=(*CREAM, 150),
            )
            canvas = Image.alpha_composite(canvas, pill)
            draw = ImageDraw.Draw(canvas)
            draw_text_crisp(draw, (MARGIN + pad_x, y + pad_y - 1), cta, f_cta, NAVY_SUPPORT)
            boxes.append(Box("cta", MARGIN, y, MARGIN + bw, y + bh_))

        if cta_arrow:
            y += GROUP
            cx, cy = W - MARGIN - 40, y + 36
            boxes.append(Box("cta_arrow", *draw_circular_arrow(draw, cx, cy, r=36)))

        if not no_footer:
            footer = "siya.health  ·  All content for educational purposes only"
            fw = text_w(draw, footer, f_footer)
            fx, fy = (W - fw) // 2, H - 52
            fb = text_bbox(draw, (fx, fy), footer, f_footer)
            chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(chip).rounded_rectangle(
                [fb[0] - 16, fb[1] - 8, fb[2] + 16, fb[3] + 8],
                radius=12,
                fill=(*CREAM, 140),
            )
            canvas = Image.alpha_composite(canvas, chip)
            draw = ImageDraw.Draw(canvas)
            draw_text_crisp(draw, (fx, fy), footer, f_footer, NAVY_SUPPORT)
            boxes.append(Box("footer", *text_bbox(draw, (fx, fy), footer, f_footer)))

        try:
            audit_layout(boxes, w=W, h=H)
        except SystemExit:
            last_err = "layout audit failed"
            continue

        hb = max(b.y1 for b in head_boxes) - min(b.y0 for b in head_boxes)
        if hb < H * HEAD_BLOCK_MIN * 0.82:
            raise SystemExit("LAYOUT FAIL: headline was reduced — illegal under TEXT-FIRST")

        out_path.parent.mkdir(parents=True, exist_ok=True)
        canvas.convert("RGB").save(out_path, "PNG", optimize=True)
        print(f"LAYOUT OK — TEXT-FIRST passed at level {level}")
        print(f"Wrote {out_path}")
        return

    raise SystemExit(
        f"LAYOUT FAIL: could not make headline readable without shrinking type. "
        f"Replace/reposition source photo. last={last_err}"
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--logo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", required=True)
    ap.add_argument("--subhead", default="")
    ap.add_argument("--twist", default="")
    ap.add_argument("--checklist", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--cta-arrow", action="store_true")
    ap.add_argument(
        "--no-footer",
        action="store_true",
        help="Logo-only brand mark — omit siya.health footer line (Recognition exception)",
    )
    ap.add_argument("--size", default="4:5", choices=["4:5", "1:1"])
    args = ap.parse_args()
    checklist = [c.strip() for c in args.checklist.split("|") if c.strip()] or None
    compose(
        photo_path=Path(args.photo),
        logo_path=Path(args.logo),
        out_path=Path(args.out),
        headline=args.headline.replace("\\n", "\n"),
        accent=args.accent,
        subhead=args.subhead.replace("\\n", "\n") or None,
        twist=args.twist or None,
        checklist=checklist,
        cta=args.cta or None,
        cta_arrow=args.cta_arrow,
        size=args.size,
        no_footer=args.no_footer,
    )


if __name__ == "__main__":
    main()
