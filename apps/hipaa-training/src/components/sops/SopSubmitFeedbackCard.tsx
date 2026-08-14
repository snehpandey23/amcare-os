"use client";

import type { SopSubmitFeedbackPayload } from "@/lib/sop-api";
import { portalStatusSuccessBox, portalStatusSuccessText, portalStatusWarnBox, portalStatusWarnText } from "@/lib/portal-ui";

export function SopSubmitFeedbackCard({
  feedback,
  note,
}: {
  feedback: SopSubmitFeedbackPayload;
  note?: string;
}) {
  const checks: { ok: boolean; label: string }[] = [
    { ok: feedback.purposeComplete, label: "Purpose" },
    { ok: feedback.scopeComplete, label: "Scope" },
    { ok: feedback.stepsComplete, label: "Steps" },
    { ok: feedback.exceptionsComplete, label: "Exceptions" },
    { ok: feedback.escalationComplete, label: "Escalation" },
    { ok: feedback.stepsSpecific, label: "Steps specific (not vague)" },
    { ok: !feedback.possibleDuplicate, label: "No obvious live duplicate" },
  ];
  const box = feedback.readyHint === "looks_ready" ? portalStatusSuccessBox : portalStatusWarnBox;
  const text = feedback.readyHint === "looks_ready" ? portalStatusSuccessText : portalStatusWarnText;

  return (
    <div className={`p-3 text-sm ${box} ${text}`}>
      <p className="font-semibold">
        {feedback.heuristicOnly ? "Structure checklist" : "AI review"} (feedback only — not a gate)
        {feedback.readyHint === "looks_ready" ? " · looks ready" : " · needs work before you finalize"}
      </p>
      <p className="mt-1 text-xs opacity-90">{feedback.summary}</p>
      <ul className="mt-2 grid gap-1 text-xs sm:grid-cols-2">
        {checks.map((c) => (
          <li key={c.label}>
            {c.ok ? "✓" : "○"} {c.label}
          </li>
        ))}
      </ul>
      {feedback.possibleDuplicate && feedback.duplicateOfTitle ? (
        <p className="mt-2 text-xs font-medium">Possible duplicate of: {feedback.duplicateOfTitle}</p>
      ) : null}
      {feedback.suggestions.length ? (
        <ul className="mt-2 list-disc space-y-1 pl-4 text-xs">
          {feedback.suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ) : null}
      {note ? <p className="mt-2 text-[10px] opacity-80">{note}</p> : null}
    </div>
  );
}
