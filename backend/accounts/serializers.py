# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from .models import User

User = get_user_model()  

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'confirm_password')  

    def validate(self, attrs):
        """Validation to ensure passwords match and email is unique"""
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        # Check if the email is already in use
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        
        return attrs

    def create(self, validated_data):
        """Create the user and ensure the password is hashed"""
        validated_data.pop('confirm_password')  # Remove confirm password as it's not stored
        
        # Create the user with hashed password
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    avatar = serializers.SerializerMethodField()  # Use get_avatar instead of direct field

    class Meta:
        model = User
        fields = (
            'full_name', 'email', 'username', 'avatar', 'description',
            'phone', 'position', 'country', 'website', 'github_account', 'rating',
            'stripe_account_id'  
        )

    def get_avatar(self, obj):
        """Returns the avatar as base64 data URI (webp)"""
        return obj.get_avatar_url()

    def validate_phone(self, value):
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        return value

    def validate_email(self, value):
        if self.instance and self.instance.email != value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        if self.instance and self.instance.username != value and value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.description = validated_data.get('description', instance.description)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.position = validated_data.get('position', instance.position)
        instance.country = validated_data.get('country', instance.country)
        instance.website = validated_data.get('website', instance.website)
        instance.github_account = validated_data.get('github_account', instance.github_account)
        instance.rating = validated_data.get('rating', instance.rating)
        instance.stripe_account_id = validated_data.get('stripe_account_id', instance.stripe_account_id)

        instance.save()
        return instance
