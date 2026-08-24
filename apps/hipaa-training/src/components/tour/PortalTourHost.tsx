"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useShiftOptional } from "@/context/ShiftContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { isPortalLoginRequired } from "@/lib/trainingConfig";
import { canUsePortalWithoutOnboarding, loadLocalPortalProfile } from "@/lib/portal-profile";
import {
  PORTAL_TOUR_EVENT,
  bindPortalTourToUser,
  consumePortalTourRerun,
  shouldAutoOfferPortalTour,
} from "@/lib/portal-tour";
import { PortalTour } from "@/components/tour/PortalTour";

const EXPAND_TODAY = "siya-portal-tour-expand-today";
const OPEN_MOBILE_NAV = "siya-portal-tour-open-mobile-nav";

export function dispatchTourExpandToday() {
  window.dispatchEvent(new CustomEvent(EXPAND_TODAY));
}

export function dispatchTourOpenMobileNav() {
  window.dispatchEvent(new CustomEvent(OPEN_MOBILE_NAV));
}

export function useTourExpandToday(handler: () => void) {
  useEffect(() => {
    const fn = () => handler();
    window.addEventListener(EXPAND_TODAY, fn);
    return () => window.removeEventListener(EXPAND_TODAY, fn);
  }, [handler]);
}

export function useTourOpenMobileNav(handler: () => void) {
  useEffect(() => {
    const fn = () => handler();
    window.addEventListener(OPEN_MOBILE_NAV, fn);
    return () => window.removeEventListener(OPEN_MOBILE_NAV, fn);
  }, [handler]);
}

/**
 * Staff first-run tour host — My day only. Admins skipped (no shift chrome).
 */
export function PortalTourHost() {
  const path = usePathname() ?? "/";
  const { user, authReady } = useAuth();
  const shift = useShiftOptional();
  const [open, setOpen] = useState(false);

  const tryOffer = useCallback(() => {
    if (!authReady || !user || !isPortalLoginRequired()) return;
    if (isPortalAdmin(user.role)) return;
    if (path !== "/") return;
    if (!canUsePortalWithoutOnboarding(loadLocalPortalProfile())) return;
    bindPortalTourToUser(user.id);
    const rerun = consumePortalTourRerun();
    if (rerun || shouldAutoOfferPortalTour()) {
      setOpen(true);
    }
  }, [authReady, user, path]);

  useEffect(() => {
    if (!user?.id) return;
    bindPortalTourToUser(user.id);
  }, [user?.id]);

  useEffect(() => {
    // After brand intro / morning brief settle
    const t = window.setTimeout(tryOffer, 700);
    return () => window.clearTimeout(t);
  }, [tryOffer]);

  useEffect(() => {
    const onTour = (e: Event) => {
      const detail = (e as CustomEvent<{ rerun?: boolean }>).detail;
      if (!detail?.rerun) return;
      if (path === "/") setOpen(true);
      // If not on My day yet, tryOffer after navigation consumes RERUN_KEY.
    };
    window.addEventListener(PORTAL_TOUR_EVENT, onTour);
    return () => window.removeEventListener(PORTAL_TOUR_EVENT, onTour);
  }, [path]);

  if (!open) return null;

  return (
    <PortalTour
      open={open}
      onShift={Boolean(shift?.onShift)}
      onExpandToday={() => dispatchTourExpandToday()}
      onOpenMobileNav={() => dispatchTourOpenMobileNav()}
      onClose={() => setOpen(false)}
    />
  );
}
