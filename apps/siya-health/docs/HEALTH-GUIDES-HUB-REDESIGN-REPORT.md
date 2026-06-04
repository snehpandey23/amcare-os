# Health Guides hub redesign report

Generated: 2026-06-04T02:33:22.723Z

## Before

- Uneven category cards (4-item previews, long expandable lists on hub).
- Telehealth category forced full-width row; visual imbalance across categories.

## After

- `/answers` hub shows **exactly 3 featured guide cards** per category.
- Each card: category icon accent, title, one-line description, Read guide link.
- **View all [Category] guides** reveals remaining guides in a collapsed panel (not on initial view).
- Categories with fewer than 3 guides show **More guides coming soon** placeholder cards.
- Secondary link uses **Explore Care Options**.

## Categories

- **Metabolic Health**: 14 guides, 3 featured + 0 placeholder slot(s)
- **Energy & Fatigue**: 3 guides, 3 featured + 0 placeholder slot(s)
- **Hormone Health**: 9 guides, 3 featured + 0 placeholder slot(s)
- **ADHD & Focus**: 25 guides, 3 featured + 0 placeholder slot(s)
- **Telehealth & Care**: 7 guides, 3 featured + 0 placeholder slot(s)

## Implementation

- `scripts/generate-answer-pages.mjs` — `buildIndexPage()`, `FEATURED_BY_CATEGORY`
- `styles.css` — `.health-guides-featured-grid`, `.health-guide-feature-card`

## Next step

Run `npm run build` to regenerate `answers/index.html` from the generator.
