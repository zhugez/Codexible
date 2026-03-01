interface SkeletonLoaderProps {
  variant?: "text" | "text-sm" | "stat-value" | "chart";
  className?: string;
}

export function SkeletonLoader({ variant = "text", className = "" }: SkeletonLoaderProps) {
  const variantStyles = {
    text: "h-4 w-full",
    "text-sm": "h-3 w-3/4",
    "stat-value": "h-8 w-24",
    chart: "h-48 w-full",
  };

  return (
    <div
      className={`skeleton ${variantStyles[variant]} ${className}`}
      aria-hidden="true"
    />
  );
}
