import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Codexible",
  description: "Codex API infrastructure for coding teams",
  icons: {
    icon: "/brand/profile.png",
    shortcut: "/brand/profile.png",
    apple: "/brand/profile.png",
  },
  openGraph: {
    title: "Codexible",
    description: "Codex API infrastructure for coding teams",
    images: [{ url: "/brand/cover.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Codexible",
    description: "Codex API infrastructure for coding teams",
    images: ["/brand/cover.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>{children}</body>
    </html>
  );
}
