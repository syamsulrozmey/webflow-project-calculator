import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redisClient: Redis | undefined;
};

export function getRedisClient(): Redis | null {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!globalForRedis.redisClient) {
    globalForRedis.redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      enableReadyCheck: true,
      retryStrategy(times) {
        return Math.min(times * 500, 2000);
      },
    });
  }

  return globalForRedis.redisClient;
}

export async function withRedis<T>(handler: (client: Redis) => Promise<T>) {
  const client = getRedisClient();
  if (!client) {
    return null;
  }
  return handler(client);
}

