import type { Translation } from "@/app/types";

interface TrustSectionProps {
  t: Translation;
}

/**
 * Trust section — data-dense, no card containers.
 * Uses divide-y borders and mono tabular numbers.
 * Fits the "technical, precise" brand personality.
 */
export function TrustSection({ t }: TrustSectionProps) {
  const [uptimeLabel, latencyLabel, guardrailsLabel] = t.trustLabels;
  const metrics: [string, string][] = [
    ["99.95%", uptimeLabel],
    ["< 180ms", latencyLabel],
    ["24/7", guardrailsLabel],
  ];

  return (
    <section
      id="trust"
      className="border-y border-[var(--border)] bg-[var(--bg-primary)]"
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">Trust Indicators</h2>
      <div className="mx-auto grid max-w-6xl divide-y divide-[var(--border)] px-5 md:grid-cols-3 md:divide-x md:divide-y-0 md:px-6">
        {metrics.map(([value, label], index) => (
          <div
            key={label}
            className="flex items-center justify-between gap-4 py-6 md:flex-col md:justify-center md:py-10"
          >
            {/* Value — large mono tabular */}
            <p
              className="text-3xl font-bold tabular-nums tracking-tight text-[var(--text-primary)] md:text-4xl"
              aria-label={`${value} ${label}`}
            >
              {value}
            </p>
            {/* Label */}
            <p className="text-sm text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
