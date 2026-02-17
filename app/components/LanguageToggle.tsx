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
      className="flex rounded-lg border border-[#d7dee7] bg-white p-0.5"
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
            ? "bg-[#e07a45] text-white"
            : "text-[#667085] hover:text-[#475467]"
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
            ? "bg-[#e07a45] text-white"
            : "text-[#667085] hover:text-[#475467]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
