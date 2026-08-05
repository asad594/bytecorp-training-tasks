from django.urls import path
from accounts.views import (
    ProfileView, LogoutView,
    JobSeekerRegisterView, CompanyRepRegisterView,
    JobSeekerLoginView, CompanyRepLoginView, AdminLoginView,
    AdminCreateView,
    GoogleLoginView,
    ForgotPasswordView, ResetPasswordView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    # Self-registration, one link per role. Role is fixed by the view -
    # not something the client can override in the request body.
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
]