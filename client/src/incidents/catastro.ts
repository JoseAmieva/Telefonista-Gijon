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
  refcatCompleta?: string;
  del: string;
  mun: string;
  direccion?: string;
  mapaUrl?: string;
  visor3dUrl?: string;
};

function refcatEdificio(refcat: string): string {
  const ref = refcat.replace(/\s/g, "");
  return ref.length > 14 ? ref.slice(0, 14) : ref;
}

/** Enlace al mapa catastral 2D (parcela/edificio). */
export function buildCatastroMapaUrlFromLookup(lookup?: CatastroLookupResult | null): string | null {
  if (lookup?.mapaUrl) return lookup.mapaUrl;
  const ref = lookup?.refcatCompleta || lookup?.refcat;
  if (!ref) return null;
  return `https://www1.sedecatastro.gob.es/Cartografia/mapa.aspx?refcat=${encodeURIComponent(ref.replace(/\s/g, ""))}`;
}

/** Visor 3D del edificio cuando se conoce la referencia catastral. */
export function buildCatastroVisor3dUrl(
  refcat: string,
  del?: string,
  mun?: string,
  refcatCompleta?: string
): string | null {
  const d = (del ?? GIJON_CATASTRO.del).trim();
  const m = (mun ?? GIJON_CATASTRO.mun).trim();
  const ref = (refcatCompleta || refcatEdificio(refcat)).replace(/\s/g, "");
  if (!d || !m || !ref) return null;
  const p = new URLSearchParams({ del: d, mun: m, refcat: ref, final: "" });
  return `https://www1.sedecatastro.gob.es/Cartografia/FXCC/Visor3D.aspx?${p.toString()}`;
}

/** Mejor enlace 2D disponible. */
export function buildCatastroMapaUrl(
  _state: UbicacionSlice,
  lookup?: CatastroLookupResult | null
): string | null {
  return buildCatastroMapaUrlFromLookup(lookup);
}

/** Mejor enlace 3D disponible. */
export function buildCatastroVisorUrl(lookup?: CatastroLookupResult | null): string | null {
  if (lookup?.visor3dUrl) return lookup.visor3dUrl;
  if (!lookup?.refcat) return null;
  return buildCatastroVisor3dUrl(lookup.refcat, lookup.del, lookup.mun, lookup.refcatCompleta);
}

/** @deprecated use buildCatastroMapaUrl / buildCatastroVisorUrl */
export function buildCatastroUrl(
  state: UbicacionSlice,
  lookup?: CatastroLookupResult | null
): string | null {
  return buildCatastroVisorUrl(lookup) ?? buildCatastroMapaUrl(state, lookup);
}

/** @deprecated use server proxy apiCatastroWms */
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
