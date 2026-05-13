import type { SharedRootFieldsState } from "./sharedBasics";
import { emptySharedRoot } from "./sharedBasics";
import { mergeSharedRootFromPayload } from "./mergeSharedRootFromPayload";

export type SiNo = "si" | "no" | "";

export type TrafficEstadoCoche = "volcado" | "cuatro_ruedas" | "otros" | "";

export type TrafficVehiculoRow = {
  estado: TrafficEstadoCoche;
  estado_otros_desc: string;
};

export type TrafficSpecificState = {
  at_num_vehiculos: string;
  at_personas_atrapadas: SiNo;
  at_atrapados_multiples_vehiculos: SiNo;
  at_num_atrapados: string;
  at_vehiculos: TrafficVehiculoRow[];
  at_quien_alertante: string;
};

export type AquaticRescueState = {
  ra_motivo_ayuda: string;
  ra_hace_senales: SiNo;
  ra_equipacion: string;
};

export type FachadasMotivoLlamada = "sin_noticias" | "socorro" | "otro" | "";

export type FachadasAccessState = {
  fa_policia_local: SiNo;
  fa_altura_edificio: string;
  fa_acceso_calle: SiNo;
  fa_nombre_calle_acceso: string;
  fa_sin_calle_detalle: string;
  fa_quien_llama: string;
  fa_motivo_llamada: FachadasMotivoLlamada;
  fa_motivo_otro_desc: string;
};

export type GenericExtendedFormState = SharedRootFieldsState &
  TrafficSpecificState &
  AquaticRescueState &
  FachadasAccessState;

export function emptyTrafficSpecific(): TrafficSpecificState {
  return {
    at_num_vehiculos: "1",
    at_personas_atrapadas: "",
    at_atrapados_multiples_vehiculos: "",
    at_num_atrapados: "",
    at_vehiculos: [{ estado: "", estado_otros_desc: "" }],
    at_quien_alertante: "",
  };
}

export function emptyAquaticRescue(): AquaticRescueState {
  return {
    ra_motivo_ayuda: "",
    ra_hace_senales: "",
    ra_equipacion: "",
  };
}

export function emptyFachadasAccess(): FachadasAccessState {
  return {
    fa_policia_local: "",
    fa_altura_edificio: "",
    fa_acceso_calle: "",
    fa_nombre_calle_acceso: "",
    fa_sin_calle_detalle: "",
    fa_quien_llama: "",
    fa_motivo_llamada: "",
    fa_motivo_otro_desc: "",
  };
}

export function emptyGenericExtendedForm(): GenericExtendedFormState {
  return {
    ...emptySharedRoot(),
    ...emptyTrafficSpecific(),
    ...emptyAquaticRescue(),
    ...emptyFachadasAccess(),
  };
}

function clampVehiculos(n: number): number {
  if (!Number.isFinite(n) || n < 1) return 1;
  if (n > 20) return 20;
  return Math.floor(n);
}

function parseVehiculosFromPayload(raw: unknown, count: number): TrafficVehiculoRow[] {
  const rows: TrafficVehiculoRow[] = [];
  if (Array.isArray(raw)) {
    for (let i = 0; i < count; i++) {
      const o = raw[i] as { estado?: unknown; estado_otros_desc?: unknown } | undefined;
      const est = String(o?.estado ?? "") as TrafficEstadoCoche;
      const ok: TrafficEstadoCoche =
        est === "volcado" || est === "cuatro_ruedas" || est === "otros" ? est : "";
      rows.push({
        estado: ok,
        estado_otros_desc: String(o?.estado_otros_desc ?? ""),
      });
    }
    return rows;
  }
  for (let i = 0; i < count; i++) rows.push({ estado: "", estado_otros_desc: "" });
  return rows;
}

export function mergeTrafficFromPayload(p: Record<string, unknown>): TrafficSpecificState {
  const d = emptyTrafficSpecific();
  const nRaw = parseInt(String(p.at_num_vehiculos ?? "1"), 10);
  const n = clampVehiculos(Number.isFinite(nRaw) ? nRaw : 1);
  d.at_num_vehiculos = String(n);
  d.at_personas_atrapadas = (p.at_personas_atrapadas === "si" || p.at_personas_atrapadas === "no" ? p.at_personas_atrapadas : "") as SiNo;
  d.at_atrapados_multiples_vehiculos = (p.at_atrapados_multiples_vehiculos === "si" || p.at_atrapados_multiples_vehiculos === "no"
    ? p.at_atrapados_multiples_vehiculos
    : "") as SiNo;
  d.at_num_atrapados = String(p.at_num_atrapados ?? "");
  d.at_vehiculos = parseVehiculosFromPayload(p.at_vehiculos, n);
  d.at_quien_alertante = String(p.at_quien_alertante ?? "");
  return d;
}

export function mergeAquaticFromPayload(p: Record<string, unknown>): AquaticRescueState {
  return {
    ra_motivo_ayuda: String(p.ra_motivo_ayuda ?? ""),
    ra_hace_senales: (p.ra_hace_senales === "si" || p.ra_hace_senales === "no" ? p.ra_hace_senales : "") as SiNo,
    ra_equipacion: String(p.ra_equipacion ?? ""),
  };
}

export function mergeFachadasFromPayload(p: Record<string, unknown>): FachadasAccessState {
  const m = p.fa_motivo_llamada;
  const motivo: FachadasMotivoLlamada =
    m === "sin_noticias" || m === "socorro" || m === "otro" || m === "" ? (m as FachadasMotivoLlamada) : "";
  return {
    fa_policia_local: (p.fa_policia_local === "si" || p.fa_policia_local === "no" ? p.fa_policia_local : "") as SiNo,
    fa_altura_edificio: String(p.fa_altura_edificio ?? ""),
    fa_acceso_calle: (p.fa_acceso_calle === "si" || p.fa_acceso_calle === "no" ? p.fa_acceso_calle : "") as SiNo,
    fa_nombre_calle_acceso: String(p.fa_nombre_calle_acceso ?? ""),
    fa_sin_calle_detalle: String(p.fa_sin_calle_detalle ?? ""),
    fa_quien_llama: String(p.fa_quien_llama ?? ""),
    fa_motivo_llamada: motivo,
    fa_motivo_otro_desc: String(p.fa_motivo_otro_desc ?? ""),
  };
}

/** Une raíz compartida (contactos, ubicación, observaciones) con bloques específicos genéricos. */
export function mergeGenericExtendedFromPayload(p: Record<string, unknown>): GenericExtendedFormState {
  const shared = mergeSharedRootFromPayload(p);
  return {
    ...shared,
    ...mergeTrafficFromPayload(p),
    ...mergeAquaticFromPayload(p),
    ...mergeFachadasFromPayload(p),
  };
}

export function syncTrafficVehiculosRows(
  at_vehiculos: TrafficVehiculoRow[],
  numStr: string
): { at_num_vehiculos: string; at_vehiculos: TrafficVehiculoRow[] } {
  const n = clampVehiculos(parseInt(numStr, 10) || 1);
  const next = [...at_vehiculos];
  while (next.length < n) next.push({ estado: "", estado_otros_desc: "" });
  if (next.length > n) next.length = n;
  return { at_num_vehiculos: String(n), at_vehiculos: next };
}

export function fmtSiNo(v: string): string {
  if (v === "si") return "Sí";
  if (v === "no") return "No";
  return v;
}

export function fmtTrafficEstado(v: string): string {
  if (v === "volcado") return "Volcado";
  if (v === "cuatro_ruedas") return "Sobre las cuatro ruedas";
  if (v === "otros") return "Otros";
  return v;
}

export function fmtFachadasMotivo(v: string): string {
  if (v === "sin_noticias") return "Hace tiempo que no tiene noticias";
  if (v === "socorro") return "Pide socorro";
  if (v === "otro") return "Otro motivo";
  return v;
}
