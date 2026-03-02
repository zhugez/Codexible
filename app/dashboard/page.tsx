import { DashboardClient } from "./DashboardClient";
import { resolveDashboardData } from "./dataResolution";

const CONNECTIVITY_ERROR_PATTERN =
  /cannot reach backend api|content security policy|connect-src|failed to fetch|network error/i;

type DashboardPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  const resolution = await resolveDashboardData(token);

  console.info(
    JSON.stringify({
      event: "dashboard_initial_data_load",
      token_present: Boolean(token),
      mode: resolution.sourceMode,
      degraded: resolution.degraded,
      duration_ms: resolution.loadDurationMs,
      fallback_expires_at: resolution.fallbackExpiresAt,
    }),
  );

  if (!resolution.data) {
    const isConnectivityFailure =
      resolution.fallbackReason != null &&
      CONNECTIVITY_ERROR_PATTERN.test(resolution.fallbackReason);

    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">
            {isConnectivityFailure ? "Backend Connection Error" : "Unauthorized"}
          </h1>
          {isConnectivityFailure ? (
            <p className="mt-2 text-sm text-[var(--red)]">
              {resolution.fallbackReason}
            </p>
          ) : (
            <p className="mt-2 text-sm text-[var(--red)]">
              Token missing or invalid. Please login via{" "}
              <a className="underline" href="/dashboard/login">
                /dashboard/login
              </a>
              .
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <DashboardClient
      initialData={resolution.data}
      token={token}
      initialSourceMode={resolution.sourceMode}
      fallbackReason={resolution.fallbackReason}
      fallbackActivatedAt={resolution.fallbackActivatedAt}
      fallbackExpiresAt={resolution.fallbackExpiresAt}
      fallbackRetryMs={resolution.fallbackRetryMs}
      initialLoadDurationMs={resolution.loadDurationMs}
    />
  );
}
