"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgressState, QuizAttemptRecord, WorkforceRole } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import {
  defaultState,
  loadLocalProgress,
  persistProgress,
  pullProgressFromServer,
  resetProgressRemote,
  saveLocalProgress,
  setLearnerName as persistLearnerName,
  setRole as persistRole,
  touchTime,
  updateAfterModuleQuiz as persistAfterModuleQuiz,
  updateFinalExam as persistFinalExam,
} from "@/lib/progressStorage";

export function useClientProgress() {
  const { token, authReady, authRequired, user } = useAuth();
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!authReady) return;
    void (async () => {
      if (!authRequired) {
        setProgress(loadLocalProgress("other"));
        setHydrated(true);
        return;
      }
      if (!token) {
        setProgress(null);
        setHydrated(true);
        return;
      }
      const remote = await pullProgressFromServer(token);
      const local = loadLocalProgress("other");
      let next: ProgressState = remote ?? local;
      if (user?.name?.trim() && !next.learnerName) {
        next = { ...next, learnerName: user.name.trim() };
      }
      persistProgress(next);
      setProgress(next);
      setHydrated(true);
    })();
  }, [authReady, authRequired, token, user?.id, user?.name]);

  useEffect(() => {
    if (!progress || !hydrated) return;
    const last = { t: Date.now() };
    const id = window.setInterval(() => {
      const now = Date.now();
      const delta = Math.min(120, Math.round((now - last.t) / 1000));
      last.t = now;
      if (delta <= 0) return;
      setProgress((p) => {
        if (!p) return p;
        return touchTime(delta, () => p);
      });
    }, 30_000);
    return () => window.clearInterval(id);
  }, [progress?.startedAt, hydrated]);

  const refresh = useCallback(async () => {
    if (authRequired && token) {
      const remote = await pullProgressFromServer(token);
      if (remote) {
        saveLocalProgress(remote);
        setProgress(remote);
      }
      return;
    }
    setProgress(loadLocalProgress("other"));
  }, [authRequired, token]);

  const updateRole = useCallback((role: WorkforceRole) => {
    setProgress((p) => persistRole(role, () => p ?? defaultState(role)));
  }, []);

  const updateLearnerName = useCallback((name: string) => {
    setProgress((p) => persistLearnerName(name, () => p ?? defaultState("other")));
  }, []);

  const afterModuleQuiz = useCallback(
    (moduleId: string, correct: number, total: number, attempts: QuizAttemptRecord[]) => {
      setProgress((p) => persistAfterModuleQuiz(moduleId, correct, total, attempts, () => p ?? defaultState("other")));
    },
    []
  );

  const afterFinalExam = useCallback((attempts: QuizAttemptRecord[], readiness: "ready" | "needs_review") => {
    setProgress((p) => persistFinalExam(attempts, readiness, () => p ?? defaultState("other")));
  }, []);

  const reset = useCallback(async () => {
    await resetProgressRemote();
    const fresh = defaultState("other");
    setProgress(fresh);
  }, []);

  const persist = useCallback((next: ProgressState) => {
    persistProgress(next);
    setProgress(next);
  }, []);

  return {
    progress,
    hydrated,
    refresh,
    updateRole,
    updateLearnerName,
    reset,
    persist,
    afterModuleQuiz,
    afterFinalExam,
  };
}
