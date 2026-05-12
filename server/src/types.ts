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

export type CallRecord = {
  id: string;
  incidentKey: IncidentKey;
  createdAt: string;
  updatedAt: string;
  /** Hora fijada al iniciar (ISO) */
  callTime?: string;
  payload: Record<string, unknown>;
};

export type ActiveDraft = {
  incidentKey: IncidentKey | null;
  callTime: string | null;
  payload: Record<string, unknown>;
  updatedAt: string;
  updatedBy?: string;
};
