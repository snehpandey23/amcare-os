# Pricing Hygiene Pass — 2026-07-19

## Evergreen titles

Removed dollar amounts from page **titles and H1s** where the page is not uniquely a cost article. Body copy and FAQ answers still state the current fee and point to `/pricing`.

Examples:

| Before | After |
|--------|--------|
| What is included in Siya Health’s $149 ADHD evaluation? | What is included in a Siya Health ADHD evaluation? |
| Online ADHD Diagnosis Texas \| $149 Evaluation | Online ADHD Diagnosis Texas |
| Creyos … Part of $149 Evaluation | Creyos … Part of Your Evaluation |
| ADHD Care title with ($149) | Same without price |

URL `/answers/what-included-199-adhd-evaluation` unchanged (historical slug).

## Shared price component

| Piece | Role |
|-------|------|
| `data/site-standards.mjs` → `PRICING` | Numeric source of truth |
| `data/pricing-display.mjs` | `renderInitialEvaluationPrice()`, `applyPricingTokens()`, display helpers |
| `<!-- SIYA:PRICE:INITIAL_EVAL -->` / `{{pricing.initialEvaluation}}` | Authoring tokens |
| `scripts/site-chrome.mjs` | Expands tokens on every page at build |
| `design-system/trust-system.mjs` | Trust strip reads `PRICING.initialEvaluation.display` |
| `scripts/generate-pricing-page.mjs` / `generate-answer-pages.mjs` | Emit or expand tokens |

Follow-up fees ($79 / $149/month) remain separate fields in `PRICING` and are not the initial-evaluation token.

## Editorial rule

Documented in `EDITORIAL-STYLE-GUIDE.md` §5: no dollar amounts in titles/H1s when the topic is not uniquely cost; pricing page owns fees.
