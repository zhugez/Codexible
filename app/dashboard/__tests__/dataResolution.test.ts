import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/app/lib/api", () => ({
  getDashboardOverview: vi.fn(),
}));

import { getDashboardOverview } from "@/app/lib/api";
import { resolveDashboardData } from "../dataResolution";

const mockGetDashboardOverview = vi.mocked(getDashboardOverview);

const token = "codexible_demo_pro_2026";

describe("resolveDashboardData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("NEXT_PUBLIC_DASHBOARD_FALLBACK_MAX_AGE_MS", "60000");
    vi.stubEnv("NEXT_PUBLIC_DASHBOARD_FALLBACK_RETRY_MS", "5000");
    vi.stubEnv("NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK", "true");
  });

  it("uses API-first data when backend succeeds", async () => {
    mockGetDashboardOverview.mockResolvedValue({
      user: {
        email: "demo@codexible.me",
        name: "Demo",
        plan: "Pro",
        status: "active",
      },
      usage: {
        credits_used: 12,
        daily_limit: 250,
        request_count: 20,
        date: "2026-03-01",
      },
      key: {
        id: "k1",
        prefix: "codexible_demo",
        label: "Demo Key",
        status: "active",
        created_at: "2026-03-01T00:00:00Z",
        last_used_at: null,
      },
    });

    const result = await resolveDashboardData(token, 1000);

    expect(result.sourceMode).toBe("api");
    expect(result.degraded).toBe(false);
    expect(result.fallbackExpiresAt).toBeNull();
    expect(result.data?.owner).toBe("demo@codexible.me");
  });

  it("activates bounded fallback when API fails and token exists", async () => {
    mockGetDashboardOverview.mockRejectedValue(new Error("backend unavailable"));

    const result = await resolveDashboardData(token, 10_000);

    expect(result.sourceMode).toBe("fallback");
    expect(result.degraded).toBe(true);
    expect(result.fallbackActivatedAt).toBe(10_000);
    expect(result.fallbackExpiresAt).toBe(70_000);
    expect(result.fallbackRetryMs).toBe(5000);
    expect(result.data?.owner).toBe("demo@codexible.me");
  });

  it("does not fall back when token is unknown", async () => {
    mockGetDashboardOverview.mockRejectedValue(new Error("backend unavailable"));

    const result = await resolveDashboardData("unknown-token", 10_000);

    expect(result.sourceMode).toBe("api");
    expect(result.degraded).toBe(false);
    expect(result.data).toBeNull();
  });

  it("does not use mock fallback for CSP/network connectivity errors", async () => {
    mockGetDashboardOverview.mockRejectedValue(
      new Error(
        "Cannot reach backend API. Check NEXT_PUBLIC_API_URL, CSP connect-src policy, and backend health.",
      ),
    );

    const result = await resolveDashboardData(token, 20_000);

    expect(result.sourceMode).toBe("api");
    expect(result.degraded).toBe(false);
    expect(result.data).toBeNull();
    expect(result.fallbackReason).toMatch(/cannot reach backend api/i);
  });
});
