import { Btn, Label } from "./ui";
import type { ContactoTelefono } from "../incidents/sharedBasics";

export function ContactosTelefono({
  contactos,
  onChange,
}: {
  contactos: ContactoTelefono[];
  onChange: (next: ContactoTelefono[]) => void;
}) {
  function patch(i: number, field: keyof ContactoTelefono, v: string) {
    const next = contactos.map((c, j) => (j === i ? { ...c, [field]: v } : c));
    onChange(next);
  }

  return (
    <div className="space-y-4">
      {contactos.map((c, i) => (
        <div key={i} className="rounded-lg border border-slate-200 p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-medium text-slate-800">Teléfono {i + 1}</p>
            {contactos.length > 1 && (
              <Btn
                type="button"
                variant="ghost"
                className="text-red-700"
                onClick={() => onChange(contactos.filter((_, j) => j !== i))}
              >
                Quitar
              </Btn>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Número</Label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={c.telefono}
                onChange={(e) => patch(i, "telefono", e.target.value)}
                inputMode="tel"
              />
            </div>
            <div>
              <Label>Rol o nombre (quién tiene ese teléfono)</Label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                value={c.rol}
                onChange={(e) => patch(i, "rol", e.target.value)}
                placeholder="Ej. alertante, familiar, 112…"
              />
            </div>
          </div>
        </div>
      ))}
      <Btn type="button" variant="secondary" onClick={() => onChange([...contactos, { telefono: "", rol: "" }])}>
        Añadir otro teléfono
      </Btn>
    </div>
  );
}
