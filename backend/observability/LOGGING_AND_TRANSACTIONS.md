# Logging, Observability & Transactions — Design Notes

This document explains what we log, where logs go, how to debug production
issues, and our convention for database transactions.

---

## 1. Logging & Observability

### What gets logged
Every single request produces one log entry, written in the `finally` block
of `RequestLoggingMiddleware`, regardless of whether the request succeeded
or failed. Each entry contains:

- `correlation_id` — unique UUID per request
- `method` and `path`
- `status_code`
- `duration_ms`
- `user_id` (if authenticated)
- `ip` address
- `level` (INFO / WARNING / ERROR, derived from status code)
- `error_type` and `error_message` (populated only when an error occurred)
- `stack_trace` (populated only for unhandled 500-level exceptions)

Every error additionally goes through `custom_exception_handler`
(`config/exception_handler.py`), which classifies the exception
(validation, not-found, permission, integrity, database, or unhandled),
logs a structured entry via the `observability` logger, and returns a
consistent JSON error shape to the client:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "...",
    "details": { ... }
  }
}
```

### Format: structured JSON
All logs are emitted as JSON via `pythonjsonlogger.jsonlogger.JsonFormatter`.
This is a committed decision — no plain-text logging anywhere in the
project. JSON logs are easy to grep, filter, and later ship to any log
aggregation tool (ELK, Datadog, etc.) without reformatting.

### Where logs go
Logs are written to three destinations simultaneously:

1. **Console** — for local development, visible while running `runserver`.
2. **Rotating file** — `logs/app.log`, capped at 5 MB with 5 backups, so
   disk usage stays bounded.
3. **`logs_db`** (separate Postgres database) — every request is also
   persisted as a `RequestLog` row via `LoggingRouter`, which routes all
   `observability` app models to `logs_db` and keeps them fully isolated
   from the application's `default` database.

Having logs in a queryable database (in addition to files) is what makes
production debugging practical — see below.

### Sensitive data redaction
Passwords, tokens, and other secrets must never appear in logs. This is
enforced automatically, not manually, by `sanitize_data()`
(`observability/sanitizer.py`), which recursively redacts any dict key
matching: `password`, `password1`, `password2`, `token`, `access`,
`refresh`, `authorization`, `secret`, `api_key`, `apikey`, `credit_card`,
`cvv`. The request body is sanitized in the middleware **before** it is
ever logged or stored, so there's no code path where a raw body containing
a secret reaches a log line or the `logs_db` table.

### Correlation ID
A UUID is generated once per request in `RequestLoggingMiddleware`, stored
in a `contextvars.ContextVar` (`observability/context.py`), and:

- attached to every log line emitted during that request (via
  `CorrelationIdFilter` in settings),
- returned to the client in the `X-Correlation-ID` response header,
- saved on the `RequestLog` row in `logs_db`.

This makes it possible to trace one user action end-to-end across multiple
log lines, even under concurrent traffic.

### How to debug a problem in production
1. Get the `X-Correlation-ID` from the affected response (client-side error
   message, support ticket, or browser network tab). If unavailable, narrow
   down by approximate timestamp + endpoint instead.
2. Query `logs_db`:
```python
   RequestLog.objects.using('logs_db').filter(correlation_id='<uuid>').first()
```
3. This single row gives the full picture: method, path, status code,
   duration, sanitized request body, error_type, error_message, and (for
   500s) the full stack trace.
4. Cross-reference with `logs/app.log` around the same timestamp if deeper
   context (e.g. surrounding requests) is needed.

Tracing and metrics (e.g. distributed tracing, dashboards) are out of scope
for now — structured logging with correlation IDs is the non-negotiable
minimum, and it's fully in place.

---

## 2. Transactions

### Convention
**Transaction boundary = the view method.** The project doesn't have a
separate service/repository layer, so `@transaction.atomic` is applied
directly to the DRF view method (`get`/`post`/`put`/`patch`/`delete`) that
performs the writes. This keeps the boundary obvious and co-located with
the code that needs it.

**Rule:** before writing a new endpoint, ask *"how many tables does this
one request write to?"*
- **1 table** → no explicit transaction needed. Django already wraps a
  single `INSERT`/`UPDATE` in an implicit atomic operation.
- **2+ tables** → wrap the method in `@transaction.atomic`. If one write
  fails, all writes in that method must roll back — the database should
  never be left with a partial/orphaned record.

### Where this applies today
The