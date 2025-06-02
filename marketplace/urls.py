from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProductViewSet, OrderViewSet, MessageViewSet,
    RatingViewSet, NotificationViewSet, WishListViewSet
)

router = DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'messages', MessageViewSet)
router.register(r'ratings', RatingViewSet)
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'wishlist', WishListViewSet, basename='wishlist')

urlpatterns = router.urls

