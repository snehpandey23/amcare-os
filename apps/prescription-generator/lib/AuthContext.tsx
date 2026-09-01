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
import { getStaffApiUrl, isStaffAuthConfigured } from "./staffApiConfig";
import { getStoredToken, setStoredToken } from "./authStorage";

export type StaffUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
};

type AuthContextValue = {
  user: StaffUser | null;
  token: string | null;
  authReady: boolean;
  authConfigured: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<StaffUser | null>;
  apiUrl: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StaffUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const authConfigured = useMemo(() => isStaffAuthConfigured(), []);
  const apiUrl = useMemo(() => getStaffApiUrl(), []);

  const refreshUser = useCallback(async (): Promise<StaffUser | null> => {
    const t = getStoredToken();
    const base = getStaffApiUrl();
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
      const data = (await res.json()) as StaffUser;
      setUser(data);
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
        if (authConfigured) {
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
  }, [authConfigured, refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const base = getStaffApiUrl();
    if (!base) throw new Error("Staff auth API URL is not configured.");
    const em = email.trim().toLowerCase();
    const pw = password.trim();
    if (!em || !pw) throw new Error("Enter your work email and password.");
    const res = await fetch(`${base}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em, password: pw }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      token?: string;
      user?: StaffUser;
      error?: string;
    };
    if (!res.ok || !data.token) {
      throw new Error(data.error || "Sign-in failed.");
    }
    setStoredToken(data.token);
    setToken(data.token);
    if (data.user) setUser(data.user);
    else await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(() => {
    setStoredToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      authReady,
      authConfigured,
      login,
      logout,
      refreshUser,
      apiUrl,
    }),
    [user, token, authReady, authConfigured, login, logout, refreshUser, apiUrl],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
