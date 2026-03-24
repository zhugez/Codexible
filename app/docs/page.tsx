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
        <h2 className="text-xl font-semibold text-black">4. Troubleshooting Login Console Errors</h2>
        <div className="mt-3 space-y-3 text-sm text-[#475467]">
          <p>
            <strong>App-owned errors (need fixing):</strong> CSP violations such as
            <code className="mx-1 rounded bg-[#f3f4f6] px-1 py-0.5">
              connect-src &apos;self&apos;
            </code>
            blocking requests to your backend API URL.
          </p>
          <p>
            <strong>Extension-origin noise (usually external):</strong>
            <code className="mx-1 rounded bg-[#f3f4f6] px-1 py-0.5">Unchecked runtime.lastError</code>
            and
            <code className="mx-1 rounded bg-[#f3f4f6] px-1 py-0.5">lockdown-install.js</code>
            can come from browser extensions and may be unrelated to Codexible app logic.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Check Network tab for `POST /api/auth/validate` request outcome.</li>
            <li>
              Verify frontend CSP `connect-src` allows your `NEXT_PUBLIC_API_URL` origin.
            </li>
            <li>
              If using Docker, set `API_INTERNAL_URL` to an internal backend address (for example
              `http://backend:3001`) for server-rendered dashboard calls.
            </li>
            <li>Confirm backend health endpoint is reachable (`/health`).</li>
            <li>Retry in incognito mode with extensions disabled to isolate extension noise.</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
