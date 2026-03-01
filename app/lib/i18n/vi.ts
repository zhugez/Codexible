import { Cpu, BarChart3, ShieldCheck, Monitor, Globe, DollarSign } from "lucide-react";
import type { Translation } from "@/app/types";

export const vi: Translation = {
  nav: {
    features: "T\u00ednh n\u0103ng",
    pricing: "B\u1ea3ng gi\u00e1",
    trust: "\u0110\u1ed9 tin c\u1eady",
    docs: "T\u00e0i li\u1ec7u",
    dashboard: "Dashboard",
  },
  ctaTop: "L\u1ea5y API Key",
  badge: "H\u1ea1 t\u1ea7ng Codex API",
  heroTitleA: "M\u1ed9t endpoint.",
  heroTitleB: "Ki\u1ec3m so\u00e1t th\u1eadt s\u1ef1.",
  heroDesc:
    "Codexible gi\u00fap c\u1eadu ship nhanh h\u01a1n v\u1edbi l\u1edbp gateway cho coding agents: route th\u00f4ng minh, meter realtime, v\u00e0 kh\u00f3a chi ph\u00ed theo policy.",
  heroStart: "B\u1eaft \u0111\u1ea7u ngay",
  heroExplore: "Xem t\u00e0i li\u1ec7u",
  snapshot: "Snapshot realtime",
  statusTitle: "Tr\u1ea1ng th\u00e1i",
  statusBody: "Guardrails \u0111ang ho\u1ea1t \u0111\u1ed9ng \u2022 Kh\u00f4ng ph\u00e1t hi\u1ec7n overspend",
  coreLabel: "N\u0103ng l\u1ef1c c\u1ed1t l\u00f5i",
  coreTitle: "X\u00e2y cho team ship s\u1ea3n ph\u1ea9m m\u1ed7i ng\u00e0y",
  pricingLabel: "B\u1ea3ng gi\u00e1",
  pricingTitle: "B\u1ea3ng gi\u00e1 \u0111\u01a1n gi\u1ea3n, minh b\u1ea1ch",
  pricingSubtitle:
    "Ch\u1ecdn g\u00f3i ph\u00f9 h\u1ee3p nhu c\u1ea7u m\u1ed7i ng\u00e0y. C\u00f3 th\u1ec3 n\u00e2ng c\u1ea5p b\u1ea5t c\u1ee9 l\u00fac n\u00e0o.",
  pricingNotesTitle: "L\u01b0u \u00fd",
  pricingNotes: [
    "Credit \u0111\u01b0\u1ee3c l\u00e0m m\u1edbi m\u1ed7i ng\u00e0y.",
    "C\u00f3 th\u1ec3 n\u00e2ng/h\u1ea1 g\u00f3i ho\u1eb7c h\u1ee7y b\u1ea5t c\u1ee9 l\u00fac n\u00e0o.",
    "Kh\u00f4ng ph\u00ed \u1ea9n.",
  ],
  mostPopular: "Ph\u1ed5 bi\u1ebfn nh\u1ea5t",
  period: "/th\u00e1ng",
  plans: [
    {
      name: "Starter",
      price: "10$",
      description: "D\u00e0nh cho nhu c\u1ea7u c\u01a1 b\u1ea3n",
      points: [
        "75 credit/ng\u00e0y",
        "T\u1ea1o n\u1ed9i dung nhanh",
        "H\u00e0ng ch\u1edd ti\u00eau chu\u1ea9n",
        "H\u1ed7 tr\u1ee3 c\u1ed9ng \u0111\u1ed3ng",
      ],
      cta: "B\u1eaft \u0111\u1ea7u v\u1edbi Starter",
      highlight: false,
    },
    {
      name: "Pro",
      price: "30$",
      description: "D\u00e0nh cho ng\u01b0\u1eddi d\u00f9ng th\u01b0\u1eddng xuy\u00ean v\u00e0 team nh\u1ecf",
      points: [
        "250 credit/ng\u00e0y",
        "X\u1eed l\u00fd nhanh h\u01a1n",
        "H\u00e0ng ch\u1edd \u01b0u ti\u00ean",
        "H\u1ed7 tr\u1ee3 \u01b0u ti\u00ean",
      ],
      cta: "Ch\u1ecdn Pro",
      highlight: true,
    },
    {
      name: "Business",
      price: "50$",
      description: "D\u00e0nh cho power user v\u00e0 team",
      points: [
        "500 credit/ng\u00e0y",
        "T\u1ed1c \u0111\u1ed9 cao nh\u1ea5t",
        "\u01afu ti\u00ean cao nh\u1ea5t",
        "H\u1ed7 tr\u1ee3 premium",
      ],
      cta: "D\u00f9ng Business",
      highlight: false,
    },
  ],
  install: '$ curl -fsSL "https://codexible.me/install.sh?key=YOUR_KEY" | sh',
  trustLabels: [
    "Uptime m\u1ee5c ti\u00eau",
    "\u0110\u1ed9 tr\u1ec5 route trung b\u00ecnh",
    "Guardrails & c\u1ea3nh b\u00e1o 24/7",
  ],
  features: [
    {
      icon: Cpu,
      title: "Smart Routing Engine",
      body: "T\u1ef1 \u0111\u1ed9ng route prompt theo policy \u0111\u1ec3 c\u00e2n b\u1eb1ng quality v\u00e0 cost theo th\u1eddi gian th\u1ef1c.",
    },
    {
      icon: BarChart3,
      title: "Live Cost Control",
      body: "Theo d\u00f5i token, request, burn-rate theo user/team v\u1edbi c\u1ea3nh b\u00e1o v\u01b0\u1ee3t ng\u00e2n s\u00e1ch.",
    },
    {
      icon: ShieldCheck,
      title: "Margin Guardrails",
      body: "Rate limit, quota v\u00e0 hard cap \u0111\u1ec3 kh\u00f4ng b\u1ecb l\u1ed7 khi workload t\u0103ng \u0111\u1ed9t bi\u1ebfn.",
    },
    {
      icon: Monitor,
      title: "Dashboard th\u1eddi gian th\u1ef1c",
      body: "Theo d\u00f5i s\u1eed d\u1ee5ng tr\u1ef1c ti\u1ebfp. Gi\u00e1m s\u00e1t s\u1ed1 d\u01b0, chi ph\u00ed v\u00e0 request realtime.",
    },
    {
      icon: Globe,
      title: "\u0110a n\u1ec1n t\u1ea3ng",
      body: "Ho\u1ea1t \u0111\u1ed9ng tr\u00ean macOS, Linux v\u00e0 Windows. C\u00e0i \u0111\u1eb7t b\u1eb1ng m\u1ed9t d\u00f2ng l\u1ec7nh.",
    },
    {
      icon: DollarSign,
      title: "Gi\u00e1 linh ho\u1ea1t",
      body: "Tr\u1ea3 theo l\u01b0\u1ee3ng d\u00f9ng ho\u1eb7c g\u00f3i th\u00e1ng. Minh b\u1ea1ch, kh\u00f4ng ph\u00ed \u1ea9n.",
    },
  ],
  steps: {
    title: "B\u1eaft \u0111\u1ea7u trong 3 b\u01b0\u1edbc",
    items: [
      {
        title: "L\u1ea5y API key",
        description: "Li\u00ean h\u1ec7 \u0111\u1ec3 nh\u1eadn API key v\u00e0 s\u1ed1 d\u01b0 ban \u0111\u1ea7u",
      },
      {
        title: "Ch\u1ea1y c\u00e0i \u0111\u1eb7t",
        description: "M\u1ed9t l\u1ec7nh duy nh\u1ea5t c\u00e0i \u0111\u1eb7t m\u00f4i tr\u01b0\u1eddng, c\u1ea5u h\u00ecnh v\u00e0 c\u00f4ng c\u1ee5",
      },
      {
        title: "B\u1eaft \u0111\u1ea7u code",
        description: "D\u00f9ng Claude Code ho\u1eb7c c\u00f4ng c\u1ee5 t\u01b0\u01a1ng th\u00edch Anthropic",
      },
    ],
  },
  footerTagline: "H\u1ea1 t\u1ea7ng cho coding agents",
  footerColumns: [
    {
      title: "S\u1ea3n ph\u1ea9m",
      links: [
        { label: "Dashboard", href: "/dashboard/login" },
        { label: "T\u00e0i li\u1ec7u", href: "/docs" },
        { label: "C\u00e0i \u0111\u1eb7t", href: "#" },
      ],
    },
    {
      title: "T\u00e0i nguy\u00ean",
      links: [
        { label: "B\u1ea3ng gi\u00e1", href: "#pricing" },
        { label: "FAQ", href: "#" },
        { label: "Li\u00ean h\u1ec7", href: "#" },
      ],
    },
    {
      title: "Ph\u00e1p l\u00fd",
      links: [
        { label: "Ch\u00ednh s\u00e1ch b\u1ea3o m\u1eadt", href: "#" },
        { label: "\u0110i\u1ec1u kho\u1ea3n d\u1ecbch v\u1ee5", href: "#" },
      ],
    },
  ],
  ctaSection: {
    title: "S\u1eb5n s\u00e0ng b\u1eaft \u0111\u1ea7u?",
    description: "L\u1ea5y API key ngay h\u00f4m nay v\u00e0 b\u1eaft \u0111\u1ea7u x\u00e2y d\u1ef1ng v\u1edbi h\u1ea1 t\u1ea7ng Codexible.",
    primaryCta: "B\u1eaft \u0111\u1ea7u ngay",
    secondaryCta: "Li\u00ean h\u1ec7 Telegram",
  },
  loginModal: {
    title: "\u0110\u0103ng nh\u1eadp",
    placeholder: "Nh\u1eadp API key c\u1ee7a b\u1ea1n",
    login: "\u0110\u0103ng nh\u1eadp",
    cancel: "H\u1ee7y",
    error: "API key kh\u00f4ng h\u1ee3p l\u1ec7. Vui l\u00f2ng ki\u1ec3m tra l\u1ea1i.",
  },
  toastCopied: "\u0110\u00e3 sao ch\u00e9p!",
};
