// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";

interface DashboardOverviewPayload {
  user: {
    email: string;
    name: string | null;
    plan: string;
    status: string;
  };
  usage: {
    credits_used: number;
    daily_limit: number;
    request_count: number;
    date: string;
  };
  key: {
    id: string;
    prefix: string;
    label: string;
    status: string;
    created_at: string;
    last_used_at: string | null;
  };
}

function dashboardOverviewResponse(): DashboardOverviewPayload {
  return {
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
  };
}

describe("API base URL resolution", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("prefers API_INTERNAL_URL on server runtime when provided", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:3001");
    vi.stubEnv("API_INTERNAL_URL", "http://backend:3001");

    const fetchMock = vi.fn(async () => new Response(JSON.stringify(dashboardOverviewResponse())));
    vi.stubGlobal("fetch", fetchMock);

    const { getDashboardOverview } = await import("../api");
    await getDashboardOverview("sk-test");

    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend:3001/api/dashboard/overview",
      expect.objectContaining({
        headers: {
          Authorization: "Bearer sk-test",
        },
      }),
    );
  });
});
