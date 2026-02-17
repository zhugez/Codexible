interface MetricCardProps {
  label: string;
  value: string;
}

/**
 * Displays a metric with label and value
 */
export function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-[#e4e9f0] bg-white px-4 py-3">
      <p className="text-xs text-[#667085]">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#101828]">{value}</p>
    </div>
  );
}
