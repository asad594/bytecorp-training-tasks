from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from skills.models import Skill


class SkillsApiTests(TestCase):
    databases = {'default', 'logs_db'}

    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_user(
            email='admin@example.com',
            password='AdminPassword123!',
            name='Admin User',
            role='admin'
        )
        self.job_seeker = User.objects.create_user(
            email='seeker@example.com',
            password='SeekerPassword123!',
            name='Job Seeker',
            role='job_seeker'
        )
        self.company_rep = User.objects.create_user(
            email='rep@example.com',
            password='RepPassword123!',
            name='Company Rep',
            role='company_rep'
        )

    def test_get_skills_accessible_to_all_authenticated_roles(self):
        skill = Skill.objects.create(name='Python')
        
        for user in [self.admin, self.job_seeker, self.company_rep]:
            self.client.force_authenticate(user=user)
            # List
            res_list = self.client.get('/api/v1/skills/')
            self.assertEqual(res_list.status_code, status.HTTP_200_OK)
            self.assertEqual(len(res_list.data), 1)
            # Detail
            res_detail = self.client.get(f'/api/v1/skills/{skill.skill_id}/')
            self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
            self.assertEqual(res_detail.data['name'], 'Python')

    def test_create_skill_admin_only(self):
        # Job seeker cannot create
        self.client.force_authenticate(user=self.job_seeker)
        res_seeker = self.client.post('/api/v1/skills/', {'name': 'Docker'}, format='json')
        self.assertEqual(res_seeker.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can create skills.', str(res_seeker.data))

        # Company rep cannot create
        self.client.force_authenticate(user=self.company_rep)
        res_rep = self.client.post('/api/v1/skills/', {'name': 'Docker'}, format='json')
        self.assertEqual(res_rep.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can create skills.', str(res_rep.data))

        # Admin can create
        self.client.force_authenticate(user=self.admin)
        res_admin = self.client.post('/api/v1/skills/', {'name': 'Docker'}, format='json')
        self.assertEqual(res_admin.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res_admin.data['name'], 'Docker')
        self.assertEqual(Skill.objects.filter(name='Docker', deleted_at__isnull=True).count(), 1)

    def test_update_skill_admin_only(self):
        skill = Skill.objects.create(name='Django')

        # Job seeker cannot PUT/PATCH
        self.client.force_authenticate(user=self.job_seeker)
        res_put_seeker = self.client.put(f'/api/v1/skills/{skill.skill_id}/', {'name': 'Django REST'}, format='json')
        self.assertEqual(res_put_seeker.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can update skills.', str(res_put_seeker.data))

        res_patch_seeker = self.client.patch(f'/api/v1/skills/{skill.skill_id}/', {'name': 'Django REST'}, format='json')
        self.assertEqual(res_patch_seeker.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can update skills.', str(res_patch_seeker.data))

        # Company rep cannot PUT/PATCH
        self.client.force_authenticate(user=self.company_rep)
        res_put_rep = self.client.put(f'/api/v1/skills/{skill.skill_id}/', {'name': 'Django REST'}, format='json')
        self.assertEqual(res_put_rep.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can update skills.', str(res_put_rep.data))

        res_patch_rep = self.client.patch(f'/api/v1/skills/{skill.skill_id}/', {'name': 'Django REST'}, format='json')
        self.assertEqual(res_patch_rep.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can update skills.', str(res_patch_rep.data))

        # Admin can PUT
        self.client.force_authenticate(user=self.admin)
        res_put_admin = self.client.put(f'/api/v1/skills/{skill.skill_id}/', {'name': 'Django REST Framework'}, format='json')
        self.assertEqual(res_put_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_put_admin.data['name'], 'Django REST Framework')

        # Admin can PATCH
        res_patch_admin = self.client.patch(f'/api/v1/skills/{skill.skill_id}/', {'name': 'DRF'}, format='json')
        self.assertEqual(res_patch_admin.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch_admin.data['name'], 'DRF')

    def test_delete_skill_admin_only(self):
        skill = Skill.objects.create(name='Kubernetes')

        # Job seeker cannot delete
        self.client.force_authenticate(user=self.job_seeker)
        res_del_seeker = self.client.delete(f'/api/v1/skills/{skill.skill_id}/')
        self.assertEqual(res_del_seeker.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can delete skills.', str(res_del_seeker.data))

        # Company rep cannot delete
        self.client.force_authenticate(user=self.company_rep)
        res_del_rep = self.client.delete(f'/api/v1/skills/{skill.skill_id}/')
        self.assertEqual(res_del_rep.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Only admin can delete skills.', str(res_del_rep.data))

        # Admin can delete
        self.client.force_authenticate(user=self.admin)
        res_del_admin = self.client.delete(f'/api/v1/skills/{skill.skill_id}/')
        self.assertEqual(res_del_admin.status_code, status.HTTP_204_NO_CONTENT)

    def test_soft_deleted_skill_name_reuse(self):
        self.client.force_authenticate(user=self.admin)

        # 1. Create skill "Python"
        res1 = self.client.post('/api/v1/skills/', {'name': 'Python'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        skill_id = res1.data['skill_id']

        # 2. Creating duplicate active skill fails with 400
        res_dup = self.client.post('/api/v1/skills/', {'name': 'Python'}, format='json')
        self.assertEqual(res_dup.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('This skill already exists.', str(res_dup.data))

        # Case insensitive duplicate check
        res_dup_case = self.client.post('/api/v1/skills/', {'name': 'python'}, format='json')
        self.assertEqual(res_dup_case.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('This skill already exists.', str(res_dup_case.data))

        # 3. Soft delete skill
        res_del = self.client.delete(f'/api/v1/skills/{skill_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)

        # Verify soft-deleted skill row in DB
        deleted_skill = Skill.objects.get(skill_id=skill_id)
        self.assertIsNotNone(deleted_skill.deleted_at)
        self.assertEqual(deleted_skill.deleted_by, self.admin)
        self.assertTrue(deleted_skill.name.startswith('Python__deleted_'))
        self.assertLessEqual(len(deleted_skill.name), 50)

        # 4. Create new skill with exact same name "Python" succeeds
        res2 = self.client.post('/api/v1/skills/', {'name': 'Python'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res2.data['name'], 'Python')
        self.assertNotEqual(res2.data['skill_id'], skill_id)

    def test_soft_delete_max_length_skill_name(self):
        self.client.force_authenticate(user=self.admin)

        # Skill with exact 50 characters
        max_len_name = 'S' * 50
        res = self.client.post('/api/v1/skills/', {'name': max_len_name}, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        skill_id = res.data['skill_id']

        # Delete 50-char skill — should not fail DB max_length constraint
        res_del = self.client.delete(f'/api/v1/skills/{skill_id}/')
        self.assertEqual(res_del.status_code, status.HTTP_204_NO_CONTENT)

        deleted_skill = Skill.objects.get(skill_id=skill_id)
        self.assertLessEqual(len(deleted_skill.name), 50)
        self.assertTrue('__deleted_' in deleted_skill.name)

        # Recreating the same 50-char skill name succeeds
        res2 = self.client.post('/api/v1/skills/', {'name': max_len_name}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
