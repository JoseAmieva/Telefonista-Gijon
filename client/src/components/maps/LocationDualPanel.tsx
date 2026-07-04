import type { ReactNode } from "react";
import type { UbicacionSlice } from "../../incidents/maps";
import { buildMapsUrlFromUbicacion } from "../../incidents/maps";
import { buildCatastroMapaUrl, buildCatastroVisor3dUrl } from "../../incidents/catastro";
import { useLocationGeo } from "../../hooks/useLocationGeo";
import CanvasMap from "./CanvasMap";
import CatastroThumbnail from "./CatastroThumbnail";
import { theme } from "../../theme";

const MAP_H = 220;

function PanelLabel({ children }: { children: ReactNode }) {
  return (
    <div
      className="border-b px-3.5 py-2 text-[11px] font-semibold uppercase tracking-wider"
      style={{ background: "#F2EBD9", borderColor: theme.border, color: theme.muted }}
    >
      {children}
    </div>
  );
}

function Visor3DCard({ url }: { url: string }) {
  return (
    <div
      className="mt-3 overflow-hidden rounded-xl border"
      style={{ borderColor: theme.border, background: "linear-gradient(160deg, #1a3348 0%, #2d4a62 50%, #4a6278 100%)" }}
    >
      <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
        <div className="mb-3 text-3xl" aria-hidden>
          🏢
        </div>
        <p className="mb-4 max-w-md text-sm leading-relaxed text-white">
          Modelo 3D oficial del edificio (plantas, fachada). El visor del Catastro se abre en una pestaña nueva.
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold no-underline"
          style={{ color: theme.navy }}
        >
          Abrir visor 3D ↗
        </a>
      </div>
    </div>
  );
}

export default function LocationDualPanel({ ubicacion }: { ubicacion: UbicacionSlice }) {
  const { query, coords, catastro, loading } = useLocationGeo(ubicacion);
  const mapsUrl = buildMapsUrlFromUbicacion(ubicacion);
  const catastro3dUrl = catastro?.visor3dUrl
    ? catastro.visor3dUrl
    : catastro?.refcat
      ? buildCatastroVisor3dUrl(catastro.refcat, catastro.del, catastro.mun)
      : buildCatastroMapaUrl(ubicacion) ?? "https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBusqueda.aspx";

  if (!query || query.length < 8) return null;

  return (
    <div className="overflow-hidden rounded-2xl border shadow-sm" style={{ borderColor: theme.border, background: theme.card }}>
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-5 py-3"
        style={{ background: theme.navy }}
      >
        <span className="text-sm font-medium text-white">Ubicación — mapa y catastro</span>
        {coords && (
          <span className="font-mono text-[11px] text-[#96B4CC]">
            {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
          </span>
        )}
        {loading && <span className="text-[11px] text-[#96B4CC]">Actualizando…</span>}
      </div>

      <div className="grid sm:grid-cols-2">
        <div className="border-b sm:border-b-0 sm:border-r" style={{ borderColor: theme.border }}>
          <PanelLabel>Google Maps · vista calle</PanelLabel>
          <a href={mapsUrl ?? "#"} target="_blank" rel="noreferrer" className="block" title="Abrir en Google Maps">
            {coords ? (
              <CanvasMap lat={coords.lat} lon={coords.lon} height={MAP_H} />
            ) : (
              <div className="flex items-center justify-center text-sm text-[#7A8898]" style={{ height: MAP_H }}>
                Geocodificando…
              </div>
            )}
          </a>
        </div>

        <div>
          <PanelLabel>Catastro · plano parcelario</PanelLabel>
          <a href={catastro3dUrl} target="_blank" rel="noreferrer" className="relative block" title="Abrir catastro">
            {coords ? (
              <CatastroThumbnail lat={coords.lat} lon={coords.lon} height={MAP_H} />
            ) : (
              <div className="flex items-center justify-center text-sm text-[#7A8898]" style={{ height: MAP_H }}>
                Geocodificando…
              </div>
            )}
            <span
              className="pointer-events-none absolute right-2 top-2 rounded-md px-2 py-1 text-[11px] font-bold text-white"
              style={{ background: theme.amber }}
            >
              3D
            </span>
          </a>
        </div>
      </div>

      <div
        className="grid gap-2 border-t px-5 py-3 text-xs sm:grid-cols-2"
        style={{ borderColor: theme.border, background: "#F7F3EB", color: theme.muted }}
      >
        <a
          href={mapsUrl ?? "#"}
          target="_blank"
          rel="noreferrer"
          className="truncate font-medium no-underline hover:underline"
          style={{ color: theme.navy }}
        >
          {query} ↗
        </a>
        <a
          href={catastro3dUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold no-underline hover:underline"
          style={{ color: theme.amber }}
        >
          {catastro?.refcat ? `Ref. ${catastro.refcat} · Visor 3D` : "Abrir Catastro ↗"}
        </a>
      </div>

      {catastro?.visor3dUrl && (
        <div className="border-t px-4 py-3" style={{ borderColor: theme.border }}>
          <Visor3DCard url={catastro.visor3dUrl} />
        </div>
      )}
    </div>
  );
}
