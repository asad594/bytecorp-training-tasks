SENSITIVE_KEYS = {
    "password", "password1", "password2", "token", "access", "refresh",
    "authorization", "secret", "api_key", "apikey", "credit_card", "cvv",
}


def sanitize_data(data):
    """Recursively redact sensitive keys from dicts/lists before logging."""
    if isinstance(data, dict):
        return {
            k: ("***REDACTED***" if k.lower() in SENSITIVE_KEYS else sanitize_data(v))
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [sanitize_data(item) for item in data]
    return data