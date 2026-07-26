import { MODULES } from "@/content/modules";
import { WORKSPACE_KB, type WorkspaceKbEntry } from "@/content/workspace-kb";

export interface RetrievedChunk {
  id: string;
  title: string;
  snippet: string;
  score: number;
  links?: { label: string; href: string }[];
  escalate?: string;
}

const STOP = new Set("a an the and or but if is are to of in on at for with from you your".split(" "));

function tokens(q: string) {
  return q
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOP.has(t));
}

function score(queryTokens: string[], text: string) {
  const lower = text.toLowerCase();
  return queryTokens.reduce((n, t) => n + (lower.includes(t) ? 1 : 0), 0);
}

function fromKb(e: WorkspaceKbEntry, s: number): RetrievedChunk {
  return { id: e.id, title: e.title, snippet: e.body, score: s, links: e.links, escalate: e.escalate };
}

export function retrieveWorkspaceKnowledge(query: string, limit = 4): RetrievedChunk[] {
  const qt = tokens(query);
  if (!qt.length) return [];

  const out: RetrievedChunk[] = [];
  for (const e of WORKSPACE_KB) {
    const corpus = `${e.title} ${e.keywords.join(" ")} ${e.body}`;
    const s = score(qt, corpus) + e.keywords.filter((k) => query.toLowerCase().includes(k)).length * 2;
    if (s > 0) out.push(fromKb(e, s));
  }
  for (const m of MODULES) {
    const corpus = `${m.title} ${m.summary} ${m.keyConcepts.join(" ")}`;
    const s = score(qt, corpus);
    if (s >= 2) {
      out.push({
        id: `mod-${m.id}`,
        title: m.title,
        snippet: m.summary,
        score: s * 0.85,
        links: [{ label: `Module: ${m.shortTitle}`, href: `/module/${m.id}` }],
      });
    }
  }
  out.sort((a, b) => b.score - a.score);
  const top = out.slice(0, limit);
  return top.length && top[0].score >= 1 ? top : [];
}
