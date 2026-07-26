# Website Cohesion Audit v1.0 — Design Consistency

## Scope and confidence

Production templates were sampled at desktop and 375px mobile widths across the homepage, ADHD care, Blog hub, representative article, pricing, screening, and global navigation/footer. Design findings that were inferred rather than reproduced are explicitly marked.

Overall sampled design score: **78/100**.

## P1

### DES-001 — CTA hierarchy is visually weak

- Affected: approximately 20+ pages with paired CTAs.
- Solid and outlined teal actions can carry similar visual weight.
- Define one primary treatment and one secondary treatment; do not introduce a third style for equivalent actions.

### DES-002 — Inconsistent vertical rhythm

- Card grids use visibly different gaps between homepage, Blog, and service templates.
- Standardize desktop and mobile gap tokens rather than page-local values.

### DES-003 — Dense global footer

- Link rows are tightly spaced on desktop.
- Increase vertical separation and target size while keeping the footer visually subordinate.

### DES-004 — Mobile hero density

- Sampled homepage and Blog hero headings feel compressed at 375px.
- Validate line-height, badge-to-heading spacing, and heading-to-deck spacing across every hero family.

### DES-005 — Pricing-card alignment

- High-visibility pricing cards do not share a strong title/price baseline.
- Normalize internal padding and align content with a shared grid.

## P2

- Card radii vary across symptoms, articles, and pricing.
- Icon sizes vary between process and service-card contexts.
- Divider weights vary.
- Long-form mobile body text should consistently be at least 16px.
- Focus-ring styling is not globally uniform.
- Interactive symptom cards need an explicit non-color hover/focus affordance.
- Testimonials need a clearer mobile swipe/pagination affordance.

## Requires direct reproduction before implementation

- Tablet sidebar bleed on representative Blog articles was inferred from the responsive structure but not conclusively reproduced. Verify at 768px before filing as a defect.
- Button loading states are a product interaction concern, not a visual consistency P0; assess during booking-flow testing.

## Design-system decisions to lock

- Spacing scale for sections, cards, and text stacks.
- One card radius, plus one smaller radius for compact controls.
- One primary, secondary, and text-link action style.
- One focus-visible treatment.
- One divider token for ordinary section separation.
- Mobile type sizes and line-heights for hero, article, and UI text.

## Acceptance threshold

- No component family changes spacing/radius/type treatment without a documented variant.
- Primary action is visually obvious in a five-second scan.
- Mobile hero and long-form templates pass at 320px, 375px, 768px, and desktop.
