"use client";

import type { Lang } from "@/app/types";

interface LanguageToggleProps {
  currentLang: Lang;
  onLangChange: (lang: Lang) => void;
}

/**
 * Language toggle component with accessibility support
 */
export function LanguageToggle({
  currentLang,
  onLangChange,
}: LanguageToggleProps) {
  return (
    <div
      className="flex rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-0.5"
      role="group"
      aria-label="Select language"
    >
      <button
        type="button"
        onClick={() => onLangChange("vi")}
        aria-pressed={currentLang === "vi"}
        aria-label="Chuyển sang tiếng Việt"
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
          currentLang === "vi"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        VI
      </button>
      <button
        type="button"
        onClick={() => onLangChange("en")}
        aria-pressed={currentLang === "en"}
        aria-label="Switch to English"
        className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
          currentLang === "en"
            ? "bg-[var(--accent)] text-white"
            : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
