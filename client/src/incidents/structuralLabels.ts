/** Orden y etiquetas para modo espectador e informes legibles */
export const STRUCTURAL_FIELD_ORDER: { key: string; label: string }[] = [
  { key: "telefono_alertante", label: "Teléfono del alertante" },
  { key: "ubicacion_zona", label: "Ubicación — zona" },
  { key: "urb_calle", label: "Urbana — calle" },
  { key: "urb_portal", label: "Urbana — portal" },
  { key: "urb_piso", label: "Urbana — piso" },
  { key: "urb_puerta", label: "Urbana — puerta" },
  { key: "urb_barrio", label: "Urbana — barrio" },
  { key: "urb_calle_aneja", label: "Urbana — calle aneja" },
  { key: "rur_via", label: "Rural — nombre de vía" },
  { key: "rur_parroquia", label: "Rural — parroquia" },
  { key: "rur_via_aneja", label: "Rural — vía aneja" },
  { key: "tipo_estructura", label: "Tipo de estructura" },
  { key: "tipo_estructura_otros", label: "Tipo de estructura (otros — texto)" },
  { key: "identificacion_alertante", label: "Identificación del alertante" },
  { key: "oc_humo_o_llama", label: "Ocupante — humo o llama" },
  { key: "oc_origen", label: "Ocupante — origen / qué arde" },
  { key: "oc_descripcion", label: "Ocupante — descripción del problema" },
  { key: "oc_mas_ocupantes", label: "Ocupante — más ocupantes en la vivienda" },
  { key: "oc_num_ocupantes", label: "Ocupante — número de ocupantes" },
  { key: "oc_pueden_salir", label: "Ocupante — pueden abandonar la vivienda" },
  { key: "oc_cuantos_no_pueden", label: "Ocupante — cuántos no pueden salir" },
  { key: "oc_motivo_no_salir", label: "Ocupante — motivo (atrapamiento / movilidad)" },
  { key: "oc_puerta_abierta", label: "Ocupante — puerta de la vivienda abierta" },
  { key: "oc_puerta_detalle", label: "Ocupante — detalle puerta (llaves, vueltas…)" },
  { key: "oc_ventanas_otra_fachada", label: "Ocupante — ventanas a otra fachada que el portal" },
  { key: "oc_ventanas_otra_calle", label: "Ocupante — nombre de calle (otra fachada)" },
  { key: "oc_ventanas_solo_patio", label: "Ocupante — ventanas solo a patio interior" },
  { key: "vm_donde", label: "Vecino mismo edificio — dónde se encuentra" },
  { key: "vm_humo_llama", label: "Vecino mismo — humo o llama" },
  { key: "vm_origen", label: "Vecino mismo — origen humo/llamas" },
  { key: "vm_origen_ventana_portal", label: "Vecino mismo — ventana da a calle del portal" },
  { key: "vm_ventana_calle", label: "Vecino mismo — calle si la ventana no da al portal" },
  { key: "vm_origen_puerta_picar", label: "Vecino mismo — puerta: probado a picar" },
  { key: "vm_oyen_gente", label: "Vecino mismo — oyen gente dentro" },
  { key: "vm_humo_fuera", label: "Vecino mismo — humo/llamas fuera (patio/rellano)" },
  { key: "vm_humo_denso_color", label: "Vecino mismo — humo denso/leve y color" },
  { key: "vm_descripcion", label: "Vecino mismo — descripción" },
  { key: "vo_donde", label: "Vecino otro / transeúnte — dónde se encuentra" },
  { key: "vo_distancia", label: "Vecino otro — distancia al incendio" },
  { key: "vo_humo_llama", label: "Vecino otro — humo o llama" },
  { key: "vo_origen", label: "Vecino otro — origen" },
  { key: "vo_cantidad_humo", label: "Vecino otro — cantidad y color del humo" },
  { key: "vo_descripcion", label: "Vecino otro — descripción" },
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

function fmtValue(key: string, raw: string): string {
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
  const out: { label: string; value: string }[] = [];
  const used = new Set<string>();

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
    out.push({ label: LABEL_BY_KEY[key] ?? key, value: String(val) });
  }

  return out;
}
