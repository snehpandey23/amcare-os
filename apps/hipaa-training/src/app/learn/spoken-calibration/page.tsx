"use client";

import { Suspense } from "react";
import { SpokenScoringCalibration } from "@/components/companion/SpokenScoringCalibration";

export default function SpokenCalibrationPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <Suspense fallback={<p className="p-6 text-sm text-[var(--siya-text)]">Loading calibration…</p>}>
        <SpokenScoringCalibration />
      </Suspense>
    </div>
  );
}
