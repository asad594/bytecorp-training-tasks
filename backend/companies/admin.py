from django.contrib import admin
from companies.models import Company


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['company_id', 'name', 'registration_number', 'is_verified', 'location', 'created_at']
    list_editable = ['is_verified']
    list_filter = ['is_verified']
    search_fields = ['name', 'registration_number']
    readonly_fields = ['created_at', 'updated_at']