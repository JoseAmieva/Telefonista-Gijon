import type { ButtonHTMLAttributes, ReactNode } from "react";

export function Btn({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "amber";
  children: ReactNode;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50";
  const styles = {
    primary: "bg-central-navy text-white hover:bg-[#122636] focus-visible:ring-central-navy shadow-sm",
    secondary:
      "bg-white text-central-navy border border-central-border hover:border-central-amber hover:bg-central-amberBg focus-visible:ring-central-amber",
    ghost: "bg-transparent text-central-text hover:bg-central-amberBg focus-visible:ring-central-amber",
    danger: "bg-red-700 text-white hover:bg-red-800 focus-visible:ring-red-600",
    amber: "bg-central-amber text-white hover:bg-[#9a6119] focus-visible:ring-central-amber shadow-sm",
  }[variant];
  return (
    <button type={type} className={`${base} ${styles} ${className}`} {...rest}>
      {children}
    </button>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-central-border pb-2 text-base font-semibold text-central-navy">{children}</h2>
  );
}

export function FieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2">{children}</div>;
}

export function Label({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-central-muted">
      {children}
    </label>
  );
}

const radioChoice =
  "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition";

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
      <legend className="mb-2 text-sm font-medium text-central-text">{label}</legend>
      <div className="flex flex-wrap gap-3">
        {[
          { v: "si", l: "Sí" },
          { v: "no", l: "No" },
        ].map((o) => (
          <label
            key={o.v}
            className={`${radioChoice} ${
              value === o.v
                ? "border-central-navy bg-central-amberBg text-central-navy"
                : "border-central-border bg-[#FAFAF7] hover:border-central-amber"
            }`}
          >
            <input
              type="radio"
              className="accent-central-navy"
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
      <legend className="mb-2 text-sm font-medium text-central-text">{label}</legend>
      <div className="flex flex-col gap-2">
        {options.map((o) => (
          <label
            key={o.value}
            className={`${radioChoice} ${
              value === o.value
                ? "border-central-navy bg-central-amberBg text-central-navy"
                : "border-central-border bg-[#FAFAF7] hover:border-central-amber"
            }`}
          >
            <input
              type="radio"
              className="accent-central-navy"
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
    <aside className="rounded-xl border border-central-amber/30 bg-central-amberBg p-4 text-sm text-[#6b4a12]">
      <p className="mb-2 font-semibold">{title}</p>
      <ul className="list-disc space-y-1 pl-4">
        {items.map((t) => (
          <li key={t}>{t}</li>
        ))}
      </ul>
    </aside>
  );
}
