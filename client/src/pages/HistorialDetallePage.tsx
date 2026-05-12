import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiGetCall, apiSaveCall } from "../api";
import type { CallRecord } from "../api";
import { Btn } from "../components/ui";
import { INCIDENT_LABEL } from "../incidents/types";
import type { IncidentKey } from "../incidents/types";
import { IncendioEstructuralEditor } from "./incidents/IncendioEstructuralPage";
import { emptyStructuralForm, type StructuralFormState } from "../incidents/structuralTypes";

function GenericHistorialEditor({ call }: { call: CallRecord }) {
  const [telefono, setTelefono] = useState(String(call.payload.telefono_alertante ?? ""));
  const [notas, setNotas] = useState(String(call.payload.notas ?? ""));
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);
    await apiSaveCall({
      id: call.id,
      incidentKey: call.incidentKey,
      callTime: call.callTime,
      payload: { ...call.payload, telefono_alertante: telefono, notas },
    });
    setMsg("Actualizado.");
  }

  return (
    <div className="space-y-4">
      {msg && <p className="text-sm text-emerald-800">{msg}</p>}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas</label>
        <textarea
          className="w-full min-h-[120px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
        />
      </div>
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
    const merged: StructuralFormState = {
      ...emptyStructuralForm(),
      ...(call.payload as StructuralFormState),
    };
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
