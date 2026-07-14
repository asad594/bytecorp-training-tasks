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