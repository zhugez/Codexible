"use client";

import { Activity, DollarSign, TrendingUp, FileText, FileOutput, Clock } from "lucide-react";
import type { DashboardStats, HourlyDistribution } from "@/app/lib/mockDashboardData";

interface InsightsGridProps {
  stats: DashboardStats;
  hourlyData: HourlyDistribution[];
}

export function InsightsGrid({ stats, hourlyData }: InsightsGridProps) {
  const peakHour = hourlyData.reduce((max, h) =>
    h.requests > max.requests ? h : max
  , hourlyData[0]!);

  const avgDailyCost = stats.totalCost / 7;

  const metrics = [
    { icon: Activity, label: "Total Requests", value: stats.totalRequests.toLocaleString() },
    { icon: DollarSign, label: "Total Spent", value: `$${stats.totalCost.toFixed(2)}` },
    { icon: TrendingUp, label: "Avg Daily Cost", value: `$${avgDailyCost.toFixed(2)}` },
    { icon: FileText, label: "Input Tokens", value: `${(stats.promptTokens / 1000).toFixed(0)}K` },
    { icon: FileOutput, label: "Output Tokens", value: `${(stats.completionTokens / 1000).toFixed(0)}K` },
    { icon: Clock, label: "Peak Hour", value: `${peakHour.hour}:00` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {metrics.map(({ icon: Icon, label, value }) => (
        <div
          key={label}
          className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4 transition-colors hover:border-[var(--accent)]"
        >
          <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent-light)] text-[var(--accent)]">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xl font-bold text-[var(--text-primary)]">{value}</p>
          <p className="text-xs text-[var(--text-muted)]">{label}</p>
        </div>
      ))}
    </div>
  );
}
