import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { initDb, listCalls, getCall, saveCall } from "./db.js";
import {
  authMiddleware,
  checkPassword,
  clearSessionCookie,
  readTokenFromReq,
  setSessionCookie,
  signToken,
  verifyToken,
} from "./auth.js";
import type { ActiveDraft, IncidentKey } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 4000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN ?? "http://localhost:5173";

let activeDraft: ActiveDraft = {
  incidentKey: null,
  callTime: null,
  payload: {},
  updatedAt: new Date().toISOString(),
};

function broadcastDraft(io: Server) {
  io.emit("draft:state", activeDraft);
}

async function main() {
  await initDb();
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: { origin: CLIENT_ORIGIN, credentials: true },
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ||
      (socket.handshake.headers?.authorization as string | undefined)?.replace(
        /^Bearer\s+/i,
        ""
      );
    const v = verifyToken(token);
    if (!v) {
      next(new Error("unauthorized"));
      return;
    }
    next();
  });

  io.on("connection", (socket) => {
    socket.emit("draft:state", activeDraft);
    socket.on(
      "draft:update",
      (msg: { incidentKey: IncidentKey | null; callTime: string | null; payload: Record<string, unknown> }) => {
        activeDraft = {
          incidentKey: msg.incidentKey,
          callTime: msg.callTime,
          payload: msg.payload ?? {},
          updatedAt: new Date().toISOString(),
        };
        io.emit("draft:state", activeDraft);
      }
    );
    socket.on("draft:clear", () => {
      activeDraft = {
        incidentKey: null,
        callTime: null,
        payload: {},
        updatedAt: new Date().toISOString(),
      };
      io.emit("draft:state", activeDraft);
    });
  });

  app.use(
    cors({
      origin: CLIENT_ORIGIN,
      credentials: true,
    })
  );
  app.use(cookieParser());
  app.use(express.json({ limit: "2mb" }));

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(400).json({ error: "Usuario y contraseña requeridos" });
      return;
    }
    const ok = await checkPassword(username, password);
    if (!ok) {
      res.status(401).json({ error: "Credenciales incorrectas" });
      return;
    }
    const token = signToken(username);
    setSessionCookie(res, token);
    res.json({ ok: true, token });
  });

  app.post("/api/logout", (_req, res) => {
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  app.get("/api/me", (req, res) => {
    const t = readTokenFromReq(req);
    const v = verifyToken(t);
    if (!v) {
      res.status(401).json({ authenticated: false });
      return;
    }
    res.json({ authenticated: true, user: v.sub });
  });

  app.get("/api/ws-token", (req, res) => {
    const t = readTokenFromReq(req);
    const v = verifyToken(t);
    if (!v) {
      res.status(401).json({ error: "No autorizado" });
      return;
    }
    res.json({ token: t });
  });

  app.use("/api", authMiddleware);

  app.get("/api/calls", (_req, res) => {
    res.json(listCalls());
  });

  app.get("/api/calls/:id", (req, res) => {
    const c = getCall(req.params.id);
    if (!c) {
      res.status(404).json({ error: "No encontrado" });
      return;
    }
    res.json(c);
  });

  app.post("/api/calls", async (req, res) => {
    const { id, incidentKey, callTime, payload } = req.body as {
      id?: string;
      incidentKey?: IncidentKey;
      callTime?: string;
      payload?: Record<string, unknown>;
    };
    if (!incidentKey) {
      res.status(400).json({ error: "incidentKey requerido" });
      return;
    }
    const rec = await saveCall({
      id,
      incidentKey,
      callTime,
      payload: payload ?? {},
    });
    res.json(rec);
  });

  app.use("/api", (_req, res) => {
    res.status(404).json({ error: "Ruta API no encontrada" });
  });

  const clientDist = join(__dirname, "..", "..", "client", "dist");
  app.use(express.static(clientDist));
  app.get("*", (_req, res, next) => {
    res.sendFile(join(clientDist, "index.html"), (err) => {
      if (err) next();
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`API + WS http://localhost:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
