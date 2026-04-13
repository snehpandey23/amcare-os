"use client";

import type { WorkforceRole } from "@/lib/types";

const ROLES: { value: WorkforceRole; label: string }[] = [
  { value: "provider", label: "Provider / clinician" },
  { value: "nurse", label: "Nurse / MA" },
  { value: "admin", label: "Admin / billing / front desk" },
  { value: "other", label: "Other workforce" },
];

export function RolePicker({
  value,
  onChange,
}: {
  value: WorkforceRole;
  onChange: (r: WorkforceRole) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {ROLES.map((r) => (
        <button
          key={r.value}
          type="button"
          onClick={() => onChange(r.value)}
          className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
            value === r.value
              ? "border-teal-600 bg-teal-50 text-teal-800 dark:border-teal-500 dark:bg-teal-950/60 dark:text-teal-200"
              : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-600 dark:text-zinc-400"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
