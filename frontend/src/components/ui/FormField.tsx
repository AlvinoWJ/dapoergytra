import React from "react";

interface FormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}

export function FormField({
  label,
  error,
  children,
  required,
  optional,
}: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && (
          <span className="font-normal text-slate-400"> (Opsional)</span>
        )}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function InputField({
  label,
  error,
  required,
  className,
  ...props
}: InputFieldProps) {
  const inputCls = [
    "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all",
    "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
    error ? "border-red-300" : "border-slate-200",
    className,
  ].join(" ");

  return (
    <FormField label={label} error={error} required={required}>
      <input className={inputCls} {...props} />
    </FormField>
  );
}

interface SelectFieldProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string | number; label: string }[];
}

export function SelectField({
  label,
  error,
  required,
  options,
  className,
  ...props
}: SelectFieldProps) {
  const selectCls = [
    "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all",
    "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
    error ? "border-red-300" : "border-slate-200",
    className,
  ].join(" ");

  return (
    <FormField label={label} error={error} required={required}>
      <select className={selectCls} {...props}>
        <option value="">
          {options?.length === 0 ? "Tidak ada data" : `Pilih ${label.toLowerCase()}`}
        </option>
        {Array.isArray(options) && options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FormField>
  );
}

interface TextareaFieldProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  optional?: boolean;
}

export function TextareaField({
  label,
  error,
  optional,
  className,
  ...props
}: TextareaFieldProps) {
  const textareaCls = [
    "w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all",
    "focus:border-red-400 focus:bg-white focus:ring-1 focus:ring-red-200",
    error ? "border-red-300" : "border-slate-200",
    className,
  ].join(" ");

  return (
    <FormField label={label} error={error} optional={optional}>
      <textarea className={textareaCls} {...props} />
    </FormField>
  );
}
