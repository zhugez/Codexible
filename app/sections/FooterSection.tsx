import type { NavCopy } from "@/app/types";

interface FooterSectionProps {
  nav: NavCopy;
}

/**
 * Footer with navigation links
 */
export function FooterSection({ nav }: FooterSectionProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-[#667085] md:flex-row md:px-6">
        <p>© {currentYear} Codexible</p>
        <nav
          className="flex items-center gap-5"
          aria-label="Footer navigation"
        >
          <a
            href="#features"
            className="transition-colors hover:text-black focus:outline-none focus:underline"
          >
            {nav.features}
          </a>
          <a
            href="#pricing"
            className="transition-colors hover:text-black focus:outline-none focus:underline"
          >
            {nav.pricing}
          </a>
          <a
            href="#trust"
            className="transition-colors hover:text-black focus:outline-none focus:underline"
          >
            {nav.trust}
          </a>
        </nav>
      </div>
    </footer>
  );
}
