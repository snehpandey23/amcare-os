"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/lib/account-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function AccountPanel() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
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
      await changePassword(currentPassword, newPassword);
      setSuccess("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6 px-4 py-8 md:px-6">
      <header>
        <h1 className="font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Account
        </h1>
        <p className="mt-2 text-sm text-[var(--siya-text-secondary)]">
          {user?.name?.trim() || user?.email}
        </p>
      </header>

      <ThemeToggle variant="account" />

      <section className="rounded-2xl border border-[var(--siya-border)] bg-[var(--siya-white)] p-5">
        <h2 className="text-sm font-semibold text-[var(--siya-primary)]">Change password</h2>
        <form onSubmit={(e) => void onSubmit(e)} className="mt-4 space-y-3">
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Current password
            <TrainingInput
              type="password"
              autoComplete="current-password"
              className="mt-1 w-full"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            New password (8+ characters)
            <TrainingInput
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Confirm new password
            <TrainingInput
              type="password"
              autoComplete="new-password"
              className="mt-1 w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}
          <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
            {pending ? "Updating…" : "Update password"}
          </button>
        </form>
      </section>
    </div>
  );
}
