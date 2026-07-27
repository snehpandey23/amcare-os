# Canonical Entity Taxonomy v1

```text
Status:            FROZEN
Date:              2026-07-27
Governance:        Siya Knowledge Governance Framework v1.0
Scope:             Entity classes for the knowledge graph — not a page inventory
```

Every future entity must belong to **exactly one** class below.
No ad hoc categories. No transitional intents in the Public Knowledge API.

---

## Classes

| Class | Role | Intent (PK API) | `entity_family` |
| --- | --- | --- | --- |
| **Root Service** | Taxonomy root; everything eventually routes here | `service` | `root_service` |
| **Service** | Care frame under the root (preventive, specialty lanes) | `service` | `service` |
| **Condition** | Named clinical condition hub | `condition` | `condition` |
| **Symptom** | Lived experience hub; conditions are *related* | `symptom` | `symptom` |
| **Laboratory** | Marker education under Preventive Care | `lab` | `lab` |

**Intent vs family:** `intent` is the public contract field consumers route on.
`entity_family` is the taxonomy class. Root Service uses `intent: "service"` so
routing stays simple; the root distinction lives in `entity_family: "root_service"`.

Do **not** invent transitional values (`service → symptom`, dual intents, or
migration arrows) in API responses.

---

## Frozen inventory (v1)

### Root Service

```text
Primary Care                    /primary-care
```

### Service

```text
Preventive Care                 /preventive-care
```

(Operational process pages such as `/primary-urgent-care`, `/adhd-care`,
`/telehealth` are **care-process surfaces**, not additional taxonomy classes.
They hang under Primary Care in the graph.)

### Condition

```text
Adult ADHD California           /adult-adhd-california
```

### Symptom

```text
Fatigue                         /fatigue
Brain Fog                       /brain-fog
```

### Laboratory

```text
CBC                             /labs/cbc
CMP                             /labs/cmp
Lipid Panel                     /labs/lipid-panel
HbA1c                           /labs/a1c-blood-sugar
TSH                             /labs/thyroid
Ferritin                        /labs/iron-ferritin
Vitamin B12                     /labs/vitamin-b12
Vitamin D                       /labs/vitamin-d
```

Overview child (not a fifth class): `/labs/preventive` under Preventive Care.

---

## Service hierarchy (target shape)

```text
Primary Care                    ← Root Service Entity

├── Preventive Care             ← Service
├── ADHD Care                   ← care-process / condition lane
├── Women's Health              ← future Service / midlife parent
├── Men's Health                ← future Service
├── Weight Management           ← care-process
└── Telehealth                  ← modality / access surface
```

Symptoms and Labs connect **through** Primary Care and Preventive Care —
they are not siblings of the root.

---

## Clinical journey the graph must support

```text
Symptom → Primary Care → Evaluation → Possible Labs → Possible Conditions → Care
```

Not:

```text
Keyword → Blog → Book ADHD
```

---

## Change control

1. Adding an entity requires choosing a frozen class first.
2. Promoting a care-process page to a Service or Root Service requires an
   explicit taxonomy amendment (version bump), not a silent rename.
3. Public Knowledge API responses must expose a single stable `intent` —
   never a migration path in the payload.
4. Blueprint pages clone architecture; this file owns **classification**.

Related: `CANONICAL-ENTITY-PAGE-BLUEPRINT.md` · `SIYA-KNOWLEDGE-PLATFORM.md` ·
`SIYA-KNOWLEDGE-GOVERNANCE-FRAMEWORK.md`
