#!/usr/bin/env python3
"""Knowledge A-03 compositor — soft cream dissolve left → photo right.

Tokens: BRAND-STYLE-LOCK.md (cream #F4EFE7 · navy #001878 · magenta #D81088).
Lean default: headline + one sub-headline only. Use --dense for body/bullets.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1350
CREAM = (244, 239, 231)  # #F4EFE7
NAVY = (0, 24, 120)  # #001878
DARK_NAVY = (10, 36, 107)  # #0A246B
MAGENTA = (216, 16, 136)  # #D81088
FOOTER = (0, 24, 120)

# Prefer Georgia/Arial; Liberation is metric-compatible stand-in on Linux.
FONT_CANDIDATES = {
    "display": [
        "/usr/share/fonts/truetype/msttcorefonts/Georgia_Bold.ttf",
        "/usr/share/fonts/truetype/msttcorefonts/georgia_bold.ttf",
        "/Library/Fonts/Georgia Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
    ],
    "body": [
        "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
        "/usr/share/fonts/truetype/msttcorefonts/Arialbd.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    ],
    "body_reg": [
        "/usr/share/fonts/truetype/msttcorefonts/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ],
}


def resolve_font(kind: str, size: int) -> ImageFont.FreeTypeFont:
    for path in FONT_CANDIDATES[kind]:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    raise SystemExit(f"SHIP GATE: missing font for {kind}")


def knock_near_white(im: Image.Image, thresh: int = 250) -> Image.Image:
    rgba = im.convert("RGBA")
    px = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            if r >= thresh and g >= thresh and b >= thresh:
                px[x, y] = (r, g, b, 0)
    return rgba


def fit_cover_right(photo: Image.Image, box_w: int, box_h: int) -> Image.Image:
    """Cover-crop with subject biased to the right third."""
    src = photo.convert("RGB")
    scale = max(box_w / src.width, box_h / src.height)
    nw, nh = int(src.width * scale + 0.5), int(src.height * scale + 0.5)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    # Prefer right-weighted crop
    left = max(0, nw - box_w - int(nw * 0.05))
    if left + box_w > nw:
        left = nw - box_w
    top = max(0, (nh - box_h) // 3)
    if top + box_h > nh:
        top = nh - box_h
    # Ship gate: person zone should start right of ~40% of full canvas when placed
    crop = src.crop((left, top, left + box_w, top + box_h))
    return crop


def soft_dissolve_mask(width: int, height: int, cream_end: int, fade: int) -> Image.Image:
    """Alpha mask: 0 = cream/text zone, 255 = full photo. Soft ease dissolve (no hard L)."""
    mask = Image.new("L", (width, height), 0)
    px = mask.load()
    start = max(0, cream_end - fade // 2)
    end = min(width, cream_end + fade // 2)
    span = max(1, end - start)
    # Soft bottom cream band so footer stays readable over photo
    footer_band = 90
    for x in range(width):
        if x < start:
            a_x = 0
        elif x > end:
            a_x = 255
        else:
            t = (x - start) / span
            # smoothstep ease — matches SPEC-PROOF soft cream dissolve
            t = t * t * (3 - 2 * t)
            a_x = int(255 * t)
        for y in range(height):
            a = a_x
            if y > height - footer_band:
                # fade photo out toward cream at footer
                fy = (y - (height - footer_band)) / footer_band
                a = int(a * (1 - fy * 0.85))
            px[x, y] = a
    return mask


def draw_wrapped(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill,
    max_width: int,
    line_gap: int = 8,
) -> int:
    x, y = xy
    words = text.replace("\n", " \n ").split()
    lines: list[str] = []
    cur: list[str] = []
    for w in words:
        if w == "\n":
            lines.append(" ".join(cur))
            cur = []
            continue
        trial = (" ".join(cur + [w])).strip()
        if draw.textlength(trial, font=font) <= max_width or not cur:
            cur.append(w)
        else:
            lines.append(" ".join(cur))
            cur = [w]
    if cur:
        lines.append(" ".join(cur))

    for line in lines:
        if draw.textlength(line, font=font) > max_width + 2:
            raise SystemExit(
                f"SHIP GATE: headline lines overflow text column: {line!r}"
            )
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + line_gap
    return y


def draw_headline_with_accent(
    draw: ImageDraw.ImageDraw,
    text: str,
    accent: str | None,
    xy: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    max_width: int,
) -> int:
    """Draw headline; paint `accent` substring in magenta when present."""
    x, y = xy
    # Preserve explicit newlines from caller; else wrap
    raw_lines = text.split("\n") if "\n" in text else None
    if raw_lines is None:
        # wrap whole then accent within lines
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
    else:
        lines = raw_lines

    accent_l = (accent or "").strip().lower()
    for line in lines:
        if draw.textlength(line, font=font) > max_width + 2:
            raise SystemExit(
                f"SHIP GATE: headline lines overflow text column: {line!r}"
            )
        if accent_l and accent_l in line.lower():
            # case-insensitive split once
            idx = line.lower().find(accent_l)
            before, mid, after = line[:idx], line[idx : idx + len(accent_l)], line[idx + len(accent_l) :]
            cx = x
            if before:
                draw.text((cx, y), before, font=font, fill=NAVY)
                cx += int(draw.textlength(before, font=font))
            draw.text((cx, y), mid, font=font, fill=MAGENTA)
            cx += int(draw.textlength(mid, font=font))
            # magenta rule under accent
            bb = draw.textbbox((cx - int(draw.textlength(mid, font=font)), y), mid, font=font)
            draw.rectangle([bb[0], bb[3] + 4, bb[2], bb[3] + 10], fill=MAGENTA)
            if after:
                draw.text((cx, y), after, font=font, fill=NAVY)
        else:
            draw.text((x, y), line, font=font, fill=NAVY)
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + 10
    return y


def compose(
    photo_path: Path,
    logo_path: Path,
    out_path: Path,
    headline: str,
    recognition: str,
    accent: str | None = None,
    cta: str | None = None,
    dense_body: str | None = None,
    cream_ratio: float = 0.58,
) -> None:
    canvas = Image.new("RGB", (W, H), CREAM)
    cream_end = int(W * cream_ratio)
    fade = 220  # wide soft dissolve — reject hard-seam L

    photo = Image.open(photo_path)
    # Photo spans full height; soft-masked over cream
    fitted = fit_cover_right(photo, W, H)
    # Ship gate: right-weighted — clear photo zone should dominate x>40%
    # Approximate: cream_end should be <= 0.62*W for face clearance
    if cream_end > int(W * 0.65):
        raise SystemExit("SHIP GATE: cream column too wide — faces at risk")

    mask = soft_dissolve_mask(W, H, cream_end, fade)
    canvas = Image.composite(fitted, canvas, mask)

    draw = ImageDraw.Draw(canvas)

    # Logo top-left ~92px
    logo = knock_near_white(Image.open(logo_path))
    target_h = 92
    scale = target_h / logo.height
    logo = logo.resize((max(1, int(logo.width * scale)), target_h), Image.Resampling.LANCZOS)
    canvas.paste(logo, (48, 44), logo)

    # Type column
    text_left = 56
    text_max = cream_end - 80
    # Blur-test target ~10–12% H; step down to 56px floor (VISUAL-OS-TEMPLATES ship gate)
    s_font = resolve_font("body", 34)
    f_font = resolve_font("body_reg", 22)

    h_size = 110
    h_font = resolve_font("display", h_size)
    while h_size >= 56:
        try:
            # dry-run overflow check with a throwaway draw measuring
            probe = Image.new("RGB", (W, H), CREAM)
            pd = ImageDraw.Draw(probe)
            draw_headline_with_accent(
                pd, headline, accent, (text_left, 200), h_font, text_max
            )
            break
        except SystemExit as e:
            if "overflow" not in str(e):
                raise
            h_size -= 4
            h_font = resolve_font("display", h_size)
    else:
        raise SystemExit(
            f"SHIP GATE: headline lines overflow text column even at 56px floor: {headline!r}"
        )

    y = 200
    y = draw_headline_with_accent(
        draw, headline, accent, (text_left, y), h_font, text_max
    )
    y += 28
    y = draw_wrapped(draw, recognition, (text_left, y), s_font, DARK_NAVY, text_max, line_gap=10)

    if dense_body:
        b_font = resolve_font("body", 28)
        y += 24
        draw_wrapped(draw, dense_body, (text_left, y), b_font, DARK_NAVY, text_max, line_gap=8)

    # Optional close CTA (one only)
    if cta:
        c_font = resolve_font("body", 28)
        pad_x, pad_y = 28, 16
        tw = int(draw.textlength(cta, font=c_font))
        bx0, by0 = text_left, H - 160
        bx1, by1 = bx0 + tw + pad_x * 2, by0 + 56
        draw.rounded_rectangle([bx0, by0, bx1, by1], radius=28, outline=MAGENTA, width=3)
        draw.text((bx0 + pad_x, by0 + pad_y), cta, font=c_font, fill=NAVY)

    # Footer
    foot = "siya.health  ·  All content for educational purposes only"
    fb = draw.textbbox((0, 0), foot, font=f_font)
    fw = fb[2] - fb[0]
    draw.text(((W - fw) // 2, H - 52), foot, font=f_font, fill=FOOTER)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.save(out_path, "PNG", optimize=True)
    print(f"wrote {out_path} ({W}x{H})")


def main() -> None:
    p = argparse.ArgumentParser(description="Compose Knowledge A-03 (lean default)")
    p.add_argument("--photo", required=True, type=Path)
    p.add_argument("--logo", required=True, type=Path)
    p.add_argument("--out", required=True, type=Path)
    p.add_argument("--headline", required=True)
    p.add_argument("--recognition", required=True, help="Sub-headline — whole message")
    p.add_argument("--accent", default=None, help="≤3 words painted magenta in headline")
    p.add_argument("--cta", default=None, help="Close slide only — one CTA")
    p.add_argument("--dense", action="store_true", help="Allow body teaching on-frame")
    p.add_argument("--body", default=None, help="Dense body text (requires --dense)")
    p.add_argument("--cream-ratio", type=float, default=0.58)
    args = p.parse_args()

    if args.body and not args.dense:
        raise SystemExit("SHIP GATE: --body requires --dense (A-03 lean lock)")

    compose(
        photo_path=args.photo,
        logo_path=args.logo,
        out_path=args.out,
        headline=args.headline,
        recognition=args.recognition,
        accent=args.accent,
        cta=args.cta,
        dense_body=args.body if args.dense else None,
        cream_ratio=args.cream_ratio,
    )


if __name__ == "__main__":
    main()
