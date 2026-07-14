from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from jobs.models import Job
from jobs.serializers import JobSerializer
from companies.models import Company, CompanyMember


class JobListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        jobs = Job.objects.filter(deleted_at__isnull=True)
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can create jobs.')

        if not isinstance(request.data, dict):
            raise ValidationError('Invalid request format. Expected a JSON object.')

        company_id = request.data.get('company')
        try:
            company = Company.objects.get(pk=company_id)
        except (Company.DoesNotExist, ValueError, TypeError):
            raise NotFound('Company not found.')

        if not CompanyMember.objects.filter(user=request.user, company=company).exists():
            raise PermissionDenied('You can only post jobs for your own company.')

        serializer = JobSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data, status=201)


class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Job.objects.get(pk=pk, deleted_at__isnull=True)
        except (Job.DoesNotExist, ValueError, TypeError):
            raise NotFound('Job not found.')

    def is_member(self, user, company):
        return CompanyMember.objects.filter(user=user, company=company).exists()

    def get(self, request, pk):
        job = self.get_object(pk)
        serializer = JobSerializer(job)
        return Response(serializer.data)

    def put(self, request, pk):
        job = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update jobs.')
        if not self.is_member(request.user, job.company):
            raise PermissionDenied('You can only update jobs for your own company.')

        serializer = JobSerializer(job, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def patch(self, request, pk):
        job = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update jobs.')
        if not self.is_member(request.user, job.company):
            raise PermissionDenied('You can only update jobs for your own company.')

        serializer = JobSerializer(job, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def delete(self, request, pk):
        job = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can delete jobs.')
        if not self.is_member(request.user, job.company):
            raise PermissionDenied('You can only delete jobs for your own company.')

        import datetime
        job.deleted_at = datetime.datetime.now()
        job.deleted_by = request.user
        job.save()
        return Response(status=204)