"use client";

import { ArrowRight, Zap, Download } from "lucide-react";
import type { Translation, Lang } from "@/app/types";
import { MetricCard } from "@/app/components/MetricCard";
import { CopyButton } from "@/app/components/CopyButton";

interface HeroSectionProps {
  t: Translation;
  lang: Lang;
  onOpenInstallModal: () => void;
}

/**
 * Hero section with main CTA and metrics snapshot
 */
export function HeroSection({ t, lang, onOpenInstallModal }: HeroSectionProps) {
  const metrics: [string, string][] = [
    [lang === "vi" ? "API key hoạt động" : "Active keys", "1,248"],
    [lang === "vi" ? "Độ trễ route" : "Avg routing latency", "164ms"],
    [lang === "vi" ? "Chi tiêu hôm nay" : "Today spend", "2.8M VND"],
    [lang === "vi" ? "Policy chặn" : "Policy blocks", "37"],
  ];

  return (
    <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 md:px-6 md:pb-20 md:pt-16">
      <div className="grid items-stretch gap-6 md:grid-cols-[1.2fr_.8fr]">
        {/* Left: Main Hero Content */}
        <div className="rounded-3xl border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f2d0bf] bg-[#fff3ed] px-3 py-1 text-xs font-semibold text-[#b86539]">
            <Zap className="h-3.5 w-3.5" aria-hidden="true" />
            {t.badge}
          </div>

          {/* Headline */}
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-black md:text-6xl">
            {t.heroTitleA}
            <br />
            <span className="text-[#e07a45]">{t.heroTitleB}</span>
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#475467] md:text-lg">
            {t.heroDesc}
          </p>

          {/* CTAs */}
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-[#e07a45] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e07a45] focus:ring-offset-2"
            >
              {t.heroStart}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href="#features"
              className="rounded-xl border border-[#d7dee7] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc] focus:outline-none focus:ring-2 focus:ring-[#d7dee7] focus:ring-offset-2"
            >
              {t.heroExplore}
            </a>
          </div>

          {/* Install Command */}
          <div className="mt-7 rounded-xl border border-[#e5e7eb] bg-[#0b1020] px-4 py-3 font-mono text-xs text-[#8de0ff] md:text-sm">
            <code>{t.install}</code>
          </div>

          {/* Install Actions */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[#e07a45] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[#e07a45] focus:ring-offset-2"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              View installer script
            </button>
            <CopyButton text={t.install} label="Copy command" />
          </div>
        </div>

        {/* Right: Metrics Snapshot */}
        <div className="rounded-3xl border border-[#e8ecf1] bg-gradient-to-b from-white to-[#f6f9fc] p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[#667085]">
            {t.snapshot}
          </h2>

          <div className="mt-5 space-y-3">
            {metrics.map(([label, value]) => (
              <MetricCard key={label} label={label} value={value} />
            ))}
          </div>

          {/* Status Banner */}
          <div className="mt-5 rounded-xl border border-[#f2d0bf] bg-[#fff3ed] p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#b86539]">
              {t.statusTitle}
            </p>
            <p className="mt-1 text-sm text-[#7a2e08]">{t.statusBody}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
