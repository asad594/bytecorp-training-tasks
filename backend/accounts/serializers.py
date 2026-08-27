from rest_framework import serializers
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_decode
from django.utils.encoding import force_str
from accounts.models import User
from accounts.validators import validate_strong_password
from skills.models import Skill
from skills.serializers import SkillSerializer


class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(
        min_length=2,
        max_length=100,
        error_messages={
            'blank': 'Name is required.',
            'min_length': 'Name must be at least 2 characters.'
        }
    )
    email = serializers.EmailField(
        error_messages={
            'invalid': 'Enter a valid email address (e.g. name@example.com).',
            'blank': 'Email is required.'
        }
    )
    password = serializers.CharField(
        write_only=True,
        validators=[validate_strong_password],
        error_messages={'blank': 'Password is required.'}
    )
    role = serializers.ChoiceField(
        choices=User.ROLE_CHOICES,
        default='job_seeker',
        error_messages={'invalid_choice': '"{input}" is not a valid role.'}
    )
    bio = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        allow_null=True,
        error_messages={'max_length': 'Bio cannot exceed 1000 characters.'}
    )
    years_of_experience = serializers.IntegerField(
        min_value=0,
        max_value=60,
        required=False,
        default=0,
        error_messages={
            'min_value': 'Years of experience cannot be negative.',
            'max_value': 'Years of experience seems invalid.'
        }
    )

    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'password', 'role', 'bio', 'years_of_experience']

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('A user with this email already exists.')
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            name=validated_data['name'],
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'job_seeker'),
            bio=validated_data.get('bio', ''),
            years_of_experience=validated_data.get('years_of_experience', 0)
        )
        return user


class CompanyRepRegisterSerializer(RegisterSerializer):
    """
    Same as RegisterSerializer, but role is fixed to 'company_rep'.

    No company information is collected here. After logging in, the
    company_rep either creates a new company (becoming its owner) or
    joins an existing one using its registration number, via the
    companies API (/companies/ and /companies/join/).
    """

    class Meta(RegisterSerializer.Meta):
        fields = RegisterSerializer.Meta.fields

    def create(self, validated_data):
        validated_data['role'] = 'company_rep'
        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.filter(deleted_at__isnull=True),
        many=True,
        write_only=True,
        required=False,
        source='skills',
    )

    class Meta:
        model = User
        fields = [
            'user_id',
            'name',
            'email',
            'role',
            'bio',
            'years_of_experience',
            'skills',
            'skill_ids',
        ]


<<<<<<< HEAD
=======
class AdminUserSerializer(serializers.ModelSerializer):
    """
    Dedicated serializer for the admin user list endpoint.
    Includes created_at and exposes all fields as read-only.
    """

    class Meta:
        model = User
        fields = [
            'user_id',
            'name',
            'email',
            'role',
            'bio',
            'years_of_experience',
            'created_at',
        ]
        read_only_fields = [
            'user_id',
            'name',
            'email',
            'role',
            'bio',
            'years_of_experience',
            'created_at',
        ]



>>>>>>> origin/feature/skills-management
# ---------------------------------------------------------------------------
# OAuth (Google) - job seekers only
# ---------------------------------------------------------------------------

class GoogleAuthSerializer(serializers.Serializer):
    id_token = serializers.CharField(
        error_messages={'blank': 'Google id_token is required.'}
    )


# ---------------------------------------------------------------------------
# Forgot / Reset Password
# ---------------------------------------------------------------------------

class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={'blank': 'Email is required.'}
    )


class ResetPasswordSerializer(serializers.Serializer):
    uid = serializers.CharField(
        error_messages={'blank': 'uid is required.'}
    )
    token = serializers.CharField(
        error_messages={'blank': 'Token is required.'}
    )
    new_password = serializers.CharField(
        write_only=True,
        validators=[validate_strong_password],
        error_messages={'blank': 'New password is required.'}
    )

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError('Invalid reset link.')

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError('Invalid or expired reset link.')

        attrs['user'] = user
        return attrs