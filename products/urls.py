from django.urls import path
from products import views
from django.contrib.auth.views import LoginView

urlpatterns = [
    # Home Page
    path("", views.IndexView.as_view(), name="index"),  # Homepage

    # User authentication routes
    path("signup/", views.SignupView.as_view(), name="signup"),  # Sign-up page
    path("signin/", LoginView.as_view(), name="signin"),  # Sign-in page
    path("logout/", views.logout_view, name="logout"),  # Logout route

    # Character management routes
    path("characters/", views.CharacterListView.as_view(), name="character-list"),  # List all characters
    path("characters/create/", views.CreateCharacterView.as_view(), name="character-create"),  # Create a character
    path("characters/<int:pk>/update/", views.CharacterUpdateView.as_view(), name="character-update"),  # Edit a character
    path("characters/<int:pk>/delete/", views.CharacterDeleteView.as_view(), name="character-delete"),  # Delete a character
]