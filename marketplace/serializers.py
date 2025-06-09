# marketplace/serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Product, Order, Notification, Rating, Media, Wishlist
from storage.models import ProjectFile

User = get_user_model()

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'buyer',                  # Utilizador que comprou
            'product',                # Produto comprado
            'status',                 # Status da ordem (ex: pending, paid, delivered)
            'created_at',             # Data da criação da ordem
            'stripe_payment_intent',  # ID do PaymentIntent do Stripe 
            'payment_status',         # Status do pagamento (ex: succeeded, failed)
            'paid_at',                # Timestamp do pagamento
        ]
        read_only_fields = [
            'buyer', 'status', 'created_at', 'payment_status', 'paid_at'
        ]

class ProjectFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectFile
        fields = ['id', 'title', 'description', 'file_url', 'uploaded_at']

class MediaSerializer(serializers.ModelSerializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    image = serializers.ImageField(write_only=True, required=False, allow_null=True)
    video_url = serializers.URLField(required=False, allow_null=True)

    class Meta:
        model = Media
        fields = ['id', 'product', 'type', 'image', 'video_url']

    def validate(self, attrs):
        media_type = attrs.get('type')
        image = attrs.get('image')
        video_url = attrs.get('video_url')

        if media_type == Media.IMAGE:
            if not image:
                raise serializers.ValidationError("Image file is required for media type image.")
            if video_url:
                raise serializers.ValidationError("Video URL must be empty for media type image.")
        elif media_type == Media.VIDEO:
            if not video_url:
                raise serializers.ValidationError("Video URL is required for media type video.")
            if image:
                raise serializers.ValidationError("Image file must be empty for media type video.")
        else:
            raise serializers.ValidationError("Invalid media type.")

        return attrs

    def create(self, validated_data):
        media_type = validated_data.get('type')
        if media_type == Media.IMAGE:
            image_file = validated_data.pop('image')
            # Lê o conteúdo do arquivo e guarda como binário
            validated_data['image_data'] = image_file.read()
        # Para vídeo, a video_url já está em validated_data

        return super().create(validated_data)

    def update(self, instance, validated_data):
        media_type = validated_data.get('type', instance.type)
        if media_type == Media.IMAGE:
            image_file = validated_data.pop('image', None)
            if image_file:
                validated_data['image_data'] = image_file.read()
            validated_data['video_url'] = None  # Remove a URL se atualizar para imagem
        elif media_type == Media.VIDEO:
            validated_data['image_data'] = None  # Remove dados binários se atualizar para vídeo
        return super().update(instance, validated_data)


class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    media = MediaSerializer(many=True, read_only=True)
    rating = serializers.SerializerMethodField()
    wishlisted_by = UserSerializer(many=True, read_only=True)
    files = ProjectFileSerializer(many=True, read_only=True)  # Arquivos relacionados ao produto

    file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'title', 'description', 'category', 'language',
            'price', 'created_at', 'rating', 'media', 'wishlisted_by', 'file', 'files'
        ]

    def get_rating(self, obj):
        return obj.average_rating()

class OrderSerializer(serializers.ModelSerializer):
    buyer = UserSerializer(read_only=True)
    product = ProductSerializer(read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'buyer', 'product', 'status', 'created_at']

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
