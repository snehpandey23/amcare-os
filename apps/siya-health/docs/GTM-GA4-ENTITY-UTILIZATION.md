# GTM → GA4 — Entity Utilization mapping

```text
Status:            Ready to configure (human step in GTM UI)
Container:         GTM-PLBD4TTQ
GA4 property:      G-9WTQWHCTFT
Client source:     scripts/siya-tracking.js
Registry:          data/canonical-entities.mjs
Machine map:       data/entity-utilization-ga4-map.json
```

Until this is wired, Entity Utilization events exist in `dataLayer` only.
They will **not** appear in GA4 reports.

---

## 1. GA4 custom dimensions (create first)

Admin → Data display → Custom definitions → Create custom dimensions.

| Dimension name | Scope | Event parameter | Description |
| --- | --- | --- | --- |
| Entity | Event | `entity` | Canonical entity id (`brain_fog`, `fatigue`, …) |
| Entity family | Event | `entity_family` | `root_service` · `service` · `symptom` · `condition` · `laboratory` |
| Care pathway | Event | `care_pathway` | `primary_care` · `adhd` |
| Traffic source (Siya) | Event | `traffic_source` | Client heuristic: organic / paid / direct / referral / email / social |
| Entity state | Event | `state` | Optional geo (`CA`) |
| Related entity | Event | `related_entity` | Destination entity on related clicks |
| Assist path | Event | `assist_path` | Ordered session entity path (comma-separated) |
| Assisted entities | Event | `assisted_entities` | Prior entities before conversion (comma-separated) |
| Conversion type | Event | `conversion_type` | e.g. `primary_cta` |
| Time on page (ms) | Event | `time_on_page_ms` | On `entity_exit` only |

**Do this before (or immediately with) the first publish.** Dimensions only apply to data collected after they exist — no retrofill.

Optional (already common in GA4, map if useful):

| Dimension name | Scope | Event parameter |
| --- | --- | --- |
| Link URL | Event | `link_url` |
| Link text | Event | `link_text` |
| CTA track | Event | `cta_track` |

---

## 2. GTM variables (Data Layer Variables)

In `GTM-PLBD4TTQ`, create **Data Layer Variable** for each:

| GTM variable name | Data Layer Variable Name |
| --- | --- |
| DLV - entity | `entity` |
| DLV - entity_family | `entity_family` |
| DLV - care_pathway | `care_pathway` |
| DLV - traffic_source | `traffic_source` |
| DLV - state | `state` |
| DLV - related_entity | `related_entity` |
| DLV - related_entity_family | `related_entity_family` |
| DLV - assist_path | `assist_path` |
| DLV - assisted_entities | `assisted_entities` |
| DLV - conversion_type | `conversion_type` |
| DLV - time_on_page_ms | `time_on_page_ms` |
| DLV - link_url | `link_url` |
| DLV - link_text | `link_text` |
| DLV - cta_track | `cta_track` |
| DLV - page_path | `page_path` |

---

## 3. Triggers (Custom Event)

One trigger per event name (exact match):

| Trigger name | Event name |
| --- | --- |
| CE - entity_view | `entity_view` |
| CE - entity_related_click | `entity_related_click` |
| CE - entity_primary_cta_click | `entity_primary_cta_click` |
| CE - entity_secondary_cta_click | `entity_secondary_cta_click` |
| CE - entity_exit | `entity_exit` |
| CE - entity_conversion | `entity_conversion` |

`entity_guide_entry` is reserved for Siya Guide — wire when Guide instrumentation lands (separate app).

---

## 4. GA4 Event tags

For each trigger, create a **Google Analytics: GA4 Event** tag:

| Tag name | Event name | Trigger |
| --- | --- | --- |
| GA4 - entity_view | `entity_view` | CE - entity_view |
| GA4 - entity_related_click | `entity_related_click` | CE - entity_related_click |
| GA4 - entity_primary_cta_click | `entity_primary_cta_click` | CE - entity_primary_cta_click |
| GA4 - entity_secondary_cta_click | `entity_secondary_cta_click` | CE - entity_secondary_cta_click |
| GA4 - entity_exit | `entity_exit` | CE - entity_exit |
| GA4 - entity_conversion | `entity_conversion` | CE - entity_conversion |

**Configuration tag:** use existing GA4 Config for `G-9WTQWHCTFT` (do not install a second gtag).

### Event parameters to send (all entity tags)

| Parameter name | Value |
| --- | --- |
| `entity` | `{{DLV - entity}}` |
| `entity_family` | `{{DLV - entity_family}}` |
| `care_pathway` | `{{DLV - care_pathway}}` |
| `traffic_source` | `{{DLV - traffic_source}}` |
| `state` | `{{DLV - state}}` |
| `page_path` | `{{DLV - page_path}}` |

### Extra parameters by event

| Event | Extra parameters |
| --- | --- |
| `entity_related_click` | `related_entity`, `related_entity_family`, `link_url`, `link_text` |
| `entity_primary_cta_click` | `link_url`, `link_text`, `cta_track` |
| `entity_secondary_cta_click` | `link_url`, `link_text`, `cta_track` |
| `entity_exit` | `time_on_page_ms` |
| `entity_conversion` | `conversion_type`, `assist_path`, `assisted_entities`, `link_url`, `link_text` |

Mark **`entity_conversion`** as a key event (conversion) in GA4 after data appears.

---

## 5. Preview verification (must pass before Publish)

1. Open GTM Preview → connect to `https://www.siya.health/brain-fog?debug_tracking=1`
2. Confirm Console `[Siya Tracking] entity_view` and GTM sees Custom Event `entity_view`
3. Click a related entity link (e.g. Fatigue) → `entity_related_click`
4. Click primary CTA → `entity_primary_cta_click` + `entity_conversion`
5. Navigate away → `entity_exit` with `time_on_page_ms`
6. Repeat on `/fatigue`, `/primary-care`, `/adult-adhd-california`
7. GA4 DebugView (same session): all six events with `entity` populated

### Pass criteria

| Check | Pass |
| --- | --- |
| All 6 events fire in GTM Preview | ☐ |
| All 6 appear in GA4 DebugView | ☐ |
| `entity` / `entity_family` / `care_pathway` populated | ☐ |
| `assist_path` present on `entity_conversion` | ☐ |
| No duplicate GA4 Config tags on page | ☐ |

Then **Submit** the GTM workspace (name: `Entity Utilization v1`).

---

## 6. First explorations (after ~48h)

| Question | Exploration sketch |
| --- | --- |
| Which symptom introduces the most users? | Free form: Event = `entity_view` · Dimension = Entity · Filter family = `symptom` |
| Which supporting article drives entity transitions? | Landing page + `entity_related_click` by `related_entity` |
| Highest assisted conversion rate? | `entity_conversion` · Dimension = `assisted_entities` or first hop in `assist_path` |
| Which CTA works per entity? | `entity_primary_cta_click` · Entity × `link_url` |

---

## 7. Search Console (parallel, indexing only)

Property: `siya.health` (or URL-prefix as configured).

| Watch | Why |
| --- | --- |
| Indexed vs Submitted | Batch 1 discovery |
| Canonical selection | No unexpected consolidation onto wrong URLs |
| Crawl / exclusions | Soft 404, noindex, redirect mistakes |
| Internal links | Hub → supporting articles recognized |

Do **not** judge rankings in week 1. Judge indexing health.

Batch 1 URLs to inspect:

```text
/blog/brain-fog-vs-adhd
/blog/brain-fog-and-sleep
/blog/brain-fog-and-anxiety
/blog/brain-fog-after-covid
/blog/fatigue-despite-normal-labs
/blog/iron-deficiency-and-fatigue
/blog/thyroid-and-fatigue
/blog/chronic-fatigue-vs-everyday-tiredness
```

---

## Related

- `ENTITY-UTILIZATION.md` — event model
- `OPERATING-SNAPSHOT-MONTHLY.md` — monthly KPI sheet
- `SUPPORTING-CLUSTER-BATCH-1.md` — published cluster inventory
