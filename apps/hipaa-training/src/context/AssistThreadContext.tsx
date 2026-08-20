"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  archiveAssistThread,
  createAssistThread,
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

  useEffect(() => {
    if (!token) {
      setLoadingList(false);
      setReady(true);
      setThreads([]);
      setActiveId(null);
      return;
    }
    let cancelled = false;
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
              markAssistSessionBooted();
              setAssistSessionActiveId(match.id);
              setThreads(list);
              setActiveId(match.id);
              return;
            }
          }
          const t = await createFreshAssistThreadOnce();
          if (cancelled) return;
          markAssistSessionBooted();
          setAssistSessionActiveId(t.id);
          setThreads([t, ...list.filter((x) => x.id !== t.id)]);
          setActiveId(t.id);
          return;
        }

        const fromUrl = deepId ? list.find((x) => x.id === deepId) : undefined;
        const saved = getAssistSessionActiveId();
        const match = fromUrl || (saved ? list.find((x) => x.id === saved) : undefined);
        if (match) {
          setThreads(list);
          setActiveId(match.id);
          setAssistSessionActiveId(match.id);
        } else if (list[0]) {
          setThreads(list);
          setActiveId(list[0].id);
          setAssistSessionActiveId(list[0].id);
        } else {
          const t = await createAssistThread();
          if (cancelled) return;
          setThreads([t]);
          setActiveId(t.id);
          setAssistSessionActiveId(t.id);
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
  }, [token, deepThreadId]);

  // When ?thread= changes after boot (e.g. email deep link while already signed in).
  useEffect(() => {
    if (!token || !deepThreadId || !ready) return;
    if (activeId === deepThreadId) return;
    const match = threads.find((t) => t.id === deepThreadId);
    if (match) {
      setActiveId(match.id);
      setAssistSessionActiveId(match.id);
    }
  }, [token, deepThreadId, ready, activeId, threads]);

  const newChat = useCallback(async () => {
    try {
      const t = await createAssistThread();
      setThreads((prev) => [t, ...prev.filter((x) => x.id !== t.id)]);
      setActiveId(t.id);
      setAssistSessionActiveId(t.id);
      setSearch("");
      setBootError(null);
      goToMyDay(path, router);
    } catch (e) {
      setBootError(e instanceof Error ? e.message : "Could not create chat");
    }
  }, [path, router]);

  const selectThread = useCallback(
    (id: string) => {
      setActiveId(id);
      setAssistSessionActiveId(id);
      goToMyDay(path, router);
    },
    [path, router],
  );

  const archiveThread = useCallback(
    async (id: string) => {
      try {
        await archiveAssistThread(id);
        const next = threads.filter((t) => t.id !== id);
        setThreads(next);
        if (activeId === id) {
          if (next[0]) {
            setActiveId(next[0].id);
            setAssistSessionActiveId(next[0].id);
          } else {
            const t = await createAssistThread();
            setThreads([t]);
            setActiveId(t.id);
            setAssistSessionActiveId(t.id);
          }
        }
      } catch (e) {
        setBootError(e instanceof Error ? e.message : "Could not archive");
      }
    },
    [activeId, threads],
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
