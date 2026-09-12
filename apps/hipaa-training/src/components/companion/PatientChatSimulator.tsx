"use client";

/**
 * Patient Chat Simulator — standalone Learn tool (Ask-like chat UI).
 * Tiered safety: walk-away · red-flag hard stop · moderate soft stop · in-bounds.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  getPersonaShortId,
  listStaffSelectablePersonas,
  type Persona,
} from "@/data/patient-drill/personas";
import { evaluateSimulatorSession, type SimulatorFeedback } from "@/lib/patient-drill/evaluate";
import {
  EMPTY_REPLY_FALLBACK,
  SCREENING_AS_DIAGNOSIS_LABEL,
  classifyCompletedSession,
  type SafetyReasonCode,
  type SessionOutcome,
} from "@/lib/patient-drill/safety";
import {
  buildChatSimTranscript,
  markDailyComplete,
  type ChatSimTranscriptTurn,
} from "@/lib/level-up/progress";
import {
  portalAskInput,
  portalAskSendBtn,
  portalCard,
  portalH1,
  portalLinkBack,
} from "@/lib/portal-ui";
import { CONCLUDE_OFFER_AFTER_TURNS, MAX_MA_TURNS } from "@/lib/patient-drill/session-bounds";

type Phase = "pick" | "chat" | "summary";
type Line = { who: "you" | string; text: string; startedAt?: number; sentAt?: number };

type ApiStopPayload = {
  stop?: boolean;
  kind?: "red_flag" | "soft_stop" | "walk_away" | "frustrated_exit";
  redFlagged?: boolean;
  reasons?: SafetyReasonCode[];
  breakTitle?: string;
  breakBody?: string;
  patientReply?: string;
  warn?: string;
  outcome?: SessionOutcome;
};

type CustomDraft = {
  name: string;
  shortLabel: string;
  demographicSnapshot: string;
  backstory: string;
  openingMessage: string;
  hiddenContext: string;
};

function emptyCustom(): CustomDraft {
  return {
    name: "",
    shortLabel: "",
    demographicSnapshot: "",
    backstory: "",
    openingMessage: "Hi — I need help with my appointment today.",
    hiddenContext: "",
  };
}

function buildCustomPersona(draft: CustomDraft): Persona {
  const id = `custom-${Date.now()}`;
  return {
    id,
    name: draft.name.trim(),
    archetype: "Custom patient",
    shortLabel: draft.shortLabel.trim() || "Custom",
    demographicSnapshot: draft.demographicSnapshot.trim() || "Custom training persona.",
    backstory: draft.backstory.trim(),
    frustrationTriggers: [],
    communicationPreferences: {
      whatLands: ["Clear, specific answers"],
      whatDoesnt: ["Vague timelines", "Corporate speak"],
    },
    hiddenContext: draft.hiddenContext.trim(),
    commonMistakes: [],
    assessmentRubric: [],
    openingMessage: draft.openingMessage.trim() || "Hi — I need help with my appointment today.",
    responsePools: { frustrated: [], calm: [], seekingClarity: [], neutral: [] },
  };
}

function linesToHistory(lines: Line[]): Array<{ role: "user" | "assistant"; content: string }> {
  return lines.map((l) => ({
    role: (l.who === "you" ? "user" : "assistant") as "user" | "assistant",
    content: l.text,
  }));
}

function grammarKindLabel(kind: string): string {
  switch (kind) {
    case "subject_verb_disagreement":
      return "subject–verb disagreement";
    case "wrong_word_or_typo":
      return "wrong word / typo";
    case "garbled_or_unclear":
      return "unclear wording";
    case "wrong_tense":
      return "wrong verb tense";
    case "empty":
      return "empty message";
    // Legacy labels (should not appear after chat-register fix)
    case "double_space":
      return "double spaces (formatting — ignored)";
    case "missing_end_punctuation":
      return "missing end punctuation (formatting — ignored)";
    case "missing_capital":
      return "missing capital (formatting — ignored)";
    default:
      return kind;
  }
}

export function PatientChatSimulator({
  examMode,
}: {
  /** Competency exam — locked brief, turn cap, no practice XP. */
  examMode?: {
    persona: Persona;
    opening: string;
    briefId: string;
    maxTurns?: number;
    /** When true, end the chat using the same finishSession path as turn-cap (exam wall clock). */
    forceComplete?: boolean;
    onComplete: (feedback: SimulatorFeedback) => void;
  };
} = {}) {
  const { token } = useAuth();
  const turnCap = examMode?.maxTurns ?? MAX_MA_TURNS;
  const examDoneRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("pick");
  const [persona, setPersona] = useState<Persona | null>(null);
  const [showCustom, setShowCustom] = useState(false);
  const [custom, setCustom] = useState<CustomDraft>(emptyCustom);
  const [messages, setMessages] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [liveOk, setLiveOk] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<SimulatorFeedback | null>(null);
  const [endReason, setEndReason] = useState<string>("");
  const [breakBanner, setBreakBanner] = useState<{ title: string; body: string } | null>(null);
  const [savedTranscript, setSavedTranscript] = useState<ChatSimTranscriptTurn[]>([]);
  const [showTranscript, setShowTranscript] = useState(false);
  /** Hide conclude offer until the next completed exchange. */
  const [concludeDismissedAtTurn, setConcludeDismissedAtTurn] = useState(0);
  const typingStartRef = useRef<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const awardedRef = useRef(false);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;
  const personaRef = useRef(persona);
  personaRef.current = persona;

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/practice/patient-chat");
        const data = (await res.json().catch(() => ({}))) as { ok?: boolean };
        if (!cancelled) setLiveOk(Boolean(res.ok && data.ok));
      } catch {
        if (!cancelled) setLiveOk(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const maTurns = messages.filter((m) => m.who === "you").length;
  const lastLine = messages[messages.length - 1];
  const patientReplied = Boolean(lastLine && lastLine.who !== "you" && lastLine.text.trim());
  const offerConclude =
    phase === "chat" &&
    !streaming &&
    maTurns >= CONCLUDE_OFFER_AFTER_TURNS &&
    patientReplied &&
    concludeDismissedAtTurn < maTurns;

  const finishSession = useCallback(
    (
      reason: string,
      opts?: {
        outcome?: SimulatorFeedback["outcome"];
        redFlagged?: boolean;
        safetyReasons?: SafetyReasonCode[];
        safetyNotes?: string[];
        breakTitle?: string;
        breakBody?: string;
        lines?: Line[];
      },
    ) => {
      if (phaseRef.current !== "chat") return;
      const lines = opts?.lines ?? messagesRef.current;
      const history = linesToHistory(lines);
      const classified = classifyCompletedSession({ history });
      const outcome = opts?.outcome ?? classified.outcome;
      const redFlagged = opts?.redFlagged ?? classified.redFlagged;
      const safetyReasons = opts?.safetyReasons ?? classified.reasons;
      const safetyNotes = opts?.safetyNotes ?? classified.notes;

      const fb = evaluateSimulatorSession(lines, {
        outcome,
        redFlagged,
        safetyReasons,
        safetyNotes,
      });
      const transcript = buildChatSimTranscript(lines);
      setSavedTranscript(transcript);
      setShowTranscript(false);
      setFeedback(fb);
      setEndReason(reason);
      if (opts?.breakTitle) {
        setBreakBanner({ title: opts.breakTitle, body: opts.breakBody || "" });
      } else if (outcome === "red_flag") {
        setBreakBanner({
          title: "Wrong track — red flag",
          body: safetyNotes[0] || "This session was flagged for Ops review.",
        });
      } else if (outcome === "soft_stop") {
        setBreakBanner({
          title: "Safety-net language missing",
          body: safetyNotes[0] || "Escalate-if-worse guidance was required.",
        });
      } else if (outcome === "walk_away") {
        setBreakBanner({
          title: "Patient signed off",
          body: safetyNotes[0] || "Tone caused the patient to disengage.",
        });
      } else if (outcome === "patient_left_frustrated") {
        setBreakBanner({
          title: "Patient left frustrated",
          body:
            safetyNotes[0] ||
            "Under escalating stress (T2) after vague replies — not an abuse / walk-away stop.",
        });
      } else {
        setBreakBanner(null);
      }
      setPhase("summary");
      setStreaming(false);

      if (examMode) {
        if (!examDoneRef.current) {
          examDoneRef.current = true;
          examMode.onComplete(fb);
        }
      } else if (!awardedRef.current && (fb.messageCount > 0 || transcript.length > 0)) {
        awardedRef.current = true;
        const p = personaRef.current;
        markDailyComplete("patientChat", {
          chatSim: {
            personaId: p?.id,
            personaName: p?.name,
            outcome,
            redFlagged,
            safetyReasons,
            politenessScore: fb.politenessScore,
            grammarScore: fb.grammarScore,
            relevanceScore: fb.relevanceScore,
            transcript,
            endReason: reason,
            transcriptVersion: 1,
          },
        });
        window.dispatchEvent(new Event("siya-level-up-updated"));
      }
    },
    [examMode],
  );

  const startWithPersona = (p: Persona) => {
    awardedRef.current = false;
    setPersona(p);
    setMessages([{ who: p.name, text: p.openingMessage }]);
    setInput("");
    setError(null);
    setFeedback(null);
    setBreakBanner(null);
    setSavedTranscript([]);
    setShowTranscript(false);
    setConcludeDismissedAtTurn(0);
    setPhase("chat");
  };

  const examStartedRef = useRef(false);
  useEffect(() => {
    if (!examMode || examStartedRef.current) return;
    examStartedRef.current = true;
    const locked = { ...examMode.persona, openingMessage: examMode.opening };
    awardedRef.current = false;
    setPersona(locked);
    setMessages([{ who: locked.name, text: locked.openingMessage }]);
    setInput("");
    setError(null);
    setFeedback(null);
    setBreakBanner(null);
    setSavedTranscript([]);
    setShowTranscript(false);
    setConcludeDismissedAtTurn(0);
    setPhase("chat");
  }, [examMode]);

  // Exam wall-clock (owned by CompetencyExam) — same finishSession as turn-cap, not a parallel score path.
  useEffect(() => {
    if (!examMode?.forceComplete) return;
    if (phaseRef.current !== "chat" || examDoneRef.current) return;
    finishSession("Exam time limit reached.", {
      breakTitle: "Time’s up",
      breakBody: "The exam chat timer ended this section.",
    });
  }, [examMode?.forceComplete, finishSession]);

  const startCustom = () => {
    if (custom.name.trim().length < 2 || custom.backstory.trim().length < 20) {
      setError("Name and a short “why they’re here” (at least ~20 characters) are required.");
      return;
    }
    setError(null);
    startWithPersona(buildCustomPersona(custom));
  };

  const applyStop = (payload: ApiStopPayload, lines: Line[], patientName: string) => {
    const reply = (payload.patientReply || "").trim() || EMPTY_REPLY_FALLBACK;
    const withPatient = [...lines, { who: patientName, text: reply }];
    setMessages(withPatient);
    const kind = payload.kind || "red_flag";
    const outcome: SessionOutcome =
      payload.outcome ||
      (kind === "red_flag"
        ? "red_flag"
        : kind === "soft_stop"
          ? "soft_stop"
          : kind === "frustrated_exit"
            ? "patient_left_frustrated"
            : "walk_away");
    finishSession(payload.breakTitle || "Session ended", {
      outcome,
      redFlagged: Boolean(payload.redFlagged ?? kind === "red_flag"),
      safetyReasons: payload.reasons || [],
      safetyNotes: [payload.breakBody || ""].filter(Boolean),
      breakTitle: payload.breakTitle,
      breakBody: payload.breakBody,
      lines: withPatient,
    });
  };

  const send = async () => {
    const text = input.trim();
    if (!text || text.length < 3 || !persona || streaming || phase !== "chat") return;
    if (!token) {
      setError("Sign in to use the chat simulator.");
      return;
    }
    if (liveOk === false) {
      setError("Live chat is offline right now. Try again in a moment.");
      return;
    }
    if (maTurns >= turnCap) {
      finishSession(`Reached ${turnCap} replies.`);
      return;
    }

    const startedTyping = typingStartRef.current ?? Date.now();
    const sentAt = Date.now();
    typingStartRef.current = null;
    const next: Line[] = [...messages, { who: "you", text, startedAt: startedTyping, sentAt }];
    setMessages(next);
    setInput("");
    setStreaming(true);
    setError(null);

    const history = linesToHistory(next);
    const body: Record<string, unknown> = {
      content: text,
      messages: history,
    };
    if (persona.id.startsWith("custom-")) {
      body.customPersona = persona;
    } else {
      body.personaId = getPersonaShortId(persona);
    }
    if (examMode) {
      body.examBrief = examMode.opening;
    }

    try {
      const res = await fetch("/api/practice/patient-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        const payload = (await res.json().catch(() => ({}))) as ApiStopPayload & {
          error?: string;
          patientReply?: string;
        };
        if (!res.ok) {
          throw new Error(payload.error || `Chat failed (${res.status})`);
        }
        if (payload.stop) {
          applyStop(payload, next, persona.name);
          return;
        }
        const fallback = (payload.patientReply || EMPTY_REPLY_FALLBACK).trim();
        setMessages([...next, { who: persona.name, text: fallback }]);
        const via = (payload as { via?: string }).via;
        // Pool/offline reply kept the drill going — don't flash Gateway failure as a hard error.
        if (payload.warn && via !== "persona-pool" && via !== "llm") setError(payload.warn);
        else if (next.filter((m) => m.who === "you").length >= turnCap) {
          finishSession(`Reached ${turnCap} replies.`, {
            lines: [...next, { who: persona.name, text: fallback }],
          });
        }
        return;
      }

      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(err.error || `Chat failed (${res.status})`);
      }

      setMessages((prev) => [...prev, { who: persona.name, text: "" }]);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;
        full += chunk;
        const snapshot = full;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.who === persona.name) {
            copy[copy.length - 1] = { ...last, text: snapshot };
          }
          return copy;
        });
      }

      const finalText = full.trim() || EMPTY_REPLY_FALLBACK;
      if (!full.trim()) {
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.who === persona.name) {
            copy[copy.length - 1] = { ...last, text: EMPTY_REPLY_FALLBACK };
          }
          return copy;
        });
      }

      const withReply = [...next, { who: persona.name, text: finalText }];
      if (next.filter((m) => m.who === "you").length >= turnCap) {
        finishSession(`Reached ${turnCap} replies.`, { lines: withReply });
      }
    } catch (err) {
      // Never leave a blank patient bubble — inject fallback and keep going.
      const fallbackLine = { who: persona.name, text: EMPTY_REPLY_FALLBACK };
      setMessages([...next, fallbackLine]);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setStreaming(false);
    }
  };

  const resetToPick = () => {
    setPhase("pick");
    setPersona(null);
    setMessages([]);
    setFeedback(null);
    setBreakBanner(null);
    setSavedTranscript([]);
    setShowTranscript(false);
    setConcludeDismissedAtTurn(0);
    setError(null);
    setShowCustom(false);
  };

  if (phase === "pick" && examMode) {
    return (
      <div className="p-6 text-sm text-[var(--siya-text)]">Starting exam chat…</div>
    );
  }

  if (phase === "pick") {
    return (
      <div className="mx-auto flex h-full max-w-3xl flex-col gap-6 overflow-y-auto p-4 sm:p-6">
        <div>
          <Link href="/learn" className={portalLinkBack}>
            ← Learn
          </Link>
          <h1 className={`mt-3 ${portalH1}`}>Chat simulator</h1>
          <p className="mt-2 text-sm text-[var(--siya-text)]">
            Practice a live patient conversation. Choose a persona to get started — same AI as Ask, used here only as a
            training patient.
          </p>
          <p className="mt-2 text-sm text-[var(--siya-text)]">
            Sessions run up to <strong>{MAX_MA_TURNS} of your replies</strong> (no clock cutoff). After{" "}
            <strong>{CONCLUDE_OFFER_AFTER_TURNS} exchanges</strong> you can conclude and see feedback, or keep going. End early anytime for
            feedback. Safety tiers may end a session early (red flag, soft stop, or patient walk-away). Vague replies can
            also escalate stressed personas until they leave frustrated (not the same as abuse).
          </p>
          <span
            className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              liveOk === true
                ? "bg-[var(--siya-status-success-bg)] text-[var(--siya-status-success-text)]"
                : liveOk === false
                  ? "bg-[var(--siya-status-error-bg)] text-[var(--siya-status-error-text)]"
                  : "bg-[var(--siya-bg-subtle)] text-[var(--siya-text-secondary)]"
            }`}
          >
            {liveOk === true ? "LIVE" : liveOk === false ? "Offline" : "Checking…"}
          </span>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-[var(--siya-primary)]">Choose a persona</h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {listStaffSelectablePersonas().map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => startWithPersona(p)}
                  className="w-full rounded-2xl border border-[var(--siya-primary)] bg-[var(--siya-btn-primary)] p-4 text-left text-white shadow-sm transition hover:bg-[var(--siya-btn-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--siya-accent)]"
                >
                  <p className="text-base font-semibold text-white">{p.name}</p>
                  <p className="mt-1 text-xs font-semibold text-white">{p.shortLabel}</p>
                  <p className="mt-2 line-clamp-2 text-[11px] font-medium leading-relaxed text-white">
                    {p.demographicSnapshot}
                  </p>
                  {p.tierPolicy === "allows_t2" ? (
                    <p className="mt-2 text-[10px] font-medium text-white/90">Response-driven stress escalation</p>
                  ) : null}
                  <span className="mt-3 inline-block text-xs font-bold text-white underline underline-offset-2">
                    Start chat →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={portalCard}>
          <button
            type="button"
            className="text-sm font-semibold text-[var(--siya-accent)] hover:underline"
            onClick={() => setShowCustom((v) => !v)}
          >
            {showCustom ? "Hide custom persona" : "Create your own…"}
          </button>
          {showCustom ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-[var(--siya-text-secondary)]">
                Describe the patient in plain language. Used for this session only (not saved to the catalog yet).
              </p>
              <label className="block text-xs font-semibold text-[var(--siya-text)]">
                Name
                <input
                  className={`mt-1 w-full ${portalAskInput}`}
                  value={custom.name}
                  onChange={(e) => setCustom((c) => ({ ...c, name: e.target.value }))}
                  placeholder="e.g. Alex"
                />
              </label>
              <label className="block text-xs font-semibold text-[var(--siya-text)]">
                Short label
                <input
                  className={`mt-1 w-full ${portalAskInput}`}
                  value={custom.shortLabel}
                  onChange={(e) => setCustom((c) => ({ ...c, shortLabel: e.target.value }))}
                  placeholder="e.g. Parent, first visit, worried about cost"
                />
              </label>
              <label className="block text-xs font-semibold text-[var(--siya-text)]">
                Why they’re here (required)
                <textarea
                  className={`mt-1 min-h-[88px] w-full ${portalAskInput}`}
                  value={custom.backstory}
                  onChange={(e) => setCustom((c) => ({ ...c, backstory: e.target.value }))}
                  placeholder="What’s going on, what they expect, what frustrates them…"
                />
              </label>
              <label className="block text-xs font-semibold text-[var(--siya-text)]">
                Opening line (what they say first)
                <input
                  className={`mt-1 w-full ${portalAskInput}`}
                  value={custom.openingMessage}
                  onChange={(e) => setCustom((c) => ({ ...c, openingMessage: e.target.value }))}
                />
              </label>
              {error ? <p className="text-xs text-[var(--siya-status-error-text)]">{error}</p> : null}
              <button
                type="button"
                onClick={startCustom}
                className={portalAskSendBtn}
                disabled={!token || liveOk === false}
              >
                Start chat with custom patient
              </button>
            </div>
          ) : null}
        </div>

        {!token ? (
          <p className="text-sm text-[var(--siya-status-error-text)]">Sign in to start a live simulator session.</p>
        ) : null}
      </div>
    );
  }

  if (phase === "summary" && feedback) {
    return (
      <div className="mx-auto flex h-full max-w-lg flex-col gap-4 overflow-y-auto p-4 sm:p-6">
        <Link href="/learn" className={portalLinkBack}>
          ← Learn
        </Link>
        <h1 className={portalH1}>Session feedback</h1>
        <p className="text-sm text-[var(--siya-text)]">{endReason}</p>

        {breakBanner ? (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              feedback.redFlagged
                ? "border-[var(--siya-status-error-text)] bg-[var(--siya-status-error-bg)] text-[var(--siya-status-error-text)]"
                : feedback.outcome === "soft_stop" ||
                    feedback.outcome === "walk_away" ||
                    feedback.outcome === "patient_left_frustrated"
                  ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)] text-[var(--siya-text)]"
                  : "border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]"
            }`}
          >
            <p className="font-semibold">{breakBanner.title}</p>
            {breakBanner.body ? <p className="mt-1 text-sm opacity-90">{breakBanner.body}</p> : null}
            {feedback.redFlagged ? (
              <p className="mt-2 text-xs font-medium">Flagged for Ops review (saved to your practice ledger).</p>
            ) : null}
          </div>
        ) : null}

        <div className={`${portalCard} space-y-2 text-sm`}>
          <p>
            <strong>Outcome:</strong> {feedback.outcome}
            {feedback.redFlagged ? " · red-flagged" : ""}
          </p>
          <p>
            <strong>Your replies:</strong> {feedback.messageCount}
          </p>
          <p>
            <strong>Grammar / clarity (chat register):</strong> {feedback.grammarScore}/100
            {feedback.grammarErrorCount > 0 ? ` (${feedback.grammarErrorCount} flagged)` : ""}
          </p>
          <p className="text-sm text-[var(--siya-text)]">{feedback.grammarNote}</p>
          {feedback.grammarIssues.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--siya-text)]">
              {feedback.grammarIssues.slice(0, 6).map((g) => (
                <li key={`${g.messageIndex}-${g.excerpt}`}>
                  Reply {g.messageIndex + 1}: {g.kinds.map(grammarKindLabel).join(", ")}
                  {g.detail ? ` — ${g.detail}` : ""}
                  {g.excerpt ? ` (“${g.excerpt}${g.excerpt.length >= 80 ? "…" : ""}”)` : ""}
                </li>
              ))}
            </ul>
          ) : null}
          <p>
            <strong>Politeness:</strong> {feedback.politenessScore}/100
          </p>
          <p className="text-sm text-[var(--siya-text)]">{feedback.politenessNote}</p>
          {feedback.clinicalAccuracyHits.length > 0 ? (
            <div className="rounded-lg border border-[var(--siya-status-warn-border)] bg-[var(--siya-status-warn-bg)] px-3 py-2 text-sm text-[var(--siya-status-warn-text)]">
              <p className="font-semibold">{SCREENING_AS_DIAGNOSIS_LABEL}</p>
              <p className="mt-1 text-xs">
                A free or preliminary screening can be a first step. It does not diagnose, and it is not enough
                for a diagnosis. This is a clinical-accuracy miss — not an off-topic score, and not a session stop.
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                {feedback.clinicalAccuracyHits.map((h) => (
                  <li key={`clin-${h.replyIndex}-${h.replyExcerpt}`}>
                    Reply {h.replyIndex + 1}
                    {h.replyExcerpt ? ` — “${h.replyExcerpt}${h.replyExcerpt.length >= 120 ? "…" : ""}”` : ""}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          <p>
            <strong>Relevance / engagement:</strong> {feedback.relevanceScore}/100
          </p>
          <p className="text-sm text-[var(--siya-text)]">{feedback.relevanceNote}</p>
          {feedback.relevanceTurns.some(
            (t, i) => t.score < 0.5 && !feedback.clinicalAccuracyHits.some((h) => h.replyIndex === i),
          ) ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--siya-text)]">
              {feedback.relevanceTurns
                .map((t, i) => ({ t, i }))
                .filter(
                  ({ t, i }) =>
                    t.score < 0.5 && !feedback.clinicalAccuracyHits.some((h) => h.replyIndex === i),
                )
                .slice(0, 4)
                .map(({ t, i }) => (
                  <li key={`rel-${i}-${t.replyExcerpt}`}>
                    Reply {i + 1} ({t.askType}): {t.reason}
                    {t.replyExcerpt ? ` — “${t.replyExcerpt}${t.replyExcerpt.length >= 72 ? "…" : ""}”` : ""}
                  </li>
                ))}
            </ul>
          ) : null}
          <p>
            <strong>Typing pace (est.):</strong>{" "}
            {feedback.wpmReliable && feedback.avgWpm > 0 ? `${feedback.avgWpm} WPM` : "Unable to estimate"}
          </p>
          <p className="text-sm text-[var(--siya-text)]">{feedback.accuracyNote}</p>
          {feedback.safetyReasons.length > 0 ? (
            <p className="text-sm text-[var(--siya-text)]">
              Safety codes: {feedback.safetyReasons.join(", ")}
            </p>
          ) : null}
        </div>

        <div className={`${portalCard} space-y-2`}>
          <button
            type="button"
            className="text-sm font-semibold text-[var(--siya-accent)] hover:underline"
            onClick={() => setShowTranscript((v) => !v)}
          >
            {showTranscript ? "Hide transcript" : "View transcript"}
          </button>
          {showTranscript ? (
            <ul className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {savedTranscript.map((t, i) => (
                <li
                  key={`${i}-${t.who}`}
                  className={`rounded-lg px-3 py-2 ${
                    t.who === "you"
                      ? "bg-[var(--siya-btn-primary)] text-white"
                      : "border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] text-[var(--siya-text)]"
                  }`}
                >
                  <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide opacity-80">
                    {t.who === "you" ? "You (MA)" : t.who}
                  </p>
                  {t.text}
                </li>
              ))}
              {!savedTranscript.length ? (
                <li className="text-xs text-[var(--siya-text)]">No turns recorded for this session.</li>
              ) : null}
            </ul>
          ) : null}
          <p className="text-[11px] text-[var(--siya-text)]">
            Full transcript is saved with this session for Ops review when the outcome is a red flag or soft stop.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {examMode ? (
            <p className="text-sm text-[var(--siya-text)]">Exam section recorded. Safety flags are separate from the section score.</p>
          ) : (
          <button type="button" className={portalAskSendBtn} onClick={resetToPick}>
            New session
          </button>
          )}
          {!examMode ? (
          <Link
            href="/learn/practice"
            className="rounded-lg border border-[var(--siya-border)] px-3.5 py-2 text-sm font-medium text-[var(--siya-primary)]"
          >
            Daily Practice drills
          </Link>
          ) : null}
        </div>
      </div>
    );
  }

  // Chat phase — Ask-like layout
  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--siya-bg-page)]">
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3">
        <div className="min-w-0">
          {examMode ? (
            <p className={portalLinkBack}>Exam section · no return to prior sections</p>
          ) : (
          <button type="button" onClick={resetToPick} className={`${portalLinkBack} block`}>
            ← Personas
          </button>
          )}
          <p className="truncate text-sm font-semibold text-[var(--siya-primary)]">
            Chat simulator · {persona?.name}
          </p>
          <p className="text-[11px] font-semibold text-[var(--siya-text)]">
            {maTurns}/{turnCap} replies{examMode ? " · exam" : ""}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-lg border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold text-[var(--siya-primary)] hover:bg-[var(--siya-bg-subtle)]"
          onClick={() => finishSession("You ended the session.")}
          disabled={streaming || maTurns === 0}
        >
          End & feedback
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((m, i) => (
          <div key={`${i}-${m.who}`} className={`flex ${m.who === "you" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.who === "you"
                  ? "bg-[var(--siya-btn-primary)] text-white"
                  : "border border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-text)]"
              }`}
            >
              {m.who !== "you" ? (
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-primary)]">
                  {m.who}
                </p>
              ) : null}
              {m.text || (streaming ? "…" : "")}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {error ? <p className="px-4 text-xs text-[var(--siya-status-error-text)]">{error}</p> : null}

      {offerConclude ? (
        <div
          className="shrink-0 border-t border-[var(--siya-border)] bg-[var(--siya-status-info-bg)] px-4 py-3"
          data-chat-sim-conclude="true"
        >
          <p className="text-sm font-semibold text-[var(--siya-text)]">
            {CONCLUDE_OFFER_AFTER_TURNS} exchanges done — conclude this chat and see feedback?
          </p>
          <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
            You can keep chatting, or stop here and review grammar, tone, and relevance.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              className={portalAskSendBtn}
              data-chat-sim-conclude-yes="true"
              onClick={() => finishSession("You concluded the chat after 3 exchanges.")}
            >
              Conclude & see feedback
            </button>
            <button
              type="button"
              className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-3.5 py-2 text-sm font-medium text-[var(--siya-primary)]"
              onClick={() => setConcludeDismissedAtTurn(maTurns)}
            >
              Keep chatting
            </button>
          </div>
        </div>
      ) : null}

      <div className="shrink-0 border-t border-[var(--siya-border)] bg-[var(--siya-white)] p-3">
        <div className="mx-auto flex max-w-3xl gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              const next = e.target.value;
              // First keystroke (not focus) starts the WPM clock — avoids focus→paste→send absurd rates.
              if (typingStartRef.current == null && next.length > 0) {
                typingStartRef.current = Date.now();
              }
              if (next.length === 0) typingStartRef.current = null;
              setInput(next);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send();
              }
            }}
            disabled={streaming || !token}
            placeholder="Type as the MA — process, booking, forms. No clinical decisions."
            className={portalAskInput}
          />
          <button
            type="button"
            className={portalAskSendBtn}
            disabled={streaming || input.trim().length < 3 || !token}
            onClick={() => void send()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
