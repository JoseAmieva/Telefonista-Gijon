import { ubicacionFromPayload } from "./maps";
import type { IncidentKey } from "./types";
import { appendContactosLines, appendIncidentSpecificDisplayLines } from "./spectatorLabels";
import { fmtValue, STRUCTURAL_FIELD_ORDER } from "./structuralLabels";
import { fmtSiNo } from "./genericExtendedForm";

export type SpectatorLine = { label: string; value: string };

export type SpectatorSections = {
  address: { summary: string; details: SpectatorLine[] };
  victims: SpectatorLine[];
  description: SpectatorLine[];
  contacts: SpectatorLine[];
};

const STRUCTURAL_VICTIM_KEYS = new Set([
  "oc_mas_ocupantes",
  "oc_num_ocupantes",
  "oc_pueden_salir",
  "oc_cuantos_no_pueden",
  "oc_motivo_no_salir",
  "vm_oyen_gente",
]);

const STRUCTURAL_ADDRESS_KEYS = new Set([
  "ubicacion_zona",
  "urb_calle",
  "urb_portal",
  "urb_piso",
  "urb_puerta",
  "urb_barrio",
  "urb_calle_aneja",
  "rur_via",
  "rur_parroquia",
  "rur_via_aneja",
]);

function pushIf(lines: SpectatorLine[], label: string, raw: unknown) {
  if (raw === undefined || raw === null || raw === "") return;
  const v = String(raw).trim();
  if (!v) return;
  lines.push({ label, value: v });
}

function buildAddressFromPayload(payload: Record<string, unknown>): SpectatorSections["address"] {
  const u = ubicacionFromPayload(payload);
  const details: SpectatorLine[] = [];

  if (u.ubicacion_zona === "urbana") {
    const summaryParts = [
      u.urb_calle,
      u.urb_portal && `nº ${u.urb_portal}`,
      u.urb_piso && `${u.urb_piso}º`,
      u.urb_puerta && `pta. ${u.urb_puerta}`,
      u.urb_barrio,
    ].filter(Boolean);
    const summary = summaryParts.length ? `${summaryParts.join(", ")}, Gijón` : "—";

    pushIf(details, "Barrio", u.urb_barrio);
    pushIf(details, "Calle aneja", u.urb_calle_aneja);
    return { summary, details };
  }

  if (u.ubicacion_zona === "rural") {
    const summaryParts = [u.rur_via, u.rur_parroquia && `parr. ${u.rur_parroquia}`].filter(Boolean);
    const summary = summaryParts.length ? `${summaryParts.join(", ")}, Gijón (rural)` : "—";
    pushIf(details, "Vía aneja", u.rur_via_aneja);
    return { summary, details };
  }

  return { summary: "—", details: [] };
}

function compactContacts(payload: Record<string, unknown>): SpectatorLine[] {
  const { lines } = appendContactosLines(payload);
  const out: SpectatorLine[] = [];
  const raw = payload.contactos;
  if (Array.isArray(raw) && raw.length > 0) {
    raw.forEach((item, idx) => {
      const o = item as { telefono?: unknown; rol?: unknown };
      const tel = String(o.telefono ?? "").trim();
      const rol = String(o.rol ?? "").trim();
      if (!tel && !rol) return;
      const n = idx + 1;
      out.push({
        label: `Contacto ${n}`,
        value: [tel, rol].filter(Boolean).join(rol && tel ? " · " : ""),
      });
    });
  } else {
    for (const row of lines) out.push(row);
  }
  return out;
}

function trafficVictims(payload: Record<string, unknown>): SpectatorLine[] {
  const out: SpectatorLine[] = [];
  const pa = payload.at_personas_atrapadas;
  if (pa === "si" || pa === "no") {
    out.push({ label: "Personas atrapadas", value: fmtSiNo(String(pa)) });
  }
  if (pa === "si") {
    pushIf(out, "Número de atrapados", payload.at_num_atrapados);
    const mc = payload.at_atrapados_multiples_vehiculos;
    if (mc === "si" || mc === "no") {
      out.push({ label: "Atrapados en varios vehículos", value: fmtSiNo(String(mc)) });
    }
  }
  return out;
}

function trafficDescription(payload: Record<string, unknown>): SpectatorLine[] {
  const out: SpectatorLine[] = [];
  const used = new Set<string>([
    "at_personas_atrapadas",
    "at_num_atrapados",
    "at_atrapados_multiples_vehiculos",
  ]);
  const spec = appendIncidentSpecificDisplayLines("accidente_trafico", payload);
  for (const row of spec.lines) {
    if (used.has(row.label)) continue;
    if (/atrapad/i.test(row.label)) continue;
    out.push(row);
  }
  pushIf(out, "Observaciones", payload.observaciones ?? payload.notas);
  return out;
}

function aquaticVictims(payload: Record<string, unknown>): SpectatorLine[] {
  const out: SpectatorLine[] = [];
  pushIf(out, "Motivo de la ayuda", payload.ra_motivo_ayuda);
  const sen = payload.ra_hace_senales;
  if (sen === "si" || sen === "no") {
    out.push({ label: "Hace señales", value: fmtSiNo(String(sen)) });
  }
  return out;
}

function aquaticDescription(payload: Record<string, unknown>): SpectatorLine[] {
  const out: SpectatorLine[] = [];
  pushIf(out, "Equipación", payload.ra_equipacion);
  pushIf(out, "Observaciones", payload.observaciones ?? payload.notas);
  return out;
}

function genericVictims(incidentKey: IncidentKey | null, payload: Record<string, unknown>): SpectatorLine[] {
  if (incidentKey === "accidente_trafico") return trafficVictims(payload);
  if (incidentKey === "rescate") return aquaticVictims(payload);
  return [];
}

function genericDescription(incidentKey: IncidentKey | null, payload: Record<string, unknown>): SpectatorLine[] {
  if (incidentKey === "accidente_trafico") return trafficDescription(payload);
  if (incidentKey === "rescate") return aquaticDescription(payload);

  const out: SpectatorLine[] = [];
  const spec = appendIncidentSpecificDisplayLines(incidentKey, payload);
  out.push(...spec.lines);
  pushIf(out, "Observaciones", payload.observaciones ?? payload.notas);

  const used = new Set([
    ...Object.keys(payload).filter((k) => k.startsWith("urb_") || k.startsWith("rur_") || k === "ubicacion_zona"),
    "contactos",
    "telefono_alertante",
    "observaciones",
    "notas",
    "_formVersion",
    "_raw",
  ]);
  for (const [k, val] of Object.entries(payload)) {
    if (used.has(k)) continue;
    if (k.startsWith("at_") || k.startsWith("ra_")) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    out.push({ label: k.replace(/_/g, " "), value: String(val) });
  }
  return out;
}

function structuralSections(payload: Record<string, unknown>): SpectatorSections {
  const address = buildAddressFromPayload(payload);
  const victims: SpectatorLine[] = [];
  const description: SpectatorLine[] = [];
  const used = new Set<string>();

  for (const { key, label } of STRUCTURAL_FIELD_ORDER) {
    const raw = payload[key];
    if (raw === undefined || raw === null || raw === "") continue;
    if (typeof raw === "object") continue;
    const s = String(raw);
    used.add(key);

    if (STRUCTURAL_ADDRESS_KEYS.has(key)) continue;
    if (key === "observaciones") continue;

    const row = { label, value: fmtValue(key, s) };
    if (STRUCTURAL_VICTIM_KEYS.has(key)) victims.push(row);
    else description.push(row);
  }

  const obs = payload.observaciones ?? payload.notas;
  if (typeof obs === "string" && obs.trim()) {
    description.push({ label: "Observaciones", value: obs.trim() });
    used.add("observaciones");
    used.add("notas");
  }

  for (const [key, val] of Object.entries(payload)) {
    if (key === "_formVersion" || key === "_raw" || used.has(key)) continue;
    if (STRUCTURAL_ADDRESS_KEYS.has(key)) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    description.push({
      label: key === "telefono_alertante" ? "Teléfono (registro anterior)" : key.replace(/_/g, " "),
      value: String(val),
    });
  }

  return { address, victims, description, contacts: compactContacts(payload) };
}

export function buildSpectatorSections(
  incidentKey: IncidentKey | null,
  payload: Record<string, unknown>
): SpectatorSections {
  if (incidentKey === "incendio_estructural") return structuralSections(payload);

  return {
    address: buildAddressFromPayload(payload),
    victims: genericVictims(incidentKey, payload),
    description: genericDescription(incidentKey, payload),
    contacts: compactContacts(payload),
  };
}
