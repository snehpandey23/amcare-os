"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  archiveAssistThread,
  createAssistThread,
  isAssistThreadMissingError,
  listAssistThreads,
  type AssistThread,
} from "@/lib/assist-chat-api";
import {
  createFreshAssistThreadOnce,
  getAssistSessionActiveId,
  getAssistSessionBooted,
  markAssistSessionBooted,
  setAssistSessionActiveId,
} from "@/lib/assist-session";
import { useAuth } from "@/context/AuthContext";

type AssistThreadContextValue = {
  threads: AssistThread[];
  activeId: string | null;
  search: string;
  setSearch: (q: string) => void;
  loadingList: boolean;
  ready: boolean;
  bootError: string | null;
  newChat: () => Promise<void>;
  /** Delete current thread (if any), then open a fresh one — used by Clear. */
  clearAndNewChat: () => Promise<void>;
  /** Open a fresh empty chat without deleting (stale / missing thread recovery). */
  openFreshChat: (opts?: { replaceMissingId?: string }) => Promise<void>;
  selectThread: (id: string) => void;
  archiveThread: (id: string) => Promise<void>;
  refreshList: (q?: string) => Promise<void>;
  searchSubmit: () => Promise<void>;
};

const AssistThreadContext = createContext<AssistThreadContextValue | null>(null);

function goToMyDay(path: string, router: { push: (href: string) => void }) {
  if (path === "/" || path.startsWith("/help")) return;
  router.push("/");
}

function readDeepThreadIdFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = new URLSearchParams(window.location.search).get("thread");
    return raw && raw.startsWith("ath-") ? raw : null;
  } catch {
    return null;
  }
}

function isEmptyAssistThread(t: AssistThread): boolean {
  const title = (t.title || "").trim().toLowerCase();
  const emptyTitle = !title || title === "new chat";
  const noMessages = t.messageCount == null || t.messageCount === 0;
  return emptyTitle && noMessages;
}

/** Prefer one existing blank thread over creating another (stops New-chat spam). */
function pickReusableEmptyThread(list: AssistThread[]): AssistThread | undefined {
  return list.find(isEmptyAssistThread);
}

function stripStaleThreadQuery() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("thread")) return;
    url.searchParams.delete("thread");
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  } catch {
    /* ignore */
  }
}

export function AssistThreadProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const path = usePathname() ?? "/";
  const router = useRouter();
  const [deepThreadId, setDeepThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<AssistThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [bootError, setBootError] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [ready, setReady] = useState(false);
  const recoveringRef = useRef(false);

  useEffect(() => {
    setDeepThreadId(readDeepThreadIdFromUrl());
    const onNav = () => setDeepThreadId(readDeepThreadIdFromUrl());
    window.addEventListener("popstate", onNav);
    return () => window.removeEventListener("popstate", onNav);
  }, [path]);

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

  const activateThread = useCallback((t: AssistThread, list: AssistThread[]) => {
    markAssistSessionBooted();
    setAssistSessionActiveId(t.id);
    setThreads(list);
    setActiveId(t.id);
    setBootError(null);
  }, []);

  /** Mint or reuse a blank thread — never leave My Day without an active chat. */
  const ensureFreshActiveThread = useCallback(
    async (list: AssistThread[], cancelled?: () => boolean): Promise<boolean> => {
      const reusable = pickReusableEmptyThread(list);
      if (reusable) {
        if (cancelled?.()) return false;
        const dupes = list.filter((x) => x.id !== reusable.id && isEmptyAssistThread(x));
        activateThread(reusable, [
          reusable,
          ...list.filter((x) => x.id !== reusable.id && !isEmptyAssistThread(x)),
        ]);
        if (dupes.length) {
          void Promise.allSettled(dupes.map((d) => archiveAssistThread(d.id)));
        }
        return true;
      }
      try {
        const t = await createFreshAssistThreadOnce();
        if (cancelled?.()) return false;
        activateThread(t, [t, ...list.filter((x) => x.id !== t.id)]);
        return true;
      } catch {
        try {
          const t = await createAssistThread();
          if (cancelled?.()) return false;
          activateThread(t, [t, ...list.filter((x) => x.id !== t.id)]);
          return true;
        } catch (e) {
          if (!cancelled?.()) {
            setBootError(e instanceof Error ? e.message : "Could not start Assist");
          }
          return false;
        }
      }
    },
    [activateThread],
  );

  useEffect(() => {
    if (!token) {
      setLoadingList(false);
      setReady(true);
      setThreads([]);
      setActiveId(null);
      return;
    }
    let cancelled = false;
    const isCancelled = () => cancelled;
    (async () => {
      setLoadingList(true);
      try {
        const list = await listAssistThreads();
        if (cancelled) return;
        const deepId = readDeepThreadIdFromUrl();

        if (!getAssistSessionBooted()) {
          // Deep link from gap email — open that thread instead of forcing a brand-new chat.
          if (deepId) {
            const match = list.find((x) => x.id === deepId);
            if (match) {
              activateThread(match, list);
              return;
            }
            // Stale deep link — drop ?thread= and land on a fresh empty chat.
            stripStaleThreadQuery();
          }
          await ensureFreshActiveThread(list, isCancelled);
          return;
        }

        const fromUrl = deepId ? list.find((x) => x.id === deepId) : undefined;
        const saved = getAssistSessionActiveId();
        const match = fromUrl || (saved ? list.find((x) => x.id === saved) : undefined);
        if (match) {
          setThreads(list);
          setActiveId(match.id);
          setAssistSessionActiveId(match.id);
          setBootError(null);
          // Clean duplicate blanks, but never delete the active thread.
          const empties = list.filter(isEmptyAssistThread);
          if (empties.length > 1) {
            const keep = empties.find((e) => e.id === match.id) ?? empties[0]!;
            const drop = empties.filter((e) => e.id !== keep.id);
            setThreads([keep, ...list.filter((x) => !isEmptyAssistThread(x) || x.id === keep.id)]);
            void Promise.allSettled(drop.map((d) => archiveAssistThread(d.id)));
          }
          return;
        }

        if (deepId && !fromUrl) stripStaleThreadQuery();

        if (list[0]) {
          // Saved / URL id is gone — fall back to newest remaining chat (or a blank).
          const empties = list.filter(isEmptyAssistThread);
          if (empties.length > 0) {
            await ensureFreshActiveThread(list, isCancelled);
            return;
          }
          setThreads(list);
          setActiveId(list[0].id);
          setAssistSessionActiveId(list[0].id);
          setBootError(null);
          return;
        }

        await ensureFreshActiveThread(list, isCancelled);
      } catch (e) {
        if (cancelled) return;
        // Last resort: still try to mint a blank chat so My Day is usable.
        const recovered = await ensureFreshActiveThread([], isCancelled);
        if (!recovered && !isAssistThreadMissingError(e)) {
          setBootError(e instanceof Error ? e.message : "Could not start Assist");
        }
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
  }, [token, deepThreadId, activateThread, ensureFreshActiveThread]);

  // When ?thread= changes after boot (e.g. email deep link while already signed in).
  useEffect(() => {
    if (!token || !deepThreadId || !ready) return;
    if (activeId === deepThreadId) return;
    const match = threads.find((t) => t.id === deepThreadId);
    if (match) {
      setActiveId(match.id);
      setAssistSessionActiveId(match.id);
      setBootError(null);
      return;
    }
    // Deep link points at a deleted / foreign thread — clear query and stay on current / fresh.
    stripStaleThreadQuery();
  }, [token, deepThreadId, ready, activeId, threads]);

  const openFreshChat = useCallback(async (opts?: { replaceMissingId?: string }) => {
    if (recoveringRef.current) return;
    recoveringRef.current = true;
    const missingId = opts?.replaceMissingId ?? null;
    try {
      // Drop a known-missing id from the sidebar so we don't "reuse" a ghost Untitled chat.
      const baseList = missingId
        ? threads.filter((t) => t.id !== missingId)
        : threads;
      if (missingId) {
        setThreads(baseList);
        if (getAssistSessionActiveId() === missingId) setAssistSessionActiveId(null);
      }

      const current = baseList.find((t) => t.id === activeId && t.id !== missingId);
      if (current && isEmptyAssistThread(current)) {
        setActiveId(current.id);
        setAssistSessionActiveId(current.id);
        setSearch("");
        setBootError(null);
        goToMyDay(path, router);
        return;
      }
      const reusable = pickReusableEmptyThread(
        baseList.filter((t) => t.id !== activeId && t.id !== missingId),
      );
      if (reusable) {
        setActiveId(reusable.id);
        setAssistSessionActiveId(reusable.id);
        setSearch("");
        setBootError(null);
        goToMyDay(path, router);
        return;
      }
      const t = await createAssistThread();
      setThreads((prev) => {
        const cleaned = missingId ? prev.filter((x) => x.id !== missingId) : prev;
        return [t, ...cleaned.filter((x) => x.id !== t.id)];
      });
      setActiveId(t.id);
      setAssistSessionActiveId(t.id);
      setSearch("");
      setBootError(null);
      goToMyDay(path, router);
    } catch (e) {
      setBootError(e instanceof Error ? e.message : "Could not create chat");
    } finally {
      recoveringRef.current = false;
    }
  }, [path, router, threads, activeId]);

  const newChat = useCallback(async () => {
    await openFreshChat();
  }, [openFreshChat]);

  /** Clear / delete current conversation permanently, then start fresh. */
  const clearAndNewChat = useCallback(async () => {
    const current = activeId;
    try {
      if (current) {
        await archiveAssistThread(current); // 404 = already gone
        setThreads((prev) => prev.filter((t) => t.id !== current));
        if (getAssistSessionActiveId() === current) setAssistSessionActiveId(null);
      }
      // Prefer reusing another blank over minting when Clear races with cleanup.
      const remaining = threads.filter((t) => t.id !== current);
      const reusable = pickReusableEmptyThread(remaining);
      if (reusable) {
        setThreads((prev) => {
          const withoutCurrent = prev.filter((x) => x.id !== current);
          return [
            reusable,
            ...withoutCurrent.filter((x) => x.id !== reusable.id && !isEmptyAssistThread(x)),
          ];
        });
        setActiveId(reusable.id);
        setAssistSessionActiveId(reusable.id);
        setSearch("");
        setBootError(null);
        goToMyDay(path, router);
        return;
      }
      const t = await createAssistThread();
      setThreads((prev) => [t, ...prev.filter((x) => x.id !== t.id && x.id !== current)]);
      setActiveId(t.id);
      setAssistSessionActiveId(t.id);
      setSearch("");
      setBootError(null);
      goToMyDay(path, router);
    } catch (e) {
      // Never leave My Day parked on "Thread not found" — open a fresh chat instead.
      if (isAssistThreadMissingError(e)) {
        await openFreshChat({ replaceMissingId: current ?? undefined });
        return;
      }
      try {
        const t = await createAssistThread();
        setThreads((prev) => [t, ...prev.filter((x) => x.id !== t.id && x.id !== current)]);
        setActiveId(t.id);
        setAssistSessionActiveId(t.id);
        setSearch("");
        setBootError(null);
        goToMyDay(path, router);
      } catch (inner) {
        setBootError(inner instanceof Error ? inner.message : "Could not clear chat");
      }
    }
  }, [activeId, path, router, threads, openFreshChat]);

  const selectThread = useCallback(
    (id: string) => {
      setActiveId(id);
      setAssistSessionActiveId(id);
      setBootError(null);
      goToMyDay(path, router);
    },
    [path, router],
  );

  const archiveThread = useCallback(
    async (id: string) => {
      try {
        await archiveAssistThread(id); // 404 = already gone
        const next = threads.filter((t) => t.id !== id);
        setThreads(next);
        if (getAssistSessionActiveId() === id) setAssistSessionActiveId(null);
        if (activeId === id) {
          if (next[0]) {
            setActiveId(next[0].id);
            setAssistSessionActiveId(next[0].id);
            setBootError(null);
          } else {
            const t = await createAssistThread();
            setThreads([t]);
            setActiveId(t.id);
            setAssistSessionActiveId(t.id);
            setBootError(null);
          }
        }
      } catch (e) {
        if (isAssistThreadMissingError(e)) {
          const next = threads.filter((t) => t.id !== id);
          setThreads(next);
          if (activeId === id) await openFreshChat({ replaceMissingId: id });
          return;
        }
        setBootError(e instanceof Error ? e.message : "Could not delete chat");
      }
    },
    [activeId, threads, openFreshChat],
  );

  const searchSubmit = useCallback(async () => {
    setLoadingList(true);
    await refreshList(search.trim() || undefined);
    setLoadingList(false);
  }, [refreshList, search]);

  const value = useMemo(
    () => ({
      threads,
      activeId,
      search,
      setSearch,
      loadingList,
      ready,
      bootError,
      newChat,
      clearAndNewChat,
      openFreshChat,
      selectThread,
      archiveThread,
      refreshList,
      searchSubmit,
    }),
    [
      threads,
      activeId,
      search,
      loadingList,
      ready,
      bootError,
      newChat,
      clearAndNewChat,
      openFreshChat,
      selectThread,
      archiveThread,
      refreshList,
      searchSubmit,
    ],
  );

  return <AssistThreadContext.Provider value={value}>{children}</AssistThreadContext.Provider>;
}

export function useAssistThreads(): AssistThreadContextValue {
  const ctx = useContext(AssistThreadContext);
  if (!ctx) throw new Error("useAssistThreads must be used within AssistThreadProvider");
  return ctx;
}
