"use client";

import Link from "next/link";
import { useState } from "react";
import { requestForgotPassword } from "@/lib/account-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await requestForgotPassword(email);
      setDoneMessage(result.message);
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
          Forgot password
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">
          Enter your work email. If an account exists, we&apos;ll send a reset link.
        </p>

        {doneMessage ? (
          <div className="mt-8 rounded-xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 text-left text-sm text-[var(--siya-text-secondary)]">
            <p>{doneMessage}</p>
            <p className="mt-3 text-xs text-[var(--siya-text-muted)]">
              Check your inbox (and spam). The link expires in about 45 minutes.
            </p>
            <Link href="/login" className={`mt-5 inline-flex ${trainingLinkPrimaryClass}`}>
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 text-left">
            <label className="block">
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
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className={`mt-5 w-full ${trainingLinkPrimaryClass} justify-center`}
            >
              {pending ? "Sending…" : "Send reset link"}
            </button>
            <p className="mt-4 text-center text-xs text-[var(--siya-text-muted)]">
              <Link href="/login" className="font-semibold text-[var(--siya-accent)] hover:underline">
                Back to sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
