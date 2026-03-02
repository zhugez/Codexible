import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/app/lib/api", () => ({
  getDashboardOverview: vi.fn(),
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

import { getDashboardOverview } from "@/app/lib/api";
import { DashboardClient } from "../DashboardClient";

const mockGetDashboardOverview = vi.mocked(getDashboardOverview);

const baseData = {
  owner: "fallback@codexible.me",
  plan: "Pro",
  status: "active",
  dailyLimit: 250,
  usedToday: 50,
  tokenDisplay: "codexible_demo_pro_2026",
  balance: 200,
  role: "user",
  sessionSource: "local",
};

describe("DashboardClient fallback behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
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
  });

  it("renders API mode without degraded banner", () => {
    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    expect(screen.queryByText(/degraded fallback mode/i)).not.toBeInTheDocument();
  });

  it("shows expiration message when fallback has already expired", async () => {
    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="fallback"
        fallbackReason="backend down"
        fallbackActivatedAt={1000}
        fallbackExpiresAt={1000}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    expect(await screen.findByText(/Fallback window expired/i)).toBeInTheDocument();
  });

  it("recovers from fallback when API becomes available", async () => {
    mockGetDashboardOverview.mockResolvedValue({
      user: {
        email: "api@codexible.me",
        name: "API User",
        plan: "Pro",
        status: "active",
      },
      usage: {
        credits_used: 12,
        daily_limit: 250,
        request_count: 11,
        date: "2026-03-01",
      },
      key: {
        id: "k1",
        prefix: "codexible_demo",
        label: "Demo",
        status: "active",
        created_at: "2026-03-01T00:00:00Z",
        last_used_at: null,
      },
      role: "user",
      session_source: "local",
    });

    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="fallback"
        fallbackReason="backend down"
        fallbackActivatedAt={Date.now()}
        fallbackExpiresAt={Date.now() + 60_000}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText(/Welcome, api@codexible.me/)).toBeInTheDocument();
    });
    expect(screen.queryByText(/degraded fallback mode/i)).not.toBeInTheDocument();
  });

  it("retries recovery while fallback window is active", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-01T00:00:00Z"));
    mockGetDashboardOverview.mockRejectedValue(new Error("still down"));

    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="fallback"
        fallbackReason="backend down"
        fallbackActivatedAt={Date.now()}
        fallbackExpiresAt={Date.now() + 10_000}
        fallbackRetryMs={1000}
        initialLoadDurationMs={20}
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3200);
    });

    expect(mockGetDashboardOverview.mock.calls.length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText(/degraded fallback mode/i)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("renders language, theme, and logout controls in the header action cluster", () => {
    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    expect(screen.getByRole("group", { name: /select language/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /switch to dark mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log out/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /settings/i })).toBeInTheDocument();
  });

  it("renders admin entrypoint when session role is admin", () => {
    render(
      <DashboardClient
        initialData={{ ...baseData, role: "admin" }}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    expect(screen.getByRole("link", { name: /admin center/i })).toBeInTheDocument();
  });

  it("keeps the header action cluster configured for responsive visibility", () => {
    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    const actions = screen.getByTestId("dashboard-header-actions");
    expect(actions).toHaveClass("flex-wrap");
    expect(actions.className).toContain("sm:flex-nowrap");
    expect(screen.getByRole("group", { name: /select language/i })).toBeVisible();
  });

  it("switches dashboard copy when changing language from the header", () => {
    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /chuyển sang tiếng việt/i }));

    expect(screen.getByText(/chào mừng, fallback@codexible\.me/i)).toBeInTheDocument();
    expect(localStorage.getItem("codexible_lang")).toBe("vi");
  });

  it("applies theme changes immediately from the dashboard header toggle", () => {
    localStorage.setItem("theme", "light");

    render(
      <DashboardClient
        initialData={baseData}
        token="codexible_demo_pro_2026"
        initialSourceMode="api"
        fallbackReason={null}
        fallbackActivatedAt={null}
        fallbackExpiresAt={null}
        fallbackRetryMs={5000}
        initialLoadDurationMs={20}
      />,
    );

    const toggle = screen.getByRole("button", { name: /switch to dark mode/i });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});
