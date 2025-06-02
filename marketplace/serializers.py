from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Order, Message, Notification, Rating, Media, Wishlist

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_seller']

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ['id', 'type', 'file']

class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    media = MediaSerializer(many=True, read_only=True)
    rating = serializers.FloatField(read_only=True)
    wish_list_users = UserSerializer(many=True, read_only=True, source='wishlisted_by')

    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'title', 'description', 'category', 'language',
            'price', 'created_at', 'rating', 'media', 'wish_list_users', 'file'
        ]

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'product', 'status', 'created_at']

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'sender', 'receiver', 'content', 'timestamp']

class NotificationSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'user', 'content', 'is_read', 'created_at']

class RatingSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())

    class Meta:
        model = Rating
        fields = ['id', 'user', 'product', 'score', 'comment']

class WishlistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products']


