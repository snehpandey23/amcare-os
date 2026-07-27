# Entity Utilization

```text
Status:            Active instrumentation (v1)
Companion:         Graph observability (structural health)
Goal:              Answer “Is the graph useful?” not only “Is it healthy?”
```

## Event model

| Event | When |
| --- | --- |
| `entity_view` | Canonical Entity page loads |
| `entity_related_click` | Click to another Canonical Entity (or supporting → parent entity) |
| `entity_primary_cta_click` | Primary conversion CTA on an entity page |
| `entity_secondary_cta_click` | Secondary CTA (e.g. Meet & Greet, screening) |
| `entity_guide_entry` | Siya Guide resolves to this entity (Guide app) |
| `entity_exit` | Leave / hide page (includes `time_on_page_ms`) |
| `entity_conversion` | Booking / evaluation / Meet & Greet conversion while entity context is known |

## Required properties

```json
{
  "entity": "brain_fog",
  "entity_family": "symptom",
  "care_pathway": "primary_care",
  "traffic_source": "organic",
  "state": "CA"
}
```

`state` is optional (set on geo entities such as Adult ADHD California).
`traffic_source` is inferred from UTM / referrer heuristics in `siya-tracking.js`.

## Assisted conversions

Healthcare journeys are multi-page. On conversion we also send:

```json
{
  "event": "entity_conversion",
  "entity": "primary_care",
  "assisted_entities": ["brain_fog", "preventive_care"],
  "assist_path": "/brain-fog,/preventive-care,/primary-care"
}
```

Session storage key: `siya_entity_assist_path` (capped list of recent entity views).

Credit last-touch **and** assists — do not attribute the booking only to `/primary-care`.

## Implementation

| Piece | Path |
| --- | --- |
| Registry | `data/canonical-entities.mjs` |
| Body attrs | `scripts/apply-entity-utilization.mjs` |
| Client events | `scripts/siya-tracking.js` |
| GTM | Map these event names → GA4 (container `GTM-PLBD4TTQ`) |

```bash
node scripts/apply-entity-utilization.mjs
```

Wire into page generators / build after HTML regen so attrs survive rebuilds.

## Dashboard

Graph Health = Coverage · Reachability · Density · Connectivity  
Operational Health = Organic · Guide · Bookings · CTR · CVR · Top growing/declining entity  

Populate Operational Health from GA4 / Search Console / Guide logs once events flow.
