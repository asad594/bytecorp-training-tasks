from rest_framework import serializers
from accounts.models import User
from accounts.validators import validate_strong_password


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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['user_id', 'name', 'email', 'role', 'bio', 'years_of_experience']