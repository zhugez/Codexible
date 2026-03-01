interface MetricCardProps {
  label: string;
  value: string;
}

/**
 * Displays a metric with label and value
 */
export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] px-4 py-3">
      <p className="text-xs text-[var(--text-muted)]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
