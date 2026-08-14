import { getStaffApiUrl } from "./staffApiConfig";
import { getStoredToken } from "./authStorage";

export type ClinicProfile = {
  clinicName: string;
  doctorName: string;
  degree: string;
  regNo: string;
  clinicContact: string;
  clinicAddress: string;
  logoDataUrl: string | null;
  signatureDataUrl: string | null;
  updatedAt: string | null;
};

async function clinicFetch(path: string, init?: RequestInit) {
  const base = getStaffApiUrl();
  const token = getStoredToken();
  if (!base || !token) throw new Error("Sign in required.");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string; profile?: ClinicProfile };
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export async function fetchClinicProfile(): Promise<ClinicProfile> {
  const data = await clinicFetch("/api/clinic-profile");
  if (!data.profile) {
    return {
      clinicName: "",
      doctorName: "",
      degree: "",
      regNo: "",
      clinicContact: "",
      clinicAddress: "",
      logoDataUrl: null,
      signatureDataUrl: null,
      updatedAt: null,
    };
  }
  return data.profile;
}

export async function saveClinicProfile(payload: {
  clinicName: string;
  doctorName: string;
  degree: string;
  regNo: string;
  clinicContact: string;
  clinicAddress: string;
  logoDataUrl?: string | null;
  signatureDataUrl?: string | null;
  clearLogo?: boolean;
  clearSignature?: boolean;
}): Promise<ClinicProfile> {
  const data = await clinicFetch("/api/clinic-profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  if (!data.profile) throw new Error("Save succeeded but no profile returned.");
  return data.profile;
}
