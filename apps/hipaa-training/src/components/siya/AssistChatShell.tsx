"use client";

import { SiyaChat } from "@/components/siya/SiyaChat";
import { loadAssistThread } from "@/lib/assist-chat-api";
import { useAuth } from "@/context/AuthContext";
import { useAssistThreads } from "@/context/AssistThreadContext";

type Props = {
  firstName?: string;
  focusMode?: boolean;
  initialQuery?: string;
  /** founder-coach Talk: same Ask engine; never writes Plan Record. */
  surface?: "default" | "founder-coach";
  openingOverride?: string;
};

/**
 * Assist thread pane — site-wide sidebar lives in AssistantShell.
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
  const { activeId, ready, bootError, search, refreshList, newChat } = useAssistThreads();

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
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--siya-bg-page)]">
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
        onRequestNewThread={() => void newChat()}
      />
    </div>
  );
}

/** Prefetch helpers for tests / future deep-links */
export { loadAssistThread };
