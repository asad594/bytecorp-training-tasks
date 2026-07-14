import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status as http_status

logger = logging.getLogger('django')


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = _get_error_code(response.status_code)
        raw = response.data

        message, details = _extract_message_and_details(raw)

        response.data = {
            'success': False,
            'error': {
                'code': error_code,
                'message': message,
                'details': details,
            }
        }
        return response

    logger.error(
        "Unhandled exception in %s: %s",
        context.get('view').__class__.__name__ if context.get('view') else 'UnknownView',
        str(exc),
        exc_info=True
    )

    return Response(
        {
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'Something went wrong. Please try again later.',
                'details': None,
            }
        },
        status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def _extract_message_and_details(raw):
    # Case 1: dict with a single 'detail' key (NotFound, PermissionDenied, AuthenticationFailed, etc.)
    if isinstance(raw, dict) and 'detail' in raw and len(raw) == 1:
        return str(raw['detail']), None

    # Case 2: plain list — raised via ValidationError('some string') or ['a', 'b']
    if isinstance(raw, list):
        if len(raw) == 1:
            return str(raw[0]), None
        return '; '.join(str(item) for item in raw), None

    # Case 3: dict of field-level errors, e.g. {"title": ["too short"]}
    if isinstance(raw, dict):
        return 'One or more fields failed validation.', raw

    # Fallback — anything else
    return str(raw), None


def _get_error_code(status_code):
    mapping = {
        400: 'VALIDATION_ERROR',
        401: 'UNAUTHENTICATED',
        403: 'PERMISSION_DENIED',
        404: 'NOT_FOUND',
        405: 'METHOD_NOT_ALLOWED',
        429: 'RATE_LIMITED',
    }
    return mapping.get(status_code, 'ERROR')