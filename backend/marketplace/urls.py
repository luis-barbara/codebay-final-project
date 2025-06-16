# marketplace/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet,
    RatingViewSet, NotificationViewSet, WishlistViewSet,
    ProductFilesView,
    CreateStripeCheckoutSession,  
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')

urlpatterns = [
    path('', include(router.urls)),
    path('products/<int:product_id>/files/', ProductFilesView.as_view(), name='product-files'),
    path('create-checkout-session/', CreateStripeCheckoutSession.as_view(), name='create-checkout-session'),  # nova rota
]




