# payments/urls.py

from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ProductViewSet, create_checkout_session_api
from .webhooks import stripe_webhook

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('checkout/<int:product_id>/', create_checkout_session_api, name='checkout-api'),
    path('webhook/', stripe_webhook, name='stripe-webhook'),  
]

