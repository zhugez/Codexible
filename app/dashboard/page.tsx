import { getDashboardOverview, type DashboardOverview } from "@/app/lib/api";
import { DashboardClient } from "./DashboardClient";

const CONNECTIVITY_ERROR_PATTERN =
  /cannot reach backend api|content security policy|connect-src|failed to fetch|network error/i;

function mapOverviewToAccountData(overview: DashboardOverview) {
  return {
    owner: overview.user.email,
    plan: overview.user.plan,
    status: overview.user.status,
    dailyLimit: overview.usage.daily_limit,
    usedToday: overview.usage.credits_used,
    tokenDisplay: overview.key.prefix + "...",
    balance: overview.usage.daily_limit - overview.usage.credits_used,
    role: overview.role ?? "user",
    sessionSource: overview.session_source ?? "local",
  };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? localStorage?.getItem("codexible_token") ?? "";

  if (!token) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Unauthorized</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            Token missing or invalid. Please login via{" "}
            <a className="underline" href="/dashboard/login">
              /dashboard/login
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  let accountData: ReturnType<typeof mapOverviewToAccountData>;
  try {
    const overview = await getDashboardOverview(token);
    accountData = mapOverviewToAccountData(overview);
  } catch (error) {
    const isConnectivityFailure =
      error instanceof Error && CONNECTIVITY_ERROR_PATTERN.test(error.message);

    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">
            {isConnectivityFailure ? "Backend Connection Error" : "Unauthorized"}
          </h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            {error instanceof Error ? error.message : "Dashboard API unavailable."}
          </p>
        </div>
      </main>
    );
  }

  return <DashboardClient accountData={accountData} token={token} />;
}
