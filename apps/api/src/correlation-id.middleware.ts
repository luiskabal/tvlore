import { randomUUID } from "node:crypto";
import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";

import type { HttpRequestWithCorrelationId, HttpResponse, Next } from "./http-types";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HttpRequest");

  use(req: HttpRequestWithCorrelationId, res: HttpResponse, next: Next) {
    const startedAt = Date.now();
    const incomingId = req.headers["x-correlation-id"];
    const correlationId = typeof incomingId === "string" && incomingId.trim() ? incomingId : randomUUID();

    req.correlationId = correlationId;
    res.header("x-correlation-id", correlationId);
    res.on("finish", () => {
      this.logger.log(JSON.stringify({
        correlationId,
        latencyMs: Date.now() - startedAt,
        level: "info",
        method: req.method ?? "UNKNOWN",
        route: req.path ?? req.url?.split("?")[0] ?? req.originalUrl?.split("?")[0] ?? "unknown",
        service: "tvlore-api",
        statusCode: res.statusCode ?? 0,
        timestamp: new Date().toISOString(),
      }));
    });
    next();
  }
}
