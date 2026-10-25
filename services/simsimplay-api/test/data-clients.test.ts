import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PostgresDbClient } from "../src/services/providers/postgres-db-client";
import { RedisCacheClient } from "../src/services/providers/redis-cache-client";

const mocks = vi.hoisted(() => ({
  getToken: vi.fn(),
  pool: vi.fn(),
  redis: {
    options: {} as Record<string, unknown>,
    status: "wait",
    connect: vi.fn(),
    auth: vi.fn(),
    get: vi.fn(),
    ping: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock("@azure/identity", () => ({
  DefaultAzureCredential: class {
    getToken = mocks.getToken;
  },
}));

vi.mock("pg", () => ({ Pool: mocks.pool }));
vi.mock("ioredis", () => ({
  default: class {
    constructor() {
      return mocks.redis;
    }
  },
}));

describe("passwordless data clients", () => {
  let cache: RedisCacheClient | undefined;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AZURE_USE_MANAGED_IDENTITY", "false");
    vi.stubEnv("AZURE_REDIS_USERNAME", "identity-object-id");
    mocks.redis.options = {};
    mocks.redis.status = "wait";
    mocks.redis.connect.mockImplementation(async () => {
      mocks.redis.status = "ready";
    });
    mocks.redis.get.mockResolvedValue("value");
    mocks.redis.ping.mockResolvedValue("PONG");
    mocks.redis.auth.mockResolvedValue("OK");
    mocks.getToken.mockResolvedValue({ token: "first-token", expiresOnTimestamp: Date.now() + 3_600_000 });
  });

  afterEach(() => {
    cache?.onModuleDestroy();
    cache = undefined;
    vi.unstubAllEnvs();
    vi.useRealTimers();
  });

  it("keeps local Redis connections free of Azure authentication", async () => {
    cache = new RedisCacheClient();
    expect(await cache.get("key")).toBe("value");
    expect(mocks.getToken).not.toHaveBeenCalled();
    expect(mocks.redis.connect).toHaveBeenCalledTimes(1);
  });

  it("keeps local PostgreSQL connection options unchanged", () => {
    new PostgresDbClient();
    const options = mocks.pool.mock.calls[0][0];
    expect(options.password).toBeUndefined();
    expect(options.ssl).toBeUndefined();
  });

  it("requests a PostgreSQL token for each new connection and verifies TLS", async () => {
    vi.stubEnv("AZURE_USE_MANAGED_IDENTITY", "true");
    new PostgresDbClient();
    const options = mocks.pool.mock.calls[0][0];
    expect(options.ssl).toEqual({ rejectUnauthorized: true });
    expect(await options.password()).toBe("first-token");
    mocks.getToken.mockResolvedValueOnce({ token: "renewed-token" });
    expect(await options.password()).toBe("renewed-token");
    expect(mocks.getToken).toHaveBeenCalledWith("https://ossrdbms-aad.database.windows.net/.default");
  });

  it("rejects non-TLS Redis when managed identity is enabled", () => {
    vi.stubEnv("AZURE_USE_MANAGED_IDENTITY", "true");
    expect(() => new RedisCacheClient()).toThrow("Managed Redis requires");
  });

  it("refreshes and reauthenticates Redis without concurrent connects", async () => {
    vi.useFakeTimers();
    vi.resetModules();
    vi.stubEnv("AZURE_USE_MANAGED_IDENTITY", "true");
    vi.stubEnv("REDIS_URL", "rediss://cache.example.com:10000");
    const { RedisCacheClient: AzureRedisCacheClient } = await import("../src/services/providers/redis-cache-client");
    cache = new AzureRedisCacheClient();
    await Promise.all([cache.get("first"), cache.get("second")]);
    expect(mocks.redis.connect).toHaveBeenCalledTimes(1);
    expect(mocks.redis.options.username).toBe("identity-object-id");
    expect(mocks.redis.options.password).toBe("first-token");
    mocks.getToken.mockResolvedValue({ token: "renewed-token" });
    await vi.advanceTimersByTimeAsync(60_000);
    expect(mocks.redis.auth).toHaveBeenCalledWith("identity-object-id", "renewed-token");
    expect(mocks.redis.options.password).toBe("renewed-token");
    cache.onModuleDestroy();
    expect(vi.getTimerCount()).toBe(0);
  });
});