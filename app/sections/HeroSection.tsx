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
 * Hero section — asymmetric split layout.
 * Left: copy + CTAs. Right: install command (desktop).
 * Eschews centered "AI slop" layout in favor of purposeful asymmetry.
 */
export function HeroSection({ t, lang, onOpenInstallModal }: HeroSectionProps) {
  const heroWords = lang === "vi" ? HERO_WORDS_VI : HERO_WORDS_EN;

  return (
    <section className="relative overflow-hidden">
      {/* Subtle background gradient — warm accent glow, not decorative blobs */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full opacity-[0.06] blur-3xl"
        style={{ background: "var(--accent)" }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-12 md:px-6 md:pb-24 md:pt-20">
        {/* Asymmetric grid: copy takes more space, install snippet is a side element */}
        <div className="grid gap-12 md:grid-cols-[1fr_auto] md:items-start md:gap-16">
          {/* Left: Copy */}
          <div className="space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--accent)]/20 bg-[var(--accent-light)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
              <Zap className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              {t.badge}
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] md:text-5xl lg:text-6xl">
              {lang === "vi" ? "Hạ tầng cho " : "Infrastructure for "}
              <span className="relative inline-block h-[1.15em] overflow-hidden align-bottom text-[var(--accent)]">
                <span className="hero-rotating-words">
                  {heroWords.map((word) => (
                    <span key={word} className="block h-[1.15em] leading-[1.15em]">
                      {word}
                    </span>
                  ))}
                </span>
              </span>
            </h1>

            {/* Description — max-width controlled for readability */}
            <p className="max-w-[52ch] text-base leading-relaxed text-[var(--text-secondary)] md:text-lg">
              {t.heroDesc}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:-translate-y-px hover:bg-[var(--accent-hover)] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 active:translate-y-0"
              >
                {t.heroStart}
                <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
              </a>
              <a
                href="/docs"
                className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--border)] focus:ring-offset-2"
              >
                {t.heroExplore}
              </a>
            </div>
          </div>

          {/* Right: Install command — stacked vertically, not inline */}
          <div className="w-full space-y-3 md:max-w-[420px]">
            {/* Install command block */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-code)] px-4 py-3 font-mono text-xs leading-relaxed text-[#8de0ff] md:text-sm tabular-nums">
              <code>{t.install}</code>
            </div>

            {/* Install actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition-all hover:-translate-y-px hover:bg-[var(--accent-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 active:translate-y-0"
              >
                <Download className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                Installer script
              </button>
              <CopyButton text={t.install} label="Copy install command" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
