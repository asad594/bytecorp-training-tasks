from django.urls import path
from job_applications.views import (
    JobApplicationListCreateView,
    JobApplicationDetailView,
    CompanyJobApplicationsView,
)
from config.endpoints import JobApplicationEndpoints as EP

urlpatterns = [
    path(EP.LIST_CREATE, JobApplicationListCreateView.as_view(), name='application-list-create'),
    path(EP.COMPANY_LIST, CompanyJobApplicationsView.as_view(), name='company-application-list'),
    path(EP.DETAIL, JobApplicationDetailView.as_view(), name='application-detail'),
]