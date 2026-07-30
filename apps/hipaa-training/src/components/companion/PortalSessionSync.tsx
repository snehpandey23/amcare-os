"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  loadLevelUpProgress,
  saveLevelUpProgress,
} from "@/lib/level-up/progress";
import {
  mergeLevelUpProgress,
  pullLevelUpFromServer,
  pushLevelUpToServer,
} from "@/lib/level-up/progress-api";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import {
  loadLocalProgress,
  pullProgressFromServer,
  persistProgress,
} from "@/lib/progressStorage";
import {
  hydratePortalProfile,
  pullPortalProfile,
  persistPortalProfile,
} from "@/lib/portal-profile-api";

/** After login: merge Level Up + HIPAA training from server. */
export function PortalSessionSync() {
  const { authReady, token, user } = useAuth();

  useEffect(() => {
    if (!authReady || !isPortalAuthEnabled() || !token) return;
    void (async () => {
      const remoteLevel = await pullLevelUpFromServer(token);
      const localLevel = loadLevelUpProgress();
      const merged = mergeLevelUpProgress(localLevel, remoteLevel);
      saveLevelUpProgress(merged);
      if (!remoteLevel || merged.totalXp > remoteLevel.totalXp) {
        await pushLevelUpToServer(merged);
      }

      const remoteTraining = await pullProgressFromServer(token);
      const localTraining = loadLocalProgress("other");
      let training = remoteTraining ?? localTraining;
      if (user?.name?.trim() && !training.learnerName) {
        training = { ...training, learnerName: user.name.trim() };
      }
      persistProgress(training);

      const remoteProfile = await pullPortalProfile(token);
      const mergedProfile = hydratePortalProfile(remoteProfile);
      persistPortalProfile(mergedProfile, user?.id);
      window.dispatchEvent(new CustomEvent("siya-portal-profile-updated"));
    })();
  }, [authReady, token, user?.id, user?.name]);

  return null;
}
