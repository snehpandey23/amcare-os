"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useBrandIntroBoot } from "@/context/BrandIntroBootContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { canUsePortalWithoutOnboarding, loadLocalPortalProfile } from "@/lib/portal-profile";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";

function portalLandingPath(): string {
  return canUsePortalWithoutOnboarding(loadLocalPortalProfile()) ? "/" : "/onboarding";
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetOk = searchParams.get("reset") === "1";
  const { login, register, allowRegister, user, authReady } = useAuth();
  const { splashDismissed, phase } = useBrandIntroBoot();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!allowRegister) setMode("login");
  }, [allowRegister]);

  if (!isPortalAuthEnabled()) {
    return (
      <div className="siya-page-bg flex min-h-screen flex-col items-center justify-center p-6">
        <p className="max-w-md text-center text-sm text-[var(--siya-text-secondary)]">
          Sign-in is not configured.{" "}
          <Link href="/" className="text-[var(--siya-accent)] underline">
            Continue locally
          </Link>
        </p>
      </div>
    );
  }

  if (authReady && user) {
    router.replace(portalLandingPath());
    return null;
  }

  if (phase === "pending" || !splashDismissed) {
    return <div className="siya-page-bg min-h-screen" aria-hidden />;
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
      router.replace(portalLandingPath());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="siya-page-bg flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm text-center">
        <div className="flex justify-center">
          <SiyaWordmark size="login" />
        </div>
        <h1 className="mt-8 text-lg font-medium tracking-tight text-[var(--siya-text)]">
          Staff portal
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">
          Sign in for My day, training, and team coordination.
        </p>
        {resetOk ? (
          <p className="mt-3 text-sm text-emerald-700">
            Password updated. Sign in with your new password.
          </p>
        ) : null}

        <form onSubmit={onSubmit} className="mt-8 text-left">
          {mode === "register" ? (
            <label className="block">
              <span className="text-xs font-medium text-[var(--siya-text-muted)]">Full name</span>
              <TrainingInput
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1"
              />
            </label>
          ) : null}
          <label className={`block ${mode === "register" ? "mt-4" : ""}`}>
            <span className="text-xs font-medium text-[var(--siya-text-muted)]">Work email</span>
            <TrainingInput
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
            />
          </label>
          <label className="mt-4 block">
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
          {mode === "login" ? (
            <p className="mt-2 text-right text-xs">
              <Link href="/forgot-password" className="font-semibold text-[var(--siya-accent)] hover:underline">
                Forgot password?
              </Link>
            </p>
          ) : null}
          {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={pending || (mode === "register" && !allowRegister)}
            className={`mt-5 w-full ${trainingLinkPrimaryClass} justify-center`}
          >
            {pending ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          </button>
        </form>

        {allowRegister ? (
          <p className="mt-4 text-xs text-[var(--siya-text-muted)]">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--siya-accent)] hover:underline"
                  onClick={() => setMode("register")}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-[var(--siya-accent)] hover:underline"
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="siya-page-bg min-h-screen" aria-hidden />}>
      <LoginForm />
    </Suspense>
  );
}
