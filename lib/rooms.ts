import { getRedis } from "./redis";
import { AgreementItem, ItemStatus, RoomData, Side } from "./types";

const ROOM_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
const MAX_ACTIVITY_ENTRIES = 200;

function roomKey(id: string): string {
  return `countersign:room:${id}`;
}

function randomUrlSafeId(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Buffer.from(arr).toString("base64url");
}

export function generateToken(): string {
  return randomUrlSafeId(18);
}

export async function createRoom(input: {
  orgA: string;
  orgB: string;
  transcript: string;
  items: AgreementItem[];
  statuses: Record<string, ItemStatus>;
}): Promise<RoomData | null> {
  const redis = getRedis();
  if (!redis) return null;

  const room: RoomData = {
    id: randomUrlSafeId(9),
    orgA: input.orgA,
    orgB: input.orgB,
    transcript: input.transcript,
    items: input.items,
    statuses: input.statuses,
    activity: [
      {
        id: `${Date.now()}-created`,
        side: "A",
        action: "room_created",
        timestamp: Date.now(),
      },
    ],
    brief: null,
    createdAt: Date.now(),
    tokens: { A: generateToken(), B: generateToken() },
  };

  await redis.set(roomKey(room.id), JSON.stringify(room), { ex: ROOM_TTL_SECONDS });
  return room;
}

export async function getRoom(id: string): Promise<RoomData | null> {
  const redis = getRedis();
  if (!redis) return null;
  const raw = await redis.get<string | RoomData>(roomKey(id));
  if (!raw) return null;
  // The upstash client may already deserialize JSON depending on version/config.
  return typeof raw === "string" ? (JSON.parse(raw) as RoomData) : raw;
}

export async function saveRoom(room: RoomData): Promise<void> {
  const redis = getRedis();
  if (!redis) return;
  if (room.activity.length > MAX_ACTIVITY_ENTRIES) {
    room.activity = room.activity.slice(-MAX_ACTIVITY_ENTRIES);
  }
  await redis.set(roomKey(room.id), JSON.stringify(room), { ex: ROOM_TTL_SECONDS });
}

export async function listRooms(): Promise<RoomData[]> {
  const redis = getRedis();
  if (!redis) return [];

  const keys = await redis.keys("countersign:room:*");
  if (keys.length === 0) return [];

  const values = await redis.mget<(string | RoomData | null)[]>(...keys);
  const rooms: RoomData[] = [];
  for (const raw of values) {
    if (!raw) continue;
    try {
      rooms.push(typeof raw === "string" ? (JSON.parse(raw) as RoomData) : raw);
    } catch {
      // skip anything that fails to parse
    }
  }
  return rooms;
}

export function sideForToken(room: RoomData, token: string | null | undefined): Side | null {
  if (!token) return null;
  if (token === room.tokens.A) return "A";
  if (token === room.tokens.B) return "B";
  return null;
}
