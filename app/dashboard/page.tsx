import { findToken } from "@/app/lib";
import { getDashboardOverview, type DashboardOverview } from "@/app/lib/api";
import { DashboardClient } from "./DashboardClient";

type DashboardPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  let data: {
    owner: string;
    plan: string;
    status: string;
    dailyLimit: number;
    usedToday: number;
    tokenDisplay: string;
    balance: number;
  } | null = null;

  try {
    const overview: DashboardOverview = await getDashboardOverview(token);
    data = {
      owner: overview.user.email,
      plan: overview.user.plan,
      status: overview.user.status,
      dailyLimit: overview.usage.daily_limit,
      usedToday: overview.usage.credits_used,
      tokenDisplay: overview.key.prefix + "...",
      balance: overview.usage.daily_limit - overview.usage.credits_used,
    };
  } catch {
    const record = findToken(token);
    if (record) {
      data = {
        owner: record.owner,
        plan: record.plan,
        status: record.status,
        dailyLimit: record.dailyLimit,
        usedToday: record.usedToday,
        tokenDisplay: record.token,
        balance: record.dailyLimit - record.usedToday,
      };
    }
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Unauthorized</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            Token missing or invalid. Please login via <a className="underline" href="/dashboard/login">/dashboard/login</a>.
          </p>
        </div>
      </main>
    );
  }

  return <DashboardClient data={data} token={token} />;
}
