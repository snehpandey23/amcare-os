import entitiesData from '../data/knowledge-entities.json'
import { LINK_REGISTRY, resolveLinks } from './link-registry'
import type { GuideLink } from './types'

/**
 * Public Knowledge API (internal abstraction) — Siya Knowledge Governance v1.0.
 *
 * Given a user query, resolve to a CANONICAL entity deterministically BEFORE any
 * LLM reasoning. Every surface asks "Fetch the canonical entity" instead of
 * inventing URLs or CTAs. Registry IDs are the only source of link URLs.
 */

export type EntityIntent = 'symptom' | 'condition' | 'service' | 'lab' | 'screening'
export type CarePathway =
  | 'primary_care'
  | 'adhd_care'
  | 'labs'
  | 'weight_loss'
  | 'womens_health'
  | 'mens_health'
  | 'telehealth'
export type SafetyClass = 'general_information' | 'navigation' | 'restricted'

export interface EntityCta {
  id: string
  label: string
  url: string
}

export interface ApprovedAnswerBlock {
  id: string
  text: string
}

export interface KnowledgeEntity {
  entity: string
  name: string
  canonical_page: string
  intent: EntityIntent
  care_pathway: CarePathway
  safety_class: SafetyClass
  aliases: string[]
  geo?: string
  topic?: string
  parents?: string[]
  children?: string[]
  labs?: string[]
  primary_cta: EntityCta
  secondary_ctas: EntityCta[]
  related_guides?: EntityCta[]
  related_services?: EntityCta[]
  related_entities: string[]
  approved_answer_blocks: ApprovedAnswerBlock[]
  note?: string
}

/** Minimum Public Knowledge API response — consumed by Siya Guide and future surfaces. */
export interface EntityAnswer {
  entity: string
  name: string
  intent: EntityIntent
  care_pathway: CarePathway
  safety_class: SafetyClass
  canonical_page: string
  canonical_url: string
  primary_cta: GuideLink
  secondary_ctas: GuideLink[]
  related_guides: GuideLink[]
  related_services: GuideLink[]
  related_entities: string[]
  approved_answer_blocks: ApprovedAnswerBlock[]
}

const data = entitiesData as {
  version: number
  entities: Record<string, KnowledgeEntity>
}

const SITE = 'https://www.siya.health'

function absolute(url: string): string {
  if (/^https?:\/\//.test(url) || url.startsWith('mailto:') || url.startsWith('tel:') || url.startsWith('sms:')) {
    return url
  }
  return `${SITE}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * Resolve a CTA/link id through the Public Links Registry.
 * Never trust a separately typed path — humans duplicating URLs is how redirects gain employment.
 */
function toGuideLink(cta: EntityCta): GuideLink {
  const rec = LINK_REGISTRY[cta.id]
  if (rec) return { id: rec.id, label: cta.label || rec.label, url: rec.url }
  // Soft fallback only if id missing from registry (should not happen in production).
  return { id: cta.id, label: cta.label, url: absolute(cta.url) }
}

export function getEntity(id: string): KnowledgeEntity | null {
  return data.entities[id] ?? null
}

export function listEntities(): KnowledgeEntity[] {
  return Object.values(data.entities)
}

/**
 * Resolve a free-text query to the best-matching canonical entity.
 * Longer alias phrase matches win. Geo + topic co-occurrence is a fallback.
 * Weak substring hits are ignored so incidental phrasing cannot "verify" a page.
 */
const MIN_ENTITY_ALIAS_SCORE = 15 // phrase aliases (len ≥ 5) or boosted whole-token shorts

function aliasMatchesQuery(q: string, alias: string): { matched: boolean; wholeToken: boolean } {
  const a = alias.toLowerCase().trim()
  if (!a) return { matched: false, wholeToken: false }
  const whole = new RegExp(
    `(?:^|\\s)${a.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}(?:\\s|$)`,
  ).test(q)
  if (whole) return { matched: true, wholeToken: true }
  if (a.length >= 5 && q.includes(a)) return { matched: true, wholeToken: false }
  return { matched: false, wholeToken: false }
}

export function resolveEntity(query: string): KnowledgeEntity | null {
  const q = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
  if (!q) return null

  let best: { entity: KnowledgeEntity; score: number } | null = null
  for (const entity of listEntities()) {
    let score = 0
    for (const alias of entity.aliases) {
      const hit = aliasMatchesQuery(q, alias)
      if (!hit.matched) continue
      const a = alias.toLowerCase().trim()
      // Whole-token short lab/service codes (tsh, cbc) get a floor so they still resolve.
      const base = hit.wholeToken && a.length >= 3 && a.length < 5 ? 16 : 10 + a.length
      score = Math.max(score, base)
    }
    if (score === 0 && entity.geo && entity.topic) {
      if (q.includes(entity.geo.toLowerCase()) && q.includes(entity.topic.toLowerCase())) {
        score = 16
      }
    }
    if (score >= MIN_ENTITY_ALIAS_SCORE && (!best || score > best.score)) {
      best = { entity, score }
    }
  }
  return best?.entity ?? null
}

export function answerForEntity(id: string): EntityAnswer | null {
  const e = getEntity(id)
  if (!e) return null
  return {
    entity: e.entity,
    name: e.name,
    intent: e.intent,
    care_pathway: e.care_pathway,
    safety_class: e.safety_class,
    canonical_page: e.canonical_page,
    canonical_url: absolute(e.canonical_page),
    primary_cta: toGuideLink(e.primary_cta),
    secondary_ctas: e.secondary_ctas.map(toGuideLink),
    related_guides: (e.related_guides ?? []).map(toGuideLink),
    related_services: (e.related_services ?? []).map(toGuideLink),
    related_entities: e.related_entities,
    approved_answer_blocks: e.approved_answer_blocks ?? [],
  }
}

/** One-shot: query → deterministic canonical answer (or null). */
export function resolveAnswer(query: string): EntityAnswer | null {
  const e = resolveEntity(query)
  return e ? answerForEntity(e.entity) : null
}

/** Collect registry-backed links for an entity answer (CTA + secondaries + canonical). */
export function linksForAnswer(answer: EntityAnswer, limit = 3): GuideLink[] {
  const canonicalId = registryIdForPath(answer.canonical_page, answer.entity)
  const ids = [
    ...(canonicalId ? [canonicalId] : []),
    answer.primary_cta.id,
    ...answer.secondary_ctas.map((c) => c.id),
    answer.entity,
  ]
  // Prefer canonical page first; resolveLinks dedupes and caps.
  const ordered = resolveLinks(ids, limit)
  if (ordered.length) return ordered
  return [answer.primary_cta].filter(Boolean).slice(0, limit)
}

function registryIdForPath(canonicalPage: string, preferId?: string): string | null {
  let path = canonicalPage
  try {
    if (/^https?:\/\//i.test(canonicalPage)) path = new URL(canonicalPage).pathname
  } catch {
    return null
  }
  const norm = path.replace(/\/$/, '') || '/'
  const matches: string[] = []
  for (const rec of Object.values(LINK_REGISTRY)) {
    try {
      if (!/^https?:\/\//i.test(rec.url)) continue
      const p = new URL(rec.url).pathname.replace(/\/$/, '') || '/'
      if (p === norm) matches.push(rec.id)
    } catch {
      /* tel/mailto */
    }
  }
  if (!matches.length) return null
  if (preferId && matches.includes(preferId)) return preferId
  // Prefer the canonical service id when aliases share a URL (pricing vs insurance).
  if (matches.includes('pricing') && preferId !== 'insurance') return 'pricing'
  return matches[0]
}

/** Every displayed URL must exist in the Public Links Registry. */
export function isRegistryUrl(url: string): boolean {
  return Object.values(LINK_REGISTRY).some(
    (rec) => rec.url === url || url.startsWith(rec.url) || rec.url.startsWith(url),
  )
}

export function assertAnswerLinksRegistered(answer: EntityAnswer): string[] {
  const bad: string[] = []
  for (const link of [answer.primary_cta, ...answer.secondary_ctas]) {
    if (!LINK_REGISTRY[link.id]) bad.push(`missing registry id: ${link.id}`)
    else if (LINK_REGISTRY[link.id].url !== link.url) {
      bad.push(`url mismatch for ${link.id}: answer=${link.url} registry=${LINK_REGISTRY[link.id].url}`)
    }
  }
  return bad
}
