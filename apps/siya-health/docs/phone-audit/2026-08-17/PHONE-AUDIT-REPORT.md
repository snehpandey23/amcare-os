# Phone audit — 2026-08-17

Base: https://www.siya.health
Device: iPhone 13 emulation (390×844)
Shots: `docs/phone-audit/2026-08-17/shots`

Policy: `docs/PHONE-FIRST.md` · soft Perf floor: 55

## Lighthouse mobile scores

| Page | Perf | A11y | BP | SEO | vs floor |
|---|---:|---:|---:|---:|---|
| home | 64 | 96 | 73 | 100 | ok |
| adhd-care | 62 | 96 | 73 | 100 | ok |
| pricing | 67 | 96 | 73 | 100 | ok |
| adhd-screening | 67 | 95 | 73 | 100 | ok |
| adhd-evaluation-texas | 72 | 96 | 77 | 69 | ok |
| adhd-evaluation-california | 65 | 96 | 77 | 69 | ok |
| adult-adhd-california | 61 | 95 | 77 | 100 | ok |
| weight-loss | 65 | 96 | 77 | 100 | ok |
| telehealth | 65 | 96 | 77 | 100 | ok |
| mens-health | 64 | 96 | 77 | 100 | ok |
| labs | 62 | 95 | 77 | 92 | ok |
| intake | 67 | 95 | 77 | 69 | ok |

## Automated layout / UX findings

### Medium

- **home** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Free screening →" 109×22; "See how pricing maps to this journey →" 283×19; "Explore Primary Care" 144×24)
- **adhd-care** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Dr. Sneh Pandey, MD" 160×20; "Creyos cognitive testing" 173×19; "Dr. Sneh Pandey, MD" 176×24)
- **pricing** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "preventive labs" 105×18; "Labs & Blood Tests" 133×18; "Creyos" 48×18)
- **adhd-screening** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "ADHD evaluation pricing" 185×20; "ADHD evaluation & care" 152×16; "Free ADHD screening" 137×16)
- **adhd-evaluation-texas** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Creyos cognitive testing" 173×19; "Dr. Sneh Pandey, MD" 176×24; "Dr. Natasha Desai, MD" 190×24)
- **adhd-evaluation-california** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Creyos cognitive testing" 173×19; "Dr. Sneh Pandey, MD" 176×24; "Wendy Delgado, PA-C" 191×24)
- **adult-adhd-california** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "ADHD Care" 86×20; "What ADHD can look like in adults" 252×19; "Frequently asked questions" 204×19)
- **weight-loss** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Dr. Sneh Pandey, MD" 160×20; "Dr. Sneh Pandey, MD" 176×24; "Dr. Vanessa Urbina, MD" 201×24)
- **telehealth** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "physician-guided lab options" 219×20; "interpretation" 101×20; "primary and urgent care" 173×19)
- **mens-health** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Labs" 36×19; "Dr. Sneh Pandey, MD" 160×20; "Dr. Sneh Pandey, MD" 176×24)
- **labs** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "preventive care" 117×20; "Women’s health" 117×19; "Women’s midlife health" 171×19)
- **intake** (`small-tap-targets`): 8+ tap targets under ~40px (sample: "Terms of Use" 92×18; "Privacy Policy" 96×18; "Notice of Privacy Practices" 186×18)

## Screenshot review checklist (agent)

Review `shots/*-hero.png` and `*-section.png` for:
1. Hero CTA / nav collision on transparent headers
2. Symptom card image relevance (gender / topic match)
3. Text overflow under sticky CTAs
4. Blog search + featured cards density
5. Labs visual strip readability

## Next

Human review only for remaining subjective brand/trust notes after machine punch list is cleared.
