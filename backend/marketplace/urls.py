# marketplace/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet,
    RatingViewSet, NotificationViewSet, WishlistViewSet,
    ProductFilesView, PublishProductView, CompleteOnboardingView,
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
    path('products/<int:pk>/publish/', PublishProductView.as_view(), name='product-publish'),
    path('stripe/onboarding/complete/', CompleteOnboardingView.as_view(), name='stripe_onboarding_complete'),
]





