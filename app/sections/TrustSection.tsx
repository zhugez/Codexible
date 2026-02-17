import type { Translation } from "@/app/types";

interface TrustSectionProps {
  t: Translation;
}

/**
 * Trust indicators section with key metrics
 */
export function TrustSection({ t }: TrustSectionProps) {
  const metrics: [string, string][] = [
    ["99.95%", t.trustLabels[0]],
    ["< 180ms", t.trustLabels[1]],
    ["24/7", t.trustLabels[2]],
  ];

  return (
    <section
      id="trust"
      className="border-y border-[#e5e7eb] bg-white"
      aria-labelledby="trust-heading"
    >
      <h2 id="trust-heading" className="sr-only">
        Trust Indicators
      </h2>
      <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3 md:px-6">
        {metrics.map(([value, label]) => (
          <div
            key={label}
            className="rounded-xl border border-[#e6ebf2] bg-[#fbfdff] p-5 text-center transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-[#101828]">{value}</p>
            <p className="mt-1 text-sm text-[#667085]">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
