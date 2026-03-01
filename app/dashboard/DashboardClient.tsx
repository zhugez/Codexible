"use client";

import {
  MOCK_DAILY_USAGE,
  MOCK_MODEL_BREAKDOWN,
  MOCK_RECENT_ACTIVITY,
  MOCK_HOURLY_DISTRIBUTION,
  MOCK_STATS,
} from "@/app/lib/mockDashboardData";
import { SubscriptionInfo } from "./components/SubscriptionInfo";
import { DashboardCharts } from "./components/DashboardCharts";
import { InsightsGrid } from "./components/InsightsGrid";
import { ActivityHeatmap } from "./components/ActivityHeatmap";
import { ActivityTable } from "./components/ActivityTable";
import { QuickActions } from "./components/QuickActions";

interface DashboardClientProps {
  data: {
    owner: string;
    plan: string;
    status: string;
    dailyLimit: number;
    usedToday: number;
    tokenDisplay: string;
    balance: number;
  };
  token: string;
}

export function DashboardClient({ data, token }: DashboardClientProps) {
  const balanceColor =
    data.balance > data.dailyLimit * 0.5
      ? "var(--green)"
      : data.balance > data.dailyLimit * 0.2
        ? "var(--accent)"
        : "var(--red)";

  const avgCostPerDay = MOCK_STATS.totalCost / 7;
  const runwayDays = avgCostPerDay > 0 ? Math.round(data.balance / avgCostPerDay) : 99;

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
      {/* Header */}
      <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        Codexible Dashboard
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Welcome, {data.owner}
      </p>

      {/* Hero Stats */}
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {/* Balance */}
        <div className="rounded-2xl border-2 bg-[var(--bg-primary)] p-5 shadow-sm" style={{ borderColor: balanceColor }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Balance</p>
          <p className="mt-2 text-3xl font-bold" style={{ color: balanceColor }}>
            {data.balance}
            <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">credits</span>
          </p>
        </div>

        {/* Runway */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Runway</p>
          <p className="mt-2 text-3xl font-bold text-[var(--text-primary)]">
            ~{runwayDays} days
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Status</p>
          <p className="mt-2 flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]">
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{
                backgroundColor:
                  data.status === "active" ? "var(--green)" : "var(--red)",
              }}
            />
            {data.status}
          </p>
        </div>
      </div>

      {/* Subscription Info */}
      <div className="mt-4">
        <SubscriptionInfo plan={data.plan} dailyLimit={data.dailyLimit} />
      </div>

      {/* Spending Pattern */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Spending Pattern
        </h2>
        <DashboardCharts
          dailyUsage={MOCK_DAILY_USAGE}
          modelBreakdown={MOCK_MODEL_BREAKDOWN}
        />
      </section>

      {/* Usage Insights */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          Usage Insights
        </h2>
        <InsightsGrid stats={MOCK_STATS} hourlyData={MOCK_HOURLY_DISTRIBUTION} />

        <div className="mt-4">
          <ActivityHeatmap data={MOCK_HOURLY_DISTRIBUTION} />
        </div>
      </section>

      {/* Activity + Quick Actions */}
      <section className="mt-8 grid gap-4 md:grid-cols-[2fr_1fr]">
        <ActivityTable data={MOCK_RECENT_ACTIVITY} />
        <div className="hidden md:block">
          <QuickActions token={token} />
        </div>
      </section>
    </main>
  );
}
