from rest_framework import serializers
from job_applications.models import JobApplication


class JobApplicationSerializer(serializers.ModelSerializer):
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