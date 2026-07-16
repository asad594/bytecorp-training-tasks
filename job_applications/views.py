from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
import datetime
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
            raise PermissionDenied('Only job seekers can apply for jobs.')

        if not isinstance(request.data, dict):
            raise ValidationError('Invalid request format. Expected a JSON object.')

        job_id = request.data.get('job')
        try:
            job = Job.objects.get(pk=job_id, deleted_at__isnull=True)
        except (Job.DoesNotExist, ValueError, TypeError):
            raise NotFound('Job not found.')

        if JobApplication.objects.filter(
            user=request.user, job=job, deleted_at__isnull=True
        ).exists():
            raise ValidationError('You have already applied to this job.')

        serializer = JobApplicationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, updated_by=request.user, status='pending')
        return Response(serializer.data, status=201)


class JobApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return JobApplication.objects.get(pk=pk, deleted_at__isnull=True)
        except (JobApplication.DoesNotExist, ValueError, TypeError):
            raise NotFound('Application not found.')

    def get(self, request, pk):
        application = self.get_object(pk)
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data)

    def put(self, request, pk):
        application = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update application status.')

        serializer = JobApplicationSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def patch(self, request, pk):
        application = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update application status.')

        serializer = JobApplicationSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def delete(self, request, pk):
        application = self.get_object(pk)
        application.deleted_at = datetime.datetime.now()
        application.deleted_by = request.user
        application.save()
        return Response(status=204)
