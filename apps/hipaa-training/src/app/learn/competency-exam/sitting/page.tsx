import { Suspense } from "react";
import { SittingExamEntry } from "@/components/competency-exam/SittingExamEntry";

export default function CompetencyExamSittingPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-secondary)]">Loading sitting…</p>}>
      <SittingExamEntry />
    </Suspense>
  );
}
