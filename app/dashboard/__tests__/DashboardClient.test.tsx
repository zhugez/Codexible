import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/api", () => ({
  getUsageHistory: vi.fn(),
  getUsageStats: vi.fn(),
  getUsageDetailed: vi.fn(),
  getModelBreakdown: vi.fn(),
  getHourlyDistribution: vi.fn(),
}));

vi.mock("../components/SubscriptionInfo", () => ({
  SubscriptionInfo: ({ plan }: { plan: string }) => <div>{plan}</div>,
}));
vi.mock("../components/DashboardCharts", () => ({
  DashboardCharts: () => <div>charts</div>,
}));
vi.mock("../components/InsightsGrid", () => ({
  InsightsGrid: () => <div>insights</div>,
}));
vi.mock("../components/ActivityHeatmap", () => ({
  ActivityHeatmap: () => <div>heatmap</div>,
}));
vi.mock("../components/ActivityTable", () => ({
  ActivityTable: () => <div>activity</div>,
}));
vi.mock("../components/QuickActions", () => ({
  QuickActions: () => <div>actions</div>,
}));
vi.mock("../components/DateRangePicker", () => ({
  DateRangePicker: () => <div>range</div>,
}));

import {
  getUsageHistory,
  getUsageStats,
  getUsageDetailed,
  getModelBreakdown,
  getHourlyDistribution,
} from "@/app/lib/api";
import { DashboardClient } from "../DashboardClient";

const mockGetUsageHistory = vi.mocked(getUsageHistory);
const mockGetUsageStats = vi.mocked(getUsageStats);
const mockGetUsageDetailed = vi.mocked(getUsageDetailed);
const mockGetModelBreakdown = vi.mocked(getModelBreakdown);
const mockGetHourlyDistribution = vi.mocked(getHourlyDistribution);

const baseAccountData = {
  owner: "user@codexible.me",
  plan: "Pro",
  status: "active",
  dailyLimit: 250,
  usedToday: 50,
  tokenDisplay: "codexible_demo_pro_2026",
  balance: 200,
  role: "user",
  sessionSource: "local",
};

describe("DashboardClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const store: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => store[key] ?? null,
        setItem: (key: string, value: string) => { store[key] = value; },
        removeItem: (key: string) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
        get length() { return Object.keys(store).length; },
        key: (_i: number) => Object.keys(store)[_i] ?? null,
      },
      writable: true,
    });
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    mockGetUsageHistory.mockResolvedValue([
      { date: "2026-03-20", cost: 1.5 },
      { date: "2026-03-21", cost: 2.3 },
    ]);
    mockGetUsageStats.mockResolvedValue({
      totalRequests: 100,
      totalCost: 12.5,
      promptTokens: 0,
      completionTokens: 0,
    });
    mockGetUsageDetailed.mockResolvedValue([
      {
        id: "req-1",
        model: "gpt-5.3-codex",
        promptTokens: 500,
        completionTokens: 200,
        costUSD: 0.035,
        createdAt: "2026-03-21T10:00:00Z",
        date: "2026-03-21",
      },
    ]);
    mockGetModelBreakdown.mockResolvedValue([
      { model: "gpt-5.3-codex", totalCost: 8.5, requests: 45, promptTokens: 0, completionTokens: 0 },
    ]);
    mockGetHourlyDistribution.mockResolvedValue([
      { hour: 10, requests: 5 },
      { hour: 14, requests: 10 },
    ]);
  });

  it("renders the dashboard header with owner name", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    expect(screen.getByText(/Welcome, user@codexible\.me/)).toBeInTheDocument();
  });

  it("renders language, theme, and logout controls in the header action cluster", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    expect(screen.getByRole("group", { name: /select language/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("renders admin entrypoint when session role is admin", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={{ ...baseAccountData, role: "admin" }} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    expect(screen.getByRole("link", { name: /admin center/i })).toBeInTheDocument();
  });

  it("keeps the header action cluster configured for responsive visibility", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    const actions = screen.getByTestId("dashboard-header-actions");
    expect(actions).toHaveClass("flex-wrap");
    expect(actions.className).toContain("sm:flex-nowrap");
    expect(screen.getByRole("group", { name: /select language/i })).toBeVisible();
  });

  it("switches dashboard copy when changing language from the header", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /chuyển sang tiếng việt/i }));
    });
    expect(screen.getByText(/Chao muon, user@codexible\.me/i)).toBeInTheDocument();
    expect(localStorage.getItem("codexible_lang")).toBe("vi");
  });

  it("applies theme changes immediately from the dashboard header toggle", async () => {
    localStorage.setItem("theme", "light");
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    const toggle = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await act(async () => {
      fireEvent.click(toggle);
    });
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("shows error banner when API calls fail", async () => {
    mockGetUsageHistory.mockRejectedValue(new Error("backend unavailable"));

    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    await waitFor(() => {
      expect(screen.getByText(/Failed to load usage data/)).toBeInTheDocument();
    });
    expect(screen.getByText(/backend unavailable/)).toBeInTheDocument();
  });

  it("renders balance, runway, and status cards with account data", async () => {
    vi.useFakeTimers();
    await act(async () => {
      render(<DashboardClient accountData={baseAccountData} token="token123" />);
      await vi.runAllTimersAsync();
    });
    vi.useRealTimers();
    expect(screen.getByText(/200/)).toBeInTheDocument();
    expect(screen.getByText(/credits/)).toBeInTheDocument();
    expect(screen.getByText(/active/)).toBeInTheDocument();
  });
});
