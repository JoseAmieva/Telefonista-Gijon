import type { Dispatch, SetStateAction } from "react";
import type { IncidentKey } from "../incidents/types";
import type { GenericExtendedFormState } from "../incidents/genericExtendedForm";
import { syncTrafficVehiculosRows } from "../incidents/genericExtendedForm";
import { Label, RadioList, RadioYesNo, SectionTitle } from "./ui";

type SetForm = Dispatch<SetStateAction<GenericExtendedFormState>>;

export function GenericIncidentSpecificSections({
  incidentKey,
  form,
  setForm,
}: {
  incidentKey: IncidentKey;
  form: GenericExtendedFormState;
  setForm: SetForm;
}) {
  if (incidentKey === "accidente_trafico") {
    const nVeh = Math.max(1, parseInt(form.at_num_vehiculos, 10) || 1);
    const showMultiCar = form.at_personas_atrapadas === "si" && nVeh > 1;
    const showAtrapadosCount = form.at_personas_atrapadas === "si";

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <SectionTitle>Accidente de tráfico</SectionTitle>

        <div>
          <Label htmlFor="at_num_vehiculos">¿Cuántos vehículos están implicados?</Label>
          <select
            id="at_num_vehiculos"
            className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.at_num_vehiculos}
            onChange={(e) => {
              const v = e.target.value;
              setForm((f) => ({ ...f, ...syncTrafficVehiculosRows(f.at_vehiculos, v) }));
            }}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <RadioYesNo
          name="at_personas_atrapadas"
          label="¿Hay personas atrapadas?"
          value={form.at_personas_atrapadas}
          onChange={(v) => setForm((f) => ({ ...f, at_personas_atrapadas: v as "si" | "no" | "" }))}
        />

        {showMultiCar && (
          <RadioYesNo
            name="at_atrapados_multiples_vehiculos"
            label="¿Hay personas atrapadas en más de un vehículo?"
            value={form.at_atrapados_multiples_vehiculos}
            onChange={(v) => setForm((f) => ({ ...f, at_atrapados_multiples_vehiculos: v as "si" | "no" | "" }))}
          />
        )}

        {showAtrapadosCount && (
          <div>
            <Label htmlFor="at_num_atrapados">Número de personas atrapadas (total)</Label>
            <input
              id="at_num_atrapados"
              type="text"
              inputMode="numeric"
              className="mt-1 w-full max-w-xs rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.at_num_atrapados}
              onChange={(e) => setForm((f) => ({ ...f, at_num_atrapados: e.target.value }))}
              placeholder="Ej. 2"
            />
          </div>
        )}

        <div className="space-y-6 border-t border-slate-100 pt-4">
          <p className="text-sm font-medium text-slate-800">Estado de cada vehículo</p>
          {form.at_vehiculos.map((row, idx) => {
            const num = idx + 1;
            return (
              <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50/80 p-4 space-y-3">
                <p className="text-sm font-semibold text-slate-700">Vehículo {num}</p>
                <RadioList
                  name={`at_estado_${idx}`}
                  label="Estado del vehículo"
                  value={row.estado}
                  onChange={(v) =>
                    setForm((f) => {
                      const veh = [...f.at_vehiculos];
                      veh[idx] = { ...veh[idx], estado: v as typeof row.estado };
                      return { ...f, at_vehiculos: veh };
                    })
                  }
                  options={[
                    { value: "volcado", label: "Volcado" },
                    { value: "cuatro_ruedas", label: "Sobre las cuatro ruedas" },
                    { value: "otros", label: "Otros" },
                  ]}
                />
                {row.estado === "otros" && (
                  <div>
                    <Label htmlFor={`at_otros_${idx}`}>Descripción (otros)</Label>
                    <textarea
                      id={`at_otros_${idx}`}
                      className="mt-1 w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                      value={row.estado_otros_desc}
                      onChange={(e) =>
                        setForm((f) => {
                          const veh = [...f.at_vehiculos];
                          veh[idx] = { ...veh[idx], estado_otros_desc: e.target.value };
                          return { ...f, at_vehiculos: veh };
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <Label htmlFor="at_quien_alertante">¿Quién es el alertante?</Label>
          <textarea
            id="at_quien_alertante"
            className="mt-1 w-full min-h-[80px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.at_quien_alertante}
            onChange={(e) => setForm((f) => ({ ...f, at_quien_alertante: e.target.value }))}
          />
        </div>
      </section>
    );
  }

  if (incidentKey === "rescate") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <SectionTitle>Rescate acuático</SectionTitle>
        <p className="text-sm text-slate-600 -mt-2 mb-2">Datos de la persona en el agua o en peligro acuático.</p>

        <div>
          <Label htmlFor="ra_motivo_ayuda">¿Por qué cree que necesita ayuda? (lo que cuenta la víctima o el testigo)</Label>
          <textarea
            id="ra_motivo_ayuda"
            className="mt-1 w-full min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.ra_motivo_ayuda}
            onChange={(e) => setForm((f) => ({ ...f, ra_motivo_ayuda: e.target.value }))}
          />
        </div>

        <RadioYesNo
          name="ra_hace_senales"
          label="¿Hace señales?"
          value={form.ra_hace_senales}
          onChange={(v) => setForm((f) => ({ ...f, ra_hace_senales: v as "si" | "no" | "" }))}
        />

        <div>
          <Label htmlFor="ra_equipacion">¿Lleva equipación? (neopreno, tabla, chaleco, etc.)</Label>
          <textarea
            id="ra_equipacion"
            className="mt-1 w-full min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.ra_equipacion}
            onChange={(e) => setForm((f) => ({ ...f, ra_equipacion: e.target.value }))}
            placeholder="Describir si lleva neopreno, tabla de surf, kayak…"
          />
        </div>
      </section>
    );
  }

  if (incidentKey === "fachadas" || incidentKey === "acceso_vivienda") {
    const sectionTitle = incidentKey === "fachadas" ? "Fachadas y accesos" : "Acceso a vivienda";
    const incluirMotivoLlamada = incidentKey === "acceso_vivienda";

    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
        <SectionTitle>{sectionTitle}</SectionTitle>

        <RadioYesNo
          name="fa_policia_local"
          label="¿Está la policía local?"
          value={form.fa_policia_local}
          onChange={(v) => setForm((f) => ({ ...f, fa_policia_local: v as "si" | "no" | "" }))}
        />

        <div>
          <Label htmlFor="fa_altura_edificio">Altura del edificio</Label>
          <input
            id="fa_altura_edificio"
            className="mt-1 w-full max-w-md rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.fa_altura_edificio}
            onChange={(e) => setForm((f) => ({ ...f, fa_altura_edificio: e.target.value }))}
            placeholder="Ej. 5 plantas, bajo con altillo…"
          />
        </div>

        <RadioYesNo
          name="fa_acceso_calle"
          label="¿Hay acceso desde la calle?"
          value={form.fa_acceso_calle}
          onChange={(v) => setForm((f) => ({ ...f, fa_acceso_calle: v as "si" | "no" | "" }))}
        />

        {form.fa_acceso_calle === "si" && (
          <div>
            <Label htmlFor="fa_nombre_calle_acceso">Confirmar nombre de la calle de acceso</Label>
            <input
              id="fa_nombre_calle_acceso"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.fa_nombre_calle_acceso}
              onChange={(e) => setForm((f) => ({ ...f, fa_nombre_calle_acceso: e.target.value }))}
            />
          </div>
        )}

        {form.fa_acceso_calle === "no" && (
          <div>
            <Label htmlFor="fa_sin_calle_detalle">Si no es por calle, indicar (zona ajardinada, patio interior, etc.)</Label>
            <textarea
              id="fa_sin_calle_detalle"
              className="mt-1 w-full min-h-[88px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={form.fa_sin_calle_detalle}
              onChange={(e) => setForm((f) => ({ ...f, fa_sin_calle_detalle: e.target.value }))}
            />
          </div>
        )}

        <div>
          <Label htmlFor="fa_quien_llama">¿Quién llama?</Label>
          <textarea
            id="fa_quien_llama"
            className="mt-1 w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
            value={form.fa_quien_llama}
            onChange={(e) => setForm((f) => ({ ...f, fa_quien_llama: e.target.value }))}
          />
        </div>

        {incluirMotivoLlamada && (
          <>
            <RadioList
              name="fa_motivo_llamada"
              label="¿Por qué llama?"
              value={form.fa_motivo_llamada}
              onChange={(v) =>
                setForm((f) => ({ ...f, fa_motivo_llamada: v as GenericExtendedFormState["fa_motivo_llamada"] }))
              }
              options={[
                { value: "sin_noticias", label: "Hace tiempo que no tiene noticias" },
                { value: "socorro", label: "Pide socorro" },
                { value: "otro", label: "Otro motivo" },
              ]}
            />

            {form.fa_motivo_llamada === "otro" && (
              <div>
                <Label htmlFor="fa_motivo_otro_desc">Especificar motivo</Label>
                <textarea
                  id="fa_motivo_otro_desc"
                  className="mt-1 w-full min-h-[72px] rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={form.fa_motivo_otro_desc}
                  onChange={(e) => setForm((f) => ({ ...f, fa_motivo_otro_desc: e.target.value }))}
                />
              </div>
            )}
          </>
        )}
      </section>
    );
  }

  return null;
}
