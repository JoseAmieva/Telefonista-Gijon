import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiListCalls } from "../api";
import type { CallRecord } from "../api";
import { INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { AppShell } from "../components/AppShell";

export default function HistorialPage() {
  const [rows, setRows] = useState<CallRecord[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setRows(await apiListCalls());
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    })();
  }, []);

  return (
    <AppShell title="Historial" subtitle="Pulse un registro para ver o editar." backTo="/menu">
      {err && <p className="mb-4 text-sm text-red-700">{err}</p>}
      {!rows && !err && <p className="text-central-muted">Cargando…</p>}
      {rows && rows.length === 0 && <p className="text-central-muted">No hay llamadas guardadas.</p>}
      <ul className="space-y-3">
        {rows?.map((r) => (
          <li key={r.id}>
            <Link
              to={`/historial/${r.id}`}
              className="block rounded-2xl border border-central-border bg-white p-5 shadow-card transition hover:border-central-amber hover:shadow-md"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-central-navy">
                  {INCIDENT_LABEL[r.incidentKey as IncidentKey] ?? r.incidentKey}
                </span>
                <span className="shrink-0 text-xs text-central-muted">
                  {new Date(r.updatedAt).toLocaleString("es-ES")}
                </span>
              </div>
              {r.callTime && (
                <p className="mt-1 text-xs text-central-muted">
                  Hora llamada: {new Date(r.callTime).toLocaleString("es-ES")}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
