import { ArrowRight, BadgeCheck, BarChart3, Cpu, ShieldCheck, Zap } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Smart Routing Engine",
    body: "Tự động route prompt theo policy để cân bằng quality và cost theo thời gian thực.",
  },
  {
    icon: BarChart3,
    title: "Live Cost Control",
    body: "Theo dõi token, request, burn-rate theo user/team với cảnh báo vượt ngân sách.",
  },
  {
    icon: ShieldCheck,
    title: "Margin Guardrails",
    body: "Rate limit, quota và hard cap để không bị lỗ khi workload tăng đột biến.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "299k",
    period: "/month",
    points: ["75 credits/day", "1 workspace", "Community support", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "699k",
    period: "/month",
    points: ["220 credits/day", "Team API keys", "Priority queue", "Advanced analytics"],
    highlight: true,
  },
  {
    name: "Ultra",
    price: "1.49M",
    period: "/month",
    points: ["500 credits/day", "Early model access", "Priority support", "SLA-ready"],
  },
];

export default function Home() {
  return (
    <div className="text-[#141414]">
      <header className="sticky top-0 z-50 border-b border-black/5 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-6">
          <a href="#" className="text-lg font-bold tracking-tight text-black">
            Codexible
          </a>

          <nav className="hidden items-center gap-7 text-sm text-[#475467] md:flex">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
            <a href="#trust" className="hover:text-black">Trust</a>
          </nav>

          <a
            href="#pricing"
            className="rounded-xl bg-[#cc4b06] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
          >
            Get API Key
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 md:px-6 md:pb-20 md:pt-16">
        <div className="grid items-stretch gap-6 md:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#f2d0bf] bg-[#fff3ed] px-3 py-1 text-xs font-semibold text-[#a43d0a]">
              <Zap className="h-3.5 w-3.5" />
              Codex API Infrastructure
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.1] text-black md:text-6xl">
              One endpoint.
              <br />
              <span className="text-[#cc4b06]">Real control.</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#475467] md:text-lg">
              Codexible giúp cậu ship nhanh hơn với lớp gateway cho coding agents: route thông minh, meter realtime, và khóa chi phí theo policy.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-[#cc4b06] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Start free
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#features"
                className="rounded-xl border border-[#d7dee7] bg-white px-5 py-3 text-sm font-semibold text-[#111827] transition hover:bg-[#f8fafc]"
              >
                Explore features
              </a>
            </div>

            <div className="mt-7 rounded-xl border border-[#e5e7eb] bg-[#0b1020] px-4 py-3 font-mono text-xs text-[#8de0ff] md:text-sm">
              $ curl -fsSL &quot;https://codexible.ai/install.sh?key=YOUR_KEY&quot; | sh
            </div>
          </div>

          <div className="rounded-3xl border border-[#e8ecf1] bg-gradient-to-b from-white to-[#f6f9fc] p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#667085]">Realtime snapshot</h3>
            <div className="mt-5 space-y-3">
              {[
                ["Active keys", "1,248"],
                ["Avg routing latency", "164ms"],
                ["Today spend", "2.8M VND"],
                ["Policy blocks", "37"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-[#e4e9f0] bg-white px-4 py-3">
                  <p className="text-xs text-[#667085]">{k}</p>
                  <p className="mt-1 text-xl font-bold text-[#101828]">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#f2d0bf] bg-[#fff3ed] p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#a43d0a]">Status</p>
              <p className="mt-1 text-sm text-[#7a2e08]">Budget guardrails active • No overspend detected</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#ecf7f8] py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <div className="mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#a43d0a]">Core capabilities</p>
            <h2 className="mt-2 text-3xl font-bold text-black md:text-5xl">Built for teams shipping every day</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="rounded-2xl border border-[#dbe6e8] bg-white p-6 shadow-[0_10px_30px_rgba(15,23,42,.06)]">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff3ed] text-[#cc4b06]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-[#101828]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475467]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#a43d0a]">Pricing</p>
          <h2 className="mt-2 text-3xl font-bold text-black md:text-5xl">Simple plans, predictable spend</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-[#cc4b06] bg-[#fffaf7] shadow-[0_16px_40px_rgba(204,75,6,.15)]"
                  : "border-[#e4e9f0] bg-white shadow-[0_10px_28px_rgba(15,23,42,.05)]"
              }`}
            >
              <h3 className="text-xl font-bold text-black">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-[#101828]">{plan.price}</span>
                <span className="pb-1 text-sm text-[#667085]">{plan.period}</span>
              </div>

              <ul className="mt-5 space-y-2">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-[#344054]">
                    <BadgeCheck className="h-4 w-4 text-[#cc4b06]" />
                    {point}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlight ? "bg-[#cc4b06] text-white hover:opacity-90" : "border border-[#d7dee7] hover:bg-[#f8fafc]"
                }`}
              >
                Choose {plan.name}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="trust" className="border-y border-[#e5e7eb] bg-white">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 py-12 md:grid-cols-3 md:px-6">
          {[
            ["99.95%", "Gateway uptime target"],
            ["< 180ms", "Average routing overhead"],
            ["24/7", "Guardrails & alerts"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-xl border border-[#e6ebf2] bg-[#fbfdff] p-5 text-center">
              <p className="text-3xl font-bold text-[#101828]">{value}</p>
              <p className="mt-1 text-sm text-[#667085]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-white py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#667085] md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Codexible</p>
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#pricing" className="hover:text-black">Pricing</a>
            <a href="#trust" className="hover:text-black">Trust</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
