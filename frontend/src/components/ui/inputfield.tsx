"use client";

import { InputHTMLAttributes, forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: React.ReactNode;
  rightLabel?: React.ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    { label, error, hint, rightLabel, id, type, className = "", ...props },
    ref,
  ) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

    const [showpassword, setShowPassword] = useState(false);

    const ispassword = type === "password";
    const inputtype = ispassword && showpassword ? "text" : type;

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label row */}
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
          {rightLabel && <span className="text-xs">{rightLabel}</span>}
        </div>

        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={[
              "w-full rounded-xl border bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder-slate-300 outline-none transition-all duration-150",
              "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
              ispassword ? "pr-12" : "",
              error
                ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                : "border-slate-200",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />
          {ispassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showpassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition-colors"
              tabIndex={-1}
            >
              {showpassword ? (
                <EyeOff size={20} strokeWidth={1.5} />
              ) : (
                <Eye size={20} strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>

        {/* Error or hint */}
        {error ? (
          <p className="text-xs text-red-500">{error}</p>
        ) : hint ? (
          <p className="text-xs text-slate-400">{hint}</p>
        ) : null}
      </div>
    );
  },
);

InputField.displayName = "InputField";

export default InputField;
