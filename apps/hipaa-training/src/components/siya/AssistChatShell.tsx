"use client";

import { useCallback, useEffect, useState } from "react";
import { SiyaChat } from "@/components/siya/SiyaChat";
import {
  archiveAssistThread,
  createAssistThread,
  listAssistThreads,
  loadAssistThread,
  type AssistThread,
} from "@/lib/assist-chat-api";
import { useAuth } from "@/context/AuthContext";
import { portalBtnGhostSm, portalBtnNavySm } from "@/lib/portal-ui";

type Props = {
  firstName?: string;
  focusMode?: boolean;
  initialQuery?: string;
  /** founder-coach Talk: same Ask engine; never writes Plan Record. */
  surface?: "default" | "founder-coach";
  openingOverride?: string;
};

/**
 * Assist v2 shell — sidebar (new + searchable threads) + main SiyaChat thread.
 * Server-backed history; Coach Draft/Refine/Lock stays outside this shell.
 */
export function AssistChatShell({
  firstName,
  focusMode = false,
  initialQuery,
  surface = "default",
  openingOverride,
}: Props) {
  const { token } = useAuth();
  const [threads, setThreads] = useState<AssistThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [ready, setReady] = useState(false);

  const refreshList = useCallback(
    async (q?: string) => {
      if (!token) return;
      try {
        const list = await listAssistThreads(q);
        setThreads(list);
        setBootError(null);
      } catch (e) {
        setBootError(e instanceof Error ? e.message : "Could not load chats");
      }
    },
    [token],
  );

  useEffect(() => {
    if (!token) {
      setLoadingList(false);
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingList(true);
      try {
        const list = await listAssistThreads();
        if (cancelled) return;
        setThreads(list);
        if (list[0]) {
          setActiveId(list[0].id);
        } else {
          const t = await createAssistThread();
          if (cancelled) return;
          setThreads([t]);
          setActiveId(t.id);
        }
      } catch (e) {
        if (!cancelled) setBootError(e instanceof Error ? e.message : "Could not start Assist");
      } finally {
        if (!cancelled) {
          setLoadingList(false);
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onNewChat() {
    try {
      const t = await createAssistThread();
      setThreads((prev) => [t, ...prev]);
      setActiveId(t.id);
      setSearch("");
    } catch (e) {
      setBootError(e instanceof Error ? e.message : "Could not create chat");
    }
  }

  async function onSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoadingList(true);
    await refreshList(search.trim() || undefined);
    setLoadingList(false);
  }

  async function onArchive(id: string) {
    try {
      await archiveAssistThread(id);
      const next = threads.filter((t) => t.id !== id);
      setThreads(next);
      if (activeId === id) {
        if (next[0]) setActiveId(next[0].id);
        else {
          const t = await createAssistThread();
          setThreads([t]);
          setActiveId(t.id);
        }
      }
    } catch (e) {
      setBootError(e instanceof Error ? e.message : "Could not archive");
    }
  }

  if (!token) {
    return (
      <p className="p-4 text-sm text-[var(--siya-text-muted)]">Sign in to use Assist with saved chats.</p>
    );
  }

  if (!ready || !activeId) {
    return (
      <p className="p-4 text-sm text-[var(--siya-text-muted)]">
        {bootError || "Loading Assist…"}
      </p>
    );
  }

  return (
    <div className="flex min-h-[min(78dvh,720px)] overflow-hidden rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-[var(--siya-white)]">
      <aside className="flex w-[min(100%,240px)] shrink-0 flex-col border-r border-[var(--siya-border)] bg-[var(--siya-page)]/40">
        <div className="space-y-2 border-b border-[var(--siya-border)] p-3">
          <button type="button" className={`${portalBtnNavySm} w-full`} onClick={() => void onNewChat()}>
            New chat
          </button>
          <form onSubmit={(e) => void onSearch(e)}>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search chats…"
              className="w-full rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-2.5 py-1.5 text-xs text-[var(--siya-text)] outline-none focus:border-[var(--siya-accent)]"
            />
          </form>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {loadingList ? (
            <p className="px-2 text-[11px] text-[var(--siya-text-muted)]">Loading…</p>
          ) : threads.length === 0 ? (
            <p className="px-2 text-[11px] text-[var(--siya-text-muted)]">No saved chats yet.</p>
          ) : (
            <ul className="space-y-0.5">
              {threads.map((t) => {
                const active = t.id === activeId;
                return (
                  <li key={t.id} className="group relative">
                    <button
                      type="button"
                      onClick={() => setActiveId(t.id)}
                      className={`w-full rounded-lg px-2.5 py-2 text-left text-xs leading-snug ${
                        active
                          ? "bg-[var(--siya-primary)]/10 font-semibold text-[var(--siya-primary)]"
                          : "text-[var(--siya-text-secondary)] hover:bg-[var(--siya-white)]"
                      }`}
                    >
                      <span className="line-clamp-2">{t.title || "New chat"}</span>
                    </button>
                    <button
                      type="button"
                      className={`${portalBtnGhostSm} absolute right-1 top-1 hidden !px-1.5 !py-0.5 text-[10px] group-hover:inline-flex`}
                      onClick={(e) => {
                        e.stopPropagation();
                        void onArchive(t.id);
                      }}
                      aria-label="Archive chat"
                    >
                      Archive
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {bootError ? (
          <p className="border-t border-[var(--siya-border)] p-2 text-[10px] text-[var(--siya-status-warn-text)]">
            {bootError}
          </p>
        ) : null}
      </aside>

      <div className="min-w-0 flex-1">
        <SiyaChat
          key={activeId}
          variant="home"
          firstName={firstName}
          focusMode={focusMode}
          initialQuery={initialQuery}
          threadId={activeId}
          surface={surface}
          openingOverride={openingOverride}
          onThreadMetaChange={() => void refreshList(search.trim() || undefined)}
          onRequestNewThread={() => void onNewChat()}
        />
      </div>
    </div>
  );
}

/** Prefetch helpers for tests / future deep-links */
export { loadAssistThread };
