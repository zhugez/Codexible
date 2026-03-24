"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateToken, isBackendConnectivityError } from "@/app/lib/api";

export default function DashboardLoginClient() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedToken = token.trim().replace(/^["'`]+|["'`]+$/g, "").replace(/[\s\u200B-\u200D\uFEFF]/g, "");
    if (!normalizedToken) {
      setError("Token is required.");
      setLoading(false);
      return;
    }

    try {
      const result = await validateToken(normalizedToken);
      if (result.valid && result.role === "admin") {
        localStorage.setItem("codexible_token", normalizedToken);
        window.history.replaceState(null, "", window.location.pathname);
        router.push("/dashboard/admin");
        return;
      }

      if (result.valid) {
        localStorage.setItem("codexible_token", normalizedToken);
        window.history.replaceState(null, "", window.location.pathname);
        router.push("/dashboard");
        return;
      }
    } catch (error) {
      if (isBackendConnectivityError(error)) {
        const message =
          error instanceof Error ? error.message : "Cannot reach backend API.";
        setError(message);
        setLoading(false);
        return;
      }
      const message = error instanceof Error ? error.message : "Token validation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md items-center px-5 py-12 md:px-6">
      <div className="w-full rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] p-7 shadow-lg md:p-10">
        <h1 className="text-2xl font-bold text-[var(--text-primary)] md:text-3xl">
          Dashboard Login
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Enter your API token to access the dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-[var(--text-primary)]">
            API Token
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="codexible_demo_pro_2026"
              className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
              aria-describedby={error ? "login-error" : undefined}
            />
          </label>

          {error && (
            <p
              id="login-error"
              role="alert"
              className="text-sm font-medium text-[var(--red)]"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-px hover:bg-[var(--accent-hover)] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 active:translate-y-0"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>
      </div>
    </main>
  );
}
