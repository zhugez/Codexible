"use client";

import { MessageCircle } from "lucide-react";

export function FloatingContact() {
  return (
    <a
      href="https://t.me/codexible"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-[999] inline-flex items-center gap-2 rounded-full bg-[var(--accent)] px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2"
      aria-label="Contact on Telegram"
    >
      <MessageCircle className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">Contact</span>
    </a>
  );
}
