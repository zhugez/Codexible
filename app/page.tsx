const features = [
  {
    title: "Better, together.",
    body: "Codexible connects your coding workflows, routing, and cost control in one place.",
    points: [
      "One endpoint for all coding tools",
      "Realtime usage and budget visibility",
      "Daily credit guardrails",
      "Fast onboarding for teams",
    ],
  },
  {
    title: "Better, together.",
    body: "Use policy-driven model routing to keep quality high and cost predictable.",
    points: [
      "Route simple tasks to cheaper models",
      "Escalate complex tasks automatically",
      "Fallback handling and retries",
      "Provider abstraction for portability",
    ],
  },
  {
    title: "Better, together.",
    body: "Built for indie hackers and product teams shipping AI-powered coding features.",
    points: [
      "Team key management",
      "Rate limit and anti-abuse controls",
      "Clean billing and spend ledger",
      "Instant production deployment",
    ],
  },
];

const plans = [
  {
    name: "Starter",
    price: "299k VND / month",
    points: [
      "75 credits/day",
      "Unlimited API requests",
      "Basic dashboard",
      "Community support",
      "Single workspace",
      "Daily reset credits",
    ],
  },
  {
    name: "Pro",
    price: "699k VND / month",
    points: [
      "220 credits/day",
      "Unlimited API requests",
      "Advanced dashboard",
      "Team API keys",
      "Priority queue",
      "Daily reset credits",
    ],
  },
  {
    name: "Ultra",
    price: "1.49M VND / month",
    points: [
      "500 credits/day",
      "Unlimited API requests",
      "Priority support",
      "Early access models",
      "SLA-ready operations",
      "Daily reset credits",
    ],
  },
];

export default function Home() {
  return (
    <div className="text-[#222]">
      <header className="sticky top-0 z-40 border-b border-[#e7ebef]/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
          <a href="#core" className="text-lg font-bold tracking-tight text-black">
            Codexible
          </a>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a href="#features" className="text-[#3f4b59] hover:text-black">Features</a>
            <a href="#pricing" className="text-[#3f4b59] hover:text-black">Pricing</a>
            <a href="#customers" className="text-[#3f4b59] hover:text-black">Customers</a>
          </nav>

          <a
            href="#pricing"
            className="rounded-lg bg-[#cc4b06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:opacity-90"
          >
            Get started
          </a>
        </div>
      </header>

      <section id="core" className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 text-center md:pb-20 md:pt-20">
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-black md:text-6xl md:leading-[1.12]">
          Automate your coding process
          <br className="hidden md:block" /> for creative freedom
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-[#4b5563] md:text-xl">
          Codexible gives your team one API layer for routing, metering, and scaling coding agents without losing cost control.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          <a
            href="#pricing"
            className="rounded-lg bg-[#cc4b06] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white hover:opacity-90"
          >
            Start free
          </a>
          <a
            href="#features"
            className="rounded-lg border border-[#d6dbe2] bg-white px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[#111] hover:bg-[#f8fafc]"
          >
            Learn more
          </a>
        </div>
      </section>

      <section id="features" className="bg-[#ecf7f8] py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {features.map((item) => (
              <article
                key={item.body}
                className="rounded-2xl border border-[#dde2e5] bg-white p-6 shadow-[0_8px_24px_rgba(18,38,63,0.06)]"
              >
                <h3 className="mb-3 text-3xl font-bold leading-tight text-black">{item.title}</h3>
                <p className="mb-5 text-base leading-relaxed text-[#4b5563]">{item.body}</p>
                <ul className="space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="text-[15px] leading-relaxed text-[#22303f]">
                      • {point}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <h3 className="text-center text-4xl font-bold text-black md:text-5xl">Choose the right plan</h3>
        <p className="mx-auto mt-3 max-w-3xl text-center text-base leading-relaxed text-[#4b5563] md:text-lg">
          Pricing designed to fit solo builders, startup teams, and high-throughput production workloads.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className="rounded-2xl border border-[#dde2e5] bg-white p-7 shadow-[0_8px_24px_rgba(18,38,63,0.04)]"
            >
              <h4 className="text-2xl font-bold text-black">{plan.name}</h4>
              <p className="mt-2 text-2xl font-bold text-[#cc4b06]">{plan.price}</p>

              <div className="mt-5 space-y-2">
                {plan.points.map((point) => (
                  <p key={point} className="text-[15px] leading-relaxed text-[#374151]">
                    • {point}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="customers" className="border-y border-[#e8edf2] bg-white py-16 md:py-20">
        <div className="mx-auto w-full max-w-6xl px-6 text-center">
          <h3 className="text-4xl font-bold text-black md:text-5xl">Trusted by teams that ship fast</h3>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-[#4b5563] md:text-lg">
            Built for developers and product teams running coding workloads in production.
          </p>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e5e7eb] bg-[#fbfdff] p-5">
              <p className="text-3xl font-bold text-black">99.95%</p>
              <p className="mt-2 text-sm text-[#6b7280]">Target uptime</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-[#fbfdff] p-5">
              <p className="text-3xl font-bold text-black">&lt; 180ms</p>
              <p className="mt-2 text-sm text-[#6b7280]">Routing overhead</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] bg-[#fbfdff] p-5">
              <p className="text-3xl font-bold text-black">24/7</p>
              <p className="mt-2 text-sm text-[#6b7280]">Spend guardrails</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[#4b5563] md:flex-row">
          <p>© {new Date().getFullYear()} Codexible</p>
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
            <a href="#customers" className="hover:text-black">Customers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
