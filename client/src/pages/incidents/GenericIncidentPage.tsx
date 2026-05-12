import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthDraft } from "../../context/AuthDraftContext";
import { Btn, FieldGrid, Label, SectionTitle } from "../../components/ui";
import { INCIDENT_LABEL } from "../../incidents/types";
import type { IncidentKey } from "../../incidents/types";
import { apiSaveCall } from "../../api";

export default function GenericIncidentPage({ incidentKey }: { incidentKey: IncidentKey }) {
  const loc = useLocation();
  const callTime = (loc.state as { callTime?: string } | null)?.callTime ?? new Date().toISOString();
  const nav = useNavigate();
  const { publishDraft, clearDraft } = useAuthDraft();
  const [telefono, setTelefono] = useState("");
  const [notas, setNotas] = useState("");
  const [savedId, setSavedId] = useState<string | undefined>();
  const [msg, setMsg] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      publishDraft({
        incidentKey,
        callTime,
        payload: { telefono_alertante: telefono, notas },
      });
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [telefono, notas, callTime, incidentKey, publishDraft]);

  async function save() {
    setMsg(null);
    const rec = await apiSaveCall({
      id: savedId,
      incidentKey,
      callTime,
      payload: { telefono_alertante: telefono, notas },
    });
    setSavedId(rec.id);
    setMsg("Guardado. Los campos específicos de este siniestro se irán añadiendo en versiones posteriores.");
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
        Formulario ampliado en desarrollo. Por ahora puede guardar teléfono y notas libres.
      </div>
      {msg && <p className="text-sm text-emerald-800 mb-4">{msg}</p>}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <SectionTitle>Datos básicos</SectionTitle>
        <FieldGrid>
          <div className="sm:col-span-2">
            <Label>Teléfono del alertante</Label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              inputMode="tel"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Notas / datos provisionales</Label>
            <textarea
              className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />
          </div>
        </FieldGrid>
        <Btn onClick={save}>Guardar en historial</Btn>
      </section>
    </div>
  );
}
