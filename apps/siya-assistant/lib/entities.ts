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
 */

export interface EntityCta {
  id: string
  label: string
  url: string
}

export interface KnowledgeEntity {
  entity: string
  name: string
  canonical_page: string
  aliases: string[]
  geo?: string
  topic?: string
  primary_cta: EntityCta
  secondary_ctas: EntityCta[]
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
 * Returns canonical page + CTAs + related entities with resolved URLs — no LLM required.
 */
export function answerForEntity(id: string): {
  entity: string
  name: string
  canonical_page: string
  canonical_url: string
  primary_cta: GuideLink
  secondary_ctas: GuideLink[]
  related_entities: string[]
} | null {
  const e = getEntity(id)
  if (!e) return null
  return {
    entity: e.entity,
    name: e.name,
    canonical_page: e.canonical_page,
    canonical_url: absolute(e.canonical_page),
    primary_cta: toGuideLink(e.primary_cta),
    secondary_ctas: e.secondary_ctas.map(toGuideLink),
    related_entities: e.related_entities,
  }
}

/** One-shot: query → deterministic canonical answer (or null). */
export function resolveAnswer(query: string) {
  const e = resolveEntity(query)
  return e ? answerForEntity(e.entity) : null
}
