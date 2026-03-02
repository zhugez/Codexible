"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings, Shield } from "lucide-react";
import { getDashboardOverview } from "@/app/lib/api";
import { LanguageToggle } from "@/app/components/LanguageToggle";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import type { Lang } from "@/app/types";
import { MockDataService } from "@/app/lib/mockDashboardData";
import { SubscriptionInfo } from "./components/SubscriptionInfo";
import { DashboardCharts } from "./components/DashboardCharts";
import { InsightsGrid } from "./components/InsightsGrid";
import { ActivityHeatmap } from "./components/ActivityHeatmap";
import { ActivityTable } from "./components/ActivityTable";
import { QuickActions } from "./components/QuickActions";
import { DateRangePicker, type DateRangeOption } from "./components/DateRangePicker";
import {
  mapOverviewToDashboardData,
  type DashboardSourceMode,
  type DashboardViewData,
} from "./dataResolution";

interface DashboardClientProps {
  initialData: DashboardViewData;
  token: string;
  initialSourceMode: DashboardSourceMode;
  fallbackReason: string | null;
  fallbackActivatedAt: number | null;
  fallbackExpiresAt: number | null;
  fallbackRetryMs: number;
  initialLoadDurationMs: number;
}

const EMPTY_DASHBOARD_DATA = {
  dailyUsage: [] as ReturnType<typeof MockDataService.getDailyUsage>,
  modelBreakdown: [] as ReturnType<typeof MockDataService.getModelBreakdown>,
  recentActivity: [] as ReturnType<typeof MockDataService.getRecentActivity>,
  hourlyDistribution: [] as ReturnType<typeof MockDataService.getHourlyDistribution>,
  stats: {
    totalRequests: 0,
    totalCost: 0,
    promptTokens: 0,
    completionTokens: 0,
  },
};

const LANGUAGE_STORAGE_KEY = "codexible_lang";

type DashboardCopy = {
  dashboardTitle: string;
  welcome: string;
  settings: string;
  admin: string;
  logout: string;
  logoutAria: string;
  fallbackTitle: string;
  fallbackExpired: string;
  fallbackRetrying: string;
  fallbackUsing: string;
  fallbackLastApiError: string;
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
    fallbackTitle: "Dashboard is in degraded fallback mode.",
    fallbackExpired: "Fallback window expired. Please refresh or log in again to force fresh API validation.",
    fallbackRetrying: "Retrying API recovery...",
    fallbackUsing: "Using bounded fallback data while the API recovers.",
    fallbackLastApiError: "Last API error",
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
    fallbackTitle: "Dashboard đang ở chế độ dự phòng suy giảm.",
    fallbackExpired: "Cửa sổ dự phòng đã hết hạn. Vui lòng tải lại hoặc đăng nhập lại để xác thực API mới.",
    fallbackRetrying: "Đang thử khôi phục API...",
    fallbackUsing: "Đang dùng dữ liệu dự phòng giới hạn trong khi API phục hồi.",
    fallbackLastApiError: "Lỗi API gần nhất",
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

export function DashboardClient({
  initialData,
  token,
  initialSourceMode,
  fallbackReason,
  fallbackActivatedAt,
  fallbackExpiresAt,
  fallbackRetryMs,
  initialLoadDurationMs,
}: DashboardClientProps) {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRangeOption>("7d");
  const [accountData, setAccountData] = useState(initialData);
  const [sourceMode, setSourceMode] = useState<DashboardSourceMode>(initialSourceMode);
  const [fallbackExpired, setFallbackExpired] = useState(false);
  const [retryInFlight, setRetryInFlight] = useState(false);
  const [lang, setLang] = useState<Lang>(getInitialDashboardLanguage);

  // Dynamically calculate mock data based on selected date range.
  const daysMap = { "24h": 1, "7d": 7, "30d": 30, "all": 90 };
  const days = daysMap[dateRange];
  const [isMounted, setIsMounted] = useState(false);

  const dashboardData = useMemo(() => {
    if (!isMounted) {
      return EMPTY_DASHBOARD_DATA;
    }

    return {
      dailyUsage: MockDataService.getDailyUsage(days),
      modelBreakdown: MockDataService.getModelBreakdown(days),
      recentActivity: MockDataService.getRecentActivity(Math.min(20, days * 5)),
      hourlyDistribution: MockDataService.getHourlyDistribution(),
      stats: MockDataService.getDashboardStats(days),
    };
  }, [days, isMounted]);

  // Prevent hydration mismatch by only rendering generated chart data after mount.
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    console.info(
      JSON.stringify({
        event: "dashboard_initial_data_load",
        mode: initialSourceMode,
        degraded: initialSourceMode === "fallback",
        duration_ms: initialLoadDurationMs,
      }),
    );
  }, [initialLoadDurationMs, initialSourceMode]);

  useEffect(() => {
    if (sourceMode !== "fallback" || fallbackExpiresAt == null) {
      return;
    }

    let cancelled = false;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    const tryRecover = async () => {
      if (Date.now() >= fallbackExpiresAt) {
        if (!cancelled) {
          setFallbackExpired(true);
        }
        return;
      }

      if (!cancelled) {
        setRetryInFlight(true);
      }

      try {
        const overview = await getDashboardOverview(token);
        if (cancelled) {
          return;
        }

        setAccountData(mapOverviewToDashboardData(overview));
        setSourceMode("api");
        setFallbackExpired(false);

        console.info(
          JSON.stringify({
            event: "dashboard_fallback_recovery",
            recovered: true,
            fallback_activated_at: fallbackActivatedAt,
            recovered_at: Date.now(),
          }),
        );

        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch {
        if (!cancelled && Date.now() >= fallbackExpiresAt) {
          setFallbackExpired(true);
        }
      } finally {
        if (!cancelled) {
          setRetryInFlight(false);
        }
      }
    };

    void tryRecover();
    intervalId = setInterval(() => {
      void tryRecover();
    }, fallbackRetryMs);

    return () => {
      cancelled = true;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fallbackActivatedAt, fallbackExpiresAt, fallbackRetryMs, sourceMode, token]);

  useEffect(() => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  }, [lang]);

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

  const avgCostPerDay = dashboardData.stats.totalCost / days;
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
            href={`/dashboard/settings?token=${encodeURIComponent(token)}`}
            className="inline-flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
          >
            <Settings size={16} aria-hidden="true" />
            <span className="hidden sm:inline">{t.settings}</span>
          </a>
          {accountData.role === "admin" && (
            <a
              href={`/dashboard/admin?token=${encodeURIComponent(token)}`}
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

      {sourceMode === "fallback" && (
        <div className="mt-6 rounded-xl border border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3 text-sm text-[var(--text-primary)]">
          <p className="font-semibold">{t.fallbackTitle}</p>
          <p className="mt-1 text-[var(--text-secondary)]">
            {fallbackExpired
              ? t.fallbackExpired
              : retryInFlight
                ? t.fallbackRetrying
                : t.fallbackUsing}
          </p>
          {fallbackReason && (
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              {t.fallbackLastApiError}: {fallbackReason}
            </p>
          )}
        </div>
      )}

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

      <section className="mt-8">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            {t.spendingPattern}
          </h2>
          <DateRangePicker value={dateRange} onChange={setDateRange} />
        </div>
        <DashboardCharts
          dailyUsage={dashboardData.dailyUsage}
          modelBreakdown={dashboardData.modelBreakdown}
        />
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {t.usageInsights}
        </h2>
        <InsightsGrid stats={dashboardData.stats} hourlyData={dashboardData.hourlyDistribution} />

        <div className="mt-4">
          <ActivityHeatmap data={dashboardData.hourlyDistribution} />
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr]">
        <ActivityTable data={dashboardData.recentActivity} />
        <div className="hidden md:block">
          <QuickActions token={token} />
        </div>
      </section>
    </main>
  );
}
