import { Suspense } from "react";
import SopBuilderPage from "./page.client";

export default function Page() {
  return (
    <Suspense fallback={<p className="px-4 py-8 text-sm text-[var(--siya-text-muted)]">Loading…</p>}>
      <SopBuilderPage />
    </Suspense>
  );
}
