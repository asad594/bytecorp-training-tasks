import logging
from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status as http_status
from django.core.exceptions import ObjectDoesNotExist
from django.db import IntegrityError, DatabaseError

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

    view_name = context.get('view').__class__.__name__ if context.get('view') else 'UnknownView'

    if isinstance(exc, ObjectDoesNotExist):
        logger.warning("Unhandled ObjectDoesNotExist in %s: %s", view_name, str(exc))
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
    if isinstance(raw, dict) and 'detail' in raw and len(raw) == 1:
        return str(raw['detail']), None

    if isinstance(raw, list):
        if len(raw) == 1:
            return str(raw[0]), None
        return '; '.join(str(item) for item in raw), None

    if isinstance(raw, dict):
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
