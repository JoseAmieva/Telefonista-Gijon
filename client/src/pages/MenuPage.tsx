import { Link } from "react-router-dom";
import { useAuthDraft } from "../context/AuthDraftContext";
import { Btn } from "../components/ui";

export default function MenuPage() {
  const { logout, user } = useAuthDraft();
  return (
    <div className="min-h-screen p-6 max-w-lg mx-auto">
      <header className="flex items-start justify-between gap-4 mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Menú principal</h1>
          {user && <p className="text-sm text-slate-600 mt-1">Sesión: {user}</p>}
        </div>
        <Btn variant="ghost" onClick={() => logout()}>
          Salir
        </Btn>
      </header>
      <nav className="flex flex-col gap-3">
        <Link
          to="/t"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
        >
          <span className="text-lg font-medium text-slate-900">Telefonista</span>
          <p className="text-sm text-slate-600 mt-1">Registrar una llamada por tipo de siniestro.</p>
        </Link>
        <Link
          to="/esp"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
        >
          <span className="text-lg font-medium text-slate-900">Espectador</span>
          <p className="text-sm text-slate-600 mt-1">Ver en tiempo real lo que rellena el telefonista.</p>
        </Link>
        <Link
          to="/historial"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 transition"
        >
          <span className="text-lg font-medium text-slate-900">Historial</span>
          <p className="text-sm text-slate-600 mt-1">Consultar o completar llamadas anteriores.</p>
        </Link>
      </nav>
    </div>
  );
}
