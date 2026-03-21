import { BadgeCheck } from "lucide-react";
import type { Translation, Plan } from "@/app/types";

interface PricingSectionProps {
  t: Translation;
}

/**
 * Pricing card — left-aligned content, accent CTA, no decorative icons.
 * Uses CSS variables for all colors. Focus ring matches border-radius.
 */
function PricingCard({ plan, t }: { plan: Plan; t: Translation }) {
  const featured = plan.highlight;

  return (
    <article
      className={`
        relative rounded-2xl border p-6 md:p-8
        transition-shadow duration-normal
        ${featured
          ? "border-[var(--accent)] bg-[var(--accent-light)] shadow-lg"
          : "border-[var(--border)] bg-[var(--bg-primary)]"
        }
      `}
    >
      {/* Featured badge */}
      {featured && (
        <div className="absolute -top-3 left-6 rounded-full border border-[var(--accent)] bg-[var(--accent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
          {t.mostPopular}
        </div>
      )}

      {/* Plan name */}
      <h3 className="text-xl font-bold text-[var(--text-primary)]">{plan.name}</h3>

      {/* Price */}
      <div className="mt-3 flex items-end gap-1">
        <span className="text-3xl font-bold tabular-nums text-[var(--text-primary)]">{plan.price}</span>
        <span className="pb-0.5 text-sm text-[var(--text-muted)]">{t.period}</span>
      </div>

      {/* Description */}
      <p className="mt-2 text-sm text-[var(--text-muted)]">{plan.description}</p>

      {/* Feature list */}
      <ul className="mt-5 space-y-2.5">
        {plan.points.map((point) => (
          <li key={point} className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]">
            <BadgeCheck
              className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
              strokeWidth={2.5}
              aria-hidden="true"
            />
            {point}
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href="#"
        className={`
          mt-6 flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold
          transition-all duration-fast
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${featured
            ? "bg-[var(--accent)] text-white shadow-sm hover:bg-[var(--accent-hover)] hover:-translate-y-px hover:shadow-md focus:ring-[var(--accent)] active:translate-y-0"
            : "border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-secondary)] focus:ring-[var(--border-strong)]"
          }
        `}
      >
        {plan.cta}
      </a>
    </article>
  );
}

/**
 * Pricing section — 3-column on desktop, no decorative elements.
 * Centered header, left-aligned cards.
 */
export function PricingSection({ t }: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-6xl px-5 py-16 md:px-6 md:py-24"
      aria-labelledby="pricing-heading"
    >
      {/* Section header */}
      <div className="mb-10 text-center md:mb-14">
        <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
          {t.pricingLabel}
        </p>
        <h2
          id="pricing-heading"
          className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
        >
          {t.pricingTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-[52ch] text-sm text-[var(--text-muted)] md:text-base">
          {t.pricingSubtitle}
        </p>
      </div>

      {/* Pricing cards */}
      <div className="grid gap-4 md:grid-cols-3 md:gap-6">
        {t.plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} t={t} />
        ))}
      </div>

      {/* Plan notes */}
      <div className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 md:p-6">
        <p className="text-sm font-semibold text-[var(--text-primary)]">
          {t.pricingNotesTitle}
        </p>
        <ul className="mt-3 space-y-2">
          {t.pricingNotes.map((note) => (
            <li
              key={note}
              className="flex items-start gap-2.5 text-sm text-[var(--text-secondary)]"
            >
              <BadgeCheck
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]"
                strokeWidth={2.5}
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
