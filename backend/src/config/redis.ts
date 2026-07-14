import { createClient } from 'redis';
import { env } from './env';

const client = createClient({
  url: env.REDIS_URL ?? 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      if (retries >= 3) return false;
      return Math.min(retries * 500, 2000);
    },
  },
});

let connected = false;

client.on('error', () => { });
client.on('ready', () => { connected = true; console.log('Redis connected'); });
client.on('end', () => { connected = false; });

export async function connectRedis(): Promise<void> {
  if (!env.REDIS_URL) return;
  try {
    await client.connect();
  } catch {
  }
}

export const redisClient = client;

export async function getCache<T>(key: string): Promise<T | null> {
  if (!connected) return null;
  try {
    const value = await client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  if (!connected) return;
  try {
    await client.set(key, JSON.stringify(value), { EX: ttlSeconds });
  } catch {
  }
}

export async function deleteCache(...keys: string[]): Promise<void> {
  if (!connected || keys.length === 0) return;
  try {
    await client.del(keys);
  } catch {
  }
}
