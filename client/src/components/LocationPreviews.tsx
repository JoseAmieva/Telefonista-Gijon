import LocationDualPanel from "./maps/LocationDualPanel";
import { buildMapsQueryFromUbicacion, type UbicacionSlice } from "../incidents/maps";

export function LocationPreviews({ ubicacion }: { ubicacion: UbicacionSlice }) {
  const query = buildMapsQueryFromUbicacion(ubicacion);
  return <LocationDualPanel key={query} ubicacion={ubicacion} />;
}
