import { emptySharedRoot, normalizeSharedRootFromPayload, type SharedRootFieldsState } from "./sharedBasics";
import { ubicacionFromPayload } from "./maps";

export function mergeSharedRootFromPayload(p: Record<string, unknown>): SharedRootFieldsState {
  const b = emptySharedRoot();
  const n = normalizeSharedRootFromPayload(p);
  const u = ubicacionFromPayload(p);
  return {
    ...b,
    ...u,
    contactos: n.contactos && n.contactos.length > 0 ? n.contactos : b.contactos,
    observaciones:
      typeof n.observaciones === "string"
        ? n.observaciones
        : typeof p.notas === "string"
          ? p.notas
          : b.observaciones,
  };
}
