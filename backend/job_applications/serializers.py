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
    status = serializers.ChoiceField(
        choices=JobApplication.STATUS_CHOICES,
        default='pending',
        error_messages={'invalid_choice': '"{input}" is not a valid status.'}
    )

    class Meta:
        model = JobApplication
        fields = [
            'application_id',
            'user',
            'job',
            'cover_letter',
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
            'created_at',
            'updated_at',
        ]