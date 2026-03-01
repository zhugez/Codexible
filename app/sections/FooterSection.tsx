import type { Translation } from "@/app/types";

interface FooterSectionProps {
  t: Translation;
}

/**
 * Footer with 4-column grid layout
 */
export function FooterSection({ t }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--border)] bg-[var(--bg-primary)] py-12">
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        {/* Grid */}
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Brand column */}
          <div>
            <p className="text-lg font-bold text-[var(--text-primary)]">Codexible</p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">{t.footerTagline}</p>
          </div>

          {/* Dynamic columns */}
          {t.footerColumns.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                {col.title}
              </p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] focus:outline-none focus:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-[var(--border)] pt-6 text-center text-xs text-[var(--text-muted)]">
          <p>&copy; {currentYear} Codexible. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
