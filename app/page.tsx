import { Bolt, ChartNoAxesCombined, Code2, Cpu, Shield, TerminalSquare } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "299k VND",
    desc: "Perfect for indie devs building daily.",
    cta: "Start free",
  },
  {
    name: "Pro",
    price: "699k VND",
    desc: "For teams shipping production workloads.",
    cta: "Upgrade to Pro",
  },
  {
    name: "Ultra",
    price: "1.49M VND",
    desc: "High-throughput, priority queue, dedicated support.",
    cta: "Get Ultra",
  },
];

const features = [
  {
    icon: TerminalSquare,
    title: "One-line CLI setup",
    body: "Point your coding tools to Codexible in under 30 seconds.",
  },
  {
    icon: Cpu,
    title: "Smart model routing",
    body: "Route simple tasks to cheap models, hard tasks to strong models.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Live usage dashboard",
    body: "Track balance, requests, and team cost in real time.",
  },
  {
    icon: Shield,
    title: "Rate limits + budget guardrails",
    body: "Per-key quotas and hard spending caps to protect margin.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(168,85,247,0.14),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(59,130,246,0.12),transparent_35%)]" />

      <main className="relative mx-auto max-w-6xl px-6 py-20">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl md:p-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
            <Bolt className="h-3.5 w-3.5" />
            Codex API Infrastructure
          </div>

          <h1 className="max-w-3xl text-4xl font-semibold leading-tight md:text-6xl">
            Codexible
            <span className="block bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
              One Endpoint. Infinite Builder Energy.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base text-zinc-300 md:text-lg">
            A premium API gateway for coding agents and CLI workflows. Plug in once,
            control cost, and ship faster with enterprise-grade reliability.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#"
              className="rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
            >
              Get API Key
            </a>
            <a
              href="#features"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Explore Features
            </a>
          </div>

          <div className="mt-10 rounded-2xl border border-white/10 bg-black/35 p-4 font-mono text-xs text-cyan-200 md:text-sm">
            <span className="text-zinc-500">$</span> curl -fsSL "https://codexible.ai/install.sh?key=YOUR_KEY" | sh
          </div>
        </section>

        <section id="features" className="mt-12 grid gap-4 md:grid-cols-2">
          {features.map(({ icon: Icon, title, body }) => (
            <article
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur"
            >
              <Icon className="mb-4 h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-zinc-300">{body}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-10">
          <div className="mb-6 flex items-center gap-2 text-zinc-200">
            <Code2 className="h-5 w-5 text-purple-300" />
            Pricing built for builders
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article
                key={plan.name}
                className="rounded-2xl border border-white/10 bg-black/30 p-6"
              >
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-cyan-300">{plan.price}</p>
                <p className="mt-2 text-sm text-zinc-300">{plan.desc}</p>
                <button className="mt-5 w-full rounded-lg border border-white/20 px-4 py-2 text-sm font-medium transition hover:bg-white/10">
                  {plan.cta}
                </button>
              </article>
            ))}
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 pt-6 text-sm text-zinc-400">
          © {new Date().getFullYear()} Codexible. Build fast. Stay profitable.
        </footer>
      </main>
    </div>
  );
}
