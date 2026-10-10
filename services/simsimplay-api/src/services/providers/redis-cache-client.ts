import Redis from "ioredis";
import { AppConfig } from "../../config/config";
import { CacheClient } from "../interfaces/cache-client.interface";

export class RedisCacheClient implements CacheClient {
  private client = new Redis(AppConfig.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });

  async get(key: string): Promise<string | null> {
    await this.ensureConnected();
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    await this.ensureConnected();
    if (ttlSeconds) {
      await this.client.set(key, value, "EX", ttlSeconds);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.ensureConnected();
    await this.client.del(key);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnected();
      const pong = await this.client.ping();
      return pong === "PONG";
    } catch {
      return false;
    }
  }

  private async ensureConnected(): Promise<void> {
    if (this.client.status === "wait" || this.client.status === "end") {
      await this.client.connect();
    }
  }
}
