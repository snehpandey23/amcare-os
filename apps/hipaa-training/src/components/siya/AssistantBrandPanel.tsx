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
            src="/assets/images/doctor-video-consult.png"
            alt="Telehealth care team"
            width={640}
            height={400}
            className="h-auto w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgba(30,58,138,0.55)] to-transparent" />
          <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white">
            Company memory · Ops · Marketing · Compliance · Tech
          </p>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Image
            src="/assets/images/hipaa-compliant.png"
            alt="HIPAA compliant"
            width={72}
            height={72}
            className="h-[72px] w-[72px] shrink-0 object-contain"
          />
          <p className="text-xs leading-relaxed text-[var(--siya-text-muted)]">
            Answers come from <strong>SiyaOS Knowledge Base</strong> topics—not clinical advice or the open internet.
            Never paste PHI here; escalate account-specific issues to Privacy or billing.
          </p>
        </div>

        <div className="mt-auto pt-8">
          <Image
            src="/assets/images/care-team.png"
            alt="Care team"
            width={400}
            height={120}
            className="rounded-xl opacity-90"
          />
          <p className="mt-3 text-xs text-[var(--siya-text-muted)]">{BRAND.entityNote}</p>
          <Link href="/training" className="mt-2 inline-block text-sm font-medium text-[var(--siya-accent)] hover:underline">
            Optional HIPAA certification course →
          </Link>
        </div>
      </div>
    </aside>
  );
}
