import { getRedisClient } from "./redis";

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export async function rateLimitByKey(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const client = getRedisClient();
  if (!client) {
    return { allowed: true, remaining: limit, resetSeconds: windowSeconds };
  }

  const redisKey = `rl:${key}`;
  const current = await client.incr(redisKey);

  if (current === 1) {
    await client.expire(redisKey, windowSeconds);
  }

  const ttl = await client.ttl(redisKey);
  return {
    allowed: current <= limit,
    remaining: Math.max(limit - current, 0),
    resetSeconds: ttl === -1 ? windowSeconds : ttl,
  };
}

