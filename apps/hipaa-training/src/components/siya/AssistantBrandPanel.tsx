import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function AssistantBrandPanel() {
  return (
    <aside className="relative hidden w-[min(320px,34vw)] shrink-0 flex-col border-r border-[var(--siya-border)] bg-[var(--siya-bg-subtle)] lg:flex">
      <div className="flex flex-1 flex-col p-8">
        <Image
          src="/assets/images/siya-health-logo.png"
          alt="Siya Health"
          width={140}
          height={42}
          className="h-9 w-auto object-contain object-left"
          priority
        />
        <p className="mt-5 font-[family-name:var(--font-poppins)] text-xl font-semibold leading-snug text-[var(--siya-primary)]">
          {BRAND.appName}
        </p>
        <p className="mt-1 text-sm text-[var(--siya-text-secondary)]">{BRAND.appTagline}</p>

        <div className="relative mt-6 overflow-hidden rounded-[var(--siya-radius-lg)] shadow-[var(--siya-shadow-lg)]">
          <Image
            src="/assets/images/care-team.png"
            alt="Remote team collaboration"
            width={480}
            height={640}
            className="aspect-[3/4] w-full object-cover object-center"
          />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-[var(--siya-text-secondary)]">
          For every team — ops, marketing, HR, accounts, tech, and leadership.
        </p>

        <div className="mt-auto pt-6">
          <Link
            href="/level-up"
            className="text-xs font-medium text-[var(--siya-accent)] hover:underline"
          >
            Daily learning → Level Up
          </Link>
          <p className="mt-3 text-[11px] leading-relaxed text-[var(--siya-text-muted)]">{BRAND.chatSafetyLine}</p>
        </div>
      </div>
    </aside>
  );
}
