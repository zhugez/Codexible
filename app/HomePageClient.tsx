"use client";

import { useState, useMemo } from "react";
import { translations, type Lang } from "@/app/lib";
import { buildInstallScript } from "@/app/lib";
import { Header, InstallScriptModal } from "@/app/components";
import {
  HeroSection,
  FeaturesSection,
  PricingSection,
  TrustSection,
  FooterSection,
} from "@/app/sections";

/**
 * Client-side wrapper for the homepage with interactive state
 */
export function HomePageClient() {
  const [lang, setLang] = useState<Lang>("vi");
  const [installOpen, setInstallOpen] = useState(false);

  // Get translations for current language
  const t = translations[lang];

  // Generate install script
  const installText = useMemo(
    () => buildInstallScript("", "https://codexible.me"),
    []
  );

  return (
    <div className="text-[#141414]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black"
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

        <PricingSection t={t} />

        <TrustSection t={t} />
      </main>

      <FooterSection nav={t.nav} />

      {installOpen && (
        <InstallScriptModal
          open={installOpen}
          onClose={() => setInstallOpen(false)}
          scriptText={installText}
        />
      )}
    </div>
  );
}
