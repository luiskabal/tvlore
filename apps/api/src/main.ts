import "reflect-metadata";
import { NestFactory } from "@nestjs/core";

import { ApiErrorFilter } from "./api-error.filter";
import { AppModule } from "./app.module";
import { getConfig } from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = getConfig();

  app.useGlobalFilters(new ApiErrorFilter());

  await app.listen(config.port);
}

void bootstrap();
