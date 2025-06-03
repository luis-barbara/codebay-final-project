# marketplace/views.py

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import Product, Order, Message, Notification, Rating, Media, Wishlist  
from .serializers import (
    ProductSerializer, OrderSerializer, MessageSerializer,
    NotificationSerializer, RatingSerializer, MediaSerializer, WishlistSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)

class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.all()
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(sender=self.request.user) | self.queryset.filter(receiver=self.request.user)

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

class RatingViewSet(viewsets.ModelViewSet):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class MediaViewSet(viewsets.ModelViewSet):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # Allow all users to view media (read-only)
        return self.queryset

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        if product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to add media for this product.")
        serializer.save()

    def perform_update(self, serializer):
        media = self.get_object()
        if media.product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to edit this media.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to delete this media.")
        instance.delete()

class WishlistViewSet(viewsets.ModelViewSet):  
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
