"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Shield } from "lucide-react";
import {
  getUsageHistory,
  getUsageStats,
  getUsageDetailed,
  getModelBreakdown,
  getHourlyDistribution,
  type DailyUsage,
  type ModelBreakdown,
  type RecentActivity,
  type HourlyDistribution,
  type DashboardStats,
} from "@/app/lib/api";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import type { Lang } from "@/app/types";
import { SubscriptionInfo } from "./components/SubscriptionInfo";
import { DashboardCharts } from "./components/DashboardCharts";
import { InsightsGrid } from "./components/InsightsGrid";
import { ActivityHeatmap } from "./components/ActivityHeatmap";
import { ActivityTable } from "./components/ActivityTable";
import { QuickActions } from "./components/QuickActions";
import { DateRangePicker, type DateRangeOption } from "./components/DateRangePicker";

interface AccountData {
  owner: string;
  plan: string;
  status: string;
  dailyLimit: number;
  usedToday: number;
  tokenDisplay: string;
  balance: number;
  role: "user" | "admin" | string;
  sessionSource: "local" | "cliproxy" | string;
}

interface DashboardClientProps {
  accountData: AccountData;
  token: string;
}

const LANGUAGE_STORAGE_KEY = "codexible_lang";

type DashboardCopy = {
  dashboardTitle: string;
  welcome: string;
  settings: string;
  admin: string;
  logout: string;
  logoutAria: string;
  loading: string;
  retry: string;
  balance: string;
  credits: string;
  runway: string;
  days: string;
  status: string;
  spendingPattern: string;
  usageInsights: string;
};

const DASHBOARD_COPY: Record<Lang, DashboardCopy> = {
  en: {
    dashboardTitle: "Codexible Dashboard",
    welcome: "Welcome",
    settings: "Settings",
    admin: "Admin Center",
    logout: "Log Out",
    logoutAria: "Log out",
    loading: "Loading dashboard data...",
    retry: "Retry",
    balance: "Balance",
    credits: "credits",
    runway: "Runway",
    days: "days",
    status: "Status",
    spendingPattern: "Spending Pattern",
    usageInsights: "Usage Insights",
  },
  vi: {
    dashboardTitle: "Bảng điều khiển Codexible",
    welcome: "Chào mừng",
    settings: "Cài đặt",
    admin: "Trung tâm Admin",
    logout: "Đăng xuất",
    logoutAria: "Đăng xuất",
    loading: "Đang tải dữ liệu...",
    retry: "Thử lại",
    balance: "Số dư",
    credits: "tín dụng",
    runway: "Ước tính",
    days: "ngày",
    status: "Trạng thái",
    spendingPattern: "Mẫu chi tiêu",
    usageInsights: "Phân tích sử dụng",
  },
};

function getInitialDashboardLanguage(): Lang {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "vi" || stored === "en" ? stored : "en";
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function DashboardClient({ accountData, token: tokenFromUrl }: DashboardClientProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRangeOption>("7d");
  const [lang, setLang] = useState<Lang>(getInitialDashboardLanguage);
  // Token: prefer URL param (backward compat for direct links) else localStorage
  const [token] = useState(
    () => tokenFromUrl || (typeof window !== "undefined" ? localStorage.getItem("codexible_token") ?? "" : ""),
  );

  const daysMap: Record<DateRangeOption, number> = { "24h": 1, "7d": 7, "30d": 30, "all": 90 };
  const days = daysMap[dateRange];

  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [modelBreakdown, setModelBreakdown] = useState<ModelBreakdown[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [hourlyDistribution, setHourlyDistribution] = useState<HourlyDistribution[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRequests: 0,
    totalCost: 0,
    promptTokens: 0,
    completionTokens: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const [history, breakdown, activity, hourly, statsData] = await Promise.all([
          getUsageHistory(token, days),
          getModelBreakdown(token, days),
          getUsageDetailed(token, days, Math.min(100, days * 5)),
          getHourlyDistribution(token, todayString()),
          getUsageStats(token, days),
        ]);

        if (cancelled) return;

        setDailyUsage(history);
        setModelBreakdown(breakdown);
        setRecentActivity(activity);
        setHourlyDistribution(hourly);
        setStats(statsData);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load dashboard data.");
        setLoading(false);
      }
    }

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [token, days]);

  const handleLogout = () => {
    localStorage.removeItem("api_keys");
    router.push("/");
  };

  const t = DASHBOARD_COPY[lang];

  const balanceColor =
    accountData.balance > accountData.dailyLimit * 0.5
      ? "var(--green)"
      : accountData.balance > accountData.dailyLimit * 0.2
        ? "var(--accent)"
        : "var(--red)";

  const avgCostPerDay = stats.totalCost > 0 && days > 0 ? stats.totalCost / days : 0;
  const runwayDays = avgCostPerDay > 0 ? Math.round(accountData.balance / avgCostPerDay) : 99;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">{t.dashboardTitle}</h1>
          <p className="mt-2 text-[var(--text-secondary)]">{t.welcome}, {accountData.owner}</p>
        </div>
        <div
          className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto sm:flex-nowrap sm:justify-start"
          data-testid="dashboard-header-actions"
        >
          <a
            href="/dashboard/settings"
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <Settings size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.settings}</span>
          </a>
          {accountData.role === "admin" && (
            <a
              href="/dashboard/admin"
              className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
            >
              <Shield size={16} aria-hidden="true" />
              <span className="hidden sm:inline">{t.admin}</span>
            </a>
          )}
          <LanguageToggle currentLang={lang} onLangChange={setLang} />
          <ThemeToggle />
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            aria-label={t.logoutAria}
          >
            <LogOut size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.logout}</span>
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border-2 bg-[var(--bg-primary)] p-5 shadow-sm" style={{ borderColor: balanceColor }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t.balance}</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: balanceColor }}>
            {accountData.balance}
            <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">{t.credits}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t.runway}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            ~{runwayDays} {t.days}
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{t.status}</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
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

      <div className="mt-4">
        <SubscriptionInfo plan={accountData.plan} dailyLimit={accountData.dailyLimit} />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-[var(--red-light)] bg-[var(--red-light)] px-4 py-3 text-sm">
          <p className="font-semibold text-[var(--red)]">Failed to load usage data</p>
          <p className="mt-1 text-[var(--text-secondary)]">{error}</p>
          <button
            type="button"
            onClick={() => {
              setError(null);
              setLoading(true);
              void (async () => {
                try {
                  const [history, breakdown, activity, hourly, statsData] = await Promise.all([
                    getUsageHistory(token, days),
                    getModelBreakdown(token, days),
                    getUsageDetailed(token, days, Math.min(100, days * 5)),
                    getHourlyDistribution(token, todayString()),
                    getUsageStats(token, days),
                  ]);
                  setDailyUsage(history);
                  setModelBreakdown(breakdown);
                  setRecentActivity(activity);
                  setHourlyDistribution(hourly);
                  setStats(statsData);
                } catch (e) {
                  setError(e instanceof Error ? e.message : "Failed to load.");
                } finally {
                  setLoading(false);
                }
              })();
            }}
            className="mt-2 rounded-md bg-[var(--accent)] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[var(--accent-dark)]"
          >
            {t.retry}
          </button>
        </div>
      )}

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t.spendingPattern}
          </h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex h-[248px] animate-pulse items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <span className="text-sm text-[var(--text-muted)]">{t.loading}</span>
            </div>
            <div className="flex h-[248px] animate-pulse items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]">
              <span className="text-sm text-[var(--text-muted)]">{t.loading}</span>
            </div>
          </div>
        ) : (
          <DashboardCharts
            dailyUsage={dailyUsage}
            modelBreakdown={modelBreakdown}
          />
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {t.usageInsights}
        </h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-[100px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
            ))}
          </div>
        ) : (
          <InsightsGrid stats={stats} hourlyData={hourlyDistribution} />
        )}

        <div className="mt-4">
          {loading ? (
            <div className="h-[200px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
          ) : (
            <ActivityHeatmap data={hourlyDistribution} />
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr]">
        {loading ? (
          <div className="h-[300px] animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]" />
        ) : (
          <ActivityTable data={recentActivity} />
        )}
        <div className="hidden md:block">
          <QuickActions token={token} />
        </div>
      </section>
    </main>
  );
}
