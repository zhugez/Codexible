import type { Translation } from "@/app/types";

interface FeaturesSectionProps {
  t: Translation;
}

/**
 * Features section — 2-column asymmetric grid, no icon circles.
 * Labels below cards (gallery-style). Bold headlines, no icon compensation.
 * Eschews the "3-column icon-in-colored-circle" AI slop pattern.
 */
export function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="bg-[var(--gray-50)] py-16 md:py-24"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        {/* Section header — left-aligned, no center alignment */}
        <div className="mb-10 md:mb-14">
          <p className="text-sm font-semibold uppercase tracking-widest text-[var(--accent)]">
            {t.coreLabel}
          </p>
          <h2
            id="features-heading"
            className="mt-2 text-left text-3xl font-bold tracking-tight text-[var(--text-primary)] md:text-4xl lg:text-5xl"
          >
            {t.coreTitle}
          </h2>
        </div>

        {/* 2-column asymmetric grid — alternating visual rhythm */}
        {/* Zigzag pattern: large+small, then small+large, creating organic hierarchy */}
        <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
          {t.features.map(({ title, body }, index) => {
            // Every other card is "featured" — wider padding, larger type
            const featured = index % 2 === 0;
            return (
              <article
                key={title}
                className={`
                  group relative rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-6 md:p-8
                  transition-shadow duration-normal hover:shadow-lg
                  ${featured ? "lg:p-10" : ""}
                `}
              >
                {/* Accent bar — left border glow, not left-colored border */}
                <div
                  className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[var(--accent)] opacity-0 transition-opacity duration-normal group-hover:opacity-100"
                  aria-hidden="true"
                />

                <h3 className="text-left text-xl font-bold tracking-tight text-[var(--text-primary)] md:text-2xl">
                  {title}
                </h3>
                <p className="mt-3 text-left text-sm leading-relaxed text-[var(--text-secondary)] md:text-base">
                  {body}
                </p>

                {/* Arrow hint — indicates depth */}
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--accent)] opacity-0 transition-opacity duration-fast group-hover:opacity-100">
                  Learn more
                  <svg
                    className="h-3 w-3 transition-transform duration-fast group-hover:translate-x-0.5"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path d="M3 8h10M9 4l4 4-4 4" />
                  </svg>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
