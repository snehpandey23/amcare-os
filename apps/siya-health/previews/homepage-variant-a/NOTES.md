# Homepage color preview — Variant A (logo-native tertiary)

**Do not commit as production.** Preview-only.

## Accent hex

| Token | Hex | Source |
|-------|-----|--------|
| `--accent-secondary` | **`#5A32B8`** | Pixel average of mid-gradient band (hue 245–275°) in `assets/images/siya-health-mark.png` — 7,610 opaque flame pixels between magenta and navy |
| Nearby frequent stop | `#5030B8` | Same mark file, dense cluster ~`(552, 551)` |

Lockup `siya-health-logo.png` has the same family but fewer mid-stops; the mark was used because the flame/heart gradient is denser.

## Where applied

1. Soft periwinkle→navy wash over hero photo (`::after`)
2. Thin lavender rule under hero `h1`
3. Symptom chips (Focus / Energy / …) — soft tertiary tint + navy text
4. Trust stats row (2,700+ / 1,200+ / 4.9★) — soft tertiary wash
5. Subtle card hover / text-link hover tint
6. Cookie banner — cream bg, soft navy shadow (no magenta)

Magenta remains the single filled hero CTA only.

## View

From `apps/siya-health`:

```bash
python3 previews/serve-homepage-previews.py
```

Then open **http://127.0.0.1:8766/** (Variant A).
