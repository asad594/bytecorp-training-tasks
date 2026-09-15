from django.test import TestCase
from django.db import IntegrityError
from unittest.mock import patch
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from companies.models import Company, CompanyMember


class CompanyAtomicTransactionTest(TestCase):
    databases = {'default', 'logs_db'}

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testcompanyrep@example.com',
            password='TestPass123!',
            name='Test Company Rep',
            role='company_rep'
        )
        self.client.force_authenticate(user=self.user)

    def test_company_create_success_creates_member(self):
        """Normal flow: Company aur CompanyMember dono banni chahiye"""
        response = self.client.post('/api/v1/companies/', {
            'name': 'Test Company',
            'registration_number': 'REG-TEST-0001',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Company.objects.count(), 1)
        self.assertEqual(CompanyMember.objects.count(), 1)

    @patch('companies.views.CompanyMember.objects.create')
    def test_company_create_rollback_on_member_failure(self, mock_create):
        """Agar CompanyMember create fail ho, Company bhi nahi bannni chahiye (rollback)"""
        mock_create.side_effect = IntegrityError('Simulated failure')

        company_count_before = Company.objects.count()
        member_count_before = CompanyMember.objects.count()

        response = self.client.post('/api/v1/companies/', {
            'name': 'Rollback Test Company',
            'registration_number': 'REG-TEST-0002',
        }, format='json')

        # Exception handler ne isay graceful error response mein convert kar diya
        self.assertEqual(response.status_code, 400)

        # Asal cheez jo verify karni thi: rollback hua ya nahi
        self.assertEqual(Company.objects.count(), company_count_before)
        self.assertEqual(CompanyMember.objects.count(), member_count_before)


class CompanyBanTests(TestCase):
    databases = {'default', 'logs_db'}

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='TestPass123!',
            name='Admin User',
            role='admin'
        )
        self.company_rep = User.objects.create_user(
            email='rep@example.com',
            password='TestPass123!',
            name='Company Rep',
            role='company_rep'
        )
        self.job_seeker = User.objects.create_user(
            email='seeker@example.com',
            password='TestPass123!',
            name='Job Seeker',
            role='job_seeker'
        )
        self.company = Company.objects.create(
            name='Acme Corp',
            registration_number='REG-ACME-001',
            is_verified=True,
            is_banned=False
        )

    def test_admin_can_ban_company(self):
        self.client.force_authenticate(user=self.admin)
        url = f'/api/v1/companies/{self.company.company_id}/ban/'
        response = self.client.patch(url, {'is_banned': True}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertTrue(self.company.is_banned)
        self.assertEqual(self.company.updated_by, self.admin)
        self.assertTrue(response.data.get('is_banned'))

    def test_admin_can_unban_company(self):
        self.company.is_banned = True
        self.company.save()

        self.client.force_authenticate(user=self.admin)
        url = f'/api/v1/companies/{self.company.company_id}/ban/'
        response = self.client.patch(url, {'is_banned': False}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertFalse(self.company.is_banned)
        self.assertEqual(self.company.updated_by, self.admin)
        self.assertFalse(response.data.get('is_banned'))

    def test_non_admin_cannot_ban_company(self):
        url = f'/api/v1/companies/{self.company.company_id}/ban/'

        # company_rep -> 403
        self.client.force_authenticate(user=self.company_rep)
        response = self.client.patch(url, {'is_banned': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # job_seeker -> 403
        self.client.force_authenticate(user=self.job_seeker)
        response = self.client.patch(url, {'is_banned': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        self.company.refresh_from_db()
        self.assertFalse(self.company.is_banned)

    def test_unauthenticated_cannot_ban_company(self):
        url = f'/api/v1/companies/{self.company.company_id}/ban/'
        response = self.client.patch(url, {'is_banned': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_ban_nonexistent_company_returns_404(self):
        self.client.force_authenticate(user=self.admin)
        url = '/api/v1/companies/999999/ban/'
        response = self.client.patch(url, {'is_banned': True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_is_banned_cannot_be_mutated_via_company_detail(self):
        """Confirm is_banned is read_only on standard company detail update"""
        CompanyMember.objects.create(user=self.company_rep, company=self.company, role='owner')
        self.client.force_authenticate(user=self.company_rep)
        url = f'/api/v1/companies/{self.company.company_id}/'
        response = self.client.put(url, {
            'name': 'Acme Corp Updated',
            'registration_number': self.company.registration_number,
            'is_banned': True
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.company.refresh_from_db()
        self.assertFalse(self.company.is_banned)