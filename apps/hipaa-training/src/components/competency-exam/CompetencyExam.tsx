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
import {
  drawChatBrief,
  drawCombinedMcqExam,
  drawListeningPrompt,
  drawTypingPassage,
  MCQ_EXAM_COUNT,
} from "@/lib/competency-exam/draws";
import { buildExamReport } from "@/lib/competency-exam/report";
import { chatSectionScore, typingSectionScore } from "@/lib/competency-exam/scoring";
import { parseExamSectionFocus } from "@/lib/competency-exam/section-focus";
import { recordSeen, freshDrawSeed, type SeenEntry } from "@/lib/competency-exam/seen-set";
import {
  loadSeen,
  saveAttempt,
  saveSeen,
  saveIsolatedReview,
  type IsolatedReviewItemResult,
  type IsolatedWritingTrail,
} from "@/lib/competency-exam/storage";
import type { ExamReportModel, SafetyFlag, SectionResult } from "@/lib/competency-exam/types";
import {
  scoreListeningProviderMessage,
  WRITING_DETERMINISTIC_ONLY_CAP,
} from "@/lib/competency-exam/writing-score";
import { EXAM_WEIGHTS, SECTION_LABEL } from "@/lib/competency-exam/weights";
import { ExamReportView } from "./ExamReportView";
import { ExamCountdownHud } from "./ExamCountdownHud";
import {
  COMPETENCY_EXAM_TIMERS,
  type ExamTimerHudModel,
} from "@/lib/competency-exam/exam-timer";

type Phase =
  | "orient"
  | "typing"
  | "mcq"
  | "listening"
  | "chat-typed"
  | "chat-spoken"
  | "review"
  | "report"
  | "section-done";

type ChatBriefState = {
  id: string;
  personaId: "persona-janet" | "persona-emma";
  opening: string;
  title: string;
  repeated: boolean;
};

const MCQ_SEC = COMPETENCY_EXAM_TIMERS.mcq;
const LISTENING_SEC = COMPETENCY_EXAM_TIMERS.listening;
const CHAT_SEC = COMPETENCY_EXAM_TIMERS.chat;

function fmt(sec: number) {
  const s = Math.max(0, Math.ceil(sec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
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
      ? { href: "/learn/competency-exam?section=mcq", label: "Open MCQ review" }
      : section.id === "mcq"
        ? { href: "/learn/competency-exam?section=listening", label: "Open Listening review" }
        : null;
  const closeout =
    section.id === "typing"
      ? "This run does not continue into other sections. Typing is signed off — open Combined MCQ next when ready."
      : section.id === "mcq"
        ? "This run does not continue into other sections. Sign off when MCQ looks good, then open Listening. Item-level results are saved in this browser for audit."
        : section.id === "listening"
          ? "This run does not continue into other sections. Listening trail (voicemail id + provider message + scores) is saved in this browser. Prototype content — not approved for official scoring."
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
          <summary className="cursor-pointer font-semibold">
            Listening trail (voicemail + provider message + scores)
          </summary>
          <div className="mt-2 space-y-2">
            <p>
              <code className="font-mono text-[10px]">{writingTrail.promptId}</code> · {writingTrail.title}
              {writingTrail.audioSrc ? " · voicemail" : ""}
              {writingTrail.format === "listening-provider-message" ? " · provider message only" : ""}
            </p>
            {writingTrail.llmEstimate == null ? (
              <p className="font-semibold text-amber-800">
                Partial score — LLM content estimate unavailable (grammar/length only; capped). Not a full 100.
              </p>
            ) : null}
            <p className="font-semibold text-[var(--siya-text)]">Scenario</p>
            <p className="text-[var(--siya-text)]">{writingTrail.prompt}</p>
            <p className="font-semibold text-[var(--siya-text)]">
              Message to provider ({writingTrail.wordCount} words)
            </p>
            <pre className="whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-2 text-[var(--siya-text)]">
              {writingTrail.text || writingTrail.escalationText || "(empty)"}
            </pre>
            <p className="text-[var(--siya-text-secondary)]">
              Grammar {writingTrail.grammarScore}
              {writingTrail.llmEstimate == null
                ? " · no LLM estimate"
                : ` · LLM estimate ${writingTrail.llmEstimate}`}{" "}
              · blended <strong>{writingTrail.blendedScore}/100</strong>
              {writingTrail.escalationHasAskHint === false ? " · ask wording weak/missing" : ""}
            </p>
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
  const [mcqQs, setMcqQs] = useState<Question[]>([]);
  const [mcqRepeated, setMcqRepeated] = useState<string[]>([]);
  const [mcqDraftPools, setMcqDraftPools] = useState<Array<"clinical-knowledge" | "culture">>([]);
  const [mcqMix, setMcqMix] = useState<{ hipaa: number; clinical: number; trivia: number } | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, string>>({});
  const [mcqLeft, setMcqLeft] = useState(MCQ_SEC);
  const [listeningPrompt, setListeningPrompt] = useState<{
    id: string;
    title: string;
    scenario: string;
    providerMessageHint: string;
    repeated: boolean;
    audioSrc: string;
    voicemailScript: string;
  } | null>(null);
  const [providerMessage, setProviderMessage] = useState("");
  const [listeningLeft, setListeningLeft] = useState(LISTENING_SEC);
  const [chatLeft, setChatLeft] = useState(CHAT_SEC);
  const [chatForceEnd, setChatForceEnd] = useState(false);
  /** Typing HUD mirrors ChatTypingDrill’s duration−elapsed — not a second clock. */
  const [typingTimer, setTypingTimer] = useState<{
    remainingSec: number;
    totalSec: number;
    clockStarted: boolean;
  } | null>(null);
  const [chatTypedBrief, setChatTypedBrief] = useState<ChatBriefState | null>(null);
  const [chatSpokenBrief, setChatSpokenBrief] = useState<ChatBriefState | null>(null);
  const [sections, setSections] = useState<SectionResult[]>([]);
  const [safety, setSafety] = useState<SafetyFlag>({ redFlagged: false, reasons: [], notes: [] });
  const [busy, setBusy] = useState(false);
  const [reviewNote, setReviewNote] = useState("");
  const [typingKey, setTypingKey] = useState(0);
  const [mcqKey, setMcqKey] = useState(0);
  const [listeningKey, setListeningKey] = useState(0);
  const [chatKey, setChatKey] = useState(0);
  const [itemResults, setItemResults] = useState<IsolatedReviewItemResult[] | null>(null);
  const [listeningTrail, setListeningTrail] = useState<IsolatedWritingTrail | null>(null);

  const activeChatBrief =
    phase === "chat-spoken" ? chatSpokenBrief : phase === "chat-typed" ? chatTypedBrief : null;
  const activeChatModality: "typed" | "spoken" | null =
    phase === "chat-spoken" ? "spoken" : phase === "chat-typed" ? "typed" : null;

  const resetToOrient = useCallback(() => {
    setPhase("orient");
    setAck(false);
    setAttemptId(`exam-${Date.now()}`);
    setSections([]);
    setSafety({ redFlagged: false, reasons: [], notes: [] });
    setReport(null);
    setTyping(null);
    setTypingRaw(null);
    setLastSection(null);
    setMcqQs([]);
    setMcqRepeated([]);
    setMcqDraftPools([]);
    setMcqMix(null);
    setMcqAnswers({});
    setListeningPrompt(null);
    setProviderMessage("");
    setChatTypedBrief(null);
    setChatSpokenBrief(null);
    setReviewNote("");
    setBusy(false);
    setItemResults(null);
    setListeningTrail(null);
    reviewSeenRef.current = [];
  }, []);

  useEffect(() => {
    resetToOrient();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when mode flips
  }, [focusKey]);

  const beginTypingOnly = () => {
    const nextAttempt = `review-typing-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([]);
    setLastSection(null);
    setTypingRaw(null);
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

  const beginMcqOnly = () => {
    const nextAttempt = `review-mcq-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([]);
    setLastSection(null);
    setTypingRaw(null);
    setMcqAnswers({});
    setItemResults(null);
    const seed = freshDrawSeed();
    const mcq = drawCombinedMcqExam(reviewSeenRef.current, seed);
    setMcqQs(mcq.questions);
    setMcqRepeated(mcq.repeatedIds);
    setMcqDraftPools(mcq.draftPools);
    setMcqMix(mcq.mix);
    startedAt.current = Date.now();
    setMcqKey((k) => k + 1);
    setPhase("mcq");
  };

  const beginListeningOnly = () => {
    const nextAttempt = `review-listening-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([]);
    setLastSection(null);
    setTypingRaw(null);
    setProviderMessage("");
    setListeningTrail(null);
    setItemResults(null);
    const seed = freshDrawSeed();
    const listening = drawListeningPrompt(reviewSeenRef.current, seed);
    const lp = listening.items[0];
    if (lp) {
      setListeningPrompt({
        id: lp.id,
        title: lp.title,
        scenario: lp.scenario,
        providerMessageHint: lp.providerMessageHint,
        repeated: listening.repeatedIds.includes(lp.id),
        audioSrc: lp.audioSrc,
        voicemailScript: lp.voicemailScript,
      });
    }
    startedAt.current = Date.now();
    setListeningKey((k) => k + 1);
    setPhase("listening");
  };

  const begin = () => {
    if (focus === "typing") {
      beginTypingOnly();
      return;
    }
    if (focus === "mcq") {
      beginMcqOnly();
      return;
    }
    if (focus === "listening") {
      beginListeningOnly();
      return;
    }
    if (isolated) {
      setReviewNote(`Isolated review for “${focus}” is not opened yet.`);
      return;
    }

    const nextAttempt = `exam-${Date.now()}`;
    setAttemptId(nextAttempt);
    setSections([]);
    setSafety({ redFlagged: false, reasons: [], notes: [] });
    setReport(null);
    setTypingRaw(null);
    setLastSection(null);
    setMcqAnswers({});
    setProviderMessage("");
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
    const mcq = drawCombinedMcqExam(seenRef.current, seed + 3);
    setMcqQs(mcq.questions);
    setMcqRepeated(mcq.repeatedIds);
    setMcqDraftPools(mcq.draftPools);
    setMcqMix(mcq.mix);
    const listening = drawListeningPrompt(seenRef.current, seed + 7);
    const lp = listening.items[0];
    if (lp) {
      setListeningPrompt({
        id: lp.id,
        title: lp.title,
        scenario: lp.scenario,
        providerMessageHint: lp.providerMessageHint,
        repeated: listening.repeatedIds.includes(lp.id),
        audioSrc: lp.audioSrc,
        voicemailScript: lp.voicemailScript,
      });
    }
    const chatA = drawChatBrief(seenRef.current, seed + 11);
    const briefA = chatA.items[0];
    let seenForChatB = seenRef.current;
    if (briefA) {
      setChatTypedBrief({
        id: briefA.id,
        personaId: briefA.personaId,
        opening: briefA.opening,
        title: briefA.title,
        repeated: chatA.repeatedIds.includes(briefA.id),
      });
      seenForChatB = recordSeen(
        seenForChatB,
        "chat-sim",
        [briefA.id],
        chatA.repeatedIds.includes(briefA.id) ? [briefA.id] : [],
        nextAttempt,
      );
    }
    const chatB = drawChatBrief(seenForChatB, seed + 17);
    const briefB = chatB.items[0];
    if (briefB) {
      setChatSpokenBrief({
        id: briefB.id,
        personaId: briefB.personaId,
        opening: briefB.opening,
        title: briefB.title,
        repeated: chatB.repeatedIds.includes(briefB.id),
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

  const submitMcq = useCallback(() => {
    if (!mcqQs.length || phase !== "mcq") return;
    const correct = mcqQs.filter((q) => mcqAnswers[q.id] === q.correctKey).length;
    const score = Math.round((100 * correct) / mcqQs.length);
    const ids = mcqQs.map((q) => q.id);
    const draft = mcqDraftPools.length > 0;
    const mixNote = mcqMix
      ? `Mix HIPAA ${mcqMix.hipaa} · clinical ${mcqMix.clinical} · trivia ${mcqMix.trivia}.`
      : "";
    const row: SectionResult = {
      id: "mcq",
      label: SECTION_LABEL.mcq,
      weight: EXAM_WEIGHTS.mcq,
      status: "scored",
      score,
      note: `Combined MCQ draw (HIPAA + clinical knowledge + trivia/culture). Unanswered items count as incorrect. ${mixNote}`.trim(),
      itemIds: ids,
      repeatedIds: mcqRepeated,
      draftContent: draft,
      detail: `${correct}/${mcqQs.length} correct`,
    };
    if (focus === "mcq") {
      const items: IsolatedReviewItemResult[] = mcqQs.map((q) => {
        const selectedKey = mcqAnswers[q.id] ?? null;
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
      const hipaaIds = mcqQs.filter((q) => q.moduleId !== "clinical-knowledge-draft" && q.moduleId !== "culture-exam-draft").map((q) => q.id);
      const clinicalIds = mcqQs.filter((q) => q.moduleId === "clinical-knowledge-draft").map((q) => q.id);
      const cultureIds = mcqQs.filter((q) => q.moduleId === "culture-exam-draft").map((q) => q.id);
      if (hipaaIds.length) reviewSeenRef.current = recordSeen(reviewSeenRef.current, "hipaa", hipaaIds, [], attemptId);
      if (clinicalIds.length) {
        reviewSeenRef.current = recordSeen(reviewSeenRef.current, "clinical-knowledge", clinicalIds, [], attemptId);
      }
      if (cultureIds.length) reviewSeenRef.current = recordSeen(reviewSeenRef.current, "culture", cultureIds, [], attemptId);
      saveIsolatedReview({
        attemptId,
        userId,
        section: "mcq",
        at: Date.now(),
        score,
        detail: row.detail || "",
        itemIds: ids,
        repeatedIds: mcqRepeated,
        items,
      });
      setItemResults(items);
      setLastSection(row);
      setPhase("section-done");
      return;
    }
    const hipaaIds = mcqQs
      .filter((q) => q.moduleId !== "clinical-knowledge-draft" && q.moduleId !== "culture-exam-draft")
      .map((q) => q.id);
    const clinicalIds = mcqQs.filter((q) => q.moduleId === "clinical-knowledge-draft").map((q) => q.id);
    const cultureIds = mcqQs.filter((q) => q.moduleId === "culture-exam-draft").map((q) => q.id);
    if (hipaaIds.length) remember("hipaa", hipaaIds, mcqRepeated.filter((id) => hipaaIds.includes(id)), attemptId);
    if (clinicalIds.length) remember("clinical-knowledge", clinicalIds, [], attemptId);
    if (cultureIds.length) remember("culture", cultureIds, [], attemptId);
    pushSection(row);
    setReviewNote(
      `Combined MCQ recorded at ${score}/100 (${correct}/${mcqQs.length}). ${draft ? "Includes draft pool items." : ""}`.trim(),
    );
    setPhase("review");
  }, [mcqAnswers, mcqQs, mcqRepeated, mcqDraftPools, mcqMix, phase, attemptId, focus, userId]);

  useEffect(() => {
    if (phase !== "mcq") return;
    setMcqLeft(MCQ_SEC);
    const t = setInterval(() => {
      setMcqLeft((n) => {
        if (n <= 1) {
          clearInterval(t);
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase, mcqKey]);

  useEffect(() => {
    if (phase === "mcq" && mcqLeft === 0) submitMcq();
  }, [phase, mcqLeft, submitMcq]);

  useEffect(() => {
    if (phase !== "listening") return;
    setListeningLeft(LISTENING_SEC);
    const t = setInterval(() => {
      setListeningLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase, listeningKey]);

  useEffect(() => {
    if (phase !== "chat-typed" && phase !== "chat-spoken") return;
    setChatLeft(CHAT_SEC);
    setChatForceEnd(false);
    const t = setInterval(() => {
      setChatLeft((n) => (n <= 1 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(t);
  }, [phase, chatKey]);

  useEffect(() => {
    if ((phase === "chat-typed" || phase === "chat-spoken") && chatLeft === 0) setChatForceEnd(true);
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
    setTypingTimer((prev) => prev ?? { remainingSec: COMPETENCY_EXAM_TIMERS.typing, totalSec: COMPETENCY_EXAM_TIMERS.typing, clockStarted: false });
  }, [phase]);

  const timerHud: ExamTimerHudModel | null = useMemo(() => {
    if (phase === "typing" && typingTimer) {
      return {
        remainingSec: typingTimer.remainingSec,
        totalSec: typingTimer.totalSec,
        label: "Typing",
        awaitingStart: !typingTimer.clockStarted,
      };
    }
    if (phase === "mcq") {
      return { remainingSec: mcqLeft, totalSec: MCQ_SEC, label: "Combined MCQ" };
    }
    if (phase === "listening") {
      return { remainingSec: listeningLeft, totalSec: LISTENING_SEC, label: "Listening" };
    }
    if (phase === "chat-typed") {
      return { remainingSec: chatLeft, totalSec: CHAT_SEC, label: "Chat sim (typed)" };
    }
    if (phase === "chat-spoken") {
      return { remainingSec: chatLeft, totalSec: CHAT_SEC, label: "Chat sim (spoken)" };
    }
    return null;
  }, [phase, typingTimer, mcqLeft, listeningLeft, chatLeft]);

  const submitListening = useCallback(async () => {
    if (!listeningPrompt || phase !== "listening" || busy) return;
    setBusy(true);

    const taskPrompt = [listeningPrompt.scenario, `Provider message task: ${listeningPrompt.providerMessageHint}`].join(
      "\n\n",
    );

    let llmEstimate: number | null = null;
    let llmNote = "";
    try {
      const res = await fetch("/api/competency-exam/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: taskPrompt, text: providerMessage, part: "escalation" }),
      });
      const data = (await res.json().catch(() => ({}))) as { estimate?: number | null; note?: string };
      llmEstimate = typeof data.estimate === "number" ? data.estimate : null;
      llmNote = data.note || "";
    } catch {
      llmNote = "LLM estimate unavailable.";
    }

    const scored = scoreListeningProviderMessage({ text: providerMessage, llmEstimate });
    const row: SectionResult = {
      id: "listening",
      label: SECTION_LABEL.listening,
      weight: EXAM_WEIGHTS.listening,
      status: "scored",
      score: scored.score,
      note: `${scored.note} ${llmNote}${
        scored.partial ? ` Partial — LLM estimate missing (deterministic cap ${WRITING_DETERMINISTIC_ONLY_CAP}).` : ""
      }`.trim(),
      itemIds: [listeningPrompt.id],
      repeatedIds: listeningPrompt.repeated ? [listeningPrompt.id] : [],
      draftContent: true,
      detail: `Provider message · ${scored.det.wordCount} words${
        scored.partial ? " · partial (LLM unavailable)" : ""
      }${scored.missingAsk ? " · ask weak/missing" : ""}`,
    };

    const trail: IsolatedWritingTrail = {
      promptId: listeningPrompt.id,
      title: listeningPrompt.title,
      prompt: listeningPrompt.scenario,
      format: "listening-provider-message",
      text: providerMessage,
      escalationText: providerMessage,
      wordCount: scored.det.wordCount,
      grammarScore: scored.det.grammarScore,
      issues: [
        ...scored.det.issues,
        ...(scored.partial
          ? [`Partial score — LLM estimate unavailable (capped at ${WRITING_DETERMINISTIC_ONLY_CAP})`]
          : []),
        ...(scored.missingAsk ? ["Missing explicit ask to provider"] : []),
        ...(!scored.substance.ok && scored.substance.reason ? [scored.substance.reason] : []),
      ],
      llmEstimate,
      blendedScore: scored.score,
      escalationHasAskHint: !scored.missingAsk,
      audioSrc: listeningPrompt.audioSrc,
      voicemailScript: listeningPrompt.voicemailScript,
    };

    if (focus === "listening") {
      reviewSeenRef.current = recordSeen(
        reviewSeenRef.current,
        "listening",
        [listeningPrompt.id],
        listeningPrompt.repeated ? [listeningPrompt.id] : [],
        attemptId,
      );
      saveIsolatedReview({
        attemptId,
        userId,
        section: "listening",
        at: Date.now(),
        score: scored.score,
        detail: row.detail || "",
        itemIds: [listeningPrompt.id],
        repeatedIds: listeningPrompt.repeated ? [listeningPrompt.id] : [],
        items: [],
        writing: trail,
        listeningAudioSrc: listeningPrompt.audioSrc,
      });
      setListeningTrail(trail);
      setLastSection(row);
      setBusy(false);
      setPhase("section-done");
      return;
    }
    remember("listening", [listeningPrompt.id], listeningPrompt.repeated ? [listeningPrompt.id] : [], attemptId);
    pushSection(row);
    setBusy(false);
    setReviewNote(`Listening recorded at ${scored.score}/100. Prototype voicemail — draft content.`);
    setPhase("review");
  }, [busy, phase, token, listeningPrompt, providerMessage, focus, attemptId, userId]);

  useEffect(() => {
    if (phase === "listening" && listeningLeft === 0) void submitListening();
  }, [phase, listeningLeft, submitListening]);

  const onChat = (fb: SimulatorFeedback) => {
    const brief = activeChatBrief;
    const modality = activeChatModality;
    if (!brief || !modality) return;
    const sectionId = modality === "spoken" ? "chat-sim-spoken" : "chat-sim-typed";
    const score = chatSectionScore(fb);
    remember("chat-sim", [brief.id], brief.repeated ? [brief.id] : [], attemptId);
    const flag: SafetyFlag = {
      redFlagged: fb.redFlagged || fb.outcome === "red_flag" || fb.safetyReasons.length > 0,
      reasons: [...safety.reasons, ...fb.safetyReasons],
      notes: [
        ...safety.notes,
        ...fb.safetyNotes,
        ...(fb.clinicalAccuracyHits || []).map((h) => h.label || h.replyExcerpt || "clinical-accuracy note"),
      ].filter(Boolean),
    };
    setSafety(flag);
    pushSection({
      id: sectionId,
      label: SECTION_LABEL[sectionId],
      weight: EXAM_WEIGHTS[sectionId],
      status: "scored",
      score,
      note: `${modality === "spoken" ? "Spoken" : "Typed"} chat lane. Section score is the mean of Grammar, Politeness, and Relevance. Safety is a separate flag.`,
      itemIds: [brief.id],
      repeatedIds: brief.repeated ? [brief.id] : [],
      draftContent: true,
      detail: `Grammar ${fb.grammarScore} · Politeness ${fb.politenessScore} · Relevance ${fb.relevanceScore}`,
    });
    setReviewNote(
      `Chat simulator (${modality}) recorded at ${score}/100. ${flag.redFlagged ? "A safety flag was raised for the human reviewer." : "No safety flag."}`,
    );
    setPhase("review");
  };

  const afterReview = () => {
    if (!sections.some((s) => s.id === "typing")) return;
    if (!sections.some((s) => s.id === "mcq")) {
      setMcqKey((k) => k + 1);
      setPhase("mcq");
      return;
    }
    if (!sections.some((s) => s.id === "listening")) {
      setListeningKey((k) => k + 1);
      setPhase("listening");
      return;
    }
    if (!sections.some((s) => s.id === "chat-sim-typed")) {
      setChatKey((k) => k + 1);
      setPhase("chat-typed");
      return;
    }
    if (!sections.some((s) => s.id === "chat-sim-spoken")) {
      setChatKey((k) => k + 1);
      setPhase("chat-spoken");
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

  const persona = useMemo(
    () => (activeChatBrief ? getPersona(activeChatBrief.personaId) : undefined),
    [activeChatBrief],
  );

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <ExamCountdownHud model={timerHud} />
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-text-secondary)]">MA competency exam</p>
        <h1 className="text-xl font-semibold text-[var(--siya-primary)]">
          {focus === "typing"
            ? "Isolated review · Typing"
            : focus === "mcq"
              ? "Isolated review · Combined MCQ"
              : focus === "listening"
                ? "Isolated review · Listening"
                : isolated
                  ? `Isolated review · ${focus}`
                  : "Full sitting"}
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          {focus === "typing"
            ? "Typing only — real passage, locked 120s timer, real section score. No MCQ, listening, or chat."
            : focus === "mcq"
              ? `Combined MCQ only — ${MCQ_EXAM_COUNT} items (HIPAA + clinical + trivia), 20-minute lock. No typing, listening, or chat.`
              : focus === "listening"
                ? "Play one patient voicemail, then write one provider message. Prototype — draft content; not an official score yet."
                : "Typing → Combined MCQ → Listening → typed chat → spoken chat. Human-reviewed; not a certification or employment decision."}
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
            <li>Stops after this section — you will not be pushed into MCQ</li>
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

      {phase === "orient" && focus === "mcq" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p className="font-semibold text-[var(--siya-primary)]">What you are reviewing</p>
          <ul className="list-disc space-y-1 pl-4 text-[var(--siya-text)]">
            <li>
              {MCQ_EXAM_COUNT} items — HIPAA live bank + clinical-knowledge draft + culture/trivia draft (target mix 20 /
              10 / 10)
            </li>
            <li>Locked 20-minute timer — starts when you begin this section</li>
            <li>Section score: percent correct (unanswered = incorrect); weight {EXAM_WEIGHTS.mcq} pts in composite</li>
            <li>Ephemeral review seen-set only — does not write the official exam seen-set or feed a full sitting</li>
            <li>Stops after this section — you will not be pushed into Listening or chat</li>
          </ul>
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Content status: HIPAA items are live; clinical and trivia pools remain <strong>draft</strong> until
            reviewers clear them.
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I am reviewing Combined MCQ in isolation for sign-off.</span>
          </label>
          <button
            type="button"
            disabled={!ack}
            onClick={begin}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Start MCQ section
          </button>
        </div>
      ) : null}

      {phase === "orient" && focus === "listening" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p className="font-semibold text-[var(--siya-primary)]">Before you start</p>
          <div className="space-y-2 text-[var(--siya-text)]">
            <p>This is a practice Listening exercise for the MA competency exam.</p>
            <p>
              You&apos;ll hear one patient voicemail (fixed recording). Then write one{" "}
              <strong>message to the provider</strong> with a clear ask — as if you already tried calling the patient
              back and they did not answer. You have 10 minutes.
            </p>
            <p>
              Prototype content — still under clinical review. Your answer here won&apos;t count toward anything
              official yet.
            </p>
            <p className="text-xs text-[var(--siya-text-secondary)]">
              Use headphones if you can. Replay is allowed. Type your answer yourself. Placeholder names only (John Doe
              / Jane Doe / James Doe).
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
            Start listening section
          </button>
        </div>
      ) : null}

      {phase === "orient" && !focus ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>Sections are sequential and locked. You cannot return to a prior section. A short review appears before you continue.</p>
          <ul className="list-disc pl-4 text-[var(--siya-text)]">
            <li>Typing — 2 minutes, one passage ({EXAM_WEIGHTS.typing} pts)</li>
            <li>
              Combined MCQ — {MCQ_EXAM_COUNT} items, 20 minutes ({EXAM_WEIGHTS.mcq} pts)
            </li>
            <li>Listening — voicemail → provider message, 10 minutes ({EXAM_WEIGHTS.listening} pts)</li>
            <li>Chat simulator (typed) — up to 6 replies ({EXAM_WEIGHTS["chat-sim-typed"]} pts)</li>
            <li>Chat simulator (spoken) — up to 6 replies ({EXAM_WEIGHTS["chat-sim-spoken"]} pts)</li>
          </ul>
          <p>A person reviews the report. It does not decide employment, pay, or certification.</p>
          <p className="text-xs">
            Prefer section-by-section review? Open{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=typing">
              Typing
            </a>
            ,{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=mcq">
              MCQ
            </a>
            , or{" "}
            <a
              className="font-semibold text-[var(--siya-accent)] underline"
              href="/learn/competency-exam?section=listening"
            >
              Listening
            </a>
            .
          </p>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
            <span>I understand this is a human-reviewed exam sitting, not a certification or employment decision.</span>
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

      {phase === "orient" && isolated && focus !== "typing" && focus !== "mcq" && focus !== "listening" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>
            Isolated review for <strong>{focus}</strong> is not wired yet. Try Typing, MCQ, or Listening.
          </p>
          {reviewNote ? <p className="text-xs text-[var(--siya-text-secondary)]">{reviewNote}</p> : null}
          <a
            href="/learn/competency-exam?section=listening"
            className="inline-block rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Open Listening review
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

      {phase === "section-done" && lastSection && (focus === "typing" || focus === "mcq" || focus === "listening") ? (
        <SectionDoneCard
          section={lastSection}
          rawTyping={focus === "typing" ? typingRaw : null}
          attemptId={attemptId}
          onAgain={
            focus === "typing" ? beginTypingOnly : focus === "mcq" ? beginMcqOnly : beginListeningOnly
          }
          itemResults={focus === "mcq" ? itemResults : null}
          writingTrail={focus === "listening" ? listeningTrail : null}
        />
      ) : null}

      {phase === "mcq" && mcqQs.length ? (
        <div className="space-y-3" key={mcqKey}>
          {focus === "mcq" ? (
            <p className="text-xs font-semibold text-[var(--siya-accent)]">
              Isolated · Combined MCQ — finish or wait for the 20-minute lock · attempt <code>{attemptId}</code>
            </p>
          ) : null}
          <p className="text-sm font-semibold">
            Combined MCQ · {fmt(mcqLeft)} left · {mcqQs.length} items
            <span className="sr-only"> (same remaining seconds as the fixed countdown)</span>
          </p>
          {mcqMix ? (
            <p className="text-xs text-[var(--siya-text-secondary)]">
              Drawn mix: HIPAA {mcqMix.hipaa} · clinical {mcqMix.clinical} · trivia {mcqMix.trivia}
              {mcqDraftPools.length ? ` · draft pools: ${mcqDraftPools.join(", ")}` : ""}
            </p>
          ) : null}
          {mcqRepeated.length ? (
            <p className="text-xs font-semibold">Repeat items — not a fresh measure: {mcqRepeated.join(", ")}</p>
          ) : null}
          <ol className="space-y-3">
            {mcqQs.map((q, i) => (
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
                        checked={mcqAnswers[q.id] === opt.key}
                        onChange={() => setMcqAnswers((prev) => ({ ...prev, [q.id]: opt.key }))}
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
          <button type="button" onClick={submitMcq} className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white">
            {focus === "mcq" ? "Submit MCQ review" : "Submit MCQ section"}
          </button>
        </div>
      ) : null}

      {phase === "listening" && listeningPrompt ? (
        <div className="space-y-3" key={listeningKey}>
          {focus === "listening" ? (
            <p className="text-xs font-semibold text-[var(--siya-accent)]">
              Isolated · Listening — finish or wait for the 10-minute lock · attempt <code>{attemptId}</code>
            </p>
          ) : null}
          <p className="text-sm font-semibold">
            Listening · {fmt(listeningLeft)} left
            <span className="sr-only"> (same remaining seconds as the fixed countdown)</span>
          </p>
          <p className="text-xs font-semibold">Prototype voicemail scenario — still under review. Not used for an official score yet.</p>
          {listeningPrompt.repeated ? <p className="text-xs font-semibold">Repeat prompt — not a fresh measure.</p> : null}
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Scenario: <strong>{listeningPrompt.title}</strong> · id <code>{listeningPrompt.id}</code>
          </p>
          <div className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] p-3">
            <p className="text-xs font-semibold text-[var(--siya-primary)]">1. Play the voicemail</p>
            <audio
              controls
              preload="metadata"
              src={listeningPrompt.audioSrc}
              className="w-full"
              data-listening-voicemail="true"
            >
              Your browser does not support audio playback.
            </audio>
            <details className="text-xs text-[var(--siya-text-secondary)]">
              <summary className="cursor-pointer font-semibold">Transcript (accessibility)</summary>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">{listeningPrompt.voicemailScript}</p>
            </details>
          </div>
          <p className="text-sm">{listeningPrompt.scenario}</p>
          <p className="text-[11px] text-[var(--siya-text-muted)]">
            Type your provider message. Voice dictation isn&apos;t available on this exercise. Use facts only — no
            judgment labels. Placeholder names (John / Jane / James Doe) are OK.
          </p>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--siya-primary)]" htmlFor="listening-provider-message">
              2. Message to provider
            </label>
            <p className="rounded-lg bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs text-[var(--siya-text)]">
              Write the message you would send the provider after an unsuccessful callback attempt — clear ask, MA
              scope only.
            </p>
            <p className="text-xs text-[var(--siya-text-secondary)]">{listeningPrompt.providerMessageHint}</p>
            <textarea
              id="listening-provider-message"
              value={providerMessage}
              onChange={(e) => setProviderMessage(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-[var(--siya-border)] p-3 text-sm"
              placeholder="Type the message you'd actually send the provider…"
              data-no-voice-input="true"
            />
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitListening()}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Scoring…" : focus === "listening" ? "Submit listening review" : "Submit listening"}
          </button>
        </div>
      ) : null}

      {(phase === "chat-typed" || phase === "chat-spoken") && activeChatBrief && persona && activeChatModality && !isolated ? (
        <div className="space-y-2" key={`${chatKey}-${activeChatModality}`}>
          <p className="text-xs font-semibold">
            DRAFT brief — pending Sonu review. {activeChatBrief.title} · {activeChatModality} lane
          </p>
          {activeChatBrief.repeated ? <p className="text-xs font-semibold">Repeat brief — not a fresh measure.</p> : null}
          <p className="text-xs text-[var(--siya-text-secondary)]">
            Exam chat wall clock · {fmt(chatLeft)} left (same clock as the fixed timer) · 6-reply turn cap also applies
          </p>
          <div className="h-[70vh] min-h-[28rem] overflow-hidden rounded-2xl border border-[var(--siya-border)]">
            <PatientChatSimulator
              examMode={{
                persona,
                opening: activeChatBrief.opening,
                briefId: activeChatBrief.id,
                maxTurns: 6,
                forceComplete: chatForceEnd,
                inputModality: activeChatModality,
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
