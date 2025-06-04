# accounts/urls.py

from django.urls import path
from .views import SignupView, PublicProfileView, TokenObtainPairView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('profile/<str:email>/', PublicProfileView.as_view(), name='public_profile'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # New JWT token login
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # For refreshing tokens
]





