from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('accounts.urls')),
    path('api/v1/companies/', include('companies.urls')),
    path('api/v1/jobs/', include('jobs.urls')),
    path('api/v1/skills/', include('skills.urls')),
    path('api/v1/job-applications/', include('job_applications.urls')),
]