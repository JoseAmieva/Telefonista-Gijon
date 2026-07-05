import { useEffect, useState } from "react";
import { buildMapsQueryFromUbicacion, type UbicacionSlice } from "../incidents/maps";
import type { CatastroLookupResult } from "../api";
import { apiCatastroLookup, apiCatastroLookupCoords } from "../api";

export type GeoCoords = { lat: number; lon: number };

const UA = { "User-Agent": "CentralitaGijon/1.0 (uso interno parque de bomberos)" };

async function geocodeQuery(query: string): Promise<GeoCoords | null> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "es");
  const r = await fetch(url.toString(), { headers: UA });
  if (!r.ok) return null;
  const data = (await r.json()) as { lat?: string; lon?: string }[];
  const hit = data[0];
  if (!hit?.lat || !hit?.lon) return null;
  return { lat: Number(hit.lat), lon: Number(hit.lon) };
}

export function useLocationGeo(state: UbicacionSlice) {
  const query = buildMapsQueryFromUbicacion(state);
  const calle = state.ubicacion_zona === "urbana" ? state.urb_calle.trim() : state.rur_via.trim();
  const numero = state.ubicacion_zona === "urbana" ? state.urb_portal.trim() : "";
  const piso = state.ubicacion_zona === "urbana" ? state.urb_piso.trim() : "";
  const puerta = state.ubicacion_zona === "urbana" ? state.urb_puerta.trim() : "";

  const [coords, setCoords] = useState<GeoCoords | null>(null);
  const [catastro, setCatastro] = useState<CatastroLookupResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.length < 8) {
      setCoords(null);
      setCatastro(null);
      return;
    }

    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const geo = await geocodeQuery(query);
        let cat: CatastroLookupResult | null = null;

        if (calle.length >= 2) {
          cat = await apiCatastroLookup(calle, numero, piso, puerta).catch(() => null);
        }
        if (!cat && geo) {
          cat = await apiCatastroLookupCoords(geo.lat, geo.lon).catch(() => null);
        }

        if (!cancelled) {
          setCoords(geo);
          setCatastro(cat);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [query, calle, numero, piso, puerta]);

  return { query, coords, catastro, loading };
}
