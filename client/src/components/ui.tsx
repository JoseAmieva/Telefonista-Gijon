import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Btn({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  const styles = {
    primary: "bg-slate-800 text-white hover:bg-slate-900 focus-visible:ring-slate-700",
    secondary: "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-400",
    ghost: "bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400",
    danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
  }[variant];
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-semibold text-slate-800 border-b border-slate-200 pb-2 mb-4">{children}</h2>;
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 mb-1.5">
      {children}
    </label>
  );
}

export function RadioYesNo({
  name,
  value,
  onChange,
  label,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700 mb-2">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {[
          { v: "si", l: "Sí" },
          { v: "no", l: "No" },
        ].map((o) => (
          <label
            key={o.v}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              value === o.v ? "border-slate-800 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              className="accent-slate-800"
              name={name}
              checked={value === o.v}
              onChange={() => onChange(o.v)}
            />
            {o.l}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function RadioList({
  name,
  value,
  onChange,
  label,
  options,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium text-slate-700 mb-2">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
              value === o.value ? "border-slate-800 bg-slate-100" : "border-slate-200 bg-white hover:border-slate-300"
            }`}
          >
            <input
              type="radio"
              className="accent-slate-800"
              name={name}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
            />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function TipBox({ title, items }: { title: string; items: string[] }) {
  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
      <p className="font-semibold mb-2">{title}</p>
      <ul className="list-disc space-y-1 pl-4">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}
