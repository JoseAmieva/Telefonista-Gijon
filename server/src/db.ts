import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";
import { JSONFilePreset } from "lowdb/node";
import { nanoid } from "nanoid";
import type { CallRecord, IncidentKey } from "./types.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
mkdirSync(dataDir, { recursive: true });

type DbShape = {
  calls: CallRecord[];
};

const defaultData: DbShape = { calls: [] };

let db: Awaited<ReturnType<typeof JSONFilePreset<DbShape>>>;

export async function initDb() {
  db = await JSONFilePreset<DbShape>(join(dataDir, "db.json"), defaultData);
  await db.read();
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized");
  return db;
}

export function listCalls(limit = 200): CallRecord[] {
  const d = getDb().data;
  return [...d.calls]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}

export function getCall(id: string): CallRecord | undefined {
  return getDb().data.calls.find((c) => c.id === id);
}

export async function saveCall(input: {
  id?: string;
  incidentKey: IncidentKey;
  callTime?: string;
  payload: Record<string, unknown>;
}): Promise<CallRecord> {
  const now = new Date().toISOString();
  const d = getDb();
  if (input.id) {
    const idx = d.data.calls.findIndex((c) => c.id === input.id);
    if (idx === -1) {
      const rec: CallRecord = {
        id: input.id,
        incidentKey: input.incidentKey,
        createdAt: now,
        updatedAt: now,
        callTime: input.callTime,
        payload: input.payload,
      };
      d.data.calls.push(rec);
      await d.write();
      return rec;
    }
    const prev = d.data.calls[idx]!;
    const rec: CallRecord = {
      ...prev,
      incidentKey: input.incidentKey,
      updatedAt: now,
      callTime: input.callTime ?? prev.callTime,
      payload: input.payload,
    };
    d.data.calls[idx] = rec;
    await d.write();
    return rec;
  }
  const rec: CallRecord = {
    id: nanoid(),
    incidentKey: input.incidentKey,
    createdAt: now,
    updatedAt: now,
    callTime: input.callTime,
    payload: input.payload,
  };
  d.data.calls.push(rec);
  await d.write();
  return rec;
}
