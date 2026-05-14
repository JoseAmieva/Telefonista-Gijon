import { useEffect, useRef, useState } from "react";
import { normalizeStreetName, rankStreetCandidates, type StreetSuggestion } from "../utils/streetMatch";

type NominatimItem = {
  display_name: string;
  address?: { road?: string; pedestrian?: string; neighbourhood?: string; suburb?: string };
};

const UA = { "User-Agent": "CentralitaGijon/1.0 (uso interno parque de bomberos)" };

/** Gijón (aprox.): minLon, maxLat, maxLon, minLat — acota resultados a la ciudad. */
const GIJON_VIEWBOX = "-5.78,43.56,-5.62,43.48";

function collectRoadNames(data: NominatimItem[]): string[] {
  const out: string[] = [];
  for (const it of data) {
    const road = it.address?.road || it.address?.pedestrian;
    if (road && road.length > 1 && road.length < 120) out.push(road);
    else if (it.display_name) {
      const first = it.display_name.split(",")[0]?.trim();
      if (first && first.length > 1 && first.length < 120 && !/^\d+$/.test(first)) out.push(first);
    }
  }
  return out;
}

async function nominatimSearch(params: Record<string, string>): Promise<NominatimItem[]> {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "es");
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url.toString(), { headers: UA });
  if (!r.ok) throw new Error("nominatim");
  return (await r.json()) as NominatimItem[];
}

async function fetchStreetCandidates(query: string): Promise<string[]> {
  const roads = new Set<string>();

  const q1 = `${query}, Gijón, Asturias, España`;
  const [data1, data2] = await Promise.all([
    nominatimSearch({
      q: q1,
      limit: "25",
      viewbox: GIJON_VIEWBOX,
      bounded: "1",
    }).catch(() => [] as NominatimItem[]),
    nominatimSearch({
      street: query,
      city: "Gijón",
      country: "España",
      limit: "15",
    }).catch(() => [] as NominatimItem[]),
  ]);

  for (const name of collectRoadNames([...data1, ...data2])) roads.add(name);

  if (roads.size < 10) {
    const dataWide = await nominatimSearch({
      q: q1,
      limit: "22",
    }).catch(() => [] as NominatimItem[]);
    for (const name of collectRoadNames(dataWide)) roads.add(name);
  }

  return [...roads];
}

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
  const [contains, setContains] = useState<StreetSuggestion[]>([]);
  const [fuzzy, setFuzzy] = useState<StreetSuggestion[]>([]);
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
      setContains([]);
      setFuzzy([]);
      setOpen(false);
      return;
    }
    debounce.current = setTimeout(async () => {
      setLoading(true);
      try {
        const candidates = await fetchStreetCandidates(q);
        const ranked = rankStreetCandidates(q, candidates);
        const prim = ranked.filter((x) => x.kind === "contains").slice(0, 8);
        const primNorm = new Set(prim.map((p) => normalizeStreetName(p.display)));
        const fuzz = ranked
          .filter((x) => x.kind === "fuzzy" && !primNorm.has(normalizeStreetName(x.display)))
          .slice(0, 8);
        setContains(prim);
        setFuzzy(fuzz);
        setOpen(prim.length > 0 || fuzz.length > 0);
      } catch {
        setContains([]);
        setFuzzy([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [value]);

  const pick = (s: string) => {
    onChange(s);
    setOpen(false);
  };

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
        onFocus={() => (contains.length > 0 || fuzzy.length > 0) && setOpen(true)}
        autoComplete="off"
        placeholder={placeholder ?? "Empiece a escribir el nombre de la calle…"}
      />
      {loading && <p className="text-xs text-slate-500 mt-1">Buscando sugerencias…</p>}
      {open && (contains.length > 0 || fuzzy.length > 0) && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg text-sm">
          {contains.length > 0 &&
            contains.map((s, idx) => (
              <li key={`c-${idx}-${s.display}`}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-slate-50"
                  onClick={() => pick(s.display)}
                >
                  {s.display}
                </button>
              </li>
            ))}
          {fuzzy.length > 0 && (
            <>
              <li
                className={`sticky top-0 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ${contains.length > 0 ? "border-t border-slate-100" : ""}`}
              >
                Quisiste decir…
              </li>
              {fuzzy.map((s, idx) => (
                <li key={`f-${idx}-${s.display}`}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-amber-50/80"
                    onClick={() => pick(s.display)}
                  >
                    {s.display}
                  </button>
                </li>
              ))}
            </>
          )}
        </ul>
      )}
    </div>
  );
}
