type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  message: string;
  className?: string;
}

const styles: Record<AlertVariant, { wrapper: string; icon: string }> = {
  error: {
    wrapper: "bg-red-50 border-red-200 text-red-700",
    icon: "⚠",
  },
  success: {
    wrapper: "bg-green-50 border-green-200 text-green-700",
    icon: "✓",
  },
  warning: {
    wrapper: "bg-amber-50 border-amber-200 text-amber-700",
    icon: "⚡",
  },
  info: {
    wrapper: "bg-blue-50 border-blue-200 text-blue-700",
    icon: "ℹ",
  },
};

export default function Alert({
  variant = "error",
  message,
  className = "",
}: AlertProps) {
  const { wrapper, icon } = styles[variant];

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium",
        wrapper,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="mt-px shrink-0 text-base leading-none">{icon}</span>
      <span>{message}</span>
    </div>
  );
}
