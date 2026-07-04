import { useNavigate } from "react-router-dom";
import { TELEFONISTA_ROWS, INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { AppShell } from "../components/AppShell";

const pathFor: Record<IncidentKey, string> = {
  incendio_estructural: "/t/incendio-estructural",
  incendio_forestal: "/t/incendio-forestal",
  incendio_vehiculo: "/t/incendio-vehiculo",
  accidente_trafico: "/t/accidente-trafico",
  rescate: "/t/rescate",
  acceso_vivienda: "/t/acceso-vivienda",
  fachadas: "/t/fachadas",
  himenopteros: "/t/himenopteros",
  otros: "/t/otros",
};

export default function TelefonistaHome() {
  const nav = useNavigate();
  function go(key: IncidentKey) {
    const callTime = new Date().toISOString();
    nav(pathFor[key], { state: { callTime } });
  }

  return (
    <AppShell
      wide
      title="Telefonista"
      subtitle="Seleccione el tipo de siniestro. Se registrará la hora de la llamada."
      backTo="/menu"
    >
      <div className="space-y-8">
        {TELEFONISTA_ROWS.map((row, i) => (
          <section key={i}>
            {row.label && (
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-central-muted">{row.label}</p>
            )}
            <div className={`grid gap-3 ${row.keys.length >= 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
              {row.keys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => go(key)}
                  className="rounded-2xl border border-central-border bg-white p-5 text-left shadow-card transition hover:border-central-amber hover:bg-central-amberBg/40 hover:shadow-md"
                >
                  <span className="font-medium text-central-navy">{INCIDENT_LABEL[key]}</span>
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
