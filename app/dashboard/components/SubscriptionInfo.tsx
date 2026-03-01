"use client";

interface SubscriptionInfoProps {
  plan: string;
  dailyLimit: number;
}

export function SubscriptionInfo({ plan, dailyLimit }: SubscriptionInfoProps) {
  const isPAYG = plan.toLowerCase() === "payg";

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="inline-flex items-center rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-semibold text-[var(--accent)]">
          {isPAYG ? "Pay-as-you-go" : `Monthly \u2022 ${plan}`}
        </span>
        {!isPAYG && (
          <span className="text-[var(--text-muted)]">
            Daily quota: {dailyLimit} credits
          </span>
        )}
      </div>
    </div>
  );
}
