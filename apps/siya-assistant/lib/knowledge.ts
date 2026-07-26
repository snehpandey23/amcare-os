import publicKb from '../data/public-kb.json'
import type { KnowledgeChunk, RetrievedChunk } from './types'

const kb = publicKb as { chunks: KnowledgeChunk[] }

export function getPublicChunks(): KnowledgeChunk[] {
  return kb.chunks
}

export function formatChunksForPrompt(chunks: RetrievedChunk[] | KnowledgeChunk[], limit = 5): string {
  if (!chunks.length) return '(no approved sources retrieved)'
  return chunks
    .slice(0, limit)
    .map(
      (c, i) =>
        `[Source ${i + 1} | id=${c.id} | path=${c.path}]\nTitle: ${c.title}\nSummary: ${c.summary}`,
    )
    .join('\n\n')
}
