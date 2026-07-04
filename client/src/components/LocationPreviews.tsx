import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { UbicacionSlice } from "../incidents/maps";
import { buildMapsUrlFromUbicacion } from "../incidents/maps";
import {
  buildCatastroMapaUrl,
  buildCatastroVisor3dUrl,
} from "../incidents/catastro";
import { useLocationGeo } from "../hooks/useLocationGeo";
import type { GeoCoords } from "../hooks/useLocationGeo";

const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapRecenter({ coords }: { coords: GeoCoords }) {
  const map = useMap();
  useEffect(() => {
    map.setView([coords.lat, coords.lon], 17, { animate: false });
  }, [coords.lat, coords.lon, map]);
  return null;
}

function CatastroWmsLayer() {
  const map = useMap();
  useEffect(() => {
    const layer = L.tileLayer.wms("http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx", {
      layers: "Catastro",
      format: "image/png",
      transparent: true,
      version: "1.1.1",
      opacity: 0.9,
    });
    layer.addTo(map);
    return () => {
      map.removeLayer(layer);
    };
  }, [map]);
  return null;
}

function MiniMap({
  coords,
  catastroLayer,
  label,
}: {
  coords: GeoCoords;
  catastroLayer?: boolean;
  label: string;
}) {
  return (
    <MapContainer
      center={[coords.lat, coords.lon]}
      zoom={17}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
      zoomControl={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#e2e8f0" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {catastroLayer && <CatastroWmsLayer />}
      <MapRecenter coords={coords} />
      <Marker position={[coords.lat, coords.lon]} icon={markerIcon} />
      <span className="sr-only">{label}</span>
    </MapContainer>
  );
}

function PreviewCard({
  title,
  subtitle,
  href,
  coords,
  catastroLayer,
  badge,
}: {
  title: string;
  subtitle?: string;
  href: string;
  coords: GeoCoords | null;
  catastroLayer?: boolean;
  badge?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-slate-300 overflow-hidden bg-white shadow-sm hover:border-slate-500 hover:shadow-md transition"
    >
      <div className="relative h-44 sm:h-52 bg-slate-100">
        {coords ? (
          <MiniMap coords={coords} catastroLayer={catastroLayer} label={title} />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500 px-4 text-center">
            Complete la dirección para ver la miniatura
          </div>
        )}
        {badge && (
          <span className="absolute top-2 right-2 rounded-md bg-slate-900/85 text-white text-xs font-semibold px-2 py-1">
            {badge}
          </span>
        )}
        <span className="absolute bottom-2 left-2 rounded-md bg-white/90 text-slate-800 text-xs font-medium px-2 py-1 shadow">
          Abrir ↗
        </span>
      </div>
      <div className="px-3 py-2 border-t border-slate-200">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {subtitle && <p className="text-xs text-slate-600 mt-0.5 truncate">{subtitle}</p>}
      </div>
    </a>
  );
}

export function LocationPreviews({ ubicacion }: { ubicacion: UbicacionSlice }) {
  const { query, coords, catastro, loading } = useLocationGeo(ubicacion);
  const mapsUrl = buildMapsUrlFromUbicacion(ubicacion);
  const catastro3dUrl = catastro?.refcat
    ? buildCatastroVisor3dUrl(catastro.refcat, catastro.del, catastro.mun)
    : buildCatastroMapaUrl(ubicacion) ?? "https://www1.sedecatastro.gob.es/CYCBienInmueble/OVCBusqueda.aspx";

  if (!query || query.length < 8) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Ubicación en mapa</p>
      {loading && <p className="text-xs text-slate-500">Cargando miniaturas…</p>}
      <div className="grid sm:grid-cols-2 gap-3">
        <PreviewCard
          title="Google Maps"
          subtitle={query}
          href={mapsUrl ?? "#"}
          coords={coords}
        />
        <PreviewCard
          title="Catastro"
          subtitle={catastro?.refcat ? `Ref. ${catastro.refcat}` : "Mapa y visor 3D"}
          href={catastro3dUrl}
          coords={coords}
          catastroLayer
          badge="3D"
        />
      </div>
    </div>
  );
}
