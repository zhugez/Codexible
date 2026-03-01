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

export interface StepItem {
  title: string;
  description: string;
}

export interface Steps {
  title: string;
  items: [StepItem, StepItem, StepItem];
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
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
  steps: Steps;
  footerTagline: string;
  footerColumns: [FooterColumn, FooterColumn, FooterColumn];
  ctaSection: {
    title: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
  };
  loginModal: {
    title: string;
    placeholder: string;
    login: string;
    cancel: string;
    error: string;
  };
  toastCopied: string;
}

export type Translations = Record<Lang, Translation>;
