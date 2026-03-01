"use client";

import { ArrowRight, Zap, Download } from "lucide-react";
import type { Translation, Lang } from "@/app/types";
import { CopyButton } from "@/app/components";

interface HeroSectionProps {
  t: Translation;
  lang: Lang;
  onOpenInstallModal: () => void;
}

const HERO_WORDS_EN = ["developers", "teams", "startups", "agencies"];
const HERO_WORDS_VI = ["lập trình viên", "đội nhóm", "startup", "agency"];

/**
 * Hero section with centered layout and rotating text
 */
export function HeroSection({ t, lang, onOpenInstallModal }: HeroSectionProps) {
  const heroWords = lang === "vi" ? HERO_WORDS_VI : HERO_WORDS_EN;

  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 md:px-6 md:pb-20 md:pt-16">
      <div className="flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f2d0bf] bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[#b86539]">
          <Zap className="h-3.5 w-3.5" aria-hidden="true" />
          {t.badge}
        </div>

        {/* Headline with rotating text */}
        <h1 className="mt-6 text-4xl font-bold leading-[1.15] text-[var(--text-primary)] md:text-6xl">
          {lang === "vi" ? "Hạ tầng cho " : "Infrastructure for "}
          <span className="relative inline-block h-[1.2em] overflow-hidden align-bottom text-[var(--accent)]">
            <span className="hero-rotating-words">
              {heroWords.map((word) => (
                <span key={word} className="block h-[1.2em] leading-[1.2em]">
                  {word}
                </span>
              ))}
            </span>
          </span>
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-[600px] text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
          {t.heroDesc}
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          >
            {t.heroStart}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
          <a
            href="/docs"
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-primary)] transition hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] focus:ring-offset-2"
          >
            {t.heroExplore}
          </a>
        </div>

        {/* Install Command */}
        <div className="mt-8 w-full max-w-[600px] rounded-xl border border-[var(--border)] bg-[var(--bg-code)] px-4 py-3 font-mono text-xs text-[#8de0ff] md:text-sm">
          <code>{t.install}</code>
        </div>

        {/* Install Actions */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={onOpenInstallModal}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            View installer script
          </button>
          <CopyButton text={t.install} label="Copy command" />
        </div>
      </div>
    </section>
  );
}
