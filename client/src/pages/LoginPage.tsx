import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthDraft } from "../context/AuthDraftContext";
import { AppCard } from "../components/AppShell";
import { Btn } from "../components/ui";

export default function LoginPage() {
  const { login } = useAuthDraft();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from ?? "/menu";
  const [u, setU] = useState("user1");
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
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <p className="mb-3 inline-flex rounded-full bg-central-navy px-4 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white">
            Bomberos Gijón
          </p>
          <h1 className="font-display text-4xl font-bold text-central-navy">Centralita</h1>
          <p className="mt-2 text-sm text-central-muted">Acceso para personal autorizado</p>
        </div>
        <AppCard>
          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-central-muted">
                Usuario
              </label>
              <input value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-central-muted">
                Contraseña
              </label>
              <input
                type="password"
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
          <p className="mt-6 text-xs leading-relaxed text-central-muted">
            Entorno de prueba: <code className="rounded bg-central-amberBg px-1">user1</code> /{" "}
            <code className="rounded bg-central-amberBg px-1">user1</code>
          </p>
        </AppCard>
      </div>
    </div>
  );
}
