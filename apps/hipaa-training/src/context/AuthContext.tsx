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
  isTrainingAuthRequired,
} from "@/lib/trainingConfig";
import { getStoredToken, setStoredToken } from "@/lib/authStorage";

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
  refreshUser: () => Promise<void>;
  apiUrl: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TrainingUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const apiUrl = useMemo(() => getTrainingApiUrl(), []);
  const authRequired = useMemo(() => isTrainingAuthRequired(), []);
  const allowRegister = useMemo(() => isPublicRegistrationEnabled(), []);

  const refreshUser = useCallback(async () => {
    const t = getStoredToken();
    const base = getTrainingApiUrl();
    if (!t || !base) {
      setUser(null);
      setToken(null);
      return;
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
        return;
      }
      const data = (await res.json()) as TrainingUser;
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      if (!authRequired) {
        setAuthReady(true);
        return;
      }
      await refreshUser();
      setAuthReady(true);
    })();
  }, [authRequired, refreshUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      const base = getTrainingApiUrl();
      if (!base) throw new Error("Training API URL is not configured.");
      const res = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Login failed");
      if (!data.token) throw new Error("No token returned");
      setStoredToken(data.token);
      setToken(data.token);
      await refreshUser();
    },
    [refreshUser]
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
      setStoredToken(data.token);
      setToken(data.token);
      await refreshUser();
    },
    [refreshUser]
  );

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
