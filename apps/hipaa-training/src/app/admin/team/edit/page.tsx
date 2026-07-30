import { Suspense } from "react";
import { TeamMemberEditPanel } from "@/components/admin/TeamMemberEditPanel";

export default function AdminTeamMemberEditPage() {
  return (
    <Suspense fallback={<p className="p-8 text-sm text-[var(--siya-text-muted)]">Loading…</p>}>
      <TeamMemberEditPanel />
    </Suspense>
  );
}
