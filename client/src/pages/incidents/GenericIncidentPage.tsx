import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthDraft } from "../../context/AuthDraftContext";
import { Btn, Label, SectionTitle } from "../../components/ui";
import { INCIDENT_LABEL, type IncidentKey } from "../../incidents/types";
import { apiSaveCall } from "../../api";
import { ContactosTelefono } from "../../components/ContactosTelefono";
import { UbicacionFields } from "../../components/UbicacionFields";
import type { SharedRootFieldsState } from "../../incidents/sharedBasics";
import { mergeSharedRootFromPayload } from "../../incidents/mergeSharedRootFromPayload";
import { buildMapsQueryFromUbicacion, buildMapsUrlFromPayload } from "../../incidents/maps";

export default function GenericIncidentPage({ incidentKey }: { incidentKey: IncidentKey }) {
  const loc = useLocation();
  const callTime = (loc.state as { callTime?: string } | null)?.callTime ?? new Date().toISOString();
  const nav = useNavigate();
  const { publishDraft, clearDraft } = useAuthDraft();
  const [form, setForm] = useState<SharedRootFieldsState>(() => mergeSharedRootFromPayload({}));
  const [savedId, setSavedId] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const payload = useMemo(() => ({ ...form }), [form]);
  const mapsUrl = useMemo(() => buildMapsUrlFromPayload(payload as Record<string, unknown>), [payload]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      publishDraft({
        incidentKey,
        callTime,
        payload: payload as Record<string, unknown>,
      });
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [payload, callTime, incidentKey, publishDraft]);

  function patch<K extends keyof SharedRootFieldsState>(k: K, v: SharedRootFieldsState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setMsg(null);
    const clean: Record<string, unknown> = { ...(payload as Record<string, unknown>) };
    delete clean.telefono_alertante;
    delete clean.notas;
    const rec = await apiSaveCall({
      id: savedId,
      incidentKey,
      callTime,
      payload: clean,
    });
    setSavedId(rec.id);
    setMsg("Guardado. Los campos específicos de este siniestro se irán ampliando en versiones posteriores.");
  }

  return (
    <div className="min-h-screen p-6 max-w-2xl mx-auto pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{INCIDENT_LABEL[incidentKey]}</h1>
          <p className="text-sm text-slate-600 mt-1">
            Hora de llamada:{" "}
            <strong>{new Date(callTime).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</strong>
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/t">
            <Btn variant="secondary">Volver</Btn>
          </Link>
          <Btn
            variant="ghost"
            onClick={() => {
              clearDraft();
              nav("/t");
            }}
          >
            Cerrar borrador
          </Btn>
        </div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 mb-6">
        Formulario base común a todos los siniestros. El detalle específico de este tipo se irá ampliando.
      </div>
      {msg && <p className="text-sm text-emerald-800 mb-4">{msg}</p>}

      <div className="space-y-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <SectionTitle>Teléfonos y roles</SectionTitle>
          <ContactosTelefono contactos={form.contactos} onChange={(c) => patch("contactos", c)} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <SectionTitle>Ubicación (Gijón)</SectionTitle>
          <UbicacionFields form={form} patch={(k, v) => patch(k, v as SharedRootFieldsState[typeof k])} />
          {mapsUrl && (
            <div className="mt-2">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
              >
                Abrir en Google Maps
              </a>
              <p className="text-xs text-slate-500 mt-2">
                Texto de búsqueda: {buildMapsQueryFromUbicacion(form) ?? "(complete dirección)"}
              </p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <SectionTitle>Observaciones</SectionTitle>
          <Label>Texto libre (visible en modo espectador)</Label>
          <textarea
            className="w-full min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.observaciones}
            onChange={(e) => patch("observaciones", e.target.value)}
          />
        </section>

        <Btn onClick={save}>Guardar en historial</Btn>
      </div>
    </div>
  );
}
