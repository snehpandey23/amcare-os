"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAuthEnabled } from "@/lib/trainingConfig";
import { canUsePortalWithoutOnboarding, loadLocalPortalProfile } from "@/lib/portal-profile";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import Image from "next/image";

function portalLandingPath(): string {
  return canUsePortalWithoutOnboarding(loadLocalPortalProfile()) ? "/" : "/onboarding";
}

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
          <Image
            src="/assets/images/siya-health-logo.png"
            alt="Siya Health"
            width={210}
            height={63}
            priority
            className="h-auto w-[min(210px,70vw)]"
          />
        </div>
        <h1 className="mt-8 font-[family-name:var(--font-poppins)] text-2xl font-semibold tracking-tight text-[var(--siya-primary)]">
          Welcome to SiyaOS
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
          An app for your team to stay connected while working remotely.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-8 rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-white p-6 text-left shadow-[var(--siya-shadow-lg)]"
        >
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
                <button type="button" className="font-semibold text-[var(--siya-accent)] hover:underline" onClick={() => setMode("register")}>
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button type="button" className="font-semibold text-[var(--siya-accent)] hover:underline" onClick={() => setMode("login")}>
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
