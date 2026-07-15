from django.db import models
from accounts.models import User


class Company(models.Model):
    company_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=120)
    description = models.TextField(blank=True, null=True)
    website = models.CharField(max_length=120, blank=True, null=True)
    location = models.CharField(max_length=100, blank=True, null=True)
    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, null=True)
    updated_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='updated_companies',
        db_column='updated_by'
    )
    deleted_at = models.DateTimeField(null=True, blank=True)
    deleted_by = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='deleted_companies',
        db_column='deleted_by'
    )

    class Meta:
        db_table = 'companies'

    def __str__(self):
        return self.name


class CompanyMember(models.Model):
    pk = models.CompositePrimaryKey('user_id', 'company_id')
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='company_memberships',
        db_column='user_id'
    )
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='members',
        db_column='company_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'company_members'

    def __str__(self):
        return f"{self.user.email} -> {self.company.name}"