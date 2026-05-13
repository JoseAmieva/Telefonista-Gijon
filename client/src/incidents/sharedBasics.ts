export type ZonaUbicacion = "urbana" | "rural" | "";

export type ContactoTelefono = {
  telefono: string;
  rol: string;
};

/** Campos comunes a todos los siniestros */
export type SharedRootFieldsState = {
  contactos: ContactoTelefono[];
  observaciones: string;
  ubicacion_zona: ZonaUbicacion;
  urb_calle: string;
  urb_portal: string;
  urb_piso: string;
  urb_puerta: string;
  urb_barrio: string;
  urb_calle_aneja: string;
  rur_via: string;
  rur_parroquia: string;
  rur_via_aneja: string;
};

export function emptySharedRoot(): SharedRootFieldsState {
  return {
    contactos: [{ telefono: "", rol: "" }],
    observaciones: "",
    ubicacion_zona: "",
    urb_calle: "",
    urb_portal: "",
    urb_piso: "",
    urb_puerta: "",
    urb_barrio: "",
    urb_calle_aneja: "",
    rur_via: "",
    rur_parroquia: "",
    rur_via_aneja: "",
  };
}

/** Migra teléfono único antiguo y notas a contactos/observaciones */
export function normalizeSharedRootFromPayload(p: Record<string, unknown>): Partial<SharedRootFieldsState> {
  const out: Partial<SharedRootFieldsState> = {};
  const rawC = p.contactos;
  if (Array.isArray(rawC) && rawC.length > 0) {
    out.contactos = rawC.map((x) => {
      const o = x as { telefono?: unknown; rol?: unknown };
      return { telefono: String(o.telefono ?? ""), rol: String(o.rol ?? "") };
    });
  } else if (typeof p.telefono_alertante === "string" && p.telefono_alertante.trim()) {
    out.contactos = [{ telefono: p.telefono_alertante.trim(), rol: "" }];
  }
  const obs = p.observaciones ?? p.notas;
  if (typeof obs === "string") out.observaciones = obs;
  return out;
}
