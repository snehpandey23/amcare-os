"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPersona } from "@/data/patient-drill/personas";
import type { Question } from "@/lib/types";
import type { TypingScore } from "@/lib/level-up/typing-drill";
import type { SimulatorFeedback } from "@/lib/patient-drill/evaluate";
import { ChatTypingDrill } from "@/components/companion/ChatTypingDrill";
import { PatientChatSimulator } from "@/components/companion/PatientChatSimulator";
import { CULTURE_SECTION_HELD_REASON } from "@/content/competency-exam/culture-bank";
import { drawChatBrief, drawHipaaExam, drawTypingPassage, drawWritingPrompt } from "@/lib/competency-exam/draws";
import { buildExamReport } from "@/lib/competency-exam/report";
import { chatSectionScore, typingSectionScore } from "@/lib/competency-exam/scoring";
import { parseExamSectionFocus } from "@/lib/competency-exam/section-focus";
import { recordSeen, freshDrawSeed, type SeenEntry } from "@/lib/competency-exam/seen-set";
import { loadSeen, saveAttempt, saveSeen, saveIsolatedReview, type IsolatedReviewItemResult, type IsolatedWritingTrail } from "@/lib/competency-exam/storage";
import type { ExamReportModel, SafetyFlag, SectionResult } from "@/lib/competency-exam/types";
import { adjustEscalationScore, blendWritingScore, combineWritingPartScores, scoreWritingPartDeterministic } from "@/lib/competency-exam/writing-score";
import { EXAM_WEIGHTS, SECTION_LABEL } from "@/lib/competency-exam/weights";
import { ExamReportView } from "./ExamReportView";
import { ExamCountdownHud } from "./ExamCountdownHud";
import {
  COMPETENCY_EXAM_TIMERS,
  type ExamTimerHudModel,
} from "@/lib/competency-exam/exam-timer";

type Phase = "orient" | "typing" | "hipaa" | "writing" | "chat" | "review" | "report" | "section-done";

const HIPAA_SEC = COMPETENCY_EXAM_TIMERS.hipaa;
const WRITING_SEC = COMPETENCY_EXAM_TIMERS.writing;
const CHAT_SEC = COMPETENCY_EXAM_TIMERS.chat;

function fmt(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function heldCulture(): SectionResult {
  return {
    id: "culture",
    label: SECTION_LABEL.culture,
    weight: EXAM_WEIGHTS.culture,
    status: "held",
    score: null,
    note: CULTURE_SECTION_HELD_REASON,
    itemIds: [],
    repeatedIds: [],
    draftContent: false,
  };
}

function SectionDoneCard({
  section,
  rawTyping,
  attemptId,
  onAgain,
  itemResults,
  writingTrail,
}: {
  section: SectionResult;
  rawTyping?: TypingScore | null;
  attemptId: string;
  onAgain: () => void;
  itemResults?: IsolatedReviewItemResult[] | null;
  writingTrail?: IsolatedWritingTrail | null;
}) {
  const next =
    section.id === "typing"
      ? { href: "/learn/competency-exam?section=hipaa", label: "Open HIPAA review" }
      : section.id === "hipaa"
        ? { href: "/learn/competency-exam?section=writing", label: "Open Writing review" }
        : section.id === "writing"
          ? null
          : null;
  const closeout =
    section.id === "typing"
      ? "This run does not continue into other sections. Typing is signed off — open HIPAA next when ready."
      : section.id === "hipaa"
        ? "This run does not continue into other sections. Sign off when HIPAA looks good, then open Writing. Item-level results are saved in this browser for audit."
        : section.id === "writing"
          ? "This run does not continue into other sections. Writing trail (scenario + chart note + provider message + scores) is saved in this browser for audit. Clinical prompts remain draft — not approved for official scoring."
          : "This run does not continue into other sections.";
  return (
    <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
        Isolated review · {section.label} complete
      </p>
      <p className="font-mono text-[10px] text-[var(--siya-text-muted)]">Review attempt {attemptId} · not a scored sitting</p>
      <h2 className="text-lg font-semibold text-[var(--siya-primary)]">
        {section.label}: {section.score == null ? "—" : `${section.score}/100`}
      </h2>
      {section.detail ? <p className="text-[var(--siya-text)]">{section.detail}</p> : null}
      <p className="text-xs text-[var(--siya-text-secondary)]">{section.note}</p>
      <ul className="list-disc space-y-1 pl-4 text-xs text-[var(--siya-text)]">
        <li>Weight in composite: {section.weight} pts</li>
        <li>
          Item id(s): {section.itemIds.join(", ") || "—"}
          {section.repeatedIds.length ? ` · repeat: ${section.repeatedIds.join(", ")}` : ""}
        </li>
        <li>Draft content: {section.draftContent ? "yes (pending content review)" : "no — bank is live"}</li>
      </ul>
      {itemResults?.length ? (
        <details className="rounded-xl border border-[var(--siya-border)] p-3 text-xs" open>
          <summary className="cursor-pointer font-semibold">
            Item-by-item results ({itemResults.filter((i) => i.correct).length}/{itemResults.length} correct)
          </summary>
          <ol className="mt-2 list-decimal space-y-3 pl-4">
            {itemResults.map((item) => (
              <li key={item.id} className="space-y-1">
                <p>
                  <code className="font-mono text-[10px]">{item.id}</code>
                  {item.moduleId ? ` · ${item.moduleId}` : ""} ·{" "}
                  <strong className={item.correct ? "text-emerald-700" : "text-rose-700"}>
                    {item.correct ? "correct" : "incorrect"}
                  </strong>
                </p>
                <p className="text-[var(--siya-text)]">{item.prompt}</p>
                <p className="text-[var(--siya-text-secondary)]">
                  Selected: {item.selectedKey ?? "(blank)"} · Key: {item.correctKey}
                </p>
                {item.options?.length ? (
                  <ul className="pl-3 text-[var(--siya-text-secondary)]">
                    {item.options.map((o) => (
                      <li key={o.key}>
                        {o.key}. {o.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ol>
        </details>
      ) : null}
      {writingTrail ? (
        <details className="rounded-xl border border-[var(--siya-border)] p-3 text-xs" open>
          <summary className="cursor-pointer font-semibold">Writing trail (scenario + chart + escalation + scores)</summary>
          <div className="mt-2 space-y-2">
            <p>
              <code className="font-mono text-[10px]">{writingTrail.promptId}</code> · {writingTrail.title}
              {writingTrail.format === "clinical-two-part" ? " · clinical two-part" : ""}
            </p>
            <p className="font-semibold text-[var(--siya-text)]">Scenario</p>
            <p className="text-[var(--siya-text)]">{writingTrail.prompt}</p>
            {writingTrail.format === "clinical-two-part" ? (
              <>
                <p className="font-semibold text-[var(--siya-text)]">
                  Chart note ({writingTrail.partA?.wordCount ?? 0} words)
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-2 text-[var(--siya-text)]">
                  {writingTrail.chartNote || "(empty)"}
                </pre>
                <p className="text-[var(--siya-text-secondary)]">
                  Part A · grammar {writingTrail.partA?.grammarScore ?? "—"}
                  {writingTrail.partA?.llmEstimate == null
                    ? " · no LLM estimate"
                    : ` · LLM estimate ${writingTrail.partA.llmEstimate}`}{" "}
                  · blended <strong>{writingTrail.partA?.blendedScore ?? "—"}/100</strong>
                </p>
                <p className="font-semibold text-[var(--siya-text)]">
                  Message to provider ({writingTrail.partB?.wordCount ?? 0} words)
                </p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-2 text-[var(--siya-text)]">
                  {writingTrail.escalationText || "(empty)"}
                </pre>
                <p className="text-[var(--siya-text-secondary)]">
                  Part B · grammar {writingTrail.partB?.grammarScore ?? "—"}
                  {writingTrail.partB?.llmEstimate == null
                    ? " · no LLM estimate"
                    : ` · LLM estimate ${writingTrail.partB.llmEstimate}`}{" "}
                  · blended <strong>{writingTrail.partB?.blendedScore ?? "—"}/100</strong>
                  {writingTrail.nearDuplicateOfChart
                    ? ` · near-duplicate of chart (sim ${Math.round((writingTrail.partsSimilarity ?? 0) * 100)}%)`
                    : writingTrail.escalationHasAskHint === false
                      ? " · ask wording weak/missing"
                      : ""}
                </p>
                <p className="text-[var(--siya-text-secondary)]">
                  Section (50/50) <strong>{writingTrail.blendedScore}/100</strong>
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-[var(--siya-text)]">Submitted text ({writingTrail.wordCount} words)</p>
                <pre className="whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-2 text-[var(--siya-text)]">
                  {writingTrail.text || "(empty)"}
                </pre>
                <p className="text-[var(--siya-text-secondary)]">
                  Grammar {writingTrail.grammarScore}
                  {writingTrail.llmEstimate == null
                    ? " · no LLM estimate"
                    : ` · LLM estimate ${writingTrail.llmEstimate}`}{" "}
                  · blended <strong>{writingTrail.blendedScore}/100</strong>
                </p>
              </>
            )}
            {writingTrail.issues.length ? (
              <ul className="list-disc pl-4 text-[var(--siya-text-secondary)]">
                {writingTrail.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </details>
      ) : null}
      {rawTyping ? (
        <div className="rounded-xl bg-[var(--siya-bg-subtle)] p-3 text-xs">
          <p className="font-semibold">Raw typing metrics</p>
          <p>
            Accuracy {rawTyping.accuracy}% · typed {rawTyping.typedChars}/{rawTyping.targetChars} chars ·{" "}
            {rawTyping.wpmReliable ? `${rawTyping.wpm} WPM` : "WPM not reliable"} · {rawTyping.elapsedSec}s ·{" "}
            {rawTyping.finished ? "finished passage" : "timer / early submit"}
          </p>
          {rawTyping.wpmNote ? <p className="mt-1 text-[var(--siya-text-secondary)]">{rawTyping.wpmNote}</p> : null}
          <p className="mt-1 text-[var(--siya-text-secondary)]">
            Section formula (DEFAULT — needs founder confirmation): 60% accuracy + 40% pace (50 WPM → 100), or accuracy-only if WPM unreliable.
          </p>
        </div>
      ) : null}
      <p className="text-xs text-[var(--siya-text-secondary)]">{closeout}</p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAgain}
          className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          Run {section.label} again
        </button>
        {next ? (
          <a
            href={next.href}
            className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold text-[var(--siya-text-secondary)]"
          >
            {next.label}
          </a>
        ) : null}
        <a
          href="/learn/competency-exam"
          className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold text-[var(--siya-text-secondary)]"
        >
          Full sitting (all sections)
        </a>
      </div>
    </div>
  );
}

export function CompetencyExam() {
  const searchParams = useSearchParams();
  const focus = parseExamSectionFocus(searchParams.get("section"));
  const isolated = focus != null && focus !== "report";
  const focusKey = focus ?? "full";
  const { user, token } = useAuth();
  const userId = user?.id || "local";
  const subjectLabel = user?.name?.trim() || user?.email || "Staff";
  const [phase, setPhase] = useState<Phase>("orient");
  const [ack, setAck] = useState(false);
  const [attemptId, setAttemptId] = useState(() => `exam-${Date.now()}`);
  const startedAt = useRef(Date.now());
  const seenRef = useRef<SeenEntry[]>([]);
  /** Isolated review only — never written to localStorage / never feeds a real sitting. */
  const reviewSeenRef = useRef<SeenEntry[]>([]);
  const [report, setReport] = useState<ExamReportModel | null>(null);
  const [typing, setTyping] = useState<{ passageId: string; text: string; title: string; repeated: boolean } | null>(null);
  const [typingRaw, setTypingRaw] = useState<TypingScore | null>(null);
  const [lastSection, setLastSection] = useState<SectionResult | null>(null);
  const [hipaaQs, setHipaaQs] = useState<Question[]>([]);
  const [hipaaRepeated, setHipaaRepeated] = useState<string[]>([]);
  const [hipaaAnswers, setHipaaAnswers] = useState<Record<string, string>>({});
  const [hipaaLeft, setHipaaLeft] = useState(HIPAA_SEC);
  const [writingPrompt, setWritingPrompt] = useState<{
    id: string;
    title: string;
    scenario: string;
    chartHint: string;
    escalationHint: string;
    repeated: boolean;
  } | null>(null);
  const [writingChartNote, setWritingChartNote] = useState("");
  const [writingEscalation, setWritingEscalation] = useState("");
  const [writingLeft, setWritingLeft] = useState(WRITING_SEC);
  const [chatLeft, setChatLeft] = useState(CHAT_SEC);
  const [chatForceEnd, setChatForceEnd] = useState(false);
  /** Typing HUD mirrors ChatTypingDrill’s duration−elapsed — not a second clock. */
  const [typingTimer, setTypingTimer] = useState<{
    remainingSec: number;
    totalSec: number;
    clockStarted: boolean;
  } | null>(null);
  const [chatBrief, setChatBrief] = useState<{ id: string; personaId: "persona-janet" | "persona-emma"; opening: string; title: string; repeated: boolean } | null>(null);
  const [sections, setSections] = useState<SectionResult[]>([heldCulture()]);
  const [safety, setSafety] = useState<SafetyFlag>({ redFlagged: false, reasons: [], notes: [] });
  const [busy, setBusy] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [typingKey, setTypingKey] = useState(0);
  const [hipaaKey, setHipaaKey] = useState(0);
  const [writingKey, setWritingKey] = useState(0);
  const [itemResults, setItemResults] = useState<IsolatedReviewItemResult[] | null>(null);
  const [writingTrail, setWritingTrail] = useState<IsolatedWritingTrail | null>(null);

  const resetToOrient = useCallback(() => {
    setPhase("orient");
    setAck(false);
    setAttemptId(`exam-${Date.now()}`);
    setSections([heldCulture()]);
    setSafety({ redFlagged: false, reasons: [], notes: [] });
    setReport(null);
    setTyping(null);
    setTypingRaw(null);
    setLastSection(null);
    setHipaaQs([]);
    setHipaaRepeated([]);
    setHipaaAnswers({});
    setWritingPrompt(null);
    setWritingChartNote("");
    setWritingEscalation("");
    setChatBrief(null);
    setReviewNote("");
    setBusy(false);
    setItemResults(null);
    setWritingTrail(null);
    // Ephemeral isolated-review seen dies with the orient reset (mode flip / remount path).
    // "Run again" calls beginTypingOnly without this reset, so within-session exclusion still works.
    reviewSeenRef.current = [];
  }, []);

  // Soft-nav between ?section=typing and full sitting reuses this client component —
  // always wipe prior section scores / attempt id when the mode changes.
  useEffect(() => {
    resetToOrient();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when mode flips
  }, [focusKey]);

  const beginTypingOnly = () => {
    const nextAttempt = `review-typing-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([heldCulture()]);
    setLastSection(null);
    setTypingRaw(null);
    // Ephemeral seen only — do not load or write the official exam seen-set.
    // Crypto seed + improved shuffle so consecutive empty-pool draws actually vary.
    const seed = freshDrawSeed();
    const typingDraw = drawTypingPassage(reviewSeenRef.current, seed);
    const passage = typingDraw.items[0];
    if (passage) {
      setTyping({
        passageId: passage.id,
        text: passage.text,
        title: passage.title,
        repeated: typingDraw.repeatedIds.includes(passage.id),
      });
    }
    startedAt.current = Date.now();
    setTypingKey((k) => k + 1);
    setPhase("typing");
  };

  const beginHipaaOnly = () => {
    const nextAttempt = `review-hipaa-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([heldCulture()]);
    setLastSection(null);
    setTypingRaw(null);
    setHipaaAnswers({});
    setItemResults(null);
    // Ephemeral seen only — never persist to official exam seen-set / never feed a real sitting.
    const seed = freshDrawSeed();
    const hipaa = drawHipaaExam(reviewSeenRef.current, seed);
    setHipaaQs(hipaa.questions);
    setHipaaRepeated(hipaa.repeatedIds);
    startedAt.current = Date.now();
    setHipaaKey((k) => k + 1);
    setPhase("hipaa");
  };

  const beginWritingOnly = () => {
    const nextAttempt = `review-writing-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([heldCulture()]);
    setLastSection(null);
    setTypingRaw(null);
    setWritingChartNote("");
    setWritingEscalation("");
    setWritingTrail(null);
    setItemResults(null);
    const seed = freshDrawSeed();
    const writing = drawWritingPrompt(reviewSeenRef.current, seed);
    const wp = writing.items[0];
    if (wp) {
      setWritingPrompt({
        id: wp.id,
        title: wp.title,
        scenario: wp.scenario,
        chartHint: wp.chartHint,
        escalationHint: wp.escalationHint,
        repeated: writing.repeatedIds.includes(wp.id),
      });
    }
    startedAt.current = Date.now();
    setWritingKey((k) => k + 1);
    setPhase("writing");
  };

  const begin = () => {
    if (focus === "typing") {
      beginTypingOnly();
      return;
    }
    if (focus === "hipaa") {
      beginHipaaOnly();
      return;
    }
    if (focus === "writing") {
      beginWritingOnly();
      return;
    }
    if (isolated) {
      setReviewNote(`Isolated review for “${focus}” is not opened yet — finish Writing sign-off first.`);
      return;
    }
    // Real sitting: always fresh attempt + empty section scores (never inherit isolated review).
    const nextAttempt = `exam-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([heldCulture()]);
    setSafety({ redFlagged: false, reasons: [], notes: [] });
    setReport(null);
    setTypingRaw(null);
    setLastSection(null);
    setHipaaAnswers({});
    setWritingChartNote("");
    setWritingEscalation("");
    setReviewNote("");

    seenRef.current = loadSeen(userId);
    const seed = freshDrawSeed();
    const typingDraw = drawTypingPassage(seenRef.current, seed);
    const passage = typingDraw.items[0];
    if (passage) {
      setTyping({
        passageId: passage.id,
        text: passage.text,
        title: passage.title,
        repeated: typingDraw.repeatedIds.includes(passage.id),
      });
    }
    const hipaa = drawHipaaExam(seenRef.current, seed + 3);
    setHipaaQs(hipaa.questions);
    setHipaaRepeated(hipaa.repeatedIds);
    const writing = drawWritingPrompt(seenRef.current, seed + 7);
    const wp = writing.items[0];
    if (wp)
      setWritingPrompt({
        id: wp.id,
        title: wp.title,
        scenario: wp.scenario,
        chartHint: wp.chartHint,
        escalationHint: wp.escalationHint,
        repeated: writing.repeatedIds.includes(wp.id),
      });
    const chat = drawChatBrief(seenRef.current, seed + 11);
    const brief = chat.items[0];
    if (brief) {
      setChatBrief({
        id: brief.id,
        personaId: brief.personaId,
        opening: brief.opening,
        title: brief.title,
        repeated: chat.repeatedIds.includes(brief.id),
      });
    }
    startedAt.current = Date.now();
    setTypingKey((k) => k + 1);
    setPhase("typing");
  };

  const remember = (pool: string, ids: string[], repeatedIds: string[], idForAttempt: string) => {
    seenRef.current = recordSeen(seenRef.current, pool, ids, repeatedIds, idForAttempt);
    saveSeen(userId, seenRef.current);
  };

  const pushSection = (row: SectionResult) => {
    setSections((prev) => [...prev.filter((s) => s.id !== row.id), row]);
  };

  const onTyping = (score: TypingScore) => {
    if (!typing) return;
    const mapped = typingSectionScore(score);
    const row: SectionResult = {
      id: "typing",
      label: SECTION_LABEL.typing,
      weight: EXAM_WEIGHTS.typing,
      status: "scored",
      score: mapped.score,
      note: mapped.note,
      itemIds: [typing.passageId],
      repeatedIds: typing.repeated ? [typing.passageId] : [],
      draftContent: false,
      detail: `${score.accuracy}% accuracy · ${score.wpmReliable ? `${score.wpm} WPM` : "WPM not counted"}`,
    };
    if (focus === "typing") {
      // Isolated review: never persist to official seen-set / never feed a real sitting.
      reviewSeenRef.current = recordSeen(
        reviewSeenRef.current,
        "typing",
        [typing.passageId],
        typing.repeated ? [typing.passageId] : [],
        attemptId,
      );
      setLastSection(row);
      setTypingRaw(score);
      setPhase("section-done");
      return;
    }
    remember("typing", [typing.passageId], typing.repeated ? [typing.passageId] : [], attemptId);
    pushSection(row);
    setTypingRaw(score);
    setLastSection(row);
    setReviewNote(`Typing recorded at ${mapped.score}/100 (attempt ${attemptId}). You cannot return to this section.`);
    setPhase("review");
  };

  const submitHipaa = useCallback(() => {
    if (!hipaaQs.length || phase !== "hipaa") return;
    const correct = hipaaQs.filter((q) => hipaaAnswers[q.id] === q.correctKey).length;
    const score = Math.round((100 * correct) / hipaaQs.length);
    const ids = hipaaQs.map((q) => q.id);
    const row: SectionResult = {
      id: "hipaa",
      label: SECTION_LABEL.hipaa,
      weight: EXAM_WEIGHTS.hipaa,
      status: "scored",
      score,
      note: "Separate exam draw from the certification final exam. Unanswered items count as incorrect.",
      itemIds: ids,
      repeatedIds: hipaaRepeated,
      draftContent: false,
      detail: `${correct}/${hipaaQs.length} correct`,
    };
    if (focus === "hipaa") {
      const items: IsolatedReviewItemResult[] = hipaaQs.map((q) => {
        const selectedKey = hipaaAnswers[q.id] ?? null;
        return {
          id: q.id,
          moduleId: q.moduleId,
          prompt: q.prompt,
          selectedKey,
          correctKey: q.correctKey,
          correct: selectedKey === q.correctKey,
          options: q.options.map((o) => ({ key: o.key, text: o.text })),
        };
      });
      reviewSeenRef.current = recordSeen(reviewSeenRef.current, "hipaa", ids, hipaaRepeated, attemptId);
      saveIsolatedReview({
        attemptId,
        userId,
        section: "hipaa",
        at: Date.now(),
        score,
        detail: row.detail || "",
        itemIds: ids,
        repeatedIds: hipaaRepeated,
        items,
      });
      setItemResults(items);
      setLastSection(row);
      setPhase("section-done");
      return;
    }
    remember("hipaa", ids, hipaaRepeated, attemptId);
    pushSection(row);
    setReviewNote(`HIPAA recorded at ${score}/100 (${correct}/${hipaaQs.length}). This is not the certification exam.`);
    setPhase("review");
  }, [hipaaAnswers, hipaaQs, hipaaRepeated, phase, attemptId, focus, userId]);

  useEffect(() => {
    if (phase !== "hipaa") return;
    setHipaaLeft(HIPAA_SEC);
    const t = setInterval(() => {
      setHipaaLeft((n) => {
        if (n <= 1) {
          clearInterval(t);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "hipaa" && hipaaLeft === 0) submitHipaa();
  }, [phase, hipaaLeft, submitHipaa]);

  useEffect(() => {
    if (phase !== "writing") return;
    setWritingLeft(WRITING_SEC);
    const t = setInterval(() => {
      setWritingLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "chat") return;
    setChatLeft(CHAT_SEC);
    setChatForceEnd(false);
    const t = setInterval(() => {
      setChatLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => {
    if (phase === "chat" && chatLeft === 0) setChatForceEnd(true);
  }, [phase, chatLeft]);

  const onTypingTimer = useCallback(
    (s: { remainingSec: number; totalSec: number; clockStarted: boolean }) => {
      setTypingTimer({
        remainingSec: s.remainingSec,
        totalSec: s.totalSec,
        clockStarted: s.clockStarted,
      });
    },
    [],
  );

  useEffect(() => {
    if (phase !== "typing") {
      setTypingTimer(null);
      return;
    }
    // Seed HUD immediately from the same allotted total the drill will use (120s).
    setTypingTimer((prev) => prev ?? { remainingSec: COMPETENCY_EXAM_TIMERS.typing, totalSec: COMPETENCY_EXAM_TIMERS.typing, clockStarted: false });
  }, [phase]);

  /** Single HUD model — remainingSec is always the section’s scoring/auto-submit clock. */
  const timerHud: ExamTimerHudModel | null = useMemo(() => {
    if (phase === "typing" && typingTimer) {
      return {
        remainingSec: typingTimer.remainingSec,
        totalSec: typingTimer.totalSec,
        label: "Typing",
        awaitingStart: !typingTimer.clockStarted,
      };
    }
    if (phase === "hipaa") {
      return { remainingSec: hipaaLeft, totalSec: HIPAA_SEC, label: "HIPAA" };
    }
    if (phase === "writing") {
      return { remainingSec: writingLeft, totalSec: WRITING_SEC, label: "Writing" };
    }
    if (phase === "chat") {
      return { remainingSec: chatLeft, totalSec: CHAT_SEC, label: "Chat sim" };
    }
    return null;
  }, [phase, typingTimer, hipaaLeft, writingLeft, chatLeft]);

  const submitWriting = useCallback(async () => {
    if (!writingPrompt || phase !== "writing" || busy) return;
    setBusy(true);

    const detA = scoreWritingPartDeterministic(writingChartNote, "chart");
    const detB = scoreWritingPartDeterministic(writingEscalation, "escalation");
    const taskPrompt = [
      writingPrompt.scenario,
      `Chart note task: ${writingPrompt.chartHint}`,
      `Provider message task: ${writingPrompt.escalationHint}`,
    ].join("\n\n");

    const fetchEstimate = async (part: "chart" | "escalation", text: string) => {
      try {
        const res = await fetch("/api/competency-exam/estimate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ prompt: taskPrompt, text, part }),
        });
        const data = (await res.json().catch(() => ({}))) as { estimate?: number | null; note?: string };
        return {
          estimate: typeof data.estimate === "number" ? data.estimate : null,
          note: data.note || "",
        };
      } catch {
        return { estimate: null as number | null, note: "LLM estimate unavailable." };
      }
    };

    const [llmA, llmB] = await Promise.all([
      fetchEstimate("chart", writingChartNote),
      fetchEstimate("escalation", writingEscalation),
    ]);
    const blendA = blendWritingScore(detA.score, llmA.estimate);
    const blendBRaw = blendWritingScore(detB.score, llmB.estimate);
    const escAdj = adjustEscalationScore({
      blendedScore: blendBRaw.score,
      chartNote: writingChartNote,
      escalationText: writingEscalation,
    });
    const blendB = { score: escAdj.score, note: `${blendBRaw.note}${escAdj.note ? ` ${escAdj.note}` : ""}`.trim() };
    const combined = combineWritingPartScores(blendA.score, blendB.score);
    const askHint = !escAdj.missingAsk;
    const row: SectionResult = {
      id: "writing",
      label: SECTION_LABEL.writing,
      weight: EXAM_WEIGHTS.writing,
      status: "scored",
      score: combined.score,
      note: `${combined.note} ${llmA.note} ${blendB.note} ${llmB.note}`.trim(),
      itemIds: [writingPrompt.id],
      repeatedIds: writingPrompt.repeated ? [writingPrompt.id] : [],
      draftContent: true,
      detail: `Chart ${blendA.score}/100 · Escalation ${blendB.score}/100 · ${detA.wordCount + detB.wordCount} words total${
        escAdj.nearDuplicateOfChart
          ? ` · near-duplicate Part B (sim ${Math.round(escAdj.similarity * 100)}%)`
          : askHint
            ? ""
            : " · escalation ask weak/missing"
      }`,
    };

    const trail: IsolatedWritingTrail = {
      promptId: writingPrompt.id,
      title: writingPrompt.title,
      prompt: writingPrompt.scenario,
      format: "clinical-two-part",
      text: "",
      chartNote: writingChartNote,
      escalationText: writingEscalation,
      wordCount: detA.wordCount + detB.wordCount,
      grammarScore: Math.round((detA.grammarScore + detB.grammarScore) / 2),
      issues: [
        ...detA.issues,
        ...detB.issues,
        ...(escAdj.nearDuplicateOfChart
          ? [`Near-duplicate of chart note (similarity ${Math.round(escAdj.similarity * 100)}%)`]
          : []),
        ...(escAdj.missingAsk && !escAdj.nearDuplicateOfChart ? ["Missing explicit ask to provider"] : []),
      ],
      llmEstimate:
        llmA.estimate == null && llmB.estimate == null
          ? null
          : Math.round(((llmA.estimate ?? blendA.score) + (llmB.estimate ?? blendBRaw.score)) / 2),
      blendedScore: combined.score,
      partA: {
        wordCount: detA.wordCount,
        grammarScore: detA.grammarScore,
        issues: detA.issues,
        llmEstimate: llmA.estimate,
        blendedScore: blendA.score,
      },
      partB: {
        wordCount: detB.wordCount,
        grammarScore: detB.grammarScore,
        issues: detB.issues,
        llmEstimate: llmB.estimate,
        blendedScore: blendB.score,
      },
      escalationHasAskHint: askHint,
      partsSimilarity: escAdj.similarity,
      nearDuplicateOfChart: escAdj.nearDuplicateOfChart,
    };

    if (focus === "writing") {
      reviewSeenRef.current = recordSeen(
        reviewSeenRef.current,
        "writing",
        [writingPrompt.id],
        writingPrompt.repeated ? [writingPrompt.id] : [],
        attemptId,
      );
      saveIsolatedReview({
        attemptId,
        userId,
        section: "writing",
        at: Date.now(),
        score: combined.score,
        detail: row.detail || "",
        itemIds: [writingPrompt.id],
        repeatedIds: writingPrompt.repeated ? [writingPrompt.id] : [],
        items: [],
        writing: trail,
      });
      setWritingTrail(trail);
      setLastSection(row);
      setBusy(false);
      setPhase("section-done");
      return;
    }
    remember("writing", [writingPrompt.id], writingPrompt.repeated ? [writingPrompt.id] : [], attemptId);
    pushSection(row);
    setBusy(false);
    setReviewNote(`Writing recorded at ${combined.score}/100 (chart ${blendA.score} · escalation ${blendB.score}). Clinical prompt is still a draft.`);
    setPhase("review");
  }, [busy, phase, token, writingPrompt, writingChartNote, writingEscalation, focus, attemptId, userId]);

  useEffect(() => {
    if (phase === "writing" && writingLeft === 0) void submitWriting();
  }, [phase, writingLeft, submitWriting]);

  const onChat = (fb: SimulatorFeedback) => {
    if (!chatBrief) return;
    const score = chatSectionScore(fb);
    remember("chat-sim", [chatBrief.id], chatBrief.repeated ? [chatBrief.id] : [], attemptId);
    const flag: SafetyFlag = {
      redFlagged: fb.redFlagged || fb.outcome === "red_flag" || fb.safetyReasons.length > 0,
      reasons: fb.safetyReasons,
      notes: [
        ...fb.safetyNotes,
        ...(fb.clinicalAccuracyHits || []).map((h) => h.label || h.replyExcerpt || "clinical-accuracy note"),
      ].filter(Boolean),
    };
    setSafety(flag);
    pushSection({
      id: "chat-sim",
      label: SECTION_LABEL["chat-sim"],
      weight: EXAM_WEIGHTS["chat-sim"],
      status: "scored",
      score,
      note: "Section score is the mean of Grammar, Politeness, and Relevance. Safety is a separate flag and is not folded into this number. Relevance is an estimate.",
      itemIds: [chatBrief.id],
      repeatedIds: chatBrief.repeated ? [chatBrief.id] : [],
      draftContent: true,
      detail: `Grammar ${fb.grammarScore} · Politeness ${fb.politenessScore} · Relevance ${fb.relevanceScore}`,
    });
    setReviewNote(`Chat simulator recorded at ${score}/100. ${flag.redFlagged ? "A safety flag was raised for the human reviewer." : "No safety flag."}`);
    setPhase("review");
  };

  const afterReview = () => {
    if (!sections.some((s) => s.id === "typing")) return;
    if (!sections.some((s) => s.id === "hipaa")) {
      setPhase("hipaa");
      return;
    }
    if (!sections.some((s) => s.id === "writing")) {
      setPhase("writing");
      return;
    }
    if (!sections.some((s) => s.id === "chat-sim")) {
      setPhase("chat");
      return;
    }
    const model = buildExamReport({
      attemptId,
      subjectLabel,
      startedAt: startedAt.current,
      submittedAt: Date.now(),
      sections,
      safety,
    });
    setReport(model);
    saveAttempt({ attemptId, userId, report: model });
    setPhase("report");
  };

  const persona = useMemo(() => (chatBrief ? getPersona(chatBrief.personaId) : undefined), [chatBrief]);

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <ExamCountdownHud model={timerHud} />
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">MA competency exam</p>
        <h1 className="text-xl font-semibold text-[var(--siya-primary)]">
          {focus === "typing"
            ? "Isolated review · Typing"
            : focus === "hipaa"
              ? "Isolated review · HIPAA"
              : focus === "writing"
                ? "Isolated review · Writing"
                : isolated
                  ? `Isolated review · ${focus}`
                  : "Partial sitting"}
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          {focus === "typing"
            ? "Typing only — real passage, locked 120s timer, real section score. No HIPAA, writing, or chat."
            : focus === "hipaa"
              ? "HIPAA only — 20 items, 12-minute lock, separate draw from certification. No typing, writing, or chat."
              : focus === "writing"
                ? "Practice clinical documentation for the MA competency exam — chart note + message to the provider, 10 minutes. Draft scenarios; not an official score yet."
                : "Typing, HIPAA, writing, and chat simulator only. Culture/language is held. Listening and speaking are not in this pass."}
        </p>
      </header>

      {phase === "orient" && focus === "typing" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p className="font-semibold text-[var(--siya-primary)]">What you are reviewing</p>
          <ul className="list-disc space-y-1 pl-4 text-[var(--siya-text)]">
            <li>One passage drawn from the live typing bank (15 workplace lines)</li>
            <li>Locked 2-minute timer — clock starts on first keystroke (Start test only arms/focuses)</li>
            <li>Section score (DEFAULT — needs founder confirmation): 60% accuracy + 40% pace (50 WPM → 100); unreliable WPM → accuracy only</li>
            <li>Does not update practice personal best</li>
            <li>Stops after this section — you will not be pushed into HIPAA</li>
          </ul>
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Content status: <strong>finalized for review</strong> (reuses Learn typing bank; not draft / not pending Sonu). Typing is signed off — keep this URL for re-checks.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I am reviewing Typing in isolation for sign-off.</span>
          </label>
          <button
            type="button"
            disabled={!ack}
            onClick={begin}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start typing section
          </button>
        </div>
      ) : null}

      {phase === "orient" && focus === "hipaa" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p className="font-semibold text-[var(--siya-primary)]">What you are reviewing</p>
          <ul className="list-disc space-y-1 pl-4 text-[var(--siya-text)]">
            <li>20 items drawn from the live HIPAA training bank (73 questions) — separate from the certification final exam</li>
            <li>Locked 12-minute timer — starts when you begin this section</li>
            <li>Section score: percent correct (unanswered = incorrect); weight {EXAM_WEIGHTS.hipaa} pts in composite</li>
            <li>Ephemeral review seen-set only — does not write the official exam seen-set or feed a full sitting</li>
            <li>Stops after this section — you will not be pushed into Writing or chat</li>
          </ul>
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Content status: <strong>finalized for review</strong> (same question bank as staff HIPAA training; not a draft pending Sonu).
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I am reviewing HIPAA in isolation for sign-off.</span>
          </label>
          <button
            type="button"
            disabled={!ack}
            onClick={begin}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start HIPAA section
          </button>
        </div>
      ) : null}

      {phase === "orient" && focus === "writing" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p className="font-semibold text-[var(--siya-primary)]">Before you start</p>
          <div className="space-y-2 text-[var(--siya-text)]">
            <p>This is a practice writing exercise for the MA competency exam.</p>
            <p>
              You&apos;ll get one clinical scenario. Write two things: a <strong>chart note</strong> documenting what was
              observed or reported, and a <strong>message to the provider</strong> that escalates the concern with a clear
              ask. You have 10 minutes.
            </p>
            <p>
              These are draft scenarios we&apos;re still reviewing — your answer here won&apos;t count toward anything
              official yet.
            </p>
            <p className="text-xs text-[var(--siya-text-secondary)]">
              Type your answers yourself (voice dictation isn&apos;t available). Stick to facts — no judgment labels.
              When you submit, you&apos;ll see a short summary — you won&apos;t move on to another exam section.
            </p>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I understand this is practice only and won&apos;t count toward an official score.</span>
          </label>
          <button
            type="button"
            disabled={!ack}
            onClick={begin}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start writing section
          </button>
        </div>
      ) : null}

      {phase === "orient" && !focus ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>Sections are sequential and locked. You cannot return to a prior section. A short review appears before you continue.</p>
          <ul className="list-disc pl-4 text-[var(--siya-text)]">
            <li>Typing — 2 minutes, one passage</li>
            <li>HIPAA — 20 items, 12 minutes, separate from certification</li>
            <li>Writing — 10 minutes, draft prompt pending Sonu</li>
            <li>Chat simulator — up to 6 of your replies</li>
          </ul>
          <p className="rounded-xl bg-[var(--siya-bg-subtle)] p-3 text-xs">{CULTURE_SECTION_HELD_REASON}</p>
          <p>A person reviews the report. It does not decide employment, pay, or certification.</p>
          <p className="text-xs">
            Prefer section-by-section review? Open{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=typing">
              Typing
            </a>
            ,{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=hipaa">
              HIPAA
            </a>
            , or{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=writing">
              Writing
            </a>
            .
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I understand this is a human-reviewed partial exam, not a certification or employment decision.</span>
          </label>
          <button
            type="button"
            disabled={!ack}
            onClick={begin}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start typing
          </button>
        </div>
      ) : null}

      {phase === "orient" && isolated && focus !== "typing" && focus !== "hipaa" && focus !== "writing" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>
            Isolated review for <strong>{focus}</strong> is queued after Writing sign-off. Open Writing first, or continue from HIPAA.
          </p>
          {reviewNote ? <p className="text-xs text-[var(--siya-text-secondary)]">{reviewNote}</p> : null}
          <a
            href="/learn/competency-exam?section=writing"
            className="inline-block rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to Writing review
          </a>
        </div>
      ) : null}

      {phase === "typing" && typing ? (
        <div className="space-y-2" key={typingKey}>
          {focus === "typing" ? (
            <p className="text-xs font-semibold text-[var(--siya-accent)]">Isolated · Typing — finish or wait for the 120s lock</p>
          ) : null}
          {typing.repeated ? <p className="text-xs font-semibold">Repeat item — not a fresh measure.</p> : null}
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Passage: <strong>{typing.title}</strong> · id <code>{typing.passageId}</code> · attempt{" "}
            <code>{attemptId}</code>
          </p>
          <ChatTypingDrill
            examMode={{
              passage: { id: typing.passageId, title: typing.title, text: typing.text, category: "exam", difficulty: "medium" },
              onFinish: onTyping,
              onTimer: onTypingTimer,
            }}
          />
        </div>
      ) : null}

      {phase === "section-done" && lastSection && (focus === "typing" || focus === "hipaa" || focus === "writing") ? (
        <SectionDoneCard
          section={lastSection}
          rawTyping={focus === "typing" ? typingRaw : null}
          attemptId={attemptId}
          onAgain={
            focus === "typing" ? beginTypingOnly : focus === "hipaa" ? beginHipaaOnly : beginWritingOnly
          }
          itemResults={focus === "hipaa" ? itemResults : null}
          writingTrail={focus === "writing" ? writingTrail : null}
        />
      ) : null}

      {phase === "hipaa" && hipaaQs.length ? (
        <div className="space-y-3" key={hipaaKey}>
          {focus === "hipaa" ? (
            <p className="text-xs font-semibold text-[var(--siya-accent)]">
              Isolated · HIPAA — finish or wait for the 12-minute lock · attempt <code>{attemptId}</code>
            </p>
          ) : null}
          <p className="text-sm font-semibold">
            HIPAA · {fmt(hipaaLeft)} left · not the certification exam
            <span className="sr-only"> (same remaining seconds as the fixed countdown)</span>
          </p>
          {hipaaRepeated.length ? (
            <p className="text-xs font-semibold">Repeat items — not a fresh measure: {hipaaRepeated.join(", ")}</p>
          ) : null}
          <ol className="space-y-3">
            {hipaaQs.map((q, i) => (
              <li key={q.id} className="rounded-xl border border-[var(--siya-border)] p-3 text-sm">
                <p className="font-medium">
                  {i + 1}. {q.prompt}
                </p>
                <div className="mt-2 space-y-1">
                  {q.options.map((opt) => (
                    <label key={opt.key} className="flex items-start gap-2">
                      <input
                        type="radio"
                        name={q.id}
                        checked={hipaaAnswers[q.id] === opt.key}
                        onChange={() => setHipaaAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
                      />
                      <span>
                        {opt.key}. {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              </li>
            ))}
          </ol>
          <button type="button" onClick={submitHipaa} className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white">
            {focus === "hipaa" ? "Submit HIPAA review" : "Submit HIPAA section"}
          </button>
        </div>
      ) : null}

      {phase === "writing" && writingPrompt ? (
        <div className="space-y-3" key={writingKey}>
          {focus === "writing" ? (
            <p className="text-xs font-semibold text-[var(--siya-accent)]">
              Isolated · Writing — finish or wait for the 10-minute lock · attempt <code>{attemptId}</code>
            </p>
          ) : null}
          <p className="text-sm font-semibold">
            Writing · {fmt(writingLeft)} left
            <span className="sr-only"> (same remaining seconds as the fixed countdown)</span>
          </p>
          <p className="text-xs font-semibold">Draft clinical scenario — still under review. Not used for an official score yet.</p>
          {writingPrompt.repeated ? <p className="text-xs font-semibold">Repeat prompt — not a fresh measure.</p> : null}
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Scenario: <strong>{writingPrompt.title}</strong> · id <code>{writingPrompt.id}</code>
          </p>
          <p className="text-sm">{writingPrompt.scenario}</p>
          <p className="text-[11px] text-[var(--siya-text-muted)]">
            Type both answers. Voice dictation isn&apos;t available on this exercise. Use facts only — no judgment labels.
          </p>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--siya-primary)]" htmlFor="writing-chart-note">
              1. Chart note
            </label>
            <p className="rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text)]">
              Write only what you&apos;d put in the patient&apos;s chart — what was observed or reported. Do not include a
              request to the provider here.
            </p>
            <p className="text-xs text-[var(--siya-text-secondary)]">{writingPrompt.chartHint}</p>
            <textarea
              id="writing-chart-note"
              value={writingChartNote}
              onChange={(e) => setWritingChartNote(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-[var(--siya-border)] p-3 text-sm"
              placeholder="Chart only — observations / what the patient reported…"
              data-no-voice-input="true"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--siya-primary)]" htmlFor="writing-escalation">
              2. Message to provider
            </label>
            <p className="rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text)]">
              Write the message you&apos;d actually send the provider. State your concern clearly, include the key facts,
              and make a specific ask (e.g. what you want them to do or decide).
            </p>
            <p className="text-xs text-[var(--siya-text-secondary)]">{writingPrompt.escalationHint}</p>
            <textarea
              id="writing-escalation"
              value={writingEscalation}
              onChange={(e) => setWritingEscalation(e.target.value)}
              rows={6}
              className="w-full rounded-xl border border-[var(--siya-border)] p-3 text-sm"
              placeholder="Provider message — concern + key facts + clear ask…"
              data-no-voice-input="true"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitWriting()}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Scoring…" : focus === "writing" ? "Submit writing review" : "Submit writing"}
          </button>
        </div>
      ) : null}

      {phase === "chat" && chatBrief && persona && !isolated ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold">DRAFT brief — pending Sonu review. {chatBrief.title}</p>
          {chatBrief.repeated ? <p className="text-xs font-semibold">Repeat brief — not a fresh measure.</p> : null}
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Exam chat wall clock · {fmt(chatLeft)} left (same clock as the fixed timer) · 6-reply turn cap also applies
          </p>
          <div className="h-[70vh] min-h-[28rem] overflow-hidden rounded-2xl border border-[var(--siya-border)]">
            <PatientChatSimulator
              examMode={{
                persona,
                opening: chatBrief.opening,
                briefId: chatBrief.id,
                maxTurns: 6,
                forceComplete: chatForceEnd,
                onComplete: onChat,
              }}
            />
          </div>
        </div>
      ) : null}

      {phase === "review" && !isolated ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>{reviewNote}</p>
          <p className="text-xs text-[var(--siya-text-secondary)]">You cannot go back and change this section.</p>
          <button type="button" onClick={afterReview} className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white">
            Continue
          </button>
        </div>
      ) : null}

      {phase === "report" && report ? <ExamReportView report={report} /> : null}
    </div>
  );
}
