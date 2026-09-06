import json
import logging

import requests
from django.conf import settings

logger = logging.getLogger("observability")


def sync_resume_to_payload_media(application):
    api_key = settings.PAYLOAD_MEDIA_API_KEY
    if not api_key:
        print("PAYLOAD SYNC: no API key configured, skipping")
        return

    if not application.resume:
        print("PAYLOAD SYNC: no resume file on application", application.application_id)
        return

    try:
        application.resume.open('rb')
        try:
            file_bytes = application.resume.read()
        finally:
            application.resume.close()

        filename = application.resume.name.rsplit('/', 1)[-1]

        payload_fields = {
            'alt': f"Resume - application #{application.application_id}",
            'applicationId': application.application_id,
        }

        response = requests.post(
            f"{settings.PAYLOAD_API_BASE_URL}/api/media",
            headers={'Authorization': f'users API-Key {api_key}'},
            files={'file': (filename, file_bytes, 'application/pdf')},
            data={'_payload': json.dumps(payload_fields)},
            timeout=8,
        )
        print("PAYLOAD SYNC status:", response.status_code, response.text[:500])
        if response.status_code not in (200, 201):
            logger.warning(
                "Payload media sync failed for application %s: %s %s",
                application.application_id,
                response.status_code,
                response.text[:500],
            )
    except Exception:
        logger.exception(
            "Payload media sync raised an exception for application %s",
            application.application_id,
        )
        print("PAYLOAD SYNC exception - check logs")