import { PlaygroundClient } from "./PlaygroundClient";

export default function PlaygroundPage() {
  return (
    <main className="mx-auto max-w-6xl px-5 py-10 md:px-6">
      <h1 className="text-3xl font-bold text-[var(--text-primary)] md:text-4xl">
        API Playground
      </h1>
      <p className="mt-2 text-[var(--text-secondary)]">
        Test and construct API requests directly from your dashboard.
      </p>

      <div className="mt-8">
        <PlaygroundClient />
      </div>
    </main>
  );
}
