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
    <div>
      <header className="container py-6">
        <div className="flex items-center justify-between gap-4">
          <a href="#core" className="text-lg font-bold text-black">Codexible</a>

          <nav className="hidden gap-6 text-sm md:flex">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#customers">Customers</a>
          </nav>

          <a
            href="#pricing"
            className="rounded-lg border border-[#cc4b06] bg-[#cc4b06] px-4 py-2 text-sm font-semibold text-white"
          >
            Get started
          </a>
        </div>
      </header>

      <section id="core" className="container py-16 text-center">
        <h1 className="mx-auto max-w-4xl text-5xl font-bold leading-tight md:text-7xl">
          Automate your coding process for creative freedom
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-[#4b5563] md:text-xl">
          Codexible gives your team one API layer for routing, metering, and scaling coding agents without losing cost control.
        </p>
        <div className="mx-auto mt-8 max-w-[260px]">
          <a
            href="#pricing"
            className="block rounded-lg border border-[#cc4b06] bg-[#cc4b06] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            Start free
          </a>
        </div>
      </section>

      <section id="features" className="bg-[#ecf7f8] py-16">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-3">
            {features.map((item) => (
              <article key={item.body}>
                <h3 className="mb-3 text-3xl font-bold">{item.title}</h3>
                <p className="mb-5 text-base text-[#4b5563]">{item.body}</p>
                <ul className="space-y-2">
                  {item.points.map((point) => (
                    <li key={point} className="text-base">{point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="container py-16">
        <h3 className="text-center text-4xl font-bold">Choose the right plan</h3>
        <p className="mx-auto mt-3 max-w-3xl text-center text-lg text-[#4b5563]">
          Pricing designed to fit solo builders, startup teams, and high-throughput production workloads.
        </p>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {plans.map((plan) => (
            <article key={plan.name} className="rounded-[20px] border border-[#dde2e5] p-7">
              <h4 className="text-2xl font-bold">{plan.name}</h4>
              <p className="mt-2 text-2xl font-bold text-[#cc4b06]">{plan.price}</p>

              <div className="mt-5 space-y-2">
                {plan.points.map((point) => (
                  <p key={point} className="text-base text-[#374151]">• {point}</p>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="customers" className="bg-white py-16 text-center">
        <div className="container">
          <h3 className="text-4xl font-bold">Trusted by teams that ship fast</h3>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#4b5563]">
            Built for developers and product teams running coding workloads in production.
          </p>

          <div className="mx-auto mt-8 grid max-w-4xl gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-[#e5e7eb] p-5">
              <p className="text-3xl font-bold">99.95%</p>
              <p className="mt-2 text-sm text-[#6b7280]">Target uptime</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] p-5">
              <p className="text-3xl font-bold">&lt; 180ms</p>
              <p className="mt-2 text-sm text-[#6b7280]">Routing overhead</p>
            </div>
            <div className="rounded-xl border border-[#e5e7eb] p-5">
              <p className="text-3xl font-bold">24/7</p>
              <p className="mt-2 text-sm text-[#6b7280]">Spend guardrails</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-10">
        <div className="container flex flex-col items-center justify-between gap-4 text-sm md:flex-row">
          <p>© {new Date().getFullYear()} Codexible</p>
          <div className="flex items-center gap-5">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#customers">Customers</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
