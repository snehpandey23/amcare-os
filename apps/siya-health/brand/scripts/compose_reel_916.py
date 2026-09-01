#!/usr/bin/env python3
"""Compose full-bleed 9:16 Knowledge reel frames (Visual OS A-03 type tokens)."""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compose_format_a_knowledge import (  # noqa: E402
    CREAM,
    MAGENTA,
    NAVY,
    NAVY_SUPPORT,
    draw_accent_line,
    draw_bullets,
    fit_headline,
    fit_subheadline,
    font_body,
    knock_white,
    split_bullets,
    th,
    tw,
    wrap,
)

from PIL import Image, ImageDraw

W, H = 1080, 1920
MARGIN = 56
LOGO_XY = (56, 56)
LOGO_H = 72  # smaller than carousel — don't overpower type


def cover_art(art: Image.Image, w: int, h: int) -> Image.Image:
    """Scale art to cover full frame (no letterbox)."""
    art = art.convert("RGB")
    aw, ah = art.size
    scale = max(w / aw, h / ah)
    nw, nh = int(aw * scale), int(ah * scale)
    art = art.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - w) // 2
    top = (nh - h) // 2
    return art.crop((left, top, left + w, top + h))


def compose_reel_frame(
    *,
    logo_path: Path,
    art_path: Path,
    out_path: Path,
    headline: str,
    accent: str,
    recognition: str = "",
    explanation: str = "",
    takeaway: str = "",
    cta: str = "",
    mode: str = "lean",
) -> None:
    base = cover_art(Image.open(art_path), W, H).convert("RGBA")

    # Soft cream scrim from top — readable type, not a white logo box
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    band = int(H * (0.58 if mode == "dense" else 0.48))
    for i, y in enumerate(range(0, band)):
        t = i / max(1, band - 1)
        a = int(245 * (1 - t ** 1.35))
        sd.line([(0, y), (W, y)], fill=(*CREAM, a))
    # Soft bottom cream for single website lockup
    for i, y in enumerate(range(H - 120, H)):
        t = (y - (H - 120)) / 120
        a = int(210 * t)
        sd.line([(0, y), (W, y)], fill=(*CREAM, a))
    canvas = Image.alpha_composite(base, scrim)
    draw = ImageDraw.Draw(canvas)

    logo = knock_white(Image.open(logo_path))
    lw = int(logo.width * (LOGO_H / logo.height))
    logo_r = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)
    # Soft cream chip behind logo (not opaque white square)
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle(
        [LOGO_XY[0] - 12, LOGO_XY[1] - 10, LOGO_XY[0] + lw + 16, LOGO_XY[1] + LOGO_H + 12],
        radius=14,
        fill=(*CREAM, 210),
    )
    canvas = Image.alpha_composite(canvas, chip)
    canvas.alpha_composite(logo_r, LOGO_XY)
    draw = ImageDraw.Draw(canvas)

    max_w = W - MARGIN * 2
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split() if w.strip()}
    y = LOGO_XY[1] + LOGO_H + 48

    # Larger type on tall canvas — target ~7–9% of H for headline
    h_lines, f_h, hsz = fit_headline(
        draw, headline, max_w, H, target=0.075, lo=0.06, hi=0.09, floor=64, max_lines=3
    )
    print(f"reel {out_path.name}: head={hsz}px ({hsz / H:.1%} H) mode={mode}")
    for wl in h_lines:
        y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 10

    if recognition:
        y += 20
        draw.rectangle([MARGIN, y, MARGIN + 72, y + 5], fill=MAGENTA)
        y += 28
        lines, font, sz = fit_subheadline(
            draw, recognition, max_w, H, target=0.032, lo=0.026, hi=0.04, floor=30, max_lines=4
        )
        print(f"  sub={sz}px lines={len(lines)}")
        for wl in lines:
            draw.text((MARGIN, y), wl, font=font, fill=NAVY)
            y += th(draw, wl, font) + 8

    if mode == "dense" and explanation:
        y += 16
        items = split_bullets(explanation)
        f_e = font_body(34, bold=True)
        y = draw_bullets(draw, items, f_e, max_w, MARGIN, y, fill=NAVY)

    if mode == "dense" and takeaway:
        y += 18
        f_t = font_body(28, bold=True)
        lines = wrap(draw, takeaway, f_t, max_w - 32)
        block_h = sum(th(draw, ln, f_t) + 6 for ln in lines) + 28
        card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(card).rounded_rectangle(
            [MARGIN, y, MARGIN + max_w, y + block_h],
            radius=16,
            fill=(*CREAM, 235),
            outline=(*NAVY, 40),
            width=1,
        )
        canvas = Image.alpha_composite(canvas, card)
        draw = ImageDraw.Draw(canvas)
        yy = y + 14
        for ln in lines:
            draw.text((MARGIN + 16, yy), ln, font=f_t, fill=NAVY)
            yy += th(draw, ln, f_t) + 6

    if cta:
        # Close: CTA as navy text line (button optional) — keep one website lockup at bottom
        y += 36
        f_c = font_body(30, bold=True)
        pad_x, pad_y = 28, 16
        text_w = tw(draw, cta, f_c)
        cw = text_w + pad_x * 2
        ch = th(draw, "Ag", f_c) + pad_y * 2
        btn = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(btn).rounded_rectangle(
            [MARGIN, y, MARGIN + cw, y + ch],
            radius=ch // 2,
            fill=(*CREAM, 235),
            outline=(*MAGENTA, 255),
            width=3,
        )
        canvas = Image.alpha_composite(canvas, btn)
        draw = ImageDraw.Draw(canvas)
        draw.text((MARGIN + pad_x, y + pad_y - 1), cta, font=f_c, fill=NAVY)

    # Single website lockup
    f_foot = font_body(22, bold=True)
    foot = "siya.health  ·  Educational only"
    fy = H - 64
    fw = tw(draw, foot, f_foot)
    chip2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(chip2).rounded_rectangle(
        [MARGIN - 10, fy - 10, MARGIN + fw + 14, fy + 28],
        radius=12,
        fill=(*CREAM, 230),
    )
    canvas = Image.alpha_composite(canvas, chip2)
    draw = ImageDraw.Draw(canvas)
    draw.text((MARGIN, fy), foot, font=f_foot, fill=NAVY_SUPPORT)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


if __name__ == "__main__":
    import argparse

    ap = argparse.ArgumentParser()
    ap.add_argument("--logo", required=True)
    ap.add_argument("--art", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", default="")
    ap.add_argument("--recognition", default="")
    ap.add_argument("--explanation", default="")
    ap.add_argument("--takeaway", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--mode", default="lean", choices=["lean", "dense", "close"])
    args = ap.parse_args()
    compose_reel_frame(
        logo_path=Path(args.logo),
        art_path=Path(args.art),
        out_path=Path(args.out),
        headline=args.headline,
        accent=args.accent,
        recognition=args.recognition,
        explanation=args.explanation.replace("\\n", "\n"),
        takeaway=args.takeaway,
        cta=args.cta,
        mode="lean" if args.mode == "close" else args.mode,
    )
    # close mode: re-call with cta after lean path — handle above via cta param always
