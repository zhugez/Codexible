const DEV_DEFAULT_API_BASE = "http://localhost:3001";

export const BACKEND_CONNECTIVITY_ERROR_MESSAGE =
  "Cannot reach backend API. Check NEXT_PUBLIC_API_URL, CSP connect-src policy, and backend health.";

export function isBackendConnectivityError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return /cannot reach backend api|content security policy|connect-src|failed to fetch|network error/i.test(
    error.message,
  );
}
// Reuse the exported constant to avoid duplication
const CONNECTIVITY_ERROR_MESSAGE = BACKEND_CONNECTIVITY_ERROR_MESSAGE;

function normalizeApiBaseUrl(input: string, sourceName: string = "NEXT_PUBLIC_API_URL"): string {
  const trimmed = input.trim();
  if (!trimmed) {
    return "";
  }

  // Relative base path stays same-origin (e.g. /api).
  if (trimmed.startsWith("/")) {
    return trimmed.replace(/\/+$/, "");
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error(
      `Invalid ${sourceName}: "${trimmed}". Use an absolute http(s) URL (e.g. "http://localhost:3001") or a relative path (e.g. "/api").`,
    );
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(
      `Invalid ${sourceName} protocol: "${parsed.protocol}". Only http:// or https:// are supported.`,
    );
  }

  const normalizedPath = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
  return `${parsed.origin}${normalizedPath}`;
}

interface ConfiguredApiUrl {
  sourceName: "NEXT_PUBLIC_API_URL" | "API_INTERNAL_URL";
  value: string;
}

function resolveConfiguredApiUrl(
  rawApiUrl: string | undefined,
  rawInternalApiUrl: string | undefined,
): ConfiguredApiUrl | null {
  const configuredInternal = rawInternalApiUrl?.trim();
  if (typeof window === "undefined" && configuredInternal) {
    return {
      sourceName: "API_INTERNAL_URL",
      value: configuredInternal,
    };
  }

  const configuredPublic = rawApiUrl?.trim();
  if (configuredPublic) {
    return {
      sourceName: "NEXT_PUBLIC_API_URL",
      value: configuredPublic,
    };
  }

  return null;
}

function resolveApiBaseUrl(
  rawApiUrl: string | undefined,
  nodeEnv: string | undefined = process.env.NODE_ENV,
  rawInternalApiUrl: string | undefined = process.env.API_INTERNAL_URL,
): string {
  const configured = resolveConfiguredApiUrl(rawApiUrl, rawInternalApiUrl);
  if (configured) {
    return normalizeApiBaseUrl(configured.value, configured.sourceName);
  }

  if (nodeEnv !== "production") {
    return DEV_DEFAULT_API_BASE;
  }

  return "";
}

function isConnectivityMessage(message: string): boolean {
  return /content security policy|connect-src|refused to connect|failed to fetch|networkerror|network error/i.test(
    message,
  );
}

function toConnectivityError(error: unknown): Error {
  if (
    error instanceof Error &&
    (error.message.startsWith("Invalid NEXT_PUBLIC_API_URL") ||
      error.message.startsWith("Invalid API_INTERNAL_URL"))
  ) {
    return error;
  }

  if (error instanceof Error && isConnectivityMessage(error.message)) {
    return new Error(CONNECTIVITY_ERROR_MESSAGE);
  }

  if (error instanceof TypeError) {
    return new Error(CONNECTIVITY_ERROR_MESSAGE);
  }

  return new Error(
    error instanceof Error
      ? `${CONNECTIVITY_ERROR_MESSAGE} (${error.message})`
      : CONNECTIVITY_ERROR_MESSAGE,
  );
}

let API_BASE_URL = "";
let API_BASE_URL_ERROR: Error | null = null;
try {
  API_BASE_URL = resolveApiBaseUrl(process.env.NEXT_PUBLIC_API_URL);
} catch (error) {
  API_BASE_URL_ERROR = error instanceof Error ? error : new Error("Invalid NEXT_PUBLIC_API_URL.");
}

function getApiUrl(path: string): string {
  if (API_BASE_URL_ERROR) {
    throw API_BASE_URL_ERROR;
  }

  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function request(path: string, init: RequestInit): Promise<Response> {
  const url = getApiUrl(path);
  try {
    return await fetch(url, init);
  } catch (error) {
    throw toConnectivityError(error);
  }
}

async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const payload = await res.json();
    if (payload?.error?.message) {
      return payload.error.message;
    }
  } catch {
    // ignored
  }
  return fallback;
}

async function expectOk(res: Response, operation: string): Promise<void> {
  if (res.ok) {
    return;
  }

  const message = await readErrorMessage(res, `${operation} API error: ${res.status}`);
  if (res.status === 401 || res.status === 403) {
    throw new Error("Session is unauthorized. Please log in again.");
  }
  if (res.status >= 500) {
    throw new Error(`Backend temporarily unavailable. ${message}`);
  }
  throw new Error(message);
}

export interface UserResponse {
  email: string;
  name: string | null;
  plan: string;
  status: string;
}

export interface ValidateResponse {
  valid: boolean;
  user: UserResponse | null;
  role?: "user" | "admin" | null;
  session_source?: "local" | "cliproxy" | string | null;
  degraded?: boolean;
  message?: string | null;
}

export interface UsageSummary {
  credits_used: number;
  daily_limit: number;
  request_count: number;
  date: string;
}

export interface KeyInfo {
  id: string;
  prefix: string;
  label: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

export interface DashboardOverview {
  user: UserResponse;
  usage: UsageSummary;
  key: KeyInfo;
  role?: "user" | "admin" | null;
  session_source?: "local" | "cliproxy" | null;
  degraded?: boolean;
}

export async function validateToken(token: string): Promise<ValidateResponse> {
  const res = await request("/api/auth/validate", {
    method: "POST",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    const message = await readErrorMessage(res, `Validate token API error: ${res.status}`);
    if (res.status >= 500) {
      throw new Error(`Authentication service temporarily unavailable. ${message}`);
    }
    return { valid: false, user: null, message };
  }

  return res.json();
}

export async function getDashboardOverview(token: string): Promise<DashboardOverview> {
  const res = await request("/api/dashboard/overview", {
    cache: "no-store",
    headers: { Authorization: `Bearer ${token}` },
  });
  await expectOk(res, "Dashboard");
  return res.json();
}

export interface ApiKeyItem {
  id: string;
  prefix: string;
  label: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

export interface ApiKeyCreated {
  id: string;
  key: string;
  prefix: string;
  label: string;
}

function authHeaders(token: string, withJson: boolean = false): HeadersInit {
  return withJson
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        Authorization: `Bearer ${token}`,
      };
}

export async function listApiKeys(token: string): Promise<ApiKeyItem[]> {
  const res = await request("/api/keys", {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "List keys");
  return res.json();
}

export async function createApiKey(token: string, label?: string): Promise<ApiKeyCreated> {
  const res = await request("/api/keys", {
    method: "POST",
    cache: "no-store",
    headers: authHeaders(token, true),
    body: JSON.stringify({ label }),
  });
  await expectOk(res, "Create key");
  return res.json();
}

export async function revokeApiKey(token: string, id: string): Promise<void> {
  const res = await request(`/api/keys/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Revoke key");
}

export async function rotateApiKey(token: string, id: string): Promise<ApiKeyCreated> {
  const res = await request(`/api/keys/${id}/rotate`, {
    method: "POST",
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Rotate key");
  return res.json();
}

export async function updateApiKeyLabel(token: string, id: string, label: string): Promise<void> {
  const res = await request(`/api/keys/${id}`, {
    method: "PATCH",
    cache: "no-store",
    headers: authHeaders(token, true),
    body: JSON.stringify({ label }),
  });
  await expectOk(res, "Update key");
}

export interface IntegrationStatus {
  enabled: boolean;
  upstream_url: string;
  management_url: string;
  upstream_reachable: boolean;
  management_reachable: boolean;
  last_error?: string | null;
}

export interface AdminStatus {
  integration: IntegrationStatus;
  user_count: number;
  active_token_count: number;
  today_credits_used: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  status: string;
  plan: string;
  key_count: number;
}

export interface AdminToken {
  id: string;
  user_id: string;
  user_email: string;
  prefix: string;
  label: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface AdminAuditEvent {
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  details: string;
}

export async function getAdminStatus(token: string): Promise<AdminStatus> {
  const res = await request("/api/admin/status", {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin status");
  return res.json();
}

export async function getAdminUsers(token: string, q: string = ""): Promise<AdminUser[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await request(`/api/admin/users${query}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin users");
  return res.json();
}

export async function getAdminTokens(token: string, q: string = ""): Promise<AdminToken[]> {
  const query = q ? `?q=${encodeURIComponent(q)}` : "";
  const res = await request(`/api/admin/tokens${query}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin tokens");
  return res.json();
}

export async function adminCreateToken(
  token: string,
  userId: string,
  label?: string,
): Promise<ApiKeyCreated> {
  const res = await request("/api/admin/tokens", {
    method: "POST",
    cache: "no-store",
    headers: authHeaders(token, true),
    body: JSON.stringify({ user_id: userId, label }),
  });
  await expectOk(res, "Admin create token");
  return res.json();
}

export async function adminUpdateToken(
  token: string,
  id: string,
  label: string,
): Promise<void> {
  const res = await request(`/api/admin/tokens/${id}`, {
    method: "PATCH",
    cache: "no-store",
    headers: authHeaders(token, true),
    body: JSON.stringify({ label }),
  });
  await expectOk(res, "Admin update token");
}

export async function adminRevokeToken(token: string, id: string): Promise<void> {
  const res = await request(`/api/admin/tokens/${id}`, {
    method: "DELETE",
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin revoke token");
}

export async function adminRotateToken(token: string, id: string): Promise<ApiKeyCreated> {
  const res = await request(`/api/admin/tokens/${id}/rotate`, {
    method: "POST",
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin rotate token");
  return res.json();
}

export async function getAdminLogs(
  token: string,
  q: string = "",
  limit: number = 100,
): Promise<AdminAuditEvent[]> {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  params.set("limit", String(limit));

  const res = await request(`/api/admin/logs?${params.toString()}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Admin logs");
  const json = await res.json();
  return json.logs ?? [];
}

// --- Usage API types and functions ---

export interface DailyUsage {
  date: string;
  cost: number;
}

export interface ModelBreakdown {
  model: string;
  totalCost: number;
  requests: number;
  promptTokens: number;
  completionTokens: number;
}

export interface RecentActivity {
  id: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  createdAt: string;
  date: string;
}

export interface HourlyDistribution {
  hour: number;
  requests: number;
}

export interface DashboardStats {
  totalRequests: number;
  totalCost: number;
  promptTokens: number;
  completionTokens: number;
}

export interface UsageHistoryEntry {
  date: string;
  credits_used: number;
  request_count: number;
  cost_usd: number | null;
}

function toDailyUsage(history: UsageHistoryEntry[]): DailyUsage[] {
  return history.map((h) => ({
    date: h.date,
    cost: h.cost_usd ?? 0,
  }));
}

function toStats(history: UsageHistoryEntry[]): DashboardStats {
  const totalRequests = history.reduce((sum, h) => sum + h.request_count, 0);
  const totalCost = history.reduce((sum, h) => sum + (h.cost_usd ?? 0), 0);
  return {
    totalRequests,
    totalCost: Number(totalCost.toFixed(2)),
    promptTokens: 0,
    completionTokens: 0,
  };
}

export async function getUsageHistory(token: string, days: number): Promise<DailyUsage[]> {
  const res = await request(`/api/usage/history?days=${days}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Usage history");
  const json: UsageHistoryEntry[] = await res.json();
  return toDailyUsage(json);
}

export async function getUsageStats(token: string, days: number): Promise<DashboardStats> {
  const res = await request(`/api/usage/history?days=${days}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Usage stats");
  const json: UsageHistoryEntry[] = await res.json();
  return toStats(json);
}

export async function getUsageDetailed(token: string, days: number, limit = 100): Promise<RecentActivity[]> {
  const res = await request(`/api/usage/detailed?days=${days}&limit=${limit}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Usage detailed");
  const json: Array<{
    id: string;
    model: string;
    prompt_tokens: number;
    completion_tokens: number;
    cost_usd: number;
    created_at: string;
    date: string;
  }> = await res.json();
  return json.map((e) => ({
    id: e.id,
    model: e.model,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
    costUSD: e.cost_usd,
    createdAt: e.created_at,
    date: e.date,
  }));
}

export async function getModelBreakdown(token: string, days: number): Promise<ModelBreakdown[]> {
  const res = await request(`/api/usage/models?days=${days}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Model breakdown");
  const json: Array<{
    model: string;
    total_cost: number;
    requests: number;
    prompt_tokens: number;
    completion_tokens: number;
  }> = await res.json();
  return json.map((e) => ({
    model: e.model,
    totalCost: e.total_cost,
    requests: e.requests,
    promptTokens: e.prompt_tokens,
    completionTokens: e.completion_tokens,
  }));
}

export async function getHourlyDistribution(token: string, date: string): Promise<HourlyDistribution[]> {
  const res = await request(`/api/usage/hourly?date=${date}`, {
    cache: "no-store",
    headers: authHeaders(token),
  });
  await expectOk(res, "Hourly distribution");
  const json: Array<{ hour: number; requests: number }> = await res.json();
  return json.map((e) => ({ hour: e.hour, requests: e.requests }));
}
