import { ubicacionFromPayload, buildMapsQueryFromUbicacion } from "./maps";

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

export function genericIncidentDisplayLines(payload: Record<string, unknown>): { label: string; value: string }[] {
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

  const obs = payload.observaciones ?? payload.notas;
  if (typeof obs === "string" && obs.trim()) {
    out.push({ label: "Observaciones", value: obs.trim() });
    used.add("observaciones");
    used.add("notas");
  }

  const skip = new Set(["_raw", "_formVersion", ...used]);
  for (const [k, val] of Object.entries(payload)) {
    if (skip.has(k)) continue;
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") continue;
    out.push({ label: k.replace(/_/g, " "), value: String(val) });
  }

  return out;
}

export function mapsQueryFromAnyPayload(payload: Record<string, unknown>): string | null {
  return buildMapsQueryFromUbicacion(ubicacionFromPayload(payload));
}
