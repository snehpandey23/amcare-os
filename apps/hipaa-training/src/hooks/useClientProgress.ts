"use client";

import { useCallback, useEffect, useState } from "react";
import type { ProgressState, WorkforceRole } from "@/lib/types";
import { loadProgress, saveProgress, setRole as persistRole, resetProgress } from "@/lib/progressStorage";

export function useClientProgress() {
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setProgress(loadProgress());
    setHydrated(true);
  }, []);

  const refresh = useCallback(() => {
    setProgress(loadProgress());
  }, []);

  const updateRole = useCallback((role: WorkforceRole) => {
    persistRole(role);
    refresh();
  }, [refresh]);

  const reset = useCallback(() => {
    resetProgress();
    refresh();
  }, [refresh]);

  const persist = useCallback((next: ProgressState) => {
    saveProgress(next);
    setProgress(next);
  }, []);

  return { progress, hydrated, refresh, updateRole, reset, persist };
}
