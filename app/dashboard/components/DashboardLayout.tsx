"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Settings, Shield, LogOut } from "lucide-react";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import type { Lang } from "@/app/types";

const LANGUAGE_STORAGE_KEY = "codexible_lang";

interface AccountData {
  owner: string;
  plan: string;
  status: string;
  dailyLimit: number;
  balance: number;
  role: "user" | "admin" | string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  accountData: AccountData;
  /** Page title, e.g. "Settings" or "Admin" */
  title?: string;
  /** Optional subtitle line below title */
  subtitle?: string;
  /** Show back nav breadcrumb */
  backHref?: string;
  backLabel?: string;
  /** Optional tabs bar (rendered below the balance strip) */
  tabs?: React.ReactNode;
}

export function DashboardLayout({
  children,
  accountData,
  title,
  subtitle,
  backHref,
  backLabel,
  tabs,
}: DashboardLayoutProps) {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Lang | null;
    return stored === "vi" || stored === "en" ? stored : "en";
  });

  const balanceColor =
    accountData.balance > accountData.dailyLimit * 0.5
      ? "var(--green)"
      : accountData.balance > accountData.dailyLimit * 0.2
        ? "var(--accent)"
        : "var(--red)";

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:px-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left: title + breadcrumb */}
        <div className="min-w-0 flex-1">
          {backHref && (
            <button
              type="button"
              onClick={() => router.push(backHref)}
              className="mb-2 flex items-center gap-1.5 text-sm text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel ?? "Dashboard"}
            </button>
          )}
          <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
            {title ?? "Dashboard"}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
          )}
          <p className="mt-1 text-[var(--text-secondary)]">{accountData.owner}</p>
        </div>

        {/* Right: nav + controls */}
        <div
          className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap"
          data-testid="dashboard-header-actions"
        >
          <a
            href="/dashboard/settings"
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <Settings size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Settings</span>
          </a>
          {accountData.role === "admin" && (
            <a
              href="/dashboard/admin"
              className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <Shield size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Admin</span>
            </a>
          )}
          <LanguageToggle
            currentLang={lang}
            onLangChange={(l) => {
              setLang(l);
              localStorage.setItem(LANGUAGE_STORAGE_KEY, l);
            }}
          />
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("codexible_token");
              router.push("/");
            }}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            aria-label="Log out"
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* ── Balance strip ────────────────────────────────────── */}
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {/* Balance */}
        <div
          className="rounded-2xl border-2 bg-[var(--bg-primary)] p-4 shadow-sm"
          style={{ borderColor: balanceColor }}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Balance</p>
          <p className="mt-1 text-2xl font-bold" style={{ color: balanceColor }}>
            {accountData.balance}
            <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">credits</span>
          </p>
        </div>

        {/* Plan */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Plan</p>
          <p className="mt-1 text-xl font-semibold text-[var(--text-primary)]">
            {accountData.plan}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</p>
          <p className="mt-1 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  accountData.status === "active" ? "var(--green)" : "var(--red)",
              }}
            />
            {accountData.status}
          </p>
        </div>
      </div>

      {/* ── Tabs bar (optional) ─────────────────────────────── */}
      {tabs && <div className="mt-6">{tabs}</div>}

      {/* ── Page content ──────────────────────────────────────── */}
      <div className="mt-6">{children}</div>
    </main>
  );
}
