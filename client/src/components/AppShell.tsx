import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type AppShellProps = {
  title: string;
  subtitle?: string;
  backTo?: string;
  backLabel?: string;
  actions?: ReactNode;
  children: ReactNode;
  wide?: boolean;
};

export function AppShell({ title, subtitle, backTo, backLabel = "Menú", actions, children, wide }: AppShellProps) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 pb-20">
      <div className={`mx-auto ${wide ? "max-w-5xl" : "max-w-3xl"}`}>
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 inline-flex items-center rounded-full bg-central-navy px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
              Centralita Gijón
            </p>
            <h1 className="font-display text-3xl font-bold text-central-navy sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-central-muted leading-relaxed">{subtitle}</p>}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {backTo && (
              <Link
                to={backTo}
                className="inline-flex items-center rounded-xl border border-central-border bg-white px-4 py-2.5 text-sm font-medium text-central-navy shadow-sm transition hover:border-central-amber hover:bg-central-amberBg"
              >
                {backLabel}
              </Link>
            )}
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}

export function AppCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-central-border bg-white p-6 shadow-card ${className}`}>
      {children}
    </div>
  );
}
