import { Pool } from "pg";
import { AppConfig } from "../../config/config";
import { DbClient } from "../interfaces/db-client.interface";

export class PostgresDbClient implements DbClient {
  private pool = new Pool({ connectionString: AppConfig.databaseUrl });

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
