// This page must be dynamically rendered so that the API URL from the build
// environment is fresh on every request, not stale from static prerender cache.
export const dynamic = "force-dynamic";

import DashboardLoginClient from "./DashboardLoginClient";

export default function DashboardLoginPage() {
  return <DashboardLoginClient />;
}
