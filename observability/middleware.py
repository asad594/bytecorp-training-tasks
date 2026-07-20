import time
import uuid
import logging
import traceback

from .context import correlation_id_var, get_error_info
from .sanitizer import sanitize_data
from .models import RequestLog

logger = logging.getLogger("observability")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        correlation_id = uuid.uuid4()
        token = correlation_id_var.set(str(correlation_id))
        request.correlation_id = correlation_id

        start = time.monotonic()
        status_code = None
        error_type = None
        error_message = None
        stack_trace = None
        level = "INFO"

        # Read + sanitize the body BEFORE the view (DRF) consumes the stream
        body = None
        if request.method in ("POST", "PUT", "PATCH"):
            try:
                import json
                raw_body = request.body  # caches it, safe to read again later (DRF, etc.)
                if raw_body:
                    body = sanitize_data(json.loads(raw_body))
            except Exception:
                body = None

        try:
            response = self.get_response(request)
            status_code = response.status_code

            if status_code >= 500:
                level = "ERROR"
            elif status_code >= 400:
                level = "WARNING"

            response["X-Correlation-ID"] = str(correlation_id)
            return response
        except Exception as exc:
            level = "ERROR"
            status_code = 500
            error_type = type(exc).__name__
            error_message = str(exc)
            stack_trace = traceback.format_exc()
            raise
        finally:
            duration_ms = round((time.monotonic() - start) * 1000, 2)

            error_info = get_error_info()
            if error_info and not error_type:
                error_type = error_info.get("error_type")
                error_message = error_info.get("error_message")

            user_id = getattr(request.user, "id", None) if hasattr(request, "user") else None
            ip = request.META.get("REMOTE_ADDR")

            log_payload = {
                "correlation_id": str(correlation_id),
                "method": request.method,
                "path": request.path,
                "status_code": status_code,
                "duration_ms": duration_ms,
                "user_id": user_id,
                "ip": ip,
                "level": level,
                "error_type": error_type,
                "error_message": error_message,
            }
            if level == "ERROR":
                logger.error(log_payload, extra={"correlation_id": str(correlation_id)})
            elif level == "WARNING":
                logger.warning(log_payload, extra={"correlation_id": str(correlation_id)})
            else:
                logger.info(log_payload, extra={"correlation_id": str(correlation_id)})

            try:
                RequestLog.objects.using("logs_db").create(
                    correlation_id=correlation_id,
                    method=request.method,
                    path=request.path,
                    status_code=status_code,
                    duration_ms=duration_ms,
                    user_id=user_id,
                    ip_address=ip,
                    level=level,
                    request_body=body,
                    error_type=error_type,
                    error_message=error_message,
                    stack_trace=stack_trace,
                )
            except Exception:
                logger.exception("Failed to write RequestLog to logs_db")

            correlation_id_var.reset(token)