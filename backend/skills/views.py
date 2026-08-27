from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from django.utils import timezone
from skills.models import Skill
from skills.serializers import SkillSerializer


class SkillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.filter(deleted_at__isnull=True)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied('Only admin can create skills.')

        serializer = SkillSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data, status=201)


class SkillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Skill.objects.get(pk=pk, deleted_at__isnull=True)
        except Skill.DoesNotExist:
            raise NotFound('Skill not found.')

    def get(self, request, pk):
        skill = self.get_object(pk)
        serializer = SkillSerializer(skill)
        return Response(serializer.data)

    def put(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied('Only admin can update skills.')

        skill = self.get_object(pk)
        serializer = SkillSerializer(skill, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def patch(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied('Only admin can update skills.')

        skill = self.get_object(pk)
        serializer = SkillSerializer(skill, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def delete(self, request, pk):
        if request.user.role != 'admin':
            raise PermissionDenied('Only admin can delete skills.')

        skill = self.get_object(pk)
        skill.deleted_at = timezone.now()
        skill.deleted_by = request.user
        suffix = f"__deleted_{skill.deleted_at.strftime('%Y%m%d%H%M%S%f')}"
        skill.name = f"{skill.name[:50 - len(suffix)]}{suffix}"
        skill.save()
        return Response(status=204)
