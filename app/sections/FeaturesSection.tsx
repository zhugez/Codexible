import type { Translation } from "@/app/types";

interface FeaturesSectionProps {
  t: Translation;
}

/**
 * Features grid section
 */
export function FeaturesSection({ t }: FeaturesSectionProps) {
  return (
    <section
      id="features"
      className="bg-[#ecf7f8] py-14 md:py-20"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-6xl px-5 md:px-6">
        {/* Section Header */}
        <div className="mb-8 md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#b86539]">
            {t.coreLabel}
          </p>
          <h2
            id="features-heading"
            className="mt-2 text-3xl font-bold text-black md:text-5xl"
          >
            {t.coreTitle}
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {t.features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,.06)] transition-shadow hover:shadow-[0_20px_40px_rgba(15,23,42,.1)]"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3ed] text-[#e07a45]">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-[#101828]">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475467]">
                {body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
