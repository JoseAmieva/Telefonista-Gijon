import { useEffect, useRef, useState } from "react";

type NominatimItem = {
  display_name: string;
  address?: { road?: string; pedestrian?: string; neighbourhood?: string; suburb?: string };
};

const UA = { "User-Agent": "CentralitaGijon/1.0 (uso interno parque de bomberos)" };

export function StreetAutocomplete({
  value,
  onChange,
  id,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<string[]>([]);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const q = value.trim();
    if (debounce.current) clearTimeout(debounce.current);
    if (q.length < 3) {
      setItems([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const url = new URL("https://nominatim.openstreetmap.org/search");
        url.searchParams.set("format", "json");
        url.searchParams.set("addressdetails", "1");
        url.searchParams.set("limit", "8");
        url.searchParams.set("countrycodes", "es");
        url.searchParams.set("q", `${q}, Gijón, Asturias, España`);
        const r = await fetch(url.toString(), { headers: UA });
        if (!r.ok) throw new Error("nominatim");
        const data = (await r.json()) as NominatimItem[];
        const roads = new Set<string>();
        for (const it of data) {
          const road = it.address?.road || it.address?.pedestrian;
          if (road && road.toLowerCase().includes(q.toLowerCase())) roads.add(road);
          else if (it.display_name) {
            const first = it.display_name.split(",")[0]?.trim();
            if (first && first.length < 80) roads.add(first);
          }
        }
        const arr = [...roads].slice(0, 8);
        setItems(arr);
        setOpen(arr.length > 0);
      } catch {
        setItems([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [value]);

  return (
    <div ref={wrapRef} className="relative">
      <input
        id={id}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => items.length > 0 && setOpen(true)}
        autoComplete="off"
        placeholder={placeholder ?? "Empiece a escribir el nombre de la calle…"}
      />
      {loading && <p className="text-xs text-slate-500 mt-1">Buscando sugerencias…</p>}
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg text-sm">
          {items.map((s, idx) => (
            <li key={`${idx}-${s}`}>
              <button
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-slate-50"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
