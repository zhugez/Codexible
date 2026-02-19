"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { findToken } from "@/app/lib";

export default function DashboardLoginPage() {
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const match = findToken(token);
    if (!match) {
      setError("Invalid token. Try one from the demo docs.");
      return;
    }

    // Temporary: keep token in query for demo flow (no backend/session yet)
    router.push(`/dashboard?token=${encodeURIComponent(match.token)}`);
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-lg items-center px-5 py-12 md:px-6">
      <div className="w-full rounded-3xl border border-[#e8ecf1] bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,.06)] md:p-10">
        <h1 className="text-2xl font-bold text-black md:text-3xl">Dashboard Login</h1>
        <p className="mt-2 text-sm text-[#475467]">
          Temporary token login (hardcoded JSON) for prototype testing.
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
            className="w-full rounded-xl bg-[#e07a45] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            Enter Dashboard
          </button>
        </form>

        <p className="mt-4 text-xs text-[#667085]">
          Demo token list is in docs and hardcoded at <code>app/lib/mockTokens.ts</code>.
        </p>
      </div>
    </main>
  );
}
