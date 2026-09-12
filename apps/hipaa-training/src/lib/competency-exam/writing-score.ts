import { evaluateSimulatorSession, type SimMessage } from "@/lib/patient-drill/evaluate";

const MIN_WORDS = 40;

export type WritingDeterministic = {
  wordCount: number;
  meetsLength: boolean;
  grammarScore: number;
  issues: string[];
  score: number;
  note: string;
};

export function scoreWritingDeterministic(text: string): WritingDeterministic {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const wordCount = text.trim() ? words.length : 0;
  const meetsLength = wordCount >= MIN_WORDS;
  const fake: SimMessage[] = [
    { who: "patient", text: "Please rewrite this workplace note." },
    { who: "you", text: text.trim() || "" },
  ];
  const fb = evaluateSimulatorSession(fake);
  const issues = fb.grammarIssues.map((g) => g.detail || g.kinds.join(", "));
  const lengthPart = meetsLength ? 100 : Math.round((wordCount / MIN_WORDS) * 100);
  const score = Math.round(lengthPart * 0.5 + fb.grammarScore * 0.5);
  return {
    wordCount,
    meetsLength,
    grammarScore: fb.grammarScore,
    issues,
    score,
    note: `Deterministic — length (aim ${MIN_WORDS}+ words) and chat-register grammar. Not a full writing rubric. Missing caps/periods are not scored.`,
  };
}

export function blendWritingScore(deterministic: number, llm: number | null): {
  score: number;
  note: string;
} {
  if (llm == null) {
    return {
      score: deterministic,
      note: "LLM content/coherence estimate unavailable — deterministic checks only. Not a complete writing judgment.",
    };
  }
  return {
    score: Math.round(deterministic * 0.4 + llm * 0.6),
    note: "Combined: 40% deterministic (length + chat-register grammar) and 60% LLM content/coherence estimate. The LLM part is an estimate, not a certified grade.",
  };
}
