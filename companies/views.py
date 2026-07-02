from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from companies.models import Company, CompanyMember
from companies.serializers import CompanySerializer


class CompanyListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        companies = Company.objects.all()
        serializer = CompanySerializer(companies, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can create companies.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = CompanySerializer(data=request.data)
        if serializer.is_valid():
            company = serializer.save(updated_by=request.user)
            CompanyMember.objects.create(user=request.user, company=company)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CompanyDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk):
        try:
            return Company.objects.get(pk=pk)
        except Company.DoesNotExist:
            return None

    def is_member(self, user, company):
        return CompanyMember.objects.filter(user=user, company=company).exists()

    def get(self, request, pk):
        company = self.get_object(pk)
        if not company:
            return Response(
                {'error': 'Company not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = CompanySerializer(company)
        return Response(serializer.data)

    def put(self, request, pk):
        company = self.get_object(pk)
        if not company:
            return Response(
                {'error': 'Company not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can update companies.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if not self.is_member(request.user, company):
            return Response(
                {'error': 'You are not a member of this company.'},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = CompanySerializer(company, data=request.data)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        company = self.get_object(pk)
        if not company:
            return Response(
                {'error': 'Company not found.'},
                status=status.HTTP_404_NOT_FOUND
            )
        if request.user.role != 'company_rep':
            return Response(
                {'error': 'Only company representatives can delete companies.'},
                status=status.HTTP_403_FORBIDDEN
            )
        if not self.is_member(request.user, company):
            return Response(
                {'error': 'You are not a member of this company.'},
                status=status.HTTP_403_FORBIDDEN
            )
        company.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)