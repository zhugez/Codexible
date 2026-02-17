import { BadgeCheck } from "lucide-react";
import type { Translation, Plan } from "@/app/types";

interface PricingSectionProps {
  t: Translation;
}

/**
 * Single pricing card component
 */
function PricingCard({ plan, t }: { plan: Plan; t: Translation }) {
  const isHighlighted = plan.highlight;

  return (
    <article
      className={`rounded-2xl border p-6 transition-shadow hover:shadow-lg ${
        isHighlighted
          ? "border-[#e07a45] bg-[#fffaf7] shadow-[0_16px_40px_rgba(224,122,69,.14)]"
          : "border-[#e4e9f0] bg-white shadow-[0_10px_28px_rgba(15,23,42,.05)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-black">{plan.name}</h3>
        {isHighlighted && (
          <span className="rounded-full border border-[#f2d0bf] bg-[#fff3ed] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#b86539]">
            {t.mostPopular}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold text-[#101828]">{plan.price}</span>
        <span className="pb-1 text-sm text-[#667085]">{t.period}</span>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-[#667085]">{plan.description}</p>

      {/* Features */}
      <ul className="mt-5 space-y-2">
        {plan.points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm text-[#344054]">
            <BadgeCheck
              className="h-4 w-4 flex-shrink-0 text-[#e07a45]"
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#"
        className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isHighlighted
            ? "bg-[#e07a45] text-white hover:opacity-90 focus:ring-[#e07a45]"
            : "border border-[#d7dee7] hover:bg-[#f8fafc] focus:ring-[#d7dee7]"
        }`}
      >
        {plan.cta}
      </a>
    </article>
  );
}

/**
 * Pricing section with plan cards
 */
export function PricingSection({ t }: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20"
      aria-labelledby="pricing-heading"
    >
      {/* Section Header */}
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-[#b86539]">
          {t.pricingLabel}
        </p>
        <h2
          id="pricing-heading"
          className="mt-2 text-3xl font-bold text-black md:text-5xl"
        >
          {t.pricingTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[#667085] md:text-base">
          {t.pricingSubtitle}
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {t.plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} t={t} />
        ))}
      </div>

      {/* Notes */}
      <div className="mt-8 rounded-2xl border border-[#e4e9f0] bg-[#fbfdff] p-5 md:p-6">
        <p className="text-sm font-semibold text-[#111827]">
          {t.pricingNotesTitle}
        </p>
        <ul className="mt-3 space-y-2">
          {t.pricingNotes.map((note) => (
            <li
              key={note}
              className="flex items-center gap-2 text-sm text-[#475467]"
            >
              <BadgeCheck
                className="h-4 w-4 flex-shrink-0 text-[#e07a45]"
                aria-hidden="true"
              />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
