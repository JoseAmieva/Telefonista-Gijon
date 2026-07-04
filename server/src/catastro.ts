const CATASTRO_REST =
  "http://ovc.catastro.meh.es/OVCServWeb/OVCWcfCallejero/COVCCallejero.svc/rest/Consulta_DNPLOC";

const GIJON = {
  Provincia: "ASTURIAS",
  Municipio: "GIJON",
  Sigla: "CL",
};

export type CatastroLookup = {
  refcat: string;
  del: string;
  mun: string;
  direccion?: string;
};

function pickTag(xml: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, "i");
  const m = xml.match(re);
  return m?.[1]?.trim() || undefined;
}

function parseCatastroXml(xml: string): CatastroLookup | null {
  const refcat =
    pickTag(xml, "pc1") && pickTag(xml, "pc2")
      ? `${pickTag(xml, "pc1")}${pickTag(xml, "pc2")}`
      : pickTag(xml, "refcat") ?? pickTag(xml, "rc");

  if (!refcat || refcat.length < 14) return null;

  const del = pickTag(xml, "de") ?? pickTag(xml, "cd") ?? "33";
  const mun = pickTag(xml, "mun") ?? pickTag(xml, "cmc") ?? "30";
  const ldt = pickTag(xml, "ldt");

  return { refcat, del, mun, direccion: ldt };
}

export async function lookupCatastroByAddress(calle: string, numero: string): Promise<CatastroLookup | null> {
  const street = calle.trim();
  if (street.length < 2) return null;

  const q = new URLSearchParams({
    ...GIJON,
    Calle: street.toUpperCase(),
    Numero: (numero.trim() || "0").replace(/\D/g, "") || "0",
  });

  const url = `${CATASTRO_REST}?${q.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/xml, text/xml, */*" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) return null;

  const xml = await res.text();
  if (/no se puede procesar|no existe|error/i.test(xml)) return null;
  return parseCatastroXml(xml);
}
