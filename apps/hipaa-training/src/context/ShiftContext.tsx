"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled, isPortalLoginRequired } from "@/lib/trainingConfig";
import {
  fetchShiftState,
  ensureActiveShift,
  startShift as apiStart,
  endShift as apiEnd,
  setShiftPresence as apiPresence,
  type ShiftState,
  type ShiftMood,
  type PresenceStatus,
} from "@/lib/shift-api";
import {
  normalizePresence,
  ritualForTransition,
  type ShiftRitualKind,
} from "@/lib/shift-presence";

type ShiftContextValue = {
  shiftReady: boolean;
  onShift: boolean;
  presence: PresenceStatus;
  state: ShiftState | null;
  refreshShift: () => Promise<void>;
  startShift: (workShift: "morning" | "evening" | "night") => Promise<void>;
  endShift: (payload: {
    mood?: ShiftMood;
    reflection?: string;
    todayLearned?: string;
    accomplishments?: string;
    memoryImportance?: import("@/lib/memory-api").MemoryImportance;
  }) => Promise<{ shiftEndEventId?: string }>;
  setPresence: (status: PresenceStatus) => Promise<void>;
  ritual: ShiftRitualKind;
  clearRitual: () => void;
};

const ShiftContext = createContext<ShiftContextValue | null>(null);

export function ShiftProvider({ children }: { children: ReactNode }) {
  const { token, authReady, user } = useAuth();
  const [state, setState] = useState<ShiftState | null>(null);
  const [shiftReady, setShiftReady] = useState(false);
  const [ritual, setRitual] = useState<ShiftRitualKind>(null);

  const enabled = isPortalLoginRequired() && isPortalAuthEnabled();

  const refreshShift = useCallback(async () => {
    if (!enabled || !token) {
      setState(null);
      setShiftReady(true);
      return;
    }
    try {
      let next = await fetchShiftState();
      if (!next.active) {
        try {
          next = await ensureActiveShift("morning");
        } catch {
          /* login may have started shift; still show empty state + Start shift in header */
        }
      }
      setState(next);
    } catch {
      setState({ active: null, recent: [] });
    } finally {
      setShiftReady(true);
    }
  }, [enabled, token]);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !enabled) {
      setShiftReady(true);
      return;
    }
    void refreshShift();
  }, [authReady, user, enabled, refreshShift]);

  const startShift = useCallback(
    async (workShift: "morning" | "evening" | "night") => {
      const next = await apiStart(workShift);
      setState(next);
    },
    [],
  );

  const endShift = useCallback(
    async (payload: {
      mood?: ShiftMood;
      reflection?: string;
      todayLearned?: string;
      accomplishments?: string;
    }) => {
      const next = await apiEnd(payload);
      setState(next);
      setRitual(null);
      return { shiftEndEventId: next.shiftEndEventId };
    },
    [],
  );

  const setPresence = useCallback(
    async (status: PresenceStatus) => {
      const prev = normalizePresence(state?.active?.presence);
      const next = await apiPresence(status);
      setState(next);
      setRitual(ritualForTransition(prev, normalizePresence(status)));
    },
    [state?.active?.presence],
  );

  const clearRitual = useCallback(() => setRitual(null), []);

  const presence: PresenceStatus = normalizePresence(state?.active?.presence);

  const value = useMemo(
    () => ({
      shiftReady,
      onShift: Boolean(state?.active),
      presence,
      state,
      refreshShift,
      startShift,
      endShift,
      setPresence,
      ritual,
      clearRitual,
    }),
    [shiftReady, state, presence, refreshShift, startShift, endShift, setPresence, ritual, clearRitual],
  );

  return <ShiftContext.Provider value={value}>{children}</ShiftContext.Provider>;
}

export function useShift(): ShiftContextValue {
  const ctx = useContext(ShiftContext);
  if (!ctx) throw new Error("useShift must be used within ShiftProvider");
  return ctx;
}

/** Safe when shift provider optional (local dev without portal). */
export function useShiftOptional(): ShiftContextValue | null {
  return useContext(ShiftContext);
}
