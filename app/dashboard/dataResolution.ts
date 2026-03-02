import { findToken, type MockTokenRecord } from "@/app/lib";
import { getDashboardOverview, type DashboardOverview } from "@/app/lib/api";

const DEFAULT_FALLBACK_MAX_AGE_MS = 5 * 60_000;
const DEFAULT_FALLBACK_RETRY_MS = 15_000;
const CONNECTIVITY_ERROR_PATTERN =
  /cannot reach backend api|content security policy|connect-src|failed to fetch|network error/i;

export type DashboardViewData = {
  owner: string;
  plan: string;
  status: string;
  dailyLimit: number;
  usedToday: number;
  tokenDisplay: string;
  balance: number;
  role: "user" | "admin" | string;
  sessionSource: "local" | "cliproxy" | string;
};

export type DashboardSourceMode = "api" | "fallback";

export type DashboardResolutionResult = {
  data: DashboardViewData | null;
  sourceMode: DashboardSourceMode;
  degraded: boolean;
  fallbackReason: string | null;
  fallbackActivatedAt: number | null;
  fallbackExpiresAt: number | null;
  fallbackRetryMs: number;
  loadDurationMs: number;
};

function parsePositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return Math.floor(parsed);
}

export function getFallbackMaxAgeMs(): number {
  return parsePositiveInteger(
    process.env.NEXT_PUBLIC_DASHBOARD_FALLBACK_MAX_AGE_MS,
    DEFAULT_FALLBACK_MAX_AGE_MS,
  );
}

export function getFallbackRetryMs(): number {
  return parsePositiveInteger(
    process.env.NEXT_PUBLIC_DASHBOARD_FALLBACK_RETRY_MS,
    DEFAULT_FALLBACK_RETRY_MS,
  );
}

function isMockFallbackEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK === "true";
}

function isConnectivityError(error: unknown): boolean {
  return error instanceof Error && CONNECTIVITY_ERROR_PATTERN.test(error.message);
}

export function mapOverviewToDashboardData(overview: DashboardOverview): DashboardViewData {
  return {
    owner: overview.user.email,
    plan: overview.user.plan,
    status: overview.user.status,
    dailyLimit: overview.usage.daily_limit,
    usedToday: overview.usage.credits_used,
    tokenDisplay: `${overview.key.prefix}...`,
    balance: overview.usage.daily_limit - overview.usage.credits_used,
    role: overview.role ?? "user",
    sessionSource: overview.session_source ?? "local",
  };
}

export function mapMockRecordToDashboardData(record: MockTokenRecord): DashboardViewData {
  return {
    owner: record.owner,
    plan: record.plan,
    status: record.status,
    dailyLimit: record.dailyLimit,
    usedToday: record.usedToday,
    tokenDisplay: record.token,
    balance: record.dailyLimit - record.usedToday,
    role: "user",
    sessionSource: "local",
  };
}

export async function resolveDashboardData(
  token: string,
  now: number = Date.now(),
): Promise<DashboardResolutionResult> {
  const start = Date.now();
  const fallbackRetryMs = getFallbackRetryMs();
  const fallbackMaxAgeMs = getFallbackMaxAgeMs();

  try {
    const overview = await getDashboardOverview(token);
    return {
      data: mapOverviewToDashboardData(overview),
      sourceMode: "api",
      degraded: false,
      fallbackReason: null,
      fallbackActivatedAt: null,
      fallbackExpiresAt: null,
      fallbackRetryMs,
      loadDurationMs: Date.now() - start,
    };
  } catch (error) {
    const fallbackReason =
      error instanceof Error ? error.message : "Dashboard API unavailable";

    if (!isMockFallbackEnabled()) {
      return {
        data: null,
        sourceMode: "api",
        degraded: false,
        fallbackReason,
        fallbackActivatedAt: null,
        fallbackExpiresAt: null,
        fallbackRetryMs,
        loadDurationMs: Date.now() - start,
      };
    }

    if (isConnectivityError(error)) {
      return {
        data: null,
        sourceMode: "api",
        degraded: false,
        fallbackReason,
        fallbackActivatedAt: null,
        fallbackExpiresAt: null,
        fallbackRetryMs,
        loadDurationMs: Date.now() - start,
      };
    }

    const record = findToken(token);
    if (!record) {
      return {
        data: null,
        sourceMode: "api",
        degraded: false,
        fallbackReason,
        fallbackActivatedAt: null,
        fallbackExpiresAt: null,
        fallbackRetryMs,
        loadDurationMs: Date.now() - start,
      };
    }

    const fallbackActivatedAt = now;
    return {
      data: mapMockRecordToDashboardData(record),
      sourceMode: "fallback",
      degraded: true,
      fallbackReason,
      fallbackActivatedAt,
      fallbackExpiresAt: fallbackActivatedAt + fallbackMaxAgeMs,
      fallbackRetryMs,
      loadDurationMs: Date.now() - start,
    };
  }
}
