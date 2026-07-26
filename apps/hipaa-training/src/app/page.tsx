"use client";

import { SiyaChat } from "@/components/siya/SiyaChat";
import { AssistantBrandPanel } from "@/components/siya/AssistantBrandPanel";
import { BRAND } from "@/lib/brand";

export default function HomePage() {
  return (
    <div className="flex h-full min-h-0">
      <AssistantBrandPanel />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="shrink-0 border-b border-[var(--siya-border)] bg-white/80 px-4 py-4 text-center lg:hidden">
          <p className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
            {BRAND.appName}
          </p>
          <p className="text-sm text-[var(--siya-text-muted)]">How can I help you today?</p>
        </div>
        <div className="hidden shrink-0 border-b border-[var(--siya-border)] bg-white/60 px-6 py-5 lg:block">
          <h1 className="font-[family-name:var(--font-poppins)] text-xl font-semibold text-[var(--siya-primary)]">
            How can I help you today?
          </h1>
          <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">{BRAND.homeSubtitle}</p>
        </div>
        <div className="min-h-0 flex-1">
          <SiyaChat />
        </div>
      </div>
    </div>
  );
}
