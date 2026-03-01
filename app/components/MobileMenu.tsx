"use client";

import { useEffect, useRef } from "react";
import type { Lang, NavCopy } from "@/app/types";
import { LanguageToggle } from "@/app/components/LanguageToggle";

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  nav: NavCopy;
}

export function MobileMenu({ open, onClose, lang, onLangChange, nav }: MobileMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      menuRef.current?.focus();
    } else if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const links = [
    { href: "#features", label: nav.features },
    { href: "#pricing", label: nav.pricing },
    { href: "#trust", label: nav.trust },
    { href: "/docs", label: nav.docs },
    { href: "/dashboard/login", label: nav.dashboard },
  ];

  return (
    <div
      ref={menuRef}
      tabIndex={-1}
      className="border-b border-[var(--border)] bg-[var(--bg-primary)] px-5 py-4 md:hidden"
      role="menu"
    >
      <nav className="flex flex-col gap-3" aria-label="Mobile navigation">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            role="menuitem"
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="mt-3 flex items-center gap-3 border-t border-[var(--border)] pt-3">
        <LanguageToggle currentLang={lang} onLangChange={onLangChange} />
      </div>
    </div>
  );
}
