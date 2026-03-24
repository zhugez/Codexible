import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActivityHeatmap } from "../ActivityHeatmap";
import { InsightsGrid } from "../InsightsGrid";
import type { DashboardStats } from "@/app/lib/api";

const baseStats: DashboardStats = {
  totalRequests: 100,
  totalCost: 12.5,
  promptTokens: 120000,
  completionTokens: 40000,
};

describe("dashboard insights resilience", () => {
  it("renders peak hour fallback when hourly data is empty", () => {
    render(<InsightsGrid stats={baseStats} hourlyData={[]} />);

    expect(screen.getByText("Peak Hour")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("renders computed peak hour when hourly data exists", () => {
    render(
      <InsightsGrid
        stats={baseStats}
        hourlyData={[
          { hour: 8, requests: 3 },
          { hour: 14, requests: 9 },
          { hour: 16, requests: 5 },
        ]}
      />,
    );

    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("renders heatmap empty-state safely when no hourly data exists", () => {
    render(<ActivityHeatmap data={[]} />);

    expect(screen.getByText("No hourly data yet")).toBeInTheDocument();
  });
});
