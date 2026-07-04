import type { UbicacionSlice } from "../incidents/maps";
import LocationDualPanel from "./maps/LocationDualPanel";

export function LocationPreviews({ ubicacion }: { ubicacion: UbicacionSlice }) {
  return <LocationDualPanel ubicacion={ubicacion} />;
}
