import { FieldGrid, Label, RadioList } from "./ui";
import { StreetAutocomplete } from "./StreetAutocomplete";
import type { SharedRootFieldsState } from "../incidents/sharedBasics";

type K = keyof SharedRootFieldsState;

export function UbicacionFields({
  form,
  patch,
}: {
  form: Pick<
    SharedRootFieldsState,
    | "ubicacion_zona"
    | "urb_calle"
    | "urb_portal"
    | "urb_piso"
    | "urb_puerta"
    | "urb_barrio"
    | "urb_calle_aneja"
    | "rur_via"
    | "rur_parroquia"
    | "rur_via_aneja"
  >;
  patch: (k: K, v: string) => void;
}) {
  return (
    <div className="space-y-4">
      <RadioList
        name="zona"
        label="Zona"
        value={form.ubicacion_zona}
        onChange={(v) => patch("ubicacion_zona", v)}
        options={[
          { value: "urbana", label: "Zona urbana" },
          { value: "rural", label: "Zona rural" },
        ]}
      />
      {form.ubicacion_zona === "urbana" && (
        <div className="mt-4 space-y-3">
          <FieldGrid>
            <div className="sm:col-span-2">
              <Label>Calle (Gijón, sugerencias al escribir)</Label>
              <StreetAutocomplete value={form.urb_calle} onChange={(v) => patch("urb_calle", v)} />
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
    </div>
  );
}
