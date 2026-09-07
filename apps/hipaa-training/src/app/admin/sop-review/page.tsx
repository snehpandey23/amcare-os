import { Suspense } from "react";
import { SopReviewPanel } from "@/components/admin/SopReviewPanel";

export default function AdminSopReviewPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading review…</p>}>
      <SopReviewPanel />
    </Suspense>
  );
}
