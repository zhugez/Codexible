import type { Translation } from "@/app/types";

interface CtaSectionProps {
  t: Translation;
  onOpenLogin: () => void;
}

/**
 * Bottom CTA section before footer
 */
export function CtaSection({ t, onOpenLogin }: CtaSectionProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center md:p-12">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
          {t.ctaSection.title}
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-base text-[var(--text-secondary)]">
          {t.ctaSection.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onOpenLogin}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          >
            {t.ctaSection.primaryCta}
          </button>
          <a
            href="https://t.me/codexible"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] focus:ring-offset-2"
          >
            {t.ctaSection.secondaryCta}
          </a>
        </div>
      </div>
    </section>
  );
}
