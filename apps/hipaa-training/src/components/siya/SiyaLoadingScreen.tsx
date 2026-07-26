import Image from "next/image";
import { BRAND } from "@/lib/brand";

export function SiyaLoadingScreen({ message = "Loading Siya Assistant…" }: { message?: string }) {
  return (
    <div className="siya-page-bg flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <Image src="/assets/images/siya-health-logo.png" alt="Siya Health" width={160} height={48} className="h-10 w-auto" />
      <p className="font-[family-name:var(--font-poppins)] text-lg font-semibold text-[var(--siya-primary)]">
        {BRAND.appName}
      </p>
      <p className="text-sm text-[var(--siya-text-muted)]">{message}</p>
    </div>
  );
}
