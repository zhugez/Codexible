"use client";

import { useState } from "react";
import type { HourlyDistribution } from "@/app/lib/mockDashboardData";

interface ActivityHeatmapProps {
  data: HourlyDistribution[];
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);
  const maxRequests = Math.max(...data.map((d) => d.requests), 1);

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] p-4">
      <h3 className="mb-4 text-sm font-semibold text-[var(--text-primary)]">Activity by Hour</h3>

      <div className="flex items-end gap-1" style={{ height: 120 }}>
        {data.map((d) => {
          const heightPct = (d.requests / maxRequests) * 100;
          const intensity = d.requests / maxRequests;
          return (
            <div
              key={d.hour}
              className="relative flex-1 cursor-pointer rounded-t transition-colors"
              style={{
                height: `${Math.max(heightPct, 4)}%`,
                backgroundColor: intensity > 0.5
                  ? `var(--green)`
                  : `var(--bg-tertiary)`,
                opacity: Math.max(intensity, 0.3),
              }}
              onMouseEnter={() => setHoveredHour(d.hour)}
              onMouseLeave={() => setHoveredHour(null)}
            >
              {hoveredHour === d.hour && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[var(--text-primary)] px-2 py-1 text-[10px] text-[var(--bg-primary)]">
                  {d.hour}:00 — {d.requests} req
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* X-axis labels */}
      <div className="mt-2 flex justify-between text-[10px] text-[var(--text-muted)]">
        <span>0:00</span>
        <span>6:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>

      {/* Legend */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
        <span>Low</span>
        <div className="h-2 w-16 rounded" style={{ background: `linear-gradient(to right, var(--bg-tertiary), var(--green))` }} />
        <span>High</span>
      </div>
    </div>
  );
}
