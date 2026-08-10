# Observability

Keep MVP observability simple.

## Logs

Use structured JSON logs.

Include:

- Timestamp.
- Level.
- Service name.
- Correlation/request ID.
- Method.
- Route.
- Status code.
- Latency.
- User ID where appropriate.
- Error code where applicable.
- Provider name for provider calls.

Do not include:

- Access tokens.
- Refresh tokens.
- Google credentials.
- TMDB credentials.
- Raw private viewing histories.
- Raw QR/share token values.

## Correlation IDs

Every request should have a correlation ID.

- Accept an inbound correlation ID only if it matches a safe format.
- Generate one if absent.
- Return it in response headers.
- Include it in error responses.
- Include it in logs.

## Events Worth Logging

- Authentication failures by category.
- Refresh token reuse/revocation events.
- Provider request failures.
- Backend domain errors.
- Unexpected exceptions.
- Slow requests.
- Rate-limit rejections.

## Metrics Later

Do not introduce Datadog, OpenTelemetry infrastructure, ELK, Prometheus, or similar platforms during initial implementation unless needed.

Design structured logs so future observability tools can consume them.

Possible future metrics:

- Request count and latency.
- Error rate by route.
- Provider latency and failure rate.
- Auth failure count.
- Refresh failure count.
- Search volume.
- Watch mutation volume.

