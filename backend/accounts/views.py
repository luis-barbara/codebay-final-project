# accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSignupSerializer, UserProfileSerializer
from .models import User
import stripe
from django.conf import settings
from rest_framework.permissions import AllowAny
from django.shortcuts import redirect
from rest_framework.permissions import IsAuthenticated


import logging
logger = logging.getLogger(__name__)
stripe.api_key = settings.STRIPE_SECRET_KEY

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        """Handle user signup and create a new user."""
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  # Create the user

            # Criar conta Stripe Express para o utilizador
            try:
                account = stripe.Account.create(
                    type="express",
                    email=user.email,
                    business_type="individual",
                    capabilities={
                        "transfers": {"requested": True},
                    },
                )
                # Guardar stripe_account_id no user model
                user.stripe_account_id = account.id
                user.save()
            except Exception as e:
                # Se falhar, escolher o que fazer: login, continuar, etc.
                print(f"Stripe account creation failed: {e}")

            return Response({
                "message": "User created successfully.",
                "user": serializer.data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicProfileView(APIView):
    def get(self, request, email):
        """Fetch the public profile of a user by email."""
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


class TokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        """Authenticate user and return JWT tokens."""
        email = request.data.get('email')
        password = request.data.get('password')

        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        # Authenticate the user
        user = authenticate(request, email=email, password=password)

        if user is not None:
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            return Response({
                "access": access_token,
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        
        return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class OAuthRedirectView(APIView):
    """
    View que trata o redirecionamento após login social,
    gerando os JWT tokens e enviando-os para o frontend.
    """
    def get(self, request):
        user = request.user
        if not user.is_authenticated:
            return redirect('http://localhost:5500/frontend/registrations/signin.html')  

        # Gerar tokens JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Redirecionar para o frontend com os tokens
        frontend_url = f"http://localhost:5500/frontend/registrations/oauth-success.html?access={access_token}&refresh={refresh_token}"
        return redirect(frontend_url)
    

class CurrentUserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)