import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppConfig } from "./config/config";
import { GlobalExceptionFilter } from "./common/middleware/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix("api");
  app.useGlobalFilters(new GlobalExceptionFilter());
  await app.listen(AppConfig.port);
  // eslint-disable-next-line no-console
  console.log(`simsimplay-api listening on port ${AppConfig.port}`);
}

bootstrap();
