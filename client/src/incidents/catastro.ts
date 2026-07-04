import type { UbicacionSlice } from "./maps";

/** Asturias / Gijón en la Sede Electrónica del Catastro. */
export const GIJON_CATASTRO = {
  provincia: "ASTURIAS",
  municipio: "GIJON",
  prov: "33",
  mun: "30",
  del: "33",
  descProv: "ASTURIAS",
  descMuni: "GIJON",
} as const;

export type CatastroLookupResult = {
  refcat: string;
  del: string;
  mun: string;
  direccion?: string;
};

function streetNameFromUbicacion(state: UbicacionSlice): string {
  if (state.ubicacion_zona === "urbana") return state.urb_calle.trim();
  return state.rur_via.trim();
}

function portalFromUbicacion(state: UbicacionSlice): string {
  if (state.ubicacion_zona === "urbana") return state.urb_portal.trim();
  return "";
}

/** Enlace al mapa catastral 2D centrado en la dirección urbana. */
export function buildCatastroMapaUrl(state: UbicacionSlice): string | null {
  const via = streetNameFromUbicacion(state);
  const numero = portalFromUbicacion(state);
  if (!via || via.length < +2) return null;

  const p = new URLSearchParams({
    pest: "urbana",
    from: "OVCBusqueda",
    via,
    tipoVia: "CL",
    numero: numero || "0",
    DescProv: GIJON_CATASTRO.descProv,
    prov: GIJON_CATASTRO.prov,
    mun: GIJON_CATASTRO.mun,
    DescMuni: GIJON_CATASTRO.descMuni,
    TipUR: "U",
  });
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?${p.toString()}`;
}

/** Visor 3D del edificio cuando se conoce la referencia catastral. */
export function buildCatastroVisor3dUrl(refcat: string, del?: string, mun?: string): string {
  const p = new URLSearchParams({
    del: del ?? GIJON_CATASTRO.del,
    mun: mun ?? GIJON_CATASTRO.mun,
    refcat: refcat.replace(/\s+/g, ""),
  });
  return `https://www1.sedecatastro.gob.es/Cartografia/FXCC/Visor3D.aspx?${p.toString()}`;
}

/** Búsqueda general en la sede (sin dirección prefijada). */
export function buildCatastroBusquedaUrl(): string {
  return "https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBusqueda.aspx";
}

/** Mejor enlace disponible: 3D si hay refcat, si no mapa 2D o buscador. */
export function buildCatastroUrl(
  state: UbicacionSlice,
  lookup?: CatastroLookupResult | null
): string {
  if (lookup?.refcat) {
    return buildCatastroVisor3dUrl(lookup.refcat, lookup.del, lookup.mun);
  }
  return buildCatastroMapaUrl(state) ?? buildCatastroBusquedaUrl();
}

/** WMS catastro (imagen estática) alrededor de un punto UTM zona 30 (EPSG:25830). */
export function buildCatastroWmsImageUrl(utm: { x: number; y: number }, size = 400): string {
  const half = 120;
  const bbox = `${utm.x - half},${utm.y - half},${utm.x + half},${utm.y + half}`;
  const p = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "Catastro",
    STYLES: "default",
    FORMAT: "image/png",
    SRS: "EPSG:25830",
    BBOX: bbox,
    WIDTH: String(size),
    HEIGHT: String(Math.round(size * 0.7)),
  });
  return `http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx?${p.toString()}`;
}
