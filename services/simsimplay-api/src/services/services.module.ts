import { Module, Global } from "@nestjs/common";
import { PostgresDbClient } from "./providers/postgres-db-client";
import { RedisCacheClient } from "./providers/redis-cache-client";

export const DB_CLIENT = "DB_CLIENT";
export const CACHE_CLIENT = "CACHE_CLIENT";

@Global()
@Module({
  providers: [
    { provide: DB_CLIENT, useClass: PostgresDbClient },
    { provide: CACHE_CLIENT, useClass: RedisCacheClient },
  ],
  exports: [DB_CLIENT, CACHE_CLIENT],
})
export class ServicesModule {}
