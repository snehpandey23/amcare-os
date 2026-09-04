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
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  appendGrowthEvent,
  bindPortalProfileToUser,
  loadLocalPortalProfile,
  type PortalProfile,
} from "@/lib/portal-profile";
import { persistPortalProfile } from "@/lib/portal-profile-api";
import {
  PORTAL_TOUR_STEPS,
  checkTourStepVerified,
  clearTourSessionFlags,
  currentTourStep,
  defaultPortalTourState,
  isPortalTourFinished,
  isPortalTourInProgress,
  isTourStepReadyToComplete,
  markTourSessionActive,
  normalizePortalTour,
  recordTourVisit,
  shouldOfferProductTour,
  tourProgressPercent,
  type PortalTourState,
} from "@/lib/portal-product-tour";

type PortalTourContextValue = {
  tourState: PortalTourState | null;
  active: boolean;
  stepIndex: number;
  stepReady: boolean;
  progressPct: number;
  startTour: () => void;
  dismissTour: () => void;
  completeCurrentStep: () => void;
  finishTour: () => void;
};

const PortalTourContext = createContext<PortalTourContextValue | null>(null);

export function usePortalTour(): PortalTourContextValue {
  const ctx = useContext(PortalTourContext);
  if (!ctx) {
    return {
      tourState: null,
      active: false,
      stepIndex: 0,
      stepReady: false,
      progressPct: 0,
      startTour: () => {},
      dismissTour: () => {},
      completeCurrentStep: () => {},
      finishTour: () => {},
    };
  }
  return ctx;
}

function saveTour(profile: PortalProfile, userId?: string) {
  persistPortalProfile(profile, userId);
}

export function PortalTourProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [profile, setProfile] = useState<PortalProfile>(() => loadLocalPortalProfile());
  const [stepReady, setStepReady] = useState(false);

  const tourState = profile.productTour ?? null;
  const active = isPortalTourInProgress(profile);
  const stepIndex = tourState?.currentStepIndex ?? 0;
  const step = currentTourStep(tourState ?? defaultPortalTourState());

  const refreshProfile = useCallback(() => {
    setProfile(loadLocalPortalProfile());
  }, []);

  useEffect(() => {
    window.addEventListener("siya-portal-profile-updated", refreshProfile);
    window.addEventListener("siya-portal-tour-updated", refreshProfile);
    return () => {
      window.removeEventListener("siya-portal-profile-updated", refreshProfile);
      window.removeEventListener("siya-portal-tour-updated", refreshProfile);
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (!active) return;
    recordTourVisit(pathname);
  }, [active, pathname]);

  useEffect(() => {
    if (!active) {
      setStepReady(false);
      return;
    }
    const recompute = () => setStepReady(isTourStepReadyToComplete(step));
    recompute();
    window.addEventListener("siya-portal-tour-updated", recompute);
    const id = window.setInterval(recompute, 1000);
    return () => {
      window.removeEventListener("siya-portal-tour-updated", recompute);
      window.clearInterval(id);
    };
  }, [active, step.id, step.kind, pathname]);

  const patchTour = useCallback(
    (patch: Partial<PortalTourState>) => {
      if (user?.id) bindPortalProfileToUser(user.id);
      const base = loadLocalPortalProfile();
      const prev = normalizePortalTour(base.productTour);
      const next: PortalTourState = normalizePortalTour({ ...prev, ...patch });
      let nextProfile: PortalProfile = { ...base, productTour: next };
      setProfile(nextProfile);
      saveTour(nextProfile, user?.id);
    },
    [user?.id],
  );

  const startTour = useCallback(() => {
    if (!user?.id) return;
    bindPortalProfileToUser(user.id);
    clearTourSessionFlags();
    markTourSessionActive();
    const base = loadLocalPortalProfile();
    let nextProfile: PortalProfile = {
      ...base,
      productTour: {
        ...defaultPortalTourState(),
        startedAt: Date.now(),
        currentStepIndex: 0,
        completedStepIds: [],
      },
    };
    nextProfile = appendGrowthEvent(nextProfile, "Started product tour");
    setProfile(nextProfile);
    saveTour(nextProfile, user?.id);
    // Hard nav — soft router.push often fails to leave /onboarding or /product-tour.
    window.location.assign("/");
  }, [user?.id]);

  const dismissTour = useCallback(() => {
    const base = loadLocalPortalProfile();
    const prev = normalizePortalTour(base.productTour);
    let nextProfile: PortalProfile = {
      ...base,
      productTour: { ...prev, dismissedAt: Date.now() },
    };
    nextProfile = appendGrowthEvent(nextProfile, "Dismissed product tour");
    setProfile(nextProfile);
    saveTour(nextProfile, user?.id);
    clearTourSessionFlags();
  }, [user?.id]);

  const completeCurrentStep = useCallback(() => {
    const base = loadLocalPortalProfile();
    const prev = normalizePortalTour(base.productTour);
    const stepNow = PORTAL_TOUR_STEPS[prev.currentStepIndex];
    if (!stepNow) return;
    if (!isTourStepReadyToComplete(stepNow) && stepNow.id !== "welcome") return;

    const completedStepIds = prev.completedStepIds.includes(stepNow.id)
      ? prev.completedStepIds
      : [...prev.completedStepIds, stepNow.id];

    const nextIndex = Math.min(prev.currentStepIndex + 1, PORTAL_TOUR_STEPS.length - 1);
    patchTour({ completedStepIds, currentStepIndex: nextIndex });
  }, [patchTour]);

  const finishTour = useCallback(() => {
    const base = loadLocalPortalProfile();
    const prev = normalizePortalTour(base.productTour);
    const allIds = PORTAL_TOUR_STEPS.map((s) => s.id);
    let nextProfile: PortalProfile = {
      ...base,
      productTour: {
        ...prev,
        finishedAt: Date.now(),
        completedStepIds: allIds,
        currentStepIndex: PORTAL_TOUR_STEPS.length - 1,
      },
    };
    nextProfile = appendGrowthEvent(nextProfile, "Completed product tour");
    setProfile(nextProfile);
    saveTour(nextProfile, user?.id);
    clearTourSessionFlags();
    router.push("/");
  }, [router, user?.id]);

  const value = useMemo(
    (): PortalTourContextValue => ({
      tourState,
      active,
      stepIndex,
      stepReady,
      progressPct: tourState ? tourProgressPercent(tourState) : 0,
      startTour,
      dismissTour,
      completeCurrentStep,
      finishTour,
    }),
    [tourState, active, stepIndex, stepReady, startTour, dismissTour, completeCurrentStep, finishTour],
  );

  return <PortalTourContext.Provider value={value}>{children}</PortalTourContext.Provider>;
}

export function shouldPromptProductTour(profile: PortalProfile | null | undefined): boolean {
  return shouldOfferProductTour(profile);
}
