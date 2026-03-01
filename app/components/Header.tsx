"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import type { Lang, NavCopy } from "@/app/types";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { MobileMenu } from "@/app/components/MobileMenu";

interface HeaderProps {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  nav: NavCopy;
  ctaTop: string;
}

/**
 * Sticky header with navigation, theme toggle, and mobile menu
 */
export function Header({ lang, onLangChange, nav, ctaTop }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-6">
        {/* Logo */}
        <a
          href="#"
          className="text-lg font-bold tracking-tight text-[var(--text-primary)]"
          aria-label="Codexible Home"
        >
          Codexible
        </a>

        {/* Navigation - Desktop */}
        <nav
          className="hidden items-center gap-7 text-sm text-[var(--text-secondary)] md:flex"
          aria-label="Main navigation"
        >
          <a href="#features" className="hover:text-[var(--text-primary)] transition-colors">
            {nav.features}
          </a>
          <a href="#pricing" className="hover:text-[var(--text-primary)] transition-colors">
            {nav.pricing}
          </a>
          <a href="#trust" className="hover:text-[var(--text-primary)] transition-colors">
            {nav.trust}
          </a>
          <a href="/docs" className="hover:text-[var(--text-primary)] transition-colors">
            {nav.docs}
          </a>
          <a href="/dashboard/login" className="hover:text-[var(--text-primary)] transition-colors">
            {nav.dashboard}
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="hidden md:block">
            <LanguageToggle currentLang={lang} onLangChange={onLangChange} />
          </div>
          <a
            href="#pricing"
            className="hidden rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 md:inline-flex"
          >
            {ctaTop}
          </a>

          {/* Hamburger - Mobile only */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        lang={lang}
        onLangChange={onLangChange}
        nav={nav}
      />
    </header>
  );
}
