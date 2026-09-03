from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import (
    ProfileView, LogoutView,
    JobSeekerRegisterView, CompanyRepRegisterView,
    JobSeekerLoginView, CompanyRepLoginView, AdminLoginView,
    AdminCreateView, AdminStatsView, AdminUserListView,
    AdminUserDetailView, AdminUserBanView,
    GoogleLoginView,
    ForgotPasswordView, ResetPasswordView,
)
from config.endpoints import AccountsEndpoints as EP

urlpatterns = [
    # Self-registration, one link per role. Role is fixed by the view -
    # not something the client can override in the request body.
    path(EP.REGISTER_JOB_SEEKER, JobSeekerRegisterView.as_view(), name='register-job-seeker'),
    path(EP.REGISTER_COMPANY_REP, CompanyRepRegisterView.as_view(), name='register-company-rep'),

    # Login, one link per role. Credentials that belong to a different
    # role are rejected even if the email/password are correct.
    path(EP.LOGIN_JOB_SEEKER, JobSeekerLoginView.as_view(), name='login-job-seeker'),
    path(EP.LOGIN_COMPANY_REP, CompanyRepLoginView.as_view(), name='login-company-rep'),
    path(EP.LOGIN_ADMIN, AdminLoginView.as_view(), name='login-admin'),

    # OAuth login - job seekers only.
    path(EP.AUTH_GOOGLE, GoogleLoginView.as_view(), name='auth-google'),

    # Forgot / reset password
    path(EP.PASSWORD_FORGOT, ForgotPasswordView.as_view(), name='forgot-password'),
    path(EP.PASSWORD_RESET, ResetPasswordView.as_view(), name='reset-password'),

    path(EP.TOKEN_REFRESH, TokenRefreshView.as_view(), name='token_refresh'),
    path(EP.PROFILE, ProfileView.as_view(), name='profile'),
    path(EP.LOGOUT, LogoutView.as_view(), name='logout'),

    # Admin-only endpoints
    path(EP.ADMIN_CREATE, AdminCreateView.as_view(), name='admin-create'),
    path(EP.ADMIN_STATS, AdminStatsView.as_view(), name='admin-stats'),
    path(EP.ADMIN_USERS, AdminUserListView.as_view(), name='admin-users'),
    path(EP.ADMIN_USER_DETAIL, AdminUserDetailView.as_view(), name='admin-user-detail'),
    path(EP.ADMIN_USER_BAN, AdminUserBanView.as_view(), name='admin-user-ban'),
]