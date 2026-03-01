"use client";

import { Copy, Check, X } from "lucide-react";
import { useCopyToClipboard } from "@/app/hooks";

interface CopyButtonProps {
  text: string;
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
}

/**
 * Button to copy text to clipboard with visual feedback
 */
export function CopyButton({
  text,
  label = "Copy",
  variant = "secondary",
  className = "",
}: CopyButtonProps) {
  const { copy, state } = useCopyToClipboard();

  const baseStyles =
    "inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary: "bg-[var(--accent)] text-white hover:opacity-90",
    secondary:
      "border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]",
  };

  const icon =
    state === "success" ? (
      <Check className="h-4 w-4" aria-hidden="true" />
    ) : state === "error" ? (
      <X className="h-4 w-4" aria-hidden="true" />
    ) : (
      <Copy className="h-4 w-4" aria-hidden="true" />
    );

  const labelText =
    state === "success" ? "Copied!" : state === "error" ? "Failed" : label;

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      disabled={!text}
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      aria-live="polite"
      aria-label={label}
    >
      {icon}
      {labelText}
    </button>
  );
}
