#!/usr/bin/env python3
"""
Stacked Knowledge compositor — cream type zone over bottom art (illustration packs).

Uses Visual OS A-03 type tokens (Deep Navy + Magenta, Georgia headline, no shadows,
no submerged watermark). For packs whose art is bottom-weighted watercolor.

Modes:
  lean   — headline + sub-headline only
  dense  — headline + optional lead + bullets + optional takeaway card
  close  — headline + sub + CTA button
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from compose_format_a_knowledge import (  # noqa: E402
    CREAM,
    LOGO_XY,
    MAGENTA,
    MARGIN,
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

# Human review: +~10% vs prior 96
LOGO_H = 106

from PIL import Image, ImageDraw, ImageEnhance


def draw_subheadline(
    draw, text: str, max_w: int, h: int, x: int, y: int, *, scale: float = 1.0, accent: set[str] | None = None
) -> int:
    """Magenta rule + navy sub-headline. scale<1 shrinks type (e.g. 0.95). Optional word accents."""
    if not text.strip():
        return y
    y += 32  # extra air under headline (human: spacing hierarchy)
    draw.rectangle([x, y, x + 72, y + 5], fill=MAGENTA)
    y += 32
    target = 0.042 * scale
    lo = 0.036 * scale
    hi = 0.055 * scale
    lines, font, sz = fit_subheadline(draw, text, max_w, h, target=target, lo=lo, hi=hi)
    print(f"stacked subhead={sz}px ({sz / h:.1%} H) lines={len(lines)} scale={scale}")
    accent = accent or set()
    for wl in lines:
        if accent:
            draw_accent_line(draw, wl, accent, x, y, font)
        else:
            draw.text((x, y), wl, font=font, fill=NAVY)
        y += th(draw, wl, font) + 10
    return y


def compose(
    *,
    logo_path: Path,
    art_path: Path,
    out_path: Path,
    mode: str,
    headline: str,
    accent: str = "",
    recognition: str = "",
    explanation: str = "",
    takeaway: str = "",
    cta: str = "",
    carousel_arrow: bool = False,
    sub_scale: float = 1.0,
    takeaway_framed: bool = True,
    vibrance: float = 1.0,
) -> None:
    W, H = 1080, 1350
    canvas = Image.open(art_path).convert("RGBA")
    if canvas.size != (W, H):
        canvas = canvas.resize((W, H), Image.Resampling.LANCZOS)
    if vibrance != 1.0:
        rgb = canvas.convert("RGB")
        rgb = ImageEnhance.Color(rgb).enhance(vibrance)
        rgb = ImageEnhance.Contrast(rgb).enhance(1.0 + (vibrance - 1.0) * 0.35)
        canvas = rgb.convert("RGBA")

    scrim_h = int(H * (0.52 if mode == "dense" else 0.46))
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for i, y in enumerate(range(0, scrim_h)):
        t = i / max(1, scrim_h - 1)
        a = int(240 * (1 - t * t))
        sd.line([(0, y), (W, y)], fill=(*CREAM, a))
    canvas = Image.alpha_composite(canvas, scrim)
    draw = ImageDraw.Draw(canvas)

    logo = knock_white(Image.open(logo_path))
    lw = int(logo.width * (LOGO_H / logo.height))
    logo_r = logo.resize((lw, LOGO_H), Image.Resampling.LANCZOS)
    # Soft cream chip behind logo for visibility
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle(
        [LOGO_XY[0] - 10, LOGO_XY[1] - 8, LOGO_XY[0] + lw + 14, LOGO_XY[1] + LOGO_H + 10],
        radius=14,
        fill=(*CREAM, 225),
    )
    canvas = Image.alpha_composite(canvas, chip)
    canvas.alpha_composite(logo_r, LOGO_XY)
    draw = ImageDraw.Draw(canvas)

    max_w = W - MARGIN * 2
    accent_set = {w.strip(".,!?;:\"'").lower() for w in accent.split() if w.strip()}
    y = LOGO_XY[1] + LOGO_H + 36

    if mode == "lean":
        h_lines, f_h, hsz = fit_headline(draw, headline, max_w, H, target=0.10, lo=0.085, hi=0.12)
        print(f"stacked lean head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 8
        if recognition:
            y = draw_subheadline(draw, recognition, max_w, H, MARGIN, y, scale=sub_scale, accent=accent_set)

    elif mode == "dense":
        h_lines, f_h, hsz = fit_headline(draw, headline, max_w, H, target=0.095, lo=0.08, hi=0.115)
        print(f"stacked dense head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 6
        y += 28  # air between hero and lead/bullets
        if recognition:
            f_r = font_body(34, bold=True)
            for wl in wrap(draw, recognition, f_r, max_w):
                draw.text((MARGIN, y), wl, font=f_r, fill=NAVY)
                y += th(draw, wl, f_r) + 6
            y += 16
        if explanation:
            items = split_bullets(explanation)
            f_e = font_body(30, bold=True)
            y = draw_bullets(draw, items, f_e, max_w, MARGIN, y, fill=NAVY, gap=20)
            y += 10
        if takeaway:
            f_t = font_body(32, bold=True)
            lines = wrap(draw, takeaway, f_t, max_w - (36 if takeaway_framed else 0))
            if takeaway_framed:
                block_h = sum(th(draw, ln, f_t) + 6 for ln in lines) + 32
                card = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                ImageDraw.Draw(card).rounded_rectangle(
                    [MARGIN, y, MARGIN + max_w, y + block_h],
                    radius=16,
                    fill=(*CREAM, 245),
                    outline=(*MAGENTA, 180),
                    width=2,
                )
                canvas = Image.alpha_composite(canvas, card)
                draw = ImageDraw.Draw(canvas)
                yy = y + 16
                for ln in lines:
                    draw.text((MARGIN + 16, yy), ln, font=f_t, fill=NAVY)
                    yy += th(draw, ln, f_t) + 6
            else:
                for ln in lines:
                    draw.text((MARGIN, y), ln, font=f_t, fill=NAVY)
                    y += th(draw, ln, f_t) + 8

    elif mode == "close":
        # denser close scrim when bullets + CTA share the frame
        if explanation:
            # rebuild with taller cream — re-entry path uses existing canvas;
            # bullets need room under headline
            pass
        h_lines, f_h, hsz = fit_headline(draw, headline, max_w, H, target=0.10, lo=0.085, hi=0.12)
        print(f"stacked close head={hsz}px ({hsz / H:.1%} H) lines={len(h_lines)}")
        for wl in h_lines:
            y = draw_accent_line(draw, wl, accent_set, MARGIN, y, f_h) + 8
        if explanation:
            y += 28
            items = split_bullets(explanation)
            f_e = font_body(30, bold=True)
            y = draw_bullets(draw, items, f_e, max_w, MARGIN, y, fill=NAVY, gap=18)
        elif recognition:
            y = draw_subheadline(draw, recognition, max_w, H, MARGIN, y, scale=sub_scale, accent=accent_set)
        if cta:
            y += 36
            pad_x, pad_y = 28, 16
            cta_size = 26
            f_c = font_body(cta_size, bold=True)
            while tw(draw, cta, f_c) + pad_x * 2 > max_w and cta_size > 16:
                cta_size -= 1
                f_c = font_body(cta_size, bold=True)
            text_w = tw(draw, cta, f_c)
            cw = text_w + pad_x * 2
            ch = th(draw, "Ag", f_c) + pad_y * 2
            btn_box = (MARGIN, y, MARGIN + cw, y + ch)
            btn = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(btn).rounded_rectangle(
                list(btn_box), radius=ch // 2, fill=(*CREAM, 240), outline=(*MAGENTA, 255), width=3
            )
            canvas = Image.alpha_composite(canvas, btn)
            draw = ImageDraw.Draw(canvas)
            draw.text((MARGIN + pad_x, y + pad_y - 1), cta, font=f_c, fill=NAVY)
            print(f"stacked CTA OK size={cta_size}px")
            y += ch + 20
        # Blog / under-CTA line when bullets already used explanation
        if explanation and recognition:
            f_u = font_body(24, bold=True)
            for wl in wrap(draw, recognition, f_u, max_w):
                draw.text((MARGIN, y), wl, font=f_u, fill=NAVY_SUPPORT)
                y += th(draw, wl, f_u) + 6

    if carousel_arrow:
        # Bottom RIGHT on continue slides (not last)
        r = 36
        cx, cy = W - MARGIN - r, H - 110
        ring = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        rd = ImageDraw.Draw(ring)
        rd.ellipse([cx - r, cy - r, cx + r, cy + r], outline=(*MAGENTA, 255), width=4)
        rd.line([(cx - 8, cy - 12), (cx + 10, cy), (cx - 8, cy + 12)], fill=(*MAGENTA, 255), width=4)
        canvas = Image.alpha_composite(canvas, ring)
        draw = ImageDraw.Draw(canvas)

    f_foot = font_body(18, bold=True)
    foot = "siya.health  ·  Educational only"
    fy = H - 52
    fw = tw(draw, foot, f_foot)
    chip2 = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(chip2).rounded_rectangle(
        [MARGIN - 12, fy - 8, MARGIN + fw + 12, fy + 26],
        radius=12,
        fill=(*CREAM, 220),
    )
    canvas = Image.alpha_composite(canvas, chip2)
    draw = ImageDraw.Draw(canvas)
    draw.text((MARGIN, fy), foot, font=f_foot, fill=NAVY_SUPPORT)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(out_path, "PNG", optimize=True)
    print(f"Wrote {out_path}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--logo", required=True)
    ap.add_argument("--art", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--mode", required=True, choices=["lean", "dense", "close"])
    ap.add_argument("--headline", required=True)
    ap.add_argument("--accent", default="")
    ap.add_argument("--recognition", default="")
    ap.add_argument("--explanation", default="")
    ap.add_argument("--takeaway", default="")
    ap.add_argument("--cta", default="")
    ap.add_argument("--carousel-arrow", action="store_true")
    ap.add_argument("--sub-scale", type=float, default=1.0, help="Shrink sub-headline (e.g. 0.95)")
    ap.add_argument("--takeaway-plain", action="store_true", help="Takeaway without card frame")
    ap.add_argument("--vibrance", type=float, default=1.0, help=">1 boosts color on art")
    args = ap.parse_args()
    compose(
        logo_path=Path(args.logo),
        art_path=Path(args.art),
        out_path=Path(args.out),
        mode=args.mode,
        headline=args.headline,
        accent=args.accent,
        recognition=args.recognition,
        explanation=args.explanation.replace("\\n", "\n"),
        takeaway=args.takeaway,
        cta=args.cta,
        carousel_arrow=args.carousel_arrow,
        sub_scale=args.sub_scale,
        takeaway_framed=not args.takeaway_plain,
        vibrance=args.vibrance,
    )


if __name__ == "__main__":
    main()
