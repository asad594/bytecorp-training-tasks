from django.db import models
from accounts.models import User


class Skill(models.Model):
    skill_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50, unique=True)

    updated_at = models.DateTimeField(auto_now=True, null=True)
    updated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='updated_skills',
        db_column='updated_by'
    )
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='deleted_skills',
        db_column='deleted_by'
    )

    class Meta:
        db_table = 'skills'

    def __str__(self):
        return self.name