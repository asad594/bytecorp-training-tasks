from django.urls import path
from jobs.views import JobListCreateView, JobDetailView
from config.endpoints import JobEndpoints as EP

urlpatterns = [
    path(EP.LIST_CREATE, JobListCreateView.as_view(), name='job-list-create'),
    path(EP.DETAIL, JobDetailView.as_view(), name='job-detail'),
]