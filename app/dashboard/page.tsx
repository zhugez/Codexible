import { findToken } from "@/app/lib";

type DashboardPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";
  const record = findToken(token);

  if (!record) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[#fde2e2] bg-[#fff5f5] p-6">
          <h1 className="text-xl font-semibold text-[#7a271a]">Unauthorized</h1>
          <p className="mt-2 text-sm text-[#7a271a]">
            Token missing or invalid. Please login via <a className="underline" href="/dashboard/login">/dashboard/login</a>.
          </p>
        </div>
      </main>
    );
  }

  const usagePct = Math.min(100, Math.round((record.usedToday / record.dailyLimit) * 100));

  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
      <h1 className="text-3xl font-bold text-black md:text-4xl">Codexible Dashboard</h1>
      <p className="mt-2 text-[#475467]">Welcome, {record.owner}</p>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <StatCard label="Plan" value={record.plan} />
        <StatCard label="Status" value={record.status} />
        <StatCard label="Daily Limit" value={`${record.dailyLimit} credits`} />
      </div>

      <section className="mt-6 rounded-2xl border border-[#e8ecf1] bg-white p-6">
        <h2 className="text-lg font-semibold">Today Usage</h2>
        <p className="mt-1 text-sm text-[#667085]">
          {record.usedToday} / {record.dailyLimit} credits
        </p>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#edf2f7]">
          <div
            className="h-full rounded-full bg-[#e07a45]"
            style={{ width: `${usagePct}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-[#475467]">{usagePct}% used</p>
      </section>

      <section className="mt-6 rounded-2xl border border-[#e8ecf1] bg-white p-6">
        <h2 className="text-lg font-semibold">Token</h2>
        <code className="mt-3 block overflow-auto rounded-xl bg-[#0b1020] p-4 text-xs text-[#8de0ff] md:text-sm">
          {record.token}
        </code>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#e8ecf1] bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#667085]">{label}</p>
      <p className="mt-2 text-xl font-semibold text-black">{value}</p>
    </div>
  );
}
