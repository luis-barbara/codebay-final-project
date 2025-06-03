# accounts/views.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.contrib.auth import authenticate, login
from .serializers import UserSignupSerializer, UserProfileSerializer
from .models import User

class SignupView(APIView):
    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()  
            return Response({
                "message": "User created successfully.",
                "user": serializer.data  
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PublicProfileView(APIView):
    def get(self, request, username):
        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
            
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)


class SigninView(APIView):
    def post(self, request):
        email = request.data.get('email')  
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
        
        # autenticar com o e-mail
        user = authenticate(request, username=email, password=password)  

        if user is not None:
            login(request, user)
            return Response({
                "message": "Login successful."
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)



