import { Suspense } from "react";
import { FeedbackFridayPage } from "@/components/ops/FeedbackFridayPage";

export default function FeedbackPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading…</p>}>
      <FeedbackFridayPage />
    </Suspense>
  );
}
