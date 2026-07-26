import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function AssistantBrandPanel() {
  return (
    <aside className="relative hidden w-[min(380px,38vw)] shrink-0 flex-col border-r border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] lg:flex">
      <div className="flex flex-1 flex-col p-8">
        <Image
          src="/assets/images/siya-health-logo.png"
          alt="Siya Health"
          width={160}
          height={48}
          className="h-10 w-auto object-contain object-left"
          priority
        />
        <p className="mt-6 font-[family-name:var(--font-poppins)] text-2xl font-semibold leading-snug text-[var(--siya-primary)]">
          {BRAND.appName}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--siya-text-secondary)]">{BRAND.appTagline}</p>
        <span className="mt-4 inline-flex w-fit rounded-full border border-[var(--siya-border)] bg-white px-3 py-1 text-xs font-medium text-[var(--siya-accent)]">
          {BRAND.internalBadge}
        </span>

        <div className="relative mt-8 overflow-hidden rounded-[var(--siya-radius-lg)] shadow-[var(--siya-shadow-lg)]">
          <Image
            src="/assets/images/telehealth-workspace.png"
            alt="Team workspace"
            width={640}
            height={400}
            className="h-auto w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,58,138,0.55)] to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
            One prompt · right team · approved answers
          </p>
        </div>

        <ul className="mt-6 space-y-2 text-sm text-[var(--siya-text-secondary)]">
          <li className="flex gap-2">
            <span className="text-[var(--siya-accent)]" aria-hidden>
              ✓
            </span>
            Company-wide — ops, marketing, HR, finance, tools
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--siya-accent)]" aria-hidden>
              ✓
            </span>
            Pulls from live SOPs and decision log, not random docs
          </li>
          <li className="flex gap-2">
            <span className="text-[var(--siya-accent)]" aria-hidden>
              ✓
            </span>
            Escalates with context when policy is missing
          </li>
        </ul>

        <div className="mt-auto pt-8">
          <p className="text-xs leading-relaxed text-[var(--siya-text-muted)]">{BRAND.privacyFootnote}</p>
          <p className="mt-2 text-xs text-[var(--siya-text-muted)]">{BRAND.entityNote}</p>
          <Link
            href="/training"
            className="mt-3 inline-block text-xs font-medium text-[var(--siya-text-muted)] hover:text-[var(--siya-accent)] hover:underline"
          >
            Staff compliance training (optional) →
          </Link>
        </div>
      </div>
    </aside>
  );
}
