import { Suspense } from "react";
import { PatientChatSimulator } from "@/components/companion/PatientChatSimulator";

export default function ChatSimulatorPage() {
  return (
    <div className="h-full min-h-0">
      <Suspense fallback={<p className="p-6 text-sm font-medium text-[var(--siya-text)]">Loading chat simulator…</p>}>
        <PatientChatSimulator />
      </Suspense>
    </div>
  );
}
