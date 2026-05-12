import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthDraft } from "../../context/AuthDraftContext";
import { Btn, FieldGrid, Label, RadioList, RadioYesNo, SectionTitle, TipBox } from "../../components/ui";
import { CHULETA_AUTOPROTECCION_QUEDARSE, CHULETA_AUTOPROTECCION_SALIR } from "../../incidents/tips";
import { buildMapsUrlFromStructural } from "../../incidents/maps";
import { emptyStructuralForm, type StructuralFormState } from "../../incidents/structuralTypes";
import { apiSaveCall } from "../../api";

type Props = {
  callTime: string;
  savedCallId?: string;
  initial?: Partial<StructuralFormState>;
};

export default function IncendioEstructuralPage() {
  const loc = useLocation();
  const callTime = (loc.state as { callTime?: string } | null)?.callTime ?? new Date().toISOString();
  return <StructuralForm callTime={callTime} />;
}

export function IncendioEstructuralEditor({ callTime, savedCallId, initial }: Props) {
  return <StructuralForm callTime={callTime} savedCallId={savedCallId} initial={initial} />;
}

function StructuralForm({ callTime, savedCallId, initial }: Props) {
  const nav = useNavigate();
  const { publishDraft, clearDraft } = useAuthDraft();
  const [form, setForm] = useState<StructuralFormState>(() => ({ ...emptyStructuralForm(), ...initial }));
  const [savedId, setSavedId] = useState<string | undefined>(savedCallId);
  const [msg, setMsg] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mapsUrl = useMemo(() => buildMapsUrlFromStructural(form), [form]);

  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      publishDraft({
        incidentKey: "incendio_estructural",
        callTime,
        payload: { ...form, _formVersion: 1 },
      });
    }, 200);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [form, callTime, publishDraft]);

  function patch<K extends keyof StructuralFormState>(k: K, v: StructuralFormState[K]) {
    setForm((f: StructuralFormState) => ({ ...f, [k]: v }));
  }

  async function save() {
    setMsg(null);
    const rec = await apiSaveCall({
      id: savedId,
      incidentKey: "incendio_estructural",
      callTime,
      payload: { ...form },
    });
    setSavedId(rec.id);
    setMsg("Guardado correctamente.");
  }

  function finish() {
    clearDraft();
    nav("/t");
  }

  const id = form.identificacion_alertante;

  return (
    <div className="min-h-screen p-6 max-w-3xl mx-auto pb-32">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Incendio estructural</h1>
          <p className="text-sm text-slate-600 mt-1">
            Hora de llamada:{" "}
            <strong>{new Date(callTime).toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</strong>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/t">
            <Btn variant="secondary">Volver</Btn>
          </Link>
          <Btn onClick={save}>Guardar en historial</Btn>
          <Btn variant="ghost" onClick={finish}>
            Cerrar borrador
          </Btn>
        </div>
      </div>
      {msg && <p className="text-sm text-emerald-800 mb-4">{msg}</p>}

      <div className="space-y-10">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle>Datos generales</SectionTitle>
          <FieldGrid>
            <div className="sm:col-span-2">
              <Label>Teléfono del alertante</Label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.telefono_alertante}
                onChange={(e) => patch("telefono_alertante", e.target.value)}
                inputMode="tel"
              />
            </div>
          </FieldGrid>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle>Ubicación (Gijón)</SectionTitle>
          <RadioList
            name="zona"
            label="Zona"
            value={form.ubicacion_zona}
            onChange={(v: string) => patch("ubicacion_zona", v as StructuralFormState["ubicacion_zona"])}
            options={[
              { value: "urbana", label: "Zona urbana" },
              { value: "rural", label: "Zona rural" },
            ]}
          />
          {form.ubicacion_zona === "urbana" && (
            <div className="mt-4 space-y-3">
              <FieldGrid>
                <div>
                  <Label>Calle</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_calle}
                    onChange={(e) => patch("urb_calle", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Portal</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_portal}
                    onChange={(e) => patch("urb_portal", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Piso</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_piso}
                    onChange={(e) => patch("urb_piso", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Puerta</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_puerta}
                    onChange={(e) => patch("urb_puerta", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Barrio</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_barrio}
                    onChange={(e) => patch("urb_barrio", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Calle aneja</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.urb_calle_aneja}
                    onChange={(e) => patch("urb_calle_aneja", e.target.value)}
                  />
                </div>
              </FieldGrid>
            </div>
          )}
          {form.ubicacion_zona === "rural" && (
            <div className="mt-4 space-y-3">
              <FieldGrid>
                <div className="sm:col-span-2">
                  <Label>Nombre de vía</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.rur_via}
                    onChange={(e) => patch("rur_via", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Parroquia</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.rur_parroquia}
                    onChange={(e) => patch("rur_parroquia", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Vía aneja</Label>
                  <input
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    value={form.rur_via_aneja}
                    onChange={(e) => patch("rur_via_aneja", e.target.value)}
                  />
                </div>
              </FieldGrid>
            </div>
          )}
          {mapsUrl && (
            <div className="mt-4">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-lg bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
              >
                Abrir dirección en Google Maps
              </a>
              <p className="text-xs text-slate-500 mt-2">La búsqueda se contextualiza siempre en Gijón, Asturias.</p>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle>Tipo de estructura incendiada</SectionTitle>
          <RadioList
            name="tipo_est"
            label="Selección"
            value={form.tipo_estructura}
            onChange={(v: string) => patch("tipo_estructura", v as StructuralFormState["tipo_estructura"])}
            options={[
              { value: "piso", label: "Piso" },
              { value: "unifamiliar", label: "Vivienda unifamiliar" },
              { value: "local", label: "Local comercial" },
              { value: "nave", label: "Nave industrial" },
              { value: "garaje", label: "Garaje" },
              { value: "otros", label: "Otros" },
            ]}
          />
          {form.tipo_estructura === "otros" && (
            <div className="mt-3">
              <Label>Especificar</Label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={form.tipo_estructura_otros}
                onChange={(e) => patch("tipo_estructura_otros", e.target.value)}
              />
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionTitle>Identificación del alertante</SectionTitle>
          <RadioList
            name="id_alert"
            label="Quién alerta"
            value={form.identificacion_alertante}
            onChange={(v: string) => patch("identificacion_alertante", v as StructuralFormState["identificacion_alertante"])}
            options={[
              { value: "ocupante", label: "Ocupante de la vivienda / usuario" },
              { value: "vecino_mismo", label: "Vecino del mismo edificio" },
              { value: "vecino_otro", label: "Vecino de otro edificio o transeúnte" },
              { value: "112_sin_alertante", label: "El 112 no puede pasar con el alertante" },
            ]}
          />
        </section>

        {id === "ocupante" && <Ocupante form={form} patch={patch} />}
        {id === "vecino_mismo" && <VecinoMismo form={form} patch={patch} />}
        {id === "vecino_otro" && <VecinoOtro form={form} patch={patch} />}
        {id === "112_sin_alertante" && (
          <p className="text-sm text-slate-600 rounded-xl border border-slate-200 bg-slate-50 p-4">
            Continúe con los datos disponibles vía 112 y complete ubicación y observaciones.
          </p>
        )}
      </div>
    </div>
  );
}

function Ocupante({
  form,
  patch,
}: {
  form: StructuralFormState;
  patch: <K extends keyof StructuralFormState>(k: K, v: StructuralFormState[K]) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <SectionTitle>Ocupante / usuario</SectionTitle>
      <RadioList
        name="oc_hl"
        label="1. ¿Es humo o llama?"
        value={form.oc_humo_o_llama}
        onChange={(v: string) => patch("oc_humo_o_llama", v)}
        options={[
          { value: "humo", label: "Humo" },
          { value: "llama", label: "Llama" },
        ]}
      />
      <div>
        <Label>¿De dónde proviene o qué arde?</Label>
        <textarea
          className="w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.oc_origen}
          onChange={(e) => patch("oc_origen", e.target.value)}
        />
      </div>
      <div>
        <Label>Descripción del problema (si procede)</Label>
        <textarea
          className="w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.oc_descripcion}
          onChange={(e) => patch("oc_descripcion", e.target.value)}
        />
      </div>
      <RadioYesNo name="oc_mas" label="2. ¿Hay más ocupantes en la vivienda?" value={form.oc_mas_ocupantes} onChange={(v: string) => patch("oc_mas_ocupantes", v)} />
      {form.oc_mas_ocupantes === "si" && (
        <div>
          <Label>Número de ocupantes</Label>
          <input
            className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.oc_num_ocupantes}
            onChange={(e) => patch("oc_num_ocupantes", e.target.value)}
          />
        </div>
      )}
      <RadioYesNo
        name="oc_salir"
        label="3. ¿Puede usted y otros ocupantes abandonar la vivienda por sí mismos?"
        value={form.oc_pueden_salir}
        onChange={(v: string) => patch("oc_pueden_salir", v)}
      />
      {form.oc_pueden_salir === "no" && (
        <div className="space-y-3">
          <div>
            <Label>¿Cuántos no pueden salir?</Label>
            <input
              className="w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.oc_cuantos_no_pueden}
              onChange={(e) => patch("oc_cuantos_no_pueden", e.target.value)}
            />
          </div>
          <RadioList
            name="oc_mot"
            label="Motivo"
            value={form.oc_motivo_no_salir}
            onChange={(v: string) => patch("oc_motivo_no_salir", v)}
            options={[
              { value: "atrapamiento", label: "Atrapamiento por el incendio" },
              { value: "movilidad", label: "Movilidad reducida" },
            ]}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TipBox title="Autoprotección — intento de salida" items={CHULETA_AUTOPROTECCION_SALIR} />
            <TipBox title="Autoprotección — quedarse en la vivienda" items={CHULETA_AUTOPROTECCION_QUEDARSE} />
          </div>
        </div>
      )}
      <RadioYesNo name="oc_puerta" label="4. ¿Está la puerta de la vivienda abierta?" value={form.oc_puerta_abierta} onChange={(v: string) => patch("oc_puerta_abierta", v)} />
      {form.oc_puerta_abierta === "no" && (
        <div>
          <Label>Detalle (¿puede abrirla el alertante?, ¿hay más llaves?, ¿vueltas echadas?)</Label>
          <textarea
            className="w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.oc_puerta_detalle}
            onChange={(e) => patch("oc_puerta_detalle", e.target.value)}
          />
        </div>
      )}
      <RadioYesNo
        name="oc_vo"
        label="5. ¿Dan las ventanas a otra fachada distinta del portal?"
        value={form.oc_ventanas_otra_fachada}
        onChange={(v: string) => patch("oc_ventanas_otra_fachada", v)}
      />
      {form.oc_ventanas_otra_fachada === "si" && (
        <div>
          <Label>Nombre de la calle</Label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.oc_ventanas_otra_calle}
            onChange={(e) => patch("oc_ventanas_otra_calle", e.target.value)}
          />
        </div>
      )}
      <RadioYesNo
        name="oc_vp"
        label="6. ¿Dan las ventanas solo a patio interior?"
        value={form.oc_ventanas_solo_patio}
        onChange={(v: string) => patch("oc_ventanas_solo_patio", v)}
      />
    </section>
  );
}

function VecinoMismo({
  form,
  patch,
}: {
  form: StructuralFormState;
  patch: <K extends keyof StructuralFormState>(k: K, v: StructuralFormState[K]) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <SectionTitle>Vecino del mismo edificio</SectionTitle>
      <RadioList
        name="vm_donde"
        label="1. ¿Dónde se encuentra usted?"
        value={form.vm_donde}
        onChange={(v: string) => patch("vm_donde", v)}
        options={[
          { value: "vivienda_propia", label: "En su propia vivienda" },
          { value: "rellano", label: "En el rellano" },
          { value: "vivienda_incendiada", label: "En la vivienda incendiada" },
        ]}
      />
      <RadioList
        name="vm_hl"
        label="2. ¿Qué ve: humo o llama?"
        value={form.vm_humo_llama}
        onChange={(v: string) => patch("vm_humo_llama", v)}
        options={[
          { value: "humo", label: "Humo" },
          { value: "llama", label: "Llama" },
        ]}
      />
      <RadioList
        name="vm_origen"
        label="3. ¿De dónde proviene el humo o las llamas?"
        value={form.vm_origen}
        onChange={(v: string) => patch("vm_origen", v)}
        options={[
          { value: "ventana", label: "Ventana" },
          { value: "puerta", label: "Puerta" },
          { value: "otro", label: "Otro / no sabe" },
        ]}
      />
      {form.vm_origen === "ventana" && (
        <RadioYesNo
          name="vm_ov"
          label="¿Esa ventana da a la calle del portal?"
          value={form.vm_origen_ventana_portal}
          onChange={(v: string) => patch("vm_origen_ventana_portal", v)}
        />
      )}
      {form.vm_origen === "ventana" && form.vm_origen_ventana_portal === "no" && (
        <div>
          <Label>Nombre de la calle a la que da la ventana</Label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.vm_ventana_calle}
            onChange={(e) => patch("vm_ventana_calle", e.target.value)}
            placeholder="Ej. calle lateral, travesía…"
          />
        </div>
      )}
      {form.vm_origen === "puerta" && (
        <RadioYesNo
          name="vm_pic"
          label="¿Han probado a picar?"
          value={form.vm_origen_puerta_picar}
          onChange={(v: string) => patch("vm_origen_puerta_picar", v)}
        />
      )}
      <RadioYesNo name="vm_oyen" label="4. ¿Oyen gente dentro?" value={form.vm_oyen_gente} onChange={(v: string) => patch("vm_oyen_gente", v)} />
      <RadioYesNo
        name="vm_fuera"
        label="5. ¿Hay humo o llamas fuera de la vivienda (patio de luces, caja de escalera)?"
        value={form.vm_humo_fuera}
        onChange={(v: string) => patch("vm_humo_fuera", v)}
      />
      <div>
        <Label>6. Humo: denso o leve, y color</Label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.vm_humo_denso_color}
          onChange={(e) => patch("vm_humo_denso_color", e.target.value)}
        />
      </div>
      <div>
        <Label>7. Descripción del problema</Label>
        <textarea
          className="w-full min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.vm_descripcion}
          onChange={(e) => patch("vm_descripcion", e.target.value)}
        />
      </div>
    </section>
  );
}

function VecinoOtro({
  form,
  patch,
}: {
  form: StructuralFormState;
  patch: <K extends keyof StructuralFormState>(k: K, v: StructuralFormState[K]) => void;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      <SectionTitle>Vecino de otro edificio o transeúnte</SectionTitle>
      <RadioList
        name="vo_donde"
        label="1. ¿Dónde se encuentra usted?"
        value={form.vo_donde}
        onChange={(v: string) => patch("vo_donde", v)}
        options={[
          { value: "calle", label: "En la calle" },
          { value: "vivienda", label: "En la vivienda" },
        ]}
      />
      {(form.vo_donde === "calle" || form.vo_donde === "vivienda") && (
        <div>
          <Label>¿A qué distancia aproximada del incendio está?</Label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.vo_distancia}
            onChange={(e) => patch("vo_distancia", e.target.value)}
          />
        </div>
      )}
      <RadioList
        name="vo_hl"
        label="2. ¿Qué ve: humo o llama?"
        value={form.vo_humo_llama}
        onChange={(v: string) => patch("vo_humo_llama", v)}
        options={[
          { value: "humo", label: "Humo" },
          { value: "llama", label: "Llama" },
        ]}
      />
      <RadioList
        name="vo_origen"
        label="3. ¿De dónde proviene el humo o las llamas?"
        value={form.vo_origen}
        onChange={(v: string) => patch("vo_origen", v)}
        options={[
          { value: "ventana", label: "Ventana" },
          { value: "tejado", label: "Tejado" },
          { value: "no_sabe", label: "No sabe" },
        ]}
      />
      <div>
        <Label>4. Cantidad de humo (leve / denso) y color</Label>
        <input
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.vo_cantidad_humo}
          onChange={(e) => patch("vo_cantidad_humo", e.target.value)}
        />
      </div>
      <div>
        <Label>5. Descripción del problema</Label>
        <textarea
          className="w-full min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
          value={form.vo_descripcion}
          onChange={(e) => patch("vo_descripcion", e.target.value)}
        />
      </div>
    </section>
  );
}
