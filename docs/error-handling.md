# Error Handling

NestJS internal exception shapes must not leak directly to clients.

TVLore uses a stable API error contract that the mobile app can translate into user-facing copy.

## Error Contract

```json
{
  "code": "EPISODE_NOT_FOUND",
  "message": "Episode not found",
  "details": null,
  "correlationId": "req_abc123"
}
```

## Fields

- `code`: stable machine-readable error code.
- `message`: concise developer-facing message safe for clients.
- `details`: optional structured validation or context details.
- `correlationId`: request identifier for support/log correlation.

## Validation Errors

Example:

```json
{
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "details": {
    "fields": [
      {
        "path": "query",
        "message": "Required"
      }
    ]
  },
  "correlationId": "req_abc123"
}
```

## Error Categories

### Validation

- `VALIDATION_FAILED`
- `INVALID_ROUTE_PARAMETER`
- `INVALID_QUERY_PARAMETER`

### Authentication

- `UNAUTHORIZED`
- `INVALID_GOOGLE_CREDENTIAL`
- `INVALID_ACCESS_TOKEN`
- `ACCESS_TOKEN_EXPIRED`
- `INVALID_REFRESH_TOKEN`
- `REFRESH_TOKEN_EXPIRED`
- `REFRESH_SESSION_REVOKED`

### Authorization

- `FORBIDDEN`
- `RESOURCE_NOT_OWNED`
- `PRIVACY_DENIED`

### Domain

- `USER_NOT_FOUND`
- `SHOW_NOT_FOUND`
- `SEASON_NOT_FOUND`
- `EPISODE_NOT_FOUND`
- `MOVIE_NOT_FOUND`
- `CATALOG_ITEM_NOT_FOUND`
- `WATCH_NOT_FOUND`
- `MATCH_TOKEN_EXPIRED`
- `MATCH_TOKEN_REVOKED`

### Provider

- `CATALOG_PROVIDER_UNAVAILABLE`
- `CATALOG_PROVIDER_TIMEOUT`
- `CATALOG_RATE_LIMITED`
- `CATALOG_PROVIDER_INVALID_RESPONSE`

### Rate Limit

- `RATE_LIMITED`
- `AUTH_RATE_LIMITED`
- `SEARCH_RATE_LIMITED`
- `MATCH_LINK_RATE_LIMITED`

### Unexpected

- `UNEXPECTED_ERROR`
- `SERVICE_UNAVAILABLE`

## Mobile Behavior

The mobile app may translate error codes into UX copy.

It must not duplicate backend logic that generated the code.

Examples:

- `UNAUTHORIZED`: return to auth flow.
- `RATE_LIMITED`: show a short retry state and avoid immediate repeated requests.
- `CATALOG_PROVIDER_UNAVAILABLE`: show retry state.
- `VALIDATION_FAILED`: show form or input error.
- `PRIVACY_DENIED`: explain that the comparison is not available.

## Logging

Backend logs should include:

- Correlation ID.
- Error code.
- HTTP status.
- Endpoint.
- Authenticated user ID where appropriate.
- Provider name if provider error.

Do not log sensitive tokens, Google credentials, provider secrets, or raw private history.
