"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  answerSopBuilderQuestion,
  fetchSopBuilderAccess,
  fetchSopBuilderSessions,
  generateSopBuilderDraft,
  resumeSopBuilderSession,
  startSopBuilderInterview,
  SopBuilderUnavailableError,
  type SopBuilderSessionRecord,
} from "@/lib/sop-builder-api";
import { MAX_QUESTIONS, MIN_QUESTIONS } from "@/lib/sop-builder-assist";
import Link from "next/link";
import {
  portalCard,
  portalH2,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessBox,
  portalStatusSuccessText,
  portalStatusWarnBox,
  portalStatusWarnText,
} from "@/lib/portal-ui";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { SopBuilderReview } from "@/components/sop-builder/SopBuilderReview";

type Phase = "topic" | "interview" | "review";

type Props = { initialResumeId?: string | null; initialTopic?: string };

export function SopBuilderWizard({ initialResumeId = null, initialTopic = "" }: Props) {
  const [access, setAccess] = useState<{ canBuild: boolean; isAdmin: boolean } | null>(null);
  const [topic, setTopic] = useState(initialTopic);
  const [llmUnavailable, setLlmUnavailable] = useState(false);
  const [llmIssue, setLlmIssue] = useState<{ code: string; kind: string; message: string } | null>(null);
  const [session, setSession] = useState<SopBuilderSessionRecord | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const [readyToDraft, setReadyToDraft] = useState(false);
  const [phase, setPhase] = useState<Phase>("topic");
  const [resumable, setResumable] = useState<SopBuilderSessionRecord[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const answerCount = useMemo(
    () => session?.transcript.filter((e) => e.role === "user").length ?? 0,
    [session],
  );

  const progressLabel = useMemo(() => {
    if (readyToDraft) return "Ready to generate draft";
    const target = MIN_QUESTIONS;
    return `Question ${Math.min(answerCount + 1, MAX_QUESTIONS)} · ~${target}–${MAX_QUESTIONS} total`;
  }, [answerCount, readyToDraft]);

  const load = useCallback(async () => {
    try {
      const [acc, sessions] = await Promise.all([fetchSopBuilderAccess(), fetchSopBuilderSessions()]);
      setAccess(acc);
      setResumable(sessions);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (initialResumeId) void onResume(initialResumeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- resume once when deep-linked
  }, [initialResumeId]);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  async function onStart(e: React.FormEvent) {
    e.preventDefault();
    if (!topic.trim()) return;
    setPending(true);
    setError(null);
    setLlmUnavailable(false);
    setLlmIssue(null);
    try {
      const result = await startSopBuilderInterview(topic.trim());
      setSession(result.session);
      setCurrentQuestion(result.questions[0] ?? null);
      setReadyToDraft(result.readyToDraft);
      setPhase("interview");
      setAnswer("");
      await load();
    } catch (err) {
      if (err instanceof SopBuilderUnavailableError) {
        setLlmUnavailable(true);
        setLlmIssue({ code: err.code, kind: err.kind, message: err.message });
        setError(null);
      } else {
        setError(err instanceof Error ? err.message : "Could not start");
      }
    } finally {
      setPending(false);
    }
  }

  async function onResume(id: string) {
    setPending(true);
    setError(null);
    try {
      const result = await resumeSopBuilderSession(id);
      setSession(result.session);
      if (result.session.status === "draft_ready" || result.session.status === "submitted") {
        if (result.session.draftJson) {
          setPhase("review");
          return;
        }
      }
      setCurrentQuestion(result.pendingQuestion);
      setReadyToDraft(result.readyToDraft);
      setPhase("interview");
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resume");
    } finally {
      setPending(false);
    }
  }

  async function submitAnswer(skipped: boolean) {
    if (!session) return;
    setPending(true);
    setError(null);
    try {
      const result = await answerSopBuilderQuestion(session.id, skipped ? "" : answer.trim(), skipped);
      setSession(result.session);
      setCurrentQuestion(result.question);
      setReadyToDraft(result.readyToDraft);
      setAnswer("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save answer");
    } finally {
      setPending(false);
    }
  }

  async function onGenerateDraft() {
    if (!session) return;
    setPending(true);
    setError(null);
    try {
      const result = await generateSopBuilderDraft(session.id);
      setSession(result.session);
      setPhase("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Draft failed");
    } finally {
      setPending(false);
    }
  }

  if (!access?.canBuild) {
    return (
      <p className="text-sm text-[var(--siya-text-muted)]">
        Admin or department lead access is required to build operational checklists.
      </p>
    );
  }

  if (phase === "review" && session?.draftJson) {
    return (
      <SopBuilderReview
        session={session}
        isAdmin={access.isAdmin}
        onBack={() => setPhase("interview")}
        onPublished={() => {
          setSession(null);
          setPhase("topic");
          setTopic("");
          void load();
        }}
      />
    );
  }

  if (phase === "interview" && session) {
    return (
      <div className="space-y-4">
        <div className={portalCard}>
          <p className="text-xs font-medium uppercase text-[var(--siya-text-muted)]">{session.topic}</p>
          <p className="mt-1 text-xs text-[var(--siya-text-secondary)]">{progressLabel}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--siya-bg-subtle)]">
            <div
              className="h-full rounded-full bg-[var(--siya-accent)] transition-all"
              style={{ width: `${Math.min(100, (answerCount / MAX_QUESTIONS) * 100)}%` }}
            />
          </div>
        </div>

        {currentQuestion ? (
          <div className={portalCard}>
            <p className="text-sm font-medium text-[var(--siya-primary)]">{currentQuestion}</p>
            <textarea
              rows={3}
              placeholder="Your answer…"
              className="mt-3 w-full rounded-lg border border-[var(--siya-border)] px-3 py-2 text-sm"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pending || !answer.trim()}
                className={trainingLinkPrimaryClass}
                onClick={() => void submitAnswer(false)}
              >
                {pending ? "Saving…" : "Next"}
              </button>
              <button
                type="button"
                disabled={pending}
                className="rounded-lg border border-[var(--siya-border)] px-4 py-2 text-sm font-medium"
                onClick={() => void submitAnswer(true)}
              >
                Skip / don&apos;t know
              </button>
            </div>
          </div>
        ) : null}

        {readyToDraft ? (
          <div className={`${portalStatusSuccessBox} p-4`}>
            <p className={`text-sm ${portalStatusSuccessText}`}>You&apos;ve answered enough — ready to generate a checklist draft.</p>
            <button
              type="button"
              disabled={pending}
              className={`mt-3 ${trainingLinkPrimaryClass}`}
              onClick={() => void onGenerateDraft()}
            >
              {pending ? "Generating…" : "Generate draft"}
            </button>
          </div>
        ) : null}

        {error ? <p className={`text-sm ${portalStatusErrorText}`}>{error}</p> : null}

        <button
          type="button"
          className="text-xs text-[var(--siya-text-muted)] underline"
          onClick={() => {
            setPhase("topic");
            setSession(null);
          }}
        >
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onStart} className={`${portalSection}`}>
        <h2 className={portalH2}>Build a daily checklist SOP</h2>
        <p className="mt-1 text-xs text-[var(--siya-text-muted)]">
          AI will interview you about the process, then draft checklist steps for My day. Nothing goes live until an admin
          approves.
        </p>
        <label className="mt-4 block text-xs font-medium text-[var(--siya-text-muted)]">
          Topic / title
          <TrainingInput
            required
            placeholder="e.g. New patient intake"
            className="mt-1 w-full"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
        {llmUnavailable ? (
          <div className={`mt-4 p-4 text-sm ${portalStatusWarnBox} ${portalStatusWarnText}`}>
            <p className="font-medium">
              {llmIssue?.code === "llm_disabled"
                ? "Workforce AI is turned off"
                : llmIssue?.code === "llm_billing"
                  ? "AI Gateway billing blocked"
                  : llmIssue?.code === "llm_auth"
                    ? "AI Gateway authentication failed"
                    : llmIssue?.code === "llm_quota"
                      ? "AI Gateway quota / rate limit"
                      : "AI interview failed"}
            </p>
            <p className="mt-1 text-xs">
              {llmIssue?.message ||
                "AI generation failed. You can still write a department policy SOP manually, or ask an admin to add checklist steps under Task templates."}
            </p>
            {llmIssue?.code ? (
              <p className="mt-2 font-mono text-[10px] opacity-80">code: {llmIssue.code}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
              <Link href="/memory/knowledge/sops" className="text-[var(--siya-accent)] underline">
                Department SOP workspace
              </Link>
              {access?.isAdmin ? (
                <Link href="/admin/task-templates" className="text-[var(--siya-accent)] underline">
                  Task templates (admin)
                </Link>
              ) : null}
            </div>
          </div>
        ) : null}
        {error && !llmUnavailable ? <p className={`mt-3 text-sm ${portalStatusErrorText}`}>{error}</p> : null}
        <button type="submit" disabled={pending || !topic.trim()} className={`mt-4 ${trainingLinkPrimaryClass}`}>
          {pending ? "Starting…" : "Start interview"}
        </button>
      </form>

      {resumable.length > 0 ? (
        <section className={portalCard}>
          <h3 className="text-sm font-semibold text-[var(--siya-primary)]">Resume a session</h3>
          <ul className="mt-2 space-y-2">
            {resumable.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span>
                  {s.topic}{" "}
                  <span className="text-xs text-[var(--siya-text-muted)]">
                    ({s.status === "draft_ready" ? "draft ready" : "in progress"})
                  </span>
                </span>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--siya-accent)]"
                  onClick={() => void onResume(s.id)}
                >
                  Resume
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
