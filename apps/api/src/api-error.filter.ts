import { ArgumentsHost, Catch, HttpException, HttpStatus, type ExceptionFilter } from "@nestjs/common";

import type { HttpRequestWithCorrelationId, HttpResponse } from "./http-types";

type ApiError = {
  code: string;
  message: string;
  details: unknown | null;
  correlationId: string;
};

type HttpExceptionBody = {
  code?: unknown;
  message?: unknown;
  details?: unknown;
};

@Catch()
export class ApiErrorFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const request = context.getRequest<HttpRequestWithCorrelationId>();
    const response = context.getResponse<HttpResponse>();
    const status = error instanceof HttpException ? error.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const body = error instanceof HttpException ? normalizeHttpException(error) : null;

    const apiError: ApiError = {
      code: typeof body?.code === "string" ? body.code : statusToCode(status),
      message:
        typeof body?.message === "string" ? body.message : status === HttpStatus.INTERNAL_SERVER_ERROR ? "Unexpected error" : "Request failed",
      details: body?.details ?? null,
      correlationId: request.correlationId ?? "unknown",
    };

    response.status(status).json(apiError);
  }
}

function normalizeHttpException(error: HttpException): HttpExceptionBody {
  const response = error.getResponse();

  if (typeof response === "string") {
    return {
      message: response,
    };
  }

  if (response && typeof response === "object") {
    return response as HttpExceptionBody;
  }

  return {
    message: error.message,
  };
}

function statusToCode(status: number) {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return "VALIDATION_FAILED";
    case HttpStatus.UNAUTHORIZED:
      return "UNAUTHORIZED";
    case HttpStatus.FORBIDDEN:
      return "FORBIDDEN";
    case HttpStatus.NOT_FOUND:
      return "NOT_FOUND";
    case HttpStatus.TOO_MANY_REQUESTS:
      return "RATE_LIMITED";
    default:
      return status >= 500 ? "UNEXPECTED_ERROR" : "REQUEST_FAILED";
  }
}
