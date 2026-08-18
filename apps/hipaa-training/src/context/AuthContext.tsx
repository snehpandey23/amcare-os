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
import {
  getTrainingApiUrl,
  isPublicRegistrationEnabled,
  isPortalAuthEnabled,
  isTrainingAuthRequired,
} from "@/lib/trainingConfig";
import { getStoredToken, setStoredToken } from "@/lib/authStorage";
import { bindPortalProfileToUser, clearPortalProfileBinding } from "@/lib/portal-profile";
import { clearAssistSession } from "@/lib/assist-session";

export type TrainingUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type AuthContextValue = {
  user: TrainingUser | null;
  token: string | null;
  authReady: boolean;
  authRequired: boolean;
  allowRegister: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<TrainingUser | null>;
  apiUrl: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TrainingUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const apiUrl = useMemo(() => getTrainingApiUrl(), []);
  const authRequired = useMemo(() => isTrainingAuthRequired(), []);
  const sessionEnabled = useMemo(
    () => isTrainingAuthRequired() || isPortalAuthEnabled(),
    [],
  );
  const allowRegister = useMemo(() => isPublicRegistrationEnabled(), []);

  const refreshUser = useCallback(async (): Promise<TrainingUser | null> => {
    const t = getStoredToken();
    const base = getTrainingApiUrl();
    if (!t || !base) {
      setUser(null);
      setToken(null);
      return null;
    }
    setToken(t);
    try {
      const res = await fetch(`${base}/api/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) {
        setStoredToken(null);
        setUser(null);
        setToken(null);
        return null;
      }
      const data = (await res.json()) as TrainingUser;
      setUser(data);
      bindPortalProfileToUser(data.id);
      return data;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        if (sessionEnabled) {
          await Promise.race([
            refreshUser(),
            new Promise<void>((resolve) => window.setTimeout(resolve, 12_000)),
          ]);
        }
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionEnabled, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const base = getTrainingApiUrl();
      if (!base) throw new Error("Training API URL is not configured.");
      const em = email.trim().toLowerCase();
      const pw = password.trim();
      if (!em || !pw) throw new Error("Enter your work email and password.");
      let res: Response;
      try {
        res = await fetch(`${base}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: em, password: pw }),
        });
      } catch {
        throw new Error(
          "Could not reach the sign-in service. Refresh the page, try Chrome/Safari (not an in-app browser), turn off VPN/ad blockers, or switch Wi‑Fi/mobile data. If it persists, tell IT the staff portal loads but sign-in does not.",
        );
      }
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok) {
        throw new Error(
          data.error ||
            (res.status === 404
              ? "Sign-in service misconfigured (404). Hard refresh and try again."
              : `Login failed (${res.status})`),
        );
      }
      if (!data.token) throw new Error("No token returned");
      clearAssistSession();
      setStoredToken(data.token);
      setToken(data.token);
      const me = await refreshUser();
      if (!me) {
        throw new Error(
          "Sign-in worked but we could not load your account. Check your connection, refresh once, or try typing the password (avoid copy-paste hidden spaces).",
        );
      }
    },
    [refreshUser],
  );

  const register = useCallback(
    async (email: string, password: string, name?: string) => {
      const base = getTrainingApiUrl();
      if (!base) throw new Error("Training API URL is not configured.");
      const res = await fetch(`${base}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Registration failed");
      if (!data.token) throw new Error("No token returned");
      clearAssistSession();
      setStoredToken(data.token);
      setToken(data.token);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    clearAssistSession();
    setStoredToken(null);
    setToken(null);
    setUser(null);
    clearPortalProfileBinding();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authReady,
      authRequired,
      allowRegister,
      login,
      register,
      logout,
      refreshUser,
      apiUrl,
    }),
    [user, token, authReady, authRequired, allowRegister, login, register, logout, refreshUser, apiUrl]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
