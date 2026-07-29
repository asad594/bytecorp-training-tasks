from django.urls import path
from companies.views import CompanyListCreateView, CompanyDetailView, CompanyJoinView

urlpatterns = [
    path('', CompanyListCreateView.as_view(), name='company-list-create'),
    path('join/', CompanyJoinView.as_view(), name='company-join'),
    path('<int:pk>/', CompanyDetailView.as_view(), name='company-detail'),
]