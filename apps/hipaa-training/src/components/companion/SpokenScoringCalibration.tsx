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
  CALIBRATION_SCENARIOS,
  type CalibrationScenario,
} from "@/lib/patient-drill/calibration-scenarios";
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

const MAX_HISTORY = 16;

export function SpokenScoringCalibration() {
  const router = useRouter();
  const { user, token, authReady } = useAuth();
  const isAdmin = isPortalAdmin(user?.role);

  const [scenarioId, setScenarioId] = useState(CALIBRATION_SCENARIOS[0]?.id ?? "timeline-clean");
  const activeScenario =
    CALIBRATION_SCENARIOS.find((s) => s.id === scenarioId) ?? CALIBRATION_SCENARIOS[0];

  const [patientAsk, setPatientAsk] = useState(
    activeScenario?.patientAsk ?? "How long will this actually take? I have finals next week.",
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

  const loadScenario = useCallback((scenario: CalibrationScenario, withSample: boolean) => {
    setScenarioId(scenario.id);
    setPatientAsk(scenario.patientAsk);
    setUseRelevance(true);
    setError(null);
    capRef.current?.abort();
    capRef.current = null;
    setRecording(false);
    setBusy(false);
    if (withSample) {
      setDraft({
        transcript: scenario.sampleReply,
        sttRaw: scenario.sampleReply,
        provider: "typed-paste",
        note: `Scenario sample · ${scenario.label}`,
        recordingElapsedSec: 0,
      });
    } else {
      setDraft(null);
    }
  }, []);

  const startTypedDraft = useCallback(() => {
    if (recording || busy) return;
    setError(null);
    setDraft({
      transcript: "",
      sttRaw: "",
      provider: "typed-paste",
      note: "Typed / pasted (no STT)",
      recordingElapsedSec: 0,
    });
  }, [recording, busy]);

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
        setError(
          data.error ||
            "Cloud STT returned no transcript. Nothing scored — tap Record to try again.",
        );
        return;
      }
      const raw = data.transcript.trim();
      if (raw.length < 2) {
        setError("Transcription too short. Nothing scored — tap Record to try again.");
        return;
      }
      // Record path: score raw STT immediately (no edit/confirm). Type/paste remains editable below.
      const result = runSpokenCalibration({
        confirmedText: raw,
        sttRaw: raw,
        sttProvider: data.provider || "sarvam",
        patientAsk: useRelevance ? patientAsk : null,
        recordingElapsedSec: elapsedSec != null && elapsedSec > 0 ? elapsedSec : null,
      });
      setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
      setDraft(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Cloud STT failed.");
    } finally {
      setBusy(false);
    }
  }, [token, patientAsk, useRelevance]);

  const scoreDraft = () => {
    if (!draft) return;
    const confirmed = draft.transcript.trim();
    if (confirmed.length < 2) {
      setError("Enter at least a short phrase before scoring.");
      return;
    }
    const result = runSpokenCalibration({
      confirmedText: confirmed,
      sttRaw: draft.sttRaw || confirmed,
      sttProvider: draft.provider,
      patientAsk: useRelevance ? patientAsk : null,
      recordingElapsedSec: draft.recordingElapsedSec > 0 ? draft.recordingElapsedSec : null,
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
          Record scores raw cloud STT immediately (no edit step). Type/paste remains available for
          sandbox probing. Nothing is saved to exam attempts, seen-sets, or Ops ledgers.
        </p>
      </header>

      <div className={`${portalCard} space-y-3`}>
        <div>
          <label className="text-xs font-semibold text-[var(--siya-text-secondary)]" htmlFor="cal-scenario">
            Scenario bank
          </label>
          <select
            id="cal-scenario"
            value={scenarioId}
            onChange={(e) => {
              const next = CALIBRATION_SCENARIOS.find((s) => s.id === e.target.value);
              if (next) loadScenario(next, false);
            }}
            className="mt-1 w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm"
          >
            {CALIBRATION_SCENARIOS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {activeScenario ? (
            <p className="mt-2 text-xs text-[var(--siya-text-secondary)]">{activeScenario.probe}</p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => activeScenario && loadScenario(activeScenario, true)}
              disabled={!activeScenario || recording || busy}
              className="rounded-xl border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Load sample reply into editor
            </button>
            <button
              type="button"
              onClick={() => activeScenario && loadScenario(activeScenario, false)}
              disabled={!activeScenario || recording || busy}
              className="rounded-xl border border-[var(--siya-border)] px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              Load ask only (blank reply)
            </button>
          </div>
        </div>

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
              rows={3}
              className="mt-1 w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm"
              placeholder="e.g. How long will this take?"
            />
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {!recording && !draft ? (
            <>
              <button
                type="button"
                onClick={startTypedDraft}
                disabled={busy}
                className="rounded-xl bg-[var(--siya-accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                Type / paste reply
              </button>
              <button
                type="button"
                onClick={() => void startRecord()}
                disabled={busy || !token}
                className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                Record
              </button>
            </>
          ) : null}
          {recording ? (
            <button
              type="button"
              onClick={() => void stopRecord()}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white"
            >
              Stop &amp; score raw STT
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
                Discard
              </button>
            </>
          ) : null}
          {latest && !draft && !recording ? (
            <>
              <button
                type="button"
                onClick={startTypedDraft}
                className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold"
              >
                Type another
              </button>
              <button
                type="button"
                onClick={() => void startRecord()}
                className="rounded-xl border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold"
              >
                Record again
              </button>
            </>
          ) : null}
        </div>

        {busy ? <p className="text-sm text-[var(--siya-text-secondary)]">Transcribing…</p> : null}
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        {draft ? (
          <div className="space-y-2 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] p-3">
            <p className="text-xs font-semibold text-[var(--siya-primary)]">
              Review before score · {draft.note}
              {draft.recordingElapsedSec > 0
                ? ` · recording ${draft.recordingElapsedSec.toFixed(1)}s`
                : " · no recording duration"}
            </p>
            <label className="text-xs font-semibold text-[var(--siya-text-secondary)]">
              Editable reply (scored) — use a full sentence or multi-sentence answer when probing rubrics
            </label>
            <textarea
              value={draft.transcript}
              onChange={(e) => setDraft({ ...draft, transcript: e.target.value })}
              rows={8}
              className="w-full rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] p-3 text-sm"
              placeholder="Paste or write the MA reply here…"
            />
            {draft.provider !== "typed-paste" ? (
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
            ) : null}
          </div>
        ) : null}
      </div>

      {latest ? <CalibrationBreakdown result={latest} /> : null}

      {history.length > 1 ? (
        <details className={`${portalCard} text-sm`} open>
          <summary className="cursor-pointer font-semibold">
            Prior runs this session ({history.length - 1}) — not persisted
          </summary>
          <ul className="mt-2 space-y-2 text-xs text-[var(--siya-text-secondary)]">
            {history.slice(1).map((r, i) => (
              <li key={`${r.scoredAt}-${i}`}>
                {new Date(r.scoredAt).toLocaleTimeString()} · G{r.grammar.score} · P{r.politeness.score}
                {r.relevance.skipped ? " · Rel skipped" : ` · Rel ${r.relevance.score}`}
                {r.safety.redFlagged ? " · RED FLAG" : ""} — “{r.confirmedText.slice(0, 80)}
                {r.confirmedText.length > 80 ? "…" : ""}”
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}

function CalibrationBreakdown({ result }: { result: SpokenCalibrationResult }) {
  const styleMuted = result.styleScoresDeemphasized;
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

      {styleMuted && result.styleScoresDeemphasizedNote ? (
        <div
          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
          data-style-scores-deemphasized="true"
        >
          <p className="font-semibold">Off-topic reply</p>
          <p className="mt-1 text-xs">{result.styleScoresDeemphasizedNote}</p>
          <p className="mt-1 text-xs text-amber-900/80">
            Raw scores are still shown below for audit — they are not a pass signal for this turn.
          </p>
        </div>
      ) : null}

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

      <section
        className={`space-y-1 rounded-xl border border-[var(--siya-border)] p-3 ${
          styleMuted ? "opacity-45" : ""
        }`}
        data-rubric="grammar"
        data-deemphasized={styleMuted ? "true" : "false"}
      >
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Grammar · {result.grammar.score}/100
          {styleMuted ? (
            <span className="ml-2 text-xs font-medium text-amber-900">(not meaningful — off-topic)</span>
          ) : null}
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

      <section
        className={`space-y-1 rounded-xl border border-[var(--siya-border)] p-3 ${
          styleMuted ? "opacity-45" : ""
        }`}
        data-rubric="politeness"
        data-deemphasized={styleMuted ? "true" : "false"}
      >
        <h2 className="font-semibold text-[var(--siya-primary)]">
          Politeness · {result.politeness.score}/100
          {styleMuted ? (
            <span className="ml-2 text-xs font-medium text-amber-900">(not meaningful — off-topic)</span>
          ) : null}
        </h2>
        <p className="text-xs text-[var(--siya-text-secondary)]">{result.politeness.note}</p>
        {result.politeness.toneFlags.length > 0 ? (
          <p className="text-xs font-medium text-amber-900">
            Tone: dismissive/blaming — {result.politeness.toneFlags.join("; ")}
          </p>
        ) : null}
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

      <section className="space-y-1 rounded-xl border border-[var(--siya-border)] p-3" data-rubric="relevance">
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
                <li>Fit: {result.relevance.turn.fit}</li>
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
