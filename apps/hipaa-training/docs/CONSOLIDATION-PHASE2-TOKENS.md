# SiyaOS Staff Portal — Design Token Consolidation (Phase 2)

**Status:** In progress · My Day + Ask **done** · other sections pending  
**Phase 1:** Complete — see `CONSOLIDATION-AUDIT-PHASE0-AUG2026.md`

---

## Consolidated token set (`src/app/globals.css`)

| Category | Tokens |
|----------|--------|
| **Brand** | `--siya-primary`, `--siya-primary-hover`, `--siya-accent`, `--siya-accent-hover` |
| **Text** | `--siya-text`, `--siya-text-secondary`, `--siya-text-muted` |
| **Surfaces** | `--siya-border`, `--siya-bg-page`, `--siya-bg-subtle`, `--siya-white` |
| **Radius** | `--siya-radius-sm` (8px), `--siya-radius-md` (12px), `--siya-radius-lg` (16px), `--siya-radius-xl` (20px) |
| **Elevation** | `--siya-shadow`, `--siya-shadow-lg` |
| **Status** | `--siya-status-warn-*`, `--siya-status-info-*`, `--siya-status-success-*`, `--siya-status-error-*` |

**Primary CTA:** teal accent (`--siya-accent`)  
**Secondary / tab active / navy actions:** `--siya-primary`  
**No separate executive violet theme** — Founder Coach uses same surfaces as the rest of the portal.

---

## Shared class module (`src/lib/portal-ui.ts`)

Use these instead of one-off Tailwind for layout, cards, buttons, tabs, and status boxes.

`training-ui.tsx` remains the LMS primitive layer; its radius now references `--siya-radius-*` where updated.

---

## Phase 2 progress

### ✅ My Day (complete)

| Component | Changes |
|-----------|---------|
| `HomeHub.tsx` | `portalPage`, `portalSection`, focus rail uses primary (not violet), unified inputs/buttons |
| `FounderCoachPanel.tsx` | Removed violet gradient/chrome; standard section + tabs + status tokens |
| `ExecutiveBriefingPanel.tsx` | Removed violet wrapper; standard section |
| `MySopOwnershipNotice.tsx` | Removed violet; `portalNoticeLead` + accent buttons |
| `SopLeadMyDayCard.tsx` | Standard compact section |

### ✅ Ask (complete)

| Component | Changes |
|-----------|---------|
| `help/page.tsx` | Focus mode heading uses `portalH2` (primary, not violet) |
| `SiyaChat.tsx` | Task-approve info box, knowledge-gap warn box, input/send use portal classes |
| `AssistantBrandPanel.tsx` | Link label → "Practice" |

### ⏳ Pending (not started)

- **Learn** — `LearnHub`, `LevelUpHub`, LMS shell (partial overlap with `training-ui.tsx`)
- **Memory** — `MemoryHub`, knowledge panels
- **Team** — pulse, handoffs, presence bar (violet focus pill)
- **Admin** — task board, templates, SOP review
- **Shift** — `ShiftPresenceBar`, `MorningBrief` gradient
- **Chat review / ops** — mixed form inputs
- **Resources** — legacy zinc/teal palette (`/resources/*`)

---

## Out of scope (unchanged)

- No new features or animations
- No magazine/brand redesign
- Business logic and APIs untouched

---

**Next:** Founder review of My Day + Ask in prod/staging, then continue with **Learn** section.
