from rest_framework import serializers
from companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            'company_id',
            'name',
            'description',
            'website',
            'location',
            'is_verified',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['company_id', 'created_at', 'updated_at', 'is_verified']