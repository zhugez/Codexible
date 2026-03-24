"use client";

import { useState } from "react";
import type { RecentActivity } from "@/app/lib/api";
import { LogDetailPanel } from "./LogDetailPanel";

interface ActivityTableProps {
  data: RecentActivity[];
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.max(1, Math.round(diffMs / 60000));
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.round(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}

export function ActivityTable({ data }: ActivityTableProps) {
  const [selectedLog, setSelectedLog] = useState<RecentActivity | null>(null);

  return (
    <>
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</h3>
          <span className="text-xs text-[var(--text-muted)]">Recent Activity</span>
        </div>

        <div className="max-h-[260px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-[var(--bg-secondary)]">
              <tr className="text-left text-xs text-[var(--text-muted)]">
                <th className="px-4 py-2 font-medium">Model</th>
                <th className="px-4 py-2 font-medium">Tokens</th>
                <th className="px-4 py-2 font-medium">Cost</th>
                <th className="px-4 py-2 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, i) => (
                <tr
                  key={item.id ?? `fallback-${i}`}
                  onClick={() => setSelectedLog(item)}
                  className="cursor-pointer border-t border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)]"
                >
                  <td className="max-w-[140px] truncate px-4 py-3 font-mono text-xs" title={item.model}>
                    {item.model.split("-").slice(-2).join("-")}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {(item.promptTokens / 1000).toFixed(1)}K / {(item.completionTokens / 1000).toFixed(1)}K
                  </td>
                  <td className="px-4 py-3 text-xs">${item.costUSD.toFixed(3)}</td>
                  <td className="px-4 py-3 text-xs">{timeAgo(item.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <LogDetailPanel log={selectedLog} onClose={() => setSelectedLog(null)} />
    </>
  );
}
