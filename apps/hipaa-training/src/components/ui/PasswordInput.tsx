"use client";

import { useId, useState } from "react";
import { TrainingInput } from "@/components/training/training-ui";

function EyeIcon({ crossed }: { crossed?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {crossed ? (
        <>
          <path d="M3 3l18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 9.3 3.1 11 7.5a11.4 11.4 0 0 1-1.7 2.9" />
          <path d="M6.6 6.6A11.4 11.4 0 0 0 1 12.5C2.7 16.9 7 20 12 20c1.5 0 2.9-.3 4.2-.8" />
        </>
      ) : (
        <>
          <path d="M1 12.5C2.7 8.1 7 5 12 5s9.3 3.1 11 7.5C21.3 16.9 17 20 12 20S2.7 16.9 1 12.5Z" />
          <circle cx="12" cy="12.5" r="3" />
        </>
      )}
    </svg>
  );
}

/**
 * Password field with show/hide toggle (eye / eye-slash).
 * Default: masked. Toggle is manual only.
 */
export function PasswordInput({
  className = "",
  id,
  onChange,
  value,
  ...props
}: Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">) {
  const [visible, setVisible] = useState(false);
  const autoId = useId();
  const inputId = id ?? autoId;

  return (
    <div className="relative w-full" data-password-input="">
      <TrainingInput
        {...props}
        id={inputId}
        value={value}
        type={visible ? "text" : "password"}
        className={`pr-10 ${className}`}
        data-password-masked={visible ? "false" : "true"}
        onChange={(e) => {
          // Browsers can emit a spurious empty event when flipping type
          // password↔text. Keep controlled parent state and restore DOM.
          if (e.target.value === "" && value != null && String(value).length > 0) {
            e.target.value = String(value);
            return;
          }
          onChange?.(e);
        }}
      />
      <button
        type="button"
        tabIndex={0}
        className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-[var(--siya-text-muted)] transition hover:bg-[var(--siya-bg-subtle)] hover:text-[var(--siya-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--siya-accent)]/30"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={inputId}
        data-password-visibility-toggle=""
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setVisible((v) => !v);
        }}
      >
        <EyeIcon crossed={visible} />
      </button>
    </div>
  );
}
