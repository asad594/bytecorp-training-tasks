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
        }, format='json')

        # Exception handler ne isay graceful error response mein convert kar diya
        self.assertEqual(response.status_code, 400)

        # Asal cheez jo verify karni thi: rollback hua ya nahi
        self.assertEqual(Company.objects.count(), company_count_before)
        self.assertEqual(CompanyMember.objects.count(), member_count_before)