/**
 * Per-section improvement plans from competency exam (and practice) results.
 * Shared by ExamReportView / SectionDone and practice-stats-ask — one recommendation
 * vocabulary, not a parallel engine.
 *
 * Spoken chat-sim: explicitly deferred (founder calibration preview first).
 */
import { MODULES } from "@/content/modules";
import type {
  ExamReportModel,
  ExamSectionId,
  HipaaItemResult,
  SectionResult,
  WritingTrail,
} from "@/lib/competency-exam/types";

/** Section score below this → show an improvement plan (when scored). */
export const IMPROVEMENT_SCORE_THRESHOLD = 70;

/**
 * Practice / coaching bar for “below-target speed.”
 * Exam pace still maps 50 WPM → 100 in scoring.ts — this is the tip trigger, not a rescore.
 */
export const TYPING_TARGET_WPM = 40;

export const TYPING_DRILL_HREF = "/learn/practice#typing";
export const LISTENING_SECTION_HREF = "/learn/competency-exam?section=listening";

const DRAFT_MCQ_MODULES = new Set(["clinical-knowledge-draft", "culture-exam-draft"]);

export type ImprovementLink = { href: string; label: string };

export type SectionImprovementPlan = {
  sectionId: ExamSectionId | "hipaa";
  title: string;
  /** One encouraging line */
  headline: string;
  tips: string[];
  links: ImprovementLink[];
  /** Spoken lane — no tips yet */
  deferred?: boolean;
};

export type TypingMetricsForPlan = {
  wpm: number;
  wpmReliable: boolean;
  accuracy: number;
};

function moduleTitle(moduleId: string): string {
  return MODULES.find((m) => m.id === moduleId)?.title ?? moduleId;
}

function isHipaaTrainingModule(moduleId: string | undefined): boolean {
  if (!moduleId || DRAFT_MCQ_MODULES.has(moduleId)) return false;
  return MODULES.some((m) => m.id === moduleId);
}

/** Concrete speed tips — not “practice more.” */
export function typingSpeedTips(wpm: number): string[] {
  return [
    `Your last reliable pace was about **${wpm} WPM** (target for these tips: **${TYPING_TARGET_WPM}+**).`,
    "Try **touch-typing without looking at the keyboard** — keep your eyes on the passage.",
    "Park both hands on the **home row** (ASDF / JKL;) and return there after each stretch.",
    "Prefer short, steady bursts over rushing; accuracy first, then nudge speed.",
  ];
}

export function buildTypingImprovementPlan(args: {
  section?: Pick<SectionResult, "score" | "status"> | null;
  metrics?: TypingMetricsForPlan | null;
}): SectionImprovementPlan | null {
  const metrics = args.metrics;
  const sectionScore = args.section?.status === "scored" ? args.section.score : null;
  const belowScore =
    typeof sectionScore === "number" && sectionScore < IMPROVEMENT_SCORE_THRESHOLD;
  const belowWpm =
    metrics?.wpmReliable === true && typeof metrics.wpm === "number" && metrics.wpm < TYPING_TARGET_WPM;

  if (!belowWpm && !belowScore) return null;
  // Speed-focused plan when WPM is the clear gap; still show when section is low and WPM known low/unreliable.
  if (!belowWpm && metrics?.wpmReliable && metrics.wpm >= TYPING_TARGET_WPM) {
    // Score low mainly from accuracy — keep tips specific, not generic “practice more.”
    return {
      sectionId: "typing",
      title: "Typing — accuracy focus",
      headline: "Your pace is in a good range — tighten accuracy on the next drill.",
      tips: [
        `Accuracy on this run: **${metrics.accuracy}%**. Slow just enough to cut typos, then rebuild speed.`,
        "Read a few words ahead so you are not correcting mid-word.",
        "Use the same workplace passage style in Practice so the exam feel stays familiar.",
      ],
      links: [{ href: TYPING_DRILL_HREF, label: "Open Chat speed & accuracy (typing drill)" }],
    };
  }

  const wpm = metrics?.wpmReliable ? metrics.wpm : null;
  return {
    sectionId: "typing",
    title: "Typing — build speed",
    headline: "Your typing speed is below the practice target — here is a concrete way to improve.",
    tips:
      wpm != null
        ? typingSpeedTips(wpm)
        : [
            "WPM was not reliable on this run — still use the drill below with a full passage and both hands on the home row.",
            "Try **touch-typing without looking at the keyboard**.",
            "Park both hands on the **home row** and build steady rhythm before chasing speed.",
          ],
    links: [{ href: TYPING_DRILL_HREF, label: "Open Chat speed & accuracy (typing drill)" }],
  };
}

/**
 * Missed HIPAA bank items → name the certification modules and deep-link.
 * Combined MCQ may also include clinical/trivia drafts — those are ignored here.
 */
export function buildHipaaImprovementPlan(args: {
  section?: Pick<SectionResult, "id" | "score" | "status"> | null;
  items?: HipaaItemResult[] | null;
}): SectionImprovementPlan | null {
  const items = args.items ?? [];
  const hipaaItems = items.filter((i) => isHipaaTrainingModule(i.moduleId));
  const missed = hipaaItems.filter((i) => !i.correct);
  const section = args.section;
  const sectionBelow =
    section &&
    section.status === "scored" &&
    typeof section.score === "number" &&
    section.score < IMPROVEMENT_SCORE_THRESHOLD &&
    (section.id === "mcq" || (section.id as string) === "hipaa");

  if (!missed.length && !sectionBelow) return null;
  if (!missed.length && sectionBelow && hipaaItems.length === 0) {
    return {
      sectionId: "hipaa",
      title: "HIPAA / Combined MCQ",
      headline: "This sitting was below target — revisit the HIPAA training modules you have not locked in yet.",
      tips: [
        "Open Learn → HIPAA and re-read the modules that still feel fuzzy, then retake the module quiz.",
        "When you re-sit Combined MCQ, note which modules the missed items cite and return to those lessons first.",
      ],
      links: [{ href: "/learn", label: "Open Learn (HIPAA training)" }],
    };
  }
  if (!missed.length) return null;

  const moduleIds = [...new Set(missed.map((i) => i.moduleId!).filter(Boolean))];
  const titles = moduleIds.map(moduleTitle);
  return {
    sectionId: "hipaa",
    title: "HIPAA — review these modules",
    headline: "Missed questions map to specific HIPAA training modules — review those, not “everything.”",
    tips: [
      `Review: **${titles.join("**, **")}**.`,
      "Re-read the lesson sections, then take that module’s quiz before another Combined MCQ sitting.",
      missed.length === 1
        ? "You missed 1 HIPAA item this sitting — one focused module pass is enough."
        : `You missed **${missed.length}** HIPAA items this sitting — start with the modules linked below.`,
    ],
    links: moduleIds.map((id) => ({
      href: `/module/${id}`,
      label: `Open module: ${moduleTitle(id)}`,
    })),
  };
}

export type ListeningMissKind = "missed_key_detail" | "missing_ask" | "substance" | "thin_content";

const LISTENING_FACT_CHECKS: Array<{ id: string; re: RegExp; label: string }> = [
  { id: "days_left", re: /\b(2|two)\s+days?\b/i, label: "near-runout (~2 days left)" },
  { id: "pharmacy", re: /\bpharmac(y|ies)\b/i, label: "pharmacy waiting-on-office claim" },
  { id: "weekend", re: /\bweekend\b/i, label: "weekend timing" },
  {
    id: "callback",
    re: /\b(call(?:ed|back)?|no answer|did not answer|couldn't reach|could not reach|voicemail)\b/i,
    label: "callback attempt with no answer",
  },
];

/** Plain-language miss notes — same spirit as chat-sim relevance humanNotes. */
export function classifyListeningMisses(args: {
  text: string;
  missingAsk?: boolean;
  issues?: string[];
  llmEstimate?: number | null;
  voicemailScript?: string;
}): { kinds: ListeningMissKind[]; notes: string[] } {
  const text = (args.text || "").trim();
  const kinds: ListeningMissKind[] = [];
  const notes: string[] = [];

  const substanceIssue = (args.issues || []).some(
    (i) =>
      /substance|courtesy-only|near-empty|no clinical\/ops|empty response/i.test(i) ||
      /not a clinical/i.test(i),
  );
  if (substanceIssue || !text) {
    kinds.push("substance");
    notes.push(
      "Your response did not look like a real provider message yet (too thin, courtesy-only, or missing clinical/ops content).",
    );
  }

  if (args.missingAsk) {
    kinds.push("missing_ask");
    notes.push(
      "Your message lacked a clear ask to the provider (for example: please review / advise next steps / whether to call the patient).",
    );
  }

  const factMisses = LISTENING_FACT_CHECKS.filter((f) => !f.re.test(text)).map((f) => f.label);
  if (text && factMisses.length >= 2) {
    kinds.push("missed_key_detail");
    notes.push(
      `You may have missed a key detail from the voicemail (e.g. ${factMisses.slice(0, 3).join("; ")}).`,
    );
  } else if (
    text &&
    typeof args.llmEstimate === "number" &&
    args.llmEstimate < 55 &&
    !kinds.includes("missed_key_detail")
  ) {
    kinds.push("thin_content");
    notes.push(
      "The content estimate was low — double-check that the provider message captures the voicemail’s key facts before the ask.",
    );
  }

  return { kinds: [...new Set(kinds)], notes };
}

export function buildListeningImprovementPlan(args: {
  section?: Pick<SectionResult, "score" | "status"> | null;
  trail?: (Pick<WritingTrail, "text" | "escalationText" | "issues" | "llmEstimate" | "promptText"> & {
    escalationHasAskHint?: boolean;
    voicemailScript?: string;
    missingAsk?: boolean;
  }) | null;
}): SectionImprovementPlan | null {
  const section = args.section;
  const below =
    section &&
    section.status === "scored" &&
    typeof section.score === "number" &&
    section.score < IMPROVEMENT_SCORE_THRESHOLD;
  if (!below) return null;

  const text = (args.trail?.escalationText || args.trail?.text || "").trim();
  const missingAsk =
    args.trail?.missingAsk === true ||
    args.trail?.escalationHasAskHint === false ||
    (args.trail?.issues || []).some((i) => /missing.*ask/i.test(i));

  const { notes } = classifyListeningMisses({
    text,
    missingAsk,
    issues: args.trail?.issues,
    llmEstimate: args.trail?.llmEstimate,
    voicemailScript: args.trail?.voicemailScript,
  });

  const tips = [
    ...(notes.length
      ? notes
      : ["Replay the voicemail, list the facts the provider needs, then close with one clear ask."]),
    "Practice another Listening scenario: play once, jot facts, then write the provider message under the timer.",
  ];

  return {
    sectionId: "listening",
    title: "Listening — capture facts + clear ask",
    headline: "Listening was below target — practice another voicemail → provider message.",
    tips,
    links: [{ href: LISTENING_SECTION_HREF, label: "Open Listening practice section" }],
  };
}

/** Spoken chat-sim — founder deferred until calibration preview findings. */
export function buildSpokenChatImprovementPlan(): SectionImprovementPlan {
  return {
    sectionId: "chat-sim-spoken",
    title: "Chat simulator (spoken)",
    headline: "Spoken-specific coaching is on hold.",
    tips: [
      "We are collecting more real speaking-test behavior via the calibration preview before writing improvement tips for this lane.",
      "Keep using the spoken lane for practice; typed chat-sim feedback still applies for grammar, politeness, and relevance.",
    ],
    links: [],
    deferred: true,
  };
}

export function buildExamImprovementPlans(args: {
  sections: SectionResult[];
  typingMetrics?: TypingMetricsForPlan | null;
  mcqItems?: HipaaItemResult[] | null;
  writingTrail?: (WritingTrail & {
    escalationHasAskHint?: boolean;
    voicemailScript?: string;
    missingAsk?: boolean;
  }) | null;
  /** When true, include the deferred spoken placeholder if that section was scored below target. */
  includeSpokenDeferredPlaceholder?: boolean;
}): SectionImprovementPlan[] {
  const plans: SectionImprovementPlan[] = [];
  const typingSec = args.sections.find((s) => s.id === "typing");
  const mcqSec = args.sections.find((s) => s.id === "mcq");
  const listeningSec = args.sections.find((s) => s.id === "listening");
  const spokenSec = args.sections.find((s) => s.id === "chat-sim-spoken");

  const typingPlan = buildTypingImprovementPlan({
    section: typingSec,
    metrics: args.typingMetrics,
  });
  if (typingPlan) plans.push(typingPlan);

  const hipaaPlan = buildHipaaImprovementPlan({
    section: mcqSec,
    items: args.mcqItems,
  });
  if (hipaaPlan) plans.push(hipaaPlan);

  const listeningPlan = buildListeningImprovementPlan({
    section: listeningSec,
    trail: args.writingTrail,
  });
  if (listeningPlan) plans.push(listeningPlan);

  if (
    args.includeSpokenDeferredPlaceholder &&
    spokenSec?.status === "scored" &&
    typeof spokenSec.score === "number" &&
    spokenSec.score < IMPROVEMENT_SCORE_THRESHOLD
  ) {
    plans.push(buildSpokenChatImprovementPlan());
  }

  return plans;
}

export function buildExamImprovementPlansFromReport(report: ExamReportModel): SectionImprovementPlan[] {
  return buildExamImprovementPlans({
    sections: report.sections,
    typingMetrics: report.typingMetrics ?? null,
    mcqItems: report.mcqItems ?? report.hipaaItems ?? null,
    writingTrail: report.writingTrail
      ? {
          ...report.writingTrail,
          missingAsk: report.writingTrail.escalationHasAskHint === false,
        }
      : null,
    includeSpokenDeferredPlaceholder: false,
  });
}

/** Markdown block for Ask / practice-stats-ask. */
export function formatImprovementPlansMessage(plans: SectionImprovementPlan[]): string {
  if (!plans.length) return "";
  const lines: string[] = ["**What to work on** (from your latest competency results):", ""];
  plans.forEach((p, i) => {
    lines.push(`${i + 1}. **${p.title}** — ${p.headline}`);
    for (const tip of p.tips) {
      lines.push(`   - ${tip}`);
    }
    for (const link of p.links) {
      lines.push(`   - Open: ${link.label} → \`${link.href}\``);
    }
    if (p.deferred) {
      lines.push("   - _(Spoken tips deferred — calibration preview first.)_");
    }
    lines.push("");
  });
  return lines.join("\n").trimEnd();
}
