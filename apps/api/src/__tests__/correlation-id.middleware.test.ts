import { Logger } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";

import { CorrelationIdMiddleware } from "../correlation-id.middleware";
import type { HttpRequestWithCorrelationId, HttpResponse } from "../http-types";

describe("CorrelationIdMiddleware", () => {
  it("adds the correlation ID header and logs request duration", () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const now = vi.spyOn(Date, "now").mockReturnValueOnce(1000).mockReturnValueOnce(1042);
    const finishListeners: (() => void)[] = [];
    const request: HttpRequestWithCorrelationId = {
      headers: { "x-correlation-id": "request-123" },
      method: "GET",
      path: "/library",
    };
    let response: HttpResponse;
    response = {
      header: vi.fn(),
      json: vi.fn(),
      on: vi.fn((_event: "finish", listener: () => void) => {
        finishListeners.push(listener);
      }),
      status: vi.fn(() => response),
      statusCode: 200,
    };
    const next = vi.fn();

    new CorrelationIdMiddleware().use(request, response, next);
    finishListeners[0]?.();

    expect(request.correlationId).toBe("request-123");
    expect(response.header).toHaveBeenCalledWith("x-correlation-id", "request-123");
    expect(next).toHaveBeenCalledOnce();
    expect(JSON.parse(log.mock.calls[0]?.[0] as string)).toMatchObject({
      correlationId: "request-123",
      latencyMs: 42,
      method: "GET",
      route: "/library",
      service: "tvlore-api",
      statusCode: 200,
    });

    now.mockRestore();
    log.mockRestore();
  });

  it("generates a correlation ID when the request does not provide one", () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const request: HttpRequestWithCorrelationId = {
      headers: {},
      method: "GET",
      path: "/users/me",
    };
    let response: HttpResponse;
    response = {
      header: vi.fn(),
      json: vi.fn(),
      on: vi.fn(),
      status: vi.fn(() => response),
      statusCode: 200,
    };

    new CorrelationIdMiddleware().use(request, response, vi.fn());

    expect(request.correlationId).toEqual(expect.any(String));
    expect(response.header).toHaveBeenCalledWith("x-correlation-id", request.correlationId);

    log.mockRestore();
  });

  it("generates a safe correlation ID when the incoming one is unsafe", () => {
    const log = vi.spyOn(Logger.prototype, "log").mockImplementation(() => {});
    const request: HttpRequestWithCorrelationId = {
      headers: { "x-correlation-id": "bad\nid" },
      method: "GET",
      path: "/users/me",
    };
    let response: HttpResponse;
    response = {
      header: vi.fn(),
      json: vi.fn(),
      on: vi.fn(),
      status: vi.fn(() => response),
      statusCode: 200,
    };

    new CorrelationIdMiddleware().use(request, response, vi.fn());

    expect(request.correlationId).toEqual(expect.any(String));
    expect(request.correlationId).not.toBe("bad\nid");
    expect(response.header).toHaveBeenCalledWith("x-correlation-id", request.correlationId);

    log.mockRestore();
  });
});
