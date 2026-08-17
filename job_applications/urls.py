from django.urls import path
from job_applications.views import (
    JobApplicationListCreateView,
    JobApplicationDetailView,
    CompanyJobApplicationsView,
)

urlpatterns = [
    path('', JobApplicationListCreateView.as_view(), name='application-list-create'),
    path('company/', CompanyJobApplicationsView.as_view(), name='company-application-list'),
    path('<int:pk>/', JobApplicationDetailView.as_view(), name='application-detail'),
]