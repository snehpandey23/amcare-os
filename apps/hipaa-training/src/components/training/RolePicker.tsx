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
              ? "border-[var(--siya-accent)] bg-[var(--siya-bg-subtle)] font-medium text-[var(--siya-primary)]"
              : "border-[var(--siya-border)] text-[var(--siya-text-secondary)] hover:border-[var(--siya-accent)]/40 hover:bg-[var(--siya-bg-page)]"
          }`}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
