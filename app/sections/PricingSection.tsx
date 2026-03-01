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
          ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-[0_16px_40px_rgba(224,122,69,.14)]"
          : "border-[var(--border)] bg-[var(--bg-primary)] shadow-[0_10px_28px_rgba(15,23,42,.05)]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>
        {isHighlighted && (
          <span className="rounded-full border border-[#f2d0bf] bg-[var(--accent-light)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#b86539]">
            {t.mostPopular}
          </span>
        )}
      </div>

      {/* Price */}
      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold text-[var(--text-primary)]">{plan.price}</span>
        <span className="pb-1 text-sm text-[var(--text-muted)]">{t.period}</span>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-[var(--text-muted)]">{plan.description}</p>

      {/* Features */}
      <ul className="mt-5 space-y-2">
        {plan.points.map((point) => (
          <li key={point} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <BadgeCheck
              className="h-4 w-4 flex-shrink-0 text-[var(--accent)]"
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
            ? "bg-[var(--accent)] text-white hover:opacity-90 focus:ring-[var(--accent)]"
            : "border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] focus:ring-[var(--border)]"
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
          className="mt-2 text-3xl font-bold text-[var(--text-primary)] md:text-5xl"
        >
          {t.pricingTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-[var(--text-muted)] md:text-base">
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
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 md:p-6">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {t.pricingNotesTitle}
        </p>
        <ul className="mt-3 space-y-2">
          {t.pricingNotes.map((note) => (
            <li
              key={note}
              className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"
            >
              <BadgeCheck
                className="h-4 w-4 flex-shrink-0 text-[var(--accent)]"
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
