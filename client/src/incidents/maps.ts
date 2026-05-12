import type { StructuralFormState } from "./structuralTypes";

const GIJON_SUFFIX = "Gijón, Asturias, España";

export function buildMapsUrlFromStructural(state: StructuralFormState): string | null {
  const q = buildMapsQueryFromStructural(state);
  if (!q || q.length < 8) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

export function buildMapsQueryFromStructural(state: StructuralFormState): string | null {
  if (state.ubicacion_zona === "urbana") {
    const parts = [
      state.urb_calle,
      state.urb_portal && `portal ${state.urb_portal}`,
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
