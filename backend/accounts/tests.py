from django.test import TestCase
<<<<<<< HEAD

# Create your tests here.
=======
from rest_framework.test import APIClient
from rest_framework import status

from accounts.models import User
from companies.models import Company, CompanyMember
from jobs.models import Job
from job_applications.models import JobApplication
from skills.models import Skill
from config.endpoints import AccountsEndpoints as EP


class AdminDashboardBackendTests(TestCase):
    databases = {'default', 'logs_db'}

    def setUp(self):
        self.client = APIClient()

        # Seed Admin user
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='AdminPassword123!',
            name='Primary Admin',
            role='admin',
            bio='System Administrator',
            years_of_experience=10
        )

        # Seed Job Seeker user
        self.job_seeker = User.objects.create_user(
            email='seeker@example.com',
            password='SeekerPassword123!',
            name='Jane Seeker',
            role='job_seeker',
            bio='Software Engineer',
            years_of_experience=4
        )

        # Seed Company Rep user
        self.company_rep = User.objects.create_user(
            email='rep@example.com',
            password='RepPassword123!',
            name='Bob Recruiter',
            role='company_rep',
            bio='Talent Acquisition Lead',
            years_of_experience=6
        )

        # Seed Company
        self.company = Company.objects.create(
            name='TechCorp Inc',
            registration_number='REG-CORP-100',
            is_verified=True
        )
        self.pending_company = Company.objects.create(
            name='Startup Innovations',
            registration_number='REG-CORP-200',
            is_verified=False
        )

        # Seed Job
        self.open_job = Job.objects.create(
            company=self.company,
            title='Senior Backend Engineer',
            salary_min=100000,
            salary_max=140000,
            employment_type='full-time',
            status='open'
        )
        self.draft_job = Job.objects.create(
            company=self.company,
            title='Frontend Intern',
            salary_min=40000,
            salary_max=50000,
            employment_type='part-time',
            status='draft'
        )

        # Seed Application
        self.application = JobApplication.objects.create(
            user=self.job_seeker,
            job=self.open_job,
            status='pending'
        )

        # Seed Skills
        self.skill1 = Skill.objects.create(name='Python')
        self.skill2 = Skill.objects.create(name='React')

    # =========================================================================
    # AdminStatsView Tests
    # =========================================================================

    def test_admin_stats_success_for_admin(self):
        self.client.force_authenticate(user=self.admin)
        url = EP.full_admin_stats_path()
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.data

        # Verify Users stats
        self.assertEqual(data['users']['total'], 3)
        self.assertEqual(data['users']['job_seekers'], 1)
        self.assertEqual(data['users']['company_reps'], 1)
        self.assertEqual(data['users']['admins'], 1)

        # Verify Companies stats
        self.assertEqual(data['companies']['total'], 2)
        self.assertEqual(data['companies']['verified'], 1)
        self.assertEqual(data['companies']['pending'], 1)

        # Verify Jobs stats
        self.assertEqual(data['jobs']['total'], 2)
        self.assertEqual(data['jobs']['open'], 1)
        self.assertEqual(data['jobs']['draft'], 1)
        self.assertEqual(data['jobs']['closed'], 0)

        # Verify Applications stats
        self.assertEqual(data['applications']['total'], 1)
        self.assertEqual(data['applications']['pending'], 1)
        self.assertEqual(data['applications']['reviewed'], 0)
        self.assertEqual(data['applications']['shortlisted'], 0)
        self.assertEqual(data['applications']['rejected'], 0)

        # Verify Skills stats
        self.assertEqual(data['skills']['total'], 2)

    def test_admin_stats_forbidden_for_non_admin(self):
        url = EP.full_admin_stats_path()

        # Job Seeker gets 403
        self.client.force_authenticate(user=self.job_seeker)
        res_seeker = self.client.get(url)
        self.assertEqual(res_seeker.status_code, status.HTTP_403_FORBIDDEN)

        # Company Rep gets 403
        self.client.force_authenticate(user=self.company_rep)
        res_rep = self.client.get(url)
        self.assertEqual(res_rep.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_stats_unauthenticated(self):
        url = EP.full_admin_stats_path()
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    # =========================================================================
    # AdminUserListView Tests
    # =========================================================================

    def test_admin_user_list_success_all_users(self):
        self.client.force_authenticate(user=self.admin)
        url = EP.full_admin_users_path()
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 3)

        first_user = response.data[0]
        self.assertIn('user_id', first_user)
        self.assertIn('name', first_user)
        self.assertIn('email', first_user)
        self.assertIn('role', first_user)
        self.assertIn('bio', first_user)
        self.assertIn('years_of_experience', first_user)
        self.assertIn('created_at', first_user)
        # Ensure password is not exposed
        self.assertNotIn('password', first_user)

    def test_admin_user_list_filter_by_role(self):
        self.client.force_authenticate(user=self.admin)

        # Filter by job_seeker
        url_seekers = EP.full_admin_users_path(role='job_seeker')
        res_seekers = self.client.get(url_seekers)
        self.assertEqual(res_seekers.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_seekers.data), 1)
        self.assertEqual(res_seekers.data[0]['email'], 'seeker@example.com')

        # Filter by company_rep
        url_reps = EP.full_admin_users_path(role='company_rep')
        res_reps = self.client.get(url_reps)
        self.assertEqual(res_reps.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_reps.data), 1)
        self.assertEqual(res_reps.data[0]['email'], 'rep@example.com')

        # Filter by admin
        url_admins = EP.full_admin_users_path(role='admin')
        res_admins = self.client.get(url_admins)
        self.assertEqual(res_admins.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_admins.data), 1)
        self.assertEqual(res_admins.data[0]['email'], 'admin@example.com')

    def test_admin_user_list_forbidden_for_non_admin(self):
        url = EP.full_admin_users_path()

        # Job Seeker gets 403
        self.client.force_authenticate(user=self.job_seeker)
        res_seeker = self.client.get(url)
        self.assertEqual(res_seeker.status_code, status.HTTP_403_FORBIDDEN)

        # Company Rep gets 403
        self.client.force_authenticate(user=self.company_rep)
        res_rep = self.client.get(url)
        self.assertEqual(res_rep.status_code, status.HTTP_403_FORBIDDEN)

    # =========================================================================
    # AdminCreateView Tests
    # =========================================================================

    def test_admin_create_another_admin_success(self):
        self.client.force_authenticate(user=self.admin)
        url = EP.full_admin_create_path()
        payload = {
            'name': 'Secondary Admin',
            'email': 'admin2@example.com',
            'password': 'StrongPassword123!',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['email'], 'admin2@example.com')
        self.assertEqual(response.data['role'], 'admin')

        created_admin = User.objects.get(email='admin2@example.com')
        self.assertEqual(created_admin.role, 'admin')
        self.assertTrue(created_admin.check_password('StrongPassword123!'))

    def test_admin_create_duplicate_email_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = EP.full_admin_create_path()
        payload = {
            'name': 'Duplicate Admin',
            'email': 'admin@example.com',
            'password': 'StrongPassword123!',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('A user with this email already exists.', str(response.data))

    def test_admin_create_weak_password_rejected(self):
        self.client.force_authenticate(user=self.admin)
        url = EP.full_admin_create_path()
        payload = {
            'name': 'Weak Admin',
            'email': 'weakadmin@example.com',
            'password': 'weak',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_admin_create_forbidden_for_non_admin(self):
        url = EP.full_admin_create_path()
        payload = {
            'name': 'Attacker Admin',
            'email': 'attacker@example.com',
            'password': 'StrongPassword123!',
        }

        # Job Seeker gets 403
        self.client.force_authenticate(user=self.job_seeker)
        res_seeker = self.client.post(url, payload, format='json')
        self.assertEqual(res_seeker.status_code, status.HTTP_403_FORBIDDEN)

        # Company Rep gets 403
        self.client.force_authenticate(user=self.company_rep)
        res_rep = self.client.post(url, payload, format='json')
        self.assertEqual(res_rep.status_code, status.HTTP_403_FORBIDDEN)
>>>>>>> origin/feature/skills-management
