import { Suspense } from "react";
import { LevelUpHub } from "@/components/companion/LevelUpHub";

export default function LearnPracticePage() {
  return (
    <div className="h-full overflow-y-auto">
      <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text-muted)]">Loading practice…</p>}>
        <LevelUpHub />
      </Suspense>
    </div>
  );
}
