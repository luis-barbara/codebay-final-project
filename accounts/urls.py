# accounts/urls.py

from django.urls import path, include  
from .views import SignupView, PublicProfileView, SigninView

urlpatterns = [
    path('signup/', SignupView.as_view(), name='signup'),
    path('signin/', SigninView.as_view(), name='signin'),
    path('profile/<str:email>/', PublicProfileView.as_view(), name='public_profile'),
    path('accounts/', include('allauth.urls')), 
]





