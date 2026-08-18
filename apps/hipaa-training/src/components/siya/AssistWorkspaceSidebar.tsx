"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAssistThreads } from "@/context/AssistThreadContext";
import { isPortalAdmin } from "@/lib/portal-role";
import { isPortalMemoryEnabled } from "@/lib/trainingConfig";
import { PortalNavLink } from "@/components/training/PortalNavLink";
import { portalBtnGhostSm, portalBtnNavySm, portalWorkspaceNavActive, portalWorkspaceNavIdle } from "@/lib/portal-ui";

export function AssistWorkspaceSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname() ?? "/";
  const { user } = useAuth();
  const {
    threads,
    activeId,
    search,
    setSearch,
    loadingList,
    bootError,
    newChat,
    selectThread,
    archiveThread,
    searchSubmit,
  } = useAssistThreads();

  const onMyDay = path === "/" || path.startsWith("/help");

  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]">
      <div className="space-y-2 border-b border-[var(--siya-border)] px-3 py-3">
        <button
          type="button"
          className={`${portalBtnNavySm} w-full`}
          onClick={() => {
            void newChat();
            onNavigate?.();
          }}
        >
          New chat
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void searchSubmit();
          }}
        >
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search chats…"
            className="w-full rounded-lg border border-[var(--siya-border)] bg-[var(--siya-white)] px-2.5 py-1.5 text-xs text-[var(--siya-text)] outline-none focus:border-[var(--siya-accent)]"
          />
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
        {loadingList ? (
          <p className="px-2 text-[11px] text-[var(--siya-text-muted)]">Loading…</p>
        ) : threads.length === 0 ? (
          <p className="px-2 text-[11px] text-[var(--siya-text-muted)]">No saved chats yet.</p>
        ) : (
          <ul className="space-y-0.5">
            {threads.map((t) => {
              const active = onMyDay && t.id === activeId;
              return (
                <li key={t.id} className="group relative">
                  <button
                    type="button"
                    onClick={() => {
                      selectThread(t.id);
                      onNavigate?.();
                    }}
                    className={`w-full rounded-lg px-2.5 py-2 pr-14 text-left text-xs leading-snug ${
                      active
                        ? "bg-[var(--siya-primary)]/10 font-semibold text-[var(--siya-primary)]"
                        : "text-[var(--siya-text-secondary)] hover:bg-[var(--siya-white)]"
                    }`}
                  >
                    <span className="line-clamp-2">{t.title || "New chat"}</span>
                  </button>
                  <button
                    type="button"
                    className={`${portalBtnGhostSm} absolute right-1 top-1 !px-1.5 !py-0.5 text-[10px] opacity-0 group-hover:opacity-100`}
                    onClick={(e) => {
                      e.stopPropagation();
                      void archiveThread(t.id);
                    }}
                    aria-label="Archive chat (remove from list)"
                    title="Archive — remove from your chat list"
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
        <p className="border-t border-[var(--siya-border)] px-3 py-2 text-[10px] text-[var(--siya-status-warn-text)]">
          {bootError}
        </p>
      ) : null}

      <nav
        aria-label="Workspace"
        className="space-y-0.5 border-t border-[var(--siya-border)] px-2 py-3"
      >
        <SideLink href="/" active={onMyDay} onNavigate={onNavigate}>
          My day
        </SideLink>
        <SideLink
          href="/learn"
          active={
            path.startsWith("/learn") || path.startsWith("/training") || path.startsWith("/module") || path.startsWith("/level-up")
          }
          onNavigate={onNavigate}
        >
          Learn
        </SideLink>
        {isPortalMemoryEnabled() ? (
          <SideLink href="/memory" active={path.startsWith("/memory")} onNavigate={onNavigate}>
            Memory
          </SideLink>
        ) : null}
        {user && !isPortalAdmin(user.role) ? (
          <SideLink href="/team" active={path === "/team" || path.startsWith("/team/")} onNavigate={onNavigate}>
            Team
          </SideLink>
        ) : null}
        {user && isPortalAdmin(user.role) ? (
          <SideLink href="/admin/team" active={path.startsWith("/admin")} onNavigate={onNavigate}>
            Admin
          </SideLink>
        ) : null}
      </nav>
    </aside>
  );
}

function SideLink({
  href,
  active,
  children,
  onNavigate,
}: {
  href: string;
  active: boolean;
  children: string;
  onNavigate?: () => void;
}) {
  return (
    <span onClick={() => onNavigate?.()}>
      <PortalNavLink
        href={href}
        className={`block rounded-lg px-2.5 py-1.5 text-sm ${active ? portalWorkspaceNavActive : portalWorkspaceNavIdle}`}
      >
        {children}
      </PortalNavLink>
    </span>
  );
}
