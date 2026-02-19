export type MockTokenRecord = {
  token: string;
  owner: string;
  plan: "Starter" | "Pro" | "Business";
  status: "active" | "suspended";
  dailyLimit: number;
  usedToday: number;
};

// Temporary hardcoded token store (requested)
export const MOCK_TOKENS: MockTokenRecord[] = [
  {
    token: "codexible_demo_pro_2026",
    owner: "demo@codexible.me",
    plan: "Pro",
    status: "active",
    dailyLimit: 250,
    usedToday: 89,
  },
  {
    token: "codexible_demo_business_2026",
    owner: "team@codexible.me",
    plan: "Business",
    status: "active",
    dailyLimit: 500,
    usedToday: 146,
  },
  {
    token: "codexible_demo_starter_2026",
    owner: "starter@codexible.me",
    plan: "Starter",
    status: "active",
    dailyLimit: 75,
    usedToday: 22,
  },
];

export function findToken(token: string) {
  return MOCK_TOKENS.find((t) => t.token === token.trim());
}
