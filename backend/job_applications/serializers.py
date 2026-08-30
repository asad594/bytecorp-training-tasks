from rest_framework import serializers
from job_applications.models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
    cover_letter = serializers.CharField(
        min_length=10,
        max_length=2000,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={
            'min_length': 'Cover letter must be at least 10 characters.',
            'max_length': 'Cover letter cannot exceed 2000 characters.'
        }
    )
    resume = serializers.FileField(
        required=True,
        allow_null=False,
        error_messages={
            'required': 'Resume is required to apply.',
            'invalid': 'Please upload a valid file.',
        }
    )
    status = serializers.ChoiceField(
        choices=JobApplication.STATUS_CHOICES,
        default='pending',
        error_messages={'invalid_choice': '"{input}" is not a valid status.'}
    )

    def validate_resume(self, value):
        if not value.name.lower().endswith('.pdf'):
            raise serializers.ValidationError('Resume must be a PDF file.')
        max_size_bytes = 5 * 1024 * 1024  # 5MB
        if value.size > max_size_bytes:
            raise serializers.ValidationError('Resume file size must not exceed 5MB.')
        return value

    class Meta:
        model = JobApplication
        fields = [
            'application_id',
            'user',
            'job',
            'cover_letter',
            'resume',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['application_id', 'user', 'created_at', 'updated_at']


class ApplicationStatusUpdateSerializer(serializers.ModelSerializer):
    """Used for company-rep / admin PUT-PATCH on an application.
    Only `status` can be changed here — job, cover_letter, and user
    must never be editable after the application was created."""
    status = serializers.ChoiceField(
        choices=JobApplication.STATUS_CHOICES,
        error_messages={'invalid_choice': '"{input}" is not a valid status.'}
    )

    class Meta:
        model = JobApplication
        fields = ['application_id', 'status']
        read_only_fields = ['application_id']


class CompanyJobApplicationSerializer(serializers.ModelSerializer):
    applicant_name = serializers.CharField(source='user.name', read_only=True)
    applicant_email = serializers.CharField(source='user.email', read_only=True)
    job_title = serializers.CharField(source='job.title', read_only=True)

    class Meta:
        model = JobApplication
        fields = [
            'application_id',
            'user',
            'applicant_name',
            'applicant_email',
            'job',
            'job_title',
            'cover_letter',
            'resume',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = [
            'application_id',
            'user',
            'applicant_name',
            'applicant_email',
            'job',
            'job_title',
            'cover_letter',
            'resume',
            'created_at',
            'updated_at',
        ]