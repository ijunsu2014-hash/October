export interface DbClient {
  query<T = unknown>(text: string, params?: unknown[]): Promise<T[]>;
  transaction<T>(fn: (tx: DbClient) => Promise<T>): Promise<T>;
  healthCheck(): Promise<boolean>;
}
