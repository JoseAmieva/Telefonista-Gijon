/** Normaliza para comparar nombres de vía (acentos, mayúsculas, prefijos habituales). */
export function normalizeStreetName(s: string): string {
  const t = s
    .trim()
    .toLowerCase()
    .replace(/^(calle|c\/|c\.|plaza|pza\.?|avenida|avd?\.?|paseo|pasaje|carretera|ctra\.?)\s+/i, "");
  return stripDiacritics(t).replace(/\s+/g, " ").trim();
}

function stripDiacritics(s: string): string {
  return s.normalize("NFD").replace(/\p{M}/gu, "");
}

/** Distancia de Levenshtein (iteración en dos filas). */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let prev = new Uint16Array(b.length + 1);
  let cur = new Uint16Array(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    const ca = a.charCodeAt(i - 1);
    for (let j = 1; j <= b.length; j++) {
      const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    const tmp = prev;
    prev = cur;
    cur = tmp;
  }
  return prev[b.length];
}

/** Umbral de edición admitido según longitud de la consulta (faltas de ortografía / teclado). */
function maxTypoDistance(queryLen: number): number {
  if (queryLen <= 3) return 2;
  if (queryLen <= 6) return 3;
  if (queryLen <= 12) return 4;
  return 5;
}

export type StreetSuggestion = {
  display: string;
  /** menor es mejor; 0 en coincidencias por contener subcadena */
  distance: number;
  kind: "contains" | "fuzzy";
};

export function rankStreetCandidates(queryRaw: string, candidates: string[]): StreetSuggestion[] {
  const q = normalizeStreetName(queryRaw);
  if (!q) return [];

  const uniq = [...new Set(candidates.map((c) => c.trim()).filter(Boolean))];
  const scored: StreetSuggestion[] = [];

  for (const display of uniq) {
    const n = normalizeStreetName(display);
    if (!n) continue;
    if (n.includes(q)) {
      scored.push({ display, distance: 0, kind: "contains" });
      continue;
    }
    const d = levenshtein(q, n);
    const maxD = maxTypoDistance(q.length);
    if (d <= maxD) {
      scored.push({ display, distance: d, kind: "fuzzy" });
    }
  }

  scored.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "contains" ? -1 : 1;
    if (a.distance !== b.distance) return a.distance - b.distance;
    return a.display.localeCompare(b.display, "es");
  });

  const out: StreetSuggestion[] = [];
  const seen = new Set<string>();
  for (const s of scored) {
    const k = normalizeStreetName(s.display);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(s);
    if (out.length >= 12) break;
  }
  return out;
}
