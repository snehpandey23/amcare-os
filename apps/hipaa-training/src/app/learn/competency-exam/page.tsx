import { CompetencyExam } from "@/components/competency-exam/CompetencyExam";
import { Suspense } from "react";

export default function CompetencyExamPage() {
  return (
    <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-secondary)]">Loading exam…</p>}>
      <CompetencyExam />
    </Suspense>
  );
}
