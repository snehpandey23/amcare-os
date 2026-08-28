#!/usr/bin/env python3
"""Siya Health Fixed Typography Benchmark Compositor.

Standardized against the official benchmark reference layout:
- Canvas: 4:5 1080x1350
- Cream background: #F6E8DC (exact benchmark tone: RGB 246, 232, 220)
- Left margin: x = 68px
- Official full logo lockup: placed at (58, 72), size ~242x40px
- Headline: Georgia/LiberationSerif Bold (~92px font size, line-height ~126px)
  - Colors: Deep Navy (#081C5C) and Siya Magenta (#D00668)
- Magenta horizontal divider rule: x=68 to 184 (w=116px, h=5px) at y = headline_bottom + 36px
- Supporting text / Subhead: Arial/LiberationSans Bold (~40px font size, line-height ~56px) in Deep Navy (#0A1A5E)
- Footer: placed at bottom left (x=52, y=1272)
  - "siya.health" in Siya Magenta Bold (~25px)
  - " | " vertical separator
  - "Educational only" in Slate Navy Regular (~25px)
- Photo placement: Right-weighted with soft organic dissolve starting around x=500 to 700
"""

from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350

# Benchmark Palette
CREAM_BG = (246, 232, 220)       # #F6E8DC
NAVY_HEADLINE = (8, 28, 92)       # #081C5C
MAGENTA_ACCENT = (208, 6, 104)    # #D00668
NAVY_BODY = (10, 26, 94)          # #0A1A5E
SLATE_NAVY = (30, 40, 106)        # #1E286A

FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold.ttf",
        "/usr/share/fonts/truetype/msttcorefonts/georgia_bold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ],
    "body_bold": [
        "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
        "/usr/share/fonts/truetype/msttcorefonts/Arialbd.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ],
    "body_reg": [
        "/usr/share/fonts/truetype/msttcorefonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ],
}


def resolve_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES[kind]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise SystemExit(f"SHIP GATE: missing font for {kind}")


def fit_cover_right(photo: Image.Image, box_w: int, box_h: int) -> Image.Image:
    """Cover-crop with subject biased cleanly to the right."""
    src = photo.convert("RGB")
    scale = max(box_w / src.width, box_h / src.height)
    nw, nh = int(src.width * scale + 0.5), int(src.height * scale + 0.5)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, nw - box_w)
    top = max(0, (nh - box_h) // 2)
    return src.crop((left, top, left + box_w, top + box_h))


def soft_cream_dissolve_mask(width: int, height: int, start_x: int = 500, end_x: int = 700) -> Image.Image:
    """Creates benchmark-exact left cream to right photo dissolve.
    Keeps x=0 to 500 as pure solid cream so all text stays safely in the clean left text field.
    """
    mask = Image.new("L", (width, height), 0)
    px = mask.load()
    span = max(1, end_x - start_x)
    for x in range(width):
        if x < start_x:
            a_x = 0
        elif x > end_x:
            a_x = 255
        else:
            t = (x - start_x) / span
            # Smooth cubic ease
            t = t * t * (3 - 2 * t)
            a_x = int(255 * t)
        for y in range(height):
            # Keep bottom left area clean for footer
            a = a_x
            if y > height - 120 and x < 520:
                a = 0
            px[x, y] = a
    return mask


def draw_headline_benchmark(
    draw: ImageDraw.ImageDraw,
    headline_lines: list[str],
    accent_lines_or_words: list[str],
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    line_height: int = 126,
) -> int:
    """Draws multi-line headline matching benchmark vertical cadence."""
    x, y = xy
    accent_set = {w.strip().lower() for w in accent_lines_or_words}

    for line in headline_lines:
        line_clean = line.strip()
        line_l = line_clean.lower()
        
        # Check if entire line is an accent
        is_full_accent = any(acc == line_l for acc in accent_set)
        if is_full_accent:
            draw.text((x, y), line_clean, font=font, fill=MAGENTA_ACCENT)
        else:
            # Check for inline accent words
            matched_acc = None
            for acc in accent_set:
                if acc in line_l:
                    matched_acc = acc
                    break
            
            if matched_acc:
                idx = line_l.find(matched_acc)
                before = line_clean[:idx]
                mid = line_clean[idx : idx + len(matched_acc)]
                after = line_clean[idx + len(matched_acc) :]
                
                cx = x
                if before:
                    draw.text((cx, y), before, font=font, fill=NAVY_HEADLINE)
                    cx += int(draw.textlength(before, font=font))
                draw.text((cx, y), mid, font=font, fill=MAGENTA_ACCENT)
                cx += int(draw.textlength(mid, font=font))
                if after:
                    draw.text((cx, y), after, font=font, fill=NAVY_HEADLINE)
            else:
                draw.text((x, y), line_clean, font=font, fill=NAVY_HEADLINE)
                
        y += line_height
    return y


def draw_subhead_benchmark(
    draw: ImageDraw.ImageDraw,
    subhead_lines: list[str],
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    line_height: int = 56,
) -> int:
    """Draws supporting text matching benchmark size and leading."""
    x, y = xy
    for line in subhead_lines:
        draw.text((x, y), line.strip(), font=font, fill=NAVY_BODY)
        y += line_height
    return y


def compose_benchmark(
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline_lines: list[str],
    accent_words: list[str],
    subhead_lines: list[str],
    cta: str | None = None,
    left_margin: int = 68,
    start_y_headline: int = 300,
) -> None:
    # 1. Base Cream Canvas
    canvas = Image.new("RGB", (W, H), CREAM_BG)

    # 2. Fit Photo and Blend
    photo = fit_cover_right(Image.open(photo_path), W, H)
    mask = soft_cream_dissolve_mask(W, H, start_x=500, end_x=700)
    canvas = Image.composite(photo, canvas, mask)
    draw = ImageDraw.Draw(canvas)

    # 3. Logo Placement (x=58, y=72, size ~242x40 maintaining aspect ratio)
    logo = Image.open(logo_path).convert("RGBA")
    scale = min(242 / logo.width, 40 / logo.height)
    logo_w = int(logo.width * scale)
    logo_h = int(logo.height * scale)
    logo_resized = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    canvas.paste(logo_resized, (58, 72), logo_resized)

    # 4. Headline Typography (Georgia Bold @ 92px, line_height 126px)
    h_font = resolve_font("display", 92)
    y_curr = start_y_headline
    y_after_head = draw_headline_benchmark(
        draw=draw,
        headline_lines=headline_lines,
        accent_lines_or_words=accent_words,
        xy=(left_margin, y_curr),
        font=h_font,
        line_height=126,
    )

    # 5. Horizontal Magenta Rule Divider
    # Gap from last headline line: divider is 116px wide, 5px high
    divider_y = y_after_head - 126 + 106
    draw.rectangle([left_margin, divider_y, left_margin + 116, divider_y + 5], fill=MAGENTA_ACCENT)

    # 6. Supporting Text (Arial Bold @ 40px, line_height 56px)
    s_font = resolve_font("body_bold", 40)
    subhead_start_y = divider_y + 42
    y_after_subhead = draw_subhead_benchmark(
        draw=draw,
        subhead_lines=subhead_lines,
        xy=(left_margin, subhead_start_y),
        font=s_font,
        line_height=56,
    )

    # 7. Optional close-slide CTA — one only, fully inside the left text field.
    if cta:
        cta_font = resolve_font("body_bold", 28)
        cta_width = int(draw.textlength(cta, font=cta_font))
        cta_x = left_margin
        cta_y = min(max(y_after_subhead + 34, 980), 1160)
        cta_right = cta_x + cta_width + 48
        if cta_right > 485:
            raise SystemExit("SHIP GATE: CTA overflows the left text field")
        draw.rounded_rectangle(
            [cta_x, cta_y, cta_right, cta_y + 58],
            radius=29,
            outline=MAGENTA_ACCENT,
            width=3,
        )
        draw.text((cta_x + 24, cta_y + 13), cta, font=cta_font, fill=NAVY_HEADLINE)

    # 8. Benchmark Footer at (52, 1272)
    foot_mag_font = resolve_font("body_bold", 25)
    foot_reg_font = resolve_font("body_reg", 25)
    
    foot_x = 52
    foot_y = 1270
    
    # "siya.health" in Magenta Bold
    draw.text((foot_x, foot_y), "siya.health", font=foot_mag_font, fill=MAGENTA_ACCENT)
    w_brand = int(draw.textlength("siya.health", font=foot_mag_font))
    
    # "  |  " in Slate Navy Regular
    sep_x = foot_x + w_brand + 12
    draw.text((sep_x, foot_y), "|", font=foot_reg_font, fill=SLATE_NAVY)
    w_sep = int(draw.textlength("|", font=foot_reg_font))
    
    # "Educational only" in Slate Navy Regular
    text_x = sep_x + w_sep + 12
    draw.text((text_x, foot_y), "Educational only", font=foot_reg_font, fill=SLATE_NAVY)

    # Save
    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True)
    print(f"Successfully generated benchmark-exact static post: {out_path} ({W}x{H})")


def main() -> None:
    p = argparse.ArgumentParser(description="Siya Health Benchmark Typography Compositor")
    p.add_argument("--photo", required=True, type=Path)
    p.add_argument("--logo", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--headline", nargs="+", required=True, help="Headline lines (space separated strings)")
    p.add_argument("--accent", nargs="+", required=True, help="Accent words or phrases")
    p.add_argument("--subhead", nargs="+", required=True, help="Subhead lines (space separated strings)")
    p.add_argument("--cta", default=None, help="Optional close-slide CTA; one only")
    args = p.parse_args()

    compose_benchmark(
        photo_path=args.photo,
        logo_path=args.logo,
        out_path=args.out,
        headline_lines=args.headline,
        accent_words=args.accent,
        subhead_lines=args.subhead,
        cta=args.cta,
    )


if __name__ == "__main__":
    main()
