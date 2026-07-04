import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetCall, apiSaveCall } from "../api";
import type { CallRecord } from "../api";
import { Btn, Label, SectionTitle } from "../components/ui";
import { ContactosTelefono } from "../components/ContactosTelefono";
import { UbicacionFields } from "../components/UbicacionFields";
import { GenericIncidentSpecificSections } from "../components/GenericIncidentSpecificSections";
import { INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { IncendioEstructuralEditor } from "./incidents/IncendioEstructuralPage";
import { mergeStructuralInitial } from "../incidents/mergeStructuralInitial";
import type { StructuralFormState } from "../incidents/structuralTypes";
import type { SharedRootFieldsState } from "../incidents/sharedBasics";
import type { GenericExtendedFormState } from "../incidents/genericExtendedForm";
import { mergeGenericExtendedFromPayload } from "../incidents/genericExtendedForm";
import { buildMapsQueryFromUbicacion } from "../incidents/maps";
import { LocationLinks } from "../components/LocationLinks";

function GenericHistorialEditor({ call }: { call: CallRecord }) {
  const [form, setForm] = useState<GenericExtendedFormState>(() =>
    mergeGenericExtendedFromPayload(call.payload as Record<string, unknown>)
  );
  const [msg, setMsg] = useState<string | null>(null);

  const key = call.incidentKey as IncidentKey;

  function patch<K extends keyof SharedRootFieldsState>(k: K, v: SharedRootFieldsState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function save() {
    setMsg(null);
    const base = { ...(call.payload as Record<string, unknown>) };
    delete base.telefono_alertante;
    delete base.notas;
    await apiSaveCall({
      id: call.id,
      incidentKey: call.incidentKey,
      callTime: call.callTime,
      payload: { ...base, ...(form as Record<string, unknown>) },
    });
    setMsg("Actualizado.");
  }

  return (
    <div className="space-y-8">
      {msg && <p className="text-sm text-emerald-800">{msg}</p>}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <SectionTitle>Teléfonos y roles</SectionTitle>
        <ContactosTelefono contactos={form.contactos} onChange={(c) => patch("contactos", c)} />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <SectionTitle>Ubicación (Gijón)</SectionTitle>
        <UbicacionFields
          form={form}
          patch={(k, v) => patch(k as keyof SharedRootFieldsState, v as SharedRootFieldsState[keyof SharedRootFieldsState])}
        />
        <LocationLinks ubicacion={form} />
        <p className="text-xs text-slate-500 mt-1">
          Búsqueda: {buildMapsQueryFromUbicacion(form) ?? "(complete dirección)"}
        </p>
      </section>

      <GenericIncidentSpecificSections incidentKey={key} form={form} setForm={setForm} />

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <SectionTitle>Observaciones</SectionTitle>
        <Label>Texto libre (visible en modo espectador)</Label>
        <textarea
          className="w-full min-h-[140px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.observaciones}
          onChange={(e) => patch("observaciones", e.target.value)}
        />
      </section>

      <Btn onClick={save}>Guardar cambios</Btn>
    </div>
  );
}

export default function HistorialDetallePage() {
  const { id } = useParams();
  const [call, setCall] = useState<CallRecord | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setCall(await apiGetCall(id));
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Error");
      }
    })();
  }, [id]);

  if (err) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <p className="text-red-700">{err}</p>
        <Link to="/historial" className="text-slate-700 underline mt-4 inline-block">
          Volver
        </Link>
      </div>
    );
  }

  if (!call) {
    return <div className="p-6 text-slate-600">Cargando…</div>;
  }

  const key = call.incidentKey as IncidentKey;

  if (key === "incendio_estructural") {
    const merged = mergeStructuralInitial(call.payload as Partial<StructuralFormState>);
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex justify-between gap-3 mb-4">
          <Link to="/historial">
            <Btn variant="secondary">Historial</Btn>
          </Link>
          <Link to="/menu">
            <Btn variant="ghost">Menú</Btn>
          </Link>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Editando: <strong>{INCIDENT_LABEL[key]}</strong> — {new Date(call.updatedAt).toLocaleString("es-ES")}
        </p>
        <IncendioEstructuralEditor
          callTime={call.callTime ?? call.createdAt}
          savedCallId={call.id}
          initial={merged}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex justify-between gap-3">
        <Link to="/historial">
          <Btn variant="secondary">Historial</Btn>
        </Link>
        <Link to="/menu">
          <Btn variant="ghost">Menú</Btn>
        </Link>
      </div>
      <h1 className="text-2xl font-semibold text-slate-900">{INCIDENT_LABEL[key]}</h1>
      <GenericHistorialEditor call={call} />
    </div>
  );
}
