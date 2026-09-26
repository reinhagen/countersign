import { Redis } from "@upstash/redis";

function resolveConfig(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

let cached: Redis | null | undefined;

export function getRedis(): Redis | null {
  if (cached !== undefined) return cached;
  const config = resolveConfig();
  cached = config ? new Redis(config) : null;
  return cached;
}

export function roomsEnabled(): boolean {
  return getRedis() !== null;
}
