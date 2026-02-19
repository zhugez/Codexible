import { MOCK_TOKENS } from "@/app/lib/mockTokens";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl px-5 py-12 md:px-6">
      <h1 className="text-3xl font-bold text-black md:text-4xl">Codexible Docs</h1>
      <p className="mt-3 text-[#475467]">
        Quick docs for integrating Codexible gateway, demo token login, and dashboard usage.
      </p>

      <section className="mt-10 rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">1. Install</h2>
        <pre className="mt-3 overflow-auto rounded-xl bg-[#0b1020] p-4 text-xs text-[#8de0ff] md:text-sm">
{`curl -fsSL "https://codexible.me/install.sh?key=YOUR_KEY" | sh`}
        </pre>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">2. Configure</h2>
        <pre className="mt-3 overflow-auto rounded-xl bg-[#0b1020] p-4 text-xs text-[#8de0ff] md:text-sm">
{`export CODEXIBLE_API_BASE="https://codexible.me/v1"
export CODEXIBLE_API_KEY="YOUR_KEY"`}
        </pre>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">3. Dashboard Login (Demo)</h2>
        <p className="mt-2 text-sm text-[#667085]">
          Temporary prototype flow: login via hardcoded token JSON.
        </p>
        <a
          href="/dashboard/login"
          className="mt-4 inline-block rounded-xl bg-[#e07a45] px-4 py-2 text-sm font-semibold text-white"
        >
          Open Dashboard Login
        </a>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ecf1] bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-black">4. Demo Tokens (Hardcoded JSON)</h2>
        <div className="mt-4 space-y-3">
          {MOCK_TOKENS.map((item) => (
            <div key={item.token} className="rounded-xl border border-[#eef2f6] p-4">
              <p className="text-sm font-semibold text-black">{item.owner}</p>
              <p className="mt-1 text-xs text-[#667085]">Plan: {item.plan} • Limit: {item.dailyLimit}/day</p>
              <code className="mt-2 block overflow-auto rounded-lg bg-[#0b1020] p-3 text-xs text-[#8de0ff]">
                {item.token}
              </code>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
