// Centralized environment selection: Development uses local emulators, anything else is production.
export const AppConfig = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  isDevelopment: (process.env.NODE_ENV ?? "development").toLowerCase() === "development",
  databaseUrl: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/simsimplay",
  redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
  jwtSecret: process.env.JWT_SECRET ?? "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1h",
};

if (!AppConfig.isDevelopment && !AppConfig.jwtSecret) {
  throw new Error("JWT_SECRET must be set in production environments");
}
