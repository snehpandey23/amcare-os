import type { ReactNode } from "react";

export function TrainingShell({ children }: { children: ReactNode }) {
  return <div className="siya-cert min-h-full text-[var(--siya-text)]">{children}</div>;
}

export function TrainingCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--siya-border)] bg-white p-6 shadow-[var(--siya-shadow)] ${className}`}
    >
      {children}
    </div>
  );
}

export function TrainingStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-[var(--siya-border)] bg-white p-4 shadow-[var(--siya-shadow)]">
      <dt className="text-xs font-medium text-[var(--siya-text-muted)]">{label}</dt>
      <dd className="mt-1 font-[family-name:var(--font-poppins)] text-2xl font-semibold text-[var(--siya-primary)]">
        {value}
      </dd>
    </div>
  );
}

export function TrainingBtnPrimary({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-xl bg-[var(--siya-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-accent-hover)] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TrainingBtnNavy({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-xl bg-[var(--siya-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-primary-hover)] disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function TrainingLinkPrimary({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex rounded-xl bg-[var(--siya-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-accent-hover)]"
    >
      {children}
    </a>
  );
}

/** Use with next/link by passing className on Link */
export const trainingLinkPrimaryClass =
  "inline-flex rounded-xl bg-[var(--siya-accent)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-accent-hover)]";
export const trainingLinkSecondaryClass =
  "inline-flex rounded-xl border border-[var(--siya-border)] bg-white px-4 py-2.5 text-sm font-medium text-[var(--siya-text-secondary)] transition hover:bg-[var(--siya-bg-page)]";
export const trainingLinkNavyClass =
  "inline-flex rounded-xl bg-[var(--siya-primary)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--siya-primary-hover)]";

export function TrainingInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-[var(--siya-border)] bg-[var(--siya-bg-page)] px-3 py-2 text-sm text-[var(--siya-text)] outline-none focus:border-[var(--siya-accent)] focus:ring-2 focus:ring-[var(--siya-accent)]/20 ${props.className ?? ""}`}
    />
  );
}

export function TrainingProgressBar({ pct }: { pct: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-[var(--siya-bg-subtle)]">
      <div
        className="h-full rounded-full bg-[var(--siya-accent)] transition-all"
        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
      />
    </div>
  );
}

export type QuizOptionState = "default" | "selected" | "correct" | "incorrect" | "muted";

export function quizOptionClass(state: QuizOptionState, interactive: boolean) {
  const base =
    "flex w-full rounded-xl border px-4 py-3 text-left text-sm transition-colors text-[var(--siya-text-secondary)]";
  const map: Record<QuizOptionState, string> = {
    default: "border-[var(--siya-border)] bg-white",
    selected: "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)]",
    correct: "border-[var(--siya-primary)] bg-[var(--siya-bg-subtle)]",
    incorrect: "border-red-300 bg-red-50/80",
    muted: "border-[var(--siya-border)] bg-white opacity-60",
  };
  const hover = interactive ? " hover:border-[var(--siya-accent)]/50 hover:bg-[var(--siya-bg-page)]" : "";
  return `${base} ${map[state]}${hover}`;
}
