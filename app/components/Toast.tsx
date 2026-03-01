"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "info";
  onDismiss: () => void;
}

export function Toast({ message, variant = "info", onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const variantStyles = {
    success: "border-[var(--green)] bg-[var(--green-light)] text-[var(--green)]",
    error: "border-[var(--red)] bg-[var(--red-light)] text-[var(--red)]",
    info: "border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)]",
  };

  return (
    <div
      role="alert"
      className={`toast-enter fixed bottom-4 right-4 z-[200] rounded-xl border px-4 py-3 text-sm font-medium shadow-lg ${variantStyles[variant]}`}
    >
      {message}
    </div>
  );
}
