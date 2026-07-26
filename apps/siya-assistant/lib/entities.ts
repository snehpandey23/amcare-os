import entitiesData from '../data/knowledge-entities.json'
import { LINK_REGISTRY } from './link-registry'
import type { GuideLink } from './types'

/**
 * Public Knowledge API (internal abstraction) — Siya Knowledge Governance v1.0.
 *
 * Given a user query, resolve to a CANONICAL entity deterministically BEFORE any
 * LLM reasoning. Every surface (Siya Guide, provider tools, future apps) asks
 * "Fetch the canonical entity" instead of "What should I link?". This keeps the
 * website, chatbot, and knowledge graph pointing at one source of truth.
 *
 * Answers include intent + care_pathway so routing is shared — no surface invents
 * "symptom → primary care" vs "condition → specialty" on its own.
 */

/** Why the reader arrived — drives CTA and care pathway, not page layout. */
export type EntityIntent = 'symptom' | 'condition' | 'service' | 'lab' | 'screening'

/** Shared care destination every surface should route toward for this entity. */
export type CarePathway =
  | 'primary_care'
  | 'adhd_care'
  | 'labs'
  | 'weight_loss'
  | 'womens_health'
  | 'mens_health'
  | 'telehealth'

export interface EntityCta {
  id: string
  label: string
  url: string
}

export interface KnowledgeEntity {
  entity: string
  name: string
  canonical_page: string
  /** Required from registry v3 — symptom vs condition vs service, etc. */
  intent: EntityIntent
  /** Required from registry v3 — shared routing target across all surfaces. */
  care_pathway: CarePathway
  aliases: string[]
  geo?: string
  topic?: string
  /** Symptom hubs declare graph relationships (see /fatigue). */
  parents?: string[]
  children?: string[]
  labs?: string[]
  primary_cta: EntityCta
  secondary_ctas: EntityCta[]
  related_guides?: EntityCta[]
  related_services?: EntityCta[]
  related_entities: string[]
  note?: string
}

/** Deterministic answer contract consumed by chatbot, search, apps, email. */
export interface EntityAnswer {
  entity: string
  name: string
  intent: EntityIntent
  care_pathway: CarePathway
  canonical_page: string
  canonical_url: string
  primary_cta: GuideLink
  secondary_ctas: GuideLink[]
  related_guides: GuideLink[]
  related_services: GuideLink[]
  related_entities: string[]
}

const data = entitiesData as {
  version: number
  entities: Record<string, KnowledgeEntity>
}

const SITE = 'https://www.siya.health'

/** Absolute-URL a site-relative path. External/absolute URLs pass through. */
function absolute(url: string): string {
  if (/^https?:\/\//.test(url) || url.startsWith('mailto:') || url.startsWith('tel:')) return url
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`
}

function toGuideLink(cta: EntityCta): GuideLink {
  // Prefer the shared link registry URL when the id is registered (single source of truth).
  const rec = LINK_REGISTRY[cta.id]
  return { id: cta.id, label: cta.label, url: rec ? rec.url : absolute(cta.url) }
}

export function getEntity(id: string): KnowledgeEntity | null {
  return data.entities[id] ?? null
}

export function listEntities(): KnowledgeEntity[] {
  return Object.values(data.entities)
}

/**
 * Resolve a free-text query to the best-matching canonical entity.
 * Alias phrase match wins over token overlap. Returns null when nothing is confident.
 */
export function resolveEntity(query: string): KnowledgeEntity | null {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!q) return null

  let best: { entity: KnowledgeEntity; score: number } | null = null
  for (const entity of listEntities()) {
    let score = 0
    for (const alias of entity.aliases) {
      const a = alias.toLowerCase()
      if (q.includes(a)) score = Math.max(score, 10 + a.length)
    }
    // Geo + topic co-occurrence (e.g. "adhd" + "california") as a fallback signal.
    if (score === 0 && entity.geo && entity.topic) {
      if (q.includes(entity.geo.toLowerCase()) && q.includes(entity.topic.toLowerCase())) score = 8
    }
    if (score > 0 && (!best || score > best.score)) best = { entity, score }
  }
  return best?.entity ?? null
}

/**
 * The deterministic answer surface for the chatbot / apps.
 * Returns intent, care pathway, canonical page, CTAs, and related entities — no LLM required.
 */
export function answerForEntity(id: string): EntityAnswer | null {
  const e = getEntity(id)
  if (!e) return null
  return {
    entity: e.entity,
    name: e.name,
    intent: e.intent,
    care_pathway: e.care_pathway,
    canonical_page: e.canonical_page,
    canonical_url: absolute(e.canonical_page),
    primary_cta: toGuideLink(e.primary_cta),
    secondary_ctas: e.secondary_ctas.map(toGuideLink),
    related_guides: (e.related_guides ?? []).map(toGuideLink),
    related_services: (e.related_services ?? []).map(toGuideLink),
    related_entities: e.related_entities,
  }
}

/** One-shot: query → deterministic canonical answer (or null). */
export function resolveAnswer(query: string): EntityAnswer | null {
  const e = resolveEntity(query)
  return e ? answerForEntity(e.entity) : null
}
