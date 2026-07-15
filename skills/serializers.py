from rest_framework import serializers
from skills.models import Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['skill_id', 'name', 'updated_at']
        read_only_fields = ['skill_id', 'updated_at']