import { Link } from "react-router-dom";
import { INCIDENT_LABEL, INCIDENT_SPECTATOR_BG } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { useAuthDraft } from "../context/AuthDraftContext";
import { Btn } from "../components/ui";
import { buildMapsUrlFromStructural, buildMapsQueryFromStructural } from "../incidents/maps";
import type { StructuralFormState } from "../incidents/structuralTypes";
import { emptyStructuralForm } from "../incidents/structuralTypes";

function payloadToStructural(p: Record<string, unknown>): StructuralFormState {
  const e = emptyStructuralForm();
  return { ...e, ...(p as StructuralFormState) };
}

function summarizePayload(incidentKey: IncidentKey | null, payload: Record<string, unknown>) {
  const lines: { k: string; v: string }[] = [];
  const skip = new Set(["_raw", "_formVersion"]);
  for (const [k, val] of Object.entries(payload)) {
    if (skip.has(k)) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    lines.push({ k, v: String(val) });
  }
  if (incidentKey === "incendio_estructural") {
    const st = payloadToStructural(payload);
    const ordered: { label: string; value: string }[] = [
      { label: "Teléfono alertante", value: st.telefono_alertante },
      { label: "Zona", value: st.ubicacion_zona === "urbana" ? "Urbana" : st.ubicacion_zona === "rural" ? "Rural" : "" },
      { label: "Tipo estructura", value: st.tipo_estructura },
      { label: "Identificación alertante", value: st.identificacion_alertante },
    ];
    return ordered.filter((x) => x.value);
  }
  return lines.slice(0, 24).map((x) => ({ label: x.k, value: x.v }));
}

export default function EspectadorPage() {
  const { draft } = useAuthDraft();
  const key = draft.incidentKey;
  const bg = key ? INCIDENT_SPECTATOR_BG[key] : "bg-white border-slate-200";
  const mapsUrl =
    key === "incendio_estructural"
      ? buildMapsUrlFromStructural(payloadToStructural(draft.payload))
      : null;

  const summary = summarizePayload(key, draft.payload);

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Espectador</h1>
          <p className="text-sm text-slate-600 mt-1">Vista resumida en tiempo real.</p>
        </div>
        <Link to="/menu">
          <Btn variant="secondary">Menú</Btn>
        </Link>
      </div>
      <div className={`rounded-2xl border p-6 shadow-sm ${bg}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase text-slate-600 font-semibold">Siniestro</p>
            <p className="text-lg font-semibold text-slate-900">{key ? INCIDENT_LABEL[key] : "—"}</p>
          </div>
          {draft.callTime && (
            <div className="text-right">
              <p className="text-xs uppercase text-slate-600 font-semibold">Hora llamada</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(draft.callTime).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
              </p>
            </div>
          )}
        </div>
        {mapsUrl && (
          <div className="mb-4">
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Abrir en Google Maps
            </a>
            <p className="text-xs text-slate-600 mt-2">
              Búsqueda contextualizada en {buildMapsQueryFromStructural(payloadToStructural(draft.payload))}
            </p>
          </div>
        )}
        <div className="space-y-2">
          {summary.length === 0 && <p className="text-sm text-slate-600">Aún no hay datos rellenados.</p>}
          {summary.map((row) => (
            <div key={row.label} className="flex flex-col sm:flex-row sm:gap-3 border-t border-slate-200/60 pt-2 first:border-0 first:pt-0">
              <span className="text-xs font-semibold text-slate-600 sm:w-44 shrink-0">{row.label}</span>
              <span className="text-sm text-slate-900">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
