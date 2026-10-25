import Redis from "ioredis";
import { DefaultAzureCredential } from "@azure/identity";
import type { OnModuleDestroy } from "@nestjs/common";
import { AppConfig } from "../../config/config";
import { CacheClient } from "../interfaces/cache-client.interface";

export class RedisCacheClient implements CacheClient, OnModuleDestroy {
  private credential = process.env.AZURE_USE_MANAGED_IDENTITY === "true" ? new DefaultAzureCredential() : undefined;
  private client = new Redis(AppConfig.redisUrl, { lazyConnect: true, maxRetriesPerRequest: 2 });
  private connectionTask?: Promise<void>;
  private refreshTimer?: ReturnType<typeof setTimeout>;
  private tokenValue?: string;
  private stopped = false;

  constructor() {
    if (this.credential) {
      if (!AppConfig.redisUrl.startsWith("rediss://") || !process.env.AZURE_REDIS_USERNAME) {
        throw new Error("Managed Redis requires a rediss URL and AZURE_REDIS_USERNAME");
      }
      this.scheduleRefresh();
    }
  }

  onModuleDestroy(): void {
    this.stopped = true;
    if (this.refreshTimer) clearTimeout(this.refreshTimer);
    this.client.disconnect();
  }

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
    if (!this.connectionTask) {
      this.connectionTask = this.connect().finally(() => {
        this.connectionTask = undefined;
      });
    }
    await this.connectionTask;
  }

  private async connect(): Promise<void> {
    if (this.credential) {
      const token = await this.credential.getToken("https://redis.azure.com/.default");
      if (!token) throw new Error("Redis access token is unavailable");
      const username = process.env.AZURE_REDIS_USERNAME!;
      this.client.options.username = username;
      this.client.options.password = token.token;
      if (this.client.status === "ready" && this.tokenValue !== token.token) {
        await this.client.auth(username, token.token);
      }
      this.tokenValue = token.token;
    }
    if (this.client.status === "wait" || this.client.status === "end") {
      await this.client.connect();
    }
  }

  private scheduleRefresh(): void {
    if (this.stopped) return;
    this.refreshTimer = setTimeout(() => {
      void this.ensureConnected()
        .catch(() => this.client.disconnect())
        .finally(() => this.scheduleRefresh());
    }, 60_000);
    this.refreshTimer.unref();
  }
}
