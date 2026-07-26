/**
 * Deterministic answers when LLM is off or unavailable — reads like a helpful colleague, not a log dump.
 */
import type { RetrievedChunk } from "./retrieval";
import { tokenizeForSearch } from "./retrieval";

function pickSentences(body: string, queryTokens: string[], max = 5): string[] {
  const cleaned = body
    .replace(/\*\*/g, "")
    .replace(/\|/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];

  const sentences = cleaned.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12);
  if (!queryTokens.length) return sentences.slice(0, max);

  const scored = sentences.map((s) => {
    const lower = s.toLowerCase();
    let n = 0;
    for (const t of queryTokens) {
      if (lower.includes(t)) n += 1;
    }
    return { s, n };
  });
  scored.sort((a, b) => b.n - a.n);
  const hits = scored.filter((x) => x.n > 0).map((x) => x.s);
  return (hits.length ? hits : sentences).slice(0, max);
}

function numberedSteps(body: string): string[] {
  const steps: string[] = [];
  const re = /(?:^|\s)(\d+)\.\s+([^.\d]+?)(?=\s+\d+\.|$)/g;
  let m: RegExpExecArray | null;
  const flat = body.replace(/\n/g, " ");
  while ((m = re.exec(flat)) && steps.length < 6) {
    steps.push(m[2].trim());
  }
  if (steps.length) return steps;
  const bullet = body.split(/\n/).filter((l) => /^\s*[-*]\s+/.test(l));
  return bullet.slice(0, 5).map((l) => l.replace(/^\s*[-*]\s+/, "").trim());
}

export function composeAnswerFromChunks(userMessage: string, chunks: RetrievedChunk[], knowledgeGap: boolean): string {
  if (!chunks.length) {
    return [
      "I searched **approved Company Memory** and didn't find a matching topic yet.",
      "",
      "Try adding a few keywords (e.g. \"late cancel refund\", \"portal chat response time\", \"Meet and Greet homepage\").",
      "",
      "If this should be a policy, use **Notify owner** — we'll add it to the knowledge base.",
    ].join("\n");
  }

  const queryTokens = tokenizeForSearch(userMessage);
  const primary = chunks[0];
  const parts: string[] = [];

  parts.push(`On **${primary.title}**:`);
  parts.push("");

  const sentences = pickSentences(primary.snippet, queryTokens, 4);
  if (sentences.length) {
    parts.push(sentences.join(" "));
  } else {
    parts.push(primary.snippet.slice(0, 600));
  }

  const steps = numberedSteps(primary.snippet);
  if (steps.length >= 2) {
    parts.push("");
    parts.push("**Steps:**");
    steps.forEach((step, i) => {
      parts.push(`${i + 1}. ${step}`);
    });
  }

  const related = chunks.slice(1, 3).filter((c) => c.score >= primary.score * 0.55);
  if (related.length) {
    parts.push("");
    parts.push("**Related policies:**");
    for (const r of related) {
      const line = pickSentences(r.snippet, queryTokens, 1)[0] || r.snippet.slice(0, 160);
      parts.push(`• **${r.title}** — ${line}`);
    }
  }

  if (knowledgeGap) {
    parts.push("");
    parts.push(
      "_This is the closest approved match — it may not cover every detail. If you need a definitive answer, escalate or notify the owner._",
    );
  }

  return parts.join("\n");
}
