import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import type { Express } from "express";

import { ApiErrorFilter } from "./api-error.filter";
import { AppModule } from "./app.module";

export async function createApp(server?: Express) {
  const app = server
    ? await NestFactory.create(AppModule, new ExpressAdapter(server))
    : await NestFactory.create(AppModule);

  app.useGlobalFilters(new ApiErrorFilter());

  return app;
}
