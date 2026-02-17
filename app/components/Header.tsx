"use client";

import type { Lang, NavCopy } from "@/app/types";
import { LanguageToggle } from "./LanguageToggle";

interface HeaderProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  nav: NavCopy;
  ctaTop: string;
}

/**
 * Sticky header with navigation and language toggle
 */
export function Header({ lang, onLangChange, nav, ctaTop }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-6">
        {/* Logo */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-black"
          aria-label="Codexible Home"
        >
          Codexible
        </a>

        {/* Navigation - Desktop */}
        <nav
          className="hidden items-center gap-7 text-sm text-[#475467] md:flex"
          aria-label="Main navigation"
        >
          <a href="#features" className="hover:text-black transition-colors">
            {nav.features}
          </a>
          <a href="#pricing" className="hover:text-black transition-colors">
            {nav.pricing}
          </a>
          <a href="#trust" className="hover:text-black transition-colors">
            {nav.trust}
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <LanguageToggle currentLang={lang} onLangChange={onLangChange} />
          <a
            href="#pricing"
            className="rounded-xl bg-[#e07a45] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e07a45] focus:ring-offset-2"
          >
            {ctaTop}
          </a>
        </div>
      </div>
    </header>
  );
}
