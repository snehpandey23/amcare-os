import { getTrainingApiUrl } from "@/lib/trainingConfig";
import { getStoredToken } from "@/lib/authStorage";
import type { PortalProfile } from "@/lib/portal-profile";
import {
  bindPortalProfileToUser,
  defaultPortalProfile,
  loadLocalPortalProfile,
  saveLocalPortalProfile,
} from "@/lib/portal-profile";

export async function pullPortalProfile(token: string): Promise<PortalProfile | null> {
  const api = getTrainingApiUrl();
  if (!api) return null;
  try {
    const res = await fetch(`${api}/api/portal/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { profile: PortalProfile | null };
    return data.profile;
  } catch {
    return null;
  }
}

export async function pushPortalProfile(profile: PortalProfile): Promise<boolean> {
  const api = getTrainingApiUrl();
  const token = getStoredToken();
  if (!api || !token) return false;
  try {
    const res = await fetch(`${api}/api/portal/profile`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function persistPortalProfile(profile: PortalProfile, userId?: string) {
  if (userId) bindPortalProfileToUser(userId);
  saveLocalPortalProfile(profile);
  void pushPortalProfile(profile);
}

export function hydratePortalProfile(remote: PortalProfile | null): PortalProfile {
  const local = loadLocalPortalProfile();
  if (local.onboardingComplete && local.department) return local;
  if (remote?.onboardingComplete && remote.department) return remote;
  if (remote?.onboardingComplete) return { ...defaultPortalProfile(), ...remote };
  if (local.onboardingComplete) return local;
  return remote ? { ...defaultPortalProfile(), ...remote } : local;
}
