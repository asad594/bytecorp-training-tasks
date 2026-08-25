import re
from rest_framework import serializers


def validate_strong_password(value):
    errors = []
    if len(value) < 8:
        errors.append('Password must be at least 8 characters long.')
    if not re.search(r'[A-Z]', value):
        errors.append('Password must contain at least one uppercase letter.')
    if not re.search(r'[a-z]', value):
        errors.append('Password must contain at least one lowercase letter.')
    if not re.search(r'[0-9]', value):
        errors.append('Password must contain at least one digit.')
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\];\'`~/\\]', value):
        errors.append('Password must contain at least one special character (e.g. !@#$%^&*).')
    if errors:
        raise serializers.ValidationError(errors)
    return value