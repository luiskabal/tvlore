import { randomUUID } from "node:crypto";
import { Injectable, type NestMiddleware } from "@nestjs/common";

import type { HttpRequestWithCorrelationId, HttpResponse, Next } from "./http-types";

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: HttpRequestWithCorrelationId, res: HttpResponse, next: Next) {
    const incomingId = req.headers["x-correlation-id"];
    const correlationId = typeof incomingId === "string" && incomingId.trim() ? incomingId : randomUUID();

    req.correlationId = correlationId;
    res.header("x-correlation-id", correlationId);
    next();
  }
}

