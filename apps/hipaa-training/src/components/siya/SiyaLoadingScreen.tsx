import { BRAND } from "@/lib/brand";
import { SiyaWordmark } from "@/components/siya/SiyaWordmark";

type Props = {
  message?: string;
  /**
   * Auth boot / redirect gates — cream cover only (no wordmark).
   * Avoids a static splash before BrandIntroSplash on login / My day.
   */
  variant?: "branded" | "boot";
};

export function SiyaLoadingScreen({
  message = "Loading Siya Assistant…",
  variant = "branded",
}: Props) {
  if (variant === "boot") {
    return (
      <div
        className="siya-brand-intro siya-brand-intro--reduced"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  return (
    <div className="siya-page-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <SiyaWordmark size="login" />
      <p className="text-sm text-[var(--siya-text-muted)]">{message}</p>
      <span className="sr-only">{BRAND.appName}</span>
    </div>
  );
}
