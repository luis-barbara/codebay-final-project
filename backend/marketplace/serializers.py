# marketplace/serializers.py

from rest_framework import serializers
from rest_framework.reverse import reverse
from django.contrib.auth import get_user_model
from .models import Product, Order, Notification, Rating, Media, Wishlist
from storage.models import ProjectFile
from accounts.serializers import UserProfileSerializer as UserSerializer
from PIL import Image
from io import BytesIO

User = get_user_model()


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            'id',
            'buyer',                  # Utilizador que comprou
            'product',                # Produto comprado
            # Status da ordem (ex: pending, paid, delivered)
            'status',
            'created_at',             # Data da criação da ordem
            'stripe_payment_intent',  # ID do PaymentIntent do Stripe
            # Status do pagamento (ex: succeeded, failed)
            'payment_status',
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
    # Remova write_only=True para permitir visualização nos responses de teste
    image = serializers.ImageField(required=False, allow_null=True)
    video_url = serializers.URLField(required=False, allow_null=True)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Media
        fields = ['id', 'product', 'type', 'image', 'image_url', 'video_url', 'created_at']
        read_only_fields = ['created_at']

    def get_image_url(self, obj):
        if obj.type == Media.IMAGE and obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None

    def validate(self, data):
        if data.get('type') == Media.IMAGE and not data.get('image'):
            raise serializers.ValidationError("Image is required for media type image.")
        if data.get('type') == Media.VIDEO and not data.get('video_url'):
            raise serializers.ValidationError("Video URL is required for media type video.")
        return data
    


class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    files = ProjectFileSerializer(many=True, read_only=True)
    
    # Removido file do serializer principal (será tratado separadamente)
    class Meta:
        model = Product
        fields = [
            'id', 'seller', 'title', 'description', 'category', 'language',
            'price', 'created_at', 'rating', 'media', 'files',
            'published', 'pending_publication'
        ]
        read_only_fields = ['seller', 'published', 'pending_publication', 'files']
        extra_kwargs = {
            'title': {'required': True, 'allow_blank': False, 'min_length': 3},
            'description': {'required': True, 'allow_blank': False, 'min_length': 10},
            'category': {'required': True},
            'language': {'required': True},
            'price': {'required': True, 'min_value': 0}
        }

    def validate(self, data):
        """
        Validação mais flexível dos dados do produto
        """
        errors = {}
        
        # Validação condicional dos campos
        if 'title' in data and len(data['title']) < 3:
            errors['title'] = "Deve ter pelo menos 3 caracteres"
            
        if 'description' in data and len(data['description']) < 10:
            errors['description'] = "Deve ter pelo menos 10 caracteres"
            
        if 'price' in data and data['price'] < 0:
            errors['price'] = "Deve ser um valor positivo"
            
        if errors:
            raise serializers.ValidationError(errors)
            
        return data

    
    def get_rating(self, obj):
        return getattr(obj, 'average_rating', lambda: 0)()

    def get_media(self, obj):
        try:
            media = obj.media.all()
            request = self.context.get('request')
            return MediaSerializer(
                media, 
                many=True, 
                context={'request': request}
            ).data if media else []
        except Exception:
            return []
    
    def validate_category(self, value):
        valid_categories = [choice[0] for choice in Product.CATEGORY_CHOICES]
        if value not in valid_categories:
            raise serializers.ValidationError("Categoria inválida")
        return value

    def validate_language(self, value):
        valid_languages = [choice[0] for choice in Product.LANGUAGE_CHOICES]
        if value not in valid_languages:
            raise serializers.ValidationError("Linguagem inválida")
        return value
        

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
    product = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all())

    class Meta:
        model = Rating
        fields = ['id', 'user', 'product', 'score', 'comment']


class WishlistSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ['id', 'user', 'products']
