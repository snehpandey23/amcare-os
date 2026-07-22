# Siya Creative Registry

```text
Registry v0.1
Under Creative System v1.1 / Brand OS v1.2.1
Status: Factory — fill, don’t philosophize
```

**Parents:** [`../04-CREATIVE-SYSTEM.md`](../04-CREATIVE-SYSTEM.md) · [`../01-BRAND-OS.md`](../01-BRAND-OS.md) · [`../02-VISUAL-LANGUAGE.md`](../02-VISUAL-LANGUAGE.md)

This is **not** another brand document. It is the **filled layout classes**.

Creative System defines empty classes (`R-01`, `E-02`, …).  
The Registry holds **approved instances**.

**Goal:** 200 approved creatives within 2–3 months.  
**Rule:** Do not stare into a blank canvas. Pick a family + layout, then clone or adapt a registry entry.

---

## Folder grammar

```text
creative-registry/
  {Family}/
    {Layout-ID}/
      {slug}/
        schema.yaml    # Creative Schema (required)
        brief.md       # Human-readable brief + copy directions
        notes.md       # optional production notes
```

Family folder names:

| Folder | Code |
|--------|------|
| Recognition | R |
| Explanation | E |
| Myth | M |
| Research | RS |
| PhysicianPerspective | PP |
| Process | PR |
| Proof | PF |
| Action | A |

---

## Status values (`schema.yaml` → `status`)

| Status | Meaning |
|--------|---------|
| `seed` | Classified from existing Siya work; not yet a finished outbound asset |
| `draft` | In production |
| `review` | Awaiting clinical / brand QA |
| `approved` | Safe to clone / adapt |
| `published` | Live on at least one channel |
| `retired` | Do not reuse |

---

## How to add an entry

1. Choose **Intent** → **Family** → **Layout ID** (`04-CREATIVE-SYSTEM.md`).
2. Create `Family/Layout/slug/`.
3. Fill `schema.yaml` (full Creative Schema).
4. Fill `brief.md` (message, recognition moment, copy, CTA, photo category).
5. Run Creative QA checklist.
6. Set `status: approved` only after QA.
7. Add a row to [`INDEX.md`](./INDEX.md).

**New layout IDs** require two successful uses + changelog note in Brand OS — don’t invent R-99 casually.

---

## Matrix question (replaces “what should we post?”)

> What gaps exist in the matrix?

Filter [`INDEX.md`](./INDEX.md) by `topic` × `intent` × `journey_stage` × `family`. Fill empty cells before inventing new topics.

---

## Related factory pieces

| Piece | Path | Phase |
|-------|------|-------|
| Prompt library | [`../prompts/`](../prompts/) | Phase 2 |
| Research → content templates | [`../research/`](../research/) | Phase 3 stub |
| Component System | `../05-COMPONENT-SYSTEM.md` | Deferred (after registry traction) |
| AI Creative Guide | `../06-AI-CREATIVE-GUIDE.md` | Last |

---

## Seed set (v0.1)

First entries are **classified from existing site / photography / social hooks** — institutional memory, not invented campaigns. Promote from `seed` → `approved` as you ship real channel assets.
