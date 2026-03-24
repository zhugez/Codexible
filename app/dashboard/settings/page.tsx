import { getDashboardOverview } from "@/app/lib/api";
import { SettingsPageClient } from "./SettingsPageClient";

/** Reads account data from the backend using the given token. Returns null on failure. */
async function fetchAccount(token: string) {
  try {
    const overview = await getDashboardOverview(token);
    return {
      owner: overview.user.email,
      plan: overview.user.plan,
      status: overview.user.status,
      dailyLimit: overview.usage.daily_limit,
      balance: overview.usage.daily_limit - overview.usage.credits_used,
      role: overview.role ?? ("user" as const),
    };
  } catch {
    return null;
  }
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const token = params.token ?? "";

  // If no token at all, show auth screen and let client read localStorage
  if (!token) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Unauthorized</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            Token missing. Please login via{" "}
            <a className="underline" href="/dashboard/login">
              /dashboard/login
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  const accountData = await fetchAccount(token);

  return <SettingsPageClient token={token} accountData={accountData} />;
}
