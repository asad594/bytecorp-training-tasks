from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
import datetime
from job_applications.models import JobApplication
from job_applications.serializers import (
    JobApplicationSerializer,
    CompanyJobApplicationSerializer,
    ApplicationStatusUpdateSerializer,
)
from jobs.models import Job
from companies.models import CompanyMember


class CompanyJobApplicationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['company_rep', 'admin']:
            raise PermissionDenied('Only company representatives can view company job applications.')

        membership = CompanyMember.objects.filter(user=request.user).first()
        if not membership or not membership.company:
            return Response([], status=200)

        company_jobs = Job.objects.filter(company=membership.company, deleted_at__isnull=True)

        job_id = request.query_params.get('job_id')
        if job_id:
            applications = JobApplication.objects.filter(
                job__in=company_jobs,
                job_id=job_id,
                deleted_at__isnull=True
            ).select_related('user', 'job')
        else:
            applications = JobApplication.objects.filter(
                job__in=company_jobs,
                deleted_at__isnull=True
            ).select_related('user', 'job')

        serializer = CompanyJobApplicationSerializer(applications, many=True)
        return Response(serializer.data, status=200)


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

    def _check_company_ownership(self, request, application):
        if request.user.role == 'admin':
            return
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update application status.')

        membership = CompanyMember.objects.filter(user=request.user).first()
        if not membership or not membership.company or application.job.company != membership.company:
            raise PermissionDenied('You do not have permission to update this application.')

    def get(self, request, pk):
        application = self.get_object(pk)
        if request.user.role == 'company_rep':
            self._check_company_ownership(request, application)
        elif request.user.role == 'job_seeker':
            if application.user != request.user:
                raise PermissionDenied('You do not have permission to view this application.')
        serializer = JobApplicationSerializer(application)
        return Response(serializer.data)

    def put(self, request, pk):
        application = self.get_object(pk)
        self._check_company_ownership(request, application)

        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(JobApplicationSerializer(application).data)

    def patch(self, request, pk):
        application = self.get_object(pk)
        self._check_company_ownership(request, application)

        serializer = ApplicationStatusUpdateSerializer(application, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(JobApplicationSerializer(application).data)

    def delete(self, request, pk):
        application = self.get_object(pk)
        if request.user.role == 'company_rep':
            self._check_company_ownership(request, application)
        elif request.user.role == 'job_seeker':
            if application.user != request.user:
                raise PermissionDenied('You do not have permission to delete this application.')
        elif request.user.role != 'admin':
            raise PermissionDenied('You do not have permission to delete this application.')

        application.deleted_at = datetime.datetime.now()
        application.deleted_by = request.user
        application.save()
        return Response(status=204)