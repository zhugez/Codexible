"use client";

import { useEffect, useRef } from "react";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  DoughnutController,
  Legend,
  Tooltip,
  Filler,
} from "chart.js";
import type { DailyUsage, ModelBreakdown } from "@/app/lib/mockDashboardData";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ArcElement,
  DoughnutController,
  Legend,
  Tooltip,
  Filler,
);

interface DashboardChartsProps {
  dailyUsage: DailyUsage[];
  modelBreakdown: ModelBreakdown[];
}

export function DashboardCharts({ dailyUsage, modelBreakdown }: DashboardChartsProps) {
  const lineRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<Chart | null>(null);
  const donutChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!lineRef.current) return;

    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue("--text-secondary").trim() || "#6B7280";
    const borderColor = style.getPropertyValue("--border").trim() || "#E5E7EB";
    const accent = style.getPropertyValue("--accent").trim() || "#e07a45";

    lineChartRef.current?.destroy();
    lineChartRef.current = new Chart(lineRef.current, {
      type: "line",
      data: {
        labels: dailyUsage.map((d) => d.date.slice(5)),
        datasets: [
          {
            label: "Daily Spending ($)",
            data: dailyUsage.map((d) => d.cost),
            borderColor: accent,
            backgroundColor: accent + "20",
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: accent,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            ticks: { color: textColor },
            grid: { color: borderColor + "40" },
          },
          y: {
            ticks: { color: textColor, callback: (v) => `$${v}` },
            grid: { color: borderColor + "40" },
          },
        },
      },
    });

    return () => { lineChartRef.current?.destroy(); };
  }, [dailyUsage]);

  useEffect(() => {
    if (!donutRef.current) return;

    const colors = ["#e07a45", "#3b82f6", "#10b981"];

    donutChartRef.current?.destroy();
    donutChartRef.current = new Chart(donutRef.current, {
      type: "doughnut",
      data: {
        labels: modelBreakdown.map((m) => m.model.split("-").slice(-2).join("-")),
        datasets: [
          {
            data: modelBreakdown.map((m) => m.totalCost),
            backgroundColor: colors,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
            labels: {
              color: getComputedStyle(document.documentElement).getPropertyValue("--text-secondary").trim() || "#6B7280",
              padding: 12,
            },
          },
        },
      },
    });

    return () => { donutChartRef.current?.destroy(); };
  }, [modelBreakdown]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Daily Spending</h3>
        <div style={{ height: 200 }}>
          <canvas ref={lineRef} />
        </div>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
        <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">Cost Breakdown</h3>
        <div style={{ height: 200 }}>
          <canvas ref={donutRef} />
        </div>
      </div>
    </div>
  );
}
