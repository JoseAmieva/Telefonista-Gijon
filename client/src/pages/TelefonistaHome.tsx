import { Link, useNavigate } from "react-router-dom";
import { TELEFONISTA_ROWS, INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { Btn } from "../components/ui";

const pathFor: Record<IncidentKey, string> = {
  incendio_estructural: "/t/incendio-estructural",
  incendio_forestal: "/t/incendio-forestal",
  incendio_vehiculo: "/t/incendio-vehiculo",
  accidente_trafico: "/t/accidente-trafico",
  rescate: "/t/rescate",
  acceso_vivienda: "/t/acceso-vivienda",
  fachadas: "/t/fachadas",
  helicopteros: "/t/helicopteros",
  otros: "/t/otros",
};

export default function TelefonistaHome() {
  const nav = useNavigate();
  function go(key: IncidentKey) {
    const callTime = new Date().toISOString();
    nav(pathFor[key], { state: { callTime } });
  }

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto pb-24">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Telefonista</h1>
          <p className="text-sm text-slate-600 mt-1">Seleccione el tipo de siniestro. Se fijará la hora de la llamada.</p>
        </div>
        <Link to="/menu">
          <Btn variant="secondary">Menú</Btn>
        </Link>
      </div>
      <div className="space-y-6">
        {TELEFONISTA_ROWS.map((row, i) => (
          <div key={i}>
            {row.label && <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">{row.label}</p>}
            <div className={`grid gap-3 ${row.keys.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {row.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => go(key)}
                  className="rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm hover:border-slate-400 hover:bg-slate-50 transition"
                >
                  <span className="font-medium text-slate-900">{INCIDENT_LABEL[key]}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
