# marketplace/views.py

from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied, NotFound
from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from .models import Product, Order, Notification, Rating, Media, Wishlist  
from .serializers import (
    ProductSerializer, OrderSerializer,
    NotificationSerializer, RatingSerializer, MediaSerializer, WishlistSerializer
)
from storage.models import ProjectFile
import boto3

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        user = self.request.user
        max_products = 10  # Limit per seller

        if user.products.count() >= max_products:
            raise PermissionDenied(f"You have reached the limit of {max_products} products.")

        serializer.save(seller=user)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(buyer=self.request.user)

    def perform_create(self, serializer):
        serializer.save(buyer=self.request.user)


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
        return self.queryset

    def perform_create(self, serializer):
        product = serializer.validated_data.get('product')
        if product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to add media for this product.")
        serializer.save()

    def perform_update(self, serializer):
        media = self.get_object()
        if media.product.seller != self.request.user:
            raise PermissionDenied("You do not have permission to update this media.")
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


class ProductFilesView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, product_id):
        user = request.user

        # Check if user has purchased the product
        if not Order.objects.filter(product_id=product_id, buyer=user, status='paid').exists():
            raise PermissionDenied("Access denied. You have not purchased this product.")

        # Retrieve project files uploaded by the seller
        files = ProjectFile.objects.filter(user__products__id=product_id)
        if not files.exists():
            raise NotFound("No files found for this product.")

        # Generate presigned S3 URLs
        s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION_NAME,
        )

        file_urls = []
        for f in files:
            key = f.file_url.split(f"https://{settings.AWS_S3_CUSTOM_DOMAIN}/")[-1]
            presigned_url = s3_client.generate_presigned_url(
                ClientMethod='get_object',
                Params={'Bucket': settings.AWS_STORAGE_BUCKET_NAME, 'Key': key},
                ExpiresIn=3600,
            )
            file_urls.append({
                'title': f.title,
                'description': f.description,
                'url': presigned_url,
            })

        return Response(file_urls)
