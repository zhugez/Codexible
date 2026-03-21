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
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5 py-12 md:px-6">
      <div className="w-full rounded-3xl border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-10">
        <h1 className="text-2xl font-bold text-black md:text-3xl">Dashboard Login</h1>
        <p className="mt-2 text-sm text-[#475467]">
          Enter your API token to access the dashboard.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm font-medium text-[#111827]">
            API Token
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="codexible_demo_pro_2026"
              className="mt-2 w-full rounded-xl border border-[#d7dee7] px-4 py-3 text-sm outline-none transition focus:border-[#e07a45] focus:ring-2 focus:ring-[#f2d0bf]"
            />
          </label>

          {error && <p className="text-sm text-[#b42318]">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#e07a45] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Enter Dashboard"}
          </button>
        </form>

        {ENABLE_MOCK_FALLBACK && (
          <p className="mt-4 text-xs text-[#667085]">
            Demo tokens are listed on the <a className="underline" href="/docs">docs page</a>.
          </p>
        )}
      </div>
    </main>
  );
}
