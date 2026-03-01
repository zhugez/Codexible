import type { Translation } from "@/app/types";

interface TrustSectionProps {
  t: Translation;
}

/**
 * Trust indicators section with key metrics
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
      <h2 id="trust-heading" className="sr-only">
        Trust Indicators
      </h2>
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3 md:px-6">
        {metrics.map(([value, label]) => (
          <div
            key={label}
            className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-5 text-center transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-[var(--text-primary)]">{value}</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
