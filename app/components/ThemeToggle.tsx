"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/app/hooks/useTheme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Sun className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
