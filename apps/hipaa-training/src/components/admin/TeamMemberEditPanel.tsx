"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { fetchTeamMember, updateTeamMember } from "@/lib/admin-api";
import { TrainingInput, trainingLinkPrimaryClass } from "@/components/training/training-ui";

export function TeamMemberEditPanel() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId")?.trim() ?? "";
  const router = useRouter();
  const { user, authReady } = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady) return;
    if (!user || !isPortalAdmin(user.role)) {
      router.replace("/");
      return;
    }
    if (!userId) {
      router.replace("/admin/team");
      return;
    }
    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const member = await fetchTeamMember(userId);
        setEmail(member.email);
        setName(member.name ?? "");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load teammate");
      } finally {
        setLoading(false);
      }
    })();
  }, [authReady, user, router, userId]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const patch: { name?: string; password?: string } = { name: name.trim() };
      if (password.trim().length >= 8) patch.password = password.trim();
      await updateTeamMember(userId, patch);
      router.push("/admin/team");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setPending(false);
    }
  }

  if (!authReady || !user || !isPortalAdmin(user.role)) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-8 md:px-6">
      <header>
        <Link href="/admin/team" className="text-sm font-semibold text-[var(--siya-accent)] hover:underline">
          ← Team
        </Link>
        <h1 className="mt-3 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
          Edit teammate
        </h1>
        <p className="mt-1 text-sm text-[var(--siya-text-muted)]">
          Update display name or set a new temporary password. Share passwords over a secure channel only.
        </p>
      </header>

      {loading ? <p className="text-sm text-[var(--siya-text-muted)]">Loading…</p> : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {!loading && !error ? (
        <form onSubmit={onSave} className="space-y-4 rounded-xl border border-[var(--siya-border)] bg-white p-5 shadow-[var(--siya-shadow)]">
          <p className="text-xs text-[var(--siya-text-muted)]">
            Account: <strong className="text-[var(--siya-text-secondary)]">{email}</strong>
          </p>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            Full name
            <TrainingInput required value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
          </label>
          <label className="block text-xs font-medium text-[var(--siya-text-muted)]">
            New password (optional, 8+ characters)
            <TrainingInput
              type="text"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              placeholder="Leave blank to keep current password"
            />
          </label>
          <div className="flex flex-wrap gap-2 pt-2">
            <button type="submit" disabled={pending} className={trainingLinkPrimaryClass}>
              {pending ? "Saving…" : "Save changes"}
            </button>
            <Link
              href="/admin/team"
              className="rounded-lg border border-[var(--siya-border)] px-4 py-2 text-sm font-semibold text-[var(--siya-text-secondary)]"
            >
              Cancel
            </Link>
          </div>
        </form>
      ) : null}
    </div>
  );
}
