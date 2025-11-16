import { getRedisClient } from "./redis";

const DAY_IN_SECONDS = 60 * 60 * 24;

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = DAY_IN_SECONDS * 30,
) {
  const client = getRedisClient();
  if (!client) return;
  await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) return null;
  const result = await client.get(key);
  return result ? (JSON.parse(result) as T) : null;
}

