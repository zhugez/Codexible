import { CliproxyClient } from "./CliproxyClient";

type CliproxyPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function CliproxyPage({ searchParams }: CliproxyPageProps) {
  const params = await searchParams;
  const token = params.token ?? "";

  if (!token) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-12 md:px-6">
        <div className="rounded-2xl border border-[var(--red-light)] bg-[var(--red-light)] p-6">
          <h1 className="text-xl font-semibold text-[var(--red)]">Unauthorized</h1>
          <p className="mt-2 text-sm text-[var(--red)]">
            Token missing. Please login via <a className="underline" href="/dashboard/login">/dashboard/login</a>.
          </p>
        </div>
      </main>
    );
  }

  return <CliproxyClient token={token} />;
}
