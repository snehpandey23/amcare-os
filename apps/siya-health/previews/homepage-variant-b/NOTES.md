# Homepage color preview — Variant B (gold / champagne)

**Do not commit as production.** Preview-only.

## Accent hex (NEW — not from logo)

| Token | Hex | Rationale |
|-------|-----|-----------|
| `--accent-secondary` | **`#C4A574`** | Muted champagne gold: warm, low chroma, pairs with cream `#F4EFE7` and navy `#001878` without competing with magenta `#D81088`. Avoids bright “trophy gold.” |

**Flag:** Approving this direction expands the documented brand palette — it is not a logo-derived fix.

## Where applied

1. Soft champagne→navy wash over hero photo (`::after`)
2. Thin gold underline under hero `h1`
3. Symptom chips — soft champagne tint + navy text
4. Trust stats row — champagne wash
5. Gold divider above “How care usually unfolds”
6. Flow step numerals tinted toward gold/navy mix
7. Cookie banner — cream bg, soft navy shadow (same as A)

Magenta remains the single filled hero CTA only.

## View

From `apps/siya-health`:

```bash
python3 previews/serve-homepage-previews.py
```

Then open **http://127.0.0.1:8767/** (Variant B).
