# marketplace/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet,
    RatingViewSet, NotificationViewSet, WishlistViewSet,
    ProductFilesView, PublishProductView, CompleteOnboardingView, 
    UnpublishProductView, PublicProductListView, MediaViewSet, PublicProductDetailView, 
)

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'orders', OrderViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'wishlist', WishlistViewSet, basename='wishlist')
router.register(r'media', MediaViewSet, basename='media')

urlpatterns = [
    path('', include(router.urls)),
    path('products/<int:pk>/files/', ProductFilesView.as_view(), name='product-files'),
    path('products/<int:pk>/publish/', PublishProductView.as_view(), name='product-publish'),
    path('products/<int:pk>/unpublish/', UnpublishProductView.as_view(), name='product-unpublish'), 
    path('stripe/onboarding/complete/', CompleteOnboardingView.as_view(), name='stripe_onboarding_complete'),
    path('public/products/', PublicProductListView.as_view(), name='public-products'),
    path('public/products/<int:pk>/', PublicProductDetailView.as_view(), name='public-product-detail'),
]
