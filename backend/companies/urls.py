from django.urls import path
from companies.views import (
    CompanyListCreateView,
    CompanyDetailView,
    CompanyJoinView,
    MyCompanyView,
    CompanyPendingListView,
    CompanyVerifyView,
)
from config.endpoints import CompanyEndpoints as EP

urlpatterns = [
    path(EP.LIST_CREATE, CompanyListCreateView.as_view(), name='company-list-create'),
    path(EP.MY_COMPANY, MyCompanyView.as_view(), name='my-company'),
    path(EP.JOIN, CompanyJoinView.as_view(), name='company-join'),
    path(EP.PENDING, CompanyPendingListView.as_view(), name='company-pending-list'),
    path(EP.VERIFY, CompanyVerifyView.as_view(), name='company-verify'),
    path(EP.DETAIL, CompanyDetailView.as_view(), name='company-detail'),
]