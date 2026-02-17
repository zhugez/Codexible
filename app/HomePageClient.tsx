"use client";

import { useState, useMemo } from "react";
import { translations, type Lang } from "@/app/lib/i18n/types";
import { buildInstallScript } from "@/app/lib/installScript";
import { Header } from "@/app/components/Header";
import { InstallScriptModal } from "@/app/components/InstallScriptModal";
import { HeroSection } from "@/app/sections/HeroSection";
import { FeaturesSection } from "@/app/sections/FeaturesSection";
import { PricingSection } from "@/app/sections/PricingSection";
import { TrustSection } from "@/app/sections/TrustSection";
import { FooterSection } from "@/app/sections/FooterSection";

/**
 * Client-side wrapper for the homepage with interactive state
 */
export function HomePageClient() {
  const [lang, setLang] = useState<Lang>("vi");
  const [installOpen, setInstallOpen] = useState(false);

  // Get translations for current language
  const t = translations[lang];

  // Generate install script
  const installText = useMemo(() => {
    try {
      return buildInstallScript("", "https://codexible.me");
    } catch {
      return "#!/usr/bin/env sh\n# Error generating install script";
    }
  }, []);

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
          loading={false}
          error={null}
        />
      )}
    </div>
  );
}
