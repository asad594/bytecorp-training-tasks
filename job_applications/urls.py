from django.urls import path
from job_applications.views import JobApplicationListCreateView, JobApplicationDetailView

urlpatterns = [
    path('', JobApplicationListCreateView.as_view(), name='application-list-create'),
    path('<int:pk>/', JobApplicationDetailView.as_view(), name='application-detail'),
]