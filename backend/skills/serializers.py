from rest_framework import serializers
from skills.models import Skill


class SkillSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        min_length=2,
        max_length=50,
        error_messages={
            'blank': 'Skill name is required.',
            'min_length': 'Skill name must be at least 2 characters.',
            'max_length': 'Skill name cannot exceed 50 characters.'
        }
    )

    class Meta:
        model = Skill
        fields = ['skill_id', 'name', 'updated_at']
        read_only_fields = ['skill_id', 'updated_at']

    def validate_name(self, value):
        queryset = Skill.objects.filter(name__iexact=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError('This skill already exists.')
        return value