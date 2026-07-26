"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isTrainingAuthRequired } from "@/lib/trainingConfig";
import { BRAND } from "@/lib/brand";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { login, register, allowRegister, user, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!allowRegister) setMode("login");
  }, [allowRegister]);

  if (!isTrainingAuthRequired()) {
    return (
      <div className="siya-page-bg flex min-h-screen flex-col items-center justify-center p-6">
        <p className="max-w-md text-center text-[var(--siya-text-secondary)]">
          Sign-in is not configured. Set{" "}
          <code className="rounded bg-[var(--siya-bg-subtle)] px-1">NEXT_PUBLIC_HIPAA_TRAINING_API_URL</code> to enable
          accounts, or open the{" "}
          <Link href="/" className="text-[var(--siya-accent)] underline">
            assistant
          </Link>{" "}
          for local-only progress.
        </p>
      </div>
    );
  }

  if (authReady && user) {
    router.replace("/");
    return null;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (mode === "register") {
        await register(email, password, name.trim() || undefined);
      } else {
        await login(email, password);
      }
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="siya-page-bg flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-white p-8 shadow-[var(--siya-shadow-lg)]">
        <Image src="/assets/images/siya-health-logo.png" alt="Siya Health" width={140} height={42} className="h-9 w-auto" />
        <h1 className="mt-6 font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
          Sign in to {BRAND.appName}
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">Workforce accounts sync certification progress.</p>

        {allowRegister ? (
          <div className="mt-4 flex gap-2 rounded-lg bg-[var(--siya-bg-subtle)] p-1">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "login" ? "bg-white shadow text-[var(--siya-primary)]" : "text-[var(--siya-text-muted)]"
              }`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium ${
                mode === "register" ? "bg-white shadow text-[var(--siya-primary)]" : "text-[var(--siya-text-muted)]"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-900/90">Self-registration is off — ask your administrator for an account.</p>
        )}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === "register" ? (
            <label className="block">
              <span className="text-xs font-medium text-[var(--siya-text-muted)]">Full name</span>
              <TrainingInput type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </label>
          ) : null}
          <label className="block">
            <span className="text-xs font-medium text-[var(--siya-text-muted)]">Email</span>
            <TrainingInput type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1" />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--siya-text-muted)]">Password</span>
            <TrainingInput
              type="password"
              required
              autoComplete={mode === "register" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button type="submit" disabled={pending || (mode === "register" && !allowRegister)} className={`w-full ${trainingLinkPrimaryClass} justify-center`}>
            {pending ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
