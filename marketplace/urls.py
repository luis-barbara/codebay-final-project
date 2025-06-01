# marketplace/urls.py

from django.urls import path

urlpatterns = [
    # Exemplo para evitar erro:
    path('', lambda request: None, name='placeholder'),
]
