#!/usr/bin/env python3
"""Label and stitch background-approach test frames for side-by-side review."""

from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def font_label(size: int = 28):
    for p in (
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
    ):
        if Path(p).exists():
            return ImageFont.truetype(p, size=size)
    return ImageFont.load_default()


def stitch(labeled: list[tuple[str, Path]], out: Path, gap: int = 24) -> None:
    imgs = []
    for label, path in labeled:
        im = Image.open(path).convert("RGB")
        bar_h = 56
        canvas = Image.new("RGB", (im.width, im.height + bar_h), (244, 239, 231))
        canvas.paste(im, (0, bar_h))
        draw = ImageDraw.Draw(canvas)
        f = font_label(26)
        draw.text((24, 14), label, font=f, fill=(33, 24, 19))
        imgs.append(canvas)
    w = sum(i.width for i in imgs) + gap * (len(imgs) - 1)
    h = max(i.height for i in imgs)
    out_im = Image.new("RGB", (w, h), (244, 239, 231))
    x = 0
    for im in imgs:
        out_im.paste(im, (x, 0))
        x += im.width + gap
    out.parent.mkdir(parents=True, exist_ok=True)
    out_im.save(out, "PNG", optimize=True)
    print(f"Wrote {out}")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--label", action="append", nargs=2, metavar=("LABEL", "PATH"), required=True)
    args = ap.parse_args()
    pairs = [(lab, Path(p)) for lab, p in args.label]
    for _, p in pairs:
        if not p.is_file():
            raise SystemExit(f"Missing: {p}")
    stitch(pairs, Path(args.out))


if __name__ == "__main__":
    main()
