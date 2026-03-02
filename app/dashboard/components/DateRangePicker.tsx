import { Calendar } from "lucide-react";

export type DateRangeOption = "24h" | "7d" | "30d" | "all";

interface DateRangePickerProps {
    value: DateRangeOption;
    onChange: (value: DateRangeOption) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
    const options: { value: DateRangeOption; label: string }[] = [
        { value: "24h", label: "Last 24 Hours" },
        { value: "7d", label: "Last 7 Days" },
        { value: "30d", label: "Last 30 Days" },
        { value: "all", label: "All Time" },
    ];

    return (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--bg-primary)] p-1 shadow-sm">
            <div className="pl-2 pr-1 text-[var(--text-muted)]">
                <Calendar className="h-4 w-4" />
            </div>
            {options.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${value === opt.value
                            ? "bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm"
                            : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
                        }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}
