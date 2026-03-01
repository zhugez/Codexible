"use client";

import { useState, useMemo } from "react";
import { translations, type Lang } from "@/app/lib";
import { buildInstallScript } from "@/app/lib";
import { Header, InstallScriptModal, LoginModal, FloatingContact } from "@/app/components";
import {
  HeroSection,
  FeaturesSection,
  StepsSection,
  PricingSection,
  TrustSection,
  CtaSection,
  FooterSection,
} from "@/app/sections";

/**
 * Client-side wrapper for the homepage with interactive state
 */
export function HomePageClient() {
  const [lang, setLang] = useState<Lang>("vi");
  const [installOpen, setInstallOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  // Get translations for current language
  const t = translations[lang];

  // Generate install script
  const installText = useMemo(
    () => buildInstallScript("", "https://codexible.me"),
    []
  );

  return (
    <div className="text-[var(--text-primary)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded focus:bg-[var(--bg-primary)] focus:px-4 focus:py-2 focus:text-[var(--text-primary)]"
      >
        Skip to main content
      </a>

      <Header
        lang={lang}
        onLangChange={setLang}
        nav={t.nav}
        ctaTop={t.ctaTop}
      />

      <main id="main-content">
        <HeroSection
          t={t}
          lang={lang}
          onOpenInstallModal={() => setInstallOpen(true)}
        />

        <FeaturesSection t={t} />

        <StepsSection t={t} />

        <PricingSection t={t} />

        <TrustSection t={t} />

        <CtaSection t={t} onOpenLogin={() => setLoginOpen(true)} />
      </main>

      <FooterSection t={t} />

      <FloatingContact />

      {installOpen && (
        <InstallScriptModal
          open={installOpen}
          onClose={() => setInstallOpen(false)}
          scriptText={installText}
        />
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        t={t}
      />
    </div>
  );
}
