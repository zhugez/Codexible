"use client";

import { Clipboard, Settings, FileText, MessageCircle } from "lucide-react";
import { useCopyToClipboard } from "@/app/hooks";

interface QuickActionsProps {
  token: string;
}

export function QuickActions({ token }: QuickActionsProps) {
  const { copy } = useCopyToClipboard();

  const envConfig = `export ANTHROPIC_BASE_URL="https://codexible.me/v1"\nexport ANTHROPIC_AUTH_TOKEN="${token}"`;
  const settingsConfig = `{\n  "apiBaseUrl": "https://codexible.me/v1",\n  "apiKey": "${token}"\n}`;

  const actions = [
    { icon: Clipboard, label: "Copy ENV Config", onClick: () => copy(envConfig) },
    { icon: Settings, label: "Copy Settings", onClick: () => copy(settingsConfig) },
    { icon: FileText, label: "View Docs", href: "/docs" },
    { icon: MessageCircle, label: "Contact Support", href: "https://t.me/codexible" },
  ];

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
      <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Quick Actions</h3>
      <div className="space-y-2">
        {actions.map(({ icon: Icon, label, onClick, href }) => {
          const className = "flex w-full items-center gap-3 rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] hover:border-[var(--accent)]";

          if (href) {
            return (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                className={className}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            );
          }

          return (
            <button
              key={label}
              type="button"
              onClick={onClick}
              className={className}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
