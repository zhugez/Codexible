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
 * Sticky header — glassmorphism with backdrop blur.
 * Nav links use CSS variables. CTA has hover/active/focus states.
 */
export function Header({ lang, onLangChange, nav, ctaTop }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-primary)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 md:h-16 md:px-6">
        {/* Logo */}
        <a
          href="#"
          className="text-base font-bold tracking-tight text-[var(--text-primary)] transition-colors hover:text-[var(--accent)] focus:outline-none"
          aria-label="Codexible home"
        >
          Codexible
        </a>

        {/* Desktop navigation */}
        <nav
          className="hidden items-center gap-6 text-sm text-[var(--text-secondary)] md:flex"
          aria-label="Main navigation"
        >
          <a href="#features" className="transition-colors hover:text-[var(--text-primary)]">
            {nav.features}
          </a>
          <a href="#pricing" className="transition-colors hover:text-[var(--text-primary)]">
            {nav.pricing}
          </a>
          <a href="#trust" className="transition-colors hover:text-[var(--text-primary)]">
            {nav.trust}
          </a>
          <a href="/docs" className="transition-colors hover:text-[var(--text-primary)]">
            {nav.docs}
          </a>
          <a href="/dashboard/login" className="transition-colors hover:text-[var(--text-primary)]">
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
            className="hidden rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--accent-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 active:translate-y-0 md:inline-flex"
          >
            {ctaTop}
          </a>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-strong)] hover:text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Menu className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
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
