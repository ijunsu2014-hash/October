import { Pool } from "pg";
import { DefaultAzureCredential } from "@azure/identity";
import { AppConfig } from "../../config/config";
import { DbClient } from "../interfaces/db-client.interface";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required when managed identity is enabled`);
  return value;
}

export class PostgresDbClient implements DbClient {
  private credential = process.env.AZURE_USE_MANAGED_IDENTITY === "true" ? new DefaultAzureCredential() : undefined;
  private pool = new Pool(
    this.credential
      ? {
          host: requiredEnv("PGHOST"),
          port: Number(process.env.PGPORT ?? 5432),
          database: requiredEnv("PGDATABASE"),
          user: requiredEnv("PGUSER"),
          password: async () => {
            const token = await this.credential!.getToken("https://ossrdbms-aad.database.windows.net/.default");
            if (!token) throw new Error("PostgreSQL access token is unavailable");
            return token.token;
          },
          ssl: { rejectUnauthorized: true },
        }
      : { connectionString: AppConfig.databaseUrl },
  );

  async query<T = unknown>(text: string, params: unknown[] = []): Promise<T[]> {
    const result = await this.pool.query(text, params);
    return result.rows as T[];
  }

  async transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const tx: DbClient = {
        query: async (text, params = []) => (await client.query(text, params)).rows,
        transaction: () => {
          throw new Error("Nested transactions are not supported");
        },
        healthCheck: async () => true,
      };
      const result = await fn(tx);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pool.query("SELECT 1");
      return true;
    } catch {
      return false;
    }
  }
}
