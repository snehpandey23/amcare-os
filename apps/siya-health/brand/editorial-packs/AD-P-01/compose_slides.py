#!/usr/bin/env python3
"""DEPRECATED — v1 cream photo-band compositor (AD-S-01 era).

AD-P-01 v2 uses the PE-B-01 HTML/CSS theme:
  bash design/render.sh

Kept only as a historical reference; do not ship outputs from this script.
"""
raise SystemExit(
    "AD-P-01 v2: use bash design/render.sh (PE-B-01 theme). "
    "This Pillow compositor is deprecated."
)

# --- legacy below (unreachable) ---
"""Compose AD-P-01 Instagram carousel slides (1080×1350) to match Siya ADHD pack chrome."""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent
BASES = ROOT / "images" / "bases"
OUT_READY = ROOT / "images" / "ready"
OUT_RTP = ROOT / "ready-to-post"
LOGO = Path("/workspace/apps/siya-health/assets/images/siya-health-logo.png")
MARK = Path("/workspace/apps/siya-health/assets/images/siya-health-mark.png")

W, H = 1080, 1350
CREAM = (245, 238, 228)
INK = (28, 28, 30)
SUPPORT = (90, 88, 86)
FOOTER = (120, 112, 102)
RULE = (200, 190, 178)

FONT_SERIF = "/usr/share/fonts/truetype/noto/NotoSerifDisplay-Bold.ttf"
FONT_SERIF_REG = "/usr/share/fonts/truetype/noto/NotoSerif-Regular.ttf"
FONT_SANS = "/usr/share/fonts/truetype/macos/Inter-Regular.ttf"
FONT_SANS_MED = "/usr/share/fonts/truetype/macos/Inter-Medium.ttf"

SLIDES = [
    {
        "photo": "ad-p01-base-portrait.png",
        "headline": "Physical signs that\nmay appear with ADHD",
        "support": "— and why they're not enough\nto diagnose.",
        "photo_top": 560,
    },
    {
        "photo": "ad-p01-base-fidget.png",
        "headline": "The body often\nshows up first.",
        "support": "Leg bounce · nail biting · pacing ·\ncan't sit through a movie ·\nrestless sleep",
        "photo_top": 560,
    },
    {
        "photo": "ad-p01-base-portrait.png",
        "headline": "Adult “hyperactivity”\nis often quiet.",
        "support": "Inner restlessness. Fidgeting that\nhelps focus. Muscle strain from\n“sitting still.”",
        "photo_top": 560,
        "crop": "top",
    },
    {
        "photo": "ad-p01-base-fidget.png",
        "headline": "Fidgeting ≠\na diagnosis.",
        "support": "Same movements show up with\nanxiety, boredom, caffeine,\nsleep problems, and habit.",
        "photo_top": 560,
        "crop": "right",
    },
    {
        "photo": "ad-p01-base-portrait.png",
        "headline": "You can have ADHD\nwithout looking hyper.",
        "support": "Inattentive ADHD may show little\novert movement. Sitting calmly in\nan appointment does not rule it out.",
        "photo_top": 560,
        "crop": "center",
    },
    {
        "photo": "ad-p01-base-sleep.png",
        "headline": "Common isn't\nconclusive.",
        "support": "If the pattern is lifelong and getting\nin the way — take a validated screener,\nthen talk to a clinician.\nDon't diagnose from a fidget list.",
        "photo_top": 620,
    },
    {
        "photo": "ad-p01-base-portrait.png",
        "headline": "Start with pattern\n+ impairment.",
        "support": "siya.health/adhd-screening\nsiya.health/adhd-care\n(215) 445-1244 · www.siya.health",
        "photo_top": 600,
        "crop": "smile",
    },
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def cream_canvas() -> Image.Image:
    img = Image.new("RGB", (W, H), CREAM)
    # subtle parchment noise
    noise = Image.effect_noise((W, H), 18).convert("L")
    noise = ImageOps.autocontrast(noise)
    tint = Image.merge("RGB", (noise, noise, noise))
    tint = ImageEnhance.Brightness(tint).enhance(1.15)
    return Image.blend(img, tint, 0.045)


def fit_cover(photo: Image.Image, box_w: int, box_h: int, crop: str = "center") -> Image.Image:
    src = photo.convert("RGB")
    scale = max(box_w / src.width, box_h / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    if crop == "top":
        left, top = (nw - box_w) // 2, 0
    elif crop == "right":
        left, top = nw - box_w, (nh - box_h) // 2
    elif crop == "smile":
        left, top = (nw - box_w) // 2, max(0, (nh - box_h) // 3)
    else:
        left, top = (nw - box_w) // 2, (nh - box_h) // 2
    return src.crop((left, top, left + box_w, top + box_h))


def paste_photo(canvas: Image.Image, photo_path: Path, photo_top: int, crop: str) -> None:
    photo = Image.open(photo_path)
    box_h = H - photo_top - 70
    fitted = fit_cover(photo, W, box_h, crop=crop)
    # soft top fade into cream
    fade = Image.new("L", (W, box_h), 255)
    fd = ImageDraw.Draw(fade)
    fade_h = 120
    for y in range(fade_h):
        a = int(255 * (y / fade_h))
        fd.line([(0, y), (W, y)], fill=a)
    cream_band = Image.new("RGB", (W, box_h), CREAM)
    blended = Image.composite(fitted, cream_band, fade)
    canvas.paste(blended, (0, photo_top))


def knock_white(im: Image.Image, thresh: int = 245) -> Image.Image:
    """Make near-white pixels transparent (logo/mark assets ship on white)."""
    rgba = im.convert("RGBA")
    pixels = rgba.load()
    w, h = rgba.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r >= thresh and g >= thresh and b >= thresh:
                pixels[x, y] = (r, g, b, 0)
            else:
                # soften pale fringes
                pale = min(r, g, b)
                if pale > 220:
                    na = int(a * (255 - pale) / 35)
                    pixels[x, y] = (r, g, b, max(0, min(255, na)))
    return rgba


def trim_alpha(im: Image.Image, pad: int = 4) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    l, t, r, b = bbox
    l = max(0, l - pad)
    t = max(0, t - pad)
    r = min(im.width, r + pad)
    b = min(im.height, b + pad)
    return im.crop((l, t, r, b))


def place_logo(canvas: Image.Image) -> None:
    logo = trim_alpha(knock_white(Image.open(LOGO)))
    # wordmark ~85px tall (INSTAGRAM-STATIC locked)
    target_h = 86
    scale = target_h / logo.height
    logo = logo.resize((max(1, int(logo.width * scale)), target_h), Image.Resampling.LANCZOS)
    # submerged ~33% opacity feel via multiply against cream — keep readable mark
    alpha = logo.split()[-1].point(lambda p: int(p * 0.88))
    logo.putalpha(alpha)
    canvas.paste(logo, (48, 40), logo)

    mark = trim_alpha(knock_white(Image.open(MARK)))
    mark_h = 430
    scale = mark_h / mark.height
    mark = mark.resize((max(1, int(mark.width * scale)), mark_h), Image.Resampling.LANCZOS)
    mark = ImageEnhance.Color(mark).enhance(1.2)
    alpha = mark.split()[-1].point(lambda p: int(p * 0.13))
    mark.putalpha(alpha)
    mx = W - mark.width + 10
    my = 10
    canvas.paste(mark, (mx, my), mark)


def wrap_draw(
    draw: ImageDraw.ImageDraw,
    text: str,
    xy: tuple[int, int],
    fnt: ImageFont.FreeTypeFont,
    fill,
    line_spacing: int = 10,
) -> int:
    x, y = xy
    for line in text.split("\n"):
        draw.text((x, y), line, font=fnt, fill=fill)
        bbox = draw.textbbox((x, y), line, font=fnt)
        y = bbox[3] + line_spacing
    return y


def compose_slide(spec: dict, index: int) -> Image.Image:
    canvas = cream_canvas()
    place_logo(canvas)
    paste_photo(
        canvas,
        BASES / spec["photo"],
        spec["photo_top"],
        spec.get("crop", "center"),
    )

    draw = ImageDraw.Draw(canvas)
    h_font = font(FONT_SERIF, 54 if index != 0 else 52)
    s_font = font(FONT_SERIF_REG, 28)
    # slightly tighter for denser support
    if index in (5, 6):
        s_font = font(FONT_SANS, 26)

    y = wrap_draw(draw, spec["headline"], (52, 150), h_font, INK, line_spacing=8)
    wrap_draw(draw, spec["support"], (52, y + 18), s_font, SUPPORT, line_spacing=8)

    # footer rule + text
    fy = H - 48
    draw.line([(80, fy - 22), (W - 80, fy - 22)], fill=RULE, width=1)
    foot = font(FONT_SANS, 18)
    label = "siya.health  ·  All content for educational purposes only"
    bbox = draw.textbbox((0, 0), label, font=foot)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, fy - 8), label, font=foot, fill=FOOTER)
    return canvas


def main() -> None:
    OUT_READY.mkdir(parents=True, exist_ok=True)
    OUT_RTP.mkdir(parents=True, exist_ok=True)
    for i, spec in enumerate(SLIDES, start=1):
        img = compose_slide(spec, i - 1)
        name = f"slide-{i:02d}-ready.png"
        img.save(OUT_READY / name, "PNG", optimize=True)
        img.save(OUT_RTP / name, "PNG", optimize=True)
        print("wrote", name)
    # prototype = slide 1
    (OUT_READY.parent / "prototype").mkdir(parents=True, exist_ok=True)
    Image.open(OUT_READY / "slide-01-ready.png").save(
        OUT_READY.parent / "prototype" / "slide-01-prototype.png"
    )


if __name__ == "__main__":
    main()
