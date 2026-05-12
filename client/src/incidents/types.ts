export type IncidentKey =
  | "incendio_estructural"
  | "incendio_forestal"
  | "incendio_vehiculo"
  | "accidente_trafico"
  | "rescate"
  | "acceso_vivienda"
  | "fachadas"
  | "helicopteros"
  | "otros";

export const INCIDENT_LABEL: Record<IncidentKey, string> = {
  incendio_estructural: "Incendio estructural",
  incendio_forestal: "Incendio forestal",
  incendio_vehiculo: "Incendio en vehículo",
  accidente_trafico: "Accidente de tráfico",
  rescate: "Rescate",
  acceso_vivienda: "Acceso a vivienda",
  fachadas: "Fachadas",
  helicopteros: "Helicópteros",
  otros: "Otros",
};

/** Color de fondo modo espectador (identificación rápida) */
export const INCIDENT_SPECTATOR_BG: Record<IncidentKey, string> = {
  incendio_estructural: "bg-rose-100 border-rose-300",
  incendio_forestal: "bg-emerald-100 border-emerald-300",
  incendio_vehiculo: "bg-orange-100 border-orange-300",
  accidente_trafico: "bg-sky-100 border-sky-300",
  rescate: "bg-violet-100 border-violet-300",
  acceso_vivienda: "bg-amber-100 border-amber-300",
  fachadas: "bg-teal-100 border-teal-300",
  helicopteros: "bg-cyan-100 border-cyan-300",
  otros: "bg-slate-200 border-slate-400",
};

export const TELEFONISTA_ROWS: { label?: string; keys: IncidentKey[] }[] = [
  {
    label: "Incendios",
    keys: ["incendio_estructural", "incendio_forestal", "incendio_vehiculo"],
  },
  { keys: ["accidente_trafico", "rescate"] },
  { keys: ["acceso_vivienda", "fachadas"] },
  { keys: ["helicopteros"] },
  { keys: ["otros"] },
];
