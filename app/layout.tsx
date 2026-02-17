import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#e07a45",
};

export const metadata: Metadata = {
  title: {
    default: "Codexible - Codex API Infrastructure",
    template: "%s | Codexible",
  },
  description:
    "Codexible helps teams ship faster with a gateway for coding agents: smart routing, realtime metering, and policy-based cost control.",
  keywords: [
    "codex api",
    "coding agents",
    "api gateway",
    "ai infrastructure",
    "cost control",
    "developer tools",
    "openai",
    "anthropic",
  ],
  authors: [{ name: "Codexible", url: "https://codexible.me" }],
  creator: "Codexible",
  publisher: "Codexible",
  metadataBase: new URL("https://codexible.me"),
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/vi",
      "en-US": "/en",
    },
  },
  openGraph: {
    title: "Codexible - Codex API Infrastructure",
    description:
      "One endpoint. Real control. Smart routing, realtime metering, and policy-based cost control for coding agents.",
    url: "https://codexible.me",
    siteName: "Codexible",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Codexible - Codex API Infrastructure",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Codexible - Codex API Infrastructure",
    description:
      "One endpoint. Real control. Smart routing, realtime metering, and policy-based cost control.",
    images: ["/og-image.png"],
    creator: "@codexible",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={manrope.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
