# accounts/urls.py

from django.urls import path
from .views import SignupView, PublicProfileView, SigninView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('signin/', SigninView.as_view(), name='signin'),
    path('profile/<str:username>/', PublicProfileView.as_view(), name='public_profile'),
]

