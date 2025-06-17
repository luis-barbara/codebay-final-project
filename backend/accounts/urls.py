# accounts/urls.py

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import SignupView, PublicProfileView, TokenObtainPairView
from django.views.generic import RedirectView
from .views import OAuthRedirectView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('profile/<str:email>/', PublicProfileView.as_view(), name='public_profile'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('oauth/google/', RedirectView.as_view(url='/accounts/google/login/'), name='google_login_redirect'),
    path('oauth/github/', RedirectView.as_view(url='/accounts/github/login/'), name='github_login_redirect'),
    path('oauth/callback/', OAuthRedirectView.as_view(), name='oauth_callback'),
]




