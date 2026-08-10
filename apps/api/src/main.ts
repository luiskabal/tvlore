import "reflect-metadata";

import { API_CONFIG, type ApiConfig } from "./config";
import { createApp } from "./create-app";

async function bootstrap() {
  const app = await createApp();
  const config = app.get<ApiConfig>(API_CONFIG);

  await app.listen(config.port);
}

void bootstrap();
