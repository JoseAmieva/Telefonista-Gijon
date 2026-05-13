import { ubicacionFromPayload, buildMapsQueryFromUbicacion } from "./maps";
import type { IncidentKey } from "./types";
import { fmtSiNo, fmtTrafficEstado, fmtFachadasMotivo } from "./genericExtendedForm";

function fmtUbicacionZona(raw: string): string {
  if (raw === "urbana") return "Urbana";
  if (raw === "rural") return "Rural";
  return raw;
}

export function appendContactosLines(payload: Record<string, unknown>): {
  lines: { label: string; value: string }[];
  usedKeys: Set<string>;
} {
  const lines: { label: string; value: string }[] = [];
  const usedKeys = new Set<string>(["contactos"]);

  const raw = payload.contactos;
  if (Array.isArray(raw) && raw.length > 0) {
    raw.forEach((item, idx) => {
      const o = item as { telefono?: unknown; rol?: unknown };
      const tel = String(o.telefono ?? "").trim();
      const rol = String(o.rol ?? "").trim();
      const n = idx + 1;
      if (tel) lines.push({ label: `Teléfono ${n}`, value: tel });
      if (rol) lines.push({ label: `Nombre o rol (teléfono ${n})`, value: rol });
    });
  } else if (typeof payload.telefono_alertante === "string" && payload.telefono_alertante.trim()) {
    lines.push({ label: "Teléfono (registro anterior)", value: payload.telefono_alertante.trim() });
    usedKeys.add("telefono_alertante");
  }

  return { lines, usedKeys };
}

const UBICACION_LABELS: { key: string; label: string }[] = [
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
];

function markPrefixKeys(payload: Record<string, unknown>, prefix: string, used: Set<string>) {
  for (const k of Object.keys(payload)) {
    if (k.startsWith(prefix)) used.add(k);
  }
}

function appendTrafficSpectator(payload: Record<string, unknown>): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  const lines: { label: string; value: string }[] = [];
  const usedKeys = new Set<string>();
  const n = String(payload.at_num_vehiculos ?? "").trim();
  if (n) {
    lines.push({ label: "Vehículos implicados", value: n });
    usedKeys.add("at_num_vehiculos");
  }
  const pa = payload.at_personas_atrapadas;
  if (pa === "si" || pa === "no") {
    lines.push({ label: "¿Hay personas atrapadas?", value: fmtSiNo(String(pa)) });
    usedKeys.add("at_personas_atrapadas");
  }
  const nVeh = Math.max(1, parseInt(n || "1", 10) || 1);
  if (pa === "si" && nVeh > 1) {
    const mc = payload.at_atrapados_multiples_vehiculos;
    if (mc === "si" || mc === "no") {
      lines.push({ label: "¿Personas atrapadas en más de un vehículo?", value: fmtSiNo(String(mc)) });
      usedKeys.add("at_atrapados_multiples_vehiculos");
    }
  }
  if (pa === "si") {
    const na = String(payload.at_num_atrapados ?? "").trim();
    if (na) {
      lines.push({ label: "Número de personas atrapadas", value: na });
      usedKeys.add("at_num_atrapados");
    }
  }
  const rawV = payload.at_vehiculos;
  if (Array.isArray(rawV)) {
    rawV.forEach((item, idx) => {
      const o = item as { estado?: unknown; estado_otros_desc?: unknown };
      const est = String(o.estado ?? "").trim();
      const desc = String(o.estado_otros_desc ?? "").trim();
      const num = idx + 1;
      if (est) {
        lines.push({ label: `Vehículo ${num}: estado`, value: fmtTrafficEstado(est) });
        if (est === "otros" && desc) {
          lines.push({ label: `Vehículo ${num}: descripción del estado`, value: desc });
        }
      }
    });
    usedKeys.add("at_vehiculos");
  }
  const qa = String(payload.at_quien_alertante ?? "").trim();
  if (qa) {
    lines.push({ label: "¿Quién es el alertante?", value: qa });
    usedKeys.add("at_quien_alertante");
  }
  markPrefixKeys(payload, "at_", usedKeys);
  return { lines, usedKeys };
}

function appendAquaticSpectator(payload: Record<string, unknown>): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  const lines: { label: string; value: string }[] = [];
  const usedKeys = new Set<string>();
  const motivo = String(payload.ra_motivo_ayuda ?? "").trim();
  if (motivo) {
    lines.push({ label: "¿Por qué cree que necesita ayuda?", value: motivo });
    usedKeys.add("ra_motivo_ayuda");
  }
  const sen = payload.ra_hace_senales;
  if (sen === "si" || sen === "no") {
    lines.push({ label: "¿Hace señales?", value: fmtSiNo(String(sen)) });
    usedKeys.add("ra_hace_senales");
  }
  const eq = String(payload.ra_equipacion ?? "").trim();
  if (eq) {
    lines.push({ label: "Equipación (neopreno, tabla, etc.)", value: eq });
    usedKeys.add("ra_equipacion");
  }
  markPrefixKeys(payload, "ra_", usedKeys);
  return { lines, usedKeys };
}

/** Bloque común fachadas / acceso a vivienda (sin motivo de llamada). */
function appendFachadasCoreSpectator(payload: Record<string, unknown>): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  const lines: { label: string; value: string }[] = [];
  const usedKeys = new Set<string>();
  const pol = payload.fa_policia_local;
  if (pol === "si" || pol === "no") {
    lines.push({ label: "¿Policía local en el lugar?", value: fmtSiNo(String(pol)) });
    usedKeys.add("fa_policia_local");
  }
  const alt = String(payload.fa_altura_edificio ?? "").trim();
  if (alt) {
    lines.push({ label: "Altura del edificio", value: alt });
    usedKeys.add("fa_altura_edificio");
  }
  const ac = payload.fa_acceso_calle;
  if (ac === "si" || ac === "no") {
    lines.push({ label: "¿Acceso desde la calle?", value: fmtSiNo(String(ac)) });
    usedKeys.add("fa_acceso_calle");
  }
  const calle = String(payload.fa_nombre_calle_acceso ?? "").trim();
  if (calle) {
    lines.push({ label: "Calle de acceso", value: calle });
    usedKeys.add("fa_nombre_calle_acceso");
  }
  const sinCalle = String(payload.fa_sin_calle_detalle ?? "").trim();
  if (sinCalle) {
    lines.push({ label: "Acceso sin calle (jardín, patio, etc.)", value: sinCalle });
    usedKeys.add("fa_sin_calle_detalle");
  }
  const quien = String(payload.fa_quien_llama ?? "").trim();
  if (quien) {
    lines.push({ label: "¿Quién llama?", value: quien });
    usedKeys.add("fa_quien_llama");
  }
  return { lines, usedKeys };
}

function appendFachadasSpectator(payload: Record<string, unknown>): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  const { lines, usedKeys } = appendFachadasCoreSpectator(payload);
  markPrefixKeys(payload, "fa_", usedKeys);
  return { lines, usedKeys };
}

function appendAccesoViviendaSpectator(payload: Record<string, unknown>): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  const { lines, usedKeys } = appendFachadasCoreSpectator(payload);
  const mot = payload.fa_motivo_llamada;
  if (mot === "sin_noticias" || mot === "socorro" || mot === "otro") {
    lines.push({ label: "Motivo de la llamada", value: fmtFachadasMotivo(String(mot)) });
    usedKeys.add("fa_motivo_llamada");
  }
  const motOtro = String(payload.fa_motivo_otro_desc ?? "").trim();
  if (motOtro) {
    lines.push({ label: "Motivo (otro, detalle)", value: motOtro });
    usedKeys.add("fa_motivo_otro_desc");
  }
  markPrefixKeys(payload, "fa_", usedKeys);
  return { lines, usedKeys };
}

export function appendIncidentSpecificDisplayLines(
  incidentKey: IncidentKey | null,
  payload: Record<string, unknown>
): { lines: { label: string; value: string }[]; usedKeys: Set<string> } {
  if (incidentKey === "accidente_trafico") return appendTrafficSpectator(payload);
  if (incidentKey === "rescate") return appendAquaticSpectator(payload);
  if (incidentKey === "fachadas") return appendFachadasSpectator(payload);
  if (incidentKey === "acceso_vivienda") return appendAccesoViviendaSpectator(payload);
  return { lines: [], usedKeys: new Set<string>() };
}

function isStoredSpecificKey(k: string): boolean {
  return k.startsWith("at_") || k.startsWith("ra_") || k.startsWith("fa_");
}

export function genericIncidentDisplayLines(
  incidentKey: IncidentKey | null,
  payload: Record<string, unknown>
): { label: string; value: string }[] {
  const { lines, usedKeys } = appendContactosLines(payload);
  const out = [...lines];
  const used = new Set(usedKeys);

  for (const { key, label } of UBICACION_LABELS) {
    const raw = payload[key];
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw === "object") continue;
    used.add(key);
    const v = key === "ubicacion_zona" ? fmtUbicacionZona(String(raw)) : String(raw);
    if (!v) continue;
    out.push({ label, value: v });
  }

  const spec = appendIncidentSpecificDisplayLines(incidentKey, payload);
  out.push(...spec.lines);
  for (const k of spec.usedKeys) used.add(k);

  const obs = payload.observaciones ?? payload.notas;
  if (typeof obs === "string" && obs.trim()) {
    out.push({ label: "Observaciones", value: obs.trim() });
    used.add("observaciones");
    used.add("notas");
  }

  const skip = new Set(["_raw", "_formVersion", ...used]);
  for (const [k, val] of Object.entries(payload)) {
    if (skip.has(k)) continue;
    if (isStoredSpecificKey(k)) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    out.push({ label: k.replace(/_/g, " "), value: String(val) });
  }

  return out;
}

export function mapsQueryFromAnyPayload(payload: Record<string, unknown>): string | null {
  return buildMapsQueryFromUbicacion(ubicacionFromPayload(payload));
}
