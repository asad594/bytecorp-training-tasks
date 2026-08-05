import os
from django.core.management.base import BaseCommand
from accounts.models import User


class Command(BaseCommand):
    """
    Seeds a single default admin account so the system always has at least
    one admin to log in as — no manual createsuperuser step required.

    Reads credentials from environment variables so nothing sensitive is
    hardcoded or committed:
        SEED_ADMIN_EMAIL    (default: admin@jobboard.com)
        SEED_ADMIN_PASSWORD (default: ChangeMe123!)
        SEED_ADMIN_NAME     (default: Super Admin)

    Safe to run every deploy/migrate — it's a no-op if an admin already
    exists.

    Usage:
        python manage.py seed_admin
    """
    help = 'Seeds the default admin account if no admin exists yet.'

    def handle(self, *args, **options):
        if User.objects.filter(role='admin').exists():
            self.stdout.write(self.style.WARNING(
                'An admin account already exists — skipping seed.'
            ))
            return

        email = os.environ.get('SEED_ADMIN_EMAIL', 'admin@jobboard.com')
        password = os.environ.get('SEED_ADMIN_PASSWORD', 'ChangeMe123!')
        name = os.environ.get('SEED_ADMIN_NAME', 'Super Admin')

        User.objects.create_superuser(email=email, password=password, name=name)

        self.stdout.write(self.style.SUCCESS(
            f'Seeded admin account: {email}'
        ))
        self.stdout.write(self.style.WARNING(
            'Change this password after first login if you used the default.'
        ))