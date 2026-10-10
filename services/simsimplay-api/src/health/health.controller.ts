import { Controller, Get, Inject, HttpCode } from "@nestjs/common";
import { DB_CLIENT, CACHE_CLIENT } from "../services/services.module";
import { DbClient } from "../services/interfaces/db-client.interface";
import { CacheClient } from "../services/interfaces/cache-client.interface";
import type { HealthResponse } from "@simsimplay/shared";
import { Response } from "express";
import { Res } from "@nestjs/common";

@Controller("health")
export class HealthController {
  constructor(
    @Inject(DB_CLIENT) private readonly db: DbClient,
    @Inject(CACHE_CLIENT) private readonly cache: CacheClient,
  ) {}

  @Get()
  async check(@Res() res: Response) {
    const [dbHealthy, cacheHealthy] = await Promise.all([this.db.healthCheck(), this.cache.healthCheck()]);
    const services = { database: dbHealthy ? "healthy" : "unhealthy", cache: cacheHealthy ? "healthy" : "unhealthy" } as const;
    const allHealthy = dbHealthy && cacheHealthy;
    const allDown = !dbHealthy && !cacheHealthy;
    const body: HealthResponse = {
      status: allHealthy ? "healthy" : allDown ? "unhealthy" : "degraded",
      services,
    };
    res.status(body.status === "unhealthy" ? 503 : 200).json(body);
  }
}
