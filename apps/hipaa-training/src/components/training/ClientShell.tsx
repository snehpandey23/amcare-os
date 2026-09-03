"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { TrainingLayout } from "./TrainingLayout";
import { AssistantShell } from "@/components/siya/AssistantShell";
import { SiyaLoadingScreen } from "@/components/siya/SiyaLoadingScreen";
import { TourCoachBar } from "@/components/onboarding/TourCoachBar";
import { PortalTourProvider } from "@/context/PortalTourContext";
import { useClientProgress } from "@/hooks/useClientProgress";
import { useAuth } from "@/context/AuthContext";
import { useShiftOptional } from "@/context/ShiftContext";
import { isPortalLoginRequired } from "@/lib/trainingConfig";
import { getModulesForRole } from "@/content/modules";
import { canUsePortalWithoutOnboarding, loadLocalPortalProfile } from "@/lib/portal-profile";
import { isPortalAdmin } from "@/lib/portal-role";

/** Unauthenticated auth pages — no portal chrome / login redirect. */
function isPublicAuthPath(path: string) {
  return (
    path === "/login" ||
    path === "/forgot-password" ||
    path.startsWith("/reset-password")
  );
}

function isAssistantRoute(path: string) {
  return (
    path === "/" ||
    path === "/help" ||
    path.startsWith("/resources") ||
    path.startsWith("/learn") ||
    path.startsWith("/level-up") ||
    path.startsWith("/grow") ||
    path.startsWith("/memory") ||
    path.startsWith("/account") ||
    path.startsWith("/admin") ||
    path.startsWith("/team") ||
    path.startsWith("/chat-review") ||
    path.startsWith("/onboarding") ||
    path.startsWith("/product-tour") ||
    path === "/feedback" ||
    path.startsWith("/feedback/") ||
    path === "/start-shift"
  );
}

function isTrainingRoute(path: string) {
  return (
    path.startsWith("/training") ||
    path.startsWith("/module") ||
    path.startsWith("/final") ||
    path.startsWith("/results") ||
    path.startsWith("/certificate")
  );
}

function ClientShellRoutes({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { authReady, authRequired, user } = useAuth();
  const portalGate = isPortalLoginRequired();
  const shift = useShiftOptional();
  const { progress, hydrated } = useClientProgress();

  const assistantRoute = isAssistantRoute(pathname);
  const trainingRoute = isTrainingRoute(pathname);
  const publicAuth = isPublicAuthPath(pathname);

  useEffect(() => {
    if (!authReady || (!authRequired && !portalGate)) return;
    if (user && publicAuth) {
      router.replace(canUsePortalWithoutOnboarding(loadLocalPortalProfile()) ? "/" : "/onboarding");
    }
  }, [authReady, authRequired, portalGate, user, pathname, router, publicAuth]);

  useEffect(() => {
    if (!authReady) return;
    if (portalGate) {
      if (!user && !publicAuth) router.replace("/login");
      return;
    }
    if (!authRequired) return;
    if (!trainingRoute && !publicAuth) return;
    if (!user && !publicAuth) router.replace("/login");
  }, [authReady, authRequired, portalGate, user, pathname, router, trainingRoute, publicAuth]);

  useEffect(() => {
    if (!authReady || !portalGate || !user) return;
    if (pathname === "/trust" && !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    if (publicAuth || pathname.startsWith("/onboarding")) return;
    if (pathname === "/trust" && isPortalAdmin(user.role)) return;
    const profile = loadLocalPortalProfile();
    if (!canUsePortalWithoutOnboarding(profile) && pathname !== "/onboarding") {
      router.replace("/onboarding");
    }
  }, [authReady, portalGate, user, pathname, router, publicAuth]);

  useEffect(() => {
    if (!authReady || !portalGate || !user || !shift?.shiftReady) return;
    if (publicAuth || pathname.startsWith("/onboarding")) return;
    if (pathname === "/start-shift") {
      if (shift.onShift) router.replace("/");
    }
  }, [authReady, portalGate, user, shift?.shiftReady, shift?.onShift, pathname, router, publicAuth]);

  if (portalGate && !authReady) {
    return <SiyaLoadingScreen variant="boot" message="Loading employee portal…" />;
  }

  if (portalGate && !user && !publicAuth) {
    return <SiyaLoadingScreen variant="boot" message="Redirecting to sign in…" />;
  }

  if (pathname === "/trust" && portalGate && user && !isPortalAdmin(user.role)) {
    return <SiyaLoadingScreen variant="boot" message="Redirecting…" />;
  }

  if (pathname === "/onboarding" || pathname === "/product-tour" || publicAuth) {
    return <>{children}</>;
  }

  if (portalGate && user && !publicAuth) {
    const profile = loadLocalPortalProfile();
    const trustOk = pathname === "/trust" && isPortalAdmin(user.role);
    if (!trustOk && !canUsePortalWithoutOnboarding(profile) && !pathname.startsWith("/onboarding")) {
      return <SiyaLoadingScreen message="Setting up your workspace…" />;
    }
  }

  if (assistantRoute) {
    return <AssistantShell>{children}</AssistantShell>;
  }

  if (!authReady) {
    return <SiyaLoadingScreen variant="boot" />;
  }

  if (authRequired && !user && trainingRoute) {
    return <SiyaLoadingScreen variant="boot" message="Redirecting to sign in…" />;
  }

  if (isTrainingRoute(pathname)) {
    if (!hydrated || (authRequired && user && !progress)) {
      return <SiyaLoadingScreen message="Loading certification progress…" />;
    }
    const modules = getModulesForRole(progress?.role ?? "other");
    return (
      <AssistantShell>
        <TrainingLayout modules={modules} progress={progress}>
          {children}
        </TrainingLayout>
      </AssistantShell>
    );
  }

  return <AssistantShell>{children}</AssistantShell>;
}

/** Single tour provider + coach bar; splash owned by BrandIntroBootProvider in root layout. */
export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <PortalTourProvider>
      <ClientShellRoutes>{children}</ClientShellRoutes>
      <TourCoachBar />
    </PortalTourProvider>
  );
}
