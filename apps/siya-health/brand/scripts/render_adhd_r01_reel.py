#!/usr/bin/env python3
"""ADHD-R-01 avatar-free reel with script-matched background scenes + VO."""

from __future__ import annotations

import asyncio
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFont, ImageFilter

BRAND = Path(__file__).resolve().parents[1]
PACK = BRAND / "editorial-packs" / "ADHD-R-01" / "video"
SCENES_DIR = PACK / "scenes" / "source"
ASSETS = BRAND.parent / "assets" / "images"
OUT_MP4 = PACK / "ADHD-R-01-reel.mp4"
W, H = 1080, 1920

CREAM = (244, 239, 231)
NAVY = (0, 24, 120)
DARK_NAVY = (10, 36, 107)
MAGENTA = (216, 16, 136)
WHITE = (255, 255, 255)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

NARRATION = """Do relationships with an ADHD partner ever actually work?

Yes — they can. But not by pretending the hard parts aren't real.

ADHD can make love feel intense and genuine — and still make follow-through inconsistent.
A missed text. A forgotten chore. Zoning out mid-conversation.

Partners often hear: you don't care.
The ADHD partner often hears: you're failing.
That's how resentment and shame trade places.

Clinical guides on adult ADHD and relationships describe this cycle.
Symptoms aren't character flaws.

Couples who last pause before reacting, build simple systems together, and both own their part.

ADHD doesn't doom love. Unmanaged patterns do.
If this is your relationship, start with one honest conversation this week.
"""


def p(*parts: str) -> Path:
    """Resolve first existing path among candidates."""
    cands = [Path(x) for x in parts]
    for c in cands:
        if c.exists():
            return c
    raise FileNotFoundError(parts[0])


# Script beat → background scene (related B-roll, no avatar)
SCENES: list[dict] = [
    {
        "caption": "Do ADHD relationships\never work?",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-couple-connection.jpg"),
        "weight": 4.0,
        "overlay": 0.42,
    },
    {
        "caption": "Yes — when you face\nthe hard parts",
        "bg": lambda: p(ASSETS / "editorial-adhd-overwhelm.jpg", SCENES_DIR / "adhd-r01-scene-zoning.jpg"),
        "weight": 3.5,
        "overlay": 0.48,
    },
    {
        "caption": "Love can feel intense\n& genuine",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-couple-connection.jpg"),
        "weight": 3.0,
        "overlay": 0.40,
    },
    {
        "caption": "Follow-through can\nstill be inconsistent",
        "bg": lambda: p(ASSETS / "editorial-adhd-unfinished.jpg", SCENES_DIR / "adhd-r01-scene-chores.jpg"),
        "weight": 3.2,
        "overlay": 0.50,
    },
    {
        "caption": "Missed texts.\nForgotten chores.\nZoning out.",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-missed-text.jpg"),
        "weight": 3.4,
        "overlay": 0.45,
    },
    {
        "caption": 'Partners hear:\n"You don\'t care"',
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-chores.jpg"),
        "weight": 3.0,
        "overlay": 0.48,
    },
    {
        "caption": 'ADHD partner hears:\n"You\'re failing"',
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-zoning.jpg"),
        "weight": 3.0,
        "overlay": 0.48,
    },
    {
        "caption": "Resentment ↔ shame",
        "bg": lambda: p(ASSETS / "editorial-burnout-afterwork.jpg", ASSETS / "editorial-adhd-overwhelm.jpg"),
        "weight": 2.8,
        "overlay": 0.52,
    },
    {
        "caption": "Clinicians describe\nthis cycle",
        "bg": lambda: p(ASSETS / "editorial-adhd-consult.jpg", ASSETS / "editorial-focus-overwhelm.jpg"),
        "weight": 3.2,
        "overlay": 0.50,
    },
    {
        "caption": "Symptoms ≠ character",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-pause.jpg"),
        "weight": 2.8,
        "overlay": 0.42,
    },
    {
        "caption": "Pause. Systems.\nShared ownership.",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-systems.jpg"),
        "weight": 4.0,
        "overlay": 0.45,
    },
    {
        "caption": "ADHD doesn't\ndoom love",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-hope.jpg"),
        "weight": 3.2,
        "overlay": 0.40,
    },
    {
        "caption": "One honest conversation\nthis week",
        "bg": lambda: p(SCENES_DIR / "adhd-r01-scene-conversation.jpg"),
        "weight": 4.5,
        "overlay": 0.45,
        "footer": "Siya Health  ·  Educational only",
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


def soft_vignette(base: Image.Image, strength: float = 0.35) -> Image.Image:
    """Darken edges slightly so center caption reads."""
    overlay = Image.new("RGB", base.size, (10, 20, 40))
    mask = Image.new("L", base.size, 0)
    draw = ImageDraw.Draw(mask)
    # Radial-ish: stronger at bottom third where captions sit
    for y in range(H):
        # top light, bottom darker for caption plate
        t = y / H
        v = int(255 * strength * (0.25 + 0.75 * t))
        draw.line([(0, y), (W, y)], fill=v)
    return Image.composite(overlay, base, mask)


def cream_plate(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], alpha_img: Image.Image) -> None:
    """Draw rounded cream caption plate onto RGBA layer."""
    x0, y0, x1, y1 = box
    plate = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    pd = ImageDraw.Draw(plate)
    pd.rounded_rectangle([x0, y0, x1, y1], radius=28, fill=(*CREAM, 230))
    # Magenta accent rule inside plate top
    pd.rectangle([x0 + 36, y0 + 28, x0 + 160, y0 + 34], fill=(*MAGENTA, 255))
    alpha_img.alpha_composite(plate)


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


def draw_scene(scene: dict) -> Image.Image:
    bg = cover_crop(Image.open(scene["bg"]()), W, H)
    # Slight warmth + soft vignette for brand atmosphere
    bg = ImageEnhance.Color(bg).enhance(1.05)
    bg = soft_vignette(bg, strength=scene.get("overlay", 0.45))

    # Build caption plate in lower half
    canvas = bg.convert("RGBA")
    title_size = 64 if scene["caption"].count("\n") <= 1 else 56
    if scene["caption"].count("\n") >= 2:
        title_size = 52
    title_f = font(SERIF, title_size)
    probe = ImageDraw.Draw(Image.new("RGB", (W, H)))
    caption = wrap_fit(probe, scene["caption"], title_f, W - 200)
    bbox = probe.multiline_textbbox((0, 0), caption, font=title_f, spacing=16, align="left")
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]

    pad_x, pad_y = 48, 44
    plate_w = min(W - 96, tw + pad_x * 2)
    plate_h = th + pad_y * 2 + 24
    x0 = 48
    y0 = H - plate_h - (200 if scene.get("footer") else 120)
    x1 = x0 + plate_w
    y1 = y0 + plate_h

    cream_plate(ImageDraw.Draw(canvas), (x0, y0, x1, y1), canvas)

    draw = ImageDraw.Draw(canvas)
    brand = font(SANS_REG, 26)
    # Brand chip top-left on cream pill
    chip = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    cd = ImageDraw.Draw(chip)
    cd.rounded_rectangle([48, 72, 320, 130], radius=18, fill=(*CREAM, 235))
    canvas.alpha_composite(chip)
    draw = ImageDraw.Draw(canvas)
    draw.text((68, 88), "SIYA HEALTH", fill=NAVY, font=brand)
    draw.rectangle([68, 118, 180, 123], fill=MAGENTA)

    tx, ty = x0 + pad_x, y0 + pad_y + 12
    draw.multiline_text((tx, ty), caption, fill=NAVY, font=title_f, spacing=16, align="left")

    footer = scene.get("footer")
    if footer:
        ff = font(SANS_REG, 28)
        fb = draw.textbbox((0, 0), footer, font=ff)
        fw = fb[2] - fb[0]
        # Footer cream bar
        bar = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        bd = ImageDraw.Draw(bar)
        bd.rounded_rectangle([120, H - 150, W - 120, H - 90], radius=16, fill=(*CREAM, 230))
        canvas.alpha_composite(bar)
        draw = ImageDraw.Draw(canvas)
        draw.text(((W - fw) // 2, H - 138), footer, fill=DARK_NAVY, font=ff)

    return canvas.convert("RGB")


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

        print("Compositing script-matched background scenes…")
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

        # Ken Burns-ish mild zoom via zoompan per segment would be heavy;
        # use crossfade concat for smoother scene changes.
        silent = tdir / "silent.mp4"
        print("Encoding video…")
        # Build filter with xfade between stills held as short clips
        # Simpler reliable path: concat demuxer + fps
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
    print("Avatar-free · script-matched background scenes")


if __name__ == "__main__":
    main()
