import json
import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status as http_status
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError, DatabaseError

from observability.context import set_error_info

logger = logging.getLogger('django')
obs_logger = logging.getLogger('observability')


def _log_structured_error(context, status_code, error_code, message, details=None, exc_info=False):
    """Logs a structured error entry and stashes error info in a contextvar
    so RequestLoggingMiddleware can attach it to the DB record."""
    view = context.get('view') if context else None
    view_name = view.__class__.__name__ if view else 'UnknownView'

    # Build a richer message for logs/DB while keeping the API response message untouched.
    full_message = message
    if details:
        try:
            full_message = f"{message} | details: {json.dumps(details)}"
        except (TypeError, ValueError):
            full_message = f"{message} | details: {details}"

    payload = {
        "view": view_name,
        "status_code": status_code,
        "error_code": error_code,
        "message": full_message,
    }

    if status_code >= 500:
        obs_logger.error(payload, exc_info=exc_info)
    else:
        obs_logger.warning(payload)

    set_error_info(error_code, full_message)


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_code = _get_error_code(response.status_code)
        raw = response.data
        message, details = _extract_message_and_details(raw)

        _log_structured_error(context, response.status_code, error_code, message, details=details)

        response.data = {
            'success': False,
            'error': {
                'code': error_code,
                'message': message,
                'details': details,
            }
        }
        return response

    view_name = context.get('view').__class__.__name__ if context.get('view') else 'UnknownView'

    if isinstance(exc, ObjectDoesNotExist):
        logger.warning("Unhandled ObjectDoesNotExist in %s: %s", view_name, str(exc))
        _log_structured_error(context, 404, 'NOT_FOUND', str(exc))
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'NOT_FOUND',
                    'message': 'The requested resource was not found.',
                    'details': None,
                }
            },
            status=http_status.HTTP_404_NOT_FOUND
        )

    if isinstance(exc, IntegrityError):
        logger.error("IntegrityError in %s: %s", view_name, str(exc), exc_info=True)
        _log_structured_error(context, 400, 'DATABASE_ERROR', str(exc), exc_info=True)
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'A database constraint was violated. Please check your input.',
                    'details': None,
                }
            },
            status=http_status.HTTP_400_BAD_REQUEST
        )

    if isinstance(exc, DatabaseError):
        logger.critical("DatabaseError in %s: %s", view_name, str(exc), exc_info=True)
        _log_structured_error(context, 500, 'DATABASE_ERROR', str(exc), exc_info=True)
        return Response(
            {
                'success': False,
                'error': {
                    'code': 'DATABASE_ERROR',
                    'message': 'A database error occurred. Please try again later.',
                    'details': None,
                }
            },
            status=http_status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    logger.error(
        "Unhandled exception in %s: %s",
        view_name,
        str(exc),
        exc_info=True
    )
    _log_structured_error(context, 500, 'INTERNAL_ERROR', str(exc), exc_info=True)
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
    if isinstance(raw, list):
        if len(raw) == 1:
            return str(raw[0]), None
        return '; '.join(str(item) for item in raw), None
    if isinstance(raw, dict):
        if 'detail' in raw:
            extra = {k: v for k, v in raw.items() if k != 'detail'}
            return str(raw['detail']), (extra or None)
        return 'One or more fields failed validation.', raw
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