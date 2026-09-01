"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  fetchFeedbackDirectory,
  fetchFeedbackInbox,
  submitTeamFeedback,
  type DirectoryPerson,
  type RecipientFacingFeedback,
} from "@/lib/team-feedback-api";
import {
  portalBtnAccent,
  portalBtnGhostSm,
  portalH1,
  portalH3,
  portalInput,
  portalPage,
  portalSection,
  portalStatusErrorText,
  portalStatusSuccessText,
} from "@/lib/portal-ui";
import { PortalNavLink } from "@/components/training/PortalNavLink";

function labelPerson(p: DirectoryPerson) {
  const base = p.name?.trim() || p.email;
  if (p.kind === "lead" && p.leadDepartments?.length) {
    return `${base} · ${p.leadDepartments.join(", ")}`;
  }
  return base;
}

export function FeedbackFridayPage() {
  const { authReady, user } = useAuth();
  const [peers, setPeers] = useState<DirectoryPerson[]>([]);
  const [leads, setLeads] = useState<DirectoryPerson[]>([]);
  const [inbox, setInbox] = useState<RecipientFacingFeedback[]>([]);
  const [targetKind, setTargetKind] = useState<"peer" | "lead">("peer");
  const [recipientUserId, setRecipientUserId] = useState("");
  const [body, setBody] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const options = useMemo(
    () => (targetKind === "lead" ? leads : peers),
    [targetKind, leads, peers],
  );

  const reload = useCallback(async () => {
    if (!authReady || !user) return;
    setLoading(true);
    setError(null);
    try {
      const [dir, box] = await Promise.all([fetchFeedbackDirectory(), fetchFeedbackInbox()]);
      setPeers(dir.peers);
      setLeads(dir.leads);
      setInbox(box.items);
      if (!recipientUserId) {
        const first = (targetKind === "lead" ? dir.leads : dir.peers)[0];
        if (first) setRecipientUserId(first.id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load feedback");
    } finally {
      setLoading(false);
    }
  }, [authReady, user, recipientUserId, targetKind]);

  useEffect(() => {
    void reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once auth ready
  }, [authReady, user]);

  useEffect(() => {
    const list = targetKind === "lead" ? leads : peers;
    if (!list.some((p) => p.id === recipientUserId)) {
      setRecipientUserId(list[0]?.id || "");
    }
  }, [targetKind, peers, leads, recipientUserId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!recipientUserId) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const { recipientFacing } = await submitTeamFeedback({
        recipientUserId,
        targetKind,
        body,
        anonymous,
      });
      setBody("");
      setNotice(
        anonymous
          ? "Sent anonymously — they’ll see your note with no name or team."
          : `Sent as ${recipientFacing.attribution.mode === "named" ? recipientFacing.attribution.displayName : "you"}.`,
      );
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send");
    } finally {
      setPending(false);
    }
  }

  if (!authReady) {
    return <p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading…</p>;
  }
  if (!user) {
    return (
      <p className="p-6 text-sm">
        <PortalNavLink href="/login" className="underline">
          Sign in
        </PortalNavLink>{" "}
        to give or read Feedback Friday notes.
      </p>
    );
  }

  return (
    <div className={portalPage}>
      <header className="mb-6">
        <p className="text-xs text-[var(--siya-text-muted)]">
          <PortalNavLink href="/" className="hover:underline">
            My day
          </PortalNavLink>
          {" · "}
          Feedback Friday
        </p>
        <h1 className={`${portalH1} mt-2`}>Feedback Friday</h1>
        <p className="mt-2 max-w-xl text-sm text-[var(--siya-text-secondary)]">
          Share useful feedback with a peer or a lead. Every time, you choose: share your name, or send
          anonymously. Anonymous notes show <strong>no</strong> name, email, or team.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={portalSection} aria-label="Give feedback">
          <h2 className={portalH3}>Give feedback</h2>
          <form className="mt-3 space-y-3" onSubmit={(e) => void onSubmit(e)}>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={targetKind === "peer" ? portalBtnAccent : portalBtnGhostSm}
                onClick={() => setTargetKind("peer")}
              >
                To a peer
              </button>
              <button
                type="button"
                className={targetKind === "lead" ? portalBtnAccent : portalBtnGhostSm}
                onClick={() => setTargetKind("lead")}
              >
                To a lead / senior
              </button>
            </div>

            <label className="block text-xs font-semibold text-[var(--siya-primary)]">
              Recipient
              <select
                className={`mt-1 ${portalInput}`}
                value={recipientUserId}
                onChange={(e) => setRecipientUserId(e.target.value)}
                required
              >
                {options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {labelPerson(p)}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-semibold text-[var(--siya-primary)]">
              Your note
              <textarea
                className={`mt-1 ${portalInput}`}
                rows={4}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="What went well, or what would help next time…"
                required
              />
            </label>

            <fieldset className="space-y-2 rounded-lg border border-[var(--siya-border)] p-3">
              <legend className="px-1 text-xs font-semibold text-[var(--siya-primary)]">
                Share your name with the recipient, or send anonymously?
              </legend>
              <label className="flex items-start gap-2 text-sm text-[var(--siya-text-secondary)]">
                <input
                  type="radio"
                  name="anon"
                  checked={!anonymous}
                  onChange={() => setAnonymous(false)}
                  className="mt-1"
                />
                <span>
                  <strong className="text-[var(--siya-primary)]">Share my name</strong> — they’ll see who
                  wrote this.
                </span>
              </label>
              <label className="flex items-start gap-2 text-sm text-[var(--siya-text-secondary)]">
                <input
                  type="radio"
                  name="anon"
                  checked={anonymous}
                  onChange={() => setAnonymous(true)}
                  className="mt-1"
                />
                <span>
                  <strong className="text-[var(--siya-primary)]">Send anonymously</strong> — they’ll see the
                  note only; no name, email, or team.
                </span>
              </label>
            </fieldset>

            {error ? <p className={`text-xs ${portalStatusErrorText}`}>{error}</p> : null}
            {notice ? <p className={`text-xs ${portalStatusSuccessText}`}>{notice}</p> : null}

            <button type="submit" className={portalBtnAccent} disabled={pending || !recipientUserId}>
              {pending ? "Sending…" : "Send feedback"}
            </button>
          </form>
        </section>

        <section className={portalSection} aria-label="Your inbox">
          <h2 className={portalH3}>Feedback for you</h2>
          <p className="mt-1 text-[11px] text-[var(--siya-text-muted)]">
            Anonymous items never show who wrote them — by design.
          </p>
          {loading ? (
            <p className="mt-3 text-xs text-[var(--siya-text-muted)]">Loading…</p>
          ) : inbox.length === 0 ? (
            <p className="mt-3 text-sm text-[var(--siya-text-muted)]">Nothing yet — check back after Friday.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {inbox.map((item) => (
                <li
                  key={item.id}
                  className="rounded-lg border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2"
                  data-feedback-id={item.id}
                  data-attribution={item.attribution.mode}
                >
                  <p className="text-[11px] font-semibold text-[var(--siya-primary)]">
                    {item.attribution.mode === "anonymous"
                      ? "Anonymous teammate"
                      : item.attribution.displayName}
                    {" · "}
                    {item.targetKind === "lead" ? "to you as lead" : "peer note"}
                  </p>
                  <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">{item.body}</p>
                  <p className="mt-1 text-[10px] text-[var(--siya-text-muted)]">
                    {item.createdAt.slice(0, 10)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
