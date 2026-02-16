"use client";

import { useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Cpu,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";

type Lang = "vi" | "en";

const copy = {
  vi: {
    nav: { features: "Tính năng", how: "Cách hoạt động", pricing: "Bảng giá", faq: "FAQ" },
    ctaTop: "Lấy API Key",
    badge: "Template-inspired redesign",
    heroTitleA: "Ship nhanh hơn.",
    heroTitleB: "Giữ control tuyệt đối.",
    heroDesc:
      "Codexible là lớp hạ tầng cho coding agents: route thông minh theo policy, meter realtime và hard-cap ngân sách để team scale không sợ cháy margin.",
    heroStart: "Bắt đầu miễn phí",
    heroDemo: "Xem kiến trúc",
    statusTitle: "Live status",
    statusBody: "Guardrails đang bật • Chi tiêu an toàn trong ngưỡng",
    logosLabel: "Được chọn bởi team làm sản phẩm tốc độ cao",
    coreLabel: "Core capabilities",
    coreTitle: "Mọi thứ cần để vận hành agent ở production",
    howLabel: "How it works",
    howTitle: "3 bước để từ local test lên production",
    pricingLabel: "Pricing",
    pricingTitle: "Gói rõ ràng, scale mượt theo team size",
    choose: "Chọn",
    period: "/tháng",
    finalCtaTitle: "Sẵn sàng đưa coding agents vào production?",
    finalCtaDesc: "Tạo workspace trong 2 phút, bật guardrails, nhận API key và ship ngay.",
    finalCtaBtn: "Tạo workspace",
    faqTitle: "Câu hỏi thường gặp",
    trustLabels: ["Uptime mục tiêu", "Routing overhead", "Guardrails & alerts"],
    install: '$ curl -fsSL "https://codexible.ai/install.sh?key=YOUR_KEY" | sh',
    features: [
      {
        icon: Cpu,
        title: "Smart Routing Engine",
        body: "Route prompt theo độ khó, ngân sách và SLA để tối ưu quality/cost theo thời gian thực.",
      },
      {
        icon: BarChart3,
        title: "Realtime Cost Metering",
        body: "Theo dõi token, request, burn-rate theo user/team với cảnh báo trước khi vượt budget.",
      },
      {
        icon: ShieldCheck,
        title: "Policy Guardrails",
        body: "Quota, rate limit, model allowlist và hard cap giúp tránh fail-cost ở peak traffic.",
      },
    ],
    steps: [
      {
        icon: Sparkles,
        title: "Connect",
        body: "Trỏ SDK/CLI vào một endpoint duy nhất, không phải sửa pipeline hiện có.",
      },
      {
        icon: Workflow,
        title: "Define",
        body: "Tạo policy theo workspace, môi trường và risk profile cho từng team.",
      },
      {
        icon: Zap,
        title: "Scale",
        body: "Rollout dần với analytics realtime và rollback trong một click.",
      },
    ],
    faqs: [
      {
        q: "Codexible có thay đổi codebase hiện tại của team không?",
        a: "Không. Team chỉ cần đổi endpoint/API key. Các workflow đang chạy vẫn giữ nguyên.",
      },
      {
        q: "Làm sao để tránh overspend khi số lượng request tăng đột biến?",
        a: "Dùng hard cap + alert ngưỡng + rate limit theo workspace. Khi chạm ngưỡng, traffic sẽ bị chặn hoặc fallback theo policy.",
      },
      {
        q: "Có hỗ trợ nhiều model provider không?",
        a: "Có. Codexible được thiết kế theo model-agnostic routing, có thể gắn nhiều provider và route theo luật riêng.",
      },
    ],
  },
  en: {
    nav: { features: "Features", how: "How it works", pricing: "Pricing", faq: "FAQ" },
    ctaTop: "Get API Key",
    badge: "Template-inspired redesign",
    heroTitleA: "Ship faster.",
    heroTitleB: "Stay in control.",
    heroDesc:
      "Codexible is infrastructure for coding agents: policy-based smart routing, realtime metering, and budget hard caps so teams can scale without margin leaks.",
    heroStart: "Start free",
    heroDemo: "See architecture",
    statusTitle: "Live status",
    statusBody: "Budget guardrails active • Spend remains within safe range",
    logosLabel: "Chosen by high-velocity product teams",
    coreLabel: "Core capabilities",
    coreTitle: "Everything needed to run coding agents in production",
    howLabel: "How it works",
    howTitle: "From local test to production in 3 steps",
    pricingLabel: "Pricing",
    pricingTitle: "Clear plans that scale with your team",
    choose: "Choose",
    period: "/month",
    finalCtaTitle: "Ready to run coding agents in production?",
    finalCtaDesc: "Create a workspace in 2 minutes, enable guardrails, get your API key, and ship.",
    finalCtaBtn: "Create workspace",
    faqTitle: "Frequently asked questions",
    trustLabels: ["Uptime target", "Routing overhead", "Guardrails & alerts"],
    install: '$ curl -fsSL "https://codexible.ai/install.sh?key=YOUR_KEY" | sh',
    features: [
      {
        icon: Cpu,
        title: "Smart Routing Engine",
        body: "Route prompts by complexity, budget, and SLA to balance quality and cost in real time.",
      },
      {
        icon: BarChart3,
        title: "Realtime Cost Metering",
        body: "Track token usage, request volume, and burn-rate by user/team with proactive budget alerts.",
      },
      {
        icon: ShieldCheck,
        title: "Policy Guardrails",
        body: "Quotas, rate limits, model allowlists, and hard caps prevent cost blowups under peak traffic.",
      },
    ],
    steps: [
      {
        icon: Sparkles,
        title: "Connect",
        body: "Point your SDK/CLI to one endpoint without rewriting your existing workflows.",
      },
      {
        icon: Workflow,
        title: "Define",
        body: "Set workspace-level policies by environment and risk profile.",
      },
      {
        icon: Zap,
        title: "Scale",
        body: "Roll out gradually with realtime analytics and one-click rollback.",
      },
    ],
    faqs: [
      {
        q: "Does Codexible require changing our existing codebase?",
        a: "No. Most teams only switch endpoint/API key while keeping current workflows intact.",
      },
      {
        q: "How do we avoid overspend during sudden traffic spikes?",
        a: "Use hard caps, threshold alerts, and workspace-level rate limits. Traffic can be blocked or downgraded by policy.",
      },
      {
        q: "Can we use multiple model providers?",
        a: "Yes. Codexible is model-agnostic and supports provider-aware routing with custom policies.",
      },
    ],
  },
} as const;

const plans = [
  {
    name: "Starter",
    price: "299k",
    points: ["75 credits/day", "1 workspace", "Community support", "Basic analytics"],
  },
  {
    name: "Pro",
    price: "699k",
    points: ["220 credits/day", "Team API keys", "Priority queue", "Advanced analytics"],
    highlight: true,
  },
  {
    name: "Ultra",
    price: "1.49M",
    points: ["500 credits/day", "Early model access", "Priority support", "SLA-ready"],
  },
];

export default function Home() {
  const [lang, setLang] = useState<Lang>("vi");
  const [openFaq, setOpenFaq] = useState(0);
  const t = copy[lang];

  return (
    <div className="text-[#eaf2ff]">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-6">
          <a href="#" className="text-lg font-bold tracking-tight text-white">
            Codexible
          </a>

          <nav className="hidden items-center gap-7 text-sm text-[#b2bfd8] md:flex">
            <a href="#features" className="transition hover:text-white">{t.nav.features}</a>
            <a href="#how" className="transition hover:text-white">{t.nav.how}</a>
            <a href="#pricing" className="transition hover:text-white">{t.nav.pricing}</a>
            <a href="#faq" className="transition hover:text-white">{t.nav.faq}</a>
          </nav>

          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-white/15 bg-white/5 p-0.5">
              <button
                onClick={() => setLang("vi")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${lang === "vi" ? "bg-[#5b7cff] text-white" : "text-[#b2bfd8]"}`}
              >
                VI
              </button>
              <button
                onClick={() => setLang("en")}
                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${lang === "en" ? "bg-[#5b7cff] text-white" : "text-[#b2bfd8]"}`}
              >
                EN
              </button>
            </div>

            <a
              href="#pricing"
              className="rounded-xl bg-[#5b7cff] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:opacity-90"
            >
              {t.ctaTop}
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-12 md:px-6 md:pb-20 md:pt-16">
        <div className="grid items-stretch gap-6 md:grid-cols-[1.1fr_.9fr]">
          <div className="glass rounded-3xl p-7 md:p-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#7ea1ff]/35 bg-[#5b7cff]/15 px-3 py-1 text-xs font-semibold text-[#b5c9ff]">
              <Zap className="h-3.5 w-3.5" />
              {t.badge}
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-[1.08] text-white md:text-6xl">
              {t.heroTitleA}
              <br />
              <span className="text-[#7ea1ff]">{t.heroTitleB}</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#b2bfd8] md:text-lg">{t.heroDesc}</p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-xl bg-[#5b7cff] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {t.heroStart}
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#how"
                className="rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-[#d8e3ff] transition hover:bg-white/10"
              >
                {t.heroDemo}
              </a>
            </div>

            <div className="mt-7 rounded-xl border border-white/15 bg-[#040713] px-4 py-3 font-mono text-xs text-[#84ffd5] md:text-sm">
              {t.install}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["99.95%", t.trustLabels[0]],
                ["< 180ms", t.trustLabels[1]],
                ["24/7", t.trustLabels[2]],
              ].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-lg font-bold text-white">{value}</p>
                  <p className="text-xs text-[#b2bfd8]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="glass rounded-3xl p-7 md:p-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#a9b6d4]">{t.statusTitle}</h3>
            <div className="mt-5 space-y-3">
              {[
                [lang === "vi" ? "API key hoạt động" : "Active keys", "1,248"],
                [lang === "vi" ? "Độ trễ route" : "Avg routing latency", "164ms"],
                [lang === "vi" ? "Chi tiêu hôm nay" : "Today spend", "2.8M VND"],
                [lang === "vi" ? "Policy chặn" : "Policy blocks", "37"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                  <p className="text-xs text-[#91a1c2]">{k}</p>
                  <p className="mt-1 text-xl font-bold text-white">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[#7ea1ff]/30 bg-[#5b7cff]/12 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#afc4ff]">{t.statusTitle}</p>
              <p className="mt-1 text-sm text-[#d2deff]">{t.statusBody}</p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
          <p className="text-center text-xs uppercase tracking-[0.18em] text-[#8ea0c4]">{t.logosLabel}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-center text-sm font-semibold text-[#c8d6f5] sm:grid-cols-4">
            {["Atlas Labs", "Redline Ops", "Zero Drift", "Moonshot AI"].map((name) => (
              <div key={name} className="rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-6">
          <div className="mb-8 md:mb-10">
            <p className="text-sm font-semibold uppercase tracking-wider text-[#8ea7ff]">{t.coreLabel}</p>
            <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">{t.coreTitle}</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {t.features.map(({ icon: Icon, title, body }) => (
              <article key={title} className="glass rounded-2xl p-6 transition hover:-translate-y-0.5">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b7cff]/15 text-[#9fb5ff]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#b2bfd8]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
        <div className="mb-8 md:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8ea7ff]">{t.howLabel}</p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">{t.howTitle}</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {t.steps.map(({ icon: Icon, title, body }, idx) => (
            <article key={title} className="glass rounded-2xl p-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-[#c5d4f8]">
                0{idx + 1}
              </div>
              <div className="mt-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#5b7cff]/15 text-[#9fb5ff]">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#b2bfd8]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-6xl px-5 py-14 md:px-6 md:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#8ea7ff]">{t.pricingLabel}</p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-5xl">{t.pricingTitle}</h2>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.highlight
                  ? "border-[#7ea1ff]/55 bg-[#5b7cff]/15 shadow-[0_16px_40px_rgba(91,124,255,.18)]"
                  : "border-white/12 bg-white/[0.03]"
              }`}
            >
              <h3 className="text-xl font-bold text-white">{plan.name}</h3>
              <div className="mt-3 flex items-end gap-1">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="pb-1 text-sm text-[#9fb0d2]">{t.period}</span>
              </div>

              <ul className="mt-5 space-y-2">
                {plan.points.map((point) => (
                  <li key={point} className="flex items-center gap-2 text-sm text-[#c7d5f2]">
                    <BadgeCheck className="h-4 w-4 text-[#8aa7ff]" />
                    {point}
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  plan.highlight ? "bg-[#5b7cff] text-white hover:opacity-90" : "border border-white/20 text-white hover:bg-white/10"
                }`}
              >
                {t.choose} {plan.name}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-8 md:px-6 md:py-14">
        <h2 className="text-center text-3xl font-bold text-white md:text-4xl">{t.faqTitle}</h2>

        <div className="mt-8 space-y-3">
          {t.faqs.map((item, idx) => {
            const open = idx === openFaq;
            return (
              <article key={item.q} className="glass rounded-2xl">
                <button
                  onClick={() => setOpenFaq(open ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
                >
                  <span className="font-semibold text-white">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-[#a8badf] transition ${open ? "rotate-180" : ""}`} />
                </button>
                {open && <p className="px-5 pb-4 text-sm leading-relaxed text-[#b8c6e3]">{item.a}</p>}
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-14 pt-6 md:px-6 md:pb-20">
        <div className="rounded-3xl border border-[#7ea1ff]/35 bg-gradient-to-r from-[#162244] to-[#1d2e5e] p-7 md:p-10">
          <h3 className="text-2xl font-bold text-white md:text-4xl">{t.finalCtaTitle}</h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#ccdaf8] md:text-base">{t.finalCtaDesc}</p>
          <a
            href="#pricing"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#7ea1ff] px-5 py-3 text-sm font-semibold text-[#061024] transition hover:opacity-90"
          >
            {t.finalCtaBtn}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#040712] py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#98aacd] md:flex-row md:px-6">
          <p>© {new Date().getFullYear()} Codexible</p>
          <div className="flex items-center gap-5">
            <a href="#features" className="hover:text-white">{t.nav.features}</a>
            <a href="#pricing" className="hover:text-white">{t.nav.pricing}</a>
            <a href="#faq" className="hover:text-white">{t.nav.faq}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
