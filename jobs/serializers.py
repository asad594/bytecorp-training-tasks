from rest_framework import serializers
from jobs.models import Job


class JobSerializer(serializers.ModelSerializer):
    title = serializers.CharField(
        min_length=5,
        max_length=100,
        error_messages={
            'blank': 'Job title is required.',
            'min_length': 'Job title must be at least 5 characters.',
            'max_length': 'Job title cannot exceed 100 characters.'
        }
    )
    description = serializers.CharField(
        min_length=20,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={'min_length': 'Description must be at least 20 characters.'}
    )
    location = serializers.CharField(
        min_length=2,
        max_length=100,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={'min_length': 'Location must be at least 2 characters.'}
    )
    salary_min = serializers.IntegerField(
        min_value=0,
        error_messages={
            'invalid': 'salary_min must be a valid number.',
            'min_value': 'salary_min cannot be negative.'
        }
    )
    salary_max = serializers.IntegerField(
        min_value=0,
        error_messages={
            'invalid': 'salary_max must be a valid number.',
            'min_value': 'salary_max cannot be negative.'
        }
    )
    employment_type = serializers.ChoiceField(
        choices=Job.EMPLOYMENT_TYPE_CHOICES,
        error_messages={'invalid_choice': '"{input}" is not a valid employment type.'}
    )
    status = serializers.ChoiceField(
        choices=Job.STATUS_CHOICES,
        default='draft',
        error_messages={'invalid_choice': '"{input}" is not a valid status.'}
    )

    class Meta:
        model = Job
        fields = [
            'job_id',
            'company',
            'title',
            'description',
            'location',
            'salary_min',
            'salary_max',
            'employment_type',
            'status',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['job_id', 'created_at', 'updated_at']

    def validate(self, data):
        salary_min = data.get('salary_min')
        salary_max = data.get('salary_max')
        if salary_min is not None and salary_max is not None:
            if salary_max < salary_min:
                raise serializers.ValidationError(
                    {'salary_max': 'salary_max cannot be less than salary_min.'}
                )
        return data