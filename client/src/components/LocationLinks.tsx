import type { UbicacionSlice } from "../incidents/maps";
import { buildMapsUrlFromUbicacion } from "../incidents/maps";
import { buildCatastroMapaUrl, buildCatastroVisorUrl } from "../incidents/catastro";
import { useLocationGeo } from "../hooks/useLocationGeo";

export function LocationLinks({ ubicacion }: { ubicacion: UbicacionSlice }) {
  const { catastro } = useLocationGeo(ubicacion);
  const mapsUrl = buildMapsUrlFromUbicacion(ubicacion);
  const catastroMapaUrl = buildCatastroMapaUrl(ubicacion, catastro);
  const visor3dUrl = buildCatastroVisorUrl(catastro);

  if (!mapsUrl && !catastroMapaUrl && !visor3dUrl) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-3 text-sm">
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="font-medium text-central-navy underline hover:text-central-amber">
          Abrir en Google Maps ↗
        </a>
      )}
      {catastroMapaUrl && (
        <a href={catastroMapaUrl} target="_blank" rel="noreferrer" className="font-semibold text-central-amber underline hover:text-[#9a6119]">
          Abrir mapa Catastro ↗
        </a>
      )}
      {visor3dUrl && (
        <a href={visor3dUrl} target="_blank" rel="noreferrer" className="font-semibold text-central-navy underline hover:text-central-amber">
          Abrir visor 3D ↗
        </a>
      )}
    </div>
  );
}
