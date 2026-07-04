const WS_TOKEN_KEY = "tg_ws_token";

export function getWsToken(): string | null {
  return sessionStorage.getItem(WS_TOKEN_KEY);
}

export function setWsToken(token: string) {
  sessionStorage.setItem(WS_TOKEN_KEY, token);
}

export function clearWsToken() {
  sessionStorage.removeItem(WS_TOKEN_KEY);
}

export async function apiLogin(username: string, password: string): Promise<{ token: string }> {
  const r = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });
  const j = (await r.json()) as { ok?: boolean; token?: string; error?: string };
  if (!r.ok) throw new Error(j.error ?? "Error de acceso");
  if (!j.token) throw new Error("Respuesta inválida");
  setWsToken(j.token);
  return { token: j.token };
}

export async function apiLogout() {
  await fetch("/api/logout", { method: "POST", credentials: "include" });
  clearWsToken();
}

export async function apiMe(): Promise<{ authenticated: boolean; user?: string }> {
  const r = await fetch("/api/me", { credentials: "include" });
  return r.json() as Promise<{ authenticated: boolean; user?: string }>;
}

export async function apiWsToken(): Promise<string | null> {
  const r = await fetch("/api/ws-token", { credentials: "include" });
  if (!r.ok) return null;
  const j = (await r.json()) as { token?: string };
  return j.token ?? null;
}

export type CallRecord = {
  id: string;
  incidentKey: string;
  createdAt: string;
  updatedAt: string;
  callTime?: string;
  payload: Record<string, unknown>;
};

export async function apiListCalls(): Promise<CallRecord[]> {
  const r = await fetch("/api/calls", { credentials: "include" });
  if (!r.ok) throw new Error("No se pudo cargar el historial");
  return r.json() as Promise<CallRecord[]>;
}

export async function apiGetCall(id: string): Promise<CallRecord> {
  const r = await fetch(`/api/calls/${id}`, { credentials: "include" });
  if (!r.ok) throw new Error("Registro no encontrado");
  return r.json() as Promise<CallRecord>;
}

export type CatastroLookupResult = {
  refcat: string;
  refcatCompleta?: string;
  del: string;
  mun: string;
  direccion?: string;
  visor3dUrl?: string;
};

export async function apiCatastroLookup(
  calle: string,
  numero: string,
  piso = "",
  puerta = ""
): Promise<CatastroLookupResult | null> {
  const p = new URLSearchParams({ calle, numero, piso, puerta });
  const r = await fetch(`/api/catastro/lookup?${p.toString()}`, { credentials: "include" });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error("No se pudo consultar el catastro");
  return r.json() as Promise<CatastroLookupResult>;
}

export async function apiCatastroWms(lat: number, lon: number): Promise<Blob> {
  const p = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const r = await fetch(`/api/catastro/wms?${p.toString()}`, { credentials: "include" });
  if (!r.ok) throw new Error("WMS no disponible");
  return r.blob();
}

export async function apiSaveCall(body: {
  id?: string;
  incidentKey: string;
  callTime?: string;
  payload: Record<string, unknown>;
}): Promise<CallRecord> {
  const r = await fetch("/api/calls", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j as { error?: string }).error ?? "Error al guardar");
  return j as CallRecord;
}
