from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
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
            return Response(
                {'error': 'Only company representatives can create jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        company_id = request.data.get('company')
        try:
            company = Company.objects.get(pk=company_id)
        except Company.DoesNotExist:
            return Response(
                {'error': 'Company not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not CompanyMember.objects.filter(user=request.user, company=company).exists():
            return Response(
                {'error': 'You can only post jobs for your own company.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class JobDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Job.objects.get(pk=pk, deleted_at__isnull=True)
        except Job.DoesNotExist:
            return None

    def is_member(self, user, company):
        return CompanyMember.objects.filter(user=user, company=company).exists()

    def get(self, request, pk):
        job = self.get_object(pk)
        if not job:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobSerializer(job)
        return Response(serializer.data)

    def put(self, request, pk):
        job = self.get_object(pk)
        if not job:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can update jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not self.is_member(request.user, job.company):
            return Response(
                {'error': 'You can only update jobs for your own company.'},
                status=status.HTTP_403_FORBIDDEN
            )

        serializer = JobSerializer(job, data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        job = self.get_object(pk)
        if not job:
            return Response({'error': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)

        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can delete jobs.'},
                status=status.HTTP_403_FORBIDDEN
            )

        if not self.is_member(request.user, job.company):
            return Response(
                {'error': 'You can only delete jobs for your own company.'},
                status=status.HTTP_403_FORBIDDEN
            )

        import datetime
        job.deleted_at = datetime.datetime.now()
        job.deleted_by = request.user
        job.save()
        return Response(status=status.HTTP_204_NO_CONTENT)