import { getPublicChunks } from './knowledge'
import { LINK_REGISTRY, resolveLinks } from './link-registry'
import type { GuideLink, RetrievedChunk } from './types'

const SITE = 'https://www.siya.health'

/** Normalize any approved public Siya URL/path into a GuideLink. */
export function publicPageLink(pathOrUrl: string, label?: string): GuideLink | null {
  let path = pathOrUrl.trim()
  if (path.startsWith('http')) {
    try {
      const u = new URL(path)
      if (!/^(www\.)?siya\.health$/i.test(u.hostname)) return null
      path = u.pathname || '/'
    } catch {
      return null
    }
  }
  if (!path.startsWith('/')) path = `/${path}`
  path = path.replace(/\/$/, '') || '/'

  // Prefer curated registry label when available
  for (const rec of Object.values(LINK_REGISTRY)) {
    const recPath = rec.url.replace(SITE, '').replace(/\/$/, '') || '/'
    if (recPath === path) {
      return { id: rec.id, label: rec.label, url: rec.url }
    }
  }

  const chunk = getPublicChunks().find((c) => (c.path.replace(/\/$/, '') || '/') === path)
  const title = label || chunk?.title.split('|')[0].trim() || path
  const id = `page_${path.replace(/^\//, '').replace(/\//g, '_') || 'home'}`
  return {
    id,
    label: title.length > 48 ? `${title.slice(0, 45)}…` : title,
    url: path === '/' ? `${SITE}/` : `${SITE}${path}`,
  }
}

/**
 * Build answer links from retrieval first (so topic pages like /labs/thyroid win),
 * then fill with contextual CTAs — never bury a strong retrieval hit under Pricing.
 */
export function linksFromRetrieval(
  chunks: RetrievedChunk[],
  opts: { extras?: string[]; limit?: number } = {},
): GuideLink[] {
  const limit = opts.limit ?? 3
  const out: GuideLink[] = []
  const seen = new Set<string>()

  const push = (link: GuideLink | null) => {
    if (!link || seen.has(link.url) || out.length >= limit) return
    seen.add(link.url)
    out.push(link)
  }

  for (const chunk of chunks) {
    push(publicPageLink(chunk.path || chunk.url, chunk.title.split('|')[0].trim()))
    if (out.length >= Math.min(2, limit)) break
  }

  // Contextual hub if we landed on a subpage
  const topPath = chunks[0]?.path || ''
  if (topPath.startsWith('/labs/') && topPath !== '/labs') {
    push(publicPageLink('/labs', 'Labs & Blood Tests') || resolveLinks(['labs'])[0])
  }
  if (topPath.startsWith('/answers/') || topPath.startsWith('/blog/')) {
    push(resolveLinks(['health_guides'])[0] || null)
  }
  if (topPath.startsWith('/providers/')) {
    push(resolveLinks(['providers'])[0] || null)
  }

  for (const id of opts.extras || ['meet_and_greet']) {
    push(resolveLinks([id])[0] || null)
  }

  return out.slice(0, limit)
}

/** True when top hit is strong enough to treat as a verified page answer. */
export function isStrongPageHit(chunks: RetrievedChunk[]): boolean {
  if (!chunks.length) return false
  return chunks[0].score >= 5
}