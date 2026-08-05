from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import ValidationError, PermissionDenied, AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

from accounts.models import User
from accounts.serializers import (
    RegisterSerializer, CompanyRepRegisterSerializer, UserSerializer,
    GoogleAuthSerializer, ForgotPasswordSerializer, ResetPasswordSerializer,
)


class BaseRoleRegisterView(APIView):
    """
    Shared logic for the role-specific self-registration endpoints
    (accounts/register/job_seeker/, accounts/register/company_rep/).

    The role is fixed by the view, never taken from the client payload,
    so a caller cannot register themselves as an admin through these routes.
    """
    allowed_role = None
    serializer_class = RegisterSerializer

    def post(self, request):
        data = request.data.copy()
        data['role'] = self.allowed_role
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class JobSeekerRegisterView(BaseRoleRegisterView):
    allowed_role = 'job_seeker'
    serializer_class = RegisterSerializer


class CompanyRepRegisterView(BaseRoleRegisterView):
    allowed_role = 'company_rep'
    serializer_class = CompanyRepRegisterSerializer


class RoleTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Same credential check as the default JWT login, plus a check that the
    authenticated user's role matches the endpoint they logged in through.
    So a job seeker's credentials are rejected on accounts/login/admin/, etc.
    """
    allowed_role = None

    def validate(self, attrs):
        data = super().validate(attrs)
        if self.allowed_role and self.user.role != self.allowed_role:
            raise AuthenticationFailed(
                f"These credentials are not registered as a {self.allowed_role.replace('_', ' ')} account.",
                code='role_mismatch'
            )
        return data


class JobSeekerLoginSerializer(RoleTokenObtainPairSerializer):
    allowed_role = 'job_seeker'


class CompanyRepLoginSerializer(RoleTokenObtainPairSerializer):
    allowed_role = 'company_rep'


class AdminLoginSerializer(RoleTokenObtainPairSerializer):
    allowed_role = 'admin'


class JobSeekerLoginView(TokenObtainPairView):
    serializer_class = JobSeekerLoginSerializer


class CompanyRepLoginView(TokenObtainPairView):
    serializer_class = CompanyRepLoginSerializer


class AdminLoginView(TokenObtainPairView):
    serializer_class = AdminLoginSerializer


class AdminCreateView(APIView):
    """
    accounts/admin/create/ - protected endpoint behind the admin dashboard's
    "Add another admin" form. Only an authenticated admin can hit this.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied('Only an admin can create another admin account.')

        data = request.data.copy()
        data['role'] = 'admin'
        serializer = RegisterSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(
            UserSerializer(user).data,
            status=status.HTTP_201_CREATED
        )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            raise ValidationError('Refresh token is required.')

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            raise ValidationError('Invalid or expired token.')

        return Response(
            {'message': 'Logged out successfully.'},
            status=status.HTTP_205_RESET_CONTENT
        )


# ---------------------------------------------------------------------------
# OAuth (Google) - job seekers only
# ---------------------------------------------------------------------------

def _issue_tokens_for(user):
    refresh = RefreshToken.for_user(user)
    return {
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': UserSerializer(user).data,
    }


class GoogleLoginView(APIView):
    """
    accounts/auth/google/ - frontend sends the Google id_token it got from
    Google Identity Services. This is job-seeker-only: if the email already
    belongs to a company_rep or admin account, the login is rejected.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        token = serializer.validated_data['id_token']

        try:
            idinfo = google_id_token.verify_oauth2_token(
                token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            raise AuthenticationFailed('Invalid or expired Google token.')

        email = idinfo.get('email')
        if not email:
            raise AuthenticationFailed('Google account has no email associated with it.')

        user = User.objects.filter(email__iexact=email).first()

        if user is None:
            user = User(
                name=idinfo.get('name', email.split('@')[0]),
                email=email,
                role='job_seeker',
                auth_provider='google',
                provider_id=idinfo.get('sub', ''),
            )
            user.set_unusable_password()
            user.save()
        elif user.role != 'job_seeker':
            raise PermissionDenied('Google sign-in is only available for job seeker accounts.')

        return Response(_issue_tokens_for(user), status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# Forgot / Reset Password
# ---------------------------------------------------------------------------

class ForgotPasswordView(APIView):
    """
    accounts/password/forgot/ - sends a password reset link to the user's
    email if an account with that email exists. Always returns a generic
    success message (even if the email isn't registered) to avoid leaking
    which emails are registered.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']

        user = User.objects.filter(email__iexact=email).first()

        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_link = f"{settings.FRONTEND_URL}/reset-password?uid={uid}&token={token}"

            send_mail(
                subject='Reset your password',
                message=f'Click the link to reset your password: {reset_link}\n\nIf you did not request this, ignore this email.',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {'message': 'If an account with that email exists, a password reset link has been sent.'},
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    """
    accounts/password/reset/ - takes the uid + token from the reset link
    along with a new password, and updates the user's password.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response(
            {'message': 'Password has been reset successfully.'},
            status=status.HTTP_200_OK
        )