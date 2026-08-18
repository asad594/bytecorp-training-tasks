from django.db import transaction
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import NotFound, PermissionDenied, ValidationError
from companies.models import Company, CompanyMember
from companies.serializers import CompanySerializer


class MyCompanyView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role not in ['company_rep', 'admin']:
            raise PermissionDenied('Only company representatives and admins can access company details.')

        membership = CompanyMember.objects.filter(user=request.user).select_related('company').first()
        if not membership or not membership.company or membership.company.deleted_at is not None:
            return Response({'company': None, 'message': 'No company linked to this account.'}, status=200)

        serializer = CompanySerializer(membership.company)
        data = serializer.data
        data['role'] = membership.role
        return Response({'company': data}, status=200)


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

        existing_membership = CompanyMember.objects.filter(user=request.user).first()
        if existing_membership:
            raise PermissionDenied('You already belong to a company.')

        serializer = CompanySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        company = serializer.save(updated_by=request.user, is_verified=False)
        CompanyMember.objects.create(user=request.user, company=company, role='owner')
        return Response(
            {
                'company': serializer.data,
                'message': 'Company created successfully. Pending admin approval.'
            },
            status=201
        )


class CompanyJoinView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can join companies.')

        existing_membership = CompanyMember.objects.filter(user=request.user).first()
        if existing_membership:
            raise PermissionDenied('You already belong to a company.')

        registration_number = request.data.get('registration_number')
        if not registration_number:
            raise ValidationError({'registration_number': 'This field is required.'})

        try:
            company = Company.objects.get(
                registration_number=registration_number,
                deleted_at__isnull=True
            )
        except Company.DoesNotExist:
            raise NotFound('No company found with this registration number.')

        CompanyMember.objects.create(user=request.user, company=company, role='member')
        serializer = CompanySerializer(company)
        return Response(
            {
                'company': serializer.data,
                'message': 'Successfully joined the company.'
            },
            status=200
        )


class CompanyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Company.objects.get(pk=pk, deleted_at__isnull=True)
        except Company.DoesNotExist:
            raise NotFound('Company not found.')

    def is_owner(self, user, company):
        return CompanyMember.objects.filter(user=user, company=company, role='owner').exists()

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
        if not self.is_owner(request.user, company):
            raise PermissionDenied('Only the company owner can update company details.')
        serializer = CompanySerializer(company, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(updated_by=request.user)
        return Response(serializer.data)

    def delete(self, request, pk):
        company = self.get_object(pk)
        if request.user.role != 'company_rep':
            raise PermissionDenied('Only company representatives can delete companies.')
        if not self.is_owner(request.user, company):
            raise PermissionDenied('Only the company owner can delete the company.')
        import datetime
        company.deleted_at = datetime.datetime.now()
        company.deleted_by = request.user
        company.save()
        return Response(status=204)