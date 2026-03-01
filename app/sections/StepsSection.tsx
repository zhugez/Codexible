import type { Translation } from "@/app/types";

interface StepsSectionProps {
  t: Translation;
}

/**
 * "Get started in 3 steps" section
 */
export function StepsSection({ t }: StepsSectionProps) {
  const steps = t.steps;

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
      <h2 className="text-center text-3xl font-bold text-[var(--text-primary)] md:text-5xl">
        {steps.title}
      </h2>

      <div className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-4">
        {/* Connecting line (desktop only) */}
        <div className="absolute left-[16.67%] right-[16.67%] top-6 hidden h-0.5 bg-[var(--border)] md:block" aria-hidden="true" />

        {steps.items.map((step, i) => (
          <div key={i} className="relative flex flex-col items-center text-center">
            {/* Step number */}
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent)] text-lg font-bold text-white">
              {i + 1}
            </div>

            {/* Title */}
            <h3 className="mt-4 text-lg font-bold text-[var(--text-primary)]">
              {step.title}
            </h3>

            {/* Description */}
            <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--text-secondary)]">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
