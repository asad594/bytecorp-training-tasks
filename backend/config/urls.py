from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.views.static import serve as static_serve
from config.endpoints import APIPrefixes

urlpatterns = [
    path('admin/', admin.site.urls),
    path(APIPrefixes.ACCOUNTS, include('accounts.urls')),
    path(APIPrefixes.COMPANIES, include('companies.urls')),
    path(APIPrefixes.JOBS, include('jobs.urls')),
    path(APIPrefixes.SKILLS, include('skills.urls')),
    path(APIPrefixes.JOB_APPLICATIONS, include('job_applications.urls')),
    re_path(
        r'^media/(?P<path>.*)$',
        static_serve,
        {'document_root': settings.MEDIA_ROOT},
    ),
]