"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { findToken } from "@/app/lib";
import { validateToken } from "@/app/lib/api";

const ENABLE_MOCK_FALLBACK = process.env.NEXT_PUBLIC_ENABLE_MOCK_TOKEN_FALLBACK === "true";
const BACKEND_CONNECTIVITY_PATTERN =
  /cannot reach backend api|content security policy|connect-src|failed to fetch|network error/i;

function isConnectivityError(error: unknown): boolean {
  return error instanceof Error && BACKEND_CONNECTIVITY_PATTERN.test(error.message);
}

export default function DashboardLoginClient() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const normalizedToken = token.trim().replace(/^["'`]+|["'`]+$/g, "");
    if (!normalizedToken) {
      setError("Token is required.");
      setLoading(false);
      return;
    }

    try {
      const result = await validateToken(normalizedToken);
      if (result.valid && result.role === "admin") {
        router.push(`/dashboard/admin?token=${encodeURIComponent(normalizedToken)}`);
        return;
      }

      if (result.valid) {
        router.push(`/dashboard?token=${encodeURIComponent(normalizedToken)}`);
        return;
      }
    } catch (error) {
      if (isConnectivityError(error)) {
        const message =
          error instanceof Error ? error.message : "Cannot reach backend API.";
        setError(message);
        setLoading(false);
        return;
      }

      if (!ENABLE_MOCK_FALLBACK) {
        const message = error instanceof Error ? error.message : "Token validation failed";
        setError(message);
        setLoading(false);
        return;
      }

      const match = findToken(normalizedToken);
      if (match) {
        router.push(`/dashboard?token=${encodeURIComponent(match.token)}`);
        return;
      }
    } finally {
      setLoading(false);
    }

    setError(
      ENABLE_MOCK_FALLBACK
        ? "Invalid token. Try one from the demo docs."
        : "Invalid token. Please check your CLIProxyAPI token and try again.",
    );
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

        {ENABLE_MOCK_FALLBACK && (
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            Demo tokens are listed on the{" "}
            <a href="/docs" className="underline underline-offset-2 hover:text-[var(--accent)]">
              docs page
            </a>
            .
          </p>
        )}
      </div>
    </main>
  );
}
