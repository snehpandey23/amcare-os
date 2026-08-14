#!/usr/bin/env python3
"""Render ADHD-R-01 avatar-free reel: branded text scenes + VO (no digital human)."""

from __future__ import annotations

import asyncio
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "editorial-packs" / "ADHD-R-01" / "video"
OUT_MP4 = OUT_DIR / "ADHD-R-01-reel.mp4"
W, H = 1080, 1920

CREAM = (244, 239, 231)
NAVY = (0, 24, 120)
DARK_NAVY = (10, 36, 107)
MAGENTA = (216, 16, 136)

SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
SANS_REG = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"

# On-screen caption scenes. Weights scale to final VO length (~45–55s target).
SCENES: list[dict] = [
    {"caption": "Do ADHD relationships\never work?", "accent": None, "weight": 4.0},
    {"caption": "Yes — when you face\nthe hard parts", "accent": "Yes", "weight": 3.5},
    {"caption": "Love can feel intense\n& genuine", "accent": None, "weight": 3.0},
    {"caption": "Follow-through can\nstill be inconsistent", "accent": None, "weight": 3.2},
    {"caption": 'Partners hear:\n"You don\'t care"', "accent": None, "weight": 3.0},
    {"caption": 'ADHD partner hears:\n"You\'re failing"', "accent": None, "weight": 3.0},
    {"caption": "Resentment ↔ shame", "accent": "↔", "weight": 2.8},
    {"caption": "Clinicians describe\nthis cycle", "accent": None, "weight": 3.2},
    {"caption": "Symptoms ≠ character", "accent": "≠ character", "weight": 2.8},
    {"caption": "Pause. Systems.\nShared ownership.", "accent": "Pause", "weight": 4.0},
    {"caption": "ADHD doesn't\ndoom love", "accent": "doesn't doom love", "weight": 3.2},
    {
        "caption": "One honest conversation\nthis week",
        "accent": None,
        "weight": 4.5,
        "footer": "Siya Health  ·  Educational only",
    },
]

# ~120 words → ~50s at -5% rate
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


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


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
    img = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    brand = font(SANS_REG, 28)
    draw.text((72, 96), "SIYA HEALTH", fill=NAVY, font=brand)
    draw.rectangle([72, 140, 220, 146], fill=MAGENTA)

    title_size = 72 if scene["caption"].count("\n") <= 1 else 64
    if len(scene["caption"]) > 42:
        title_size = 58
    title_f = font(SERIF, title_size)
    caption = wrap_fit(draw, scene["caption"], title_f, W - 144)

    bbox = draw.multiline_textbbox((0, 0), caption, font=title_f, spacing=18, align="left")
    th = bbox[3] - bbox[1]
    x = 72
    y = (H - th) // 2 - 40

    draw.multiline_text((x, y), caption, fill=NAVY, font=title_f, spacing=18, align="left")

    if scene.get("accent"):
        first = caption.split("\n")[0]
        fl = draw.textlength(first, font=title_f)
        draw.rectangle([x, y + title_size + 10, x + min(fl, 420), y + title_size + 16], fill=MAGENTA)

    footer = scene.get("footer")
    if footer:
        ff = font(SANS_REG, 30)
        fb = draw.textbbox((0, 0), footer, font=ff)
        fw = fb[2] - fb[0]
        draw.text(((W - fw) // 2, H - 180), footer, fill=DARK_NAVY, font=ff)
    else:
        draw.rectangle([0, H - 24, W, H], fill=NAVY)

    return img


async def synthesize_voice(path: Path) -> None:
    import edge_tts

    # Slightly faster so the finished reel lands near ~50–55s
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
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        tdir = Path(td)
        voice = tdir / "vo.mp3"
        print("Synthesizing voiceover (no avatar)…")
        asyncio.run(synthesize_voice(voice))
        dur = audio_duration(voice)
        print(f"VO duration: {dur:.2f}s")

        total_w = sum(s["weight"] for s in SCENES)
        target = dur + 0.35

        frames_dir = tdir / "frames"
        frames_dir.mkdir()
        for i, scene in enumerate(SCENES):
            draw_scene(scene).save(frames_dir / f"scene_{i:02d}.png")

        raw = [max(target * (s["weight"] / total_w), 1.25) for s in SCENES]
        scale = target / sum(raw)
        durs = [r * scale for r in raw]
        concat_lines: list[str] = []
        for i, sec in enumerate(durs):
            fp = frames_dir / f"scene_{i:02d}.png"
            concat_lines.append(f"file '{fp}'")
            concat_lines.append(f"duration {sec:.3f}")
        concat_lines.append(f"file '{frames_dir / f'scene_{len(SCENES) - 1:02d}.png'}'")

        concat_path = tdir / "concat.txt"
        concat_path.write_text("\n".join(concat_lines) + "\n")

        silent_video = tdir / "video_silent.mp4"
        print("Encoding slideshow…")
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
                str(silent_video),
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
                str(silent_video),
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

        # Keep a still for QA / pack preview
        preview = OUT_DIR / "preview-frame.png"
        subprocess.check_call(
            [
                "ffmpeg",
                "-y",
                "-ss",
                "2",
                "-i",
                str(OUT_MP4),
                "-frames:v",
                "1",
                str(preview),
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )

    size_mb = OUT_MP4.stat().st_size / (1024 * 1024)
    final_dur = audio_duration(OUT_MP4)
    print(f"Wrote {OUT_MP4} ({size_mb:.1f} MB, {final_dur:.1f}s) — avatar-free")


if __name__ == "__main__":
    main()
