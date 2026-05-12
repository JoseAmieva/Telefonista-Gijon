import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import type { Request, Response, NextFunction } from "express";

const JWT_COOKIE = "tg_session";

function getSecret(): string {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 16) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set (min 16 chars) in production");
    }
    return "dev-only-secret-change-me";
  }
  return s;
}

export function signToken(username: string): string {
  return jwt.sign({ sub: username }, getSecret(), { expiresIn: "12h" });
}

export function verifyToken(token: string | undefined): { sub: string } | null {
  if (!token) return null;
  try {
    const p = jwt.verify(token, getSecret()) as { sub: string };
    return { sub: p.sub };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: Response, token: string) {
  res.cookie(JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 12 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response) {
  res.clearCookie(JWT_COOKIE, { path: "/" });
}

export function readTokenFromReq(req: Request): string | undefined {
  const c = req.cookies?.[JWT_COOKIE];
  if (typeof c === "string" && c) return c;
  const h = req.headers.authorization;
  if (h?.startsWith("Bearer ")) return h.slice(7);
  return undefined;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const t = readTokenFromReq(req);
  const v = verifyToken(t);
  if (!v) {
    res.status(401).json({ error: "No autorizado" });
    return;
  }
  (req as Request & { user?: { sub: string } }).user = v;
  next();
}

const DEFAULT_USER = process.env.APP_USER ?? "user1";

export async function checkPassword(username: string, password: string): Promise<boolean> {
  if (username !== DEFAULT_USER) return false;
  if (process.env.APP_PASSWORD_HASH) {
    return bcrypt.compare(password, process.env.APP_PASSWORD_HASH);
  }
  const plain = process.env.APP_PASSWORD ?? "user1";
  return password === plain;
}

/** Dev: regenerate hash with node -e "console.log(require('bcryptjs').hashSync('tu_clave',10))" */
export function getDefaultUserHint() {
  return { user: DEFAULT_USER };
}
