# accounts/serializers.py

from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from .models import User

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'confirm_password')  

    def validate(self, attrs):
        # Validação: se as pass coincidem
        if attrs['password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        
        # Verificar se o email já está a ser usado
        if User.objects.filter(email=attrs['email']).exists():
            raise serializers.ValidationError({"email": "This email is already in use."})
        
        return attrs

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        
        # Criar o utilizador com o email e password
        user = User.objects.create_user(
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user


class UserSigninSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError("Both email and password are required.")
        
        # Autenticar usando o email
        user = authenticate(request=self.context.get('request'), username=email, password=password)
        
        if not user:
            raise serializers.ValidationError("Invalid credentials. Please check your email or password.")
        
        attrs['user'] = user
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'full_name', 'email', 'username', 'avatar', 'description',
            'phone', 'position', 'location', 'website', 'github_account', 'rating'
        )

    def validate_phone(self, value):
        # Validar o número de telefone
        if value and not value.isdigit():
            raise serializers.ValidationError("Phone number must contain only digits.")
        return value

    def validate_email(self, value):
        # Verificar se o email está disponível
        if self.instance and self.instance.email != value and User.objects.filter(email=value).exists():
            raise serializers.ValidationError("This email is already in use.")
        return value

    def validate_username(self, value):
        # Verificar se o username já está a ser utilizado no perfil 
        if self.instance and self.instance.username != value and value and User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.username = validated_data.get('username', instance.username)  # Opcional
        instance.email = validated_data.get('email', instance.email)
        instance.avatar = validated_data.get('avatar', instance.avatar)
        instance.description = validated_data.get('description', instance.description)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.position = validated_data.get('position', instance.position)
        instance.location = validated_data.get('location', instance.location)
        instance.website = validated_data.get('website', instance.website)
        instance.github_account = validated_data.get('github_account', instance.github_account)
        instance.rating = validated_data.get('rating', instance.rating)
        
        instance.save()
        return instance
