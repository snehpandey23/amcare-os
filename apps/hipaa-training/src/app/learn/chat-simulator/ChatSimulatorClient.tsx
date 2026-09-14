"use client";

import { useSearchParams } from "next/navigation";
import { PatientChatSimulator } from "@/components/companion/PatientChatSimulator";

export function ChatSimulatorClient() {
  const sp = useSearchParams();
  const sttStudyMode = sp.get("sttStudy") === "1" || sp.get("sttStudy") === "true";
  return <PatientChatSimulator sttStudyMode={sttStudyMode} />;
}
