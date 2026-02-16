import { ArrowRight, ChartNoAxesCombined, Cpu, Shield, TerminalSquare } from "lucide-react";

const features = [
  {
    icon: TerminalSquare,
    title: "One-line setup",
    body: "Connect Codex CLI and coding agents in under 30 seconds.",
  },
  {
    icon: Cpu,
    title: "Smart model routing",
    body: "Send simple prompts to cheaper models and hard tasks to stronger ones.",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Live cost control",
    body: "Track requests, spend, and credits in real-time across your team.",
  },
];

const plans = [
  {
    name: "Starter",
    price: "299k VND / month",
    points: ["75 credits/day", "Realtime dashboard", "Community support"],
  },
  {
    name: "Pro",
    price: "699k VND / month",
    points: ["220 credits/day", "Priority queue", "Team API keys"],
  },
  {
    name: "Ultra",
    price: "1.49M VND / month",
    points: ["500 credits/day", "Early model access", "Priority support"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(139,92,246,0.15),transparent_30%)]" />

      <main className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
        <header className="mb-12 flex items-center justify-between">
          <div className="text-lg font-semibold tracking-wide">Codexible</div>
          <nav className="hidden gap-6 text-sm text-zinc-300 md:flex">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#customers" className="hover:text-white">Customers</a>
          </nav>
          <a
            href="#pricing"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10"
          >
            Get started
          </a>
        </header>

        <section id="core" className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl md:p-14">
          <h1 className="max-w-4xl text-4xl font-semibold leading-tight md:text-6xl">
            Automate your coding operations for
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              shipping freedom.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-zinc-300 md:text-lg">
            Codexible is the API infrastructure layer for modern coding agents.
            One endpoint for routing, metering, and margin-safe scale.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-3 text-sm font-semibold text-black hover:opacity-90"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#features"
              className="rounded-xl border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/10"
            >
              See features
            </a>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-xs text-cyan-200 md:text-sm">
            $ curl -fsSL "https://codexible.ai/install.sh?key=YOUR_KEY" | sh
          </div>
        </section>

        <section id="features" className="mt-12 grid gap-4 md:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <article key={title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <Icon className="mb-3 h-5 w-5 text-cyan-300" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-zinc-300">{body}</p>
            </article>
          ))}
        </section>

        <section id="pricing" className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <div className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-300">
            <Shield className="h-4 w-4 text-purple-300" />
            Choose the right plan
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <article key={plan.name} className="rounded-2xl border border-white/10 bg-black/35 p-6">
                <h3 className="text-xl font-semibold">{plan.name}</h3>
                <p className="mt-2 text-2xl font-bold text-cyan-300">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-zinc-300">
                  {plan.points.map((point) => (
                    <li key={point}>• {point}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="customers" className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-8 md:p-10">
          <h3 className="text-2xl font-semibold">Trusted by teams that ship fast</h3>
          <p className="mt-3 max-w-2xl text-zinc-300">
            Built for indie hackers, product teams, and AI startups running code generation in production.
          </p>

          <div className="mt-6 grid gap-4 text-sm md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-2xl font-bold text-cyan-300">99.95%</p>
              <p className="mt-1 text-zinc-300">Gateway uptime target</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-2xl font-bold text-cyan-300">&lt; 180ms</p>
              <p className="mt-1 text-zinc-300">Average routing overhead</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/30 p-4">
              <p className="text-2xl font-bold text-cyan-300">24/7</p>
              <p className="mt-1 text-zinc-300">Spend guardrails + alerts</p>
            </div>
          </div>
        </section>

        <footer className="mt-12 border-t border-white/10 py-6 text-sm text-zinc-400">
          © {new Date().getFullYear()} Codexible · One endpoint. Real control.
        </footer>
      </main>
    </div>
  );
}
