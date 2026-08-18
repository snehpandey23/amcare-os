/**
 * Consolidated portal UI class strings.
 * Tokens live in `src/app/globals.css` — use these instead of ad-hoc Tailwind per screen.
 */

export const portalPage = "mx-auto max-w-3xl space-y-6 px-4 py-8 md:px-6";

/** My day / Assist chat — same width for staff Ask and admin Founder Talk. */
export const portalChatPage = "mx-auto max-w-6xl space-y-6 px-4 py-8 md:px-6";

/** Admin Founder Coach outer shell (side thread nav + main). Matches portalChatPage width. */
export const portalChatShell =
  "mx-auto flex min-h-[calc(100dvh-3.5rem)] w-full max-w-6xl flex-col md:flex-row md:gap-2";

export const portalSection =
  "rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-[var(--siya-white)]/90 p-5 shadow-[var(--siya-shadow)]";

export const portalSectionCompact =
  "rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-[var(--siya-white)]/90 p-4 shadow-[var(--siya-shadow)]";

export const portalSectionSubtle =
  "rounded-[var(--siya-radius-lg)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)]/80 px-4 py-3";

export const portalCard =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-white)] p-4 shadow-[var(--siya-shadow)]";

export const portalH1 =
  "font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)] md:text-3xl";

export const portalH2 =
  "font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]";

export const portalH3 =
  "font-[family-name:var(--font-poppins)] text-sm font-semibold text-[var(--siya-primary)]";

export const portalCapsLabel = "text-xs font-medium uppercase tracking-wide text-[var(--siya-text-muted)]";

export const portalTabActive =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white";

export const portalTabInactive =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-white)] px-3 py-1.5 text-xs font-semibold text-[var(--siya-text-secondary)]";

export const portalFocusRail = "rounded-none border-l-4 border-[var(--siya-primary)]/35";

export const portalInput =
  "w-full rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2 text-sm text-[var(--siya-text)] outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20";

export const portalInputCompact =
  "min-w-0 flex-1 rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2 text-xs outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20";

export const portalBtnAccent =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-btn-accent-hover)] disabled:opacity-60";

export const portalBtnAccentSm =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-accent)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--siya-btn-accent-hover)] disabled:opacity-60";

export const portalBtnNavySm =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-primary)] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[var(--siya-btn-primary-hover)] disabled:opacity-60";

export const portalBtnGhostSm =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] px-3 py-2 text-xs font-medium text-[var(--siya-text-secondary)] hover:bg-[var(--siya-bg-page)]";

export const portalStatusWarnBox =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-status-warn-border)] bg-[var(--siya-status-warn-bg)]";

export const portalStatusWarnText = "text-[var(--siya-status-warn-text)]";

export const portalStatusInfoBox =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-status-info-border)] bg-[var(--siya-status-info-bg)]";

export const portalStatusInfoText = "text-[var(--siya-status-info-text)]";

export const portalStatusSuccessBox =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-status-success-border)] bg-[var(--siya-status-success-bg)]";

export const portalStatusSuccessText = "text-[var(--siya-status-success-text)]";

export const portalStatusErrorBox =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-status-error-border)] bg-[var(--siya-status-error-bg)]";

export const portalStatusErrorText = "text-[var(--siya-status-error-text)]";

/** Presence / focus pill (replaces violet focus styling). */
export const portalStatusInfoPill =
  "rounded-lg border border-[var(--siya-status-info-border)] bg-[var(--siya-status-info-bg)] px-2.5 py-1.5 text-[var(--siya-status-info-text)]";

export const portalBadgeAiDrafted =
  "rounded-full border border-[var(--siya-status-info-border)] bg-[var(--siya-status-info-bg)] px-2 py-0.5 text-[10px] font-semibold uppercase text-[var(--siya-status-info-text)]";

export const portalBadgeWip =
  "rounded-full border border-[var(--siya-status-warn-border)] bg-[var(--siya-status-warn-bg)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--siya-status-warn-text)]";

export const portalLinkBack = "text-xs text-[var(--siya-accent)] hover:underline";

export const portalAskInput =
  "min-w-0 flex-1 rounded-[var(--siya-radius-md)] border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-4 py-2.5 text-sm outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20";

export const portalAskSendBtn =
  "rounded-[var(--siya-radius-md)] bg-[var(--siya-btn-accent)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-btn-accent-hover)] disabled:opacity-50";

/** Site-wide Assist rail (Phase A) — reuse instead of ad-hoc sidebar colors. */
export const portalWorkspaceNavActive =
  "font-semibold text-[var(--siya-primary)] bg-[var(--siya-white)]";

export const portalWorkspaceNavIdle =
  "text-[var(--siya-text-muted)] hover:bg-[var(--siya-white)] hover:text-[var(--siya-text-secondary)]";

/** Lead / dept notice strip (was violet — now info tint on core palette). */
export const portalNoticeLead =
  "rounded-[var(--siya-radius-md)] border border-[var(--siya-primary)]/15 bg-[var(--siya-bg-subtle)] px-3 py-2.5 text-xs text-[var(--siya-text-secondary)]";
