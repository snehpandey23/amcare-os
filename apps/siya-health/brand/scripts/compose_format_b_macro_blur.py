#!/usr/bin/env python3
"""
Format B macro-blur compositor — BG-MACRO-BLUR (Visual OS v1.4.7 · TEST)

Third background option (alongside SCRIM-PANEL-L1 and SCRIM-CREAM-V1):
  - Full-bleed photo, heavily blurred — editorial macro/texture read
  - NO scrim, NO panel, NO seam — legibility from soft/low-detail photo only
  - TYPE-SCALE-V1: Georgia headline block, full INK type, no gray copy

Rejected (do not mix in): dark heavy full-photo scrim · torn-paper collage edges
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

SIZES = {"4:5": (1080, 1350), "1:1": (1080, 1080)}
CREAM = (0xF4, 0xEF, 0xE7)
INK = (0x21, 0x18, 0x13)
PLUM = (0x8D, 0x3A, 0x78)

RELATED = 40
GROUP = 64
HEAD_SUB_GAP = GROUP
HEAD_BLOCK_MIN = 0.35
HEAD_BLOCK_MAX = 0.45
MARGIN = 56
LOGO_XY = (56, 48)
LOGO_H = 84

MACRO_BLUR_RADIUS = 28
MACRO_WARM = 1.06
MACRO_BRIGHT = 1.04


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


def apply_macro_blur(base_rgb: Image.Image, radius: int = MACRO_BLUR_RADIUS) -> Image.Image:
    blurred = base_rgb.filter(ImageFilter.GaussianBlur(radius=radius))
    warm = ImageEnhance.Color(blurred).enhance(MACRO_WARM)
    bright = ImageEnhance.Brightness(warm).enhance(MACRO_BRIGHT)
    return bright.convert("RGBA")


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


def fit_headline_block(draw, headline: str, *, max_w: int, canvas_h: int):
    target = int(canvas_h * ((HEAD_BLOCK_MIN + HEAD_BLOCK_MAX) / 2))
    for size in range(120, 48, -2):
        f = font_display(size)
        lines = []
        for para in headline.split("\n"):
            lines.extend(wrap_words(draw, para, f, max_w))
        lh = sum(text_h(draw, ln, f) for ln in lines) + (len(lines) - 1) * 8
        if lh <= target * 1.15 and all(text_w(draw, ln, f) <= max_w for ln in lines):
            return lines, f, lh, 8
    f = font_display(48)
    lines = wrap_words(draw, headline.replace("\n", " "), f, max_w)
    return lines, f, text_h(draw, "Ag", f), 8


def draw_accent_line(draw, line, accent, x, y, font):
    cx = x
    x0 = y0 = 10**9
    x1 = y1 = -10**9
    parts = line.split(" ")
    for i, part in enumerate(parts):
        key = part.strip(".,!?;:\"'").lower()
        color = PLUM if key in accent else INK
        draw.text((cx, y), part, font=font, fill=color)
        b = text_bbox(draw, (cx, y), part, font)
        x0, y0 = min(x0, b[0]), min(y0, b[1])
        x1, y1 = max(x1, b[2]), max(y1, b[3])
        cx = b[2]
        if i < len(parts) - 1:
            cx += text_w(draw, " ", font)
    return x0, y0, x1, y1


def draw_circular_arrow(draw, cx, cy, r=36):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], outline=PLUM, width=3)
    ax = cx - r // 4
    ay = cy
    draw.line([(ax, ay - 12), (ax + 18, ay), (ax, ay + 12)], fill=INK, width=4)
    draw.line([(ax - 8, ay), (ax + 18, ay)], fill=INK, width=4)
    return cx - r, cy - r, cx + r, cy + r


CIRCLED = ("①", "②", "③", "④", "⑤", "⑥")


def draw_num_badge(draw, slide_index: int, x: int, y: int, r: int = 30):
    idx = max(1, min(slide_index, len(CIRCLED)))
    label = CIRCLED[idx - 1]
    draw.ellipse([x - r, y - r, x + r, y + r], outline=PLUM, width=3, fill=(*CREAM, 220))
    f = font_body(26, bold=True)
    tw = text_w(draw, label, f)
    th = text_h(draw, label, f)
    draw.text((x - tw // 2, y - th // 2 - 2), label, font=f, fill=INK)
    return x - r, y - r, x + r, y + r


def audit(boxes: list[Box], *, w: int, h: int) -> None:
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
    print("LAYOUT OK — BG-MACRO-BLUR audit passed")


def knock_white(im: Image.Image, thresh: int = 248) -> Image.Image:
    im = im.convert("RGBA")
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and r >= thresh and g >= thresh and b >= thresh:
                px[x, y] = (r, g, b, 0)
    return im


def compose(
    *,
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline: str,
    accent: str,
    subhead: str | None,
    checklist: list[str] | None,
    cta: str | None,
    cta_arrow: bool,
    slide_index: int,
    num_badge: bool,
    size: str = "4:5",
    photo_bias: tuple[float, float] = (0.5, 0.4),
    blur_radius: int = MACRO_BLUR_RADIUS,
) -> None:
    modes = sum(bool(x) for x in (checklist, cta, cta_arrow, num_badge))
    assert modes == 1, "Need exactly one of: checklist | cta | cta_arrow | num_badge"

    W, H = SIZES[size]
    max_w = W - MARGIN * 2

    base = cover_crop(Image.open(photo_path), W, H, *photo_bias)
    canvas = apply_macro_blur(base, blur_radius)
    draw = ImageDraw.Draw(canvas)

    logo = knock_white(Image.open(logo_path))
    lw = int(logo.width * (LOGO_H / logo.height))
    logo = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)
    canvas.alpha_composite(logo, LOGO_XY)

    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    h_lines, f_head, _, line_gap = fit_headline_block(probe, headline, max_w=max_w, canvas_h=H)
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split()}

    f_sub = font_body(32 if size == "4:5" else 28, bold=True)
    f_check = font_body(22 if size == "4:5" else 20, bold=True)
    f_cta = font_body(24, bold=True)
    f_footer = font_body(16, bold=True)

    tag_pad_x, tag_pad_y = 14, 12
    tag_h = tag_pad_y * 2 + text_h(probe, "Ag", f_check)

    y = LOGO_XY[1] + LOGO_H + GROUP
    boxes: list[Box] = []

    if num_badge:
        bx, by = MARGIN + 30, LOGO_XY[1] + LOGO_H + 36
        bb = draw_num_badge(draw, slide_index, bx, by, r=30)
        boxes.append(Box("num_badge", *bb))
        y = max(y, bb[3] + RELATED)

    for i, line in enumerate(h_lines):
        x0, y0, x1, y1 = draw_accent_line(draw, line, accent_set, MARGIN, y, f_head)
        if x1 > W - MARGIN // 2:
            raise SystemExit(f"LAYOUT FAIL: headline crosses side margin: {line!r}")
        boxes.append(Box(f"headline_L{i}", x0, y0, x1, y1))
        y = y1 + (line_gap if i < len(h_lines) - 1 else 0)

    head_bottom = max(b.y1 for b in boxes if b.name.startswith("headline"))
    y = head_bottom + HEAD_SUB_GAP

    if subhead:
        for i, line in enumerate(wrap_words(probe, subhead, f_sub, max_w)):
            draw.text((MARGIN, y), line, font=f_sub, fill=INK)
            b = text_bbox(draw, (MARGIN, y), line, f_sub)
            boxes.append(Box(f"sub_L{i}", *b))
            y = b[3] + 4

    if checklist:
        y += GROUP
        for i, item in enumerate(checklist):
            label = f"{i + 1}. {item}"
            tw = min(text_w(draw, label, f_check) + tag_pad_x * 2, max_w)
            draw.rounded_rectangle(
                [MARGIN, y, MARGIN + tw, y + tag_h],
                radius=18,
                outline=PLUM,
                width=3,
            )
            th = text_h(draw, label, f_check)
            draw.text((MARGIN + tag_pad_x, y + (tag_h - th) // 2 - 1), label, font=f_check, fill=INK)
            boxes.append(Box(f"check_{i}", MARGIN, y, MARGIN + tw, y + tag_h))
            y += tag_h + (RELATED if i < len(checklist) - 1 else 0)

    if cta:
        y += GROUP
        pad_x, pad_y = 22, 14
        lw_ = text_w(draw, cta, f_cta)
        lh_ = text_h(draw, "Ag", f_cta)
        bw, bh_ = lw_ + pad_x * 2, lh_ + pad_y * 2
        draw.rounded_rectangle([MARGIN, y, MARGIN + bw, y + bh_], radius=28, outline=PLUM, width=3)
        draw.text((MARGIN + pad_x, y + pad_y - 1), cta, font=f_cta, fill=INK)
        boxes.append(Box("cta", MARGIN, y, MARGIN + bw, y + bh_))

    if cta_arrow:
        y += GROUP
        cx, cy = W - MARGIN - 40, y + 36
        bb = draw_circular_arrow(draw, cx, cy, r=36)
        boxes.append(Box("cta_arrow", *bb))

    footer = "siya.health  ·  All content for educational purposes only"
    fw = text_w(draw, footer, f_footer)
    fx = (W - fw) // 2
    fy = H - 52
    draw.text((fx, fy), footer, font=f_footer, fill=INK)
    boxes.append(Box("footer", *text_bbox(draw, (fx, fy), footer, f_footer)))

    audit(boxes, w=W, h=H)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--logo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", required=True)
    ap.add_argument("--subhead", default="")
    ap.add_argument("--checklist", default="", help="| separated max 3")
    ap.add_argument("--cta", default="")
    ap.add_argument("--cta-arrow", action="store_true")
    ap.add_argument("--num-badge", action="store_true")
    ap.add_argument("--slide-index", type=int, default=1)
    ap.add_argument("--blur-radius", type=int, default=MACRO_BLUR_RADIUS)
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
        checklist=checklist,
        cta=args.cta or None,
        cta_arrow=args.cta_arrow,
        slide_index=args.slide_index,
        num_badge=args.num_badge,
        size=args.size,
        blur_radius=args.blur_radius,
    )


if __name__ == "__main__":
    main()
