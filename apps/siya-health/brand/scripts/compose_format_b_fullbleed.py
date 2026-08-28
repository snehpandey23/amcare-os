#!/usr/bin/env python3
"""Format B Recognition Compositor (Full bleed + soft cream scrim).

Tokens: BRAND-STYLE-LOCK.md (cream #F4EFE7 · navy #001878 · magenta #D81088).
Templates: B-01 (lean), B-02 (lean + twist), B-03 (carousel continue).
"""

from __future__ import annotations

import argparse
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
CREAM = (244, 239, 231)  # #F4EFE7
NAVY = (0, 24, 120)  # #001878
DARK_NAVY = (10, 36, 107)  # #0A246B
MAGENTA = (216, 16, 136)  # #D81088
FOOTER = (0, 24, 120)

FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold.ttf",
        "/usr/share/fonts/truetype/msttcorefonts/georgia_bold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ],
    "body": [
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


def fit_cover(photo: Image.Image, target_w: int, target_h: int) -> Image.Image:
    src = photo.convert("RGB")
    scale = max(target_w / src.width, target_h / src.height)
    nw, nh = int(src.width * scale + 0.5), int(src.height * scale + 0.5)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = max(0, nw - target_w)
    top = max(0, (nh - target_h) // 2)
    return src.crop((left, top, left + target_w, top + target_h))


def draw_headline_with_accent(
    draw: ImageDraw.ImageDraw,
    text: str,
    accent: str | None,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    max_width: int,
) -> int:
    x, y = xy
    words = text.split()
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        trial = (" ".join(cur + [w])).strip()
        if draw.textlength(trial, font=font) <= max_width or not cur:
            cur.append(w)
        else:
            lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))

    accent_l = (accent or "").strip().lower()
    for line in lines:
        if draw.textlength(line, font=font) > max_width + 2:
            raise SystemExit(f"SHIP GATE: headline line overflows column: {line!r}")
        
        line_l = line.lower()
        if accent_l and accent_l in line_l:
            idx = line_l.find(accent_l)
            before = line[:idx]
            mid = line[idx : idx + len(accent_l)]
            after = line[idx + len(accent_l) :]
            cx = x
            if before:
                draw.text((cx, y), before, font=font, fill=NAVY)
                cx += int(draw.textlength(before, font=font))
            draw.text((cx, y), mid, font=font, fill=MAGENTA)
            bb = draw.textbbox((cx, y), mid, font=font)
            draw.rectangle([bb[0], bb[3] + 4, bb[2], bb[3] + 10], fill=MAGENTA)
            cx += int(draw.textlength(mid, font=font))
            if after:
                draw.text((cx, y), after, font=font, fill=NAVY)
        else:
            # Check for partial word match if accent spans multiple lines
            found_word = False
            for acc_word in accent_l.split():
                if acc_word in line_l:
                    # highlight individual accent word in line
                    w_idx = line_l.find(acc_word)
                    before = line[:w_idx]
                    mid = line[w_idx : w_idx + len(acc_word)]
                    after = line[w_idx + len(acc_word) :]
                    cx = x
                    if before:
                        draw.text((cx, y), before, font=font, fill=NAVY)
                        cx += int(draw.textlength(before, font=font))
                    draw.text((cx, y), mid, font=font, fill=MAGENTA)
                    bb = draw.textbbox((cx, y), mid, font=font)
                    draw.rectangle([bb[0], bb[3] + 4, bb[2], bb[3] + 10], fill=MAGENTA)
                    cx += int(draw.textlength(mid, font=font))
                    if after:
                        draw.text((cx, y), after, font=font, fill=NAVY)
                    found_word = True
                    break
            if not found_word:
                draw.text((x, y), line, font=font, fill=NAVY)
                
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + 14
    return y


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill,
    max_width: int,
    line_gap: int = 10,
) -> int:
    x, y = xy
    words = text.split()
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        trial = (" ".join(cur + [w])).strip()
        if draw.textlength(trial, font=font) <= max_width or not cur:
            cur.append(w)
        else:
            lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))

    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + line_gap
    return y


def compose_format_b(
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline: str,
    accent: str | None = None,
    subhead: str | None = None,
    twist: str | None = None,
) -> None:
    # 1. Base Photo
    photo = fit_cover(Image.open(photo_path), W, H)
    canvas = photo.convert("RGBA")

    # 2. Soft Cream Scrim overlay (TEXT-FIRST: soft cream gradient on left)
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    for x in range(W):
        # Soft gradient across width: 0-420px solid cream, 420-720px soft dissolve, 720-1080px clear
        if x < 400:
            alpha = 248
        elif x < 700:
            t = (x - 400) / (700 - 400)
            t = t * t * (3 - 2 * t)  # smoothstep
            alpha = int(248 * (1 - t * 0.98))
        else:
            alpha = int(248 * 0.02)
        
        # Soft footer band
        for y in range(H):
            curr_alpha = alpha
            if y > H - 100:
                fy = (y - (H - 100)) / 100
                curr_alpha = max(curr_alpha, int(240 * fy))
            scrim.putpixel((x, y), (*CREAM, curr_alpha))

    canvas = Image.alpha_composite(canvas, scrim).convert("RGB")
    draw = ImageDraw.Draw(canvas)

    # 3. Logo
    logo = Image.open(logo_path).convert("RGBA")
    target_h = 92
    scale = target_h / logo.height
    logo = logo.resize((max(1, int(logo.width * scale)), target_h), Image.Resampling.LANCZOS)
    canvas.paste(logo, (56, 52), logo)

    # 4. Typography
    text_left = 64
    text_max = 500

    h_size = 94
    h_font = resolve_font("display", h_size)
    while h_size >= 56:
        try:
            probe = Image.new("RGB", (W, H), CREAM)
            pd = ImageDraw.Draw(probe)
            draw_headline_with_accent(pd, headline, accent, (text_left, 240), h_font, text_max)
            break
        except SystemExit:
            h_size -= 4
            h_font = resolve_font("display", h_size)
    else:
        raise SystemExit("SHIP GATE: headline overflows text column at floor size")

    y = 240
    y = draw_headline_with_accent(draw, headline, accent, (text_left, y), h_font, text_max)
    y += 24

    if twist:
        t_font = resolve_font("body", 36)
        y = draw_wrapped(draw, twist, (text_left, y), t_font, DARK_NAVY, text_max, line_gap=12)
    elif subhead:
        s_font = resolve_font("body", 34)
        y = draw_wrapped(draw, subhead, (text_left, y), s_font, DARK_NAVY, text_max, line_gap=10)

    # 5. Footer
    f_font = resolve_font("body_reg", 22)
    foot = "siya.health  ·  All content for educational purposes only"
    fb = draw.textbbox((0, 0), foot, font=f_font)
    fw = fb[2] - fb[0]
    draw.text(((W - fw) // 2, H - 48), foot, font=f_font, fill=FOOTER)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path} ({W}x{H})")


def main() -> None:
    p = argparse.ArgumentParser(description="Compose Recognition Format B")
    p.add_argument("--photo", required=True, type=Path)
    p.add_argument("--logo", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--headline", required=True)
    p.add_argument("--accent", default=None)
    p.add_argument("--subhead", default=None)
    p.add_argument("--twist", default=None)
    args = p.parse_args()

    if args.subhead and args.twist:
        raise SystemExit("SHIP GATE: subhead and twist cannot be used together in Format B")

    compose_format_b(
        photo_path=args.photo,
        logo_path=args.logo,
        out_path=args.out,
        headline=args.headline,
        accent=args.accent,
        subhead=args.subhead,
        twist=args.twist,
    )


if __name__ == "__main__":
    main()
