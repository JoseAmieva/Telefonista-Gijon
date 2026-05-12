import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiListCalls } from "../api";
import type { CallRecord } from "../api";
import { INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { Btn } from "../components/ui";

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
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Historial</h1>
          <p className="text-sm text-slate-600 mt-1">Pulse un registro para ver o editar.</p>
        </div>
        <Link to="/menu">
          <Btn variant="secondary">Menú</Btn>
        </Link>
      </div>
      {err && <p className="text-red-700 text-sm mb-4">{err}</p>}
      {!rows && !err && <p className="text-slate-600">Cargando…</p>}
      {rows && rows.length === 0 && <p className="text-slate-600">No hay llamadas guardadas.</p>}
      <ul className="space-y-2">
        {rows?.map((r) => (
          <li key={r.id}>
            <Link
              to={`/historial/${r.id}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-400 transition"
            >
              <div className="flex justify-between gap-2">
                <span className="font-medium text-slate-900">
                  {INCIDENT_LABEL[r.incidentKey as IncidentKey] ?? r.incidentKey}
                </span>
                <span className="text-xs text-slate-500 shrink-0">
                  {new Date(r.updatedAt).toLocaleString("es-ES")}
                </span>
              </div>
              {r.callTime && (
                <p className="text-xs text-slate-600 mt-1">
                  Hora llamada: {new Date(r.callTime).toLocaleString("es-ES")}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
