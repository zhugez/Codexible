import type { LucideIcon } from "lucide-react";

export type Lang = "vi" | "en";

export interface NavCopy {
  features: string;
  pricing: string;
  trust: string;
  docs: string;
  dashboard: string;
}

export interface Plan {
  name: string;
  price: string;
  description: string;
  points: string[];
  cta: string;
  highlight: boolean;
}

export interface Feature {
  icon: LucideIcon;
  title: string;
  body: string;
}

export interface Translation {
  nav: NavCopy;
  ctaTop: string;
  badge: string;
  heroTitleA: string;
  heroTitleB: string;
  heroDesc: string;
  heroStart: string;
  heroExplore: string;
  snapshot: string;
  statusTitle: string;
  statusBody: string;
  coreLabel: string;
  coreTitle: string;
  pricingLabel: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingNotesTitle: string;
  pricingNotes: string[];
  mostPopular: string;
  period: string;
  plans: Plan[];
  install: string;
  trustLabels: [string, string, string];
  features: Feature[];
}

export type Translations = Record<Lang, Translation>;
