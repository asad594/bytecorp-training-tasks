import uuid
from django.db import models


class RequestLog(models.Model):
    LEVEL_CHOICES = [
        ("INFO", "INFO"),
        ("WARNING", "WARNING"),
        ("ERROR", "ERROR"),
    ]

    id = models.BigAutoField(primary_key=True)
    correlation_id = models.UUIDField(db_index=True)
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    method = models.CharField(max_length=10)
    path = models.CharField(max_length=512)
    status_code = models.PositiveSmallIntegerField(null=True, blank=True)
    duration_ms = models.FloatField(null=True, blank=True)

    user_id = models.IntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)

    level = models.CharField(max_length=10, choices=LEVEL_CHOICES, default="INFO")

    # sanitized only — never raw body with secrets
    request_body = models.JSONField(null=True, blank=True)

    error_type = models.CharField(max_length=255, null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    stack_trace = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "request_logs"
        indexes = [
            models.Index(fields=["correlation_id"]),
            models.Index(fields=["timestamp"]),
            models.Index(fields=["status_code"]),
        ]

    def __str__(self):
        return f"[{self.correlation_id}] {self.method} {self.path} -> {self.status_code}"