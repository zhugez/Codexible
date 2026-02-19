import { Cpu, BarChart3, ShieldCheck } from "lucide-react";
import type { Translation } from "@/app/types";

export const en: Translation = {
  nav: {
    features: "Features",
    pricing: "Pricing",
    trust: "Trust",
    docs: "Docs",
    dashboard: "Dashboard",
  },
  ctaTop: "Get API Key",
  badge: "Codex API Infrastructure",
  heroTitleA: "One endpoint.",
  heroTitleB: "Real control.",
  heroDesc:
    "Codexible helps teams ship faster with a gateway for coding agents: smart routing, realtime metering, and policy-based cost control.",
  heroStart: "Start free",
  heroExplore: "Explore features",
  snapshot: "Realtime snapshot",
  statusTitle: "Status",
  statusBody: "Budget guardrails active • No overspend detected",
  coreLabel: "Core capabilities",
  coreTitle: "Built for teams shipping every day",
  pricingLabel: "Pricing",
  pricingTitle: "Simple, transparent pricing",
  pricingSubtitle:
    "Choose the plan that fits your daily workflow. Upgrade anytime.",
  pricingNotesTitle: "Notes",
  pricingNotes: [
    "Credits reset daily.",
    "Upgrade, downgrade, or cancel anytime.",
    "No hidden fees.",
  ],
  mostPopular: "Most Popular",
  period: "/month",
  plans: [
    {
      name: "Starter",
      price: "$10",
      description: "For light daily usage",
      points: [
        "75 credits/day",
        "Fast generation",
        "Standard queue",
        "Community support",
      ],
      cta: "Start with Starter",
      highlight: false,
    },
    {
      name: "Pro",
      price: "$30",
      description: "For creators and growing teams",
      points: [
        "250 credits/day",
        "Faster processing",
        "Priority queue",
        "Priority support",
      ],
      cta: "Choose Pro",
      highlight: true,
    },
    {
      name: "Business",
      price: "$50",
      description: "For power users and teams",
      points: [
        "500 credits/day",
        "Highest speed",
        "Top priority queue",
        "Premium support",
      ],
      cta: "Go Business",
      highlight: false,
    },
  ],
  install: '$ curl -fsSL "https://codexible.me/install.sh?key=YOUR_KEY" | sh',
  trustLabels: [
    "Gateway uptime target",
    "Average routing overhead",
    "24/7 guardrails & alerts",
  ],
  features: [
    {
      icon: Cpu,
      title: "Smart Routing Engine",
      body: "Policy-based routing to balance quality and cost in real time.",
    },
    {
      icon: BarChart3,
      title: "Live Cost Control",
      body: "Track token usage, request volume, and burn-rate with budget alerts.",
    },
    {
      icon: ShieldCheck,
      title: "Margin Guardrails",
      body: "Rate limits, quotas, and hard caps to prevent margin leaks under load.",
    },
  ],
};
