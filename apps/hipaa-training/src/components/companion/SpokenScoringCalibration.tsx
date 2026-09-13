"use client";

/**
 * Founder-only spoken scoring calibration — sandbox inspection.
 * No exam attempt, seen-set, or ledger writes.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { startWavCapture, type WavCapture } from "@/lib/talk-wav-capture";
import {
  runSpokenCalibration,
  type SpokenCalibrationResult,
} from "@/lib/patient-drill/spoken-calibration";
import { portalCard, portalH1, portalPage } from "@/lib/portal-ui";

type SpeakDraft = {
  transcript: string;
  sttRaw: string;
  provider: string;
  note: string;
  recordingElapsedSec: number;
};

const MAX_HISTORY = 8;

export function SpokenScoringCalibration() {
  const router = useRouter();
  const { user, token, authReady } = useAuth();
  const isAdmin = isPortalAdmin(user?.role);

  const [patientAsk, setPatientAsk] = useState(
    "How long will this actually take? I have finals next week.",
  );
  const [useRelevance, setUseRelevance] = useState(true);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<SpeakDraft | null>(null);
  const [history, setHistory] = useState<SpokenCalibrationResult[]>([]);
  const capRef = useRef<WavCapture | null>(null);
  const recordStartedAt = useRef<number | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!isAdmin) router.replace("/learn");
  }, [authReady, isAdmin, router]);

  useEffect(() => {
    return () => {
      capRef.current?.abort();
      capRef.current = null;
    };
  }, []);

  const startRecord = useCallback(async () => {
    if (!token || busy || recording) return;
    setError(null);
    setDraft(null);
    try {
      const cap = await startWavCapture();
      capRef.current = cap;
      recordStartedAt.current = Date.now();
      setRecording(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Microphone permission denied.");
    }
  }, [token, busy, recording]);

  const stopRecord = useCallback(async () => {
    const cap = capRef.current;
    capRef.current = null;
    setRecording(false);
    if (!cap) return;
    const started = recordStartedAt.current;
    recordStartedAt.current = null;
    const elapsedSec = started != null ? (Date.now() - started) / 1000 : null;
    setBusy(true);
    setError(null);
    try {
      const wav = await cap.stop();
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const body = new FormData();
      body.append("file", wav, "calibration.wav");
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
        setError(data.error || "Cloud STT returned no transcript.");
        return;
      }
      const raw = data.transcript.trim();
      const note = data.fallbackReason
        ? `Fallback (${data.fallbackReason})${data.sarvamTranscript ? ` — Sarvam heard “${data.sarvamTranscript}”` : ""}`
        : data.provider || "sarvam";
      setDraft({
        transcript: raw,
        sttRaw: raw,
        provider: data.provider || "sarvam",
        note,
        recordingElapsedSec: elapsedSec ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cloud STT failed.");
    } finally {
      setBusy(false);
    }
  }, [token]);

  const scoreDraft = () => {
    if (!draft) return;
    const confirmed = draft.transcript.trim();
    if (confirmed.length < 2) {
      setError("Edit the transcript to at least a short phrase before scoring.");
      return;
    }
    const result = runSpokenCalibration({
      confirmedText: confirmed,
      sttRaw: draft.sttRaw,
      sttProvider: draft.provider,
      patientAsk: useRelevance ? patientAsk : null,
      recordingElapsedSec: draft.recordingElapsedSec,
    });
    setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
    setDraft(null);
    setError(null);
  };

  const resetForAnother = () => {
    capRef.current?.abort();
    capRef.current = null;
    setRecording(false);
    setBusy(false);
    setDraft(null);
    setError(null);
  };

  if (!authReady) {
    return <p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading…</p>;
  }
  if (!isAdmin) return null;

  const latest = history[0] ?? null;

  return (
    <div className={`${portalPage} space-y-4`}>
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
          Admin · sandbox
        </p>
        <h1 className={portalH1}>Spoken scoring calibration</h1>
        <p className="mt-1 max-w-2xl text-sm text-[var(--siya-text)]">
          Speak freely, confirm the transcript, then inspect every rubric. Nothing is saved to exam
          attempts, seen-sets, or Ops ledgers — pure inspection for tuning.
        </p>
      </header>

      <div className={`${portalCard} space-y-3`}>
        <label className="flex items-start gap-2 text-sm text-[var(--siya-text)]">
          <input
            type="checkbox"
            className="mt-1"
            checked={useRelevance}
            onChange={(e) => setUseRelevance(e.target.checked)}
          />
          <span>
            Test relevance against a fake patient ask (optional). Uncheck to skip relevance entirely.
          </span>
        </label>
        {useRelevance ? (
          <div>
            <label className="text-xs font-semibold text-[var(--siya-text-secondary)]" htmlFor="cal-ask">
              Fake patient ask
            </label>
            <textarea
              id="cal-ask"
              value={patientAsk}
              onChange={(e) => setPatientAsk(e.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm"
              placeholder="e.g. How long will this take?"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!recording && !draft ? (
            <button
              type="button"
              onClick={() => void startRecord()}
              disabled={busy || !token}
              className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Record
            </button>
          ) : null}
          {recording ? (
            <button
              type="button"
              onClick={() => void stopRecord()}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Stop &amp; transcribe
            </button>
          ) : null}
          {draft ? (
            <>
              <button
                type="button"
                onClick={scoreDraft}
                className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white"
              >
                Score this transcript
              </button>
              <button
                type="button"
                onClick={resetForAnother}
                className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold"
              >
                Discard &amp; re-record
              </button>
            </>
          ) : null}
          {latest && !draft && !recording ? (
            <button
              type="button"
              onClick={() => void startRecord()}
              className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold"
            >
              Record again
            </button>
          ) : null}
        </div>

        {busy ? <p className="text-sm text-[var(--siya-text-secondary)]">Transcribing…</p> : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        {draft ? (
          <div className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] p-3">
            <p className="text-xs font-semibold text-[var(--siya-primary)]">
              Review before score · STT {draft.note} · recording {draft.recordingElapsedSec.toFixed(1)}s
            </p>
            <label className="text-xs font-semibold text-[var(--siya-text-secondary)]">
              Editable transcript (scored)
            </label>
            <textarea
              value={draft.transcript}
              onChange={(e) => setDraft({ ...draft, transcript: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold">Raw STT</p>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[var(--siya-white)] p-2 text-xs text-[var(--siya-text)]">
                  {draft.sttRaw || "(empty)"}
                </pre>
              </div>
              <div>
                <p className="text-xs font-semibold">Edited (will score)</p>
                <pre className="mt-1 whitespace-pre-wrap rounded-lg bg-[var(--siya-white)] p-2 text-xs text-[var(--siya-text)]">
                  {draft.transcript.trim() || "(empty)"}
                </pre>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {latest ? <CalibrationBreakdown result={latest} /> : null}

      {history.length > 1 ? (
        <details className={`${portalCard} text-sm`}>
          <summary className="cursor-pointer font-semibold">
            Prior runs this session ({history.length - 1}) — not persisted
          </summary>
          <ul className="mt-2 space-y-2 text-xs text-[var(--siya-text-secondary)]">
            {history.slice(1).map((r, i) => (
              <li key={`${r.scoredAt}-${i}`}>
                {new Date(r.scoredAt).toLocaleTimeString()} · G{r.grammar.score} · P{r.politeness.score}
                {r.relevance.skipped ? " · Rel skipped" : ` · Rel ${r.relevance.score}`}
                {r.safety.redFlagged ? " · RED FLAG" : ""} — “{r.confirmedText.slice(0, 60)}
                {r.confirmedText.length > 60 ? "…" : ""}”
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function CalibrationBreakdown({ result }: { result: SpokenCalibrationResult }) {
  return (
    <div className={`${portalCard} space-y-4 text-sm`} data-spoken-calibration-result="true">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--siya-accent)]">
          Full scoring breakdown
        </p>
        <p className="text-xs text-[var(--siya-text-muted)]">
          Scored at {new Date(result.scoredAt).toLocaleTimeString()} · STT {result.sttProvider}
          {result.transcriptEdited ? " · transcript was edited" : " · transcript unchanged from STT"}
        </p>
      </div>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">Transcripts</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold">Raw STT</p>
            <pre className="mt-1 whitespace-pre-wrap text-xs">{result.sttRaw || "(empty)"}</pre>
          </div>
          <div>
            <p className="text-xs font-semibold">Confirmed (scored)</p>
            <pre className="mt-1 whitespace-pre-wrap text-xs">{result.confirmedText || "(empty)"}</pre>
          </div>
        </div>
      </section>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Grammar · {result.grammar.score}/100
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.grammar.note}</p>
        <p className="text-xs">
          <span className="font-semibold">Disfluency-stripped text used for check:</span>
        </p>
        <pre className="whitespace-pre-wrap rounded-lg bg-[var(--siya-bg-subtle)] p-2 text-xs">
          {result.grammar.disfluencyStrippedText || "(empty)"}
        </pre>
        {result.grammar.issues.length === 0 ? (
          <p className="text-xs text-emerald-800">No grammar issues flagged.</p>
        ) : (
          <ul className="list-disc pl-5 text-xs">
            {result.grammar.issues.map((g, i) => (
              <li key={i}>
                {g.kinds.join(", ")}
                {g.detail ? ` — ${g.detail}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Politeness · {result.politeness.score}/100
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.politeness.note}</p>
        {result.politeness.markers.length === 0 ? (
          <p className="text-xs text-amber-800">No courtesy markers detected.</p>
        ) : (
          <ul className="list-disc pl-5 text-xs">
            {result.politeness.markers.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Relevance ·{" "}
          {result.relevance.skipped ? "skipped" : `${result.relevance.score ?? "—"}/100`}
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.relevance.note}</p>
        {result.relevance.skipped ? (
          <p className="text-xs text-[var(--siya-text-muted)]">{result.relevance.skipReason}</p>
        ) : (
          <>
            <p className="text-xs">
              <span className="font-semibold">Patient ask:</span> {result.relevance.patientAsk}
            </p>
            {result.relevance.turn ? (
              <ul className="list-disc pl-5 text-xs">
                <li>Ask type: {result.relevance.turn.askType}</li>
                <li>Reason: {result.relevance.turn.reason}</li>
                {result.relevance.turn.humanNote ? (
                  <li className="font-medium text-[var(--siya-primary)]">
                    {result.relevance.turn.humanNote}
                  </li>
                ) : null}
              </ul>
            ) : null}
          </>
        )}
      </section>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Safety · {result.safety.redFlagged ? "RED FLAG" : result.safety.turnAction}
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.safety.note}</p>
        <ul className="list-disc pl-5 text-xs">
          <li>Turn action: {result.safety.turnAction}</li>
          <li>Stop kind: {result.safety.stopKind ?? "—"}</li>
          <li>Classified outcome: {result.safety.classifiedOutcome}</li>
          <li>
            Misconduct codes:{" "}
            {result.safety.misconductReasons.length
              ? result.safety.misconductReasons.join(", ")
              : "none"}
          </li>
          <li>
            Screening-as-diagnosis: {result.safety.screeningAsDiagnosis ? "yes" : "no"}
          </li>
        </ul>
      </section>

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3">
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Spoken WPM (informational) ·{" "}
          {result.spokenWpm.reliable ? `${result.spokenWpm.wpm}` : "n/a"}
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.spokenWpm.note}</p>
        <ul className="list-disc pl-5 text-xs">
          <li>Words: {result.spokenWpm.wordCount}</li>
          <li>
            Recording duration:{" "}
            {result.spokenWpm.elapsedSec != null
              ? `${result.spokenWpm.elapsedSec.toFixed(1)}s`
              : "—"}
          </li>
          <li>Raw WPM: {result.spokenWpm.rawWpm || "—"}</li>
        </ul>
      </section>
    </div>
  );
}
