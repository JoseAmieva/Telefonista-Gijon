import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthDraft } from "../context/AuthDraftContext";
import { Btn } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuthDraft();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/menu";
  const [u, setU] = useState("centralita");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(u, p);
      nav(from, { replace: true });
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-100 to-slate-200">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-sm border border-slate-200 p-8">
        <h1 className="text-xl font-semibold text-slate-900">Centralita — Gijón</h1>
        <p className="text-sm text-slate-600 mt-1 mb-6">Acceso para personal autorizado.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none"
              value={u}
              onChange={(e) => setU(e.target.value)}
              autoComplete="username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:ring-2 focus:ring-slate-400 focus:border-slate-400 outline-none"
              value={p}
              onChange={(e) => setP(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {err && <p className="text-sm text-red-700">{err}</p>}
          <Btn type="submit" className="w-full" disabled={busy}>
            {busy ? "Entrando…" : "Entrar"}
          </Btn>
        </form>
        <p className="text-xs text-slate-500 mt-6">
          Entorno de prueba: usuario por defecto <code className="bg-slate-100 px-1 rounded">centralita</code> y
          contraseña <code className="bg-slate-100 px-1 rounded">cambiar123</code> salvo que se configure en el
          servidor.
        </p>
      </div>
    </div>
  );
}
