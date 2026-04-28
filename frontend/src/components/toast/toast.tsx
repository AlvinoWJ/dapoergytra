"use client";

import { useEffect, useRef, useState } from "react";

export type ToastVariant = "error" | "success" | "warning" | "info";

export interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
  duration?: number;
}

const config: Record<
  ToastVariant,
  { bar: string; icon: React.ReactNode; label: string }
> = {
  error: {
    bar: "bg-red-500",
    label: "Error",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 4.5V8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  success: {
    bar: "bg-emerald-500",
    label: "Berhasil",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M5 8l2 2 4-4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  warning: {
    bar: "bg-amber-400",
    label: "Peringatan",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path
          d="M8 2L14.5 13H1.5L8 2Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M8 6.5V9.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
  info: {
    bar: "bg-sky-500",
    label: "Info",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M8 7v4"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="8" cy="5" r="0.75" fill="currentColor" />
      </svg>
    ),
  },
};

const iconColor: Record<ToastVariant, string> = {
  error: "text-red-500",
  success: "text-emerald-500",
  warning: "text-amber-500",
  info: "text-sky-500",
};

/* ── Component ── */
interface ToastProps {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

export default function Toast({ toast, onDismiss }: ToastProps) {
  const { id, message, variant, duration = 4000 } = toast;
  const { bar, icon, label } = config[variant];

  const [visible, setVisible] = useState(false);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div
      role="alert"
      aria-label={label}
      className={[
        "pointer-events-auto relative w-80 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg shadow-slate-200/60 transition-all duration-300",
        visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      ].join(" ")}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={["mt-px shrink-0", iconColor[variant]].join(" ")}>
          {icon}
        </span>

        {/* Message */}
        <p className="flex-1 text-sm leading-snug text-slate-700">{message}</p>

        {/* Dismiss button */}
        <button
          onClick={() => onDismiss(id)}
          aria-label="Tutup notifikasi"
          className="shrink-0 rounded-md p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 3l8 8M11 3l-8 8"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Progress bar — shrinks over `duration` ms */}
      <div className="h-0.5 w-full bg-slate-100">
        <div
          className={["h-full origin-left", bar].join(" ")}
          style={{
            animation: `toast-shrink ${duration}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes toast-shrink {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>
    </div>
  );
}
