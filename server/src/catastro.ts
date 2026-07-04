const CALLEJERO_JSON =
  "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/json";

const WMS_BASE = "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx";

export type CatastroLookup = {
  refcat: string;
  refcatCompleta?: string;
  del: string;
  mun: string;
  direccion?: string;
  visor3dUrl?: string;
};

function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

function normCalle(s: string): string {
  return stripAccents(s)
    .toUpperCase()
    .replace(/^CALLE\s+(DE\s+)?/i, "")
    .replace(/^AVENIDA\s+(DE\s+)?/i, "")
    .replace(/^PASEO\s+(DE\s+)?/i, "")
    .trim();
}

function normPuerta(p: string): string {
  if (!p) return "";
  const u = stripAccents(p).toUpperCase().trim();
  if (u === "IZQ" || u === "IZQUIERDA") return "IZ";
  if (u === "DCHA" || u === "DERECHA") return "D";
  if (/^\d+$/.test(u)) return u.padStart(2, "0");
  if (u.length === 1) return `0${u}`;
  return u;
}

function normPlanta(p: string): string {
  const n = p.replace(/\D/g, "");
  return n ? n.padStart(2, "0") : "";
}

function buildRc(pc1?: string, pc2?: string, car?: string): string {
  const base = `${pc1 ?? ""}${pc2 ?? ""}`;
  return car ? `${base}${car}` : base;
}

function buildVisor3DUrl(del: string, mun: string, refcat: string): string {
  const p = new URLSearchParams({ del, mun, refcat: refcat.replace(/\s/g, ""), final: "" });
  return `https://www1.sedecatastro.gob.es/Cartografia/FXCC/Visor3D.aspx?${p.toString()}`;
}

function codesFromIgraf(url?: string): { del: string; mun: string } {
  if (!url) return { del: "", mun: "" };
  try {
    const u = new URL(url);
    return { del: u.searchParams.get("del") ?? "", mun: u.searchParams.get("mun") ?? "" };
  } catch {
    return { del: "", mun: "" };
  }
}

function parseBi(bi: Record<string, unknown>): CatastroLookup | null {
  const idbi = bi.idbi as Record<string, unknown> | undefined;
  const rc = idbi?.rc as Record<string, string> | undefined;
  if (!rc?.pc1 || !rc?.pc2) return null;

  const finca = bi.finca as Record<string, unknown> | undefined;
  const infgraf = finca?.infgraf as Record<string, string> | undefined;
  const loine = (bi.dt as Record<string, unknown> | undefined)?.loine as Record<string, string> | undefined;
  const fromIgraf = codesFromIgraf(infgraf?.igraf);
  const del = loine?.cp || fromIgraf.del || "33";
  const mun = loine?.cm || fromIgraf.mun || "30";
  const refcat = buildRc(rc.pc1, rc.pc2);
  const refcatCompleta = buildRc(rc.pc1, rc.pc2, rc.car);

  return {
    refcat,
    refcatCompleta,
    del,
    mun,
    direccion: String(bi.ldt ?? ""),
    visor3dUrl: buildVisor3DUrl(del, mun, refcatCompleta || refcat),
  };
}

function parseDnploc(data: Record<string, unknown>): CatastroLookup {
  const r = data.consulta_dnplocResult as Record<string, unknown> | undefined;
  if (!r) throw new Error("Respuesta catastro vacía");

  const control = r.control as Record<string, number> | undefined;
  const lerr = r.lerr as { des?: string }[] | undefined;
  if (control && control.cuerr > 0 && lerr?.length) {
    throw new Error(lerr[0].des || "No encontrado en catastro");
  }

  const bi = (r.bico as Record<string, unknown> | undefined)?.bi as Record<string, unknown> | undefined;
  if (!bi) {
    const n = (r.lrcdnp as Record<string, unknown> | undefined)?.rcdnp;
    const count = Array.isArray(n) ? n.length : n ? 1 : 0;
    if (count > 1) throw new Error("Varios inmuebles en esa dirección. Indica piso y puerta.");
    throw new Error("Sin datos catastrales para esa dirección");
  }

  const parsed = parseBi(bi);
  if (!parsed) throw new Error("Referencia catastral no válida");
  return parsed;
}

async function fetchJson(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Catastro HTTP ${res.status}`);
  return JSON.parse(text) as Record<string, unknown>;
}

export async function lookupCatastroByAddress(
  calle: string,
  numero: string,
  piso = "",
  puerta = ""
): Promise<CatastroLookup | null> {
  const route = normCalle(calle);
  if (route.length < 2) return null;

  const params = new URLSearchParams({
    Provincia: "ASTURIAS",
    Municipio: "GIJON",
    Sigla: "CL",
    Calle: route,
    Numero: (numero.trim() || "0").replace(/\D/g, "") || "0",
  });
  const pl = normPlanta(piso);
  const pt = normPuerta(puerta);
  if (pl) params.set("Planta", pl);
  if (pt) params.set("Puerta", pt);

  try {
    const data = await fetchJson(`${CALLEJERO_JSON}/Consulta_DNPLOC?${params.toString()}`);
    return parseDnploc(data);
  } catch {
    return null;
  }
}

export function getCatastroMapBbox(lat: number, lon: number) {
  const dx = 0.0014;
  const dy = 0.00085;
  return {
    minLon: lon - dx,
    minLat: lat - dy,
    maxLon: lon + dx,
    maxLat: lat + dy,
  };
}

export async function fetchCatastroWmsImage(lat: number, lon: number): Promise<Buffer | null> {
  const bbox = getCatastroMapBbox(lat, lon);
  const q = new URLSearchParams({
    SERVICE: "WMS",
    REQUEST: "GetMap",
    VERSION: "1.1.1",
    LAYERS: "Catastro",
    STYLES: "",
    SRS: "EPSG:4326",
    WIDTH: "640",
    HEIGHT: "400",
    BBOX: `${bbox.minLon},${bbox.minLat},${bbox.maxLon},${bbox.maxLat}`,
    FORMAT: "image/png",
  });

  const res = await fetch(`${WMS_BASE}?${q.toString()}`, { signal: AbortSignal.timeout(15_000) });
  if (!res.ok) return null;
  const buf = Buffer.from(await res.arrayBuffer());
  const ct = res.headers.get("content-type") ?? "";
  if (!ct.startsWith("image/")) return null;
  return buf;
}
