import { Suspense } from "react";
import { SopWorkspace } from "@/components/sops/SopWorkspace";

export default function MemoryKnowledgeSopsPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading SOPs…</p>}>
      <SopWorkspace />
    </Suspense>
  );
}
