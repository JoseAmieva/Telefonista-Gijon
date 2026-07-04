import { Link } from "react-router-dom";
import { useAuthDraft } from "../context/AuthDraftContext";
import { AppCard, AppShell } from "../components/AppShell";
import { Btn } from "../components/ui";

const MENU_ITEMS = [
  {
    to: "/t",
    title: "Telefonista",
    desc: "Registrar una llamada por tipo de siniestro.",
    accent: "bg-red-50 border-red-200/80 hover:border-red-300",
    dot: "bg-red-500",
  },
  {
    to: "/esp",
    title: "Espectador",
    desc: "Vista operativa en tiempo real: dirección, víctimas y descripción.",
    accent: "bg-sky-50 border-sky-200/80 hover:border-sky-300",
    dot: "bg-sky-500",
  },
  {
    to: "/historial",
    title: "Historial",
    desc: "Consultar o completar llamadas anteriores.",
    accent: "bg-emerald-50 border-emerald-200/80 hover:border-emerald-300",
    dot: "bg-emerald-600",
  },
] as const;

export default function MenuPage() {
  const { logout, user } = useAuthDraft();
  return (
    <AppShell
      title="Menú principal"
      subtitle={user ? `Sesión activa: ${user}` : undefined}
      actions={
        <Btn variant="ghost" onClick={() => logout()}>
          Salir
        </Btn>
      }
    >
      <nav className="flex flex-col gap-4">
        {MENU_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`group rounded-2xl border bg-white p-6 shadow-card transition hover:shadow-md ${item.accent}`}
          >
            <div className="flex items-start gap-4">
              <span className={`mt-1.5 h-3 w-3 shrink-0 rounded-full ${item.dot}`} />
              <div>
                <span className="font-display text-xl font-bold text-central-navy group-hover:text-central-amber transition">
                  {item.title}
                </span>
                <p className="mt-1.5 text-sm text-central-muted leading-relaxed">{item.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </nav>
      <AppCard className="mt-8 text-center text-sm text-central-muted">
        Parque de bomberos de Gijón · centralita de pruebas
      </AppCard>
    </AppShell>
  );
}
