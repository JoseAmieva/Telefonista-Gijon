import type { UbicacionSlice } from "../incidents/maps";
import { buildMapsUrlFromUbicacion } from "../incidents/maps";
import { buildCatastroUrl } from "../incidents/catastro";
import { useLocationGeo } from "../hooks/useLocationGeo";

export function LocationLinks({ ubicacion }: { ubicacion: UbicacionSlice }) {
  const { catastro } = useLocationGeo(ubicacion);
  const mapsUrl = buildMapsUrlFromUbicacion(ubicacion);
  const catastroUrl = buildCatastroUrl(ubicacion, catastro);

  if (!mapsUrl && !catastroUrl) return null;

  return (
    <div className="flex flex-wrap gap-4 mt-3 text-sm">
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-sky-800 underline hover:text-sky-950">
          Abrir en Google Maps ↗
        </a>
      )}
      {catastroUrl && (
        <a href={catastroUrl} target="_blank" rel="noreferrer" className="text-amber-900 underline hover:text-amber-950">
          Abrir en Catastro {catastro?.refcat ? "(visor 3D)" : "↗"}
        </a>
      )}
    </div>
  );
}
