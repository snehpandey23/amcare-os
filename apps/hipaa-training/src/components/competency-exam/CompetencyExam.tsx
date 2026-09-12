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
import { loadSeen, saveAttempt, saveSeen, saveIsolatedReview, type IsolatedReviewItemResult } from "@/lib/competency-exam/storage";
import type { ExamReportModel, SafetyFlag, SectionResult } from "@/lib/competency-exam/types";
import { blendWritingScore, scoreWritingDeterministic } from "@/lib/competency-exam/writing-score";
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
}: {
  section: SectionResult;
  rawTyping?: TypingScore | null;
  attemptId: string;
  onAgain: () => void;
  itemResults?: IsolatedReviewItemResult[] | null;
}) {
  const next =
    section.id === "typing"
      ? { href: "/learn/competency-exam?section=hipaa", label: "Open HIPAA review" }
      : section.id === "hipaa"
        ? null
        : null;
  const closeout =
    section.id === "typing"
      ? "This run does not continue into other sections. Typing is signed off — open HIPAA next when ready."
      : section.id === "hipaa"
        ? "This run does not continue into other sections. Sign off in chat when HIPAA looks good, then we open Writing. Item-level results are saved in this browser for audit."
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
  const [writingPrompt, setWritingPrompt] = useState<{ id: string; title: string; prompt: string; repeated: boolean } | null>(null);
  const [writingText, setWritingText] = useState("");
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
  const [itemResults, setItemResults] = useState<IsolatedReviewItemResult[] | null>(null);

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
    setWritingText("");
    setChatBrief(null);
    setReviewNote("");
    setBusy(false);
    setItemResults(null);
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

  const begin = () => {
    if (focus === "typing") {
      beginTypingOnly();
      return;
    }
    if (focus === "hipaa") {
      beginHipaaOnly();
      return;
    }
    if (isolated) {
      setReviewNote(`Isolated review for “${focus}” is not opened yet — finish HIPAA sign-off first.`);
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
    setWritingText("");
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
    if (wp) setWritingPrompt({ id: wp.id, title: wp.title, prompt: wp.prompt, repeated: writing.repeatedIds.includes(wp.id) });
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
    const det = scoreWritingDeterministic(writingText);
    let llm: number | null = null;
    let llmNote = "";
    try {
      const res = await fetch("/api/competency-exam/estimate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ prompt: writingPrompt.prompt, text: writingText }),
      });
      const data = (await res.json().catch(() => ({}))) as { estimate?: number | null; note?: string };
      llm = typeof data.estimate === "number" ? data.estimate : null;
      llmNote = data.note || "";
    } catch {
      llm = null;
      llmNote = "LLM estimate unavailable.";
    }
    const blended = blendWritingScore(det.score, llm);
    remember("writing", [writingPrompt.id], writingPrompt.repeated ? [writingPrompt.id] : [], attemptId);
    pushSection({
      id: "writing",
      label: SECTION_LABEL.writing,
      weight: EXAM_WEIGHTS.writing,
      status: "scored",
      score: blended.score,
      note: `${blended.note} ${llmNote}`.trim(),
      itemIds: [writingPrompt.id],
      repeatedIds: writingPrompt.repeated ? [writingPrompt.id] : [],
      draftContent: true,
      detail: `${det.wordCount} words · grammar ${det.grammarScore}${llm == null ? " · no LLM estimate" : ` · LLM estimate ${llm}`}`,
    });
    setBusy(false);
    setReviewNote(`Writing recorded at ${blended.score}/100. Prompt is a draft pending Sonu review.`);
    setPhase("review");
  }, [busy, phase, token, writingPrompt, writingText]);

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
              : isolated
                ? `Isolated review · ${focus}`
                : "Partial sitting"}
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text)]">
          {focus === "typing"
            ? "Typing only — real passage, locked 120s timer, real section score. No HIPAA, writing, or chat."
            : focus === "hipaa"
              ? "HIPAA only — 20 items, 12-minute lock, separate draw from certification. No typing, writing, or chat."
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
            Prefer section-by-section review? Typing is signed off — open{" "}
            <a className="font-semibold text-[var(--siya-accent)] underline" href="/learn/competency-exam?section=hipaa">
              HIPAA only
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

      {phase === "orient" && isolated && focus !== "typing" && focus !== "hipaa" ? (
        <div className="space-y-3 rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-sm">
          <p>
            Isolated review for <strong>{focus}</strong> is queued after HIPAA sign-off. Open HIPAA first.
          </p>
          {reviewNote ? <p className="text-xs text-[var(--siya-text-secondary)]">{reviewNote}</p> : null}
          <a
            href="/learn/competency-exam?section=hipaa"
            className="inline-block rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
          >
            Go to HIPAA review
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

      {phase === "section-done" && lastSection && (focus === "typing" || focus === "hipaa") ? (
        <SectionDoneCard
          section={lastSection}
          rawTyping={focus === "typing" ? typingRaw : null}
          attemptId={attemptId}
          onAgain={focus === "typing" ? beginTypingOnly : beginHipaaOnly}
          itemResults={focus === "hipaa" ? itemResults : null}
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

      {phase === "writing" && writingPrompt && !isolated ? (
        <div className="space-y-3">
          <p className="text-sm font-semibold">Writing · {fmt(writingLeft)} left</p>
          <p className="text-xs font-semibold">DRAFT — pending Sonu review. Not an approved official prompt.</p>
          {writingPrompt.repeated ? <p className="text-xs font-semibold">Repeat prompt — not a fresh measure.</p> : null}
          <p className="text-sm">{writingPrompt.prompt}</p>
          <textarea
            value={writingText}
            onChange={(e) => setWritingText(e.target.value)}
            rows={8}
            className="w-full rounded-xl border border-[var(--siya-border)] p-3 text-sm"
            placeholder="Write the chart note and the patient reply…"
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => void submitWriting()}
            className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Scoring…" : "Submit writing"}
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
