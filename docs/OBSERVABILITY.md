# Observability, Structured Logging & Database Transactions

The **ByteCorp Job Board Platform** incorporates production-grade observability and strict transactional integrity to ensure zero silent failures, complete request auditability, and database consistency.

---

## 🔍 Request Tracing & Correlation IDs

Every inbound HTTP request to the Django API is assigned an immutable **Correlation ID** (UUIDv4) by `RequestLoggingMiddleware`.

```
Client Request ──► [ RequestLoggingMiddleware ]
                          │
                          ├─► Generate UUID Correlation ID
                          ├─► Measure Duration (ms)
                          ├─► Capture Status Code & User Context
                          │
                          ▼
             Structured JSON Ingestion
             ├─► Console (stdout)
             ├─► Rotating File (logs/app.log)
             └─► Dedicated Database (logs_db via LoggingRouter)
```

---

## 📋 Structured JSON Log Payload

All logs are serialized via `pythonjsonlogger.jsonlogger.JsonFormatter` as structured JSON objects:

```json
{
  "timestamp": "2026-09-28T21:40:00.123Z",
  "correlation_id": "c176a696-dabc-4060-ab58-9e01afa5f3fa",
  "method": "POST",
  "path": "/api/v1/job-applications/",
  "status_code": 201,
  "duration_ms": 38.45,
  "user_id": 42,
  "ip": "192.168.1.100",
  "level": "INFO",
  "error_type": null,
  "error_message": null
}
```

---

## 🛡 Normalized Error Handling Schema

All exceptions are intercepted by `custom_exception_handler` (`config/exception_handler.py`), classifying failures and returning a standardized JSON shape:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid application submission parameters.",
    "details": {
      "cover_letter": ["This field cannot be blank."]
    }
  }
}
```

---

## 🗄 Multi-Database Routing Architecture

To prevent logging queries from degrading the performance of core business transactions:
1. `observability` models (`RequestLog`) are routed to `logs_db` via `LoggingRouter`.
2. Core application models (`users`, `companies`, `jobs`, `applications`, `skills`) are routed exclusively to `default`.
3. Migrations are executed independently:
   ```bash
   python manage.py migrate
   python manage.py migrate --database=logs_db
   ```

---

## 🔄 Transactional Conventions

All write operations spanning multiple tables or relational cascades must be wrapped in explicit atomic transactions:

```python
from django.db import transaction

with transaction.atomic():
    application = Application.objects.create(...)
    update_company_stats(...)
```
