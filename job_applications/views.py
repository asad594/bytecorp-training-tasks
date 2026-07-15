from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from job_applications.models import JobApplication
from job_applications.serializers import JobApplicationSerializer
from jobs.models import Job


class JobApplicationListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        applications = JobApplication.objects.filter(
            user=request.user, deleted_at__isnull=True
        )
        serializer = JobApplicationSerializer(applications, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'job_seeker':
            return Response(
                {'error': 'Only job seekers can apply for jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        job_id = request.data.get('job')
        try:
            job = Job.objects.get(pk=job_id, deleted_at__isnull=True)
        except Job.DoesNotExist:
            return Response(
                {'error': 'Job not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if JobApplication.objects.filter(
            user=request.user, job=job, deleted_at__isnull=True
        ).exists():
            return Response(
                {'error': 'You have already applied to this job.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return JobApplication.objects.get(pk=pk, deleted_at__isnull=True)
        except JobApplication.DoesNotExist:
            return None

    def get(self, request, pk):
        application = self.get_object(pk)
        if not application:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data)

    def put(self, request, pk):
        application = self.get_object(pk)
        if not application:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can update application status.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobApplicationSerializer(application, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        application = self.get_object(pk)
        if not application:
            return Response({'error': 'Application not found.'}, status=status.HTTP_404_NOT_FOUND)

        import datetime
        application.deleted_at = datetime.datetime.now()
        application.deleted_by = request.user
        application.save()
        return Response(status=status.HTTP_204_NO_CONTENT)