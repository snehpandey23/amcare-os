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
import {
  evaluateSimulatorSession,
  OFF_TOPIC_STYLE_SCORES_NOTE,
  styleScoresDeemphasizedForSession,
  type SimulatorFeedback,
} from "@/lib/patient-drill/evaluate";
import { startWavCapture, type WavCapture } from "@/lib/talk-wav-capture";
import { cancelSpeech, speakText, subscribeTtsVoices } from "@/lib/text-to-speech";
import { stripForSpeech } from "@/lib/talk-mode-utterance";
import {
  personaTtsPitch,
  personaTtsRate,
  resolvePersonaTtsVoiceURI,
} from "@/lib/patient-drill/persona-tts-voice";
import { SPOKEN_RAW_STT_POLICY } from "@/lib/patient-drill/spoken-turn-limits";
import {
  downloadSttStudyJson,
  emptySttStudySession,
  sttStudyFairRate,
  type SttStudyFairness,
  type SttStudySessionLog,
} from "@/lib/patient-drill/spoken-stt-study";
import { SpokenCallPanel } from "@/components/companion/SpokenCallPanel";
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
type ReplyMode = "typed" | "spoken";
type Line = {
  who: "you" | string;
  text: string;
  startedAt?: number;
  sentAt?: number;
  inputModality?: "typed" | "spoken";
  sttRaw?: string;
  sttProvider?: string;
  sttWordEditDistance?: number;
  sttWordChangePct?: number;
  sttHeavilyEdited?: boolean;
  sttIntegrityNote?: string;
};

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
    case "incoherent_or_word_salad":
      return "incoherent / not a sentence";
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
  sttStudyMode = false,
}: {
  /** Competency exam — locked brief, turn cap, no practice XP. */
  examMode?: {
    persona: Persona;
    opening: string;
    briefId: string;
    maxTurns?: number;
    /** When true, end the chat using the same finishSession path as turn-cap (exam wall clock). */
    forceComplete?: boolean;
    /** Competency exam lanes — locks Type/Speak toggle. */
    inputModality?: ReplyMode;
    onComplete: (feedback: SimulatorFeedback) => void;
  };
  /**
   * STT accuracy study: after each raw auto-submit, collect intended-said + fair/unfair.
   * See docs/SPOKEN-STT-ACCURACY-STUDY.md
   */
  sttStudyMode?: boolean;
} = {}) {
  const { token } = useAuth();
  const turnCap = examMode?.maxTurns ?? MAX_MA_TURNS;
  const examDoneRef = useRef(false);
  const lockedModality = examMode?.inputModality ?? (sttStudyMode ? "spoken" : undefined);
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
  const [replyMode, setReplyMode] = useState<ReplyMode>(lockedModality ?? "typed");
  const [speakRecording, setSpeakRecording] = useState(false);
  const [speakBusy, setSpeakBusy] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [personaSpeaking, setPersonaSpeaking] = useState(false);
  /** Last raw STT that was auto-scored (call UI echo only). */
  const [lastScoredStt, setLastScoredStt] = useState<string | null>(null);
  const [personaVoiceLabel, setPersonaVoiceLabel] = useState<{ uri: string | null; name: string | null }>({
    uri: null,
    name: null,
  });
  const [studyStaffLabel, setStudyStaffLabel] = useState("");
  const [studySession, setStudySession] = useState<SttStudySessionLog | null>(null);
  const [studyPending, setStudyPending] = useState<{
    turnIndex: number;
    sttTranscript: string;
    sttProvider: string;
    intendedSaid: string;
    fairForScoring: SttStudyFairness | null;
  } | null>(null);
  /** Queue raw STT for auto-send after capture (production + study — no review UI). */
  const [pendingSpokenSubmit, setPendingSpokenSubmit] = useState<{
    text: string;
    sttRaw: string;
    provider: string;
  } | null>(null);
  const typingStartRef = useRef<number | null>(null);
  const cloudCapRef = useRef<WavCapture | null>(null);
  const lastSpokenPersonaKeyRef = useRef<string | null>(null);
  const personaVoiceURIRef = useRef<string | null>(null);
  const autoListenAfterTtsRef = useRef(false);
  const startSpeakCaptureRef = useRef<() => Promise<void>>(async () => undefined);
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

  // Resolve a fixed TTS voice for this persona (not the staff Talk Mode voice).
  useEffect(() => {
    if (!persona?.id) {
      personaVoiceURIRef.current = null;
      return;
    }
    const apply = () => {
      const uri = resolvePersonaTtsVoiceURI(persona.id);
      personaVoiceURIRef.current = uri;
      const voices = typeof window !== "undefined" ? window.speechSynthesis?.getVoices?.() ?? [] : [];
      const hit = uri ? voices.find((v) => v.voiceURI === uri) : undefined;
      setPersonaVoiceLabel({ uri, name: hit?.name ?? null });
    };
    apply();
    return subscribeTtsVoices(() => apply());
  }, [persona?.id]);

  // Spoken mode: play persona lines aloud with the persona's fixed voice.
  useEffect(() => {
    if (phase !== "chat" || replyMode !== "spoken" || streaming) return;
    const last = messages[messages.length - 1];
    if (!last || last.who === "you") return;
    const spoken = stripForSpeech(last.text);
    if (!spoken) return;
    const key = `${messages.length}:${spoken}`;
    if (lastSpokenPersonaKeyRef.current === key) return;
    lastSpokenPersonaKeyRef.current = key;
    autoListenAfterTtsRef.current = true;
    const pid = persona?.id || "unknown";
    void speakText(spoken, {
      voiceURI: personaVoiceURIRef.current,
      pitch: personaTtsPitch(pid),
      rate: personaTtsRate(pid),
      onStart: () => setPersonaSpeaking(true),
      onEnd: () => {
        setPersonaSpeaking(false);
        if (
          autoListenAfterTtsRef.current &&
          replyMode === "spoken" &&
          !speakBusy &&
          !speakRecording &&
          !pendingSpokenSubmit &&
          !studyPending &&
          phaseRef.current === "chat"
        ) {
          autoListenAfterTtsRef.current = false;
          void startSpeakCaptureRef.current();
        }
      },
    });
  }, [messages, streaming, replyMode, phase, persona?.id, speakBusy, speakRecording, pendingSpokenSubmit, studyPending]);

  useEffect(() => {
    return () => {
      cancelSpeech();
    };
  }, []);

  useEffect(() => {
    if (replyMode !== "spoken") {
      cancelSpeech();
      setPersonaSpeaking(false);
      autoListenAfterTtsRef.current = false;
    }
  }, [replyMode]);

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
            spokenSession: fb.spokenSession,
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
    setSpeakError(null);
    setSpeakRecording(false);
    setSpeakBusy(false);
    setLastScoredStt(null);
    setStudyPending(null);
    setPendingSpokenSubmit(null);
    if (sttStudyMode) {
      setReplyMode("spoken");
      setStudySession(emptySttStudySession(studyStaffLabel || "anonymous"));
    }
    cloudCapRef.current?.abort();
    cloudCapRef.current = null;
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
    if (examMode.inputModality) setReplyMode(examMode.inputModality);
    setPhase("chat");
  }, [examMode]);

  useEffect(() => {
    if (!lockedModality) return;
    setReplyMode(lockedModality);
  }, [lockedModality]);

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

  const send = async (
    rawText?: string,
    meta?: {
      inputModality?: "typed" | "spoken";
      sttRaw?: string;
      sttProvider?: string;
      sttWordEditDistance?: number;
      sttWordChangePct?: number;
      sttHeavilyEdited?: boolean;
      sttIntegrityNote?: string;
    },
  ) => {
    const text = (rawText ?? input).trim();
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

    const modality = meta?.inputModality ?? "typed";
    const startedTyping = modality === "typed" ? (typingStartRef.current ?? Date.now()) : undefined;
    const sentAt = Date.now();
    typingStartRef.current = null;
    const next: Line[] = [
      ...messages,
      {
        who: "you",
        text,
        startedAt: startedTyping,
        sentAt,
        inputModality: modality,
        sttRaw: modality === "spoken" ? meta?.sttRaw : undefined,
        sttProvider: modality === "spoken" ? meta?.sttProvider : undefined,
        sttWordEditDistance: modality === "spoken" ? meta?.sttWordEditDistance : undefined,
        sttWordChangePct: modality === "spoken" ? meta?.sttWordChangePct : undefined,
        sttHeavilyEdited: modality === "spoken" ? meta?.sttHeavilyEdited : undefined,
        sttIntegrityNote: modality === "spoken" ? meta?.sttIntegrityNote : undefined,
      },
    ];
    setMessages(next);
    setInput("");
    setSpeakError(null);
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
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        const snapshot = acc;
        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last && last.who === persona.name) copy[copy.length - 1] = { ...last, text: snapshot };
          return copy;
        });
      }
      if (next.filter((m) => m.who === "you").length >= turnCap) {
        finishSession(`Reached ${turnCap} replies.`, {
          lines: [...next, { who: persona.name, text: acc || EMPTY_REPLY_FALLBACK }],
        });
      }
    } catch (e) {
      const fallbackLine = { who: persona.name, text: EMPTY_REPLY_FALLBACK };
      setMessages([...next, fallbackLine]);
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setStreaming(false);
    }
  };

  // After STT: auto-send raw transcript (no review/edit). Study mode then opens fairness form.
  useEffect(() => {
    if (!pendingSpokenSubmit || streaming || studyPending) return;
    if (phase !== "chat") return;
    const job = pendingSpokenSubmit;
    setPendingSpokenSubmit(null);
    setLastScoredStt(job.sttRaw);
    const turnIndex = messages.filter((m) => m.who === "you").length + 1;
    void send(job.text, {
      inputModality: "spoken",
      sttRaw: job.sttRaw,
      sttProvider: job.provider,
    }).then(() => {
      if (!sttStudyMode) return;
      setStudyPending({
        turnIndex,
        sttTranscript: job.sttRaw,
        sttProvider: job.provider,
        intendedSaid: "",
        fairForScoring: null,
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once per queued STT job
  }, [pendingSpokenSubmit, streaming, studyPending, sttStudyMode, phase]);

  const startSpeakCapture = useCallback(async () => {
    if (streaming || speakBusy || speakRecording || !token) return;
    if (sttStudyMode && studyPending) return;
    if (pendingSpokenSubmit) return;
    cancelSpeech();
    setPersonaSpeaking(false);
    setSpeakError(null);
    try {
      const cap = await startWavCapture();
      cloudCapRef.current = cap;
      setSpeakRecording(true);
    } catch (err) {
      setSpeakError(err instanceof Error ? err.message : "Microphone permission denied.");
    }
  }, [streaming, speakBusy, speakRecording, token, sttStudyMode, studyPending, pendingSpokenSubmit]);

  startSpeakCaptureRef.current = startSpeakCapture;

  const stopSpeakCapture = useCallback(async () => {
    const cap = cloudCapRef.current;
    cloudCapRef.current = null;
    setSpeakRecording(false);
    if (!cap) return;
    setSpeakBusy(true);
    setSpeakError(null);
    try {
      const wav = await cap.stop();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const body = new FormData();
      body.append("file", wav, "turn.wav");
      const res = await fetch("/api/talk/cloud-stt", { method: "POST", headers, body });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        transcript?: string;
        provider?: string;
        fallbackReason?: string;
        sarvamTranscript?: string;
        error?: string;
      };
      if (!res.ok || !data.ok || !data.transcript?.trim()) {
        setSpeakError(
          data.error ||
            "Cloud listen didn’t return a transcript. Nothing was scored — tap Mic to re-record.",
        );
        return;
      }
      const raw = data.transcript.trim();
      if (raw.length < 3) {
        setSpeakError("Transcription too short to score. Nothing was sent — tap Mic to re-record.");
        return;
      }
      const provider = data.provider || "sarvam";
      // Founder decision: score raw STT immediately — no edit / confirm step.
      setPendingSpokenSubmit({ text: raw, sttRaw: raw, provider });
    } catch (err) {
      setSpeakError(
        err instanceof Error
          ? `${err.message} Nothing was scored — tap Mic to re-record.`
          : "Cloud listen failed. Nothing was scored — tap Mic to re-record.",
      );
    } finally {
      setSpeakBusy(false);
    }
  }, [token]);

  const commitStudyPending = () => {
    if (!studyPending || !studyPending.intendedSaid.trim() || !studyPending.fairForScoring) return;
    const entry = {
      turnIndex: studyPending.turnIndex,
      personaId: persona?.id,
      intendedSaid: studyPending.intendedSaid.trim(),
      sttTranscript: studyPending.sttTranscript,
      sttProvider: studyPending.sttProvider,
      fairForScoring: studyPending.fairForScoring,
      recordedAt: new Date().toISOString(),
    };
    setStudySession((prev) => {
      const base = prev ?? emptySttStudySession(studyStaffLabel || "anonymous");
      return { ...base, turns: [...base.turns, entry] };
    });
    setStudyPending(null);
  };

  const resetToPick = () => {
    cancelSpeech();
    setPersonaSpeaking(false);
    cloudCapRef.current?.abort();
    cloudCapRef.current = null;
    setSpeakRecording(false);
    setSpeakBusy(false);
    setSpeakError(null);
    setLastScoredStt(null);
    setStudyPending(null);
    setPendingSpokenSubmit(null);
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
          {sttStudyMode ? (
            <div
              className="mt-3 rounded-xl border border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)] p-3 text-sm text-[var(--siya-text)]"
              data-stt-study-banner="true"
            >
              <p className="font-semibold text-[var(--siya-primary)]">STT accuracy study</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--siya-text-secondary)]">
                Transcript review is <strong>off</strong> for this run. Whatever the cloud hears is what gets scored —
                no edit, no re-record. After each turn you’ll mark what you actually said and whether that transcript was
                fair to score. See{" "}
                <code className="text-[10px]">docs/SPOKEN-STT-ACCURACY-STUDY.md</code>.
              </p>
              <label className="mt-3 block text-xs font-semibold text-[var(--siya-text)]">
                Staff label (initials OK)
                <input
                  className={`mt-1 w-full ${portalAskInput}`}
                  value={studyStaffLabel}
                  onChange={(e) => setStudyStaffLabel(e.target.value)}
                  placeholder="e.g. SP"
                  data-stt-study-staff-label="true"
                />
              </label>
            </div>
          ) : null}
          <p className="mt-2 text-sm text-[var(--siya-text)]">
            Practice a live patient conversation. Choose a persona to get started — same AI as Ask, used here only as a
            training patient. Reply by <strong>typing</strong> or <strong>speaking</strong> (turn-based: record → raw
            STT scores immediately — not a live phone call).
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
                  onClick={() => {
                    if (sttStudyMode && studyStaffLabel.trim().length < 1) {
                      setError("Enter a staff label before starting the STT study.");
                      return;
                    }
                    startWithPersona(p);
                  }}
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
          {styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? (
            <div
              className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              data-style-scores-deemphasized="true"
            >
              <p className="font-semibold">Off-topic reply</p>
              <p className="mt-1 text-xs">{OFF_TOPIC_STYLE_SCORES_NOTE}</p>
              <p className="mt-1 text-xs text-amber-900/80">
                Grammar and Politeness numbers below are kept for audit — they are not a pass signal
                for an unrelated response.
              </p>
            </div>
          ) : null}
          <p
            className={
              styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? "opacity-45" : undefined
            }
          >
            <strong>Grammar / clarity (chat register):</strong> {feedback.grammarScore}/100
            {feedback.grammarErrorCount > 0 ? ` (${feedback.grammarErrorCount} flagged)` : ""}
            {styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? (
              <span className="ml-2 text-xs font-medium text-amber-900">(not meaningful — off-topic)</span>
            ) : null}
          </p>
          <p
            className={`text-sm text-[var(--siya-text)] ${
              styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? "opacity-45" : ""
            }`}
          >
            {feedback.grammarNote}
          </p>
          {feedback.grammarIssues.length > 0 ? (
            <ul
              className={`list-disc space-y-1 pl-5 text-sm text-[var(--siya-text)] ${
                styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? "opacity-45" : ""
              }`}
            >
              {feedback.grammarIssues.slice(0, 6).map((g) => (
                <li key={`${g.messageIndex}-${g.excerpt}`}>
                  Reply {g.messageIndex + 1}: {g.kinds.map(grammarKindLabel).join(", ")}
                  {g.detail ? ` — ${g.detail}` : ""}
                  {g.excerpt ? ` (“${g.excerpt}${g.excerpt.length >= 80 ? "…" : ""}”)` : ""}
                </li>
              ))}
            </ul>
          ) : null}
          <p
            className={
              styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? "opacity-45" : undefined
            }
          >
            <strong>Politeness:</strong> {feedback.politenessScore}/100
            {styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? (
              <span className="ml-2 text-xs font-medium text-amber-900">(not meaningful — off-topic)</span>
            ) : null}
          </p>
          <p
            className={`text-sm text-[var(--siya-text)] ${
              styleScoresDeemphasizedForSession(feedback.relevanceTurns) ? "opacity-45" : ""
            }`}
          >
            {feedback.politenessNote}
          </p>
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
                    {t.humanNote ? (
                      <>
                        <span className="font-medium text-[var(--siya-primary)]">{t.humanNote}</span>
                        {t.replyExcerpt ? (
                          <span className="text-[var(--siya-text-secondary)]">
                            {" "}
                            — “{t.replyExcerpt}
                            {t.replyExcerpt.length >= 72 ? "…" : ""}”
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <>
                        Reply {i + 1} ({t.askType}): {t.reason}
                        {t.replyExcerpt ? ` — “${t.replyExcerpt}${t.replyExcerpt.length >= 72 ? "…" : ""}”` : ""}
                      </>
                    )}
                  </li>
                ))}
            </ul>
          ) : null}
          <p>
            <strong>Typing pace (est.):</strong>{" "}
            {feedback.spokenSession
              ? "n/a (spoken)"
              : feedback.wpmReliable && feedback.avgWpm > 0
                ? `${feedback.avgWpm} WPM`
                : "Unable to estimate"}
          </p>
          <p className="text-sm text-[var(--siya-text)]">{feedback.accuracyNote}</p>
          {feedback.spokenSession ? (
            <p className="text-xs text-[var(--siya-text-muted)]" data-spoken-raw-stt-policy="true">
              {SPOKEN_RAW_STT_POLICY}
            </p>
          ) : null}
          {sttStudyMode && studySession ? (
            <div className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-sm" data-stt-study-summary="true">
              {(() => {
                const rate = sttStudyFairRate(studySession.turns);
                return (
                  <>
                    <p className="font-semibold text-[var(--siya-primary)]">STT study log</p>
                    <p className="mt-1 text-xs text-[var(--siya-text)]">
                      {rate.eligible} eligible / {rate.total} turn{rate.total === 1 ? "" : "s"} · fair {rate.fair} ·
                      unfair {rate.unfair}
                      {rate.excludedHeavyEdit
                        ? ` · ${rate.excludedHeavyEdit} excluded (heavy edit)`
                        : ""}
                      {rate.fairPct != null ? ` · ${rate.fairPct}% fair` : ""}
                    </p>
                    <button
                      type="button"
                      className={`${portalAskSendBtn} mt-2`}
                      data-stt-study-download="true"
                      onClick={() => {
                        const finished = {
                          ...studySession,
                          staffLabel: studyStaffLabel || studySession.staffLabel,
                          finishedAt: new Date().toISOString(),
                        };
                        downloadSttStudyJson(finished);
                      }}
                    >
                      Download study JSON
                    </button>
                  </>
                );
              })()}
            </div>
          ) : null}
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
                    {t.who === "you"
                      ? t.inputModality === "spoken"
                        ? "You (MA · spoken)"
                        : "You (MA)"
                      : t.who}
                  </p>
                  {t.text}
                  {t.who === "you" && t.sttHeavilyEdited ? (
                    <p
                      className="mt-1 rounded bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-950"
                      data-spoken-heavy-edit="true"
                    >
                      {t.sttIntegrityNote ||
                        `Heavily edited from original transcription (${t.sttWordChangePct ?? "?"}% words changed)`}
                    </p>
                  ) : null}
                  {t.who === "you" && t.sttRaw && t.sttRaw !== t.text ? (
                    <p className="mt-1 text-[10px] opacity-75">
                      STT raw (audit only
                      {typeof t.sttWordChangePct === "number" ? ` · ${t.sttWordChangePct}% words changed` : ""}
                      {t.sttProvider ? ` · ${t.sttProvider}` : ""}
                      ): {t.sttRaw}
                    </p>
                  ) : null}
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

  // Chat phase — typed keeps bubbles; spoken uses call-style panel
  const lastPersonaLine =
    [...messages].reverse().find((m) => m.who !== "you")?.text?.trim() ||
    persona?.openingMessage ||
    "";
  const callPhase =
    speakBusy || pendingSpokenSubmit
      ? "transcribing"
      : personaSpeaking
        ? "speaking"
        : speakRecording
          ? "listening"
          : "idle";

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--siya-bg-page)]" data-chat-sim-phase="chat">
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
            {replyMode === "spoken" ? "Spoken call" : "Chat simulator"} · {persona?.name}
          </p>
          <p className="text-[11px] font-semibold text-[var(--siya-text)]">
            {maTurns}/{turnCap} replies{examMode ? " · exam" : ""}
            {sttStudyMode ? " · STT study" : ""}
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

      {replyMode === "spoken" ? (
        <SpokenCallPanel
          personaName={persona?.name || "Patient"}
          personaLine={lastPersonaLine}
          callPhase={callPhase}
          speakError={speakError}
          speakBusy={speakBusy || Boolean(pendingSpokenSubmit) || streaming}
          speakRecording={speakRecording}
          studyMode={sttStudyMode}
          lastSubmittedPreview={lastScoredStt}
          personaVoiceURI={personaVoiceLabel.uri}
          personaVoiceName={personaVoiceLabel.name}
          onToggleMic={() => {
            if (speakRecording) void stopSpeakCapture();
            else void startSpeakCapture();
          }}
        />
      ) : (
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
              {m.who === "you" && m.sttHeavilyEdited && m.sttIntegrityNote ? (
                <p className="mt-1 text-[10px] text-amber-100">{m.sttIntegrityNote}</p>
              ) : null}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      )}

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

      <div className="shrink-0 border-t border-[var(--siya-border)] bg-[var(--siya-white)] px-4 py-3">
        {!lockedModality && replyMode === "typed" ? (
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              type="button"
              disabled={streaming}
              className="rounded-full border border-[var(--siya-border)] px-3 py-1 font-semibold text-[var(--siya-primary)]"
              onClick={() => {
                setReplyMode("spoken");
                setInput("");
                typingStartRef.current = null;
              }}
            >
              Switch to Speak (call)
            </button>
          </div>
        ) : null}
        {replyMode === "spoken" ? (
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--siya-text-muted)]">
            <span>Turn-based call · not live two-way</span>
            {!lockedModality && !sttStudyMode ? (
              <button
                type="button"
                className="font-semibold text-[var(--siya-accent)] underline"
                disabled={streaming || speakRecording || speakBusy || Boolean(pendingSpokenSubmit)}
                onClick={() => setReplyMode("typed")}
              >
                Switch to type
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                const next = e.target.value;
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
        )}
        {studyPending ? (
          <div className="mt-3 space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] p-3" data-stt-study-pending="true">
            <p className="text-xs font-semibold text-[var(--siya-primary)]">
              Study log — turn {studyPending.turnIndex}
            </p>
            <p className="text-[11px] text-[var(--siya-text-muted)]">
              Scored STT (unedited): <span className="text-[var(--siya-text)]">{studyPending.sttTranscript}</span>
            </p>
            <label className="block text-xs font-semibold text-[var(--siya-text)]">
              What did you actually say?
              <textarea
                className={`${portalAskInput} mt-1 min-h-[4rem] resize-y`}
                value={studyPending.intendedSaid}
                onChange={(e) =>
                  setStudyPending((p) => (p ? { ...p, intendedSaid: e.target.value } : p))
                }
                data-stt-study-intended="true"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${
                  studyPending.fairForScoring === "fair"
                    ? "bg-[var(--siya-primary)] text-white"
                    : "border border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-primary)]"
                }`}
                data-stt-study-fair="fair"
                onClick={() => setStudyPending((p) => (p ? { ...p, fairForScoring: "fair" } : p))}
              >
                Fair
              </button>
              <button
                type="button"
                className={`rounded-lg px-3.5 py-2 text-sm font-semibold ${
                  studyPending.fairForScoring === "unfair"
                    ? "bg-[var(--siya-status-error-text)] text-white"
                    : "border border-[var(--siya-border)] bg-[var(--siya-white)] text-[var(--siya-primary)]"
                }`}
                data-stt-study-fair="unfair"
                onClick={() => setStudyPending((p) => (p ? { ...p, fairForScoring: "unfair" } : p))}
              >
                Unfair mishear
              </button>
              <button
                type="button"
                className={portalAskSendBtn}
                disabled={studyPending.intendedSaid.trim().length < 3 || !studyPending.fairForScoring}
                data-stt-study-commit="true"
                onClick={() => commitStudyPending()}
              >
                Save & continue
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}