#!/usr/bin/env python3
"""
Format B L-layout compositor — Visual OS v1.4.5 + TYPE-SCALE-V1

Hard ship rules (fail closed):
  1. Headline ink NEVER crosses the cream/photo seam.
  2. Fixed HEAD_SUB_GAP between headline and subhead (no overlap/touch).
  3. Pre-ship layout audit: every text bbox inside column; no pairwise overlaps.
"""

from __future__ import annotations

import argparse
import sys
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

SIZES = {
    "4:5": (1080, 1350),
    "1:1": (1080, 1080),
}
CREAM = (0xF4, 0xEF, 0xE7)
INK = (0x21, 0x18, 0x13)
FOOTER = INK  # v1.4.6 — no gray type
PLUM = (0x8D, 0x3A, 0x78)

RELATED = 40
GROUP = 64
# Fixed gap headline → subhead (same rhythm family as GROUP)
HEAD_SUB_GAP = GROUP
# Absolute floor if 8% cannot fit even with extra wraps
HEAD_FLOOR = 48


@dataclass
class Box:
    name: str
    x0: int
    y0: int
    x1: int
    y1: int

    def overlaps(self, other: Box, pad: int = 0) -> bool:
        return not (
            self.x1 + pad <= other.x0
            or other.x1 + pad <= self.x0
            or self.y1 + pad <= other.y0
            or other.y1 + pad <= self.y0
        )


def font_display(size: int) -> ImageFont.FreeTypeFont:
    for p in (
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/Library/Fonts/Georgia.ttf",
        "/System/Library/Fonts/Times.ttc",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size, index=0)
            except Exception:
                continue
    return ImageFont.load_default()


def font_body(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    name = "Arial Bold.ttf" if bold else "Arial.ttf"
    for p in (
        f"/System/Library/Fonts/Supplemental/{name}",
        f"/Library/Fonts/{name}",
        "/System/Library/Fonts/Helvetica.ttc",
    ):
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size=size)
            except Exception:
                continue
    return ImageFont.load_default()


def cover_crop(im: Image.Image, tw: int, th: int, bias_x: float = 0.55, bias_y: float = 0.45) -> Image.Image:
    im = im.convert("RGB")
    sw, sh = im.size
    scale = max(tw / sw, th / sh)
    nw, nh = int(sw * scale + 0.5), int(sh * scale + 0.5)
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, min(int((nw - tw) * bias_x), nw - tw))
    top = max(0, min(int((nh - th) * bias_y), nh - th))
    return resized.crop((left, top, left + tw, top + th))


def text_bbox(draw: ImageDraw.ImageDraw, xy: tuple[int, int], text: str, font) -> tuple[int, int, int, int]:
    return draw.textbbox(xy, text, font=font)


def text_width(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    b = draw.textbbox((0, 0), text, font=font)
    return b[2] - b[0]


def text_height(draw: ImageDraw.ImageDraw, text: str, font) -> int:
    b = draw.textbbox((0, 0), text, font=font)
    return b[3] - b[1]


def wrap_words(draw, text: str, font, max_w: int) -> list[str]:
    """Wrap so each line's ink width ≤ max_w. Hard fail path: single oversized word alone."""
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        trial = (cur + " " + w).strip()
        if text_width(draw, trial, font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            # If a single word exceeds max_w, still emit it — caller must shrink size
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


def lines_fit(draw, lines: list[str], font, max_w: int) -> bool:
    return all(text_width(draw, ln, font) <= max_w for ln in lines)


def fit_headline(
    draw: ImageDraw.ImageDraw,
    headline: str,
    *,
    col_w: int,
    head_target: int,
    head_min: int,
    head_max: int,
) -> tuple[list[str], ImageFont.ImageFont, int]:
    """
    Auto-fit: prefer ~8–10% size inside column. NEVER exceed col_w.
    If size would overflow: wrap to more lines, then shrink — never cross seam.
    Prefer fewer lines when multiple sizes in the 8–10% band fit.
    """
    hard_w = col_w
    forced = [ln.strip() for ln in headline.split("\n") if ln.strip()] if "\n" in headline else None
    plain = " ".join(forced) if forced else headline.strip()

    in_band: list[tuple[int, int, list[str], ImageFont.ImageFont]] = []
    below: list[tuple[int, int, list[str], ImageFont.ImageFont]] = []

    for size in range(head_max, HEAD_FLOOR - 1, -1):
        font = font_display(size)
        candidates: list[list[str]] = []
        if forced and lines_fit(draw, forced, font, hard_w):
            candidates.append(forced)
        auto = wrap_words(draw, plain, font, hard_w)
        if lines_fit(draw, auto, font, hard_w):
            candidates.append(auto)

        for lines in candidates:
            entry = (len(lines), size, lines, font)
            if size >= head_min:
                in_band.append(entry)
            else:
                below.append(entry)

    all_fits = in_band + below
    if not all_fits:
        raise SystemExit(
            f"LAYOUT FAIL: cannot fit headline inside column width {col_w}px "
            f"even at {HEAD_FLOOR}px: {headline!r}"
        )

    # Prefer ≤3 headline lines (4-word hooks shouldn't become 4 stacks).
    MAX_HEAD_LINES = 3
    capped = [t for t in all_fits if t[0] <= MAX_HEAD_LINES] or all_fits
    in_b = [t for t in capped if t[1] >= head_min]
    pool = in_b or capped
    # In-band: fewest lines first (2-line 8% beats 3-line 10%), then largest size
    n_lines, size, lines, font = sorted(pool, key=lambda t: (t[0], -t[1]))[0]
    return lines, font, size


def draw_accent_line(
    draw: ImageDraw.ImageDraw,
    line: str,
    accent: set[str],
    x: int,
    y: int,
    font,
) -> tuple[int, int, int, int]:
    """Draw one headline line with plum accents. Returns ink bbox."""
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
        # Advance by measured ink width of this token + space (tight, matches paint)
        cx = b[2]
        if i < len(parts) - 1:
            spw = text_width(draw, " ", font)
            cx += spw
    return x0, y0, x1, y1


def audit_layout(boxes: list[Box], *, col_x: int, panel_w: int, canvas_h: int) -> None:
    """Hard ship gate — any violation exits non-zero."""
    errors: list[str] = []
    seam = panel_w
    for b in boxes:
        if b.name == "footer":
            # Footer may span full canvas center — only check vertical
            if b.y1 > canvas_h or b.y0 < 0:
                errors.append(f"{b.name} outside canvas vertically: {b}")
            continue
        if b.x1 > seam:
            errors.append(f"{b.name} crosses seam (x1={b.x1} > panel={seam})")
        if b.x0 < col_x - 2:
            errors.append(f"{b.name} left of column (x0={b.x0} < col_x={col_x})")
        if b.y0 < 0 or b.y1 > canvas_h:
            errors.append(f"{b.name} outside canvas vertically")

    # Pairwise overlap (except footer vs nothing critical on purpose — still check text)
    text_boxes = [b for b in boxes if b.name != "footer"]
    for i, a in enumerate(text_boxes):
        for c in text_boxes[i + 1 :]:
            if a.overlaps(c, pad=0):
                errors.append(f"OVERLAP {a.name} ∩ {c.name}: {a} vs {c}")

    # Explicit headline/subhead gap check
    heads = [b for b in boxes if b.name.startswith("headline")]
    subs = [b for b in boxes if b.name.startswith("subhead")]
    if heads and subs:
        head_bottom = max(b.y1 for b in heads)
        sub_top = min(b.y0 for b in subs)
        gap = sub_top - head_bottom
        if gap < HEAD_SUB_GAP:
            errors.append(
                f"HEAD_SUB_GAP fail: gap={gap}px < required {HEAD_SUB_GAP}px "
                f"(head_bottom={head_bottom}, sub_top={sub_top})"
            )

    if errors:
        msg = "LAYOUT FAIL (hard ship gate):\n  - " + "\n  - ".join(errors)
        print(msg, file=sys.stderr)
        raise SystemExit(1)
    print("LAYOUT OK — seam + overlap + HEAD_SUB_GAP checks passed")


def rounded_rect(draw, xy, radius, outline=None, fill=None, width=2):
    draw.rounded_rectangle(xy, radius=radius, outline=outline, fill=fill, width=width)


def compose(
    *,
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline: str,
    accent: str,
    subhead: str | None,
    evidence_ladder: bool,
    evidence_stat: str | None,
    cta: str | None,
    checklist: list[str] | None,
    size: str = "4:5",
    photo_bias: tuple[float, float] = (0.55, 0.35),
) -> None:
    assert not (cta and checklist), "CTA and checklist are mutually exclusive"
    assert cta or checklist, "Need CTA or checklist"
    assert size in SIZES, f"size must be one of {list(SIZES)}"

    W, H = SIZES[size]
    # L-column wide enough for 2-line ~8% on typical 4–6 word hooks;
    # seam audit still fail-closed if ink crosses.
    PANEL_W = 780 if size == "4:5" else 640
    LOGO_X, LOGO_Y = 56, 48
    LOGO_H = 84 if size == "4:5" else 72
    COL_X = 56
    COL_RIGHT = 20  # seam safety padding inside cream
    COL_W = PANEL_W - COL_X - COL_RIGHT
    FOOTER_Y = H - (52 if size == "4:5" else 44)

    head_target = int(round(H * 0.09))
    head_min = int(round(H * 0.08))
    head_max = int(round(H * 0.10))
    sub_size = 28 if size == "4:5" else 24
    tag_size = 20 if size == "4:5" else 18

    canvas = Image.new("RGB", (W, H), CREAM)
    photo = cover_crop(Image.open(photo_path), W - PANEL_W, H, *photo_bias)
    canvas.paste(photo, (PANEL_W, 0))
    draw = ImageDraw.Draw(canvas)

    logo = Image.open(logo_path).convert("RGBA")
    lw = int(logo.width * (LOGO_H / logo.height))
    logo = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)
    canvas.paste(logo, (LOGO_X, LOGO_Y), logo)

    probe = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    h_lines, f_head, head_size = fit_headline(
        probe,
        headline,
        col_w=COL_W,
        head_target=head_target,
        head_min=head_min,
        head_max=head_max,
    )
    longest = max(text_width(probe, ln, f_head) for ln in h_lines)
    print(
        f"TYPE-SCALE-V1 head={head_size}px ({head_size / H:.1%} canvas) "
        f"lines={len(h_lines)} fill={longest / COL_W:.1%} "
        f"COL_W={COL_W} PANEL={PANEL_W} (hard cap: no seam overflow)"
    )

    f_sub = font_body(sub_size, bold=True)
    f_ladder_label = font_body(13, bold=True)
    f_tag = font_body(tag_size, bold=True)
    f_stat = font_body(18 if size == "4:5" else 16, bold=True)
    f_cta = font_body(22 if size == "4:5" else 20, bold=True)
    f_check = font_body(tag_size, bold=True)
    f_footer = font_body(15 if size == "1:1" else 16)
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split()}

    line_gap = 4  # dense leading inside headline block
    tag_pad_x, tag_pad_y = 14, 12
    tag_h = tag_pad_y * 2 + text_height(probe, "Ag", f_check)

    def head_block_h(lines, font) -> int:
        h = 0
        for i, ln in enumerate(lines):
            h += text_height(probe, ln, font)
            if i < len(lines) - 1:
                h += line_gap
        return h

    sl: list[str] = []
    content_h = head_block_h(h_lines, f_head)
    if subhead:
        content_h += HEAD_SUB_GAP
        sl = (
            wrap_words(probe, subhead, f_sub, COL_W)
            if "\n" not in subhead
            else [s for s in subhead.split("\n") if s.strip()]
        )
        if not lines_fit(probe, sl, f_sub, COL_W):
            sl = wrap_words(probe, " ".join(sl), f_sub, COL_W)
        content_h += sum(text_height(probe, s, f_sub) + 4 for s in sl)
    if evidence_ladder:
        content_h += GROUP + text_height(probe, "EVIDENCE", f_ladder_label) + RELATED + tag_h
        if evidence_stat:
            content_h += RELATED + text_height(probe, "Ag", f_stat)
    if cta:
        content_h += GROUP + 14 * 2 + text_height(probe, "Ag", f_cta)
    if checklist:
        content_h += GROUP + len(checklist) * tag_h + RELATED * max(0, len(checklist) - 1)

    top_limit = LOGO_Y + LOGO_H + GROUP
    bottom_limit = FOOTER_Y - GROUP
    start_y = top_limit + max(0, (bottom_limit - top_limit - content_h) // 2)

    boxes: list[Box] = []
    y = start_y

    # --- Headline ---
    for i, line in enumerate(h_lines):
        x0, y0, x1, y1 = draw_accent_line(draw, line, accent_set, COL_X, y, f_head)
        if x1 > PANEL_W:
            raise SystemExit(f"LAYOUT FAIL: headline line ink crosses seam: {line!r} x1={x1} panel={PANEL_W}")
        boxes.append(Box(f"headline_L{i}", x0, y0, x1, y1))
        y = y1 + (line_gap if i < len(h_lines) - 1 else 0)

    head_bottom = max(b.y1 for b in boxes if b.name.startswith("headline"))

    # --- Subhead (fixed HEAD_SUB_GAP below headline ink) ---
    if subhead:
        y = head_bottom + HEAD_SUB_GAP
        for i, line in enumerate(sl):
            draw.text((COL_X, y), line, font=f_sub, fill=INK)
            b = text_bbox(draw, (COL_X, y), line, f_sub)
            boxes.append(Box(f"subhead_L{i}", *b))
            y = b[3] + 4

    if evidence_ladder:
        y += GROUP
        draw.text((COL_X, y), "EVIDENCE LADDER", font=f_ladder_label, fill=FOOTER)
        b = text_bbox(draw, (COL_X, y), "EVIDENCE LADDER", f_ladder_label)
        boxes.append(Box("ladder_label", *b))
        y = b[3] + RELATED
        tx = COL_X
        for tag in ("We know", "We think", "Don't know"):
            tw = text_width(draw, tag, f_tag) + tag_pad_x * 2
            rounded_rect(draw, (tx, y, tx + tw, y + tag_h), radius=18, outline=PLUM, width=2)
            th = text_height(draw, tag, f_tag)
            draw.text((tx + tag_pad_x, y + (tag_h - th) // 2 - 1), tag, font=f_tag, fill=INK)
            boxes.append(Box(f"ladder_{tag}", tx, y, tx + tw, y + tag_h))
            tx += tw + 10
        y += tag_h
        if evidence_stat:
            y += RELATED
            draw.text((COL_X, y), evidence_stat, font=f_stat, fill=INK)
            b = text_bbox(draw, (COL_X, y), evidence_stat, f_stat)
            boxes.append(Box("stat", *b))
            y = b[3]

    if cta:
        y += GROUP
        pad_x, pad_y = 22, 14
        label_w = text_width(draw, cta, f_cta)
        label_h = text_height(draw, "Ag", f_cta)
        bw, bh = label_w + pad_x * 2, label_h + pad_y * 2
        rounded_rect(draw, (COL_X, y, COL_X + bw, y + bh), radius=28, outline=PLUM, width=2)
        draw.text((COL_X + pad_x, y + pad_y - 1), cta, font=f_cta, fill=INK)
        boxes.append(Box("cta", COL_X, y, COL_X + bw, y + bh))
        y += bh

    if checklist:
        y += GROUP
        for i, item in enumerate(checklist):
            label = f"{i + 1}. {item}"
            tw = min(text_width(draw, label, f_check) + tag_pad_x * 2, COL_W)
            rounded_rect(draw, (COL_X, y, COL_X + tw, y + tag_h), radius=18, outline=PLUM, width=3)
            th = text_height(draw, label, f_check)
            draw.text((COL_X + tag_pad_x, y + (tag_h - th) // 2 - 1), label, font=f_check, fill=INK)
            boxes.append(Box(f"check_{i}", COL_X, y, COL_X + tw, y + tag_h))
            y += tag_h + (RELATED if i < len(checklist) - 1 else 0)

    footer = "siya.health  ·  All content for educational purposes only"
    fw = text_width(draw, footer, f_footer)
    fx = (W - fw) // 2
    draw.text((fx, FOOTER_Y), footer, font=f_footer, fill=FOOTER)
    fb = text_bbox(draw, (fx, FOOTER_Y), footer, f_footer)
    boxes.append(Box("footer", *fb))

    audit_layout(boxes, col_x=COL_X, panel_w=PANEL_W, canvas_h=H)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--photo", required=True)
    ap.add_argument("--logo", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", required=True, help="≤3 words plum accent")
    ap.add_argument("--subhead", default="")
    ap.add_argument("--ladder", action="store_true")
    ap.add_argument("--stat", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--checklist", default="", help="| separated max 3")
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
        evidence_ladder=args.ladder,
        evidence_stat=args.stat or None,
        cta=args.cta or None,
        checklist=checklist,
        size=args.size,
    )


if __name__ == "__main__":
    main()
