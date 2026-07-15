from rest_framework import serializers
from jobs.models import Job


class JobSerializer(serializers.ModelSerializer):
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
                    "salary_max cannot be less than salary_min."
                )
        return data