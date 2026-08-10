import "reflect-metadata";

import { getConfig } from "./config";
import { createApp } from "./create-app";

async function bootstrap() {
  const app = await createApp();
  const config = getConfig();

  await app.listen(config.port);
}

void bootstrap();
