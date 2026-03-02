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
  id: string; // added id for clicking later
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

export class MockDataService {
  // Generates past N days of data
  static getDailyUsage(days: number = 7): DailyUsage[] {
    const usage: DailyUsage[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Some random fluctuation
      const baseCost = 1.5;
      const variation = Math.random() * 1.5;

      usage.push({
        date: date.toISOString().split('T')[0] as string,
        cost: Number((baseCost + variation).toFixed(2))
      });
    }

    return usage;
  }

  static getModelBreakdown(days: number = 7): ModelBreakdown[] {
    // Scale by days roughly
    const scale = days / 7;
    return [
      { model: "gpt-5.3-codex", totalCost: Number((8.50 * scale).toFixed(2)), requests: Math.round(45 * scale) },
      { model: "gpt-5.1-codex", totalCost: Number((3.20 * scale).toFixed(2)), requests: Math.round(62 * scale) },
      { model: "kimi-k2", totalCost: Number((0.70 * scale).toFixed(2)), requests: Math.round(20 * scale) },
    ];
  }

  static getRecentActivity(limit: number = 10): RecentActivity[] {
    const models = ["gpt-5.3-codex", "gpt-5.3-codex-spark", "gpt-5.1-codex", "gpt-5.1-codex-max", "kimi-k2", "kimi-k2.5"];
    const activity: RecentActivity[] = [];
    let currentTime = Date.now();

    for (let i = 0; i < limit; i++) {
      const model = models[Math.floor(Math.random() * models.length)] as string;
      const promptTokens = Math.floor(Math.random() * 2000) + 100;
      const completionTokens = Math.floor(Math.random() * 1000) + 50;

      let costMultiplier = 0.00001;
      if (model.includes('5.3')) costMultiplier = 0.00005;
      if (model.includes('kimi')) costMultiplier = 0.000002;

      const costUSD = Number(((promptTokens + completionTokens) * costMultiplier).toFixed(3));

      currentTime -= Math.floor(Math.random() * 3600000); // subtract random time up to 1 hour

      activity.push({
        id: `req_${i}_${currentTime}`,
        model,
        promptTokens,
        completionTokens,
        costUSD,
        createdAt: new Date(currentTime).toISOString()
      });
    }

    return activity;
  }

  static getHourlyDistribution(): HourlyDistribution[] {
    // Bell curve pattern peaking at 14:00
    return Array.from({ length: 24 }, (_, i) => {
      const peak = 14;
      const spread = 5;
      const base = Math.exp(-0.5 * ((i - peak) / spread) ** 2);
      return { hour: i, requests: Math.round(base * 30) };
    });
  }

  static getDashboardStats(days: number = 7): DashboardStats {
    const scale = days / 7;
    return {
      totalRequests: Math.round(127 * scale),
      totalCost: Number((12.40 * scale).toFixed(2)),
      promptTokens: Math.round(1240000 * scale),
      completionTokens: Math.round(890000 * scale),
    };
  }
}

// Keep the old constants exporting the service's default 7-day data so we don't break existing components immediately,
// though we will be updating them to use the service statefully.
export const MOCK_DAILY_USAGE = MockDataService.getDailyUsage(7);
export const MOCK_MODEL_BREAKDOWN = MockDataService.getModelBreakdown(7);
export const MOCK_RECENT_ACTIVITY = MockDataService.getRecentActivity(10);
export const MOCK_HOURLY_DISTRIBUTION = MockDataService.getHourlyDistribution();
export const MOCK_STATS = MockDataService.getDashboardStats(7);
