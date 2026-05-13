import { normalizeSharedRootFromPayload } from "./sharedBasics";
import { emptyStructuralForm, type StructuralFormState } from "./structuralTypes";

export function mergeStructuralInitial(
  initial?: Partial<StructuralFormState> & { telefono_alertante?: string; notas?: string }
): StructuralFormState {
  const base = emptyStructuralForm();
  if (!initial) return base;

  const norm = normalizeSharedRootFromPayload(initial as Record<string, unknown>);
  const { telefono_alertante, notas, ...rest } = initial;

  const next: StructuralFormState = { ...base, ...(rest as Partial<StructuralFormState>) };

  if (norm.contactos && norm.contactos.length > 0) {
    next.contactos = norm.contactos;
  }
  if (typeof norm.observaciones === "string" && norm.observaciones) {
    next.observaciones = norm.observaciones;
  } else if (typeof notas === "string" && notas.trim()) {
    next.observaciones = notas;
  }

  const hasPhone = next.contactos.some((c) => c.telefono.trim());
  if (!hasPhone && typeof telefono_alertante === "string" && telefono_alertante.trim()) {
    next.contactos = [{ telefono: telefono_alertante.trim(), rol: "" }];
  }

  return next;
}
