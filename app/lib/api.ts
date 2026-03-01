const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface UserResponse {
  email: string;
  name: string | null;
  plan: string;
  status: string;
}

export interface ValidateResponse {
  valid: boolean;
  user: UserResponse | null;
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
}

export async function validateToken(token: string): Promise<ValidateResponse> {
  const res = await fetch(`${API_URL}/api/auth/validate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!res.ok) {
    return { valid: false, user: null };
  }

  return res.json();
}

export async function getDashboardOverview(
  token: string,
): Promise<DashboardOverview> {
  const res = await fetch(`${API_URL}/api/dashboard/overview`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    throw new Error(`Dashboard API error: ${res.status}`);
  }

  return res.json();
}
