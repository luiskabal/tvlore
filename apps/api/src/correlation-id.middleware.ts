import { randomUUID } from "node:crypto";
import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";

import type { HttpRequestWithCorrelationId, HttpResponse, Next } from "./http-types";

const correlationIdPattern = /^[A-Za-z0-9._:-]{1,128}$/;

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HttpRequest");

  use(req: HttpRequestWithCorrelationId, res: HttpResponse, next: Next) {
    const startedAt = Date.now();
    const correlationId = getCorrelationId(req.headers["x-correlation-id"]);

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

function getCorrelationId(incomingId: string | string[] | undefined) {
  if (typeof incomingId !== "string") {
    return randomUUID();
  }

  const trimmedId = incomingId.trim();

  return correlationIdPattern.test(trimmedId) ? trimmedId : randomUUID();
}
