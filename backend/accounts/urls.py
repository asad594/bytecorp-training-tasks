from django.urls import path
<<<<<<< HEAD
=======
from rest_framework_simplejwt.views import TokenRefreshView
>>>>>>> origin/feature/skills-management
from accounts.views import (
    ProfileView, LogoutView,
    JobSeekerRegisterView, CompanyRepRegisterView,
    JobSeekerLoginView, CompanyRepLoginView, AdminLoginView,
<<<<<<< HEAD
    AdminCreateView,
    GoogleLoginView,
    ForgotPasswordView, ResetPasswordView,
)
from rest_framework_simplejwt.views import TokenRefreshView
=======
    AdminCreateView, AdminStatsView, AdminUserListView,
    GoogleLoginView,
    ForgotPasswordView, ResetPasswordView,
)
from config.endpoints import AccountsEndpoints as EP
>>>>>>> origin/feature/skills-management

urlpatterns = [
    # Self-registration, one link per role. Role is fixed by the view -
    # not something the client can override in the request body.
<<<<<<< HEAD
    path('register/job_seeker/', JobSeekerRegisterView.as_view(), name='register-job-seeker'),
    path('register/company_rep/', CompanyRepRegisterView.as_view(), name='register-company-rep'),

    # Login, one link per role. Credentials that belong to a different
    # role are rejected even if the email/password are correct.
    path('login/job_seeker/', JobSeekerLoginView.as_view(), name='login-job-seeker'),
    path('login/company_rep/', CompanyRepLoginView.as_view(), name='login-company-rep'),
    path('login/admin/', AdminLoginView.as_view(), name='login-admin'),

    # OAuth login - job seekers only.
    path('auth/google/', GoogleLoginView.as_view(), name='auth-google'),

    # Forgot / reset password
    path('password/forgot/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('password/reset/', ResetPasswordView.as_view(), name='reset-password'),

    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('logout/', LogoutView.as_view(), name='logout'),

    # Admin-only: creates another admin account. This is the endpoint the
    # admin dashboard's "Add another admin" form submits to.
    path('admin/create/', AdminCreateView.as_view(), name='admin-create'),
=======
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
>>>>>>> origin/feature/skills-management
]