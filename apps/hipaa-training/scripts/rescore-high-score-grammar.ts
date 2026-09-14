/**
 * Rescore saved high-score chat turns with production grammarIssuesForMessage.
 *   npx tsx scripts/rescore-high-score-grammar.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { grammarIssuesForMessage } from "../src/lib/patient-drill/evaluate";

const sessions = JSON.parse(readFileSync("/tmp/chat_sim_high_sessions.json", "utf8")) as Array<{
  email: string;
  grammar: number;
  relevance: number | null;
  politeness: number | null;
  you_texts: Array<{ text: string }>;
}>;

const examples = [
  "Hello Michael, Yes we can help you scheduling appointment to get everything done.",
  "Can you share me your preferred availability?",
  "That would depend upon the providers' review and advise.",
  "It is an inital consultation where the provider will gather history",
  "its okay take a free screening to diagnose",
  "Thank you to thank you for reaching out to us. Just wanted to let you know Adral is like controlled substance medications.",
  "go to hell",
  "So generally the neuropsychiatric testing will take will take around 60 to 90 minutes to complete",
];

console.log("=== examples ===");
for (const text of examples) {
  const issues = grammarIssuesForMessage(text);
  console.log(JSON.stringify({ text: text.slice(0, 90), issues: issues.kinds, detail: issues.detail || null }));
}

const flagged: Array<{
  email: string;
  storedGrammar: number;
  relevance: number | null;
  issues: string[];
  detail?: string;
  text: string;
}> = [];
let turns = 0;
for (const s of sessions.filter((x) => (x.grammar ?? 0) >= 95)) {
  for (const t of s.you_texts) {
    turns++;
    const issues = grammarIssuesForMessage(t.text);
    if (issues.kinds.length) {
      flagged.push({
        email: s.email,
        storedGrammar: s.grammar,
        relevance: s.relevance,
        issues: issues.kinds,
        detail: issues.detail,
        text: t.text,
      });
    }
  }
}

writeFileSync(
  "/tmp/grammar_rescore.json",
  JSON.stringify({ turns, flagged: flagged.length, clean: turns - flagged.length, flaggedRows: flagged }, null, 2),
);
console.log(JSON.stringify({ turns, productionScorerWouldFlag: flagged.length, cleanPass: turns - flagged.length }));
