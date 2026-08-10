import type { IncomingMessage, ServerResponse } from "node:http";

import express from "express";

import { createApp } from "../src/create-app";

const server = express();
let ready: Promise<void> | undefined;

async function bootstrap() {
  const app = await createApp(server);
  await app.init();
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  ready ??= bootstrap();
  await ready;

  return server(req, res);
}
