from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from skills.models import Skill
from skills.serializers import SkillSerializer


class SkillListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        skills = Skill.objects.filter(deleted_at__isnull=True)
        serializer = SkillSerializer(skills, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = SkillSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SkillDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Skill.objects.get(pk=pk, deleted_at__isnull=True)
        except Skill.DoesNotExist:
            return None

    def get(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Skill not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SkillSerializer(skill)
        return Response(serializer.data)

    def put(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Skill not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = SkillSerializer(skill, data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        skill = self.get_object(pk)
        if not skill:
            return Response({'error': 'Skill not found.'}, status=status.HTTP_404_NOT_FOUND)
        import datetime
        skill.deleted_at = datetime.datetime.now()
        skill.deleted_by = request.user
        skill.save()
        return Response(status=status.HTTP_204_NO_CONTENT)