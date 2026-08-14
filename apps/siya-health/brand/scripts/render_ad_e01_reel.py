#!/usr/bin/env python3
"""AD-E-01 avatar-free reel: ADHD & emotional dysregulation. Ends on a question, Siya Health answers, CTA = free screening."""

from __future__ import annotations

import asyncio
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont

BRAND = Path(__file__).resolve().parents[1]
PACK = BRAND / "editorial-packs" / "AD-E-01" / "video"
SCENES_DIR = PACK / "scenes" / "source"
ASSETS = BRAND.parent / "assets" / "images"
OUT_MP4 = PACK / "AD-E-01-reel.mp4"
W, H = 1080, 1920

CREAM = (244, 239, 231)
NAVY = (0, 24, 120)
DARK_NAVY = (10, 36, 107)
MAGENTA = (216, 16, 136)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

NARRATION = """Nothing halfway.
With ADHD, feelings don't always arrive at a normal volume.

One moment you're completely overloaded. The next, you're frozen — while everyone else has already moved on.

That's not a lack of willpower.
It's emotional dysregulation — feelings that are hard to steer, not feelings you're choosing to have.

It's one of the most overlooked sides of ADHD — not just focus, not just fidgeting.
Research on adult ADHD links this kind of emotional intensity to real difficulty at work and in relationships.

One thing that helps: track it for two weeks — what triggered it, how long it lasted, how much sleep you got.

So is this just a rough patch — or something your brain has been carrying for a long time?

Siya Health's answer: you don't have to guess alone.
A free screening can help you find out — in minutes, not months.

Take the free screening today. Understanding it is the first step to feeling steadier.
"""


def p(*parts: Path) -> Path:
    for c in parts:
        if c.exists():
            return c
    raise FileNotFoundError(parts[0])


BRAND_CARD = "BRAND_CARD"

SCENES: list[dict] = [
    {
        "caption": "Nothing\nhalfway.",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-pause.jpg"),
        "weight": 2.4,
        "overlay": 0.42,
    },
    {
        "caption": 'Feelings don\'t arrive at\na "normal" volume',
        "bg": lambda: p(SCENES_DIR / "ade01-scene-pause.jpg"),
        "weight": 3.4,
        "overlay": 0.48,
    },
    {
        "caption": "Overloaded. Then frozen.\nEveryone else has moved on.",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-freeze.jpg", ASSETS / "editorial-adhd-overwhelm.jpg"),
        "weight": 4.0,
        "overlay": 0.5,
    },
    {
        "caption": "Not a lack\nof willpower",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-reset.jpg"),
        "weight": 2.3,
        "overlay": 0.4,
    },
    {
        "caption": "Feelings that are hard to\nsteer — not a choice",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-reset.jpg"),
        "weight": 3.8,
        "overlay": 0.42,
    },
    {
        "caption": "The overlooked\nside of ADHD",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-overlooked.jpg"),
        "weight": 3.4,
        "overlay": 0.45,
    },
    {
        "caption": "Research links this to\nreal daily struggle",
        "bg": lambda: p(ASSETS / "editorial-adhd-consult.jpg"),
        "weight": 4.2,
        "overlay": 0.5,
        "footnote": "Source: clinical research on adult ADHD & emotional dysregulation",
    },
    {
        "caption": "Track it: trigger ·\nduration · sleep",
        "bg": lambda: p(SCENES_DIR / "ade01-scene-tracking.jpg"),
        "weight": 4.2,
        "overlay": 0.48,
    },
    {
        "caption": "A rough patch…\nor something deeper?",
        "bg": BRAND_CARD,
        "weight": 4.6,
        "big": True,
    },
    {
        "caption": "Siya Health: you don't\nhave to guess alone",
        "bg": BRAND_CARD,
        "weight": 3.8,
    },
    {
        "caption": "Free screening —\nminutes, not months",
        "bg": BRAND_CARD,
        "weight": 3.2,
    },
    {
        "caption": "Take the free\nscreening today",
        "bg": BRAND_CARD,
        "weight": 4.8,
        "footer": "Educational. Not medical advice or a diagnosis.",
    },
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def cover_crop(img: Image.Image, tw: int, th: int) -> Image.Image:
    img = img.convert("RGB")
    iw, ih = img.size
    scale = max(tw / iw, th / ih)
    nw, nh = int(iw * scale), int(ih * scale)
    img = img.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return img.crop((left, top, left + tw, top + th))


def soft_vignette(base: Image.Image, strength: float = 0.4) -> Image.Image:
    overlay = Image.new("RGB", base.size, (10, 20, 40))
    mask = Image.new("L", base.size, 0)
    draw = ImageDraw.Draw(mask)
    for y in range(H):
        t = y / H
        v = int(255 * strength * (0.25 + 0.75 * t))
        draw.line([(0, y), (W, y)], fill=v)
    return Image.composite(overlay, base, mask)


def wrap_fit(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> str:
    lines_out: list[str] = []
    for raw in text.split("\n"):
        words = raw.split()
        if not words:
            lines_out.append("")
            continue
        line = words[0]
        for w in words[1:]:
            trial = f"{line} {w}"
            if draw.textlength(trial, font=fnt) <= max_w:
                line = trial
            else:
                lines_out.append(line)
                line = w
        lines_out.append(line)
    return "\n".join(lines_out)


def draw_brand_chip(canvas: Image.Image) -> None:
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(chip)
    cd.rounded_rectangle([48, 72, 320, 130], radius=18, fill=(*CREAM, 235))
    canvas.alpha_composite(chip)
    draw = ImageDraw.Draw(canvas)
    brand = font(SANS_REG, 26)
    draw.text((68, 88), "SIYA HEALTH", fill=NAVY, font=brand)
    draw.rectangle([68, 118, 180, 123], fill=MAGENTA)


def draw_photo_scene(scene: dict) -> Image.Image:
    bg = cover_crop(Image.open(scene["bg"]()), W, H)
    bg = ImageEnhance.Color(bg).enhance(1.05)
    bg = soft_vignette(bg, strength=scene.get("overlay", 0.45))
    canvas = bg.convert("RGBA")

    title_size = 60 if scene["caption"].count("\n") <= 1 else 54
    title_f = font(SERIF, title_size)
    probe = ImageDraw.Draw(Image.new("RGB", (W, H)))
    caption = wrap_fit(probe, scene["caption"], title_f, W - 200)
    bbox = probe.multiline_textbbox((0, 0), caption, font=title_f, spacing=16, align="left")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    pad_x, pad_y = 44, 40
    plate_w = min(W - 96, tw + pad_x * 2)
    plate_h = th + pad_y * 2 + 20
    x0 = 48
    y0 = H - plate_h - (200 if scene.get("footer") else 130)
    x1, y1 = x0 + plate_w, y0 + plate_h

    plate = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle([x0, y0, x1, y1], radius=26, fill=(*CREAM, 230))
    pd.rectangle([x0 + 34, y0 + 26, x0 + 150, y0 + 32], fill=(*MAGENTA, 255))
    canvas.alpha_composite(plate)

    draw = ImageDraw.Draw(canvas)
    tx, ty = x0 + pad_x, y0 + pad_y + 10
    draw.multiline_text((tx, ty), caption, fill=NAVY, font=title_f, spacing=16, align="left")

    fn = scene.get("footnote")
    if fn:
        ffn = font(SANS_REG, 22)
        fy = ty + th + 14
        wrapped_fn = wrap_fit(draw, fn, ffn, plate_w - pad_x * 2)
        draw.multiline_text((tx, fy), wrapped_fn, fill=DARK_NAVY, font=ffn, spacing=6, align="left")

    footer = scene.get("footer")
    if footer:
        ff = font(SANS_REG, 26)
        fb = draw.textbbox((0, 0), footer, font=ff)
        fw = fb[2] - fb[0]
        bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bar)
        bd.rounded_rectangle([100, H - 150, W - 100, H - 90], radius=16, fill=(*CREAM, 230))
        canvas.alpha_composite(bar)
        draw = ImageDraw.Draw(canvas)
        draw.text(((W - fw) // 2, H - 138), footer, fill=DARK_NAVY, font=ff)

    draw_brand_chip(canvas)
    return canvas.convert("RGB")


def draw_brand_card_scene(scene: dict) -> Image.Image:
    canvas = Image.new("RGBA", (W, H), (*CREAM, 255))
    draw = ImageDraw.Draw(canvas)

    title_size = 84 if scene.get("big") else 68
    title_f = font(SERIF, title_size)
    caption = wrap_fit(draw, scene["caption"], title_f, W - 160)
    bbox = draw.multiline_textbbox((0, 0), caption, font=title_f, spacing=20, align="center")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (W - tw) // 2
    y = (H - th) // 2 - 60

    draw.multiline_text((x, y), caption, fill=NAVY, font=title_f, spacing=20, align="center")
    rule_w = min(280, tw)
    draw.rectangle([(W - rule_w) // 2, y + th + 28, (W + rule_w) // 2, y + th + 34], fill=MAGENTA)

    footer = scene.get("footer")
    if footer:
        ff = font(SANS_REG, 26)
        wrapped = wrap_fit(draw, footer, ff, W - 200)
        fb = draw.multiline_textbbox((0, 0), wrapped, font=ff, spacing=8, align="center")
        fw = fb[2] - fb[0]
        draw.multiline_text(((W - fw) // 2, H - 260), wrapped, fill=DARK_NAVY, font=ff, spacing=8, align="center")
        link_f = font(SANS_REG, 26)
        link_text = "siya.health/adhd-screening"
        lb = draw.textbbox((0, 0), link_text, font=link_f)
        lw = lb[2] - lb[0]
        draw.text(((W - lw) // 2, H - 190), link_text, fill=MAGENTA, font=link_f)

    draw_brand_chip(canvas)
    return canvas.convert("RGB")


def draw_scene(scene: dict) -> Image.Image:
    if scene["bg"] == BRAND_CARD:
        return draw_brand_card_scene(scene)
    return draw_photo_scene(scene)


async def synthesize_voice(path: Path) -> None:
    import edge_tts

    communicate = edge_tts.Communicate(NARRATION, voice="en-US-JennyNeural", rate="+8%")
    await communicate.save(str(path))


def audio_duration(path: Path) -> float:
    out = subprocess.check_output(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(path),
        ],
        text=True,
    ).strip()
    return float(out)


def main() -> None:
    PACK.mkdir(parents=True, exist_ok=True)
    frames_out = PACK / "scenes" / "frames"
    frames_out.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as td:
        tdir = Path(td)
        voice = tdir / "vo.mp3"
        print("Synthesizing voiceover (no avatar)…")
        asyncio.run(synthesize_voice(voice))
        dur = audio_duration(voice)
        print(f"VO duration: {dur:.2f}s")

        print("Compositing script-matched scenes…")
        for i, scene in enumerate(SCENES):
            img = draw_scene(scene)
            img.save(frames_out / f"scene_{i:02d}.png", optimize=True)
            print(f"  scene {i:02d}: {scene['caption'].splitlines()[0][:40]}")

        total_w = sum(s["weight"] for s in SCENES)
        target = dur + 0.35
        raw = [max(target * (s["weight"] / total_w), 1.25) for s in SCENES]
        scale = target / sum(raw)
        durs = [r * scale for r in raw]

        concat_lines: list[str] = []
        for i, sec in enumerate(durs):
            fp = frames_out / f"scene_{i:02d}.png"
            concat_lines.append(f"file '{fp}'")
            concat_lines.append(f"duration {sec:.3f}")
        concat_lines.append(f"file '{frames_out / f'scene_{len(SCENES) - 1:02d}.png'}'")
        concat_path = tdir / "concat.txt"
        concat_path.write_text("\n".join(concat_lines) + "\n")

        silent = tdir / "silent.mp4"
        print("Encoding video…")
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-f",
                "concat",
                "-safe",
                "0",
                "-i",
                str(concat_path),
                "-vf",
                "fps=30,format=yuv420p",
                "-c:v",
                "libx264",
                "-pix_fmt",
                "yuv420p",
                "-movflags",
                "+faststart",
                str(silent),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        print("Muxing voiceover…")
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-i",
                str(silent),
                "-i",
                str(voice),
                "-c:v",
                "copy",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-shortest",
                "-movflags",
                "+faststart",
                str(OUT_MP4),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

        preview = PACK / "preview-frame.png"
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-ss",
                "3",
                "-i",
                str(OUT_MP4),
                "-frames:v",
                "1",
                "-update",
                "1",
                str(preview),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    print(f"Wrote {OUT_MP4} ({OUT_MP4.stat().st_size / 1024 / 1024:.1f} MB, {audio_duration(OUT_MP4):.1f}s)")
    print("Avatar-free · script-matched scenes · ends on a question, Siya Health answers · CTA = free screening")


if __name__ == "__main__":
    main()
