# marketplace/serializers.py

from rest_framework import serializers
from rest_framework.reverse import reverse
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import Product, Order, Notification, Rating, Media, Wishlist
from storage.models import ProjectFile
from storage.serializers import ProjectFileSerializer
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




class MediaSerializer(serializers.ModelSerializer):
    url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Media
        fields = ['id', 'type', 'url', 'thumbnail_url', 'is_primary', 'created_at']
        read_only_fields = fields

    def get_url(self, obj):
        request = self.context.get('request')
        if obj.url and request:
            return request.build_absolute_uri(obj.url)
        return None

    def get_thumbnail_url(self, obj):
        request = self.context.get('request')
        if obj.thumbnail and request:
            return request.build_absolute_uri(obj.thumbnail.url)
        return None
    
    def validate_type(self, value):
        if value not in [Media.IMAGE, Media.VIDEO]:
            raise serializers.ValidationError("Tipo de mídia inválido.")
        return value

    # Validar que 'product_id' está sendo passado corretamente
    def validate(self, data):
        product = self.context.get('product')
        if not product:
            raise serializers.ValidationError("Produto não encontrado.")
        
        # Garantir que uma imagem ou URL de vídeo seja fornecida conforme o tipo
        if data.get('type') == Media.IMAGE and not data.get('image'):
            raise serializers.ValidationError("Uma imagem é necessária para este tipo de mídia.")
        if data.get('type') == Media.VIDEO and not data.get('video_url'):
            raise serializers.ValidationError("Uma URL de vídeo é necessária para este tipo de mídia.")
        
        # Garantir que ao adicionar uma mídia principal, outras não sejam principais
        if data.get('is_primary'):
            if product.media.filter(is_primary=True).exists():
                raise serializers.ValidationError("Já existe uma mídia principal.")
        
        return data

    def create(self, validated_data):
        product = self.context.get('product')
        if product:
            validated_data['product'] = product  # Associar o produto
        media = Media.objects.create(**validated_data)
        return media

    def update(self, instance, validated_data):
        # A atualização pode garantir que o campo 'is_primary' seja validado corretamente
        product = self.context.get('product')
        if product:
            validated_data['product'] = product  
        instance = super().update(instance, validated_data)
        return instance

    


class ProductSerializer(serializers.ModelSerializer):
    seller = UserSerializer(read_only=True)
    media = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    files = ProjectFileSerializer(many=True, read_only=True)
    
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
        
        # Validação dos campos
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
        valid_categories = set(choice[0] for choice in Product.CATEGORY_CHOICES)
        if value not in valid_categories:
            raise serializers.ValidationError("Categoria inválida")
        return value

    def validate_language(self, value):
        valid_languages = set(choice[0] for choice in Product.LANGUAGE_CHOICES)
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
