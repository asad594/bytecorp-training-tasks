from rest_framework import serializers
from companies.models import Company


class CompanySerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        min_length=2,
        max_length=120,
        error_messages={
            'blank': 'Company name is required.',
            'min_length': 'Company name must be at least 2 characters.',
            'max_length': 'Company name cannot exceed 120 characters.'
        }
    )
    description = serializers.CharField(
        min_length=20,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={'min_length': 'Description must be at least 20 characters.'}
    )
    website = serializers.URLField(
        max_length=120,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={
            'invalid': 'Enter a valid website URL (e.g. https://example.com).',
            'max_length': 'Website URL cannot exceed 120 characters.'
        }
    )
    location = serializers.CharField(
        min_length=2,
        max_length=100,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={'min_length': 'Location must be at least 2 characters.'}
    )

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