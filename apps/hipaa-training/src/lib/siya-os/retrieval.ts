import { MODULES } from "@/content/modules";
import { REFERENCE_DOCUMENTS } from "@/content/referenceDocuments";
import { WORKSPACE_KB, type WorkspaceKbEntry } from "@/content/workspace-kb";

export interface RetrievedChunk {
  id: string;
  title: string;
  snippet: string;
  score: number;
  links?: { label: string; href: string }[];
  escalate?: string;
}

const STOP = new Set(
  "a an the and or but if is are was were be been being to of in on at for with from as by it this that what when how who why can do does did will would should could about our you your".split(
    " "
  )
);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function scoreTokens(queryTokens: string[], corpus: string): number {
  const lower = corpus.toLowerCase();
  let score = 0;
  for (const t of queryTokens) {
    if (lower.includes(t)) score += 1;
    if (t.length > 5 && lower.includes(t.slice(0, 5))) score += 0.25;
  }
  return score;
}

function kbToChunk(entry: WorkspaceKbEntry, score: number): RetrievedChunk {
  return {
    id: entry.id,
    title: entry.title,
    snippet: entry.body,
    score,
    links: entry.links,
    escalate: entry.escalate,
  };
}

export function retrieveWorkspaceKnowledge(query: string, limit = 4): RetrievedChunk[] {
  const tokens = tokenize(query);
  if (!tokens.length) return [];

  const scored: RetrievedChunk[] = [];

  for (const entry of WORKSPACE_KB) {
    const corpus = [entry.title, entry.keywords.join(" "), entry.body].join(" ");
    const s = scoreTokens(tokens, corpus);
    if (s > 0) scored.push(kbToChunk(entry, s + entry.keywords.filter((k) => query.toLowerCase().includes(k)).length * 2));
  }

  for (const mod of MODULES) {
    const corpus = [mod.title, mod.summary, ...(mod.keyConcepts ?? []), ...(mod.quizFocus ?? [])].join(" ");
    const s = scoreTokens(tokens, corpus);
    if (s >= 2) {
      scored.push({
        id: `module-${mod.id}`,
        title: `Training: ${mod.title}`,
        snippet: mod.summary,
        score: s * 0.85,
        links: [{ label: `Open module: ${mod.shortTitle}`, href: `/module/${mod.id}` }],
      });
    }
  }

  for (const doc of REFERENCE_DOCUMENTS) {
    const corpus = [doc.title, doc.shortLabel, doc.summary].join(" ");
    const s = scoreTokens(tokens, corpus);
    if (s >= 1.5) {
      scored.push({
        id: `ref-${doc.slug}`,
        title: doc.shortLabel,
        snippet: doc.summary,
        score: s * 0.7,
        links: [{ label: "Read more (reference)", href: `/resources/${doc.slug}` }],
      });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);
  if (!top.length || top[0].score < 1) return [];
  return top;
}
