import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { io, type Socket } from "socket.io-client";
import { apiLogin, apiLogout, apiMe, apiWsToken, clearWsToken, getWsToken, setWsToken } from "../api";
import type { IncidentKey } from "../incidents/types";

export type ActiveDraft = {
  incidentKey: IncidentKey | null;
  callTime: string | null;
  payload: Record<string, unknown>;
  updatedAt: string;
};

type Ctx = {
  authenticated: boolean;
  user: string | null;
  loading: boolean;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  socket: Socket | null;
  draft: ActiveDraft;
  publishDraft: (d: {
    incidentKey: IncidentKey | null;
    callTime: string | null;
    payload: Record<string, unknown>;
  }) => void;
  clearDraft: () => void;
};

const AuthDraftContext = createContext<Ctx | null>(null);

export function AuthDraftProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const [draft, setDraft] = useState<ActiveDraft>({
    incidentKey: null,
    callTime: null,
    payload: {},
    updatedAt: new Date().toISOString(),
  });

  const connectSocket = useCallback((token: string) => {
    socketRef.current?.disconnect();
    const s = io({
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
    s.on("draft:state", (d: ActiveDraft) => setDraft(d));
    socketRef.current = s;
    setSocket(s);
  }, []);

  const refresh = useCallback(async () => {
    const me = await apiMe();
    setAuthenticated(me.authenticated);
    setUser(me.user ?? null);
    if (me.authenticated) {
      let t = getWsToken();
      if (!t) {
        const fresh = await apiWsToken();
        if (fresh) {
          setWsToken(fresh);
          t = fresh;
        }
      }
      if (t && !socketRef.current?.connected) {
        connectSocket(t);
      }
    } else {
      clearWsToken();
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
  }, [connectSocket]);

  useEffect(() => {
    (async () => {
      try {
        await refresh();
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [refresh]);

  const login = useCallback(
    async (username: string, password: string) => {
      const { token } = await apiLogin(username, password);
      socketRef.current?.disconnect();
      connectSocket(token);
      const me = await apiMe();
      setAuthenticated(me.authenticated);
      setUser(me.user ?? null);
    },
    [connectSocket]
  );

  const logout = useCallback(async () => {
    await apiLogout();
    socketRef.current?.disconnect();
    socketRef.current = null;
    setSocket(null);
    setAuthenticated(false);
    setUser(null);
  }, []);

  const publishDraft = useCallback(
    (d: { incidentKey: IncidentKey | null; callTime: string | null; payload: Record<string, unknown> }) => {
      socketRef.current?.emit("draft:update", d);
    },
    []
  );

  const clearDraft = useCallback(() => {
    socketRef.current?.emit("draft:clear");
  }, []);

  const value = useMemo(
    () => ({
      authenticated,
      user,
      loading,
      login,
      logout,
      refresh,
      socket,
      draft,
      publishDraft,
      clearDraft,
    }),
    [authenticated, user, loading, login, logout, refresh, socket, draft, publishDraft, clearDraft]
  );

  return <AuthDraftContext.Provider value={value}>{children}</AuthDraftContext.Provider>;
}

export function useAuthDraft() {
  const c = useContext(AuthDraftContext);
  if (!c) throw new Error("useAuthDraft fuera del proveedor");
  return c;
}
