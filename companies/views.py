from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied
from companies.models import Company, CompanyMember
from companies.serializers import CompanySerializer


class CompanyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        companies = Company.objects.filter(deleted_at__isnull=True)
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    @transaction.atomic
    def post(self, request):
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can create companies.')

        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save(updated_by=request.user)
        CompanyMember.objects.create(user=request.user, company=company)
        return Response(serializer.data, status=201)


class CompanyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Company.objects.get(pk=pk, deleted_at__isnull=True)
        except Company.DoesNotExist:
            raise NotFound('Company not found.')

    def is_member(self, user, company):
        return CompanyMember.objects.filter(user=user, company=company).exists()

    def get(self, request, pk):
        company = self.get_object(pk)
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def put(self, request, pk):
        company = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can update companies.')
        if not self.is_member(request.user, company):
            raise PermissionDenied('You are not a member of this company.')

        serializer = CompanySerializer(company, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def delete(self, request, pk):
        company = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can delete companies.')
        if not self.is_member(request.user, company):
            raise PermissionDenied('You are not a member of this company.')

        import datetime
        company.deleted_at = datetime.datetime.now()
        company.deleted_by = request.user
        company.save()
        return Response(status=204)
