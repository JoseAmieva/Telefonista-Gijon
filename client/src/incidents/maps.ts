import type { ZonaUbicacion } from "./sharedBasics";

const GIJON_SUFFIX = "Gijón, Asturias, España";

export type UbicacionSlice = {
  ubicacion_zona: ZonaUbicacion;
  urb_calle: string;
  urb_portal: string;
  urb_piso: string;
  urb_puerta: string;
  urb_barrio: string;
  urb_calle_aneja: string;
  rur_via: string;
  rur_parroquia: string;
  rur_via_aneja: string;
};

export function ubicacionFromPayload(p: Record<string, unknown>): UbicacionSlice {
  return {
    ubicacion_zona: (String(p.ubicacion_zona ?? "") || "") as ZonaUbicacion,
    urb_calle: String(p.urb_calle ?? ""),
    urb_portal: String(p.urb_portal ?? ""),
    urb_piso: String(p.urb_piso ?? ""),
    urb_puerta: String(p.urb_puerta ?? ""),
    urb_barrio: String(p.urb_barrio ?? ""),
    urb_calle_aneja: String(p.urb_calle_aneja ?? ""),
    rur_via: String(p.rur_via ?? ""),
    rur_parroquia: String(p.rur_parroquia ?? ""),
    rur_via_aneja: String(p.rur_via_aneja ?? ""),
  };
}

export function buildMapsQueryFromUbicacion(state: UbicacionSlice): string | null {
  if (state.ubicacion_zona === "urbana") {
    const parts = [
      state.urb_calle,
      state.urb_portal && String(state.urb_portal).trim(),
      state.urb_piso && `piso ${state.urb_piso}`,
      state.urb_puerta && `puerta ${state.urb_puerta}`,
      state.urb_barrio,
      state.urb_calle_aneja && `calle aneja: ${state.urb_calle_aneja}`,
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return `${parts.join(", ")}, ${GIJON_SUFFIX}`;
  }
  if (state.ubicacion_zona === "rural") {
    const parts = [
      state.rur_via,
      state.rur_parroquia && `parroquia ${state.rur_parroquia}`,
      state.rur_via_aneja && `vía aneja: ${state.rur_via_aneja}`,
    ].filter(Boolean);
    if (parts.length === 0) return null;
    return `${parts.join(", ")}, ${GIJON_SUFFIX}`;
  }
  return null;
}

export function buildMapsUrlFromUbicacion(state: UbicacionSlice): string | null {
  const q = buildMapsQueryFromUbicacion(state);
  if (!q || q.length < 8) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function buildMapsUrlFromPayload(p: Record<string, unknown>): string | null {
  return buildMapsUrlFromUbicacion(ubicacionFromPayload(p));
}

/** @deprecated use buildMapsUrlFromUbicacion */
export function buildMapsUrlFromStructural(state: UbicacionSlice): string | null {
  return buildMapsUrlFromUbicacion(state);
}

export function buildMapsQueryFromStructural(state: UbicacionSlice): string | null {
  return buildMapsQueryFromUbicacion(state);
}
