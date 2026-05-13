import { Link } from "react-router-dom";
import { INCIDENT_LABEL, INCIDENT_SPECTATOR_BG } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { useAuthDraft } from "../context/AuthDraftContext";
import { Btn } from "../components/ui";
import { buildMapsUrlFromPayload } from "../incidents/maps";
import { structuralPayloadToDisplayLines } from "../incidents/structuralLabels";
import { genericIncidentDisplayLines, mapsQueryFromAnyPayload } from "../incidents/spectatorLabels";

function allPayloadDisplayLines(
  incidentKey: IncidentKey | null,
  payload: Record<string, unknown>
): { label: string; value: string }[] {
  if (incidentKey === "incendio_estructural") {
    return structuralPayloadToDisplayLines(payload);
  }
  return genericIncidentDisplayLines(incidentKey, payload);
}

export default function EspectadorPage() {
  const { draft } = useAuthDraft();
  const key = draft.incidentKey;
  const bg = key ? INCIDENT_SPECTATOR_BG[key] : "bg-white border-slate-200";
  const mapsUrl = key ? buildMapsUrlFromPayload(draft.payload) : null;
  const mapsQuery = key ? mapsQueryFromAnyPayload(draft.payload) : null;

  const lines = allPayloadDisplayLines(key, draft.payload);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Espectador</h1>
          <p className="text-sm text-slate-600 mt-1">Todos los datos que va rellenando el telefonista, en tiempo real.</p>
        </div>
        <Link to="/menu">
          <Btn variant="secondary">Menú</Btn>
        </Link>
      </div>
      <div className={`rounded-2xl border p-6 shadow-sm ${bg}`}>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs uppercase text-slate-600 font-semibold">Siniestro</p>
            <p className="text-lg font-semibold text-slate-900">{key ? INCIDENT_LABEL[key] : "Sin seleccionar"}</p>
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
            {mapsQuery && (
              <p className="text-xs text-slate-600 mt-2">Búsqueda contextualizada en {mapsQuery}</p>
            )}
          </div>
        )}
        <div className="space-y-2 divide-y divide-slate-200/70">
          {lines.length === 0 && <p className="text-sm text-slate-600">Aún no hay datos rellenados.</p>}
          {lines.map((row, i) => (
            <div key={`${i}-${row.label}`} className="flex flex-col sm:flex-row sm:gap-3 pt-2 first:pt-0">
              <span className="text-xs font-semibold text-slate-600 sm:w-56 shrink-0">{row.label}</span>
              <span className="text-sm text-slate-900 break-words">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
