import { appendContactosLines } from "./spectatorLabels";

/** Orden y etiquetas para modo espectador (sin guiones largos) */
export const STRUCTURAL_FIELD_ORDER: { key: string; label: string }[] = [
  { key: "ubicacion_zona", label: "Zona de ubicación" },
  { key: "urb_calle", label: "Calle (urbana)" },
  { key: "urb_portal", label: "Portal" },
  { key: "urb_piso", label: "Piso" },
  { key: "urb_puerta", label: "Puerta" },
  { key: "urb_barrio", label: "Barrio" },
  { key: "urb_calle_aneja", label: "Calle aneja" },
  { key: "rur_via", label: "Nombre de vía (rural)" },
  { key: "rur_parroquia", label: "Parroquia" },
  { key: "rur_via_aneja", label: "Vía aneja" },
  { key: "observaciones", label: "Observaciones" },
  { key: "tipo_estructura", label: "Tipo de estructura incendiada" },
  { key: "tipo_estructura_otros", label: "Tipo de estructura (texto si es otros)" },
  { key: "identificacion_alertante", label: "Identificación del alertante" },
  { key: "oc_humo_o_llama", label: "Ocupante: humo o llama" },
  { key: "oc_origen", label: "Ocupante: de dónde proviene o qué arde" },
  { key: "oc_descripcion", label: "Ocupante: descripción del problema" },
  { key: "oc_mas_ocupantes", label: "Ocupante: hay más ocupantes en la vivienda" },
  { key: "oc_num_ocupantes", label: "Ocupante: número de ocupantes" },
  { key: "oc_pueden_salir", label: "Ocupante: pueden abandonar la vivienda solos" },
  { key: "oc_cuantos_no_pueden", label: "Ocupante: cuántos no pueden salir" },
  { key: "oc_motivo_no_salir", label: "Ocupante: motivo por el que no pueden salir" },
  { key: "oc_puerta_abierta", label: "Ocupante: puerta de la vivienda abierta" },
  { key: "oc_puerta_detalle", label: "Ocupante: detalle de la puerta (llaves, vueltas…)" },
  { key: "oc_ventanas_otra_fachada", label: "Ocupante: ventanas a otra fachada distinta del portal" },
  { key: "oc_ventanas_otra_calle", label: "Ocupante: nombre de calle de la otra fachada" },
  { key: "oc_ventanas_solo_patio", label: "Ocupante: ventanas solo a patio interior" },
  { key: "vm_donde", label: "Vecino mismo edificio: dónde se encuentra" },
  { key: "vm_humo_llama", label: "Vecino mismo edificio: humo o llama" },
  { key: "vm_origen", label: "Vecino mismo edificio: origen del humo o las llamas" },
  { key: "vm_origen_ventana_portal", label: "Vecino mismo edificio: la ventana da a la calle del portal" },
  { key: "vm_ventana_calle", label: "Vecino mismo edificio: calle a la que da la ventana" },
  { key: "vm_origen_puerta_picar", label: "Vecino mismo edificio: en puerta, probado a picar" },
  { key: "vm_oyen_gente", label: "Vecino mismo edificio: oyen gente dentro" },
  { key: "vm_humo_fuera", label: "Vecino mismo edificio: humo o llamas fuera de la vivienda" },
  { key: "vm_humo_denso_color", label: "Vecino mismo edificio: humo (denso o leve) y color" },
  { key: "vm_descripcion", label: "Vecino mismo edificio: descripción" },
  { key: "vo_donde", label: "Vecino otro o transeúnte: dónde se encuentra" },
  { key: "vo_distancia", label: "Vecino otro o transeúnte: distancia al incendio" },
  { key: "vo_humo_llama", label: "Vecino otro o transeúnte: humo o llama" },
  { key: "vo_origen", label: "Vecino otro o transeúnte: origen" },
  { key: "vo_cantidad_humo", label: "Vecino otro o transeúnte: cantidad y color del humo" },
  { key: "vo_descripcion", label: "Vecino otro o transeúnte: descripción" },
];

const LABEL_BY_KEY = Object.fromEntries(STRUCTURAL_FIELD_ORDER.map((x) => [x.key, x.label])) as Record<
  string,
  string
>;

function fmtSiNo(v: string): string {
  if (v === "si") return "Sí";
  if (v === "no") return "No";
  return v;
}

export function fmtValue(key: string, raw: string): string {
  switch (key) {
    case "ubicacion_zona":
      return raw === "urbana" ? "Urbana" : raw === "rural" ? "Rural" : raw;
    case "tipo_estructura":
      return (
        {
          piso: "Piso",
          unifamiliar: "Vivienda unifamiliar",
          local: "Local comercial",
          nave: "Nave industrial",
          garaje: "Garaje",
          otros: "Otros",
        }[raw] ?? raw
      );
    case "identificacion_alertante":
      return (
        {
          ocupante: "Ocupante / usuario",
          vecino_mismo: "Vecino mismo edificio",
          vecino_otro: "Vecino otro edificio o transeúnte",
          "112_sin_alertante": "112 sin contacto con alertante",
        }[raw] ?? raw
      );
    case "vm_donde":
      return (
        {
          vivienda_propia: "En su propia vivienda",
          rellano: "En el rellano",
          vivienda_incendiada: "En la vivienda incendiada",
        }[raw] ?? raw
      );
    case "vm_origen":
    case "vo_origen":
      return (
        {
          ventana: "Ventana",
          puerta: "Puerta",
          tejado: "Tejado",
          otro: "Otro / no sabe",
          no_sabe: "No sabe",
        }[raw] ?? raw
      );
    case "vo_donde":
      return raw === "calle" ? "En la calle" : raw === "vivienda" ? "En la vivienda" : raw;
    case "oc_motivo_no_salir":
      return raw === "atrapamiento" ? "Atrapamiento" : raw === "movilidad" ? "Movilidad reducida" : raw;
    case "oc_humo_o_llama":
    case "vm_humo_llama":
    case "vo_humo_llama":
      return raw === "humo" ? "Humo" : raw === "llama" ? "Llama" : raw;
    default: {
      const boolKeys = new Set([
        "oc_mas_ocupantes",
        "oc_pueden_salir",
        "oc_puerta_abierta",
        "oc_ventanas_otra_fachada",
        "oc_ventanas_solo_patio",
        "vm_origen_ventana_portal",
        "vm_origen_puerta_picar",
        "vm_oyen_gente",
        "vm_humo_fuera",
      ]);
      if (boolKeys.has(key)) return fmtSiNo(raw);
      return raw;
    }
  }
}

export function structuralPayloadToDisplayLines(payload: Record<string, unknown>): { label: string; value: string }[] {
  const { lines: contactLines, usedKeys } = appendContactosLines(payload);
  const out: { label: string; value: string }[] = [...contactLines];
  const used = new Set<string>(usedKeys);

  for (const { key, label } of STRUCTURAL_FIELD_ORDER) {
    const raw = payload[key];
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw === "object") continue;
    const s = String(raw);
    used.add(key);
    out.push({ label, value: fmtValue(key, s) });
  }

  for (const [key, val] of Object.entries(payload)) {
    if (key === "_formVersion" || key === "_raw") continue;
    if (used.has(key)) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    const friendly =
      key === "telefono_alertante"
        ? "Teléfono (registro anterior)"
        : key === "notas"
          ? "Notas (registro anterior)"
          : LABEL_BY_KEY[key] ?? key.replace(/_/g, " ");
    out.push({ label: friendly, value: String(val) });
  }

  return out;
}
