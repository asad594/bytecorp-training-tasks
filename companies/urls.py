from django.urls import path
from companies.views import CompanyListCreateView, CompanyDetailView, CompanyJoinView, MyCompanyView

urlpatterns = [
    path('', CompanyListCreateView.as_view(), name='company-list-create'),
    path('me/', MyCompanyView.as_view(), name='my-company'),
    path('join/', CompanyJoinView.as_view(), name='company-join'),
    path('<int:pk>/', CompanyDetailView.as_view(), name='company-detail'),
]