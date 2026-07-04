import { Link } from "react-router-dom";
import { INCIDENT_LABEL, INCIDENT_SPECTATOR_BG } from "../incidents/types";
import { useAuthDraft } from "../context/AuthDraftContext";
import { Btn } from "../components/ui";
import { ubicacionFromPayload } from "../incidents/maps";
import { buildSpectatorSections } from "../incidents/spectatorSections";
import { LocationPreviews } from "../components/LocationPreviews";

function SectionBlock({
  title,
  lines,
  muted,
}: {
  title: string;
  lines: { label: string; value: string }[];
  muted?: boolean;
}) {
  if (lines.length === 0) return null;
  return (
    <section className={muted ? "opacity-80" : undefined}>
      <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">{title}</h3>
      <div className="space-y-2">
        {lines.map((row, i) => (
          <div key={`${title}-${i}-${row.label}`} className="flex flex-col sm:flex-row sm:gap-3">
            <span className="text-xs font-medium text-slate-500 sm:w-48 shrink-0">{row.label}</span>
            <span className={`text-sm break-words ${muted ? "text-slate-700" : "text-slate-900 font-medium"}`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function EspectadorPage() {
  const { draft } = useAuthDraft();
  const key = draft.incidentKey;
  const bg = key ? INCIDENT_SPECTATOR_BG[key] : "bg-white border-slate-200";
  const sections = buildSpectatorSections(key, draft.payload);
  const ubicacion = ubicacionFromPayload(draft.payload);

  return (
    <div className="min-h-screen p-6 max-w-4xl mx-auto pb-16">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Espectador</h1>
          <p className="text-sm text-slate-600 mt-1">Vista operativa en tiempo real (dirección, víctimas, descripción).</p>
        </div>
        <Link to="/menu">
          <Btn variant="secondary">Menú</Btn>
        </Link>
      </div>
      <div className={`rounded-2xl border p-6 shadow-sm space-y-8 ${bg}`}>
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase text-slate-600 font-semibold">Tipo de siniestro</p>
            <p className="text-2xl font-bold text-slate-900">{key ? INCIDENT_LABEL[key] : "Sin seleccionar"}</p>
          </div>
          {draft.callTime && (
            <div className="text-right">
              <p className="text-xs uppercase text-slate-600 font-semibold">Hora llamada</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(draft.callTime).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
              </p>
            </div>
          )}
        </header>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-600 mb-2">Dirección</h3>
          <p className="text-lg font-semibold text-slate-900 leading-snug">{sections.address.summary}</p>
          {sections.address.details.length > 0 && (
            <div className="mt-2 space-y-1">
              {sections.address.details.map((row, i) => (
                <p key={i} className="text-sm text-slate-700">
                  <span className="text-slate-500">{row.label}: </span>
                  {row.value}
                </p>
              ))}
            </div>
          )}
          <div className="mt-4">
            <LocationPreviews ubicacion={ubicacion} />
          </div>
        </section>

        <SectionBlock title="Víctimas / personas afectadas" lines={sections.victims} />

        <SectionBlock title="Descripción del siniestro" lines={sections.description} />

        <SectionBlock title="Contactos" lines={sections.contacts} muted />

        {!key && (
          <p className="text-sm text-slate-600">Seleccione un tipo de siniestro en modo telefonista para empezar.</p>
        )}
      </div>
    </div>
  );
}
