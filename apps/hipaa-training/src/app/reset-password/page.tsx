"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { resetPasswordWithToken } from "@/lib/account-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token")?.trim() || "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError("This reset link is missing a token. Request a new link from the login page.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setPending(true);
    try {
      await resetPasswordWithToken(token, newPassword);
      router.replace("/login?reset=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password");
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
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-muted)]">
          Enter a new password for your staff portal account.
        </p>

        {!token ? (
          <div className="mt-8 text-left text-sm text-red-600">
            <p>This reset link is invalid. Request a new one from sign in.</p>
            <Link href="/forgot-password" className={`mt-4 inline-flex ${trainingLinkPrimaryClass}`}>
              Forgot password
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void onSubmit(e)} className="mt-8 text-left">
            <label className="block">
              <span className="text-xs font-medium text-[var(--siya-text-muted)]">
                New password (8+ characters)
              </span>
              <TrainingInput
                type="password"
                required
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            <label className="mt-4 block">
              <span className="text-xs font-medium text-[var(--siya-text-muted)]">
                Confirm new password
              </span>
              <TrainingInput
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1"
              />
            </label>
            {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
            <button
              type="submit"
              disabled={pending}
              className={`mt-5 w-full ${trainingLinkPrimaryClass} justify-center`}
            >
              {pending ? "Saving…" : "Update password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="siya-page-bg flex min-h-screen items-center justify-center text-sm text-[var(--siya-text-muted)]">
          Loading…
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
