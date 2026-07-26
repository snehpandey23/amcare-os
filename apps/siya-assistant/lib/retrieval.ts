import { getPublicChunks } from './knowledge'
import type { KnowledgeChunk, RetrievedChunk } from './types'

const STOP = new Set([
  'a','an','the','and','or','to','of','in','on','for','is','are','do','does','what','where','how','can','i','my','me','you','your','with','about','tell','please','at','siya','health','online','page','test','testing',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9$%\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
}

function scoreChunk(tokens: string[], chunk: KnowledgeChunk, rawQuery: string): number {
  if (!tokens.length) return 0
  const q = rawQuery.toLowerCase().trim()
  const path = chunk.path.toLowerCase()
  const title = chunk.title.toLowerCase()
  const summary = chunk.summary.toLowerCase()
  const kw = new Set(chunk.keywords.map((k) => k.toLowerCase()))
  let score = 0

  for (const t of tokens) {
    if (kw.has(t)) score += 4
    if (path.includes(t)) score += 3
    if (title.includes(t)) score += 3
    if (summary.includes(t)) score += 1
    if (chunk.topics.some((x) => x.includes(t))) score += 2
  }

  // Exact short-query boost: "tsh", "a1c", "ferritin"
  if (tokens.length <= 2) {
    for (const t of tokens) {
      if (kw.has(t) || title.split(/[^a-z0-9]+/).includes(t) || path.split('/').includes(t)) {
        score += 6
      }
    }
  }

  // Phrase containment
  if (q.length >= 3 && (title.includes(q) || summary.includes(q) || path.includes(q.replace(/\s+/g, '-')))) {
    score += 4
  }

  if (chunk.id.startsWith('fact_')) score += 1.5
  // Prefer specific topic pages over hubs when token matches a subpath
  if (path.split('/').length >= 3 && tokens.some((t) => path.includes(t))) score += 2

  return score
}

export function retrievePublicKnowledge(query: string, limit = 5): RetrievedChunk[] {
  const tokens = tokenize(query)
  const scored = getPublicChunks()
    .map((chunk) => ({ ...chunk, score: scoreChunk(tokens, chunk, query) }))
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  if (!scored.length) return []

  const top = scored[0].score
  return scored.filter((c) => c.score >= Math.max(3, top * 0.45)).slice(0, limit)
}

export function hasConfidentRetrieval(chunks: RetrievedChunk[]): boolean {
  return chunks.length > 0 && chunks[0].score >= 4
}