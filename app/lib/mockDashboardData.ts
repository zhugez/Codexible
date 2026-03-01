export interface DailyUsage {
  date: string;
  cost: number;
}

export interface ModelBreakdown {
  model: string;
  totalCost: number;
  requests: number;
}

export interface RecentActivity {
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUSD: number;
  createdAt: string;
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

export const MOCK_DAILY_USAGE: DailyUsage[] = [
  { date: "2026-02-23", cost: 1.24 },
  { date: "2026-02-24", cost: 2.15 },
  { date: "2026-02-25", cost: 1.87 },
  { date: "2026-02-26", cost: 3.02 },
  { date: "2026-02-27", cost: 1.54 },
  { date: "2026-02-28", cost: 2.48 },
  { date: "2026-03-01", cost: 0.10 },
];

export const MOCK_MODEL_BREAKDOWN: ModelBreakdown[] = [
  { model: "claude-opus-4.6", totalCost: 8.50, requests: 45 },
  { model: "claude-sonnet-4.6", totalCost: 3.20, requests: 62 },
  { model: "claude-haiku-4.5", totalCost: 0.70, requests: 20 },
];

export const MOCK_RECENT_ACTIVITY: RecentActivity[] = [
  { model: "claude-opus-4.6", promptTokens: 1200, completionTokens: 800, costUSD: 0.124, createdAt: "2026-03-01T10:58:00Z" },
  { model: "claude-sonnet-4.6", promptTokens: 800, completionTokens: 450, costUSD: 0.042, createdAt: "2026-03-01T10:55:00Z" },
  { model: "claude-haiku-4.5", promptTokens: 300, completionTokens: 200, costUSD: 0.008, createdAt: "2026-03-01T10:52:00Z" },
  { model: "claude-opus-4.6", promptTokens: 2400, completionTokens: 1600, costUSD: 0.248, createdAt: "2026-03-01T10:48:00Z" },
  { model: "claude-sonnet-4.6", promptTokens: 600, completionTokens: 300, costUSD: 0.030, createdAt: "2026-03-01T10:44:00Z" },
  { model: "claude-opus-4.6", promptTokens: 1800, completionTokens: 900, costUSD: 0.167, createdAt: "2026-03-01T10:40:00Z" },
  { model: "claude-haiku-4.5", promptTokens: 150, completionTokens: 100, costUSD: 0.004, createdAt: "2026-03-01T10:36:00Z" },
  { model: "claude-sonnet-4.6", promptTokens: 950, completionTokens: 500, costUSD: 0.049, createdAt: "2026-03-01T10:30:00Z" },
  { model: "claude-opus-4.6", promptTokens: 3200, completionTokens: 2100, costUSD: 0.328, createdAt: "2026-03-01T10:24:00Z" },
  { model: "claude-sonnet-4.6", promptTokens: 400, completionTokens: 250, costUSD: 0.022, createdAt: "2026-03-01T10:18:00Z" },
];

// Bell curve pattern peaking at 14:00
export const MOCK_HOURLY_DISTRIBUTION: HourlyDistribution[] = Array.from({ length: 24 }, (_, i) => {
  const peak = 14;
  const spread = 5;
  const base = Math.exp(-0.5 * ((i - peak) / spread) ** 2);
  return { hour: i, requests: Math.round(base * 30) };
});

export const MOCK_STATS: DashboardStats = {
  totalRequests: 127,
  totalCost: 12.40,
  promptTokens: 1_240_000,
  completionTokens: 890_000,
};
