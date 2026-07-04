import { INCIDENT_LABEL, INCIDENT_SPECTATOR_BG } from "../incidents/types";
import { useAuthDraft } from "../context/AuthDraftContext";
import { AppShell } from "../components/AppShell";
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
    <section className={muted ? "opacity-85" : undefined}>
      <h3 className="mb-3 text-[10px] font-bold uppercase tracking-widest text-central-muted">{title}</h3>
      <div className="space-y-2.5 rounded-xl border border-central-border/60 bg-white/60 p-4">
        {lines.map((row, i) => (
          <div key={`${title}-${i}-${row.label}`} className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
            <span className="shrink-0 text-xs font-medium text-central-muted sm:w-44">{row.label}</span>
            <span className={`text-sm break-words ${muted ? "text-central-muted" : "font-medium text-central-navy"}`}>
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
  const bg = key ? INCIDENT_SPECTATOR_BG[key] : "bg-white";
  const sections = buildSpectatorSections(key, draft.payload);
  const ubicacion = ubicacionFromPayload(draft.payload);

  return (
    <AppShell
      wide
      title="Espectador"
      subtitle="Vista operativa en tiempo real para el parque."
      backTo="/menu"
    >
      <div className={`rounded-2xl border border-central-border p-6 shadow-card space-y-8 ${bg}`}>
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-central-border/50 pb-6">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-central-muted">Tipo de siniestro</p>
            <p className="font-display mt-1 text-3xl font-bold text-central-navy">
              {key ? INCIDENT_LABEL[key] : "Sin seleccionar"}
            </p>
          </div>
          {draft.callTime && (
            <div className="rounded-xl bg-white/70 px-4 py-2 text-right border border-central-border/50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-central-muted">Hora llamada</p>
              <p className="text-sm font-semibold text-central-navy">
                {new Date(draft.callTime).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
              </p>
            </div>
          )}
        </header>

        <section>
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-widest text-central-muted">Dirección</h3>
          <p className="font-display text-xl font-bold leading-snug text-central-navy">{sections.address.summary}</p>
          {sections.address.details.length > 0 && (
            <div className="mt-2 space-y-1">
              {sections.address.details.map((row, i) => (
                <p key={i} className="text-sm text-central-text">
                  <span className="text-central-muted">{row.label}: </span>
                  {row.value}
                </p>
              ))}
            </div>
          )}
          <div className="mt-5">
            <LocationPreviews ubicacion={ubicacion} />
          </div>
        </section>

        <SectionBlock title="Víctimas / personas afectadas" lines={sections.victims} />
        <SectionBlock title="Descripción del siniestro" lines={sections.description} />
        <SectionBlock title="Contactos" lines={sections.contacts} muted />

        {!key && (
          <p className="text-sm text-central-muted">Seleccione un tipo de siniestro en modo telefonista para empezar.</p>
        )}
      </div>
    </AppShell>
  );
}
